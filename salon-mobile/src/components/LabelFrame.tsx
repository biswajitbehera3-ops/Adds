import { View, type ViewProps, type ViewStyle } from "react-native";
import { color, radius } from "../theme/tokens";

/**
 * A printed label: paper ground inside a double rule — the outer hairline and an
 * inset rule 3px inside it, like a soap wrapper's border.
 */
export function LabelFrame({
  children,
  style,
  innerStyle,
  ground = color.paper,
  ink = color.rule,
  ...rest
}: ViewProps & { innerStyle?: ViewStyle; ground?: string; ink?: string }) {
  return (
    <View {...rest} style={[{ backgroundColor: ground, borderRadius: radius.label, borderWidth: 1, borderColor: ink, padding: 3 }, style]}>
      <View style={[{ flex: 1, borderWidth: 1, borderColor: ink, borderRadius: radius.label - 3, opacity: 1 }, innerStyle]}>{children}</View>
    </View>
  );
}
