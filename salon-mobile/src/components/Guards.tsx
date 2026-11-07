/**
 * Two guards the counter uses (MISUSE-CHECKS.md):
 * - WhatsAppCode: proves a mobile number belongs to the customer standing there. Staff send a
 *   4-digit code to that number on WhatsApp (from the salon phone, no SMS cost); the customer
 *   reads it out; staff type it in. Used for referrals (7) and big wallet spends (8).
 * - OwnerApproval: the owner types the owner password on the staff phone to approve something
 *   only the owner may allow, such as an "Other" service (10).
 */
import { useEffect, useMemo, useState } from "react";
import { Linking, TextInput, View } from "react-native";
import { checkSecret } from "../domain/auth";
import * as E from "../domain/engine";
import { useData } from "../domain/store";
import { maskPhone } from "../format";
import { hasher } from "../platform/hasher";
import { glass, urbanist } from "../theme/tokens";
import { GhostButton, GlassSheet, GoldButton, GT } from "./glass";
import { useToast } from "./Toast";

const newCode = () => String(Math.floor(1000 + Math.random() * 9000));
/** Wrong entries allowed before the code is thrown away and a new one must be sent (SECURITY-LESSONS 9). */
const MAX_TRIES = 3;

export function WhatsAppCode({ phone, purpose, onVerified, verified }: { phone: string; purpose: string; onVerified: (ok: boolean) => void; verified: boolean }) {
  const toast = useToast();
  const [round, setRound] = useState(0);
  const code = useMemo(newCode, [phone, purpose, round]);
  const [sent, setSent] = useState(false);
  const [typed, setTyped] = useState("");
  const [wrongTries, setWrongTries] = useState(0);
  useEffect(() => {
    setSent(false);
    setTyped("");
    setWrongTries(0);
    onVerified(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);
  const send = async () => {
    try {
      await Linking.openURL(E.whatsappLink(phone, `Your code is ${code}. Tell it to the salon staff to ${purpose}. Don't share it with anyone else.`));
      setSent(true);
    } catch {
      toast("Couldn't open WhatsApp on this phone.", "error");
    }
  };
  if (verified) {
    return (
      <View style={{ padding: 10, borderRadius: 14, backgroundColor: "rgba(143,214,164,0.12)", borderWidth: 1, borderColor: "rgba(143,214,164,0.4)" }}>
        <GT size={13} w="bold" c={glass.ok}>
          ✓ Number confirmed · {maskPhone(phone)}
        </GT>
      </View>
    );
  }
  const wrong = typed.length === 4 && typed !== code;
  return (
    <View style={{ gap: 8, padding: 12, borderRadius: 16, backgroundColor: "rgba(26,18,16,0.4)", borderWidth: 1, borderColor: glass.line }}>
      <GT size={13} w="bold">
        Confirm it's their number
      </GT>
      <GT size={12} c={glass.soft}>
        Send a code to {maskPhone(phone)} on WhatsApp. Ask the customer to read it out, and type it here.
      </GT>
      <GhostButton label={sent ? "Send the code again" : "Send code on WhatsApp"} tone={glass.gold2} onPress={send} />
      {sent ? (
        <TextInput
          value={typed}
          onChangeText={(t) => {
            const d = t.replace(/\D/g, "").slice(0, 4);
            setTyped(d);
            if (d === code) return onVerified(true);
            if (d.length === 4 && wrongTries + 1 >= MAX_TRIES) {
              toast("Too many wrong codes. Send a new code to the customer.", "error");
              setRound((r) => r + 1);
            } else if (d.length === 4) setWrongTries((n) => n + 1);
          }}
          keyboardType="number-pad"
          maxLength={4}
          placeholder="4-digit code"
          placeholderTextColor={glass.faint}
          accessibilityLabel="Code from the customer's WhatsApp"
          style={{ minHeight: 48, borderRadius: 14, paddingHorizontal: 14, fontFamily: urbanist.heavy, fontSize: 20, letterSpacing: 6, color: glass.cream, backgroundColor: "rgba(26,18,16,0.5)", borderWidth: 1, borderColor: wrong ? "#F08C6A" : glass.line }}
        />
      ) : null}
      {wrong ? (
        <GT size={12} c={glass.late}>
          That code doesn't match. Check it with the customer.
        </GT>
      ) : null}
    </View>
  );
}

export function OwnerApproval({ open, onClose, title, detail, onApproved }: { open: boolean; onClose: () => void; title: string; detail: string; onApproved: () => void }) {
  const data = useData();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (open) (setPw(""), setError(""));
  }, [open]);
  const approve = async () => {
    setBusy(true);
    const ok = !!data.owner && (await checkSecret(data.owner.secret, pw, hasher));
    setBusy(false);
    if (!ok) return setError("Wrong owner password");
    onApproved();
    onClose();
  };
  return (
    <GlassSheet open={open} onClose={onClose} label={title}>
      <View style={{ gap: 12, paddingHorizontal: 20, paddingBottom: 20 }}>
        <GT size={20} w="heavy">
          {title}
        </GT>
        <GT size={13.5} c={glass.soft}>
          {detail}
        </GT>
        <TextInput
          value={pw}
          onChangeText={(t) => (setPw(t), setError(""))}
          secureTextEntry
          autoCapitalize="none"
          placeholder="Owner password"
          placeholderTextColor={glass.faint}
          accessibilityLabel="Owner password"
          onSubmitEditing={approve}
          style={{ minHeight: 50, borderRadius: 16, paddingHorizontal: 16, fontFamily: urbanist.medium, fontSize: 16, color: glass.cream, backgroundColor: "rgba(26,18,16,0.5)", borderWidth: 1, borderColor: error ? "#F08C6A" : glass.line }}
        />
        {error ? (
          <GT size={12.5} c={glass.late}>
            {error}
          </GT>
        ) : null}
        <GoldButton label={busy ? "Checking…" : "Approve"} disabled={!pw || busy} onPress={approve} />
        <GhostButton label="Not now" onPress={onClose} />
      </View>
    </GlassSheet>
  );
}
