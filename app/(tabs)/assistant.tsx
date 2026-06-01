import { LinearGradient } from "expo-linear-gradient";
import { SendHorizontal, Sparkles } from "lucide-react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { AnimatedHeader } from "../../components/AnimatedHeader";
import { GlassContainer } from "../../components/GlassContainer";
import { useColors } from "../../constants/Colors";
import { useThemeStore } from "../../store/theme";
import { sleep } from "../../utils/sleep";

type Role = "user" | "assistant";

type Msg = {
  id: string;
  role: Role;
  text: string;
};

const SUGGESTIONS = [
  "Resumo dos KPIs agora",
  "Como reduzir 10% do consumo?",
  "Risco térmico nas próximas 3h",
];

function makeReply(prompt: string) {
  const p = prompt.toLowerCase();

  if (p.includes("kpi") || p.includes("resumo")) {
    return (
      "Resumo: consumo 742 kW (-3.1%), temperatura 36.8°C (estável), " +
      "carbono 1.42 tCO₂e (-1.8%), eficiência 92% (+0.7%). " +
      "Recomendo ajustar setpoints em +0.6°C nas zonas frias para reduzir " +
      "consumo sem risco térmico."
    );
  }

  if (p.includes("reduzir") || p.includes("10%")) {
    return (
      "Para reduzir ~10%: (1) otimizar setpoints +0.5°C em zonas estáveis, " +
      "(2) aplicar fan curves com controle preditivo, " +
      "(3) migrar workloads batch para janelas com menor fator de emissão, " +
      "(4) habilitar pre-cooling antes de picos térmicos."
    );
  }

  if (p.includes("risco") || p.includes("3h")) {
    return (
      "Risco térmico nas próximas 3h: baixo. Pequena elevação prevista em " +
      "EU (Frankfurt) por umidade/temperatura externa. Mitigação: ativar " +
      "pre-cooling leve e redistribuir cargas de alta densidade."
    );
  }

  return (
    "Entendi. Quer que eu analise por região (Mapa), por satélite/clima " +
    "(Orbital) ou por economia/ESG (Métricas)?"
  );
}

function Bubble({ role, text }: { role: Role; text: string }) {
  const colors = useColors();
  const mode = useThemeStore((s) => s.mode);

  const isUser = role === "user";

  const userBg = "rgba(59,130,246,0.18)";
  const userBorder = "rgba(59,130,246,0.30)";

  const aiBg = mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";

  const aiBorder =
    mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";

  return (
    <View
      style={[
        styles.bubble,
        isUser
          ? {
              alignSelf: "flex-end",
              backgroundColor: userBg,
              borderColor: userBorder,
            }
          : {
              alignSelf: "flex-start",
              backgroundColor: aiBg,
              borderColor: aiBorder,
            },
      ]}
    >
      <Text
        style={{
          color: colors.softWhite,
          fontFamily: "Inter_400Regular",
          fontSize: 13,
          lineHeight: 18,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

export default function AssistantScreen() {
  const colors = useColors();
  const mode = useThemeStore((s) => s.mode);

  const listRef = useRef<FlatList<Msg>>(null);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "m-0",
      role: "assistant",
      text:
        "Olá! Sou a Orbit AI. Posso analisar KPIs, riscos térmicos e " +
        "sugerir otimizações para reduzir energia e carbono.",
    },
  ]);

  const canSend = useMemo(
    () => input.trim().length > 0 && !typing,
    [input, typing],
  );

  const send = useCallback(async (text: string) => {
    const value = text.trim();

    if (!value) return;

    setMessages((prev) => [
      {
        id: `u-${Date.now()}`,
        role: "user",
        text: value,
      },
      ...prev,
    ]);

    setInput("");
    setTyping(true);

    await sleep(650);

    setMessages((prev) => [
      {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: makeReply(value),
      },
      ...prev,
    ]);

    setTyping(false);

    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: 0,
        animated: true,
      });
    });
  }, []);

  const gradientColors: [string, string, string, string] =
    mode === "dark"
      ? [
          colors.deepBlack,
          "rgba(59,130,246,0.10)",
          "rgba(34,197,94,0.08)",
          colors.deepBlack,
        ]
      : [
          colors.deepBlack,
          "rgba(59,130,246,0.05)",
          "rgba(34,197,94,0.04)",
          colors.deepBlack,
        ];

  const suggestionBg =
    mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";

  const suggestionBorder =
    mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";

  const sendBg = "rgba(59,130,246,0.16)";
  const sendBorder = "rgba(59,130,246,0.30)";

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.deepBlack,
        },
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <AnimatedHeader
        title="Orbit IA"
        subtitle="Assistente inteligente • recomendações em tempo real"
      />

      <FlatList
        ref={listRef}
        data={messages}
        inverted
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Animated.View entering={FadeInDown.duration(260)}>
            <Bubble role={item.role} text={item.text} />
          </Animated.View>
        )}
        ListHeaderComponent={
          typing ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: 22,
                paddingVertical: 10,
              }}
            >
              <Sparkles size={14} color={colors.neonGreen} />

              <Text
                style={{
                  color: colors.premiumGray,
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                }}
              >
                Orbit AI está digitando…
              </Text>
            </View>
          ) : null
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
            paddingHorizontal: 22,
            paddingBottom: 10,
          }}
        >
          {SUGGESTIONS.map((suggestion) => (
            <Pressable
              key={suggestion}
              onPress={() => send(suggestion)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 10,
                borderRadius: 999,
                backgroundColor: suggestionBg,
                borderColor: suggestionBorder,
                borderWidth: StyleSheet.hairlineWidth,
              }}
            >
              <Text
                style={{
                  color: colors.softWhite,
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                }}
              >
                {suggestion}
              </Text>
            </Pressable>
          ))}
        </View>

        <GlassContainer style={styles.inputWrap} intensity={25}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Pergunte sobre energia, temperatura…"
            placeholderTextColor={`${colors.premiumGray}AA`}
            style={[
              styles.input,
              {
                color: colors.softWhite,
              },
            ]}
            multiline
          />

          <Pressable
            disabled={!canSend}
            onPress={() => send(input)}
            style={[
              {
                width: 40,
                height: 40,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: sendBg,
                borderColor: sendBorder,
                borderWidth: StyleSheet.hairlineWidth,
              },
              !canSend && {
                opacity: 0.5,
              },
            ]}
          >
            <SendHorizontal size={18} color={colors.softWhite} />
          </Pressable>
        </GlassContainer>
      </KeyboardAvoidingView>

      <View style={{ height: 128 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  list: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 14,
    gap: 10,
  },

  bubble: {
    maxWidth: "90%",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },

  inputWrap: {
    marginHorizontal: 14,
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },

  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 110,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
  },
});
