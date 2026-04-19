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
import * as Haptics from 'expo-haptics';
import { useAppData } from '@/hooks/useAppData';
import { useCurrentProgram } from '@/hooks/useCurrentProgram';
import {
  getDateString,
  addDays,
  formatDate,
  getEstimated1RM,
  getBestE1RM,
  getHeaviestSet,
  formatNumber,
} from '@/lib/helpers';
import { COLORS, LIFT_COLORS } from '@/lib/constants';
import { Card, SectionLabel } from '@/components/Card';
import { LiftPill } from '@/components/LiftPill';
import { PRToast } from '@/components/PRToast';
import type { LiftType, SetLog } from '@/types';

const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });
const RPE_VALUES = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];
const LIFT_TYPES: LiftType[] = ['squat', 'bench', 'deadlift'];
const LIFT_LABELS: Record<LiftType, string> = { squat: 'Squat', bench: 'Bench', deadlift: 'Deadlift' };
const BENCHMARK_KEYS: Record<LiftType, 'sq' | 'bn' | 'dl'> = { squat: 'sq', bench: 'bn', deadlift: 'dl' };

export default function LiftsScreen() {
  const { data, loading, addSet, removeSet } = useAppData();
  const insets = useSafeAreaInsets();

  // All hooks before early returns
  const [selectedLift, setSelectedLift] = useState<LiftType>('squat');
  const [selectedDate, setSelectedDate] = useState(getDateString(new Date()));
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('1');
  const [rpe, setRpe] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [prToast, setPrToast] = useState<{ visible: boolean; liftType: LiftType; e1rm: number }>({
    visible: false,
    liftType: 'squat',
    e1rm: 0,
  });

  const programStart = data?.settings.programStart ?? '2026-04-14';
  const showStretch = data?.settings.showStretchTargets ?? false;
  const { week, benchmark } = useCurrentProgram(programStart, showStretch);

  const isToday = selectedDate === getDateString(new Date());

  const calculatedE1RM = useMemo(() => {
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    if (!w || !r || w <= 0 || r <= 0) return 0;
    return getEstimated1RM(w, r);
  }, [weight, reps]);

  const todaySets = useMemo(() => {
    if (!data) return [];
    return data.sets.filter((s) => s.date === selectedDate);
  }, [data, selectedDate]);

  const groupedSets = useMemo(() => {
    const groups: Record<string, SetLog[]> = {};
    todaySets.forEach((s) => {
      const key = s.exerciseName || s.exerciseId;
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return groups;
  }, [todaySets]);

  const handleDateBack = useCallback(() => {
    setSelectedDate((d) => addDays(d, -1));
    Haptics.selectionAsync();
  }, []);

  const handleDateForward = useCallback(() => {
    setSelectedDate((d) => addDays(d, 1));
    Haptics.selectionAsync();
  }, []);

  const handleDateToday = useCallback(() => {
    setSelectedDate(getDateString(new Date()));
    Haptics.selectionAsync();
  }, []);

  const handleLogSet = useCallback(async () => {
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    const numSets = parseInt(sets, 10) || 1;
    if (!w || !r || w <= 0 || r <= 0) {
      Alert.alert('Invalid input', 'Enter a valid weight and reps.');
      return;
    }
    setSubmitting(true);
    try {
      let lastEntry: SetLog | null = null;
      const existingCount = todaySets.filter(
        (s) => s.liftType === selectedLift && s.exerciseName === LIFT_LABELS[selectedLift]
      ).length;

      for (let i = 0; i < numSets; i++) {
        const entry = await addSet({
          date: selectedDate,
          week,
          dayIndex: 0,
          exerciseId: selectedLift,
          exerciseName: LIFT_LABELS[selectedLift],
          liftType: selectedLift,
          isMain: true,
          setNumber: existingCount + i + 1,
          weight: w,
          reps: r,
          rpe: rpe ?? undefined,
          notes: notes.trim() || undefined,
        });
        lastEntry = entry;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (lastEntry?.isPR && lastEntry.liftType) {
        setPrToast({ visible: true, liftType: lastEntry.liftType, e1rm: lastEntry.e1rm ?? 0 });
      }

      setWeight('');
      setReps('');
      setSets('1');
      setRpe(null);
      setNotes('');
    } catch (e) {
      Alert.alert('Error', 'Failed to log set.');
    } finally {
      setSubmitting(false);
    }
  }, [weight, reps, sets, rpe, notes, selectedDate, selectedLift, week, todaySets, addSet]);

  const handleRemoveSet = useCallback(
    (id: string) => {
      Alert.alert('Delete set?', 'This cannot be undone.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await removeSet(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]);
    },
    [removeSet]
  );

  if (loading || !data) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 80 }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <PRToast
        visible={prToast.visible}
        liftType={prToast.liftType}
        e1rm={prToast.e1rm}
        onDismiss={() => setPrToast((p) => ({ ...p, visible: false }))}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text style={styles.header}>LIFTS</Text>

        {/* Lift Type Selector */}
        <View style={styles.pillRow}>
          {LIFT_TYPES.map((type) => (
            <LiftPill
              key={type}
              type={type}
              selected={selectedLift === type}
              onPress={() => {
                setSelectedLift(type);
                Haptics.selectionAsync();
              }}
            />
          ))}
        </View>

        {/* Date Selector */}
        <View style={styles.dateRow}>
          <TouchableOpacity onPress={handleDateBack} style={styles.dateArrow}>
            <Text style={styles.dateArrowText}>{'<'}</Text>
          </TouchableOpacity>
          <View style={styles.dateCenter}>
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            <Text style={styles.dateSub}>{selectedDate}</Text>
          </View>
          <TouchableOpacity onPress={handleDateForward} style={styles.dateArrow}>
            <Text style={styles.dateArrowText}>{'>'}</Text>
          </TouchableOpacity>
          {!isToday && (
            <TouchableOpacity onPress={handleDateToday} style={styles.todayBtn}>
              <Text style={styles.todayBtnText}>TODAY</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Log Form */}
        <SectionLabel>QUICK LOG</SectionLabel>
        <Card borderColor={LIFT_COLORS[selectedLift]}>
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Reps</Text>
              <TextInput
                style={styles.input}
                value={reps}
                onChangeText={setReps}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Sets</Text>
              <TextInput
                style={styles.input}
                value={sets}
                onChangeText={setSets}
                keyboardType="numeric"
                placeholder="1"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>

          {/* RPE Selector */}
          <Text style={styles.formLabel}>RPE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rpeScroll}>
            <View style={styles.rpeRow}>
              {RPE_VALUES.map((val) => (
                <TouchableOpacity
                  key={val}
                  onPress={() => {
                    setRpe(rpe === val ? null : val);
                    Haptics.selectionAsync();
                  }}
                  style={[
                    styles.rpePill,
                    rpe === val && { backgroundColor: LIFT_COLORS[selectedLift] },
                  ]}
                >
                  <Text style={[styles.rpePillText, rpe === val && { color: '#000' }]}>
                    {val}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Notes */}
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Notes (optional)"
            placeholderTextColor={COLORS.textMuted}
            multiline
          />

          {/* E1RM */}
          {calculatedE1RM > 0 && (
            <View style={styles.e1rmRow}>
              <Text style={styles.e1rmLabel}>Est. 1RM</Text>
              <Text style={[styles.e1rmValue, { color: LIFT_COLORS[selectedLift] }]}>
                {formatNumber(calculatedE1RM)} kg
              </Text>
            </View>
          )}

          {/* Log Button */}
          <TouchableOpacity
            onPress={handleLogSet}
            disabled={submitting}
            style={[styles.logButton, { backgroundColor: LIFT_COLORS[selectedLift] }]}
            activeOpacity={0.7}
          >
            {submitting ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Text style={styles.logButtonText}>LOG SET</Text>
            )}
          </TouchableOpacity>
        </Card>

        {/* Today's Sets */}
        <SectionLabel>{`${formatDate(selectedDate).toUpperCase()} SETS`}</SectionLabel>
        {Object.keys(groupedSets).length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No sets logged for this date.</Text>
          </Card>
        ) : (
          Object.entries(groupedSets).map(([exerciseName, exerciseSets]) => {
            const liftType = exerciseSets[0]?.liftType;
            const borderColor = liftType ? LIFT_COLORS[liftType] : COLORS.border;
            return (
              <Card key={exerciseName} borderColor={borderColor}>
                <Text style={[styles.groupTitle, liftType ? { color: LIFT_COLORS[liftType] } : undefined]}>
                  {exerciseName}
                </Text>
                {exerciseSets.map((s) => (
                  <View key={s.id} style={styles.setRow}>
                    <View style={styles.setInfo}>
                      <Text style={styles.setText}>
                        {s.weight}kg x {s.reps}
                        {s.rpe ? ` @${s.rpe}` : ''}
                      </Text>
                      {s.e1rm ? (
                        <Text style={styles.setE1rm}>e1RM {s.e1rm}kg</Text>
                      ) : null}
                      {s.isPR && <Text style={styles.prBadge}>PR</Text>}
                    </View>
                    {s.notes ? <Text style={styles.setNotes}>{s.notes}</Text> : null}
                    <TouchableOpacity onPress={() => handleRemoveSet(s.id)} style={styles.deleteBtn}>
                      <Text style={styles.deleteBtnText}>X</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </Card>
            );
          })
        )}

        {/* Personal Bests */}
        <SectionLabel>PERSONAL BESTS</SectionLabel>
        {LIFT_TYPES.map((type) => {
          const bestE1rm = getBestE1RM(data.sets, type);
          const heaviest = getHeaviestSet(data.sets, type);
          const benchmarkKey = BENCHMARK_KEYS[type];
          const benchmarkVal = benchmark[benchmarkKey];
          const pct = benchmarkVal > 0 ? Math.round((bestE1rm / benchmarkVal) * 100) : 0;

          return (
            <Card key={type} borderColor={LIFT_COLORS[type]}>
              <View style={styles.pbHeader}>
                <Text style={[styles.pbTitle, { color: LIFT_COLORS[type] }]}>
                  {LIFT_LABELS[type]}
                </Text>
                {bestE1rm > 0 && (
                  <Text style={styles.pbPct}>
                    {pct}% of {formatNumber(benchmarkVal)}kg target
                  </Text>
                )}
              </View>

              {heaviest ? (
                <View style={styles.pbDetails}>
                  <View style={styles.pbStat}>
                    <Text style={styles.pbStatLabel}>Best Set</Text>
                    <Text style={styles.pbStatValue}>
                      {heaviest.weight}kg x {heaviest.reps}
                      {heaviest.rpe ? ` @${heaviest.rpe}` : ''}
                    </Text>
                  </View>
                  <View style={styles.pbStat}>
                    <Text style={styles.pbStatLabel}>Best E1RM</Text>
                    <Text style={[styles.pbStatValue, { color: LIFT_COLORS[type] }]}>
                      {formatNumber(bestE1rm)} kg
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.emptyText}>No sets logged yet.</Text>
              )}
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
}

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
    paddingTop: 8,
  },
  header: {
    fontFamily: MONO,
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 16,
  },

  // Lift pills
  pillRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },

  // Date selector
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  dateArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.ghostBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateArrowText: {
    fontFamily: MONO,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  dateCenter: {
    alignItems: 'center',
    minWidth: 100,
  },
  dateText: {
    fontFamily: MONO,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  dateSub: {
    fontFamily: MONO,
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  todayBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  todayBtnText: {
    fontFamily: MONO,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1,
  },

  // Quick log form
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  formField: {
    flex: 1,
  },
  formLabel: {
    fontFamily: MONO,
    fontSize: 10,
    color: COLORS.label,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    fontFamily: MONO,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.ghostBorder,
    borderRadius: 8,
    padding: 10,
    textAlign: 'center',
  },

  // RPE
  rpeScroll: {
    marginBottom: 12,
  },
  rpeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  rpePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.ghostBorder,
  },
  rpePillText: {
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // Notes
  notesInput: {
    fontFamily: MONO,
    fontSize: 13,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.ghostBorder,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    minHeight: 40,
  },

  // E1RM
  e1rmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  e1rmLabel: {
    fontFamily: MONO,
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  e1rmValue: {
    fontFamily: MONO,
    fontSize: 20,
    fontWeight: '900',
  },

  // Log button
  logButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logButtonText: {
    fontFamily: MONO,
    fontSize: 14,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 2,
  },

  // Empty state
  emptyText: {
    fontFamily: MONO,
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: 8,
  },

  // Set rows
  groupTitle: {
    fontFamily: MONO,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  setInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setText: {
    fontFamily: MONO,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  setE1rm: {
    fontFamily: MONO,
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  setNotes: {
    fontFamily: MONO,
    fontSize: 10,
    color: COLORS.textMuted,
    flex: 1,
    marginHorizontal: 8,
  },
  prBadge: {
    fontFamily: MONO,
    fontSize: 9,
    fontWeight: '900',
    color: '#000',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    letterSpacing: 1,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.danger,
  },

  // Personal bests
  pbHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pbTitle: {
    fontFamily: MONO,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pbPct: {
    fontFamily: MONO,
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  pbDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  pbStat: {
    flex: 1,
  },
  pbStatLabel: {
    fontFamily: MONO,
    fontSize: 10,
    color: COLORS.label,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  pbStatValue: {
    fontFamily: MONO,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
