import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { OrbitColors } from "../constants/Colors";
import { PremiumCard } from "./PremiumCard";

type Props = {
  label: string;
  value: string;
  delta?: string;
  tone?: "blue" | "green" | "gray" | "danger" | "warning";
};

export function KPIWidget({ label, value, delta, tone = "blue" }: Props) {
  const accent =
    tone === "green"
      ? OrbitColors.neonGreen
      : tone === "danger"
        ? OrbitColors.danger
        : tone === "warning"
          ? OrbitColors.warning
          : OrbitColors.spaceBlue;

  return (
    <PremiumCard style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.label}>{label}</Text>
        {delta ? (
          <Text style={[styles.delta, { color: accent }]}>{delta}</Text>
        ) : null}
      </View>
      <Text style={styles.value}>{value}</Text>
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
    </PremiumCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    color: OrbitColors.premiumGray,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    letterSpacing: 0.2,
  },
  delta: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  value: {
    color: OrbitColors.softWhite,
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    letterSpacing: 0.3,
  },
  accentBar: {
    marginTop: 12,
    height: 2,
    borderRadius: 999,
    opacity: 0.9,
  },
});
