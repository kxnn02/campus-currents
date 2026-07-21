# 09 — Mobile Status Screen: Three-State + Future Suspensions

**What to build:** The Status screen now queries all future active suspensions (not just today) and displays three states: red (suspended today), yellow/monitoring (suspended upcoming), green (all clear). Students see tomorrow's suspension when declared the night before.

**Blocked by:** 01 (level trigger ensures scope filtering works), 05 (suspension broadcasts now have correct target_audience)

**Status:** ready-for-agent

- [ ] In `lib/suspensions.ts`: rename/refactor `useTodaySuspensions` → `useActiveSuspensions` that queries `suspension_date >= today AND status = 'active'` (no upper bound)
- [ ] Partition results into `todaySuspensions` and `upcomingSuspensions` (suspension_date > today)
- [ ] In `status.tsx`: determine indicator state: todaySuspensions.length > 0 → 'suspended'; upcomingSuspensions.length > 0 → 'monitoring'; else → 'on'
- [ ] Update StatusIndicator's `monitoring` state text: "CLASSES SUSPENDED TOMORROW" (or show the actual date if >1 day away)
- [ ] Update monitoring subtext: "A suspension has been declared for [date]. Stay home."
- [ ] Show bento grid details for upcoming suspension (same as today, but with date prominently shown)
- [ ] Update query key to reflect the broader query (invalidation still works with realtime)
- [ ] Suspension badge hook (`useSuspensionBadge`): also check for upcoming suspensions (show badge if any future active suspension exists)
