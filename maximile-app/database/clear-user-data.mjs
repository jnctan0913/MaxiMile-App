#!/usr/bin/env node
// =============================================================================
// MaxiMile — Clear All User Data
// =============================================================================
// Removes all user-related data from Supabase while preserving card catalog.
// Also deletes auth users so you can re-register fresh.
//
// Usage: node database/clear-user-data.mjs
// =============================================================================

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env
const envPath = resolve(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
    }
  }
});

const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey || serviceRoleKey === 'YOUR_SERVICE_ROLE_KEY_HERE') {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('=== Clearing All User Data ===\n');

  // 1. Clear user data tables (order matters due to foreign keys)
  const tables = [
    'analytics_events',
    'feedback',
    'spending_state',
    'transactions',
    'user_cards',
  ];

  for (const table of tables) {
    // Use user_id filter for user-scoped tables without an id column
    const useUserId = ['user_cards', 'spending_state'].includes(table);
    const query = useUserId
      ? supabase.from(table).delete().neq('user_id', '00000000-0000-0000-0000-000000000000')
      : supabase.from(table).delete().gte('id', '00000000-0000-0000-0000-000000000000');
    const { error } = await query;
    if (error) {
      console.error(`  Failed to clear ${table}: ${error.message}`);
    } else {
      console.log(`  Cleared ${table}`);
    }
  }

  // 2. Delete all auth users
  console.log('\nDeleting auth users...');
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error(`  Failed to list users: ${listError.message}`);
  } else if (users && users.length > 0) {
    for (const user of users) {
      const { error: delError } = await supabase.auth.admin.deleteUser(user.id);
      if (delError) {
        console.error(`  Failed to delete user ${user.email}: ${delError.message}`);
      } else {
        console.log(`  Deleted user: ${user.email}`);
      }
    }
  } else {
    console.log('  No auth users found');
  }

  console.log('\nDone! All user data cleared. You can now re-register and start fresh.');
}

main().catch(err => {
  console.error(`\nFailed: ${err.message}`);
  process.exit(1);
});
