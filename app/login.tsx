<<<<<<< HEAD
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { Eye, EyeOff, Mail } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    Image,
} from "react-native";


import { OrbitButton } from "../components/OrbitButton";
import { PremiumCard } from "../components/PremiumCard";
import { OrbitColors } from "../constants/Colors";
import { useAuthStore } from "../store/auth";

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const isLoadingAuth = useAuthStore((s) => s.isLoadingAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const canSubmit = useMemo(
    () => email.trim().length > 3 && password.length >= 3,
    [email, password],
  );

  const onSubmit = async () => {
    if (!canSubmit) return;
    try {
      await login({ email: email.trim(), password });
      router.replace("/(tabs)/dashboard");
    } catch {
      Alert.alert("Orbit X", "Falha ao autenticar. Tente novamente.");
    }
  };

  const onSocial = (provider: "Google" | "GitHub" | "Outlook") => {
    Alert.alert("Login social (simulado)", `Continuar com ${provider}`);
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[
          OrbitColors.deepBlack,
          "rgba(34,197,94,0.08)",
          "rgba(59,130,246,0.10)",
          OrbitColors.deepBlack,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <View style={styles.badge}>
          <Image 
              source={require('../assets/images/X.png')} 
              style={{ width: 50, height: 50, resizeMode: "contain" }} 
            />
          <Text style={styles.badgeText}>ORBIT X</Text>
        </View>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>
          Entre para iniciar o monitoramento inteligente.
        </Text>
      </View>

      <View style={styles.body}>
        <PremiumCard>
          <Text style={styles.label}>Email</Text>
          <View style={styles.field}>
            <Mail size={16} color={OrbitColors.premiumGray} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="empresa@dominio.com"
              placeholderTextColor="rgba(154,164,178,0.6)"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>

          <Text style={[styles.label, { marginTop: 14 }]}>Senha</Text>
          <View style={styles.field}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="rgba(154,164,178,0.6)"
              secureTextEntry={!show}
              autoCapitalize="none"
              style={[styles.input, { flex: 1 }]}
            />
            <Pressable onPress={() => setShow((v) => !v)} hitSlop={10}>
              {show ? (
                <EyeOff size={16} color={OrbitColors.premiumGray} />
              ) : (
                <Eye size={16} color={OrbitColors.premiumGray} />
              )}
            </Pressable>
          </View>

          <View style={styles.actions}>
            <Link href="/forgot-password" asChild>
              <Pressable hitSlop={10}>
                <Text style={styles.link}>Esqueci minha senha</Text>
              </Pressable>
            </Link>
          </View>

          <OrbitButton
            label="Entrar"
            onPress={onSubmit}
            disabled={!canSubmit}
            loading={isLoadingAuth}
          />

          <View style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>ou</Text>
            <View style={styles.divLine} />
          </View>

          <View style={styles.socialRow}>
            <OrbitButton
              label="Google"
              variant="secondary"
              onPress={() => onSocial("Google")}
              style={{ flex: 1 }}
            />
            <OrbitButton
              label="GitHub"
              variant="secondary"
              onPress={() => onSocial("GitHub")}
              style={{ flex: 1 }}
            />
            <OrbitButton
              label="Outlook"
              variant="secondary"
              onPress={() => onSocial("Outlook")}
              style={{ flex: 1 }}
            />
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Novo por aqui?</Text>
            <Link href="/register" asChild>
              <Pressable hitSlop={10}>
                <Text style={[styles.link, { marginLeft: 6 }]}>
                  Criar conta
                </Text>
              </Pressable>
            </Link>
          </View>
        </PremiumCard>
      </View>

      <View style={styles.brandRow}>
        <Text style={styles.brandFoot}>
          ORBIT X - Feito para Global Solution
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: OrbitColors.deepBlack },
  header: { paddingTop: 70, paddingHorizontal: 22, paddingBottom: 18 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignSelf: "flex-start",
    backgroundColor: "rgba(34,197,94,0.10)",
    borderColor: "rgba(34,197,94,0.22)",
    borderWidth: StyleSheet.hairlineWidth,
  },
  badgeText: {
    color: OrbitColors.softWhite,
    fontFamily: "Inter_600SemiBold",
    fontSize: 20,
    letterSpacing: 3.5,
  },
  title: {
    marginTop: 50,
    color: OrbitColors.softWhite,
    fontFamily: "Inter_700Bold",
    fontSize: 30,
  },
  subtitle: {
    marginTop: 10,
    color: OrbitColors.premiumGray,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 18,
  },
  body: { paddingHorizontal: 22 },
  label: {
    color: OrbitColors.premiumGray,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    marginBottom: 8,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  input: {
    color: OrbitColors.softWhite,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  actions: { marginTop: 12, alignItems: "flex-end", marginBottom: 14 },
  link: {
    color: OrbitColors.spaceBlue,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  divider: {
    marginTop: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  divLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  divText: {
    color: OrbitColors.premiumGray,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  socialRow: { flexDirection: "row", gap: 10 },
  footerRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: OrbitColors.premiumGray,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  brandRow: {
    marginTop: "auto",
    paddingBottom: 20,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  brandFoot: {
    color: "rgba(154,164,178,0.7)",
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
});
=======
import { LinearGradient } from "expo-linear-gradient";import { Link, useRouter } from "expo-router";import { Eye, EyeOff, Mail, Sparkles } from "lucide-react-native";import React, { useMemo, useState } from "react";import {    Alert,    Pressable,    StyleSheet,    Text,    TextInput,    View,} from "react-native";import { OrbitButton } from "../components/OrbitButton";import { PremiumCard } from "../components/PremiumCard";import { OrbitColors } from "../constants/Colors";import { useAuthStore } from "../store/auth";export default function LoginScreen() {  const router = useRouter();  const login = useAuthStore((s) => s.login);  const isLoadingAuth = useAuthStore((s) => s.isLoadingAuth);  const [email, setEmail] = useState("");  const [password, setPassword] = useState("");  const [show, setShow] = useState(false);  const canSubmit = useMemo(    () => email.trim().length > 3 && password.length >= 3,    [email, password],  );  const onSubmit = async () => {    if (!canSubmit) return;    try {      await login({ email: email.trim(), password });      router.replace("/(tabs)/dashboard");    } catch (e: any) {      Alert.alert("Orbit X", e?.message ?? "Falha ao autenticar. Tente novamente.");    }  };  const onSocial = (provider: "Google" | "GitHub" | "Outlook") => {    Alert.alert("Login social (simulado)", `Continuar com ${provider}`);  };  return (    <View style={styles.root}>      <LinearGradient        colors={[          OrbitColors.deepBlack,          "rgba(34,197,94,0.08)",          "rgba(59,130,246,0.10)",          OrbitColors.deepBlack,        ]}        start={{ x: 0, y: 0 }}        end={{ x: 1, y: 1 }}        style={StyleSheet.absoluteFill}      />      <View style={styles.header}>        <View style={styles.badge}>          <Sparkles size={24} color={OrbitColors.neonGreen} />          <Text style={styles.badgeText}>Orbit X</Text>        </View>        <Text style={styles.title}>Login</Text>        <Text style={styles.subtitle}>          Entre para iniciar o monitoramento inteligente.        </Text>      </View>      <View style={styles.body}>        <PremiumCard>          <Text style={styles.label}>Email</Text>          <View style={styles.field}>            <Mail size={16} color={OrbitColors.premiumGray} />            <TextInput              value={email}              onChangeText={setEmail}              placeholder="empresa@dominio.com"              placeholderTextColor="rgba(154,164,178,0.6)"              autoCapitalize="none"              keyboardType="email-address"              style={styles.input}            />          </View>          <Text style={[styles.label, { marginTop: 14 }]}>Senha</Text>          <View style={styles.field}>            <TextInput              value={password}              onChangeText={setPassword}              placeholder="••••••••"              placeholderTextColor="rgba(154,164,178,0.6)"              secureTextEntry={!show}              autoCapitalize="none"              style={[styles.input, { flex: 1 }]}            />            <Pressable onPress={() => setShow((v) => !v)} hitSlop={10}>              {show ? (                <EyeOff size={16} color={OrbitColors.premiumGray} />              ) : (                <Eye size={16} color={OrbitColors.premiumGray} />              )}            </Pressable>          </View>          <View style={styles.actions}>            <Link href="/forgot-password" asChild>              <Pressable hitSlop={10}>                <Text style={styles.link}>Esqueci minha senha</Text>              </Pressable>            </Link>          </View>          <OrbitButton            label="Entrar"            onPress={onSubmit}            disabled={!canSubmit}            loading={isLoadingAuth}          />          <View style={styles.divider}>            <View style={styles.divLine} />            <Text style={styles.divText}>ou</Text>            <View style={styles.divLine} />          </View>          <View style={styles.socialRow}>            <OrbitButton              label="Google"              variant="secondary"              onPress={() => onSocial("Google")}              style={{ flex: 1 }}            />            <OrbitButton              label="GitHub"              variant="secondary"              onPress={() => onSocial("GitHub")}              style={{ flex: 1 }}            />            <OrbitButton              label="Outlook"              variant="secondary"              onPress={() => onSocial("Outlook")}              style={{ flex: 1 }}            />          </View>          <View style={styles.footerRow}>            <Text style={styles.footerText}>Novo por aqui?</Text>            <Link href="/register" asChild>              <Pressable hitSlop={10}>                <Text style={[styles.link, { marginLeft: 6 }]}>                  Criar conta                </Text>              </Pressable>            </Link>          </View>        </PremiumCard>      </View>      <View style={styles.brandRow}>        <Text style={styles.brandFoot}>          OrbitX - Feito para Global Solution        </Text>      </View>    </View>  );}const styles = StyleSheet.create({  root: { flex: 1, backgroundColor: OrbitColors.deepBlack },  header: { paddingTop: 70, paddingHorizontal: 22, paddingBottom: 18 },  badge: {    flexDirection: "row",    alignItems: "center",    gap: 8,    paddingVertical: 8,    paddingHorizontal: 10,    borderRadius: 999,    alignSelf: "flex-start",    backgroundColor: "rgba(34,197,94,0.10)",    borderColor: "rgba(34,197,94,0.22)",    borderWidth: StyleSheet.hairlineWidth,  },  badgeText: {    color: OrbitColors.softWhite,    fontFamily: "Inter_600SemiBold",    fontSize: 12,  },  title: {    marginTop: 14,    color: OrbitColors.softWhite,    fontFamily: "Inter_700Bold",    fontSize: 30,  },  subtitle: {    marginTop: 10,    color: OrbitColors.premiumGray,    fontFamily: "Inter_400Regular",    fontSize: 13,    lineHeight: 18,  },  body: { paddingHorizontal: 22 },  label: {    color: OrbitColors.premiumGray,    fontFamily: "Inter_500Medium",    fontSize: 12,    marginBottom: 8,  },  field: {    flexDirection: "row",    alignItems: "center",    gap: 10,    borderRadius: 16,    borderColor: "rgba(255,255,255,0.12)",    borderWidth: StyleSheet.hairlineWidth,    paddingHorizontal: 12,    paddingVertical: 12,    backgroundColor: "rgba(255,255,255,0.04)",  },  input: {    color: OrbitColors.softWhite,    fontFamily: "Inter_500Medium",    flex: 1,  },  actions: { marginTop: 12, alignItems: "flex-end", marginBottom: 14 },  link: {    color: OrbitColors.spaceBlue,    fontFamily: "Inter_600SemiBold",    fontSize: 12,  },  divider: {    marginTop: 16,    marginBottom: 16,    flexDirection: "row",    alignItems: "center",    gap: 10,  },  divLine: {    flex: 1,    height: StyleSheet.hairlineWidth,    backgroundColor: "rgba(255,255,255,0.12)",  },  divText: {    color: OrbitColors.premiumGray,    fontFamily: "Inter_400Regular",    fontSize: 12,  },  socialRow: { flexDirection: "row", gap: 10 },  footerRow: {    marginTop: 16,    flexDirection: "row",    justifyContent: "center",    alignItems: "center",  },  footerText: {    color: OrbitColors.premiumGray,    fontFamily: "Inter_400Regular",    fontSize: 12,  },  brandRow: {    marginTop: "auto",    paddingBottom: 20,    paddingHorizontal: 22,    flexDirection: "row",    alignItems: "center",    justifyContent: "center",    gap: 10,  },  brandFoot: {    color: "rgba(154,164,178,0.7)",    fontFamily: "Inter_400Regular",    fontSize: 11,  },});
>>>>>>> renato/main
