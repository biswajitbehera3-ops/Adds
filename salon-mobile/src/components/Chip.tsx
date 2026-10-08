import { View } from "react-native";
import { color, font, radius, space } from "../theme/tokens";
import { Icon } from "./Icon";
import { Press } from "./Press";
import { T } from "./T";

/** Selectable option. Selected = chocolate ink; suggested (upsell) = seal outline. */
export function Chip({
  label,
  sub,
  selected,
  suggested,
  onPress,
  grow,
}: {
  label: string;
  sub?: string;
  selected?: boolean;
  suggested?: boolean;
  onPress: () => void;
  grow?: boolean;
}) {
  const fg = selected ? color.paper : color.ink;
  return (
    <Press
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!selected }}
      accessibilityLabel={sub ? `${label}, ${sub}` : label}
      style={{
        flexGrow: grow ? 1 : 0,
        minHeight: 52,
        paddingHorizontal: space.md + 2,
        paddingVertical: space.sm,
        borderRadius: radius.control,
        borderWidth: 1.25,
        borderColor: selected ? color.choc : suggested ? color.seal : color.ruleSoft,
        borderStyle: suggested && !selected ? "dashed" : "solid",
        backgroundColor: selected ? color.choc : color.paperLight,
        justifyContent: "center",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {selected ? <Icon name="check" size={16} color={color.sealBright} strokeWidth={2.25} /> : null}
        <T style={{ fontFamily: font.semibold, fontSize: 15.5, lineHeight: 20 }} c={fg}>
          {label}
        </T>
      </View>
      {sub ? (
        <T v="small" c={selected ? color.creamMuted : suggested ? color.seal : color.inkMuted} style={{ fontVariant: ["tabular-nums"] }}>
          {sub}
        </T>
      ) : null}
    </Press>
  );
}
