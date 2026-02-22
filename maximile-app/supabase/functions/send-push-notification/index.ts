// =============================================================================
// MaxiMile — send-push-notification Edge Function (Sprint 19)
// =============================================================================
// Supabase Edge Function that sends push notifications via Expo Push API.
// Handles rate change alerts, cap approaching notifications, and digest sends.
//
// Sprint:  19 — Push Notification Foundation
// Runtime: Deno (Supabase Edge Functions)
// Author:  Developer
// Created: 2026-02-22
//
// Security:
//   - Requires valid Supabase auth token (RLS enforced)
//   - Expo push API requires no authentication for free tier
//   - All notification attempts logged to push_notification_log
//   - Rate limiting: max 100 notifications per user per day
//
// Request:
//   POST /send-push-notification
//   Body: {
//     user_id?: string,              // Specific user (or all if omitted)
//     rate_change_id?: string,       // For rate change notifications
//     notification_type: string,     // 'rate_change', 'cap_approaching', 'digest'
//     severity?: string,             // 'critical', 'warning', 'info'
//     title: string,
//     body: string,
//     data?: object                  // Custom data for deep linking
//   }
//
// Response:
//   200: { sent: number, failed: number, tickets: Array }
//   400: { error: string } — validation failure
//   429: { error: string } — rate limit exceeded
//   500: { error: string } — upstream API error
// =============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ---------------------------------------------------------------------------
// CORS Headers
// ---------------------------------------------------------------------------

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'
const MAX_NOTIFICATIONS_PER_USER_PER_DAY = 100

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NotificationRequest {
  user_id?: string
  rate_change_id?: string
  notification_type: 'rate_change' | 'cap_approaching' | 'digest'
  severity?: 'critical' | 'warning' | 'info'
  title: string
  body: string
  data?: Record<string, any>
}

interface PushToken {
  user_id: string
  push_token: string
  push_enabled: boolean
  push_permission_status: string
}

interface ExpoPushMessage {
  to: string
  sound?: 'default' | null
  title: string
  body: string
  data?: Record<string, any>
  priority?: 'default' | 'normal' | 'high'
  badge?: number
}

interface ExpoPushTicket {
  status: 'ok' | 'error'
  id?: string
  message?: string
  details?: Record<string, any>
}

// ---------------------------------------------------------------------------
// Main Handler
// ---------------------------------------------------------------------------

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    // Parse request body
    const requestBody: NotificationRequest = await req.json()

    // Validate required fields
    if (!requestBody.notification_type || !requestBody.title || !requestBody.body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: notification_type, title, body' }),
        {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      )
    }

    // Initialize Supabase client (with service role for admin access)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get push tokens for target users
    const tokens = await getPushTokens(supabase, requestBody.user_id)

    if (tokens.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, failed: 0, message: 'No eligible users with push enabled' }),
        {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check rate limits
    const rateLimitedUsers = await checkRateLimits(supabase, tokens.map(t => t.user_id))

    // Filter out rate-limited users
    const eligibleTokens = tokens.filter(t => !rateLimitedUsers.has(t.user_id))

    if (eligibleTokens.length === 0) {
      return new Response(
        JSON.stringify({ error: 'All users have exceeded daily notification limit' }),
        {
          status: 429,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      )
    }

    // Build Expo push messages
    const messages: ExpoPushMessage[] = eligibleTokens.map(token => ({
      to: token.push_token,
      sound: requestBody.severity === 'critical' ? 'default' : null,
      title: requestBody.title,
      body: requestBody.body,
      data: requestBody.data || {},
      priority: requestBody.severity === 'critical' ? 'high' : 'default',
    }))

    // Send notifications via Expo Push API
    const tickets = await sendExpoNotifications(messages)

    // Log all notification attempts
    await logNotifications(
      supabase,
      eligibleTokens,
      requestBody,
      tickets
    )

    // Count successes and failures
    const sent = tickets.filter(t => t.status === 'ok').length
    const failed = tickets.filter(t => t.status === 'error').length

    return new Response(
      JSON.stringify({ sent, failed, tickets }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in send-push-notification:', error)

    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    )
  }
})

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Get push tokens for target users
 */
async function getPushTokens(
  supabase: any,
  userId?: string
): Promise<PushToken[]> {
  let query = supabase
    .from('push_tokens')
    .select('user_id, push_token, push_enabled, push_permission_status')
    .eq('push_enabled', true)
    .eq('push_permission_status', 'granted')

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching push tokens:', error)
    return []
  }

  return data || []
}

/**
 * Check rate limits for users (max 100 notifications per day)
 */
async function checkRateLimits(
  supabase: any,
  userIds: string[]
): Promise<Set<string>> {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const { data, error } = await supabase
    .from('push_notification_log')
    .select('user_id')
    .in('user_id', userIds)
    .gte('sent_at', yesterday.toISOString())

  if (error) {
    console.error('Error checking rate limits:', error)
    return new Set()
  }

  // Count notifications per user
  const counts = new Map<string, number>()
  for (const row of data || []) {
    counts.set(row.user_id, (counts.get(row.user_id) || 0) + 1)
  }

  // Return set of users who exceeded limit
  const rateLimited = new Set<string>()
  for (const [userId, count] of counts.entries()) {
    if (count >= MAX_NOTIFICATIONS_PER_USER_PER_DAY) {
      rateLimited.add(userId)
    }
  }

  return rateLimited
}

/**
 * Send notifications via Expo Push API
 */
async function sendExpoNotifications(
  messages: ExpoPushMessage[]
): Promise<ExpoPushTicket[]> {
  const response = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  })

  if (!response.ok) {
    throw new Error(`Expo Push API error: ${response.status} ${response.statusText}`)
  }

  const result = await response.json()
  return result.data || []
}

/**
 * Log notification attempts to database
 */
async function logNotifications(
  supabase: any,
  tokens: PushToken[],
  request: NotificationRequest,
  tickets: ExpoPushTicket[]
): Promise<void> {
  const logs = tokens.map((token, index) => {
    const ticket = tickets[index]

    return {
      user_id: token.user_id,
      notification_type: request.notification_type,
      severity: request.severity || null,
      title: request.title,
      body: request.body,
      data: request.data || null,
      push_token: token.push_token,
      delivered: ticket.status === 'ok',
      error_message: ticket.status === 'error' ? ticket.message : null,
      expo_ticket_id: ticket.id || null,
    }
  })

  const { error } = await supabase
    .from('push_notification_log')
    .insert(logs)

  if (error) {
    console.error('Error logging notifications:', error)
  }
}
