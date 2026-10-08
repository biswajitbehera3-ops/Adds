import { Text, type TextProps, type TextStyle } from "react-native";
import { color, font } from "../theme/tokens";

type Variant = "display" | "title" | "heading" | "amount" | "body" | "bodyStrong" | "label" | "small";

const styles: Record<Variant, TextStyle> = {
  display: { fontFamily: font.display, fontSize: 40, lineHeight: 46, letterSpacing: -0.4 },
  title: { fontFamily: font.display, fontSize: 28, lineHeight: 34, letterSpacing: -0.2 },
  heading: { fontFamily: font.display, fontSize: 21, lineHeight: 27 },
  amount: { fontFamily: font.display, fontSize: 24, lineHeight: 30, fontVariant: ["tabular-nums"] },
  body: { fontFamily: font.regular, fontSize: 16, lineHeight: 23 },
  bodyStrong: { fontFamily: font.semibold, fontSize: 16, lineHeight: 23 },
  label: { fontFamily: font.semibold, fontSize: 12.5, lineHeight: 16, letterSpacing: 1.1, textTransform: "uppercase" },
  small: { fontFamily: font.medium, fontSize: 13.5, lineHeight: 18 },
};

export function T({ v = "body", c = color.ink, style, ...rest }: TextProps & { v?: Variant; c?: string }) {
  return <Text {...rest} style={[styles[v], { color: c }, style]} />;
}
