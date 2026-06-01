// app/(tabs)/reports.tsx
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import {
  Download,
  Share2,
  TrendingDown,
  Leaf,
  Zap,
  Award,
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';

import { AIRecommendationCard } from '../../components/AIRecommendationCard';
import { AnimatedHeader } from '../../components/AnimatedHeader';
import { EnergyChart } from '../../components/EnergyChart';
import { OrbitButton } from '../../components/OrbitButton';
import { PremiumCard } from '../../components/PremiumCard';
import { OrbitColors } from '../../constants/Colors';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Period = '7d' | '30d' | '90d';

type ESGMetric = {
  id: string;
  label: string;
  value: string;
  subValue: string;
  delta: string;
  positive: boolean;
  icon: React.ReactNode;
};

// ─── Dados por período ────────────────────────────────────────────────────────

const PERIOD_DATA: Record<Period, {
  label: string;
  score: string;
  scoreTone: string;
  carbonReduction: string;
  energySaving: string;
  series: number[];
  seriesBefore: number[];
}> = {
  '7d': {
    label: 'Últimos 7 dias',
    score: 'A+',
    scoreTone: OrbitColors.neonGreen,
    carbonReduction: '18%',
    energySaving: '12%',
    series:       [420, 435, 428, 441, 415, 408, 412, 419, 430, 422, 410, 418, 425, 416],
    seriesBefore: [480, 495, 488, 501, 475, 468, 472, 479, 490, 482, 470, 478, 485, 476],
  },
  '30d': {
    label: 'Últimos 30 dias',
    score: 'A',
    scoreTone: OrbitColors.spaceBlue,
    carbonReduction: '14%',
    energySaving: '9%',
    series:       [440, 455, 448, 461, 435, 428, 432, 439, 450, 442, 430, 438, 445, 436],
    seriesBefore: [510, 525, 518, 531, 505, 498, 502, 509, 520, 512, 500, 508, 515, 506],
  },
  '90d': {
    label: 'Últimos 90 dias',
    score: 'B+',
    scoreTone: OrbitColors.warning,
    carbonReduction: '8%',
    energySaving: '5%',
    series:       [460, 475, 468, 481, 455, 448, 452, 459, 470, 462, 450, 458, 465, 456],
    seriesBefore: [530, 545, 538, 551, 525, 518, 522, 529, 540, 532, 520, 528, 535, 526],
  },
};

// ─── Sub-componente: Seletor de período ───────────────────────────────────────

const PeriodSelector = React.memo(function PeriodSelector({
  selected,
  onChange,
}: {
  selected: Period;
  onChange: (p: Period) => void;
}) {
  const PERIODS: { key: Period; label: string }[] = [
    { key: '7d',  label: '7 dias'  },
    { key: '30d', label: '30 dias' },
    { key: '90d', label: '90 dias' },
  ];

  return (
    <View style={styles.periodRow}>
      <Calendar size={13} color={OrbitColors.premiumGray} />
      <Text style={styles.periodLabel}>Período:</Text>
      {PERIODS.map(({ key, label }) => (
        <Pressable
          key={key}
          onPress={() => onChange(key)}
          style={[
            styles.periodChip,
            selected === key && styles.periodChipActive,
          ]}
        >
          <Text style={[
            styles.periodChipText,
            selected === key && styles.periodChipTextActive,
          ]}>
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
});

// ─── Sub-componente: Score card animado ───────────────────────────────────────

const ScoreCard = React.memo(function ScoreCard({
  score,
  scoreTone,
  carbonReduction,
  energySaving,
  series,
  seriesBefore,
}: {
  score: string;
  scoreTone: string;
  carbonReduction: string;
  energySaving: string;
  series: number[];
  seriesBefore: number[];
}) {
  const [showBefore, setShowBefore] = useState(false);

  // Estatísticas do gráfico ativo
  const activeSeries = showBefore ? seriesBefore : series;
  const avg = Math.round(activeSeries.reduce((a, b) => a + b, 0) / activeSeries.length);
  const min = Math.min(...activeSeries);
  const max = Math.max(...activeSeries);

  return (
    <PremiumCard>
      {/* Score + métricas */}
      <View style={styles.scoreRow}>
        <View style={styles.scoreLeft}>
          <Text style={styles.scoreLabel}>Pontuação Sustentável</Text>
          <View style={styles.scoreAwardRow}>
            <Award size={16} color={scoreTone} />
            <Text style={[styles.scoreValue, { color: scoreTone }]}>{score}</Text>
          </View>
        </View>

        <View style={styles.scoreMetrics}>
          <View style={styles.metricItem}>
            <View style={styles.metricIconWrap}>
              <Leaf size={12} color={OrbitColors.neonGreen} />
            </View>
            <View>
              <Text style={styles.metricValue}>-{carbonReduction}</Text>
              <Text style={styles.metricLabel}>CO₂</Text>
            </View>
          </View>
          <View style={styles.metricItem}>
            <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(59,130,246,0.12)', borderColor: 'rgba(59,130,246,0.28)' }]}>
              <Zap size={12} color={OrbitColors.spaceBlue} />
            </View>
            <View>
              <Text style={[styles.metricValue, { color: OrbitColors.spaceBlue }]}>-{energySaving}</Text>
              <Text style={styles.metricLabel}>Energia</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Toggle antes/depois */}
      <View style={styles.chartHeaderRow}>
        <View style={styles.chartLegend}>
          <View style={[styles.legendDot, { backgroundColor: showBefore ? OrbitColors.danger : OrbitColors.spaceBlue }]} />
          <Text style={styles.chartSubLabel}>
            {showBefore ? 'Antes da otimização' : 'Após otimização'}
          </Text>
        </View>
        <Pressable
          onPress={() => setShowBefore(v => !v)}
          style={styles.toggleBtn}
        >
          <BarChart3 size={12} color={OrbitColors.spaceBlue} />
          <Text style={styles.toggleText}>
            {showBefore ? 'Ver depois' : 'Ver antes'}
          </Text>
        </Pressable>
      </View>

      <EnergyChart points={activeSeries} />

      {/* Min / Med / Max */}
      <View style={styles.chartStats}>
        <View style={styles.chartStat}>
          <Text style={styles.chartStatLabel}>Mín</Text>
          <Text style={styles.chartStatValue}>{min} kW</Text>
        </View>
        <View style={[styles.chartStat, styles.chartStatCenter]}>
          <Text style={styles.chartStatLabel}>Média</Text>
          <Text style={styles.chartStatValue}>{avg} kW</Text>
        </View>
        <View style={styles.chartStat}>
          <Text style={styles.chartStatLabel}>Máx</Text>
          <Text style={[styles.chartStatValue, { color: OrbitColors.warning }]}>{max} kW</Text>
        </View>
      </View>
    </PremiumCard>
  );
});

// ─── Sub-componente: Métricas ESG expandíveis ─────────────────────────────────

const ESGBreakdown = React.memo(function ESGBreakdown({
  metrics,
}: {
  metrics: ESGMetric[];
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? metrics : metrics.slice(0, 3);

  return (
    <PremiumCard>
      <View style={styles.esgHeader}>
        <TrendingDown size={14} color={OrbitColors.neonGreen} />
        <Text style={styles.esgTitle}>Métricas ESG</Text>
      </View>

      {visible.map((m, i) => (
        <Animated.View
          key={m.id}
          entering={FadeInDown.duration(280).delay(i * 50)}
          style={[styles.esgRow, i < visible.length - 1 && styles.esgRowBorder]}
        >
          <View style={styles.esgIconWrap}>{m.icon}</View>
          <View style={styles.esgBody}>
            <Text style={styles.esgLabel}>{m.label}</Text>
            <Text style={styles.esgSub}>{m.subValue}</Text>
          </View>
          <View style={styles.esgRight}>
            <Text style={styles.esgValue}>{m.value}</Text>
            <Text style={[
              styles.esgDelta,
              { color: m.positive ? OrbitColors.neonGreen : OrbitColors.danger },
            ]}>
              {m.delta}
            </Text>
          </View>
        </Animated.View>
      ))}

      {metrics.length > 3 && (
        <Pressable
          onPress={() => setExpanded(v => !v)}
          style={styles.expandBtn}
        >
          {expanded
            ? <ChevronUp  size={14} color={OrbitColors.spaceBlue} />
            : <ChevronDown size={14} color={OrbitColors.spaceBlue} />
          }
          <Text style={styles.expandText}>
            {expanded ? 'Ver menos' : `Ver mais ${metrics.length - 3} métricas`}
          </Text>
        </Pressable>
      )}
    </PremiumCard>
  );
});

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ReportsScreen() {
  const [period, setPeriod] = useState<Period>('7d');
  const [exporting, setExporting] = useState(false);

  const data = PERIOD_DATA[period];

  // Simula exportação com estado de loading real no botão
  const handleExport = useCallback(async () => {
    setExporting(true);
    await new Promise(r => setTimeout(r, 1800)); // simula geração do PDF
    setExporting(false);
    Alert.alert(
      'Relatório exportado',
      `Relatório ESG (${data.label}) gerado com sucesso.\n\nArquivo: OrbitX_ESG_Report_${period}.pdf`,
      [{ text: 'OK' }]
    );
  }, [period, data.label]);

  // Share nativo — usa a API Share do React Native
  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        title: `OrbitX ESG Report — ${data.label}`,
        message: `OrbitX ESG Report — ${data.label}\n\nSustainable Score: ${data.score}\nRedução de carbono: ${data.carbonReduction}\nEconomia energética: ${data.energySaving}\n\nGerado via OrbitX`,
      });
    } catch {
      // usuário cancelou o share — não exibe erro
    }
  }, [data]);

  // Métricas ESG baseadas no período selecionado
  const esgMetrics: ESGMetric[] = useMemo(() => [
    {
      id: 'carbon',
      label: 'Emissão de carbono',
      value: '1.21 tCO₂e',
      subValue: `Meta: 1.10 tCO₂e  •  ${data.label}`,
      delta: `-${data.carbonReduction}`,
      positive: true,
      icon: <Leaf size={13} color={OrbitColors.neonGreen} />,
    },
    {
      id: 'energy',
      label: 'Consumo energético',
      value: '418 kW/h',
      subValue: `Baseline: 480 kW/h  •  ${data.label}`,
      delta: `-${data.energySaving}`,
      positive: true,
      icon: <Zap size={13} color={OrbitColors.spaceBlue} />,
    },
    {
      id: 'pue',
      label: 'PUE médio',
      value: '1.46',
      subValue: 'Meta: ≤ 1.40  •  Acima da meta',
      delta: '+0.06',
      positive: false,
      icon: <BarChart3 size={13} color={OrbitColors.warning} />,
    },
    {
      id: 'renewable',
      label: 'Energia renovável',
      value: '34%',
      subValue: 'Matriz elétrica BR-SP  •  Enel',
      delta: '+6pp',
      positive: true,
      icon: <Leaf size={13} color={OrbitColors.neonGreen} />,
    },
    {
      id: 'uptime',
      label: 'Disponibilidade',
      value: '99.97%',
      subValue: 'SLA tier IV  •  Nenhum incidente',
      delta: '0 ocorrências',
      positive: true,
      icon: <Award size={13} color={OrbitColors.softWhite} />,
    },
  ], [data.label, data.carbonReduction, data.energySaving]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[OrbitColors.deepBlack, 'rgba(34,197,94,0.07)', OrbitColors.deepBlack]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedHeader
          title="Reports"
          subtitle="Economia energética • ESG • comparativo antes/depois"
        />

        {/* ── Seletor de período ── */}
        <Animated.View entering={FadeInDown.duration(380)} style={styles.section}>
          <PeriodSelector selected={period} onChange={setPeriod} />
        </Animated.View>

        {/* ── Score card + gráfico ── */}
        <Animated.View entering={FadeInDown.duration(420).delay(60)} style={styles.section}>
          <ScoreCard
            score={data.score}
            scoreTone={data.scoreTone}
            carbonReduction={data.carbonReduction}
            energySaving={data.energySaving}
            series={data.series}
            seriesBefore={data.seriesBefore}
          />
        </Animated.View>

        {/* ── Métricas ESG expandíveis ── */}
        <Animated.View entering={FadeInDown.duration(420).delay(120)} style={styles.section}>
          <ESGBreakdown metrics={esgMetrics} />
        </Animated.View>

        {/* ── AI Insight ── */}
        <Animated.View entering={FadeInDown.duration(420).delay(180)} style={styles.section}>
          <AIRecommendationCard
            title="ESG Insight"
            impactLabel="-0.21 tCO₂e"
            body="Migrar cargas batch para janelas noturnas em regiões com menor fator de emissão e reduzir picos térmicos com pré-resfriamento inteligente. Zona B2 requer atenção: PUE 1.71 acima da meta corporativa."
          />
        </Animated.View>

        {/* ── Ações ── */}
        <Animated.View entering={FadeInDown.duration(420).delay(240)} style={styles.actionsRow}>
          <View style={styles.actionPrimary}>
            <OrbitButton
              label={exporting ? 'Gerando PDF…' : 'Exportar PDF'}
              onPress={handleExport}
              loading={exporting}
              style={{ shadowColor: OrbitColors.glowGreen }}
            />
          </View>
          <Pressable onPress={handleShare} style={styles.shareBtn}>
            <Share2 size={16} color={OrbitColors.softWhite} />
          </Pressable>
        </Animated.View>

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: OrbitColors.deepBlack },
  content: { paddingTop: 40, paddingHorizontal: 20, paddingBottom: 0 },
  section: { marginBottom: 14 },

  // Período
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  periodLabel: {
    color: OrbitColors.premiumGray,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  periodChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  periodChipActive: {
    backgroundColor: 'rgba(59,130,246,0.18)',
    borderColor: OrbitColors.spaceBlue,
  },
  periodChipText: {
    color: OrbitColors.premiumGray,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  periodChipTextActive: {
    color: OrbitColors.softWhite,
  },

  // Score card
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  scoreLeft: { flex: 1 },
  scoreLabel: {
    color: OrbitColors.premiumGray,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    marginBottom: 6,
  },
  scoreAwardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 40,
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  scoreMetrics: {
    gap: 10,
    alignItems: 'flex-end',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(34,197,94,0.28)',
  },
  metricValue: {
    color: OrbitColors.neonGreen,
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
  },
  metricLabel: {
    color: OrbitColors.premiumGray,
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 14,
  },

  // Chart
  chartHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  chartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 6, height: 6, borderRadius: 999,
  },
  chartSubLabel: {
    color: OrbitColors.premiumGray,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(59,130,246,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(59,130,246,0.30)',
  },
  toggleText: {
    color: OrbitColors.spaceBlue,
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  chartStats: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  chartStat: { flex: 1 },
  chartStatCenter: {
    alignItems: 'center',
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  chartStatLabel: {
    color: OrbitColors.premiumGray,
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.06,
    marginBottom: 2,
  },
  chartStatValue: {
    color: OrbitColors.softWhite,
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
  },

  // ESG Breakdown
  esgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  esgTitle: {
    color: OrbitColors.softWhite,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    flex: 1,
  },
  esgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
  },
  esgRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  esgIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  esgBody: { flex: 1 },
  esgLabel: {
    color: OrbitColors.softWhite,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  esgSub: {
    color: OrbitColors.premiumGray,
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    marginTop: 2,
  },
  esgRight: { alignItems: 'flex-end' },
  esgValue: {
    color: OrbitColors.softWhite,
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
  },
  esgDelta: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    marginTop: 2,
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  expandText: {
    color: OrbitColors.spaceBlue,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },

  // Ações
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  actionPrimary: { flex: 1 },
  shareBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
});