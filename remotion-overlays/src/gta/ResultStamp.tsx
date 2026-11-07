import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GREEN, RED, fontFamily, outline } from "../style";

export type ResultStampProps = {
  // e.g. "PLAN FAILED", "STUNT LANDED", "HE GOT AWAY"
  readonly text: string;
  // Smaller line under it, e.g. "+$25,000" or "0 STARS LEFT". Empty = none.
  readonly subtext: string;
  readonly tone: "fail" | "win";
  readonly transparent: boolean;
};

// End-of-moment payoff stamp: the frame tints, a wide band slams in at a slight angle with the
// result, then the subtext drops underneath. Put it on the resolving beat.
export const ResultStamp: React.FC<ResultStampProps> = ({
  text,
  subtext,
  tone,
  transparent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const color = tone === "win" ? GREEN : RED;
  const slam = spring({ frame, fps, config: { damping: 10, stiffness: 240 } });
  const sub = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  const tint = interpolate(frame, [0, 4, fps * 0.8], [0, 0.35, 0.18], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: transparent ? "transparent" : "#111",
        fontFamily,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundColor: tone === "win" ? "rgba(20,140,60,1)" : "rgba(160,10,10,1)",
          opacity: tint,
        }}
      />
      <div
        style={{
          width: "118%",
          transform: `rotate(-4deg) scale(${interpolate(slam, [0, 1], [1.9, 1])})`,
          opacity: Math.min(1, slam * 1.5),
          background: "rgba(5,5,5,0.9)",
          borderTop: `10px solid ${color}`,
          borderBottom: `10px solid ${color}`,
          padding: "26px 0 18px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 150,
            lineHeight: 1,
            color,
            textTransform: "uppercase",
            letterSpacing: 4,
            textShadow: `${outline(7)}, 0 0 40px ${color}`,
          }}
        >
          {text}
        </div>
      </div>
      {subtext ? (
        <div
          style={{
            marginTop: 36,
            fontSize: 84,
            color: "#fff",
            textShadow: `${outline(6)}, 0 8px 0 #000`,
            opacity: sub,
            transform: `translateY(${interpolate(sub, [0, 1], [40, 0])}px)`,
            textTransform: "uppercase",
          }}
        >
          {subtext}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
