import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, LIFT_COLORS } from '@/lib/constants';
import { useAppData } from '@/hooks/useAppData';
import { useCurrentProgram } from '@/hooks/useCurrentProgram';
import { getDateString, getEstimated1RM } from '@/lib/helpers';
import { Card, SectionLabel } from '@/components/Card';
import { BenchmarkTable } from '@/components/BenchmarkTable';
import { ProgressBar } from '@/components/ProgressBar';
import { exportData } from '@/lib/storage';
import type { LiftType, DailyEntry, LiftEntry } from '@/types';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });
const screenWidth = Dimensions.get('window').width - 48;

const chartConfig = {
  backgroundGradientFrom: COLORS.card,
  backgroundGradientTo: COLORS.card,
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(255, 59, 59, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(136, 136, 136, ${opacity})`,
  propsForDots: { r: '3', strokeWidth: '1' },
  propsForBackgroundLines: { stroke: COLORS.border, strokeDasharray: '' },
  propsForLabels: { fontFamily: mono, fontSize: 9 },
  strokeWidth: 2,
};

function EmptyChart({ message, height = 180 }: { message: string; height?: number }) {
  return (
    <View style={[styles.emptyChart, { height }]}>
      <Text style={styles.emptyChartText}>{message}</Text>
    </View>
  );
}

export default function ProgressScreen() {
  const { data, loading, resetAllData } = useAppData();
  const insets = useSafeAreaInsets();
  const [liftChartType, setLiftChartType] = useState<LiftType>('squat');
  const [weightRange, setWeightRange] = useState<'30d' | 'all'>('30d');

  const programStart = data?.settings?.programStart || '2026-04-14';
  const program = useCurrentProgram(programStart);

  // Weight data sorted by date
  const allWeightEntries = useMemo(
    () =>
      data
        ? Object.values(data.entries)
            .filter(e => e.weight != null)
            .sort((a, b) => a.date.localeCompare(b.date))
        : [],
    [data]
  );

  const weightData = useMemo(() => {
    return weightRange === '30d' ? allWeightEntries.slice(-30) : allWeightEntries;
  }, [allWeightEntries, weightRange]);

  const liftData = useMemo(() => {
    if (!data) return [] as LiftEntry[];
    return data.lifts
      .filter(l => l.type === liftChartType)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data, liftChartType]);

  // Last 14 days stats
  const last14DaysStats = useMemo(() => {
    const results = {
      daysLogged: 0,
      daysTrained: 0,
      stepsTarget: 0,
      proteinTarget: 0,
      sleepTarget: 0,
    };
    if (!data) return results;

    const today = new Date();
    const trainedDates = new Set<string>();
    data.lifts.forEach(l => trainedDates.add(l.date));

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = getDateString(d);
      const entry = data.entries[key];

      if (entry && Object.keys(entry).length > 1) {
        results.daysLogged++;
      }
      if (trainedDates.has(key)) {
        results.daysTrained++;
      }
      if (entry?.steps && entry.steps >= 8000) results.stepsTarget++;
      if (entry?.protein && entry.protein >= 220) results.proteinTarget++;
      if (entry?.sleep && entry.sleep >= 7) results.sleepTarget++;
    }

    return results;
  }, [data]);

  // Weekly summary (last 7 days)
  const weeklySummary = useMemo(() => {
    const empty = {
      weight: null as number | null,
      calories: null as number | null,
      protein: null as number | null,
      sleep: null as number | null,
      recovery: null as number | null,
      energy: null as number | null,
      mood: null as number | null,
      sessions: 0,
      weightChange: null as number | null,
    };
    if (!data) return empty;

    const today = new Date();
    const current: DailyEntry[] = [];
    const previous: DailyEntry[] = [];

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = getDateString(d);
      const entry = data.entries[key];
      if (entry) {
        if (i < 7) current.push(entry);
        else previous.push(entry);
      }
    }

    const avg = (arr: DailyEntry[], field: keyof DailyEntry): number | null => {
      const vals = arr.map(e => e[field]).filter(v => typeof v === 'number') as number[];
      if (vals.length === 0) return null;
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    };

    const trainedDates = new Set<string>();
    data.lifts.forEach(l => trainedDates.add(l.date));

    let sessions = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (trainedDates.has(getDateString(d))) sessions++;
    }

    const curWeight = avg(current, 'weight');
    const prevWeight = avg(previous, 'weight');

    return {
      weight: curWeight,
      calories: avg(current, 'calories'),
      protein: avg(current, 'protein'),
      sleep: avg(current, 'sleep'),
      recovery: avg(current, 'recovery'),
      energy: avg(current, 'energy'),
      mood: avg(current, 'mood'),
      sessions,
      weightChange: curWeight != null && prevWeight != null ? curWeight - prevWeight : null,
    };
  }, [data]);

  // Build chart data for weight
  const weightChartData = useMemo(() => {
    if (weightData.length < 2) return null;
    const labels = weightData.map((e, i) => {
      if (i === 0 || i === weightData.length - 1 || i === Math.floor(weightData.length / 2)) {
        const d = new Date(e.date + 'T00:00:00');
        return `${d.getMonth() + 1}/${d.getDate()}`;
      }
      return '';
    });
    const values = weightData.map(e => e.weight!);

    return {
      labels,
      datasets: [
        {
          data: values,
          color: () => COLORS.primary,
          strokeWidth: 2,
        },
      ],
    };
  }, [weightData]);

  const liftChartData = useMemo(() => {
    if (liftData.length < 2) return null;
    const color = LIFT_COLORS[liftChartType];
    const labels = liftData.map((l, i) => {
      if (i === 0 || i === liftData.length - 1 || i === Math.floor(liftData.length / 2)) {
        const d = new Date(l.date + 'T00:00:00');
        return `${d.getMonth() + 1}/${d.getDate()}`;
      }
      return '';
    });
    const weights = liftData.map(l => l.weight);
    const e1rms = liftData.map(l => l.e1rm || getEstimated1RM(l.weight, l.reps));

    return {
      labels,
      datasets: [
        { data: weights, color: () => color, strokeWidth: 2 },
        { data: e1rms, color: () => `${color}88`, strokeWidth: 1.5 },
      ],
      legend: ['Weight', 'E1RM'],
    };
  }, [liftData, liftChartType]);

  if (loading || !data) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const { week, benchmark } = program;

  const handleExport = async () => {
    try {
      const json = await exportData();
      await Share.share({
        message: json,
        title: 'THE GRIND — Data Export',
      });
    } catch (e) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all entries, lifts, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetAllData();
            Alert.alert('Data Reset', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  const liftBenchmark =
    liftChartType === 'squat' ? benchmark.sq : liftChartType === 'bench' ? benchmark.bn : benchmark.dl;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>PROGRESS</Text>

        {/* Weight Trend */}
        <View style={styles.headerRow}>
          <SectionLabel>WEIGHT TREND</SectionLabel>
          <View style={styles.rangeRow}>
            <TouchableOpacity
              onPress={() => setWeightRange('30d')}
              style={[styles.rangeBtn, weightRange === '30d' && styles.rangeBtnActive]}
            >
              <Text
                style={[styles.rangeBtnText, weightRange === '30d' && styles.rangeBtnTextActive]}
              >
                30D
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setWeightRange('all')}
              style={[styles.rangeBtn, weightRange === 'all' && styles.rangeBtnActive]}
            >
              <Text
                style={[styles.rangeBtnText, weightRange === 'all' && styles.rangeBtnTextActive]}
              >
                ALL
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Card delay={0}>
          {weightChartData ? (
            <View>
              <LineChart
                data={weightChartData}
                width={screenWidth}
                height={180}
                chartConfig={chartConfig}
                bezier
                style={{ marginLeft: -16, borderRadius: 8 }}
                withInnerLines
                withOuterLines={false}
                fromZero={false}
              />
              <View style={styles.chartLegend}>
                <Text style={styles.legendItem}>
                  <Text style={{ color: COLORS.primary }}>— </Text>Weight
                </Text>
                <Text style={styles.legendItem}>
                  Benchmark: {benchmark.bw}kg | Goal: 100kg
                </Text>
              </View>
            </View>
          ) : (
            <EmptyChart message="Log at least 2 weight entries to see trend" />
          )}
        </Card>

        {/* Lift Trend */}
        <SectionLabel>LIFT TREND</SectionLabel>
        <View style={styles.pillRow}>
          {(['squat', 'bench', 'deadlift'] as LiftType[]).map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setLiftChartType(t)}
              style={[
                styles.liftTabBtn,
                {
                  backgroundColor: liftChartType === t ? LIFT_COLORS[t] : 'transparent',
                  borderColor: LIFT_COLORS[t],
                },
              ]}
            >
              <Text
                style={[
                  styles.liftTabText,
                  { color: liftChartType === t ? '#000' : LIFT_COLORS[t] },
                ]}
              >
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Card delay={50}>
          {liftChartData ? (
            <View>
              <LineChart
                data={liftChartData}
                width={screenWidth}
                height={180}
                chartConfig={{
                  ...chartConfig,
                  color: () => LIFT_COLORS[liftChartType],
                }}
                bezier
                style={{ marginLeft: -16, borderRadius: 8 }}
                withInnerLines
                withOuterLines={false}
                fromZero={false}
              />
              <View style={styles.chartLegend}>
                <Text style={styles.legendItem}>
                  <Text style={{ color: LIFT_COLORS[liftChartType] }}>— </Text>Weight
                </Text>
                <Text style={styles.legendItem}>
                  Benchmark: {liftBenchmark}kg
                </Text>
              </View>
            </View>
          ) : (
            <EmptyChart message={`Log at least 2 ${liftChartType} entries to see trend`} />
          )}
        </Card>

        {/* Benchmarks Table */}
        <SectionLabel>MONTHLY BENCHMARKS</SectionLabel>
        <Card delay={100}>
          <BenchmarkTable currentWeek={week} />
        </Card>

        {/* Consistency Scorecard */}
        <SectionLabel>CONSISTENCY — LAST 14 DAYS</SectionLabel>
        <Card delay={150}>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Days logged</Text>
            <Text style={styles.scoreValue}>{last14DaysStats.daysLogged}/14</Text>
          </View>
          <ProgressBar progress={last14DaysStats.daysLogged / 14} color={COLORS.primary} />

          <View style={[styles.scoreRow, { marginTop: 12 }]}>
            <Text style={styles.scoreLabel}>Days trained</Text>
            <Text style={styles.scoreValue}>{last14DaysStats.daysTrained}/14</Text>
          </View>
          <ProgressBar progress={last14DaysStats.daysTrained / 14} color={COLORS.squat} />

          <View style={[styles.scoreRow, { marginTop: 12 }]}>
            <Text style={styles.scoreLabel}>Steps ≥ 8,000</Text>
            <Text style={styles.scoreValue}>{last14DaysStats.stepsTarget}/14</Text>
          </View>
          <ProgressBar progress={last14DaysStats.stepsTarget / 14} color={COLORS.success} />

          <View style={[styles.scoreRow, { marginTop: 12 }]}>
            <Text style={styles.scoreLabel}>Protein ≥ 220g</Text>
            <Text style={styles.scoreValue}>{last14DaysStats.proteinTarget}/14</Text>
          </View>
          <ProgressBar progress={last14DaysStats.proteinTarget / 14} color={COLORS.bench} />

          <View style={[styles.scoreRow, { marginTop: 12 }]}>
            <Text style={styles.scoreLabel}>Sleep ≥ 7hrs</Text>
            <Text style={styles.scoreValue}>{last14DaysStats.sleepTarget}/14</Text>
          </View>
          <ProgressBar progress={last14DaysStats.sleepTarget / 14} color={COLORS.deadlift} />
        </Card>

        {/* Weekly Summary */}
        <SectionLabel>THIS WEEK</SectionLabel>
        <Card delay={200}>
          <View style={styles.summaryGrid}>
            <SummaryItem
              label="AVG WEIGHT"
              value={weeklySummary.weight ? `${weeklySummary.weight.toFixed(1)}kg` : '--'}
            />
            <SummaryItem
              label="WEIGHT Δ"
              value={
                weeklySummary.weightChange != null
                  ? `${weeklySummary.weightChange > 0 ? '+' : ''}${weeklySummary.weightChange.toFixed(1)}kg`
                  : '--'
              }
              color={
                weeklySummary.weightChange != null && weeklySummary.weightChange < 0
                  ? COLORS.success
                  : undefined
              }
            />
            <SummaryItem
              label="AVG KCAL"
              value={weeklySummary.calories ? Math.round(weeklySummary.calories).toString() : '--'}
            />
            <SummaryItem
              label="AVG PROTEIN"
              value={weeklySummary.protein ? `${Math.round(weeklySummary.protein)}g` : '--'}
            />
            <SummaryItem
              label="AVG SLEEP"
              value={weeklySummary.sleep ? `${weeklySummary.sleep.toFixed(1)}h` : '--'}
            />
            <SummaryItem label="SESSIONS" value={`${weeklySummary.sessions}/7`} />
            <SummaryItem
              label="AVG RECOVERY"
              value={weeklySummary.recovery ? `${weeklySummary.recovery.toFixed(1)}` : '--'}
            />
            <SummaryItem
              label="AVG ENERGY"
              value={weeklySummary.energy ? `${weeklySummary.energy.toFixed(1)}` : '--'}
            />
            <SummaryItem
              label="AVG MOOD"
              value={weeklySummary.mood ? `${weeklySummary.mood.toFixed(1)}` : '--'}
            />
          </View>
        </Card>

        {/* Data Management */}
        <SectionLabel>DATA</SectionLabel>
        <Card delay={250}>
          <TouchableOpacity style={styles.ghostBtn} onPress={handleExport}>
            <Text style={styles.ghostBtnText}>EXPORT DATA</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ghostBtn, { borderColor: COLORS.danger, marginTop: 8 }]}
            onPress={handleReset}
          >
            <Text style={[styles.ghostBtnText, { color: COLORS.danger }]}>RESET ALL DATA</Text>
          </TouchableOpacity>
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function SummaryItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, color ? { color } : undefined]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontFamily: mono,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 100,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
    fontFamily: mono,
    letterSpacing: 3,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 4,
  },
  rangeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.ghostBorder,
    borderRadius: 4,
  },
  rangeBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rangeBtnText: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontFamily: mono,
    fontWeight: '700',
    letterSpacing: 1,
  },
  rangeBtnTextActive: {
    color: '#fff',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  legendItem: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontFamily: mono,
  },
  pillRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 6,
  },
  liftTabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  liftTabText: {
    fontSize: 11,
    fontFamily: mono,
    fontWeight: '700',
    letterSpacing: 1,
  },
  emptyChart: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChartText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: mono,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  scoreLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: mono,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreValue: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontFamily: mono,
    fontWeight: '700',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '33%',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 9,
    color: COLORS.label,
    fontFamily: mono,
    letterSpacing: 1,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: mono,
  },
  ghostBtn: {
    borderWidth: 1,
    borderColor: COLORS.ghostBorder,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ghostBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.ghostText,
    fontFamily: mono,
    letterSpacing: 1.5,
  },
});
