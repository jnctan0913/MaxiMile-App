# MaxiMile Database Migrations

## Overview

MaxiMile uses Supabase (PostgreSQL) with manual SQL migrations applied in numbered order.

## Migration Order

| # | File | Description | Dependencies |
|---|------|-------------|--------------|
| 001 | `001_initial_schema.sql` | Tables, indexes, constraints, initial card seed (batch 1: 10 cards) | None |
| 002 | `002_rls_and_functions.sql` | RLS policies, `recommend()` RPC, `update_spending_state()` trigger, monthly reset utilities, performance indexes | 001 |
| 003 | `003_seed_batch2.sql` | Second batch of card data (10 more cards, total 20 SG miles cards) | 001 |
| 004 | `004_feedback_analytics.sql` | `feedback` table, `analytics_events` table, `maru_monthly` view | 001, 002 |

## How to Apply

### Option A: Supabase Dashboard (Recommended for Development)

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Paste and run each migration file **in order** (001 → 002 → 003 → 004)
4. Verify each migration completes without errors before proceeding

### Option B: Supabase CLI

```bash
# Connect to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations in order
supabase db push
```

### Option C: psql Direct Connection

```bash
# Get connection string from Supabase dashboard > Settings > Database
psql "postgresql://postgres:PASSWORD@HOST:5432/postgres" \
  -f database/migrations/001_initial_schema.sql \
  -f database/migrations/002_rls_and_functions.sql \
  -f database/migrations/003_seed_batch2.sql \
  -f database/migrations/004_feedback_analytics.sql
```

## Idempotency

All migrations use `IF NOT EXISTS`, `CREATE OR REPLACE`, and `DROP IF EXISTS` patterns. They are safe to re-run, but should only need to be applied once in order.

## Important Notes

- **Never skip migrations** — each builds on the previous
- **002 must come after 001** — it references tables created in 001
- **003 can run anytime after 001** — it only inserts seed data
- **004 must come after 002** — it follows the same RLS pattern established in 002
- All migrations are wrapped in `BEGIN`/`COMMIT` transactions for atomicity
