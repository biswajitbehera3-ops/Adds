import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily, outline } from "./style";

export type MoneyCounterProps = {
  readonly amount: number;
  readonly label: string;
  readonly transparent: boolean;
};

// Stakes-first hook overlay for vertical clips: the number counts up,
// lands with a punch, and the label slides in under it.
export const MoneyCounter: React.FC<MoneyCounterProps> = ({
  amount,
  label,
  transparent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const countEnd = Math.round(fps * 1.2);
  const progress = interpolate(frame, [0, countEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const value = Math.round(amount * progress);

  const enter = spring({ frame, fps, config: { damping: 200 } });
  const punch = spring({
    frame: frame - countEnd,
    fps,
    config: { damping: 8, stiffness: 180 },
  });
  const scale = interpolate(enter, [0, 1], [0.85, 1]) + punch * 0.08 - (frame > countEnd ? 0.08 * Math.min(1, (frame - countEnd) / (fps * 0.4)) : 0);

  const labelIn = spring({ frame: frame - countEnd, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: transparent ? "transparent" : "#111",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 360,
        fontFamily,
      }}
    >
      <div
        style={{
          fontSize: 190,
          color: "#3CFF6B",
          transform: `scale(${scale})`,
          opacity: enter,
          textShadow: `${outline(9)}, 0 14px 0 #000`,
          letterSpacing: 2,
        }}
      >
        ${value.toLocaleString("en-US")}
      </div>
      <div
        style={{
          marginTop: 20,
          fontSize: 76,
          color: "#fff",
          textShadow: outline(6),
          opacity: labelIn,
          transform: `translateY(${interpolate(labelIn, [0, 1], [40, 0])}px)`,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </AbsoluteFill>
  );
};
