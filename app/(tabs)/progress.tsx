import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppData } from '@/hooks/useAppData';
import { useCurrentProgram } from '@/hooks/useCurrentProgram';
import { COLORS, BENCHMARKS_REALISTIC, BENCHMARKS_STRETCH } from '@/lib/constants';
import { getBestE1RM, getDateString, formatNumber } from '@/lib/helpers';
import { Card, SectionLabel } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { MiniChart } from '@/components/MiniChart';
import { BenchmarkTable } from '@/components/BenchmarkTable';
import type { LiftType } from '@/types';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

const LIFT_DEFS: { key: LiftType; label: string; color: string; benchKey: 'sq' | 'bn' | 'dl' }[] = [
  { key: 'squat', label: 'SQUAT', color: COLORS.squat, benchKey: 'sq' },
  { key: 'bench', label: 'BENCH', color: COLORS.bench, benchKey: 'bn' },
  { key: 'deadlift', label: 'DEADLIFT', color: COLORS.deadlift, benchKey: 'dl' },
];

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { data, loading, refresh } = useAppData();
  const [refreshing, setRefreshing] = useState(false);

  const programStart = data?.settings?.programStart ?? '2026-04-14';
  const showStretch = data?.settings?.showStretchTargets ?? false;

  const { week, benchmark } = useCurrentProgram(programStart, showStretch);

  const weightHistory = useMemo(() => {
    if (!data) return [] as number[];
    return Object.values(data.entries)
      .filter(e => e.weight != null)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(e => e.weight!);
  }, [data]);

  const latestWeight = useMemo(() => {
    if (!data) return 130;
    const withW = Object.values(data.entries)
      .filter(e => e.weight != null)
      .sort((a, b) => b.date.localeCompare(a.date));
    return withW.length > 0 ? withW[0].weight! : data.profile.startingWeight;
  }, [data]);

  const liftProgress = useMemo(() => {
    if (!data) return LIFT_DEFS.map(l => ({ ...l, best: 0, weeklyBests: [] as number[] }));
    return LIFT_DEFS.map(lift => {
      const best = getBestE1RM(data.sets, lift.key);
      const weeklyBests: number[] = [];
      for (let w = 1; w <= week; w++) {
        const weekSets = data.sets.filter(s => s.week === w && s.liftType === lift.key && s.isMain);
        if (weekSets.length > 0) {
          const maxE1rm = Math.max(...weekSets.map(s => s.e1rm || 0));
          if (maxE1rm > 0) weeklyBests.push(maxE1rm);
        }
      }
      return { ...lift, best, weeklyBests };
    });
  }, [data, week]);

  const totalE1RM = useMemo(() => {
    return liftProgress.reduce((sum, l) => sum + l.best, 0);
  }, [liftProgress]);

  const calorieHistory = useMemo(() => {
    if (!data) return [] as number[];
    return Object.values(data.entries)
      .filter(e => e.calories != null && e.calories! > 0)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-28)
      .map(e => e.calories!);
  }, [data]);

  const avgCalories = useMemo(() => {
    if (calorieHistory.length === 0) return 0;
    return Math.round(calorieHistory.reduce((a, b) => a + b, 0) / calorieHistory.length);
  }, [calorieHistory]);

  const sleepHistory = useMemo(() => {
    if (!data) return [] as number[];
    return Object.values(data.entries)
      .filter(e => e.sleep != null)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14)
      .map(e => e.sleep!);
  }, [data]);

  const avgSleep = useMemo(() => {
    if (sleepHistory.length === 0) return 0;
    return +(sleepHistory.reduce((a, b) => a + b, 0) / sleepHistory.length).toFixed(1);
  }, [sleepHistory]);

  const totalSessions = useMemo(() => {
    if (!data) return 0;
    return data.sessions.filter(s => s.completed).length;
  }, [data]);

  const totalSets = useMemo(() => {
    if (!data) return 0;
    return data.sets.filter(s => !s.isWarmup).length;
  }, [data]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  if (loading || !data) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 80 }} />
      </View>
    );
  }

  const benchmarks = showStretch ? BENCHMARKS_STRETCH : BENCHMARKS_REALISTIC;
  const finalBench = benchmarks[benchmarks.length - 1];
  const finalTotal = finalBench.sq + finalBench.bn + finalBench.dl;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />
        }
      >
        <Text style={styles.screenTitle}>PROGRESS</Text>
        <Text style={styles.meta}>Week {week} / 32</Text>

        <ProgressBar progress={week / 32} color={COLORS.primary} height={6} showLabel label={`${Math.round((week / 32) * 100)}% complete`} />

        {/* Stats Overview */}
        <SectionLabel>STATS</SectionLabel>
        <Card delay={50}>
          <View style={styles.statsGrid}>
            <StatBox label="SESSIONS" value={String(totalSessions)} />
            <StatBox label="TOTAL SETS" value={formatNumber(totalSets)} />
            <StatBox label="WEEK" value={`${week}/32`} />
            <StatBox label="AVG KCAL" value={avgCalories > 0 ? formatNumber(avgCalories) : '--'} />
          </View>
        </Card>

        {/* Bodyweight Trend */}
        <SectionLabel>BODYWEIGHT TREND</SectionLabel>
        <Card delay={100}>
          <View style={styles.trendRow}>
            <View>
              <Text style={styles.trendValue}>{latestWeight.toFixed(1)} kg</Text>
              <Text style={styles.trendSub}>Current</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.trendTarget}>{benchmark.bw} kg</Text>
              <Text style={styles.trendSub}>Week {week} Target</Text>
            </View>
          </View>
          {weightHistory.length > 2 && (
            <View style={styles.chartContainer}>
              <MiniChart data={weightHistory.slice(-28)} color={COLORS.primary} height={60} width={300} />
            </View>
          )}
          <ProgressBar
            progress={130 > 100 ? Math.max(0, Math.min(1, (130 - latestWeight) / (130 - 100))) : 0}
            color={COLORS.primary}
            height={4}
            showLabel
            label={`130 -> ${finalBench.bw} kg`}
          />
        </Card>

        {/* Lift E1RM Progress */}
        <SectionLabel>LIFT E1RM PROGRESS</SectionLabel>
        {liftProgress.map(lift => (
          <Card key={lift.key} delay={150} borderColor={lift.color}>
            <View style={styles.liftHeader}>
              <Text style={[styles.liftName, { color: lift.color }]}>{lift.label}</Text>
              <Text style={styles.liftBest}>
                {lift.best > 0 ? `${lift.best} kg` : '--'}
              </Text>
            </View>
            <Text style={styles.liftTargetText}>
              Week {week} target: {benchmark[lift.benchKey]} kg
              {lift.best > 0 ? ` (${Math.round((lift.best / benchmark[lift.benchKey]) * 100)}%)` : ''}
            </Text>
            {lift.weeklyBests.length > 1 && (
              <View style={styles.chartContainer}>
                <MiniChart data={lift.weeklyBests} color={lift.color} height={40} width={280} />
              </View>
            )}
            <ProgressBar
              progress={finalBench[lift.benchKey] > 0 ? lift.best / finalBench[lift.benchKey] : 0}
              color={lift.color}
              height={4}
              showLabel
              label={`0 -> ${finalBench[lift.benchKey]} kg`}
            />
          </Card>
        ))}

        {/* Estimated Total */}
        <SectionLabel>ESTIMATED TOTAL</SectionLabel>
        <Card delay={200}>
          <View style={styles.trendRow}>
            <View>
              <Text style={[styles.trendValue, { color: COLORS.primary }]}>
                {totalE1RM > 0 ? `${totalE1RM} kg` : '--'}
              </Text>
              <Text style={styles.trendSub}>SQ + BN + DL</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.trendTarget}>{finalTotal} kg</Text>
              <Text style={styles.trendSub}>Final Target</Text>
            </View>
          </View>
          <ProgressBar
            progress={totalE1RM > 0 ? totalE1RM / finalTotal : 0}
            color={COLORS.primary}
            height={5}
            showLabel
            label={`${totalE1RM > 0 ? Math.round((totalE1RM / finalTotal) * 100) : 0}% of ${finalTotal}`}
          />
        </Card>

        {/* Sleep */}
        {sleepHistory.length > 0 && (
          <>
            <SectionLabel>SLEEP</SectionLabel>
            <Card delay={250}>
              <View style={styles.trendRow}>
                <View>
                  <Text style={styles.trendValue}>{avgSleep}h</Text>
                  <Text style={styles.trendSub}>Avg (last 14d)</Text>
                </View>
              </View>
              {sleepHistory.length > 2 && (
                <View style={styles.chartContainer}>
                  <MiniChart data={sleepHistory} color={COLORS.success} height={40} width={280} />
                </View>
              )}
            </Card>
          </>
        )}

        {/* Calorie Trend */}
        {calorieHistory.length > 0 && (
          <>
            <SectionLabel>CALORIE TREND (28D)</SectionLabel>
            <Card delay={300}>
              <View style={styles.trendRow}>
                <View>
                  <Text style={[styles.trendValue, { color: COLORS.caloriesIn }]}>{formatNumber(avgCalories)}</Text>
                  <Text style={styles.trendSub}>Avg kcal/day</Text>
                </View>
              </View>
              {calorieHistory.length > 2 && (
                <View style={styles.chartContainer}>
                  <MiniChart data={calorieHistory} color={COLORS.caloriesIn} height={40} width={280} />
                </View>
              )}
            </Card>
          </>
        )}

        {/* Benchmark Table */}
        <SectionLabel>BENCHMARK TABLE</SectionLabel>
        <BenchmarkTable currentWeek={week} stretch={showStretch} />
      </ScrollView>
    </View>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  screenTitle: { fontSize: 24, fontWeight: '900', color: COLORS.textPrimary, fontFamily: mono, letterSpacing: 3, marginTop: 12 },
  meta: { fontSize: 11, color: COLORS.textSecondary, fontFamily: mono, marginTop: 4, marginBottom: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statBox: { flex: 1, minWidth: '40%', alignItems: 'center', paddingVertical: 10, backgroundColor: COLORS.background, borderRadius: 8 },
  statLabel: { fontSize: 9, color: COLORS.label, fontFamily: mono, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '900', color: COLORS.textPrimary, fontFamily: mono },
  trendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  trendValue: { fontSize: 24, fontWeight: '900', color: COLORS.textPrimary, fontFamily: mono },
  trendSub: { fontSize: 10, color: COLORS.textMuted, fontFamily: mono, marginTop: 2 },
  trendTarget: { fontSize: 16, fontWeight: '700', color: COLORS.textSecondary, fontFamily: mono },
  chartContainer: { alignItems: 'center', marginVertical: 12 },
  liftHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  liftName: { fontSize: 14, fontWeight: '900', fontFamily: mono, letterSpacing: 2 },
  liftBest: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary, fontFamily: mono },
  liftTargetText: { fontSize: 10, color: COLORS.textMuted, fontFamily: mono, marginBottom: 8 },
});
