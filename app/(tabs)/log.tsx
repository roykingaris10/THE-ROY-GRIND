import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/lib/constants';
import { useAppData } from '@/hooks/useAppData';
import { useCurrentProgram } from '@/hooks/useCurrentProgram';
import { getDateString, addDays, formatDate, clamp } from '@/lib/helpers';
import { Card, SectionLabel } from '@/components/Card';
import { SliderInput } from '@/components/SliderInput';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

function NumberInput({
  label,
  value,
  onChange,
  step = 1,
  unit,
  min,
  max,
  hint,
  borderColor,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  step?: number;
  unit?: string;
  min?: number;
  max?: number;
  hint?: string;
  borderColor?: string;
}) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleChange = (text: string) => {
    if (text === '') {
      onChange(undefined);
      return;
    }
    let num = parseFloat(text);
    if (isNaN(num)) return;
    if (min !== undefined && max !== undefined) {
      num = clamp(num, min, max);
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 100);
    onChange(num);
  };

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}{unit ? ` (${unit})` : ''}</Text>
      <TextInput
        style={[
          styles.textInput,
          borderColor ? { borderColor } : undefined,
        ]}
        value={value !== undefined ? String(value) : ''}
        onChangeText={handleChange}
        keyboardType="decimal-pad"
        placeholderTextColor={COLORS.textMuted}
        placeholder="--"
      />
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

export default function LogScreen() {
  const { data, loading, updateEntry } = useAppData();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(getDateString(new Date()));

  const programStart = data?.settings?.programStart || '2026-04-14';
  const program = useCurrentProgram(programStart);

  if (loading || !data) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const entry = data.entries[selectedDate] || {};
  const { nutritionPhase } = program;

  const isToday = selectedDate === getDateString(new Date());

  const update = (field: string, value: any) => {
    updateEntry(selectedDate, { [field]: value });
  };

  const calInRange =
    entry.calories !== undefined &&
    entry.calories >= nutritionPhase.calories[0] &&
    entry.calories <= nutritionPhase.calories[1];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Date Picker */}
        <View style={styles.datePicker}>
          <TouchableOpacity
            onPress={() => setSelectedDate(addDays(selectedDate, -1))}
            style={styles.dateArrow}
          >
            <Text style={styles.dateArrowText}>{'<'}</Text>
          </TouchableOpacity>
          <View style={styles.dateCenter}>
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            <Text style={styles.dateSubtext}>{selectedDate}</Text>
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

        {/* Body Section */}
        <SectionLabel>BODY</SectionLabel>
        <Card delay={0}>
          <NumberInput
            label="Weight"
            value={entry.weight}
            onChange={v => update('weight', v)}
            step={0.1}
            unit="kg"
            min={50}
            max={250}
          />
          <NumberInput
            label="Waist"
            value={entry.waist}
            onChange={v => update('waist', v)}
            step={0.5}
            unit="cm"
          />
        </Card>

        {/* Nutrition Section */}
        <SectionLabel>NUTRITION</SectionLabel>
        <Card delay={50}>
          <NumberInput
            label="Calories"
            value={entry.calories}
            onChange={v => update('calories', v)}
            unit="kcal"
            borderColor={
              entry.calories !== undefined
                ? calInRange
                  ? COLORS.success
                  : COLORS.warning
                : undefined
            }
          />
          <NumberInput
            label="Protein"
            value={entry.protein}
            onChange={v => update('protein', v)}
            unit="g"
          />
          <NumberInput
            label="Carbs"
            value={entry.carbs}
            onChange={v => update('carbs', v)}
            unit="g"
          />
          <NumberInput
            label="Fat"
            value={entry.fat}
            onChange={v => update('fat', v)}
            unit="g"
          />
          <Text style={styles.phaseTarget}>
            {nutritionPhase.name}: {nutritionPhase.calories[0]}–{nutritionPhase.calories[1]} kcal | {nutritionPhase.protein[0]}–{nutritionPhase.protein[1]}g protein
          </Text>
        </Card>

        {/* Activity Section */}
        <SectionLabel>ACTIVITY</SectionLabel>
        <Card delay={100}>
          <NumberInput
            label="Steps"
            value={entry.steps}
            onChange={v => update('steps', v)}
            min={0}
            max={50000}
            hint="Target: 8,000–10,000 steps"
          />
          <NumberInput
            label="Cycling"
            value={entry.cycling}
            onChange={v => update('cycling', v)}
            unit="min"
          />
        </Card>

        {/* Recovery Section */}
        <SectionLabel>RECOVERY</SectionLabel>
        <Card delay={150}>
          <NumberInput
            label="Sleep"
            value={entry.sleep}
            onChange={v => update('sleep', v)}
            step={0.5}
            unit="hours"
            min={0}
            max={14}
          />
          <NumberInput
            label="Resting HR"
            value={entry.restingHR}
            onChange={v => update('restingHR', v)}
            unit="bpm"
          />
          <View style={{ marginTop: 8 }}>
            <SliderInput
              label="Recovery"
              value={entry.recovery || 5}
              min={1}
              max={10}
              onChange={v => update('recovery', v)}
            />
            <SliderInput
              label="Energy"
              value={entry.energy || 5}
              min={1}
              max={10}
              onChange={v => update('energy', v)}
            />
            <SliderInput
              label="Mood / Motivation"
              value={entry.mood || 5}
              min={1}
              max={10}
              onChange={v => update('mood', v)}
            />
          </View>
        </Card>

        {/* Notes Section */}
        <SectionLabel>NOTES</SectionLabel>
        <Card delay={200}>
          <TextInput
            style={styles.notesInput}
            value={entry.notes || ''}
            onChangeText={text => update('notes', text)}
            placeholder="Joint pain, how training felt, anything noteworthy..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
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
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 12,
  },
  dateArrow: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.ghostBorder,
    borderRadius: 8,
  },
  dateArrowText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    fontFamily: mono,
    fontWeight: '700',
  },
  dateCenter: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: mono,
  },
  dateSubtext: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: mono,
    marginTop: 2,
  },
  todayBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  todayBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    fontFamily: mono,
    letterSpacing: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: mono,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
  hint: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: mono,
    marginTop: 4,
  },
  phaseTarget: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontFamily: mono,
    marginTop: 4,
    lineHeight: 16,
  },
  notesInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    color: COLORS.textPrimary,
    fontFamily: mono,
    minHeight: 100,
  },
});
