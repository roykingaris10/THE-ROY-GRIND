import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { COLORS } from '@/lib/constants';
import type { SetLog } from '@/types';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

interface SessionSummaryProps {
  visible: boolean;
  workoutName: string;
  duration: number;
  sets: SetLog[];
  prs: SetLog[];
  estimatedBurn: number;
  onClose: () => void;
}

export function SessionSummary({ visible, workoutName, duration, sets, prs, estimatedBurn, onClose }: SessionSummaryProps) {
  const totalVolume = sets.reduce((acc, s) => acc + s.weight * s.reps, 0);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.complete}>SESSION COMPLETE</Text>
          <Text style={styles.name}>{workoutName}</Text>
          <View style={styles.grid}>
            <Stat label="DURATION" value={`${duration} min`} />
            <Stat label="SETS" value={`${sets.length}`} />
            <Stat label="VOLUME" value={`${Math.round(totalVolume / 1000)}t`} />
            <Stat label="BURN" value={`~${estimatedBurn} kcal`} color={COLORS.caloriesOut} />
          </View>
          {prs.length > 0 && (
            <View style={styles.prSection}>
              <Text style={styles.prTitle}>NEW PRs</Text>
              {prs.map(pr => (
                <Text key={pr.id} style={styles.prText}>
                  {pr.exerciseName}: {pr.weight}kg x {pr.reps} (E1RM: {pr.e1rm}kg)
                </Text>
              ))}
            </View>
          )}
          <TouchableOpacity onPress={onClose} style={styles.btn}>
            <Text style={styles.btnText}>DONE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, color ? { color } : undefined]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center', justifyContent: 'center' },
  modal: { backgroundColor: COLORS.card, borderRadius: 16, padding: 24, width: '85%', borderWidth: 1, borderColor: COLORS.primary },
  complete: { fontSize: 10, color: COLORS.primary, fontFamily: mono, letterSpacing: 3, textAlign: 'center', fontWeight: '900', marginBottom: 4 },
  name: { fontSize: 18, color: COLORS.textPrimary, fontFamily: mono, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  stat: { width: '48%', marginBottom: 16 },
  statLabel: { fontSize: 9, color: COLORS.label, fontFamily: mono, letterSpacing: 1.5, textTransform: 'uppercase' },
  statValue: { fontSize: 18, color: COLORS.textPrimary, fontFamily: mono, fontWeight: '700', marginTop: 4 },
  prSection: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12, marginBottom: 16 },
  prTitle: { fontSize: 10, color: COLORS.primary, fontFamily: mono, letterSpacing: 2, fontWeight: '900', marginBottom: 8 },
  prText: { fontSize: 11, color: COLORS.textPrimary, fontFamily: mono, marginBottom: 4 },
  btn: { backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  btnText: { fontSize: 14, color: '#fff', fontFamily: mono, fontWeight: '900', letterSpacing: 2 },
});
