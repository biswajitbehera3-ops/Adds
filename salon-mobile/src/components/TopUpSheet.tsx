import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, TextInput, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import config from "../config/salon";
import * as E from "../domain/engine";
import { UserError } from "../domain/errors";
import { topUpBonus } from "../domain/rules";
import { commit } from "../domain/store";
import type { Customer, PaymentMethod } from "../domain/types";
import { inr } from "../format";
import { color, font, radius, space } from "../theme/tokens";
import { Button } from "./Button";
import { Chip } from "./Chip";
import { Segmented } from "./Segmented";
import { T } from "./T";
import { useToast } from "./Toast";

const AMOUNTS = [500, 1000, 2000, 5000];

/** Bottom sheet for adding money to a wallet, with the tier bonus previewed live. */
export function TopUpSheet({ customer, visible, onClose, onDone }: { customer: Customer; visible: boolean; onClose: () => void; onDone?: (balance: number, bonus: number) => void }) {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const reduced = useReducedMotion();
  const [amount, setAmount] = useState(1000);
  const [custom, setCustom] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("UPI");
  const y = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      setAmount(1000);
      setCustom("");
      y.value = reduced ? withTiming(0, { duration: 120 }) : withSpring(0, { duration: 420, dampingRatio: 1 });
    } else y.value = 1;
  }, [visible, reduced, y]);

  const close = () => {
    y.value = withTiming(1, { duration: 200, easing: Easing.in(Easing.quad) });
    setTimeout(onClose, 190);
  };

  const value = custom ? parseInt(custom, 10) || 0 : amount;
  const bonus = topUpBonus(value);
  const nextTier = config.topUpTiers.filter((t) => t.minDeposit > value).sort((a, b) => a.minDeposit - b.minDeposit)[0];

  const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: y.value * 520 }] }));
  const scrim = useAnimatedStyle(() => ({ opacity: (1 - y.value) * 0.55 }));

  const submit = () => {
    try {
      const r = commit((d) => E.topUp(d, { customerId: customer.id, amount: value, method }));
      toast(`Added ${inr(r.deposit)}${r.bonus ? ` + ${inr(r.bonus)} bonus` : ""}`);
      onDone?.(r.balance, r.bonus);
      close();
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't add money. Try again.", "error");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: color.choc950 }, scrim]}>
        <Pressable style={{ flex: 1 }} onPress={close} accessibilityLabel="Close top-up" />
      </Animated.View>
      <Animated.View
        style={[
          { position: "absolute", left: 0, right: 0, bottom: 0, alignItems: "center" },
          sheet,
        ]}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 480,
            backgroundColor: color.paper,
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            padding: space.xl,
            paddingBottom: insets.bottom + space.xl,
            gap: space.lg,
          }}
        >
          <View style={{ alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: color.ruleSoft }} />
          <View>
            <T v="title">Top up wallet</T>
            <T v="body" c={color.inkMuted}>
              {customer.name} · balance {inr(customer.walletBalance)}
            </T>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
            {AMOUNTS.map((a) => (
              <Chip key={a} grow label={inr(a)} sub={topUpBonus(a) ? `+${inr(topUpBonus(a))}` : "no bonus"} selected={!custom && amount === a} onPress={() => (setCustom(""), setAmount(a))} />
            ))}
          </View>
          <TextInput
            selectionColor={color.seal}
            cursorColor={color.seal}
            value={custom}
            onChangeText={(t) => setCustom(t.replace(/\D/g, "").slice(0, 6))}
            placeholder="Other amount"
            placeholderTextColor={color.inkMuted}
            keyboardType="number-pad"
            accessibilityLabel="Other amount in rupees"
            style={{
              minHeight: 52,
              borderWidth: 1.25,
              borderColor: custom ? color.choc : color.ruleSoft,
              borderRadius: radius.control,
              paddingHorizontal: space.lg,
              fontFamily: font.semibold,
              fontSize: 17,
              color: color.ink,
              backgroundColor: color.paperLight,
            }}
          />
          <Segmented label="Paid by" value={method} onChange={setMethod} options={[{ key: "CASH", label: "Cash" }, { key: "UPI", label: "UPI" }, { key: "CARD", label: "Card" }]} />
          <View style={{ borderTopWidth: 1, borderTopColor: color.ruleSoft, paddingTop: space.md, gap: 2 }}>
            <T v="bodyStrong">
              {bonus > 0 ? `Bonus ${inr(bonus)} · new balance ${inr(customer.walletBalance + value + bonus)}` : `New balance ${inr(customer.walletBalance + value)}`}
            </T>
            {nextTier ? (
              <T v="small" c={color.seal}>
                Add {inr(nextTier.minDeposit - value)} more for a {nextTier.bonusPercent}% bonus
              </T>
            ) : null}
          </View>
          <Button big label={value > 0 ? `Add ${inr(value)}` : "Choose an amount"} disabled={value <= 0} onPress={submit} />
        </View>
      </Animated.View>
    </Modal>
  );
}
