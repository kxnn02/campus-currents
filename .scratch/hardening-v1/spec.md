# CampusCurrents v1 Hardening — Spec

## Problem Statement

CampusCurrents has a working mobile app and admin dashboard, but critical gaps exist between what the PRD promises and what the system actually delivers. The push notification pipeline exists but has security vulnerabilities, incorrect delivery tracking, and scope-blind audience targeting. The emergency accountability system — the app's strongest differentiator — lacks the real-time dashboard that makes it useful to security personnel. Multiple security issues expose the database to unauthorized access. These gaps would be exposed during the capstone defense demo and reduce confidence in the system's production readiness.

## Solution

Harden the existing system across five dimensions: (1) secure the push pipeline and make delivery tracking honest, (2) build the live emergency accountability dashboard, (3) fix audience targeting so students only receive relevant notifications, (4) add missing safeguards for emergency and broadcast actions, and (5) fill in notification preferences, testing, and polish items that demonstrate production quality.

## User Stories

1. As a security officer, I want to see a live counter of students who have responded "I'm Safe" or "Need Help" during an emergency, so that I can identify unaccounted students and prioritize follow-up.
2. As a security officer, I want to immediately see which students tapped "Need Help" with their contact info, so that I can dispatch assistance to them.
3. As a security officer, I want to mark an emergency as "False Alarm" (distinct from "Resolved"), so that students receive an appropriate message and the incident is recorded accurately.
4. As a super_admin, I want my emergency PIN validated against my stored hash, so that unauthorized persons cannot trigger emergencies even if they access my session.
5. As a student in a college program, I want to NOT receive push notifications for K-12-only suspensions, so that I'm not woken at 4 AM for irrelevant announcements.
6. As a student in senior high, I want to receive push notifications when a suspension affects my level, so that I know to stay home.
7. As a student checking the Status tab the night before, I want to see tomorrow's declared suspension (yellow indicator), so that I can plan ahead and not waste fare.
8. As a student, I want the Status screen to show three states (Classes On / Suspended Tomorrow / Suspended Today), so that I have clear actionable information.
9. As an admin, I want a confirmation modal before sending broadcasts, so that I don't accidentally notify 5,000 students with an unfinished draft.
10. As an admin, I want suspension broadcasts to include a human-readable message with scope, source, and reason clearly stated, so that students immediately understand who is affected.
11. As an admin, I want an optional custom message field when declaring suspensions, so that I can add context the template doesn't cover.
12. As a student, I want my notification preferences (mute routine channels) to actually suppress push notifications for muted channels, so that the setting does what it claims.
13. As an admin, I want delivery percentages to reflect "students who could have received the push" (those with tokens), not total registered students, so that metrics are honest and actionable.
14. As a panelist/auditor, I want to see who triggered an emergency and when, so that there is a clear audit trail.
15. As a developer, I want the push Edge Function to be uncallable by external parties, so that attackers cannot send fake push notifications.
16. As a developer, I want students unable to read other students' phone numbers via the API, so that personal data is protected.
17. As a developer, I want students unable to insert delivery receipts for other students, so that data integrity is maintained.
18. As a developer, I want `delivered_at` to reflect actual device delivery (Expo receipt confirmation), not just "we sent it to Expo's queue," so that delivery metrics are truthful.
19. As a developer, I want stale push tokens auto-cleaned when Expo reports DeviceNotRegistered, so that delivery denominators stay accurate.
20. As a developer, I want the feed to use server-side audience filtering with correct pagination, so that targeted broadcasts don't create sparse pages.
21. As a developer, I want the database to prevent a second emergency from being triggered while one is already active, so that accidental duplicates are impossible.
22. As a developer, I want the `level` column auto-derived from `program` via database trigger, so that the Edge Function can reliably filter by educational level.
23. As a developer, I want unit tests for all pure business logic functions, so that correctness is provable during defense.
24. As a developer, I want the database schema exported to version control, so that the project is reproducible.

## Implementation Decisions

### Push Delivery (Two-Phase)

- New table `push_tickets` stores Expo ticket IDs with status (pending/delivered/failed/invalid_token).
- The `push` Edge Function no longer sets `delivered_at` immediately. It creates delivery_receipts with `delivered_at = NULL` and stores ticket IDs in `push_tickets`.
- A new scheduled Edge Function `check-push-receipts` (triggered by pg_cron every 60s) polls Expo's `getReceipts` API. On `ok` → sets `delivered_at`. On `DeviceNotRegistered` → clears `fcm_token`.
- Webhook secret header (`X-Webhook-Secret`) added to the PL/pgSQL trigger and validated in the Edge Function to prevent external invocation.

### Audience Targeting (Level-Aware)

- `createSuspension` action maps `scope` → `target_audience` using a `scopeToTargetAudience()` function that produces `{ levels: [...] }` for level-scoped suspensions.
- Edge Function adds `level` to its profiles SELECT and filters students by the `levels` array in `target_audience`.
- Database trigger `auto_set_level_from_program()` on profiles INSERT/UPDATE ensures `level` is always correctly populated.
- A backfill UPDATE sets `level` for any existing profiles where it's NULL.

### Emergency Accountability Dashboard

- Server Component fetches initial snapshot (counts from `delivery_receipts` for the emergency's broadcast).
- Client Component subscribes to Supabase Realtime `postgres_changes` on `delivery_receipts` filtered by `broadcast_id`.
- Counters: Reached / Safe / Need Help / No Response / Not Reached.
- "Need Help" table shows student name, program, year, section, phone.
- Denominator = students with `fcm_token IS NOT NULL`.
- `false_alarm` added to `active_emergencies.status` CHECK constraint.
- Resolution sends distinct messages: "ALL CLEAR" vs "ALERT CANCELLED — False alarm."

### Feed Pagination (Server-Side)

- New Postgres RPC function `get_broadcasts_for_student(p_program, p_level, p_year_level, p_page_size, p_offset)` handles audience matching in SQL.
- Mobile app's `useBroadcastFeed` calls this RPC instead of raw table query + client filter.

### Notification Preferences (Server-Side)

- New JSONB column `notification_preferences` on `profiles` (default `{}`).
- Keys aligned to broadcast channels: `general`, `event`, `academic`. Only routine tier can be muted.
- Edge Function checks preferences and skips push for muted channels (routine tier only).
- Preferences screen syncs to DB (PATCH profiles) + keeps AsyncStorage as local cache.

### Security Fixes

- Revoke EXECUTE on `handle_broadcast_push_notification` from `anon` and `authenticated`.
- Set `search_path = ''` on the function.
- Profiles SELECT RLS: `id = auth.uid() OR role IN ('admin','super_admin') OR (EXISTS admin check)`.
- Delivery receipts INSERT RLS: add `student_id = auth.uid()` to WITH CHECK.
- Enable leaked password protection in Supabase Auth settings.

### Suspension Message Templates

- Structured per-source templates with natural-language scope, reason, duration.
- Push notification title: short one-liner for lock screen.
- Broadcast body: full structured detail.
- Optional custom message textarea overrides auto-generated body.

### Status Screen Enhancement

- Query `suspension_date >= today AND status = 'active'` (all future active).
- Partition: today suspensions → red, future suspensions → yellow (monitoring).
- Repurpose existing `monitoring` state in StatusIndicator.
- Show date prominently for upcoming suspensions.

### Emergency Safeguards

- PIN validation: compare input against `pin_hash` using bcrypt/hash comparison.
- BEFORE INSERT trigger on `active_emergencies`: reject if active emergency exists.
- Auth redirect suppressed during active emergency (mobile app `_layout.tsx`).

## Testing Decisions

- Test only pure functions with no side effects (no mocking Supabase).
- Functions to test: `matchesTargetAudience`, `getNavigationTarget`, `formatRelativeTime`, `suspensionAppliesToStudent`, `deriveLevelFromProgram`, `scopeToTargetAudience` (new), `formatScopeNatural` (new).
- Use the project's existing `fast-check` dependency for property-based tests on `matchesTargetAudience` (fuzzing audience structures).
- Test runner: add a `test` script to package.json using a minimal runner (vitest or jest — match team familiarity).
- Seam: all tested functions are exported from `lib/` modules with zero React/Supabase dependencies.

## Out of Scope

- SMS fallback activation (cost not covered)
- iOS Critical Alert entitlement (requires paid Apple Developer account)
- Offline mode / local caching beyond existing AsyncStorage queue
- PAGASA API auto-integration
- Event approval workflow (org → OSA)
- Multi-campus / multi-school support
- Social features (comments, reactions)
- Drill mode with metrics
- Geofenced alerts
- Force-update mechanism (documented as future feature)
- Full E2E / integration test suite (unit tests for pure functions only)

## Further Notes

- **Defense demo strategy:** The emergency accountability dashboard is the strongest demo moment. Trigger emergency from one laptop → show counters updating in real-time on projector as team members respond on phones.
- **iOS limitation:** Document in paper Chapter 5 — "iOS Critical Alert requires institutional Apple Developer account; designed for future activation." All demo should use Android devices.
- **Platform target:** Android is full-feature platform. iOS via Expo Go for UI testing only.
- **Calendar stays unfiltered:** All events visible to all students (discovery surface). Push targeting controls who gets notified, not who can browse.
- **Credit efficiency:** Tickets should be sized so each can be implemented in one context window without re-reading the full codebase. Database changes first (foundation), then Edge Functions (depend on schema), then frontend (depends on backend contracts).
