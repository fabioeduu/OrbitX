<<<<<<< HEAD
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Activity, AlertTriangle, Clock3, Globe, MapPin, Radio, RefreshCw, Satellite, Signal, Sun, Footprints } from 'lucide-react-native';

import { AnimatedHeader } from '../../components/AnimatedHeader';
import { PremiumCard }    from '../../components/PremiumCard';
import { useColors }      from '../../constants/Colors';
import { useThemeStore }  from '../../store/theme';

type ISSData = { latitude: number; longitude: number; altitude: number; velocity: number; visibility: string; footprint: number; solar_lat: number; timestamp: number };

const ISS_API    = 'https://api.wheretheiss.at/v1/satellites/25544';
const GLOBE_SIZE = 280;
const GLOBE_R    = GLOBE_SIZE / 2;
const BRAZIL_LAT = -14.235;
const BRAZIL_LNG = -51.925;

function projectToGlobe(lat: number, lng: number, r: number) {
  const latR = (lat * Math.PI) / 180;
  const lngR = (lng * Math.PI) / 180;
  return { x: r * Math.cos(latR) * Math.sin(lngR), y: -r * Math.sin(latR), visible: r * Math.cos(latR) * Math.cos(lngR) >= 0 };
}
function formatCoord(value: number, pos: string, neg: string) { return `${Math.abs(value).toFixed(4)}° ${value >= 0 ? pos : neg}`; }
function toKms(kmh: number) { return (kmh / 3600).toFixed(3); }
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371, dLat = ((lat2 - lat1) * Math.PI) / 180, dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos((lat1*Math.PI)/180)*Math.cos((lat2*Math.PI)/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

const LiveBadge = React.memo(function LiveBadge() {
  const colors = useColors();
  const pulse  = useSharedValue(1);
  useEffect(() => { pulse.value = withRepeat(withTiming(0.25, { duration: 750 }), -1, true); }, []); // eslint-disable-line
  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <Animated.View style={[{ width: 8, height: 8, borderRadius: 999, backgroundColor: colors.neonGreen }, dotStyle]} />
      <Text style={{ color: colors.neonGreen, fontSize: 11, fontFamily: 'Inter_700Bold' }}>AO VIVO</Text>
    </View>
  );
});

const InfoRow = React.memo(function InfoRow({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  const colors = useColors();
  const mode   = useThemeStore((s) => s.mode);
  const iconBg     = mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const iconBorder = mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
      <View style={{ width: 36, height: 36, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginRight: 12, 
        backgroundColor: iconBg, borderWidth: StyleSheet.hairlineWidth, borderColor: iconBorder }}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.premiumGray, fontFamily: 'Inter_400Regular', fontSize: 11, marginBottom: 2 }}>{label}</Text>
        <Text style={{ color: colors.softWhite, fontFamily: 'Inter_700Bold', fontSize: 15 }}>{value}</Text>
        {sub ? <Text style={{ color: colors.premiumGray, fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 2 }}>{sub}</Text> : null}
      </View>
    </View>
  );
});

const GlobeView = React.memo(function GlobeView({ data }: { data: ISSData }) {
  const colors = useColors();
  const spin   = useSharedValue(0);
  useEffect(() => { spin.value = withRepeat(withTiming(1, { duration: 90_000, easing: Easing.linear }), -1, false); }, []); // eslint-disable-line
  const globeStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));

  const iss    = projectToGlobe(data.latitude, data.longitude, GLOBE_R * 0.85);
  const brazil = projectToGlobe(BRAZIL_LAT, BRAZIL_LNG, GLOBE_R * 0.85);
  const distKm  = haversineKm(data.latitude, data.longitude, BRAZIL_LAT, BRAZIL_LNG);
  const isNear  = distKm < data.footprint / 2;
  const lineLen   = Math.sqrt((iss.x - brazil.x)**2 + (iss.y - brazil.y)**2);
  const lineAngle = Math.atan2(iss.y - brazil.y, iss.x - brazil.x);
  const issColor  = data.visibility === 'daylight' ? '#F59E0B' : colors.spaceBlue;

  return (
    <View style={{ width: GLOBE_SIZE, height: GLOBE_SIZE, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ position: 'absolute', width: GLOBE_SIZE+50, height: GLOBE_SIZE+50, borderRadius: 999, backgroundColor: 'rgba(59,130,246,0.10)' }} />
      <View style={{ position: 'absolute', width: GLOBE_SIZE+80, height: GLOBE_SIZE+80, borderRadius: 999, backgroundColor: 'rgba(34,197,94,0.05)' }} />
      <Animated.View style={[{ width: GLOBE_SIZE, height: GLOBE_SIZE, borderRadius: GLOBE_R, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: '#000' }, globeStyle]}>
        <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Solarsystemscope_texture_8k_earth_daymap.jpg' }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
        <View style={StyleSheet.absoluteFillObject} />
      </Animated.View>

      {iss.visible && brazil.visible && (
        <View style={{ position: 'absolute', left: GLOBE_R + brazil.x, top: GLOBE_R + brazil.y, width: lineLen, height: 1, backgroundColor: isNear ? 'rgba(34,197,94,0.55)' : 'rgba(255,255,255,0.14)', transform: [{ rotate: `${lineAngle}rad` }], transformOrigin: '0 50%' } as any} />
      )}
      {brazil.visible && (
        <>
          <View style={{ position: 'absolute', width: 10, height: 10, borderRadius: 999, backgroundColor: colors.neonGreen, borderWidth: 2, borderColor: '#FFF', left: GLOBE_R + brazil.x - 5, top: GLOBE_R + brazil.y - 5 }} />
          <View style={{ position: 'absolute', backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, left: GLOBE_R + brazil.x + 10, top: GLOBE_R + brazil.y - 10 }}>
            <Text style={{ color: colors.neonGreen, fontSize: 10, fontFamily: 'Inter_600SemiBold' }}>Brasil</Text>
          </View>
        </>
      )}
      <View style={{ position: 'absolute', width: 32, height: 32, justifyContent: 'center', alignItems: 'center', left: GLOBE_R + iss.x - 16, top: GLOBE_R + iss.y - 16, opacity: iss.visible ? 1 : 0.25 }}>
        <View style={{ position: 'absolute', width: 32, height: 32, borderRadius: 999, backgroundColor: `${issColor}30` }} />
        <View style={{ width: 20, height: 20, borderRadius: 999, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF', backgroundColor: issColor }}>
          <Satellite size={10} color="#FFF" />
        </View>
      </View>
      <View style={{ position: 'absolute', backgroundColor: 'rgba(2,6,23,0.88)', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 7, left: GLOBE_R + iss.x + 18, top: GLOBE_R + iss.y - 10 }}>
        <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: issColor }}>ISS</Text>
      </View>
    </View>
  );
});

const BrazilStatus = React.memo(function BrazilStatus({ data }: { data: ISSData }) {
  const colors  = useColors();
  const dist    = haversineKm(data.latitude, data.longitude, BRAZIL_LAT, BRAZIL_LNG);
  const inRange = dist < data.footprint / 2;
  const color   = inRange ? colors.neonGreen : colors.premiumGray;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 18, paddingHorizontal: 16, 
    paddingVertical: 9, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, 
    backgroundColor: inRange ? 'rgba(34,197,94,0.12)' : colors.glassFill, 
    borderColor: inRange ? 'rgba(34,197,94,0.30)' : colors.glassBorder }}>

      <MapPin size={12} color={color} />
      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color }}>
        {inRange ? `ISS visível do Brasil • ${Math.round(dist).toLocaleString('pt-BR')} km` : `ISS a ${Math.round(dist).toLocaleString('pt-BR')} km do Brasil`}
      </Text>
    </View>
  );
});

export default function SatelliteScreen() {
  const colors = useColors();
  const mode   = useThemeStore((s) => s.mode);
  const [data,       setData]       = useState<ISSData | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [updateTime, setUpdateTime] = useState('');
  const mountedRef = useRef(true);

  const fetchISS = useCallback(async () => {
    try {
      setError(null);
      const res  = await fetch(ISS_API);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!mountedRef.current) return;

      setData({ latitude: json.latitude, longitude: json.longitude, altitude: json.altitude, 
        velocity: json.velocity, visibility: json.visibility, 
        footprint: json.footprint, solar_lat: json.solar_lat, timestamp: json.timestamp });

      setUpdateTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch {
      if (mountedRef.current) setError('Não foi possível conectar à ISS.');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => { mountedRef.current = true; fetchISS();
     const id = setInterval(fetchISS, 5000); return () => { mountedRef.current = false; clearInterval(id); }; }, [fetchISS]);

  const visibilityLabel = useMemo(() => { if (!data) return ''; 
    return data.visibility === 'daylight' ? 'Luz do dia' : 'Zona de eclipse'; }, [data]);

  const bgColors: [string, string, string, string] = mode === 'dark'
    ? ['#020617', '#04142B', '#071F3B', '#020617']
    : [colors.deepBlack, 'rgba(59,130,246,0.04)', 'rgba(34,197,94,0.03)', colors.deepBlack];

  const refreshBg     = mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const refreshBorder = mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)';
  const dividerColor  = mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const cardIconBg    = mode === 'dark' ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)';

  return (
    <View style={[styles.root, { backgroundColor: colors.deepBlack }]}>
      <LinearGradient colors={bgColors} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: 20 }}>
          <AnimatedHeader title="OrbitX Brasil" subtitle="ISS em tempo real • atualiza a cada 5s" />
          <Pressable style={[styles.refreshBtn, { backgroundColor: refreshBg, borderColor: refreshBorder }]} onPress={fetchISS} hitSlop={10}>
            <RefreshCw size={15} color={colors.softWhite} />
          </Pressable>
        </View>

        {loading && (
          <View style={styles.stateBox}>
            <Signal size={22} color={colors.neonGreen} />
            <Text style={{ color: colors.premiumGray, fontFamily: 'Inter_400Regular', 
              fontSize: 14, textAlign: 'center' }}>Conectando à ISS...</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.stateBox}>
            <AlertTriangle size={22} color={colors.danger} />
            <Text style={{ color: colors.danger, fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center' }}>{error}</Text>
            <Pressable style={[styles.retryBtn, { backgroundColor: `${colors.danger}18`, borderColor: `${colors.danger}35` }]} onPress={fetchISS}>
              <Text style={{ color: colors.danger, fontFamily: 'Inter_600SemiBold', fontSize: 12 }}>Tentar novamente</Text>
            </Pressable>
          </View>
        )}

        {data && (
          <Animated.View entering={FadeInDown.duration(500)} style={{ alignItems: 'center', marginTop: 10 }}>
            <GlobeView data={data} />
            <BrazilStatus data={data} />
          </Animated.View>
        )}

        {data && (
          <Animated.View entering={FadeInDown.duration(600)} style={{ paddingHorizontal: 20, marginTop: 18 }}>
            <PremiumCard>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, borderRadius: 14, justifyContent: 'center', 
                  alignItems: 'center', marginRight: 12, backgroundColor: cardIconBg, borderWidth: StyleSheet.hairlineWidth, 
                  borderColor: `${colors.spaceBlue}30` }}>
                  <Satellite size={16} color={colors.spaceBlue} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.softWhite, fontSize: 16, fontFamily: 'Inter_700Bold' }}>ISS — NASA</Text>
                  <Text style={{ color: colors.premiumGray, fontSize: 12, marginTop: 2 }}>Estação Espacial Internacional</Text>
                </View>
                <LiveBadge />
              </View>
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: dividerColor, marginVertical: 16 }} />
              <InfoRow icon={<MapPin    size={14} color={colors.neonGreen}  />} label="Latitude"            value={formatCoord(data.latitude,  'N', 'S')} />
              <InfoRow icon={<MapPin    size={14} color={colors.neonGreen}  />} label="Longitude"           value={formatCoord(data.longitude, 'L', 'O')} />
              <InfoRow icon={<Globe     size={14} color={colors.spaceBlue} />} label="Altitude"            value={`${data.altitude.toFixed(1)} km`} sub={`Órbita baixa — ${Math.round(data.altitude)} km acima do nível do mar`} />
              <InfoRow icon={<Activity  size={14} color="#F59E0B"           />} label="Velocidade"          value={`${toKms(data.velocity)} km/s`} sub={`${Math.round(data.velocity).toLocaleString('pt-BR')} km/h`} />
              <InfoRow icon={<Radio     size={14} color="#A855F7"           />} label="Visibilidade"        value={visibilityLabel} sub={data.visibility === 'daylight' ? 'Sol iluminando a estação' : 'ISS na sombra da Terra'} />
              <InfoRow icon={<Footprints size={14} color={colors.premiumGray}/>} label="Cobertura (footprint)" value={`${Math.round(data.footprint).toLocaleString('pt-BR')} km`} sub="Diâmetro da área onde a ISS é visível a olho nu" />
              <InfoRow icon={<Sun       size={14} color="#F59E0B"           />} label="Latitude solar"      value={formatCoord(data.solar_lat, 'N', 'S')} sub="Posição do sol em relação ao equador terrestre" />
              <InfoRow icon={<Clock3    size={14} color={colors.premiumGray}/>} label="Última atualização" value={updateTime} sub={`Timestamp Unix: ${data.timestamp}`} />
            </PremiumCard>
          </Animated.View>
        )}

        {data && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20, paddingHorizontal: 24 }}>
            <Globe size={11} color={colors.premiumGray} />
            <Text style={{ color: colors.premiumGray, fontFamily: 'Inter_400Regular', 
              fontSize: 11, flex: 1 }}>Fonte: wheretheiss.at — Atualização automática a cada 5s</Text>
          </View>
        )}
        <View style={{ height: 130 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1 },
  content:    { paddingTop: 40 },
  refreshBtn: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 20,
     borderWidth: StyleSheet.hairlineWidth },
  stateBox:   { alignItems: 'center', justifyContent: 'center', padding: 40, gap: 10 },
  retryBtn:   { marginTop: 4, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth },
});
=======
import { LinearGradient } from 'expo-linear-gradient';import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';import { Activity, AlertTriangle, Clock3, Globe, MapPin, Radio, RefreshCw, Satellite, Signal, Sun, Footprints } from 'lucide-react-native';import { AnimatedHeader } from '../../components/AnimatedHeader';import { PremiumCard }    from '../../components/PremiumCard';import { useColors }      from '../../constants/Colors';import { useThemeStore }  from '../../store/theme';type ISSData = { latitude: number; longitude: number; altitude: number; velocity: number; visibility: string; footprint: number; solar_lat: number; timestamp: number };const ISS_API    = 'https://api.wheretheiss.at/v1/satellites/25544';const GLOBE_SIZE = 280;const GLOBE_R    = GLOBE_SIZE / 2;const BRAZIL_LAT = -14.235;const BRAZIL_LNG = -51.925;function projectToGlobe(lat: number, lng: number, r: number) {  const latR = (lat * Math.PI) / 180;  const lngR = (lng * Math.PI) / 180;  return { x: r * Math.cos(latR) * Math.sin(lngR), y: -r * Math.sin(latR), visible: r * Math.cos(latR) * Math.cos(lngR) >= 0 };}function formatCoord(value: number, pos: string, neg: string) { return `${Math.abs(value).toFixed(4)}° ${value >= 0 ? pos : neg}`; }function toKms(kmh: number) { return (kmh / 3600).toFixed(3); }function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {  const R = 6371, dLat = ((lat2 - lat1) * Math.PI) / 180, dLng = ((lng2 - lng1) * Math.PI) / 180;  const a = Math.sin(dLat/2)**2 + Math.cos((lat1*Math.PI)/180)*Math.cos((lat2*Math.PI)/180)*Math.sin(dLng/2)**2;  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));}const LiveBadge = React.memo(function LiveBadge() {  const colors = useColors();  const pulse  = useSharedValue(1);  useEffect(() => { pulse.value = withRepeat(withTiming(0.25, { duration: 750 }), -1, true); }, []); 
  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));  return (    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>      <Animated.View style={[{ width: 8, height: 8, borderRadius: 999, backgroundColor: colors.neonGreen }, dotStyle]} />      <Text style={{ color: colors.neonGreen, fontSize: 11, fontFamily: 'Inter_700Bold' }}>AO VIVO</Text>    </View>  );});const InfoRow = React.memo(function InfoRow({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {  const colors = useColors();  const mode   = useThemeStore((s) => s.mode);  const iconBg     = mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';  const iconBorder = mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';  return (    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>      <View style={{ width: 36, height: 36, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginRight: 12, backgroundColor: iconBg, borderWidth: StyleSheet.hairlineWidth, borderColor: iconBorder }}>{icon}</View>      <View style={{ flex: 1 }}>        <Text style={{ color: colors.premiumGray, fontFamily: 'Inter_400Regular', fontSize: 11, marginBottom: 2 }}>{label}</Text>        <Text style={{ color: colors.softWhite, fontFamily: 'Inter_700Bold', fontSize: 15 }}>{value}</Text>        {sub ? <Text style={{ color: colors.premiumGray, fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 2 }}>{sub}</Text> : null}      </View>    </View>  );});const GlobeView = React.memo(function GlobeView({ data }: { data: ISSData }) {  const colors = useColors();  const spin   = useSharedValue(0);  useEffect(() => { spin.value = withRepeat(withTiming(1, { duration: 90_000, easing: Easing.linear }), -1, false); }, []); 
  const globeStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));  const iss    = projectToGlobe(data.latitude, data.longitude, GLOBE_R * 0.85);  const brazil = projectToGlobe(BRAZIL_LAT, BRAZIL_LNG, GLOBE_R * 0.85);  const distKm  = haversineKm(data.latitude, data.longitude, BRAZIL_LAT, BRAZIL_LNG);  const isNear  = distKm < data.footprint / 2;  const lineLen   = Math.sqrt((iss.x - brazil.x)**2 + (iss.y - brazil.y)**2);  const lineAngle = Math.atan2(iss.y - brazil.y, iss.x - brazil.x);  const issColor  = data.visibility === 'daylight' ? '#F59E0B' : colors.spaceBlue;  return (    <View style={{ width: GLOBE_SIZE, height: GLOBE_SIZE, justifyContent: 'center', alignItems: 'center' }}>      <View style={{ position: 'absolute', width: GLOBE_SIZE+50, height: GLOBE_SIZE+50, borderRadius: 999, backgroundColor: 'rgba(59,130,246,0.10)' }} />      <View style={{ position: 'absolute', width: GLOBE_SIZE+80, height: GLOBE_SIZE+80, borderRadius: 999, backgroundColor: 'rgba(34,197,94,0.05)' }} />      <Animated.View style={[{ width: GLOBE_SIZE, height: GLOBE_SIZE, borderRadius: GLOBE_R, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: '#000' }, globeStyle]}>        <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Solarsystemscope_texture_8k_earth_daymap.jpg' }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />        <View style={StyleSheet.absoluteFillObject} />      </Animated.View>      {iss.visible && brazil.visible && (        <View style={{ position: 'absolute', left: GLOBE_R + brazil.x, top: GLOBE_R + brazil.y, width: lineLen, height: 1, backgroundColor: isNear ? 'rgba(34,197,94,0.55)' : 'rgba(255,255,255,0.14)', transform: [{ rotate: `${lineAngle}rad` }], transformOrigin: '0 50%' } as any} />      )}      {brazil.visible && (        <>          <View style={{ position: 'absolute', width: 10, height: 10, borderRadius: 999, backgroundColor: colors.neonGreen, borderWidth: 2, borderColor: '#FFF', left: GLOBE_R + brazil.x - 5, top: GLOBE_R + brazil.y - 5 }} />          <View style={{ position: 'absolute', backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, left: GLOBE_R + brazil.x + 10, top: GLOBE_R + brazil.y - 10 }}>            <Text style={{ color: colors.neonGreen, fontSize: 10, fontFamily: 'Inter_600SemiBold' }}>Brasil</Text>          </View>        </>      )}      <View style={{ position: 'absolute', width: 32, height: 32, justifyContent: 'center', alignItems: 'center', left: GLOBE_R + iss.x - 16, top: GLOBE_R + iss.y - 16, opacity: iss.visible ? 1 : 0.25 }}>        <View style={{ position: 'absolute', width: 32, height: 32, borderRadius: 999, backgroundColor: `${issColor}30` }} />        <View style={{ width: 20, height: 20, borderRadius: 999, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF', backgroundColor: issColor }}>          <Satellite size={10} color="#FFF" />        </View>      </View>      <View style={{ position: 'absolute', backgroundColor: 'rgba(2,6,23,0.88)', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 7, left: GLOBE_R + iss.x + 18, top: GLOBE_R + iss.y - 10 }}>        <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: issColor }}>ISS</Text>      </View>    </View>  );});const BrazilStatus = React.memo(function BrazilStatus({ data }: { data: ISSData }) {  const colors  = useColors();  const dist    = haversineKm(data.latitude, data.longitude, BRAZIL_LAT, BRAZIL_LNG);  const inRange = dist < data.footprint / 2;  const color   = inRange ? colors.neonGreen : colors.premiumGray;  return (    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 18, paddingHorizontal: 16,     paddingVertical: 9, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth,     backgroundColor: inRange ? 'rgba(34,197,94,0.12)' : colors.glassFill,     borderColor: inRange ? 'rgba(34,197,94,0.30)' : colors.glassBorder }}>      <MapPin size={12} color={color} />      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color }}>        {inRange ? `ISS visível do Brasil • ${Math.round(dist).toLocaleString('pt-BR')} km` : `ISS a ${Math.round(dist).toLocaleString('pt-BR')} km do Brasil`}      </Text>    </View>  );});export default function SatelliteScreen() {  const colors = useColors();  const mode   = useThemeStore((s) => s.mode);  const [data,       setData]       = useState<ISSData | null>(null);  const [loading,    setLoading]    = useState(true);  const [error,      setError]      = useState<string | null>(null);  const [updateTime, setUpdateTime] = useState('');  const mountedRef = useRef(true);  const fetchISS = useCallback(async () => {    try {      setError(null);      const res  = await fetch(ISS_API);      if (!res.ok) throw new Error(`HTTP ${res.status}`);      const json = await res.json();      if (!mountedRef.current) return;      setData({ latitude: json.latitude, longitude: json.longitude, altitude: json.altitude,         velocity: json.velocity, visibility: json.visibility,         footprint: json.footprint, solar_lat: json.solar_lat, timestamp: json.timestamp });      setUpdateTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));    } catch {      if (mountedRef.current) setError('Não foi possível conectar à ISS.');    } finally {      if (mountedRef.current) setLoading(false);    }  }, []);  useEffect(() => { mountedRef.current = true; fetchISS();     const id = setInterval(fetchISS, 5000); return () => { mountedRef.current = false; clearInterval(id); }; }, [fetchISS]);  const visibilityLabel = useMemo(() => { if (!data) return '';     return data.visibility === 'daylight' ? 'Luz do dia' : 'Zona de eclipse'; }, [data]);  const bgColors: [string, string, string, string] = mode === 'dark'    ? ['#020617', '#04142B', '#071F3B', '#020617']    : [colors.deepBlack, 'rgba(59,130,246,0.04)', 'rgba(34,197,94,0.03)', colors.deepBlack];  const refreshBg     = mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';  const refreshBorder = mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)';  const dividerColor  = mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';  const cardIconBg    = mode === 'dark' ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)';  return (    <View style={[styles.root, { backgroundColor: colors.deepBlack }]}>      <LinearGradient colors={bgColors} style={StyleSheet.absoluteFill} />      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: 20 }}>          <AnimatedHeader title="OrbitX Brasil" subtitle="ISS em tempo real • atualiza a cada 5s" />          <Pressable style={[styles.refreshBtn, { backgroundColor: refreshBg, borderColor: refreshBorder }]} onPress={fetchISS} hitSlop={10}>            <RefreshCw size={15} color={colors.softWhite} />          </Pressable>        </View>        {loading && (          <View style={styles.stateBox}>            <Signal size={22} color={colors.neonGreen} />            <Text style={{ color: colors.premiumGray, fontFamily: 'Inter_400Regular',               fontSize: 14, textAlign: 'center' }}>Conectando à ISS...</Text>          </View>        )}        {error && !loading && (          <View style={styles.stateBox}>            <AlertTriangle size={22} color={colors.danger} />            <Text style={{ color: colors.danger, fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center' }}>{error}</Text>            <Pressable style={[styles.retryBtn, { backgroundColor: `${colors.danger}18`, borderColor: `${colors.danger}35` }]} onPress={fetchISS}>              <Text style={{ color: colors.danger, fontFamily: 'Inter_600SemiBold', fontSize: 12 }}>Tentar novamente</Text>            </Pressable>          </View>        )}        {data && (          <Animated.View entering={FadeInDown.duration(500)} style={{ alignItems: 'center', marginTop: 10 }}>            <GlobeView data={data} />            <BrazilStatus data={data} />          </Animated.View>        )}        {data && (          <Animated.View entering={FadeInDown.duration(600)} style={{ paddingHorizontal: 20, marginTop: 18 }}>            <PremiumCard>              <View style={{ flexDirection: 'row', alignItems: 'center' }}>                <View style={{ width: 40, height: 40, borderRadius: 14, justifyContent: 'center',                   alignItems: 'center', marginRight: 12, backgroundColor: cardIconBg, borderWidth: StyleSheet.hairlineWidth,                   borderColor: `${colors.spaceBlue}30` }}>                  <Satellite size={16} color={colors.spaceBlue} />                </View>                <View style={{ flex: 1 }}>                  <Text style={{ color: colors.softWhite, fontSize: 16, fontFamily: 'Inter_700Bold' }}>ISS — NASA</Text>                  <Text style={{ color: colors.premiumGray, fontSize: 12, marginTop: 2 }}>Estação Espacial Internacional</Text>                </View>                <LiveBadge />              </View>              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: dividerColor, marginVertical: 16 }} />              <InfoRow icon={<MapPin    size={14} color={colors.neonGreen}  />} label="Latitude"            value={formatCoord(data.latitude,  'N', 'S')} />              <InfoRow icon={<MapPin    size={14} color={colors.neonGreen}  />} label="Longitude"           value={formatCoord(data.longitude, 'L', 'O')} />              <InfoRow icon={<Globe     size={14} color={colors.spaceBlue} />} label="Altitude"            value={`${data.altitude.toFixed(1)} km`} sub={`Órbita baixa — ${Math.round(data.altitude)} km acima do nível do mar`} />              <InfoRow icon={<Activity  size={14} color="#F59E0B"           />} label="Velocidade"          value={`${toKms(data.velocity)} km/s`} sub={`${Math.round(data.velocity).toLocaleString('pt-BR')} km/h`} />              <InfoRow icon={<Radio     size={14} color="#A855F7"           />} label="Visibilidade"        value={visibilityLabel} sub={data.visibility === 'daylight' ? 'Sol iluminando a estação' : 'ISS na sombra da Terra'} />              <InfoRow icon={<Footprints size={14} color={colors.premiumGray}/>} label="Cobertura (footprint)" value={`${Math.round(data.footprint).toLocaleString('pt-BR')} km`} sub="Diâmetro da área onde a ISS é visível a olho nu" />              <InfoRow icon={<Sun       size={14} color="#F59E0B"           />} label="Latitude solar"      value={formatCoord(data.solar_lat, 'N', 'S')} sub="Posição do sol em relação ao equador terrestre" />              <InfoRow icon={<Clock3    size={14} color={colors.premiumGray}/>} label="Última atualização" value={updateTime} sub={`Timestamp Unix: ${data.timestamp}`} />            </PremiumCard>          </Animated.View>        )}        {data && (          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20, paddingHorizontal: 24 }}>            <Globe size={11} color={colors.premiumGray} />            <Text style={{ color: colors.premiumGray, fontFamily: 'Inter_400Regular',               fontSize: 11, flex: 1 }}>Fonte: wheretheiss.at — Atualização automática a cada 5s</Text>          </View>        )}        <View style={{ height: 130 }} />      </ScrollView>    </View>  );}const styles = StyleSheet.create({  root:       { flex: 1 },  content:    { paddingTop: 40 },  refreshBtn: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 20,     borderWidth: StyleSheet.hairlineWidth },  stateBox:   { alignItems: 'center', justifyContent: 'center', padding: 40, gap: 10 },  retryBtn:   { marginTop: 4, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth },});
>>>>>>> renato/main
