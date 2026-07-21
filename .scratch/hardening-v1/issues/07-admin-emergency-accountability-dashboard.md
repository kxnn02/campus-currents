# 07 — Emergency Accountability Dashboard (Real-Time Counters)

**What to build:** When an emergency is active, the admin dashboard shows live counters (Reached / Safe / Need Help / No Response / Not Reached), a "Need Help" student list with contact info, and a progress bar — all updating in real-time via Supabase Realtime.

**Blocked by:** 06 (emergency page restructure), 03 (delivery_receipts created correctly with NULL delivered_at initially)

**Status:** ready-for-agent

- [ ] Create a Client Component `EmergencyAccountability` that accepts `broadcastId` and `totalStudentsWithTokens`
- [ ] Server-side initial fetch: COUNT delivery_receipts by acknowledgment_type for the broadcast, COUNT profiles with fcm_token
- [ ] Client subscribes to Supabase Realtime `postgres_changes` on `delivery_receipts` WHERE broadcast_id = target
- [ ] Display counters: 📬 Reached (delivered_at NOT NULL), ✅ Safe, 🆘 Need Help, ⏳ No Response (delivered but not acknowledged), 📵 Not Reached (no delivered_at)
- [ ] Progress bar: (safe + help) / reached × 100%
- [ ] "Need Help" section: table with student first_name, last_name, program, year_level, section, phone_number — query profiles JOIN delivery_receipts WHERE acknowledgment_type = 'need_help'
- [ ] Elapsed timer: shows "Alert active for X min Y sec" — updates every second
- [ ] Denominator displayed: "X students with app installed" (profiles WHERE fcm_token IS NOT NULL AND role = 'student')
