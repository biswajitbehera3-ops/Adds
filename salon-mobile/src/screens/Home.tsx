/**
 * Staff home, after attendance. Search the customer's number the moment they
 * walk in, see who is in the chair now, and reach reminders and referrals.
 * (The front-page redesign replaces this look; the structure stays.)
 */
import { useMemo, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, type IconName } from "../components/Icon";
import { LabelFrame } from "../components/LabelFrame";
import { LetterReveal } from "../components/LetterReveal";
import { NumberRoll } from "../components/NumberRoll";
import { Press } from "../components/Press";
import { Reveal } from "../components/Reveal";
import { T } from "../components/T";
import config from "../config/salon";
import * as E from "../domain/engine";
import { setSession, useData } from "../domain/store";
import { greeting, inr, longDate } from "../format";
import { useNav, type Route } from "../nav/Navigator";
import { color, font, radius, space } from "../theme/tokens";
import { istTime, useCurrentStaff } from "./Attendance";

// The launch cascade plays once per app launch, not on every return home.
let revealed = false;

export function Home() {
  const insets = useSafeAreaInsets();
  const data = useData();
  const me = useCurrentStaff();
  const nav = useNav();
  const searchRef = useRef<View>(null);
  const [menu, setMenu] = useState(false);
  const dash = useMemo(() => E.ownerDashboard(data), [data]);
  const due = useMemo(() => E.overdueReminders(data).filter((r) => !r.remindedAt).length, [data]);
  const inChair = useMemo(() => E.openVisits(data), [data]);
  const animate = !revealed;
  revealed = true;

  return (
    <View style={{ flex: 1, backgroundColor: color.choc }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + space.lg, paddingHorizontal: space.lg, paddingBottom: insets.bottom + space.xxl, gap: space.md }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flexShrink: 1 }}>
            <T v="small" c={color.creamMuted}>
              {longDate()} · {config.displayName}
            </T>
            <LetterReveal text={`${greeting()}, ${me?.name.split(" ")[0] ?? ""}`} enabled={animate} style={{ fontFamily: font.display, fontSize: 32, lineHeight: 40, color: color.cream }} />
          </View>
          <Press onPress={() => setMenu((m) => !m)} accessibilityLabel="Menu" accessibilityState={{ expanded: menu }} style={{ width: 48, height: 48, alignItems: "center", justifyContent: "center" }}>
            <View style={{ gap: 5 }}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={{ width: 22, height: 2, borderRadius: 1, backgroundColor: color.cream }} />
              ))}
            </View>
          </Press>
        </View>

        {menu ? (
          <Reveal kind="rise" style={{ backgroundColor: color.choc700, borderRadius: radius.control, padding: space.sm }}>
            <MenuItem label="My attendance" onPress={() => (setMenu(false), nav.push({ name: "myAttendance" }))} />
            <MenuItem label="All customers" onPress={() => (setMenu(false), nav.push({ name: "customers" }))} />
            <MenuItem label="Privacy & terms" onPress={() => (setMenu(false), nav.push({ name: "legal" }))} />
            <MenuItem label="Sign out" tone={color.sealBright} onPress={() => setSession(null)} />
          </Reveal>
        ) : null}

        <Reveal kind="pop" enabled={animate} index={0}>
          <Press onPress={() => nav.push({ name: "counter" }, { from: searchRef })} accessibilityLabel="Customer walked in: enter their mobile number" scaleTo={0.98}>
            <View ref={searchRef} collapsable={false}>
              <LabelFrame innerStyle={{ padding: space.lg, gap: space.sm }}>
                <T v="heading">Customer walked in?</T>
                <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm, borderWidth: 1.25, borderColor: color.choc, borderRadius: radius.control, paddingHorizontal: space.md, minHeight: 56, backgroundColor: color.paperLight }}>
                  <Icon name="search" color={color.inkMuted} size={22} />
                  <T style={{ fontFamily: font.semibold, fontSize: 18, flex: 1 }} c={color.inkMuted}>
                    Enter mobile number
                  </T>
                  <View style={{ backgroundColor: color.seal, borderRadius: 999, width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
                    <Icon name="chevron" color={color.paperLight} size={20} />
                  </View>
                </View>
              </LabelFrame>
            </View>
          </Press>
        </Reveal>

        {inChair.length ? (
          <Reveal kind="pop" enabled={animate} index={1}>
            <View style={{ backgroundColor: color.choc700, borderRadius: radius.label, padding: space.lg, gap: space.sm }}>
              <T v="label" c={color.creamMuted}>
                In the chair · {inChair.length}
              </T>
              {inChair.map(({ visit, customer }) => (
                <ChairRow key={visit.id} visitId={visit.id} name={customer.name} since={istTime(visit.createdAt)} total={visit.total} stylist={data.staff.find((s) => s.id === visit.staffId)?.name.split(" ")[0] ?? ""} />
              ))}
            </View>
          </Reveal>
        ) : null}

        <Reveal kind="pop" enabled={animate} index={2}>
          <View style={{ flexDirection: "row", gap: space.md }}>
            <Tile route={{ name: "reminders" }} label="Due back" sub="to remind" accessibilityLabel={`Reminders, ${due} due`}>
              <NumberRoll value={due} rupees={false} c={due ? color.seal : color.ink} style={{ fontSize: 28, lineHeight: 36 }} />
            </Tile>
            <Tile route={{ name: "customers" }} label="Customers" sub="on file" accessibilityLabel={`Customers, ${dash.customerCount}`}>
              <NumberRoll value={dash.customerCount} rupees={false} style={{ fontSize: 28, lineHeight: 36 }} />
            </Tile>
          </View>
        </Reveal>
        <Reveal kind="pop" enabled={animate} index={3}>
          <View style={{ flexDirection: "row", gap: space.md }}>
            <Tile route={{ name: "refer" }} label="Refer & earn" sub={`${inr(config.referral.referrerReward)} each`} icon="refer" accessibilityLabel="Refer and earn" />
            <View style={{ flex: 1, borderRadius: radius.label, borderWidth: 1, borderColor: color.creamMuted, padding: space.lg, gap: 2 }}>
              <T v="label" c={color.creamMuted}>
                Today
              </T>
              <NumberRoll value={dash.today.total} c={color.cream} style={{ fontSize: 26, lineHeight: 34 }} />
              <T v="small" c={color.creamMuted}>
                {dash.today.visits} paid
              </T>
            </View>
          </View>
        </Reveal>
      </ScrollView>
    </View>
  );
}

function MenuItem({ label, onPress, tone = color.cream }: { label: string; onPress: () => void; tone?: string }) {
  return (
    <Press onPress={onPress} style={{ minHeight: 48, justifyContent: "center", paddingHorizontal: space.md }}>
      <T v="bodyStrong" c={tone}>
        {label}
      </T>
    </Press>
  );
}

function ChairRow({ visitId, name, since, total, stylist }: { visitId: string; name: string; since: string; total: number; stylist: string }) {
  const nav = useNav();
  const ref = useRef<View>(null);
  return (
    <Press onPress={() => nav.push({ name: "visit", id: visitId }, { from: ref, fromColor: color.choc700 })} accessibilityLabel={`${name}, in the chair since ${since}. Open visit.`} scaleTo={0.985}>
      <View ref={ref} collapsable={false} style={{ flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: space.sm, borderTopWidth: 1, borderTopColor: color.creamFaint }}>
        <View style={{ flex: 1 }}>
          <T v="bodyStrong" c={color.cream} numberOfLines={1}>
            {name}
          </T>
          <T v="small" c={color.creamMuted}>
            since {since} · {stylist}
          </T>
        </View>
        <T style={{ fontFamily: font.display, fontSize: 17 }} c={color.cream}>
          {inr(total)}
        </T>
        <View style={{ backgroundColor: color.seal, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
          <T v="small" c={color.paperLight}>
            Pay
          </T>
        </View>
      </View>
    </Press>
  );
}

function Tile({ route, label, sub, icon, children, accessibilityLabel }: { route: Route; label: string; sub: string; icon?: IconName; children?: React.ReactNode; accessibilityLabel: string }) {
  const nav = useNav();
  const ref = useRef<View>(null);
  return (
    <Press onPress={() => nav.push(route, { from: ref })} accessibilityLabel={accessibilityLabel} style={{ flex: 1 }} scaleTo={0.98}>
      <View ref={ref} collapsable={false}>
        <LabelFrame innerStyle={{ padding: space.lg, gap: 2, minHeight: 112 }}>
          {icon ? <Icon name={icon} color={color.seal} size={26} /> : null}
          <T v="label" c={color.inkMuted} style={{ marginTop: icon ? "auto" : 0 }}>
            {label}
          </T>
          {children}
          <T v="small" c={color.inkMuted}>
            {sub}
          </T>
        </LabelFrame>
      </View>
    </Press>
  );
}
