import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily, outline } from "../style";

export type WantedHookProps = {
  readonly hook: string;
  // 1–5 stars, filled one by one.
  readonly stars: number;
  readonly siren: boolean;
  readonly transparent: boolean;
};

const GOLD = "#FFC93C";

// Chase-moment hook: a slanted hook band at the top, a wanted-level star meter that fills
// star by star, and an optional red/blue siren glow on the frame edges for the first seconds.
// Original styling — no game logos or fonts.
export const WantedHook: React.FC<WantedHookProps> = ({
  hook,
  stars,
  siren,
  transparent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const band = spring({ frame, fps, config: { damping: 16, stiffness: 180 } });
  const count = Math.max(1, Math.min(5, Math.round(stars)));

  // Siren alternates red/blue every 6 frames and fades out after ~2.5s.
  const sirenFade = interpolate(frame, [fps * 2, fps * 2.6], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const red = Math.floor(frame / 6) % 2 === 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: transparent ? "transparent" : "#111",
        fontFamily,
      }}
    >
      {siren ? (
        <AbsoluteFill
          style={{
            boxShadow: `inset 0 0 160px 40px ${red ? "rgba(255,40,40,0.75)" : "rgba(40,110,255,0.75)"}`,
            opacity: sirenFade,
          }}
        />
      ) : null}

      <div
        style={{
          position: "absolute",
          top: 230,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
        }}
      >
        <div
          style={{
            transform: `translateX(${interpolate(band, [0, 1], [-1200, 0])}px) skewX(-8deg)`,
            background: "rgba(8,8,8,0.88)",
            borderLeft: `14px solid ${GOLD}`,
            padding: "18px 40px 14px",
            maxWidth: 960,
            boxShadow: "0 12px 0 rgba(0,0,0,0.55)",
          }}
        >
          <div
            style={{
              transform: "skewX(8deg)",
              fontSize: 92,
              lineHeight: 1.04,
              color: "#fff",
              textTransform: "uppercase",
              textAlign: "center",
              textShadow: outline(5),
              textWrap: "balance",
            }}
          >
            {hook}
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {Array.from({ length: 5 }).map((_, i) => {
            const on = i < count;
            const pop = spring({
              frame: frame - Math.round(fps * 0.5) - i * 5,
              fps,
              config: { damping: 9, stiffness: 260 },
            });
            // Stays at rest size until its turn, then pops from big to rest as it lights.
            const started = on && frame >= Math.round(fps * 0.5) + i * 5;
            const lit = started && pop > 0.35;
            return (
              <Star
                key={i}
                size={96}
                fill={lit ? GOLD : "rgba(255,255,255,0.18)"}
                scale={started ? interpolate(pop, [0, 1], [1.6, 1]) : 1}
                glow={lit}
              />
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Star: React.FC<{ size: number; fill: string; scale: number; glow: boolean }> = ({
  size,
  fill,
  scale,
  glow,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{
      transform: `scale(${scale})`,
      filter: glow
        ? `drop-shadow(0 0 14px ${GOLD}) drop-shadow(0 4px 0 #000)`
        : "drop-shadow(0 4px 0 rgba(0,0,0,0.6))",
    }}
  >
    <path
      d="M12 1.8l3.1 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.6l-6.4 3.6 1.5-7.1L1.7 9.2l7.2-.8z"
      fill={fill}
      stroke="#000"
      strokeWidth={1.4}
      strokeLinejoin="round"
    />
  </svg>
);
