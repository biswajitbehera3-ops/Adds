import { Composition, Folder, Still } from "remotion";
import { Avatar, ReelCover, YouTubeBanner } from "./gta/AccountKit";
import { ResultStamp } from "./gta/ResultStamp";
import { WantedHook } from "./gta/WantedHook";
import { ClipShort } from "./shorts/ClipShort";
import { IllGunAwareness, IllOwnerCall, IllSearchlight, IllStinger, IllStoreClear, IllTracker, IllVictimLunge } from "./gta6/Illustrations";
import { KitReel, KIT_REEL_FRAMES } from "./gta6/KitReel";
import { Video006, VIDEO006_FRAMES } from "./gta6/Video006";
import { Video014, VIDEO014_FRAMES } from "./gta6/Video014";
import { Reel010, REEL010_FRAMES } from "./gta6/Reel010";
import { ThumbFloorPaint, ThumbFloorStand } from "./gta6/ThumbFloor";
import { Thumb006A, Thumb006B, Thumb006Pro } from "./gta6/Thumbs006";
import { Thumb014A, Thumb014B, Thumb014C, Thumb014D, Thumb014E, Thumb014F, Thumb014G } from "./gta6/Thumbs014";
import { DetailCallout, DispatchScreen, IconPanel, NumberCard, ProgressBar, QuoteCard, SourceTag, SplitCompare, StarRow } from "./gta6/Kit";
import { ContestantTracker } from "./ContestantTracker";
import { Countdown } from "./Countdown";
import { MoneyCounter } from "./MoneyCounter";
import { MrBeastCaptions } from "./MrBeastCaptions";
import { ZoomPunch } from "./ZoomPunch";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MoneyCounter"
        component={MoneyCounter}
        durationInFrames={75}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ amount: 100000, label: "Beat LeBron", transparent: false }}
      />
      <Composition
        id="MrBeastCaptions"
        component={MrBeastCaptions}
        durationInFrames={120}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          transparent: false,
          chunks: [
            { text: "I'll buy", startMs: 0, endMs: 700, highlight: "" },
            { text: "whatever you", startMs: 700, endMs: 1500, highlight: "" },
            { text: "build", startMs: 1500, endMs: 2300, highlight: "build" },
            { text: "for $250,000", startMs: 2300, endMs: 4000, highlight: "$250,000" },
          ],
        }}
      />
      <Composition
        id="Countdown"
        component={Countdown}
        durationInFrames={210}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ seconds: 6, label: "Time left", transparent: false }}
      />
      <Composition
        id="ContestantTracker"
        component={ContestantTracker}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          transparent: false,
          contestants: [
            { name: "Nolan", color: "#2F80FF", image: "", eliminatedAtSec: 1.5 },
            { name: "Tareq", color: "#FF8A00", image: "", eliminatedAtSec: 3 },
            { name: "Karl", color: "#00C26E", image: "", eliminatedAtSec: -1 },
            { name: "Mack", color: "#B04DFF", image: "", eliminatedAtSec: -1 },
          ],
        }}
      />
      <Composition
        id="ZoomPunch"
        component={ZoomPunch}
        durationInFrames={120}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          src: "clips/sample.mp4",
          flash: true,
          punches: [
            { atSec: 1, scale: 1.25 },
            { atSec: 2.6, scale: 1.4 },
          ],
        }}
      />
      <Folder name="Gaming">
        <Composition
          id="WantedHook"
          component={WantedHook}
          durationInFrames={120}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ hook: "He thought he lost the cops", stars: 5, siren: true, transparent: false }}
        />
        <Composition
          id="ResultStamp"
          component={ResultStamp}
          durationInFrames={75}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ text: "Plan failed", subtext: "5 stars in 10 seconds", tone: "fail" as const, transparent: false }}
        />
        <Still id="Avatar" component={Avatar} width={1080} height={1080} defaultProps={{ initials: "WC" }} />
        <Still
          id="YouTubeBanner"
          component={YouTubeBanner}
          width={2560}
          height={1440}
          defaultProps={{ name: "Wanted Clips", tagline: "Gaming's wildest moments", schedule: "New clips every day" }}
        />
        <Still
          id="ReelCover"
          component={ReelCover}
          width={1080}
          height={1920}
          defaultProps={{ title: "Craziest chase yet", episode: "Ep. 1" }}
        />
      </Folder>
      <Folder name="Shorts">
        <Composition
          id="BattleKingScram"
          component={ClipShort}
          durationInFrames={994}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            src: "clips/battleking-scram-base.mp4",
            hook: "He found the nuclear kill switch...",
            hookSeconds: 3.6,
            credit: "GAMEPLAY: @BATTLEKINGPC",
            punches: [24.0, 28.0],
            captions: [
              { text: "That's the kill switch", start: 0, end: 1.6, highlight: "kill" },
              { text: "Find the SCRAM button", start: 4.0, end: 6.5, highlight: "SCRAM" },
              { text: "I don't see it", start: 6.9, end: 9.5, highlight: "" },
              { text: "Which one?", start: 9.8, end: 11.2, highlight: "" },
              { text: "This whole room is a control panel", start: 11.2, end: 13.0, highlight: "whole" },
              { text: "Be more specific!", start: 13.0, end: 14.8, highlight: "specific!" },
              { text: "Center of the room", start: 14.8, end: 16.5, highlight: "center" },
              { text: "I found it!", start: 18.0, end: 20.5, highlight: "found" },
              { text: "Nothing's happening", start: 23.8, end: 26.4, highlight: "nothing's" },
              { text: "Did it work?", start: 26.6, end: 28.0, highlight: "" },
              { text: "There isn't one", start: 30.2, end: 31.6, highlight: "isn't" },
              { text: "There's gotta be something", start: 31.6, end: 33.2, highlight: "something" },
            ],
            stamps: [{ text: "It didn't work", start: 28.0, end: 30.2, tone: "fail" as const }],
          }}
        />
      </Folder>
      <Folder name="GTA6-Kit">
        <Composition id="NumberCard" component={NumberCard} durationInFrames={120} fps={30} width={3840} height={2160}
          defaultProps={{ num: 7, title: "The car snitches", bg: "frames/el-1404-heli.jpg" }} />
        <Composition id="SourceTag" component={SourceTag} durationInFrames={120} fps={30} width={3840} height={2160}
          defaultProps={{ tier: "REPORTED" as const, outlet: "Edge magazine", bg: "frames/t2-0116-victim.jpg" }} />
        <Composition id="DetailCallout" component={DetailCallout} durationInFrames={90} fps={30} width={3840} height={2160}
          defaultProps={{ x: 722, y: 786, r: 64, label: "Slim Jim or smash", side: "right" as const, bg: "frames/el-0606-slimjim.jpg", zoom: 1.08 }} />
        <Composition id="ProgressBar" component={ProgressBar} durationInFrames={60} fps={30} width={3840} height={2160}
          defaultProps={{ current: 4, total: 10, bg: "frames/el-1813-phone.jpg" }} />
        <Composition id="QuoteCard" component={QuoteCard} durationInFrames={420} fps={30} width={3840} height={2160}
          defaultProps={{ quote: "I basically started picking fights with them, provoking them and then immediately defusing it. Then they would leave the store, so that would clear them out and I could rob it more cleanly.",
            speaker: "Phil Hooker", outlet: "Rockstar North · Edge", bg: "frames/el-0906-store.jpg" }} />
        <Composition id="IconPanel" component={IconPanel} durationInFrames={300} fps={30} width={3840} height={2160}
          defaultProps={{ bg: "frames/el-1540-icons.jpg", icons: [
            { key: "camera" as const, fix: "Destroy footage", onSec: 0.3, fixSec: 1.4 },
            { key: "hanger" as const, fix: "Change unseen", onSec: 0.6, fixSec: 2.6 },
            { key: "duo" as const, fix: "Split up", onSec: 0.9, fixSec: 3.8 },
            { key: "gun" as const, fix: "Ditch it", onSec: 1.2, fixSec: 5.0 },
            { key: "car" as const, fix: "Swap car", onSec: 1.5, fixSec: 6.0 },
            { key: "face" as const, fix: "Mask?", onSec: 1.8, fixSec: 7.2, theory: true },
          ] }} />
        <Composition id="StarRow" component={StarRow} durationInFrames={150} fps={30} width={3840} height={2160}
          defaultProps={{ mode: "hollow" as const, lit: 2, label: "Hollow stars", sub: "They don't know who they're looking for", bg: "frames/el-1808-hollow.jpg" }} />
        <Composition id="DispatchScreen" component={DispatchScreen} durationInFrames={120} fps={30} width={3840} height={2160}
          defaultProps={{ entries: ["REPORT #10 · WEAPON SEEN", "REPORT #9 · ROBBERY · VICTIM HOSTILE", "REPORT #8 · VEHICLE THEFT · OWNER CALLED", "REPORT #7 · TRACKER ACTIVE"], radius: 230 }} />
        <Composition id="SplitCompare" component={SplitCompare} durationInFrames={150} fps={30} width={3840} height={2160}
          defaultProps={{ title: "WHAT THE COPS KNOW",
            left: { img: "frames/el-1540-icons.jpg", crop: [3200, 20, 640, 240] as [number, number, number, number], label: "15:40 · 4 ICONS", color: "#FF3B3B" },
            right: { img: "frames/el-1808-hollow.jpg", crop: [3200, 20, 640, 240] as [number, number, number, number], label: "18:08 · NONE", color: "#3CFF6B" } }} />
      </Folder>
      <Still id="Thumb006Pro" component={Thumb006Pro} width={1280} height={720} />
      <Still id="ThumbFloorPaint" component={ThumbFloorPaint} width={1280} height={720} />
      <Still id="ThumbFloorStand" component={ThumbFloorStand} width={1280} height={720} />
      <Still id="Thumb006A" component={Thumb006A} width={1280} height={720} />
      <Still id="Thumb006B" component={Thumb006B} width={1280} height={720} />
      <Still id="Thumb014A" component={Thumb014A} width={1280} height={720} />
      <Still id="Thumb014B" component={Thumb014B} width={1280} height={720} />
      <Still id="Thumb014C" component={Thumb014C} width={1280} height={720} />
      <Still id="Thumb014D" component={Thumb014D} width={1280} height={720} />
      <Still id="Thumb014E" component={Thumb014E} width={1280} height={720} />
      <Still id="Thumb014F" component={Thumb014F} width={1280} height={720} />
      <Still id="Thumb014G" component={Thumb014G} width={1280} height={720} />
      <Composition id="Reel010" component={Reel010} durationInFrames={REEL010_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="Video014" component={Video014} durationInFrames={VIDEO014_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="Video006" component={Video006} durationInFrames={VIDEO006_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="Video006-4K" component={Video006} durationInFrames={VIDEO006_FRAMES} fps={30} width={3840} height={2160} />
      <Composition id="KitReel" component={KitReel} durationInFrames={KIT_REEL_FRAMES} fps={30} width={1920} height={1080} />
      <Folder name="GTA6-Illustrations">
        <Composition id="IllGunAwareness" component={IllGunAwareness} durationInFrames={150} fps={30} width={3840} height={2160} defaultProps={{}} />
        <Composition id="IllVictimLunge" component={IllVictimLunge} durationInFrames={120} fps={30} width={3840} height={2160} defaultProps={{}} />
        <Composition id="IllOwnerCall" component={IllOwnerCall} durationInFrames={180} fps={30} width={3840} height={2160} defaultProps={{}} />
        <Composition id="IllTracker" component={IllTracker} durationInFrames={150} fps={30} width={3840} height={2160} defaultProps={{}} />
        <Composition id="IllSearchlight" component={IllSearchlight} durationInFrames={150} fps={30} width={3840} height={2160} defaultProps={{ bg: "frames/lt-0053-night-heli.jpg" }} />
        <Composition id="IllStinger" component={IllStinger} durationInFrames={180} fps={30} width={3840} height={2160} defaultProps={{}} />
        <Composition id="IllStoreClear" component={IllStoreClear} durationInFrames={210} fps={30} width={3840} height={2160} defaultProps={{}} />
      </Folder>
    </>
  );
};
