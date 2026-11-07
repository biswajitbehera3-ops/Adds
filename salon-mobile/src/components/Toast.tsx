import { createContext, useCallback, useContext, useRef, useState } from "react";
import { View } from "react-native";
import Animated, { FadeOutDown, SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { glass } from "../theme/tokens";
import { Icon } from "./Icon";
import { GT } from "./glass";

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
      <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, bottom: insets.bottom + 18, alignItems: "center", paddingHorizontal: 16 }}>
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
              gap: 10,
              backgroundColor: toast.tone === "error" ? "#5A1F17" : "rgba(38,22,17,0.97)",
              borderWidth: 1,
              borderColor: toast.tone === "error" ? "rgba(240,140,106,0.55)" : glass.line,
              paddingVertical: 13,
              paddingHorizontal: 18,
              borderRadius: 20,
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 8 },
              elevation: 8,
            }}
          >
            <Icon name={toast.tone === "error" ? "close" : "check"} color={toast.tone === "error" ? glass.late : glass.gold} size={18} strokeWidth={2.25} />
            <GT size={15} w="bold" style={{ flexShrink: 1 }}>
              {toast.text}
            </GT>
          </Animated.View>
        ) : null}
      </View>
    </Ctx.Provider>
  );
}
