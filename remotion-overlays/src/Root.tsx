import { Composition } from "remotion";
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
    </>
  );
};
