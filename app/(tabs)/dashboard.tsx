import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Server,
  Settings2,
  Thermometer,
  Wind,
  XOctagon,
  Zap,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  FadeInRight,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { AIRecommendationCard } from "../../components/AIRecommendationCard";
import { AnimatedHeader } from "../../components/AnimatedHeader";
import { EnergyChart } from "../../components/EnergyChart";
import { PremiumCard } from "../../components/PremiumCard";
import { StatusBadge } from "../../components/StatusBadge";
import { useColors } from "../../constants/Colors";
import { dashboardApi } from "../../services/orbitApi";
import { useThemeStore } from "../../store/theme";
import type { AlertSeverity, DatacenterStatus } from "../../types/api";

type AlertLevel = "ok" | "warn" | "critical";
type Alert = {
  id: string;
  zone: string;
  message: string;
  level: AlertLevel;
  time: string;
};
type Zone = { id: string; temp: number; load: number; status: AlertLevel };

const MOCK_ALERTS: Alert[] = [
  {
    id: "1",
    zone: "Zona A3",
    message: "Temperatura acima do setpoint +1.4°C",
    level: "warn",
    time: "2min",
  },
  {
    id: "2",
    zone: "Zona B1",
    message: "Cooling estabilizado, PUE normalizado",
    level: "ok",
    time: "5min",
  },
  {
    id: "3",
    zone: "UPS-02",
    message: "Variação de carga detectada: +18 kW",
    level: "critical",
    time: "8min",
  },
];
const ZONES: Zone[] = [
  { id: "Equinix SP3", temp: 21.2, load: 0.78, status: "ok" },
  { id: "Scala Tamboré", temp: 23.6, load: 0.91, status: "warn" },
  { id: "Ascenty Osasco", temp: 22.8, load: 0.72, status: "ok" },
  { id: "ODATA SP01", temp: 28.2, load: 0.95, status: "critical" },
];
const PUE_MIN = 1.0;
const PUE_MAX = 2.2;

const LiveDot = React.memo(function LiveDot() {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.2, { duration: 800 }), -1, true);
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));
  const colors = useColors();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
      <Animated.View
        style={[
          {
            width: 6,
            height: 6,
            borderRadius: 999,
            backgroundColor: colors.neonGreen,
          },
          style,
        ]}
      />
      <Text
        style={{
          color: colors.neonGreen,
          fontFamily: "Inter_700Bold",
          fontSize: 10,
          letterSpacing: 0.1,
        }}
      >
        AO VIVO
      </Text>
    </View>
  );
});

const PueGauge = React.memo(function PueGauge({ pue }: { pue: number }) {
  const colors = useColors();
  const progress = useSharedValue(0);
  useEffect(() => {
    const norm = (pue - PUE_MIN) / (PUE_MAX - PUE_MIN);
    progress.value = withTiming(Math.min(1, Math.max(0, norm)), {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [pue, progress]);
  const color =
    pue < 1.4 ? colors.neonGreen : pue < 1.7 ? colors.warning : colors.danger;
  const label = pue < 1.4 ? "Excelente" : pue < 1.7 ? "Aceitável" : "Crítico";
  const barStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progress.value, [0, 1], [0, 100])}%`,
  }));
  const pos14 = ((1.4 - PUE_MIN) / (PUE_MAX - PUE_MIN)) * 100;
  const pos17 = ((1.7 - PUE_MIN) / (PUE_MAX - PUE_MIN)) * 100;
  const mode = useThemeStore((s) => s.mode);
  const markColor =
    mode === "dark" ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.20)";
  const trackColor =
    mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  return (
    <PremiumCard>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginBottom: 3,
            }}
          >
            <Cpu size={13} color={colors.premiumGray} />
            <Text
              style={{
                color: colors.softWhite,
                fontFamily: "Inter_600SemiBold",
                fontSize: 13,
              }}
            >
              PUE — Power Usage Effectiveness
            </Text>
          </View>
          <Text
            style={{
              color: colors.premiumGray,
              fontFamily: "Inter_400Regular",
              fontSize: 11,
            }}
          >
            Quanto da energia vai para os servidores
          </Text>
        </View>
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 30,
              lineHeight: 32,
              color,
            }}
          >
            {pue.toFixed(2)}
          </Text>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 999,
              borderWidth: StyleSheet.hairlineWidth,
              backgroundColor: `${color}18`,
              borderColor: `${color}40`,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: 0.08,
                color,
              }}
            >
              {label}
            </Text>
          </View>
        </View>
      </View>
      <View
        style={{
          height: 8,
          borderRadius: 999,
          backgroundColor: trackColor,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Animated.View
          style={[
            { height: "100%", borderRadius: 999, backgroundColor: color },
            barStyle,
          ]}
        />
        <View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: markColor,
            left: `${pos14}%` as any,
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: markColor,
            left: `${pos17}%` as any,
          }}
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 6,
          position: "relative",
          height: 28,
        }}
      >
        <Text
          style={{
            color: colors.premiumGray,
            fontFamily: "Inter_400Regular",
            fontSize: 9,
            textAlign: "center",
            lineHeight: 13,
          }}
        >
          1.0{"\n"}ideal
        </Text>
        <Text
          style={[
            {
              color: colors.premiumGray,
              fontFamily: "Inter_400Regular",
              fontSize: 9,
              textAlign: "center",
              lineHeight: 13,
              position: "absolute",
              transform: [{ translateX: -10 }],
            },
            { left: `${pos14}%` as any },
          ]}
        >
          1.4{"\n"}bom
        </Text>
        <Text
          style={[
            {
              color: colors.premiumGray,
              fontFamily: "Inter_400Regular",
              fontSize: 9,
              textAlign: "center",
              lineHeight: 13,
              position: "absolute",
              transform: [{ translateX: -10 }],
            },
            { left: `${pos17}%` as any },
          ]}
        >
          1.7{"\n"}ruim
        </Text>
        <Text
          style={{
            color: colors.premiumGray,
            fontFamily: "Inter_400Regular",
            fontSize: 9,
            textAlign: "center",
            lineHeight: 13,
            alignSelf: "flex-end",
          }}
        >
          2.2{"\n"}crítico
        </Text>
      </View>
    </PremiumCard>
  );
});

const AlertFeed = React.memo(function AlertFeed({
  alerts,
}: {
  alerts: Alert[];
}) {
  const colors = useColors();
  const mode = useThemeStore((s) => s.mode);
  const ALERT_COLORS = {
    ok: colors.neonGreen,
    warn: colors.warning,
    critical: colors.danger,
  };
  const ALERT_ICONS = {
    ok: <CheckCircle2 size={13} color={colors.neonGreen} />,
    warn: <AlertTriangle size={13} color={colors.warning} />,
    critical: <XOctagon size={13} color={colors.danger} />,
  };
  const criticalCount = alerts.filter((a) => a.level === "critical").length;
  const warnCount = alerts.filter((a) => a.level === "warn").length;
  const borderColor =
    mode === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  return (
    <PremiumCard>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
          <Activity size={14} color={colors.spaceBlue} />
          <Text
            style={{
              color: colors.softWhite,
              fontFamily: "Inter_600SemiBold",
              fontSize: 14,
            }}
          >
            Feed de Alertas
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {criticalCount > 0 && (
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 999,
                borderWidth: StyleSheet.hairlineWidth,
                backgroundColor: `${colors.danger}20`,
                borderColor: `${colors.danger}40`,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 10,
                  color: colors.danger,
                }}
              >
                {criticalCount} crítico
              </Text>
            </View>
          )}
          {warnCount > 0 && (
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 999,
                borderWidth: StyleSheet.hairlineWidth,
                backgroundColor: `${colors.warning}20`,
                borderColor: `${colors.warning}40`,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 10,
                  color: colors.warning,
                }}
              >
                {warnCount} alerta
              </Text>
            </View>
          )}
        </View>
      </View>
      {alerts.map((alert, i) => (
        <Animated.View
          key={alert.id}
          entering={FadeInRight.duration(300).delay(i * 70)}
          style={[
            {
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingVertical: 10,
              position: "relative",
            },
            i < alerts.length - 1 && {
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: borderColor,
            },
          ]}
        >
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: StyleSheet.hairlineWidth,
              backgroundColor: `${ALERT_COLORS[alert.level]}14`,
              borderColor: `${ALERT_COLORS[alert.level]}35`,
            }}
          >
            {ALERT_ICONS[alert.level]}
          </View>
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 2,
              }}
            >
              <Text
                style={{
                  color: colors.softWhite,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 12,
                }}
              >
                {alert.zone}
              </Text>
              <Text
                style={{
                  color: colors.premiumGray,
                  fontFamily: "Inter_400Regular",
                  fontSize: 10,
                }}
              >
                {alert.time} atrás
              </Text>
            </View>
            <Text
              style={{
                color: colors.premiumGray,
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                lineHeight: 16,
              }}
            >
              {alert.message}
            </Text>
          </View>
          <View
            style={{
              width: 3,
              height: "70%",
              borderRadius: 999,
              position: "absolute",
              right: 0,
              backgroundColor: ALERT_COLORS[alert.level],
            }}
          />
        </Animated.View>
      ))}
    </PremiumCard>
  );
});

const ZoneCard = React.memo(function ZoneCard({ zone }: { zone: Zone }) {
  const colors = useColors();
  const mode = useThemeStore((s) => s.mode);
  const ALERT_COLORS = {
    ok: colors.neonGreen,
    warn: colors.warning,
    critical: colors.danger,
  };
  const color = ALERT_COLORS[zone.status];
  const loadPct = Math.round(zone.load * 100);
  const trackBg =
    mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  return (
    <View
      style={{
        flex: 1,
        borderRadius: 16,
        borderWidth: StyleSheet.hairlineWidth,
        backgroundColor: colors.cardBg,
        borderColor: `${color}35`,
        padding: 10,
        gap: 5,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <Server size={11} color={color} />
        <Text style={{ fontFamily: "Inter_700Bold", fontSize: 12, color }}>
          {zone.id}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 3,
          marginTop: 2,
        }}
      >
        <Thermometer size={10} color={colors.premiumGray} />
        <Text style={{ fontFamily: "Inter_700Bold", fontSize: 14, color }}>
          {zone.temp}°C
        </Text>
      </View>
      <View style={{ gap: 3 }}>
        <View
          style={{
            height: 3,
            borderRadius: 999,
            backgroundColor: trackBg,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: "100%",
              borderRadius: 999,
              backgroundColor: color,
              width: `${loadPct}%`,
            }}
          />
        </View>
        <Text
          style={{
            color: colors.premiumGray,
            fontFamily: "Inter_400Regular",
            fontSize: 10,
          }}
        >
          {loadPct}%
        </Text>
      </View>
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 9,
          textTransform: "uppercase",
          letterSpacing: 0.08,
          color,
        }}
      >
        {zone.status === "ok"
          ? "Normal"
          : zone.status === "warn"
            ? "Alerta"
            : "Crítico"}
      </Text>
    </View>
  );
});

export default function DashboardScreen() {
  const router = useRouter();
  const colors = useColors();
  const mode = useThemeStore((s) => s.mode);

  const [energy, setEnergy] = useState(742);
  const [temp, setTemp] = useState(36.8);
  const [carbon, setCarbon] = useState(1.42);
  const [eff, setEff] = useState(92);
  const [pue, setPue] = useState(1.48);
  const [aiRecommendation, setAiRecommendation] = useState(
    "Carregando recomendação da IA…",
  );
  const [overallStatus, setOverallStatus] =
    useState<DatacenterStatus>("ONLINE");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [chartHistory, setChartHistory] = useState<number[]>(() =>
    Array.from({ length: 24 }).map(
      (_, i) => 680 + Math.sin(i / 2) * 35 + (i % 3) * 10,
    ),
  );
  const energyBaseline = useRef(742);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const { data } = await dashboardApi.getKpis();
        const newEnergy = Number(data.energyConsumptionKwh);
        setEnergy(newEnergy);
        setTemp(data.currentTemperatureCelsius);
        setCarbon(Number(data.carbonEmissionTons));
        setPue(data.powerUsageEffectiveness);
        setEff(Math.round((1 - data.aiInsight.overheatProbability) * 100));
        setAiRecommendation(data.aiInsight.recommendation);
        setOverallStatus(data.overallStatus);
        setChartHistory((h) => [...h.slice(1), newEnergy]);
      } catch {}
    };

    fetchKpis();
    const id = setInterval(fetchKpis, 5_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data } = await dashboardApi.getAlerts();
        const list =
          (Object.values(
            data._embedded,
          )[0] as import("../../types/api").AlertResponse[]) ?? [];
        setAlerts(
          list.slice(0, 5).map((a) => ({
            id: String(a.id),
            zone: a.sourceComponent || a.title,
            message: a.message,
            level: toAlertLevel(a.severity),
            time: timeAgo(a.createdAt),
          })),
        );
      } catch {}
    };

    fetchAlerts();
    const id = setInterval(fetchAlerts, 10_000);
    return () => clearInterval(id);
  }, []);

  const energyDiff = energy - energyBaseline.current;
  const energyUp = energyDiff > 0;
  const energyColor =
    energy > 760 ? colors.danger : energyUp ? colors.warning : colors.neonGreen;
  const handleSettings = useCallback(() => router.push("/settings"), [router]);

  const chartMin = Math.min(...chartHistory);
  const chartMax = Math.max(...chartHistory);
  const chartAvg = Math.round(
    chartHistory.reduce((a, b) => a + b, 0) / chartHistory.length,
  );

  
  const gradientColors: [string, string, string] =
    mode === "dark"
      ? [colors.deepBlack, "rgba(59,130,246,0.07)", colors.deepBlack]
      : [colors.deepBlack, "rgba(59,130,246,0.04)", colors.deepBlack];

  const settingsBg =
    mode === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const settingsBorder =
    mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";
  const chartBadgeBg =
    mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const chartBorderC =
    mode === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  return (
    <View style={[styles.root, { backgroundColor: colors.deepBlack }]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <AnimatedHeader
            title="Painel de Controle"
            subtitle="Monitoramento em tempo real • OrbitX"
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginTop: 20,
              marginRight: 20,
            }}
          >
            <LiveDot />
            <Pressable
              onPress={handleSettings}
              style={[
                styles.settingsBtn,
                { backgroundColor: settingsBg, borderColor: settingsBorder },
              ]}
              hitSlop={8}
            >
              <Settings2 size={17} color={colors.softWhite} />
            </Pressable>
          </View>
        </View>

        <Animated.View
          entering={FadeInDown.duration(350)}
          style={styles.statusRow}
        >
          {Object.entries(STATUS_LABELS).map(([key, { label, tone }]) => (
            <StatusBadge
              key={key}
              label={label}
              tone={overallStatus === key ? tone : "gray"}
            />
          ))}
        </Animated.View>

        <View style={styles.grid}>
          {(
            [
              {
                label: "Consumo",
                value: `${energy} kW`,
                delta: `${energyUp ? "+" : ""}${energyDiff} kW`,
                tone: "blue" as const,
                icon: <Zap size={14} color={colors.spaceBlue} />,
                sub: "Potência ativa total",
                iColor: colors.spaceBlue,
              },

              {
                label: "Temperatura",
                value: `${temp}°C`,
                delta: temp > 38 ? "Atenção" : "Normal",
                tone: (temp > 38 ? "warning" : "green") as "warning" | "green",
                icon: (
                  <Thermometer
                    size={14}
                    color={temp > 38 ? colors.warning : colors.neonGreen}
                  />
                ),
                sub: "Média das zonas",
                iColor: temp > 38 ? colors.warning : colors.neonGreen,
              },

              {
                label: "Emissão CO₂",
                value: `${carbon}t`,
                delta: "-1.8%",
                tone: "green" as const,
                icon: <Wind size={14} color={colors.neonGreen} />,
                sub: "tCO₂e por hora",
                iColor: colors.neonGreen,
              },

              {
                label: "IA Saúde",
                value: `${eff}%`,
                delta: eff >= 80 ? "Estável" : "Atenção",
                tone: (eff < 70 ? "warning" : "green") as "warning" | "green",
                icon: (
                  <Activity
                    size={14}
                    color={eff < 70 ? colors.warning : colors.neonGreen}
                  />
                ),
                sub: "Índice de confiança da IA",
                iColor: eff < 70 ? colors.warning : colors.neonGreen,
              },
            ] as const
          ).map((kpi, i) => {
            const dColor =
              kpi.tone === "blue"
                ? energyColor
                : kpi.tone === "warning"
                  ? colors.warning
                  : colors.neonGreen;
            const bColor =
              kpi.tone === "blue"
                ? colors.spaceBlue
                : kpi.tone === "warning"
                  ? colors.warning
                  : colors.neonGreen;
            return (
              <Animated.View
                key={kpi.label}
                entering={FadeInDown.duration(400).delay(i * 50)}
                style={styles.gridItem}
              >
                <PremiumCard style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 9,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: `${kpi.iColor}18`,
                      }}
                    >
                      {kpi.icon}
                    </View>
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 11,
                        color: dColor,
                      }}
                    >
                      {kpi.delta}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: colors.softWhite,
                      fontFamily: "Inter_700Bold",
                      fontSize: 22,
                      letterSpacing: 0.2,
                    }}
                  >
                    {kpi.value}
                  </Text>
                  <Text
                    style={{
                      color: colors.softWhite,
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    {kpi.label}
                  </Text>
                  <Text
                    style={{
                      color: colors.premiumGray,
                      fontFamily: "Inter_400Regular",
                      fontSize: 10,
                      marginTop: 1,
                    }}
                  >
                    {kpi.sub}
                  </Text>
                  <View
                    style={{
                      marginTop: 10,
                      height: 2,
                      borderRadius: 999,
                      opacity: 0.8,
                      backgroundColor: bColor,
                    }}
                  />
                </PremiumCard>
              </Animated.View>
            );
          })}
        </View>

        <Animated.View
          entering={FadeInDown.duration(400).delay(200)}
          style={styles.section}
        >
          <PueGauge pue={pue} />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(400).delay(240)}
          style={styles.section}
        >
          <PremiumCard>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <View>
                <Text
                  style={{
                    color: colors.softWhite,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 14,
                  }}
                >
                  Histórico de Consumo
                </Text>
                <Text
                  style={{
                    color: colors.premiumGray,
                    fontFamily: "Inter_400Regular",
                    fontSize: 11,
                    marginTop: 2,
                  }}
                >
                  Últimas 24 amostras · atualiza a cada 2s
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  backgroundColor: chartBadgeBg,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    backgroundColor: colors.spaceBlue,
                  }}
                />
                <Text
                  style={{
                    color: colors.premiumGray,
                    fontFamily: "Inter_500Medium",
                    fontSize: 11,
                  }}
                >
                  kW
                </Text>
              </View>
            </View>
            <EnergyChart points={chartHistory} />
            <View
              style={{
                flexDirection: "row",
                marginTop: 14,
                paddingTop: 12,
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: chartBorderC,
              }}
            >
              {[
                {
                  label: "MÍN",
                  value: chartMin.toFixed(0),
                  vColor: colors.softWhite,
                },
                {
                  label: "MÉDIA",
                  value: String(chartAvg),
                  vColor: colors.spaceBlue,
                  center: true,
                },
                {
                  label: "MÁX",
                  value: chartMax.toFixed(0),
                  vColor: colors.warning,
                },
              ].map((s) => (
                <View
                  key={s.label}
                  style={[
                    { flex: 1, alignItems: "center" },
                    s.center && {
                      borderLeftWidth: StyleSheet.hairlineWidth,
                      borderRightWidth: StyleSheet.hairlineWidth,
                      borderColor: chartBorderC,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: colors.premiumGray,
                      fontFamily: "Inter_500Medium",
                      fontSize: 9,
                      letterSpacing: 0.08,
                      textTransform: "uppercase",
                      marginBottom: 3,
                    }}
                  >
                    {s.label}
                  </Text>
                  <Text
                    style={{
                      color: s.vColor,
                      fontFamily: "Inter_700Bold",
                      fontSize: 16,
                    }}
                  >
                    {s.value}
                  </Text>
                  <Text
                    style={{
                      color: colors.premiumGray,
                      fontFamily: "Inter_400Regular",
                      fontSize: 10,
                      marginTop: 1,
                    }}
                  >
                    kW
                  </Text>
                </View>
              ))}
            </View>
          </PremiumCard>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(400).delay(280)}
          style={styles.section}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginBottom: 10,
            }}
          >
            <Server size={13} color={colors.premiumGray} />
            <Text
              style={{
                flex: 1,
                color: colors.premiumGray,
                fontFamily: "Inter_600SemiBold",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: 0.1,
              }}
            >
              Zonas Térmicas
            </Text>
            <Text
              style={{
                color: colors.premiumGray,
                fontFamily: "Inter_400Regular",
                fontSize: 11,
              }}
            >
              {ZONES.length} zonas
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {ZONES.map((z) => (
              <ZoneCard key={z.id} zone={z} />
            ))}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(400).delay(320)}
          style={styles.section}
        >
          <AlertFeed alerts={alerts} />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(400).delay(360)}
          style={styles.section}
        >
          <AIRecommendationCard
            title="Recomendação Orbit AI"
            impactLabel="-12% kW"
            body="Ajustar setpoints de refrigeração em +0.6°C nas zonas A3 e B1. Previsão: manter estabilidade térmica e reduzir consumo com margem segura. Zona B2 requer atenção imediata — carga em 95%."
          />
        </Animated.View>
        <View style={{ height: 130 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingTop: 40 },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 16,
  },
  grid: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridItem: { width: "47.5%" },
  section: { paddingHorizontal: 20, marginTop: 16 },
});
