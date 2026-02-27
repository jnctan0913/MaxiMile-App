# MaxiMile — Deployment Guide

**Date:** 27 February 2026
**Purpose:** Step-by-step instructions to deploy the auto-scraper pipeline and admin dashboard.

---

## Pre-requisites

You will need accounts on:
- **GitHub** (already have — repo host)
- **Supabase** (already have — `piwoavkasfjqmrabplbl.supabase.co`)
- **Google AI Studio** (free — for Gemini API key)
- **Groq Console** (free — for Groq API key)
- **Cloudflare** (free — for admin dashboard hosting)

---

## Step 1: Apply the Monthly Check Interval Migration

Run this SQL in your **Supabase Dashboard > SQL Editor**:

```sql
-- Update all active sources to 30-day check interval
UPDATE source_configs
SET check_interval = INTERVAL '30 days'
WHERE check_interval = INTERVAL '1 day';

-- Update the default for new sources going forward
ALTER TABLE source_configs
  ALTER COLUMN check_interval SET DEFAULT INTERVAL '30 days';
```

Or push the migration via CLI:
```bash
cd maximile-app
supabase db push
```

**Verify:** Run `SELECT check_interval FROM source_configs LIMIT 1;` — should show `30 days`.

---

## Step 2: Get API Keys

### Gemini API Key (Primary AI classifier)
1. Go to https://aistudio.google.com/apikey
2. Click "Create API key"
3. Copy the key (starts with `AIza...`)
4. Free tier: 250 requests/day (we use ~54/month)

### Groq API Key (Fallback AI classifier)
1. Go to https://console.groq.com/keys
2. Click "Create API Key"
3. Copy the key (starts with `gsk_...`)
4. Free tier: 1,000 requests/day

---

## Step 3: Configure GitHub Repository Secrets

1. Go to your GitHub repository
2. Navigate to **Settings > Secrets and variables > Actions**
3. Click **"New repository secret"** for each:

| Secret Name | Value | Source |
|---|---|---|
| `SUPABASE_URL` | `https://piwoavkasfjqmrabplbl.supabase.co` | Supabase project settings |
| `SUPABASE_SERVICE_KEY` | `eyJhbGciOi...` (full JWT) | Supabase > Project Settings > API > Service Role Key |
| `GEMINI_API_KEY` | `AIza...` | Google AI Studio (Step 2) |
| `GROQ_API_KEY` | `gsk_...` | Groq Console (Step 2) |

> **Important:** Use the **service_role** key, NOT the anon key. The scraper needs to bypass Row-Level Security to write to pipeline tables.

---

## Step 4: Verify the GitHub Actions Workflow

The workflow file is at: `/.github/workflows/scrape.yml`

**Schedule:** Runs on the **1st of each month at 6 AM SGT** (10 PM UTC on the last day of previous month).

**Manual trigger:** You can run it anytime from the GitHub Actions tab:
1. Go to your repo > **Actions** tab
2. Select "MaxiMile Rate Detection Scraper" from the left sidebar
3. Click **"Run workflow"** > **"Run workflow"** (green button)

### First Run Test
1. Trigger a manual run (step above)
2. Watch the Actions log for ~5-10 minutes
3. Check Supabase for results:
   ```sql
   -- Check pipeline ran
   SELECT * FROM pipeline_runs ORDER BY started_at DESC LIMIT 1;

   -- Check if any changes were detected
   SELECT * FROM detected_changes ORDER BY created_at DESC LIMIT 5;
   ```

---

## Step 5: Deploy the Admin Dashboard

### Option A: Cloudflare Pages (Recommended — Free)

**First-time setup:**

1. Install Wrangler CLI (if not already):
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Build the dashboard:
   ```bash
   cd maximile-app/admin-dashboard
   npm install
   npm run build
   ```

4. Deploy:
   ```bash
   npx wrangler pages deploy dist --project-name maximile-admin
   ```

5. Set environment variables in Cloudflare Dashboard:
   - Go to **Cloudflare Dashboard > Pages > maximile-admin > Settings > Environment variables**
   - Add:
     - `VITE_SUPABASE_URL` = `https://piwoavkasfjqmrabplbl.supabase.co`
     - `VITE_SUPABASE_SERVICE_KEY` = your service role key

6. Redeploy after setting env vars:
   ```bash
   npm run build && npx wrangler pages deploy dist --project-name maximile-admin
   ```

**Your dashboard URL will be:** `https://maximile-admin.pages.dev`

### Option B: Vercel (Alternative — Free)

1. Push repo to GitHub
2. Go to https://vercel.com and import the repo
3. Set root directory to `maximile-app/admin-dashboard`
4. Add environment variables in Vercel project settings
5. Deploy

---

## Step 6: Secure the Admin Dashboard (Recommended)

The admin dashboard uses a **service_role key** which has full database access. It must be protected.

### Cloudflare Access (Free for up to 50 users)

1. Go to **Cloudflare Dashboard > Zero Trust > Access > Applications**
2. Click **"Add an application"** > **"Self-hosted"**
3. Set:
   - Application name: `MaxiMile Admin`
   - Application domain: `maximile-admin.pages.dev`
4. Add a policy:
   - Policy name: `Team Access`
   - Action: `Allow`
   - Include: Email addresses of authorized admins
5. Save

Now only authorized users can access the dashboard.

---

## Post-Deployment Checklist

- [ ] Migration applied (check_interval = 30 days)
- [ ] GitHub secrets configured (4 secrets)
- [ ] Manual workflow test run successful
- [ ] `pipeline_runs` table shows successful entry
- [ ] Admin dashboard deployed and accessible
- [ ] Admin dashboard shows 3 tabs (Submissions, Detections, Pipeline Health)
- [ ] Access control configured (Cloudflare Access or equivalent)

---

## Monthly Operations Cadence

```
1st of each month (automated):
  → GitHub Actions triggers scraper at 6 AM SGT
  → 54 bank URLs checked for changes
  → AI classifies any detected changes
  → High-confidence changes auto-approved
  → Medium-confidence changes queued for review

Admin review (same week):
  → Open admin dashboard
  → Check "AI Detections" tab for queued items
  → Review, approve or reject with notes
  → Check "Pipeline Health" tab for broken sources
  → Fix any broken CSS selectors if needed

If urgent mid-month change reported:
  → Users submit via community submissions (in-app)
  → Admin reviews in "Community Submissions" tab
  → Approve to publish immediately
  → Optionally trigger manual scraper run from GitHub Actions
```

---

## Troubleshooting

| Issue | Check | Fix |
|---|---|---|
| Workflow doesn't appear in Actions tab | Is `.github/workflows/scrape.yml` at repo root? | Move file to correct location |
| Workflow fails immediately | Are all 4 secrets set? | Check Settings > Secrets |
| Scraper times out | Individual source taking too long | Check `source_configs` for broken CSS selectors |
| No changes detected | Pages haven't changed (expected) | Check `source_snapshots` for new entries |
| Admin dashboard shows empty tables | Database migration not applied | Run migration 018 + check `source_configs` has data |
| "Missing API key" error in logs | Secret name mismatch | Verify secret names match exactly: `GEMINI_API_KEY`, `GROQ_API_KEY` |
| Dashboard "Loading forever" | Wrong Supabase credentials | Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_SERVICE_KEY` in Cloudflare env vars |

---

## Architecture Reference

```
GitHub Actions (Monthly Cron)
    │
    ▼
Playwright Scraper ──► 54 Bank URLs
    │
    ▼
SHA-256 Hash Comparison
    │ (changed only)
    ▼
Gemini Flash 2.0 ──► Groq Llama 3.3 (fallback)
    │
    ▼
Confidence Routing
    ├── ≥ 0.85 ──► Auto-approve → rate_changes table → User alerts
    ├── 0.50-0.84 ─► Review queue → Admin dashboard → Approve/Reject
    └── < 0.50 ──► Auto-discard (logged for audit)
```

**Total monthly cost: $0**
