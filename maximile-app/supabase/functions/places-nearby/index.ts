// =============================================================================
// MaxiMile — places-nearby Edge Function (SPA-3)
// =============================================================================
// Supabase Edge Function that proxies Google Places Nearby Search API requests.
// The Google API key is kept server-side; the client sends only lat/lng/radius.
//
// Task:    SPA-3 — Merchant Detection via Google Places API
// Runtime: Deno (Supabase Edge Functions)
// Author:  Software Engineer
// Created: 2026-02-20
//
// Security:
//   - Google API key stored in Supabase secrets (GOOGLE_PLACES_API_KEY)
//   - GPS coordinates are NEVER logged (PDPA compliance)
//   - Response is sanitized to return only essential fields
//   - Basic rate limiting via X-Request-Count header (max 10/hour)
//
// Request:
//   POST /places-nearby
//   Body: { lat: number, lng: number, radius: number }
//
// Response:
//   200: { results: Array<{ name, place_id, vicinity, types, geometry }> }
//   400: { error: string } — validation failure
//   429: { error: string } — rate limit exceeded
//   500: { error: string } — upstream API error
// =============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// ---------------------------------------------------------------------------
// CORS Headers
// ---------------------------------------------------------------------------

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-request-count',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GOOGLE_PLACES_URL =
  'https://maps.googleapis.com/maps/api/place/nearbysearch/json'

/** Maximum allowed search radius in meters. */
const MAX_RADIUS_METERS = 5_000

/** Minimum allowed search radius in meters. */
const MIN_RADIUS_METERS = 10

/** Maximum requests per hour (checked via X-Request-Count header). */
const RATE_LIMIT_PER_HOUR = 10

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RequestBody {
  lat: number
  lng: number
  radius: number
}

interface GooglePlaceResult {
  name?: string
  place_id?: string
  vicinity?: string
  types?: string[]
  geometry?: {
    location?: { lat: number; lng: number }
  }
  // Google returns many other fields — we ignore them.
  [key: string]: unknown
}

interface SanitizedPlace {
  name: string
  place_id: string
  vicinity: string
  types: string[]
  geometry: {
    location: { lat: number; lng: number }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a JSON error response with CORS headers.
 */
function errorResponse(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

/**
 * Validate that a value is a finite number within an optional range.
 */
function isValidNumber(
  value: unknown,
  min?: number,
  max?: number,
): value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return false
  if (min !== undefined && value < min) return false
  if (max !== undefined && value > max) return false
  return true
}

/**
 * Validate the request body.
 * Returns null on success or an error message string on failure.
 */
function validateBody(body: unknown): string | null {
  if (!body || typeof body !== 'object') {
    return 'Request body must be a JSON object with lat, lng, and radius.'
  }

  const { lat, lng, radius } = body as Record<string, unknown>

  if (!isValidNumber(lat, -90, 90)) {
    return 'lat must be a number between -90 and 90.'
  }
  if (!isValidNumber(lng, -180, 180)) {
    return 'lng must be a number between -180 and 180.'
  }
  if (!isValidNumber(radius, MIN_RADIUS_METERS, MAX_RADIUS_METERS)) {
    return `radius must be a number between ${MIN_RADIUS_METERS} and ${MAX_RADIUS_METERS}.`
  }

  return null
}

/**
 * Sanitize a Google Places result to include only the fields we need.
 * This reduces response size and avoids leaking unnecessary data.
 */
function sanitizePlace(place: GooglePlaceResult): SanitizedPlace | null {
  if (!place.name || !place.place_id) return null

  return {
    name: place.name,
    place_id: place.place_id,
    vicinity: place.vicinity ?? '',
    types: Array.isArray(place.types) ? place.types : [],
    geometry: {
      location: {
        lat: place.geometry?.location?.lat ?? 0,
        lng: place.geometry?.location?.lng ?? 0,
      },
    },
  }
}

// ---------------------------------------------------------------------------
// Main Handler
// ---------------------------------------------------------------------------

serve(async (req: Request): Promise<Response> => {
  // ---- CORS preflight ----
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  // ---- Only accept POST ----
  if (req.method !== 'POST') {
    return errorResponse('Method not allowed. Use POST.', 405)
  }

  // ---- Rate limiting (header-based) ----
  const requestCountHeader = req.headers.get('x-request-count')
  if (requestCountHeader !== null) {
    const requestCount = parseInt(requestCountHeader, 10)
    if (!Number.isNaN(requestCount) && requestCount > RATE_LIMIT_PER_HOUR) {
      return errorResponse(
        'Rate limit exceeded. Maximum 10 requests per hour.',
        429,
      )
    }
  }

  // ---- Parse & validate body ----
  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return errorResponse('Invalid JSON in request body.', 400)
  }

  const validationError = validateBody(body)
  if (validationError) {
    return errorResponse(validationError, 400)
  }

  const { lat, lng, radius } = body

  // ---- Read API key from environment ----
  const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')
  if (!apiKey) {
    // Log server-side only (no coordinates)
    console.error('[places-nearby] GOOGLE_PLACES_API_KEY is not configured.')
    return errorResponse('Service configuration error.', 500)
  }

  // ---- Call Google Places Nearby Search API ----
  // NOTE: We intentionally do NOT log lat/lng (PDPA compliance).
  const url = new URL(GOOGLE_PLACES_URL)
  url.searchParams.set('location', `${lat},${lng}`)
  url.searchParams.set('radius', String(Math.round(radius)))
  url.searchParams.set('key', apiKey)

  try {
    const googleResponse = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    })

    if (!googleResponse.ok) {
      console.error(
        `[places-nearby] Google API returned HTTP ${googleResponse.status}`,
      )
      return errorResponse('Upstream API error.', 502)
    }

    const googleData = await googleResponse.json()

    // Google Places API returns status field: OK, ZERO_RESULTS, etc.
    if (
      googleData.status !== 'OK' &&
      googleData.status !== 'ZERO_RESULTS'
    ) {
      console.error(
        `[places-nearby] Google API status: ${googleData.status} — ${googleData.error_message ?? 'no details'}`,
      )
      return errorResponse(
        `Google Places API error: ${googleData.status}`,
        502,
      )
    }

    // ---- Sanitize results ----
    const rawResults: GooglePlaceResult[] = googleData.results ?? []
    const sanitized: SanitizedPlace[] = rawResults
      .map(sanitizePlace)
      .filter((p): p is SanitizedPlace => p !== null)

    return new Response(JSON.stringify({ results: sanitized }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    // Network or parsing error — log without coordinates
    console.error(
      `[places-nearby] Fetch error: ${err instanceof Error ? err.message : 'unknown'}`,
    )
    return errorResponse('Failed to reach Google Places API.', 502)
  }
})
