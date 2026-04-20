import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';
import { COLORS } from '@/lib/constants';
import { FONTS } from '@/lib/typography';
import { useAppData } from '@/hooks/useAppData';
import { getDateString } from '@/lib/helpers';
import { playTap, playSuccess } from '@/lib/sounds';
import { Starfield } from '@/components/Starfield';
import { GradientButton } from '@/components/GradientButton';

function LaurelWreath({ size = 72 }: { size?: number }) {
  const c = COLORS.gold;
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Path d="M8 20 C 8 28, 12 34, 20 36" stroke={c} strokeWidth={1.4} strokeLinecap="round" />
      <Path d="M10 14 C 10 10, 12 8, 15 9" stroke={c} strokeWidth={1.4} strokeLinecap="round" />
      {[{x:8,y:16,r:-30},{x:9,y:21,r:-20},{x:11,y:26,r:-10},{x:14,y:31,r:10},{x:17,y:34,r:25}].map((l,i) => (
        <Ellipse key={`L${i}`} cx={l.x} cy={l.y} rx={2.2} ry={1.1} fill={c} opacity={0.85}
          transform={`rotate(${l.r} ${l.x} ${l.y})`} />
      ))}
      <Path d="M32 20 C 32 28, 28 34, 20 36" stroke={c} strokeWidth={1.4} strokeLinecap="round" />
      <Path d="M30 14 C 30 10, 28 8, 25 9" stroke={c} strokeWidth={1.4} strokeLinecap="round" />
      {[{x:32,y:16,r:30},{x:31,y:21,r:20},{x:29,y:26,r:10},{x:26,y:31,r:-10},{x:23,y:34,r:-25}].map((l,i) => (
        <Ellipse key={`R${i}`} cx={l.x} cy={l.y} rx={2.2} ry={1.1} fill={c} opacity={0.85}
          transform={`rotate(${l.r} ${l.x} ${l.y})`} />
      ))}
      <Path d="M20 10 L20.8 12.2 L23 13 L20.8 13.8 L20 16 L19.2 13.8 L17 13 L19.2 12.2 Z" fill={c} />
    </Svg>
  );
}

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
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 20 }]}>
      {/* Full-screen background */}
      <LinearGradient
        colors={['rgba(61,46,95,0.6)', 'transparent']}
        locations={[0, 0.7]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0.4 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Starfield density="dense" />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {step === 0 && (
          <View style={styles.centered}>
            <View style={{ flex: 1 }} />
            <LaurelWreath size={72} />
            <Text style={styles.invictvs}>INVICTVS</Text>
            <View style={styles.goldDivider} />
            <Text style={styles.poem}>
              I am the master of my fate.{'\n'}I am the captain of my soul.
            </Text>
            <Text style={styles.poemAuthor}>{'\u2014'} W. E. HENLEY</Text>
            <View style={{ flex: 1 }} />
            <GradientButton label="BEGIN" onPress={next} style={{ width: 200 }} />
            <Text style={styles.footerNote}>32 WEEKS {'\u00B7'} 4 BLOCKS</Text>
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={styles.stepLabel}>1 / 4 {'\u2014'} PROFILE</Text>
            <Text style={styles.stepTitle}>Physical Profile</Text>
            <InputRow label="AGE" value={age} onChange={setAge} kbd="number-pad" />
            <Text style={styles.fieldLabel}>SEX</Text>
            <View style={styles.pillRow}>
              <PillBtn label="MALE" active={sex === 'male'} onPress={() => setSex('male')} />
              <PillBtn label="FEMALE" active={sex === 'female'} onPress={() => setSex('female')} />
            </View>
            <InputRow label="HEIGHT (CM)" value={height} onChange={setHeight} kbd="number-pad" />
            <InputRow label="STARTING WEIGHT (KG)" value={startWeight} onChange={setStartWeight} kbd="decimal-pad" />
            <InputRow label="START DATE (YYYY-MM-DD)" value={startDate} onChange={setStartDate} />
            <GradientButton label="NEXT" onPress={next} style={{ marginTop: 20 }} />
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.stepLabel}>2 / 4 {'\u2014'} STARTING LIFTS</Text>
            <Text style={styles.stepTitle}>Current 1RMs (kg)</Text>
            <InputRow label="SQUAT" value={squat} onChange={setSquat} kbd="decimal-pad" color={COLORS.squat} />
            <InputRow label="BENCH" value={bench} onChange={setBench} kbd="decimal-pad" color={COLORS.bench} />
            <InputRow label="DEADLIFT" value={deadlift} onChange={setDeadlift} kbd="decimal-pad" color={COLORS.deadlift} />
            <Text style={styles.fieldLabel}>TARGET MODE</Text>
            <View style={styles.pillRow}>
              <PillBtn label="REALISTIC" active={!useStretch} onPress={() => setUseStretch(false)} />
              <PillBtn label="STRETCH" active={useStretch} onPress={() => setUseStretch(true)} />
            </View>
            <GradientButton label="NEXT" onPress={next} style={{ marginTop: 20 }} />
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.stepLabel}>3 / 4 {'\u2014'} ACTIVITY</Text>
            <Text style={styles.stepTitle}>Daily E-Bike?</Text>
            <View style={styles.pillRow}>
              <PillBtn label="YES" active={ebikeEnabled} onPress={() => setEbikeEnabled(true)} />
              <PillBtn label="NO" active={!ebikeEnabled} onPress={() => setEbikeEnabled(false)} />
            </View>
            {ebikeEnabled && <InputRow label="DEFAULT MINUTES/DAY" value={ebikeDefault} onChange={setEbikeDefault} kbd="number-pad" />}
            <GradientButton label="NEXT" onPress={next} style={{ marginTop: 20 }} />
          </View>
        )}

        {step === 4 && (
          <View>
            <Text style={styles.stepLabel}>4 / 4 {'\u2014'} REMINDERS</Text>
            <Text style={styles.stepTitle}>Daily Log Reminder</Text>
            <View style={styles.pillRow}>
              <PillBtn label="ON" active={reminderEnabled} onPress={() => setReminderEnabled(true)} />
              <PillBtn label="OFF" active={!reminderEnabled} onPress={() => setReminderEnabled(false)} />
            </View>
            {reminderEnabled && <InputRow label="TIME (HH:MM)" value={reminderTime} onChange={setReminderTime} />}
            <View style={{ height: 24 }} />
            <Text style={styles.blessing}>
              {'\u2670'} I am the captain of my soul {'\u2670'}
            </Text>
            <GradientButton label="BEGIN" onPress={finish} style={{ marginTop: 24 }} />
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
      <TextInput
        style={[styles.input, color ? { borderColor: color } : undefined]}
        value={value} onChangeText={onChange}
        keyboardType={kbd || 'default'}
        placeholderTextColor={COLORS.textMuted}
        returnKeyType="done"
        onSubmitEditing={() => Keyboard.dismiss()}
      />
    </View>
  );
}

function PillBtn({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.pill, active && styles.pillActive]} activeOpacity={0.7}>
      {active ? (
        <LinearGradient colors={[COLORS.gradientBtnTop, COLORS.gradientBtnBottom]} style={styles.pillGradient}>
          <Text style={[styles.pillText, { color: COLORS.silverBright }]}>{label}</Text>
        </LinearGradient>
      ) : (
        <Text style={styles.pillText}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: 24, flexGrow: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },

  invictvs: { fontSize: 56, fontFamily: FONTS.serif, color: COLORS.silverBright, letterSpacing: 6, marginTop: 30, fontWeight: '400' },
  goldDivider: { width: 120, height: 1, backgroundColor: COLORS.gold, marginVertical: 14, opacity: 0.7 },
  poem: { fontSize: 14, fontFamily: FONTS.serifItalic, color: COLORS.silverDim, fontStyle: 'italic', textAlign: 'center', lineHeight: 22, maxWidth: 260 },
  poemAuthor: { fontSize: 9, fontFamily: FONTS.mono, color: COLORS.textMuted, letterSpacing: 1.5, marginTop: 20, textTransform: 'uppercase' },
  footerNote: { fontSize: 9, fontFamily: FONTS.mono, color: COLORS.textMuted, letterSpacing: 1.5, marginTop: 16, textTransform: 'uppercase' },

  stepLabel: { fontSize: 10, fontFamily: FONTS.mono, color: COLORS.purpleWarm, letterSpacing: 2, fontWeight: '700', marginBottom: 8 },
  stepTitle: { fontSize: 26, fontFamily: FONTS.serif, color: COLORS.silverBright, marginBottom: 24 },

  inputGroup: { marginBottom: 20 },
  fieldLabel: { fontSize: 9, fontFamily: FONTS.mono, color: COLORS.silverDim, letterSpacing: 1.5, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 14, fontSize: 18, color: COLORS.textPrimary, fontFamily: FONTS.mono },

  pillRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  pill: { flex: 1, borderWidth: 1, borderColor: COLORS.borderBright, borderRadius: 10, paddingVertical: 12, alignItems: 'center', overflow: 'hidden' },
  pillActive: { borderColor: COLORS.gradientBtnBorder },
  pillGradient: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  pillText: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, fontFamily: FONTS.mono, letterSpacing: 1 },

  blessing: { fontSize: 11, fontFamily: FONTS.mono, color: COLORS.silver, textAlign: 'center', fontWeight: '700', letterSpacing: 1 },
});
