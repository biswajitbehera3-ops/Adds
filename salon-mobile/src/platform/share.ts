import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function toBase64(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

/** Hands an .xlsx file to the phone's share sheet (WhatsApp, Drive, email…), or downloads it on the web. */
export async function shareXlsx(fileName: string, bytes: Uint8Array): Promise<void> {
  if (Platform.OS === "web") {
    const blob = new Blob([bytes as BlobPart], { type: XLSX_MIME });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    return;
  }
  const uri = (FileSystem.cacheDirectory ?? "") + fileName;
  await FileSystem.writeAsStringAsync(uri, toBase64(bytes), { encoding: FileSystem.EncodingType.Base64 });
  if (!(await Sharing.isAvailableAsync())) throw new Error("Sharing isn't available on this phone");
  await Sharing.shareAsync(uri, { mimeType: XLSX_MIME, dialogTitle: fileName, UTI: "org.openxmlformats.spreadsheetml.sheet" });
}

/** Hands a text file (the salon backup) to the share sheet, or downloads it on the web. */
export async function shareTextFile(fileName: string, text: string, mimeType = "application/json"): Promise<void> {
  if (Platform.OS === "web") {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: mimeType }));
    a.download = fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    return;
  }
  const uri = (FileSystem.cacheDirectory ?? "") + fileName;
  await FileSystem.writeAsStringAsync(uri, text);
  if (!(await Sharing.isAvailableAsync())) throw new Error("Sharing isn't available on this phone");
  await Sharing.shareAsync(uri, { mimeType, dialogTitle: fileName });
}

/** Lets the owner pick a backup file; returns its text, or null if they cancelled. */
export async function pickTextFile(): Promise<string | null> {
  const DocumentPicker = await import("expo-document-picker");
  const res = await DocumentPicker.getDocumentAsync({ type: ["application/json", "text/plain", "*/*"], copyToCacheDirectory: true });
  if (res.canceled || !res.assets?.[0]) return null;
  const a = res.assets[0];
  if (Platform.OS === "web" && a.file) return await a.file.text();
  return await FileSystem.readAsStringAsync(a.uri);
}
