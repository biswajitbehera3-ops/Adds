import { Composition } from "remotion";
import { MoneyCounter } from "./MoneyCounter";

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
    </>
  );
};
