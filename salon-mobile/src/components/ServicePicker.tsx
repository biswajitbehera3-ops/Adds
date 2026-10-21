/**
 * Services (any number), suggested add-ons for the chosen services (dashed, as approved) and
 * the stylist, in brown glass. Used when a customer walks in and on the bill.
 */
import { Pressable, View } from "react-native";
import Animated, { FadeIn, useReducedMotion } from "react-native-reanimated";
import config from "../config/salon";
import { upsellsForServices } from "../domain/rules";
import type { Staff } from "../domain/types";
import { inr } from "../format";
import { glass } from "../theme/tokens";
import { GT, SectionLabel } from "./glass";

export function ServicePicker({
  serviceIds,
  addOnIds,
  staffId,
  staff,
  onChange,
}: {
  serviceIds: string[];
  addOnIds: string[];
  staffId: string | null;
  staff: Staff[];
  onChange: (next: { serviceIds: string[]; addOnIds: string[]; staffId: string | null }) => void;
}) {
  const reduced = useReducedMotion();
  const suggested = upsellsForServices(serviceIds).map((a) => a.id);
  const addOnList = config.addOns.filter((a) => a.active !== false).sort((a, b) => Number(suggested.includes(b.id)) - Number(suggested.includes(a.id)));
  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  return (
    <View style={{ gap: 10 }}>
      <SectionLabel>Services</SectionLabel>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {config.services.filter((s) => s.active !== false || serviceIds.includes(s.id)).map((s) => (
          <Pill key={s.id} label={s.name} sub={inr(s.price)} on={serviceIds.includes(s.id)} onPress={() => onChange({ serviceIds: toggle(serviceIds, s.id), addOnIds, staffId })} />
        ))}
      </View>
      {serviceIds.length ? (
        <Animated.View entering={reduced ? undefined : FadeIn.duration(200)} style={{ gap: 10 }}>
          <SectionLabel>{suggested.length ? "Suggested add-ons" : "Add-ons"}</SectionLabel>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {addOnList.map((a) => (
              <Pill key={a.id} label={a.name} sub={`+${inr(a.price)}`} dashed={suggested.includes(a.id)} on={addOnIds.includes(a.id)} onPress={() => onChange({ serviceIds, addOnIds: toggle(addOnIds, a.id), staffId })} />
            ))}
          </View>
        </Animated.View>
      ) : null}
      <SectionLabel>Stylist</SectionLabel>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {staff.filter((s) => s.active).map((s) => (
          <Pill key={s.id} label={s.name.split(" ")[0]} sub={s.chair} on={staffId === s.id} onPress={() => onChange({ serviceIds, addOnIds, staffId: s.id })} />
        ))}
      </View>
    </View>
  );
}

export function Pill({ label, sub, on, dashed, onPress }: { label: string; sub?: string; on: boolean; dashed?: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: on }}
      accessibilityLabel={`${label}${sub ? `, ${sub}` : ""}${dashed ? ", suggested" : ""}`}
      style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: on ? glass.cream : "rgba(255,244,236,0.06)", borderWidth: 1.2, borderStyle: dashed && !on ? "dashed" : "solid", borderColor: on ? glass.cream : dashed ? glass.gold2 : glass.line }}
    >
      <GT size={14} w="bold" c={on ? glass.ink : glass.cream}>
        {label}
      </GT>
      {sub ? (
        <GT size={11.5} c={on ? "rgba(42,26,18,0.7)" : glass.soft}>
          {sub}
        </GT>
      ) : null}
    </Pressable>
  );
}
