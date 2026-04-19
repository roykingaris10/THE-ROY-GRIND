import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppData } from '@/hooks/useAppData';
import { useCurrentProgram } from '@/hooks/useCurrentProgram';
import { useGamification } from '@/hooks/useGamification';
import { COLORS, BENCHMARKS_REALISTIC } from '@/lib/constants';
import { getBestE1RM, formatNumber } from '@/lib/helpers';
import { getDailyVerse, getFastingInfo, getFeastDay } from '@/lib/orthodoxCalendar';
import { Card, SectionLabel } from '@/components/Card';
import { XPBar } from '@/components/XPBar';
import { StreakCounter } from '@/components/StreakCounter';
import { AchievementRow } from '@/components/AchievementBadge';
import { VirtueStatsCard } from '@/components/VirtueStats';
import { DailyVerse } from '@/components/DailyVerse';
import { ProgressBar } from '@/components/ProgressBar';
import { ConstellationChart } from '@/components/ConstellationChart';
import { RadialGauge } from '@/components/RadialGauge';
import { StatCallout } from '@/components/StatCallout';
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
  const { data, loading } = useAppData();

  const programStart = data?.settings?.programStart ?? '2026-04-14';
  const showStretch = data?.settings?.showStretchTargets ?? false;
  const { week, benchmark } = useCurrentProgram(programStart, showStretch);
  const gam = useGamification(data);

  const verse = useMemo(() => getDailyVerse(), []);
  const feast = useMemo(() => getFeastDay(), []);
  const fasting = useMemo(() => getFastingInfo(), []);

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
        if (weekSets.length > 0) {
          weeklyBests.push(Math.max(...weekSets.map(s => s.e1rm || 0)));
        }
      }
      return { ...lift, best, data: weeklyBests.slice(-12) };
    });
  }, [data, week]);

  const totalEstimated = liftCharts.reduce((sum, l) => sum + l.best, 0);
  const finalBench = BENCHMARKS_REALISTIC[BENCHMARKS_REALISTIC.length - 1];
  const finalTotal = finalBench.sq + finalBench.bn + finalBench.dl;

  const programProgress = Math.min(1, (week - 1) / 31);

  if (loading || !data) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 80 }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>{'\u2670'} PROGRESS</Text>

        {feast && (
          <View style={styles.feastBanner}>
            <Text style={styles.feastIcon}>{'\u2726'}</Text>
            <Text style={styles.feastText}>{feast.name}</Text>
          </View>
        )}

        {fasting && fasting.type !== 'weekly' && (
          <View style={styles.fastBanner}>
            <Text style={styles.fastText}>{'\u2670'} {fasting.name}</Text>
          </View>
        )}

        <DailyVerse text={verse.text} reference={verse.reference} />

        <SectionLabel>{'\u2670'} SPIRITUAL RANK</SectionLabel>
        <Card delay={50}>
          <XPBar xp={gam.xp} level={gam.level} progress={gam.levelProgress} xpToNext={gam.xpToNext} />
        </Card>

        <SectionLabel>{'\u2726'} STREAK</SectionLabel>
        <Card delay={100}>
          <StreakCounter current={gam.streak} longest={gam.longestStreak} />
        </Card>

        <SectionLabel>{'\u2670'} VIRTUES</SectionLabel>
        <Card delay={150}>
          <VirtueStatsCard virtues={gam.virtues} />
        </Card>

        <SectionLabel>PROGRAM PROGRESS</SectionLabel>
        <Card delay={200}>
          <View style={styles.progRow}>
            <Text style={styles.progLabel}>Week {week} of 32</Text>
            <Text style={styles.progPct}>{Math.round(programProgress * 100)}%</Text>
          </View>
          <ProgressBar progress={programProgress} color={COLORS.primary} height={6} />
        </Card>

        <SectionLabel>BODYWEIGHT TREND</SectionLabel>
        <Card delay={250}>
          {weightHistory.length > 1 ? (
            <View style={styles.chartContainer}>
              <ConstellationChart data={weightHistory} color={COLORS.silver} height={70} width={280} showGrid />
              <View style={styles.chartLabels}>
                <Text style={styles.chartLabel}>Start: {data.profile.startingWeight}kg</Text>
                <Text style={styles.chartLabel}>Latest: {weightHistory[weightHistory.length - 1]?.toFixed(1)}kg</Text>
                <Text style={styles.chartLabel}>Target: {benchmark.bw}kg</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.emptyText}>Log weight daily to see trends</Text>
          )}
        </Card>

        <SectionLabel>LIFT PROGRESS (E1RM)</SectionLabel>
        {liftCharts.map(lift => (
          <Card key={lift.key} delay={300} borderColor={lift.color}>
            <View style={styles.liftHeader}>
              <Text style={[styles.liftName, { color: lift.color }]}>{lift.label}</Text>
              <Text style={styles.liftBest}>
                {lift.best > 0 ? `${formatNumber(lift.best)} kg` : '\u2014'}
              </Text>
            </View>
            {lift.data.length > 1 && (
              <ConstellationChart data={lift.data} color={lift.color} height={50} width={260} />
            )}
            <View style={styles.liftTarget}>
              <Text style={styles.targetLabel}>Target: {benchmark[lift.benchKey]}kg</Text>
              <ProgressBar
                progress={benchmark[lift.benchKey] > 0 ? lift.best / benchmark[lift.benchKey] : 0}
                color={lift.color}
                height={4}
              />
            </View>
          </Card>
        ))}

        <SectionLabel>ESTIMATED TOTAL</SectionLabel>
        <Card delay={350}>
          <View style={styles.totalSection}>
            <RadialGauge
              progress={totalEstimated > 0 ? totalEstimated / finalTotal : 0}
              size={100}
              color={COLORS.primary}
              label="TOTAL"
            />
            <View style={styles.totalInfo}>
              <StatCallout
                value={totalEstimated > 0 ? formatNumber(totalEstimated) : '\u2014'}
                unit="kg"
                subtitle={`/ ${finalTotal}kg target`}
                size="small"
              />
            </View>
          </View>
        </Card>

        <SectionLabel>BENCHMARK TABLE</SectionLabel>
        <Card delay={400}>
          <BenchmarkTable currentWeek={week} stretch={showStretch} />
        </Card>

        <SectionLabel>{`\u2726 ACHIEVEMENTS (${gam.unlockedCount}/${gam.achievements.length})`}</SectionLabel>
        {gam.achievements.map(a => (
          <AchievementRow key={a.id} achievement={a} />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16 },
  header: {
    fontSize: 24,
    fontFamily: 'Cinzel_900Black',
    color: COLORS.silverBright,
    letterSpacing: 4,
    textAlign: 'center',
    marginVertical: 12,
  },
  feastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201,169,97,0.08)',
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  feastIcon: { fontSize: 16, color: COLORS.gold },
  feastText: { fontSize: 11, color: COLORS.gold, fontFamily: mono, fontWeight: '700', letterSpacing: 1 },
  fastBanner: {
    backgroundColor: 'rgba(107,78,158,0.12)',
    borderWidth: 1,
    borderColor: COLORS.purpleWarm,
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  fastText: { fontSize: 10, color: COLORS.purpleWarm, fontFamily: mono, fontWeight: '700', letterSpacing: 1 },
  progRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progLabel: { fontSize: 12, color: COLORS.textSecondary, fontFamily: mono },
  progPct: { fontSize: 14, fontWeight: '900', color: COLORS.primary, fontFamily: mono },
  chartContainer: { alignItems: 'center' },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 8 },
  chartLabel: { fontSize: 9, color: COLORS.textMuted, fontFamily: mono },
  emptyText: { fontSize: 11, color: COLORS.textMuted, fontFamily: mono, textAlign: 'center', paddingVertical: 12 },
  liftHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  liftName: { fontSize: 13, fontWeight: '900', fontFamily: mono, letterSpacing: 2 },
  liftBest: { fontSize: 18, fontWeight: '900', color: COLORS.silverBright, fontFamily: mono },
  liftTarget: { marginTop: 8 },
  targetLabel: { fontSize: 9, color: COLORS.textMuted, fontFamily: mono, marginBottom: 4 },
  totalSection: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  totalInfo: { flex: 1 },
});
