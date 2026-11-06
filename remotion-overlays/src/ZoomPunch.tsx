import {
  AbsoluteFill,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type Punch = {
  readonly atSec: number;
  // Peak zoom, e.g. 1.25 = 25% in.
  readonly scale: number;
};

export type ZoomPunchProps = {
  // Clip in public/, e.g. "clips/clip_01.mp4".
  readonly src: string;
  readonly punches: Punch[];
  readonly flash: boolean;
};

// Applies zoom-punches to a real clip: a fast spring zoom-in with a short shake and an optional
// white flash, then eases back out. Use on the money line, the reveal, or the reaction.
export const ZoomPunch: React.FC<ZoomPunchProps> = ({ src, punches, flash }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let scale = 1;
  let shakeX = 0;
  let shakeY = 0;
  let flashOpacity = 0;
  for (const p of punches) {
    const start = Math.round(p.atSec * fps);
    const t = frame - start;
    if (t < 0 || t > fps * 1.2) continue;
    const hit = spring({ frame: t, fps, config: { damping: 9, stiffness: 300 } });
    const release = interpolate(t, [fps * 0.55, fps * 1.2], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    scale = Math.max(scale, 1 + (p.scale - 1) * hit * (1 - release));
    if (t < fps * 0.25) {
      const k = 1 - t / (fps * 0.25);
      shakeX += Math.sin(t * 3.1) * 14 * k;
      shakeY += Math.cos(t * 2.7) * 10 * k;
    }
    if (flash) flashOpacity = Math.max(flashOpacity, interpolate(t, [0, 4], [0.55, 0], { extrapolateRight: "clamp" }));
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill
        style={{ transform: `translate(${shakeX}px, ${shakeY}px) scale(${scale})` }}
      >
        <OffthreadVideo src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "#fff", opacity: flashOpacity }} />
    </AbsoluteFill>
  );
};
