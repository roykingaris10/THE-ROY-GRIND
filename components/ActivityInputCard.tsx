import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { COLORS } from '@/lib/constants';
import { calculateStepsCalories, calculateEbikeCalories } from '@/lib/calorieEngine';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

interface ActivityInputCardProps {
  steps: number | undefined;
  stepsAutoSynced: boolean;
  ebikeMinutes: number | undefined;
  otherCardioKcal: number | undefined;
  otherCardioNotes: string | undefined;
  trainingBurn: number;
  trainingDuration: number | null;
  currentWeight: number;
  onUpdate: (field: string, value: any) => void;
}

const EBIKE_PRESETS = [10, 20, 30, 40];

export function ActivityInputCard({
  steps, stepsAutoSynced, ebikeMinutes, otherCardioKcal, otherCardioNotes,
  trainingBurn, trainingDuration, currentWeight, onUpdate,
}: ActivityInputCardProps) {
  const stepsKcal = calculateStepsCalories(steps || 0, currentWeight);
  const ebikeKcal = calculateEbikeCalories(ebikeMinutes || 0, currentWeight);

  return (
    <View>
      {/* Steps */}
      <Text style={styles.subHeader}>STEPS</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={steps !== undefined ? String(steps) : ''}
          onChangeText={t => onUpdate('steps', t ? parseInt(t) || 0 : undefined)}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={COLORS.textMuted}
        />
        <Text style={styles.badge}>{stepsAutoSynced ? 'Auto' : 'Manual'}</Text>
      </View>
      {(steps || 0) > 0 && (
        <Text style={styles.estimate}>→ ~{stepsKcal} kcal</Text>
      )}

      {/* E-bike */}
      <Text style={[styles.subHeader, { marginTop: 16 }]}>E-BIKE RIDES</Text>
      <View style={styles.presetRow}>
        {EBIKE_PRESETS.map(p => (
          <TouchableOpacity
            key={p}
            onPress={() => onUpdate('ebikeMinutes', p)}
            style={[styles.preset, ebikeMinutes === p && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
          >
            <Text style={[styles.presetText, ebikeMinutes === p && { color: '#fff' }]}>{p}m</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={styles.input}
        value={ebikeMinutes !== undefined ? String(ebikeMinutes) : ''}
        onChangeText={t => onUpdate('ebikeMinutes', t ? parseInt(t) || 0 : undefined)}
        keyboardType="number-pad"
        placeholder="Minutes"
        placeholderTextColor={COLORS.textMuted}
      />
      {(ebikeMinutes || 0) > 0 && (
        <Text style={styles.estimate}>→ ~{ebikeKcal} kcal (MET 4.0)</Text>
      )}

      {/* Other */}
      <Text style={[styles.subHeader, { marginTop: 16 }]}>OTHER CARDIO</Text>
      <TextInput
        style={styles.input}
        value={otherCardioKcal !== undefined ? String(otherCardioKcal) : ''}
        onChangeText={t => onUpdate('otherCardioKcal', t ? parseInt(t) || 0 : undefined)}
        keyboardType="number-pad"
        placeholder="kcal"
        placeholderTextColor={COLORS.textMuted}
      />
      <TextInput
        style={[styles.input, { marginTop: 8 }]}
        value={otherCardioNotes || ''}
        onChangeText={t => onUpdate('otherCardioNotes', t)}
        placeholder="e.g. football, swimming"
        placeholderTextColor={COLORS.textMuted}
      />

      {/* Training */}
      <Text style={[styles.subHeader, { marginTop: 16 }]}>TRAINING BURN</Text>
      {trainingDuration ? (
        <Text style={styles.trainingText}>
          {trainingDuration} min — ~{trainingBurn} kcal burned
        </Text>
      ) : (
        <Text style={styles.noTraining}>Complete a workout to log training burn</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  subHeader: { fontSize: 9, color: COLORS.label, fontFamily: mono, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, fontSize: 16, color: COLORS.textPrimary, fontFamily: mono },
  badge: { fontSize: 9, color: COLORS.textMuted, fontFamily: mono, backgroundColor: COLORS.border, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  estimate: { fontSize: 11, color: COLORS.caloriesOut, fontFamily: mono, marginTop: 4 },
  presetRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  preset: { paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.ghostBorder, borderRadius: 6 },
  presetText: { fontSize: 12, color: COLORS.textSecondary, fontFamily: mono, fontWeight: '600' },
  trainingText: { fontSize: 12, color: COLORS.caloriesOut, fontFamily: mono },
  noTraining: { fontSize: 11, color: COLORS.textMuted, fontFamily: mono, fontStyle: 'italic' },
});
