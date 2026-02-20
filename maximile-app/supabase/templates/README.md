# MaxiMile — Branded Email Templates

## Overview

Custom HTML email templates for Supabase Auth, branded with MaxiMile's design system.

## Templates

| File | Supabase Type | Subject Line | When Sent |
|------|---------------|--------------|-----------|
| `confirmation.html` | **Confirm signup** | Welcome to MaxiMile — Verify your email | After user registers |
| `recovery.html` | **Reset password** | Reset your password — MaxiMile | Password reset request |
| `magic-link.html` | **Magic link** | Your sign-in link — MaxiMile | Passwordless login |
| `email-change.html` | **Change email address** | Confirm email change — MaxiMile | User changes email |
| `invite.html` | **Invite user** | You've been invited — MaxiMile | Admin invites a user |

## How to Apply (Option A — Supabase Dashboard)

### Step 1: Open the Email Templates editor

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select the **MaxiMile** project
3. Navigate to **Authentication** > **Email Templates** (left sidebar)

### Step 2: Apply each template

For each email type listed above:

1. Click the tab matching the email type (e.g. "Confirm signup")
2. Update the **Subject** field with the subject line from the table above
3. Switch to the **Source** (HTML) editor
4. Copy the full contents of the matching `.html` file from this folder
5. Paste it into the editor, replacing the default template
6. Click **Save**

### Step 3: Test

1. Create a new test account via the signup flow
2. Check the email received — it should show the MaxiMile branded template
3. Test password reset from the login screen
4. Verify rendering in Gmail, Outlook, and Apple Mail

### Template Variables (Supabase)

These Go-template variables are used in the templates and auto-populated by Supabase:

| Variable | Description |
|----------|-------------|
| `{{ .ConfirmationURL }}` | The full verification/action link |
| `{{ .Token }}` | The OTP token (if using OTP instead of links) |
| `{{ .TokenHash }}` | Token hash for constructing custom URLs |
| `{{ .SiteURL }}` | Your configured site URL |
| `{{ .Email }}` | The recipient's email address |

### Brand Design Tokens Used

| Token | Value | Usage |
|-------|-------|-------|
| Brand Gold | `#C5A55A` | CTA buttons, logo accent |
| Brand Charcoal | `#2D3748` | Header background, text |
| Primary Blue | `#1A73E8` | Fallback links |
| Background | `#F8F9FA` | Email wrapper, footer |
| Text Primary | `#1A1A2E` | Headings |
| Text Secondary | `#5F6368` | Body copy |
| Text Tertiary | `#9AA0A6` | Captions, hints |

## Future: Option B — Custom SMTP

When ready to migrate to a production SMTP provider:

1. Set up SendGrid / Resend / AWS SES
2. Configure SMTP credentials in Supabase Dashboard > **Project Settings** > **Authentication** > **SMTP Settings**
3. Update `supabase/config.toml` `[auth.email.smtp]` section for local dev
4. Update sender to `noreply@maximile.app` with SPF/DKIM DNS records
5. Templates will carry over — same HTML, better deliverability
