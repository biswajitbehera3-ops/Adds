# Findings detail (confirmed medium and above), run 2

Paths are relative to `salon-mobile/`. Every reproduction ran only inside the run's sandbox, with dummy data.

## A stylist can mark tomorrow's attendance as present and on time the evening before by moving the phone clock forward

`salon-mobile:src/domain/engine.ts:markAttendance:no-upper-bound-future-checkin` · severity **medium** (likelihood medium, impact medium) · confidence high

markAttendance accepts any device time not more than 5 minutes behind the newest saved record, with no check against a future time. A signed-in stylist on the shared salon phone can, in the evening, set the clock to tomorrow 09:00, take the selfie and confirm. The record is stored for tomorrow at 09:00. After resetting the clock, the next day the root route sees today's attendance exists and never asks for a check-in; the owner's Staff screen and monthly export show the stylist Present at 09:00 with a selfie. Other stylists' real check-ins the next morning still pass the guard, so nothing flags the forgery.

**Root cause.** src/domain/engine.ts:1336 only refuses a check-in earlier than latestRecordTime minus 5 minutes; there is no upper bound, and date and checkInAt both come from the caller-supplied device time (engine.ts:1339, from Attendance.tsx:51/63). todaysAttendance (engine.ts:1325) and the root route (App.tsx:119) then treat the pre-made record as the real check-in.

**Intended behaviour.** A check-in records the time the stylist actually checked in; a record for a future day or time is not accepted, and a record whose time is later than records saved after it is refused or flagged to the owner.

**Trace**

1. `src/screens/Attendance.tsx:51` (entrypoint, Attendance.capture): shot.at = new Date() from the device clock moved forward to tomorrow 09:00
2. `src/screens/Attendance.tsx:63` (propagation, Attendance.confirm): markAttendance called with shot.at as now
3. `src/domain/engine.ts:1336` (propagation, markAttendance): Guard rejects only a clock behind latestRecordTime; a clock ahead passes
4. `src/domain/engine.ts:1339` (propagation, markAttendance): Record stored with date tomorrow and checkInAt tomorrow 09:00
5. `App.tsx:119` (propagation, useRootRoute): Next day todaysAttendance finds the pre-made record, so no check-in is asked
6. `src/domain/engine.ts:1401` (sink, attendanceSheets): Owner's export shows Present at 09:00 with a saved selfie; staffLate false

**Evidence**

- `src/domain/engine.ts:1336`: Only lower-bound clock check.
- `src/domain/engine.ts:1339`: date and checkInAt derived from caller-supplied now.
- `App.tsx:119`: Root route skips check-in when todaysAttendance exists.
- `MISUSE-CHECKS.md:41`: Documented misuse: phone clock moved to look on time; only a set-back clock is mitigated.

**Who.** A stylist holding the shared phone in the evening who wants the next day recorded as present and on time.

**Conditions**

- authentication_level: Stylist signed in with their own password.
- system_configuration: Shared salon phone whose date/time setting the stylist can change.
- timing_dependency: Done after the day's check-ins, one day ahead at an early time, so others' next-morning check-ins are not refused.

**Local reproduction (dummy data, sandbox)**

- Input: `markAttendance(data, { staffId: A, photoKey: 'a-28' }, new Date('2026-10-28T09:00:00+05:30')) on 27 Oct after A's and B's real 27 Oct check-ins`

1. In the sandbox run a vitest harness against src/domain/engine.ts with emptyData and two dummy stylists A and B.
2. Check in A 27 Oct 10:00 and B 10:02 IST, then markAttendance for A with now = 28 Oct 09:00 IST.
3. Check in B at a real 28 Oct 09:57; read todaysAttendance(A, 28 Oct 12:00), staffLate and the 2026-10-28 export row; attempt a real check-in by A at 12:00.

**Observed.** Future check-in accepted as {date '2026-10-28', checkInAt '2026-10-28T03:30:00.000Z'}; B's real 28 Oct 09:57 check-in accepted; todaysAttendance(A) at 28 Oct 12:00 returned the pre-made record with staffLate false; export row ['Dummy A','9811100001','Chair 1','Present','09:00','Saved in app']; a real check-in by A at 12:00 threw 'Attendance is already marked for today' (agents/w4-future-checkin/artifacts/check1.txt).

**Fix.** A check against Date.now() inside markAttendance alone does not work, because shot.at and Date.now() read the same moved clock; enforce the invariant against records saved later: keep a monotonically increasing save sequence on every commit; when latestRecordTime(data) is more than 5 minutes ahead of the current clock, flag the future-dated record in ownerChecks and stop counting it as a check-in (todaysAttendance and attendanceMonth ignore attendance whose checkInAt is later than a record with a higher sequence); long term take check-in time from server time on sync. Regression: pre-mark tomorrow, reset the clock, save a record today, assert the owner is flagged and the next day still asks for a check-in.

`src/domain/engine.ts`:

```ts
// markAttendance: if (istDate(now) !== istDate(new Date()) || now.getTime() > Date.now() + 5 * 60000) throw new UserError("Check the phone's date and time");
// store a save sequence (data.seq += 1) on every commit; ownerChecks flags attendance with checkInAt later than any record with a higher seq.
```

## Setting the phone clock forward and reopening the app permanently deletes recent attendance selfies, upcoming bookings and active customers' records

`salon-mobile:src/domain/engine.ts:purgeExpired:forward-clock-unguarded-purge` · severity **medium** (likelihood low, impact medium) · confidence high

purgeExpired runs on every app start with cutoffs from the device clock and no sanity check against the newest stored record. A staff member with the shared salon phone can set the date forward about a year and restart to delete every attendance selfie (including their own check-in evidence) and every booking, or about three years to erase every customer with a zero wallet, including customers served today. The result is persisted immediately; resetting the clock restores nothing. markAttendance has a clock guard but only against a clock set backwards.

**Root cause.** purgeExpired (src/domain/engine.ts:935-975) derives all retention cutoffs from the caller's now, which loadStore passes as the device clock (src/domain/store.ts:38) with no comparison against latestRecordTime(data), then persists the result (store.ts:42) and deletes the photo files (store.ts:40).

**Intended behaviour.** Retention erases only data genuinely older than the configured periods (1095/365/365 days); a device clock far ahead of the newest stored record should not trigger irreversible deletion.

**Trace**

1. `src/domain/store.ts:38` (entrypoint, loadStore): On every app start purgeExpired(state) is called with the device clock.
2. `src/domain/engine.ts:937` (propagation, purgeExpired): cutoff(days) = now - days for photos, reminders and customers.
3. `src/domain/engine.ts:952` (propagation, purgeExpired): Appointments before reminderCut dropped, including upcoming ones when the clock is forward.
4. `src/domain/engine.ts:970` (propagation, purgeExpired): Zero-wallet customers inactive before customerCut erased and logged AUTO_ERASED.
5. `src/domain/store.ts:40` (sink, loadStore): deletePhotos removes the selfie files and persist() writes the purged state.

**Evidence**

- `src/domain/engine.ts:1336`: markAttendance rejects a clock behind latestRecordTime; purgeExpired has no forward check.
- `src/config/salon-details.json:33`: Retention 1095/365/365 days.
- `src/domain/engine.ts:938`: photoCut from the same untrusted now.

**Who.** A staff member using the shared salon phone who wants to remove attendance selfie evidence or disrupt the records.

**Conditions**

- authentication_level: Physical access to the unlocked salon phone with permission to change the system date; no app login needed since purge runs at start.
- user_interaction: Set the device date forward >365 days (selfies, bookings) or >1095 days (customers), then cold-start the app.
- data_state: Customer erasure needs walletBalance 0 and no OPEN visit.

**Local reproduction (dummy data, sandbox)**

- Input: `purgeExpired(data, new Date(Date.now() + 366*86400000))`
- Input: `purgeExpired(data, new Date(Date.now() + 1100*86400000))`

1. Build dummy data with the real engine: one stylist, a customer who paid today, today's check-in with photoKey 'selfie-today', and a booking for the next open day.
2. Inside sbx.sh call purgeExpired on fresh copies with now = real, +366 days and +1100 days and print appointments, photoKeys, customersErased and the privacy log.

**Observed.** Real clock: 1 appointment kept, no photo keys, selfie kept, 0 customers erased. +366 days: 0 appointments (the upcoming 28 Oct booking dropped), photoKeys ['selfie-today'], attendance photoKey null. +1100 days: additionally customersErased 1, the customer who paid today renamed 'Deleted customer' with deletedAt 2029-10-31 and an AUTO_ERASED privacy-log entry; latestRecordTime was 2026-10-27 in every case (agents/w2-forward-purge/artifacts/check1.txt).

**Fix.** Refuse to purge when now is implausibly ahead of the newest stored record (e.g. now > latestRecordTime(data) + 30 days) and show an owner-only 'check the phone date' prompt; regression: purgeExpired(data, latest + 400 days) returns no photoKeys and erases no customer. Note that the latestRecordTime check alone can be bypassed by first saving a forward-dated record, so also require owner confirmation before a purge that would erase customers or bookings within the previous run's window, or keep a persisted high-water mark of the last trusted purge time.

`src/domain/engine.ts`:

```ts
const latest = latestRecordTime(data);
if (latest > 0 && now.getTime() > latest + 30 * DAY_MS) return { data, result: { photoKeys: [], customersErased: 0, skipped: true } };
```
