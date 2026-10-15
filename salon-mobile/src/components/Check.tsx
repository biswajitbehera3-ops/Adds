import { View } from "react-native";
import { color, space } from "../theme/tokens";
import { Icon } from "./Icon";
import { Press } from "./Press";
import { T } from "./T";

/** A labelled checkbox. Never pre-ticked by callers: consent must be a clear, active choice. */
export function Check({ checked, onChange, label, hint }: { checked: boolean; onChange: (next: boolean) => void; label: string; hint?: string }) {
  return (
    <Press
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={hint ? `${label}. ${hint}` : label}
      scaleTo={0.99}
      style={{ flexDirection: "row", gap: space.md, alignItems: "flex-start", paddingVertical: space.xs, minHeight: 44 }}
    >
      <View style={{ width: 26, height: 26, borderRadius: 6, borderWidth: 1.5, borderColor: color.ink, backgroundColor: checked ? color.choc : color.paperLight, alignItems: "center", justifyContent: "center", marginTop: 1 }}>
        {checked ? <Icon name="check" color={color.sealBright} size={18} strokeWidth={2.5} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <T v="body">{label}</T>
        {hint ? (
          <T v="small" c={color.inkMuted}>
            {hint}
          </T>
        ) : null}
      </View>
    </Press>
  );
}
