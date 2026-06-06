<<<<<<< HEAD
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Brain, Cloud, Leaf, Satellite } from "lucide-react-native";
import React, { useMemo, useRef } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";

import { OrbitButton } from "../components/OrbitButton";
import { PremiumCard } from "../components/PremiumCard";
import { OrbitColors } from "../constants/Colors";
import { useAuthStore } from "../store/auth";

const { width } = Dimensions.get("window");

type Slide = {
  key: string;
  title: string;
  body: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
};

export default function OnboardingScreen() {
  const router = useRouter();
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);

  const slides = useMemo<Slide[]>(
    () => [
      {
        key: "ai",
        title: "Orbit AI ",
        body: "Previsão de superaquecimento e otimização de refrigeração em tempo real.",
        Icon: Brain,
      },
      {
        key: "sat",
        title: "Satélites + Clima",
        body: "Dados climáticos e heatmaps globais para decisões energéticas mais precisas.",
        Icon: Satellite,
      },
      {
        key: "cloud",
        title: "Monitoramento",
        body: "Observabilidade de datacenters em escala com alertas inteligentes e relatórios.",
        Icon: Cloud,
      },
      {
        key: "esg",
        title: "Sustentabilidade",
        body: "Redução de consumo e emissão com score sustentável e recomendações acionáveis.",
        Icon: Leaf,
      },
    ],
    [],
  );

  const scrollX = useSharedValue(0);
  const scrollRef = useRef<Animated.ScrollView>(null);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  const onStart = () => {
    completeOnboarding();
    router.replace("/login");
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[
          OrbitColors.deepBlack,
          "rgba(59,130,246,0.12)",
          OrbitColors.deepBlack,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Text style={styles.brand}>ORBIT X</Text>
        <Text style={styles.slogan}>
          Inteligência orbital para datacenters sustentáveis
        </Text>
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.slides}
      >
        {slides.map((s, idx) => (
          <View key={s.key} style={[styles.slide, { width }]}>
            <PremiumCard>
              <View style={styles.slideTop}>
                <View style={styles.iconWrap}>
                  <s.Icon size={20} color={OrbitColors.spaceBlue} />
                </View>
                <Text style={styles.title}>{s.title}</Text>
                <Text style={styles.body}>{s.body}</Text>
              </View>
              <ProgressDots
                count={slides.length}
                index={idx}
                scrollX={scrollX}
              />
            </PremiumCard>
          </View>
        ))}
      </Animated.ScrollView>

      <View style={styles.footer}>
        <OrbitButton label="Iniciar Monitoramento" onPress={onStart} />
        <Text style={styles.note}>Deslize para explorar a plataforma</Text>
      </View>
    </View>
  );
}

function ProgressDots({
  count,
  scrollX,
}: {
  count: number;
  index: number;
  scrollX: SharedValue<number>;
}) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: count }).map((_, i) => (
        <Dot key={`d-${i}`} i={i} scrollX={scrollX} />
      ))}
    </View>
  );
}

function Dot({ i, scrollX }: { i: number; scrollX: SharedValue<number> }) {
  const anim = useAnimatedStyle(() => {
    const x = scrollX.value / width;
    const opacity = interpolate(x, [i - 1, i, i + 1], [0.35, 1, 0.35]);
    const scale = interpolate(x, [i - 1, i, i + 1], [1, 1.35, 1]);
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return <Animated.View style={[styles.dot, anim]} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: OrbitColors.deepBlack,
  },
  header: {
    paddingTop: 66,
    paddingHorizontal: 22,
    paddingBottom: 20,
  },
  brand: {
    color: OrbitColors.softWhite,
    fontFamily: "Inter_700Bold",
    letterSpacing: 3.6,
    fontSize: 18,
  },
  slogan: {
    marginTop: 10,
    color: OrbitColors.premiumGray,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
  },
  slides: {
    paddingVertical: 10,
  },
  slide: {
    paddingHorizontal: 22,
  },
  slideTop: {
    minHeight: 210,
    justifyContent: "center",
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59,130,246,0.10)",
    borderColor: "rgba(59,130,246,0.22)",
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 14,
  },
  title: {
    color: OrbitColors.softWhite,
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    letterSpacing: 0.2,
  },
  body: {
    marginTop: 10,
    color: OrbitColors.premiumGray,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
  },
  dots: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: OrbitColors.softWhite,
  },
  footer: {
    paddingHorizontal: 22,
    paddingBottom: 22,
    marginTop: "auto",
  },
  note: {
    marginTop: 12,
    textAlign: "center",
    color: "rgba(154,164,178,0.8)",
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
});
=======
import { LinearGradient } from "expo-linear-gradient";import { useRouter } from "expo-router";import { Brain, Cloud, Leaf, Satellite } from "lucide-react-native";import React, { useMemo, useRef } from "react";import { Dimensions, StyleSheet, Text, View } from "react-native";import type { SharedValue } from "react-native-reanimated";import Animated, {    interpolate,    useAnimatedScrollHandler,    useAnimatedStyle,    useSharedValue,} from "react-native-reanimated";import { OrbitButton } from "../components/OrbitButton";import { PremiumCard } from "../components/PremiumCard";import { OrbitColors } from "../constants/Colors";import { useAuthStore } from "../store/auth";const { width } = Dimensions.get("window");type Slide = {  key: string;  title: string;  body: string;  Icon: React.ComponentType<{ size?: number; color?: string }>;};export default function OnboardingScreen() {  const router = useRouter();  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);  const slides = useMemo<Slide[]>(    () => [      {        key: "ai",        title: "Orbit AI ",        body: "Previsão de superaquecimento e otimização de refrigeração em tempo real.",        Icon: Brain,      },      {        key: "sat",        title: "Satélites + Clima",        body: "Dados climáticos e heatmaps globais para decisões energéticas mais precisas.",        Icon: Satellite,      },      {        key: "cloud",        title: "Cloud Monitoring",        body: "Observabilidade de datacenters em escala com alertas inteligentes e relatórios.",        Icon: Cloud,      },      {        key: "esg",        title: "Sustentabilidade",        body: "Redução de consumo e emissão com score sustentável e recomendações acionáveis.",        Icon: Leaf,      },    ],    [],  );  const scrollX = useSharedValue(0);  const scrollRef = useRef<Animated.ScrollView>(null);  const onScroll = useAnimatedScrollHandler({    onScroll: (e) => {      scrollX.value = e.contentOffset.x;    },  });  const onStart = () => {    completeOnboarding();    router.replace("/login");  };  return (    <View style={styles.root}>      <LinearGradient        colors={[          OrbitColors.deepBlack,          "rgba(59,130,246,0.12)",          OrbitColors.deepBlack,        ]}        start={{ x: 0, y: 0 }}        end={{ x: 1, y: 1 }}        style={StyleSheet.absoluteFill}      />      <View style={styles.header}>        <Text style={styles.brand}>ORBIT X</Text>        <Text style={styles.slogan}>          Inteligência orbital para datacenters sustentáveis        </Text>      </View>      <Animated.ScrollView        ref={scrollRef}        horizontal        pagingEnabled        showsHorizontalScrollIndicator={false}        onScroll={onScroll}        scrollEventThrottle={16}        contentContainerStyle={styles.slides}      >        {slides.map((s, idx) => (          <View key={s.key} style={[styles.slide, { width }]}>            <PremiumCard>              <View style={styles.slideTop}>                <View style={styles.iconWrap}>                  <s.Icon size={20} color={OrbitColors.spaceBlue} />                </View>                <Text style={styles.title}>{s.title}</Text>                <Text style={styles.body}>{s.body}</Text>              </View>              <ProgressDots                count={slides.length}                index={idx}                scrollX={scrollX}              />            </PremiumCard>          </View>        ))}      </Animated.ScrollView>      <View style={styles.footer}>        <OrbitButton label="Iniciar Monitoramento" onPress={onStart} />        <Text style={styles.note}>Deslize para explorar a plataforma</Text>      </View>    </View>  );}function ProgressDots({  count,  scrollX,}: {  count: number;  index: number;  scrollX: SharedValue<number>;}) {  return (    <View style={styles.dots}>      {Array.from({ length: count }).map((_, i) => (        <Dot key={`d-${i}`} i={i} scrollX={scrollX} />      ))}    </View>  );}function Dot({ i, scrollX }: { i: number; scrollX: SharedValue<number> }) {  const anim = useAnimatedStyle(() => {    const x = scrollX.value / width;    const opacity = interpolate(x, [i - 1, i, i + 1], [0.35, 1, 0.35]);    const scale = interpolate(x, [i - 1, i, i + 1], [1, 1.35, 1]);    return {      opacity,      transform: [{ scale }],    };  });  return <Animated.View style={[styles.dot, anim]} />;}const styles = StyleSheet.create({  root: {    flex: 1,    backgroundColor: OrbitColors.deepBlack,  },  header: {    paddingTop: 66,    paddingHorizontal: 22,    paddingBottom: 20,  },  brand: {    color: OrbitColors.softWhite,    fontFamily: "Inter_700Bold",    letterSpacing: 3.6,    fontSize: 18,  },  slogan: {    marginTop: 10,    color: OrbitColors.premiumGray,    fontFamily: "Inter_400Regular",    fontSize: 13,    lineHeight: 18,  },  slides: {    paddingVertical: 10,  },  slide: {    paddingHorizontal: 22,  },  slideTop: {    minHeight: 210,    justifyContent: "center",  },  iconWrap: {    width: 42,    height: 42,    borderRadius: 999,    alignItems: "center",    justifyContent: "center",    backgroundColor: "rgba(59,130,246,0.10)",    borderColor: "rgba(59,130,246,0.22)",    borderWidth: StyleSheet.hairlineWidth,    marginBottom: 14,  },  title: {    color: OrbitColors.softWhite,    fontFamily: "Inter_700Bold",    fontSize: 20,    letterSpacing: 0.2,  },  body: {    marginTop: 10,    color: OrbitColors.premiumGray,    fontFamily: "Inter_400Regular",    fontSize: 13,    lineHeight: 18,  },  dots: {    flexDirection: "row",    gap: 10,    marginTop: 18,  },  dot: {    width: 6,    height: 6,    borderRadius: 999,    backgroundColor: OrbitColors.softWhite,  },  footer: {    paddingHorizontal: 22,    paddingBottom: 22,    marginTop: "auto",  },  note: {    marginTop: 12,    textAlign: "center",    color: "rgba(154,164,178,0.8)",    fontFamily: "Inter_400Regular",    fontSize: 12,  },});
>>>>>>> renato/main
