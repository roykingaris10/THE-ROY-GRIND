import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS, LIFT_COLORS } from '@/lib/constants';
import { useAppData } from '@/hooks/useAppData';
import { useCurrentProgram } from '@/hooks/useCurrentProgram';
import {
  getDateString,
  addDays,
  formatDate,
  getEstimated1RM,
  getBestE1RM,
  getHeaviestLift,
} from '@/lib/helpers';
import { Card, SectionLabel } from '@/components/Card';
import { LiftPill } from '@/components/LiftPill';
import { PRToast } from '@/components/PRToast';
import type { LiftType, LiftEntry } from '@/types';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

const RPE_OPTIONS = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];

export default function LiftsScreen() {
  const { data, loading, addLift, removeLift } = useAppData();
  const insets = useSafeAreaInsets();

  const [selectedDate, setSelectedDate] = useState(getDateString(new Date()));
  const [liftType, setLiftType] = useState<LiftType>('squat');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('1');
  const [rpe, setRpe] = useState(8);
  const [notes, setNotes] = useState('');

  const [prVisible, setPrVisible] = useState(false);
  const [prLiftType, setPrLiftType] = useState<LiftType>('squat');
  const [prE1rm, setPrE1rm] = useState(0);

  const programStart = data?.settings?.programStart || '2026-04-14';
  const program = useCurrentProgram(programStart);

  if (loading || !data) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const isToday = selectedDate === getDateString(new Date());
  const w = parseFloat(weight) || 0;
  const r = parseInt(reps) || 0;
  const s = parseInt(sets) || 1;
  const calculatedE1rm = w > 0 && r > 0 ? getEstimated1RM(w, r) : 0;

  const todayLifts = data.lifts
    .filter(l => l.date === selectedDate)
    .sort((a, b) => parseInt(b.id) - parseInt(a.id));

  const handleLog = async () => {
    if (w <= 0 || r <= 0) {
      Alert.alert('Invalid Input', 'Enter weight and reps.');
      return;
    }
    if (w > 500) {
      Alert.alert('Invalid Input', 'Weight must be under 500kg.');
      return;
    }
    if (r > 30) {
      Alert.alert('Invalid Input', 'Reps must be 30 or fewer.');
      return;
    }

    const prevBestE1rm = getBestE1RM(data.lifts, liftType);

    const entry = await addLift({
      date: selectedDate,
      type: liftType,
      weight: w,
      reps: r,
      sets: s,
      rpe,
      notes: notes || undefined,
    });

    const newE1rm = entry.e1rm || calculatedE1rm;
    if (newE1rm > prevBestE1rm && prevBestE1rm > 0) {
      setPrLiftType(liftType);
      setPrE1rm(newE1rm);
      setPrVisible(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setWeight('');
    setReps('');
    setSets('1');
    setNotes('');
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Lift', 'Remove this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => removeLift(id),
      },
    ]);
  };

  // Recent PRs
  const liftTypes: LiftType[] = ['squat', 'bench', 'deadlift'];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <PRToast
        visible={prVisible}
        liftType={prLiftType}
        e1rm={prE1rm}
        onDismiss={() => setPrVisible(false)}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Quick Log */}
        <SectionLabel>LOG SET</SectionLabel>
        <Card delay={0}>
          {/* Lift Type Selector */}
          <View style={styles.pillRow}>
            {liftTypes.map(t => (
              <LiftPill
                key={t}
                type={t}
                selected={liftType === t}
                onPress={() => setLiftType(t)}
              />
            ))}
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>WEIGHT (KG)</Text>
              <TextInput
                style={styles.textInput}
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>REPS</Text>
              <TextInput
                style={styles.textInput}
                value={reps}
                onChangeText={setReps}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>SETS</Text>
              <TextInput
                style={styles.textInput}
                value={sets}
                onChangeText={setSets}
                keyboardType="number-pad"
                placeholder="1"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>

          {/* RPE Selector */}
          <Text style={styles.inputLabel}>RPE</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 12 }}
          >
            <View style={styles.rpeRow}>
              {RPE_OPTIONS.map(r => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRpe(r)}
                  style={[
                    styles.rpeBtn,
                    rpe === r && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.rpeBtnText,
                      rpe === r && { color: '#fff' },
                    ]}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Notes */}
          <TextInput
            style={[styles.textInput, { marginBottom: 12 }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Notes (optional)"
            placeholderTextColor={COLORS.textMuted}
          />

          {/* E1RM Display */}
          {calculatedE1rm > 0 && (
            <Text style={[styles.e1rmText, { color: LIFT_COLORS[liftType] }]}>
              Est. 1RM: {calculatedE1rm}kg (Epley)
            </Text>
          )}

          {/* Log Button */}
          <TouchableOpacity
            onPress={handleLog}
            style={styles.logBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.logBtnText}>LOG SET</Text>
          </TouchableOpacity>
        </Card>

        {/* Date selector */}
        <View style={styles.datePicker}>
          <TouchableOpacity
            onPress={() => setSelectedDate(addDays(selectedDate, -1))}
            style={styles.dateArrow}
          >
            <Text style={styles.dateArrowText}>{'<'}</Text>
          </TouchableOpacity>
          <View style={styles.dateCenter}>
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setSelectedDate(addDays(selectedDate, 1))}
            style={styles.dateArrow}
          >
            <Text style={styles.dateArrowText}>{'>'}</Text>
          </TouchableOpacity>
          {!isToday && (
            <TouchableOpacity
              onPress={() => setSelectedDate(getDateString(new Date()))}
              style={styles.todayBtn}
            >
              <Text style={styles.todayBtnText}>TODAY</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Today's Lifts */}
        <SectionLabel>{`LIFTS — ${formatDate(selectedDate).toUpperCase()}`}</SectionLabel>
        <Card delay={50}>
          {todayLifts.length === 0 ? (
            <Text style={styles.emptyText}>No lifts logged for this date</Text>
          ) : (
            todayLifts.map(lift => (
              <View key={lift.id} style={styles.liftRow}>
                <View style={[styles.liftTag, { backgroundColor: LIFT_COLORS[lift.type] }]}>
                  <Text style={styles.liftTagText}>
                    {lift.type.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.liftInfo}>
                  <Text style={styles.liftDetail}>
                    {lift.weight}kg x {lift.reps} x {lift.sets} @RPE {lift.rpe}
                  </Text>
                  {lift.notes && (
                    <Text style={styles.liftNotes} numberOfLines={1}>
                      {lift.notes}
                    </Text>
                  )}
                </View>
                <Text style={[styles.liftE1rm, { color: LIFT_COLORS[lift.type] }]}>
                  E1RM: {lift.e1rm}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDelete(lift.id)}
                  style={styles.deleteBtn}
                >
                  <Text style={styles.deleteBtnText}>X</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </Card>

        {/* Recent PRs */}
        <SectionLabel>PERSONAL BESTS</SectionLabel>
        <Card delay={100}>
          {liftTypes.map(type => {
            const best = getHeaviestLift(data.lifts, type);
            const bestE1rm = getBestE1RM(data.lifts, type);
            const benchmarkVal =
              type === 'squat'
                ? program.benchmark.sq
                : type === 'bench'
                ? program.benchmark.bn
                : program.benchmark.dl;
            const color = LIFT_COLORS[type];
            const label = type.charAt(0).toUpperCase() + type.slice(1);
            const diff = bestE1rm > 0 ? ((bestE1rm / benchmarkVal) * 100 - 100).toFixed(0) : null;

            return (
              <View key={type} style={styles.prRow}>
                <Text style={[styles.prLabel, { color }]}>{label}</Text>
                {best ? (
                  <View>
                    <Text style={styles.prDetail}>
                      {best.weight}kg x {best.reps} @RPE {best.rpe} — {formatDate(best.date)}
                    </Text>
                    <Text style={[styles.prE1rm, { color }]}>
                      E1RM: {bestE1rm}kg (target: {benchmarkVal}kg){' '}
                      {diff !== null && (
                        <Text style={{ color: parseInt(diff) >= 0 ? COLORS.success : COLORS.warning }}>
                          {parseInt(diff) >= 0 ? '+' : ''}{diff}%
                        </Text>
                      )}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.emptyText}>No data</Text>
                )}
              </View>
            );
          })}
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
  pillRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  inputCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 9,
    color: COLORS.label,
    fontFamily: mono,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontFamily: mono,
  },
  rpeRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
  },
  rpeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.ghostBorder,
    borderRadius: 6,
  },
  rpeBtnText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: mono,
    fontWeight: '600',
  },
  e1rmText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: mono,
    marginBottom: 12,
    textAlign: 'center',
  },
  logBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
    fontFamily: mono,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 12,
  },
  dateArrow: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.ghostBorder,
    borderRadius: 8,
  },
  dateArrowText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontFamily: mono,
    fontWeight: '700',
  },
  dateCenter: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: mono,
  },
  todayBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  todayBtnText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    fontFamily: mono,
    letterSpacing: 1,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: mono,
    textAlign: 'center',
    paddingVertical: 8,
  },
  liftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  liftTag: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liftTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000',
    fontFamily: mono,
  },
  liftInfo: {
    flex: 1,
  },
  liftDetail: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontFamily: mono,
  },
  liftNotes: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: mono,
    marginTop: 2,
  },
  liftE1rm: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: mono,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 6,
  },
  deleteBtnText: {
    fontSize: 12,
    color: COLORS.danger,
    fontFamily: mono,
    fontWeight: '700',
  },
  prRow: {
    marginBottom: 14,
  },
  prLabel: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: mono,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  prDetail: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: mono,
  },
  prE1rm: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: mono,
    marginTop: 2,
  },
});
