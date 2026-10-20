/** Owner Live floor (BUILD-SPEC 6.2, 10.8, 10.10). Placeholder until built. */
import { GlassScreen, GT } from "../../components/glass";
import { OwnerDock } from "../../nav/OwnerTabs";

export function Live() {
  return (
    <GlassScreen title="Live floor" after={<OwnerDock />}>
      <GT>Coming next.</GT>
    </GlassScreen>
  );
}
