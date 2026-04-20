import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, PROGRAM_START_DEFAULT, BENCHMARKS_REALISTIC } from '@/lib/constants';
import { FONTS } from '@/lib/typography';
import { useAppData } from '@/hooks/useAppData';
import { useCurrentProgram } from '@/hooks/useCurrentProgram';
import { useCalorieBalance } from '@/hooks/useCalorieBalance';
import { getDateString, getBestE1RM, formatNumber } from '@/lib/helpers';
import { toRoman } from '@/lib/roman';
import { playTap } from '@/lib/sounds';
import type { LiftType } from '@/types';

import { Card, SectionLabel } from '@/components/Card';
import { MiniChart } from '@/components/MiniChart';
import { ProgressBar } from '@/components/ProgressBar';
import { Starfield } from '@/components/Starfield';

const STARTING_BW = 130;
const TARGET_BW = 100;

type LiftDef = { key: LiftType; label: string; color: string; benchKey: 'sq' | 'bn' | 'dl' };

const LIFT_DEFS: LiftDef[] = [
  { key: 'squat', label: 'SQUAT', color: COLORS.squat, benchKey: 'sq' },
  { key: 'bench', label: 'BENCH', color: COLORS.bench, benchKey: 'bn' },
  { key: 'deadlift', label: 'DEAD', color: COLORS.deadlift, benchKey: 'dl' },
];

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, loading, refresh } = useAppData();

  const programStart = data?.settings.programStart ?? PROGRAM_START_DEFAULT;
  const showStretch = data?.settings.showStretchTargets ?? false;

  const { week, block, isDeload, isDietBreak } =
    useCurrentProgram(programStart, showStretch);

  const calBalance = useCalorieBalance(data);

  const today = getDateString(new Date());
  const todayEntry = data?.entries[today];

  const weightData = useMemo(() => {
    if (!data) return { latest: STARTING_BW, sparkline: [] as number[], weekChange: 0 };
    const withWeight = Object.values(data.entries)
      .filter(e => e.weight != null)
      .sort((a, b) => a.date.localeCompare(b.date));
    const sparkline = withWeight.slice(-14).map(e => e.weight!);
    const latest = withWeight.length > 0 ? withWeight[withWeight.length - 1].weight! : data.profile.startingWeight;
    const weekAgo = withWeight.length >= 7 ? withWeight[withWeight.length - 7].weight! : latest;
    const weekChange = +(latest - weekAgo).toFixed(1);
    return { latest, sparkline, weekChange };
  }, [data]);

  const liftData = useMemo(() => {
    if (!data) return LIFT_DEFS.map(l => ({ ...l, best: 0, sparkline: [] as number[], target: 0 }));
    return LIFT_DEFS.map(lift => {
      const best = getBestE1RM(data.sets, lift.key);
      const weeklyBests: number[] = [];
      for (let w = Math.max(1, week - 7); w <= week; w++) {
        const weekSets = data.sets.filter(s => s.week === w && s.liftType === lift.key && s.isMain);
        if (weekSets.length > 0) {
          const maxE1rm = Math.max(...weekSets.map(s => s.e1rm || 0));
          if (maxE1rm > 0) weeklyBests.push(maxE1rm);
        }
      }
      const finalBench = BENCHMARKS_REALISTIC[BENCHMARKS_REALISTIC.length - 1];
      const target = finalBench[lift.benchKey];
      return { ...lift, best, sparkline: weeklyBests, target };
    });
  }, [data, week]);

  const estimatedTotal = useMemo(() => liftData.reduce((sum, l) => sum + l.best, 0), [liftData]);

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  const bwProgress = STARTING_BW > TARGET_BW
    ? Math.max(0, Math.min(100, ((STARTING_BW - weightData.latest) / (STARTING_BW - TARGET_BW)) * 100))
    : 0;

  const finalBench = BENCHMARKS_REALISTIC[BENCHMARKS_REALISTIC.length - 1];
  const realisticTotal = finalBench.sq + finalBench.bn + finalBench.dl;
  const stretchTotal = 610;

  const consistencyDays = useMemo(() => {
    const days: string[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = getDateString(d);
      if (i === 0) { days.push('today'); continue; }
      const entry = data?.entries[ds];
      if (entry && (entry.weight || entry.calories || entry.steps)) {
        days.push('done');
      } else if (d.getDay() === 0 || d.getDay() === 3) {
        days.push('rest');
      } else {
        days.push('miss');
      }
    }
    return days;
  }, [data]);

  const doneCount = consistencyDays.filter(d => d === 'done' || d === 'today').length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>INVICTVS</Text>
            <Text style={styles.headerSub}>
              {STARTING_BW} {'\u2192'} {TARGET_BW} {'\u00B7'} {estimatedTotal || '---'} {'\u2192'} {realisticTotal}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.weekLabel}>WEEK {toRoman(week)} / {toRoman(32)}</Text>
            <TouchableOpacity
              onPress={() => { playTap(); router.push('/settings'); }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <FontAwesome name="gear" size={16} color={COLORS.silverDim} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Block pill */}
        <View style={styles.pillRow}>
          <LinearGradient
            colors={['rgba(107,78,158,0.35)', 'rgba(61,46,95,0.35)']}
            style={styles.blockPill}
          >
            <Text style={styles.pillStar}>{'\u2734'}</Text>
            <Text style={styles.pillText}>BLOCK {toRoman(Math.ceil(week / 8))} {'\u00B7'} {block.name.toUpperCase()}</Text>
          </LinearGradient>
          {isDeload && (
            <View style={[styles.tagPill, { borderColor: COLORS.purpleWarm }]}>
              <Text style={[styles.tagText, { color: COLORS.purpleWarm }]}>DELOAD</Text>
            </View>
          )}
        </View>

        {/* Calorie Balance Hero */}
        <Card style={{ marginBottom: 12 }} glow>
          <View style={styles.balanceHeader}>
            <Text style={styles.capsLabel}>TODAY'S BALANCE</Text>
          </View>
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.capsLabel}>CALORIES IN</Text>
              <Text style={styles.balanceValue}>{formatNumber(calBalance.caloriesIn)}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.capsLabel}>NET</Text>
              <Text style={[styles.balanceHero, { color: calBalance.netBalance < 0 ? COLORS.success : COLORS.warning }]}>
                {calBalance.netBalance < 0 ? '\u2212' : '+'}{formatNumber(Math.abs(calBalance.netBalance))}
              </Text>
              <Text style={styles.capsSmMuted}>KCAL</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.capsLabel}>CALORIES OUT</Text>
              <Text style={[styles.balanceValue, { color: COLORS.purpleWarm }]}>{formatNumber(calBalance.tdee.total)}</Text>
            </View>
          </View>
          <ProgressBar progress={Math.min(1, calBalance.caloriesIn / calBalance.tdee.total)} color={COLORS.success} height={4} />
        </Card>

        {/* Today's Workout */}
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/workout')}>
          <Card style={{ marginBottom: 12 }}>
            <View style={styles.workoutHeader}>
              <View>
                <Text style={[styles.capsSmColor, { color: COLORS.purpleWarm }]}>TODAY {'\u00B7'} DAY I</Text>
                <Text style={styles.workoutTitle}>Squat Priority</Text>
              </View>
            </View>
            <View style={styles.workoutFooter}>
              <Text style={[styles.capsSm, { color: COLORS.purpleWarm }]}>CONTINUE WORKOUT</Text>
              <FontAwesome name="chevron-right" size={10} color={COLORS.purpleWarm} />
            </View>
          </Card>
        </TouchableOpacity>

        {/* Bodyweight */}
        <Card style={{ marginBottom: 12 }}>
          <View style={styles.bwRow}>
            <View>
              <Text style={styles.capsLabel}>BODYWEIGHT</Text>
              <Text style={styles.bwHero}>
                {weightData.latest.toFixed(1)}
                <Text style={styles.bwUnit}> kg</Text>
              </Text>
              <Text style={[styles.bwChange, { color: weightData.weekChange <= 0 ? COLORS.success : COLORS.warning }]}>
                {weightData.weekChange <= 0 ? '' : '+'}{weightData.weekChange} KG THIS WEEK
              </Text>
            </View>
            <View style={{ marginTop: 6 }}>
              <MiniChart data={weightData.sparkline} color={COLORS.silver} height={36} width={100} />
            </View>
          </View>
          <View style={{ marginTop: 10 }}>
            <ProgressBar progress={bwProgress / 100} color={COLORS.primary} height={3} />
            <View style={styles.progressLabels}>
              <Text style={styles.capsSmMuted}>{STARTING_BW} START</Text>
              <Text style={[styles.capsSm, { color: COLORS.purpleWarm }]}>{Math.round(bwProgress)}% OF {STARTING_BW - TARGET_BW}KG GOAL</Text>
              <Text style={styles.capsSmMuted}>{TARGET_BW} GOAL</Text>
            </View>
          </View>
        </Card>

        {/* Lift Overview 3-col */}
        <View style={styles.liftGrid}>
          {liftData.map(lift => (
            <Card key={lift.key} style={styles.liftCard}>
              <Text style={[styles.capsSm, { color: lift.color, marginBottom: 6 }]}>{lift.label}</Text>
              <Text style={styles.liftValue}>{lift.best > 0 ? lift.best : '\u2014'}</Text>
              <Text style={styles.liftTarget}>{'\u2192'} {lift.target} kg</Text>
              <View style={{ marginVertical: 6 }}>
                <MiniChart data={lift.sparkline} color={lift.color} height={18} width={72} />
              </View>
              <ProgressBar
                progress={lift.target > 0 ? lift.best / lift.target : 0}
                color={lift.color}
                height={2}
              />
            </Card>
          ))}
        </View>

        {/* Total */}
        <Card style={{ marginBottom: 12 }}>
          <View style={styles.totalHeader}>
            <Text style={styles.capsLabel}>CURRENT TOTAL</Text>
            <Text style={styles.totalValue}>
              {estimatedTotal > 0 ? estimatedTotal : '\u2014'}
              <Text style={{ fontSize: 14, color: COLORS.textSecondary }}> kg</Text>
            </Text>
          </View>
          <View style={styles.totalBar}>
            <View style={[styles.totalBarFill, { width: `${Math.min(100, (estimatedTotal / realisticTotal) * 100)}%` }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={[styles.capsSm, { color: COLORS.purpleWarm }]}>REALISTIC {realisticTotal}</Text>
            <Text style={[styles.capsSm, { color: COLORS.gold }]}>STRETCH {stretchTotal}</Text>
          </View>
        </Card>

        {/* Consistency 14-day dots */}
        <Card>
          <View style={styles.consistencyHeader}>
            <Text style={styles.capsLabel}>WORKOUT CONSISTENCY {'\u00B7'} 14 DAYS</Text>
            <Text style={styles.consistencyCount}>{doneCount} / 14</Text>
          </View>
          <View style={styles.dotsRow}>
            {consistencyDays.map((d, i) => {
              const colors: Record<string, { bg: string; op: number }> = {
                done: { bg: COLORS.success, op: 1 },
                rest: { bg: COLORS.textMuted, op: 0.6 },
                miss: { bg: COLORS.warning, op: 0.9 },
                today: { bg: COLORS.gold, op: 1 },
                future: { bg: COLORS.borderBright, op: 0.5 },
              };
              const c = colors[d] || colors.future;
              return (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    { backgroundColor: c.bg, opacity: c.op },
                    d === 'today' && styles.dotToday,
                  ]}
                />
              );
            })}
          </View>
          <Text style={styles.capsSmMuted}>
            {doneCount} OF 14 AS PLANNED {'\u00B7'} {Math.round((doneCount / 14) * 100)}% ADHERENCE
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 14 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  headerTitle: { fontSize: 26, fontFamily: FONTS.serifMedium, color: COLORS.silverBright, letterSpacing: 2, lineHeight: 30 },
  headerSub: { fontSize: 9, fontFamily: FONTS.mono, color: COLORS.textMuted, letterSpacing: 1.5, marginTop: 5, textTransform: 'uppercase' },
  headerRight: { alignItems: 'flex-end', gap: 8 },
  weekLabel: { fontSize: 10, fontFamily: FONTS.mono, color: COLORS.silver, letterSpacing: 1.8 },

  pillRow: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  blockPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 5, paddingHorizontal: 11,
    borderRadius: 999, borderWidth: 1, borderColor: COLORS.purpleWarm,
  },
  pillStar: { fontSize: 8, color: COLORS.gold },
  pillText: { fontSize: 9, fontFamily: FONTS.mono, color: COLORS.silverBright, letterSpacing: 1.5 },
  tagPill: { paddingVertical: 5, paddingHorizontal: 11, borderRadius: 999, borderWidth: 1 },
  tagText: { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1.5 },

  capsLabel: { fontSize: 10, fontFamily: FONTS.mono, color: COLORS.silverDim, letterSpacing: 1.8, textTransform: 'uppercase' },
  capsSm: { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1.5, textTransform: 'uppercase' },
  capsSmColor: { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1.5, textTransform: 'uppercase' },
  capsSmMuted: { fontSize: 9, fontFamily: FONTS.mono, color: COLORS.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 6 },

  balanceHeader: { marginBottom: 14 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  balanceValue: { fontSize: 20, fontFamily: FONTS.mono, color: COLORS.silverBright, fontWeight: '300', marginTop: 4 },
  balanceHero: { fontSize: 34, fontFamily: FONTS.serif, fontWeight: '400', lineHeight: 36, marginTop: 4 },

  workoutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  workoutTitle: { fontSize: 22, fontFamily: FONTS.serif, color: COLORS.silverBright, marginTop: 4 },
  workoutFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },

  bwRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bwHero: { fontSize: 38, fontFamily: FONTS.serif, color: COLORS.silverBright, fontWeight: '400', lineHeight: 40, letterSpacing: -0.5, marginTop: 4 },
  bwUnit: { fontSize: 20, color: COLORS.textSecondary },
  bwChange: { fontSize: 10, fontFamily: FONTS.mono, letterSpacing: 1, marginTop: 4 },

  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },

  liftGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  liftCard: { flex: 1, padding: 12, marginBottom: 0 },
  liftValue: { fontSize: 22, fontFamily: FONTS.serif, color: COLORS.silverBright, fontWeight: '400', lineHeight: 24 },
  liftTarget: { fontSize: 8.5, fontFamily: FONTS.mono, color: COLORS.textMuted, letterSpacing: 1, marginTop: 2 },

  totalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  totalValue: { fontSize: 26, fontFamily: FONTS.serif, color: COLORS.silverBright },
  totalBar: { height: 6, backgroundColor: COLORS.backgroundTertiary, borderRadius: 3, overflow: 'hidden' },
  totalBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.purpleImperial,
  },

  consistencyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  consistencyCount: { fontSize: 10, fontFamily: FONTS.mono, color: COLORS.silver },
  dotsRow: { flexDirection: 'row', gap: 4, alignItems: 'center', marginBottom: 4 },
  dot: { width: 10, height: 10, borderRadius: 2 },
  dotToday: {
    ...Platform.select({
      ios: { shadowColor: COLORS.gold, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 3 },
    }),
  },
});
