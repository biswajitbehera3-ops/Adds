import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { RED, fontFamily, outline } from "./style";

export type CountdownProps = {
  readonly seconds: number;
  readonly label: string;
  readonly transparent: boolean;
};

// Digital challenge timer. Counts down in real time; the last 3 seconds turn red and pulse,
// then "TIME!" slams in. Sits top-centre, under the platform's top bar.
export const Countdown: React.FC<CountdownProps> = ({
  seconds,
  label,
  transparent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = frame / fps;
  const left = Math.max(0, seconds - elapsed);
  const done = left <= 0;
  const whole = Math.ceil(left);
  const mm = String(Math.floor(whole / 60)).padStart(2, "0");
  const ss = String(whole % 60).padStart(2, "0");

  const enter = spring({ frame, fps, config: { damping: 200 } });
  const urgent = !done && left <= 3;
  // Pulse once per second during the final three.
  const beat = urgent ? 1 + 0.08 * Math.max(0, 1 - (elapsed % 1) * 4) : 1;
  const doneFrame = Math.round(seconds * fps);
  const slam = spring({
    frame: frame - doneFrame,
    fps,
    config: { damping: 9, stiffness: 220 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: transparent ? "transparent" : "#111",
        alignItems: "center",
        fontFamily,
      }}
    >
      <div
        style={{
          marginTop: 230,
          opacity: enter,
          transform: `translateY(${interpolate(enter, [0, 1], [-60, 0])}px) scale(${beat})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {label ? (
          <div
            style={{
              fontSize: 54,
              color: "#fff",
              textShadow: outline(5),
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            {label}
          </div>
        ) : null}
        <div
          style={{
            background: "rgba(10,10,10,0.92)",
            border: `6px solid ${urgent || done ? RED : "#2a2a2a"}`,
            borderRadius: 22,
            padding: "6px 34px",
            boxShadow: "0 12px 0 rgba(0,0,0,0.6)",
          }}
        >
          <div
            style={{
              fontSize: 170,
              letterSpacing: 6,
              color: urgent || done ? RED : "#FF5A4E",
              textShadow: `0 0 28px ${RED}`,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {mm}:{ss}
          </div>
        </div>
        {done ? (
          <div
            style={{
              marginTop: 24,
              fontSize: 150,
              color: "#fff",
              textShadow: `${outline(9)}, 0 12px 0 #000`,
              transform: `scale(${interpolate(slam, [0, 1], [2.2, 1])})`,
              opacity: slam,
            }}
          >
            TIME!
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
