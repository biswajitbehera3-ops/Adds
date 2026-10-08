import { ScrollView, View, type ScrollViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNav } from "../nav/Navigator";
import { color, space } from "../theme/tokens";
import { IconButton } from "./Button";
import { T } from "./T";

/** A paper screen: back button, Rozha title, optional trailing slot, scrolling body. */
export function Screen({
  title,
  right,
  children,
  scroll = true,
  footer,
  scrollProps,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  scroll?: boolean;
  footer?: React.ReactNode;
  scrollProps?: ScrollViewProps;
}) {
  const insets = useSafeAreaInsets();
  const nav = useNav();
  return (
    <View style={{ flex: 1, backgroundColor: color.paper }}>
      <View
        style={{
          paddingTop: insets.top + space.xs,
          paddingHorizontal: space.sm,
          paddingBottom: space.sm,
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: color.ruleSoft,
        }}
      >
        <IconButton icon="back" label="Back" onPress={nav.pop} />
        <T v="title" accessibilityRole="header" style={{ flex: 1, marginLeft: space.xs }} numberOfLines={1}>
          {title}
        </T>
        {right}
      </View>
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: space.lg, paddingBottom: insets.bottom + space.xxxl * 2 }}
          {...scrollProps}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{children}</View>
      )}
      {footer}
    </View>
  );
}

export function SectionTitle({ children, aside }: { children: string; aside?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: space.xl, marginBottom: space.md }}>
      <T v="heading" accessibilityRole="header">
        {children}
      </T>
      {aside}
    </View>
  );
}

/** Ruled divider: the label's double rule, used between list rows. */
export function Rule({ soft = true }: { soft?: boolean }) {
  return <View style={{ height: 1, backgroundColor: soft ? color.ruleSoft : color.rule }} />;
}
