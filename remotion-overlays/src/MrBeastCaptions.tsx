import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GREEN, fontFamily, outline } from "./style";

export type CaptionChunk = {
  readonly text: string;
  readonly startMs: number;
  readonly endMs: number;
  // Word (case-insensitive) inside `text` to paint green. Empty = none.
  readonly highlight: string;
};

export type MrBeastCaptionsProps = {
  readonly chunks: CaptionChunk[];
  readonly transparent: boolean;
};

// 1–3 word caps captions, one chunk at a time, key word in green, pop-in on each chunk.
// Sits at 62% height: below faces, above the Reels/Shorts caption + button area.
export const MrBeastCaptions: React.FC<MrBeastCaptionsProps> = ({
  chunks,
  transparent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;

  const active = chunks.find((c) => ms >= c.startMs && ms < c.endMs);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: transparent ? "transparent" : "#111",
        fontFamily,
      }}
    >
      {active ? (
        <Chunk chunk={active} startFrame={Math.round((active.startMs / 1000) * fps)} />
      ) : null}
    </AbsoluteFill>
  );
};

const Chunk: React.FC<{ chunk: CaptionChunk; startFrame: number }> = ({
  chunk,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 12, stiffness: 260 },
  });
  const scale = interpolate(pop, [0, 1], [0.6, 1]);
  const words = chunk.text.split(/\s+/);
  const hl = chunk.highlight.toLowerCase();

  return (
    <div
      style={{
        position: "absolute",
        top: "62%",
        left: 60,
        right: 60,
        textAlign: "center",
        transform: `translateY(-50%) scale(${scale})`,
        fontSize: 118,
        lineHeight: 1.05,
        textTransform: "uppercase",
        textShadow: `${outline(8)}, 0 10px 0 #000`,
        color: "#fff",
      }}
    >
      {words.map((w, i) => (
        <span
          key={i}
          style={{
            color:
              hl && w.toLowerCase().replace(/[^a-z0-9$,]/g, "") ===
                hl.replace(/[^a-z0-9$,]/g, "")
                ? GREEN
                : "#fff",
          }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </div>
  );
};
