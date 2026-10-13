import { useEffect, useMemo, useState } from "react";
import { Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import { LabelFrame } from "../components/LabelFrame";
import { Press } from "../components/Press";
import { Reveal } from "../components/Reveal";
import { Screen, SectionTitle } from "../components/Screen";
import { T } from "../components/T";
import { useToast } from "../components/Toast";
import config from "../config/salon";
import * as E from "../domain/engine";
import { UserError } from "../domain/errors";
import { istDate, isLate } from "../domain/rules";
import { commit, setSession, useData, useSession } from "../domain/store";
import type { Attendance as AttendanceRec, Staff } from "../domain/types";
import { longDate } from "../format";
import { photoUri, savePhoto, takeSelfie } from "../platform/photos";
import { color, font, radius, space } from "../theme/tokens";
import { Monogram } from "./Customers";

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

/** Shows a stored attendance selfie, or the staff member's initials when there is none. */
export function SelfieThumb({ record, staff, size = 64 }: { record: AttendanceRec | null; staff: Staff; size?: number }) {
  const [uri, setUri] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    photoUri(record?.photoKey ?? null).then((u) => live && setUri(u));
    return () => void (live = false);
  }, [record?.photoKey]);
  if (uri) return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color.paperPressed }} accessibilityLabel={`${staff.name}'s check-in photo`} />;
  return <Monogram name={staff.name} size={size} />;
}

/** The first thing staff see after signing in: check in with a selfie before serving customers. */
export function Attendance() {
  const staff = useCurrentStaff();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [now, setNow] = useState(new Date());
  const [shot, setShot] = useState<{ uri: string; at: Date } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);
  if (!staff) return null;
  const late = isLate(shot?.at ?? now);

  const capture = async () => {
    try {
      const uri = await takeSelfie();
      if (uri) setShot({ uri, at: new Date() });
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't open the camera", "error");
    }
  };

  const confirm = async () => {
    if (!shot) return;
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

  return (
    <View style={{ flex: 1, backgroundColor: color.choc, paddingTop: insets.top + space.xl, paddingHorizontal: space.lg, paddingBottom: insets.bottom + space.lg, gap: space.lg }}>
      <Reveal kind="rise">
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flexShrink: 1 }}>
            <T v="small" c={color.creamMuted}>
              {longDate(now)}
            </T>
            <T v="title" c={color.cream}>
              Hi {staff.name.split(" ")[0]}, check in
            </T>
          </View>
          <Press onPress={() => setSession(null)} accessibilityLabel="Sign out" style={{ minHeight: 48, justifyContent: "center", paddingLeft: space.md }}>
            <T v="bodyStrong" c={color.sealBright}>
              Sign out
            </T>
          </Press>
        </View>
      </Reveal>

      <Reveal kind="pop" index={1} style={{ flex: 1 }}>
        <LabelFrame style={{ flex: 1 }} innerStyle={{ padding: space.xl, alignItems: "center", justifyContent: "center", gap: space.lg }}>
          <View style={{ width: 220, height: 220, borderRadius: 110, overflow: "hidden", borderWidth: 2, borderColor: color.choc, backgroundColor: color.paperPressed, alignItems: "center", justifyContent: "center" }}>
            {shot ? (
              <Image source={{ uri: shot.uri }} style={{ width: 220, height: 220 }} accessibilityLabel="Your selfie" />
            ) : (
              <T v="body" c={color.inkMuted} style={{ textAlign: "center", paddingHorizontal: space.xl }}>
                Take a selfie at the counter to mark today's attendance
              </T>
            )}
            {shot ? (
              <View style={{ position: "absolute", bottom: 14, backgroundColor: "rgba(31,15,9,0.75)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
                <T v="small" c={color.cream}>
                  {istTime(shot.at)} · {istDate(shot.at)}
                </T>
              </View>
            ) : null}
          </View>
          <View style={{ alignItems: "center", gap: 2 }}>
            <T style={{ fontFamily: font.display, fontSize: 34, lineHeight: 42 }}>{istTime(shot?.at ?? now)}</T>
            <T v="small" c={late ? color.seal : color.positive}>
              Shift starts {config.shift.start} · {late ? "this counts as late" : "you're on time"}
            </T>
          </View>
        </LabelFrame>
      </Reveal>

      <Reveal kind="rise" index={2} style={{ gap: space.sm }}>
        {shot ? (
          <>
            <Button big label="Confirm attendance" icon="check" busy={busy} onPress={confirm} />
            <Button kind="outlineCream" label="Retake photo" onPress={capture} />
          </>
        ) : (
          <Button big label="Take selfie" icon="spark" onPress={capture} />
        )}
      </Reveal>
    </View>
  );
}

/** Staff's own attendance for this month. */
export function MyAttendance() {
  const staff = useCurrentStaff();
  const data = useData();
  const month = istDate(new Date()).slice(0, 7);
  const m = useMemo(() => E.attendanceMonth(data, month), [data, month]);
  const row = m.rows.find((r) => r.staff.id === staff?.id);
  if (!staff || !row) return <Screen title="My attendance"><T v="body">No attendance yet.</T></Screen>;
  const today = istDate(new Date());
  return (
    <Screen title="My attendance">
      <View style={{ flexDirection: "row", gap: space.md }}>
        <Stat label="Present" value={row.present} />
        <Stat label="Late" value={row.late} tone={row.late ? color.seal : undefined} />
        <Stat label="Absent" value={row.cells.filter((c) => c.date <= today && !c.record).length} />
      </View>
      <SectionTitle>{month}</SectionTitle>
      <MonthStrip cells={row.cells} today={today} />
      <SectionTitle>Check-ins</SectionTitle>
      {[...row.cells].reverse().filter((c) => c.record).map((c, i) => (
        <Reveal key={c.date} kind="list" index={i}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: space.sm, borderBottomWidth: 1, borderBottomColor: color.ruleSoft }}>
            <T v="body">{c.date}</T>
            <T v="bodyStrong" c={c.late ? color.seal : color.ink}>
              {istTime(c.record!.checkInAt)}
              {c.late ? " · late" : ""}
            </T>
          </View>
        </Reveal>
      ))}
    </Screen>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <View style={{ flex: 1, padding: space.md, borderRadius: radius.label, borderWidth: 1.25, borderColor: color.choc }}>
      <T v="small" c={color.inkMuted}>
        {label}
      </T>
      <T style={{ fontFamily: font.display, fontSize: 26, lineHeight: 32 }} c={tone ?? color.ink}>
        {value}
      </T>
    </View>
  );
}

/** A month as a strip of day squares: present, late, absent, or still to come. */
export function MonthStrip({ cells, today, size = 22 }: { cells: { date: string; record: AttendanceRec | null; late: boolean }[]; today: string; size?: number }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
      {cells.map((c, i) => {
        const future = c.date > today;
        const bg = future ? "transparent" : c.record ? (c.late ? color.seal : color.choc) : color.paperPressed;
        return (
          <Reveal key={c.date} kind="pop" index={i} delay={0}>
            <View
              accessibilityLabel={`${c.date}: ${future ? "upcoming" : c.record ? (c.late ? "late" : "present") : "absent"}`}
              style={{ width: size, height: size, borderRadius: 5, backgroundColor: bg, borderWidth: future ? 1 : 0, borderColor: color.ruleSoft, alignItems: "center", justifyContent: "center" }}
            >
              <T style={{ fontFamily: font.semibold, fontSize: 9 }} c={c.record ? color.paperLight : color.inkMuted}>
                {Number(c.date.slice(8))}
              </T>
            </View>
          </Reveal>
        );
      })}
    </View>
  );
}
