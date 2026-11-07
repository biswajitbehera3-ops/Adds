import { AbsoluteFill } from "remotion";
import { fontFamily, outline } from "../style";

// Account branding stills for a gaming clip page. Original design: a gold star mark, a dark
// night-city gradient, bold condensed type. No game logos, fonts or official art, so the page
// never looks like an official account.

const GOLD = "#FFC93C";
const NIGHT = "radial-gradient(ellipse at 30% 20%, #ff2e88 0%, rgba(255,46,136,0) 45%), radial-gradient(ellipse at 80% 90%, #1fb8ff 0%, rgba(31,184,255,0) 50%), linear-gradient(160deg, #1a0b2e 0%, #07070c 100%)";

const StarMark: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ filter: `drop-shadow(0 0 ${size / 10}px ${GOLD}) drop-shadow(0 ${size / 40}px 0 #000)` }}>
    <path
      d="M12 1.8l3.1 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.6l-6.4 3.6 1.5-7.1L1.7 9.2l7.2-.8z"
      fill={GOLD}
      stroke="#000"
      strokeWidth={0.9}
      strokeLinejoin="round"
    />
  </svg>
);

export type AvatarProps = { readonly initials: string };

// 1080×1080 profile picture. Instagram and YouTube crop it to a circle, so everything sits in the
// centre 70%.
export const Avatar: React.FC<AvatarProps> = ({ initials }) => (
  <AbsoluteFill style={{ background: NIGHT, alignItems: "center", justifyContent: "center", fontFamily }}>
    <div style={{ position: "relative", width: 760, height: 760, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <StarMark size={760} />
      <div style={{ position: "absolute", fontSize: 250, color: "#111", letterSpacing: 2, marginTop: 70 }}>{initials}</div>
    </div>
  </AbsoluteFill>
);

export type BannerProps = {
  readonly name: string;
  readonly tagline: string;
  readonly schedule: string;
};

// 2560×1440 YouTube banner. Text stays inside YouTube's 1546×423 safe area (centre), the only part
// shown on phones.
export const YouTubeBanner: React.FC<BannerProps> = ({ name, tagline, schedule }) => (
  <AbsoluteFill style={{ background: NIGHT, alignItems: "center", justifyContent: "center", fontFamily }}>
    <div style={{ width: 1546, height: 423, display: "flex", alignItems: "center", justifyContent: "center", gap: 48 }}>
      <StarMark size={250} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 170, lineHeight: 0.95, color: "#fff", textTransform: "uppercase", textShadow: `${outline(7)}, 0 12px 0 #000` }}>{name}</div>
        <div style={{ fontSize: 64, color: GOLD, textTransform: "uppercase", textShadow: outline(5), marginTop: 8 }}>{tagline}</div>
        <div style={{ fontSize: 44, color: "#ddd", textTransform: "uppercase", textShadow: outline(4), marginTop: 6 }}>{schedule}</div>
      </div>
    </div>
  </AbsoluteFill>
);

export type ReelCoverProps = {
  readonly title: string;
  readonly episode: string;
};

// 1080×1920 Reel / Shorts cover. Instagram's profile grid shows the centre 1080×1440, so the title
// sits inside it. Keeps the grid looking like one series.
export const ReelCover: React.FC<ReelCoverProps> = ({ title, episode }) => (
  <AbsoluteFill style={{ background: NIGHT, alignItems: "center", justifyContent: "center", fontFamily }}>
    <div style={{ width: 1000, height: 1440, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
      <StarMark size={220} />
      <div style={{ fontSize: 150, lineHeight: 1, color: "#fff", textAlign: "center", textTransform: "uppercase", textWrap: "balance", textShadow: `${outline(8)}, 0 14px 0 #000` }}>{title}</div>
      {episode ? (
        <div style={{ fontSize: 70, color: "#111", background: GOLD, padding: "8px 34px", borderRadius: 14, textTransform: "uppercase", boxShadow: "0 10px 0 rgba(0,0,0,0.6)" }}>{episode}</div>
      ) : null}
    </div>
  </AbsoluteFill>
);
