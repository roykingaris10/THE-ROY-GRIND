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
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/lib/constants';
import { useAppData } from '@/hooks/useAppData';
import { useGamification } from '@/hooks/useGamification';
import { Card, SectionLabel } from '@/components/Card';
import { XPBar } from '@/components/XPBar';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, loading, updateSettings, updateProfile, resetAllData } = useAppData();
  const gam = useGamification(data);

  const [age, setAge] = useState(String(data?.profile.age ?? 24));
  const [height, setHeight] = useState(String(data?.profile.heightCm ?? 180));
  const [sex, setSex] = useState<'male' | 'female'>(data?.profile.sex ?? 'male');
  const [programStart, setProgramStart] = useState(data?.settings.programStart ?? '2026-04-14');
  const [showStretch, setShowStretch] = useState(data?.settings.showStretchTargets ?? false);
  const [autoSteps, setAutoSteps] = useState(data?.settings.autoSyncSteps ?? false);
  const [defaultEbike, setDefaultEbike] = useState(String(data?.settings.defaultEbikeMinutesPerDay ?? 20));
  const [reminderEnabled, setReminderEnabled] = useState(data?.settings.reminderEnabled ?? true);
  const [reminderTime, setReminderTime] = useState(data?.settings.reminderTime ?? '21:00');

  const saveProfile = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateProfile({ age: parseInt(age), sex, heightCm: parseInt(height) });
    Alert.alert('Saved', 'Profile updated.');
  };

  const saveSettings = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateSettings({
      programStart,
      showStretchTargets: showStretch,
      autoSyncSteps: autoSteps,
      defaultEbikeMinutesPerDay: parseInt(defaultEbike) || 20,
      reminderEnabled,
      reminderTime,
    });
    Alert.alert('Saved', 'Settings updated.');
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Data?',
      'This will erase everything and restart from onboarding. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetAllData();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  if (loading || !data) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeText}>{'\u2715'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{'\u2626'} SETTINGS</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <XPBar xp={gam.xp} level={gam.level} progress={gam.levelProgress} xpToNext={gam.xpToNext} />
        </Card>

        <SectionLabel>PROFILE</SectionLabel>
        <Card>
          <InputRow label="AGE" value={age} onChange={setAge} kbd="number-pad" />
          <Text style={styles.fieldLabel}>SEX</Text>
          <View style={styles.pillRow}>
            <Pill label="MALE" active={sex === 'male'} onPress={() => setSex('male')} />
            <Pill label="FEMALE" active={sex === 'female'} onPress={() => setSex('female')} />
          </View>
          <InputRow label="HEIGHT (CM)" value={height} onChange={setHeight} kbd="number-pad" />
          <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
            <Text style={styles.saveBtnText}>SAVE PROFILE</Text>
          </TouchableOpacity>
        </Card>

        <SectionLabel>PROGRAM</SectionLabel>
        <Card>
          <InputRow label="START DATE (YYYY-MM-DD)" value={programStart} onChange={setProgramStart} />
          <Text style={styles.fieldLabel}>TARGET MODE</Text>
          <View style={styles.pillRow}>
            <Pill label="REALISTIC" active={!showStretch} onPress={() => setShowStretch(false)} />
            <Pill label="STRETCH" active={showStretch} onPress={() => setShowStretch(true)} />
          </View>
        </Card>

        <SectionLabel>ACTIVITY</SectionLabel>
        <Card>
          <Text style={styles.fieldLabel}>AUTO-SYNC STEPS</Text>
          <View style={styles.pillRow}>
            <Pill label="ON" active={autoSteps} onPress={() => setAutoSteps(true)} />
            <Pill label="OFF" active={!autoSteps} onPress={() => setAutoSteps(false)} />
          </View>
          <InputRow label="DEFAULT E-BIKE MIN/DAY" value={defaultEbike} onChange={setDefaultEbike} kbd="number-pad" />
        </Card>

        <SectionLabel>REMINDERS</SectionLabel>
        <Card>
          <Text style={styles.fieldLabel}>DAILY REMINDER</Text>
          <View style={styles.pillRow}>
            <Pill label="ON" active={reminderEnabled} onPress={() => setReminderEnabled(true)} />
            <Pill label="OFF" active={!reminderEnabled} onPress={() => setReminderEnabled(false)} />
          </View>
          {reminderEnabled && <InputRow label="TIME (HH:MM)" value={reminderTime} onChange={setReminderTime} />}
        </Card>

        <TouchableOpacity style={styles.saveBtn} onPress={saveSettings}>
          <Text style={styles.saveBtnText}>SAVE SETTINGS</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />

        <TouchableOpacity style={styles.dangerBtn} onPress={handleReset}>
          <Text style={styles.dangerText}>RESET ALL DATA</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>{'\u2626'} ROYFORGE {'\u2626'}</Text>
        <Text style={styles.footerSub}>Glorify God in your body</Text>
      </ScrollView>
    </View>
  );
}

function InputRow({ label, value, onChange, kbd }: { label: string; value: string; onChange: (v: string) => void; kbd?: any }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        keyboardType={kbd || 'default'}
        placeholderTextColor={COLORS.textMuted}
      />
    </View>
  );
}

function Pill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.pill, active && styles.pillActive]}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  closeBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: COLORS.ghostBorder, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 16, color: COLORS.textPrimary, fontFamily: mono },
  title: { fontSize: 16, fontWeight: '900', color: COLORS.textPrimary, fontFamily: mono, letterSpacing: 2 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 12 },
  inputGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 10, color: COLORS.label, fontFamily: mono, letterSpacing: 1.5, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, fontSize: 16, color: COLORS.textPrimary, fontFamily: mono },
  pillRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  pill: { flex: 1, borderWidth: 1, borderColor: COLORS.ghostBorder, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, fontFamily: mono, letterSpacing: 1 },
  pillTextActive: { color: '#000' },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText: { fontSize: 13, fontWeight: '900', color: '#000', fontFamily: mono, letterSpacing: 2 },
  dangerBtn: { borderWidth: 1, borderColor: COLORS.danger, borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  dangerText: { fontSize: 12, fontWeight: '700', color: COLORS.danger, fontFamily: mono, letterSpacing: 1 },
  footer: { fontSize: 12, color: COLORS.primary, fontFamily: mono, textAlign: 'center', marginTop: 32, fontWeight: '700', letterSpacing: 2 },
  footerSub: { fontSize: 9, color: COLORS.textMuted, fontFamily: mono, textAlign: 'center', marginTop: 4, fontStyle: 'italic' },
});
