/** Owner Staff tab (BUILD-SPEC 6.5, 6.4, 4.16). Placeholder until built. */
import { GlassScreen, GT } from "../../components/glass";
import { OwnerDock } from "../../nav/OwnerTabs";
import { useNav } from "../../nav/Navigator";

export function StaffTab() {
  return (
    <GlassScreen title="Staff" after={<OwnerDock />}>
      <GT>Coming next.</GT>
    </GlassScreen>
  );
}

export function StaffCard({ id }: { id: string }) {
  const nav = useNav();
  return (
    <GlassScreen title="Stylist" back="Staff" onBack={nav.pop}>
      <GT>{id}</GT>
    </GlassScreen>
  );
}

export function AddStylist() {
  const nav = useNav();
  return (
    <GlassScreen title="Add a stylist" back="Staff" onBack={nav.pop}>
      <GT>Coming next.</GT>
    </GlassScreen>
  );
}

export function StaffAttendance({ id }: { id: string }) {
  const nav = useNav();
  return (
    <GlassScreen title="Attendance" back="Stylist" onBack={nav.pop}>
      <GT>{id}</GT>
    </GlassScreen>
  );
}
