import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { RED, fontFamily, outline } from "./style";

export type Contestant = {
  readonly name: string;
  readonly color: string;
  // File in public/ (e.g. "faces/nolan.png"). Empty = coloured circle with initial.
  readonly image: string;
  // Seconds into the clip when they're out. Negative = never eliminated.
  readonly eliminatedAtSec: number;
};

export type ContestantTrackerProps = {
  readonly contestants: Contestant[];
  readonly transparent: boolean;
};

// "Who's left" row across the top, like MrBeast's own edits. When someone is eliminated
// their icon shakes, a red X slams on, and it fades to grey.
export const ContestantTracker: React.FC<ContestantTrackerProps> = ({
  contestants,
  transparent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const left = contestants.filter(
    (c) => c.eliminatedAtSec < 0 || frame / fps < c.eliminatedAtSec,
  ).length;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: transparent ? "transparent" : "#111",
        alignItems: "center",
        fontFamily,
      }}
    >
      <div style={{ marginTop: 200, display: "flex", gap: 22 }}>
        {contestants.map((c, i) => (
          <Icon key={c.name} c={c} index={i} />
        ))}
      </div>
      <div
        style={{
          marginTop: 18,
          fontSize: 58,
          color: "#fff",
          textShadow: outline(5),
          textTransform: "uppercase",
        }}
      >
        {left} left
      </div>
    </AbsoluteFill>
  );
};

const SIZE = 150;

const Icon: React.FC<{ c: Contestant; index: number }> = ({ c, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - index * 3, fps, config: { damping: 14 } });
  const eliminated = c.eliminatedAtSec >= 0;
  const since = eliminated ? frame - Math.round(c.eliminatedAtSec * fps) : -1;
  const out = eliminated && since >= 0;
  const x = out ? spring({ frame: since, fps, config: { damping: 10, stiffness: 240 } }) : 0;
  const shake = out && since < fps * 0.35 ? Math.sin(since * 2.4) * 10 * (1 - since / (fps * 0.35)) : 0;
  const grey = out ? interpolate(since, [0, fps * 0.4], [0, 1], { extrapolateRight: "clamp" }) : 0;

  return (
    <div
      style={{
        width: SIZE,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: `translateX(${shake}px) scale(${enter})`,
      }}
    >
      <div
        style={{
          position: "relative",
          width: SIZE,
          height: SIZE,
          borderRadius: "50%",
          border: `7px solid ${out ? "#555" : c.color}`,
          background: c.color,
          overflow: "hidden",
          boxShadow: "0 8px 0 rgba(0,0,0,0.55)",
          filter: `grayscale(${grey}) brightness(${1 - grey * 0.45})`,
        }}
      >
        {c.image ? (
          <Img src={staticFile(c.image)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 84,
              color: "#fff",
              textShadow: outline(4),
            }}
          >
            {c.name.slice(0, 1).toUpperCase()}
          </div>
        )}
      </div>
      {out ? (
        <div
          style={{
            position: "absolute",
            width: SIZE,
            height: SIZE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 170,
            lineHeight: 1,
            color: RED,
            textShadow: outline(6),
            transform: `scale(${interpolate(x, [0, 1], [2.4, 1])})`,
            opacity: x,
          }}
        >
          ✕
        </div>
      ) : null}
      <div
        style={{
          marginTop: 10,
          fontSize: 38,
          color: out ? "#aaa" : "#fff",
          textShadow: outline(4),
          textTransform: "uppercase",
        }}
      >
        {c.name}
      </div>
    </div>
  );
};
