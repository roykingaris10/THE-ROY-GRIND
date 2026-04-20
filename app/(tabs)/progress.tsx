import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppData } from '@/hooks/useAppData';
import { useCurrentProgram } from '@/hooks/useCurrentProgram';
import { COLORS, BENCHMARKS_REALISTIC } from '@/lib/constants';
import { FONTS } from '@/lib/typography';
import { getBestE1RM, formatNumber } from '@/lib/helpers';
import { toRoman } from '@/lib/roman';
import { Card, SectionLabel } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { ConstellationChart } from '@/components/ConstellationChart';
import { MiniChart } from '@/components/MiniChart';
import { BenchmarkTable } from '@/components/BenchmarkTable';
import { Starfield } from '@/components/Starfield';
import type { LiftType } from '@/types';

const LIFT_DEFS: { key: LiftType; label: string; color: string; benchKey: 'sq' | 'bn' | 'dl' }[] = [
  { key: 'squat', label: 'SQUAT', color: COLORS.squat, benchKey: 'sq' },
  { key: 'bench', label: 'BENCH', color: COLORS.bench, benchKey: 'bn' },
  { key: 'deadlift', label: 'DEADLIFT', color: COLORS.deadlift, benchKey: 'dl' },
];

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { data, loading } = useAppData();
  const [liftTab, setLiftTab] = useState<LiftType>('squat');
  const [timeRange, setTimeRange] = useState('block');

  const programStart = data?.settings?.programStart ?? '2026-04-14';
  const showStretch = data?.settings?.showStretchTargets ?? false;
  const { week, block, benchmark } = useCurrentProgram(programStart, showStretch);

  const weightHistory = useMemo(() => {
    if (!data) return [];
    return Object.values(data.entries)
      .filter(e => e.weight != null)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30)
      .map(e => e.weight!);
  }, [data]);

  const liftCharts = useMemo(() => {
    if (!data) return LIFT_DEFS.map(l => ({ ...l, best: 0, data: [] as number[] }));
    return LIFT_DEFS.map(lift => {
      const best = getBestE1RM(data.sets, lift.key);
      const weeklyBests: number[] = [];
      for (let w = 1; w <= week; w++) {
        const weekSets = data.sets.filter(s => s.week === w && s.liftType === lift.key && s.isMain);
        if (weekSets.length > 0) weeklyBests.push(Math.max(...weekSets.map(s => s.e1rm || 0)));
      }
      return { ...lift, best, data: weeklyBests.slice(-12) };
    });
  }, [data, week]);

  const totalEstimated = liftCharts.reduce((sum, l) => sum + l.best, 0);
  const finalBench = BENCHMARKS_REALISTIC[BENCHMARKS_REALISTIC.length - 1];
  const finalTotal = finalBench.sq + finalBench.bn + finalBench.dl;

  const selectedLift = liftCharts.find(l => l.key === liftTab) ?? liftCharts[0];

  if (loading || !data) {
    return <View style={[styles.container, { paddingTop: insets.top }]}><ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 80 }} /></View>;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}>

        <Text style={styles.header}>Progress</Text>

        {/* Time range toggle */}
        <View style={styles.toggleRow}>
          {[['30d', 'LAST 30 DAYS'], ['all', 'ALL TIME'], ['block', 'THIS BLOCK']].map(([k, l]) => (
            <TouchableOpacity key={k} onPress={() => setTimeRange(k)} style={styles.toggleTab} activeOpacity={0.7}>
              {timeRange === k ? (
                <LinearGradient colors={['rgba(107,78,158,0.5)', 'rgba(61,46,95,0.5)']}
                  style={[styles.toggleInner, { borderWidth: 1, borderColor: COLORS.purpleWarm }]}>
                  <Text style={[styles.toggleText, { color: COLORS.silverBright }]}>{l}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.toggleInner}>
                  <Text style={[styles.toggleText, { color: COLORS.textMuted }]}>{l}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Weight chart */}
        <Card style={{ marginBottom: 12, position: 'relative', overflow: 'hidden' }}>
          <Starfield density="sparse" height={180} />
          <View style={{ position: 'relative' }}>
            <View style={styles.chartHeader}>
              <Text style={styles.capsLabel}>BODYWEIGHT TREND</Text>
              {weightHistory.length > 1 && (
                <Text style={[styles.capsSm, { color: COLORS.success }]}>
                  {(weightHistory[weightHistory.length - 1] - weightHistory[0]).toFixed(1)} KG
                </Text>
              )}
            </View>
            {weightHistory.length > 1 ? (
              <ConstellationChart data={weightHistory} color={COLORS.silver} height={90} width={280} showGrid />
            ) : (
              <Text style={styles.emptyText}>Log weight daily to see trends</Text>
            )}
          </View>
        </Card>

        {/* Lift tabs */}
        <Card style={{ marginBottom: 12 }}>
          <View style={styles.liftTabs}>
            {LIFT_DEFS.map(l => (
              <TouchableOpacity key={l.key} onPress={() => setLiftTab(l.key)} style={styles.liftTabItem} activeOpacity={0.7}>
                <Text style={[styles.liftTabText, { color: liftTab === l.key ? l.color : COLORS.textMuted, borderBottomColor: liftTab === l.key ? l.color : COLORS.border }]}>
                  {l.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.liftStats}>
            <View>
              <Text style={styles.capsLabel}>E1RM</Text>
              <Text style={[styles.liftBig, { color: selectedLift.color }]}>
                {selectedLift.best > 0 ? selectedLift.best : '\u2014'}
                <Text style={{ fontSize: 14, color: COLORS.textMuted }}> kg</Text>
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.capsLabel}>TARGET</Text>
              <Text style={styles.liftTarget}>{benchmark[selectedLift.benchKey]} kg</Text>
            </View>
          </View>
          {selectedLift.data.length > 1 && (
            <ConstellationChart data={selectedLift.data} color={selectedLift.color} height={90} width={260} />
          )}
        </Card>

        {/* Block summary */}
        <Card>
          <View style={styles.blockHeader}>
            <Text style={styles.blockStar}>{'\u2734'}</Text>
            <Text style={[styles.capsSm, { color: COLORS.gold }]}>BLOCK {toRoman(Math.ceil(week / 8))} {'\u00B7'} {block.name.toUpperCase()}</Text>
          </View>
          <Text style={styles.blockWeek}>Week {toRoman(week)} of {toRoman(block.weeks[1])} {'\u00B7'} {Math.round(((week - block.weeks[0]) / (block.weeks[1] - block.weeks[0])) * 100)}% complete</Text>
          <ProgressBar progress={(week - block.weeks[0]) / (block.weeks[1] - block.weeks[0])} color={COLORS.gold} height={3} />
        </Card>

        <SectionLabel>BENCHMARK TABLE</SectionLabel>
        <Card delay={200}>
          <BenchmarkTable currentWeek={week} stretch={showStretch} />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 14 },
  header: { fontSize: 26, fontFamily: FONTS.serif, color: COLORS.silverBright, marginBottom: 16 },

  toggleRow: {
    flexDirection: 'row', gap: 4, padding: 4,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, marginBottom: 14,
  },
  toggleTab: { flex: 1 },
  toggleInner: { padding: 7, borderRadius: 7, alignItems: 'center' },
  toggleText: { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1.5 },

  capsLabel: { fontSize: 10, fontFamily: FONTS.mono, color: COLORS.silverDim, letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 4 },
  capsSm: { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1.5, textTransform: 'uppercase' },

  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  emptyText: { fontSize: 11, fontFamily: FONTS.mono, color: COLORS.textMuted, textAlign: 'center', paddingVertical: 12 },

  liftTabs: { flexDirection: 'row', gap: 4, marginBottom: 14 },
  liftTabItem: { flex: 1, alignItems: 'center', paddingBottom: 8 },
  liftTabText: { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1.5, borderBottomWidth: 2, paddingBottom: 6, width: '100%', textAlign: 'center' },

  liftStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  liftBig: { fontSize: 28, fontFamily: FONTS.serif },
  liftTarget: { fontSize: 14, fontFamily: FONTS.mono, color: COLORS.gold },

  blockHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  blockStar: { fontSize: 10, color: COLORS.gold },
  blockWeek: { fontSize: 17, fontFamily: FONTS.serif, color: COLORS.silverBright, marginBottom: 10 },
});
