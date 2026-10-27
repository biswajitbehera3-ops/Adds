/**
 * On-device store: the whole salon's data in memory, persisted to AsyncStorage
 * after every change. One device per salon, so writes are serialised here.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import { deletePhotos } from "../platform/photos";
import { applyCatalog } from "./checks";
import { migrate, observeClock, purgeExpired } from "./engine";
import { buildDemoData } from "./seed";
import { emptyData, type Data, type Session } from "./types";

const KEY = "salon:data:v1";
const SESSION_KEY = "salon:session";

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

function emit() {
  for (const l of listeners) l();
}

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
    // Demo data only on a true first launch, when nothing is saved yet. A read or parse error never
    // falls back to it: that would put the demo owner password in charge and overwrite the real data.
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

/** From the recovery screen: replace the unreadable data with a backup the owner chose (already checked by readBackup). */
export function restoreAfterLoadFailure(data: Data) {
  loadFailed = false;
  state = observeClock(data);
  applyCatalog(state);
  persist();
  setSession(null);
}

/** Applies an engine operation and commits its data. Engine errors propagate untouched. */
export function commit<T>(op: (data: Data) => { data: Data; result: T }): T {
  if (loadFailed) throw new Error("The saved data couldn't be read");
  const { data, result } = op(state);
  if (data.catalog !== state.catalog) applyCatalog(data);
  // Every save notes the phone's clock, so a clock set back shows in the owner's checks.
  state = observeClock(data);
  persist();
  emit();
  return result;
}

export function getData(): Data {
  return state;
}

/** Replaces everything with demo data and signs everyone out. */
export function resetToDemo() {
  state = buildDemoData();
  applyCatalog(state);
  persist();
  setSession(null);
}

/** Wipes the phone back to first-launch: the owner sets a new password and adds staff. */
export function clearAll() {
  state = emptyData();
  applyCatalog(state);
  persist();
  setSession(null);
}

/** Replaces everything with a backup the owner chose, and signs everyone out. */
export function restoreBackup(data: Data) {
  state = observeClock(data);
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

export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, () => session, () => session);
}

export function useStoreReady(): boolean {
  return useSyncExternalStore(subscribe, () => ready, () => ready);
}
