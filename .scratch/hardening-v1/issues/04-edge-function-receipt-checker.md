# 04 — Deploy check-push-receipts Scheduled Edge Function

**What to build:** A new Edge Function that runs every 60 seconds via pg_cron, polls Expo's receipt API for pending tickets, confirms delivery, and cleans stale tokens. This makes delivery tracking honest.

**Blocked by:** 01 (push_tickets table), 03 (tickets being populated)

**Status:** ready-for-agent

- [ ] Create Edge Function `check-push-receipts` that: queries push_tickets WHERE status='pending' AND created_at < now() - 30s, batches ticket IDs (max 300 per Expo request), calls `https://exp.host/--/api/v2/push/getReceipts`
- [ ] For each receipt: status 'ok' → UPDATE delivery_receipts SET delivered_at = now() + mark ticket 'delivered'
- [ ] For 'DeviceNotRegistered' → UPDATE profiles SET fcm_token = NULL WHERE fcm_token = ticket.expo_token + mark ticket 'invalid_token'
- [ ] For other errors → mark ticket 'failed' with error_message
- [ ] Stale tickets (older than 24h, still pending) → mark as 'failed'
- [ ] Deploy the function with verify_jwt = false (called by cron, not users)
- [ ] Set up pg_cron job: `SELECT cron.schedule('check-push-receipts', '*/1 * * * *', $$ SELECT net.http_post(...) $$)` — call the function every minute
- [ ] Test: create a push_ticket manually with a known Expo ticket ID, verify it gets processed
