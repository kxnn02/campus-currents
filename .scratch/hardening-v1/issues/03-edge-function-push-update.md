# 03 — Update Push Edge Function (Honest Delivery + Level Filtering + Preferences)

**What to build:** Rewrite the `push` Edge Function to: validate webhook secret, filter by `levels` and notification preferences, store ticket IDs in `push_tickets` instead of immediately marking delivered, and create delivery_receipts with `delivered_at = NULL`.

**Blocked by:** 01 (push_tickets table, notification_preferences column), 02 (webhook secret configured)

**Status:** ready-for-agent

- [ ] Add `X-Webhook-Secret` validation at the top — reject 401 if missing/wrong
- [ ] Add `level` and `notification_preferences` to the profiles SELECT query
- [ ] Add filtering logic for `target_audience.levels` (filter students by level)
- [ ] Add filtering logic for notification preferences (skip students who muted the broadcast's channel, routine tier only)
- [ ] Stop setting `delivered_at` immediately — create delivery_receipts with `delivered_at = NULL`
- [ ] After sending each batch to Expo, parse ticket IDs from response and INSERT into `push_tickets` (broadcast_id, student_id, expo_ticket_id, expo_token, status='pending')
- [ ] Deploy updated function via Supabase MCP or CLI
- [ ] Test: INSERT a broadcast → verify push_tickets populated, delivery_receipts have NULL delivered_at
