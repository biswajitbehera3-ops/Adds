import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { ANTON, C, clamp, INTER, MONO, outline, Stage } from "./theme";

/*
 * Flat, top-down "case diagram" illustrations for moments Rockstar has only described in print
 * (Edge's 90-minute demo). Every plate carries an ILLUSTRATION label so it can't be mistaken for game footage.
 * Timings are in seconds so they're easy to line up with the voiceover.
 */

const sec = (f: number, fps: number) => f / fps;
const at = (t: number, a: number, b: number, from = 0, to = 1, ease = Easing.inOut(Easing.cubic)) =>
  interpolate(t, [a, b], [from, to], { ...clamp, easing: ease });

const Plate: React.FC<{ title: string; source?: string; children: React.ReactNode; bg?: string }> = ({ title, source = "based on Edge's description", children, bg }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const op = interpolate(f, [0, 8, durationInFrames - 8, durationInFrames], [0, 1, 1, 0], clamp);
  return (
    <Stage bg={bg} dim={bg ? 0.78 : 0}>
      <AbsoluteFill style={{ background: bg ? "transparent" : C.night, opacity: op }}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 0.18 }}>
          {Array.from({ length: 33 }).map((_, i) => <line key={`v${i}`} x1={i * 60} y1={0} x2={i * 60} y2={1080} stroke={C.blue} />)}
          {Array.from({ length: 19 }).map((_, i) => <line key={`h${i}`} x1={0} y1={i * 60} x2={1920} y2={i * 60} stroke={C.blue} />)}
        </svg>
        {children}
        <div style={{ position: "absolute", left: 80, top: 70, fontFamily: ANTON, fontSize: 64, color: C.white, textShadow: outline(4) }}>{title}</div>
        <div style={{ position: "absolute", right: 80, top: 82, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 4,
          color: C.amber, border: `2px solid ${C.amber}`, borderRadius: 8, padding: "8px 16px", background: "rgba(7,7,12,0.7)" }}>
          ILLUSTRATION · {source.toUpperCase()}
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

// A person seen from above: head dot + shoulders ring.
const Person: React.FC<{ x: number; y: number; color: string; r?: number; ring?: string; mark?: string; markColor?: string; opacity?: number }> =
  ({ x, y, color, r = 42, ring, mark, markColor = C.red, opacity = 1 }) => (
  <g opacity={opacity}>
    {ring ? <circle cx={x} cy={y} r={r + 14} fill="none" stroke={ring} strokeWidth={5} /> : null}
    <circle cx={x} cy={y} r={r} fill={color} stroke="rgba(0,0,0,0.6)" strokeWidth={4} />
    {mark ? (
      <g>
        <circle cx={x + r} cy={y - r - 22} r={32} fill={markColor} />
        <text x={x + r} y={y - r - 8} textAnchor="middle" fontFamily={ANTON} fontSize={42} fill={C.night}>{mark}</text>
      </g>
    ) : null}
  </g>
);

const Caption: React.FC<{ text: string; color?: string; show: number }> = ({ text, color = C.white, show }) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 90, textAlign: "center", fontFamily: ANTON, fontSize: 96,
    color, textShadow: outline(6), opacity: show, transform: `scale(${0.9 + show * 0.1})` }}>{text}</div>
);

/* #10 — gun on your back vs in your hands */
export const IllGunAwareness: React.FC<{ bg?: string }> = ({ bg }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = sec(f, fps);
  const inHand = t > 2.2;
  const peds = [[620, 470], [1320, 400], [1200, 760], [700, 800], [1480, 620]];
  const react = (i: number) => at(t, 2.4 + i * 0.25, 2.8 + i * 0.25);
  const flee = [[-320, 90], [260, -40], [0, 0], [-300, -40], [260, -60]]; // [dx,dy]; ped 2 confronts
  return (
    <Plate title="#10 · BACK vs HANDS" bg={bg}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {peds.map(([x, y], i) => {
          const k = react(i);
          const confront = i === 2;
          const dx = confront ? (960 - x) * 0.35 * k : flee[i][0] * k;
          const dy = confront ? (560 - y) * 0.35 * k : flee[i][1] * k;
          const col = !inHand ? C.green : confront ? C.red : C.amber;
          return <Person key={i} x={x + dx} y={y + dy} color={col} mark={inHand && k > 0.3 ? (confront ? "!" : "?") : undefined} markColor={confront ? C.red : C.amber} />;
        })}
        {/* the player */}
        <Person x={960} y={560} color={C.pink} r={56} ring={C.pink} />
        {/* gun: on the back (small, behind) → in hand (pointing out) */}
        <rect x={inHand ? 1010 : 920} y={inHand ? 548 : 610} width={inHand ? 130 : 100} height={26} rx={4}
          fill={inHand ? C.red : "rgba(255,255,255,0.5)"} transform={inHand ? "" : "rotate(-35 960 600)"} />
      </svg>
      <div style={{ position: "absolute", left: 80, top: 190, fontFamily: INTER, fontWeight: 800, fontSize: 44,
        color: inHand ? C.red : C.green }}>{inHand ? "GUN IN HAND" : "GUN ON YOUR BACK"}</div>
      <Caption text={inHand ? "SOME RUN. ONE COMES AT YOU." : "NOBODY MINDS"} color={inHand ? C.red : C.green} show={inHand ? at(t, 3.2, 3.6) : at(t, 0.4, 0.8)} />
    </Plate>
  );
};

/* #9 — the victim hands it over, then goes for you */
export const IllVictimLunge: React.FC<{ bg?: string }> = ({ bg }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = sec(f, fps);
  const handover = at(t, 0.6, 1.4);
  const turn = at(t, 1.8, 2.2);
  const lunge = at(t, 2.5, 2.8, 0, 1, Easing.in(Easing.cubic));
  const flash = t > 2.8 && t < 3.2 ? 1 : 0;
  return (
    <Plate title="#9 · DON'T TURN YOUR BACK" bg={bg}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {/* cash bag moving from victim to robber */}
        <rect x={1110 - handover * 210} y={520} width={64} height={64} rx={8} fill={C.gold} opacity={handover < 1 ? 1 : 0.0} />
        <Person x={1180 - lunge * 230} y={550} color={lunge > 0 ? C.red : "#9AA4B2"} r={56} mark={t > 2.3 ? "!" : undefined} />
        <Person x={820} y={550} color={C.pink} r={56} ring={C.pink} />
        {/* facing arrow for the robber */}
        <g transform={`rotate(${turn * 180} 820 550)`}>
          <polygon points="880,550 860,535 860,565" fill={C.white} />
        </g>
      </svg>
      {flash ? <AbsoluteFill style={{ background: "rgba(255,59,59,0.25)" }} /> : null}
      <Caption text="DON'T TURN AROUND" color={C.red} show={at(t, 2.8, 3.1)} />
    </Plate>
  );
};

/* #8 — the owner reports it later */
export const IllOwnerCall: React.FC<{ bg?: string }> = ({ bg }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = sec(f, fps);
  const drive = at(t, 0.2, 2.2);
  const clock = at(t, 2.2, 3.0);
  const signal = at(t, 3.2, 4.2);
  const pin = spring({ frame: f - 4.3 * fps, fps, config: { damping: 9 } });
  const carX = 380 + drive * 1080, carY = 700 - drive * 260;
  return (
    <Plate title="#8 · THE OWNER CALLS IT IN" bg={bg}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <path d="M380 700 C700 700 900 560 1460 440" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={30} strokeLinecap="round" />
        {/* theft spot + owner with phone */}
        <circle cx={380} cy={700} r={46} fill="none" stroke="rgba(255,255,255,0.4)" strokeDasharray="8 8" strokeWidth={4} />
        <Person x={300} y={780} color="#9AA4B2" mark={t > 3 ? "☎" : undefined} markColor={C.blue} />
        {/* call signal to dispatch */}
        {signal > 0 ? <path d={`M300 760 Q 900 ${200} ${300 + signal * 1160} ${760 - signal * 360}`} fill="none" stroke={C.blue} strokeWidth={6} strokeDasharray="18 14" /> : null}
        {/* the car */}
        <rect x={carX - 80} y={carY - 40} width={160} height={80} rx={20} fill={C.pink} />
        {pin > 0 ? (
          <g transform={`translate(${carX} ${carY - 70}) scale(${pin})`}>
            <path d="M0 40 C-30 0 -30 -30 0 -30 C30 -30 30 0 0 40Z" fill={C.red} />
            <circle cx={0} cy={-6} r={10} fill={C.night} />
          </g>
        ) : null}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 210, textAlign: "center", fontFamily: ANTON, fontSize: 70, color: C.gold, textShadow: outline(5), opacity: clock }}>
        10 MINUTES LATER…
      </div>
      <Caption text="NO TRACKER NEEDED" color={C.red} show={at(t, 4.4, 4.8)} />
    </Plate>
  );
};

/* #7 — the tracker, the fence's signal blocker, and the payout */
export const IllTracker: React.FC<{ bg?: string }> = ({ bg }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = sec(f, fps);
  const move = at(t, 0.3, 4.0);
  const carX = 300 + move * 1150, carY = 760 - Math.sin(move * Math.PI) * 220 - move * 120;
  const inFence = move > 0.97;
  const ping = (f % 24) / 24;
  const damage = at(t, 1.6, 3.4);
  const payout = 1 - damage * 0.45;
  return (
    <Plate title="#7 · THE CAR SNITCHES" bg={bg}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {/* fence drop-off with signal blocker */}
        <circle cx={1450} cy={640} r={130} fill="rgba(60,255,107,0.12)" stroke={C.green} strokeWidth={5} strokeDasharray="14 10" />
        <text x={1450} y={810} textAnchor="middle" fontFamily={ANTON} fontSize={44} fill={C.green}>FENCE · SIGNAL BLOCKED</text>
        {/* tracker pings */}
        {!inFence ? <circle cx={carX} cy={carY} r={40 + ping * 160} fill="none" stroke={C.red} strokeWidth={5} opacity={1 - ping} /> : null}
        <rect x={carX - 85} y={carY - 45} width={170} height={90} rx={22} fill={C.gold} />
        <circle cx={carX + 45} cy={carY - 45} r={16} fill={inFence ? "#555" : C.red} />
      </svg>
      {/* payout meter */}
      <div style={{ position: "absolute", left: 80, top: 210, width: 560 }}>
        <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 34, color: C.white, marginBottom: 10 }}>PAYOUT</div>
        <div style={{ height: 30, background: "rgba(255,255,255,0.15)", borderRadius: 15, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${payout * 100}%`, background: payout > 0.75 ? C.green : C.amber }} />
        </div>
        <div style={{ marginTop: 22, fontFamily: INTER, fontWeight: 800, fontSize: 34, color: C.white, marginBottom: 10 }}>DAMAGE</div>
        <div style={{ height: 30, background: "rgba(255,255,255,0.15)", borderRadius: 15, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${damage * 60}%`, background: C.red }} />
        </div>
      </div>
      <Caption text={inFence ? "SIGNAL CUT" : "TRACKER ACTIVE"} color={inFence ? C.green : C.red} show={1} />
    </Plate>
  );
};

/* #6 — searchlight cone sweeping (overlay for night footage: keep `bg` empty and render transparent) */
export const IllSearchlight: React.FC<{ bg?: string }> = ({ bg }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = sec(f, fps);
  const sweep = Math.sin(t * 1.2) * 420;
  const cx = 1100 + sweep, cy = 880;
  return (
    <Stage bg={bg}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="spot" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,240,0.55)" />
            <stop offset="100%" stopColor="rgba(255,255,240,0)" />
          </radialGradient>
          <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,240,0.35)" />
            <stop offset="100%" stopColor="rgba(255,255,240,0.05)" />
          </linearGradient>
        </defs>
        <polygon points={`${960},${60} ${cx - 220},${cy} ${cx + 220},${cy}`} fill="url(#beam)" />
        <ellipse cx={cx} cy={cy} rx={240} ry={90} fill="url(#spot)" />
      </svg>
      <div style={{ position: "absolute", right: 80, top: 82, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 4,
        color: C.amber, border: `2px solid ${C.amber}`, borderRadius: 8, padding: "8px 16px", background: "rgba(7,7,12,0.7)" }}>
        ILLUSTRATION · SEARCHLIGHT GRAPHIC
      </div>
    </Stage>
  );
};

/* #5 — radio → stinger → crash → dog */
export const IllStinger: React.FC<{ bg?: string }> = ({ bg }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = sec(f, fps);
  const radio = t > 0.3 && t < 1.6;
  const strip = at(t, 1.0, 1.5);
  const ride = at(t, 0.2, 2.6, 0, 1, Easing.linear);
  const bikeX = 200 + ride * 1000;
  const crashed = t > 2.6;
  const run = at(t, 3.2, 4.4);
  const dog = at(t, 3.6, 4.8, 0, 1, Easing.in(Easing.quad));
  const caught = t > 4.8;
  return (
    <Plate title="#5 · ONE RADIO CALL" bg={bg}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <rect x={0} y={480} width={1920} height={200} fill="rgba(255,255,255,0.08)" />
        <line x1={0} y1={580} x2={1920} y2={580} stroke="rgba(255,255,255,0.25)" strokeWidth={4} strokeDasharray="40 30" />
        {/* police car + radio waves */}
        <rect x={1600} y={500} width={150} height={70} rx={16} fill="#1C2A44" stroke={C.blue} strokeWidth={4} />
        <rect x={1640} y={492} width={70} height={14} rx={4} fill={Math.floor(f / 6) % 2 ? C.red : C.blue} />
        {radio ? [0, 1, 2].map((i) => <path key={i} d={`M${1590 - i * 30} ${470 - i * 20} q -30 60 0 120`} fill="none" stroke={C.blue} strokeWidth={5} opacity={((f / 5 + i) % 3) / 3} />) : null}
        {/* stinger strip — hard to see on purpose */}
        <rect x={1200} y={490} width={18} height={180 * strip} fill="rgba(200,200,200,0.35)" />
        {/* bike / crash */}
        {!crashed ? <rect x={bikeX - 70} y={560} width={140} height={42} rx={16} fill={C.pink} />
          : <g transform={`translate(1240 560) rotate(${Math.min((t - 2.6) * 400, 160)})`}><rect x={-70} y={-21} width={140} height={42} rx={16} fill={C.pink} /></g>}
        {crashed && t < 3.0 ? <circle cx={1240} cy={580} r={30 + (t - 2.6) * 300} fill="none" stroke={C.gold} strokeWidth={6} opacity={1 - (t - 2.6) * 2.5} /> : null}
        {/* Jason + Lucia run, dog closes in */}
        {crashed ? <>
          <Person x={1280 + run * 280} y={460 - run * 120} color={C.pink} />
          <Person x={1300 + run * 420} y={720 + run * 60} color={C.pink} />
          <circle cx={1700 - dog * 140} cy={400 - dog * 40} r={34} fill={C.amber} />
          <text x={1700 - dog * 140} y={350 - dog * 40} textAnchor="middle" fontFamily={ANTON} fontSize={40} fill={C.amber}>K-9</text>
        </> : null}
      </svg>
      <div style={{ position: "absolute", left: 80, top: 190, fontFamily: MONO, fontWeight: 700, fontSize: 34, color: C.blue, opacity: radio ? 1 : 0.3 }}>
        ● RADIO: "STINGER DEPLOYED"
      </div>
      <Caption text="CAUGHT" color={C.red} show={caught ? 1 : 0} />
    </Plate>
  );
};

/* #1 — Phil Hooker's trick: provoke, defuse, the customers leave */
export const IllStoreClear: React.FC<{ bg?: string }> = ({ bg }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = sec(f, fps);
  const customers = [[760, 420], [1000, 380], [1200, 470], [900, 640]];
  const door = [960, 900];
  return (
    <Plate title="#1 · NO WITNESSES, NO REPORT" source="Phil Hooker, via Edge" bg={bg}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {/* store floor plan */}
        <rect x={560} y={260} width={800} height={620} rx={10} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.35)" strokeWidth={6} />
        <rect x={600} y={290} width={720} height={40} rx={6} fill="rgba(255,201,60,0.25)" />
        <text x={960} y={318} textAnchor="middle" fontFamily={MONO} fontSize={22} fill={C.gold}>COUNTER</text>
        <rect x={900} y={870} width={120} height={20} fill={C.night} />
        <text x={960} y={940} textAnchor="middle" fontFamily={MONO} fontSize={22} fill="rgba(255,255,255,0.6)">DOOR</text>
        {customers.map(([x, y], i) => {
          const t0 = 0.6 + i * 1.1;
          const provoke = t > t0 && t < t0 + 0.45;
          const sorry = t >= t0 + 0.45 && t < t0 + 0.9;
          const leave = at(t, t0 + 0.7, t0 + 1.6);
          const px = x + (door[0] - x) * leave, py = y + (door[1] + 80 - y) * leave;
          return <g key={i}>
            <Person x={px} y={py} color={provoke ? C.red : "#9AA4B2"} mark={provoke ? "!" : undefined} opacity={1 - at(t, t0 + 1.4, t0 + 1.6)} />
            {sorry ? <text x={x + 60} y={y - 40} fontFamily={INTER} fontWeight={800} fontSize={34} fill={C.green}>"sorry"</text> : null}
          </g>;
        })}
        <Person x={960} y={560} color={C.pink} r={54} ring={C.pink} />
      </svg>
      <div style={{ position: "absolute", left: 80, top: 190, fontFamily: MONO, fontWeight: 700, fontSize: 34, color: C.white }}>
        WITNESSES: {Math.max(0, 4 - customers.filter((_, i) => t > 0.6 + i * 1.1 + 1.6).length)}
      </div>
      <Caption text="NO WITNESSES. NO REPORT." color={C.green} show={at(t, 5.4, 5.8)} />
    </Plate>
  );
};
