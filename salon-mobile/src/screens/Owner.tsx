/**
 * The owner's area, behind the owner password: money, staff attendance with
 * their check-in selfies, staff accounts, and the visit log with void.
 */
import { useMemo, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BarberPole } from "../components/BarberPole";
import { Button } from "../components/Button";
import { LabelFrame } from "../components/LabelFrame";
import { NumberRoll } from "../components/NumberRoll";
import { Press } from "../components/Press";
import { Reveal } from "../components/Reveal";
import { SectionTitle } from "../components/Screen";
import { Segmented } from "../components/Segmented";
import { T } from "../components/T";
import { useToast } from "../components/Toast";
import config from "../config/salon";
import { makeSecret } from "../domain/auth";
import * as E from "../domain/engine";
import { UserError } from "../domain/errors";
import { istDate, isLate } from "../domain/rules";
import { commit, setSession, useData } from "../domain/store";
import type { Staff } from "../domain/types";
import { buildXlsx } from "../domain/xlsx";
import { formatPhone, inr, shortDate } from "../format";
import { useNav } from "../nav/Navigator";
import { hasher } from "../platform/hasher";
import { shareXlsx } from "../platform/share";
import { color, font, radius, space } from "../theme/tokens";
import { istTime, MonthStrip, SelfieThumb } from "./Attendance";
import { Field } from "./Counter";
import { DashboardBody } from "./Dashboard";

type Tab = "today" | "attendance" | "staff" | "visits";

export function Owner() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>("today");
  return (
    <View style={{ flex: 1, backgroundColor: color.paper }}>
      <View style={{ backgroundColor: color.choc, paddingTop: insets.top + space.md, paddingHorizontal: space.lg, paddingBottom: space.md, gap: space.md }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <T v="small" c={color.creamMuted}>
              {config.displayName} · owner
            </T>
            <T v="title" c={color.cream} accessibilityRole="header">
              {tab === "today" ? "Today" : tab === "attendance" ? "Attendance" : tab === "staff" ? "Staff" : "Visits"}
            </T>
          </View>
          <Press onPress={() => setSession(null)} accessibilityLabel="Sign out" style={{ minHeight: 48, justifyContent: "center" }}>
            <T v="bodyStrong" c={color.sealBright}>
              Sign out
            </T>
          </Press>
        </View>
        <Segmented
          label="Owner section"
          value={tab}
          onChange={setTab}
          options={[
            { key: "today", label: "Money" },
            { key: "attendance", label: "Attend." },
            { key: "staff", label: "Staff" },
            { key: "visits", label: "Visits" },
          ]}
        />
      </View>
      <ScrollView key={tab} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: space.lg, paddingBottom: insets.bottom + space.xxxl * 2 }}>
        {tab === "today" ? <DashboardBody /> : tab === "attendance" ? <AttendanceBoard /> : tab === "staff" ? <StaffManager /> : <VisitLog />}
      </ScrollView>
    </View>
  );
}

// ── Attendance board ─────────────────────────────────────────────────────────

function AttendanceBoard() {
  const data = useData();
  const toast = useToast();
  const today = istDate(new Date());
  const [month, setMonth] = useState(today.slice(0, 7));
  const [exporting, setExporting] = useState(0);
  const m = useMemo(() => E.attendanceMonth(data, month), [data, month]);
  const active = data.staff.filter((s) => s.active);
  const todayRecs = new Map(data.attendance.filter((a) => a.date === today).map((a) => [a.staffId, a]));
  const shiftMonth = (delta: number) => {
    const [y, mm] = month.split("-").map(Number);
    const d = new Date(Date.UTC(y, mm - 1 + delta, 1));
    setMonth(d.toISOString().slice(0, 7));
  };

  const exportExcel = async () => {
    setExporting(0.15);
    try {
      const bytes = buildXlsx(E.attendanceSheets(data, month));
      setExporting(0.7);
      await shareXlsx(`attendance-${month}.xlsx`, bytes);
      setExporting(1);
      toast(`Attendance for ${month} exported`);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't export.", "error");
    } finally {
      setTimeout(() => setExporting(0), 900);
    }
  };

  return (
    <>
      <LabelFrame innerStyle={{ padding: space.xl, gap: space.xs }}>
        <T v="small" c={color.inkMuted}>
          Checked in today
        </T>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: space.sm }}>
          <NumberRoll value={todayRecs.size} rupees={false} style={{ fontSize: 44, lineHeight: 52 }} duration={800} />
          <T v="heading" c={color.inkMuted}>
            of {active.length}
          </T>
        </View>
        <T v="small" c={color.inkMuted}>
          Shift starts {config.shift.start}; later than {config.shift.graceMinutes} minutes counts as late.
        </T>
      </LabelFrame>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.md, marginTop: space.lg }}>
        {active.map((s, i) => {
          const rec = todayRecs.get(s.id) ?? null;
          const late = rec ? isLate(rec.checkInAt) : false;
          return (
            <Reveal key={s.id} kind="pop" index={i} style={{ width: "47%", flexGrow: 1 }}>
              <View style={{ borderRadius: radius.label, borderWidth: 1.25, borderColor: color.choc, padding: space.md, alignItems: "center", gap: space.xs, backgroundColor: color.paperLight }}>
                <SelfieThumb record={rec} staff={s} size={84} />
                <T v="bodyStrong" numberOfLines={1}>
                  {s.name}
                </T>
                <T v="small" c={color.inkMuted}>
                  {s.chair}
                </T>
                <View style={{ borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: rec ? (late ? color.seal : color.positive) : color.paperPressed }}>
                  <T v="small" c={rec ? color.paperLight : color.inkMuted}>
                    {rec ? `${late ? "Late" : "On time"} · ${istTime(rec.checkInAt)}` : "Not checked in"}
                  </T>
                </View>
              </View>
            </Reveal>
          );
        })}
        {active.length === 0 ? (
          <T v="body" c={color.inkMuted}>
            No staff yet. Add them in the Staff tab.
          </T>
        ) : null}
      </View>

      <SectionTitle
        aside={
          <View style={{ flexDirection: "row", gap: space.xs }}>
            <Press onPress={() => shiftMonth(-1)} accessibilityLabel="Previous month" style={{ minHeight: 44, minWidth: 44, justifyContent: "center", alignItems: "center" }}>
              <T v="bodyStrong" c={color.seal}>
                Prev
              </T>
            </Press>
            <Press onPress={() => shiftMonth(1)} disabled={month >= today.slice(0, 7)} accessibilityLabel="Next month" style={{ minHeight: 44, minWidth: 44, justifyContent: "center", alignItems: "center", opacity: month >= today.slice(0, 7) ? 0.35 : 1 }}>
              <T v="bodyStrong" c={color.seal}>
                Next
              </T>
            </Press>
          </View>
        }
      >
        {month}
      </SectionTitle>
      <View style={{ flexDirection: "row", gap: space.md, marginBottom: space.md }}>
        <Legend swatch={color.choc} label="Present" />
        <Legend swatch={color.seal} label="Late" />
        <Legend swatch={color.paperPressed} label="Absent" />
      </View>
      {m.rows.map((r, i) => (
        <Reveal key={`${month}-${r.staff.id}`} kind="list" index={i} style={{ marginBottom: space.lg }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
            <T v="bodyStrong">{r.staff.name}</T>
            <T v="small" c={color.inkMuted}>
              {r.present} present · <T v="small" c={r.late ? color.seal : color.inkMuted}>{r.late} late</T>
            </T>
          </View>
          <MonthStrip cells={r.cells} today={today} size={18} />
        </Reveal>
      ))}

      <View style={{ marginTop: space.lg, gap: space.sm }}>
        {exporting > 0 ? <BarberPole progress={exporting} running={exporting < 1} /> : null}
        <Button label={`Export ${month} to Excel`} icon="share" onPress={exportExcel} busy={exporting > 0 && exporting < 1} />
        <T v="small" c={color.inkMuted}>
          One file per month: a summary sheet, then a sheet for each day with check-in times. Selfies stay in the app.
        </T>
      </View>
    </>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: swatch }} />
      <T v="small" c={color.inkMuted}>
        {label}
      </T>
    </View>
  );
}

// ── Staff accounts ───────────────────────────────────────────────────────────

function StaffManager() {
  const data = useData();
  const toast = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [chair, setChair] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const add = async () => {
    setBusy(true);
    try {
      const secret = await makeSecret(password, hasher);
      const s = commit((d) => E.addStaff(d, { name, phone, chair, secret }));
      toast(`${s.name} added. They sign in with ${formatPhone(s.phone)}.`);
      setName("");
      setPhone("");
      setChair("");
      setPassword("");
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't add staff.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {data.staff.map((s, i) => (
        <Reveal key={s.id} kind="list" index={i}>
          <StaffRow staff={s} />
        </Reveal>
      ))}
      {data.staff.length === 0 ? (
        <T v="body" c={color.inkMuted}>
          No staff yet. Add the first one below.
        </T>
      ) : null}

      <SectionTitle>Add staff</SectionTitle>
      <LabelFrame innerStyle={{ padding: space.lg, gap: space.md }}>
        <Field label="Name" value={name} onChangeText={setName} autoCapitalize="words" />
        <Field label="Mobile number (their login)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Field label="Chair" value={chair} onChangeText={setChair} placeholder="e.g. Chair 2" />
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" placeholder="At least 4 characters" />
        <Button label="Add staff member" icon="plus" busy={busy} disabled={!name.trim() || !phone || !password} onPress={add} />
      </LabelFrame>
    </>
  );
}

function StaffRow({ staff }: { staff: Staff }) {
  const toast = useToast();
  const [resetting, setResetting] = useState(false);
  const [pw, setPw] = useState("");
  const save = async () => {
    try {
      const secret = await makeSecret(pw, hasher);
      commit((d) => E.updateStaff(d, staff.id, { secret }));
      toast(`New password set for ${staff.name.split(" ")[0]}`);
      setResetting(false);
      setPw("");
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't save.", "error");
    }
  };
  return (
    <View style={{ paddingVertical: space.md, borderBottomWidth: 1, borderBottomColor: color.ruleSoft, gap: space.sm, opacity: staff.active ? 1 : 0.55 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
        <View style={{ flex: 1 }}>
          <T v="bodyStrong">{staff.name}</T>
          <T v="small" c={color.inkMuted}>
            {formatPhone(staff.phone)} · {staff.chair}
            {staff.active ? "" : " · deactivated"}
          </T>
        </View>
        <Press onPress={() => setResetting((r) => !r)} style={{ minHeight: 44, justifyContent: "center", paddingHorizontal: space.sm }}>
          <T v="small" c={color.seal}>
            Password
          </T>
        </Press>
        <Press
          onPress={() => {
            commit((d) => E.updateStaff(d, staff.id, { active: !staff.active }));
            toast(staff.active ? `${staff.name.split(" ")[0]} can no longer sign in` : `${staff.name.split(" ")[0]} reactivated`);
          }}
          style={{ minHeight: 44, justifyContent: "center", paddingHorizontal: space.sm }}
        >
          <T v="small" c={color.inkMuted}>
            {staff.active ? "Deactivate" : "Reactivate"}
          </T>
        </Press>
      </View>
      {resetting ? (
        <View style={{ flexDirection: "row", gap: space.sm, alignItems: "flex-end" }}>
          <View style={{ flex: 1 }}>
            <Field label="New password" value={pw} onChangeText={setPw} secureTextEntry autoCapitalize="none" />
          </View>
          <Button label="Save" onPress={save} disabled={!pw} />
        </View>
      ) : null}
    </View>
  );
}

// ── Visit log with void ──────────────────────────────────────────────────────

function VisitLog() {
  const data = useData();
  const list = useMemo(() => E.recentVisits(data, 60), [data]);
  return (
    <>
      <T v="small" c={color.inkMuted} style={{ marginBottom: space.md }}>
        Staff can undo a visit themselves for {config.undoWindowMinutes} minutes. After that, only you can void it here. Voiding refunds any wallet money used and takes back a referral reward it paid.
      </T>
      {list.map(({ visit, customer }, i) => (
        <Reveal key={visit.id} kind="list" index={i}>
          <VisitRow visitId={visit.id} name={customer?.name ?? "Unknown"} />
        </Reveal>
      ))}
    </>
  );
}

function VisitRow({ visitId, name }: { visitId: string; name: string }) {
  const data = useData();
  const toast = useToast();
  const nav = useNav();
  const ref = useRef<View>(null);
  const [confirm, setConfirm] = useState(false);
  const [reason, setReason] = useState("");
  const v = data.visits.find((x) => x.id === visitId)!;
  const stylist = data.staff.find((s) => s.id === v.staffId);
  const services = v.serviceIds.map((id) => config.services.find((s) => s.id === id)?.name).join(" + ");
  const voided = v.status === "VOID";
  const doVoid = () => {
    try {
      commit((d) => E.voidVisit(d, { visitId, by: "owner", reason }));
      toast("Visit voided");
      setConfirm(false);
    } catch (e) {
      toast(e instanceof UserError ? e.message : "Couldn't void.", "error");
    }
  };
  return (
    <View ref={ref} collapsable={false} style={{ paddingVertical: space.md, borderBottomWidth: 1, borderBottomColor: color.ruleSoft, gap: space.sm }}>
      <View style={{ flexDirection: "row", gap: space.md }}>
        <Press onPress={() => nav.push({ name: "profile", id: v.customerId }, { from: ref })} style={{ flex: 1 }} scaleTo={0.99}>
          <T v="bodyStrong" style={voided ? { textDecorationLine: "line-through" } : undefined}>
            {name}
          </T>
          <T v="small" c={color.inkMuted}>
            {services} · {stylist?.name.split(" ")[0] ?? ""} · {shortDate(v.paidAt ?? v.createdAt)} {istTime(v.paidAt ?? v.createdAt)}
          </T>
          {voided ? (
            <T v="small" c={color.danger}>
              Voided: {v.voidReason}
            </T>
          ) : null}
        </Press>
        <View style={{ alignItems: "flex-end" }}>
          <T style={{ fontFamily: font.display, fontSize: 17, textDecorationLine: voided ? "line-through" : "none" }}>{inr(v.total)}</T>
          {!voided ? (
            <Press onPress={() => setConfirm((c) => !c)} style={{ minHeight: 36, justifyContent: "center" }}>
              <T v="small" c={color.seal}>
                Void
              </T>
            </Press>
          ) : null}
        </View>
      </View>
      {confirm ? (
        <View style={{ gap: space.sm }}>
          <Field label="Reason (optional)" value={reason} onChangeText={setReason} placeholder="e.g. wrong customer" />
          <View style={{ flexDirection: "row", gap: space.sm }}>
            <View style={{ flex: 1 }}>
              <Button kind="outline" label="Keep" onPress={() => setConfirm(false)} />
            </View>
            <View style={{ flex: 1 }}>
              <Button kind="ink" label="Void visit" onPress={doVoid} />
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}
