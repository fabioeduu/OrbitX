import { LinearGradient } from "expo-linear-gradient";
import {
    Activity,
    AlertTriangle,
    Clock3,
    Footprints,
    Globe,
    MapPin,
    Radio,
    RefreshCw,
    Satellite,
    Signal,
    Sun,
} from "lucide-react-native";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Animated, {
    Easing,
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

import { AnimatedHeader } from "../../components/AnimatedHeader";
import { PremiumCard } from "../../components/PremiumCard";
import { OrbitColors } from "../../constants/Colors";

type ISSData = {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number; // km/h — API retorna nessa unidade
  visibility: string; // "daylight" | "eclipsed"
  footprint: number; // km — diâmetro da área visível da ISS
  solar_lat: number; // latitude do sol em graus
  timestamp: number; // unix
};

const ISS_API = "https://api.wheretheiss.at/v1/satellites/25544";
const GLOBE_SIZE = 280;
const GLOBE_R = GLOBE_SIZE / 2;

const BRAZIL_LAT = -14.235;
const BRAZIL_LNG = -51.925;

function projectToGlobe(lat: number, lng: number, r: number) {
  const latR = (lat * Math.PI) / 180;
  const lngR = (lng * Math.PI) / 180;
  return {
    x: r * Math.cos(latR) * Math.sin(lngR),
    y: -r * Math.sin(latR),
    visible: r * Math.cos(latR) * Math.cos(lngR) >= 0,
  };
}

function formatCoord(value: number, pos: string, neg: string) {
  return `${Math.abs(value).toFixed(4)}° ${value >= 0 ? pos : neg}`;
}

function toKms(kmh: number) {
  return (kmh / 3600).toFixed(3);
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const LiveBadge = React.memo(function LiveBadge() {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.25, { duration: 750 }), -1, true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));
  return (
    <View style={styles.liveBadge}>
      <Animated.View style={[styles.liveDot, dotStyle]} />
      <Text style={styles.liveText}>AO VIVO</Text>
    </View>
  );
});

const InfoRow = React.memo(function InfoRow({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={styles.infoBody}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
        {sub ? <Text style={styles.infoSub}>{sub}</Text> : null}
      </View>
    </View>
  );
});

const GlobeView = React.memo(function GlobeView({ data }: { data: ISSData }) {
  const spin = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(
      withTiming(1, { duration: 90_000, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const globeStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  const iss = projectToGlobe(data.latitude, data.longitude, GLOBE_R * 0.85);
  const brazil = projectToGlobe(BRAZIL_LAT, BRAZIL_LNG, GLOBE_R * 0.85);

  const distKm = haversineKm(
    data.latitude,
    data.longitude,
    BRAZIL_LAT,
    BRAZIL_LNG,
  );
  const isNear = distKm < data.footprint / 2;

  const lineLen = Math.sqrt((iss.x - brazil.x) ** 2 + (iss.y - brazil.y) ** 2);
  const lineAngle = Math.atan2(iss.y - brazil.y, iss.x - brazil.x);

  const issColor =
    data.visibility === "daylight" ? "#F59E0B" : OrbitColors.spaceBlue;

  return (
    <View style={styles.globeWrap}>
      <View style={styles.atmosphere} />
      <View style={styles.globeGlow} />

      <Animated.View style={[styles.realGlobe, globeStyle]}>
        <Image
          source={{
            uri: "https://upload.wikimedia.org/wikipedia/commons/0/04/Solarsystemscope_texture_8k_earth_daymap.jpg",
          }}
          style={styles.earthTexture}
        />
        <View style={styles.globeOverlay} />
      </Animated.View>

      {iss.visible && brazil.visible && (
        <View
          style={
            {
              position: "absolute",
              left: GLOBE_R + brazil.x,
              top: GLOBE_R + brazil.y,
              width: lineLen,
              height: 1,
              backgroundColor: isNear
                ? "rgba(34,197,94,0.55)"
                : "rgba(255,255,255,0.14)",
              transform: [{ rotate: `${lineAngle}rad` }],
              transformOrigin: "0 50%",
            } as any
          }
        />
      )}

      {brazil.visible && (
        <>
          <View
            style={[
              styles.brazilDot,
              { left: GLOBE_R + brazil.x - 5, top: GLOBE_R + brazil.y - 5 },
            ]}
          />
          <View
            style={[
              styles.brazilLabel,
              { left: GLOBE_R + brazil.x + 10, top: GLOBE_R + brazil.y - 10 },
            ]}
          >
            <Text style={styles.brazilText}>Brasil</Text>
          </View>
        </>
      )}

      <View
        style={[
          styles.issContainer,
          {
            left: GLOBE_R + iss.x - 16,
            top: GLOBE_R + iss.y - 16,
            opacity: iss.visible ? 1 : 0.25,
          },
        ]}
      >
        <View style={[styles.issPulse, { backgroundColor: `${issColor}30` }]} />
        <View style={[styles.issDot, { backgroundColor: issColor }]}>
          <Satellite size={10} color="#FFF" />
        </View>
      </View>

      <View
        style={[
          styles.issLabel,
          { left: GLOBE_R + iss.x + 18, top: GLOBE_R + iss.y - 10 },
        ]}
      >
        <Text style={[styles.issText, { color: issColor }]}>ISS</Text>
      </View>
    </View>
  );
});

const BrazilStatus = React.memo(function BrazilStatus({
  data,
}: {
  data: ISSData;
}) {
  const dist = haversineKm(
    data.latitude,
    data.longitude,
    BRAZIL_LAT,
    BRAZIL_LNG,
  );
  const inRange = dist < data.footprint / 2;
  const color = inRange ? OrbitColors.neonGreen : OrbitColors.premiumGray;

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: inRange
            ? "rgba(34,197,94,0.12)"
            : "rgba(255,255,255,0.06)",
          borderColor: inRange
            ? "rgba(34,197,94,0.30)"
            : "rgba(255,255,255,0.10)",
        },
      ]}
    >
      <MapPin size={12} color={color} />
      <Text style={[styles.statusText, { color }]}>
        {inRange
          ? `ISS visivel do Brasil • ${Math.round(dist).toLocaleString("pt-BR")} km`
          : `ISS a ${Math.round(dist).toLocaleString("pt-BR")} km do Brasil`}
      </Text>
    </View>
  );
});

export default function SatelliteScreen() {
  const [data, setData] = useState<ISSData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateTime, setUpdateTime] = useState("");
  const mountedRef = useRef(true);

  const fetchISS = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(ISS_API);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!mountedRef.current) return;
      setData({
        latitude: json.latitude,
        longitude: json.longitude,
        altitude: json.altitude,
        velocity: json.velocity,
        visibility: json.visibility,
        footprint: json.footprint,
        solar_lat: json.solar_lat,
        timestamp: json.timestamp,
      });
      setUpdateTime(
        new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    } catch {
      if (mountedRef.current) setError("Nao foi possivel conectar a ISS.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchISS();
    const id = setInterval(fetchISS, 5000);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [fetchISS]);

  const visibilityLabel = useMemo(() => {
    if (!data) return "";
    return data.visibility === "daylight" ? "Luz do dia" : "Zona de eclipse";
  }, [data]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#020617", "#04142B", "#071F3B", "#020617"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <AnimatedHeader
            title="OrbitX Brasil"
            subtitle="ISS em tempo real • atualiza a cada 5s"
          />
          <Pressable style={styles.refreshBtn} onPress={fetchISS} hitSlop={10}>
            <RefreshCw size={15} color={OrbitColors.softWhite} />
          </Pressable>
        </View>

        {loading && (
          <View style={styles.stateBox}>
            <Signal size={22} color={OrbitColors.neonGreen} />
            <Text style={styles.stateText}>Conectando a ISS...</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.stateBox}>
            <AlertTriangle size={22} color={OrbitColors.danger} />
            <Text style={[styles.stateText, { color: OrbitColors.danger }]}>
              {error}
            </Text>
            <Pressable style={styles.retryBtn} onPress={fetchISS}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </Pressable>
          </View>
        )}

        {data && (
          <Animated.View
            entering={FadeInDown.duration(500)}
            style={styles.globeSection}
          >
            <GlobeView data={data} />
            <BrazilStatus data={data} />
          </Animated.View>
        )}

        {data && (
          <Animated.View
            entering={FadeInDown.duration(600)}
            style={styles.section}
          >
            <PremiumCard>
              <View style={styles.cardHeader}>
                <View style={styles.cardIcon}>
                  <Satellite size={16} color={OrbitColors.spaceBlue} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>ISS - NASA</Text>
                  <Text style={styles.cardSub}>
                    Estacao Espacial Internacional
                  </Text>
                </View>
                <LiveBadge />
              </View>

              <View style={styles.divider} />

              <InfoRow
                icon={<MapPin size={14} color={OrbitColors.neonGreen} />}
                label="Latitude"
                value={formatCoord(data.latitude, "N", "S")}
              />
              <InfoRow
                icon={<MapPin size={14} color={OrbitColors.neonGreen} />}
                label="Longitude"
                value={formatCoord(data.longitude, "L", "O")}
              />
              <InfoRow
                icon={<Globe size={14} color={OrbitColors.spaceBlue} />}
                label="Altitude"
                value={`${data.altitude.toFixed(1)} km`}
                sub={`Orbita baixa - ${Math.round(data.altitude)} km acima do nivel do mar`}
              />
              <InfoRow
                icon={<Activity size={14} color="#F59E0B" />}
                label="Velocidade"
                value={`${toKms(data.velocity)} km/s`}
                sub={`${Math.round(data.velocity).toLocaleString("pt-BR")} km/h`}
              />
              <InfoRow
                icon={<Radio size={14} color="#A855F7" />}
                label="Visibilidade"
                value={visibilityLabel}
                sub={
                  data.visibility === "daylight"
                    ? "Sol iluminando a estacao"
                    : "ISS na sombra da Terra"
                }
              />
              <InfoRow
                icon={<Footprints size={14} color={OrbitColors.premiumGray} />}
                label="Cobertura (footprint)"
                value={`${Math.round(data.footprint).toLocaleString("pt-BR")} km`}
                sub="Diametro da area onde a ISS e visivel a olho nu"
              />
              <InfoRow
                icon={<Sun size={14} color="#F59E0B" />}
                label="Latitude solar"
                value={formatCoord(data.solar_lat, "N", "S")}
                sub="Posicao do sol em relacao ao equador terrestre"
              />
              <InfoRow
                icon={<Clock3 size={14} color={OrbitColors.premiumGray} />}
                label="Ultima atualizacao"
                value={updateTime}
                sub={`Timestamp Unix: ${data.timestamp}`}
              />
            </PremiumCard>
          </Animated.View>
        )}

        {data && (
          <View style={styles.footer}>
            <Globe size={11} color={OrbitColors.premiumGray} />
            <Text style={styles.footerText}>
              Fonte: wheretheiss.at - Atualizacao automatica a cada 5s
            </Text>
          </View>
        )}

        <View style={{ height: 130 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: OrbitColors.deepBlack },
  content: { paddingTop: 40 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingRight: 20,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
  },

  stateBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 10,
  },
  stateText: {
    color: OrbitColors.premiumGray,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(239,68,68,0.12)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(239,68,68,0.3)",
  },
  retryText: {
    color: OrbitColors.danger,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },

  globeSection: { alignItems: "center", marginTop: 10 },
  globeWrap: {
    width: GLOBE_SIZE,
    height: GLOBE_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  atmosphere: {
    position: "absolute",
    width: GLOBE_SIZE + 50,
    height: GLOBE_SIZE + 50,
    borderRadius: 999,
    backgroundColor: "rgba(59,130,246,0.10)",
  },
  globeGlow: {
    position: "absolute",
    width: GLOBE_SIZE + 80,
    height: GLOBE_SIZE + 80,
    borderRadius: 999,
    backgroundColor: "rgba(34,197,94,0.05)",
  },
  realGlobe: {
    width: GLOBE_SIZE,
    height: GLOBE_SIZE,
    borderRadius: GLOBE_R,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "#000",
  },
  earthTexture: { width: "100%", height: "100%", resizeMode: "cover" },
  globeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.12)",
  },

  brazilDot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: OrbitColors.neonGreen,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  brazilLabel: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  brazilText: {
    color: OrbitColors.neonGreen,
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },

  issContainer: {
    position: "absolute",
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  issPulse: { position: "absolute", width: 32, height: 32, borderRadius: 999 },
  issDot: {
    width: 20,
    height: 20,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  issLabel: {
    position: "absolute",
    backgroundColor: "rgba(2,6,23,0.88)",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
  },
  issText: { fontSize: 10, fontFamily: "Inter_700Bold" },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statusText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },

  section: { paddingHorizontal: 20, marginTop: 18 },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "rgba(59,130,246,0.12)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(59,130,246,0.25)",
  },
  cardTitle: {
    color: OrbitColors.softWhite,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  cardSub: { color: OrbitColors.premiumGray, fontSize: 12, marginTop: 2 },

  liveBadge: { flexDirection: "row", alignItems: "center", gap: 5 },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: OrbitColors.neonGreen,
  },
  liveText: {
    color: OrbitColors.neonGreen,
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginVertical: 16,
  },

  infoRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 16 },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
  },
  infoBody: { flex: 1 },
  infoLabel: {
    color: OrbitColors.premiumGray,
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginBottom: 2,
  },
  infoValue: {
    color: OrbitColors.softWhite,
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  infoSub: {
    color: OrbitColors.premiumGray,
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    marginTop: 2,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
    paddingHorizontal: 24,
  },
  footerText: {
    color: "#4B5563",
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    flex: 1,
  },
});
