# r3-clock hunter result (summary kept by parent)

Candidates:
1. `salon-mobile/engine.ts/observeClock/hold-reference-includes-forward-dated-records` (proposed HIGH, confidence high)
   - observeClock's reference = max(lastSeen, latestRecordTime(data)) is computed on data that already holds the record just saved at the forward time, so a save with the clock ahead never sets the hold; next app start purgeExpired erases customers, selfies, bookings. Also 29-day steps on app start move lastSeen without ever holding.
   - Evidence: agents/r3-clock/artifacts/check2.txt (save-then-restart), check1.txt (steps).
   - Fix proposed: anchor hold on owner-confirmed time (clock.confirmedAt), reference from pre-op data.
2. `salon-mobile/engine.ts/assertClockNotBehind/forward-dated-record-lockout` (proposed MEDIUM)
   - One record saved with clock years ahead makes every guarded save fail at the real date; confirmClock doesn't clear it; backups with the future record are refused.
   - Evidence: check1.txt test B.
   - Fix proposed: refuse saves while held / beyond confirmed anchor + 30d; owner tool to re-date.

Covered: canStaffUndo fix holds; money-save guards present; refundableBalance replay holds; confirmClock only via OwnerApproval.

Hardening: unguarded saves (updateOpenVisit, extras, markLeaveSeen, withdrawLeave, logReminder*, setMarketingConsent, markAppointmentReminded) can write forward times; back-jump list capped at 20 and shown 7 days.
