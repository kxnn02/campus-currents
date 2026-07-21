# Implementation Prompts — Copy-Paste for Each New Chat

## Ticket 01 — Database Schema Additions

```
Implement ticket 01 from #File:.scratch/hardening-v1/issues/01-database-schema-additions.md

Context: This is part of a hardening sprint for CampusCurrents. The full spec is at #File:.scratch/hardening-v1/spec.md

The Supabase project ref is `mpseammhlqonrkwvfvec`. Use the Supabase MCP power to apply migrations directly. Each acceptance criterion in the ticket is a checklist item — work through them in order. After all are done, run `get_advisors` with type "security" to verify no new issues were introduced.
```

---

## Ticket 02 — Security Fixes

```
Implement ticket 02 from #File:.scratch/hardening-v1/issues/02-security-fixes.md

Context: #File:.scratch/hardening-v1/spec.md — Supabase project ref: `mpseammhlqonrkwvfvec`. Use Supabase MCP power to apply all security migrations. After applying all fixes, run `get_advisors` type "security" to confirm the warnings are resolved.
```

---

## Ticket 03 — Update Push Edge Function

```
Implement ticket 03 from #File:.scratch/hardening-v1/issues/03-edge-function-push-update.md

Context: #File:.scratch/hardening-v1/spec.md — Supabase project ref: `mpseammhlqonrkwvfvec`. Use Supabase MCP power to get the current Edge Function with `get_edge_function` slug "push", then rewrite and redeploy it with `deploy_edge_function`. The WEBHOOK_SECRET env var should already be set from ticket 02.
```

---

## Ticket 04 — Receipt Checker Edge Function

```
Implement ticket 04 from #File:.scratch/hardening-v1/issues/04-edge-function-receipt-checker.md

Context: #File:.scratch/hardening-v1/spec.md — Supabase project ref: `mpseammhlqonrkwvfvec`. Use Supabase MCP power. Deploy a new Edge Function called "check-push-receipts" and set up a pg_cron job to call it every minute. The push_tickets table was created in ticket 01.
```

---

## Ticket 05 — Suspension Action Fix

```
Implement ticket 05 from #File:.scratch/hardening-v1/issues/05-admin-suspension-action-fix.md

Context: #File:.scratch/hardening-v1/spec.md — The admin dashboard is at campus-currents/admin-dashboard/. Fix the createSuspension server action to map scope → target_audience with levels, and generate human-readable broadcast body templates. Add optional custom message textarea to the suspension dialog.
```

---

## Ticket 06 — Emergency Hardening

```
Implement ticket 06 from #File:.scratch/hardening-v1/issues/06-admin-emergency-hardening.md

Context: #File:.scratch/hardening-v1/spec.md — The admin dashboard is at campus-currents/admin-dashboard/. Add PIN validation to triggerEmergency, add "false alarm" resolution type, and show audit trail (who triggered) on emergency cards. The database constraint for false_alarm was added in ticket 01.
```

---

## Ticket 07 — Emergency Accountability Dashboard

```
Implement ticket 07 from #File:.scratch/hardening-v1/issues/07-admin-emergency-accountability-dashboard.md

Context: #File:.scratch/hardening-v1/spec.md — The admin dashboard is at campus-currents/admin-dashboard/. Build a real-time accountability component for the emergency page: live counters (Reached/Safe/Need Help/No Response), Need Help student list, progress bar, elapsed timer. Use Supabase Realtime (postgres_changes on delivery_receipts). The supabase client-side browser client is at src/lib/supabase/client.ts.
```

---

## Ticket 08 — Delivery Denominator Fix

```
Implement ticket 08 from #File:.scratch/hardening-v1/issues/08-admin-delivery-denominator-fix.md

Context: #File:.scratch/hardening-v1/spec.md — The admin dashboard is at campus-currents/admin-dashboard/. Fix all delivery percentage calculations to use "students with fcm_token IS NOT NULL AND role = 'student'" as denominator instead of total students. Also add a confirmation modal to the broadcast creation flow.
```

---

## Ticket 09 — Mobile Status Screen Enhancement

```
Implement ticket 09 from #File:.scratch/hardening-v1/issues/09-mobile-status-screen-enhancement.md

Context: #File:.scratch/hardening-v1/spec.md — The mobile app is at campus-currents/campus-currents-app/. Refactor the Status screen to query all future active suspensions and show three states: red (today), yellow/monitoring (upcoming), green (clear). The StatusIndicator component already supports a 'monitoring' state.
```

---

## Ticket 10 — Mobile Auth Guard + Feed Pagination

```
Implement ticket 10 from #File:.scratch/hardening-v1/issues/10-mobile-emergency-auth-guard.md

Context: #File:.scratch/hardening-v1/spec.md — The mobile app is at campus-currents/campus-currents-app/. Two changes: (1) suppress auth redirect during active emergency in _layout.tsx, (2) switch useBroadcastFeed in lib/feed.ts to use the get_broadcasts_for_student RPC function (created in ticket 01) instead of client-side filtering.
```

---

## Ticket 11 — Mobile Notification Preferences

```
Implement ticket 11 from #File:.scratch/hardening-v1/issues/11-mobile-notification-preferences.md

Context: #File:.scratch/hardening-v1/spec.md — The mobile app is at campus-currents/campus-currents-app/. Refactor the notification-preferences screen: align keys to broadcast channels (general/event/academic), sync preferences to profiles.notification_preferences column via Supabase PATCH, keep AsyncStorage as offline cache.
```

---

## Ticket 12 — Unit Tests

```
Implement ticket 12 from #File:.scratch/hardening-v1/issues/12-unit-tests.md

Context: #File:.scratch/hardening-v1/spec.md — The mobile app is at campus-currents/campus-currents-app/. Add vitest and write unit tests for all pure functions: matchesTargetAudience, getNavigationTarget, formatRelativeTime, suspensionAppliesToStudent, deriveLevelFromProgram. Use fast-check (already in devDeps) for property tests on matchesTargetAudience.
```

---

## Ticket 13 — Final Cleanup

```
Implement ticket 13 from #File:.scratch/hardening-v1/issues/13-final-cleanup.md

Context: #File:.scratch/hardening-v1/spec.md — Supabase project ref: `mpseammhlqonrkwvfvec`. Create individual admin accounts, set PIN hashes, export the full schema to supabase/migrations/ via CLI, and add the "For [PROGRAM]" label on the mobile event-detail screen. This is the final ticket — verify everything is coherent.
```

---

## Execution Order

**Can run in parallel (no blockers):**
- Ticket 01
- Ticket 02
- Ticket 08

**After 01 + 02 complete:**
- Ticket 03

**After 03 completes:**
- Ticket 04
- Ticket 05

**After 05 completes:**
- Ticket 06

**After 06 + 03 complete:**
- Ticket 07

**After 01 completes:**
- Ticket 09
- Ticket 10
- Ticket 11

**After 05 + 09 complete:**
- Ticket 12

**After all complete:**
- Ticket 13
