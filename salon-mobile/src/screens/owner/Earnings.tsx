/** Owner Earnings tab (BUILD-SPEC 6.3). Placeholder until built. */
import { GlassScreen, GT } from "../../components/glass";
import { OwnerDock } from "../../nav/OwnerTabs";
import { useNav } from "../../nav/Navigator";

export function Earnings() {
  return (
    <GlassScreen title="Earnings" after={<OwnerDock />}>
      <GT>Coming next.</GT>
    </GlassScreen>
  );
}

export function StylistEarnings({ id }: { id: string }) {
  const nav = useNav();
  return (
    <GlassScreen title="Stylist" back="Earnings" onBack={nav.pop}>
      <GT>{id}</GT>
    </GlassScreen>
  );
}
