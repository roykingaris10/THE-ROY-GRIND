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

import { COLORS, PROGRAM_START_DEFAULT, BENCHMARKS_REALISTIC } from '@/lib/constants';
import { useAppData } from '@/hooks/useAppData';
import { useCurrentProgram } from '@/hooks/useCurrentProgram';
import { useCalorieBalance } from '@/hooks/useCalorieBalance';
import { getDateString, getBestE1RM, formatNumber } from '@/lib/helpers';
import { detectRedFlags } from '@/lib/redflags';
import type { LiftType } from '@/types';

import { Card, SectionLabel } from '@/components/Card';
import { MiniChart } from '@/components/MiniChart';
import { ProgressBar } from '@/components/ProgressBar';
import { RedFlagAlert } from '@/components/RedFlagAlert';
import { CalorieBalanceCard } from '@/components/CalorieBalanceCard';

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

  const today = getDateString(new Date());
  const todayEntry = data?.entries[today];

  const redFlags = useMemo(() => {
    if (!data) return [];
    return detectRedFlags(data);
  }, [data]);

  // Bodyweight data: last 14 entries with weight
  const weightData = useMemo(() => {
    if (!data) return { latest: STARTING_BW, sparkline: [] as number[], target: STARTING_BW };
    const withWeight = Object.values(data.entries)
      .filter(e => e.weight != null)
      .sort((a, b) => a.date.localeCompare(b.date));
    const sparkline = withWeight.slice(-14).map(e => e.weight!);
    const latest = withWeight.length > 0 ? withWeight[withWeight.length - 1].weight! : data.profile.startingWeight;
    return { latest, sparkline, target: benchmark.bw };
  }, [data, benchmark]);

  // Lift E1RM data
  const liftData = useMemo(() => {
    if (!data) return LIFT_DEFS.map(l => ({ ...l, best: 0, sparkline: [] as number[], target: 0 }));
    return LIFT_DEFS.map(lift => {
      const best = getBestE1RM(data.sets, lift.key);
      // Get weekly best e1rm for sparkline (last 8 weeks)
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

  // -- Loading state (hooks already called above) --
  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading RoyForge...</Text>
        </View>
      </View>
    );
  }

  // -- Helper: bodyweight progress (130 -> 100, inverted: losing weight is progress)
  const bwProgress = STARTING_BW > TARGET_BW
    ? Math.max(0, Math.min(1, (STARTING_BW - weightData.latest) / (STARTING_BW - TARGET_BW)))
    : 0;

  // Final benchmark row targets
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
        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>ROYFORGE</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.weekNumber}>W{week}</Text>
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.settingsButton}
            >
              <FontAwesome name="gear" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ===== TAGS ROW ===== */}
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
        </View>

        {/* ===== RED FLAGS ===== */}
        {redFlags.length > 0 && (
          <>
            <SectionLabel>Alerts</SectionLabel>
            <RedFlagAlert flags={redFlags} />
          </>
        )}

        {/* ===== CALORIE BALANCE HERO ===== */}
        <SectionLabel>Calorie Balance</SectionLabel>
        <CalorieBalanceCard
          caloriesIn={calBalance.caloriesIn}
          tdee={calBalance.tdee}
          target={calBalance.target}
          status={calBalance.status}
        />

        {/* ===== BODYWEIGHT CARD ===== */}
        <SectionLabel>Bodyweight</SectionLabel>
        <Card delay={100}>
          <View style={styles.bwCardRow}>
            <View style={styles.bwLeft}>
              <Text style={styles.bwLatest}>{weightData.latest.toFixed(1)}</Text>
              <Text style={styles.bwUnit}>kg</Text>
            </View>
            <View style={styles.bwCenter}>
              <MiniChart
                data={weightData.sparkline}
                color={COLORS.primary}
                height={36}
                width={100}
              />
            </View>
            <View style={styles.bwRight}>
              <Text style={styles.bwTargetLabel}>TARGET</Text>
              <Text style={styles.bwTargetValue}>{benchmark.bw} kg</Text>
            </View>
          </View>
          <View style={styles.bwProgressRow}>
            <ProgressBar
              progress={bwProgress}
              color={COLORS.primary}
              height={5}
              showLabel
              label={`${STARTING_BW} → ${TARGET_BW} kg`}
            />
          </View>
        </Card>

        {/* ===== LIFTS OVERVIEW ===== */}
        <SectionLabel>Lifts (Best E1RM)</SectionLabel>
        <Card delay={200}>
          <View style={styles.liftsRow}>
            {liftData.map(lift => (
              <View key={lift.key} style={styles.liftCol}>
                <Text style={[styles.liftLabel, { color: lift.color }]}>{lift.label}</Text>
                <Text style={styles.liftValue}>
                  {lift.best > 0 ? `${lift.best}` : '—'}
                </Text>
                <Text style={styles.liftUnit}>kg</Text>
                <View style={styles.liftChartContainer}>
                  <MiniChart
                    data={lift.sparkline}
                    color={lift.color}
                    height={30}
                    width={80}
                  />
                </View>
                <Text style={styles.liftTarget}>
                  Target: {lift.target}
                </Text>
                <ProgressBar
                  progress={lift.target > 0 ? lift.best / lift.target : 0}
                  color={lift.color}
                  height={4}
                />
              </View>
            ))}
          </View>
        </Card>

        {/* ===== ESTIMATED TOTAL ===== */}
        <SectionLabel>Estimated Total</SectionLabel>
        <Card delay={250}>
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalValue}>
                {estimatedTotal > 0 ? `${estimatedTotal}` : '—'}
              </Text>
              <Text style={styles.totalUnit}>kg (SQ + BN + DL)</Text>
            </View>
            <View style={styles.totalTargetCol}>
              <Text style={styles.totalTargetLabel}>TARGET</Text>
              <Text style={styles.totalTargetValue}>{TARGET_TOTAL} kg</Text>
            </View>
          </View>
          <View style={styles.totalProgressRow}>
            <ProgressBar
              progress={estimatedTotal > 0 ? estimatedTotal / TARGET_TOTAL : 0}
              color={COLORS.primary}
              height={5}
              showLabel
              label={`0 → ${TARGET_TOTAL} kg`}
            />
          </View>
        </Card>

        {/* ===== TODAY'S SNAPSHOT ===== */}
        <SectionLabel>Today&apos;s Snapshot</SectionLabel>
        <Card delay={300}>
          {todayEntry && (todayEntry.weight || todayEntry.calories || todayEntry.steps || todayEntry.sleep) ? (
            <View style={styles.snapshotGrid}>
              <SnapshotItem
                icon="balance-scale"
                label="Weight"
                value={todayEntry.weight != null ? `${todayEntry.weight.toFixed(1)} kg` : '—'}
              />
              <SnapshotItem
                icon="cutlery"
                label="Kcal"
                value={todayEntry.calories != null ? formatNumber(todayEntry.calories) : '—'}
              />
              <SnapshotItem
                icon="road"
                label="Steps"
                value={todayEntry.steps != null ? formatNumber(todayEntry.steps) : '—'}
              />
              <SnapshotItem
                icon="moon-o"
                label="Sleep"
                value={todayEntry.sleep != null ? `${todayEntry.sleep}h` : '—'}
              />
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/log')}
              style={styles.noDataContainer}
            >
              <FontAwesome name="plus-circle" size={18} color={COLORS.primary} />
              <Text style={styles.noDataText}>No data logged today — tap to log</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* ===== CURRENT BLOCK INFO ===== */}
        <SectionLabel>Current Block</SectionLabel>
        <Card delay={350}>
          <Text style={styles.blockName}>{block.name}</Text>
          <Text style={styles.blockDetail}>
            Weeks {block.weeks[0]}–{block.weeks[1]}  ·  {block.focus}
          </Text>
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
                {formatNumber(nutritionPhase.calories[0])}–{formatNumber(nutritionPhase.calories[1])} kcal  ·  {nutritionPhase.protein[0]}–{nutritionPhase.protein[1]}g protein
              </Text>
            </View>
          )}
        </Card>

        {/* Bottom spacer */}
        <View style={{ height: insets.bottom + 24 }} />
      </ScrollView>
    </View>
  );
}

// ===== Sub-components =====

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

// ===== Styles =====

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: mono,
    letterSpacing: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    fontFamily: mono,
    letterSpacing: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  weekNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
    fontFamily: mono,
  },
  settingsButton: {
    padding: 4,
  },

  // Tags
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.ghostBorder,
    backgroundColor: COLORS.card,
  },
  tagText: {
    fontSize: 10,
    fontFamily: mono,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.textSecondary,
  },
  tagDeload: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(255, 107, 26, 0.1)',
  },
  tagDeloadText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  tagDietBreak: {
    borderColor: COLORS.success,
    backgroundColor: 'rgba(68, 255, 136, 0.1)',
  },
  tagDietBreakText: {
    color: COLORS.success,
    fontWeight: '700',
  },

  // Bodyweight card
  bwCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bwLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  bwLatest: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    fontFamily: mono,
  },
  bwUnit: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: mono,
  },
  bwCenter: {
    alignItems: 'center',
  },
  bwRight: {
    alignItems: 'flex-end',
  },
  bwTargetLabel: {
    fontSize: 9,
    color: COLORS.label,
    fontFamily: mono,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  bwTargetValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    fontFamily: mono,
  },
  bwProgressRow: {
    marginTop: 4,
  },

  // Lifts overview
  liftsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  liftCol: {
    flex: 1,
    alignItems: 'center',
  },
  liftLabel: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: mono,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  liftValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    fontFamily: mono,
  },
  liftUnit: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontFamily: mono,
    marginBottom: 4,
  },
  liftChartContainer: {
    marginVertical: 4,
  },
  liftTarget: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontFamily: mono,
    marginBottom: 6,
    marginTop: 2,
  },

  // Estimated total
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalValue: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.textPrimary,
    fontFamily: mono,
  },
  totalUnit: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: mono,
    marginTop: 2,
  },
  totalTargetCol: {
    alignItems: 'flex-end',
  },
  totalTargetLabel: {
    fontSize: 9,
    color: COLORS.label,
    fontFamily: mono,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  totalTargetValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textSecondary,
    fontFamily: mono,
  },
  totalProgressRow: {
    marginTop: 4,
  },

  // Today's snapshot
  snapshotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  snapshotItem: {
    flex: 1,
    minWidth: '40%',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  snapshotLabel: {
    fontSize: 9,
    color: COLORS.label,
    fontFamily: mono,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  snapshotValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: mono,
  },
  noDataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  noDataText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: mono,
  },

  // Current block
  blockName: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
    fontFamily: mono,
    marginBottom: 4,
  },
  blockDetail: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: mono,
    marginBottom: 12,
    lineHeight: 18,
  },
  blockMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  blockMetaItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  blockMetaLabel: {
    fontSize: 8,
    color: COLORS.label,
    fontFamily: mono,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  blockMetaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: mono,
  },
  nutritionRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  nutritionLabel: {
    fontSize: 9,
    color: COLORS.label,
    fontFamily: mono,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.success,
    fontFamily: mono,
    marginBottom: 2,
  },
  nutritionDetail: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: mono,
    lineHeight: 16,
  },
});
