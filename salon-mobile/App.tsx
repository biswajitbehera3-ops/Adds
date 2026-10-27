import { Urbanist_400Regular, Urbanist_500Medium, Urbanist_600SemiBold, Urbanist_700Bold, Urbanist_800ExtraBold } from "@expo-google-fonts/urbanist";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { AppState, Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Intro } from "./src/components/Intro";
import { ToastHost } from "./src/components/Toast";
import * as E from "./src/domain/engine";
import { istDate } from "./src/domain/rules";
import { loadStore, observeNow, useData, useLoadFailed, useSession, useStoreReady } from "./src/domain/store";
import { LoadFailed } from "./src/screens/LoadFailed";
import { Navigator, useNav, type Route } from "./src/nav/Navigator";
import { StaffTabs } from "./src/nav/StaffTabs";
import { MyCustomers } from "./src/screens/Home";
import { TodayBookings } from "./src/screens/TodayBookings";
import { Attendance } from "./src/screens/Attendance";
import { ChangePassword, MyAttendance, MyLeave, MyProfile, StaffPrivacy } from "./src/screens/Me";
import { LeaveRequests } from "./src/screens/LeaveRequests";
import { Calendar } from "./src/screens/Calendar";
import { Counter } from "./src/screens/Counter";
import { Customers } from "./src/screens/Customers";
import { Login, Setup } from "./src/screens/Login";
import { OwnerTabs } from "./src/nav/OwnerTabs";
import { StylistEarnings } from "./src/screens/owner/Earnings";
import { AddStylist, StaffAttendance, StaffCard } from "./src/screens/owner/Staff";
import { Bill, TopSpenders } from "./src/screens/owner/TopSpenders";
import { CheckRules, ServicesScreen } from "./src/screens/owner/Guard";
import { Profile } from "./src/screens/Profile";
import { Legal } from "./src/screens/Legal";
import { Refer } from "./src/screens/Refer";
import { Reminders } from "./src/screens/Reminders";
import { Receipt, VisitScreen } from "./src/screens/Visit";
import { APP_MAX_WIDTH, glass } from "./src/theme/tokens";

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
      return <OwnerTabs />;
    case "visit":
      return <VisitScreen id={route.id} />;
    case "receipt":
      return <Receipt visitId={route.visitId} />;
    case "home":
      return <StaffTabs />;
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
    case "calendar":
      return <Calendar />;
    case "me":
      return <MyProfileRoute />;
    case "myLeave":
      return <MyLeave />;
    case "changePassword":
      return <ChangePassword />;
    case "staffPrivacy":
      return <StaffPrivacy />;
    case "leaveRequests":
      return <LeaveRequests />;
    case "myCustomers":
      return <MyCustomers />;
    case "todayBookings":
      return <TodayBookings />;
    case "ownerStylist":
      return <StylistEarnings id={route.id} />;
    case "staffCard":
      return <StaffCard id={route.id} />;
    case "addStylist":
      return <AddStylist />;
    case "staffAttendance":
      return <StaffAttendance id={route.id} />;
    case "topSpenders":
      return <TopSpenders />;
    case "bill":
      return <Bill visitId={route.visitId} />;
    case "services":
      return <ServicesScreen />;
    case "checkRules":
      return <CheckRules />;
  }
}

function MyProfileRoute() {
  const nav = useNav();
  return <MyProfile onBack={nav.pop} />;
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
  // On approved leave today: no check-in selfie is asked for.
  return E.todaysAttendance(data, staff.id) || E.leaveOn(data, staff.id, istDate()) ? { name: "home" } : { name: "attendance" };
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
  const dark = ["home", "login", "setup", "attendance", "calendar", "customers", "profile", "reminders", "me", "myAttendance", "myLeave", "changePassword", "staffPrivacy", "leaveRequests", "myCustomers", "todayBookings", "ownerStylist", "staffCard", "addStylist", "staffAttendance", "topSpenders", "bill", "services", "checkRules", "counter", "visit", "receipt", "refer", "legal", "owner"].includes(top.name);
  return <StatusBar style={dark ? "light" : "dark"} />;
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
    Urbanist_800ExtraBold,
  });
  const ready = useStoreReady();
  const loadFailed = useLoadFailed();
  // Never hold the app hostage to fonts: if they fail or are slow, draw with system fonts.
  const [fontWaitOver, setFontWaitOver] = useState(false);
  useEffect(() => {
    loadStore();
    const t = setTimeout(() => setFontWaitOver(true), 2500);
    // Coming back to the app notes the phone's clock, so a date changed while it sat open is seen (SECURITY-LESSONS 1).
    const sub = AppState.addEventListener("change", (s) => s === "active" && observeNow());
    return () => (clearTimeout(t), sub.remove());
  }, []);
  const fontsSettled = fontsLoaded || !!fontError || fontWaitOver;
  // The intro video plays every time the app opens (BUILD-SPEC 2.1), over the login.
  const [introDone, setIntroDone] = useState(false);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000" }}>
      <SafeAreaProvider>
        {/* Phone-first: on tablets and the web preview the app sits in a phone-width column. */}
        <View style={{ flex: 1, alignItems: "center", backgroundColor: "#000" }}>
          <View
            style={{
              flex: 1,
              width: "100%",
              maxWidth: APP_MAX_WIDTH,
              backgroundColor: glass.deep,
              overflow: "hidden",
              ...(Platform.OS === "web" ? { boxShadow: "0 0 60px rgba(0,0,0,0.45)" } : null),
            }}
          >
            {fontsSettled && ready ? (
              loadFailed ? (
                <LoadFailed />
              ) : (
                <ToastHost>
                  <Root />
                </ToastHost>
              )
            ) : null}
            {!introDone ? <Intro onDone={() => setIntroDone(true)} /> : null}
          </View>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
