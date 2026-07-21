# 11 — Mobile: Server-Side Notification Preferences

**What to build:** The notification preferences screen now syncs to the database (profiles.notification_preferences column) and the preference keys are aligned to broadcast channels. The Edge Function respects these preferences for routine-tier pushes.

**Blocked by:** 01 (notification_preferences column), 03 (Edge Function reads preferences)

**Status:** ready-for-agent

- [ ] Refactor `notification-preferences.tsx`: change preference keys from `school_events/org_announcements/seminars_workshops/career_job_postings/facilities_notices` → `general/event/academic` (matching broadcast channels)
- [ ] Update labels: "General Announcements", "Events & Activities", "Academic Updates"
- [ ] On toggle change: PATCH `profiles.notification_preferences` via Supabase (in addition to AsyncStorage local cache)
- [ ] On mount: read from `profiles.notification_preferences` (fall back to AsyncStorage if fetch fails, then to defaults)
- [ ] Update info text: "Emergency and Important alerts cannot be muted. These settings control which routine announcements send you push notifications."
- [ ] Keep AsyncStorage as offline cache for fast reads
