/**
 * Login and first-launch setup (BUILD-SPEC 2.2–2.5), brown glass, as approved in the login
 * prototype: a tall glass capsule with the logo in a round window, "Welcome back" written
 * letter by letter, the live date and time, mobile number + password, Log in (turns into a
 * spinner, then ✓: motion P1), "Owner? Sign in here", barber tools drifting slowly behind,
 * and a shake on a wrong password. Reduce Motion stills the tools and the shake.
 */
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import Animated, { Easing, type SharedValue, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Path, Rect, Stop } from "react-native-svg";
import { Backdrop, GT } from "../components/glass";
import { LetterReveal } from "../components/LetterReveal";
import { Press } from "../components/Press";
import { checkSecret, makeSecret } from "../domain/auth";
import * as E from "../domain/engine";
import { UserError } from "../domain/errors";
import { DEMO_OWNER_PASSWORD, DEMO_STAFF_PASSWORD } from "../domain/seed";
import { commit, setSession, useData } from "../domain/store";
import { useNav } from "../nav/Navigator";
import { hasher } from "../platform/hasher";
import { glass, urbanist } from "../theme/tokens";

const LOGO = require("../../assets/brand/logo-clean.png");

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(t);
  }, []);
  const local = new Date(now.getTime() + 330 * 60000);
  const day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][local.getUTCDay()];
  const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][local.getUTCMonth()];
  const h = local.getUTCHours();
  return { date: `${day}, ${local.getUTCDate()} ${month}`, time: `${((h + 11) % 12) + 1}:${String(local.getUTCMinutes()).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}` };
}

/** Scissors, a brush and a comb drifting slowly behind the capsule. */
function Drifting() {
  const reduced = useReducedMotion();
  const a = useSharedValue(0);
  useEffect(() => {
    if (!reduced) a.value = withRepeat(withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [reduced, a]);
  const s1 = useAnimatedStyle(() => ({ transform: [{ translateX: -12 * a.value }, { translateY: 16 * a.value }, { rotate: `${32 - 7 * a.value}deg` }] }));
  const s2 = useAnimatedStyle(() => ({ transform: [{ translateX: 10 * a.value }, { translateY: -12 * a.value }, { rotate: `${-16 + 6 * a.value}deg` }] }));
  const s3 = useAnimatedStyle(() => ({ transform: [{ translateX: 8 * a.value }, { translateY: -8 * a.value }, { rotate: `${-38 + 5 * a.value}deg` }] }));
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={[{ position: "absolute", right: -60, top: "3%", width: 150, height: 350 }, s1]}>
        <Svg viewBox="0 0 220 520" width="100%" height="100%">
          <Defs>
            <SvgGradient id="steel" x1="0" x2="1">
              <Stop offset="0" stopColor="#f3f4f4" />
              <Stop offset="0.45" stopColor="#a9adb0" />
              <Stop offset="0.55" stopColor="#d8dadb" />
              <Stop offset="1" stopColor="#7c8185" />
            </SvgGradient>
            <SvgGradient id="gold" x1="0" x2="1" y1="0" y2="1">
              <Stop offset="0" stopColor="#f1c27d" />
              <Stop offset="0.4" stopColor="#c98a3b" />
              <Stop offset="0.7" stopColor="#f0b868" />
              <Stop offset="1" stopColor="#8a5523" />
            </SvgGradient>
          </Defs>
          <Path d="M92 300 L70 18 Q72 6 80 14 L118 296 Z" fill="url(#steel)" stroke="#6d7276" strokeWidth={1.5} />
          <Path d="M122 300 L170 40 Q176 30 180 42 L134 304 Z" fill="url(#steel)" stroke="#6d7276" strokeWidth={1.5} opacity={0.95} />
          <Circle cx={114} cy={302} r={9} fill="#e9c58f" stroke="#7b5225" strokeWidth={2} />
          <Path d="M108 312 Q96 360 78 392 Q52 410 46 448 Q44 496 86 500 Q128 500 124 452 Q120 418 98 400 Q114 364 122 318 Z M86 418 Q108 420 106 450 Q104 478 84 478 Q64 476 66 450 Q68 420 86 418 Z" fill="url(#gold)" fillRule="evenodd" />
          <Path d="M122 314 Q138 352 154 384 Q182 398 186 436 Q190 478 156 486 Q122 490 120 452 Q118 420 140 400 Q128 360 116 320 Z M158 410 Q172 416 170 440 Q168 464 152 466 Q136 466 138 442 Q140 414 158 410 Z" fill="url(#gold)" fillRule="evenodd" />
        </Svg>
      </Animated.View>
      <Animated.View style={[{ position: "absolute", left: 4, top: "34%", width: 70, height: 170, opacity: 0.85 }, s2]}>
        <Svg viewBox="0 0 60 150" width="100%" height="100%">
          <Path d="M14 8 Q30 -4 46 8 L52 60 Q30 70 8 60 Z" fill="#e8dccb" />
          <Rect x={10} y={58} width={40} height={14} rx={4} fill="#c98a3b" />
          <Path d="M16 72 L44 72 L40 146 Q30 150 20 146 Z" fill="#3a2419" />
        </Svg>
      </Animated.View>
      <Animated.View style={[{ position: "absolute", left: -30, top: "4%", width: 130, height: 40, opacity: 0.6 }, s3]}>
        <Svg viewBox="0 0 200 60" width="100%" height="100%">
          <Rect x={0} y={0} width={200} height={16} rx={5} fill="#2b211d" />
          {Array.from({ length: 24 }, (_, i) => (
            <Rect key={i} x={4 + i * 8} y={14} width={4} height={i % 2 ? 34 : 44} rx={1.5} fill="#1a1310" />
          ))}
        </Svg>
      </Animated.View>
    </View>
  );
}

function Capsule({ children, shake }: { children: React.ReactNode; shake?: SharedValue<number> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: shake?.value ?? 0 }] }));
  return (
    <Animated.View style={[{ width: "100%", maxWidth: 300, alignSelf: "center", borderRadius: 160, padding: 12, paddingBottom: 22, alignItems: "center", backgroundColor: "rgba(255,244,236,0.13)", borderWidth: 1, borderColor: "rgba(255,244,236,0.28)", shadowColor: "#000", shadowOpacity: 0.45, shadowRadius: 30, shadowOffset: { width: 0, height: 24 }, elevation: 12 }, st]}>
      <View style={{ width: "100%", aspectRatio: 1, borderRadius: 999, overflow: "hidden", backgroundColor: "#000" }}>
        <Image source={LOGO} style={{ width: "100%", height: "100%" }} accessibilityLabel="Salon logo" />
      </View>
      {children}
    </Animated.View>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Backdrop>
      <Drifting />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 30, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20, gap: 14 }}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </Backdrop>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  const [focus, setFocus] = useState(false);
  return (
    <TextInput
      placeholderTextColor="rgba(255,248,241,0.55)"
      selectionColor={glass.gold}
      {...props}
      onFocus={(e) => (setFocus(true), props.onFocus?.(e))}
      onBlur={(e) => (setFocus(false), props.onBlur?.(e))}
      style={{ height: 46, borderRadius: 23, paddingHorizontal: 18, fontFamily: urbanist.medium, fontSize: 15.5, color: glass.cream, backgroundColor: focus ? "rgba(20,14,12,0.42)" : "rgba(20,14,12,0.28)", borderWidth: 1, borderColor: focus ? glass.gold : "rgba(255,244,236,0.28)" }}
    />
  );
}

/** Log in → spinner → ✓ (P1). */
function LoginButton({ label, state, disabled, onPress }: { label: string; state: "idle" | "busy" | "ok"; disabled?: boolean; onPress: () => void }) {
  return (
    <Press onPress={onPress} disabled={disabled || state !== "idle"} accessibilityLabel={label} accessibilityState={{ disabled, busy: state === "busy" }} style={{ height: 48, borderRadius: 24, backgroundColor: "rgba(228,166,123,0.9)", alignItems: "center", justifyContent: "center", opacity: disabled ? 0.5 : 1 }}>
      {state === "busy" ? (
        <ActivityIndicator color={glass.ink} />
      ) : state === "ok" ? (
        <GT size={20} w="heavy" c={glass.ink}>
          ✓
        </GT>
      ) : (
        <GT size={16} w="bold" c={glass.ink}>
          {label} →
        </GT>
      )}
    </Press>
  );
}

export function Login() {
  const data = useData();
  const nav = useNav();
  const reduced = useReducedMotion();
  const clock = useClock();
  const [owner, setOwner] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "ok">("idle");
  const [msg, setMsg] = useState("");
  const shake = useSharedValue(0);

  const fail = (text: string) => {
    setMsg(text);
    setState("idle");
    setPassword("");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    if (!reduced) shake.value = withSequence(withTiming(-8, { duration: 60 }), withTiming(7, { duration: 70 }), withTiming(-4, { duration: 70 }), withTiming(0, { duration: 60 }));
  };
  const submit = async () => {
    setState("busy");
    setMsg("");
    try {
      if (owner) {
        if (!data.owner || !(await checkSecret(data.owner.secret, password, hasher))) throw new UserError("Wrong owner password");
        setState("ok");
        setTimeout(() => setSession({ role: "owner" }), 350);
      } else {
        const staff = E.findStaffByPhone(data, phone);
        if (!staff || !staff.active || !(await checkSecret(staff.secret, password, hasher))) throw new UserError("Wrong number or password");
        setState("ok");
        setTimeout(() => setSession({ role: "staff", staffId: staff.id }), 350);
      }
    } catch (e) {
      fail(e instanceof UserError ? e.message : "Couldn't sign in. Try again.");
    }
  };

  return (
    <Shell>
      <Capsule shake={shake}>
        <View style={{ width: "100%", alignItems: "center", paddingHorizontal: 8, paddingTop: 12, gap: 2 }}>
          <GT size={13} c={glass.soft} style={{ letterSpacing: 0.3 }}>
            {owner ? "owner sign in" : "good to see you"}
          </GT>
          <LetterReveal text="Welcome back" style={{ fontFamily: urbanist.regular, fontSize: 32, lineHeight: 38, color: glass.cream }} />
          <GT size={14} c={glass.cream} style={{ marginTop: 6, textAlign: "center" }}>
            {clock.date}
            {"\n"}
            <GT size={14} w="bold">
              {clock.time}
            </GT>
          </GT>
          <View style={{ width: "100%", gap: 8, marginTop: 12 }}>
            {!owner ? <Input value={phone} onChangeText={(t) => setPhone(t.replace(/[^\d+ ]/g, ""))} keyboardType="phone-pad" autoComplete="tel" placeholder="Mobile number" accessibilityLabel="Mobile number" maxLength={14} /> : null}
            <Input value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" placeholder={owner ? "Owner password" : "Password"} accessibilityLabel={owner ? "Owner password" : "Password"} onSubmitEditing={submit} />
            <GT size={12.5} c={glass.gold2} style={{ minHeight: 17, textAlign: "center" }} accessibilityLiveRegion="polite">
              {msg}
            </GT>
            <LoginButton label="Log in" state={state} disabled={!password || (!owner && phone.replace(/\D/g, "").length < 10)} onPress={submit} />
          </View>
          <Pressable onPress={() => (setOwner(!owner), setPassword(""), setMsg(""))} accessibilityRole="button" hitSlop={8} style={{ marginTop: 10 }}>
            <GT size={12.5} c={glass.soft}>
              {owner ? "Staff? " : "Owner? "}
              <GT size={12.5} c={glass.soft} style={{ textDecorationLine: "underline" }}>
                {owner ? "Sign in with your number" : "Sign in here"}
              </GT>
            </GT>
          </Pressable>
        </View>
      </Capsule>
      {data.demo ? (
        <GT size={12} c={glass.faint} style={{ textAlign: "center" }}>
          Demo logins · Staff 98111 00001 / {DEMO_STAFF_PASSWORD} · Owner {DEMO_OWNER_PASSWORD}
        </GT>
      ) : null}
      <Pressable onPress={() => nav.push({ name: "legal" })} accessibilityRole="link" style={{ alignItems: "center", minHeight: 40, justifyContent: "center" }}>
        <GT size={12.5} c={glass.soft} style={{ textDecorationLine: "underline" }}>
          Privacy & terms
        </GT>
      </Pressable>
    </Shell>
  );
}

/** First launch on a salon's phone: the owner sets their password. Staff are added from the owner area. */
export function Setup() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "ok">("idle");
  const [msg, setMsg] = useState("");
  const save = async () => {
    setState("busy");
    try {
      if (a !== b) throw new UserError("The two passwords don't match");
      const secret = await makeSecret(a, hasher);
      commit((d) => E.setOwnerSecret(d, secret));
      setState("ok");
      setTimeout(() => setSession({ role: "owner" }), 350);
    } catch (e) {
      setMsg(e instanceof UserError ? e.message : "Couldn't save. Try again.");
      setState("idle");
    }
  };
  return (
    <Shell>
      <Capsule>
        <View style={{ width: "100%", alignItems: "center", paddingHorizontal: 8, paddingTop: 12, gap: 6 }}>
          <GT size={13} c={glass.soft}>
            first time on this phone
          </GT>
          <GT size={24} w="bold" style={{ textAlign: "center" }}>
            Set the owner password
          </GT>
          <GT size={12.5} c={glass.soft} style={{ textAlign: "center" }}>
            Only the owner can open the owner area, see attendance and manage staff. Keep it private.
          </GT>
          <View style={{ width: "100%", gap: 8, marginTop: 8 }}>
            <Input value={a} onChangeText={setA} secureTextEntry autoCapitalize="none" placeholder="Owner password (4+ characters)" accessibilityLabel="Owner password" />
            <Input value={b} onChangeText={setB} secureTextEntry autoCapitalize="none" placeholder="Type it again" accessibilityLabel="Type it again" onSubmitEditing={save} />
            <GT size={12.5} c={glass.gold2} style={{ minHeight: 17, textAlign: "center" }}>
              {msg}
            </GT>
            <LoginButton label="Save and continue" state={state} disabled={!a || !b} onPress={save} />
          </View>
        </View>
      </Capsule>
    </Shell>
  );
}
