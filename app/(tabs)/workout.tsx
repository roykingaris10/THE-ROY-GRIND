import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppData } from '@/hooks/useAppData';
import { useCurrentProgram } from '@/hooks/useCurrentProgram';
import { getBlockWorkouts } from '@/lib/workouts';
import { getDateString, getEstimated1RM } from '@/lib/helpers';
import { calculateTrainingCalories, inferSessionType } from '@/lib/calorieEngine';
import { toRoman } from '@/lib/roman';
import { COLORS } from '@/lib/constants';
import { FONTS } from '@/lib/typography';
import { Card } from '@/components/Card';
import { ExerciseCard } from '@/components/ExerciseCard';
import { SetLoggerModal } from '@/components/SetLoggerModal';
import { SessionSummary } from '@/components/SessionSummary';
import { PRToast } from '@/components/PRToast';
import { ProgressBar } from '@/components/ProgressBar';
import { GradientButton } from '@/components/GradientButton';
import type { Exercise, SetLog, WorkoutSession, LiftType } from '@/types';

export default function WorkoutScreen() {
  const insets = useSafeAreaInsets();
  const { data, loading, addSet, removeSet, upsertSession } = useAppData();
  const programStart = data?.settings?.programStart ?? '2026-04-14';
  const { week, block, isDeload } = useCurrentProgram(programStart);

  const [dayIndex, setDayIndex] = useState(1);
  const [loggerVisible, setLoggerVisible] = useState(false);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [prToast, setPrToast] = useState<{ visible: boolean; liftType: LiftType; e1rm: number }>({
    visible: false, liftType: 'squat', e1rm: 0,
  });

  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionEndTime, setSessionEndTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionPRs = useRef<SetLog[]>([]);
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (sessionStartTime && !sessionEndTime) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [sessionStartTime, sessionEndTime]);

  const workouts = useMemo(() => getBlockWorkouts(week), [week]);
  const todayStr = useMemo(() => getDateString(new Date()), []);
  const selectedDay = useMemo(
    () => workouts.find(w => w.dayIndex === dayIndex) ?? workouts[0],
    [workouts, dayIndex],
  );

  const todaySets = useMemo(() => {
    if (!data) return [];
    return data.sets.filter(s => s.date === todayStr && s.dayIndex === dayIndex);
  }, [data, todayStr, dayIndex]);

  const setsForExercise = useCallback(
    (exerciseId: string): SetLog[] => todaySets.filter(s => s.exerciseId === exerciseId),
    [todaySets],
  );

  const totalCompletedSets = todaySets.filter(s => !s.isWarmup).length;
  const totalProgrammedSets = selectedDay
    ? selectedDay.exercises.reduce((sum, e) => sum + e.sets, 0) : 0;

  function formatElapsed(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  const handleStartSession = useCallback(() => {
    setSessionStartTime(new Date());
    setSessionEndTime(null);
    setElapsed(0);
    sessionPRs.current = [];
    sessionIdRef.current = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleOpenLogger = useCallback((exercise: Exercise) => {
    setActiveExercise(exercise);
    setLoggerVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleLogSet = useCallback(
    async (weight: number, reps: number, rpe: number, isWarmup: boolean, notes?: string) => {
      if (!activeExercise || !data) return;
      const setNumber = setsForExercise(activeExercise.id).length + 1;
      const entry = await addSet({
        date: todayStr, week, dayIndex,
        exerciseId: activeExercise.id, exerciseName: activeExercise.name,
        liftType: activeExercise.liftType ?? null, isMain: activeExercise.isMain ?? false,
        setNumber, weight, reps, rpe, notes, isWarmup,
      });
      if (entry.isPR && entry.liftType) {
        sessionPRs.current.push(entry);
        setPrToast({ visible: true, liftType: entry.liftType, e1rm: entry.e1rm ?? 0 });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      setLoggerVisible(false);
    },
    [activeExercise, data, setsForExercise, addSet, todayStr, week, dayIndex],
  );

  const handleFinishWorkout = useCallback(async () => {
    if (!sessionStartTime || !selectedDay || !data) return;
    const now = new Date();
    setSessionEndTime(now);
    if (timerRef.current) clearInterval(timerRef.current);
    const durationMin = Math.round((now.getTime() - sessionStartTime.getTime()) / 60000);
    const sessionType = inferSessionType(week, dayIndex);
    const burn = calculateTrainingCalories(durationMin, data.profile.startingWeight, sessionType);
    const completionPercent = totalProgrammedSets > 0
      ? Math.round((totalCompletedSets / totalProgrammedSets) * 100) : 100;
    const session: WorkoutSession = {
      id: sessionIdRef.current ?? Date.now().toString(),
      date: todayStr, week, dayIndex, workoutName: selectedDay.name,
      startTime: sessionStartTime.toISOString(), endTime: now.toISOString(),
      completed: true, completionPercent, estimatedBurnKcal: burn,
    };
    await upsertSession(session);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSummaryVisible(true);
  }, [sessionStartTime, selectedDay, data, week, dayIndex, todayStr, totalCompletedSets, totalProgrammedSets, upsertSession]);

  const handleSummaryClose = useCallback(() => {
    setSummaryVisible(false);
    setSessionStartTime(null);
    setSessionEndTime(null);
    setElapsed(0);
    sessionPRs.current = [];
    sessionIdRef.current = null;
  }, []);

  if (loading || !data) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 60 }} />
      </View>
    );
  }

  const sessionActive = sessionStartTime !== null && sessionEndTime === null;
  const dayTabs = ['I', 'II', 'III', 'IV', 'V'];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <PRToast
        visible={prToast.visible}
        liftType={prToast.liftType}
        e1rm={prToast.e1rm}
        onDismiss={() => setPrToast(prev => ({ ...prev, visible: false }))}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Date header */}
        <View style={styles.dateHeader}>
          <Text style={styles.dateTitle}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long' })} {'\u00B7'} {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
          <Text style={styles.dateSub}>BLOCK {toRoman(Math.ceil(week / 8))} {'\u00B7'} WEEK {toRoman(week)}</Text>
        </View>

        {/* Day tabs */}
        <View style={styles.dayTabsContainer}>
          {dayTabs.map((d, i) => {
            const active = (i + 1) === dayIndex;
            return (
              <TouchableOpacity
                key={d}
                onPress={() => { setDayIndex(i + 1); Haptics.selectionAsync(); }}
                style={styles.dayTab}
                activeOpacity={0.7}
              >
                {active ? (
                  <LinearGradient
                    colors={['rgba(107,78,158,0.5)', 'rgba(61,46,95,0.5)']}
                    style={[styles.dayTabInner, styles.dayTabActive]}
                  >
                    <Text style={[styles.dayTabText, { color: COLORS.silverBright }]}>{d}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.dayTabInner}>
                    <Text style={[styles.dayTabText, { color: COLORS.textMuted }]}>{d}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
          <View style={[styles.dayTabInner, { alignItems: 'center', justifyContent: 'center' }]}>
            <FontAwesome name="leaf" size={12} color={COLORS.textMuted} />
          </View>
        </View>

        {/* Session progress */}
        <View style={styles.sessionProgress}>
          <ProgressBar
            progress={totalProgrammedSets > 0 ? totalCompletedSets / totalProgrammedSets : 0}
            color={COLORS.primary}
            height={3}
          />
          <View style={styles.sessionMeta}>
            <Text style={styles.sessionSets}>{totalCompletedSets}/{totalProgrammedSets} SETS {'\u00B7'} {totalProgrammedSets > 0 ? Math.round((totalCompletedSets / totalProgrammedSets) * 100) : 0}%</Text>
            {sessionActive && (
              <Text style={styles.sessionTimer}>{'\u231B'} {formatElapsed(elapsed)}</Text>
            )}
          </View>
        </View>

        {/* Start session / exercises */}
        {!sessionStartTime && (
          <GradientButton label="START SESSION" onPress={handleStartSession} style={{ marginBottom: 16 }} />
        )}

        {selectedDay?.exercises.map((exercise, idx) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            completedSets={setsForExercise(exercise.id)}
            onLogSet={() => handleOpenLogger(exercise)}
          />
        ))}

        {sessionActive && totalCompletedSets > 0 && (
          <GradientButton label="FINISH WORKOUT" onPress={handleFinishWorkout} style={{ marginTop: 16 }} />
        )}
      </ScrollView>

      <SetLoggerModal
        visible={loggerVisible}
        exercise={activeExercise}
        onClose={() => setLoggerVisible(false)}
        onLog={handleLogSet}
      />
      <SessionSummary
        visible={summaryVisible}
        workoutName={selectedDay?.name ?? ''}
        duration={sessionStartTime ? Math.round(((sessionEndTime ?? new Date()).getTime() - sessionStartTime.getTime()) / 60000) : 0}
        sets={todaySets.filter(s => !s.isWarmup)}
        prs={sessionPRs.current}
        estimatedBurn={(() => {
          if (!sessionStartTime || !data) return 0;
          const durationMin = Math.round(((sessionEndTime ?? new Date()).getTime() - sessionStartTime.getTime()) / 60000);
          return calculateTrainingCalories(durationMin, data.profile.startingWeight, inferSessionType(week, dayIndex));
        })()}
        onClose={handleSummaryClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 14 },

  dateHeader: { alignItems: 'center', marginBottom: 12 },
  dateTitle: { fontSize: 18, fontFamily: FONTS.serif, color: COLORS.silverBright },
  dateSub: { fontSize: 9, fontFamily: FONTS.mono, color: COLORS.textMuted, letterSpacing: 1.5, marginTop: 2, textTransform: 'uppercase' },

  dayTabsContainer: {
    flexDirection: 'row', gap: 4, marginBottom: 14, padding: 4,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
  },
  dayTab: { flex: 1 },
  dayTabInner: { padding: 7, borderRadius: 7, alignItems: 'center' },
  dayTabActive: { borderWidth: 1, borderColor: COLORS.purpleWarm },
  dayTabText: { fontFamily: FONTS.serif, fontSize: 15 },

  sessionProgress: { marginBottom: 16 },
  sessionMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  sessionSets: { fontSize: 9, fontFamily: FONTS.mono, color: COLORS.silver, letterSpacing: 1.5, textTransform: 'uppercase' },
  sessionTimer: { fontSize: 9, fontFamily: FONTS.mono, color: COLORS.textMuted, letterSpacing: 1 },
});
