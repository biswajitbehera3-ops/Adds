import React from "react";
import { Series } from "remotion";
import { IllGunAwareness, IllOwnerCall, IllSearchlight, IllStinger, IllStoreClear, IllTracker, IllVictimLunge } from "./Illustrations";
import { DetailCallout, DispatchScreen, IconPanel, NumberCard, ProgressBar, QuoteCard, SourceTag, SplitCompare, StarRow } from "./Kit";

// Every graphic in the 006 kit, back to back, over real trailer frames: a review reel, not a video segment.
export const KIT_REEL_FRAMES = 120 + 75 + 90 + 60 + 120 + 270 + 120 + 120 + 120 + 75 + 150 + 120 + 180 + 150 + 120 + 180 + 210;

export const KitReel: React.FC = () => (
  <Series>
    <Series.Sequence durationInFrames={120}><DispatchScreen entries={["REPORT #10 · WEAPON SEEN", "REPORT #9 · ROBBERY · VICTIM HOSTILE", "REPORT #8 · VEHICLE THEFT · OWNER CALLED", "REPORT #7 · TRACKER ACTIVE"]} radius={230} /></Series.Sequence>
    <Series.Sequence durationInFrames={75}><NumberCard num={7} title="The car snitches" bg="frames/el-1404-heli.jpg" /></Series.Sequence>
    <Series.Sequence durationInFrames={90}><DetailCallout x={722} y={786} r={64} label="Slim Jim or smash" bg="frames/el-0606-slimjim.jpg" zoom={1.08} /></Series.Sequence>
    <Series.Sequence durationInFrames={60}><ProgressBar current={4} bg="frames/el-1813-phone.jpg" /></Series.Sequence>
    <Series.Sequence durationInFrames={120}><QuoteCard quote="I basically started picking fights with them, provoking them and then immediately defusing it." speaker="Phil Hooker" outlet="Rockstar North · Edge" bg="frames/el-0906-store.jpg" /></Series.Sequence>
    <Series.Sequence durationInFrames={270}><IconPanel bg="frames/el-1540-icons.jpg" icons={[
      { key: "camera", fix: "Destroy footage", onSec: 0.3, fixSec: 1.4 }, { key: "hanger", fix: "Change unseen", onSec: 0.6, fixSec: 2.6 },
      { key: "duo", fix: "Split up", onSec: 0.9, fixSec: 3.8 }, { key: "gun", fix: "Ditch it", onSec: 1.2, fixSec: 5.0 },
      { key: "car", fix: "Swap car", onSec: 1.5, fixSec: 6.0 }, { key: "face", fix: "Mask?", onSec: 1.8, fixSec: 7.2, theory: true }]} /></Series.Sequence>
    <Series.Sequence durationInFrames={120}><StarRow mode="flashing" lit={4} label="Flashing" sub="You've broken line of sight" bg="frames/el-1540-icons.jpg" /></Series.Sequence>
    <Series.Sequence durationInFrames={120}><StarRow mode="hollow" lit={2} label="Hollow stars" sub="They don't know who they're looking for" bg="frames/el-1808-hollow.jpg" /></Series.Sequence>
    <Series.Sequence durationInFrames={120}><SplitCompare title="WHAT THE COPS KNOW"
      left={{ img: "frames/el-1540-icons.jpg", crop: [3200, 20, 640, 240], label: "15:40 · 4 ICONS", color: "#FF3B3B" }}
      right={{ img: "frames/el-1808-hollow.jpg", crop: [3200, 20, 640, 240], label: "18:08 · NONE", color: "#3CFF6B" }} /></Series.Sequence>
    <Series.Sequence durationInFrames={75}><SourceTag tier="REPORTED" outlet="Edge magazine" bg="frames/t2-0116-victim.jpg" /></Series.Sequence>
    <Series.Sequence durationInFrames={150}><IllGunAwareness /></Series.Sequence>
    <Series.Sequence durationInFrames={120}><IllVictimLunge /></Series.Sequence>
    <Series.Sequence durationInFrames={180}><IllOwnerCall /></Series.Sequence>
    <Series.Sequence durationInFrames={150}><IllTracker /></Series.Sequence>
    <Series.Sequence durationInFrames={120}><IllSearchlight bg="frames/lt-0053-night-heli.jpg" /></Series.Sequence>
    <Series.Sequence durationInFrames={180}><IllStinger /></Series.Sequence>
    <Series.Sequence durationInFrames={210}><IllStoreClear /></Series.Sequence>
  </Series>
);
