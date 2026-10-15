import { Hind_400Regular, Hind_500Medium, Hind_600SemiBold, Hind_700Bold } from "@expo-google-fonts/hind";
import { RozhaOne_400Regular } from "@expo-google-fonts/rozha-one";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastHost } from "./src/components/Toast";
import * as E from "./src/domain/engine";
import { loadStore, useData, useSession, useStoreReady } from "./src/domain/store";
import { Navigator, useNav, type Route } from "./src/nav/Navigator";
import { Attendance, MyAttendance } from "./src/screens/Attendance";
import { Counter } from "./src/screens/Counter";
import { Customers } from "./src/screens/Customers";
import { Home } from "./src/screens/Home";
import { Login, Setup } from "./src/screens/Login";
import { Owner } from "./src/screens/Owner";
import { Profile } from "./src/screens/Profile";
import { Legal } from "./src/screens/Legal";
import { Refer } from "./src/screens/Refer";
import { Reminders } from "./src/screens/Reminders";
import { Receipt, VisitScreen } from "./src/screens/Visit";
import { APP_MAX_WIDTH, color } from "./src/theme/tokens";

function render(route: Route) {
  switch (route.name) {
    case "setup":
      return <Setup />;
    case "login":
      return <Login />;
    case "attendance":
      return <Attendance />;
    case "myAttendance":
      return <MyAttendance />;
    case "owner":
      return <Owner />;
    case "visit":
      return <VisitScreen id={route.id} />;
    case "receipt":
      return <Receipt visitId={route.visitId} />;
    case "home":
      return <Home />;
    case "counter":
      return <Counter />;
    case "customers":
      return <Customers />;
    case "profile":
      return <Profile id={route.id} />;
    case "reminders":
      return <Reminders />;
    case "refer":
      return <Refer id={route.id} />;
    case "legal":
      return <Legal />;
  }
}

/**
 * Where the app starts: first-launch setup, sign-in, today's attendance for staff
 * who haven't checked in yet, then the staff home or the owner area.
 */
function useRootRoute(): Route {
  const data = useData();
  const session = useSession();
  if (!data.owner) return { name: "setup" };
  if (!session) return { name: "login" };
  if (session.role === "owner") return { name: "owner" };
  const staff = data.staff.find((s) => s.id === session.staffId && s.active);
  if (!staff) return { name: "login" };
  return E.todaysAttendance(data, staff.id) ? { name: "home" } : { name: "attendance" };
}

function Root() {
  const root = useRootRoute();
  // A new root (signed in, checked in, signed out) starts a fresh stack.
  return (
    <Navigator
      key={root.name}
      root={root}
      render={(route) => (
        <>
          {render(route)}
          <StatusBarForRoute />
        </>
      )}
    />
  );
}

function StatusBarForRoute() {
  const { top } = useNav();
  const dark = ["home", "login", "setup", "attendance"].includes(top.name);
  return <StatusBar style={dark ? "light" : "dark"} />;
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({ RozhaOne_400Regular, Hind_400Regular, Hind_500Medium, Hind_600SemiBold, Hind_700Bold });
  const ready = useStoreReady();
  // Never hold the app hostage to fonts: if they fail or are slow, draw with system fonts.
  const [fontWaitOver, setFontWaitOver] = useState(false);
  useEffect(() => {
    loadStore();
    const t = setTimeout(() => setFontWaitOver(true), 2500);
    return () => clearTimeout(t);
  }, []);
  const fontsSettled = fontsLoaded || !!fontError || fontWaitOver;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: color.choc950 }}>
      <SafeAreaProvider>
        {/* Phone-first: on tablets and the web preview the app sits in a phone-width column. */}
        <View style={{ flex: 1, alignItems: "center", backgroundColor: color.choc950 }}>
          <View
            style={{
              flex: 1,
              width: "100%",
              maxWidth: APP_MAX_WIDTH,
              backgroundColor: color.choc,
              overflow: "hidden",
              ...(Platform.OS === "web" ? { boxShadow: "0 0 60px rgba(0,0,0,0.45)" } : null),
            }}
          >
            {fontsSettled && ready ? (
              <ToastHost>
                <Root />
              </ToastHost>
            ) : null}
          </View>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
