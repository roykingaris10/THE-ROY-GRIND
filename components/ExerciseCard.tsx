import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { COLORS, LIFT_COLORS } from '@/lib/constants';
import type { Exercise, SetLog } from '@/types';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

interface ExerciseCardProps {
  exercise: Exercise;
  completedSets: SetLog[];
  onLogSet: () => void;
}

export function ExerciseCard({ exercise, completedSets, onLogSet }: ExerciseCardProps) {
  const color = exercise.liftType ? LIFT_COLORS[exercise.liftType] : COLORS.accessory;
  const done = completedSets.length;
  const total = exercise.sets;

  return (
    <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 3 }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, exercise.isMain && { color }]}>{exercise.name}</Text>
          <Text style={styles.prescription}>{exercise.sets}x{exercise.reps}{exercise.rpe ? ` @RPE ${exercise.rpe}` : ''}</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{done}/{total}</Text>
        </View>
      </View>

      {completedSets.length > 0 && (
        <View style={styles.setsRow}>
          {completedSets.map(s => (
            <View key={s.id} style={styles.setChip}>
              <Text style={styles.setText}>{s.weight}x{s.reps}</Text>
              {s.isPR && <Text style={styles.prBadge}>PR</Text>}
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity onPress={onLogSet} style={[styles.logBtn, { borderColor: color }]} activeOpacity={0.7}>
        <Text style={[styles.logBtnText, { color }]}>+ LOG SET</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 14, marginBottom: 10 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  name: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, fontFamily: mono },
  prescription: { fontSize: 10, color: COLORS.textSecondary, fontFamily: mono, marginTop: 2 },
  countBadge: { backgroundColor: COLORS.border, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  countText: { fontSize: 11, color: COLORS.textPrimary, fontFamily: mono, fontWeight: '700' },
  setsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  setChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4 },
  setText: { fontSize: 10, color: COLORS.textSecondary, fontFamily: mono },
  prBadge: { fontSize: 8, fontWeight: '900', color: COLORS.primary, fontFamily: mono },
  logBtn: { borderWidth: 1, borderRadius: 6, paddingVertical: 8, alignItems: 'center' },
  logBtnText: { fontSize: 11, fontWeight: '700', fontFamily: mono, letterSpacing: 1 },
});
