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

// palette sampled from the art: mauve #c195b0 · salmon #f1ac9c · apricot #f7b585 · gold #f5c695 · rose #e4a1a3 · plum #3e202f
const APRICOT = "#f7b585";
const SALMON = "#f1ac9c";
const ROSE = "#e4a1a3";
const GOLD = "#f5c695";
const PEACH = GOLD;

export const Cover034: React.FC = () => (
  <AbsoluteFill style={{ background: "#120818" }}>
    {/* art, upscaled with a touch of softness hidden by grain */}
    <Img src={staticFile("frames/user-jason-lucia-motel-art.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover",
      filter: "saturate(1.08) contrast(1.04)" }} />
    {/* soft sunset haze behind the title for legibility, no hard band */}
    <AbsoluteFill style={{ background: "radial-gradient(120% 55% at 50% 20%, rgba(62,32,47,0.6) 0%, rgba(62,32,47,0.26) 45%, rgba(62,32,47,0) 70%)" }} />
    {/* gentle vignette + bottom fade */}
    <AbsoluteFill style={{ background: "radial-gradient(140% 100% at 50% 45%, rgba(0,0,0,0) 55%, rgba(10,0,18,0.55) 100%)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 78%, rgba(12,2,20,0.55) 100%)" }} />

    {/* title block */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center" }}>
      {/* kicker */}
      <div style={{ fontFamily: INTER, fontWeight: 500, fontSize: 76, letterSpacing: "0.55em", color: "rgba(255,242,232,0.92)", marginLeft: "0.55em",
        textShadow: "0 0 30px rgba(193,149,176,0.75), 0 4px 16px rgba(62,32,47,0.6)" }}>GRAND THEFT AUTO VI</div>
      {/* thin rule */}
      <div style={{ width: 620, height: 3, margin: "56px auto 40px", background: `linear-gradient(90deg, rgba(193,149,176,0), ${GOLD}, rgba(193,149,176,0))` }} />
      {/* neon script */}
      <div style={{ fontFamily: SCRIPT, fontSize: 470, lineHeight: 1.05, color: "#fff3e8", transform: "rotate(-5deg)",
        textShadow: `0 0 14px ${APRICOT}, 0 0 40px ${SALMON}, 0 0 100px rgba(228,161,163,0.9), 0 0 200px rgba(193,149,176,0.7), 0 14px 34px rgba(62,32,47,0.7)` }}>
        1st Hour
      </div>
      {/* thin wide-tracked capitals */}
      <div style={{ marginTop: 40, fontFamily: INTER, fontWeight: 400, fontSize: 210, letterSpacing: "0.42em", marginLeft: "0.42em", color: PEACH,
        textShadow: `0 6px 26px rgba(62,32,47,0.8), 0 0 24px rgba(247,181,133,0.75), 0 0 80px ${ROSE}` }}>REVIEW</div>
    </div>

    {/* film grain */}
    <AbsoluteFill style={{ opacity: 0.16, mixBlendMode: "overlay", backgroundImage:
      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.9'/></svg>\")" }} />
  </AbsoluteFill>
);
