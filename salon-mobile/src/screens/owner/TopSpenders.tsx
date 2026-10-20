/** Owner Customers tab extras (BUILD-SPEC 6.7): Top spenders and a bill with Cancel bill. Placeholder until built. */
import { GlassScreen, GT } from "../../components/glass";
import { useNav } from "../../nav/Navigator";

export function TopSpenders() {
  const nav = useNav();
  return (
    <GlassScreen title="Top spenders" back="Customers" onBack={nav.pop}>
      <GT>Coming next.</GT>
    </GlassScreen>
  );
}

export function Bill({ visitId }: { visitId: string }) {
  const nav = useNav();
  return (
    <GlassScreen title="Bill" back="Customer" onBack={nav.pop}>
      <GT>{visitId}</GT>
    </GlassScreen>
  );
}
