# 02 — Security Fixes (RLS + Function Access)

**What to build:** Lock down all identified security vulnerabilities: RLS policy tightening, function access revocation, and auth hardening. After this ticket, the database is secure against the attack vectors identified during review.

**Blocked by:** None — can start immediately (independent of 01).

**Status:** ready-for-agent

- [ ] Revoke EXECUTE on `handle_broadcast_push_notification` from `anon` and `authenticated` roles
- [ ] Set `search_path = ''` on `handle_broadcast_push_notification` function
- [ ] Replace profiles SELECT policy: students can see own row + rows where role IN ('admin','super_admin'); admins see all
- [ ] Tighten delivery_receipts INSERT policy: add `student_id = ( SELECT auth.uid() )` to WITH CHECK clause
- [ ] Enable leaked password protection in Supabase Auth settings (dashboard toggle)
- [ ] Generate and set a `WEBHOOK_SECRET` env var as a Supabase Edge Function secret
- [ ] Update `handle_broadcast_push_notification` PL/pgSQL function to include `'X-Webhook-Secret'` header in the pg_net HTTP POST call
