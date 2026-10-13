import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import config from "../config/salon";
import { upsellsForServices } from "../domain/rules";
import type { Staff } from "../domain/types";
import { inr } from "../format";
import { color, space } from "../theme/tokens";
import { Chip } from "./Chip";
import { SectionTitle } from "./Screen";
import { T } from "./T";

/** Services (any number), add-ons with suggestions for the chosen services, and the stylist. */
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
  const suggested = upsellsForServices(serviceIds).map((a) => a.id);
  const addOnList = [...config.addOns].sort((a, b) => Number(suggested.includes(b.id)) - Number(suggested.includes(a.id)));
  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  return (
    <View>
      <SectionTitle aside={<T v="small" c={color.inkMuted}>pick one or more</T>}>Services</SectionTitle>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
        {config.services.map((s) => (
          <Chip
            key={s.id}
            label={s.name}
            sub={inr(s.price)}
            selected={serviceIds.includes(s.id)}
            onPress={() => onChange({ serviceIds: toggle(serviceIds, s.id), addOnIds, staffId })}
          />
        ))}
      </View>

      {serviceIds.length ? (
        <Animated.View entering={FadeIn.duration(200)}>
          <SectionTitle aside={suggested.length ? <T v="small" c={color.seal}>Suggested for these services</T> : undefined}>Add-ons</SectionTitle>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
            {addOnList.map((a) => (
              <Chip
                key={a.id}
                label={a.name}
                sub={`+${inr(a.price)}`}
                suggested={suggested.includes(a.id)}
                selected={addOnIds.includes(a.id)}
                onPress={() => onChange({ serviceIds, addOnIds: toggle(addOnIds, a.id), staffId })}
              />
            ))}
          </View>
        </Animated.View>
      ) : null}

      <SectionTitle>Stylist</SectionTitle>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
        {staff.filter((s) => s.active).map((s) => (
          <Chip key={s.id} grow label={s.name.split(" ")[0]} sub={s.chair} selected={staffId === s.id} onPress={() => onChange({ serviceIds, addOnIds, staffId: s.id })} />
        ))}
      </View>
    </View>
  );
}
