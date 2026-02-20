# Google Places API Setup Guide -- MaxiMile Smart Pay

**Version**: 1.0
**Last Updated**: 2026-02-20
**Applies To**: Smart Pay feature (SPA-3 merchant detection)

---

## Overview

The MaxiMile Smart Pay feature uses the Google Places API (New) to detect nearby merchants based on the user's GPS coordinates. The API key is stored server-side in a Supabase Edge Function (`places-nearby`), which acts as a proxy. The client app never touches the API key directly.

**Architecture**:

```
Mobile App  -->  Supabase Edge Function (places-nearby)  -->  Google Places API (New)
  (lat/lng)           (holds API key)                          (returns nearby places)
```

The client module responsible for calling this proxy is `lib/merchant.ts`, which invokes `supabase.functions.invoke('places-nearby', { body: { lat, lng, radius } })`.

---

## 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com).
2. Click the project dropdown at the top of the page and select **New Project**.
3. Set the project name to `MaxiMile` (or use an existing project if you already have one).
4. Click **Create**.
5. After the project is created, select it from the project dropdown.

### Enable Billing

Google Places API requires an active billing account.

1. Navigate to **Billing** in the left sidebar (or visit [console.cloud.google.com/billing](https://console.cloud.google.com/billing)).
2. If you do not have a billing account, click **Create Account** and follow the prompts.
3. Link the billing account to your `MaxiMile` project.

> **Note**: Google provides a $200/month free credit for Maps Platform APIs. For a beta with a few hundred users, you are unlikely to exceed this free tier.

---

## 2. Enable the Places API (New)

1. In Google Cloud Console, navigate to **APIs & Services > Library** (or visit [console.cloud.google.com/apis/library](https://console.cloud.google.com/apis/library)).
2. Search for **"Places API (New)"**.
3. Click on **Places API (New)** in the results.
4. Click **Enable**.

> **IMPORTANT**: You must enable **Places API (New)**, NOT the legacy "Places API". The legacy API uses a different request format and pricing model. The Edge Function (`places-nearby`) is written for the New API. The two are not interchangeable.

**How to tell them apart**:
- **Places API (New)** -- This is the correct one. It uses field masks and the `places.searchNearby` endpoint.
- **Places API** (without "New") -- This is the legacy version. Do NOT enable this one.

---

## 3. Create an API Key

1. Navigate to **APIs & Services > Credentials** (or visit [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)).
2. Click **Create Credentials > API Key**.
3. A new API key is generated. Copy it immediately; you will need it in Step 5.
4. Click **Edit API Key** (or click the key name) to configure restrictions.

### Recommended Restrictions

#### Application Restriction

| Environment | Restriction Type | Value |
|-------------|-----------------|-------|
| Development / local testing | None | Leave unrestricted during development |
| Production (Supabase Edge Functions) | IP addresses | Add the IP ranges of Supabase Edge Function infrastructure (Deno Deploy). Consult Supabase documentation for current IP ranges. |

> **Tip**: For development, you can leave the application restriction as "None" and tighten it before going to production.

#### API Restriction

1. Select **Restrict key**.
2. In the dropdown, search for and select **Places API (New)** only.
3. Click **Save**.

This ensures the key can only be used for Places API calls, limiting the blast radius if the key is ever leaked.

---

## 4. Set Billing Alerts

Billing alerts prevent unexpected charges. Set them up before deploying to production.

1. Navigate to **Billing > Budgets & Alerts** (or visit [console.cloud.google.com/billing/budgets](https://console.cloud.google.com/billing/budgets)).
2. Click **Create Budget**.
3. Create the following alerts:

| Budget Name | Amount | Alert Thresholds |
|-------------|--------|-------------------|
| MaxiMile Places - Low | $10/month | 50%, 90%, 100% |
| MaxiMile Places - High | $50/month | 50%, 90%, 100% |

4. Set the notification channel to your team email or Slack webhook.

### Pricing Reference

Google Maps Platform pricing for Places API (New) as of 2026:

| API Call | Cost per Request | Cost per 1,000 Requests |
|----------|-----------------|------------------------|
| Nearby Search | $0.032 | $32.00 |

Google provides **$200/month in free Maps Platform credit**, which covers approximately **6,250 Nearby Search requests per month** at no cost.

### Cost Estimation by Daily Active Users (DAU)

The following table estimates monthly costs based on the assumption that each active user triggers **1 Smart Pay flow per day** (1 Places API call per flow). Costs shown are **after** applying the $200/month free credit.

| DAU | Calls/Month | Gross Cost | Free Credit | Net Monthly Cost |
|-----|-------------|------------|-------------|------------------|
| 50 | 1,500 | $48.00 | -$48.00 | $0.00 |
| 100 | 3,000 | $96.00 | -$96.00 | $0.00 |
| 200 | 6,000 | $192.00 | -$192.00 | $0.00 |
| 500 | 15,000 | $480.00 | -$200.00 | $280.00 |
| 1,000 | 30,000 | $960.00 | -$200.00 | $760.00 |
| 2,000 | 60,000 | $1,920.00 | -$200.00 | $1,720.00 |

> **Note**: The client-side merchant cache in `lib/merchant.ts` uses a geohash-based 5-minute TTL cache. If a user triggers Smart Pay multiple times at the same location within 5 minutes, only the first call hits the API. Actual costs may be lower than the estimates above.

---

## 5. Add the API Key to Supabase

The API key must be stored as a Supabase Edge Function secret. It must NEVER be placed in client-side code, environment variables prefixed with `EXPO_PUBLIC_`, or any file committed to version control.

### Option A: Supabase Dashboard

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your MaxiMile project.
3. Navigate to **Project Settings > Edge Functions > Secrets** (or **Settings > Edge Functions**).
4. Click **Add Secret**.
5. Set the following:
   - **Name**: `GOOGLE_PLACES_API_KEY`
   - **Value**: (paste your API key from Step 3)
6. Click **Save**.

### Option B: Supabase CLI

If you have the Supabase CLI installed and linked to your project:

```bash
supabase secrets set GOOGLE_PLACES_API_KEY=your_api_key_here
```

To verify the secret was set (values are not shown, only names):

```bash
supabase secrets list
```

You should see `GOOGLE_PLACES_API_KEY` in the output.

---

## 6. Deploy the Edge Function

The `places-nearby` Edge Function acts as a server-side proxy between the mobile app and the Google Places API. It reads `GOOGLE_PLACES_API_KEY` from the environment and forwards the request.

### Deploy

```bash
supabase functions deploy places-nearby
```

### Verify Deployment

```bash
supabase functions list
```

You should see `places-nearby` listed with status `Active`.

### Edge Function Behavior

The Edge Function accepts a POST request with the following body:

```json
{
  "lat": 1.3521,
  "lng": 103.8198,
  "radius": 50
}
```

It calls Google Places Nearby Search with the provided coordinates and radius, then returns the results to the client. The function:

- Reads `GOOGLE_PLACES_API_KEY` from `Deno.env.get('GOOGLE_PLACES_API_KEY')`
- Validates that `lat`, `lng`, and `radius` are present and numeric
- Forwards the request to `https://places.googleapis.com/v1/places:searchNearby`
- Returns the results array to the client
- Does NOT log GPS coordinates (see Security Notes below)

---

## 7. Test the Integration

### Test via cURL

Replace `your-project` with your Supabase project reference and `YOUR_ANON_KEY` with your Supabase anon key (found in Project Settings > API).

```bash
curl -X POST https://your-project.supabase.co/functions/v1/places-nearby \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"lat": 1.3521, "lng": 103.8198, "radius": 50}'
```

### Expected Response

A successful response returns a JSON object with a `results` array containing nearby places:

```json
{
  "results": [
    {
      "name": "Some Restaurant",
      "place_id": "ChIJ...",
      "vicinity": "123 Orchard Road, Singapore",
      "types": ["restaurant", "food", "point_of_interest", "establishment"],
      "geometry": {
        "location": { "lat": 1.3522, "lng": 103.8199 }
      }
    }
  ]
}
```

### Test via the App

1. Run the app in development mode on a physical device (GPS is not available in simulators).
2. Navigate to the Smart Pay screen (tap the "Smart Pay" button on the home tab).
3. Grant location permission when prompted.
4. The app should progress through: "Finding your location..." then "Identifying merchant..." then show the detected merchant.

### Common Issues

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Edge Function returns 500 | `GOOGLE_PLACES_API_KEY` secret not set | Run `supabase secrets set GOOGLE_PLACES_API_KEY=...` |
| Edge Function returns 403 | API key restrictions too tight | Check API restrictions in Google Cloud Console; ensure Places API (New) is allowed |
| Empty results array | No businesses near the test coordinates | Try coordinates known to have nearby businesses (e.g., 1.2837, 103.8607 for VivoCity area) |
| `REQUEST_DENIED` from Google | Places API (New) not enabled | Go to APIs & Services > Library and enable Places API (New) |
| `OVER_QUERY_LIMIT` from Google | Billing not enabled or quota exceeded | Check billing status and budget alerts in Google Cloud Console |
| Client shows "No merchants detected nearby" | Test coordinates are in an area with no nearby places, or radius is too small | The app uses 50m radius by default (100m if GPS accuracy > 30m). Test at a commercial location. |

---

## Security Notes

These security requirements are non-negotiable. Violating them introduces privacy and financial risk.

### API Key Protection

- The `GOOGLE_PLACES_API_KEY` must NEVER appear in client-side code.
- It must NEVER be stored in any environment variable prefixed with `EXPO_PUBLIC_` (these are embedded in the JavaScript bundle and visible to anyone who decompiles the app).
- It must NEVER be committed to version control (`.env` files should be in `.gitignore`).
- The key lives exclusively in Supabase Edge Function secrets, accessible only server-side via `Deno.env`.

### GPS Data Privacy

- The Edge Function must NOT log GPS coordinates to any logging service, console output, or database.
- GPS coordinates are used only for the duration of the API call and are not persisted.
- The client-side cache in `lib/merchant.ts` stores results keyed by a reduced-precision geohash (~100m grid), not exact coordinates.

### Location Permission

- The app must request **"When In Use"** location permission only. It must NOT request "Always" permission.
- Location is requested only when the user explicitly taps "Smart Pay". There is no background location tracking.
- The location configuration in `app.json` should specify `NSLocationWhenInUseUsageDescription` (iOS) and `ACCESS_FINE_LOCATION` (Android).

### Rate Limiting

- Consider adding rate limiting to the Edge Function to prevent abuse (e.g., max 10 requests per user per minute).
- Monitor usage via Google Cloud Console > APIs & Services > Places API (New) > Metrics.

---

## Appendix: Google Places Type Mapping

The client module `lib/merchant.ts` maps Google Places types to MaxiMile spend categories. The mapping is defined in the `TYPE_TO_CATEGORY` constant:

| Google Places Types | MaxiMile Category |
|--------------------|-------------------|
| restaurant, food, cafe, bakery, bar, meal_delivery, meal_takeaway | Dining |
| taxi_stand, transit_station, bus_station, train_station, subway_station, car_rental, gas_station, parking | Transport |
| airport, travel_agency, lodging, hotel | Travel |
| supermarket, grocery_or_supermarket, convenience_store | Groceries |
| insurance_agency, post_office, local_government_office | Bills |
| store, shopping_mall, department_store, clothing_store, electronics_store, and other retail/service types | General |

The confidence level is determined by the number of matching types:
- **High**: 2 or more type matches
- **Medium**: 1 type match
- **Low**: No type matches (defaults to General)

---

## Appendix: Checklist

Use this checklist to verify your setup is complete:

- [ ] Google Cloud project created with billing enabled
- [ ] Places API (New) enabled (NOT the legacy Places API)
- [ ] API key created with restriction to Places API (New) only
- [ ] Billing alerts set at $10/month and $50/month
- [ ] API key added to Supabase Edge Function secrets as `GOOGLE_PLACES_API_KEY`
- [ ] Edge Function `places-nearby` deployed and listed as Active
- [ ] cURL test returns nearby places for known coordinates
- [ ] Smart Pay flow works end-to-end on a physical device
- [ ] API key is NOT present in any client-side code or `EXPO_PUBLIC_` variables
- [ ] Edge Function does NOT log GPS coordinates
