/**
 * On-device store: the whole salon's data in memory, persisted to AsyncStorage
 * after every change. One device per salon, so writes are serialised here.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import { deletePhotos } from "../platform/photos";
import { checkSecret, type Hasher } from "./auth";
import { applyCatalog, prepareRestore } from "./checks";
import { UserError } from "./errors";
import { assertClockNotFarAhead, migrate, observeClock, purgeExpired } from "./engine";
import { buildDemoData } from "./seed";
import { emptyData, type Data, type Session } from "./types";

const KEY = "salon:data:v1";
const SESSION_KEY = "salon:session";
/**
 * A separate copy of the owner password's hash. If the main data can't be read, the recovery screen
 * still asks for the owner password before a backup replaces it (SECURITY-LESSONS 4, run-3 note).
 */
const OWNER_KEY = "salon:owner";

let state: Data = emptyData();
let ready = false;
let session: Session | null = null;
const listeners = new Set<() => void>();
let saveTimer: ReturnType<typeof setTimeout> | null = null;
/**
 * True when the saved data couldn't be read. Nothing is saved while it is set, so the stored data is
 * never overwritten, and the app shows a recovery screen instead of demo data (SECURITY-LESSONS R1-1).
 */
let loadFailed = false;
/** The owner secret read from OWNER_KEY when the main data couldn't be read; null if there was none. */
let recoveryOwner: Data["owner"] = null;
let savedOwner: string | null = null;

function emit() {
  for (const l of listeners) l();
}

function persist() {
  if (loadFailed) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch((e) => console.warn("Could not save data", e));
    const owner = state.owner ? JSON.stringify(state.owner) : null;
    if (owner !== savedOwner) {
      savedOwner = owner;
      (owner ? AsyncStorage.setItem(OWNER_KEY, owner) : AsyncStorage.removeItem(OWNER_KEY)).catch(() => {});
    }
  }, 150);
}

export async function loadStore(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    // Demo data only on a true first launch, when nothing is saved yet. A read or parse error never
    // falls back to it: that would put the demo owner password in charge and overwrite the real data.
    // A saved owner password with no data means the data was lost, not a first launch (run 3).
    if (!raw && (await AsyncStorage.getItem(OWNER_KEY))) throw new Error("The salon's data is missing but its owner password is saved");
    let next = raw ? migrate(JSON.parse(raw)) : buildDemoData();
    // Retention: erase what has been kept long enough, every time the app starts (held if the clock jumped).
    const purged = purgeExpired(next);
    next = purged.data;
    applyCatalog(next);
    state = next;
    loadFailed = false;
    deletePhotos(purged.result.photoKeys).catch(() => {});
    persist();
  } catch (e) {
    console.warn("Could not load saved data; showing the recovery screen", e);
    if (saveTimer) clearTimeout(saveTimer);
    loadFailed = true;
    try {
      const rawOwner = await AsyncStorage.getItem(OWNER_KEY);
      const owner = rawOwner ? JSON.parse(rawOwner) : null;
      recoveryOwner = owner && typeof owner.secret?.salt === "string" && typeof owner.secret?.hash === "string" ? owner : null;
    } catch {
      recoveryOwner = null;
    }
  }
  // A damaged session only signs the user out; it never touches the salon's data.
  try {
    const rawSession = loadFailed ? null : await AsyncStorage.getItem(SESSION_KEY);
    session = rawSession ? (JSON.parse(rawSession) as Session) : null;
  } catch {
    session = null;
    AsyncStorage.removeItem(SESSION_KEY).catch(() => {});
  }
  ready = true;
  emit();
}

/** The saved data couldn't be read: the app shows the recovery screen. */
export function useLoadFailed(): boolean {
  return useSyncExternalStore(subscribe, () => loadFailed, () => loadFailed);
}

/** Whether the recovery screen can restore: only when this phone's owner password is known. */
export function canRestoreAfterLoadFailure(): boolean {
  return loadFailed && !!recoveryOwner;
}

/**
 * From the recovery screen: replace the unreadable data with a backup the owner chose (already checked
 * by readBackup). Needs this phone's owner password, and keeps it: never the file's (SECURITY-LESSONS 3, 4).
 */
export async function restoreAfterLoadFailure(data: Data, password: string, h: Hasher, now = new Date()) {
  if (!loadFailed) throw new UserError("The data is open again. Restore from the owner's menu instead.");
  if (!recoveryOwner) throw new UserError("This phone has no saved owner password, so a backup can't be restored here.");
  if (!(await checkSecret(recoveryOwner.secret, password, h))) throw new UserError("Wrong owner password");
  loadFailed = false;
  state = observeClock(prepareRestore({ ...data, owner: recoveryOwner, privacyLog: [], clock: undefined }, data, now), now);
  applyCatalog(state);
  persist();
  setSession(null);
}

/** Applies an engine operation and commits its data. Engine errors propagate untouched. */
export function commit<T>(op: (data: Data) => { data: Data; result: T }): T {
  if (loadFailed) throw new Error("The saved data couldn't be read");
  // Every save notes the phone's clock first, on the data as it was, so a record saved at a new time
  // can't vouch for that time. A refused save still keeps the note: a clock set back shows in the owner's checks.
  const now = new Date();
  const watched = observeClock(state, now);
  let out: { data: Data; result: T };
  try {
    assertClockNotFarAhead(watched, now);
    out = op(watched);
  } catch (e) {
    state = watched;
    persist();
    emit();
    throw e;
  }
  if (out.data.catalog !== state.catalog) applyCatalog(out.data);
  state = out.data;
  persist();
  emit();
  return out.result;
}

/** Notes the phone's clock when the app comes back to the front, so a clock changed while idle is seen (run 3). */
export function observeNow() {
  if (loadFailed || !ready) return;
  state = observeClock(state);
  persist();
  emit();
}

export function getData(): Data {
  return state;
}

/**
 * Deletes the selfie and staff photo files the new data no longer points to. Clean-up by date only
 * reaches files a record still names, so a restore or a wipe must delete the rest itself (run 3, lesson 7).
 */
function dropUnusedPhotos(prev: Data, next: Data) {
  const keys = (d: Data) => [...d.attendance.map((a) => a.photoKey), ...d.staff.map((s) => s.photoKey)].filter((k): k is string => !!k);
  const keep = new Set(keys(next));
  deletePhotos(keys(prev).filter((k) => !keep.has(k))).catch(() => {});
}

/** Replaces everything with demo data and signs everyone out. */
export function resetToDemo() {
  const next = buildDemoData();
  dropUnusedPhotos(state, next);
  state = next;
  applyCatalog(state);
  persist();
  setSession(null);
}

/** Wipes the phone back to first-launch: the owner sets a new password and adds staff. */
export function clearAll() {
  const next = emptyData();
  dropUnusedPhotos(state, next);
  state = next;
  applyCatalog(state);
  persist();
  setSession(null);
}

/** Replaces everything with a backup the owner chose, and signs everyone out. */
export function restoreBackup(data: Data) {
  const next = observeClock(data);
  dropUnusedPhotos(state, next);
  state = next;
  applyCatalog(state);
  persist();
  setSession(null);
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useData(): Data {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

/** Who is using the phone right now. Kept across app restarts until they log out. */
export function setSession(next: Session | null) {
  session = next;
  (next ? AsyncStorage.setItem(SESSION_KEY, JSON.stringify(next)) : AsyncStorage.removeItem(SESSION_KEY)).catch(() => {});
  emit();
}

export function getSession(): Session | null {
  return session;
}

/**
 * Who is acting, from the signed-in session: "owner" or the stylist's id. Records that name who closed
 * something take it from here, never from a screen's guess (SECURITY-LESSONS 5).
 */
export function sessionActor(): string {
  if (!session) throw new UserError("Sign in again first");
  return session.role === "owner" ? "owner" : session.staffId;
}

export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, () => session, () => session);
}

export function useStoreReady(): boolean {
  return useSyncExternalStore(subscribe, () => ready, () => ready);
}
