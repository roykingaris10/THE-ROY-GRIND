import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Keyboard,
  InputAccessoryView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppData } from '@/hooks/useAppData';
import { useCurrentProgram } from '@/hooks/useCurrentProgram';
import { useCalorieBalance } from '@/hooks/useCalorieBalance';
import { getDateString, addDays, formatDate } from '@/lib/helpers';
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
      if (steps != null) updateEntry(selectedDate, { steps, stepsAutoSynced: true });
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
    ? Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000) : null;

  const calInRange = (entry.calories || 0) === 0 || ((entry.calories || 0) >= target.min && (entry.calories || 0) <= target.max);
  const proteinInRange = (entry.protein || 0) === 0 || ((entry.protein || 0) >= nutritionPhase.protein[0] && (entry.protein || 0) <= nutritionPhase.protein[1]);

  if (loading || !data) {
    return (
      <View style={[styles.center, { backgroundColor: COLORS.background }]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={INPUT_ACCESSORY_ID}>
          <View style={styles.accessoryBar}>
            <TouchableOpacity onPress={Keyboard.dismiss} style={styles.doneBtn}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}

      {/* Header */}
      <View style={styles.headerSection}>
        <View>
          <Text style={styles.headerTitle}>Daily Log</Text>
          <Text style={styles.headerSub}>
            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()} {'\u00B7'} {formatDate(selectedDate).toUpperCase()}
          </Text>
        </View>
        <View style={styles.dateNav}>
          <TouchableOpacity onPress={goBack} style={styles.navArrow}><Text style={styles.navArrowText}>{'\u25C0'}</Text></TouchableOpacity>
          <TouchableOpacity onPress={goForward} style={styles.navArrow}><Text style={styles.navArrowText}>{'\u25B6'}</Text></TouchableOpacity>
          {selectedDate !== TODAY && (
            <TouchableOpacity onPress={goToday} style={styles.todayBtn}>
              <Text style={styles.todayText}>TODAY</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {/* Balance summary */}
        <Card style={{ marginBottom: 12 }} glow>
          <Text style={styles.cardLabel}>DAILY BALANCE</Text>
          <View style={styles.balanceGrid}>
            <View>
              <Text style={styles.balanceSub}>IN</Text>
              <Text style={styles.balanceNum}>{caloriesIn.toLocaleString()}</Text>
            </View>
            <View style={styles.balanceDivider}>
              <Text style={styles.balanceSub}>OUT</Text>
              <Text style={[styles.balanceNum, { color: COLORS.purpleWarm }]}>{tdee.total.toLocaleString()}</Text>
            </View>
            <View style={{ paddingLeft: 10 }}>
              <Text style={styles.balanceSub}>NET</Text>
              <Text style={[styles.balanceNum, { color: netBalance < 0 ? COLORS.success : COLORS.warning }]}>
                {netBalance < 0 ? '\u2212' : '+'}{Math.abs(netBalance).toLocaleString()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Body */}
        <Card delay={50}>
          <Text style={styles.cardLabel}>BODY</Text>
          <View style={styles.inputGrid}>
            <InputCell
              label="WEIGHT" unit="kg"
              value={entry.weight != null ? String(entry.weight) : ''}
              onDebouncedChange={handleFieldUpdate('weight', parseFloat)}
              accessoryId={INPUT_ACCESSORY_ID}
            />
            <InputCell
              label="WAIST" unit="cm"
              value={entry.waist != null ? String(entry.waist) : ''}
              onDebouncedChange={handleFieldUpdate('waist', parseFloat)}
              accessoryId={INPUT_ACCESSORY_ID}
            />
          </View>
        </Card>

        {/* Nutrition */}
        <Card delay={100}>
          <View style={styles.nutritionHeader}>
            <Text style={styles.cardLabel}>NUTRITION</Text>
            {(entry.calories || 0) > 0 && calInRange && (
              <Text style={[styles.capsSmColor, { color: COLORS.success }]}>{'\u2713'} IN TARGET</Text>
            )}
          </View>
          <View style={styles.inputGrid}>
            <InputCell label="CALORIES" unit="kcal"
              value={entry.calories != null ? String(entry.calories) : ''}
              onDebouncedChange={handleFieldUpdate('calories', t => parseInt(t))}
              status={(entry.calories || 0) > 0 ? (calInRange ? 'good' : 'warn') : 'ok'}
              accessoryId={INPUT_ACCESSORY_ID} numPad />
            <InputCell label="PROTEIN" unit="g"
              value={entry.protein != null ? String(entry.protein) : ''}
              onDebouncedChange={handleFieldUpdate('protein', t => parseInt(t))}
              status={(entry.protein || 0) > 0 ? (proteinInRange ? 'good' : 'warn') : 'ok'}
              accessoryId={INPUT_ACCESSORY_ID} numPad />
            <InputCell label="CARBS" unit="g"
              value={entry.carbs != null ? String(entry.carbs) : ''}
              onDebouncedChange={handleFieldUpdate('carbs', t => parseInt(t))}
              accessoryId={INPUT_ACCESSORY_ID} numPad />
            <InputCell label="FAT" unit="g"
              value={entry.fat != null ? String(entry.fat) : ''}
              onDebouncedChange={handleFieldUpdate('fat', t => parseInt(t))}
              accessoryId={INPUT_ACCESSORY_ID} numPad />
          </View>
          <Text style={styles.phaseHint}>
            PHASE TARGET: {target.min.toLocaleString()}-{target.max.toLocaleString()} KCAL {'\u00B7'} {nutritionPhase.protein[0]}-{nutritionPhase.protein[1]}G PROTEIN
          </Text>
        </Card>

        {/* Activity */}
        <Card delay={150}>
          <Text style={styles.cardLabel}>ACTIVITY</Text>
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

        {/* Recovery */}
        <Card delay={200}>
          <Text style={styles.cardLabel}>RECOVERY</Text>
          <View style={styles.recoveryGrid}>
            <InputCell label="SLEEP" unit="hrs"
              value={entry.sleep != null ? String(entry.sleep) : ''}
              onDebouncedChange={handleFieldUpdate('sleep', parseFloat)}
              accessoryId={INPUT_ACCESSORY_ID} />
            <InputCell label="REST HR" unit="bpm"
              value={entry.restingHR != null ? String(entry.restingHR) : ''}
              onDebouncedChange={handleFieldUpdate('restingHR', t => parseInt(t))}
              accessoryId={INPUT_ACCESSORY_ID} numPad />
            <InputCell label="HRV" unit="ms"
              value={entry.hrv != null ? String(entry.hrv) : ''}
              onDebouncedChange={handleFieldUpdate('hrv', t => parseInt(t))}
              accessoryId={INPUT_ACCESSORY_ID} numPad />
          </View>
          <View style={styles.sliderGroup}>
            <SliderInput label="Recovery" value={entry.recovery || 5} onChange={v => immediateUpdate('recovery', v)} />
            <SliderInput label="Energy" value={entry.energy || 5} onChange={v => immediateUpdate('energy', v)} />
            <SliderInput label="Mood" value={entry.mood || 5} onChange={v => immediateUpdate('mood', v)} />
          </View>
        </Card>

        {/* Notes */}
        <Card delay={250}>
          <Text style={styles.cardLabel}>NOTES</Text>
          <DebouncedInput
            style={styles.notesInput}
            value={entry.notes || ''}
            onDebouncedChange={text => updateEntry(selectedDate, { notes: text })}
            placeholder="How did today go? Anything to note..."
            placeholderTextColor={COLORS.textMuted}
            multiline numberOfLines={4} textAlignVertical="top"
            returnKeyType="default" onSubmitEditing={undefined}
          />
        </Card>

        {/* TDEE */}
        <TouchableOpacity onPress={() => { playTap(); setTdeeExpanded(prev => !prev); }} activeOpacity={0.7}>
          <Card delay={0}>
            <View style={styles.tdeeHeader}>
              <Text style={styles.cardLabel}>TDEE BREAKDOWN</Text>
              <View style={styles.tdeeRight}>
                <Text style={styles.tdeeTotal}>{tdee.total.toLocaleString()} KCAL</Text>
                <FontAwesome name={tdeeExpanded ? 'chevron-up' : 'chevron-down'} size={10} color={COLORS.silverDim} />
              </View>
            </View>
            {tdeeExpanded && <TDEEBreakdownView tdee={tdee} currentWeight={currentWeight} />}
          </Card>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function InputCell({ label, unit, value, onDebouncedChange, status = 'ok', accessoryId, numPad }: {
  label: string; unit: string; value: string; onDebouncedChange: (t: string) => void;
  status?: 'ok' | 'good' | 'warn'; accessoryId?: string; numPad?: boolean;
}) {
  const borderColors = { ok: COLORS.border, good: 'rgba(143,179,150,0.45)', warn: 'rgba(182,117,117,0.45)' };
  return (
    <View style={[styles.inputCell, { borderColor: borderColors[status] }]}>
      <Text style={styles.inputCellLabel}>{label}</Text>
      <View style={styles.inputCellRow}>
        <DebouncedInput
          style={styles.inputCellValue}
          value={value}
          onDebouncedChange={onDebouncedChange}
          keyboardType={numPad ? 'number-pad' : 'decimal-pad'}
          placeholder="\u2014"
          placeholderTextColor={COLORS.textMuted}
          inputAccessoryViewID={Platform.OS === 'ios' ? accessoryId : undefined}
        />
        <Text style={styles.inputCellUnit}>{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },

  accessoryBar: {
    backgroundColor: COLORS.card, borderTopWidth: 1, borderTopColor: COLORS.border,
    flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingVertical: 8,
  },
  doneBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6 },
  doneBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.silverBright, fontFamily: FONTS.mono },

  headerSection: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12,
  },
  headerTitle: { fontSize: 26, fontFamily: FONTS.serif, color: COLORS.silverBright },
  headerSub: { fontSize: 9, fontFamily: FONTS.mono, color: COLORS.textMuted, letterSpacing: 1.5, marginTop: 4, textTransform: 'uppercase' },
  dateNav: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navArrow: { padding: 6 },
  navArrowText: { fontSize: 12, color: COLORS.silverDim },
  todayBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  todayText: { fontSize: 9, fontFamily: FONTS.mono, color: COLORS.silverBright, letterSpacing: 1 },

  cardLabel: { fontSize: 10, fontFamily: FONTS.mono, color: COLORS.silverDim, letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 12 },

  balanceGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  balanceSub: { fontSize: 9, fontFamily: FONTS.mono, color: COLORS.textMuted, letterSpacing: 1.5, marginBottom: 4, textTransform: 'uppercase' },
  balanceNum: { fontSize: 22, fontFamily: FONTS.serif, color: COLORS.silverBright },
  balanceDivider: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.border, paddingHorizontal: 10 },

  inputGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  recoveryGrid: { flexDirection: 'row', gap: 8, marginBottom: 16 },

  inputCell: {
    flex: 1, minWidth: '45%', padding: 10, backgroundColor: COLORS.background,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 8,
  },
  inputCellLabel: { fontSize: 9, fontFamily: FONTS.mono, color: COLORS.textMuted, letterSpacing: 1.5, marginBottom: 3, textTransform: 'uppercase' },
  inputCellRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  inputCellValue: { fontFamily: FONTS.serif, fontSize: 20, color: COLORS.silverBright, flex: 1, padding: 0 },
  inputCellUnit: { fontSize: 10, fontFamily: FONTS.mono, color: COLORS.textMuted },

  capsSmColor: { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1.5, textTransform: 'uppercase' },
  nutritionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  phaseHint: { fontSize: 9, fontFamily: FONTS.mono, color: COLORS.textMuted, letterSpacing: 1, marginTop: 4, textTransform: 'uppercase' },

  sliderGroup: { marginTop: 4 },

  notesInput: {
    backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 8, padding: 12, fontSize: 14, color: COLORS.textSecondary,
    fontFamily: FONTS.serifItalic, fontStyle: 'italic', minHeight: 80, lineHeight: 22,
  },

  tdeeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tdeeRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tdeeTotal: { fontSize: 11, fontFamily: FONTS.mono, color: COLORS.purpleWarm },
});
