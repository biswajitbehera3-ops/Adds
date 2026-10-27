# Security lessons: the problems found, their fixes, and the rules that follow

**Status:** all fixed on 27 Oct 2026. Found by security checks run 1, run 2 and run 3 (`security/run-N/REPORT.md`).

**Why this file exists:** future work on the salon app must keep these rules. Code comments point here by number, for example `SECURITY-LESSONS 3`. Every fix has a test in `tests/security.test.ts`, `tests/store.test.ts` or `tests/photos.test.ts`.

## The rules

Read these before changing the app.

1. **Never trust the phone's clock.**
   - Anyone holding the salon phone can change its date and time.
   - Any change that saves money, attendance, a closed booking or a deletion must call `assertClockNotBehind(data, now)`.
   - The phone keeps a **trusted time** (`clock.anchor`). It moves forward only in steps of up to 3 days of normal use, or when the owner confirms the date with the owner password. Checks compare with the trusted time, **never with the time of a saved record**: a record saved with the clock ahead must not vouch for itself (run 3).
   - Note the clock on the data as it was *before* a change, on every save (even a refused one), and when the app returns to the front (`commit`, `observeNow`).
   - Anything that deletes or erases automatically must stop when the clock has moved past the trusted time (`observeClock`, the clean-up hold). Nothing saves when the clock is more than 30 days past it (`assertClockNotFarAhead`).
   - The real fix is a trusted time source, which comes with live sync (`SYNC-PLAN.md`). Until then these guards are the defence.
2. **When something goes wrong, stop. Don't carry on with defaults.**
   - A load error, a bad file or a missing record must never be replaced with demo data, a default password or a guess.
   - Show a recovery screen and change nothing.
3. **Every file the app reads is untrusted.**
   - This covers a backup, an import, or anything picked with the document picker.
   - Check every field with the same rules the app uses when saving, and refuse the whole file on the first problem (`readBackup`).
   - That means nested parts and links too: ids are plain and unique, never a reserved word like `owner`, every staff and customer reference exists, lists are lists, notes are bounded, and no time is later than the phone's clock plus 5 minutes (run 3).
   - Keep the phone's own owner password; never take it from a file (`prepareRestore`).
4. **Owner powers need the owner, at the moment of the action.**
   - Restore, clear all and load demo ask for the owner password again.
   - Hiding a button is not a control. Owner-only engine functions should also check who is calling; this is still to do (see "Still open").
5. **Every action the owner relies on to spot misuse must record who did it and when, and show it in the owner's checks.**
   - This covers an undo, a customer who left, a booking closed as no-show or cancelled, and a cash count.
   - A check that only looks at what is still open can be cleared silently.
6. **Checks must compare against the data as it is now, not a copy saved earlier.**
   - The cash check recomputes the expected cash for every count of the last 7 days.
7. **Deleting a person means every copy.** That includes files: when a restore, clear or demo load drops records, delete the selfie files they named (`dropUnusedPhotos`).
   - Never write a customer's name into another record: notes, messages, logs.
   - Refer to them by id and show the live name.
   - When a customer is erased, clean up older copies, and keep the deletion when an older backup is restored.
8. **A stored name is never a file path.**
   - Photo keys and any name used in a file call must match a plain-name pattern (`isSafePhotoKey`), with no `/`, `..`, `#` or `?`.
9. **Codes and passwords need a limit on wrong tries.**
   - The WhatsApp code allows 3 wrong entries, then a new code must be sent.
10. **After every build, run the security check** (`CLAUDE.md`). Add a test for every new finding, and add the lesson here.

## The problems and their fixes

### Run 1 (26 Oct)

| # | Problem | Why it happened | Fix | Where |
|---|---|---|---|---|
| R1-1 | If the saved data couldn't be read at start-up, the app loaded demo data with the public owner password `owner1234` and overwrote the real salon. | One try/catch around loading fell back to demo data, and a save timer already running wrote it over the real data. | Demo data only on a true first launch. On a read error: a recovery screen ("Try again", "Restore from a backup file"), and saving is blocked so the stored data is never overwritten. A damaged session only signs the user out. | `src/domain/store.ts` (`loadStore`, `loadFailed`, `persist`, `commit`), `src/screens/LoadFailed.tsx`, `App.tsx` |
| R1-2 | Restoring a backup trusted the file completely. A fake backup could set the owner password, wallet money and prices, and switch off the WhatsApp-code check. | Only the file's shape was checked, and restore replaced everything with no password asked. | Every field is checked: ranges, phones, wallet balance equal to its entries, prices, check limits, photo names. The file size is capped. The phone keeps its own owner password. Restore, clear all and load demo ask for the owner password. | `src/domain/checks.ts` (`readBackup`, `backupProblem`, `prepareRestore`), `src/screens/owner/Guard.tsx`, `src/screens/owner/Live.tsx` |
| R1-3 | A stylist could undo a paid bill hours later by setting the clock back. The undo dropped out of that day's owner checks. | The 2-minute window only checked "not more than 2 minutes after", and accepted a time before the payment. | The window needs 0 to 2 minutes after payment. An undo is refused when the clock is behind the latest saved record. The receipt hides Undo by the same rule. | `src/domain/engine.ts` (`canStaffUndo`, `voidVisit`), `src/screens/Visit.tsx` |
| R1-4 | Closing a wallet could pay out bonus money as cash after a spend-down and a new top-up. | Lifetime bonuses were netted against lifetime spends, ignoring order and earlier closures. | The wallet is replayed in the order it was saved: bonus is spent first, a refund returns the bonus part, and a close resets it. | `src/domain/engine.ts` (`refundableBalance`) |
| R1-5 | **Needs a real phone to confirm.** The WhatsApp code that proves the customer is present appears in the message on the stylist's own phone. | The code is made, sent and checked on the same phone, from the stylist's WhatsApp. | Partial: 3 wrong tries, then a new code (lesson 9). The full fix is the server sending the code (WhatsApp Cloud API, `founder/RUNNING-COSTS.md`), so the stylist never sees it. | `src/components/Guards.tsx` |
| R1-6 | **Needs a real phone to confirm.** A photo name from a restored backup could point outside the selfie folder when old selfies are deleted. | The name was joined into a file path without a check. | Names must match a plain-name pattern in every file call, and in `readBackup` (lesson 8). | `src/platform/photos.ts` (`isSafePhotoKey`), `src/domain/checks.ts` |

### Run 2 (27 Oct)

| # | Problem | Why it happened | Fix | Where |
|---|---|---|---|---|
| 1 | Setting the phone clock a year or more ahead and reopening the app deleted recent selfies and bookings, and erased customers served today. | Automatic clean-up took its cut-off dates from the phone's clock with no sanity check. | The app watches the clock (`observeClock`). When it is more than 30 days past every saved record, clean-up pauses and the owner's checks show "The phone's date jumped ahead". The owner taps to confirm the date. | `src/domain/engine.ts` (`observeClock`, `confirmClock`, `purgeExpired`), `src/domain/checks.ts`, `src/screens/owner/Guard.tsx` |
| 2 | A stylist could mark tomorrow's attendance as present and on time the evening before, by moving the clock forward. | The check-in guard only refused a clock set back. | The owner's checks flag a check-in saved for a day that hasn't come, and any time the clock was set back (every save notes the clock). **Residual risk:** a stylist who pre-marks and doesn't open the app again until the morning leaves only the evening selfie as a trace; server time with live sync closes it. | `src/domain/engine.ts` (`observeClock`), `src/domain/store.ts` (`commit`), `src/domain/checks.ts` (`ownerChecks`) |
| 3 | Cash bills rung up after the owner's count, or backdated into a counted day, were never compared with the drawer. | The count saved "expected" as a fixed number, and only today's saved numbers were compared. | Each count of the last 7 days is compared with the cash as it stands now ("Cash bills changed after the count"). Checkout, top-up, wallet close and the count refuse a clock behind the latest record. Wallet refunds paid in cash come off the expected total. | `src/domain/checks.ts` (`expectedCash`, `closeDay`, `ownerChecks`), `src/domain/engine.ts` |
| 4 | A stylist could mark a late booking no-show or cancelled to clear the owner's "booking not closed" alert, with no name recorded. | Closing a booking saved no who or when, and the owner's checks only looked at bookings still open. | Bookings save `closedBy` and `closedAt`. Staff can't cancel after the booked time (they mark No-show). The owner's checks list every staff no-show and late cancel by name. | `src/domain/engine.ts` (`cancelAppointment`, `markNoShow`, `approveLeave`), `src/domain/types.ts`, `src/domain/checks.ts`, `src/screens/Calendar.tsx`, `src/screens/TodayBookings.tsx` |
| 5 | The check-in clock guard ignored bookings, leave decisions, reminders, cash counts and privacy events. | "Newest saved record" only read four kinds of record. | `latestRecordTime` reads every saved time, except a booking's own (future) start time. | `src/domain/engine.ts` (`latestRecordTime`) |
| 6 | Deleting a customer left their full name in the referring friend's wallet history. | The referral reward note was written as "Referred <name>". | The note is now "Referred a friend". Erasing a customer also rewrites older notes that name them. | `src/domain/engine.ts` (`REFERRAL_NOTE`, `erase`), `src/domain/seed.ts` |
| 7 | Restoring an older backup brought back customers deleted since. Found by the run-2 coverage review. | Restore replaced everything with the file. | Every deletion in this phone's privacy log is re-applied to the restored data, and the deletion record is kept. | `src/domain/checks.ts` (`prepareRestore`) |

### Gaps in the fixes above, found by run 3's first pass (27 Oct)

The lesson: **a fix needs the same check as new code.** Each of these was a hole left by the first round of fixes.

| # | Problem | Why it happened | Fix | Where |
|---|---|---|---|---|
| G1 | The recovery screen restored a backup with no password, and took the file's owner password. | The recovery path was built separately from the owner-menu restore, and skipped its checks. | A separate copy of the owner password's hash is saved (`salon:owner`). The recovery restore needs that password and keeps it. With no saved copy, restore is switched off and the owner is told to call support. | `src/domain/store.ts` (`OWNER_KEY`, `restoreAfterLoadFailure`, `canRestoreAfterLoadFailure`), `src/screens/LoadFailed.tsx` |
| G2 | Anyone could tap "The phone's date jumped ahead" to confirm a wrong date and restart the clean-up. | The confirm was a plain tap. | Confirming the date asks for the owner password (`OwnerApproval`). | `src/screens/owner/Guard.tsx` |
| G3 | Starting a visit, leaving, deleting a customer, booking and leave requests or decisions accepted a clock set back. | The clock guard was added only to the money and attendance actions. | All of them call `assertClockNotBehind` (lesson 1). | `src/domain/engine.ts` |
| G4 | A booking closed from a screen with no stylist found was recorded as closed by "owner". | The screens guessed the actor with `?? "owner"`. | The actor comes from the signed-in session (`sessionActor`). | `src/domain/store.ts`, `src/screens/Calendar.tsx`, `src/screens/TodayBookings.tsx` |
| G5 | A backup could carry future dates, unknown record types, a `demo` flag or its own clock watch. | `readBackup` checked fields one by one and copied the rest. | Every time field must be a real date and not in the future; types and statuses must be known values; only known keys are kept; `demo` is off and `clock` is never taken from a file. | `src/domain/checks.ts` (`readBackup`, `backupProblem`) |

### Run 3 (27 Oct): the re-check of the fixes

The lesson: **don't let a value the attacker can write decide whether the attacker is caught.** Three of these came from checks that trusted the phone's clock or a saved record time.

| # | Problem | Why it happened | Fix | Where |
|---|---|---|---|---|
| 3-1 (high) | One save made with the clock ahead, then a restart, or app starts each under 30 days apart, let clean-up erase customers, selfies and bookings for good. | The hold measured "far ahead" from the newest saved record and the last time seen, both of which the forward clock had just written. | Trusted time (`anchor`) moves only in steps of up to 3 days or by owner confirmation. The clock is noted on the data before each save. A bigger jump holds clean-up. | `src/domain/engine.ts` (`trustedTime`, `observeClock`, `confirmClock`), `src/domain/store.ts` (`commit`) |
| 3-2 (medium) | One record saved years ahead blocked billing, top-ups, check-ins and cash counts at the real date, and confirming the date didn't help. | The clock-behind guard used the newest saved record as the floor. | The guard uses the trusted time. No save at all when the clock is over 30 days past it. Confirming the date resets it. | `src/domain/engine.ts` (`assertClockNotBehind`, `assertClockNotFarAhead`), `src/domain/store.ts` |
| 3-3 (low) | A stylist could cancel a booking after its time with no trace, by setting the clock back while the app sat idle. | "Late" was judged by the phone clock, and the clock was noted only on saves. | Staff cancels within 3 hours before the time are listed ("shortly before the time"). The clock is noted when the app returns to the front. | `src/domain/checks.ts` (`ownerChecks`), `App.tsx`, `src/domain/store.ts` (`observeNow`) |
| 3-4 (low) | A restored backup could name a stylist `owner` (their cancels and undos then hidden) or carry a malformed bill that crashed the owner's checks. | Ids, references and nested parts weren't checked. | Ids plain, unique and never `owner`; references must exist; lists checked; notes bounded; phones unique. | `src/domain/checks.ts` (`backupProblem`) |
| 3-5 (low) | A backup with times up to a day ahead blocked saving after a restore. | The restore allowed 24 hours where the save guard allows 5 minutes. | 5 minutes, the same as the guard. | `src/domain/checks.ts` |
| 3-6 (low) | Restore, clear all and demo left selfie files on the phone for good. | Clean-up only reached files a record still named. | They delete the files of the records they drop. | `src/domain/store.ts` (`dropUnusedPhotos`) |

Also hardened in run 3: lost main data with the owner password still saved goes to the recovery screen, not demo data; old referral notes that name a friend are rewritten when data loads (the finding itself was rejected: no real data could hold one).

### Also fixed while doing this

- **Demo data had booking dates in the future.** With the new clock guard this would have blocked every save in the demo. Bookings are now saved as made before "now" (`src/domain/seed.ts`); a test guards it.
- **The single-file web build picked the wrong part of the app.** When the build splits the app into two files, the packer now takes the main one and adds the rest after it (`scripts/web-single-file.py`).

## Still open

- **The clock can still be walked forward in steps of 3 days**, one app start each. Reaching the selfie clean-up date (365 days) takes over 100 restarts, each with the date changed, and the owner's checks show a clock set back when it's put right. A trusted time source (live sync) closes it.
- **A salon closed for more than 3 days** sees "The phone's date jumped ahead" on return, and clean-up waits until the owner confirms the date. After 30 days nothing saves until the owner confirms.
- **A phone whose data can't be read loses its own deletion record** when a backup is restored from the recovery screen, because the privacy log is in the unreadable data. Customers deleted since that backup must be deleted again; live sync closes this.
- **Owner-only engine functions don't check who is calling.** This covers void, top-up, close wallet, delete customer and approve leave. Screens hide the buttons, and every in-app path was checked in run 1. Add a `requireOwner(session)` guard in the next build.
- **Login and owner approval have no lockout after wrong passwords, and the minimum password length is 4.**
- **Passwords use one round of SHA-256, and the backup file carries the hashes.** Move to a slow hash.
- **Sessions never expire.** Add an owner idle timeout.
- **These need a real phone, or the WhatsApp server, to close:** R1-5, R1-6, and the residual risk on run-2 item 2.
- **The legal-page script doesn't escape quotes in links.** Only whoever builds the pages can set those values. See run-2 report section 6.
