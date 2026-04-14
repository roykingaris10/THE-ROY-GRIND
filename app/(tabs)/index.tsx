import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { COLORS } from '@/lib/constants';
import { useAppData } from '@/hooks/useAppData';
import { useCurrentProgram } from '@/hooks/useCurrentProgram';
import { getBestE1RM, getDateString } from '@/lib/helpers';
import { detectRedFlags } from '@/lib/redflags';
import { Card, SectionLabel } from '@/components/Card';
import { MiniChart } from '@/components/MiniChart';
import { ProgressBar } from '@/components/ProgressBar';
import { RedFlagAlert } from '@/components/RedFlagAlert';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

export default function DashboardScreen() {
  const { data, loading, refresh } = useAppData();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  const programStart = data?.settings?.programStart || '2026-04-14';
  const program = useCurrentProgram(programStart);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  if (loading || !data) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const { week, block, benchmark, isDeload, isDietBreak } = program;
  const today = getDateString(new Date());
  const todayEntry = data.entries[today];
  const flags = detectRedFlags(data);

  // Get last 14 weight entries
  const weightEntries: number[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = getDateString(d);
    if (data.entries[key]?.weight) {
      weightEntries.push(data.entries[key].weight!);
    }
  }
  const latestWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1] : null;

  // Weight progress (130 -> 100)
  const startWeight = 130;
  const goalWeight = 100;
  const weightLost = latestWeight ? startWeight - latestWeight : 0;
  const weightProgress = weightLost / (startWeight - goalWeight);

  // Lift bests
  const sqE1rm = getBestE1RM(data.lifts, 'squat');
  const bnE1rm = getBestE1RM(data.lifts, 'bench');
  const dlE1rm = getBestE1RM(data.lifts, 'deadlift');
  const totalE1rm = sqE1rm + bnE1rm + dlE1rm;

  // Lift sparkline data
  const getRecentLiftWeights = (type: 'squat' | 'bench' | 'deadlift'): number[] => {
    return data.lifts
      .filter(l => l.type === type)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-10)
      .map(l => l.weight);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>THE GRIND</Text>
            <Text style={styles.subtitle}>130 → 100 | 465 → 610</Text>
          </View>
          <View style={styles.weekBadge}>
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              style={styles.gearBtn}
              hitSlop={10}
            >
              <FontAwesome name="cog" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
            <Text style={styles.weekNumber}>WEEK {week}</Text>
            <Text style={styles.weekTotal}>/32</Text>
          </View>
        </View>

        {/* Tags */}
        <View style={styles.tagRow}>
          <View style={[styles.tag, { backgroundColor: 'rgba(68, 255, 136, 0.15)' }]}>
            <Text style={[styles.tagText, { color: COLORS.success }]}>{block.name}</Text>
          </View>
          {isDeload && (
            <View style={[styles.tag, { backgroundColor: 'rgba(255, 170, 68, 0.15)' }]}>
              <Text style={[styles.tagText, { color: COLORS.warning }]}>DELOAD</Text>
            </View>
          )}
          {isDietBreak && (
            <View style={[styles.tag, { backgroundColor: 'rgba(68, 170, 255, 0.15)' }]}>
              <Text style={[styles.tagText, { color: COLORS.squat }]}>DIET BREAK</Text>
            </View>
          )}
        </View>

        {/* Red Flags */}
        <RedFlagAlert flags={flags} />

        {/* Bodyweight Card */}
        <SectionLabel>BODYWEIGHT</SectionLabel>
        <Card delay={0}>
          <View style={styles.bwRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bigNumber}>
                {latestWeight ? `${latestWeight}` : '--'}
                <Text style={styles.unit}> kg</Text>
              </Text>
              <Text style={styles.smallDetail}>
                Target: {benchmark.bw}kg | Goal: {goalWeight}kg
              </Text>
            </View>
            <MiniChart data={weightEntries} color={COLORS.primary} height={50} width={130} />
          </View>
          <View style={{ marginTop: 12 }}>
            <ProgressBar
              progress={weightProgress}
              color={COLORS.primary}
              showLabel
              label={`${weightLost.toFixed(1)}kg lost of ${startWeight - goalWeight}kg`}
            />
          </View>
        </Card>

        {/* Lifts Overview */}
        <SectionLabel>LIFTS</SectionLabel>
        <Card delay={50}>
          <View style={styles.liftsGrid}>
            {/* Squat */}
            <View style={styles.liftCol}>
              <Text style={[styles.liftLabel, { color: COLORS.squat }]}>SQUAT</Text>
              <Text style={[styles.liftBig, { color: COLORS.squat }]}>
                {sqE1rm || '--'}
              </Text>
              <Text style={styles.liftTarget}>/{benchmark.sq}</Text>
              <MiniChart data={getRecentLiftWeights('squat')} color={COLORS.squat} height={30} width={80} />
              <View style={{ marginTop: 6, width: '100%' }}>
                <ProgressBar progress={sqE1rm ? sqE1rm / benchmark.sq : 0} color={COLORS.squat} height={4} />
              </View>
            </View>

            {/* Bench */}
            <View style={styles.liftCol}>
              <Text style={[styles.liftLabel, { color: COLORS.bench }]}>BENCH</Text>
              <Text style={[styles.liftBig, { color: COLORS.bench }]}>
                {bnE1rm || '--'}
              </Text>
              <Text style={styles.liftTarget}>/{benchmark.bn}</Text>
              <MiniChart data={getRecentLiftWeights('bench')} color={COLORS.bench} height={30} width={80} />
              <View style={{ marginTop: 6, width: '100%' }}>
                <ProgressBar progress={bnE1rm ? bnE1rm / benchmark.bn : 0} color={COLORS.bench} height={4} />
              </View>
            </View>

            {/* Deadlift */}
            <View style={styles.liftCol}>
              <Text style={[styles.liftLabel, { color: COLORS.deadlift }]}>DEAD</Text>
              <Text style={[styles.liftBig, { color: COLORS.deadlift }]}>
                {dlE1rm || '--'}
              </Text>
              <Text style={styles.liftTarget}>/{benchmark.dl}</Text>
              <MiniChart data={getRecentLiftWeights('deadlift')} color={COLORS.deadlift} height={30} width={80} />
              <View style={{ marginTop: 6, width: '100%' }}>
                <ProgressBar progress={dlE1rm ? dlE1rm / benchmark.dl : 0} color={COLORS.deadlift} height={4} />
              </View>
            </View>
          </View>
        </Card>

        {/* Estimated Total */}
        <Card delay={100}>
          <SectionLabel>ESTIMATED TOTAL</SectionLabel>
          <Text style={styles.totalNumber}>{totalE1rm || '--'} kg</Text>
          <Text style={styles.smallDetail}>
            Target: 610kg | Remaining: +{Math.max(0, 610 - totalE1rm)}kg
          </Text>
          <View style={{ marginTop: 8 }}>
            <ProgressBar progress={totalE1rm / 610} color={COLORS.primary} height={6} />
          </View>
        </Card>

        {/* Today's Snapshot */}
        <SectionLabel>TODAY</SectionLabel>
        <Card delay={150}>
          {todayEntry && (todayEntry.weight || todayEntry.calories || todayEntry.steps || todayEntry.sleep) ? (
            <View style={styles.todayGrid}>
              <View style={styles.todayItem}>
                <Text style={styles.todayLabel}>WEIGHT</Text>
                <Text style={styles.todayValue}>{todayEntry.weight ?? '--'}</Text>
              </View>
              <View style={styles.todayItem}>
                <Text style={styles.todayLabel}>KCAL</Text>
                <Text style={styles.todayValue}>{todayEntry.calories ?? '--'}</Text>
              </View>
              <View style={styles.todayItem}>
                <Text style={styles.todayLabel}>STEPS</Text>
                <Text style={styles.todayValue}>{todayEntry.steps ?? '--'}</Text>
              </View>
              <View style={styles.todayItem}>
                <Text style={styles.todayLabel}>SLEEP</Text>
                <Text style={styles.todayValue}>{todayEntry.sleep ? `${todayEntry.sleep}h` : '--'}</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={() => router.push('/(tabs)/log')} activeOpacity={0.7}>
              <Text style={styles.noDataText}>No data logged today — tap to log →</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Current Block Info */}
        <SectionLabel>CURRENT BLOCK</SectionLabel>
        <Card delay={200}>
          <Text style={styles.blockName}>{block.name}</Text>
          <View style={styles.blockDetails}>
            <View style={styles.blockItem}>
              <Text style={styles.blockLabel}>WEEKS</Text>
              <Text style={styles.blockValue}>{block.weeks[0]}–{block.weeks[1]}</Text>
            </View>
            <View style={styles.blockItem}>
              <Text style={styles.blockLabel}>FOCUS</Text>
              <Text style={styles.blockValue}>{block.focus}</Text>
            </View>
            <View style={styles.blockItem}>
              <Text style={styles.blockLabel}>SQ FREQ</Text>
              <Text style={styles.blockValue}>{block.sqFreq}</Text>
            </View>
            <View style={styles.blockItem}>
              <Text style={styles.blockLabel}>RPE</Text>
              <Text style={styles.blockValue}>{block.rpeRange}</Text>
            </View>
            <View style={styles.blockItem}>
              <Text style={styles.blockLabel}>REPS</Text>
              <Text style={styles.blockValue}>{block.repRange}</Text>
            </View>
          </View>
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
    fontFamily: mono,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: mono,
    marginTop: 2,
  },
  weekBadge: {
    alignItems: 'flex-end',
  },
  gearBtn: {
    padding: 4,
    marginBottom: 2,
  },
  weekNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
    fontFamily: mono,
  },
  weekTotal: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: mono,
    marginTop: -2,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: mono,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bwRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bigNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.textPrimary,
    fontFamily: mono,
  },
  unit: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  smallDetail: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: mono,
    marginTop: 4,
  },
  liftsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  liftCol: {
    flex: 1,
    alignItems: 'center',
  },
  liftLabel: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: mono,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  liftBig: {
    fontSize: 24,
    fontWeight: '900',
    fontFamily: mono,
  },
  liftTarget: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: mono,
    marginBottom: 6,
  },
  totalNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.textPrimary,
    fontFamily: mono,
    marginTop: 4,
  },
  todayGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  todayItem: {
    alignItems: 'center',
    flex: 1,
  },
  todayLabel: {
    fontSize: 9,
    fontWeight: '600',
    fontFamily: mono,
    color: COLORS.label,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  todayValue: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: mono,
    color: COLORS.textPrimary,
  },
  noDataText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: mono,
    textAlign: 'center',
    paddingVertical: 8,
  },
  blockName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: mono,
    marginBottom: 12,
  },
  blockDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  blockItem: {
    minWidth: '30%',
  },
  blockLabel: {
    fontSize: 9,
    fontWeight: '600',
    fontFamily: mono,
    color: COLORS.label,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  blockValue: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontFamily: mono,
    marginTop: 2,
  },
});
