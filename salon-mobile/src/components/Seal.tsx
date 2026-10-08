import { View } from "react-native";
import Svg, { Defs, Ellipse, Path, Text as SvgText, TextPath } from "react-native-svg";
import { inr } from "../format";
import { color, font } from "../theme/tokens";
import { T } from "./T";

/**
 * The wax seal: an oval medallion that carries money. Arced caption on top,
 * the amount set in Rozha in the middle.
 */
export function Seal({ amount, caption = "WALLET", width = 132, tone = "seal" }: { amount: number; caption?: string; width?: number; tone?: "seal" | "paper" }) {
  const h = width * 0.72;
  const fill = tone === "seal" ? color.seal : color.paper;
  const ink = tone === "seal" ? color.paperLight : color.seal;
  const rx = width / 2 - 1;
  const ry = h / 2 - 1;
  // Arc for the caption: the upper part of an inner ellipse.
  // Text sits outside its path, so inset the path by the dashed ring plus a cap height.
  const capFont = width * 0.066;
  const arcRx = rx - 12 - capFont;
  const arcRy = ry - 12 - capFont;
  const cx = width / 2;
  const cy = h / 2;
  const arc = `M ${cx - arcRx} ${cy} A ${arcRx} ${arcRy} 0 0 1 ${cx + arcRx} ${cy}`;
  const size = amount >= 100000 ? 0.15 : amount >= 10000 ? 0.17 : 0.2;
  return (
    <View style={{ width, height: h, alignItems: "center", justifyContent: "center" }} accessible accessibilityLabel={`${caption.toLowerCase()} ${inr(amount)}`}>
      <Svg width={width} height={h} style={{ position: "absolute" }}>
        <Defs>
          <Path id="sealArc" d={arc} />
        </Defs>
        <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} />
        <Ellipse cx={cx} cy={cy} rx={rx - 4} ry={ry - 4} fill="none" stroke={ink} strokeWidth={1} />
        <Ellipse cx={cx} cy={cy} rx={rx - 7} ry={ry - 7} fill="none" stroke={ink} strokeWidth={0.75} strokeDasharray="1.5 2.5" />
        <SvgText fill={ink} fontSize={capFont} fontFamily={font.semibold} letterSpacing={width * 0.016}>
          <TextPath href="#sealArc" startOffset="50%" textAnchor="middle">
            {caption}
          </TextPath>
        </SvgText>
      </Svg>
      <T v="amount" c={ink} style={{ fontSize: width * size, lineHeight: width * size * 1.25, marginTop: h * 0.14 }} numberOfLines={1}>
        {inr(amount)}
      </T>
    </View>
  );
}
