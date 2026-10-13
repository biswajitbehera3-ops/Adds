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
