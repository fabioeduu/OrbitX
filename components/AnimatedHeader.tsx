import React from "react";
import { StyleSheet, Text } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
    interpolate,
    useAnimatedStyle,
} from "react-native-reanimated";

import { OrbitColors } from "../constants/Colors";

type Props = {
  title: string;
  subtitle?: string;
  scrollY?: SharedValue<number>;
};

export function AnimatedHeader({ title, subtitle, scrollY }: Props) {
  const anim = useAnimatedStyle(() => {
    const y = scrollY?.value ?? 0;
    const opacity = interpolate(y, [0, 60], [1, 0.35]);
    const translateY = interpolate(y, [0, 60], [0, -10]);
    return { opacity, transform: [{ translateY }] };
  });

  return (
    <Animated.View style={[styles.wrap, anim]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  title: {
    color: OrbitColors.softWhite,
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 6,
    color: OrbitColors.premiumGray,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
  },
});
