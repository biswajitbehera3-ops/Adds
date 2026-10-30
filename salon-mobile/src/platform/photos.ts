/**
 * Attendance selfies. On a phone they are files in the app's private documents
 * folder; in the web preview they are small data URIs in browser storage.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

const DIR = (FileSystem.documentDirectory ?? "") + "attendance/";

/**
 * A photo key is a plain name, never a path: no "/", no "..", no "#" or "?" (SECURITY-LESSONS 8).
 * Keys come from the app, but a restored backup could carry any text, so every file call checks.
 */
export function isSafePhotoKey(key: unknown): key is string {
  return typeof key === "string" && /^[A-Za-z0-9_-][A-Za-z0-9._-]{0,99}$/.test(key) && !key.includes("..");
}

/** Opens the front camera. Returns the photo's temporary uri, or null if cancelled. */
export async function takeSelfie(): Promise<string | null> {
  if (Platform.OS !== "web") {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) throw new Error("Camera permission is needed to mark attendance");
  }
  const res = await ImagePicker.launchCameraAsync({
    cameraType: ImagePicker.CameraType.front,
    quality: 0.35,
    allowsEditing: false,
    base64: Platform.OS === "web",
  });
  if (res.canceled || !res.assets?.[0]) return null;
  const a = res.assets[0];
  return Platform.OS === "web" && a.base64 ? `data:image/jpeg;base64,${a.base64}` : a.uri;
}

/**
 * A stylist's profile photo (BUILD-SPEC 6.5), picked by the owner from the gallery or taken
 * with the back camera, cropped square. Returns the photo's temporary uri, or null if cancelled.
 */
export async function pickPhoto(from: "gallery" | "camera"): Promise<string | null> {
  const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 0.5, allowsEditing: true, aspect: [1, 1], base64: Platform.OS === "web" };
  if (Platform.OS !== "web") {
    const perm = from === "camera" ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) throw new Error(from === "camera" ? "Camera permission is needed to take the photo" : "Photo access is needed to pick the photo");
  }
  const res = from === "camera" ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
  if (res.canceled || !res.assets?.[0]) return null;
  const a = res.assets[0];
  return Platform.OS === "web" && a.base64 ? `data:${a.mimeType ?? "image/jpeg"};base64,${a.base64}` : a.uri;
}

/** Saves the photo under a key and returns the key. */
export async function savePhoto(key: string, uri: string): Promise<string> {
  if (!isSafePhotoKey(key)) return "";
  if (Platform.OS === "web") {
    try {
      await AsyncStorage.setItem(`salon:photo:${key}`, uri);
    } catch {
      // Browser storage full or blocked: keep the attendance record without the photo.
      return "";
    }
    return key;
  }
  await FileSystem.makeDirectoryAsync(DIR, { intermediates: true }).catch(() => {});
  await FileSystem.copyAsync({ from: uri, to: `${DIR}${key}.jpg` });
  return key;
}

/** A displayable uri for a stored photo, or null. */
export async function photoUri(key: string | null): Promise<string | null> {
  if (!isSafePhotoKey(key)) return null;
  if (Platform.OS === "web") return (await AsyncStorage.getItem(`salon:photo:${key}`).catch(() => null)) ?? null;
  const uri = `${DIR}${key}.jpg`;
  const info = await FileSystem.getInfoAsync(uri).catch(() => null);
  return info?.exists ? uri : null;
}

/** Deletes stored selfies (retention). Missing files are ignored. */
export async function deletePhotos(keys: string[]): Promise<void> {
  for (const key of keys) {
    if (!isSafePhotoKey(key)) continue;
    if (Platform.OS === "web") await AsyncStorage.removeItem(`salon:photo:${key}`).catch(() => {});
    else await FileSystem.deleteAsync(`${DIR}${key}.jpg`, { idempotent: true }).catch(() => {});
  }
}
