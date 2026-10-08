import { useMemo, useRef } from "react";
import { ScrollView, View } from "react-native";
import Svg, { Ellipse } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, type IconName } from "../components/Icon";
import { LabelFrame } from "../components/LabelFrame";
import { NumberRoll } from "../components/NumberRoll";
import { Press } from "../components/Press";
import { Reveal } from "../components/Reveal";
import { T } from "../components/T";
import config from "../config/salon";
import * as E from "../domain/engine";
import { useData } from "../domain/store";
import { greeting, longDate } from "../format";
import { useNav, type Route } from "../nav/Navigator";
import { color, space } from "../theme/tokens";

// The hub's cascade plays once per app launch, not on every return to it.
let revealed = false;

export function Home() {
  const insets = useSafeAreaInsets();
  const data = useData();
  const dash = useMemo(() => E.ownerDashboard(data), [data]);
  const due = useMemo(() => E.overdueReminders(data).filter((r) => !r.remindedAt).length, [data]);
  const animate = !revealed;
  revealed = true;

  return (
    <View style={{ flex: 1, backgroundColor: color.choc }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + space.xl, paddingHorizontal: space.lg, paddingBottom: insets.bottom + space.xxl, gap: space.md }}>
        <Reveal enabled={animate} index={0}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: space.md }}>
            <View style={{ flexShrink: 1 }}>
              <T v="small" c={color.creamMuted}>
                {longDate()}
              </T>
              <T v="display" c={color.cream} accessibilityRole="header">
                {greeting()}
              </T>
            </View>
            {data.demo ? (
              <View style={{ marginTop: 4, borderWidth: 1, borderColor: color.creamMuted, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
                <T v="small" c={color.creamMuted}>
                  Demo data
                </T>
              </View>
            ) : null}
          </View>
        </Reveal>

        <Reveal enabled={animate} index={1}>
          <HubLabel route={{ name: "counter" }} big accessibilityLabel="Counter. Log a walk-in.">
            <View style={{ flexDirection: "row", alignItems: "center", padding: space.lg, gap: space.lg }}>
              <View style={{ flex: 1, gap: 2 }}>
                <T v="title">Counter</T>
                <T v="body" c={color.inkMuted}>
                  Phone number in, visit logged.
                </T>
              </View>
              <SealIcon icon="counter" />
            </View>
          </HubLabel>
        </Reveal>

        <Reveal enabled={animate} index={2}>
          <View style={{ flexDirection: "row", gap: space.md }}>
            <HubLabel route={{ name: "dashboard" }} style={{ flex: 1.15 }} accessibilityLabel={`Today's takings, ${dash.today.visits} visits`}>
              <View style={{ padding: space.lg, gap: 2 }}>
                <T v="label" c={color.inkMuted}>
                  Today
                </T>
                <NumberRoll value={dash.today.total} style={{ fontSize: 28, lineHeight: 36 }} />
                <T v="small" c={color.inkMuted}>
                  {dash.today.visits} {dash.today.visits === 1 ? "visit" : "visits"}
                </T>
              </View>
            </HubLabel>
            <HubLabel route={{ name: "reminders" }} style={{ flex: 1 }} accessibilityLabel={`Reminders, ${due} due`}>
              <View style={{ padding: space.lg, gap: 2 }}>
                <T v="label" c={color.inkMuted}>
                  Due back
                </T>
                <NumberRoll value={due} rupees={false} c={due ? color.seal : color.ink} style={{ fontSize: 28, lineHeight: 36 }} />
                <T v="small" c={color.inkMuted}>
                  to remind
                </T>
              </View>
            </HubLabel>
          </View>
        </Reveal>

        <Reveal enabled={animate} index={3}>
          <View style={{ flexDirection: "row", gap: space.md }}>
            <HubLabel route={{ name: "customers" }} style={{ flex: 1 }} accessibilityLabel={`Customers, ${dash.customerCount}`}>
              <Tile icon="customers" title="Customers" sub={`${dash.customerCount} on file`} />
            </HubLabel>
            <HubLabel route={{ name: "refer" }} style={{ flex: 1 }} accessibilityLabel="Refer and earn">
              <Tile icon="refer" title="Refer & Earn" sub={`₹${config.referral.referrerReward} each`} />
            </HubLabel>
          </View>
        </Reveal>

        <Reveal enabled={animate} index={4}>
          <HubLabel route={{ name: "dashboard" }} dark accessibilityLabel="Owner dashboard">
            <View style={{ flexDirection: "row", alignItems: "center", padding: space.lg, gap: space.md }}>
              <Icon name="dashboard" color={color.sealBright} size={26} />
              <View style={{ flex: 1 }}>
                <T v="heading" c={color.cream}>
                  Owner dashboard
                </T>
                <T v="small" c={color.creamMuted}>
                  Takings, stylists, best customers, wallet money held
                </T>
              </View>
              <Icon name="chevron" color={color.creamMuted} size={20} />
            </View>
          </HubLabel>
        </Reveal>
      </ScrollView>
    </View>
  );
}

function HubLabel({ route, children, style, big, dark, accessibilityLabel }: { route: Route; children: React.ReactNode; style?: object; big?: boolean; dark?: boolean; accessibilityLabel: string }) {
  const nav = useNav();
  const ref = useRef<View>(null);
  return (
    <Press
      onPress={() => nav.push(route, { from: ref, fromColor: dark ? color.choc700 : color.paper })}
      accessibilityLabel={accessibilityLabel}
      style={style}
      scaleTo={0.98}
    >
      <View ref={ref} collapsable={false}>
        <LabelFrame ground={dark ? color.choc700 : color.paper} ink={dark ? color.creamMuted : color.rule} style={big ? { minHeight: 132 } : undefined}>
          {children}
        </LabelFrame>
      </View>
    </Press>
  );
}

function Tile({ icon, title, sub }: { icon: IconName; title: string; sub: string }) {
  return (
    <View style={{ padding: space.lg, gap: space.sm, minHeight: 118 }}>
      <Icon name={icon} color={color.seal} size={26} />
      <View style={{ marginTop: "auto" }}>
        <T v="heading">{title}</T>
        <T v="small" c={color.inkMuted}>
          {sub}
        </T>
      </View>
    </View>
  );
}

/** Small wax seal carrying an icon — the Counter label's mark. */
function SealIcon({ icon }: { icon: IconName }) {
  const w = 88;
  const h = 66;
  return (
    <View style={{ width: w, height: h, alignItems: "center", justifyContent: "center", transform: [{ rotate: "-6deg" }] }}>
      <Svg width={w} height={h} style={{ position: "absolute" }}>
        <Ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 1} ry={h / 2 - 1} fill={color.seal} />
        <Ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 5} ry={h / 2 - 5} fill="none" stroke={color.paperLight} strokeWidth={1} />
        <Ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 8} ry={h / 2 - 8} fill="none" stroke={color.paperLight} strokeWidth={0.75} strokeDasharray="1.5 2.5" />
      </Svg>
      {/* Wrapped so it stacks above the absolutely positioned seal on the web. */}
      <View>
        <Icon name={icon} color={color.paperLight} size={28} />
      </View>
    </View>
  );
}
