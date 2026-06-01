
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import {
    Bot,
    FileText,
    LayoutDashboard,
    LucideIcon,
    Map as MapIcon,
    Satellite as SatelliteIcon,
} from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "../../constants/Colors";
import { useThemeStore } from "../../store/theme";


const icons = {
  dashboard: LayoutDashboard,
  satellite: SatelliteIcon,
  map: MapIcon,
  reports: FileText,
  assistant: Bot,
} as const;

type RouteName = keyof typeof icons;


export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <OrbitTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Painel" }} />
      <Tabs.Screen name="satellite" options={{ title: "Orbital" }} />
      <Tabs.Screen name="map" options={{ title: "Mapa" }} />
      <Tabs.Screen name="reports" options={{ title: "Metricas" }} />
      <Tabs.Screen name="assistant" options={{ title: "Orbit IA" }} />
    </Tabs>
  );
}


function OrbitTabBar(props: any) {
  const { state, descriptors, navigation } = props;
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const mode = useThemeStore((s) => s.mode);

  const barBg =
    mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.85)";
  const barBorder =
    mode === "dark" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
  const blurTint = mode === "dark" ? "dark" : "light";

  return (
    <View style={[styles.shell, { bottom: Math.max(14, insets.bottom) }]}>
      <LinearGradient
        colors={
          mode === "dark"
            ? [
                "rgba(59,130,246,0.24)",
                "rgba(34,197,94,0.16)",
                "rgba(255,255,255,0.06)",
              ]
            : [
                "rgba(59,130,246,0.18)",
                "rgba(34,197,94,0.12)",
                "rgba(255,255,255,0.40)",
              ]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.border}
      >
        <BlurView
          tint={blurTint}
          intensity={24}
          style={[
            styles.bar,
            { backgroundColor: barBg, borderColor: barBorder },
          ]}
        >
          <View style={styles.row}>
            {state.routes.map((route: any, index: number) => {
              const isFocused = state.index === index;
              const { options } = descriptors[route.key];
              const label = options.title ?? route.name;

              const onPress = () => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const Icon = icons[route.name as RouteName] ?? LayoutDashboard;

              return (
                <TabItem
                  key={route.key}
                  label={String(label)}
                  focused={isFocused}
                  onPress={onPress}
                  Icon={Icon}
                />
              );
            })}
          </View>
        </BlurView>
      </LinearGradient>
    </View>
  );
}


function TabItem({
  label,
  focused,
  onPress,
  Icon,
}: {
  label: string;
  focused: boolean;
  onPress: () => void;
  Icon: LucideIcon;
}) {
  const t = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const colors = useColors();
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    Animated.spring(t, {
      toValue: focused ? 1 : 0,
      damping: 18,
      stiffness: 220,
      useNativeDriver: true,
    }).start();
  }, [focused, t]);

  const scale = t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const opacity = t.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] });
  const pillOpacity = t.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  const iconWrapBg = mode === "dark" ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0.06)";
  const iconWrapBorder =
    mode === "dark" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";

  return (
    <Pressable onPress={onPress} style={styles.item}>
      <Animated.View style={[styles.itemInner, { transform: [{ scale }], opacity }]}>
        <Animated.View style={[styles.pill, { opacity: pillOpacity }]}>
          <LinearGradient
            colors={[colors.glowBlue, colors.glowGreen]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <View
          style={[
            styles.iconWrap,
            { backgroundColor: iconWrapBg, borderColor: iconWrapBorder },
          ]}
        >
          <Icon
            size={18}
            color={focused ? colors.softWhite : colors.premiumGray}
          />
        </View>

        <Text
          style={[
            styles.label,
            { color: focused ? colors.softWhite : colors.premiumGray },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}


const styles = StyleSheet.create({
  shell: { position: "absolute", left: 14, right: 14 },
  border: { borderRadius: 22, padding: 1 },
  bar: {
    borderRadius: 21,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 10,
    gap: 6,
  },
  item: { flex: 1 },
  itemInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 16,
    overflow: "hidden",
  },
  pill: {
    position: "absolute",
    left: 2,
    right: 2,
    top: 2,
    bottom: 2,
    borderRadius: 14,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    marginTop: 6,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 0.2,
  },
});