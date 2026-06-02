import { LinearGradient } from "expo-linear-gradient";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { WebView } from "react-native-webview";

import {
  Activity,
  AlertOctagon,
  CloudLightning,
  Droplets,
  Flame,
  Layers,
  MountainSnow,
  Radio,
  Snowflake,
  Sun,
  Waves,
  Wind,
} from "lucide-react-native";
import { AnimatedHeader } from "../../components/AnimatedHeader";
import { OrbitColors } from "../../constants/Colors";

const NASA_KEY = process.env.EXPO_PUBLIC_NASA_API_KEY ?? "DEMO_KEY";
const EONET_URL = `https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=30&limit=80`;

const CATEGORY_SVG: Record<string, string> = {
  wildfires: `<path d="M12 2c0 6-6 8-6 13a6 6 0 0 0 12 0c0-5-6-7-6-13z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  severeStorms: `<polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`,
  volcanoes: `<path d="M8 3L3 21h18L16 3" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/><path d="M10 12l-2 9" stroke="currentColor" stroke-width="2" fill="none"/><path d="M14 12l2 9" stroke="currentColor" stroke-width="2" fill="none"/>`,
  floods: `<path d="M3 12h18M3 17c2-2 4 2 6 0s4-2 6 0 4 2 6 0M3 7c2-2 4 2 6 0s4-2 6 0 4 2 6 0" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  earthquakes: `<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  drought: `<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  dustHaze: `<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2M9.6 4.6A2 2 0 1 1 11 8H2M12.6 19.4A2 2 0 1 0 14 16H2" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  landslides: `<path d="M3 17l4-8 4 4 4-6 4 10H3z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/><path d="M3 21h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  seaLakeIce: `<path d="M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  manmade: `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2" fill="none"/><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  waterColor: `<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10c0-3-1.5-5.5-3-7.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>`,
};

const CATEGORY_LUCIDE: Record<string, (color: string) => React.ReactNode> = {
  wildfires: (c) => <Flame size={15} color={c} />,
  severeStorms: (c) => <CloudLightning size={15} color={c} />,
  volcanoes: (c) => <MountainSnow size={15} color={c} />,
  floods: (c) => <Waves size={15} color={c} />,
  earthquakes: (c) => <Activity size={15} color={c} />,
  drought: (c) => <Sun size={15} color={c} />,
  dustHaze: (c) => <Wind size={15} color={c} />,
  landslides: (c) => <Layers size={15} color={c} />,
  seaLakeIce: (c) => <Snowflake size={15} color={c} />,
  manmade: (c) => <AlertOctagon size={15} color={c} />,
  waterColor: (c) => <Droplets size={15} color={c} />,
};

const CATEGORY_CONFIG: Record<
  string,
  { color: string; label: string; risk: string }
> = {
  wildfires: { color: "#FF4500", label: "Incêndio", risk: "ALTO" },
  severeStorms: { color: "#7B61FF", label: "Tempestade", risk: "MEDIO" },
  volcanoes: { color: "#FF6B35", label: "Vulcão", risk: "ALTO" },
  floods: { color: "#00B4D8", label: "Inundação", risk: "MEDIO" },
  earthquakes: { color: "#FFB703", label: "Terremoto", risk: "ALTO" },
  drought: { color: "#E9C46A", label: "Seca", risk: "BAIXO" },
  dustHaze: { color: "#ADB5BD", label: "Poeira", risk: "BAIXO" },
  landslides: { color: "#8B5E3C", label: "Deslizamento", risk: "MEDIO" },
  seaLakeIce: { color: "#90E0EF", label: "Gelo", risk: "BAIXO" },
  manmade: { color: "#E63946", label: "Antrópico", risk: "ALTO" },
  waterColor: { color: "#48CAE4", label: "Água", risk: "BAIXO" },
};

type EONETGeometry = {
  date: string;
  type: "Point" | "Polygon";
  coordinates: number[] | number[][][];
};

type EONETEvent = {
  id: string;
  title: string;
  categories: { id: string; title: string }[];
  geometry: EONETGeometry[];
  sources: { id: string; url: string }[];
};

type FilterState = {
  wildfires: boolean;
  severeStorms: boolean;
  volcanoes: boolean;
  floods: boolean;
  earthquakes: boolean;
};

const LEAFLET_SHELL = [
  "<!DOCTYPE html>",
  "<html>",
  "<head>",
  '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">',
  '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"/>',
  '<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"><\/script>',
  "<style>",
  "  * { margin: 0; padding: 0; box-sizing: border-box; }",
  "  html, body, #map { width: 100%; height: 100%; background: #060D1F; }",
  "  .leaflet-tile-pane { filter: invert(1) hue-rotate(180deg) brightness(0.85) saturate(1.2); }",
  "  .leaflet-container { background: #060D1F !important; }",
  "  .orbit-marker {",
  "    width: 28px; height: 28px; border-radius: 50%;",
  "    border: 2px solid rgba(255,255,255,0.35);",
  "    display: flex; align-items: center; justify-content: center;",
  "    box-shadow: 0 0 12px currentColor, 0 0 24px currentColor;",
  "    animation: pulse 2s infinite; cursor: pointer;",
  "  }",
  "  @keyframes pulse {",
  "    0%, 100% { transform: scale(1); opacity: 1; }",
  "    50%       { transform: scale(1.18); opacity: 0.75; }",
  "  }",
  "  .leaflet-popup-content-wrapper {",
  "    background: rgba(8,14,36,0.96) !important;",
  "    border: 1px solid rgba(255,255,255,0.12) !important;",
  "    border-radius: 14px !important; color: #E2E8F0 !important;",
  "    font-family: -apple-system, sans-serif;",
  "    box-shadow: 0 8px 32px rgba(0,0,0,0.6) !important;",
  "  }",
  "  .leaflet-popup-tip { background: rgba(8,14,36,0.96) !important; }",
  "  .leaflet-popup-close-button { color: #94A3B8 !important; font-size: 18px !important; top: 8px !important; right: 10px !important; }",
  "  .popup-title { font-size: 13px; font-weight: 700; color: #F1F5F9; margin-bottom: 6px; line-height: 1.4; }",
  "  .popup-cat { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 5px; }",
  "  .popup-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; display: inline-block; }",
  "  .popup-row { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #94A3B8; margin-bottom: 3px; }",
  "  .popup-row span { color: #CBD5E1; }",
  "  .popup-lbl { color: #4B5563 !important; font-size: 10px !important; text-transform: uppercase; letter-spacing: .05em; }",
  "  .popup-link { color: #60A5FA; text-decoration: none; }",
  "  .popup-risk { margin-top: 8px; padding: 4px 10px; border-radius: 999px; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; display: inline-block; }",
  "  .risk-ALTO  { background: rgba(239,68,68,0.2);  color: #F87171; border: 1px solid rgba(239,68,68,0.4); }",
  "  .risk-MEDIO { background: rgba(234,179,8,0.2);  color: #FCD34D; border: 1px solid rgba(234,179,8,0.4); }",
  "  .risk-BAIXO { background: rgba(34,197,94,0.2);  color: #86EFAC; border: 1px solid rgba(34,197,94,0.4); }",
  "  .leaflet-control-zoom a { background: rgba(8,14,36,0.9) !important; color: #94A3B8 !important; border-color: rgba(255,255,255,0.12) !important; }",
  "  .leaflet-control-zoom a:hover { color: #fff !important; }",
  "  .leaflet-control-attribution { display: none !important; }",
  "</style>",
  "</head>",
  "<body>",
  '<div id="map"></div>',
  "<script>",
  'document.addEventListener("DOMContentLoaded", function() {',
  "  var EVENTS     = window.ORBIT_DATA.events;",
  "  var CATEGORIES = window.ORBIT_DATA.categories;",
  "  var SVG_ICONS  = window.ORBIT_DATA.svgIcons;",
  "",
  '  var map = L.map("map", { center: [20, 0], zoom: 2, zoomControl: true, attributionControl: false });',
  '  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18 }).addTo(map);',
  "",
  "  var markerGroups = {};",
  "  var allMarkers = [];",
  "",
  "  EVENTS.forEach(function(event) {",
  "    if (!event.geometry || event.geometry.length === 0) return;",
  "    var geo = event.geometry[event.geometry.length - 1];",
  '    if (geo.type !== "Point") return;',
  "    var lng = geo.coordinates[0], lat = geo.coordinates[1];",
  '    var cat = (event.categories[0] && event.categories[0].id) || "unknown";',
  '    var cfg = CATEGORIES[cat] || { color: "#94A3B8", label: cat, risk: "BAIXO" };',
  '    var svgPath = SVG_ICONS[cat] || "<circle cx=\\"12\\" cy=\\"12\\" r=\\"5\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" fill=\\"none\\"/>";',
  '    var date = new Date(geo.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });',
  '    var riskClass = cfg.risk === "ALTO" ? "risk-ALTO" : cfg.risk === "MEDIO" ? "risk-MEDIO" : "risk-BAIXO";',
  "",
  "    var markerHtml = [",
  '      "<div class=\\"orbit-marker\\" style=\\"background:" + cfg.color + "22;",',
  '      "border-color:" + cfg.color + ";color:" + cfg.color + "\\">",',
  '      "<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"14\\" height=\\"14\\" viewBox=\\"0 0 24 24\\">",',
  "      svgPath,",
  '      "</svg></div>"',
  '    ].join("");',
  "",
  '    var icon = L.divIcon({ className: "", html: markerHtml, iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -18] });',
  "",
  "    var source = event.sources && event.sources[0] && event.sources[0].url;",
  "    var sourceRow = source",
  '      ? "<div class=\\"popup-row\\"><span class=\\"popup-lbl\\">Fonte</span>&nbsp;<span><a class=\\"popup-link\\" href=\\"" + source + "\\" target=\\"_blank\\">Ver fonte</a></span></div>"',
  '      : "";',
  "",
  "    var popupHtml = [",
  '      "<div style=\\"min-width:200px;padding:2px 4px\\">",',
  '      "<div class=\\"popup-cat\\" style=\\"color:" + cfg.color + "\\">",',
  '      "<span class=\\"popup-dot\\" style=\\"background:" + cfg.color + "\\"></span>",',
  "      cfg.label.toUpperCase(),",
  '      "</div>",',
  '      "<div class=\\"popup-title\\">" + event.title + "</div>",',
  '      "<div class=\\"popup-row\\"><span class=\\"popup-lbl\\">Data</span>&nbsp;<span>" + date + "</span></div>",',
  '      "<div class=\\"popup-row\\"><span class=\\"popup-lbl\\">ID</span>&nbsp;<span>" + event.id + "</span></div>",',
  "      sourceRow,",
  '      "<div><span class=\\"popup-risk " + riskClass + "\\">" + cfg.risk + " RISCO</span></div>",',
  '      "</div>"',
  '    ].join("");',
  "",
  "    var marker = L.marker([lat, lng], { icon: icon });",
  "    marker.bindPopup(popupHtml, { maxWidth: 260 });",
  "    if (!markerGroups[cat]) markerGroups[cat] = [];",
  "    markerGroups[cat].push(marker);",
  "    allMarkers.push({ marker: marker, cat: cat });",
  "    marker.addTo(map);",
  "  });",
  "",
  "  window.filterCategory = function(cat, visible) {",
  "    allMarkers.forEach(function(m) {",
  "      if (m.cat === cat) { if (visible) { m.marker.addTo(map); } else { map.removeLayer(m.marker); } }",
  "    });",
  "  };",
  "  window.focusCategory = function(cat) {",
  "    var ms = markerGroups[cat] || [];",
  "    if (!ms.length) return;",
  "    map.fitBounds(L.featureGroup(ms).getBounds().pad(0.3), { maxZoom: 5 });",
  "  };",
  "  window.resetView = function() { map.setView([20, 0], 2); };",
  "",
  "  var counts = {};",
  "  allMarkers.forEach(function(m) { counts[m.cat] = (counts[m.cat] || 0) + 1; });",
  '  window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: "COUNTS", counts: counts }));',
  "});",
  "<\/script>",
  "</body>",
  "</html>",
].join("\n");

function buildLeafletHTML(
  events: EONETEvent[],
  svgMap: Record<string, string>,
): string {
  const dataScript = [
    "<script>",
    "window.ORBIT_DATA = {",
    "  events: " +
      JSON.stringify(events).replace(/<\/script>/gi, "<\\/script>") +
      ",",
    "  categories: " + JSON.stringify(CATEGORY_CONFIG) + ",",
    "  svgIcons: " +
      JSON.stringify(svgMap).replace(/<\/script>/gi, "<\\/script>"),
    "};",
    "<\/script>",
  ].join("\n");

  return LEAFLET_SHELL.replace("</body>", dataScript + "\n</body>");
}

const FilterChip = React.memo(function FilterChip({
  catId,
  count,
  active,
  onPress,
}: {
  catId: string;
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  const cfg = CATEGORY_CONFIG[catId];
  if (!cfg) return null;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active && { borderColor: cfg.color, backgroundColor: `${cfg.color}18` },
        !active && { opacity: 0.45 },
      ]}
    >
      <View style={styles.chipIcon}>
        {CATEGORY_LUCIDE[catId]?.(active ? cfg.color : "#64748B")}
      </View>
      <View>
        <Text style={[styles.chipLabel, active && { color: cfg.color }]}>
          {cfg.label}
        </Text>
        <Text style={styles.chipCount}>{count} eventos</Text>
      </View>
    </Pressable>
  );
});

export default function MapScreen() {
  const webRef = useRef<WebView>(null);
  const [events, setEvents] = useState<EONETEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>(
    Object.fromEntries(Object.keys(CATEGORY_CONFIG).map((k) => [k, true])),
  );
  const [lastUpdated, setLastUpdated] = useState("");

  const livePulse = useSharedValue(1);
  useEffect(() => {
    livePulse.value = withRepeat(withTiming(0.3, { duration: 900 }), -1, true);
  }, []);
  const liveStyle = useAnimatedStyle(() => ({ opacity: livePulse.value }));

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(EONET_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        setEvents(data.events ?? []);
        setLastUpdated(
          new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        );
      } catch (e: any) {
        if (mounted)
          setError("Falha ao conectar com a NASA EONET. Verifique a conexão.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const mapHTML = useMemo(
    () => buildLeafletHTML(events, CATEGORY_SVG),
    [events],
  );

  const onWebViewMessage = useCallback((e: any) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === "COUNTS") setCounts(msg.counts);
    } catch {}
  }, []);

  const toggleFilter = useCallback((catId: string) => {
    setActiveFilters((prev) => {
      const next = { ...prev, [catId]: !prev[catId] };
      webRef.current?.injectJavaScript(
        `window.filterCategory('${catId}', ${!prev[catId]}); true;`,
      );
      return next;
    });
  }, []);

  const totalActive = useMemo(
    () =>
      Object.entries(counts)
        .filter(([k]) => activeFilters[k])
        .reduce((s, [, v]) => s + v, 0),
    [counts, activeFilters],
  );

  const highRiskCount = useMemo(
    () =>
      Object.entries(counts)
        .filter(([k]) => CATEGORY_CONFIG[k]?.risk === "ALTO")
        .reduce((s, [, v]) => s + v, 0),
    [counts],
  );

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[
          OrbitColors.deepBlack,
          "rgba(59,130,246,0.06)",
          OrbitColors.deepBlack,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <AnimatedHeader
        title="Orbit Map"
        subtitle="Eventos naturais NASA EONET • infraestrutura em risco"
      />

      <Animated.View
        entering={FadeInDown.duration(350)}
        style={styles.statusBar}
      >
        <View style={styles.statusLeft}>
          <Animated.View style={[styles.liveDot, liveStyle]} />
          <Text style={styles.liveText}>AO VIVO</Text>
          {lastUpdated ? (
            <Text style={styles.updatedText}>· {lastUpdated}</Text>
          ) : null}
        </View>
        <View style={styles.statusRight}>
          <View style={styles.statBadge}>
            <Text style={styles.statNum}>{totalActive}</Text>
            <Text style={styles.statLabel}>eventos</Text>
          </View>
          <View
            style={[
              styles.statBadge,
              highRiskCount > 0 && styles.statBadgeDanger,
            ]}
          >
            <Text
              style={[
                styles.statNum,
                highRiskCount > 0 && { color: "#F87171" },
              ]}
            >
              {highRiskCount}
            </Text>
            <Text style={styles.statLabel}>alto risco</Text>
          </View>
        </View>
      </Animated.View>

      <View style={styles.mapContainer}>
        {loading && (
          <View style={styles.overlay}>
            <ActivityIndicator color={OrbitColors.spaceBlue} size="large" />
            <Text style={styles.overlayText}>Conectando à NASA…</Text>
            <Text style={styles.overlaySubtext}>
              Carregando eventos em tempo real
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.overlay}>
            <View style={styles.errorIconWrap}>
              <Radio size={28} color={OrbitColors.premiumGray} />
            </View>
            <Text style={styles.overlayText}>{error}</Text>
          </View>
        )}

        {!loading && !error && (
          <Animated.View
            entering={FadeInDown.duration(500)}
            style={StyleSheet.absoluteFill}
          >
            <WebView
              ref={webRef}
              source={{ html: mapHTML }}
              style={styles.webview}
              onMessage={onWebViewMessage}
              javaScriptEnabled
              domStorageEnabled
              mixedContentMode="always"
              originWhitelist={["*"]}
              startInLoadingState={false}
              scrollEnabled={false}
            />
          </Animated.View>
        )}
      </View>

      {!loading && !error && (
        <Animated.View
          entering={FadeInRight.duration(400).delay(200)}
          style={styles.filtersWrap}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {Object.keys(CATEGORY_CONFIG).map((catId) => (
              <FilterChip
                key={catId}
                catId={catId}
                count={counts[catId] ?? 0}
                active={activeFilters[catId]}
                onPress={() => toggleFilter(catId)}
              />
            ))}
          </ScrollView>
        </Animated.View>
      )}

      <View style={{ height: 128 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: OrbitColors.deepBlack },

  statusBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statusLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#22C55E",
  },
  liveText: {
    color: "#22C55E",
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 0.08,
  },
  updatedText: {
    color: "#64748B",
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  statusRight: { flexDirection: "row", gap: 8 },
  statBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.10)",
  },
  statBadgeDanger: {
    backgroundColor: "rgba(239,68,68,0.10)",
    borderColor: "rgba(239,68,68,0.25)",
  },
  statNum: { color: "#F1F5F9", fontFamily: "Inter_700Bold", fontSize: 14 },
  statLabel: { color: "#64748B", fontFamily: "Inter_400Regular", fontSize: 10 },

  mapContainer: {
    flex: 1,
    marginHorizontal: 12,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
  },
  webview: { flex: 1, backgroundColor: "#060D1F" },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#060D1F",
    gap: 12,
    zIndex: 10,
  },
  overlayText: {
    color: "#E2E8F0",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  overlaySubtext: {
    color: "#64748B",
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  errorIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.10)",
  },

  filtersWrap: { paddingTop: 10 },
  filtersScroll: { paddingHorizontal: 12, gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.10)",
    minWidth: 110,
  },
  chipIcon: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  chipLabel: {
    color: "#CBD5E1",
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  chipCount: {
    color: "#64748B",
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    marginTop: 1,
  },
});
