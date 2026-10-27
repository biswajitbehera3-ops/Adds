/**
 * Shown when the salon's saved data can't be read (SECURITY-LESSONS R1-1). The app never falls back to
 * demo data here: that would put a known password in charge and overwrite the real records. Nothing is
 * saved until the data loads again or the owner restores a backup.
 */
import { useState } from "react";
import { View } from "react-native";
import { GhostButton, GoldButton, GT } from "../components/glass";
import config from "../config/salon";
import { readBackup } from "../domain/checks";
import { UserError } from "../domain/errors";
import { loadStore, restoreAfterLoadFailure } from "../domain/store";
import { pickTextFile } from "../platform/share";
import { glass } from "../theme/tokens";

export function LoadFailed() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const retry = async () => {
    setBusy(true);
    setMessage("");
    await loadStore();
    setBusy(false);
    setMessage("Still can't read it. Restart the phone and try again, or restore your latest backup.");
  };
  const restore = async () => {
    try {
      const text = await pickTextFile();
      if (!text) return;
      restoreAfterLoadFailure(readBackup(text));
    } catch (e) {
      setMessage(e instanceof UserError ? e.message : "Couldn't read that file");
    }
  };
  return (
    <View style={{ flex: 1, justifyContent: "center", gap: 14, padding: 24, backgroundColor: glass.deep }}>
      <GT size={24} w="heavy">
        The salon's data couldn't be opened
      </GT>
      <GT size={15} c={glass.soft}>
        Nothing has been changed or deleted. Try again first. If it still doesn't open, restore your latest backup file, then call {config.business.grievance.name} on {config.business.grievance.phone}.
      </GT>
      <GoldButton label={busy ? "Trying…" : "Try again"} onPress={retry} disabled={busy} />
      <GhostButton label="Restore from a backup file" onPress={restore} />
      {message ? (
        <GT size={13} c={glass.late}>
          {message}
        </GT>
      ) : null}
    </View>
  );
}
