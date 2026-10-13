/**
 * On-device store: the whole salon's data in memory, persisted to AsyncStorage
 * after every change. One device per salon, so writes are serialised here.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import { migrate } from "./engine";
import { buildDemoData } from "./seed";
import { emptyData, type Data, type Session } from "./types";

const KEY = "salon:data:v1";
const SESSION_KEY = "salon:session";

let state: Data = emptyData();
let ready = false;
let session: Session | null = null;
const listeners = new Set<() => void>();
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function emit() {
  for (const l of listeners) l();
}

function persist() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch((e) => console.warn("Could not save data", e));
  }, 150);
}

export async function loadStore(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    state = raw ? migrate(JSON.parse(raw)) : buildDemoData();
    persist();
    const rawSession = await AsyncStorage.getItem(SESSION_KEY).catch(() => null);
    session = rawSession ? (JSON.parse(rawSession) as Session) : null;
  } catch (e) {
    console.warn("Could not load saved data; starting with demo data", e);
    state = buildDemoData();
  }
  ready = true;
  emit();
}

/** Applies an engine operation and commits its data. Engine errors propagate untouched. */
export function commit<T>(op: (data: Data) => { data: Data; result: T }): T {
  const { data, result } = op(state);
  state = data;
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
  persist();
  setSession(null);
}

/** Wipes the phone back to first-launch: the owner sets a new password and adds staff. */
export function clearAll() {
  state = emptyData();
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

export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, () => session, () => session);
}

export function useStoreReady(): boolean {
  return useSyncExternalStore(subscribe, () => ready, () => ready);
}
