# 01 — Database Schema Additions & Triggers

**What to build:** All new tables, columns, triggers, and constraint changes that the rest of the work depends on. After this ticket, the database is ready for the updated Edge Functions and frontend code.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Create `push_tickets` table (id UUID PK, broadcast_id FK, student_id FK, expo_ticket_id TEXT, expo_token TEXT, status TEXT DEFAULT 'pending', error_message TEXT NULL, created_at TIMESTAMPTZ DEFAULT now(), checked_at TIMESTAMPTZ NULL)
- [ ] Add `notification_preferences JSONB DEFAULT '{}'` column to `profiles`
- [ ] Add `false_alarm` to `active_emergencies.status` CHECK constraint (now: active/resolved/false_alarm)
- [ ] Create `auto_set_level_from_program()` trigger function + BEFORE INSERT OR UPDATE OF program trigger on profiles
- [ ] Create `prevent_duplicate_active_emergency()` trigger function + BEFORE INSERT trigger on active_emergencies (reject if any row with status='active' exists)
- [ ] Create `get_broadcasts_for_student(p_program TEXT, p_level TEXT, p_year_level INT, p_page_size INT, p_offset INT)` RPC function with server-side audience filtering
- [ ] Backfill: UPDATE profiles SET level = (derived from program) WHERE level IS NULL AND program IS NOT NULL
- [ ] Add index on `push_tickets(status, created_at)` for the receipt checker query
