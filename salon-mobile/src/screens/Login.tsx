/**
 * Login and first-launch setup. Staff sign in with their mobile number and
 * password; the owner signs in with the owner password into a separate area.
 * (The animated branded version of this screen comes with the front-page design.)
 */
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import { LabelFrame } from "../components/LabelFrame";
import { Reveal } from "../components/Reveal";
import { Segmented } from "../components/Segmented";
import { T } from "../components/T";
import { useToast } from "../components/Toast";
import config from "../config/salon";
import { checkSecret, makeSecret } from "../domain/auth";
import * as E from "../domain/engine";
import { UserError } from "../domain/errors";
import { DEMO_OWNER_PASSWORD, DEMO_STAFF_PASSWORD } from "../domain/seed";
import { commit, setSession, useData } from "../domain/store";
import { hasher } from "../platform/hasher";
import { color, space } from "../theme/tokens";
import { Field } from "./Counter";

function Shell({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: color.choc }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: space.lg, paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.xl, gap: space.lg }}>
        <Reveal kind="rise">
          <T v="small" c={color.creamMuted}>
            {config.displayName}
          </T>
          <T v="display" c={color.cream}>
            Welcome
          </T>
        </Reveal>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function Login() {
  const data = useData();
  const toast = useToast();
  const [role, setRole] = useState<"staff" | "owner">("staff");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      if (role === "owner") {
        if (!data.owner || !(await checkSecret(data.owner.secret, password, hasher))) throw new UserError("Wrong owner password");
        setSession({ role: "owner" });
      } else {
        const staff = E.findStaffByPhone(data, phone);
        if (!staff || !staff.active || !(await checkSecret(staff.secret, password, hasher))) throw new UserError("Wrong number or password");
        setSession({ role: "staff", staffId: staff.id });
      }
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't sign in. Try again.", "error");
    } finally {
      setBusy(false);
      setPassword("");
    }
  };

  return (
    <Shell>
      <Reveal kind="rise" index={1}>
        <LabelFrame innerStyle={{ padding: space.xl, gap: space.md }}>
          <Segmented label="Sign in as" value={role} onChange={(r) => (setRole(r), setPassword(""))} options={[{ key: "staff", label: "Staff" }, { key: "owner", label: "Owner" }]} />
          {role === "staff" ? (
            <Field label="Your mobile number" value={phone} onChangeText={(t) => setPhone(t.replace(/[^\d+ ]/g, ""))} keyboardType="phone-pad" autoComplete="tel" placeholder="98xxx xxxxx" />
          ) : null}
          <Field label={role === "owner" ? "Owner password" : "Password"} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" onSubmitEditing={submit} placeholder="••••" />
          <Button big label="Sign in" busy={busy} disabled={!password || (role === "staff" && phone.replace(/\D/g, "").length < 10)} onPress={submit} />
        </LabelFrame>
      </Reveal>
      {data.demo ? (
        <Reveal kind="rise" index={2}>
          <T v="small" c={color.creamMuted} style={{ textAlign: "center" }}>
            Demo logins · Staff 98111 00001 / {DEMO_STAFF_PASSWORD} · Owner {DEMO_OWNER_PASSWORD}
          </T>
        </Reveal>
      ) : null}
    </Shell>
  );
}

/** First launch on a salon's phone: the owner sets their password. Staff are added from the owner area. */
export function Setup() {
  const toast = useToast();
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      if (a !== b) throw new UserError("The two passwords don't match");
      const secret = await makeSecret(a, hasher);
      commit((d) => E.setOwnerSecret(d, secret));
      setSession({ role: "owner" });
      toast("Owner password set. Now add your staff.");
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't save. Try again.", "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Shell>
      <Reveal kind="rise" index={1}>
        <LabelFrame innerStyle={{ padding: space.xl, gap: space.md }}>
          <View style={{ gap: 2 }}>
            <T v="heading">Set up the owner password</T>
            <T v="small" c={color.inkMuted}>
              Only the owner can open the dashboard, see attendance and manage staff. Keep this password private.
            </T>
          </View>
          <Field label="Owner password" value={a} onChangeText={setA} secureTextEntry autoCapitalize="none" placeholder="At least 4 characters" />
          <Field label="Type it again" value={b} onChangeText={setB} secureTextEntry autoCapitalize="none" onSubmitEditing={save} />
          <Button big label="Save and continue" busy={busy} disabled={!a || !b} onPress={save} />
        </LabelFrame>
      </Reveal>
    </Shell>
  );
}
