import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, G, Text as SvgText, Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useAppData } from '@/hooks/useAppData';
import { useCurrentProgram } from '@/hooks/useCurrentProgram';
import {
  getDateString, addDays, formatDate, getEstimated1RM,
  getBestE1RM, getHeaviestSet, formatNumber,
} from '@/lib/helpers';
import { COLORS, LIFT_COLORS, BENCHMARKS_REALISTIC } from '@/lib/constants';
import { FONTS } from '@/lib/typography';
import { Card, SectionLabel } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { PRToast } from '@/components/PRToast';
import { GradientButton } from '@/components/GradientButton';
import { Starfield } from '@/components/Starfield';
import type { LiftType, SetLog } from '@/types';

const LIFT_TYPES: LiftType[] = ['squat', 'bench', 'deadlift'];
const LIFT_LABELS: Record<LiftType, string> = { squat: 'Squat', bench: 'Bench', deadlift: 'Deadlift' };
const BENCHMARK_KEYS: Record<LiftType, 'sq' | 'bn' | 'dl'> = { squat: 'sq', bench: 'bn', deadlift: 'dl' };

export default function LiftsScreen() {
  const { data, loading, addSet, removeSet } = useAppData();
  const insets = useSafeAreaInsets();

  const [selectedLift, setSelectedLift] = useState<LiftType>('squat');
  const [selectedDate, setSelectedDate] = useState(getDateString(new Date()));
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('1');
  const [rpe, setRpe] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [prToast, setPrToast] = useState<{ visible: boolean; liftType: LiftType; e1rm: number }>({
    visible: false, liftType: 'squat', e1rm: 0,
  });

  const programStart = data?.settings.programStart ?? '2026-04-14';
  const showStretch = data?.settings.showStretchTargets ?? false;
  const { week, benchmark } = useCurrentProgram(programStart, showStretch);

  const lifts = useMemo(() => {
    if (!data) return [];
    const finalBench = BENCHMARKS_REALISTIC[BENCHMARKS_REALISTIC.length - 1];
    return LIFT_TYPES.map(type => {
      const best = getBestE1RM(data.sets, type);
      const key = BENCHMARK_KEYS[type];
      const target = finalBench[key];
      const start = BENCHMARKS_REALISTIC[0][key];
      const prs = data.sets.filter(s => s.liftType === type && s.isPR).length;
      return { key: type, name: LIFT_LABELS[type], current: best, target, start, color: LIFT_COLORS[type], prs };
    });
  }, [data]);

  const estimatedTotal = lifts.reduce((sum, l) => sum + l.current, 0);

  const todaySets = useMemo(() => {
    if (!data) return [];
    return data.sets.filter(s => s.date === selectedDate);
  }, [data, selectedDate]);

  const groupedSets = useMemo(() => {
    const groups: Record<string, SetLog[]> = {};
    todaySets.forEach(s => {
      const key = s.exerciseName || s.exerciseId;
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return groups;
  }, [todaySets]);

  const handleLogSet = useCallback(async () => {
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    const numSets = parseInt(sets, 10) || 1;
    if (!w || !r || w <= 0 || r <= 0) { Alert.alert('Invalid input', 'Enter a valid weight and reps.'); return; }
    setSubmitting(true);
    try {
      let lastEntry: SetLog | null = null;
      const existingCount = todaySets.filter(s => s.liftType === selectedLift).length;
      for (let i = 0; i < numSets; i++) {
        const entry = await addSet({
          date: selectedDate, week, dayIndex: 0,
          exerciseId: selectedLift, exerciseName: LIFT_LABELS[selectedLift],
          liftType: selectedLift, isMain: true, setNumber: existingCount + i + 1,
          weight: w, reps: r, rpe: rpe ?? undefined, notes: notes.trim() || undefined,
        });
        lastEntry = entry;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (lastEntry?.isPR && lastEntry.liftType) {
        setPrToast({ visible: true, liftType: lastEntry.liftType, e1rm: lastEntry.e1rm ?? 0 });
      }
      setWeight(''); setReps(''); setSets('1'); setRpe(null); setNotes('');
    } catch { Alert.alert('Error', 'Failed to log set.'); }
    finally { setSubmitting(false); }
  }, [weight, reps, sets, rpe, notes, selectedDate, selectedLift, week, todaySets, addSet]);

  const handleRemoveSet = useCallback((id: string) => {
    Alert.alert('Delete set?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await removeSet(id); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } },
    ]);
  }, [removeSet]);

  if (loading || !data) {
    return <View style={[styles.container, { paddingTop: insets.top }]}><ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 80 }} /></View>;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <PRToast visible={prToast.visible} liftType={prToast.liftType} e1rm={prToast.e1rm}
        onDismiss={() => setPrToast(p => ({ ...p, visible: false }))} />

      <ScrollView style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Lifts</Text>
          <Text style={styles.headerSub}>THE BIG THREE {'\u00B7'} E1RM PROJECTION</Text>
        </View>

        {/* Constellation total visual */}
        <Card style={{ marginBottom: 14, position: 'relative', overflow: 'hidden', padding: 20 }} glow>
          <Starfield density="sparse" height={200} />
          <View style={{ alignItems: 'center', position: 'relative' }}>
            <Text style={styles.capsLabel}>POWERLIFTING TOTAL</Text>
            <Text style={styles.totalHero}>
              {estimatedTotal > 0 ? estimatedTotal : '\u2014'}
              <Text style={{ fontSize: 22, color: COLORS.textSecondary }}> kg</Text>
            </Text>
            <Text style={[styles.capsSm, { color: COLORS.gold, marginTop: 6 }]}>
              REALISTIC {BENCHMARKS_REALISTIC[BENCHMARKS_REALISTIC.length - 1].sq + BENCHMARKS_REALISTIC[BENCHMARKS_REALISTIC.length - 1].bn + BENCHMARKS_REALISTIC[BENCHMARKS_REALISTIC.length - 1].dl} {'\u00B7'} STRETCH 610
            </Text>

            {/* Constellation SVG */}
            <Svg width={280} height={70} viewBox="0 0 280 70" style={{ marginTop: 18 }}>
              <Path d="M 50 45 L 140 20 L 230 45" stroke={COLORS.purpleWarm} strokeWidth={0.8} strokeDasharray="2 3" fill="none" opacity={0.6} />
              <Path d="M 50 45 L 230 45" stroke={COLORS.purpleWarm} strokeWidth={0.5} strokeDasharray="2 3" fill="none" opacity={0.4} />
              {/* Squat */}
              <G>
                <Circle cx={50} cy={45} r={6} fill={COLORS.squat} opacity={0.2} />
                <Circle cx={50} cy={45} r={3} fill={COLORS.squat} />
                <SvgText x={50} y={65} fontSize={9} fill={COLORS.silverDim} textAnchor="middle" fontFamily={FONTS.mono}>SQ {lifts[0]?.current || 0}</SvgText>
              </G>
              {/* Bench */}
              <G>
                <Circle cx={140} cy={20} r={7} fill={COLORS.bench} opacity={0.2} />
                <Circle cx={140} cy={20} r={3.5} fill={COLORS.bench} />
                <SvgText x={140} y={10} fontSize={9} fill={COLORS.silverDim} textAnchor="middle" fontFamily={FONTS.mono}>BP {lifts[1]?.current || 0}</SvgText>
              </G>
              {/* Deadlift */}
              <G>
                <Circle cx={230} cy={45} r={6} fill={COLORS.deadlift} opacity={0.2} />
                <Circle cx={230} cy={45} r={3} fill={COLORS.deadlift} />
                <SvgText x={230} y={65} fontSize={9} fill={COLORS.silverDim} textAnchor="middle" fontFamily={FONTS.mono}>DL {lifts[2]?.current || 0}</SvgText>
              </G>
              {/* Gold star center */}
              <Path d="M 140 35 L 141 39 L 145 40 L 141 41 L 140 45 L 139 41 L 135 40 L 139 39 Z" fill={COLORS.gold} opacity={0.8} />
            </Svg>
          </View>
        </Card>

        {/* Per-lift cards */}
        {lifts.map(l => {
          const progress = l.target > l.start ? ((l.current - l.start) / (l.target - l.start)) * 100 : 0;
          return (
            <Card key={l.key} style={{ marginBottom: 10 }}>
              <View style={styles.liftCardHeader}>
                <View>
                  <Text style={[styles.capsSm, { color: l.color, marginBottom: 4 }]}>THE {l.name.toUpperCase()}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                    <Text style={styles.liftE1rm}>{l.current > 0 ? l.current : '\u2014'}</Text>
                    <Text style={styles.liftE1rmUnit}>KG E1RM</Text>
                  </View>
                </View>
                {l.prs > 0 && (
                  <View style={styles.prBadgeRow}>
                    <Text style={styles.prBadgeText}>{'\u2726'} {l.prs}</Text>
                  </View>
                )}
              </View>
              <View style={{ marginBottom: 10 }}>
                <View style={styles.progressLabels}>
                  <Text style={styles.capsSmMuted}>{l.start} START</Text>
                  <Text style={[styles.capsSm, { color: l.color }]}>{Math.round(Math.max(0, progress))}% TO TARGET</Text>
                  <Text style={[styles.capsSm, { color: COLORS.gold }]}>{l.target} GOAL</Text>
                </View>
                <ProgressBar progress={Math.max(0, Math.min(1, progress / 100))} color={l.color} height={3} />
              </View>
              <View style={styles.liftCardFooter}>
                <View>
                  <Text style={styles.capsSmMuted}>GAIN</Text>
                  <Text style={[styles.liftGain, { color: COLORS.success }]}>+{Math.max(0, l.current - l.start)} KG</Text>
                </View>
              </View>
            </Card>
          );
        })}

        {/* Quick Log */}
        <SectionLabel>QUICK LOG</SectionLabel>
        <Card borderColor={LIFT_COLORS[selectedLift]}>
          <View style={styles.liftPillRow}>
            {LIFT_TYPES.map(type => (
              <TouchableOpacity key={type} onPress={() => { setSelectedLift(type); Haptics.selectionAsync(); }}
                style={[styles.liftPill, selectedLift === type && { backgroundColor: LIFT_COLORS[type], borderColor: LIFT_COLORS[type] }]}>
                <Text style={[styles.liftPillText, selectedLift === type && { color: COLORS.silverBright }]}>{LIFT_LABELS[type].toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>WEIGHT (KG)</Text>
              <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="0" placeholderTextColor={COLORS.textMuted} />
            </View>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>REPS</Text>
              <TextInput style={styles.input} value={reps} onChangeText={setReps} keyboardType="numeric" placeholder="0" placeholderTextColor={COLORS.textMuted} />
            </View>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>SETS</Text>
              <TextInput style={styles.input} value={sets} onChangeText={setSets} keyboardType="numeric" placeholder="1" placeholderTextColor={COLORS.textMuted} />
            </View>
          </View>

          <GradientButton label="LOG SET" onPress={handleLogSet} loading={submitting} />
        </Card>

        {/* Today's sets */}
        {Object.keys(groupedSets).length > 0 && (
          <>
            <SectionLabel>{formatDate(selectedDate).toUpperCase()} SETS</SectionLabel>
            {Object.entries(groupedSets).map(([name, exerciseSets]) => {
              const liftType = exerciseSets[0]?.liftType;
              const borderColor = liftType ? LIFT_COLORS[liftType] : COLORS.border;
              return (
                <Card key={name} borderColor={borderColor}>
                  <Text style={[styles.groupTitle, liftType ? { color: LIFT_COLORS[liftType] } : undefined]}>{name}</Text>
                  {exerciseSets.map(s => (
                    <View key={s.id} style={styles.setRow}>
                      <Text style={styles.setText}>{s.weight}kg x {s.reps}{s.rpe ? ` @${s.rpe}` : ''}</Text>
                      {s.e1rm ? <Text style={styles.setE1rm}>e1RM {s.e1rm}kg</Text> : null}
                      {s.isPR && <Text style={styles.prBadge}>{'\u2726'} PR</Text>}
                      <TouchableOpacity onPress={() => handleRemoveSet(s.id)} style={styles.deleteBtn}>
                        <Text style={styles.deleteBtnText}>{'\u00D7'}</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </Card>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 14 },

  headerSection: { marginBottom: 16 },
  headerTitle: { fontSize: 26, fontFamily: FONTS.serif, color: COLORS.silverBright },
  headerSub: { fontSize: 9, fontFamily: FONTS.mono, color: COLORS.textMuted, letterSpacing: 1.5, marginTop: 4, textTransform: 'uppercase' },

  capsLabel: { fontSize: 10, fontFamily: FONTS.mono, color: COLORS.silverDim, letterSpacing: 1.8, textTransform: 'uppercase' },
  capsSm: { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1.5, textTransform: 'uppercase' },
  capsSmMuted: { fontSize: 9, fontFamily: FONTS.mono, color: COLORS.textMuted, letterSpacing: 1.5, textTransform: 'uppercase' },

  totalHero: { fontSize: 56, fontFamily: FONTS.serif, color: COLORS.silverBright, fontWeight: '400', lineHeight: 60, marginTop: 6, letterSpacing: -0.5 },

  liftCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  liftE1rm: { fontSize: 32, fontFamily: FONTS.serif, color: COLORS.silverBright, lineHeight: 34 },
  liftE1rmUnit: { fontSize: 10, fontFamily: FONTS.mono, color: COLORS.textMuted },
  prBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  prBadgeText: { fontSize: 11, fontFamily: FONTS.mono, color: COLORS.gold },

  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },

  liftCardFooter: { paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  liftGain: { fontSize: 11, fontFamily: FONTS.mono, marginTop: 3 },

  liftPillRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  liftPill: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.borderBright, alignItems: 'center' },
  liftPillText: { fontSize: 10, fontFamily: FONTS.mono, color: COLORS.textSecondary, letterSpacing: 1 },

  formRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  formField: { flex: 1 },
  formLabel: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.textMuted, letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' },
  input: { fontFamily: FONTS.mono, fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.borderBright, borderRadius: 8, padding: 10, textAlign: 'center' },

  groupTitle: { fontFamily: FONTS.mono, fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  setRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 8 },
  setText: { fontFamily: FONTS.mono, fontSize: 12, color: COLORS.silverBright, flex: 1 },
  setE1rm: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.textSecondary },
  prBadge: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.gold },
  deleteBtn: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: COLORS.danger, alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { fontSize: 14, color: COLORS.danger },
});
