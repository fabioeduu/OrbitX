import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import {
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    ViewStyle,
} from "react-native";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

import { OrbitColors } from "../constants/Colors";

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: "primary" | "secondary";
};

export function OrbitButton({
  label,
  onPress,
  disabled,
  loading,
  style,
  variant = "primary",
}: Props) {
  const pressed = useSharedValue(0);

  const gradient = useMemo(() => {
    if (variant === "secondary") {
      return ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.04)"] as const;
    }
    return [OrbitColors.spaceBlue, OrbitColors.neonGreen] as const;
  }, [variant]);

  const glow = useMemo(() => {
    if (variant === "secondary") return "rgba(255,255,255,0.12)";
    return OrbitColors.glowBlue;
  }, [variant]);

  const anim = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, 0.98]);
    return {
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View style={[styles.wrap, anim, style, { shadowColor: glow }]}>
      <Pressable
        disabled={disabled || loading}
        onPress={onPress}
        onPressIn={() => {
          pressed.value = withSpring(1, { damping: 18, stiffness: 260 });
        }}
        onPressOut={() => {
          pressed.value = withSpring(0, { damping: 18, stiffness: 260 });
        }}
        style={({ pressed: p }) => [
          styles.pressable,
          (disabled || loading) && styles.disabled,
          p && styles.pressed,
        ]}
      >
        <LinearGradient
          colors={[...gradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Text style={styles.text}>{loading ? "Carregando…" : label}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  pressable: {
    borderRadius: 16,
    overflow: "hidden",
  },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: OrbitColors.softWhite,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.95,
  },
});
