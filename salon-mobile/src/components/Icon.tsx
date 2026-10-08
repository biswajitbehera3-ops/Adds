import Svg, { Circle, Path, Rect } from "react-native-svg";

/** Authored line icons: 24 grid, 1.75 stroke, round caps. */
export type IconName =
  | "counter" | "customers" | "reminders" | "refer" | "dashboard" | "back" | "search" | "check"
  | "plus" | "wallet" | "chat" | "copy" | "share" | "chevron" | "close" | "backspace" | "spark";

const P: Record<IconName, React.ReactNode> = {
  // Scissors
  counter: (
    <>
      <Circle cx="6" cy="6" r="2.75" />
      <Circle cx="6" cy="18" r="2.75" />
      <Path d="M8.2 7.6 20 17M8.2 16.4 20 7M13.5 12h0" />
    </>
  ),
  customers: (
    <>
      <Circle cx="9" cy="8" r="3.25" />
      <Path d="M3 19.5c.6-3.2 3-5 6-5s5.4 1.8 6 5" />
      <Path d="M15.5 4.9a3.25 3.25 0 0 1 0 6.2M17.5 14.7c1.9.6 3.1 2.3 3.5 4.8" />
    </>
  ),
  reminders: (
    <>
      <Circle cx="12" cy="13" r="7.25" />
      <Path d="M12 9.2V13l2.6 1.8M5 4.5 7.5 2.8M19 4.5l-2.5-1.7" />
    </>
  ),
  refer: (
    <>
      <Rect x="3.5" y="9" width="17" height="11.5" rx="1.5" />
      <Path d="M12 9v11.5M3.5 13h17M12 9c-1.5-3.6-6-4.2-6-1.6C6 9 9.5 9 12 9Zm0 0c1.5-3.6 6-4.2 6-1.6C18 9 14.5 9 12 9Z" />
    </>
  ),
  dashboard: <Path d="M4 20V10M10 20V4M16 20v-7M21 20H3" />,
  back: <Path d="M15 5 8 12l7 7" />,
  search: (
    <>
      <Circle cx="11" cy="11" r="6.25" />
      <Path d="m20 20-4.4-4.4" />
    </>
  ),
  check: <Path d="m5 12.5 4.5 4.5L19 7.5" />,
  plus: <Path d="M12 5v14M5 12h14" />,
  wallet: (
    <>
      <Path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" />
      <Rect x="4" y="8" width="16.5" height="11" rx="2" />
      <Circle cx="16" cy="13.5" r="1" />
    </>
  ),
  chat: <Path d="M4.5 19.5 5.6 16A7.75 7.75 0 1 1 8.4 18.6Z" />,
  copy: (
    <>
      <Rect x="8.5" y="8.5" width="11" height="11" rx="1.5" />
      <Path d="M15.5 8.5V6A1.5 1.5 0 0 0 14 4.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" />
    </>
  ),
  share: <Path d="M12 15V3.5M7.5 8 12 3.5 16.5 8M5 12.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-6.5" />,
  chevron: <Path d="m9 5 7 7-7 7" />,
  close: <Path d="M6 6l12 12M18 6 6 18" />,
  backspace: (
    <>
      <Path d="M9 5h10.5A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5H9l-6-7Z" />
      <Path d="m12.5 9.5 5 5M17.5 9.5l-5 5" />
    </>
  ),
  spark: <Path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />,
};

export function Icon({ name, size = 22, color, strokeWidth = 1.75 }: { name: IconName; size?: number; color: string; strokeWidth?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {P[name]}
    </Svg>
  );
}
