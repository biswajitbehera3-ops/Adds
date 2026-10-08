import { createContext, useCallback, useContext, useRef, useState } from "react";
import { View } from "react-native";
import Animated, { FadeOutDown, SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { color, radius, space } from "../theme/tokens";
import { Icon } from "./Icon";
import { T } from "./T";

type Toast = { id: number; text: string; tone: "ok" | "error" };
const Ctx = createContext<(text: string, tone?: Toast["tone"]) => void>(() => {});

export const useToast = () => useContext(Ctx);

/** Snackbar for transient feedback: errors name the problem, success confirms the action. */
export function ToastHost({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();
  const show = useCallback((text: string, tone: Toast["tone"] = "ok") => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: Date.now(), text, tone });
    timer.current = setTimeout(() => setToast(null), tone === "error" ? 4200 : 2600);
  }, []);
  return (
    <Ctx.Provider value={show}>
      {children}
      <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, bottom: insets.bottom + space.lg, alignItems: "center", paddingHorizontal: space.lg }}>
        {toast ? (
          <Animated.View
            key={toast.id}
            entering={SlideInDown.springify().damping(24).stiffness(260)}
            exiting={FadeOutDown.duration(160)}
            accessibilityLiveRegion="polite"
            style={{
              maxWidth: 440,
              flexDirection: "row",
              alignItems: "center",
              gap: space.sm,
              backgroundColor: toast.tone === "error" ? color.danger : color.choc900,
              paddingVertical: space.md,
              paddingHorizontal: space.lg,
              borderRadius: radius.control,
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 8 },
              elevation: 8,
            }}
          >
            <Icon name={toast.tone === "error" ? "close" : "check"} color={toast.tone === "error" ? color.paperLight : color.sealBright} size={18} strokeWidth={2.25} />
            <T v="bodyStrong" c={color.paperLight} style={{ flexShrink: 1 }}>
              {toast.text}
            </T>
          </Animated.View>
        ) : null}
      </View>
    </Ctx.Provider>
  );
}
