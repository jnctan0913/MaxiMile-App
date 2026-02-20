# API Contracts: MaxiMile MVP

**Version**: 1.0
**Created**: 2026-02-19
**Author**: Software Engineer
**Status**: Draft
**Dependencies**: Database schema (T1.01, T1.02), Supabase instance (T1.07)

---

## Overview

MaxiMile uses **Supabase** as its backend, which provides:

1. **Auto-generated REST endpoints** for all tables via PostgREST (no custom code needed)
2. **Supabase Auth** for user authentication (email + Google sign-in)
3. **Row Level Security (RLS)** for per-user data isolation
4. **Custom RPC functions** for complex logic (recommendation engine)

**Base URL**: `https://<project-ref>.supabase.co/rest/v1`

**Common Headers** (all requests):

| Header | Value | Required |
|--------|-------|----------|
| `apikey` | `<supabase-anon-key>` | Always |
| `Authorization` | `Bearer <user-jwt>` | For authenticated endpoints |
| `Content-Type` | `application/json` | For POST/PATCH/DELETE |
| `Prefer` | `return=representation` | Optional; returns the created/updated row |

**Authentication Flow**:
- Users sign up / sign in via Supabase Auth (`supabase.auth.signUp`, `supabase.auth.signInWithPassword`, `supabase.auth.signInWithOAuth`)
- Supabase Auth returns a JWT containing the user's `id` (UUID)
- The JWT is sent as `Authorization: Bearer <jwt>` on all subsequent requests
- RLS policies use `auth.uid()` to extract the user ID from the JWT and restrict access

---

## 1. Card Rules (Public Read — No Auth Required)

These tables are public reference data. RLS allows SELECT for all users (including anonymous). No INSERT/UPDATE/DELETE for non-admin users.

---

### 1.1 GET /cards — List All Supported Cards

Returns all supported Singapore miles credit cards.

**Request**:
```
GET /rest/v1/cards?select=id,bank,name,type,annual_fee,base_rate_mpd,image_url&order=bank,name
```

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `select` | string | query | No | Columns to return (default: all) |
| `order` | string | query | No | Sort order (e.g., `bank.asc,name.asc`) |
| `limit` | integer | query | No | Max rows to return |
| `offset` | integer | query | No | Pagination offset |

**Response** `200 OK`:
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "bank": "DBS",
    "name": "DBS Altitude Visa",
    "type": "visa",
    "annual_fee": 192.60,
    "base_rate_mpd": 1.2,
    "image_url": "https://example.com/cards/dbs-altitude.png"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "bank": "Citi",
    "name": "Citi PremierMiles Visa",
    "type": "visa",
    "annual_fee": 192.60,
    "base_rate_mpd": 1.2,
    "image_url": "https://example.com/cards/citi-premiermiles.png"
  }
]
```

**Response Shape**:
| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | UUID | No | Primary key |
| `bank` | string | No | Issuing bank name |
| `name` | string | No | Card product name |
| `type` | string | Yes | Card network: `visa`, `mc`, `amex` |
| `annual_fee` | decimal | Yes | Annual fee in SGD |
| `base_rate_mpd` | decimal | No | Base earn rate in miles per dollar (non-bonus) |
| `image_url` | string | Yes | URL to card image asset |

**Auth**: None required (public read).

**Error Cases**:
| Status | Condition | Body |
|--------|-----------|------|
| `400` | Invalid query parameter syntax | `{"message": "...", "code": "PGRST..."}` |

---

### 1.2 GET /cards?id=eq.{id} — Get Card Detail

Returns a single card with its earn rules, caps, and exclusions via embedded resources.

**Request**:
```
GET /rest/v1/cards?id=eq.550e8400-e29b-41d4-a716-446655440000&select=*,earn_rules(*),caps(*),exclusions(*)
```

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | UUID | query filter | Yes | Card ID (PostgREST filter: `id=eq.<uuid>`) |
| `select` | string | query | No | Use `*,earn_rules(*),caps(*),exclusions(*)` to embed related data |

**Response** `200 OK`:
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "bank": "DBS",
    "name": "DBS Altitude Visa",
    "type": "visa",
    "annual_fee": 192.60,
    "base_rate_mpd": 1.2,
    "image_url": "https://example.com/cards/dbs-altitude.png",
    "created_at": "2026-02-19T00:00:00+08:00",
    "updated_at": "2026-02-19T00:00:00+08:00",
    "earn_rules": [
      {
        "id": "a1b2c3d4-...",
        "card_id": "550e8400-...",
        "category_id": "dining",
        "earn_rate_mpd": 3.0,
        "is_bonus": true,
        "conditions": null,
        "effective_from": "2026-01-01",
        "effective_to": null
      },
      {
        "id": "e5f6g7h8-...",
        "card_id": "550e8400-...",
        "category_id": "online",
        "earn_rate_mpd": 6.0,
        "is_bonus": true,
        "conditions": {"min_spend": 800},
        "effective_from": "2026-01-01",
        "effective_to": null
      }
    ],
    "caps": [
      {
        "id": "i9j0k1l2-...",
        "card_id": "550e8400-...",
        "category_id": "online",
        "monthly_cap_amount": 2000.00
      }
    ],
    "exclusions": [
      {
        "id": "m3n4o5p6-...",
        "card_id": "550e8400-...",
        "category_id": "dining",
        "excluded_mccs": ["5814"],
        "conditions": null
      }
    ]
  }
]
```

**Auth**: None required (public read).

**Error Cases**:
| Status | Condition | Body |
|--------|-----------|------|
| `400` | Invalid UUID format | `{"message": "invalid input syntax for type uuid", "code": "22P02"}` |
| `200` | Card not found | `[]` (empty array — PostgREST returns 200 with empty result) |

**Note**: PostgREST always returns an array. When filtering by unique ID, the client should check for `array.length === 0` to handle "not found" cases.

---

### 1.3 GET /earn_rules — Get Earn Rules for a Card

Returns all active earn rules for a specific card.

**Request**:
```
GET /rest/v1/earn_rules?card_id=eq.550e8400-...&effective_to=is.null&select=id,card_id,category_id,earn_rate_mpd,is_bonus,conditions,effective_from
```

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `card_id` | UUID | query filter | Yes | Filter by card ID |
| `effective_to` | null filter | query filter | No | `effective_to=is.null` for currently active rules only |

**Response** `200 OK`:
```json
[
  {
    "id": "a1b2c3d4-...",
    "card_id": "550e8400-...",
    "category_id": "dining",
    "earn_rate_mpd": 3.0,
    "is_bonus": true,
    "conditions": null,
    "effective_from": "2026-01-01"
  },
  {
    "id": "b2c3d4e5-...",
    "card_id": "550e8400-...",
    "category_id": "online",
    "earn_rate_mpd": 6.0,
    "is_bonus": true,
    "conditions": {"min_spend": 800},
    "effective_from": "2026-01-01"
  }
]
```

**Response Shape**:
| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | UUID | No | Primary key |
| `card_id` | UUID | No | FK to cards |
| `category_id` | string | No | FK to categories (e.g., `"dining"`) |
| `earn_rate_mpd` | decimal | No | Miles per dollar for this card+category |
| `is_bonus` | boolean | No | `true` = bonus rate, `false` = base rate entry |
| `conditions` | JSONB | Yes | Conditions for this rate (e.g., `{"min_spend": 800}`) |
| `effective_from` | date | No | Start date of this rule |
| `effective_to` | date | Yes | End date (`null` = currently active) |

**Auth**: None required (public read).

**Error Cases**:
| Status | Condition | Body |
|--------|-----------|------|
| `400` | Invalid UUID in filter | `{"message": "...", "code": "22P02"}` |

---

### 1.4 GET /caps — Get Caps for a Card

Returns all monthly bonus caps for a specific card.

**Request**:
```
GET /rest/v1/caps?card_id=eq.550e8400-...&select=id,card_id,category_id,monthly_cap_amount
```

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `card_id` | UUID | query filter | Yes | Filter by card ID |

**Response** `200 OK`:
```json
[
  {
    "id": "i9j0k1l2-...",
    "card_id": "550e8400-...",
    "category_id": "online",
    "monthly_cap_amount": 2000.00
  }
]
```

**Response Shape**:
| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | UUID | No | Primary key |
| `card_id` | UUID | No | FK to cards |
| `category_id` | string | No | FK to categories |
| `monthly_cap_amount` | decimal | No | Maximum spend (SGD) before bonus rate drops to base rate |

**Auth**: None required (public read).

**Error Cases**:
| Status | Condition | Body |
|--------|-----------|------|
| `400` | Invalid UUID in filter | `{"message": "...", "code": "22P02"}` |

**Note**: Not all card+category combinations have caps. If a card has no cap for a category, no row exists (uncapped bonus).

---

### 1.5 GET /categories — List All Categories

Returns all spend categories in display order.

**Request**:
```
GET /rest/v1/categories?select=id,name,display_order,mccs&order=display_order
```

**Response** `200 OK`:
```json
[
  { "id": "dining",   "name": "Dining",          "display_order": 1, "mccs": ["5811","5812","5813","5814"] },
  { "id": "transport", "name": "Transport",       "display_order": 2, "mccs": ["4121","4131","7512"] },
  { "id": "online",   "name": "Online Shopping",  "display_order": 3, "mccs": [] },
  { "id": "groceries","name": "Groceries",        "display_order": 4, "mccs": ["5411","5422","5441"] },
  { "id": "petrol",   "name": "Petrol",           "display_order": 5, "mccs": ["5541","5542"] },
  { "id": "travel",   "name": "Travel / Hotels",  "display_order": 6, "mccs": ["4411","7011"] },
  { "id": "general",  "name": "General / Others", "display_order": 7, "mccs": [] }
]
```

**Response Shape**:
| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | string | No | Primary key (slug: `"dining"`, `"transport"`, etc.) |
| `name` | string | No | Display name |
| `display_order` | integer | Yes | UI ordering |
| `mccs` | string[] | Yes | MCC codes mapped to this category |

**Auth**: None required (public read).

**Error Cases**:
| Status | Condition | Body |
|--------|-----------|------|
| `400` | Invalid query syntax | `{"message": "...", "code": "PGRST..."}` |

---

## 2. User Portfolio (Authenticated — RLS Enforced)

All endpoints in this group require a valid JWT. RLS policies filter data to the authenticated user only (`user_id = auth.uid()`).

---

### 2.1 GET /user_cards — Get Current User's Cards

Returns the authenticated user's card portfolio. RLS automatically filters to `user_id = auth.uid()`.

**Request**:
```
GET /rest/v1/user_cards?select=card_id,added_at,cards(id,bank,name,type,base_rate_mpd,image_url)&order=added_at.desc
```

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `select` | string | query | No | Use embedded `cards(...)` to include card details |
| `order` | string | query | No | Sort order |

**Response** `200 OK`:
```json
[
  {
    "card_id": "550e8400-...",
    "added_at": "2026-02-19T10:30:00+08:00",
    "cards": {
      "id": "550e8400-...",
      "bank": "OCBC",
      "name": "OCBC 90°N Visa",
      "type": "visa",
      "base_rate_mpd": 0.4,
      "image_url": "https://example.com/cards/ocbc-90n.png"
    }
  },
  {
    "card_id": "550e8400-...",
    "added_at": "2026-02-19T10:31:00+08:00",
    "cards": {
      "id": "550e8400-...",
      "bank": "DBS",
      "name": "DBS Altitude Visa",
      "type": "visa",
      "base_rate_mpd": 1.2,
      "image_url": "https://example.com/cards/dbs-altitude.png"
    }
  }
]
```

**Response Shape**:
| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `card_id` | UUID | No | FK to cards |
| `added_at` | timestamptz | No | When the card was added to portfolio |
| `cards` | object | No | Embedded card details (from `cards` table) |

**Auth**: Required. JWT must be valid. RLS filters to `auth.uid()`.

**Error Cases**:
| Status | Condition | Body |
|--------|-----------|------|
| `401` | Missing or invalid JWT | `{"message": "JWT expired", "code": "PGRST301"}` |
| `200` | User has no cards | `[]` (empty array) |

---

### 2.2 POST /user_cards — Add Card to Portfolio

Adds a credit card to the authenticated user's portfolio.

**Request**:
```
POST /rest/v1/user_cards
Content-Type: application/json
Prefer: return=representation

{
  "card_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `card_id` | UUID | body | Yes | The card to add to the user's portfolio |

**Note**: `user_id` is NOT sent in the request body. The RLS policy and/or a database trigger sets `user_id = auth.uid()` automatically. The client should either:
- Send `user_id` in the body (which RLS will validate matches `auth.uid()`), or
- Use a database trigger/default to auto-populate `user_id` from `auth.uid()`

**Recommended approach**: Set a column default `user_id UUID DEFAULT auth.uid()` so the client only needs to send `card_id`.

**Response** `201 Created`:
```json
[
  {
    "user_id": "d0e1f2a3-...",
    "card_id": "550e8400-...",
    "added_at": "2026-02-19T10:30:00+08:00"
  }
]
```

**Auth**: Required.

**Error Cases**:
| Status | Condition | Body |
|--------|-----------|------|
| `401` | Missing or invalid JWT | `{"message": "...", "code": "PGRST301"}` |
| `409` | Card already in user's portfolio (PK violation) | `{"message": "duplicate key value violates unique constraint \"user_cards_pkey\"", "code": "23505"}` |
| `400` | `card_id` does not exist in `cards` table (FK violation) | `{"message": "... violates foreign key constraint ...", "code": "23503"}` |
| `400` | Missing `card_id` in body | `{"message": "null value in column \"card_id\" violates not-null constraint", "code": "23502"}` |

---

### 2.3 DELETE /user_cards — Remove Card from Portfolio

Removes a credit card from the authenticated user's portfolio.

**Request**:
```
DELETE /rest/v1/user_cards?card_id=eq.550e8400-e29b-41d4-a716-446655440000
```

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `card_id` | UUID | query filter | Yes | The card to remove |

**Note**: RLS ensures the user can only delete their own rows. No need to pass `user_id` — it is inferred from `auth.uid()`.

**Response** `200 OK` (with `Prefer: return=representation`):
```json
[
  {
    "user_id": "d0e1f2a3-...",
    "card_id": "550e8400-...",
    "added_at": "2026-02-19T10:30:00+08:00"
  }
]
```

**Response** `204 No Content` (without `Prefer` header — default):
Empty body.

**Auth**: Required.

**Error Cases**:
| Status | Condition | Body |
|--------|-----------|------|
| `401` | Missing or invalid JWT | `{"message": "...", "code": "PGRST301"}` |
| `200`/`204` | Card was not in the user's portfolio | Returns empty array / no content (no error — idempotent) |

---

## 3. Transactions (Authenticated — RLS Enforced)

---

### 3.1 POST /transactions — Log a Transaction

Records a user's spending transaction. A database trigger automatically updates the `spending_state` table (cap deduction).

**Request**:
```
POST /rest/v1/transactions
Content-Type: application/json
Prefer: return=representation

{
  "card_id": "550e8400-e29b-41d4-a716-446655440000",
  "category_id": "dining",
  "amount": 85.00,
  "transaction_date": "2026-02-19"
}
```

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `card_id` | UUID | body | Yes | The card used for this transaction |
| `category_id` | string | body | Yes | Spend category (e.g., `"dining"`, `"transport"`) |
| `amount` | decimal | body | Yes | Transaction amount in SGD (must be > 0) |
| `transaction_date` | date | body | No | Date of the transaction (defaults to `CURRENT_DATE`) |

**Note**: `user_id` is auto-populated from `auth.uid()` (see column default / RLS approach from section 2.2). `logged_at` is auto-populated by database default.

**Response** `201 Created`:
```json
[
  {
    "id": "f1e2d3c4-...",
    "user_id": "d0e1f2a3-...",
    "card_id": "550e8400-...",
    "category_id": "dining",
    "amount": 85.00,
    "transaction_date": "2026-02-19",
    "logged_at": "2026-02-19T19:45:00+08:00"
  }
]
```

**Side Effects**:
- A database trigger (`after_transaction_insert`) fires and:
  1. Looks up the cap for this `card_id + category_id` from the `caps` table
  2. Upserts a row in `spending_state` for the current month
  3. Increments `total_spent` by `amount`
  4. Recalculates `remaining_cap = monthly_cap_amount - total_spent` (or `NULL` if no cap exists)

**Auth**: Required.

**Error Cases**:
| Status | Condition | Body |
|--------|-----------|------|
| `401` | Missing or invalid JWT | `{"message": "...", "code": "PGRST301"}` |
| `400` | Missing required field (`card_id`, `category_id`, `amount`) | `{"message": "null value in column ... violates not-null constraint", "code": "23502"}` |
| `400` | Invalid `card_id` (FK violation) | `{"message": "... violates foreign key constraint ...", "code": "23503"}` |
| `400` | Invalid `category_id` (FK violation) | `{"message": "... violates foreign key constraint ...", "code": "23503"}` |
| `400` | `amount` is negative or zero | Handled by CHECK constraint: `{"message": "new row violates check constraint", "code": "23514"}` |

---

### 3.2 GET /transactions — Get User's Transaction History

Returns the authenticated user's logged transactions. RLS filters by `auth.uid()`.

**Request**:
```
GET /rest/v1/transactions?select=id,card_id,category_id,amount,transaction_date,logged_at,cards(bank,name),categories(name)&order=transaction_date.desc,logged_at.desc&limit=50
```

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `select` | string | query | No | Columns + embedded relations |
| `order` | string | query | No | Sort order (default: newest first) |
| `limit` | integer | query | No | Max rows (recommend: 50 per page) |
| `offset` | integer | query | No | Pagination offset |
| `transaction_date` | date filter | query | No | Filter by date range (e.g., `transaction_date=gte.2026-02-01&transaction_date=lte.2026-02-28`) |
| `category_id` | string filter | query | No | Filter by category (e.g., `category_id=eq.dining`) |
| `card_id` | UUID filter | query | No | Filter by card |

**Response** `200 OK`:
```json
[
  {
    "id": "f1e2d3c4-...",
    "card_id": "550e8400-...",
    "category_id": "dining",
    "amount": 85.00,
    "transaction_date": "2026-02-19",
    "logged_at": "2026-02-19T19:45:00+08:00",
    "cards": {
      "bank": "OCBC",
      "name": "OCBC 90°N Visa"
    },
    "categories": {
      "name": "Dining"
    }
  }
]
```

**Auth**: Required.

**Error Cases**:
| Status | Condition | Body |
|--------|-----------|------|
| `401` | Missing or invalid JWT | `{"message": "...", "code": "PGRST301"}` |
| `200` | No transactions found | `[]` |
| `416` | `offset` exceeds total rows | `{"message": "Requested range not satisfiable"}` |

---

### 3.3 GET /spending_state — Get User's Current Spending State

Returns the authenticated user's spending state (cumulative spend and remaining cap) for the current month.

**Request**:
```
GET /rest/v1/spending_state?month=eq.2026-02&select=card_id,category_id,month,total_spent,remaining_cap,cards(bank,name),caps(monthly_cap_amount)
```

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `month` | string filter | query | No | Filter by month (e.g., `month=eq.2026-02`). Omit to get all months. |
| `card_id` | UUID filter | query | No | Filter by card |
| `category_id` | string filter | query | No | Filter by category |

**Response** `200 OK`:
```json
[
  {
    "card_id": "550e8400-...",
    "category_id": "dining",
    "month": "2026-02",
    "total_spent": 750.00,
    "remaining_cap": 250.00,
    "cards": {
      "bank": "OCBC",
      "name": "OCBC 90°N Visa"
    },
    "caps": {
      "monthly_cap_amount": 1000.00
    }
  },
  {
    "card_id": "550e8400-...",
    "category_id": "online",
    "month": "2026-02",
    "total_spent": 200.00,
    "remaining_cap": 1800.00,
    "cards": {
      "bank": "DBS",
      "name": "DBS Altitude Visa"
    },
    "caps": {
      "monthly_cap_amount": 2000.00
    }
  }
]
```

**Response Shape**:
| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `card_id` | UUID | No | FK to cards |
| `category_id` | string | No | FK to categories |
| `month` | string | No | Month in `YYYY-MM` format |
| `total_spent` | decimal | No | Cumulative spend this month for this card+category |
| `remaining_cap` | decimal | Yes | Remaining cap in SGD. `NULL` if no cap exists for this card+category. |

**Auth**: Required.

**Error Cases**:
| Status | Condition | Body |
|--------|-----------|------|
| `401` | Missing or invalid JWT | `{"message": "...", "code": "PGRST301"}` |
| `200` | No spending state for this month (new user or new month) | `[]` (empty — means all caps are at full capacity) |

**Client-Side Interpretation**:
- If `spending_state` returns no row for a given `card_id + category_id + month`, the user has spent $0 this month for that combination.
- The client should treat missing rows as `total_spent = 0` and `remaining_cap = full monthly_cap_amount` (looked up from the `caps` table).

---

## 4. Recommendation Engine (Custom RPC)

---

### 4.1 POST /rpc/recommend — Get Card Recommendation

The core recommendation function. Returns the user's cards ranked by effective earning potential for a given spend category, considering remaining bonus cap.

**Request**:
```
POST /rest/v1/rpc/recommend
Content-Type: application/json

{
  "p_category_id": "dining"
}
```

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `p_category_id` | string | body | Yes | The spend category to get recommendations for. Must be one of: `dining`, `transport`, `online`, `groceries`, `petrol`, `travel`, `general` |

**Note**: `p_user_id` is NOT passed by the client. The RPC function extracts the user ID from the JWT using `auth.uid()` internally. This prevents users from querying other users' recommendations.

**Response** `200 OK`:
```json
[
  {
    "card_id": "550e8400-...",
    "card_name": "OCBC 90°N Visa",
    "bank": "OCBC",
    "earn_rate_mpd": 4.0,
    "remaining_cap": 250.00,
    "monthly_cap_amount": 1000.00,
    "is_recommended": true
  },
  {
    "card_id": "550e8400-...",
    "card_name": "DBS Altitude Visa",
    "bank": "DBS",
    "earn_rate_mpd": 3.0,
    "remaining_cap": null,
    "monthly_cap_amount": null,
    "is_recommended": false
  },
  {
    "card_id": "550e8400-...",
    "card_name": "UOB PRVI Miles Visa",
    "bank": "UOB",
    "earn_rate_mpd": 1.4,
    "remaining_cap": 0.00,
    "monthly_cap_amount": 1000.00,
    "is_recommended": false
  }
]
```

**Response Shape**:
| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `card_id` | UUID | No | Card identifier |
| `card_name` | string | No | Card display name |
| `bank` | string | No | Issuing bank |
| `earn_rate_mpd` | decimal | No | Earn rate in miles per dollar for this category. Falls back to `base_rate_mpd` if no bonus rule exists. |
| `remaining_cap` | decimal | Yes | Remaining monthly cap in SGD. `NULL` means no cap (uncapped). `0` means cap exhausted. |
| `monthly_cap_amount` | decimal | Yes | Total monthly cap amount. `NULL` if uncapped. |
| `is_recommended` | boolean | No | `true` for the top-ranked card only |

**Ranking Logic**:
The recommendation engine ranks cards by `score = earn_rate_mpd * cap_ratio`, where:
- `cap_ratio = 1.0` if no cap exists (uncapped)
- `cap_ratio = 0.0` if `remaining_cap <= 0` (cap exhausted)
- `cap_ratio = LEAST(remaining_cap / monthly_cap_amount, 1.0)` otherwise
- Tiebreaker: alphabetical by `card_name` (deterministic ordering)

See `docs/architecture/RECOMMENDATION_ALGORITHM.md` for full algorithm specification.

**Auth**: Required. The function uses `auth.uid()` to identify the user.

**Error Cases**:
| Status | Condition | Response Body |
|--------|-----------|---------------|
| `401` | Missing or invalid JWT | `{"message": "...", "code": "PGRST301"}` |
| `200` | User has no cards in portfolio | `[]` (empty array) |
| `400` | Invalid `p_category_id` (not one of 7 categories) | `{"message": "Invalid category", "code": "P0001"}` (custom RAISE) |
| `200` | All cards have exhausted caps for this category | Returns all cards sorted by `base_rate_mpd` (fallback). The top card by base rate gets `is_recommended = true`. |

**Performance Target**: < 100ms response time. See `docs/architecture/RECOMMENDATION_ALGORITHM.md` for index strategy.

---

## 5. Supabase Auth Endpoints (Built-in)

These are handled by the Supabase client SDK. They are documented here for completeness but require **no custom implementation**.

---

### 5.1 Sign Up (Email + Password)

**SDK Call**:
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword123'
})
```

**Supabase Internal Endpoint**:
```
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response**: Returns a `User` object and a `Session` containing the JWT.

---

### 5.2 Sign In (Email + Password)

**SDK Call**:
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword123'
})
```

**Response**: Returns `User` + `Session` (JWT).

---

### 5.3 Sign In with Google (OAuth)

**SDK Call**:
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
})
```

**Response**: Redirects to Google OAuth flow. On success, returns `User` + `Session` (JWT).

---

### 5.4 Sign Out

**SDK Call**:
```typescript
const { error } = await supabase.auth.signOut()
```

---

### 5.5 Get Current Session

**SDK Call**:
```typescript
const { data: { session } } = await supabase.auth.getSession()
```

**Response**: Returns the current `Session` (JWT, user info) or `null` if not authenticated.

---

## 6. Error Response Reference

All Supabase REST errors follow a consistent format:

```json
{
  "message": "Human-readable error description",
  "details": "Additional context (optional)",
  "hint": "Suggestion for fixing (optional)",
  "code": "PostgreSQL error code (e.g., 23505, 42P01, PGRST301)"
}
```

### Common Error Codes

| HTTP Status | PG/PGRST Code | Meaning | Common Cause |
|-------------|---------------|---------|-------------|
| `400` | `23502` | Not null violation | Missing required field |
| `400` | `23503` | Foreign key violation | Invalid `card_id` or `category_id` |
| `400` | `23505` | Unique violation | Duplicate entry (e.g., card already in portfolio) |
| `400` | `23514` | Check constraint violation | Invalid value (e.g., negative amount) |
| `400` | `22P02` | Invalid text representation | Invalid UUID format |
| `401` | `PGRST301` | JWT expired or invalid | Token needs refresh or user must re-authenticate |
| `403` | `42501` | Insufficient privilege | RLS policy denied access |
| `404` | `PGRST116` | No rows found (for single-row expects) | Only with `Accept: application/vnd.pgrst.object+json` |
| `416` | — | Range not satisfiable | Pagination offset exceeds available rows |

---

## 7. Rate Limits and Quotas (Supabase Free Tier)

| Resource | Limit | Impact |
|----------|-------|--------|
| API requests | 50,000 / month | Sufficient for beta (~100 users x 500 requests/month) |
| Database size | 500 MB | Sufficient for card rules + user data for beta |
| Auth users | Unlimited on free tier | No constraint |
| Realtime connections | 200 concurrent | Not used in MVP |
| Edge Functions | 500,000 invocations / month | Not used in MVP (RPC used instead) |

---

## 8. Client SDK Usage (React Native)

All endpoints are accessed via the Supabase JavaScript client. Direct REST calls are not needed.

### Installation
```bash
npm install @supabase/supabase-js
```

### Initialization
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://<project-ref>.supabase.co',
  '<supabase-anon-key>'
)
```

### Example Calls

```typescript
// List all cards
const { data: cards } = await supabase
  .from('cards')
  .select('id, bank, name, type, base_rate_mpd, image_url')
  .order('bank')

// Get card with earn rules, caps, exclusions
const { data: card } = await supabase
  .from('cards')
  .select('*, earn_rules(*), caps(*), exclusions(*)')
  .eq('id', cardId)
  .single()

// Get my cards (RLS auto-filters)
const { data: myCards } = await supabase
  .from('user_cards')
  .select('card_id, added_at, cards(id, bank, name, type, base_rate_mpd, image_url)')
  .order('added_at', { ascending: false })

// Add card to portfolio
const { data, error } = await supabase
  .from('user_cards')
  .insert({ card_id: cardId })
  .select()

// Remove card from portfolio
const { error } = await supabase
  .from('user_cards')
  .delete()
  .eq('card_id', cardId)

// Log a transaction
const { data: tx, error } = await supabase
  .from('transactions')
  .insert({
    card_id: cardId,
    category_id: 'dining',
    amount: 85.00,
    transaction_date: '2026-02-19'
  })
  .select()

// Get transaction history (current month)
const { data: txHistory } = await supabase
  .from('transactions')
  .select('*, cards(bank, name), categories(name)')
  .gte('transaction_date', '2026-02-01')
  .lte('transaction_date', '2026-02-28')
  .order('transaction_date', { ascending: false })

// Get spending state (current month)
const { data: spendingState } = await supabase
  .from('spending_state')
  .select('*, cards(bank, name), caps(monthly_cap_amount)')
  .eq('month', '2026-02')

// Get recommendation
const { data: recommendations, error } = await supabase
  .rpc('recommend', { p_category_id: 'dining' })
```

---

## Appendix A: Endpoint Summary Table

| # | Method | Path | Auth | RLS | Description |
|---|--------|------|------|-----|-------------|
| 1 | GET | `/rest/v1/cards` | No | Public read | List all supported cards |
| 2 | GET | `/rest/v1/cards?id=eq.{id}` | No | Public read | Get card detail with embedded earn_rules, caps, exclusions |
| 3 | GET | `/rest/v1/earn_rules?card_id=eq.{id}` | No | Public read | Get earn rules for a card |
| 4 | GET | `/rest/v1/caps?card_id=eq.{id}` | No | Public read | Get caps for a card |
| 5 | GET | `/rest/v1/categories` | No | Public read | List all spend categories |
| 6 | GET | `/rest/v1/user_cards` | Yes | user_id = auth.uid() | Get current user's cards |
| 7 | POST | `/rest/v1/user_cards` | Yes | user_id = auth.uid() | Add card to portfolio |
| 8 | DELETE | `/rest/v1/user_cards?card_id=eq.{id}` | Yes | user_id = auth.uid() | Remove card from portfolio |
| 9 | POST | `/rest/v1/transactions` | Yes | user_id = auth.uid() | Log a transaction |
| 10 | GET | `/rest/v1/transactions` | Yes | user_id = auth.uid() | Get transaction history |
| 11 | GET | `/rest/v1/spending_state` | Yes | user_id = auth.uid() | Get spending state / cap usage |
| 12 | POST | `/rest/v1/rpc/recommend` | Yes | Uses auth.uid() internally | Get card recommendation for a category |

---

## Appendix B: Transaction Logging Side Effects (T3.05)

### B.1 Trigger-Based Cap Deduction

When a transaction is inserted via `POST /rest/v1/transactions`, the database trigger `after_transaction_insert` fires **synchronously** (within the same database transaction). The trigger:

1. Derives the calendar month from `transaction_date` (format: `YYYY-MM`)
2. Looks up the monthly cap for the `card_id + category_id` from the `caps` table
3. **UPSERTs** a row in `spending_state`:
   - **INSERT path** (first transaction for this card+category+month): creates a new row with `total_spent = amount` and `remaining_cap = cap - amount`
   - **UPDATE path** (subsequent transactions): increments `total_spent` and recalculates `remaining_cap = cap - new_total`
4. If no cap exists for the card+category: `remaining_cap` is set to `NULL` (uncapped)
5. If the transaction exceeds the remaining cap: `remaining_cap` is clamped to `0` via `GREATEST(..., 0)` -- it never goes negative

**Important**: This is a **synchronous side effect**. By the time the `201 Created` response is returned to the client, the `spending_state` table has already been updated. There is no asynchronous delay, no background job, and no eventual consistency concern.

**Delete behavior**: If a transaction is deleted (when enabled in v1.1), the `after_transaction_delete` trigger fires and decrements `spending_state.total_spent` accordingly, recalculating `remaining_cap`.

### B.2 Cap Deduction Behaviour Matrix

| Scenario | `total_spent` | `remaining_cap` |
|----------|---------------|-----------------|
| First txn for card+category+month | `= amount` | `cap - amount` (or `NULL` if uncapped) |
| Subsequent txn (same month) | `+= amount` | `cap - new_total` (floored at 0) |
| No cap defined for card+category | `+= amount` | `NULL` (stays NULL) |
| Transaction exceeds remaining cap | `+= amount` | `0` (clamped, not negative) |
| Transaction deleted | `-= amount` (floored at 0) | `cap - new_total` (recalculated) |

### B.3 Client-Side Implications

- After logging a transaction, the client does **not** need to manually update spending state -- it is done by the trigger.
- The client **can** immediately query `GET /rest/v1/spending_state?month=eq.YYYY-MM` to see the updated cap status.
- The client **can** immediately call `POST /rest/v1/rpc/recommend` and will receive cap-aware results reflecting the just-logged transaction.

---

## Appendix C: Cap Status Dashboard Query (T3.05)

### C.1 Recommended Query Pattern

To build a cap status dashboard showing all card+category combinations with their current spending and remaining cap, use the following query pattern:

**Request**:
```
GET /rest/v1/spending_state?month=eq.2026-02&select=card_id,category_id,month,total_spent,remaining_cap,cards(id,bank,name,image_url),categories(id,name)&order=cards(bank),categories(display_order)
```

**SDK Call**:
```typescript
const currentMonth = new Date().toISOString().slice(0, 7); // '2026-02'

const { data: capStatus } = await supabase
  .from('spending_state')
  .select(`
    card_id,
    category_id,
    month,
    total_spent,
    remaining_cap,
    cards (id, bank, name, image_url),
    categories (id, name)
  `)
  .eq('month', currentMonth)
  .order('total_spent', { ascending: false });
```

### C.2 Full Cap Dashboard (Including Unspent Categories)

The `spending_state` table only contains rows for card+category combinations where the user has actually spent money. To show **all** capped categories (including those with no spending yet), the client should join `spending_state` with `caps` client-side:

```typescript
// Step 1: Get user's cards
const { data: myCards } = await supabase
  .from('user_cards')
  .select('card_id, cards(id, bank, name)');

// Step 2: Get caps for user's cards
const cardIds = myCards.map(c => c.card_id);
const { data: allCaps } = await supabase
  .from('caps')
  .select('card_id, category_id, monthly_cap_amount')
  .in('card_id', cardIds);

// Step 3: Get current spending state
const { data: spendingState } = await supabase
  .from('spending_state')
  .select('card_id, category_id, total_spent, remaining_cap')
  .eq('month', currentMonth);

// Step 4: Merge client-side
const dashboard = allCaps.map(cap => {
  const spend = spendingState?.find(
    s => s.card_id === cap.card_id && s.category_id === cap.category_id
  );
  return {
    card_id: cap.card_id,
    category_id: cap.category_id,
    monthly_cap_amount: cap.monthly_cap_amount,
    total_spent: spend?.total_spent ?? 0,
    remaining_cap: spend?.remaining_cap ?? cap.monthly_cap_amount,
    percentage_used: spend
      ? ((spend.total_spent / cap.monthly_cap_amount) * 100).toFixed(1)
      : '0.0'
  };
});
```

### C.3 Response Interpretation

| `spending_state` row exists? | `remaining_cap` value | Interpretation |
|------------------------------|-----------------------|----------------|
| No row for this month | N/A | User has spent $0; full cap available |
| Row exists, `remaining_cap > 0` | Positive number | Partial cap remaining |
| Row exists, `remaining_cap = 0` | `0` | Cap exhausted; bonus rate no longer applies |
| Row exists, `remaining_cap IS NULL` | `NULL` | No cap defined for this card+category (uncapped) |

---

## Appendix D: Recommendation After Transaction (T3.09)

### D.1 Real-Time Cap-Aware Recommendations

Calling `POST /rest/v1/rpc/recommend` after logging a transaction will return **immediately updated, cap-aware results**. There is no delay between the transaction INSERT and the recommendation reflecting the updated spending state.

**Why**: The `update_spending_state()` trigger runs synchronously within the same database transaction as the INSERT. By the time the transaction INSERT returns `201 Created`, the `spending_state` row has been updated. The `recommend()` function reads from `spending_state` via a `LEFT JOIN`, so it always sees the latest data.

### D.2 Recommended Client Flow

```typescript
// 1. Log a transaction
const { data: tx, error: txError } = await supabase
  .from('transactions')
  .insert({
    card_id: selectedCardId,
    category_id: 'dining',
    amount: 85.00,
    transaction_date: '2026-02-19'
  })
  .select();

if (txError) {
  // Handle error
  return;
}

// 2. Immediately get updated recommendation (no delay needed)
const { data: recommendations } = await supabase
  .rpc('recommend', { p_category_id: 'dining' });

// 3. The top recommended card may have changed!
const topCard = recommendations?.[0];
// topCard.remaining_cap reflects the $85 just spent
// topCard.is_recommended may have shifted to a different card
```

### D.3 How the Ranking Changes After Spending

| Event | Card A (4 mpd, $1000 cap) | Card B (3 mpd, uncapped) | Recommended |
|-------|---------------------------|--------------------------|-------------|
| No spending | score = 4.0 * 1.0 = **4.0** | score = 3.0 * 1.0 = **3.0** | Card A |
| Spend $800 on Card A | score = 4.0 * 0.2 = **0.8** | score = 3.0 * 1.0 = **3.0** | **Card B** (3.0 > 0.8) |
| Spend $200 more on Card A (cap exhausted) | score = 4.0 * 0.0 = **0.0** | score = 3.0 * 1.0 = **3.0** | **Card B** (3.0 > 0.0) |
| New month (implicit reset) | score = 4.0 * 1.0 = **4.0** | score = 3.0 * 1.0 = **3.0** | Card A |

### D.4 Monthly Reset Behaviour

Cap resets happen **implicitly** at month boundaries:

- The `recommend()` function queries `spending_state WHERE month = to_char(NOW(), 'YYYY-MM')`
- On the 1st of a new month, no `spending_state` rows exist for the new month
- The `LEFT JOIN` returns `NULL` for `remaining_cap`
- The scoring logic interprets `NULL remaining_cap + cap defined` as "full cap available" (`cap_ratio = 1.0`)
- Result: all caps are automatically at full capacity with **zero maintenance** -- no cron job, no explicit reset

Old months' `spending_state` rows remain in the database for historical tracking and can be purged periodically using the admin utility `reset_caps_for_month()` or `purge_old_spending_state()`.

### D.5 Performance Note

The full flow (transaction INSERT + trigger + recommend() call) completes within a single round-trip to the database:

| Operation | Expected Latency |
|-----------|-----------------|
| Transaction INSERT (including trigger) | < 10 ms |
| `recommend()` RPC call | < 5 ms |
| Total database time | < 15 ms |
| End-to-end including network (SG) | < 200 ms |
