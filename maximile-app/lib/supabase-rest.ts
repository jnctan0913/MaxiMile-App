/**
 * Direct Supabase REST API helper for web platform.
 *
 * The Supabase JS client hangs on web (auth.getSession() never resolves in
 * certain navigation scenarios). This helper bypasses the JS client entirely
 * by reading the auth token from localStorage and using raw fetch().
 */
import { Platform } from 'react-native';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

function getAuthToken(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const storageKey = Object.keys(window.localStorage).find(
      (k) => k.startsWith('sb-') && k.endsWith('-auth-token')
    );
    if (storageKey) {
      try {
        const stored = JSON.parse(window.localStorage.getItem(storageKey) || '{}');
        if (stored?.access_token) return stored.access_token;
      } catch { /* fallback */ }
    }
  }
  return SUPABASE_KEY;
}

function buildHeaders(prefer?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${getAuthToken()}`,
  };
  if (prefer) headers['Prefer'] = prefer;
  return headers;
}

/**
 * SELECT from a table via REST.
 * @param table  Table name
 * @param query  PostgREST query string, e.g. "select=*&user_id=eq.abc"
 * @param timeoutMs  Request timeout (default 15s)
 */
export async function restSelect<T = any>(
  table: string,
  query: string = 'select=*',
  timeoutMs: number = 15000,
): Promise<{ data: T[] | null; error: string | null }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?${query}`,
      { headers: buildHeaders(), signal: controller.signal },
    );
    clearTimeout(timer);

    if (!res.ok) {
      const body = await res.text();
      return { data: null, error: `${res.status}: ${body}` };
    }

    const data = await res.json();
    return { data: data as T[], error: null };
  } catch (e: any) {
    clearTimeout(timer);
    return { data: null, error: e?.message ?? 'Request failed' };
  }
}

/**
 * INSERT into a table via REST.
 */
export async function restInsert(
  table: string,
  payload: Record<string, any>,
  timeoutMs: number = 15000,
): Promise<{ ok: boolean; error: string | null }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}`,
      {
        method: 'POST',
        headers: buildHeaders('return=minimal'),
        body: JSON.stringify(payload),
        signal: controller.signal,
      },
    );
    clearTimeout(timer);

    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `${res.status}: ${body}` };
    }
    return { ok: true, error: null };
  } catch (e: any) {
    clearTimeout(timer);
    return { ok: false, error: e?.message ?? 'Request failed' };
  }
}

/**
 * Call an RPC function via REST.
 */
export async function restRpc<T = any>(
  fnName: string,
  params: Record<string, any> = {},
  timeoutMs: number = 15000,
): Promise<{ data: T | null; error: string | null }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/${fnName}`,
      {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(params),
        signal: controller.signal,
      },
    );
    clearTimeout(timer);

    if (!res.ok) {
      const body = await res.text();
      return { data: null, error: `${res.status}: ${body}` };
    }

    const data = await res.json();
    return { data: data as T, error: null };
  } catch (e: any) {
    clearTimeout(timer);
    return { data: null, error: e?.message ?? 'Request failed' };
  }
}

/**
 * Whether to use direct REST (web) or Supabase JS client (native).
 */
export const useDirectRest = Platform.OS === 'web';
