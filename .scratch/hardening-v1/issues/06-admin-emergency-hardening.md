# 06 — Emergency Hardening (PIN Validation + False Alarm + Audit Trail)

**What to build:** The emergency trigger now validates PIN against stored hash, supports "false alarm" resolution, and displays audit information (who triggered, when). The database trigger from ticket 01 prevents duplicate active emergencies.

**Blocked by:** 01 (false_alarm constraint + prevent_duplicate trigger)

**Status:** ready-for-agent

- [ ] In `triggerEmergency` server action: accept `pin` from FormData, fetch the admin's `pin_hash` from profiles, compare using a hash verification (bcrypt or simple SHA-256 comparison depending on how pin_hash is stored)
- [ ] If PIN doesn't match, throw "Invalid PIN" error
- [ ] Add `resolveAsFalseAlarm` server action: updates status to 'false_alarm' + sets resolved_at
- [ ] On the emergency page, add a "False Alarm" button alongside "Mark as Resolved"
- [ ] On active emergency cards, show "Triggered by: [admin name]" and "Started: [relative time]" — join broadcasts.sender_id → profiles for the name
- [ ] On resolved/false_alarm cards, show the resolution type badge (green "Resolved" vs orange "False Alarm")
- [ ] Update trigger-emergency-dialog: add PIN input field (required, min 4 chars)
