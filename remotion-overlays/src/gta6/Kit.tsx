import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { ANTON, C, clamp, INTER, MONO, outline, Stage, Tier, TIER } from "./theme";

/* ───────────────────────── helpers ───────────────────────── */

const useExit = (frames = 10) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return interpolate(f, [durationInFrames - frames, durationInFrames], [1, 0], clamp);
};

const typed = (text: string, f: number, start: number, cps = 30, fps = 30) =>
  text.slice(0, Math.max(0, Math.floor(((f - start) / fps) * cps)));

const Cursor: React.FC<{ show: boolean; color?: string }> = ({ show, color = C.white }) => {
  const f = useCurrentFrame();
  return show && Math.floor(f / 8) % 2 === 0 ? <span style={{ color }}>▌</span> : null;
};

/* ───────────────────────── 1. NumberCard ───────────────────────── */
// "#7 · THE CAR SNITCHES" — number slams in, title types on, streaks whoosh past.

export const NumberCard: React.FC<{ num: number; title: string; bg?: string }> = ({ num, title, bg }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = useExit(8);
  const slam = spring({ frame: f, fps, config: { damping: 11, stiffness: 180, mass: 0.8 } });
  const scale = interpolate(slam, [0, 1], [1.9, 1]);
  const shake = f < 10 ? Math.sin(f * 2.3) * (10 - f) * 1.2 : 0;
  const streak = interpolate(f, [0, 14], [-600, 2400], clamp);
  const bar = interpolate(f, [6, 18], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <Stage bg={bg} dim={bg ? 0.55 : 0}>
      <div style={{ position: "absolute", inset: 0, opacity: exit, transform: `translateX(${shake}px)` }}>
        {/* whoosh streaks */}
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", top: 430 + i * 90, left: streak - i * 260, width: 520, height: 6 - i,
            background: `linear-gradient(90deg, transparent, ${i === 1 ? C.blue : C.pink})`, opacity: 0.8 }} />
        ))}
        <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center" }}>
          <div style={{ fontFamily: ANTON, fontSize: 300, lineHeight: 1, color: C.gold, transform: `scale(${scale})`,
            textShadow: `${outline(7)}, 0 0 60px rgba(255,46,136,0.75)` }}>
            #{num}
          </div>
          <div style={{ margin: "26px auto 0", height: 8, width: 760 * bar, background: `linear-gradient(90deg, ${C.pink}, ${C.blue})`, borderRadius: 4 }} />
          <div style={{ marginTop: 30, fontFamily: ANTON, fontSize: 92, letterSpacing: 2, color: C.white, textShadow: outline(5) }}>
            {typed(title.toUpperCase(), f, 10, 40)}
            <Cursor show={f < 10 + (title.length / 40) * fps + 12} color={C.pink} />
          </div>
        </div>
      </div>
    </Stage>
  );
};

/* ───────────────────────── 2. SourceTag ───────────────────────── */
// Lower-third, bottom-left (clear of YouTube's bottom-right end-screen zone).

export const SourceTag: React.FC<{ tier: Tier; outlet: string; bg?: string }> = ({ tier, outlet, bg }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = useExit(10);
  const inn = spring({ frame: f, fps, config: { damping: 16, stiffness: 140 } });
  const col = TIER[tier];
  const wipe = interpolate(f, [4, 16], [0, 100], clamp);
  return (
    <Stage bg={bg}>
      <div style={{ position: "absolute", left: 80, bottom: 96, display: "flex", alignItems: "stretch",
        transform: `translateX(${interpolate(inn, [0, 1], [-60, 0])}px)`, opacity: Math.min(inn * 1.4, 1) * exit,
        clipPath: `inset(0 ${100 - wipe}% 0 0)`, filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.6))" }}>
        <div style={{ width: 10, background: col, borderRadius: "6px 0 0 6px" }} />
        <div style={{ background: "rgba(7,7,12,0.86)", padding: "18px 32px 18px 24px", borderRadius: "0 8px 8px 0",
          display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 20, height: 20, borderRadius: 10, background: col, boxShadow: `0 0 14px ${col}` }} />
          <span style={{ fontFamily: INTER, fontWeight: 800, fontSize: 38, letterSpacing: 4, color: col }}>{tier}</span>
          <span style={{ fontFamily: INTER, fontWeight: 500, fontSize: 38, color: "rgba(255,255,255,0.55)" }}>·</span>
          <span style={{ fontFamily: INTER, fontWeight: 700, fontSize: 38, color: C.white }}>{outlet}</span>
        </div>
      </div>
    </Stage>
  );
};

/* ───────────────────────── 3. DetailCallout ───────────────────────── */
// A ring draws on around a detail, a leader line runs out, the label types in.
// x, y, r are on the 1920×1080 grid.

export const DetailCallout: React.FC<{ x: number; y: number; r: number; label: string; side?: "left" | "right"; color?: string; bg?: string; zoom?: number }> =
  ({ x, y, r, label, side = "right", color = C.gold, bg, zoom = 1 }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const exit = useExit(8);
  const draw = interpolate(f, [0, 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const circ = 2 * Math.PI * r;
  const pulse = 1 + Math.sin(f / 6) * 0.02;
  const lineT = interpolate(f, [12, 20], [0, 1], clamp);
  const dir = side === "right" ? 1 : -1;
  const ex = x + dir * r * 0.72, ey = y - r * 0.72;
  const kx = ex + dir * 90, ky = ey - 90;
  const hx = kx + dir * 120;
  // Ken Burns push toward the detail while the callout is up (preview background only).
  const push = interpolate(f, [0, durationInFrames], [1, zoom], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: `${(x / 1920) * 100}% ${(y / 1080) * 100}%` }}>
        <Stage bg={bg}><div /></Stage>
      </AbsoluteFill>
      <Stage>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: exit }}>
          <circle cx={x} cy={y} r={r * pulse} fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth={14} strokeDasharray={circ} strokeDashoffset={circ * (1 - draw)} transform={`rotate(-90 ${x} ${y})`} />
          <circle cx={x} cy={y} r={r * pulse} fill="none" stroke={color} strokeWidth={7} strokeDasharray={circ} strokeDashoffset={circ * (1 - draw)} transform={`rotate(-90 ${x} ${y})`} style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
          <polyline points={`${ex},${ey} ${ex + (kx - ex) * Math.min(lineT * 2, 1)},${ey + (ky - ey) * Math.min(lineT * 2, 1)} ${lineT > 0.5 ? kx + (hx - kx) * (lineT - 0.5) * 2 : kx},${ky}`}
            fill="none" stroke={color} strokeWidth={5} strokeLinejoin="round" opacity={lineT > 0 ? 1 : 0} />
        </svg>
        <div style={{ position: "absolute", top: ky - 46, ...(side === "right" ? { left: hx + 14 } : { right: 1920 - hx + 14 }), opacity: exit,
          fontFamily: ANTON, fontSize: 62, color: C.white, whiteSpace: "nowrap", textShadow: outline(5),
          background: "transparent" }}>
          {typed(label.toUpperCase(), f, 20, 36)}
          <Cursor show={f >= 20 && f < 20 + (label.length / 36) * 30 + 10} color={color} />
        </div>
      </Stage>
    </AbsoluteFill>
  );
};

/* ───────────────────────── 4. ProgressBar ───────────────────────── */

export const ProgressBar: React.FC<{ current: number; total?: number; bg?: string }> = ({ current, total = 10, bg }) => {
  const f = useCurrentFrame();
  const fill = interpolate(f, [4, 22], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const w = 1000, gap = 8, seg = (w - gap * (total - 1)) / total;
  return (
    <Stage bg={bg}>
      <div style={{ position: "absolute", top: 34, left: (1920 - w) / 2 - 60, display: "flex", alignItems: "center", gap: 22,
        filter: "drop-shadow(0 3px 10px rgba(0,0,0,0.7))" }}>
        <div style={{ display: "flex", gap }}>
          {Array.from({ length: total }).map((_, i) => {
            const done = i < current - 1;
            const now = i === current - 1;
            return (
              <div key={i} style={{ width: seg, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.22)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: done ? "100%" : now ? `${fill * 100}%` : "0%",
                  background: now ? `linear-gradient(90deg, ${C.pink}, ${C.gold})` : C.pink }} />
              </div>
            );
          })}
        </div>
        <div style={{ fontFamily: ANTON, fontSize: 40, color: C.white, textShadow: outline(3) }}>
          {current}<span style={{ color: "rgba(255,255,255,0.6)" }}> / {total}</span>
        </div>
      </div>
    </Stage>
  );
};

/* ───────────────────────── 5. QuoteCard ───────────────────────── */

export const QuoteCard: React.FC<{ quote: string; speaker: string; outlet: string; wps?: number; bg?: string }> = ({ quote, speaker, outlet, wps = 4.5, bg }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = useExit(10);
  const inn = spring({ frame: f, fps, config: { damping: 18, stiffness: 120 } });
  const words = quote.split(" ");
  const shown = Math.max(0, Math.floor(((f - 8) / fps) * wps));
  const doneAt = 8 + (words.length / wps) * fps;
  const credit = interpolate(f, [doneAt, doneAt + 10], [0, 1], clamp);
  return (
    <Stage bg={bg} dim={bg ? 0.45 : 0}>
      <div style={{ position: "absolute", left: 230, right: 230, top: 250, opacity: exit,
        transform: `translateY(${interpolate(inn, [0, 1], [40, 0])}px)`, background: "rgba(7,7,12,0.88)",
        borderLeft: `12px solid ${C.pink}`, borderRadius: 14, padding: "56px 70px 50px 80px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
        <div style={{ position: "absolute", left: 40, top: -40, fontFamily: ANTON, fontSize: 200, color: C.gold, lineHeight: 1 }}>“</div>
        <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 50, lineHeight: 1.35, color: C.white }}>
          {words.map((w, i) => (
            <span key={i} style={{ opacity: i < shown ? 1 : 0.12, transition: "none" }}>{w} </span>
          ))}
        </div>
        <div style={{ marginTop: 34, opacity: credit, display: "flex", gap: 18, alignItems: "baseline" }}>
          <span style={{ fontFamily: ANTON, fontSize: 46, color: C.gold }}>— {speaker.toUpperCase()}</span>
          <span style={{ fontFamily: INTER, fontWeight: 700, fontSize: 30, color: C.blue, letterSpacing: 3 }}>{outlet.toUpperCase()}</span>
        </div>
      </div>
    </Stage>
  );
};

/* ───────────────────────── 6. IconPanel (the police report) ───────────────────────── */

const ICON_PATHS: Record<string, React.ReactNode> = {
  camera: (<g><path d="M3 8l12-3 2 6-12 3z" /><path d="M17 8l4-1v5l-4 1" /><path d="M7 13l-1 6M4 19h5" /></g>),
  hanger: (<g><path d="M10 6a2 2 0 1 1 3 1.7c-.8.5-1 1-1 1.8" /><path d="M12 9.5L2.5 17h19z" /></g>),
  duo: (<g><circle cx="8" cy="8" r="3" /><circle cx="16.5" cy="8" r="3" /><path d="M2.5 20c0-4 2.5-6 5.5-6s5.5 2 5.5 6M11 20c0-4 2.5-6 5.5-6s5.5 2 5.5 6" /></g>),
  gun: (<g><path d="M2.5 8h16v4h-8l-1 2H7l.6-2H2.5z" /><path d="M7.6 12l-1.6 7h3.5l1.5-5" /><path d="M18.5 9.5h3" /></g>),
  car: (<g><path d="M3 16v-3.5L5.5 7h13l2.5 5.5V16z" /><path d="M5 12.5h14" /><circle cx="7" cy="17" r="1.8" /><circle cx="17" cy="17" r="1.8" /></g>),
  face: (<g><circle cx="12" cy="12" r="9" /><circle cx="9" cy="10" r="1" /><circle cx="15" cy="10" r="1" /><path d="M8.5 15c2 1.6 5 1.6 7 0" /></g>),
};

export type IconSpec = { key: keyof typeof ICON_PATHS; fix: string; onSec: number; fixSec: number; theory?: boolean };

export const IconPanel: React.FC<{ icons: IconSpec[]; title?: string; bg?: string }> = ({ icons, title = "POLICE REPORT", bg }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = useExit(10);
  const size = 150, gap = 54;
  const total = icons.length * size + (icons.length - 1) * gap;
  return (
    <Stage bg={bg} dim={bg ? 0.5 : 0}>
      <div style={{ position: "absolute", left: (1920 - total) / 2 - 50, width: total + 100, top: 300, opacity: exit,
        background: "rgba(7,7,12,0.82)", borderRadius: 20, padding: "34px 50px 50px", boxSizing: "border-box",
        border: "2px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: C.red, marginBottom: 30, display: "flex", justifyContent: "space-between" }}>
          <span>● {title}</span><span style={{ color: "rgba(255,255,255,0.45)" }}>CASE #006</span>
        </div>
        <div style={{ display: "flex", gap }}>
          {icons.map((ic, i) => {
            const on = f >= ic.onSec * fps;
            const fixed = f >= ic.fixSec * fps;
            const pop = spring({ frame: f - ic.onSec * fps, fps, config: { damping: 9, stiffness: 200 } });
            const fixT = interpolate(f, [ic.fixSec * fps, ic.fixSec * fps + 8], [0, 1], clamp);
            const fixColor = ic.theory ? C.amber : C.green;
            const col = fixed ? fixColor : on ? C.red : "rgba(255,255,255,0.28)";
            return (
              <div key={i} style={{ width: size, textAlign: "center" }}>
                <div style={{ position: "relative", width: size, height: size, borderRadius: size / 2,
                  border: `6px solid ${col}`, background: on && !fixed ? "rgba(255,59,59,0.16)" : "rgba(255,255,255,0.04)",
                  transform: `scale(${on ? interpolate(pop, [0, 1], [0.6, 1]) : 0.9})`,
                  boxShadow: on ? `0 0 34px ${col}` : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg viewBox="0 0 24 24" width={86} height={86} fill="none" stroke={col} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    {ICON_PATHS[ic.key]}
                  </svg>
                  {fixed ? (
                    <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: "absolute", inset: -6 }}>
                      <line x1="18" y1="82" x2={18 + 64 * fixT} y2={82 - 64 * fixT} stroke={fixColor} strokeWidth={8} strokeLinecap="round" />
                    </svg>
                  ) : null}
                </div>
                <div style={{ marginTop: 22, minHeight: 80, fontFamily: ANTON, fontSize: 34, lineHeight: 1.1, color: fixColor, opacity: fixT,
                  transform: `translateY(${(1 - fixT) * 12}px)` }}>
                  {ic.fix.toUpperCase()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Stage>
  );
};

/* ───────────────────────── 7. StarRow ───────────────────────── */

const STAR = "M50 4 L61.8 37.6 L97.6 38.2 L69 59.8 L79.4 94 L50 73.6 L20.6 94 L31 59.8 L2.4 38.2 L38.2 37.6 Z";

export type StarMode = "white" | "flashing" | "red" | "hollow";
export const StarRow: React.FC<{ mode: StarMode; lit?: number; label: string; sub?: string; bg?: string }> = ({ mode, lit = 4, label, sub, bg }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = useExit(10);
  const blinkOn = mode !== "flashing" || Math.floor(f / 9) % 2 === 0;
  const col = mode === "red" ? C.red : C.white;
  return (
    <Stage bg={bg} dim={bg ? 0.5 : 0}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 290, textAlign: "center", opacity: exit }}>
        <div style={{ display: "inline-flex", gap: 26, padding: "34px 48px", background: "rgba(7,7,12,0.72)", borderRadius: 24 }}>
          {Array.from({ length: 6 }).map((_, i) => {
            const isLit = i >= 6 - lit;
            const s = spring({ frame: f - i * 3, fps, config: { damping: 12, stiffness: 180 } });
            const showLit = isLit && blinkOn;
            return (
              <svg key={i} viewBox="0 0 100 100" width={140} height={140} style={{ transform: `scale(${s})`,
                filter: showLit && mode !== "hollow" ? `drop-shadow(0 0 18px ${col})` : "none" }}>
                <path d={STAR} fill={!isLit ? "rgba(255,255,255,0.18)" : showLit && mode !== "hollow" ? col : "none"}
                  stroke={isLit ? (showLit || mode === "flashing" ? col : col) : "none"} strokeWidth={isLit ? (mode === "hollow" || !showLit ? 6 : 0) : 0}
                  strokeLinejoin="round" opacity={isLit && mode === "flashing" && !blinkOn ? 0.55 : 1} />
              </svg>
            );
          })}
        </div>
        <div style={{ marginTop: 40, fontFamily: ANTON, fontSize: 110, color: mode === "red" ? C.red : mode === "hollow" ? C.gold : C.white, textShadow: outline(6) }}>
          {typed(label.toUpperCase(), f, 8, 34)}
        </div>
        {sub ? <div style={{ marginTop: 6, fontFamily: INTER, fontWeight: 700, fontSize: 44, color: C.white, textShadow: outline(3),
          opacity: interpolate(f, [8 + (label.length / 34) * fps, 18 + (label.length / 34) * fps], [0, 1], clamp) }}>{sub}</div> : null}
      </div>
    </Stage>
  );
};

/* ───────────────────────── 8. DispatchScreen ───────────────────────── */
// The video's signature: a dispatch console. A stylised map (not Rockstar's) with a pulsing search radius,
// a log where report lines type in, and a radio waveform.

export const DispatchScreen: React.FC<{ entries: string[]; radius?: number; status?: string; statusColor?: string; bg?: string }> =
  ({ entries, radius = 220, status = "SEARCH ACTIVE", statusColor = C.red, bg }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = useExit(8);
  const inn = interpolate(f, [0, 10], [0, 1], clamp);
  const ping = (f % 45) / 45;
  const rNow = radius * interpolate(spring({ frame: f, fps, config: { damping: 14 } }), [0, 1], [0.6, 1]);
  const last = entries.length - 1;
  const cx = 600, cy = 520;
  return (
    <Stage bg={bg} dim={bg ? 0.7 : 0}>
      <AbsoluteFill style={{ background: bg ? "transparent" : C.night, opacity: exit }}>
        {/* grid */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 0.35 * inn }}>
          {Array.from({ length: 33 }).map((_, i) => <line key={`v${i}`} x1={i * 60} y1={0} x2={i * 60} y2={1080} stroke={C.blue} strokeWidth={1} opacity={0.25} />)}
          {Array.from({ length: 19 }).map((_, i) => <line key={`h${i}`} x1={0} y1={i * 60} x2={1920} y2={i * 60} stroke={C.blue} strokeWidth={1} opacity={0.25} />)}
        </svg>
        {/* map panel */}
        <div style={{ position: "absolute", left: 80, top: 110, width: 1040, height: 820, borderRadius: 18, overflow: "hidden",
          background: "rgba(10,18,30,0.92)", border: `2px solid rgba(31,184,255,0.35)`, opacity: inn }}>
          <svg width={1040} height={820}>
            {/* stylised coast + streets (generic, not a real map) */}
            <path d="M0 640 C160 600 220 700 380 660 S640 540 760 600 S960 720 1040 680 L1040 820 L0 820Z" fill="rgba(31,184,255,0.18)" />
            <path d="M720 0 C700 120 820 180 800 300 S880 420 1040 400 L1040 0Z" fill="rgba(31,184,255,0.12)" />
            {[120, 260, 400, 540].map((y) => <line key={y} x1={0} y1={y} x2={1040} y2={y - 40} stroke="rgba(255,255,255,0.12)" strokeWidth={6} />)}
            {[160, 360, 560, 760, 920].map((x) => <line key={x} x1={x} y1={0} x2={x + 60} y2={820} stroke="rgba(255,255,255,0.10)" strokeWidth={5} />)}
            {/* search radius */}
            <circle cx={cx - 80} cy={cy - 110} r={rNow} fill="rgba(255,59,59,0.16)" stroke={statusColor} strokeWidth={4} />
            <circle cx={cx - 80} cy={cy - 110} r={rNow * (0.4 + ping * 0.8)} fill="none" stroke={statusColor} strokeWidth={3} opacity={1 - ping} />
            <circle cx={cx - 80} cy={cy - 110} r={10} fill={statusColor} />
          </svg>
          <div style={{ position: "absolute", left: 28, top: 22, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: C.blue }}>DISPATCH · SECTOR MAP</div>
          <div style={{ position: "absolute", right: 28, top: 22, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: statusColor,
            opacity: Math.floor(f / 15) % 2 === 0 ? 1 : 0.45 }}>● {status}</div>
        </div>
        {/* log panel */}
        <div style={{ position: "absolute", left: 1160, top: 110, width: 680, height: 820, borderRadius: 18, background: "rgba(7,7,12,0.92)",
          border: "2px solid rgba(255,255,255,0.1)", padding: "28px 32px", boxSizing: "border-box", opacity: inn }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>INCIDENT LOG</div>
          {entries.map((e, i) => (
            <div key={i} style={{ fontFamily: MONO, fontWeight: i === last ? 700 : 500, fontSize: 30, lineHeight: 1.35, marginBottom: 18,
              color: i === last ? C.white : "rgba(255,255,255,0.42)", borderLeft: `5px solid ${i === last ? statusColor : "rgba(255,255,255,0.15)"}`, paddingLeft: 16 }}>
              {i === last ? typed(e, f, 12, 32) : e}
              {i === last ? <Cursor show color={statusColor} /> : null}
            </div>
          ))}
        </div>
        {/* radio waveform */}
        <svg width={1920} height={120} style={{ position: "absolute", left: 0, top: 945, opacity: inn }}>
          {Array.from({ length: 90 }).map((_, i) => {
            const talk = f > 10 && f < 40 ? 1 : 0.15;
            const h = 8 + Math.abs(Math.sin(i * 0.7 + f * 0.9) * Math.sin(i * 0.23 + f * 0.31)) * 70 * talk;
            return <rect key={i} x={80 + i * 19.6} y={60 - h / 2} width={10} height={h} rx={5} fill={i % 7 === 0 ? C.pink : C.blue} opacity={0.8} />;
          })}
        </svg>
      </AbsoluteFill>
    </Stage>
  );
};

/* ───────────────────────── 9. SplitCompare (before / after crop) ───────────────────────── */
// Two crops of real frames side by side, e.g. the HUD at 15:40 (4 icons) vs 18:08 (hollow, none).
// crop = [x, y, w, h] in source pixels of a 3840×2160 frame.

type Side = { img: string; crop: [number, number, number, number]; label: string; color: string };
export const SplitCompare: React.FC<{ left: Side; right: Side; title?: string; bg?: string }> = ({ left, right, title, bg }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = useExit(10);
  const panel = (s: Side, i: number) => {
    const inn = spring({ frame: f - i * 8, fps, config: { damping: 16 } });
    const W = 820, H = (W * s.crop[3]) / s.crop[2];
    const k = W / s.crop[2];
    return (
      <div style={{ width: W, transform: `translateY(${(1 - inn) * 60}px)`, opacity: inn }}>
        <div style={{ position: "relative", width: W, height: H, overflow: "hidden", borderRadius: 16, border: `6px solid ${s.color}`,
          boxShadow: `0 0 40px ${s.color}55` }}>
          <Img src={staticFile(s.img)} style={{ position: "absolute", width: 3840 * k, height: 2160 * k, left: -s.crop[0] * k, top: -s.crop[1] * k }} />
        </div>
        <div style={{ marginTop: 20, textAlign: "center", fontFamily: ANTON, fontSize: 64, color: s.color, textShadow: outline(4) }}>{s.label}</div>
      </div>
    );
  };
  return (
    <Stage bg={bg} dim={bg ? 0.75 : 0}>
      <AbsoluteFill style={{ background: bg ? "transparent" : C.night, opacity: exit }}>
        {title ? <div style={{ position: "absolute", top: 110, left: 0, right: 0, textAlign: "center", fontFamily: ANTON, fontSize: 80, color: C.white, textShadow: outline(5) }}>{title}</div> : null}
        <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 80 }}>
          {panel(left, 0)}
          {panel(right, 1)}
        </div>
      </AbsoluteFill>
    </Stage>
  );
};
