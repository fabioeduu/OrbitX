import { BlurView } from "expo-blur";
import React from "react";
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { OrbitColors } from "../constants/Colors";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
};

export function GlassContainer({ children, style, intensity = 22 }: Props) {
  if (Platform.OS === "web") {
    return <View style={[styles.webFallback, style]}>{children}</View>;
  }

  return (
    <BlurView
      tint="dark"
      intensity={intensity}
      style={[styles.container, style]}
    >
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: OrbitColors.glassFill,
    borderColor: OrbitColors.glassBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 22,
    overflow: "hidden",
  },
  webFallback: {
    backgroundColor: OrbitColors.glassFill,
    borderColor: OrbitColors.glassBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 22,
    overflow: "hidden",
  },
});
