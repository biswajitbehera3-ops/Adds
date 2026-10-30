import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Press feedback for everything tappable: a quick 0.97 squeeze (100ms in, 160ms out).
 * Tiny and fast on purpose — staff tap these hundreds of times a day.
 */
export function Press({ style, children, scaleTo = 0.97, ...rest }: Omit<PressableProps, "style"> & { style?: StyleProp<ViewStyle>; scaleTo?: number }) {
  const s = useSharedValue(1);
  const reduced = useReducedMotion();
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <AnimatedPressable
      accessibilityRole="button"
      {...rest}
      onPressIn={(e) => {
        if (!reduced) s.value = withTiming(scaleTo, { duration: 100 });
        rest.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        s.value = withTiming(1, { duration: 160 });
        rest.onPressOut?.(e);
      }}
      style={[style, anim]}
    >
      {children}
    </AnimatedPressable>
  );
}
