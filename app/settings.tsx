import React, { useState, useEffect } from 'react';
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
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/lib/constants';
import { useAppData } from '@/hooks/useAppData';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, loading, updateSettings, updateProfile, resetAllData } = useAppData();

  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [height, setHeight] = useState('');
  const [programStart, setProgramStart] = useState('');
  const [showStretch, setShowStretch] = useState(false);
  const [ebikeDefault, setEbikeDefault] = useState('');
  const [autoSyncSteps, setAutoSyncSteps] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('21:00');

  useEffect(() => {
    if (!data) return;
    setAge(String(data.profile.age));
    setSex(data.profile.sex);
    setHeight(String(data.profile.heightCm));
    setProgramStart(data.settings.programStart);
    setShowStretch(data.settings.showStretchTargets);
    setEbikeDefault(String(data.settings.defaultEbikeMinutesPerDay));
    setAutoSyncSteps(data.settings.autoSyncSteps);
    setReminderEnabled(data.settings.reminderEnabled);
    setReminderTime(data.settings.reminderTime);
  }, [data]);

  const handleSave = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await updateProfile({
      age: parseInt(age) || 24,
      sex,
      heightCm: parseInt(height) || 180,
    });
    await updateSettings({
      programStart,
      showStretchTargets: showStretch,
      defaultEbikeMinutesPerDay: parseInt(ebikeDefault) || 20,
      autoSyncSteps,
      reminderEnabled,
      reminderTime,
    });
    router.back();
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Data?',
      'This will permanently delete all logged data including sets, entries, and sessions. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'RESET',
          style: 'destructive',
          onPress: async () => {
            await resetAllData();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  if (loading || !data) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>CLOSE</Text>
        </TouchableOpacity>
        <Text style={styles.title}>SETTINGS</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveText}>SAVE</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Profile */}
        <Text style={styles.section}>PROFILE</Text>
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>AGE</Text>
            <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="number-pad" placeholderTextColor={COLORS.textMuted} />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>HEIGHT (CM)</Text>
            <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="number-pad" placeholderTextColor={COLORS.textMuted} />
          </View>
        </View>
        <Text style={styles.label}>SEX</Text>
        <View style={styles.pillRow}>
          <TouchableOpacity onPress={() => setSex('male')} style={[styles.pill, sex === 'male' && styles.pillActive]}>
            <Text style={[styles.pillText, sex === 'male' && styles.pillTextActive]}>MALE</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSex('female')} style={[styles.pill, sex === 'female' && styles.pillActive]}>
            <Text style={[styles.pillText, sex === 'female' && styles.pillTextActive]}>FEMALE</Text>
          </TouchableOpacity>
        </View>

        {/* Program */}
        <Text style={styles.section}>PROGRAM</Text>
        <Text style={styles.label}>START DATE</Text>
        <TextInput style={styles.input} value={programStart} onChangeText={setProgramStart} placeholderTextColor={COLORS.textMuted} />

        <Text style={styles.label}>TARGET MODE</Text>
        <View style={styles.pillRow}>
          <TouchableOpacity onPress={() => setShowStretch(false)} style={[styles.pill, !showStretch && styles.pillActive]}>
            <Text style={[styles.pillText, !showStretch && styles.pillTextActive]}>REALISTIC</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowStretch(true)} style={[styles.pill, showStretch && styles.pillActive]}>
            <Text style={[styles.pillText, showStretch && styles.pillTextActive]}>STRETCH</Text>
          </TouchableOpacity>
        </View>

        {/* Activity */}
        <Text style={styles.section}>ACTIVITY</Text>
        <Text style={styles.label}>DEFAULT E-BIKE MIN/DAY</Text>
        <TextInput style={styles.input} value={ebikeDefault} onChangeText={setEbikeDefault} keyboardType="number-pad" placeholderTextColor={COLORS.textMuted} />

        <Text style={styles.label}>AUTO-SYNC STEPS</Text>
        <View style={styles.pillRow}>
          <TouchableOpacity onPress={() => setAutoSyncSteps(true)} style={[styles.pill, autoSyncSteps && styles.pillActive]}>
            <Text style={[styles.pillText, autoSyncSteps && styles.pillTextActive]}>ON</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAutoSyncSteps(false)} style={[styles.pill, !autoSyncSteps && styles.pillActive]}>
            <Text style={[styles.pillText, !autoSyncSteps && styles.pillTextActive]}>OFF</Text>
          </TouchableOpacity>
        </View>

        {/* Reminders */}
        <Text style={styles.section}>REMINDERS</Text>
        <Text style={styles.label}>DAILY LOG REMINDER</Text>
        <View style={styles.pillRow}>
          <TouchableOpacity onPress={() => setReminderEnabled(true)} style={[styles.pill, reminderEnabled && styles.pillActive]}>
            <Text style={[styles.pillText, reminderEnabled && styles.pillTextActive]}>ON</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setReminderEnabled(false)} style={[styles.pill, !reminderEnabled && styles.pillActive]}>
            <Text style={[styles.pillText, !reminderEnabled && styles.pillTextActive]}>OFF</Text>
          </TouchableOpacity>
        </View>
        {reminderEnabled && (
          <>
            <Text style={styles.label}>TIME (HH:MM)</Text>
            <TextInput style={styles.input} value={reminderTime} onChangeText={setReminderTime} placeholderTextColor={COLORS.textMuted} />
          </>
        )}

        {/* Reset */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>DANGER ZONE</Text>
          <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
            <Text style={styles.resetBtnText}>RESET ALL DATA</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backText: { fontSize: 12, color: COLORS.textSecondary, fontFamily: mono, fontWeight: '700', letterSpacing: 1 },
  title: { fontSize: 16, fontWeight: '900', color: COLORS.textPrimary, fontFamily: mono, letterSpacing: 2 },
  saveText: { fontSize: 12, color: COLORS.primary, fontFamily: mono, fontWeight: '900', letterSpacing: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  section: { fontSize: 10, color: COLORS.primary, fontFamily: mono, letterSpacing: 2, fontWeight: '900', marginTop: 24, marginBottom: 12 },
  label: { fontSize: 10, color: COLORS.label, fontFamily: mono, letterSpacing: 1.5, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 14, fontSize: 16, color: COLORS.textPrimary, fontFamily: mono, marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  halfInput: { flex: 1 },
  pillRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  pill: { flex: 1, borderWidth: 1, borderColor: COLORS.ghostBorder, borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, fontFamily: mono, letterSpacing: 1 },
  pillTextActive: { color: '#fff' },
  dangerZone: { marginTop: 40, borderTopWidth: 1, borderTopColor: COLORS.danger, paddingTop: 20, marginBottom: 40 },
  dangerTitle: { fontSize: 10, color: COLORS.danger, fontFamily: mono, letterSpacing: 2, fontWeight: '900', marginBottom: 16 },
  resetBtn: { borderWidth: 1, borderColor: COLORS.danger, borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  resetBtnText: { fontSize: 12, fontWeight: '900', color: COLORS.danger, fontFamily: mono, letterSpacing: 2 },
});
