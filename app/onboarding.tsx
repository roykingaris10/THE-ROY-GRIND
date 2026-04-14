import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/lib/constants';
import { useAppData } from '@/hooks/useAppData';
import { getDateString } from '@/lib/helpers';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateSettings, addLift, updateEntry } = useAppData();

  const [step, setStep] = useState(0);
  const [startDate, setStartDate] = useState(getDateString(new Date()));
  const [startWeight, setStartWeight] = useState('130');
  const [startSquat, setStartSquat] = useState('150');
  const [startBench, setStartBench] = useState('105');
  const [startDeadlift, setStartDeadlift] = useState('210');

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(step + 1);
  };

  const handleFinish = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Save settings
    await updateSettings({
      programStart: startDate,
      onboardingComplete: true,
    });

    // Save starting weight
    if (parseFloat(startWeight) > 0) {
      await updateEntry(startDate, { weight: parseFloat(startWeight) });
    }

    // Save starting lifts (one-off baseline entries)
    const sq = parseFloat(startSquat);
    const bn = parseFloat(startBench);
    const dl = parseFloat(startDeadlift);

    if (sq > 0) {
      await addLift({ date: startDate, type: 'squat', weight: sq, reps: 1, sets: 1, rpe: 9 });
    }
    if (bn > 0) {
      await addLift({ date: startDate, type: 'bench', weight: bn, reps: 1, sets: 1, rpe: 9 });
    }
    if (dl > 0) {
      await addLift({ date: startDate, type: 'deadlift', weight: dl, reps: 1, sets: 1, rpe: 9 });
    }

    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {step === 0 && (
          <View style={styles.centered}>
            <Text style={styles.huge}>THE GRIND</Text>
            <View style={styles.divider} />
            <Text style={styles.tagline}>32 WEEKS TO 610KG</Text>
            <Text style={styles.subtagline}>130 → 100 | 465 → 610</Text>
            <View style={{ height: 60 }} />
            <Text style={styles.description}>
              An 8-month body recomposition & strength tracker. Log daily. Train smart. Measure everything. No excuses.
            </Text>
            <View style={{ height: 40 }} />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
              <Text style={styles.primaryBtnText}>LET'S GO</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={styles.stepLabel}>STEP 1 / 3</Text>
            <Text style={styles.stepTitle}>PROGRAM START DATE</Text>
            <Text style={styles.stepDescription}>
              When does your 32-week cycle begin? Usually today.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>START DATE (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.textInput}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="2026-04-14"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
              <Text style={styles.primaryBtnText}>NEXT</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.stepLabel}>STEP 2 / 3</Text>
            <Text style={styles.stepTitle}>STARTING WEIGHT</Text>
            <Text style={styles.stepDescription}>Current bodyweight in kilograms.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>WEIGHT (KG)</Text>
              <TextInput
                style={styles.textInput}
                value={startWeight}
                onChangeText={setStartWeight}
                keyboardType="decimal-pad"
                placeholder="130"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
              <Text style={styles.primaryBtnText}>NEXT</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.stepLabel}>STEP 3 / 3</Text>
            <Text style={styles.stepTitle}>STARTING LIFTS</Text>
            <Text style={styles.stepDescription}>
              Current 1-rep max for each lift (kg).
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: COLORS.squat }]}>SQUAT 1RM</Text>
              <TextInput
                style={[styles.textInput, { borderColor: COLORS.squat }]}
                value={startSquat}
                onChangeText={setStartSquat}
                keyboardType="decimal-pad"
                placeholder="150"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: COLORS.bench }]}>BENCH 1RM</Text>
              <TextInput
                style={[styles.textInput, { borderColor: COLORS.bench }]}
                value={startBench}
                onChangeText={setStartBench}
                keyboardType="decimal-pad"
                placeholder="105"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: COLORS.deadlift }]}>DEADLIFT 1RM</Text>
              <TextInput
                style={[styles.textInput, { borderColor: COLORS.deadlift }]}
                value={startDeadlift}
                onChangeText={setStartDeadlift}
                keyboardType="decimal-pad"
                placeholder="210"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleFinish}>
              <Text style={styles.primaryBtnText}>START THE GRIND</Text>
            </TouchableOpacity>
          </View>
        )}
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
    padding: 24,
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  huge: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.textPrimary,
    fontFamily: mono,
    letterSpacing: 4,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: COLORS.primary,
    marginTop: 16,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: mono,
    letterSpacing: 3,
  },
  subtagline: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: mono,
    letterSpacing: 2,
    marginTop: 6,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: mono,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  stepLabel: {
    fontSize: 10,
    color: COLORS.primary,
    fontFamily: mono,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    fontFamily: mono,
    letterSpacing: 2,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: mono,
    marginBottom: 32,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 10,
    color: COLORS.label,
    fontFamily: mono,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 14,
    fontSize: 18,
    color: COLORS.textPrimary,
    fontFamily: mono,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
    fontFamily: mono,
    letterSpacing: 2,
  },
});
