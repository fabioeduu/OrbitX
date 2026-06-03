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
  Image,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedHeader } from "../../components/AnimatedHeader";
import { GlassContainer } from "../../components/GlassContainer";
import { useColors } from "../../constants/Colors";
import { useThemeStore } from "../../store/theme";
import { sendToNvidia, type ChatMessage } from "../../utils/nvidiaAI";

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

function Bubble({ role, text }: { role: Role; text: string }) {
  const colors = useColors();
  const mode = useThemeStore((s) => s.mode);

  const isUser = role === "user";

  const userBg = "rgba(59,130,246,0.18)";
  const userBorder = "rgba(59,130,246,0.30)";

  const aiBg = mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const aiBorder = mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";

  return (
    <View
      style={{
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-end", // Alinha o ícone na base
        alignSelf: isUser ? "flex-end" : "flex-start",
        maxWidth: "90%",
        gap: 8,
      }}
    >
      {!isUser && (
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            overflow: "hidden",
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: "rgba(255,255,255,0.12)",
          }}
        >
          <Image
            source={require('../../assets/images/X.png')} 
            style={{ width: "100%", height: "100%", resizeMode: "cover" }}
          />
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isUser
            ? {
                backgroundColor: userBg,
                borderColor: userBorder,
                borderBottomRightRadius: 4,
              }
            : {
                backgroundColor: aiBg,
                borderColor: aiBorder,
                borderBottomLeftRadius: 4,
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
    </View>
  );
}

export default function AssistantScreen() {
  const colors = useColors();
  const mode = useThemeStore((s) => s.mode);

  const insets = useSafeAreaInsets();

  const listRef = useRef<FlatList<Msg>>(null);
  const historyRef = useRef<ChatMessage[]>([]);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    setError(null);
    setMessages((prev) => [
      { id: `u-${Date.now()}`, role: "user", text: value },
      ...prev,
    ]);
    setInput("");
    setTyping(true);

    try {
      const reply = await sendToNvidia(historyRef.current, value);

      historyRef.current = [
        ...historyRef.current,
        { role: "user", content: value },
        { role: "assistant", content: reply },
      ];

      setMessages((prev) => [
        { id: `a-${Date.now()}`, role: "assistant", text: reply },
        ...prev,
      ]);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao contatar a API.");
    } finally {
      setTyping(false);
      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
      });
    }
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
          paddingTop: insets.top,},
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
          <>
            {typing && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 0,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                }}
              >
                <Image
                    source={require('../../assets/images/X.png')}
                    style={{ 
                      width: 65, 
                      height: 55, 
                      resizeMode: "contain" 
                    }}
                  />
                  <Text style={{ color: colors.premiumGray, fontFamily: "Inter_400Regular", fontSize: 12 }}>
                    Orbit AI está digitando...
                  </Text>
              </View>
            )}
            {error && (
              <View
                style={{
                  marginHorizontal: 22,
                  marginBottom: 8,
                  padding: 10,
                  borderRadius: 12,
                  backgroundColor: "rgba(239,68,68,0.12)",
                  borderColor: "rgba(239,68,68,0.30)",
                  borderWidth: StyleSheet.hairlineWidth,
                }}
              >
                <Text
                  style={{
                    color: "#f87171",
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                  }}
                >
                  {error}
                </Text>
              </View>
            )}
          </>
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
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    flexShrink: 1,
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