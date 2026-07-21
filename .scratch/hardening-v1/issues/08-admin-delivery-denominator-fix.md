# 08 — Fix Delivery Denominator + Broadcast Confirmation Modal

**What to build:** All delivery percentage calculations on the admin dashboard now use "students with fcm_token" as denominator instead of total students. Also add a confirmation modal before sending any broadcast.

**Blocked by:** None — can start immediately (independent UI fixes).

**Status:** ready-for-agent

- [ ] In `dashboard/page.tsx`: change total from all profiles to `profiles WHERE fcm_token IS NOT NULL AND role = 'student'`
- [ ] In `dashboard/delivery/page.tsx`: same denominator fix
- [ ] In `dashboard/analytics/page.tsx`: same denominator fix
- [ ] In `dashboard/history/page.tsx`: same denominator fix (if applicable)
- [ ] Add confirmation dialog to broadcast creation: after form validates, show "This will notify approximately X students. Send now?" with Cancel/Confirm buttons
- [ ] X is calculated from: count profiles matching the selected audience criteria with fcm_token NOT NULL
