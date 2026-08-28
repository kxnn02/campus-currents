-- C3 follow-up: the column-level `REVOKE SELECT (pin_hash)` in 20260828100300 has NO
-- effect while anon/authenticated hold a TABLE-level SELECT grant on profiles — a
-- table grant covers every column and cannot be overridden by a narrower column revoke.
-- (Verified against the live DB: pin_hash remained selectable after 100300.)
--
-- Correct approach: revoke table-level SELECT, then grant SELECT back on every column
-- EXCEPT pin_hash. RLS still governs which ROWS are visible; this removes pin_hash from
-- the selectable COLUMN set so no client (student or admin) can ever read the hash.
-- PIN verification goes through the verify_pin() RPC instead.
--
-- NOTE: if a new column is added to profiles later, it must be added to this GRANT list
-- or clients won't be able to read it. ponytail: explicit column allowlist is the known
-- maintenance cost of hiding a single column below a table grant.

REVOKE SELECT ON public.profiles FROM anon, authenticated;

GRANT SELECT (
  id, email, first_name, last_name, role, student_id, program, year_level,
  section, phone_number, fcm_token, office, can_send_emergency, avatar_url,
  created_at, updated_at, school_id, level, notification_preferences
) ON public.profiles TO anon, authenticated;
