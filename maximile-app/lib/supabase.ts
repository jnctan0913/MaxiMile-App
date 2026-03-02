import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './supabase-types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.'
  );
}

export const SITE_URL = 'https://jnctan0913.github.io/MaxiMile-App';

const isWeb = Platform.OS === 'web';

/**
 * Why Supabase JS client works on native but hangs on web:
 *
 * Every supabase.from().select/insert/rpc() call internally does:
 *   fetchWithAuth → _getAccessToken → getSession → await initializePromise
 *
 * On web, initializePromise can hang because _initialize() makes HTTP calls
 * (token refresh, visibility change handlers) that stall on web. The
 * navigator.locks API then deadlocks all subsequent operations.
 *
 * SOLUTION: On web, use the `accessToken` option. This makes _getAccessToken()
 * read the token directly from localStorage, completely bypassing getSession()
 * and the entire auth initialization chain. Database operations (select, insert,
 * rpc) work identically to native — same RLS, same auth — but without depending
 * on the fragile web auth initialization.
 *
 * A separate auth client handles login/signup/signout (which don't go through
 * fetchWithAuth and thus don't hit the initialization deadlock).
 */

// ---------------------------------------------------------------------------
// Web: Read access token directly from localStorage (bypasses auth init)
// ---------------------------------------------------------------------------
function getWebAccessToken(): string | null {
  if (typeof window === 'undefined') return null;

  const storageKey = Object.keys(window.localStorage).find(
    (k) => k.startsWith('sb-') && k.endsWith('-auth-token')
  );
  if (!storageKey) return null;

  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) || '{}');
    return stored?.access_token ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Create client
// ---------------------------------------------------------------------------

let supabase: SupabaseClient<Database>;
let supabaseAuth: SupabaseClient<Database>;

if (isWeb) {
  // WEB: Data client with accessToken (bypasses getSession entirely)
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    accessToken: async () => getWebAccessToken() ?? supabaseAnonKey,
    auth: {
      persistSession: false, // not used — accessToken takes over
    },
  });

  // WEB: Auth client for login/signup/signout/onAuthStateChange
  supabaseAuth = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: typeof window !== 'undefined' ? window.localStorage as any : undefined,
      autoRefreshToken: false,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
} else {
  // NATIVE: Single client — everything works reliably
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage as any,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  supabaseAuth = supabase; // Same client on native
}

export { supabase, supabaseAuth };
export default supabase;
