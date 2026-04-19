import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppData } from '@/hooks/useAppData';
import { useCurrentProgram } from '@/hooks/useCurrentProgram';
import { useCalorieBalance } from '@/hooks/useCalorieBalance';
import { getDateString, addDays, formatDate, clamp } from '@/lib/helpers';
import { COLORS } from '@/lib/constants';
import { getTodaySteps } from '@/lib/pedometer';
import { Card, SectionLabel } from '@/components/Card';
import { SliderInput } from '@/components/SliderInput';
import { CalorieBalanceCard } from '@/components/CalorieBalanceCard';
import { ActivityInputCard } from '@/components/ActivityInputCard';
import { TDEEBreakdownView } from '@/components/TDEEBreakdown';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });
const TODAY = getDateString(new Date());

export default function LogScreen() {
  const insets = useSafeAreaInsets();
  const { data, loading, updateEntry } = useAppData();
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [tdeeExpanded, setTdeeExpanded] = useState(false);
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const programStart = data?.settings?.programStart || '2026-04-14';
  const { week, nutritionPhase } = useCurrentProgram(programStart);
  const { tdee, caloriesIn, netBalance, target, status, currentWeight } =
    useCalorieBalance(data, selectedDate);

  const entry = data?.entries[selectedDate] || { date: selectedDate };

  // Auto-sync steps on mount if setting enabled and date is today
  useEffect(() => {
    if (!data || selectedDate !== TODAY) return;
    if (!data.settings.autoSyncSteps) return;

    (async () => {
      const steps = await getTodaySteps();
      if (steps != null) {
        updateEntry(selectedDate, { steps, stepsAutoSynced: true });
      }
    })();
  }, [data?.settings?.autoSyncSteps, selectedDate]);

  // Debounced update
  const debouncedUpdate = useCallback(
    (field: string, value: any) => {
      if (debounceTimers.current[field]) {
        clearTimeout(debounceTimers.current[field]);
      }
      debounceTimers.current[field] = setTimeout(() => {
        updateEntry(selectedDate, { [field]: value });
      }, 400);
    },
    [selectedDate, updateEntry],
  );

  // Immediate update (for sliders / taps)
  const immediateUpdate = useCallback(
    (field: string, value: any) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      updateEntry(selectedDate, { [field]: value });
    },
    [selectedDate, updateEntry],
  );

  // Activity card handler
  const handleActivityUpdate = useCallback(
    (field: string, value: any) => {
      if (field === 'ebikeMinutes') {
        immediateUpdate(field, value);
      } else {
        debouncedUpdate(field, value);
      }
    },
    [debouncedUpdate, immediateUpdate],
  );

  // Date navigation
  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(prev => addDays(prev, -1));
  };
  const goForward = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(prev => addDays(prev, 1));
  };
  const goToday = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedDate(TODAY);
  };

  // Find session for selected date
  const session = data?.sessions.find(s => s.date === selectedDate) || null;
  const trainingBurn = tdee.training;
  const trainingDuration = session?.startTime && session?.endTime
    ? Math.round(
        (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000,
      )
    : null;

  // Nutrition target border colors
  const calInRange =
    (entry.calories || 0) === 0 ||
    ((entry.calories || 0) >= target.min && (entry.calories || 0) <= target.max);
  const proteinInRange =
    (entry.protein || 0) === 0 ||
    ((entry.protein || 0) >= nutritionPhase.protein[0] &&
      (entry.protein || 0) <= nutritionPhase.protein[1]);
  const carbsInRange =
    (entry.carbs || 0) === 0 ||
    ((entry.carbs || 0) >= nutritionPhase.carbs[0] &&
      (entry.carbs || 0) <= nutritionPhase.carbs[1]);
  const fatInRange =
    (entry.fat || 0) === 0 ||
    ((entry.fat || 0) >= nutritionPhase.fat[0] && (entry.fat || 0) <= nutritionPhase.fat[1]);

  if (loading || !data) {
    return (
      <View style={[styles.center, { backgroundColor: COLORS.background }]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── DATE PICKER ── */}
      <View style={styles.datePicker}>
        <TouchableOpacity onPress={goBack} style={styles.arrow} activeOpacity={0.6}>
          <Text style={styles.arrowText}>{'◀'}</Text>
        </TouchableOpacity>
        <View style={styles.dateCenter}>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          <Text style={styles.dateSub}>{selectedDate}</Text>
        </View>
        <TouchableOpacity onPress={goForward} style={styles.arrow} activeOpacity={0.6}>
          <Text style={styles.arrowText}>{'▶'}</Text>
        </TouchableOpacity>
        {selectedDate !== TODAY && (
          <TouchableOpacity onPress={goToday} style={styles.todayBtn} activeOpacity={0.7}>
            <Text style={styles.todayText}>TODAY</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── DAILY BALANCE SUMMARY ── */}
        <CalorieBalanceCard
          caloriesIn={caloriesIn}
          tdee={tdee}
          target={target}
          status={status}
          compact
        />

        {/* ── BODY ── */}
        <SectionLabel>BODY</SectionLabel>
        <Card delay={50}>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={entry.weight != null ? String(entry.weight) : ''}
                onChangeText={t => debouncedUpdate('weight', t ? parseFloat(t) || undefined : undefined)}
                keyboardType="decimal-pad"
                placeholder="—"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Waist (cm)</Text>
              <TextInput
                style={styles.input}
                value={entry.waist != null ? String(entry.waist) : ''}
                onChangeText={t => debouncedUpdate('waist', t ? parseFloat(t) || undefined : undefined)}
                keyboardType="decimal-pad"
                placeholder="—"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>
        </Card>

        {/* ── NUTRITION IN ── */}
        <SectionLabel>NUTRITION IN</SectionLabel>
        <Card
          delay={100}
          borderColor={
            (entry.calories || 0) > 0
              ? calInRange ? COLORS.success : COLORS.primary
              : undefined
          }
        >
          <Text style={styles.phaseTag}>
            {nutritionPhase.name} — Week {week}
          </Text>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>
                Calories ({target.min}–{target.max})
              </Text>
              <TextInput
                style={[
                  styles.input,
                  (entry.calories || 0) > 0 && {
                    borderColor: calInRange ? COLORS.success : COLORS.primary,
                  },
                ]}
                value={entry.calories != null ? String(entry.calories) : ''}
                onChangeText={t =>
                  debouncedUpdate('calories', t ? parseInt(t) || undefined : undefined)
                }
                keyboardType="number-pad"
                placeholder="kcal"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>
                Protein ({nutritionPhase.protein[0]}–{nutritionPhase.protein[1]}g)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  (entry.protein || 0) > 0 && {
                    borderColor: proteinInRange ? COLORS.success : COLORS.primary,
                  },
                ]}
                value={entry.protein != null ? String(entry.protein) : ''}
                onChangeText={t =>
                  debouncedUpdate('protein', t ? parseInt(t) || undefined : undefined)
                }
                keyboardType="number-pad"
                placeholder="g"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>
                Carbs ({nutritionPhase.carbs[0]}–{nutritionPhase.carbs[1]}g)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  (entry.carbs || 0) > 0 && {
                    borderColor: carbsInRange ? COLORS.success : COLORS.primary,
                  },
                ]}
                value={entry.carbs != null ? String(entry.carbs) : ''}
                onChangeText={t =>
                  debouncedUpdate('carbs', t ? parseInt(t) || undefined : undefined)
                }
                keyboardType="number-pad"
                placeholder="g"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>
                Fat ({nutritionPhase.fat[0]}–{nutritionPhase.fat[1]}g)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  (entry.fat || 0) > 0 && {
                    borderColor: fatInRange ? COLORS.success : COLORS.primary,
                  },
                ]}
                value={entry.fat != null ? String(entry.fat) : ''}
                onChangeText={t =>
                  debouncedUpdate('fat', t ? parseInt(t) || undefined : undefined)
                }
                keyboardType="number-pad"
                placeholder="g"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>
        </Card>

        {/* ── ACTIVITY OUT ── */}
        <SectionLabel>ACTIVITY OUT</SectionLabel>
        <Card delay={150}>
          <ActivityInputCard
            steps={entry.steps}
            stepsAutoSynced={entry.stepsAutoSynced || false}
            ebikeMinutes={entry.ebikeMinutes}
            otherCardioKcal={entry.otherCardioKcal}
            otherCardioNotes={entry.otherCardioNotes}
            trainingBurn={trainingBurn}
            trainingDuration={trainingDuration}
            currentWeight={currentWeight}
            onUpdate={handleActivityUpdate}
          />
        </Card>

        {/* ── TDEE BREAKDOWN (expandable) ── */}
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setTdeeExpanded(prev => !prev);
          }}
          activeOpacity={0.7}
        >
          <SectionLabel>{tdeeExpanded ? 'TDEE BREAKDOWN ▾' : 'TDEE BREAKDOWN ▸'}</SectionLabel>
        </TouchableOpacity>
        {tdeeExpanded && (
          <Card delay={0}>
            <TDEEBreakdownView tdee={tdee} currentWeight={currentWeight} />
          </Card>
        )}

        {/* ── RECOVERY ── */}
        <SectionLabel>RECOVERY</SectionLabel>
        <Card delay={200}>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Sleep (hrs)</Text>
              <TextInput
                style={styles.input}
                value={entry.sleep != null ? String(entry.sleep) : ''}
                onChangeText={t =>
                  debouncedUpdate('sleep', t ? parseFloat(t) || undefined : undefined)
                }
                keyboardType="decimal-pad"
                placeholder="—"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Resting HR</Text>
              <TextInput
                style={styles.input}
                value={entry.restingHR != null ? String(entry.restingHR) : ''}
                onChangeText={t =>
                  debouncedUpdate('restingHR', t ? parseInt(t) || undefined : undefined)
                }
                keyboardType="number-pad"
                placeholder="bpm"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>
          <View style={[styles.row, { marginBottom: 0 }]}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>HRV</Text>
              <TextInput
                style={styles.input}
                value={entry.hrv != null ? String(entry.hrv) : ''}
                onChangeText={t =>
                  debouncedUpdate('hrv', t ? parseInt(t) || undefined : undefined)
                }
                keyboardType="number-pad"
                placeholder="ms"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
            <View style={styles.halfInput} />
          </View>

          <View style={styles.sliderGroup}>
            <SliderInput
              label="Recovery"
              value={entry.recovery || 5}
              onChange={v => immediateUpdate('recovery', v)}
            />
            <SliderInput
              label="Energy"
              value={entry.energy || 5}
              onChange={v => immediateUpdate('energy', v)}
            />
            <SliderInput
              label="Mood"
              value={entry.mood || 5}
              onChange={v => immediateUpdate('mood', v)}
            />
          </View>
        </Card>

        {/* ── NOTES ── */}
        <SectionLabel>NOTES</SectionLabel>
        <Card delay={250}>
          <TextInput
            style={styles.notesInput}
            value={entry.notes || ''}
            onChangeText={t => debouncedUpdate('notes', t)}
            placeholder="How did today go? Anything to note..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },

  /* ── Date picker ── */
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  arrow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  arrowText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontFamily: mono,
  },
  dateCenter: {
    alignItems: 'center',
    minWidth: 120,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: mono,
  },
  dateSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: mono,
    marginTop: 2,
  },
  todayBtn: {
    position: 'absolute',
    right: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  todayText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    fontFamily: mono,
    letterSpacing: 1,
  },

  /* ── Inputs ── */
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  halfInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontFamily: mono,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontFamily: mono,
  },
  phaseTag: {
    fontSize: 10,
    color: COLORS.primary,
    fontFamily: mono,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  /* ── Recovery ── */
  sliderGroup: {
    marginTop: 16,
  },

  /* ── Notes ── */
  notesInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: mono,
    minHeight: 100,
  },
});
