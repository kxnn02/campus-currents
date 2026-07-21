# 13 — Final Cleanup: Admin Accounts + Schema Export + Calendar Label

**What to build:** Create individual admin accounts, export the full database schema to version control, and add the "For [PROGRAM]" label on calendar event details.

**Blocked by:** All previous tickets (this is the final step after all schema changes are applied)

**Status:** ready-for-agent

- [ ] Create 2-3 individual admin accounts in Supabase Auth with strong passwords (16+ chars), set their profiles.role to 'admin' or 'super_admin'
- [ ] Set PIN hash for the super_admin account(s) so emergency PIN validation works
- [ ] Export full schema: run `supabase db pull` or `supabase migration fetch --yes` to save all migrations locally to `supabase/migrations/`
- [ ] Commit the migrations folder to git
- [ ] Mobile app: on event-detail screen, if `target_audience` has `programs` array and student's program is NOT in it, show a subtle chip: "For [PROGRAMS]" (informational, event is still visible)
- [ ] Verify Supabase Auth leaked password protection is enabled
