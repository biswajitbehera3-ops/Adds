# Findings detail (confirmed medium and above)

Paths are relative to `salon-mobile/`. Every reproduction ran only inside the run's sandbox, with dummy data.

## Backup restore replaces the owner password and all state from an untrusted file with no content validation or re-authentication

`salon-mobile:readBackup:restore-no-content-validation` · severity **medium** (likelihood low, impact high) · confidence high

'Restore from a backup' in the owner menu accepts any file the owner picks (document picker allows '*/*'). readBackup checks only that the JSON has kind 'salon-backup' and an object data, and after migrate() that customers/visits/staff are arrays and owner is truthy. migrate() casts version-4 input to Data with no field validation, and restoreBackup() makes it the live, persisted store, replacing owner.secret, wallet balances, catalog prices and misuse-check limits. There is no owner password prompt after the confirm dialog. Anyone who gets the owner to restore a crafted 'backup' (sent over WhatsApp, Drive or email) can set the owner credential to a password they know, set arbitrary balances and prices, and raise checks.walletCodeAbove so the customer WhatsApp-code gate never fires: values saveService and saveCheckSettings reject on the normal write path.

**Root cause.** readBackup (src/domain/checks.ts:178-189) performs only top-level shape checks and delegates to migrate (src/domain/engine.ts:78-100), which casts untrusted input to Data with no field or range validation; restoreBackup (src/domain/store.ts:85-90) commits it as authoritative persisted state, including owner.secret, without re-authorization.

**Intended behaviour.** An imported backup is untrusted: its contents must be validated against the engine's write-path invariants, and replacing the owner credential or applying a backup should require the current owner password; otherwise the device's existing owner.secret is kept.

**Trace**

1. `src/platform/share.ts:49` (entrypoint, pickTextFile): DocumentPicker accepts any file type ('*/*'); the function returns its text.
2. `src/screens/owner/Guard.tsx:332` (propagation, readBackupFile): Picked text passed to K.readBackup; apply() calls restoreBackup(data) (line 333).
3. `src/domain/checks.ts:186` (propagation, readBackup): Only kind === 'salon-backup' and object data checked before migrate(); line 188 checks only array-ness and owner truthiness.
4. `src/domain/engine.ts:81` (propagation, migrate): Version-4 input spread and cast to Data with no field validation.
5. `src/domain/store.ts:86` (sink, restoreBackup): state = data: attacker-controlled Data including owner.secret, checks and catalog becomes the live store and is persisted.

**Evidence**

- `src/platform/share.ts:49`: DocumentPicker type list includes '*/*'.
- `src/domain/checks.ts:186`: Only kind and object data checked before migrate.
- `src/domain/checks.ts:188`: After migrate only array-ness and owner truthiness checked.
- `src/domain/engine.ts:81`: migrate returns version-4 raw input cast as Data.
- `src/domain/store.ts:86`: restoreBackup assigns state = data and persists it.
- `src/screens/owner/Live.tsx:588`: Restore confirm calls pending?.apply() with no owner password re-prompt.
- `src/domain/checks.ts:95`: saveCheckSettings rejects walletCodeAbove > 100000; the restore path skips this.
- `src/screens/Login.tsx:178`: Owner login verifies against data.owner.secret, so a restored secret becomes the owner credential.

**Who and what.** A non-owner (a staff member or anyone who can hand the owner a file) who cannot otherwise set the owner password or change check limits.

**Conditions**

- authorization_role: Reached from the owner menu: an owner session, or an unlocked phone with an owner session (sessions never expire).
- user_interaction: The owner must pick the attacker-supplied file and tap Restore in the confirm dialog (social engineering).
- data_state: The file is valid salon-backup JSON (version 4) with an attacker-chosen owner.secret and out-of-range values.

**Local reproduction (dummy data, sandbox)**

- Input: `{"kind":"salon-backup","savedAt":"2026-01-01T00:00:00.000Z","data":{"version":4,"customers":[{"id":"c1","name":"x","phone":"","walletBalance":-999999,"createdAt":"2020-01-01T00:00:00.000Z","deletedAt":null}],"visits":[],"walletTxs":[],"reminders":[],"staff":[],"attendance":[],"appointments":[],"leaves":[],"privacyLog":[],"owner":{"secret":{"salt":"dummysalt","hash":"7773b99b71cbf96ad33f13d0fe3fcdd`
1. Write a vitest file importing readBackup and saveCheckSettings from src/domain/checks.ts, checkSettings from src/domain/engine.ts and checkSecret from src/domain/auth.ts, with a node:crypto SHA-256 hasher.
2. Call readBackup on the payload (owner hash = SHA-256('dummysalt' + 'dummypw')).
3. Check checkSecret(d.owner.secret, 'dummypw') is true, checkSettings(d).walletCodeAbove is 99999999, and walletBalance -999999 and price -5 are kept; contrast with saveCheckSettings rejecting walletCodeAbove 99999999.
4. Run in the sandbox (agents/v5-restore/artifacts/check1.txt). restoreBackup itself was not executed (AsyncStorage dependency); source shows it assigns the returned Data directly.

**Observed.** readBackup returned Data with no error; the restored owner.secret accepts 'dummypw' (checkSecret true); walletCodeAbove 99999999, walletBalance -999999 and price -5 kept; saveCheckSettings rejects the same walletCodeAbove with 'Wallet code limit must be ₹0 to ₹1,00,000'.

**Fix.** Treat the backup as untrusted: after migrate, validate every field against the engine's write-path invariants and reject the whole file on any violation (ranges, enums, phones, balances consistent with the ledger, prices within saveService bounds, check limits within saveCheckSettings bounds, photoKeys matching a safe basename). Require the current owner password before applying a restore, and keep the device's existing owner.secret unless the owner re-authenticates with the backup's password.

`src/domain/checks.ts`:

```ts
In readBackup, after migrate(): call validateData(d), reusing saveService and saveCheckSettings range rules, checking walletBalance against the walletTxs sum, enums and phones, and requiring photoKey to match /^[A-Za-z0-9._-]+$/; throw UserError on any violation.
```

`src/screens/owner/Guard.tsx`:

```ts
Before apply(): require checkSecret(getData().owner.secret, enteredPassword); call restoreBackup({ ...data, owner: getData().owner }) unless the owner also proves knowledge of the backup's password.
```


## Staff can undo a paid bill long after the 2-minute window by setting the phone clock back, and the undo is missing from the owner's checks for the real day

`salon-mobile:src/domain/engine.ts:canStaffUndo:no-lower-bound-clock-rollback` · severity **medium** (likelihood low, impact medium) · confidence high

canStaffUndo only tests now - paidAt <= undoWindowMinutes with no lower bound, and voidVisit has no clock-behind refusal (markAttendance has one). On the Receipt screen, which re-reads the device clock every second, a clock set earlier than paidAt makes undoLeft exceed 120 s so the Undo button shows again, and voidVisit accepts a staff void. The visit becomes VOID with voidedAt from the rolled-back clock; the owner's checks for the real day (filtered by dayOf(voidedAt)) do not list the undo, and that day's expectedCash no longer counts the cash bill.

**Root cause.** The undo-window check trusts the device clock and accepts negative elapsed time (engine.ts:593); voidVisit lacks the latestRecordTime clock-behind guard markAttendance uses (engine.ts:1336); voidedAt comes from the same rolled-back clock (engine.ts:612, 633).

**Intended behaviour.** Staff may undo a bill only within undoWindowMinutes after payment; later reversals need the owner, and every staff undo appears in the owner's checks for the day it happened.

**Trace**

1. `src/screens/Visit.tsx:295` (entrypoint, Receipt undoLeft): undoLeft = 120 - elapsed seconds with now refreshed every second (lines 280-282); with the clock behind paidAt, elapsed is negative and the Undo button (line 358) renders.
2. `src/screens/Visit.tsx:308` (propagation, Receipt.undo): Calls E.voidVisit with by 'staff' and the device clock.
3. `src/domain/engine.ts:593` (propagation, canStaffUndo): now - paidAt <= window is true for any now earlier than paidAt.
4. `src/domain/engine.ts:609` (sink, voidVisit): Staff window check passes; visit written VOID with voidedAt = rolled-back now (line 633).

**Evidence**

- `src/domain/engine.ts:593`: No check that now >= paidAt.
- `src/domain/engine.ts:1336`: markAttendance refuses a clock more than 5 minutes behind latestRecordTime; voidVisit has no such check.
- `src/domain/checks.ts:131`: Owner's undo check lists only voids whose voidedAt falls on the checked day.
- `src/domain/checks.ts:104`: expectedCash counts only PAID cash bills, so the voided cash bill drops out of drawer reconciliation.

**Who and what.** A stylist who took cash and wants to erase the bill after the customer has left.

**Conditions**

- authorization_role: A logged-in staff session on the salon phone.
- user_interaction: The Receipt screen (reached only via nav.replace after checkout, Visit.tsx:82) is still open, and the staff member changes the phone date/time.
- system_configuration: The device allows manual date/time changes.

**Local reproduction (dummy data, sandbox)**

- Input: `addStaff + createCustomer(t0=2026-10-26T05:30Z); startVisit+checkoutVisit at 2026-10-26T06:00Z (CASH, total 300); voidVisit(by staff) at paidAt+30min -> refused; voidVisit(by staff) at paidAt-24h -> accepted; ownerChecks at paidAt+1h and at paidAt-24h`
1. In the approved sandbox run vitest on a test importing src/domain/engine, src/domain/checks and src/domain/types with dummy data.
2. Read the V4 lines in agents/v4-staff-undo-clock/artifacts/check1.txt.

**Observed.** +30 min: 'Undo is only possible for 2 minutes. Ask the owner to void it.' Clock 24 h behind: canStaffUndo true while latestRecordTime is 2026-10-26T06:00Z; voidVisit returned VOID with voidedAt 2026-10-25T06:00:00.000Z, voidedBy the staff member; ownerChecks for the real day showed 0 undo items, the backdated day showed 1; the VOID record stays in visit history.

**Fix.** Require 0 <= now - paidAt <= window in canStaffUndo; in voidVisit refuse staff voids when now is behind latestRecordTime(data) by more than 5 minutes (as markAttendance). Add regression tests for a clock behind paidAt and behind the latest record.

`src/domain/engine.ts`:

```ts
export function canStaffUndo(visit: Visit, now = new Date()): boolean {
  if (visit.status !== "PAID" || !visit.paidAt) return false;
  const elapsed = now.getTime() - new Date(visit.paidAt).getTime();
  return elapsed >= 0 && elapsed <= config.undoWindowMinutes * 60 * 1000;
}
// in voidVisit, before the window check:
if (input.by === "staff" && now.getTime() < latestRecordTime(data) - 5 * 60000) {
  throw new UserError("This phone's clock is behind. Set the date and time to automatic, then try again.");
}
```


## A load error makes the app overwrite real salon data with demo data whose owner password is the public 'owner1234'

`salon-mobile:store.ts:loadStore:catch-demo-fallback-overwrites-real-data` · severity **medium** (likelihood low, impact high) · confidence high

loadStore() reads salon:data:v1, migrates, purges, applies the catalog, calls persist() (a 150 ms timer that later serializes the module-level state), and only then parses salon:session, all inside one try. Any exception reaches a catch that sets state = buildDemoData() and does not clear the pending timer. If the session parse throws, the timer writes the demo dataset over the real salon:data:v1 with no user action. If the data read, parse or migrate throws, the stored value is left alone at first but demo data is in memory and the first commit() persists it. Either way the device's only copy of customers, wallet balances, ledger, visits and staff accounts is replaced, and the owner secret becomes the demo secret for 'owner1234', which Login shows on screen while data.demo is true. There is no error screen or recovery path.

**Root cause.** loadStore's single try/catch fails open to buildDemoData(), a dataset with a hardcoded, publicly displayed owner credential; it does not cancel the persist() timer scheduled earlier in the same try and does not block later persists.

**Intended behaviour.** An unreadable session only signs the user out; an unreadable or unmigratable data blob stops at a recovery screen, leaves the stored value byte-identical, and never puts demo data or demo credentials into memory or storage.

**Trace**

1. `App.tsx:157` (entrypoint, App useEffect): loadStore() runs on every app start
2. `src/domain/store.ts:35` (propagation, loadStore): getItem(salon:data:v1) then JSON.parse/migrate (line 36) inside the try; a throw here reaches the catch before persist()
3. `src/domain/store.ts:42` (propagation, loadStore): persist() schedules a 150 ms timer that serializes the module-level state when it fires
4. `src/domain/store.ts:44` (propagation, loadStore): JSON.parse(rawSession) throws on a malformed salon:session; shares the data-load try
5. `src/domain/store.ts:47` (propagation, loadStore catch): state = buildDemoData(); saveTimer not cleared; persistence not blocked
6. `src/domain/store.ts:29` (sink, persist timer): AsyncStorage.setItem(KEY, JSON.stringify(state)) writes the demo dataset over the real salon:data:v1

**Evidence**

- `src/domain/store.ts:45`: catch logs 'starting with demo data' and swaps in demo state for any exception, with no persistence guard
- `src/domain/store.ts:55`: commit() persists in-memory state, so the throw-before-persist variant is written on the first action
- `src/domain/seed.ts:15`: OWNER_SECRET with fixed salt demosalt0123456789abcdef matches DEMO_OWNER_PASSWORD 'owner1234' (seed.ts:12); buildDemoData sets it and demo:true (seed.ts:211)
- `src/screens/Login.tsx:227`: While data.demo (line 225) Login displays the demo owner and staff passwords; Login.tsx:178 accepts them

**Who and what.** No attacker is needed to destroy the data; afterwards whoever holds the phone (e.g. a stylist) can sign in as owner with the on-screen owner1234.

**Conditions**

- data_state: salon:session holds a value JSON.parse rejects, or reading/parsing/migrating salon:data:v1 throws (storage read failure, corrupted or unexpected stored data, or control of the web build's localStorage or host db mirror). On native setSession always writes valid JSON, so the session variant needs storage corruption, an interrupted write or an external writer.
- user_interaction: None for the session-parse variant; the data-read variant overwrites storage on the first commit, and demo credentials are accepted immediately in memory.

**Local reproduction (dummy data, sandbox)**

- Input: `salon:data:v1 = JSON of emptyData() with owner.secret = makeSecret('RealOwnerPw!'); salon:session = '{not json'`
- Input: `salon:data:v1 = same real store; AsyncStorage.getItem('salon:data:v1') rejects with Error('simulated read failure')`
1. In the approved sandbox, alias @react-native-async-storage/async-storage to an in-memory fake and mock deletePhotos.
2. Case B: seed the real store, set salon:session to '{not json', call loadStore(), wait 400 ms, read salon:data:v1 back, test 'owner1234' and 'RealOwnerPw!' with checkSecret.
3. Case A: make getItem(salon:data:v1) reject, call loadStore(), wait 400 ms, confirm storage untouched while getData() is demo; then one no-op commit(), wait 400 ms, read salon:data:v1 back.

**Observed.** Case B: console 'Could not load saved data; starting with demo data SyntaxError...'; with no user action stored salon:data:v1 had demo=true, 3 staff, 24 customers; owner1234 accepted, real password rejected. Case A: stored value untouched before any commit with owner1234 accepted in memory; after one commit stored salon:data:v1 was demo=true and the real password rejected (agents/v1-demo-fallback/artifacts/check1.txt).

**Fix.** Fail closed: parse the session in its own try and only drop the session on failure; on any data load/parse/migrate failure clear saveTimer, set a loadFailed flag that makes persist() a no-op, keep the stored value, and show a recovery screen (retry or restore a backup) instead of buildDemoData(); move persist() after all fallible steps.

`src/domain/store.ts`:

```ts
let loadFailed = false;
function persist() {
  if (loadFailed) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch((e) => console.warn("Could not save data", e));
  }, 150);
}

export async function loadStore(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    let next = raw ? migrate(JSON.parse(raw)) : buildDemoData();
    const purged = purgeExpired(next);
    next = purged.data;
    applyCatalog(next);
    state = next;
    deletePhotos(purged.result.photoKeys).catch(() => {});
    persist();
  } catch (e) {
    console.warn("Could not load saved data", e);
    if (saveTimer) clearTimeout(saveTimer);
    loadFailed = true;
  }
  try {
    const rawSession = await AsyncStorage.getItem(SESSION_KEY);
    session = rawSession && !loadFailed ? (JSON.parse(rawSession) as Session) : null;
  } catch {
    session = null;
    AsyncStorage.removeItem(SESSION_KEY).catch(() => {});
  }
  ready = true;
  emit();
}
```

