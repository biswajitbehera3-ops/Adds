# Findings detail (confirmed medium and above), run 3

Both fixed on 28 Oct. The final design is described in `salon-mobile/SECURITY-LESSONS.md` rule 1 and the run-3 table; the first fix for both was itself replaced after the fix checks (REPORT section 3).

## One record saved with the clock far ahead blocks every bill, top-up, check-in, void and cash count at the real date

**Severity:** medium (likelihood medium: One save with the date moved ahead; can be accidental. Impact medium: Billing, top-ups, attendance and cash counts stop until data is wiped or the phone runs on a false date.)

assertClockNotBehind compared now with latestRecordTime, which trusts every saved time including a forward-dated one. A stylist who saved one record years ahead made every guarded save fail at the real date. confirmClock did not clear it, and a backup containing the record was refused.

**Root cause:** latestRecordTime treated attacker-dated records as a trusted lower bound for the clock, and saves accepted any future 'now'.

**Intended behaviour:** A record saved with the clock ahead never becomes the time the phone trusts; the owner's date confirmation always restores saving.

**Trace (at commit 1fe98d0):**

- entrypoint: `src/screens/Attendance.tsx:63` (Attendance check-in): Check-in saved ten years ahead.
- propagation: `src/domain/engine.ts:64` (latestRecordTime): Returns the forward-dated time.
- propagation: `src/domain/engine.ts:110` (confirmClock): Resets only lastSeen and hold.
- sink: `src/domain/engine.ts:85` (assertClockNotBehind): Every guarded save throws 'clock is behind'.

**Reproduced:** startVisit, topUp, closeDay and owner voidVisit refused; readBackup refused the export (agents/r3-clock/artifacts/check1.txt; verifier agents/v1/artifacts/check1.txt).

**Fix:** Check saves against the trusted anchor, not saved record times; refuse saves far ahead of the anchor; confirmClock sets the anchor.

## Clock-jump hold bypassed: one save made with the clock ahead, or app starts under 30 days apart, let automatic clean-up erase customers, selfies and bookings

**Severity:** high (likelihood medium: A few taps on the shared phone; also an honest wrong-year date while the app is open. Impact high: Irreversible erasure of customer records, selfies (evidence) and bookings; backups cannot recover them.)

The run-2 #1 fix paused purgeExpired when the clock was more than 30 days past max(lastSeen, latestRecordTime). commit ran observeClock on the data after the operation, so a record saved at the forward time raised the reference to 'now' and no hold was set; the next app start purged with the forward clock. App starts each under 30 days apart also moved lastSeen forward without a hold. prepareRestore re-applies AUTO_ERASED, so a backup cannot bring erased customers back.

**Root cause:** observeClock's reference included data written at the untrusted current time (the new record and lastSeen), so a forward clock raised its own baseline before the jump was checked.

**Intended behaviour:** Automatic deletion never runs on a clock that has moved past a time the phone trusts; only small steps of normal use or the owner's password move that time.

**Trace (at commit 1fe98d0):**

- entrypoint: `src/screens/Attendance.tsx:63` (Attendance check-in): A stylist with the clock moved ahead saves a check-in.
- propagation: `src/domain/store.ts:123` (commit): observeClock ran on post-op data holding the forward-dated record.
- propagation: `src/domain/engine.ts:103` (observeClock): reference = max(seen, latestRecordTime(data)) equals now; no hold.
- propagation: `src/domain/store.ts:61` (loadStore): Next app start runs purgeExpired with the forward clock.
- sink: `src/domain/engine.ts:1046` (purgeExpired): erase() and AUTO_ERASED for zero-balance customers; selfie files deleted.

**Reproduced:** Hold null after the forward save; purge at restart held=false, selfie deleted, served-today customer AUTO_ERASED; restoring today's backup keeps her erased. Stepping: hold never set, customer erased (agents/r3-clock/artifacts/check1.txt, check2.txt; verifier agents/v1/artifacts/check1.txt).

**Fix:** Keep a trusted anchor time in the clock record that moves only in steps of at most 3 days or by owner confirmation; observe the clock on the data before each save; hold clean-up when the clock passes anchor + 3 days; refuse every save past anchor + 30 days; observe on app resume.
