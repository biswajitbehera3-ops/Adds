# r3-money hunter result (summary kept by parent)

Candidate: `salon-mobile:checks.ownerChecks:staff-booking-cancel-before-start-unflagged` (proposed LOW, confidence high)
- ownerChecks shows a staff CANCELLED booking only when closedAt (phone clock) >= booked time. A cancel 1 minute before start, or after setting the clock back slightly while idle (lastSeen only advances on saves), leaves no owner item; cancelled bookings vanish from calendar lists.
- Evidence: agents/r3-money/artifacts/check1.txt.
- Fix proposed: list staff cancels near the start (e.g. within 3 h) or on the booking's day; observeClock at app start/resume.

Covered: WhatsApp code 3-tries fix holds; checkoutVisit guards hold; expectedCash with cash refunds, 7-day recompute, refundableBalance replay incl. void-after-close (check2.txt).

Hardening: observeClock not run at load; walletCodeOk/referralVerified client booleans; TodayBookings owner fallback staff[0]; topUp lacks live() filter for erased customers.
