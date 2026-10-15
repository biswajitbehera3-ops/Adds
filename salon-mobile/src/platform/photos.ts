/**
 * Attendance selfies. On a phone they are files in the app's private documents
 * folder; in the web preview they are small data URIs in browser storage.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

const DIR = (FileSystem.documentDirectory ?? "") + "attendance/";

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

/** Saves the photo under a key and returns the key. */
export async function savePhoto(key: string, uri: string): Promise<string> {
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
  if (!key) return null;
  if (Platform.OS === "web") return (await AsyncStorage.getItem(`salon:photo:${key}`).catch(() => null)) ?? null;
  const uri = `${DIR}${key}.jpg`;
  const info = await FileSystem.getInfoAsync(uri).catch(() => null);
  return info?.exists ? uri : null;
}

/** Deletes stored selfies (retention). Missing files are ignored. */
export async function deletePhotos(keys: string[]): Promise<void> {
  for (const key of keys) {
    if (Platform.OS === "web") await AsyncStorage.removeItem(`salon:photo:${key}`).catch(() => {});
    else await FileSystem.deleteAsync(`${DIR}${key}.jpg`, { idempotent: true }).catch(() => {});
  }
}
