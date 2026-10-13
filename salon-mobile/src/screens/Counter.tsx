/**
 * Counter: used the moment a customer walks in. Ten keypad taps tell staff at once
 * whether this is a new or returning customer, their last service and wallet
 * balance. Staff pick the services and start the visit; payment happens later
 * from the visit screen. The keypad never animates.
 */
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useRef, useState } from "react";
import { Platform, TextInput, View } from "react-native";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { LabelFrame } from "../components/LabelFrame";
import { Press } from "../components/Press";
import { Reveal } from "../components/Reveal";
import { Screen } from "../components/Screen";
import { Seal } from "../components/Seal";
import { ServicePicker } from "../components/ServicePicker";
import { T } from "../components/T";
import { useToast } from "../components/Toast";
import { TopUpSheet } from "../components/TopUpSheet";
import config from "../config/salon";
import * as E from "../domain/engine";
import { UserError } from "../domain/errors";
import { priceItems } from "../domain/rules";
import { commit, useData } from "../domain/store";
import { formatPhone, inr, relativeDays } from "../format";
import { useNav } from "../nav/Navigator";
import { color, font, radius, space } from "../theme/tokens";
import { istTime, useCurrentStaff } from "./Attendance";

export function Counter() {
  const data = useData();
  const [digits, setDigits] = useState("");
  const lookup = useMemo(() => (digits.length === 10 ? safeLookup(data, digits) : null), [data, digits]);
  const customer = lookup?.customer ?? null;

  return (
    <Screen
      title="Counter"
      right={
        digits ? (
          <Press onPress={() => setDigits("")} accessibilityLabel="Start over" style={{ paddingHorizontal: space.md, minHeight: 48, justifyContent: "center" }}>
            <T v="bodyStrong" c={color.seal}>
              Clear
            </T>
          </Press>
        ) : null
      }
    >
      <PhoneDisplay digits={digits} invalid={digits.length === 10 && !lookup} />

      {digits.length < 10 ? (
        <Keypad onDigit={(d) => setDigits((x) => (x.length < 10 ? x + d : x))} onBack={() => setDigits((x) => x.slice(0, -1))} disabled={digits.length >= 10} />
      ) : !lookup ? (
        <T v="body" c={color.danger} style={{ marginTop: space.md }}>
          That isn't a valid Indian mobile number. Tap Clear and re-enter it.
        </T>
      ) : customer ? (
        <Reveal kind="rise">
          <StartVisit customerId={customer.id} />
        </Reveal>
      ) : (
        <Reveal kind="rise">
          <NewCustomer phone={digits} />
        </Reveal>
      )}
    </Screen>
  );
}

function safeLookup(data: ReturnType<typeof useData>, digits: string) {
  try {
    return E.findByPhone(data, digits);
  } catch {
    return null;
  }
}

function PhoneDisplay({ digits, invalid }: { digits: string; invalid: boolean }) {
  const shown = digits.padEnd(10, "·");
  return (
    <View accessible accessibilityLabel={digits ? `Phone number ${digits.split("").join(" ")}` : "Phone number, empty"} style={{ marginBottom: space.lg }}>
      <T v="label" c={color.inkMuted}>
        Customer's mobile
      </T>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: space.sm, marginTop: 2 }}>
        <T v="small" c={color.inkMuted} style={{ fontSize: 20 }}>
          +91
        </T>
        <T style={{ fontFamily: font.display, fontSize: 38, lineHeight: 48, letterSpacing: 1, fontVariant: ["tabular-nums"] }} c={invalid ? color.danger : color.ink}>
          {shown.slice(0, 5)} {shown.slice(5)}
        </T>
      </View>
      <View style={{ height: 2, backgroundColor: digits.length === 10 ? color.seal : color.ink, marginTop: space.xs, width: `${Math.max(6, digits.length * 10)}%` }} />
    </View>
  );
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

/** Big, instant keypad: no motion beyond the press tint. */
function Keypad({ onDigit, onBack, disabled }: { onDigit: (d: string) => void; onBack: () => void; disabled: boolean }) {
  // Hardware keyboard on the web preview.
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const h = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) onDigit(e.key);
      else if (e.key === "Backspace") onBack();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onDigit, onBack]);

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -space.xs }}>
      {KEYS.map((k, i) => (
        <View key={i} style={{ width: "33.333%", padding: space.xs }}>
          {k === "" ? <View style={{ height: 64 }} /> : <KeyButton label={k} onPress={() => (k === "del" ? onBack() : onDigit(k))} disabled={disabled && k !== "del"} />}
        </View>
      ))}
    </View>
  );
}

function KeyButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled: boolean }) {
  const [down, setDown] = useState(false);
  const back = label === "del";
  return (
    <Press
      onPress={onPress}
      onPressIn={() => setDown(true)}
      onPressOut={() => setDown(false)}
      disabled={disabled}
      scaleTo={1}
      accessibilityLabel={back ? "Delete digit" : label}
      style={{
        height: 64,
        borderRadius: radius.control,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: down ? color.paperPressed : back ? "transparent" : color.paperLight,
        borderWidth: back ? 0 : 1,
        borderColor: color.ruleSoft,
      }}
    >
      {back ? <Icon name="backspace" color={color.ink} size={26} /> : <T style={{ fontFamily: font.display, fontSize: 28, lineHeight: 36 }}>{label}</T>}
    </Press>
  );
}

// ── New customer ─────────────────────────────────────────────────────────────

function NewCustomer({ phone }: { phone: string }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [consent, setConsent] = useState(false);
  const add = () => {
    try {
      commit((d) => E.createCustomer(d, { phone, name, consent, referredBy: referredBy || undefined }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      toast(`${name.trim().split(" ")[0]} added`);
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't add the customer. Try again.", "error");
    }
  };
  return (
    <LabelFrame innerStyle={{ padding: space.lg, gap: space.md }}>
      <View>
        <T v="small" c={color.seal}>
          New customer
        </T>
        <T v="heading">First visit</T>
        <T v="small" c={color.inkMuted}>
          This number isn't on file yet.
        </T>
      </View>
      <Field label="Name" value={name} onChangeText={setName} autoFocus autoCapitalize="words" placeholder="Full name" />
      <Field
        label="Sent by a friend? Their code or mobile number"
        value={referredBy}
        onChangeText={(t) => setReferredBy(/[a-z]/i.test(t) ? t.toUpperCase() : t)}
        autoCapitalize="characters"
        placeholder="e.g. PRI2337 or 98xxx xxxxx"
      />
      <Press
        onPress={() => setConsent((c) => !c)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: consent }}
        scaleTo={0.99}
        style={{ flexDirection: "row", gap: space.md, alignItems: "flex-start", paddingVertical: space.xs }}
      >
        <View style={{ width: 26, height: 26, borderRadius: 6, borderWidth: 1.5, borderColor: color.ink, backgroundColor: consent ? color.choc : color.paperLight, alignItems: "center", justifyContent: "center", marginTop: 1 }}>
          {consent ? <Icon name="check" color={color.sealBright} size={18} strokeWidth={2.5} /> : null}
        </View>
        <T v="body" style={{ flex: 1 }}>
          Customer agrees we can save their name and number for their wallet and visit reminders on WhatsApp.
        </T>
      </Press>
      <Button label="Add customer" icon="plus" onPress={add} disabled={!name.trim() || !consent} big />
    </LabelFrame>
  );
}

export function Field({ label, ...rest }: React.ComponentProps<typeof TextInput> & { label: string }) {
  const [focus, setFocus] = useState(false);
  return (
    <View style={{ gap: 4 }}>
      <T v="small" c={color.inkMuted}>
        {label}
      </T>
      <TextInput
        selectionColor={color.seal}
        cursorColor={color.seal}
        placeholderTextColor="#9C806C"
        accessibilityLabel={label}
        {...rest}
        onFocus={(e) => (setFocus(true), rest.onFocus?.(e))}
        onBlur={(e) => (setFocus(false), rest.onBlur?.(e))}
        style={{
          minHeight: 52,
          borderWidth: 1.25,
          borderColor: focus ? color.choc : color.ruleSoft,
          borderRadius: radius.control,
          paddingHorizontal: space.lg,
          fontFamily: font.semibold,
          fontSize: 17,
          color: color.ink,
          backgroundColor: color.paperLight,
        }}
      />
    </View>
  );
}

// ── Returning customer: start the visit ──────────────────────────────────────

function StartVisit({ customerId }: { customerId: string }) {
  const data = useData();
  const nav = useNav();
  const toast = useToast();
  const me = useCurrentStaff();
  const cardRef = useRef<View>(null);
  const found = E.findByPhone(data, data.customers.find((c) => c.id === customerId)!.phone).customer!;
  const [pick, setPick] = useState<{ serviceIds: string[]; addOnIds: string[]; staffId: string | null }>({ serviceIds: [], addOnIds: [], staffId: me?.id ?? null });
  const [topUpOpen, setTopUpOpen] = useState(false);
  const total = pick.serviceIds.length ? priceItems(pick.serviceIds, pick.addOnIds).total : 0;
  const lastNames = found.lastVisit?.serviceIds.map((id) => config.services.find((s) => s.id === id)?.name.toLowerCase()).filter(Boolean).join(" + ");

  const start = () => {
    try {
      commit((d) => E.startVisit(d, { customerId, serviceIds: pick.serviceIds, addOnIds: pick.addOnIds, staffId: pick.staffId! }));
      toast(`${found.name.split(" ")[0]} is in the chair`);
      nav.pop();
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't start the visit. Try again.", "error");
    }
  };

  return (
    <View style={{ gap: space.sm }}>
      <Press onPress={() => nav.push({ name: "profile", id: customerId }, { from: cardRef })} accessibilityLabel={`${found.visitCount ? "Returning" : "New"} customer ${found.name}. Open profile.`} scaleTo={0.985}>
        <View ref={cardRef} collapsable={false}>
          <LabelFrame innerStyle={{ flexDirection: "row", alignItems: "center", padding: space.md, paddingLeft: space.lg, gap: space.md }}>
            <View style={{ flex: 1, gap: 2 }}>
              <T v="small" c={found.visitCount ? color.positive : color.seal}>
                {found.visitCount ? `Returning customer · ${found.visitCount} visits` : "On file · first visit"}
              </T>
              <T v="heading" numberOfLines={1}>
                {found.name}
              </T>
              <T v="small" c={color.inkMuted} numberOfLines={2}>
                {found.lastVisit ? `Last: ${lastNames}, ${relativeDays(found.lastVisit.paidAt ?? found.lastVisit.createdAt)}` : formatPhone(found.phone)}
              </T>
            </View>
            <Seal amount={found.walletBalance} width={112} />
          </LabelFrame>
        </View>
      </Press>
      <Press onPress={() => setTopUpOpen(true)} accessibilityLabel="Top up wallet" style={{ alignSelf: "flex-end", flexDirection: "row", alignItems: "center", gap: 6, minHeight: 48, paddingHorizontal: space.sm }}>
        <Icon name="wallet" color={color.seal} size={18} />
        <T v="bodyStrong" c={color.seal}>
          Top up wallet
        </T>
      </Press>

      {found.openVisit ? (
        <Animated.View entering={FadeIn.duration(200)} layout={LinearTransition.duration(240)} style={{ gap: space.sm }}>
          <View style={{ padding: space.lg, borderRadius: radius.control, backgroundColor: color.choc, gap: 2 }}>
            <T v="bodyStrong" c={color.cream}>
              Already in the chair since {istTime(found.openVisit.createdAt)}
            </T>
            <T v="small" c={color.creamMuted}>
              Open the visit to add services or take payment.
            </T>
          </View>
          <Button big label="Open their visit" onPress={() => nav.replace({ name: "visit", id: found.openVisit!.id })} />
        </Animated.View>
      ) : (
        <>
          <ServicePicker {...pick} staff={data.staff} onChange={setPick} />
          <View style={{ marginTop: space.xl, gap: space.sm }}>
            <T v="small" c={color.inkMuted} style={{ textAlign: "center" }}>
              Payment is taken after the service. You can add more services then.
            </T>
            <Button
              big
              label={!pick.serviceIds.length ? "Pick a service" : !pick.staffId ? "Pick a stylist" : `Start visit · ${inr(total)}`}
              disabled={!pick.serviceIds.length || !pick.staffId}
              onPress={start}
            />
          </View>
        </>
      )}
      <TopUpSheet customer={found} visible={topUpOpen} onClose={() => setTopUpOpen(false)} />
    </View>
  );
}
