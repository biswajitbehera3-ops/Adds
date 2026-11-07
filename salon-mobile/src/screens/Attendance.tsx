import { useEffect, useState } from "react";
import { Image, Pressable, View } from "react-native";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Backdrop, easeOut, GhostButton, GoldButton, GT } from "../components/glass";
import { Icon } from "../components/Icon";
import { useToast } from "../components/Toast";
import config from "../config/salon";
import * as E from "../domain/engine";
import { UserError } from "../domain/errors";
import { istDate } from "../domain/rules";
import { commit, setSession, useData, useSession } from "../domain/store";
import type { Staff } from "../domain/types";
import { longDate } from "../format";
import { savePhoto, takeSelfie } from "../platform/photos";
import { glass } from "../theme/tokens";

/** Salon-local clock, HH:MM. */
export function istTime(at: Date | string): string {
  const d = new Date(new Date(at).getTime() + 330 * 60000);
  const h = d.getUTCHours();
  return `${((h + 11) % 12) + 1}:${String(d.getUTCMinutes()).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export function useCurrentStaff(): Staff | null {
  const data = useData();
  const session = useSession();
  return session?.role === "staff" ? (data.staff.find((s) => s.id === session.staffId) ?? null) : null;
}

/** The first thing staff see after signing in (BUILD-SPEC 2.3): a glass check-in with a selfie. */
export function Attendance() {
  const staff = useCurrentStaff();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const reduced = useReducedMotion();
  const [now, setNow] = useState(new Date());
  const [shot, setShot] = useState<{ uri: string; at: Date } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);
  if (!staff) return null;
  const late = E.staffLate(staff, shot?.at ?? now);

  const capture = async () => {
    try {
      const uri = await takeSelfie();
      if (uri) setShot({ uri, at: new Date() });
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't open the camera", "error");
    }
  };

  const confirm = async () => {
    if (!shot || busy) return;
    setBusy(true);
    try {
      const key = `${staff.id}-${istDate(shot.at)}`;
      const saved = await savePhoto(key, shot.uri);
      commit((d) => E.markAttendance(d, { staffId: staff.id, photoKey: saved || null }, shot.at));
      toast(`Checked in at ${istTime(shot.at)}${late ? " (late)" : ""}`);
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't save attendance. Try again.", "error");
    } finally {
      setBusy(false);
    }
  };

  const enter = (i: number) => (reduced ? undefined : FadeInDown.duration(420).delay(i * 90).easing(easeOut));
  return (
    <Backdrop>
      <View style={{ flex: 1, paddingTop: insets.top + 18, paddingHorizontal: 20, paddingBottom: insets.bottom + 20, gap: 18 }}>
        <Animated.View entering={enter(0)} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flexShrink: 1, gap: 2 }}>
            <GT size={11.5} w="heavy" c={glass.gold2} style={{ letterSpacing: 1.2, textTransform: "uppercase" }}>
              First login today
            </GT>
            <GT size={28} w="heavy" accessibilityRole="header" style={{ lineHeight: 34 }}>
              Hi {staff.name.split(" ")[0]}, check in
            </GT>
            <GT size={13} c={glass.soft}>
              {longDate(now)}
            </GT>
          </View>
          <Pressable onPress={() => setSession(null)} accessibilityRole="button" accessibilityLabel="Sign out" hitSlop={10} style={{ paddingTop: 4 }}>
            <GT size={13.5} w="bold" c={glass.gold2}>
              Sign out
            </GT>
          </Pressable>
        </Animated.View>

        <Animated.View entering={enter(1)} style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 18 }}>
          <View style={{ width: 236, height: 236, borderRadius: 118, padding: 6, borderWidth: 1.5, borderColor: "rgba(245,201,160,0.6)", backgroundColor: glass.card }}>
            <View style={{ flex: 1, borderRadius: 112, overflow: "hidden", backgroundColor: "rgba(26,18,16,0.45)", alignItems: "center", justifyContent: "center" }}>
              {shot ? (
                <Image source={{ uri: shot.uri }} style={{ width: 224, height: 224 }} accessibilityLabel="Your selfie" />
              ) : (
                <View style={{ alignItems: "center", gap: 8, paddingHorizontal: 28 }}>
                  <Icon name="person" color={glass.gold2} size={44} />
                  <GT size={13.5} c={glass.soft} style={{ textAlign: "center" }}>
                    Take a selfie at the counter to mark today's attendance
                  </GT>
                </View>
              )}
              {shot ? (
                <View style={{ position: "absolute", bottom: 16, backgroundColor: "rgba(26,18,16,0.7)", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}>
                  <GT size={12} w="semibold">
                    {istTime(shot.at)} · {istDate(shot.at)}
                  </GT>
                </View>
              ) : null}
            </View>
          </View>
          <View style={{ alignItems: "center", gap: 6 }}>
            <GT size={46} w="heavy" style={{ lineHeight: 54, fontVariant: ["tabular-nums"] }}>
              {istTime(shot?.at ?? now)}
            </GT>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, backgroundColor: late ? "rgba(240,160,138,0.16)" : "rgba(143,214,164,0.14)", borderWidth: 1, borderColor: late ? "rgba(240,160,138,0.45)" : "rgba(143,214,164,0.4)" }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: late ? glass.late : glass.ok }} />
              <GT size={13} w="bold" c={late ? glass.late : glass.ok}>
                {late ? "Late" : "On time"} · shift starts {staff.shiftStart ?? config.shift.start}
              </GT>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={enter(2)} style={{ gap: 10 }}>
          {shot ? (
            <>
              <GoldButton label={busy ? "Saving…" : "Confirm attendance"} disabled={busy} onPress={confirm} />
              <GhostButton label="Retake" onPress={capture} />
            </>
          ) : (
            <GoldButton label="Take selfie" onPress={capture} />
          )}
        </Animated.View>
      </View>
    </Backdrop>
  );
}
