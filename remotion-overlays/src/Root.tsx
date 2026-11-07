import { Composition, Folder, Still } from "remotion";
import { Avatar, ReelCover, YouTubeBanner } from "./gta/AccountKit";
import { ResultStamp } from "./gta/ResultStamp";
import { WantedHook } from "./gta/WantedHook";
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
    </>
  );
};
