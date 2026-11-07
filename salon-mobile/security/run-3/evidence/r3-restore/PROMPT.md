You are a security hunter in a defensive, source-first audit (scoped run 3: re-check of fixed code). Your goal is to find source-grounded security invariant failures in your assigned coverage units, and you must return exactly one JSON object matching the structured-result contract at the end of this prompt.

TARGET: /home/user/Adds/salon-mobile. All file paths you report are relative to that directory. Never edit anything outside your scratch directory.

## 1. Architecture (verbatim)

# Architecture (salon-mobile, run 3, scoped re-check of fixed code, commit 1fe98d0)

1. **Product and principals.** One-salon Expo/React Native app, no server; all data in AsyncStorage on the device (`salon:data:v1`, `salon:session`, and since run 3 `salon:owner`, a copy of the owner secret). Web preview mirrors AsyncStorage to localStorage. Principals: **owner** (owner password), **stylists/staff** (mobile + password; shared salon phone or own phone), **customers**, the **supplier of a restored backup file**. Role comes only from the session (App.tsx); engine functions take no role. The phone's clock is under the holder's control.
2. **What changed since run 2 (the fixes under re-check).** See SECURITY-LESSONS.md in the target for the full list with locations. Key controls:
   - Clock: `latestRecordTime` (engine.ts:64) over every saved timestamp; `assertClockNotBehind` (:84, 5-minute slack) in topUp, startVisit, checkoutVisit, cancelOpenVisit, voidVisit, closeWallet, deleteCustomer, bookAppointment, cancelAppointment, markNoShow, markAttendance, requestLeave, approveLeave, declineLeave, closeDay (checks.ts:115). `observeClock` (:97) runs in every `commit` (store.ts:118) and records back-jumps; sets `hold` when now > max(lastSeen, latestRecordTime) + 30 days; `purgeExpired` (:1006) skips while held; `confirmClock` (:109) clears the hold and is reached only through OwnerApproval (owner password) in owner/Guard.tsx.
   - Undo: `canStaffUndo` (:639) needs 0 <= elapsed <= 2 min.
   - Wallet: `refundableBalance` (:881) replays in order (promo first, reset at CASHOUT/WRITE_OFF).
   - Load: `loadStore` (store.ts:54) uses demo data only when nothing is saved; on error sets `loadFailed` (no persist, commit throws) and reads `salon:owner`; the LoadFailed screen restores only with that owner password (`restoreAfterLoadFailure`, store.ts:106), keeping it.
   - Backup: `readBackup` (checks.ts:214) size cap 20 MB, `backupProblem` (:248) validates every field (ranges, phones, ledger sums, enums, ISO times not >1 day ahead, SAFE_KEY photo names), keeps only known keys, sets demo false, drops clock. `prepareRestore` (:322) keeps this phone's owner secret and clock and re-erases customers deleted in this phone's privacyLog. Owner-menu restore/clear/demo ask the owner password (owner/Live.tsx); owner/Guard.tsx restore applies prepareRestore.
   - Photos: `isSafePhotoKey` in every file call (src/platform/photos.ts).
   - Bookings: cancel/no-show store closedBy/closedAt from `sessionActor()` (store.ts:181); staff cannot cancel after start; ownerChecks (checks.ts:131) lists staff no-shows/late cancels, future-dated attendance, clock back-jumps (7 days), the hold, and each cash count of the last 7 days vs recomputed `expectedCash` (:104, now minus cash wallet refunds).
   - Privacy: referral notes no longer carry names (`REFERRAL_NOTE`); `erase` rewrites older notes naming the erased customer.
   - WhatsApp code: 3 wrong tries then a new code (components/Guards.tsx).
3. **Comparable baseline.** Server-backed salon software with server time and per-user audit trails. Calibration only.
4. **Trust boundaries.** Staff vs owner: UI gating plus owner-password prompts (no engine role check: accepted residual). Staff vs owner checks: device clock, now with back-jump tracking. Backup file vs phone: readBackup + prepareRestore. Unreadable data vs recovery: owner-secret mirror.


## 2. Assigned coverage units (from coverage-ledger.json)

Focus for this group: load failure, the owner-secret mirror and recovery restore, readBackup/backupProblem completeness, prepareRestore, owner-menu restore, photo key confinement, and anything else in the repository the fixes touched (wildcard). Can a crafted file still change the owner secret, inject unsafe state, resurrect erased data, or set a hold/clock? Can a staff member reach the recovery restore or a restore without the owner password? Does the mirror ever hold a stale or attacker-chosen secret?

[
 {
  "coverage_id": "src%2Fplatform%2Fshare.ts%23pickTextFile::src%2Fdomain%2Fchecks.ts%23readBackup::profile%2Fquick%2Fall-in-scope-subsystems::ATTACK-CLASSES.md%23Feature%20abuse%20and%20data%20leakage",
  "surface": "Backup restore file",
  "boundary": "Backup integrity and owner secret",
  "subsystem": "All in-scope subsystems (quick)",
  "attack_class": "Feature abuse and data leakage",
  "starting_paths": [
   "src/platform/share.ts",
   "src/domain/checks.ts",
   "src/domain/store.ts",
   "src/domain/engine.ts",
   "src/screens/owner/Guard.tsx",
   "src/screens/owner/Live.tsx"
  ],
  "prior_status": "prior_confirmed_changed_source"
 },
 {
  "coverage_id": "src%2Fdomain%2Fstore.ts%23restoreBackup::src%2Fdomain%2Fengine.ts%23deleteCustomer::profile%2Fquick%2Fall-in-scope-subsystems::ATTACK-CLASSES.md%23Feature%20abuse%20and%20data%20leakage",
  "surface": "Owner backup restore after a customer erasure",
  "boundary": "Erasure durability across backup/restore",
  "subsystem": "All in-scope subsystems (quick)",
  "attack_class": "Feature abuse and data leakage",
  "starting_paths": [
   "src/domain/store.ts",
   "src/domain/checks.ts",
   "src/screens/owner/Guard.tsx",
   "src/screens/owner/Live.tsx",
   "src/domain/engine.ts",
   "legal/privacy-policy.md",
   "legal/data-deletion-request.md"
  ],
  "prior_status": "prior_deferred"
 },
 {
  "coverage_id": "src%2Fplatform%2Fphotos.ts%23deletePhotos::src%2Fplatform%2Fphotos.ts%23DIR::profile%2Fquick%2Fall-in-scope-subsystems::ATTACK-CLASSES.md%23Resource%20and%20file%20handling",
  "surface": "Attendance selfie storage and retention purge",
  "boundary": "Photo path confinement and deletion lifecycle",
  "subsystem": "All in-scope subsystems (quick)",
  "attack_class": "Resource and file handling",
  "starting_paths": [
   "src/platform/photos.ts",
   "src/domain/engine.ts",
   "src/domain/store.ts",
   "src/screens/Attendance.tsx"
  ],
  "prior_status": "prior_confirmed_changed_source"
 },
 {
  "coverage_id": "salon-mobile%23repository::salon-mobile%23repository::profile%2Fquick%2Fall-in-scope-subsystems::ATTACK-CLASSES.md%23Wildcard",
  "surface": "Whole repository, uncategorised",
  "boundary": "Anything outside the assigned classes",
  "subsystem": "All in-scope subsystems (quick)",
  "attack_class": "Wildcard",
  "starting_paths": [
   "src",
   "scripts",
   "App.tsx"
  ],
  "prior_status": "prior_confirmed_changed_source"
 }
]

## 3. Selected blocks (verbatim)

### ATTACK-CLASSES.md#Feature abuse and data leakage

**Feature abuse and data leakage** (subagent_type: `general`)
Legitimate features used for unintended purposes. Look for bugs in the design, not only in the code:
- **Export/backup as exfiltration**: Can a low-privilege user trigger an export, snapshot, or backup that includes data above their access level? Can they export other users' data? Does the export include deleted/draft/private content? Revision history that was supposed to be pruned?
- **Import/restore as injection**: Can import overwrite existing data? Can it create records that bypass normal validation? Can it inject content into collections the user has no write access to? Does it respect the same permission model as the UI?
- **Search/filter/sort as oracle**: Can search queries reveal whether content exists that the user cannot directly access? Do filter parameters let users probe statuses, roles, or fields they should not know about? Does sorting by a hidden field reveal its values through result ordering?
- **Enumeration through side effects**: Do error messages differ between "does not exist" and "no access"? Do response times differ? Response sizes? HTTP status codes? Can you enumerate users through password reset, invite, or registration flows?
- **Preview/draft/staging leakage**: Are preview tokens scoped to one item or do they unlock broader access? Can draft content be discovered through search, RSS feeds, sitemaps, or API listing endpoints? Can cache headers cause a CDN to serve private content publicly?
- **Notification/webhook as SSRF**: Can a user set a notification URL, webhook URL, or callback URL that the server fetches? Is it validated against internal networks? What about after a redirect?

### DATA-ISOLATION-AND-LIFECYCLE.md#Core discipline

## Core discipline (include in every agent prompt for this domain)

```
- A tenant or owner field on a record is not isolation. Find the query, key, path, policy, or row-level control that enforces it for each read and write path.
- Trace derived copies. Sanitized primary data can become unsafe in search, cache, analytics, export, previews, logs, replicas, and backups with different ACL and retention rules.
- Deletion and revocation are lifecycle contracts. Check current, historical, cached, indexed, exported, restored, and queued copies within the product's stated boundary.
- Privacy or retention preference is not automatically a security vulnerability. Require an explicit data-access boundary or deletion/revocation guarantee and an unauthorized reader or later operation.
- Use `confirmed` for complete source-visible lineage and bounded dummy-tenant tests. Use `needs_validation` when external storage policy, retention, CDN behavior, replica lag, or backup access is unavailable.
```

### DATA-ISOLATION-AND-LIFECYCLE.md#Universal moves

## Universal moves (apply across the above)

- Pick one protected record and draw primary write, query, cache, index, event, export, backup, deletion, and restore paths. Mark principal and tenant at every edge.
- Compare two dummy tenants through the same local service methods, then repeat after ACL change, deletion, account switch, and restore. Do not use real user data.
- Start at bypass clients, background jobs, migrations, global uniqueness, and cache keys. These paths commonly omit request-scoped identity that interactive endpoints carry.

### DATA-ISOLATION-AND-LIFECYCLE.md#Validation rules

## Validation rules (apply before reporting ANY finding here)

1. Name attacker or lower-trust principal, protected data/state, affected owner/tenant, alternate copy or operation, and unauthorized disclosure or mutation.
2. Cite both intended source-of-truth policy and the path that omits or disagrees with it. Confirm another layer does not enforce the same tenant/lifecycle condition.
3. Use local dummy tenants and non-sensitive fixtures to prove cross-scope access or stale lifecycle behavior. Stop at the minimum observable record or operation.
4. If external cache, object storage, replicas, analytics, backup, or retention policy is required, classify `needs_validation` and state the owner-observed check.
5. Return `confirmed` only with complete lineage and concrete boundary impact. Return `needs_validation` with the exact unresolved storage, ACL, invalidation, retention, or restore fact.

### DATA-ISOLATION-AND-LIFECYCLE.md#Import and restore authority expansion

**Import and restore authority expansion**
Restore/import bypasses owner, schema, ACL, uniqueness, or validation rules, overwrites existing resources, or recreates records in a tenant the requester cannot write. Validate archive contents as untrusted and authorize the resulting operation rather than trusting prior provenance.

### DATA-ISOLATION-AND-LIFECYCLE.md#Restore reintroduces invalid state

**Restore reintroduces invalid state**
Backup, undo, undelete, or replica recovery restores data, credentials, memberships, or permissions that current policy no longer allows. Re-authorize restored state and reapply lifecycle changes made after the snapshot.

### DESKTOP-MOBILE-AND-LOCAL-IPC.md#Core discipline

## Core discipline (include in every agent prompt for this domain)

```
- Establish the realistic local or remote-content attacker: another app, another OS user, a sandboxed child, an untrusted document, or a remote origin. Self-harm within the same account and authority is not a boundary violation.
- Paths, process names, bundle/package IDs, and claimed sender fields are not peer authentication. Use OS peer credentials, code identity, capability handles, or protected channel state.
- The native bridge or helper must authorize each operation and final resource after parsing. A trusted UI or broker does not make attacker-influenceable arguments trusted.
- OS sandbox, signing, entitlements, permissions, keychain ACLs, exported-component policy, and prompt behavior are real controls when pinned and visible.
- Use `confirmed` for source evidence plus bounded local/emulator tests. Use `needs_validation` when signing, manifest merge, OS version, device policy, installer ACL, or packaging is required but not observable.
```

### DESKTOP-MOBILE-AND-LOCAL-IPC.md#Universal moves

## Universal moves (apply across the above)

- Enumerate every process, app component, local endpoint, URI scheme, file association, webview origin, and helper. Record OS identity, runtime privilege, caller, and callable operation.
- Read final packaging inputs: merged manifest, entitlements, installer rules, native-messaging registration, protocol handlers, and ACL creation. Source declarations can be overwritten downstream.
- Validate with dummy profiles and non-sensitive local fixtures on an isolated machine/emulator. Do not interact with other users' apps, credentials, or production services.

### DESKTOP-MOBILE-AND-LOCAL-IPC.md#Validation rules

## Validation rules (apply before reporting ANY finding here)

1. Name the attacker starting capability, OS/app principal crossed, entry channel, accepted argument or state, and unauthorized operation or disclosure.
2. Confirm OS sandbox, peer credential, signing, entitlement, permission, user-consent, and installer controls that apply. Unknown packaging/runtime facts require `needs_validation`.
3. For webview bridges, cite both navigation/origin control and privileged native sink. For IPC, cite peer authentication and per-resource authorization. For helpers, verify final normalized destination.
4. Keep local tests bounded and use dummy content/accounts. Stop after proving the boundary result; do not extend proof into persistence or broader system modification.
5. Return `confirmed` only with a complete source and local evidence chain. Return `needs_validation` with the exact OS, manifest, signing, ACL, or device-lifecycle fact required.

### DESKTOP-MOBILE-AND-LOCAL-IPC.md#File-open and intent authority confusion

**File-open and intent authority confusion**
An associated file, share intent, drag/drop item, pasteboard/clipboard record, notification action, or open-file event triggers a privileged operation without confirming content type, sender trust where applicable, current user intent, and final target.

### DATA-ISOLATION-AND-LIFECYCLE.md#Retention and queued-work overrun

**Retention and queued-work overrun**
Deletion completes in primary storage while queued processors, retries, exports, analytics, or generated artifacts recreate or retain the data beyond the promised boundary. Find idempotent deletion and tombstone propagation.

### ATTACK-CLASSES.md#Resource and file handling

**Resource and file handling** (subagent_type: `general`)
- Path traversal (reading/writing outside intended directories) — including through symlinks, encoded sequences, and null bytes
- SSRF (making the application fetch attacker-controlled URLs) — including through redirects, DNS rebinding, and URL parser differentials
- Unsafe deserialization, archive extraction (zip slip), temp file handling
- Memory safety (if applicable): buffer overflows, use-after-free, integer overflow
- Race conditions on file operations (TOCTOU between check and use)

### ATTACK-CLASSES.md#Wildcard

**Wildcard** (subagent_type: `general`)
You are not given a category. Find vulnerabilities outside the standard classes already assigned.

Read code that looks boring or disconnected from security. Follow incomplete, experimental, compatibility, and fallback features, but retain the same concrete boundary and validation requirements as every other class.

Use these starting points, but do not limit yourself to them:
- What is the strangest code in the codebase? Why does it exist? What happens if it is abused?
- Are there any features that feel half-finished, experimental, or bolted on? Those have the weakest security because they got the least review.
- What happens if you use the API in a way the frontend never would? The UI constrains users, but the API does not. What API calls are possible but never made by the client?
- Are there any hidden or undocumented endpoints, parameters, headers, or features? Look at route registrations, middleware, and config for things that are not in the docs.
- What happens when you mix features that were not designed to work together? Localization + preview + caching. Import + plugins + webhooks. OAuth + impersonation + API keys.
- Is there anything interesting in the git history? Reverted security fixes, commented-out auth checks, secrets that were committed then removed (still in history).
- Which valid-account actions affect other users, shared integrity, availability, or operator-owned cost? Verify containment, quotas, authorization, and recovery around those actions.
- Which operations are irreversible or require elevated confirmation? Bind authorization and approval to the final principal, action, and resource.
- What assumptions does the code make about the environment? That the database is local, that the clock is accurate, that DNS is trustworthy, that the filesystem is case-sensitive?
- Look at the test files — what are they **not** testing? Compare the edge cases the developer thought about (tests exist) with the ones they did not (no tests).

Pursue anomalies inside your assigned scope until the invariant is settled. If something looks strange, read it until you can state whether it is safe. If a function has a comment explaining why it is safe, verify the explanation. If a variable is named `temp` or `hack` or `legacy`, read it closely.

## 4. Excluded blocks

WEB-PROTOCOL-AND-AUTH.md, PROTOCOLS-RPC-AND-MESSAGING.md, CLOUD-AND-DEPLOYMENT.md, SUPPLY-CHAIN-AND-RELEASE.md, MEMORY-SAFETY-AND-BINARY.md, AI-AND-LLM.md, RESOURCE-EXHAUSTION-AND-AVAILABILITY.md are excluded (no HTTP server, RPC, cloud config, CI pipeline, native code, model, or shared service). Companion classes not listed in section 3 are excluded because recon found no matching boundary.

## 5. Core hunting method

## Defensive vulnerability-finding method

Your goal is to find source-grounded security invariant failures and the smallest fix,
not to expand harm beyond the boundary result. Stay within source review and bounded local execution.
Do not contact deployed endpoints, provider APIs, registries, identity systems,
message brokers, shared services, or other users. Use local dummy data only.

READ THE CODE AT DEPTH. Follow each assigned input through parsing, identity,
authorization, normalization, state, derived copies, and the final sink. Read sibling,
legacy, batch, retry, cancellation, migration, and error paths that produce the same
effect. Compare sibling controls for equivalence, not only presence, and compare what
one component guarantees with what the next component assumes.

WORK FROM A CONCRETE INVARIANT:
1. Name the lower-trust principal and starting capability.
2. Name the accepted value, action, state transition, or resource selector.
3. Locate the control that should reject, bind, isolate, limit, or revoke it.
4. Trace the exact source path after that decision.
5. Stop at the smallest affected dummy record, wrong return value, process-integrity
   effect, or locally observable shared-resource effect.
6. State a source-level change and regression case that enforce the invariant.

DEPTH BOUND: trace only paths that can reach your assigned boundary or whose
guarantees that boundary relies on. Stop a line of investigation as soon as the
invariant is settled either way, and record the result in your structured output —
a covered, candidate, or blocked disposition, or an `uncovered` entry — instead of
continuing to search.

TEST SAD PATHS AND DISAGREEMENTS. Check absent, empty, zero, negative, maximum,
over-limit, duplicate, mixed encoding, stale, revoked, reordered, concurrent,
partially migrated, failed dependency, and rollback state only where the interface
accepts them. Compare canonicalization and units at every parser or policy handoff.
For multi-step issues, treat each output as a prerequisite and do not assume a later
boundary. If any prerequisite is not established, record a blocker.

When a proposed high or critical candidate reveals a reusable root cause, search paths
owned by the assigned coverage IDs for lexical, structural, and logical variants.
Consolidate the same root cause, but establish each variant's conditions and impact
independently. Do not investigate peer-owned units. Return a variant with no current
coverage unit as `uncovered`.

USE THE NARROWEST LOCAL CHECK THAT SETTLES THE CLAIM. Target-controlled builds,
tests, processes, browsers, emulators, fuzzers, and fixture processing may run only
inside the parent-approved OS-enforced sandbox. It must disable external networking,
start from an empty allowlisted environment, expose target and tools read-only, permit
writes only to your scratch directory, and apply low CPU, memory, process, file-size,
disk, and wall-clock limits. Isolated loopback is allowed only for a local fixture.
If any control is unavailable, do not execute: return needs_validation with that exact
blocker. Prefer an existing unit test, minimal function harness, dummy-tenant service
call, small malformed fixture, deterministic race schedule, or locally rendered policy.
Do not install or fetch tools.

Record the exact input, command, limits, and minimum result. For the environment,
record only allowlisted variable names and safe non-secret values needed to reproduce
the check. Never capture the ambient environment, inherited variables, credentials,
authentication state, or unrelated host paths. The target-controlled process writes
only in scratch. After the sandbox and all its processes terminate, only trusted
parent-side code may promote predeclared scratch-relative files, following the
promotion procedure block included verbatim in this prompt. You and target code never
write retained artifacts. If promotion is unavailable or fails for decisive evidence,
return needs_validation with the exact promotion blocker.
Never stress availability, invoke a live target, use a real credential, publish an
artifact, or continue past the minimum observed effect.

A deployment, browser, provider, broker, OS, proxy, package, secret, or identity fact
outside source is not proof either way. If one such fact is decisive, return a
needs_validation record with the exact missing observation and safe owner-observed check.

Artifact promotion procedure (trusted parent-side code only):
Reference only for you: the parent performs these steps; you never perform them.

Before execution, the parent opens and retains trusted, non-inheritable directory
descriptors for the agent's scratch/ and artifacts/ roots, and records an allowlist
of expected scratch-relative artifact files plus explicit per-file and cumulative
byte limits. Never pass those descriptors to the agent or sandbox. After the sandbox
and all its processes terminate, trusted parent-side code promotes each allowlisted
file separately:

1. Validate the declared relative path: reject absolute, empty, `.`, `..`, or
   symlinked components.
2. Walk each parent component from the retained scratch-root descriptor with
   no-follow directory-relative operations; never reopen by path.
3. Open the leaf no-follow and nonblocking.
4. Verify with `fstat` that it is a regular file with link count exactly one and
   within the recorded per-file and cumulative byte limits.
5. Enforce those limits again while reading from that descriptor.
6. Copy exactly the verified size, repeat `fstat`, and reject a changed identity,
   type, link count, or size.
7. For the destination, walk every parent component from the retained
   artifacts-root descriptor with no-follow directory-relative operations; require
   each existing component to be a real directory, and create any missing directory
   exclusively before reopening and verifying it no-follow.
8. Create the leaf exclusively without following links, verify that the opened
   destination is a regular file with link count exactly one, and copy from the
   verified source descriptor without reopening either path.
9. Use equivalent race-safe APIs on non-POSIX systems.
10. Never recursively copy or glob scratch, extract an archive into artifacts, or
    open or promote a symlink, FIFO, socket, device, directory, hard-linked file,
    changing file, or file that exceeds its bound.
11. If any check is unavailable, cannot be enforced, or fails, discard the scratch
    entry; if it is decisive evidence, retain `needs_validation` with the exact
    promotion blocker.

## 6. Core validation rules

## Candidate gate

1. A candidate needs a complete repository-relative source trace and evidence for the
   claimed root cause, including the strongest source-visible control.
2. A proposed confirmed record needs a bounded local observed result, meaningful impact
   across a stated boundary, complete conditions, and no visible preventing layer.
3. Do not strengthen a crash into code execution, ordinary work into shared availability,
   or a same-principal action into privilege gain.
4. If a required fact is not source-visible or locally observable, use
   needs_validation. Name exact blockers; do not give it severity or speculative completion.
5. A missing best practice with no affected principal/resource is excluded or hardening,
   not a finding. A candidate disproved by source is not needs_validation.
6. Use the same source-derived fingerprint for the same root cause in every state.
   It must match `^[A-Za-z0-9][A-Za-z0-9._:/@+-]*$` and must not include a line,
   wave, agent, severity, or verdict.
7. Return an empty candidate array when nothing survives these gates.


## 7. Prior findings, their fixes, and peers

Run 3 re-checks code whose findings were FIXED on 27 Oct. For each prior root cause in your units: decide whether the fix holds (cite the guarding line), and hunt for bypasses, incomplete fixes, and NEW bugs the fix introduced. A prior root cause that still reproduces at this commit IS reportable (say "fix incomplete" and give the bypass). Accepted residual risks listed below are NOT reportable unless you find a cheaper path than the one documented.

Fixed root causes (verify each fix in your units; bypasses are reportable):
- R1-1 store.ts loadStore demo fallback on read error (fixed: loadFailed, recovery screen, owner mirror).
- R1-2 readBackup accepted any content incl. owner secret (fixed: backupProblem, prepareRestore, owner password on restore).
- R1-3 canStaffUndo accepted negative elapsed time (fixed).
- R1-4 refundableBalance lifetime promo netting (fixed: ordered replay).
- R1-6 photoKey path join (fixed: isSafePhotoKey).
- run-2 #1 purgeExpired with clock far ahead (fixed: observeClock hold).
- run-2 #3 cash bills after the count / backdated (fixed: 7-day recompute; clock guards).
- run-2 #4 booking closure without actor (fixed: closedBy/closedAt, ownerChecks).
- run-2 #5 latestRecordTime partial (fixed).
- run-2 #6 referral note carried erased name (fixed).
- run-2 #7 restore resurrected erased customers (fixed: prepareRestore).

Accepted residual risks (not reportable unless a cheaper path exists):
- R1-5 WhatsApp code is shown in the outbound message on the stylist's own phone (needs a server).
- run-2 #2 a stylist who pre-marks tomorrow's attendance with the clock ahead and does not open the app again leaves only the selfie and the future-dated record flag.
- Owner-only engine functions have no role check (UI gating + every in-app path checked in run 1).
- No login lockout; minimum password length 4; single-round salted SHA-256; sessions never expire.
- A phone whose data cannot be read loses its own privacy log on recovery restore.
- legal build script quote escaping (operator input only).


Peer-owned coverage IDs you must not duplicate:
[
 "src%2Fcomponents%2FGuards.tsx%23WhatsAppCode::src%2Fdomain%2Fengine.ts%23checkoutVisit::profile%2Fquick%2Fall-in-scope-subsystems::ATTACK-CLASSES.md%23Business%20logic",
 "src%2Fdomain%2Fengine.ts%23appointmentArrived::src%2Fdomain%2Fengine.ts%23cancelAppointment::profile%2Fquick%2Fall-in-scope-subsystems::ATTACK-CLASSES.md%23Business%20logic",
 "src%2Fdomain%2Fengine.ts%23checkoutVisit::src%2Fdomain%2Fengine.ts%23voidVisit::profile%2Fquick%2Fall-in-scope-subsystems::ATTACK-CLASSES.md%23Business%20logic",
 "src%2Fdomain%2Fengine.ts%23customerDataExport::src%2Fdomain%2Fengine.ts%23erase::profile%2Fquick%2Fall-in-scope-subsystems::ATTACK-CLASSES.md%23Feature%20abuse%20and%20data%20leakage",
 "src%2Fdomain%2Fengine.ts%23markAttendance::src%2Fdomain%2Fengine.ts%23latestRecordTime::profile%2Fquick%2Fall-in-scope-subsystems::ATTACK-CLASSES.md%23Business%20logic",
 "src%2Fscreens%2FLogin.tsx%23Login%20and%20Setup::src%2Fdomain%2Fauth.ts%23checkSecret::profile%2Fquick%2Fall-in-scope-subsystems::ATTACK-CLASSES.md%23Access%20control",
 "src%2Fscreens%2Fowner%2FGuard.tsx%23Count%20the%20cash::src%2Fdomain%2Fchecks.ts%23expectedCash::profile%2Fquick%2Fall-in-scope-subsystems::ATTACK-CLASSES.md%23Business%20logic"
]

## 8. Your execution environment, sandbox and result contract

- Agent ID: r3-restore
- Scratch (the only place you may write): /root/security-audit-skill/Adds/run-3/agents/r3-restore/scratch
- Retained artifacts: /root/security-audit-skill/Adds/run-3/agents/r3-restore/artifacts (parent-owned; never write there).
- Promotion allowlist (parent promotes ONLY these scratch-relative files after you finish, each <= 65536 bytes, cumulative <= 262144 bytes): check1.txt, check2.txt, check3.txt, check4.txt. Save decisive command output under these names and reference them as "agents/r3-restore/artifacts/checkN.txt" with method "local".
- OS-enforced sandbox (parent-approved; no external network, empty allowlisted env, read-only filesystem except your scratch, CPU 120 s, data 4 GiB, 256 procs, 64 MiB per file, 300 s wall clock). Run ANY target-controlled code only through:
  /root/security-audit-skill/Adds/run-3/sbx.sh /root/security-audit-skill/Adds/run-3/agents/r3-restore/scratch <command...>
  Engine harness recipe: write /root/security-audit-skill/Adds/run-3/agents/r3-restore/scratch/x.test.ts importing absolute paths such as "/home/user/Adds/salon-mobile/src/domain/engine", ".../src/domain/checks", ".../src/domain/types" (emptyData), then run
  /root/security-audit-skill/Adds/run-3/sbx.sh /root/security-audit-skill/Adds/run-3/agents/r3-restore/scratch node /home/user/Adds/salon-mobile/node_modules/vitest/vitest.mjs run --root /root/security-audit-skill/Adds/run-3/agents/r3-restore/scratch --dir /root/security-audit-skill/Adds/run-3/agents/r3-restore/scratch > /root/security-audit-skill/Adds/run-3/agents/r3-restore/scratch/check1.txt 2>&1
  For store.ts, mock AsyncStorage and ../platform/photos with vi.mock exactly as tests/store.test.ts does (use absolute module paths). Copy fixture patterns from tests/security.test.ts (fake timers pinned with vi.useFakeTimers({ now: NOW, toFake: ["Date"] }), records created in time order — the engine now refuses a clock behind the newest record).
  Reading source with your normal file tools is fine. Do not run target code outside sbx.sh. No installs, no network.

## Structured hunter result

Return exactly one JSON object, with no surrounding prose:

```json
{
  "units": [
    {
      "coverage_id": "one assigned ID",
      "disposition": "covered|candidate|blocked",
      "reviewed_paths": ["repo/relative/path"],
      "checks": [
        {
          "agent_id": "canonical owner of this check",
          "reviewed_paths": ["repo/relative/path owned by this check"],
          "invariant": "specific control checked for this unit",
          "method": "source|local",
          "result": "what source or the bounded check established",
          "artifact": "agents/<agent-id>/artifacts/file for local, null for source"
        }
      ],
      "candidate_fingerprints": [],
      "unresolved": []
    }
  ],
  "candidates": [],
  "hardening": ["concrete non-finding note"],
  "uncovered": [
    {
      "surface": "...",
      "boundary": "...",
      "subsystem": "...",
      "attack_class": "...",
      "starting_paths": ["repo/relative/path"],
      "reason": "why this needs its own deterministic coverage unit"
    }
  ]
}
```

Each `candidates` entry is schema-shaped except that it uses `proposed_verdict` in place of `verdict`:

- `proposed_verdict: "confirmed"`: include every field required by the `confirmed` branch of `report-schema.json` other than `verdict`: `fingerprint`, title, description, `root_cause`, `intended_behavior`, ordered `trace`, `evidence`, `conditions`, target-neutral `execution`, `remediation`, `severity`, and `confidence`. The execution instructions describe only the bounded local check already performed. `payloads` holds the minimum test input, fixture, or native invocation. `observed_result` records actual local output. Overall severity must not exceed observed impact.
- `proposed_verdict: "needs_validation"`: include every field required by that schema branch other than `verdict`: `fingerprint`, title, description, `claimed_root_cause`, ordered `trace`, `evidence`, nonempty `blockers`, and `validation_plan` with at least one applicable `local` or `deployment` step. Do not invent an inapplicable context. Do not include severity, execution, remediation, reason, or a confirmed `root_cause`. `deployment` is an owner-observed check, not a request to probe a live target.

Every assigned coverage ID appears exactly once in `units`. A `covered` unit needs an owner, nonempty `reviewed_paths` and `checks`, no unresolved fact, and no candidate. A `candidate` unit has the same owned evidence and is the only state that carries linked fingerprints. A `blocked` unit is an owned partial review with nonempty paths, checks, and unresolved facts but no fingerprint. All source paths are repository-relative, never absolute or traversal paths. A trace with several entries begins at `entrypoint`, ends at `sink`, and labels intermediate steps `propagation`. Every check has its own canonical lowercase `agent_id` and nonempty `reviewed_paths`; the unit-level list is exactly the union of those owned paths. A `source` check uses `artifact: null`. A `local` check uses one successfully parent-promoted regular file beneath `agents/<check.agent_id>/artifacts/`; this permits a verifier to add independently owned evidence without taking ownership from the hunter. Never link scratch, an output-root file, or another check owner's artifact.

### report-schema.json `confirmed` branch (verbatim)

{
 "type": "object",
 "description": "A source-grounded vulnerability that was independently demonstrated.",
 "properties": {
  "verdict": {
   "type": "string",
   "const": "confirmed"
  },
  "fingerprint": {
   "type": "string",
   "minLength": 1,
   "pattern": "^[A-Za-z0-9][A-Za-z0-9._:/@+-]*$",
   "description": "A stable source-derived identifier that does not change between validation states."
  },
  "title": {
   "type": "string",
   "minLength": 1,
   "visibleContent": true
  },
  "description": {
   "type": "string",
   "minLength": 1,
   "visibleContent": true
  },
  "root_cause": {
   "type": "string",
   "minLength": 1,
   "visibleContent": true
  },
  "intended_behavior": {
   "type": "string",
   "minLength": 1,
   "visibleContent": true
  },
  "trace": {
   "type": "array",
   "minItems": 1,
   "uniqueItems": true,
   "items": {
    "type": "object",
    "properties": {
     "kind": {
      "type": "string",
      "enum": [
       "entrypoint",
       "propagation",
       "sink"
      ]
     },
     "file": {
      "type": "string",
      "minLength": 1
     },
     "line": {
      "type": "integer",
      "minimum": 1
     },
     "scope": {
      "type": "string",
      "minLength": 1,
      "visibleContent": true
     },
     "description": {
      "type": "string",
      "minLength": 1,
      "visibleContent": true
     }
    },
    "required": [
     "kind",
     "file",
     "line",
     "scope",
     "description"
    ],
    "additionalProperties": false
   }
  },
  "evidence": {
   "type": "array",
   "minItems": 1,
   "uniqueItems": true,
   "items": {
    "type": "object",
    "properties": {
     "file": {
      "type": "string",
      "minLength": 1
     },
     "line": {
      "type": "integer",
      "minimum": 1
     },
     "description": {
      "type": "string",
      "minLength": 1,
      "visibleContent": true
     }
    },
    "required": [
     "file",
     "line",
     "description"
    ],
    "additionalProperties": false
   }
  },
  "conditions": {
   "type": "array",
   "uniqueItems": true,
   "items": {
    "type": "object",
    "properties": {
     "kind": {
      "type": "string",
      "enum": [
       "authentication_level",
       "authorization_role",
       "user_interaction",
       "system_configuration",
       "network_routing",
       "environmental_dependency",
       "data_state",
       "timing_dependency",
       "third_party_dependency"
      ]
     },
     "description": {
      "type": "string",
      "minLength": 1,
      "visibleContent": true
     }
    },
    "required": [
     "kind",
     "description"
    ],
    "additionalProperties": false
   }
  },
  "execution": {
   "type": "object",
   "description": "Target-neutral reproduction in the target's native interface.",
   "properties": {
    "attacker_perspective": {
     "type": "string",
     "minLength": 1,
     "visibleContent": true
    },
    "payloads": {
     "type": "array",
     "minItems": 1,
     "uniqueItems": true,
     "items": {
      "type": "string"
     }
    },
    "instructions": {
     "type": "array",
     "minItems": 1,
     "items": {
      "type": "string",
      "minLength": 1,
      "visibleContent": true
     }
    },
    "observed_result": {
     "type": "string",
     "minLength": 1,
     "visibleContent": true
    }
   },
   "required": [
    "attacker_perspective",
    "payloads",
    "instructions",
    "observed_result"
   ],
   "additionalProperties": false
  },
  "remediation": {
   "type": "object",
   "properties": {
    "strategy": {
     "type": "string",
     "minLength": 1,
     "visibleContent": true
    },
    "code_changes": {
     "type": "array",
     "items": {
      "type": "object",
      "properties": {
       "file_name": {
        "type": "string",
        "minLength": 1
       },
       "fixed_code": {
        "type": "string"
       }
      },
      "required": [
       "file_name",
       "fixed_code"
      ],
      "additionalProperties": false
     }
    }
   },
   "required": [
    "strategy"
   ],
   "additionalProperties": false
  },
  "severity": {
   "type": "object",
   "properties": {
    "likelihood": {
     "type": "object",
     "properties": {
      "score": {
       "type": "string",
       "enum": [
        "informational",
        "low",
        "medium",
        "high",
        "critical"
       ]
      },
      "reason": {
       "type": "string",
       "minLength": 1,
       "visibleContent": true
      }
     },
     "required": [
      "score",
      "reason"
     ],
     "additionalProperties": false
    },
    "impact": {
     "type": "object",
     "properties": {
      "score": {
       "type": "string",
       "enum": [
        "informational",
        "low",
        "medium",
        "high",
        "critical"
       ]
      },
      "reason": {
       "type": "string",
       "minLength": 1,
       "visibleContent": true
      }
     },
     "required": [
      "score",
      "reason"
     ],
     "additionalProperties": false
    },
    "overall_severity": {
     "type": "string",
     "enum": [
      "informational",
      "low",
      "medium",
      "high",
      "critical"
     ]
    }
   },
   "required": [
    "likelihood",
    "impact",
    "overall_severity"
   ],
   "additionalProperties": false
  },
  "confidence": {
   "type": "object",
   "properties": {
    "score": {
     "type": "string",
     "enum": [
      "low",
      "medium",
      "high"
     ]
    },
    "reason": {
     "type": "string",
     "minLength": 1,
     "visibleContent": true
    }
   },
   "required": [
    "score",
    "reason"
   ],
   "additionalProperties": false
  }
 },
 "required": [
  "verdict",
  "fingerprint",
  "title",
  "description",
  "root_cause",
  "intended_behavior",
  "trace",
  "evidence",
  "conditions",
  "execution",
  "remediation",
  "severity",
  "confidence"
 ],
 "additionalProperties": false
}

### report-schema.json `needs_validation` branch (verbatim)

{
 "type": "object",
 "description": "A source-grounded candidate whose decisive validation is blocked.",
 "properties": {
  "verdict": {
   "type": "string",
   "const": "needs_validation"
  },
  "fingerprint": {
   "type": "string",
   "minLength": 1,
   "pattern": "^[A-Za-z0-9][A-Za-z0-9._:/@+-]*$"
  },
  "title": {
   "type": "string",
   "minLength": 1,
   "visibleContent": true
  },
  "description": {
   "type": "string",
   "minLength": 1,
   "visibleContent": true
  },
  "claimed_root_cause": {
   "type": "string",
   "minLength": 1,
   "visibleContent": true
  },
  "trace": {
   "type": "array",
   "minItems": 1,
   "uniqueItems": true,
   "items": {
    "type": "object",
    "properties": {
     "kind": {
      "type": "string",
      "enum": [
       "entrypoint",
       "propagation",
       "sink"
      ]
     },
     "file": {
      "type": "string",
      "minLength": 1
     },
     "line": {
      "type": "integer",
      "minimum": 1
     },
     "scope": {
      "type": "string",
      "minLength": 1,
      "visibleContent": true
     },
     "description": {
      "type": "string",
      "minLength": 1,
      "visibleContent": true
     }
    },
    "required": [
     "kind",
     "file",
     "line",
     "scope",
     "description"
    ],
    "additionalProperties": false
   }
  },
  "evidence": {
   "type": "array",
   "minItems": 1,
   "uniqueItems": true,
   "items": {
    "type": "object",
    "properties": {
     "file": {
      "type": "string",
      "minLength": 1
     },
     "line": {
      "type": "integer",
      "minimum": 1
     },
     "description": {
      "type": "string",
      "minLength": 1,
      "visibleContent": true
     }
    },
    "required": [
     "file",
     "line",
     "description"
    ],
    "additionalProperties": false
   }
  },
  "blockers": {
   "type": "array",
   "minItems": 1,
   "uniqueItems": true,
   "items": {
    "type": "string",
    "minLength": 1,
    "visibleContent": true
   }
  },
  "validation_plan": {
   "type": "object",
   "properties": {
    "local": {
     "type": "string",
     "minLength": 1,
     "visibleContent": true
    },
    "deployment": {
     "type": "string",
     "minLength": 1,
     "visibleContent": true
    }
   },
   "additionalProperties": false
  }
 },
 "required": [
  "verdict",
  "fingerprint",
  "title",
  "description",
  "claimed_root_cause",
  "trace",
  "evidence",
  "blockers",
  "validation_plan"
 ],
 "additionalProperties": false
}

Return ONLY the JSON object as your final message.

