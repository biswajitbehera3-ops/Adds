# Needs validation

Leads with a complete source trace whose deciding fact can only be seen on a real phone. They have no severity and are not confirmed problems.

## Restored backup photoKey is joined unconfined into the native retention-delete path (traversal within the app's own storage)

`salon-mobile:deletePhotos:photoKey-path-join-unsanitized`

deletePhotos (src/platform/photos.ts:74) on native calls FileSystem.deleteAsync(`${DIR}${key}.jpg`) with DIR = documentDirectory + 'attendance/' (photos.ts:10) and no confinement of key. readBackup/migrate never validate attendance photoKey values and restoreBackup stores them as given. On the next start loadStore runs purgeExpired, which queues any photoKey whose checkInAt is older than the retention cutoff (engine.ts:941-943), then calls deletePhotos. A sandboxed run showed the exact deleteAsync arguments, e.g. 'file:///data/user/0/com.dummy/files/attendance/../dummy-sibling.jpg' (agents/v6-photokey/artifacts/check1.txt). The bundled expo-file-system 57.0.7 native source confines deletes only to app-writable locations, not to attendance/ (agents/v6-photokey/artifacts/check2.txt), so the likely reach is any app-writable file in the app's own sandbox; on Android a '#' or '?' in the key may also cut off the '.jpg' suffix. The OS sandbox limits the effect to the app's own container, and the file supplier's restore already replaces all app data, so the extra impact is deleting other app-private files.

**Claimed root cause.** src/platform/photos.ts:74 interpolates a stored photoKey into a native filesystem path with no containment check; restore never validates photoKey (checks.ts:178-189, engine.ts:78-100); purgeExpired (engine.ts:941-943) passes restored expired photoKeys to deletePhotos on every startup (store.ts:36-40).

**Trace**

1. `src/domain/checks.ts:187` (entrypoint, readBackup): Owner-selected backup data passes migrate() with shape checks only; attendance[].photoKey accepted verbatim.
2. `src/domain/store.ts:86` (propagation, restoreBackup): Restored data replaces state unchanged and is persisted.
3. `src/domain/store.ts:38` (propagation, loadStore): purgeExpired runs over stored data on every app start.
4. `src/domain/engine.ts:942` (propagation, purgeExpired): photoKey with checkInAt older than the cutoff pushed to photoKeys unchanged.
5. `src/domain/store.ts:40` (propagation, loadStore): deletePhotos(purged.result.photoKeys) called.
6. `src/platform/photos.ts:74` (sink, deletePhotos): Native branch calls FileSystem.deleteAsync(`${DIR}${key}.jpg`, { idempotent: true }) with no containment check.

**Evidence**

- `src/platform/photos.ts:10`: DIR = (FileSystem.documentDirectory ?? '') + 'attendance/'.
- `src/platform/photos.ts:74`: key interpolated directly into the deleteAsync URI; errors swallowed.
- `src/domain/checks.ts:188`: readBackup only checks array-ness and owner; no per-field validation of attendance.
- `src/domain/store.ts:85`: restoreBackup assigns the parsed backup to state without validation.
- `src/domain/engine.ts:942`: purgeExpired pushes a.photoKey when checkInAt < cutoff.
- `src/domain/store.ts:40`: loadStore calls deletePhotos on the purged keys at startup.
- `src/screens/owner/Guard.tsx:332`: Owner restore UI parses the chosen file with readBackup and applies it via restoreBackup (line 333).

**What blocks a verdict**

- Runtime behaviour on a native build is undecided: whether Android Uri.parse/File and iOS URL/FileManager resolve 'attendance/../X.jpg' (and a '#'/'?'-truncated path on Android) to a real file and delete it needs an Android or iOS build; no emulator or device toolchain is available.
- android/ and ios/ are not in the repo, so the shipped build's expo-file-system version and any FilePermissionService override cannot be confirmed from source.

**Next step on a test build:** On an isolated emulator/simulator debug build with dummy data only: create <documentDirectory>/dummy-sibling.jpg; restore a backup whose attendance contains {id:'a1',staffId:'s1',date:'2020-01-01',checkInAt:'2020-01-01T00:00:00.000Z',photoKey:'../dummy-sibling'}; restart the app; check whether dummy-sibling.jpg still exists. Stop at the first observed deletion.

**Owner check on a test phone:** Owner-observed on a personal test device only: confirm the expo-file-system version in the shipped native build and whether FilePermissionService is unmodified, then run the local fixture above with a dummy file and report whether the file outside attendance/ was removed.

## The WhatsApp confirmation code goes to the same staff member it is meant to check, so big wallet spends and referral sign-ups could be self-approved

`salon-mobile:src/components/Guards.tsx:WhatsAppCode:code-visible-to-verifier`

Wallet spends above walletCodeAbove (default Rs500) and referral sign-ups need the customer to prove they own the phone number. The WhatsAppCode component on the staff member's own phone makes a 4-digit code with Math.random (Guards.tsx:20,24) and opens a wa.me link on that same phone with 'Your code is NNNN...' URL-encoded into ?text= (Guards.tsx:35, engine.ts:799). If WhatsApp shows that pre-filled text in the sender's compose box, a staff member can tap 'Send code on WhatsApp', read the code, go back without sending and type it in. Typed digits are checked only in the component (Guards.tsx:66) with no attempt counter, and the code is stable per phone and purpose. The engine receives only a boolean (walletCodeOk, referralVerified) and trusts it (engine.ts:539, 197). Locally: the opened URL contains the code; checkoutVisit rejects a Rs1500 wallet spend without the boolean and accepts it with walletCodeOk:true and no code; createCustomer links a referrer on referralVerified:true alone.

**Claimed root cause.** The verification secret is made and checked on the verifier's own device and placed in the pre-filled outbound wa.me message that device opens; the check is an in-component comparison with no attempt limit; the engine accepts a caller-supplied boolean instead of evidence.

**Trace**

1. `src/screens/Visit.tsx:205` (entrypoint, Visit (staff screen)): Above walletCodeAbove the staff visit screen shows WhatsAppCode for the customer's phone; Counter.tsx:188 does the same for referrals.
2. `src/components/Guards.tsx:24` (propagation, WhatsAppCode): Code made with Math.random on the staff phone, memoised on phone+purpose.
3. `src/components/Guards.tsx:35` (propagation, WhatsAppCode.send): Code placed in plain text in the message passed to Linking.openURL(E.whatsappLink(...)) on the same phone.
4. `src/domain/engine.ts:799` (propagation, whatsappLink): Message URL-encoded into wa.me ?text=, which pre-fills the compose box.
5. `src/components/Guards.tsx:66` (propagation, WhatsAppCode onChangeText): Typed digits compared in the component; a match calls onVerified(true); no attempt limit.
6. `src/screens/Visit.tsx:81` (propagation, Visit.collect): Only needsCode && walletOk is passed to the engine as walletCodeOk.
7. `src/domain/engine.ts:539` (sink, checkoutVisit): Wallet spend above walletCodeAbove allowed on input.walletCodeOk alone; referral path same at engine.ts:197.

**Evidence**

- `src/components/Guards.tsx:35`: Message 'Your code is ${code}...' opened via wa.me on the staff phone; local check: URL text contains the code (agents/v2-whatsapp-code/artifacts/check1.txt).
- `src/components/Guards.tsx:66`: In-component comparison with no attempt counter or lockout.
- `src/domain/engine.ts:539`: Engine checks only walletCodeOk; local check: Rs1500 spend throws without it and succeeds with it (balance 2200 -> 700).
- `src/domain/engine.ts:197`: createCustomer checks only referralVerified before linking the referrer; local check confirms.

**What blocks a verdict**

- Whether WhatsApp (third-party app) shows the wa.me ?text= pre-fill, code included, in the sender's compose box before sending is outside the repository and cannot be observed in the offline sandbox; locally it is only proven that the code is in the opened URL. Manual guessing of up to 9,000 codes is source-visible but its practical likelihood cannot be shown without a device.

**Next step on a test build:** Run the vitest harness behind agents/v2-whatsapp-code/artifacts/check1.txt in the sandbox: V1 whatsappLink text contains the code; V2 checkoutVisit Rs1500 wallet spend throws without walletCodeOk and succeeds with it; V3 createCustomer links the referrer only with referralVerified.

**Owner check on a test phone:** On the salon's own phone with a dummy customer number the owner controls and a small dummy wallet above Rs500: log in as staff, open a visit with wallet payment above Rs500, tap 'Send code on WhatsApp', note whether the compose box shows 'Your code is NNNN', press back without sending, confirm no message arrived, type NNNN and see whether 'Collect' enables; stop before collecting. Repeat on the Counter referral flow, stopping before 'Add customer'.
