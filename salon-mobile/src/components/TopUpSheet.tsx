/**
 * Wallet top-up (BUILD-SPEC 4.13), brown glass bottom sheet: pick an amount (bonus shown on
 * each), or type one, pick how they paid, and see the new balance and the next bonus tier.
 * Swipe down or tap outside to close (motion R8).
 */
import { useEffect, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import config from "../config/salon";
import * as E from "../domain/engine";
import { UserError } from "../domain/errors";
import { topUpBonus } from "../domain/rules";
import { commit } from "../domain/store";
import type { Customer, PaymentMethod } from "../domain/types";
import { inr } from "../format";
import { glass, urbanist } from "../theme/tokens";
import { GlassSheet, GlassSwitch, GoldButton, GT } from "./glass";
import { useToast } from "./Toast";

const AMOUNTS = [500, 1000, 2000, 5000];

export function TopUpSheet({ customer, visible, onClose, onDone }: { customer: Customer; visible: boolean; onClose: () => void; onDone?: (balance: number, bonus: number) => void }) {
  const toast = useToast();
  const [amount, setAmount] = useState(1000);
  const [custom, setCustom] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("UPI");
  useEffect(() => {
    if (!visible) return;
    setAmount(1000);
    setCustom("");
  }, [visible]);
  const value = custom ? parseInt(custom, 10) || 0 : amount;
  const bonus = topUpBonus(value);
  const nextTier = config.topUpTiers.filter((t) => t.minDeposit > value).sort((a, b) => a.minDeposit - b.minDeposit)[0];
  const submit = () => {
    try {
      const r = commit((d) => E.topUp(d, { customerId: customer.id, amount: value, method }));
      toast(`Added ${inr(r.deposit)}${r.bonus ? ` + ${inr(r.bonus)} bonus` : ""}`);
      onDone?.(r.balance, r.bonus);
      onClose();
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't add money. Try again.", "error");
    }
  };
  return (
    <GlassSheet open={visible} onClose={onClose} label="Top up wallet">
      <View style={{ paddingHorizontal: 20, paddingBottom: 24, gap: 14 }}>
        <View>
          <GT size={22} w="heavy">
            Top up wallet
          </GT>
          <GT size={13} c={glass.soft}>
            {customer.name} · balance {inr(customer.walletBalance)}
          </GT>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {AMOUNTS.map((a) => {
            const on = !custom && amount === a;
            return (
              <Pressable key={a} onPress={() => (setCustom(""), setAmount(a))} accessibilityRole="radio" accessibilityState={{ selected: on }} style={{ flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 16, backgroundColor: on ? glass.gold : glass.card, borderWidth: 1, borderColor: on ? glass.gold : glass.line }}>
                <GT size={15} w="heavy" c={on ? glass.ink : glass.cream}>
                  {inr(a)}
                </GT>
                <GT size={11} c={on ? "rgba(42,26,18,0.75)" : glass.soft}>
                  {topUpBonus(a) ? `+${inr(topUpBonus(a))}` : "no bonus"}
                </GT>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          value={custom}
          onChangeText={(t) => setCustom(t.replace(/\D/g, "").slice(0, 6))}
          placeholder="Other amount"
          placeholderTextColor={glass.faint}
          keyboardType="number-pad"
          accessibilityLabel="Other amount in rupees"
          style={{ minHeight: 50, borderRadius: 14, paddingHorizontal: 14, fontFamily: urbanist.semibold, fontSize: 16, color: glass.cream, backgroundColor: "rgba(26,18,16,0.55)", borderWidth: 1, borderColor: custom ? glass.gold : glass.line }}
        />
        <GlassSwitch
          options={[
            { key: "CASH", label: "Cash" },
            { key: "UPI", label: "UPI" },
            { key: "CARD", label: "Card" },
          ]}
          value={method}
          onChange={setMethod}
        />
        <View style={{ gap: 2 }}>
          <GT size={15} w="heavy">
            {bonus > 0 ? `Bonus ${inr(bonus)} · new balance ${inr(customer.walletBalance + value + bonus)}` : `New balance ${inr(customer.walletBalance + value)}`}
          </GT>
          {nextTier ? (
            <GT size={12.5} c={glass.gold2}>
              Add {inr(nextTier.minDeposit - value)} more for a {nextTier.bonusPercent}% bonus
            </GT>
          ) : null}
        </View>
        <GoldButton label={value > 0 ? `Add ${inr(value)}` : "Choose an amount"} disabled={value <= 0} onPress={submit} />
      </View>
    </GlassSheet>
  );
}
