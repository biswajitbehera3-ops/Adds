/**
 * Counter: the screen staff use between every customer. Target: a walk-in
 * logged in well under 15 seconds — ten keypad taps, service, (stylist is
 * remembered), Log. The keypad never animates; only state changes do.
 */
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useRef, useState } from "react";
import { Platform, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeOut, LinearTransition, useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import { Chip } from "../components/Chip";
import { Icon } from "../components/Icon";
import { LabelFrame } from "../components/LabelFrame";
import { Press } from "../components/Press";
import { Screen, SectionTitle } from "../components/Screen";
import { Seal } from "../components/Seal";
import { Segmented } from "../components/Segmented";
import { Stamp } from "../components/Stamp";
import { T } from "../components/T";
import { useToast } from "../components/Toast";
import { TopUpSheet } from "../components/TopUpSheet";
import config from "../config/salon";
import * as E from "../domain/engine";
import { UserError } from "../domain/errors";
import { priceVisit, upsellsFor } from "../domain/rules";
import { commit, useData } from "../domain/store";
import type { PaymentMethod, Visit } from "../domain/types";
import { formatPhone, inr, relativeDays } from "../format";
import { useNav } from "../nav/Navigator";
import { color, font, radius, space } from "../theme/tokens";

// Remembered across customers: the stylist at this counter rarely changes.
let lastStaffId: string | null = null;

type Receipt = { visit: Visit; balance: number; referral: ReturnType<typeof E.logVisit>["result"]["referral"]; name: string; customerId: string };

export function Counter() {
  const data = useData();
  const toast = useToast();
  const [digits, setDigits] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const lookup = useMemo(() => (digits.length === 10 ? safeLookup(data, digits) : null), [data, digits]);
  const customer = lookup?.customer ?? null;

  const reset = () => {
    setDigits("");
    setReceipt(null);
  };

  if (receipt) return <ReceiptView receipt={receipt} onNext={reset} />;

  return (
    <Screen
      title="Counter"
      right={
        digits ? (
          <Press onPress={reset} accessibilityLabel="Start over" style={{ paddingHorizontal: space.md, minHeight: 48, justifyContent: "center" }}>
            <T v="bodyStrong" c={color.seal}>
              Clear
            </T>
          </Press>
        ) : null
      }
    >
      <PhoneDisplay digits={digits} invalid={digits.length === 10 && !lookup} />

      {digits.length < 10 ? (
        <Keypad
          onDigit={(d) => setDigits((x) => (x.length < 10 ? x + d : x))}
          onBack={() => setDigits((x) => x.slice(0, -1))}
          disabled={digits.length >= 10}
        />
      ) : !lookup ? (
        <T v="body" c={color.danger} style={{ marginTop: space.md }}>
          That isn't a valid Indian mobile number. Tap Clear and re-enter it.
        </T>
      ) : customer ? (
        <Animated.View entering={FadeIn.duration(220)} layout={LinearTransition.duration(260)}>
          <Checkout
            customerId={customer.id}
            onDone={(r) => {
              setReceipt({ ...r, name: customer.name, customerId: customer.id });
            }}
            onError={(m) => toast(m, "error")}
          />
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn.duration(220)}>
          <NewCustomer phone={digits} />
        </Animated.View>
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

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

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
          {k === "" ? (
            <View style={{ height: 64 }} />
          ) : (
            <KeyButton label={k} onPress={() => (k === "⌫" ? onBack() : onDigit(k))} disabled={disabled && k !== "⌫"} />
          )}
        </View>
      ))}
    </View>
  );
}

function KeyButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled: boolean }) {
  const [down, setDown] = useState(false);
  const back = label === "⌫";
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
  const [code, setCode] = useState("");
  const [consent, setConsent] = useState(false);
  const add = () => {
    try {
      commit((d) => E.createCustomer(d, { phone, name, consent, referralCode: code || undefined }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      toast(`${name.trim().split(" ")[0]} added`);
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't add the customer. Try again.", "error");
    }
  };
  return (
    <LabelFrame innerStyle={{ padding: space.lg, gap: space.md }}>
      <View>
        <T v="heading">New customer</T>
        <T v="small" c={color.inkMuted}>
          First visit. Their number isn't on file yet.
        </T>
      </View>
      <Field label="Name" value={name} onChangeText={setName} autoFocus autoCapitalize="words" placeholder="Full name" />
      <Field label="Referral code (optional)" value={code} onChangeText={(t) => setCode(t.toUpperCase())} autoCapitalize="characters" placeholder="e.g. PRI2337" />
      <Press
        onPress={() => setConsent((c) => !c)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: consent }}
        scaleTo={0.99}
        style={{ flexDirection: "row", gap: space.md, alignItems: "flex-start", paddingVertical: space.xs }}
      >
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 6,
            borderWidth: 1.5,
            borderColor: color.ink,
            backgroundColor: consent ? color.choc : color.paperLight,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 1,
          }}
        >
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

// ── Checkout ─────────────────────────────────────────────────────────────────

function Checkout({ customerId, onDone, onError }: { customerId: string; onDone: (r: ReturnType<typeof E.logVisit>["result"]) => void; onError: (m: string) => void }) {
  const data = useData();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const cardRef = useRef<View>(null);
  const found = E.findByPhone(data, data.customers.find((c) => c.id === customerId)!.phone).customer!;
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [addOns, setAddOns] = useState<string[]>([]);
  const [staffId, setStaffId] = useState<string | null>(lastStaffId);
  const [useWallet, setUseWallet] = useState<boolean | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [topUpOpen, setTopUpOpen] = useState(false);

  // Price depends only on service and add-ons; the stylist is validated at submit.
  const total = serviceId ? priceVisit({ serviceId, addOnIds: addOns, staffId: config.staff[0].id }).total : 0;
  // Default: pay from the wallet when it covers the whole bill; staff can switch it off.
  const walletOn = useWallet ?? (found.walletBalance > 0 && found.walletBalance >= total && total > 0);
  const walletAmount = walletOn ? Math.min(found.walletBalance, total) : 0;
  const due = total - walletAmount;

  const suggested = serviceId ? upsellsFor(serviceId).map((a) => a.id) : [];
  const addOnList = serviceId ? [...config.addOns].sort((a, b) => Number(suggested.includes(b.id)) - Number(suggested.includes(a.id))) : [];

  const submit = () => {
    try {
      const r = commit((d) => E.logVisit(d, { customerId, serviceId: serviceId!, addOnIds: addOns, staffId: staffId!, walletAmount, paymentMethod: method }));
      lastStaffId = staffId;
      onDone(r);
    } catch (e) {
      onError(e instanceof UserError ? e.message : "Couldn't log the visit. Try again.");
    }
  };

  const last = found.lastVisit ? config.services.find((s) => s.id === found.lastVisit!.serviceId)?.name : null;

  return (
    <View style={{ gap: space.sm, paddingBottom: insets.bottom }}>
      <Press onPress={() => nav.push({ name: "profile", id: customerId }, { from: cardRef })} accessibilityLabel={`Returning customer ${found.name}. Open profile.`} scaleTo={0.985}>
        <View ref={cardRef} collapsable={false}>
          <LabelFrame innerStyle={{ flexDirection: "row", alignItems: "center", padding: space.md, paddingLeft: space.lg, gap: space.md }}>
            <View style={{ flex: 1, gap: 2 }}>
              <T v="small" c={color.positive}>
                {found.visitCount > 0 ? "Returning customer" : "On file · first visit"}
              </T>
              <T v="heading" numberOfLines={1}>
                {found.name}
              </T>
              <T v="small" c={color.inkMuted} numberOfLines={1}>
                {found.visitCount > 0 ? `${found.visitCount} visits · last ${last?.toLowerCase()} ${relativeDays(found.lastVisit!.createdAt)}` : formatPhone(found.phone)}
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

      <SectionTitle>Service</SectionTitle>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
        {config.services.map((s) => (
          <Chip
            key={s.id}
            label={s.name}
            sub={inr(s.price)}
            selected={serviceId === s.id}
            onPress={() => {
              setServiceId(s.id);
              setAddOns([]);
              setUseWallet(null);
            }}
          />
        ))}
      </View>

      {serviceId ? (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(120)}>
          <SectionTitle
            aside={
              suggested.length ? (
                <T v="small" c={color.seal}>
                  Suggested for this service
                </T>
              ) : undefined
            }
          >
            Add-ons
          </SectionTitle>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
            {addOnList.map((a) => (
              <Chip
                key={a.id}
                label={a.name}
                sub={`+${inr(a.price)}`}
                suggested={suggested.includes(a.id)}
                selected={addOns.includes(a.id)}
                onPress={() => setAddOns((x) => (x.includes(a.id) ? x.filter((y) => y !== a.id) : [...x, a.id]))}
              />
            ))}
          </View>
        </Animated.View>
      ) : null}

      <SectionTitle>Stylist</SectionTitle>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
        {config.staff.map((s) => (
          <Chip key={s.id} grow label={s.name} sub={s.chair} selected={staffId === s.id} onPress={() => setStaffId(s.id)} />
        ))}
      </View>

      <SectionTitle>Payment</SectionTitle>
      {found.walletBalance > 0 ? (
        <Press
          onPress={() => setUseWallet(!walletOn)}
          accessibilityRole="switch"
          accessibilityState={{ checked: walletOn }}
          scaleTo={0.99}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: space.md,
            padding: space.md,
            borderRadius: radius.control,
            borderWidth: 1.25,
            borderColor: walletOn ? color.seal : color.ruleSoft,
            backgroundColor: color.paperLight,
            marginBottom: space.sm,
          }}
        >
          <Icon name="wallet" color={color.seal} />
          <View style={{ flex: 1 }}>
            <T v="bodyStrong">Pay from wallet</T>
            <T v="small" c={color.inkMuted}>
              {walletOn && total ? `${inr(walletAmount)} of ${inr(found.walletBalance)}` : `${inr(found.walletBalance)} available`}
            </T>
          </View>
          <Toggle on={walletOn} />
        </Press>
      ) : null}
      {due > 0 || !serviceId ? (
        <Segmented label="Paid by" value={method} onChange={setMethod} options={[{ key: "CASH", label: "Cash" }, { key: "UPI", label: "UPI" }, { key: "CARD", label: "Card" }]} />
      ) : null}

      <View style={{ marginTop: space.xl, gap: space.sm }}>
        {serviceId ? (
          <T v="small" c={color.inkMuted} style={{ textAlign: "center" }}>
            {walletAmount > 0 ? `${inr(walletAmount)} from wallet${due > 0 ? ` · ${inr(due)} by ${method.toLowerCase()}` : ""}` : `${inr(due)} by ${method === "UPI" ? "UPI" : method.toLowerCase()}`}
          </T>
        ) : null}
        <Button
          big
          label={!serviceId ? "Pick a service" : !staffId ? "Pick a stylist" : `Log visit · ${inr(total)}`}
          disabled={!serviceId || !staffId}
          onPress={submit}
        />
      </View>

      <TopUpSheet customer={found} visible={topUpOpen} onClose={() => setTopUpOpen(false)} onDone={() => setUseWallet(null)} />
    </View>
  );
}

function Toggle({ on }: { on: boolean }) {
  const reduced = useReducedMotion();
  return (
    <View style={{ width: 50, height: 30, borderRadius: 15, backgroundColor: on ? color.seal : color.ruleSoft, padding: 3, alignItems: on ? "flex-end" : "flex-start" }}>
      <Animated.View layout={reduced ? undefined : LinearTransition.springify().damping(22).stiffness(320)} style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: color.paperLight }} />
    </View>
  );
}

// ── Receipt ──────────────────────────────────────────────────────────────────

function ReceiptView({ receipt, onNext }: { receipt: Receipt; onNext: () => void }) {
  const nav = useNav();
  const ref = useRef<View>(null);
  const { visit } = receipt;
  const service = config.services.find((s) => s.id === visit.serviceId)!;
  const staff = config.staff.find((s) => s.id === visit.staffId)!;
  const addOns = visit.addOnIds.map((id) => config.addOns.find((a) => a.id === id)!);

  return (
    <Screen title="Visit logged">
      <View ref={ref} collapsable={false}>
        <LabelFrame innerStyle={{ padding: space.xl, gap: space.md }}>
          <View>
            <T v="title">{receipt.name}</T>
            <T v="small" c={color.inkMuted}>
              {staff.name} · {staff.chair}
            </T>
          </View>
          <View style={{ gap: space.xs, borderTopWidth: 1, borderTopColor: color.ruleSoft, paddingTop: space.md }}>
            <Line label={service.name} value={inr(service.price)} />
            {addOns.map((a) => (
              <Line key={a.id} label={a.name} value={inr(a.price)} />
            ))}
          </View>
          <View style={{ gap: space.xs, borderTopWidth: 1, borderTopColor: color.rule, paddingTop: space.md }}>
            <Line label="Total" value={inr(visit.total)} strong />
            {visit.walletPaid ? <Line label="From wallet" value={inr(visit.walletPaid)} /> : null}
            {visit.directPaid ? <Line label={`By ${visit.paymentMethod === "UPI" ? "UPI" : visit.paymentMethod.toLowerCase()}`} value={inr(visit.directPaid)} /> : null}
            <Line label="Wallet balance now" value={inr(receipt.balance)} />
          </View>
          <View style={{ alignItems: "flex-end", marginTop: -space.md }}>
            <Stamp amount={visit.total} />
          </View>
        </LabelFrame>
      </View>

      {receipt.referral ? (
        <View style={{ marginTop: space.lg, flexDirection: "row", gap: space.md, alignItems: "center", padding: space.lg, borderRadius: radius.control, backgroundColor: color.choc }}>
          <Icon name="refer" color={color.sealBright} size={26} />
          <T v="body" c={color.cream} style={{ flex: 1 }}>
            Referral reward paid: {inr(receipt.referral.newCustomerReward)} to {receipt.name.split(" ")[0]} and {inr(receipt.referral.referrerReward)} to {receipt.referral.referrerName}.
          </T>
        </View>
      ) : null}

      <View style={{ gap: space.sm, marginTop: space.xl }}>
        <Button big label="Next customer" onPress={onNext} />
        <Button kind="outline" label="Open customer profile" onPress={() => nav.push({ name: "profile", id: receipt.customerId }, { from: ref })} />
      </View>
    </Screen>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: space.md }}>
      <T v={strong ? "bodyStrong" : "body"} c={strong ? color.ink : color.inkMuted}>
        {label}
      </T>
      <T v={strong ? "amount" : "bodyStrong"} style={strong ? { fontSize: 22 } : { fontVariant: ["tabular-nums"] }}>
        {value}
      </T>
    </View>
  );
}
