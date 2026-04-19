import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, ScrollView, Platform } from 'react-native';
import { COLORS, LIFT_COLORS } from '@/lib/constants';
import type { Exercise } from '@/types';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });
const RPE_OPTIONS = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];

interface SetLoggerModalProps {
  visible: boolean;
  exercise: Exercise | null;
  onClose: () => void;
  onLog: (weight: number, reps: number, rpe: number, isWarmup: boolean, notes?: string) => void;
}

export function SetLoggerModal({ visible, exercise, onClose, onLog }: SetLoggerModalProps) {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [rpe, setRpe] = useState(8);
  const [isWarmup, setIsWarmup] = useState(false);
  const [notes, setNotes] = useState('');

  if (!exercise) return null;
  const color = exercise.liftType ? LIFT_COLORS[exercise.liftType] : COLORS.primary;

  const handleLog = () => {
    const w = parseFloat(weight);
    const r = parseInt(reps);
    if (!w || !r) return;
    onLog(w, r, rpe, isWarmup, notes || undefined);
    setWeight('');
    setReps('');
    setNotes('');
    setIsWarmup(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Text style={[styles.title, { color }]}>{exercise.name}</Text>
              <Text style={styles.prescription}>{exercise.sets}x{exercise.reps}{exercise.rpe ? ` @RPE ${exercise.rpe}` : ''}</Text>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputCol}>
                <Text style={styles.label}>WEIGHT (KG)</Text>
                <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={COLORS.textMuted} />
              </View>
              <View style={styles.inputCol}>
                <Text style={styles.label}>REPS</Text>
                <TextInput style={styles.input} value={reps} onChangeText={setReps} keyboardType="number-pad" placeholder="0" placeholderTextColor={COLORS.textMuted} />
              </View>
            </View>

            <Text style={styles.label}>RPE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={styles.rpeRow}>
                {RPE_OPTIONS.map(r => (
                  <TouchableOpacity key={r} onPress={() => setRpe(r)} style={[styles.rpeBtn, rpe === r && { backgroundColor: color, borderColor: color }]}>
                    <Text style={[styles.rpeBtnText, rpe === r && { color: '#000' }]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity onPress={() => setIsWarmup(!isWarmup)} style={[styles.warmupBtn, isWarmup && { borderColor: COLORS.primary, backgroundColor: 'rgba(255,107,26,0.1)' }]}>
              <Text style={[styles.warmupText, isWarmup && { color: COLORS.primary }]}>{isWarmup ? 'WARMUP SET' : 'WORKING SET'}</Text>
            </TouchableOpacity>

            <TextInput style={[styles.input, { marginTop: 12 }]} value={notes} onChangeText={setNotes} placeholder="Notes (optional)" placeholderTextColor={COLORS.textMuted} />

            <View style={styles.btnRow}>
              <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLog} style={[styles.logBtn, { backgroundColor: color }]}>
                <Text style={styles.logText}>LOG SET</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { backgroundColor: COLORS.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  header: { marginBottom: 20 },
  title: { fontSize: 16, fontWeight: '700', fontFamily: mono },
  prescription: { fontSize: 11, color: COLORS.textSecondary, fontFamily: mono, marginTop: 4 },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  inputCol: { flex: 1 },
  label: { fontSize: 9, color: COLORS.label, fontFamily: mono, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, fontSize: 16, color: COLORS.textPrimary, fontFamily: mono },
  rpeRow: { flexDirection: 'row', gap: 6, paddingVertical: 4 },
  rpeBtn: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.ghostBorder, borderRadius: 6 },
  rpeBtnText: { fontSize: 13, color: COLORS.textSecondary, fontFamily: mono, fontWeight: '600' },
  warmupBtn: { borderWidth: 1, borderColor: COLORS.ghostBorder, borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 8 },
  warmupText: { fontSize: 11, color: COLORS.textSecondary, fontFamily: mono, fontWeight: '700', letterSpacing: 1 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.ghostBorder, borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  cancelText: { fontSize: 12, color: COLORS.textSecondary, fontFamily: mono, fontWeight: '700', letterSpacing: 1 },
  logBtn: { flex: 2, borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  logText: { fontSize: 12, color: '#000', fontFamily: mono, fontWeight: '900', letterSpacing: 2 },
});
