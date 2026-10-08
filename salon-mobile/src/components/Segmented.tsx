import { View } from "react-native";
import { color, font, radius } from "../theme/tokens";
import { Press } from "./Press";
import { T } from "./T";

export function Segmented<K extends string>({ options, value, onChange, label }: { options: { key: K; label: string }[]; value: K; onChange: (k: K) => void; label: string }) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={{ flexDirection: "row", borderWidth: 1.25, borderColor: color.choc, borderRadius: radius.control, padding: 3, backgroundColor: color.paperLight }}
    >
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Press
            key={o.key}
            onPress={() => onChange(o.key)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            style={{ flex: 1, minHeight: 44, borderRadius: radius.control - 3, alignItems: "center", justifyContent: "center", backgroundColor: on ? color.choc : "transparent" }}
          >
            <T style={{ fontFamily: font.semibold, fontSize: 15 }} c={on ? color.paper : color.ink}>
              {o.label}
            </T>
          </Press>
        );
      })}
    </View>
  );
}
