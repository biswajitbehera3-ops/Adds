import React from "react";
import { AbsoluteFill, continueRender, delayRender, Img, staticFile } from "remotion";
import { INTER } from "./theme";

// Cover for Short 034, 4K vertical (2160×3840): user's Jason & Lucia art + an aesthetic "1st Hour / REVIEW" title
// (neon script + thin, wide-tracked capitals, soft glow, film grain), instead of the chunky outlined poster letters.
const SCRIPT = "PacificoCover";
if (typeof window !== "undefined" && typeof FontFace !== "undefined") {
  const h = delayRender("Pacifico");
  const ff = new FontFace(SCRIPT, `url(${staticFile("fonts/Pacifico-Regular.woff")})`);
  ff.load().then((f) => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
}

const PINK = "#ff4fa3";
const PEACH = "#ffd3a8";

export const Cover034: React.FC = () => (
  <AbsoluteFill style={{ background: "#120818" }}>
    {/* art, upscaled with a touch of softness hidden by grain */}
    <Img src={staticFile("frames/user-jason-lucia-motel-art.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover",
      filter: "saturate(1.08) contrast(1.04)" }} />
    {/* soft sunset haze behind the title for legibility, no hard band */}
    <AbsoluteFill style={{ background: "radial-gradient(120% 55% at 50% 20%, rgba(40,10,50,0.62) 0%, rgba(40,10,50,0.28) 45%, rgba(40,10,50,0) 70%)" }} />
    {/* gentle vignette + bottom fade */}
    <AbsoluteFill style={{ background: "radial-gradient(140% 100% at 50% 45%, rgba(0,0,0,0) 55%, rgba(10,0,18,0.55) 100%)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 78%, rgba(12,2,20,0.55) 100%)" }} />

    {/* title block */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center" }}>
      {/* kicker */}
      <div style={{ fontFamily: INTER, fontWeight: 500, fontSize: 76, letterSpacing: "0.55em", color: "rgba(255,240,230,0.92)", marginLeft: "0.55em",
        textShadow: "0 0 30px rgba(255,120,190,0.55)" }}>GRAND THEFT AUTO VI</div>
      {/* thin rule */}
      <div style={{ width: 620, height: 3, margin: "56px auto 40px", background: `linear-gradient(90deg, rgba(255,255,255,0), ${PEACH}, rgba(255,255,255,0))` }} />
      {/* neon script */}
      <div style={{ fontFamily: SCRIPT, fontSize: 470, lineHeight: 1.05, color: "#fff7fb", transform: "rotate(-5deg)",
        textShadow: `0 0 18px ${PINK}, 0 0 46px ${PINK}, 0 0 110px rgba(255,79,163,0.85), 0 0 220px rgba(255,79,163,0.55), 0 14px 30px rgba(40,0,30,0.55)` }}>
        1st Hour
      </div>
      {/* thin wide-tracked capitals */}
      <div style={{ marginTop: 40, fontFamily: INTER, fontWeight: 400, fontSize: 210, letterSpacing: "0.42em", marginLeft: "0.42em", color: PEACH,
        textShadow: "0 6px 26px rgba(40,6,40,0.75), 0 0 24px rgba(255,190,140,0.8), 0 0 80px rgba(255,140,90,0.45)" }}>REVIEW</div>
    </div>

    {/* film grain */}
    <AbsoluteFill style={{ opacity: 0.16, mixBlendMode: "overlay", backgroundImage:
      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.9'/></svg>\")" }} />
  </AbsoluteFill>
);
