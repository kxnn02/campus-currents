# 10 — Mobile: Emergency Auth Guard + Feed Pagination Fix

**What to build:** The mobile app suppresses auth redirects during active emergencies. Also, the feed switches to the server-side RPC function for proper pagination.

**Blocked by:** 01 (get_broadcasts_for_student RPC function exists)

**Status:** ready-for-agent

- [ ] In `_layout.tsx` auth redirect logic: if `!session && !inAuthGroup`, check `activeEmergency?.status === 'active' && !hasAcknowledged` — if true, do NOT redirect to login
- [ ] In `lib/feed.ts`: replace `useBroadcastFeed` implementation — call the `get_broadcasts_for_student` RPC function instead of raw table query + client-side filter
- [ ] Pass profile's `program`, `level`, `year_level` to the RPC
- [ ] Pagination now works correctly: each page returns exactly `page_size` matching broadcasts
- [ ] Keep existing `matchesTargetAudience` function (still used for broadcast detail view permission check) but it's no longer the feed filter
