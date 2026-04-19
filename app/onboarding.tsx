import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/lib/constants';
import { useAppData } from '@/hooks/useAppData';
import { getDateString } from '@/lib/helpers';
import { playTap, playSuccess } from '@/lib/sounds';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateSettings, updateProfile, addSet, updateEntry } = useAppData();

  const [step, setStep] = useState(0);
  const [age, setAge] = useState('24');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [height, setHeight] = useState('180');
  const [startWeight, setStartWeight] = useState('130');
  const [startDate, setStartDate] = useState(getDateString(new Date()));
  const [squat, setSquat] = useState('150');
  const [bench, setBench] = useState('105');
  const [deadlift, setDeadlift] = useState('210');
  const [useStretch, setUseStretch] = useState(false);
  const [ebikeDefault, setEbikeDefault] = useState('20');
  const [ebikeEnabled, setEbikeEnabled] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('21:00');

  const next = () => { playTap(); setStep(s => s + 1); };

  const finish = async () => {
    playSuccess();
    await updateProfile({ age: parseInt(age), sex, heightCm: parseInt(height), startingWeight: parseFloat(startWeight) });
    await updateSettings({
      programStart: startDate,
      showStretchTargets: useStretch,
      defaultEbikeMinutesPerDay: ebikeEnabled ? parseInt(ebikeDefault) || 20 : 0,
      reminderEnabled,
      reminderTime,
      onboardingComplete: true,
    });
    if (parseFloat(startWeight) > 0) await updateEntry(startDate, { weight: parseFloat(startWeight) });
    const sq = parseFloat(squat); const bn = parseFloat(bench); const dl = parseFloat(deadlift);
    if (sq > 0) await addSet({ date: startDate, week: 1, dayIndex: 0, exerciseId: 'baseline-sq', exerciseName: 'Back Squat', liftType: 'squat', isMain: true, setNumber: 1, weight: sq, reps: 1, rpe: 9 });
    if (bn > 0) await addSet({ date: startDate, week: 1, dayIndex: 0, exerciseId: 'baseline-bn', exerciseName: 'Bench Press', liftType: 'bench', isMain: true, setNumber: 1, weight: bn, reps: 1, rpe: 9 });
    if (dl > 0) await addSet({ date: startDate, week: 1, dayIndex: 0, exerciseId: 'baseline-dl', exerciseName: 'Conventional Deadlift', liftType: 'deadlift', isMain: true, setNumber: 1, weight: dl, reps: 1, rpe: 9 });
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {step === 0 && (
          <View style={styles.centered}>
            <Text style={styles.crossIcon}>{'\u2670'}</Text>
            <Text style={styles.huge}>INVICTUS</Text>
            <View style={styles.divider} />
            <Text style={styles.tagline}>I AM THE MASTER OF MY FATE</Text>
            <Text style={styles.sub}>32 weeks | Body as Temple | Unconquerable</Text>
            <View style={{ height: 32 }} />
            <Text style={styles.desc}>
              Your body is a temple of the Holy Spirit. Train with discipline, eat with temperance, and forge your strength to the glory of God.
            </Text>
            <View style={{ height: 24 }} />
            <Text style={styles.verse}>
              "Out of the night that covers me, black as the pit from pole to pole, I thank whatever gods may be for my unconquerable soul."
            </Text>
            <Text style={styles.verseRef}>-- W.E. Henley, Invictus</Text>
            <View style={{ height: 16 }} />
            <Text style={styles.verse}>
              "Do you not know that your body is a temple of the Holy Spirit within you, whom you have from God?"
            </Text>
            <Text style={styles.verseRef}>-- 1 Corinthians 6:19</Text>
            <View style={{ height: 40 }} />
            <TouchableOpacity style={styles.btn} onPress={next}><Text style={styles.btnText}>BEGIN THE JOURNEY</Text></TouchableOpacity>
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={styles.stepLabel}>1 / 4 {'\u2014'} PROFILE</Text>
            <Text style={styles.stepTitle}>PHYSICAL PROFILE</Text>
            <InputRow label="AGE" value={age} onChange={setAge} kbd="number-pad" />
            <Text style={styles.fieldLabel}>SEX</Text>
            <View style={styles.pillRow}>
              <TouchableOpacity onPress={() => setSex('male')} style={[styles.pill, sex === 'male' && styles.pillActive]}><Text style={[styles.pillText, sex === 'male' && styles.pillTextActive]}>MALE</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setSex('female')} style={[styles.pill, sex === 'female' && styles.pillActive]}><Text style={[styles.pillText, sex === 'female' && styles.pillTextActive]}>FEMALE</Text></TouchableOpacity>
            </View>
            <InputRow label="HEIGHT (CM)" value={height} onChange={setHeight} kbd="number-pad" />
            <InputRow label="STARTING WEIGHT (KG)" value={startWeight} onChange={setStartWeight} kbd="decimal-pad" />
            <InputRow label="START DATE (YYYY-MM-DD)" value={startDate} onChange={setStartDate} />
            <TouchableOpacity style={styles.btn} onPress={next}><Text style={styles.btnText}>NEXT</Text></TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.stepLabel}>2 / 4 {'\u2014'} STARTING LIFTS</Text>
            <Text style={styles.stepTitle}>CURRENT 1RMs (KG)</Text>
            <InputRow label="SQUAT" value={squat} onChange={setSquat} kbd="decimal-pad" color={COLORS.squat} />
            <InputRow label="BENCH" value={bench} onChange={setBench} kbd="decimal-pad" color={COLORS.bench} />
            <InputRow label="DEADLIFT" value={deadlift} onChange={setDeadlift} kbd="decimal-pad" color={COLORS.deadlift} />
            <Text style={styles.fieldLabel}>TARGET MODE</Text>
            <View style={styles.pillRow}>
              <TouchableOpacity onPress={() => setUseStretch(false)} style={[styles.pill, !useStretch && styles.pillActive]}><Text style={[styles.pillText, !useStretch && styles.pillTextActive]}>REALISTIC</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setUseStretch(true)} style={[styles.pill, useStretch && styles.pillActive]}><Text style={[styles.pillText, useStretch && styles.pillTextActive]}>STRETCH</Text></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.btn} onPress={next}><Text style={styles.btnText}>NEXT</Text></TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.stepLabel}>3 / 4 {'\u2014'} ACTIVITY</Text>
            <Text style={styles.stepTitle}>DAILY E-BIKE?</Text>
            <View style={styles.pillRow}>
              <TouchableOpacity onPress={() => setEbikeEnabled(true)} style={[styles.pill, ebikeEnabled && styles.pillActive]}><Text style={[styles.pillText, ebikeEnabled && styles.pillTextActive]}>YES</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setEbikeEnabled(false)} style={[styles.pill, !ebikeEnabled && styles.pillActive]}><Text style={[styles.pillText, !ebikeEnabled && styles.pillTextActive]}>NO</Text></TouchableOpacity>
            </View>
            {ebikeEnabled && <InputRow label="DEFAULT MINUTES/DAY" value={ebikeDefault} onChange={setEbikeDefault} kbd="number-pad" />}
            <TouchableOpacity style={styles.btn} onPress={next}><Text style={styles.btnText}>NEXT</Text></TouchableOpacity>
          </View>
        )}

        {step === 4 && (
          <View>
            <Text style={styles.stepLabel}>4 / 4 {'\u2014'} REMINDERS</Text>
            <Text style={styles.stepTitle}>DAILY LOG REMINDER</Text>
            <View style={styles.pillRow}>
              <TouchableOpacity onPress={() => setReminderEnabled(true)} style={[styles.pill, reminderEnabled && styles.pillActive]}><Text style={[styles.pillText, reminderEnabled && styles.pillTextActive]}>ON</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setReminderEnabled(false)} style={[styles.pill, !reminderEnabled && styles.pillActive]}><Text style={[styles.pillText, !reminderEnabled && styles.pillTextActive]}>OFF</Text></TouchableOpacity>
            </View>
            {reminderEnabled && <InputRow label="TIME (HH:MM)" value={reminderTime} onChange={setReminderTime} />}
            <View style={{ height: 16 }} />
            <Text style={styles.blessing}>
              {'\u2670'} I am the captain of my soul {'\u2670'}
            </Text>
            <View style={{ height: 16 }} />
            <TouchableOpacity style={styles.btn} onPress={finish}><Text style={styles.btnText}>BEGIN</Text></TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function InputRow({ label, value, onChange, kbd, color }: { label: string; value: string; onChange: (v: string) => void; kbd?: any; color?: string }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.fieldLabel, color ? { color } : undefined]}>{label}</Text>
      <TextInput style={[styles.input, color ? { borderColor: color } : undefined]} value={value} onChangeText={onChange} keyboardType={kbd || 'default'} placeholderTextColor={COLORS.textMuted} returnKeyType="done" onSubmitEditing={() => Keyboard.dismiss()} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: 24, flexGrow: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  crossIcon: { fontSize: 40, color: COLORS.gold, marginBottom: 12 },
  huge: { fontSize: 38, fontFamily: 'Cinzel_900Black', color: COLORS.silverBright, letterSpacing: 6 },
  divider: { width: 60, height: 3, backgroundColor: COLORS.gold, marginVertical: 16, borderRadius: 2 },
  tagline: { fontSize: 11, fontFamily: 'Cinzel_700Bold', color: COLORS.silver, letterSpacing: 2, textAlign: 'center' },
  sub: { fontSize: 10, color: COLORS.textMuted, fontFamily: mono, letterSpacing: 1, marginTop: 6 },
  desc: { fontSize: 12, color: COLORS.textSecondary, fontFamily: mono, lineHeight: 20, textAlign: 'center', paddingHorizontal: 10 },
  verse: { fontSize: 11, color: COLORS.textPrimary, fontFamily: 'Cinzel_400Regular', lineHeight: 20, textAlign: 'center', paddingHorizontal: 8, fontStyle: 'italic' },
  verseRef: { fontSize: 9, color: COLORS.purpleWarm, fontFamily: mono, letterSpacing: 1, marginTop: 8, fontWeight: '700' },
  blessing: { fontSize: 11, color: COLORS.silver, fontFamily: mono, textAlign: 'center', fontWeight: '700', letterSpacing: 1 },
  stepLabel: { fontSize: 10, color: COLORS.primary, fontFamily: mono, letterSpacing: 2, fontWeight: '700', marginBottom: 8 },
  stepTitle: { fontSize: 22, fontFamily: 'Cinzel_700Bold', color: COLORS.silverBright, letterSpacing: 2, marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  fieldLabel: { fontSize: 10, color: COLORS.label, fontFamily: mono, letterSpacing: 1.5, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 14, fontSize: 18, color: COLORS.textPrimary, fontFamily: mono },
  pillRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  pill: { flex: 1, borderWidth: 1, borderColor: COLORS.ghostBorder, borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, fontFamily: mono, letterSpacing: 1 },
  pillTextActive: { color: '#E8EAF0' },
  btn: { backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  btnText: { fontSize: 14, fontWeight: '900', color: '#E8EAF0', fontFamily: mono, letterSpacing: 2 },
});
