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
  Keyboard,
  InputAccessoryView,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppData } from '@/hooks/useAppData';
import { useCurrentProgram } from '@/hooks/useCurrentProgram';
import { useCalorieBalance } from '@/hooks/useCalorieBalance';
import { getDateString, addDays, formatDate, clamp } from '@/lib/helpers';
import { COLORS } from '@/lib/constants';
import { FONTS } from '@/lib/typography';
import { playTap, playSelection } from '@/lib/sounds';
import { getTodaySteps } from '@/lib/pedometer';
import { Card, SectionLabel } from '@/components/Card';
import { SliderInput } from '@/components/SliderInput';
import { CalorieBalanceCard } from '@/components/CalorieBalanceCard';
import { ActivityInputCard } from '@/components/ActivityInputCard';
import { TDEEBreakdownView } from '@/components/TDEEBreakdown';
import { DebouncedInput } from '@/components/DebouncedInput';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });
const TODAY = getDateString(new Date());
const INPUT_ACCESSORY_ID = 'log-input-done';

export default function LogScreen() {
  const insets = useSafeAreaInsets();
  const { data, loading, updateEntry } = useAppData();
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [tdeeExpanded, setTdeeExpanded] = useState(false);

  const programStart = data?.settings?.programStart || '2026-04-14';
  const { week, nutritionPhase } = useCurrentProgram(programStart);
  const { tdee, caloriesIn, netBalance, target, status, currentWeight } =
    useCalorieBalance(data, selectedDate);

  const entry = data?.entries[selectedDate] || { date: selectedDate };

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

  const handleFieldUpdate = useCallback(
    (field: string, parser: (t: string) => any) => (text: string) => {
      const parsed = text ? parser(text) : undefined;
      updateEntry(selectedDate, { [field]: parsed });
    },
    [selectedDate, updateEntry],
  );

  const immediateUpdate = useCallback(
    (field: string, value: any) => {
      playSelection();
      updateEntry(selectedDate, { [field]: value });
    },
    [selectedDate, updateEntry],
  );

  const handleActivityUpdate = useCallback(
    (field: string, value: any) => {
      if (field === 'ebikeMinutes') {
        immediateUpdate(field, value);
      } else {
        updateEntry(selectedDate, { [field]: value });
      }
    },
    [selectedDate, updateEntry, immediateUpdate],
  );

  const goBack = () => { playTap(); setSelectedDate(prev => addDays(prev, -1)); };
  const goForward = () => { playTap(); setSelectedDate(prev => addDays(prev, 1)); };
  const goToday = () => { playTap(); setSelectedDate(TODAY); };

  const session = data?.sessions.find(s => s.date === selectedDate) || null;
  const trainingBurn = tdee.training;
  const trainingDuration = session?.startTime && session?.endTime
    ? Math.round(
        (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000,
      )
    : null;

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
      {/* Done button for numeric keyboards */}
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={INPUT_ACCESSORY_ID}>
          <View style={styles.accessoryBar}>
            <TouchableOpacity onPress={Keyboard.dismiss} style={styles.doneBtn}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}

      {/* Date picker */}
      <View style={styles.datePicker}>
        <TouchableOpacity onPress={goBack} style={styles.arrow} activeOpacity={0.6}>
          <Text style={styles.arrowText}>{'\u25C0'}</Text>
        </TouchableOpacity>
        <View style={styles.dateCenter}>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          <Text style={styles.dateSub}>{selectedDate}</Text>
        </View>
        <TouchableOpacity onPress={goForward} style={styles.arrow} activeOpacity={0.6}>
          <Text style={styles.arrowText}>{'\u25B6'}</Text>
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
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {/* Daily balance */}
        <CalorieBalanceCard
          caloriesIn={caloriesIn}
          tdee={tdee}
          target={target}
          status={status}
          compact
        />

        {/* Body */}
        <SectionLabel>BODY</SectionLabel>
        <Card delay={50}>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <DebouncedInput
                style={styles.input}
                value={entry.weight != null ? String(entry.weight) : ''}
                onDebouncedChange={handleFieldUpdate('weight', parseFloat)}
                keyboardType="decimal-pad"
                placeholder="\u2014"
                placeholderTextColor={COLORS.textMuted}
                inputAccessoryViewID={Platform.OS === 'ios' ? INPUT_ACCESSORY_ID : undefined}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Waist (cm)</Text>
              <DebouncedInput
                style={styles.input}
                value={entry.waist != null ? String(entry.waist) : ''}
                onDebouncedChange={handleFieldUpdate('waist', parseFloat)}
                keyboardType="decimal-pad"
                placeholder="\u2014"
                placeholderTextColor={COLORS.textMuted}
                inputAccessoryViewID={Platform.OS === 'ios' ? INPUT_ACCESSORY_ID : undefined}
              />
            </View>
          </View>
        </Card>

        {/* Nutrition */}
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
            {nutritionPhase.name} \u2014 Week {week}
          </Text>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>
                Calories ({target.min}\u2013{target.max})
              </Text>
              <DebouncedInput
                style={[
                  styles.input,
                  (entry.calories || 0) > 0 && {
                    borderColor: calInRange ? COLORS.success : COLORS.primary,
                  },
                ]}
                value={entry.calories != null ? String(entry.calories) : ''}
                onDebouncedChange={handleFieldUpdate('calories', (t) => parseInt(t))}
                keyboardType="number-pad"
                placeholder="kcal"
                placeholderTextColor={COLORS.textMuted}
                inputAccessoryViewID={Platform.OS === 'ios' ? INPUT_ACCESSORY_ID : undefined}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>
                Protein ({nutritionPhase.protein[0]}\u2013{nutritionPhase.protein[1]}g)
              </Text>
              <DebouncedInput
                style={[
                  styles.input,
                  (entry.protein || 0) > 0 && {
                    borderColor: proteinInRange ? COLORS.success : COLORS.primary,
                  },
                ]}
                value={entry.protein != null ? String(entry.protein) : ''}
                onDebouncedChange={handleFieldUpdate('protein', (t) => parseInt(t))}
                keyboardType="number-pad"
                placeholder="g"
                placeholderTextColor={COLORS.textMuted}
                inputAccessoryViewID={Platform.OS === 'ios' ? INPUT_ACCESSORY_ID : undefined}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>
                Carbs ({nutritionPhase.carbs[0]}\u2013{nutritionPhase.carbs[1]}g)
              </Text>
              <DebouncedInput
                style={[
                  styles.input,
                  (entry.carbs || 0) > 0 && {
                    borderColor: carbsInRange ? COLORS.success : COLORS.primary,
                  },
                ]}
                value={entry.carbs != null ? String(entry.carbs) : ''}
                onDebouncedChange={handleFieldUpdate('carbs', (t) => parseInt(t))}
                keyboardType="number-pad"
                placeholder="g"
                placeholderTextColor={COLORS.textMuted}
                inputAccessoryViewID={Platform.OS === 'ios' ? INPUT_ACCESSORY_ID : undefined}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>
                Fat ({nutritionPhase.fat[0]}\u2013{nutritionPhase.fat[1]}g)
              </Text>
              <DebouncedInput
                style={[
                  styles.input,
                  (entry.fat || 0) > 0 && {
                    borderColor: fatInRange ? COLORS.success : COLORS.primary,
                  },
                ]}
                value={entry.fat != null ? String(entry.fat) : ''}
                onDebouncedChange={handleFieldUpdate('fat', (t) => parseInt(t))}
                keyboardType="number-pad"
                placeholder="g"
                placeholderTextColor={COLORS.textMuted}
                inputAccessoryViewID={Platform.OS === 'ios' ? INPUT_ACCESSORY_ID : undefined}
              />
            </View>
          </View>
        </Card>

        {/* Activity */}
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

        {/* TDEE */}
        <TouchableOpacity
          onPress={() => {
            playTap();
            setTdeeExpanded(prev => !prev);
          }}
          activeOpacity={0.7}
        >
          <SectionLabel>{tdeeExpanded ? 'TDEE BREAKDOWN \u25BE' : 'TDEE BREAKDOWN \u25B8'}</SectionLabel>
        </TouchableOpacity>
        {tdeeExpanded && (
          <Card delay={0}>
            <TDEEBreakdownView tdee={tdee} currentWeight={currentWeight} />
          </Card>
        )}

        {/* Recovery */}
        <SectionLabel>RECOVERY</SectionLabel>
        <Card delay={200}>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Sleep (hrs)</Text>
              <DebouncedInput
                style={styles.input}
                value={entry.sleep != null ? String(entry.sleep) : ''}
                onDebouncedChange={handleFieldUpdate('sleep', parseFloat)}
                keyboardType="decimal-pad"
                placeholder="\u2014"
                placeholderTextColor={COLORS.textMuted}
                inputAccessoryViewID={Platform.OS === 'ios' ? INPUT_ACCESSORY_ID : undefined}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Resting HR</Text>
              <DebouncedInput
                style={styles.input}
                value={entry.restingHR != null ? String(entry.restingHR) : ''}
                onDebouncedChange={handleFieldUpdate('restingHR', (t) => parseInt(t))}
                keyboardType="number-pad"
                placeholder="bpm"
                placeholderTextColor={COLORS.textMuted}
                inputAccessoryViewID={Platform.OS === 'ios' ? INPUT_ACCESSORY_ID : undefined}
              />
            </View>
          </View>
          <View style={[styles.row, { marginBottom: 0 }]}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>HRV</Text>
              <DebouncedInput
                style={styles.input}
                value={entry.hrv != null ? String(entry.hrv) : ''}
                onDebouncedChange={handleFieldUpdate('hrv', (t) => parseInt(t))}
                keyboardType="number-pad"
                placeholder="ms"
                placeholderTextColor={COLORS.textMuted}
                inputAccessoryViewID={Platform.OS === 'ios' ? INPUT_ACCESSORY_ID : undefined}
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

        {/* Notes */}
        <SectionLabel>NOTES</SectionLabel>
        <Card delay={250}>
          <DebouncedInput
            style={styles.notesInput}
            value={entry.notes || ''}
            onDebouncedChange={text => updateEntry(selectedDate, { notes: text })}
            placeholder="How did today go? Anything to note..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            returnKeyType="default"
            onSubmitEditing={undefined}
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

  accessoryBar: {
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  doneBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E8EAF0',
    fontFamily: mono,
  },

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
    borderRadius: 6,
  },
  todayText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    fontFamily: mono,
    letterSpacing: 1,
  },

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
    borderRadius: 10,
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

  sliderGroup: {
    marginTop: 16,
  },

  notesInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: mono,
    minHeight: 100,
  },
});
