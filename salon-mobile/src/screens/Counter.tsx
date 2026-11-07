/**
 * Customer walked in (BUILD-SPEC 4.5, 4.8, 8.1, 8.2), brown glass, as approved. Ten keypad
 * taps say at once whether this is a new or returning customer, their last service and
 * wallet. Staff pick services (suggested add-ons dashed) and start the visit; payment comes
 * later on the bill. A new customer needs a name and their consent (nothing pre-ticked).
 * The keypad never animates: instant tint only (MOTION.md).
 */
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, TextInput, View } from "react-native";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Backdrop, GlassCard, GoldButton, GT, WalletBadge } from "../components/glass";
import { Icon } from "../components/Icon";
import { Press } from "../components/Press";
import { ServicePicker } from "../components/ServicePicker";
import { useToast } from "../components/Toast";
import { WhatsAppCode } from "../components/Guards";
import { TopUpSheet } from "../components/TopUpSheet";
import config from "../config/salon";
import * as E from "../domain/engine";
import { UserError } from "../domain/errors";
import { priceItems } from "../domain/rules";
import { commit, useData, useSession } from "../domain/store";
import { formatPhone, inr, relativeDays } from "../format";
import { useNav } from "../nav/Navigator";
import { glass, urbanist } from "../theme/tokens";
import { istTime, useCurrentStaff } from "./Attendance";

export function Counter() {
  const data = useData();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [digits, setDigits] = useState("");
  const [topUp, setTopUp] = useState(false);
  const lookup = useMemo(() => (digits.length === 10 ? safeLookup(data, digits) : null), [data, digits]);
  const customer = lookup?.customer ?? null;
  const shown = digits.padEnd(10, "·");

  return (
    <Backdrop>
      <View style={{ flex: 1, paddingTop: insets.top + 8, paddingHorizontal: 18 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Pressable onPress={nav.pop} accessibilityRole="button" accessibilityLabel="Back" hitSlop={10}>
            <GT size={13.5} w="bold" c={glass.gold2}>
              ‹ Home
            </GT>
          </Pressable>
          {digits ? (
            <Pressable onPress={() => setDigits("")} accessibilityRole="button" accessibilityLabel="Start over" hitSlop={10}>
              <GT size={13.5} w="bold" c={glass.soft}>
                Clear
              </GT>
            </Pressable>
          ) : null}
        </View>
        <View accessible accessibilityLabel={digits ? `Phone number ${digits.split("").join(" ")}` : "Customer's mobile number, empty"} style={{ marginTop: 8 }}>
          <GT size={12.5} c={glass.soft}>
            +91
          </GT>
          <GT size={34} w="heavy" c={digits.length === 10 && !lookup ? "#F08C6A" : glass.cream} style={{ lineHeight: 42, letterSpacing: 1, fontVariant: ["tabular-nums"] }}>
            {shown.slice(0, 5)} {shown.slice(5)}
          </GT>
        </View>

        {digits.length < 10 ? (
          <Keypad onDigit={(d) => setDigits((x) => (x.length < 10 ? x + d : x))} onBack={() => setDigits((x) => x.slice(0, -1))} />
        ) : !lookup ? (
          <GT size={14} c="#F08C6A" style={{ marginTop: 12 }}>
            That isn't a valid Indian mobile number. Tap Clear and re-enter it.
          </GT>
        ) : (
          <Animated.ScrollView entering={reduced ? undefined : FadeInDown.duration(320)} style={{ flex: 1, marginTop: 12 }} contentContainerStyle={{ gap: 14, paddingBottom: insets.bottom + 30 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {customer ? <StartVisit customerId={customer.id} onTopUp={() => setTopUp(true)} /> : <NewCustomer phone={digits} />}
          </Animated.ScrollView>
        )}
      </View>
      {customer ? <TopUpSheet customer={customer} visible={topUp} onClose={() => setTopUp(false)} /> : null}
    </Backdrop>
  );
}

function safeLookup(data: ReturnType<typeof useData>, digits: string) {
  try {
    return E.findByPhone(data, digits);
  } catch {
    return null;
  }
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

/** Big, instant keypad: no motion beyond the press tint. */
function Keypad({ onDigit, onBack }: { onDigit: (d: string) => void; onBack: () => void }) {
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
    <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 24, marginHorizontal: -5 }}>
      {KEYS.map((k, i) => (
        <View key={i} style={{ width: "33.333%", padding: 5 }}>
          {k === "" ? (
            <View style={{ height: 66 }} />
          ) : (
            <Pressable
              onPress={() => (k === "del" ? onBack() : onDigit(k))}
              accessibilityRole="button"
              accessibilityLabel={k === "del" ? "Delete digit" : k}
              style={({ pressed }) => ({ height: 66, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: pressed ? "rgba(228,166,123,0.3)" : k === "del" ? "transparent" : glass.card, borderWidth: k === "del" ? 0 : 1, borderColor: glass.line })}
            >
              {k === "del" ? (
                <Icon name="backspace" color={glass.cream} size={26} />
              ) : (
                <GT size={28} w="bold">
                  {k}
                </GT>
              )}
            </Pressable>
          )}
        </View>
      ))}
    </View>
  );
}

// ── New customer ─────────────────────────────────────────────────────────────

function NewCustomer({ phone }: { phone: string }) {
  const toast = useToast();
  const nav = useNav();
  const session = useSession();
  const [name, setName] = useState("");
  const [referredBy, setReferredBy] = useState("");
  // DPDP: nothing is pre-ticked; the record consent is required, messages are optional.
  const [consent, setConsent] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [minor, setMinor] = useState(false);
  const [guardian, setGuardian] = useState(false);
  const [refOk, setRefOk] = useState(false);
  const data = useData();
  // Verify the friend's code or number as it's typed, so staff can check the name with the customer.
  const ref = referredBy.trim();
  const halfNumber = /^[\d +]+$/.test(ref) && ref.replace(/\D/g, "").length < 10;
  const referrer = ref.length >= 4 && !halfNumber ? E.findReferrer(data, ref) : null;
  const refState = !ref ? "none" : referrer ? (referrer.phone === phone ? "self" : "ok") : ref.length >= 4 && !halfNumber ? "unknown" : "typing";
  const add = () => {
    try {
      commit((d) =>
        E.createCustomer(d, { phone, name, consent, marketing, minor, guardianConsent: guardian, referredBy: referredBy || undefined, referralVerified: refOk, takenBy: session?.role === "staff" ? session.staffId : "owner" }),
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      toast(`${name.trim().split(" ")[0]} added`);
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't add the customer. Try again.", "error");
    }
  };
  return (
    <GlassCard style={{ padding: 16, gap: 12 }}>
      <View>
        <View style={{ alignSelf: "flex-start", paddingHorizontal: 9, paddingVertical: 2, borderRadius: 999, backgroundColor: "rgba(143,214,164,0.16)" }}>
          <GT size={11.5} w="heavy" c={glass.ok}>
            New customer · first visit
          </GT>
        </View>
        <GT size={13} c={glass.soft} style={{ marginTop: 4 }}>
          This number isn't on file yet.
        </GT>
      </View>
      <Field label="Name" value={name} onChangeText={setName} autoFocus autoCapitalize="words" placeholder="Full name" />
      <Field label="Sent by a friend? Their code or mobile" value={referredBy} onChangeText={(t) => setReferredBy(/[a-z]/i.test(t) ? t.toUpperCase() : t)} autoCapitalize="characters" placeholder="e.g. PRI2337 or 98xxx xxxxx" />
      {refState === "ok" || refState === "self" || refState === "unknown" ? (
        <View accessibilityLiveRegion="polite" style={{ marginTop: -4, padding: 10, borderRadius: 14, backgroundColor: refState === "ok" ? "rgba(143,214,164,0.12)" : "rgba(240,160,138,0.12)", borderWidth: 1, borderColor: refState === "ok" ? "rgba(143,214,164,0.4)" : "rgba(240,160,138,0.45)" }}>
          <GT size={13} w="bold" c={refState === "ok" ? glass.ok : glass.late}>
            {refState === "ok" ? `✓ ${maskName(referrer!.name)} · mobile ending ${referrer!.phone.slice(-3)}` : refState === "self" ? "That's this customer's own number" : "No customer with this code or number"}
          </GT>
          <GT size={12} c={glass.soft}>
            {refState === "ok" ? "Ask who sent them and check the name matches. Both get wallet credit after this first visit is paid." : refState === "self" ? "A customer can't refer themselves. Clear the box." : "Check it with the customer, or clear the box to add them without a referral."}
          </GT>
        </View>
      ) : null}
      {refState === "ok" ? <WhatsAppCode phone={phone} purpose="join with your friend's referral" verified={refOk} onVerified={setRefOk} /> : null}
      <GT size={12.5} c={glass.soft}>
        Read this to the customer: we keep your name, number, visits and wallet only to serve you here. You can ask us to stop messages or delete your data at any time.
      </GT>
      <Tick on={minor} onPress={() => (setMinor(!minor), minor ? setGuardian(false) : null)} label="Customer is under 18" hint="Use the parent's or guardian's mobile number" />
      {minor ? <Tick on={guardian} onPress={() => setGuardian(!guardian)} label="Parent or guardian agrees" hint="They are here and the number is theirs" /> : null}
      <Tick on={consent} onPress={() => setConsent(!consent)} label="Agrees we keep their details for visits and wallet" hint="Needed to save the customer" />
      <Tick on={marketing} onPress={() => setMarketing(!marketing)} label="Wants WhatsApp reminders and offers" hint="Optional. They can reply STOP any time" />
      <Pressable onPress={() => nav.push({ name: "legal" })} accessibilityRole="link" hitSlop={6}>
        <GT size={12.5} w="bold" c={glass.gold2} style={{ textDecorationLine: "underline" }}>
          Full privacy notice
        </GT>
      </Pressable>
      <GoldButton label="Add customer" onPress={add} disabled={!name.trim() || !consent || (minor && !guardian) || (ref !== "" && (refState !== "ok" || !refOk))} />
    </GlassCard>
  );
}

/** "Priya Patel" → "Priya P.": enough to confirm with the customer without reading out a full name. */
const maskName = (n: string) => {
  const [first, ...rest] = n.split(" ");
  return rest.length ? `${first} ${rest[rest.length - 1][0]}.` : first;
};

export function Field({ label, ...rest }: React.ComponentProps<typeof TextInput> & { label: string }) {
  const [focus, setFocus] = useState(false);
  return (
    <View style={{ gap: 5 }}>
      <GT size={12.5} w="semibold" c={glass.soft}>
        {label}
      </GT>
      <TextInput
        selectionColor={glass.gold}
        placeholderTextColor={glass.faint}
        accessibilityLabel={label}
        {...rest}
        onFocus={(e) => (setFocus(true), rest.onFocus?.(e))}
        onBlur={(e) => (setFocus(false), rest.onBlur?.(e))}
        style={[{ minHeight: 50, borderRadius: 14, paddingHorizontal: 14, fontFamily: urbanist.semibold, fontSize: 16, color: glass.cream, backgroundColor: "rgba(26,18,16,0.55)", borderWidth: 1, borderColor: focus ? glass.gold : glass.line }, rest.style]}
      />
    </View>
  );
}

export function Tick({ on, onPress, label, hint }: { on: boolean; onPress: () => void; label: string; hint?: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={`${label}${hint ? `. ${hint}` : ""}`} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
      <View style={{ width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: on ? glass.gold : glass.soft, backgroundColor: on ? glass.gold : "transparent", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
        {on ? (
          <GT size={13} w="heavy" c={glass.ink}>
            ✓
          </GT>
        ) : null}
      </View>
      <View style={{ flex: 1 }}>
        <GT size={14} w="bold">
          {label}
        </GT>
        {hint ? (
          <GT size={12} c={glass.soft}>
            {hint}
          </GT>
        ) : null}
      </View>
    </Pressable>
  );
}

// ── Returning customer: start the visit ──────────────────────────────────────

function StartVisit({ customerId, onTopUp }: { customerId: string; onTopUp: () => void }) {
  const data = useData();
  const nav = useNav();
  const toast = useToast();
  const me = useCurrentStaff();
  const found = E.findByPhone(data, data.customers.find((c) => c.id === customerId)!.phone).customer!;
  const [pick, setPick] = useState<{ serviceIds: string[]; addOnIds: string[]; staffId: string | null }>({ serviceIds: [], addOnIds: [], staffId: me?.id ?? null });
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
    <>
      <Press onPress={() => nav.push({ name: "profile", id: customerId })} accessibilityLabel={`${found.visitCount ? "Returning" : "New"} customer ${found.name}. Open profile.`} scaleTo={0.985}>
        <GlassCard style={{ flexDirection: "row", alignItems: "center", padding: 14, gap: 12 }}>
          <View style={{ flex: 1, gap: 3 }}>
            <View style={{ alignSelf: "flex-start", paddingHorizontal: 9, paddingVertical: 2, borderRadius: 999, backgroundColor: found.visitCount ? "rgba(143,214,164,0.16)" : "rgba(228,166,123,0.18)" }}>
              <GT size={11.5} w="heavy" c={found.visitCount ? glass.ok : glass.gold2}>
                {found.visitCount ? `Returning · ${found.visitCount} visits` : "On file · first visit"}
              </GT>
            </View>
            <GT size={20} w="heavy" numberOfLines={1}>
              {found.name}
            </GT>
            <GT size={12.5} c={glass.soft} numberOfLines={2}>
              {found.lastVisit ? `Last: ${lastNames}, ${relativeDays(found.lastVisit.paidAt ?? found.lastVisit.createdAt)}` : formatPhone(found.phone)}
            </GT>
          </View>
          <WalletBadge amount={found.walletBalance} />
        </GlassCard>
      </Press>
      {!me ? (
        <Pressable onPress={onTopUp} accessibilityRole="button" accessibilityLabel="Top up wallet" style={{ alignSelf: "flex-end", flexDirection: "row", alignItems: "center", gap: 6 }} hitSlop={8}>
          <Icon name="wallet" color={glass.gold2} size={18} />
          <GT size={13.5} w="bold" c={glass.gold2}>
            Top up wallet
          </GT>
        </Pressable>
      ) : null}
      {found.openVisit ? (
        <GlassCard style={{ padding: 14, gap: 10 }}>
          <GT size={15} w="heavy">
            Already in the chair since {istTime(found.openVisit.createdAt)}
          </GT>
          <GT size={12.5} c={glass.soft}>
            Open the visit to add services or take payment.
          </GT>
          <GoldButton label="Open their visit" onPress={() => nav.replace({ name: "visit", id: found.openVisit!.id })} />
        </GlassCard>
      ) : (
        <>
          <ServicePicker {...pick} staff={data.staff} onChange={setPick} />
          <GT size={12} c={glass.faint} style={{ textAlign: "center", marginTop: 6 }}>
            Payment is taken after the service. You can add more then.
          </GT>
          <GoldButton label={!pick.serviceIds.length ? "Pick a service" : !pick.staffId ? "Pick a stylist" : `Start visit · ${inr(total)}`} disabled={!pick.serviceIds.length || !pick.staffId} onPress={start} />
        </>
      )}
    </>
  );
}


