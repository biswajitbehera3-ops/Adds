import { ActivityIndicator, View } from "react-native";
import { color, font, radius, space } from "../theme/tokens";
import { Icon, type IconName } from "./Icon";
import { Press } from "./Press";
import { T } from "./T";

type Kind = "seal" | "ink" | "outline" | "ghost" | "outlineCream";

const look: Record<Kind, { bg: string; fg: string; border?: string }> = {
  seal: { bg: color.seal, fg: color.paperLight },
  ink: { bg: color.choc, fg: color.paper },
  outline: { bg: "transparent", fg: color.ink, border: color.ink },
  outlineCream: { bg: "transparent", fg: color.cream, border: color.creamMuted },
  ghost: { bg: "transparent", fg: color.ink },
};

export function Button({
  label,
  onPress,
  kind = "seal",
  icon,
  disabled,
  busy,
  big,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  kind?: Kind;
  icon?: IconName;
  disabled?: boolean;
  busy?: boolean;
  big?: boolean;
  accessibilityLabel?: string;
}) {
  const l = look[kind];
  return (
    <Press
      onPress={onPress}
      disabled={disabled || busy}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled, busy: !!busy }}
      style={{
        minHeight: big ? 60 : 50,
        paddingHorizontal: space.xl,
        borderRadius: radius.control,
        backgroundColor: l.bg,
        borderWidth: l.border ? 1.25 : 0,
        borderColor: l.border,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: space.sm,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {busy ? (
        <ActivityIndicator color={l.fg} />
      ) : (
        <>
          {icon ? <Icon name={icon} color={l.fg} size={20} /> : null}
          <T style={{ fontFamily: font.semibold, fontSize: big ? 18 : 16, letterSpacing: 0.2 }} c={l.fg}>
            {label}
          </T>
        </>
      )}
    </Press>
  );
}

export function IconButton({ icon, onPress, label, tint = color.ink }: { icon: IconName; onPress: () => void; label: string; tint?: string }) {
  return (
    <Press onPress={onPress} accessibilityLabel={label} hitSlop={8} style={{ width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 24 }}>
      <View>
        <Icon name={icon} color={tint} size={24} />
      </View>
    </Press>
  );
}
