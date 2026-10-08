import { Hind_400Regular, Hind_500Medium, Hind_600SemiBold, Hind_700Bold } from "@expo-google-fonts/hind";
import { RozhaOne_400Regular } from "@expo-google-fonts/rozha-one";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastHost } from "./src/components/Toast";
import { loadStore, useStoreReady } from "./src/domain/store";
import { Navigator, useNav, type Route } from "./src/nav/Navigator";
import { Counter } from "./src/screens/Counter";
import { Customers } from "./src/screens/Customers";
import { Dashboard } from "./src/screens/Dashboard";
import { Home } from "./src/screens/Home";
import { Profile } from "./src/screens/Profile";
import { Refer } from "./src/screens/Refer";
import { Reminders } from "./src/screens/Reminders";
import { APP_MAX_WIDTH, color } from "./src/theme/tokens";

function render(route: Route) {
  switch (route.name) {
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
    case "dashboard":
      return <Dashboard />;
  }
}

function StatusBarForRoute() {
  const { top } = useNav();
  return <StatusBar style={top.name === "home" ? "light" : "dark"} />;
}

export default function App() {
  const [fontsLoaded] = useFonts({ RozhaOne_400Regular, Hind_400Regular, Hind_500Medium, Hind_600SemiBold, Hind_700Bold });
  const ready = useStoreReady();
  useEffect(() => {
    loadStore();
  }, []);

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
            {fontsLoaded && ready ? (
              <ToastHost>
                <Navigator
                  render={(route) => (
                    <>
                      {render(route)}
                      <StatusBarForRoute />
                    </>
                  )}
                />
              </ToastHost>
            ) : null}
          </View>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
