# Security check: salon app (run 1)

## 1. What was checked and how

- **Target:** `salon-mobile/` in biswajitbehera3-ops/Adds, commit `05910c6a81805c24eec1b6dc96ab456f2fd35672`, clean worktree.
- **Method:** Cloudflare `security-audit` skill, full audit mode, **quick profile**. That means one hunting pass, one coverage review, and one independent verifier per lead. **This is a partial pass, not complete coverage.**
- **Budget:** 24 agent runs set, 17 used (4 mapping, 6 hunters, 1 coverage reviewer, 6 verifiers).
- **Execution:** sandboxed source-and-local only. Code ran only inside an OS-enforced sandbox (`sbx.sh`):
  - new user, network and mount namespaces, so no network;
  - the whole filesystem read-only except one scratch folder per agent;
  - an empty environment with an allowlist;
  - CPU 120 s, data 4 GiB, 256 processes, 64 MiB per file, 300 s wall clock.

  Evidence files were copied out with a no-follow, size-bounded promotion step. Nothing touched a live service, a real customer, or a device. The app's 83 existing tests pass inside the sandbox.
- **Prior runs:** none; this is the first.
- **Deferred:** the coverage reviewer found 5 areas no unit covered. The quick profile does not run a second pass, so they are recorded as deferred:
  1. stylist check-in and leave requests;
  2. bookings, arrival, no-show and cancel;
  3. customer data export, erase and the inactive-customer purge;
  4. the owner's end-of-day cash count (`expectedCash`);
  5. the legal-page build script.

  These five have **not** been checked.
- **Not available:** an Android or iOS build or emulator. Two leads need one (section 5).

## 2. Security posture in one paragraph

The app has no server, so the main boundary is **owner versus stylist on the same phone**. That boundary holds inside the app: no stylist path reaches an owner-only action. But it is enforced only by which screens and buttons each person sees; the core functions don't check who is calling. The weak spots are where data **enters or reloads**:
- a load error swaps in demo data with a known owner password;
- a restored backup is trusted completely;
- the money rules trust the phone's clock and a few lifetime totals.

None of these can be done from outside the phone. Each needs a corrupted store, a crafted file the owner restores, a stylist changing the clock, or a regular wallet customer.

## 3. Confirmed findings

| Severity | Finding | Boundary | What the sandbox showed |
|---|---|---|---|
| Medium | A load error replaces real salon data with demo data whose owner password is the public `owner1234` | Saved data vs. owner credential | A malformed saved session wiped the real store within 400 ms with no tap; `owner1234` then opened the owner account |
| Medium | Backup restore replaces the owner password and all data from an unchecked file | Owner credential, wallet money, check limits | A crafted "backup" was accepted with the attacker's owner password, a −₹9,99,999 wallet, a −₹5 price and the wallet-code limit at ₹9,99,99,999 |
| Medium | A stylist can undo a paid bill after the 2-minute limit by setting the phone clock back, and the undo drops out of that day's owner checks | Staff undo window vs. owner checks | Undo refused at +30 min, accepted with the clock 24 h behind; the owner's checks for the real day showed 0 undos |
| Low | Closing a wallet refunds bonus credit as cash after the customer spent the wallet down and topped up again | Promotional credit vs. cash refund | ₹2,200 refunded where ₹2,000 was deposited; ₹200 of bonus paid out as cash |

### 3.1 Load error swaps in demo data (medium)

- **Where:** `src/domain/store.ts:33-49` (`loadStore`). The single catch sets `state = buildDemoData()` and does not cancel the save timer scheduled at line 42. Demo owner secret: `src/domain/seed.ts:12-15`. The login screen shows the demo passwords: `src/screens/Login.tsx:225-227`.
- **Who:** no attacker is needed to lose the data. Afterwards, anyone holding the phone, including a stylist, can open the owner account.
- **Reproduction (sandbox):** seed a real store, put `{not json` in `salon:session`, call `loadStore()`, wait 400 ms. A second variant makes the data read fail, followed by one commit.
- **Result:** the stored data becomes demo data (3 staff, 24 customers). `owner1234` is accepted and the real password is rejected.
- **Impact:** every wallet balance, ledger entry, visit and staff account on the only copy is gone, and owner access is printed on the login screen.
- **Why medium:** high impact but low likelihood. On a real phone the app always writes a valid session, so this needs storage corruption, a failed read, or control of web storage.
- **Fix:** fail closed:
  - parse the session separately, and only sign the user out if it fails;
  - on a data load failure, cancel the timer, block saving and show a recovery screen (retry or restore a backup);
  - never load demo data on an error.

### 3.2 Backup restore trusts the file (medium)

- **Where:**
  - `src/platform/share.ts:49`: the picker accepts any file.
  - `src/domain/checks.ts:178-189` (`readBackup`): shape checks only.
  - `src/domain/engine.ts:78-100` (`migrate`): a cast with no validation.
  - `src/domain/store.ts:85-90` (`restoreBackup`): the result becomes live data, including `owner.secret`.
  - `src/screens/owner/Live.tsx:588`: confirm only, no password.
- **Who:** anyone who can get the owner to restore a file they made, for example sent over WhatsApp as "your backup". That includes a stylist.
- **Reproduction (sandbox):** `readBackup` on a crafted version-4 backup.
- **Result:** the attacker's password verifies as the owner password. A wallet-code limit of 9,99,99,999, a −₹9,99,999 balance and a −₹5 price are all accepted. The normal settings screen rejects the same limit.
- **Why medium:** owner takeover and arbitrary money values, but it needs the owner to pick and confirm the file.
- **Fix:**
  - after `migrate`, validate every field with the same rules as normal saves, and reject the whole file on any violation;
  - ask for the current owner password before restoring;
  - keep the phone's existing owner password unless the owner proves the backup's password.

### 3.3 Late undo by moving the clock back (medium)

- **Where:**
  - `src/domain/engine.ts:593` (`canStaffUndo`) checks only `now − paidAt ≤ 2 min`, with no lower bound.
  - `voidVisit` (`engine.ts:600-633`) lacks the clock-behind refusal that `markAttendance` has (`engine.ts:1336`).
  - The receipt timer (`src/screens/Visit.tsx:295, 358`) shows Undo again when the clock is behind.
  - The owner's checks filter undos by the date on the undo (`src/domain/checks.ts:131`).
- **Who:** a signed-in stylist who keeps the receipt screen open and changes the phone's date.
- **Reproduction (sandbox):** a cash bill at 06:00. Undo is refused at 06:30. Undo is accepted with the clock 24 h behind.
- **Result:** the visit becomes VOID, dated the previous day. The owner's checks for the real day list nothing, and that day's expected cash no longer counts the bill.
- **Why medium:** it defeats the bill-integrity rule and hides the undo from the daily check. It needs a deliberate clock change, and the VOID record stays in history.
- **Fix:** require `0 ≤ now − paidAt ≤ window`, and refuse staff undos when the clock is behind the latest saved record (the same 5-minute tolerance as attendance).

### 3.4 Wallet close overpays bonus (low)

- **Where:** `src/domain/engine.ts:835-840` (`refundableBalance`) nets lifetime bonuses against lifetime spends. It ignores order and the resets from closing a wallet. `closeWallet` (`engine.ts:852-864`) pays out what it returns.
- **Who:** a regular wallet customer who asks for a refund. The owner performs the close.
- **Reproduction (sandbox):** top up ₹2,000 (+₹200), spend ₹2,200, top up ₹2,000 (+₹200), close.
- **Result:** ₹2,200 refunded instead of ₹2,000 with ₹200 written off. After a close and a ₹1,000 (+₹50) top-up, the app reports ₹1,050 refundable.
- **Why low:** a small amount per close (the 5–15% bonus or a ₹100 referral), and the owner does it.
- **Fix:** replay the wallet in time order: bonus spent first, both pools reset at cash-out or write-off. Add tests for "spend down, top up, close" and "close, reopen, close".

## 4. What was checked and held

- **Owner versus stylist:** no stylist path reaches owner-only screens or actions:
  - top-up refuses non-owners even from the visible Counter button;
  - cancel and void after 2 minutes, closing a wallet and deleting a customer show for the owner only;
  - extras need the owner password.
- **Login:** owner and staff logins check salted hashes. A deactivated stylist is signed out at once.
- **Money arithmetic:**
  - whole-rupee and range checks on top-ups, extras and wallet spends;
  - a wallet can't go negative through normal use;
  - each visit can be paid once;
  - undo refunds the wallet and reverses referral rewards.
- **Links:** WhatsApp and phone links can't change their target. Phone numbers are cleaned to 10 digits on every normal write.
- **Web version:** the host storage copy is private to each viewer. Nothing reaches an HTML or script sink. There are no `eval`, `innerHTML` or `window.open` calls.
- **Exports:** the spreadsheet export writes text cells only, so no formula injection. Backup and spreadsheet export are reachable by the owner only.
- **Repository:** no keys, tokens or secret files, no debug switches, and the lockfile pins dependencies.

## 5. Needs validation (not confirmed, no severity)

| Lead | Trace | What blocks a verdict | Next local step | Owner check on a test phone |
|---|---|---|---|---|
| The WhatsApp code goes to the stylist it is meant to check (`Guards.tsx:24,35,66` → `Visit.tsx:81` → `engine.ts:539`; referrals `engine.ts:197`) | Code made and checked on the stylist's phone and placed in the `wa.me` pre-fill; engine trusts a true/false flag; no attempt limit | Whether WhatsApp shows the pre-filled code to the sender before sending | Done: the opened link contains the code, and the engine accepts a ₹1,500 wallet spend on the flag alone | Dummy customer number you own: tap "Send code on WhatsApp" as a stylist, see if the code shows, go back without sending, type it in, stop before Collect |
| Restored photo name can point outside the selfie folder (`checks.ts:187` → `store.ts:86, 38` → `engine.ts:942` → `photos.ts:74`) | `deleteAsync(DIR + key + ".jpg")` with no folder check; the key comes from a restored backup | How Android/iOS resolve `attendance/../X.jpg`; no emulator here | Done: the exact delete paths reach `deleteAsync`; the bundled expo-file-system only limits deletes to the app's own storage | On a test build: put a dummy `.jpg` beside the selfie folder, restore a backup naming `../dummy-sibling`, restart, see if the file is gone |

Fixing 3.2 (validating restored files) also closes the second lead's way in.

## 6. Hardening notes (not findings)

- The core functions take no caller role. Add a `requireOwner(session)` guard and tests, so that a future screen mistake can't hand a stylist owner powers.
- Login and owner-approval have no lockout or delay after wrong passwords, and the minimum length is 4. Add an increasing delay and require at least 6 characters.
- Passwords use one round of SHA-256, and the backup file carries the hashes. Use a slow hash (PBKDF2 or scrypt), or leave the owner hash out of backups.
- Sessions never expire. Add an idle timeout for the owner, and sign out when the owner password changes or a backup is restored.
- "Delete all" and "Load demo" wipe everything after one confirm. Ask for the owner password.
- A fresh install starts on demo data with the password shown. Force the owner to set a password before real customers, and clear the demo flag when the password changes.
- The wallet-code limit applies per visit, so ₹1,000 can go as two ₹500 spends without a code. Consider a daily total per customer.
- Owner approval of extras approves whatever is waiting when the password is typed. Tie it to the items shown.
- The Counter shows a "Top up wallet" button to stylists that then fails. Hide it.
- The customer phone is masked for stylists but shown in Call, WhatsApp and Counter, so the mask is only cosmetic.
- Run `normalizePhone` again on restored data and in the link builders. Check `^https?://` on the legal links in `Me.tsx:733`.
- Add `.env` and `.env.*` to `.gitignore`. No offline dependency CVE check was possible.

## 7. Coverage

| Units | Count |
|---|---|
| Covered (no finding) | 6 |
| Candidate (lead found and verified) | 6 |
| Blocked | 0 |
| Deferred (coverage reviewer, quick profile) | 5 |
| **Total** | **17** |

- **Final coverage review:** proposed 5 missing units, all deferred, and no units to reassign. Because units were deferred, **this run does not claim clean coverage.**
- **Leads:** 6 verified (4 confirmed, 2 needs-validation, 0 rejected). One duplicate (a second hunter found the demo-data fallback) was merged into a single finding.
- **Validators:** `validate-findings.cjs` (6 findings valid) and `validate-coverage-ledger.cjs` (17 units valid) both pass.
- **Next run:** start from this ledger and cover the 5 deferred units, plus a re-check of the 4 confirmed findings after they are fixed.
