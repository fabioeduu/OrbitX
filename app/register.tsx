import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import {
  Building2,
  Eye,
  EyeOff,
  Hash,
  ShieldCheck,
  User,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { OrbitButton } from "../components/OrbitButton";
import { PremiumCard } from "../components/PremiumCard";
import { OrbitColors } from "../constants/Colors";
import { useAuthStore } from "../store/auth";
export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const isLoadingAuth = useAuthStore((s) => s.isLoadingAuth);
  const [companyName, setCompanyName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const canSubmit = useMemo(
    () =>
      companyName.trim().length >= 2 &&
      taxId.trim().length >= 2 &&
      adminName.trim().length >= 2 &&
      email.trim().length > 3 &&
      password.length >= 8,
    [companyName, taxId, adminName, email, password],
  );

  const formatCnpj = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 14);

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

  const onSubmit = async () => {
    if (!canSubmit) return;
    try {
      await register({
        companyName: companyName.trim(),
        taxId: taxId.trim(),
        adminName: adminName.trim(),
        email: email.trim(),
        password,
      });
      router.replace("/(tabs)/dashboard");
    } catch (e: any) {
      Alert.alert("Orbit X", e?.message ?? "Falha ao criar conta.");
    }
  };
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[
          OrbitColors.deepBlack,
          "rgba(59,130,246,0.10)",
          "rgba(34,197,94,0.08)",
          OrbitColors.deepBlack,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.header}>
        <View style={styles.badge}>
          <ShieldCheck size={16} color={OrbitColors.spaceBlue} />
          <Text style={styles.badgeText}>Registro Empresarial</Text>
        </View>
        <Text style={styles.title}>Cadastro</Text>
        <Text style={styles.subtitle}>
          Crie sua conta empresarial e conecte seus datacenters.
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <PremiumCard>
          <Text style={styles.label}>Empresa</Text>
          <View style={styles.field}>
            <Building2 size={16} color={OrbitColors.premiumGray} />
            <TextInput
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="OrbitX Cloud Facilities"
              placeholderTextColor="rgba(154,164,178,0.6)"
              style={styles.input}
            />
          </View>
          <Text style={[styles.label, { marginTop: 14 }]}>CNPJ</Text>
          <View style={styles.field}>
            <Hash size={16} color={OrbitColors.premiumGray} />
            <TextInput
              value={taxId}
              onChangeText={(value) => setTaxId(formatCnpj(value))}
              placeholder="00.000.000/0001-00"
              placeholderTextColor="rgba(154,164,178,0.6)"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
          <Text style={[styles.label, { marginTop: 14 }]}>
            Nome do Administrador
          </Text>
          <View style={styles.field}>
            <User size={16} color={OrbitColors.premiumGray} />
            <TextInput
              value={adminName}
              onChangeText={setAdminName}
              placeholder="João Silva"
              placeholderTextColor="rgba(154,164,178,0.6)"
              style={styles.input}
            />
          </View>
          <Text style={[styles.label, { marginTop: 14 }]}>Email</Text>
          <View style={styles.field}>
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
              placeholder="mínimo 8 caracteres"
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
          <View style={{ marginTop: 16 }} />
          <OrbitButton
            label="Criar Conta"
            onPress={onSubmit}
            disabled={!canSubmit}
            loading={isLoadingAuth}
          />
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Já tem conta?</Text>
            <Link href="/login" asChild>
              <Pressable hitSlop={10}>
                <Text style={[styles.link, { marginLeft: 6 }]}>Entrar</Text>
              </Pressable>
            </Link>
          </View>
        </PremiumCard>
      </ScrollView>
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
    backgroundColor: "rgba(59,130,246,0.10)",
    borderColor: "rgba(59,130,246,0.22)",
    borderWidth: StyleSheet.hairlineWidth,
  },
  badgeText: {
    color: OrbitColors.softWhite,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  title: {
    marginTop: 14,
    color: OrbitColors.softWhite,
    fontFamily: "Inter_700Bold",
    fontSize: 28,
  },
  subtitle: {
    marginTop: 10,
    color: OrbitColors.premiumGray,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
  },
  body: { paddingHorizontal: 22, paddingBottom: 40 },
  label: {
    color: OrbitColors.premiumGray,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
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
  footerRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: OrbitColors.premiumGray,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  link: {
    color: OrbitColors.spaceBlue,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
});
