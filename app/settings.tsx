import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRouter } from "expo-router";
import {
  Bell,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  Github,
  Info,
  Linkedin,
  Lock,
  LogOut,
  Moon,
  Shield,
  Sun,
  UserCircle2,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OrbitButton } from "../components/OrbitButton";
import { PremiumCard } from "../components/PremiumCard";
import { useColors } from "../constants/Colors";
import { useAuthStore } from "../store/auth";
import { useThemeStore } from "../store/theme";
import { authApi } from "../services/orbitApi";

const TEAM = [
  {
    name: "Fabio Eduardo",
    role: "Mobile Developer • React Native",
    rm: "RM 560416",
    github: "https://github.com/fabioeduu",
    linkedin: "https://linkedin.com/in/fabioeduu",
  },
  {
    name: "Gabriel Wu Castro",
    role: "Backend Developer",
    rm: "RM 560210",
    github: "https://github.com/Wugabriel",
    linkedin: "https://linkedin.com/",
  },
  {
    name: "Lucas Chicote",
    role: "Backend Developer",
    rm: "RM 559366",
    github: "https://github.com/LucasChicote",
    linkedin: "https://www.linkedin.com/in/lucas-aurelio-de-brito-chicote-a5a169324/",
  },
  {
    name: "Renato Kenji Sugaki",
    role: "Software Engineer • Spring Boot",
    rm: "RM 559810",
    github: "https://github.com/renatosgk",
    linkedin: "https://linkedin.com/in/renato-kenji-2643982a4",
  },
];

type RowProps = {
  icon: React.ReactNode;
  title: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
};

function Row({ icon, title, value, onPress, right, danger }: RowProps) {
  const colors = useColors();
  const content = (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconWrap, { backgroundColor: colors.glassFill, borderColor: colors.glassBorder }]}>
          {icon}
        </View>
        <View style={styles.rowCenter}>
          <Text style={[styles.rowTitle, { color: danger ? colors.danger : colors.softWhite }]}>
            {title}
          </Text>
          {value ? (
            <Text style={[styles.rowValue, { color: colors.premiumGray }]} numberOfLines={1}>
              {value}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.rowRight}>
        {right ?? (onPress ? <ChevronRight size={14} color={colors.premiumGray} /> : null)}
      </View>
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && { backgroundColor: colors.glassFill }]}
      android_ripple={{ color: colors.glassFill }}
    >
      {content}
    </Pressable>
  );
}

function Divider() {
  const colors = useColors();
  return <View style={[styles.divider, { backgroundColor: colors.divider }]} />;
}

function SectionLabel({ label }: { label: string }) {
  const colors = useColors();
  return <Text style={[styles.sectionLabel, { color: colors.premiumGray }]}>{label}</Text>;
}

const TeamCard = React.memo(function TeamCard({ name, role, rm, github, linkedin }: (typeof TEAM)[0]) {
  const colors = useColors();
  return (
    <View style={styles.teamCard}>
      <View style={[styles.teamAvatar, { backgroundColor: `${colors.spaceBlue}22`, borderColor: `${colors.spaceBlue}40` }]}>
        <Text style={[styles.teamAvatarText, { color: colors.spaceBlue }]}>{name.charAt(0)}</Text>
      </View>
      <View style={styles.teamInfo}>
        <Text style={[styles.teamName, { color: colors.softWhite }]}>{name}</Text>
        <Text style={[styles.teamRole, { color: colors.premiumGray }]}>{role}</Text>
        <Text style={[styles.teamRm, { color: colors.premiumGray }]}>{rm}</Text>
      </View>
      <View style={styles.teamLinks}>
        <Pressable onPress={() => Linking.openURL(github)} hitSlop={10}
          style={[styles.teamLinkBtn, { backgroundColor: colors.glassFill, borderColor: colors.glassBorder }]}>
          <Github size={15} color={colors.premiumGray} />
        </Pressable>
        <Pressable onPress={() => Linking.openURL(linkedin)} hitSlop={10}
          style={[styles.teamLinkBtn, { backgroundColor: colors.glassFill, borderColor: colors.glassBorder }]}>
          <Linkedin size={15} color={colors.premiumGray} />
        </Pressable>
      </View>
    </View>
  );
});

export default function SettingsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const isDark = mode === "dark";

  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);
  const [sendingReset, setSendingReset] = useState(false);

  const [thermalAlerts, setThermalAlerts] = useState(true);
  const [esgAlerts, setEsgAlerts] = useState(true);
  const [showAbout, setShowAbout] = useState(false);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/dashboard");
    }
  }, [navigation, router]);

  const onLogout = useCallback(() => {
    Alert.alert("Encerrar sessão", "Deseja sair da conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  }, [logout, router]);

  const onResetPassword = useCallback(async () => {
    if (!session?.email) return;
    Alert.alert(
      "Redefinir senha",
      `Uma senha temporária será enviada para ${session.email}. Deseja continuar?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Enviar",
          onPress: async () => {
            setSendingReset(true);
            try {
              await authApi.forgotPassword({ email: session.email });
              Alert.alert("E-mail enviado", "Verifique sua caixa de entrada. Use a senha temporária para fazer login.");
            } catch {
              Alert.alert("Erro", "Não foi possível enviar o e-mail. Tente novamente.");
            } finally {
              setSendingReset(false);
            }
          },
        },
      ]
    );
  }, [session]);

  const onThermalToggle = useCallback((value: boolean) => {
    setThermalAlerts(value);
    if (value)
      Alert.alert("Alertas térmicos ativados", "Você receberá notificações quando a temperatura ultrapassar o setpoint.");
  }, []);

  const onEsgToggle = useCallback((value: boolean) => {
    setEsgAlerts(value);
    if (value)
      Alert.alert("Alertas ESG ativados", "Você receberá notificações sobre emissões de carbono e eficiência energética.");
  }, []);

  const gradientColors: [string, string, string] = isDark
    ? [colors.deepBlack, "rgba(59,130,246,0.07)", colors.deepBlack]
    : [colors.deepBlack, "rgba(59,130,246,0.04)", colors.deepBlack];

  return (
    <View style={[styles.root, { backgroundColor: colors.deepBlack }]}>
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
          <Pressable onPress={handleBack}
            style={[styles.backBtn, { backgroundColor: colors.glassFill, borderColor: colors.glassBorder }]}
            hitSlop={12}>
            <ChevronLeft size={18} color={colors.softWhite} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.softWhite }]}>Configurações</Text>
            <Text style={[styles.subtitle, { color: colors.premiumGray }]}>Conta, preferências e sobre o projeto</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(350).delay(40)}>
          <SectionLabel label="CONTA" />
          <PremiumCard>
            <Row
              icon={<UserCircle2 size={16} color={colors.spaceBlue} />}
              title="Usuário"
              value={session?.email ?? "—"}
            />
            <Divider />
            <Row
              icon={<Building2 size={16} color={colors.spaceBlue} />}
              title="Empresa"
              value={session?.companyName ?? "—"}
            />
          </PremiumCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(350).delay(80)}>
          <SectionLabel label="SEGURANÇA" />
          <PremiumCard>
            <Row
              icon={<Lock size={16} color={colors.neonGreen} />}
              title="Redefinir senha"
              value={sendingReset ? "Enviando…" : "Envia senha temporária por e-mail"}
              onPress={sendingReset ? undefined : onResetPassword}
            />
            <Divider />
            <Row
              icon={<Shield size={16} color={colors.premiumGray} />}
              title="Autenticação 2FA"
              value="Disponível em breve"
              right={
                <View style={[styles.comingSoonBadge, { backgroundColor: colors.glassFill, borderColor: colors.glassBorder }]}>
                  <Text style={[styles.comingSoonText, { color: colors.premiumGray }]}>Em breve</Text>
                </View>
              }
            />
          </PremiumCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(350).delay(120)}>
          <SectionLabel label="ALERTAS" />
          <PremiumCard>
            <Row
              icon={<Bell size={16} color={colors.warning} />}
              title="Alertas térmicos"
              value={thermalAlerts ? "Ativado — temperatura crítica" : "Desativado"}
              right={
                <Switch
                  value={thermalAlerts}
                  onValueChange={onThermalToggle}
                  trackColor={{ false: colors.glassBorder, true: `${colors.neonGreen}60` }}
                  thumbColor={thermalAlerts ? colors.neonGreen : colors.premiumGray}
                />
              }
            />
            <Divider />
            <Row
              icon={<Bell size={16} color={colors.spaceBlue} />}
              title="Alertas ESG"
              value={esgAlerts ? "Ativado — carbono e eficiência" : "Desativado"}
              right={
                <Switch
                  value={esgAlerts}
                  onValueChange={onEsgToggle}
                  trackColor={{ false: colors.glassBorder, true: `${colors.spaceBlue}60` }}
                  thumbColor={esgAlerts ? colors.spaceBlue : colors.premiumGray}
                />
              }
            />
          </PremiumCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(350).delay(160)}>
          <SectionLabel label="APARÊNCIA" />
          <PremiumCard>
            <Row
              icon={isDark ? <Moon size={16} color={colors.spaceBlue} /> : <Sun size={16} color={colors.warning} />}
              title="Tema"
              value={isDark ? "Modo escuro" : "Modo claro"}
              right={
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: `${colors.warning}60`, true: `${colors.spaceBlue}60` }}
                  thumbColor={isDark ? colors.spaceBlue : colors.warning}
                />
              }
            />
          </PremiumCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(350).delay(200)}>
          <SectionLabel label="SOBRE O PROJETO" />
          <PremiumCard>
            <Pressable onPress={() => setShowAbout((v) => !v)} style={styles.aboutToggle}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconWrap, { backgroundColor: colors.glassFill, borderColor: colors.glassBorder }]}>
                  <Info size={16} color={colors.spaceBlue} />
                </View>
                <View style={styles.rowCenter}>
                  <Text style={[styles.rowTitle, { color: colors.softWhite }]}>OrbitX</Text>
                  <Text style={[styles.rowValue, { color: colors.premiumGray }]}>Monitoramento de datacenter com IA</Text>
                </View>
              </View>
              {showAbout ? <ChevronUp size={14} color={colors.premiumGray} /> : <ChevronDown size={14} color={colors.premiumGray} />}
            </Pressable>
            {showAbout && (
              <View style={styles.aboutContent}>
                <View style={[styles.aboutDivider, { backgroundColor: colors.divider }]} />
                <Text style={[styles.aboutText, { color: colors.premiumGray }]}>
                  O OrbitX é uma plataforma mobile de monitoramento inteligente de datacenters,
                  desenvolvida para a Global Solution da FIAP 2026. O app integra dados reais de
                  satélites NASA, eventos naturais via EONET, posição da ISS em tempo real e KPIs
                  de eficiência energética com análise por Inteligência Artificial.
                </Text>
                <View style={styles.aboutTags}>
                  {["React Native", "Expo SDK 54", "Zustand", "NASA API", "Reanimated v4"].map((tag) => (
                    <View key={tag} style={[styles.tag, { backgroundColor: `${colors.spaceBlue}18`, borderColor: `${colors.spaceBlue}30` }]}>
                      <Text style={[styles.tagText, { color: colors.spaceBlue }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
                <Pressable
                  onPress={() => Linking.openURL("https://github.com/fabioeduu/OrbitX_GS")}
                  style={[styles.repoBtn, { backgroundColor: `${colors.spaceBlue}14`, borderColor: `${colors.spaceBlue}28` }]}>
                  <Github size={14} color={colors.spaceBlue} />
                  <Text style={[styles.repoBtnText, { color: colors.spaceBlue }]}>Ver repositório no GitHub</Text>
                  <ExternalLink size={12} color={colors.spaceBlue} />
                </Pressable>
              </View>
            )}
          </PremiumCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(350).delay(240)}>
          <SectionLabel label="INTEGRANTES" />
          {TEAM.map((member, i) => (
            <Animated.View key={member.rm} entering={FadeInDown.duration(300).delay(i * 60)} style={{ marginBottom: i < TEAM.length - 1 ? 10 : 0 }}>
              <PremiumCard>
                <TeamCard {...member} />
              </PremiumCard>
            </Animated.View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(350).delay(300)} style={styles.logoutSection}>
          <OrbitButton label="Encerrar sessão" variant="secondary" onPress={onLogout} />
          <View style={styles.logoutIconWrap}>
            <LogOut size={14} color={colors.danger} />
          </View>
        </Animated.View>

        <Text style={[styles.version, { color: colors.premiumGray }]}>
          OrbitX v1.0.0 • FIAP Global Solution 2026
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  backBtn: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center", borderWidth: StyleSheet.hairlineWidth },
  headerText: { flex: 1 },
  title: { fontFamily: "Inter_700Bold", fontSize: 22 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  sectionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 0.1, marginBottom: 8, marginTop: 20, marginLeft: 4 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 48, paddingVertical: 4 },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, paddingRight: 8 },
  rowCenter: { flex: 1 },
  rowRight: { alignItems: "flex-end", justifyContent: "center" },
  iconWrap: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center", borderWidth: StyleSheet.hairlineWidth },
  rowTitle: { fontFamily: "Inter_500Medium", fontSize: 13 },
  rowValue: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 1 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 2 },
  comingSoonBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth },
  comingSoonText: { fontFamily: "Inter_500Medium", fontSize: 10 },
  aboutToggle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 4 },
  aboutContent: { marginTop: 4 },
  aboutDivider: { height: StyleSheet.hairlineWidth, marginVertical: 12 },
  aboutText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20, marginBottom: 14 },
  aboutTags: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 14 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth },
  tagText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  repoBtn: { flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, alignSelf: "flex-start" },
  repoBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  teamCard: { flexDirection: "row", alignItems: "center", gap: 12 },
  teamAvatar: { width: 42, height: 42, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center" },
  teamAvatarText: { fontFamily: "Inter_700Bold", fontSize: 16 },
  teamInfo: { flex: 1 },
  teamName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  teamRole: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 1 },
  teamRm: { fontFamily: "Inter_400Regular", fontSize: 10, marginTop: 2, opacity: 0.7 },
  teamLinks: { flexDirection: "row", gap: 8 },
  teamLinkBtn: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", borderWidth: StyleSheet.hairlineWidth },
  logoutSection: { marginTop: 28, position: "relative" },
  logoutIconWrap: { position: "absolute", right: 16, top: 0, bottom: 0, justifyContent: "center" },
  version: { fontFamily: "Inter_400Regular", fontSize: 11, textAlign: "center", marginTop: 20 },
});
