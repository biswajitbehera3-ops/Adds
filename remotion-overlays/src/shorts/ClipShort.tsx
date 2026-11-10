import {
  AbsoluteFill,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GREEN, RED, fontFamily, outline } from "../style";

// Reusable vertical Short built on a prepared 1080×1920 base video (gameplay in a 16:9 band at
// y=656–1264 over a blurred fill — see README "Making a Short"). Everything is driven by props
// so each new clip only needs new timings.

export type Caption = {
  readonly text: string;
  readonly start: number; // seconds
  readonly end: number;
  readonly highlight: string; // word to paint green, "" = none
};

export type Stamp = {
  readonly text: string;
  readonly start: number;
  readonly end: number;
  readonly tone: "fail" | "win";
};

export type ClipShortProps = {
  readonly src: string; // file in public/, e.g. "clips/battleking-scram-base.mp4"
  readonly hook: string;
  readonly hookSeconds: number;
  readonly captions: Caption[];
  readonly stamps: Stamp[];
  readonly punches: number[]; // seconds where the frame zoom-punches
  readonly credit: string;
};

const BAND_TOP = 656;
const BAND_BOTTOM = 1264;

export const ClipShort: React.FC<ClipShortProps> = ({
  src,
  hook,
  hookSeconds,
  captions,
  stamps,
  punches,
  credit,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Zoom-punch on the whole frame: fast spring in, short shake, ease back.
  let scale = 1;
  let shake = 0;
  for (const p of punches) {
    const f = frame - Math.round(p * fps);
    if (f < 0 || f > fps) continue;
    const hit = spring({ frame: f, fps, config: { damping: 9, stiffness: 300 } });
    const release = interpolate(f, [fps * 0.45, fps], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    scale = Math.max(scale, 1 + 0.12 * hit * (1 - release));
    if (f < fps * 0.25) shake += Math.sin(f * 3.1) * 12 * (1 - f / (fps * 0.25));
  }

  const activeStamp = stamps.find((s) => t >= s.start && t < s.end);
  const activeCaption = activeStamp
    ? undefined
    : captions.find((c) => t >= c.start && t < c.end);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", fontFamily, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `translateX(${shake}px) scale(${scale})`,
          transformOrigin: `50% ${(BAND_TOP + BAND_BOTTOM) / 2}px`,
        }}
      >
        <OffthreadVideo src={staticFile(src)} />
      </AbsoluteFill>

      {t < hookSeconds ? <Hook text={hook} /> : null}
      {activeCaption ? <CaptionView c={activeCaption} /> : null}
      {activeStamp ? <StampView s={activeStamp} /> : null}

      <div
        style={{
          position: "absolute",
          top: 140,
          width: "100%",
          textAlign: "center",
          fontSize: 34,
          color: "rgba(255,255,255,0.85)",
          textShadow: outline(3),
          letterSpacing: 1,
        }}
      >
        {credit}
      </div>
    </AbsoluteFill>
  );
};

const Hook: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 14, stiffness: 200 } });
  return (
    <div
      style={{
        position: "absolute",
        top: 250,
        left: 50,
        right: 50,
        display: "flex",
        justifyContent: "center",
        transform: `scale(${interpolate(s, [0, 1], [0.7, 1])})`,
        opacity: s,
      }}
    >
      <div
        style={{
          background: "rgba(8,8,8,0.88)",
          borderLeft: `14px solid ${RED}`,
          padding: "18px 34px 12px",
          fontSize: 86,
          lineHeight: 1.05,
          color: "#fff",
          textAlign: "center",
          textTransform: "uppercase",
          textShadow: outline(5),
          textWrap: "balance",
          boxShadow: "0 12px 0 rgba(0,0,0,0.55)",
        }}
      >
        {text}
      </div>
    </div>
  );
};

const CaptionView: React.FC<{ c: Caption }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame: frame - Math.round(c.start * fps),
    fps,
    config: { damping: 12, stiffness: 260 },
  });
  const hl = c.highlight.toLowerCase().replace(/[^a-z0-9$']/g, "");
  const words = c.text.split(/\s+/);
  return (
    <div
      style={{
        position: "absolute",
        top: BAND_BOTTOM + 70,
        left: 50,
        right: 50,
        textAlign: "center",
        fontSize: 104,
        lineHeight: 1.05,
        textTransform: "uppercase",
        textShadow: `${outline(8)}, 0 10px 0 #000`,
        transform: `scale(${interpolate(pop, [0, 1], [0.6, 1])})`,
        textWrap: "balance",
      }}
    >
      {words.map((w, i) => (
        <span
          key={i}
          style={{
            color:
              hl && w.toLowerCase().replace(/[^a-z0-9$']/g, "") === hl ? GREEN : "#fff",
          }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </div>
  );
};

const StampView: React.FC<{ s: Stamp }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slam = spring({
    frame: frame - Math.round(s.start * fps),
    fps,
    config: { damping: 10, stiffness: 240 },
  });
  const color = s.tone === "win" ? GREEN : RED;
  return (
    <div
      style={{
        position: "absolute",
        top: BAND_BOTTOM + 40,
        left: "-9%",
        width: "118%",
        transform: `rotate(-4deg) scale(${interpolate(slam, [0, 1], [1.9, 1])})`,
        opacity: Math.min(1, slam * 1.5),
        background: "rgba(5,5,5,0.92)",
        borderTop: `10px solid ${color}`,
        borderBottom: `10px solid ${color}`,
        padding: "22px 0 14px",
        textAlign: "center",
        fontSize: 132,
        lineHeight: 1,
        color,
        textTransform: "uppercase",
        letterSpacing: 3,
        textShadow: `${outline(7)}, 0 0 40px ${color}`,
      }}
    >
      {s.text}
    </div>
  );
};
