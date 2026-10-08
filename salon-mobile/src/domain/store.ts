/**
 * On-device store: the whole salon's data in memory, persisted to AsyncStorage
 * after every change. One device per salon, so writes are serialised here.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import { buildDemoData } from "./seed";
import { emptyData, type Data } from "./types";

const KEY = "salon:data:v1";

let state: Data = emptyData();
let ready = false;
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
    state = raw ? (JSON.parse(raw) as Data) : buildDemoData();
    if (!raw) persist();
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

export function resetToDemo() {
  state = buildDemoData();
  persist();
  emit();
}

export function clearAll() {
  state = emptyData();
  persist();
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useData(): Data {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

export function useStoreReady(): boolean {
  return useSyncExternalStore(subscribe, () => ready, () => ready);
}
