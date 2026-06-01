import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { KeyRound, Mail } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

import { OrbitButton } from "../components/OrbitButton";
import { PremiumCard } from "../components/PremiumCard";
import { OrbitColors } from "../constants/Colors";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => email.trim().length > 3, [email]);

  const onSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      Alert.alert(
        "Recuperação (simulada)",
        "Se este email existir, enviaremos um link.",
      );
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[
          OrbitColors.deepBlack,
          "rgba(239,68,68,0.06)",
          "rgba(59,130,246,0.10)",
          OrbitColors.deepBlack,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <View style={styles.badge}>
          <KeyRound size={16} color={OrbitColors.spaceBlue} />
          <Text style={styles.badgeText}>Account Recovery</Text>
        </View>
        <Text style={styles.title}>Esqueci a senha</Text>
        <Text style={styles.subtitle}>
          Informe seu email para recuperar o acesso.
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

          <View style={{ marginTop: 16 }} />
          <OrbitButton
            label="Enviar link"
            onPress={onSubmit}
            disabled={!canSubmit}
            loading={loading}
          />
        </PremiumCard>
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
  body: { paddingHorizontal: 22 },
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
});
