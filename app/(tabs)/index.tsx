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
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, PROGRAM_START_DEFAULT, BENCHMARKS_REALISTIC } from '@/lib/constants';
import { FONTS } from '@/lib/typography';
import { useAppData } from '@/hooks/useAppData';
import { useCurrentProgram } from '@/hooks/useCurrentProgram';
import { useCalorieBalance } from '@/hooks/useCalorieBalance';
import { useGamification } from '@/hooks/useGamification';
import { getDateString, getBestE1RM, formatNumber } from '@/lib/helpers';
import { getDailyVerse, getOrthodoxGreeting, getFastingInfo } from '@/lib/orthodoxCalendar';
import { detectRedFlags } from '@/lib/redflags';
import { playTap } from '@/lib/sounds';
import type { LiftType } from '@/types';

import { Card, SectionLabel } from '@/components/Card';
import { MiniChart } from '@/components/MiniChart';
import { ProgressBar } from '@/components/ProgressBar';
import { RedFlagAlert } from '@/components/RedFlagAlert';
import { CalorieBalanceCard } from '@/components/CalorieBalanceCard';
import { XPBar } from '@/components/XPBar';
import { StreakCounter } from '@/components/StreakCounter';
import { DailyVerse } from '@/components/DailyVerse';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

const STARTING_BW = 130;
const TARGET_BW = 100;
const TARGET_TOTAL = 590;

type LiftDef = { key: LiftType; label: string; color: string; benchKey: 'sq' | 'bn' | 'dl' };

const LIFT_DEFS: LiftDef[] = [
  { key: 'squat', label: 'SQ', color: COLORS.squat, benchKey: 'sq' },
  { key: 'bench', label: 'BN', color: COLORS.bench, benchKey: 'bn' },
  { key: 'deadlift', label: 'DL', color: COLORS.deadlift, benchKey: 'dl' },
];

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, loading, refresh } = useAppData();

  const programStart = data?.settings.programStart ?? PROGRAM_START_DEFAULT;
  const showStretch = data?.settings.showStretchTargets ?? false;

  const { week, block, nutritionPhase, benchmark, isDeload, isDietBreak } =
    useCurrentProgram(programStart, showStretch);

  const calBalance = useCalorieBalance(data);
  const gam = useGamification(data);

  const today = getDateString(new Date());
  const todayEntry = data?.entries[today];

  const verse = useMemo(() => getDailyVerse(), []);
  const greeting = useMemo(() => getOrthodoxGreeting(), []);
  const fasting = useMemo(() => getFastingInfo(), []);

  const redFlags = useMemo(() => {
    if (!data) return [];
    return detectRedFlags(data);
  }, [data]);

  const weightData = useMemo(() => {
    if (!data) return { latest: STARTING_BW, sparkline: [] as number[], target: STARTING_BW };
    const withWeight = Object.values(data.entries)
      .filter(e => e.weight != null)
      .sort((a, b) => a.date.localeCompare(b.date));
    const sparkline = withWeight.slice(-14).map(e => e.weight!);
    const latest = withWeight.length > 0 ? withWeight[withWeight.length - 1].weight! : data.profile.startingWeight;
    return { latest, sparkline, target: benchmark.bw };
  }, [data, benchmark]);

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
      return { ...lift, best, sparkline: weeklyBests, target: benchmark[lift.benchKey] };
    });
  }, [data, week, benchmark]);

  const estimatedTotal = useMemo(() => {
    return liftData.reduce((sum, l) => sum + l.best, 0);
  }, [liftData]);

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
          <Text style={styles.loadingText}>{'\u2670'} Loading Invictus...</Text>
        </View>
      </View>
    );
  }

  const bwProgress = STARTING_BW > TARGET_BW
    ? Math.max(0, Math.min(1, (STARTING_BW - weightData.latest) / (STARTING_BW - TARGET_BW)))
    : 0;

  const finalBench = BENCHMARKS_REALISTIC[BENCHMARKS_REALISTIC.length - 1];
  const finalTotal = finalBench.sq + finalBench.bn + finalBench.dl;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        <LinearGradient
          colors={['rgba(107,78,158,0.08)', 'transparent']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.cross}>{'\u2670'}</Text>
              <Text style={styles.headerTitle}>INVICTUS</Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.weekNumber}>W{week}</Text>
              <TouchableOpacity
                onPress={() => { playTap(); router.push('/settings'); }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.settingsButton}
              >
                <FontAwesome name="gear" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.greeting}>{greeting}</Text>
        </LinearGradient>

        <View style={styles.tagsRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{block.name}</Text>
          </View>
          {isDeload && (
            <View style={[styles.tag, styles.tagDeload]}>
              <Text style={[styles.tagText, styles.tagDeloadText]}>DELOAD</Text>
            </View>
          )}
          {isDietBreak && (
            <View style={[styles.tag, styles.tagDietBreak]}>
              <Text style={[styles.tagText, styles.tagDietBreakText]}>DIET BREAK</Text>
            </View>
          )}
          {fasting && fasting.type !== 'weekly' && (
            <View style={[styles.tag, styles.tagFasting]}>
              <Text style={[styles.tagText, styles.tagFastingText]}>{'\u2670'} {fasting.name}</Text>
            </View>
          )}
        </View>

        <Card delay={0}>
          <XPBar xp={gam.xp} level={gam.level} progress={gam.levelProgress} xpToNext={gam.xpToNext} />
          <View style={styles.streakRow}>
            <StreakCounter current={gam.streak} longest={gam.longestStreak} compact />
            <View style={styles.achievementCount}>
              <Text style={styles.achievementIcon}>{'\u2726'}</Text>
              <Text style={styles.achievementText}>{gam.unlockedCount}/{gam.achievements.length}</Text>
            </View>
          </View>
        </Card>

        <DailyVerse text={verse.text} reference={verse.reference} compact />

        {redFlags.length > 0 && (
          <>
            <SectionLabel>Alerts</SectionLabel>
            <RedFlagAlert flags={redFlags} />
          </>
        )}

        <SectionLabel>Calorie Balance</SectionLabel>
        <CalorieBalanceCard
          caloriesIn={calBalance.caloriesIn}
          tdee={calBalance.tdee}
          target={calBalance.target}
          status={calBalance.status}
        />

        <SectionLabel>Bodyweight</SectionLabel>
        <Card delay={100}>
          <View style={styles.bwCardRow}>
            <View style={styles.bwLeft}>
              <Text style={styles.bwLatest}>{weightData.latest.toFixed(1)}</Text>
              <Text style={styles.bwUnit}>kg</Text>
            </View>
            <View style={styles.bwCenter}>
              <MiniChart data={weightData.sparkline} color={COLORS.silver} height={36} width={100} />
            </View>
            <View style={styles.bwRight}>
              <Text style={styles.bwTargetLabel}>TARGET</Text>
              <Text style={styles.bwTargetValue}>{benchmark.bw} kg</Text>
            </View>
          </View>
          <View style={styles.bwProgressRow}>
            <ProgressBar progress={bwProgress} color={COLORS.primary} height={5} showLabel label={`${STARTING_BW} \u2192 ${TARGET_BW} kg`} />
          </View>
        </Card>

        <SectionLabel>Lifts (Best E1RM)</SectionLabel>
        <Card delay={200}>
          <View style={styles.liftsRow}>
            {liftData.map(lift => (
              <View key={lift.key} style={styles.liftCol}>
                <Text style={[styles.liftLabel, { color: lift.color }]}>{lift.label}</Text>
                <Text style={styles.liftValue}>{lift.best > 0 ? `${lift.best}` : '\u2014'}</Text>
                <Text style={styles.liftUnit}>kg</Text>
                <View style={styles.liftChartContainer}>
                  <MiniChart data={lift.sparkline} color={lift.color} height={30} width={80} />
                </View>
                <Text style={styles.liftTarget}>Target: {lift.target}</Text>
                <ProgressBar progress={lift.target > 0 ? lift.best / lift.target : 0} color={lift.color} height={4} />
              </View>
            ))}
          </View>
        </Card>

        <SectionLabel>Estimated Total</SectionLabel>
        <Card delay={250}>
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalValue}>{estimatedTotal > 0 ? `${estimatedTotal}` : '\u2014'}</Text>
              <Text style={styles.totalUnit}>kg (SQ + BN + DL)</Text>
            </View>
            <View style={styles.totalTargetCol}>
              <Text style={styles.totalTargetLabel}>TARGET</Text>
              <Text style={styles.totalTargetValue}>{TARGET_TOTAL} kg</Text>
            </View>
          </View>
          <View style={styles.totalProgressRow}>
            <ProgressBar progress={estimatedTotal > 0 ? estimatedTotal / TARGET_TOTAL : 0} color={COLORS.primary} height={5} showLabel label={`0 \u2192 ${TARGET_TOTAL} kg`} />
          </View>
        </Card>

        <SectionLabel>Today's Snapshot</SectionLabel>
        <Card delay={300}>
          {todayEntry && (todayEntry.weight || todayEntry.calories || todayEntry.steps || todayEntry.sleep) ? (
            <View style={styles.snapshotGrid}>
              <SnapshotItem icon="balance-scale" label="Weight" value={todayEntry.weight != null ? `${todayEntry.weight.toFixed(1)} kg` : '\u2014'} />
              <SnapshotItem icon="cutlery" label="Kcal" value={todayEntry.calories != null ? formatNumber(todayEntry.calories) : '\u2014'} />
              <SnapshotItem icon="road" label="Steps" value={todayEntry.steps != null ? formatNumber(todayEntry.steps) : '\u2014'} />
              <SnapshotItem icon="moon-o" label="Sleep" value={todayEntry.sleep != null ? `${todayEntry.sleep}h` : '\u2014'} />
            </View>
          ) : (
            <TouchableOpacity onPress={() => router.push('/log')} style={styles.noDataContainer}>
              <FontAwesome name="plus-circle" size={18} color={COLORS.primary} />
              <Text style={styles.noDataText}>No data logged today {'\u2014'} tap to log</Text>
            </TouchableOpacity>
          )}
        </Card>

        <SectionLabel>Current Block</SectionLabel>
        <Card delay={350}>
          <Text style={styles.blockName}>{block.name}</Text>
          <Text style={styles.blockDetail}>Weeks {block.weeks[0]}{'\u2013'}{block.weeks[1]}  {'\u00B7'}  {block.focus}</Text>
          <View style={styles.blockMetaRow}>
            <BlockMeta label="Squat Freq" value={block.sqFreq} />
            <BlockMeta label="RPE Range" value={block.rpeRange} />
            <BlockMeta label="Rep Range" value={block.repRange} />
          </View>
          {nutritionPhase && (
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionLabel}>Nutrition Phase</Text>
              <Text style={styles.nutritionValue}>{nutritionPhase.name}</Text>
              <Text style={styles.nutritionDetail}>
                {formatNumber(nutritionPhase.calories[0])}{'\u2013'}{formatNumber(nutritionPhase.calories[1])} kcal  {'\u00B7'}  {nutritionPhase.protein[0]}{'\u2013'}{nutritionPhase.protein[1]}g protein
              </Text>
            </View>
          )}
        </Card>

        <View style={{ height: insets.bottom + 24 }} />
      </ScrollView>
    </View>
  );
}

function SnapshotItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.snapshotItem}>
      <FontAwesome name={icon as any} size={14} color={COLORS.textMuted} />
      <Text style={styles.snapshotLabel}>{label}</Text>
      <Text style={styles.snapshotValue}>{value}</Text>
    </View>
  );
}

function BlockMeta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.blockMetaItem}>
      <Text style={styles.blockMetaLabel}>{label}</Text>
      <Text style={styles.blockMetaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { fontSize: 13, color: COLORS.textSecondary, fontFamily: mono, letterSpacing: 1 },

  headerGradient: { marginHorizontal: -16, paddingHorizontal: 16, paddingBottom: 4, marginBottom: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cross: { fontSize: 22, color: COLORS.gold },
  headerTitle: { fontSize: 24, fontFamily: 'Cinzel_900Black', color: COLORS.silverBright, letterSpacing: 4 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  weekNumber: { fontSize: 28, fontWeight: '900', color: COLORS.primary, fontFamily: mono },
  settingsButton: { padding: 4 },

  greeting: { fontSize: 11, color: COLORS.textMuted, fontFamily: mono, fontStyle: 'italic', marginBottom: 12 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: COLORS.ghostBorder, backgroundColor: COLORS.card },
  tagText: { fontSize: 10, fontFamily: mono, letterSpacing: 1, textTransform: 'uppercase', color: COLORS.textSecondary },
  tagDeload: { borderColor: COLORS.primary, backgroundColor: 'rgba(107,78,158,0.12)' },
  tagDeloadText: { color: COLORS.primary, fontWeight: '700' },
  tagDietBreak: { borderColor: COLORS.success, backgroundColor: 'rgba(143,179,150,0.12)' },
  tagDietBreakText: { color: COLORS.success, fontWeight: '700' },
  tagFasting: { borderColor: COLORS.purpleWarm, backgroundColor: 'rgba(139,127,184,0.12)' },
  tagFastingText: { color: COLORS.purpleWarm, fontWeight: '700' },

  streakRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  achievementCount: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  achievementIcon: { fontSize: 16, color: COLORS.gold },
  achievementText: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, fontFamily: mono },

  bwCardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  bwLeft: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  bwLatest: { fontSize: 28, fontWeight: '900', color: COLORS.silverBright, fontFamily: mono },
  bwUnit: { fontSize: 12, color: COLORS.textMuted, fontFamily: mono },
  bwCenter: { alignItems: 'center' },
  bwRight: { alignItems: 'flex-end' },
  bwTargetLabel: { fontSize: 9, color: COLORS.label, fontFamily: mono, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 },
  bwTargetValue: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, fontFamily: mono },
  bwProgressRow: { marginTop: 4 },

  liftsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  liftCol: { flex: 1, alignItems: 'center' },
  liftLabel: { fontSize: 11, fontWeight: '900', fontFamily: mono, letterSpacing: 1.5, marginBottom: 4 },
  liftValue: { fontSize: 22, fontWeight: '900', color: COLORS.silverBright, fontFamily: mono },
  liftUnit: { fontSize: 9, color: COLORS.textMuted, fontFamily: mono, marginBottom: 4 },
  liftChartContainer: { marginVertical: 4 },
  liftTarget: { fontSize: 9, color: COLORS.textMuted, fontFamily: mono, marginBottom: 6, marginTop: 2 },

  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  totalValue: { fontSize: 30, fontWeight: '900', color: COLORS.silverBright, fontFamily: mono },
  totalUnit: { fontSize: 10, color: COLORS.textMuted, fontFamily: mono, marginTop: 2 },
  totalTargetCol: { alignItems: 'flex-end' },
  totalTargetLabel: { fontSize: 9, color: COLORS.label, fontFamily: mono, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 },
  totalTargetValue: { fontSize: 18, fontWeight: '700', color: COLORS.textSecondary, fontFamily: mono },
  totalProgressRow: { marginTop: 4 },

  snapshotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  snapshotItem: { flex: 1, minWidth: '40%', alignItems: 'center', paddingVertical: 10, gap: 4 },
  snapshotLabel: { fontSize: 9, color: COLORS.label, fontFamily: mono, letterSpacing: 1.5, textTransform: 'uppercase' },
  snapshotValue: { fontSize: 15, fontWeight: '700', color: COLORS.silverBright, fontFamily: mono },
  noDataContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 12 },
  noDataText: { fontSize: 12, color: COLORS.textSecondary, fontFamily: mono },

  blockName: { fontSize: 16, fontWeight: '900', color: COLORS.primary, fontFamily: mono, marginBottom: 4 },
  blockDetail: { fontSize: 11, color: COLORS.textSecondary, fontFamily: mono, marginBottom: 12, lineHeight: 18 },
  blockMetaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  blockMetaItem: { flex: 1, alignItems: 'center', paddingVertical: 8, backgroundColor: COLORS.background, borderRadius: 8 },
  blockMetaLabel: { fontSize: 8, color: COLORS.label, fontFamily: mono, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  blockMetaValue: { fontSize: 12, fontWeight: '700', color: COLORS.silverBright, fontFamily: mono },
  nutritionRow: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  nutritionLabel: { fontSize: 9, color: COLORS.label, fontFamily: mono, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
  nutritionValue: { fontSize: 14, fontWeight: '700', color: COLORS.success, fontFamily: mono, marginBottom: 2 },
  nutritionDetail: { fontSize: 10, color: COLORS.textMuted, fontFamily: mono, lineHeight: 16 },
});
