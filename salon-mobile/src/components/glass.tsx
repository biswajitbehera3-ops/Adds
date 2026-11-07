/**
 * Brown glass building blocks (BUILD-SPEC 1.1): text, frosted card, two-way switch with a
 * sliding thumb, status chip and a bottom sheet that closes on a downward flick.
 * Motion follows MOTION.md: ease (0.23, 1, 0.32, 1), short, nothing loops; Reduce Motion
 * makes every change instant.
 */
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextProps, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Easing, runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BookingState } from "../domain/calendar";
import { glass, urbanist } from "../theme/tokens";
import { Press } from "./Press";

export const easeOut = Easing.bezier(0.23, 1, 0.32, 1);
/** iOS-sheet-like curve for things that rise from the bottom. */
export const drawer = Easing.bezier(0.32, 0.72, 0, 1);

type Weight = keyof typeof urbanist;

/** Urbanist text in cream unless told otherwise. */
export function GT({ size = 15, w = "medium", c = glass.cream, style, ...rest }: TextProps & { size?: number; w?: Weight; c?: string }) {
  return <Text {...rest} style={[{ fontFamily: urbanist[w], fontSize: size, lineHeight: Math.round(size * 1.3), color: c }, style]} />;
}

export function GlassCard({ style, children }: { style?: StyleProp<ViewStyle>; children: React.ReactNode }) {
  return <View style={[{ backgroundColor: glass.card, borderWidth: 1, borderColor: glass.line, borderRadius: 22 }, style]}>{children}</View>;
}

/** Two options with a gold thumb that slides to the chosen one. */
export function GlassSwitch<K extends string>({ options, value, onChange }: { options: { key: K; label: string }[]; value: K; onChange: (k: K) => void }) {
  const [w, setW] = useState(0);
  const reduced = useReducedMotion();
  const idx = Math.max(0, options.findIndex((o) => o.key === value));
  const x = useSharedValue(idx);
  useEffect(() => {
    x.value = reduced ? idx : withTiming(idx, { duration: 240, easing: easeOut });
  }, [idx, reduced, x]);
  const seg = (w - 8) / options.length;
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * seg }] }));
  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      accessibilityRole="tablist"
      style={{ flexDirection: "row", padding: 4, borderRadius: 999, backgroundColor: "rgba(26,18,16,0.45)", borderWidth: 1, borderColor: glass.line }}
    >
      {w ? <Animated.View style={[{ position: "absolute", top: 4, bottom: 4, left: 4, width: seg, borderRadius: 999, backgroundColor: glass.gold }, thumb]} /> : null}
      {options.map((o) => (
        <Pressable key={o.key} onPress={() => onChange(o.key)} accessibilityRole="tab" accessibilityState={{ selected: o.key === value }} style={{ flex: 1, paddingVertical: 9, alignItems: "center" }}>
          <GT size={14} w="bold" c={o.key === value ? glass.ink : glass.soft}>
            {o.label}
          </GT>
        </Pressable>
      ))}
    </View>
  );
}

export const STATE_LABEL: Record<BookingState, string> = { booked: "Booked", late: "Late", inchair: "In chair", done: "Done", noshow: "No-show" };

export function StatusChip({ state, small }: { state: BookingState; small?: boolean }) {
  const fill = state === "inchair" ? glass.gold : "transparent";
  const fg = state === "inchair" ? glass.ink : state === "booked" ? glass.gold2 : state === "late" ? glass.late : glass.faint;
  const border = state === "inchair" ? glass.gold : state === "booked" ? "rgba(245,201,160,0.7)" : state === "late" ? glass.late : "rgba(255,248,241,0.25)";
  return (
    <View style={{ backgroundColor: fill, borderWidth: 1.3, borderColor: border, borderRadius: 999, paddingHorizontal: small ? 7 : 9, paddingVertical: small ? 2 : 3 }}>
      <GT size={small ? 10.5 : 11.5} w="heavy" c={fg} style={state === "noshow" ? { textDecorationLine: "line-through" } : null}>
        {STATE_LABEL[state]}
      </GT>
    </View>
  );
}

/**
 * Bottom sheet over a dimmed screen. Rises on the drawer curve; a downward drag past 110px
 * or a quick flick closes it, otherwise it springs back. `top` makes it a tall sheet.
 */
export function GlassSheet({ open, onClose, top, label, children }: { open: boolean; onClose: () => void; top?: number; label: string; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(open);
  const p = useSharedValue(0);
  const drag = useSharedValue(0);
  const [h, setH] = useState(800);

  useEffect(() => {
    if (open) {
      setMounted(true);
      drag.value = 0;
      p.value = reduced ? 1 : withTiming(1, { duration: 420, easing: drawer });
    } else if (mounted) {
      p.value = withTiming(0, { duration: reduced ? 0 : 280, easing: easeOut }, (done) => {
        if (done) runOnJS(setMounted)(false);
      });
    }
  }, [open, reduced, p, drag, mounted]);

  const pan = Gesture.Pan()
    .activeOffsetY(8)
    .onUpdate((e) => {
      drag.value = e.translationY > 0 ? e.translationY : e.translationY * 0.2;
    })
    .onEnd((e) => {
      if (drag.value > 110 || e.velocityY > 450) runOnJS(onClose)();
      else drag.value = withTiming(0, { duration: 220, easing: easeOut });
    });

  const scrim = useAnimatedStyle(() => ({ opacity: p.value * 0.55 }));
  const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - p.value) * (h + 40) + Math.max(drag.value, -20) }] }));
  if (!mounted) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={open ? "auto" : "none"}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: "#080504" }, scrim]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
      </Animated.View>
      <Animated.View
        accessibilityViewIsModal
        accessibilityLabel={label}
        onLayout={(e) => setH(e.nativeEvent.layout.height)}
        style={[
          {
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            top: top ?? undefined,
            maxHeight: top === undefined ? "88%" : undefined,
            backgroundColor: glass.sheetDeep,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            borderTopWidth: 1,
            borderColor: glass.line,
            paddingBottom: insets.bottom,
            overflow: "hidden",
          },
          sheet,
        ]}
      >
        <View style={[StyleSheet.absoluteFill, { backgroundColor: glass.sheet, bottom: "45%", opacity: 0.6 }]} />
        <GestureDetector gesture={pan}>
          <View style={{ paddingTop: 10, paddingBottom: 6, alignItems: "center" }} accessibilityLabel="Drag down to close">
            <View style={{ width: 40, height: 5, borderRadius: 9, backgroundColor: "rgba(255,244,236,0.3)" }} />
          </View>
        </GestureDetector>
        {children}
      </Animated.View>
    </View>
  );
}

export function GoldButton({ label, onPress, disabled, style }: { label: string; onPress: () => void; disabled?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Press onPress={onPress} disabled={disabled} accessibilityState={{ disabled }} style={[{ backgroundColor: glass.gold, borderRadius: 999, paddingVertical: 14, alignItems: "center", opacity: disabled ? 0.35 : 1 }, style]}>
      <GT size={16} w="heavy" c={glass.ink}>
        {label}
      </GT>
    </Press>
  );
}

export function GhostButton({ label, onPress, tone = glass.cream, style }: { label: string; onPress: () => void; tone?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <Press onPress={onPress} style={[{ backgroundColor: glass.card2, borderWidth: 1, borderColor: glass.line, borderRadius: 999, paddingVertical: 12, alignItems: "center" }, style]}>
      <GT size={14} w="heavy" c={tone}>
        {label}
      </GT>
    </Press>
  );
}

/** The brown studio backdrop behind every glass screen. */
export function Backdrop({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, backgroundColor: glass.deep }}>
      <LinearGradient colors={[glass.glow, glass.mid, glass.deep]} locations={[0, 0.42, 1]} start={{ x: 0.1, y: 0 }} end={{ x: 0.6, y: 1 }} style={StyleSheet.absoluteFill} />
      {children}
    </View>
  );
}

/** A scrolling glass screen: a gold "‹ back" link, a big title, then the content. */
export function GlassScreen({ back, onBack, title, children, after }: { back?: string; onBack?: () => void; title: string; children: React.ReactNode; after?: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Backdrop>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 18, paddingBottom: insets.bottom + 110, gap: 12 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {back && onBack ? (
          <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={`Back to ${back}`} hitSlop={10}>
            <GT size={13.5} w="bold" c={glass.gold2}>
              ‹ {back}
            </GT>
          </Pressable>
        ) : null}
        <GT size={28} w="heavy" accessibilityRole="header" style={{ lineHeight: 34 }}>
          {title}
        </GT>
        {children}
      </ScrollView>
      {after}
    </Backdrop>
  );
}

/** Small uppercase section label. */
export function SectionLabel({ children }: { children: string }) {
  return (
    <GT size={11.5} w="heavy" c={glass.gold2} style={{ letterSpacing: 1.2, textTransform: "uppercase", marginTop: 4 }}>
      {children}
    </GT>
  );
}

/** The approved round wallet badge: a gold ring with "WALLET" and the balance. */
export function WalletBadge({ amount, size = 76 }: { amount: number; size?: number }) {
  const text = `₹${Math.round(amount).toLocaleString("en-IN")}`;
  return (
    <View accessible accessibilityLabel={`Wallet ${text}`} style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 1.5, borderColor: "rgba(245,201,160,0.7)", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(26,18,16,0.25)" }}>
      <GT size={size * 0.12} w="heavy" c={glass.gold2} style={{ letterSpacing: 1.2 }}>
        WALLET
      </GT>
      <GT size={text.length > 6 ? size * 0.2 : size * 0.24} w="heavy" style={{ fontVariant: ["tabular-nums"] }}>
        {text}
      </GT>
    </View>
  );
}
