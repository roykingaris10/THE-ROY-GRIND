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
import * as Haptics from 'expo-haptics';
import { useAppData } from '@/hooks/useAppData';
import { useCurrentProgram } from '@/hooks/useCurrentProgram';
import { getBlockWorkouts } from '@/lib/workouts';
import { getDateString, getEstimated1RM } from '@/lib/helpers';
import { calculateTrainingCalories, inferSessionType } from '@/lib/calorieEngine';
import { COLORS, DELOAD_WEEKS } from '@/lib/constants';
import { Card, SectionLabel } from '@/components/Card';
import { ExerciseCard } from '@/components/ExerciseCard';
import { SetLoggerModal } from '@/components/SetLoggerModal';
import { SessionSummary } from '@/components/SessionSummary';
import { PRToast } from '@/components/PRToast';
import type { Exercise, SetLog, WorkoutSession, LiftType } from '@/types';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

export default function WorkoutScreen() {
  const insets = useSafeAreaInsets();
  const { data, loading, addSet, removeSet, upsertSession } = useAppData();
  const programStart = data?.settings?.programStart ?? '2026-04-14';
  const { week, block, isDeload } = useCurrentProgram(programStart);

  // ── Day selector state ──
  const [dayIndex, setDayIndex] = useState(1);

  // ── Modal state ──
  const [loggerVisible, setLoggerVisible] = useState(false);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [summaryVisible, setSummaryVisible] = useState(false);

  // ── PR toast state ──
  const [prToast, setPrToast] = useState<{ visible: boolean; liftType: LiftType; e1rm: number }>({
    visible: false,
    liftType: 'squat',
    e1rm: 0,
  });

  // ── Session timer state ──
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionEndTime, setSessionEndTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── PR tracking for summary ──
  const sessionPRs = useRef<SetLog[]>([]);

  // ── Session ID for upsert ──
  const sessionIdRef = useRef<string | null>(null);

  // Timer tick effect
  useEffect(() => {
    if (sessionStartTime && !sessionEndTime) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionStartTime, sessionEndTime]);

  // ── Derived data ──
  const workouts = useMemo(() => getBlockWorkouts(week), [week]);

  const todayStr = useMemo(() => getDateString(new Date()), []);

  const selectedDay = useMemo(
    () => workouts.find(w => w.dayIndex === dayIndex) ?? workouts[0],
    [workouts, dayIndex],
  );

  const todaySets = useMemo(() => {
    if (!data) return [];
    return data.sets.filter(
      s => s.date === todayStr && s.dayIndex === dayIndex,
    );
  }, [data, todayStr, dayIndex]);

  const setsForExercise = useCallback(
    (exerciseId: string): SetLog[] => {
      return todaySets.filter(s => s.exerciseId === exerciseId);
    },
    [todaySets],
  );

  const totalCompletedSets = todaySets.filter(s => !s.isWarmup).length;
  const totalProgrammedSets = selectedDay
    ? selectedDay.exercises.reduce((sum, e) => sum + e.sets, 0)
    : 0;

  // ── Helpers ──
  function formatElapsed(secs: number): string {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    if (h > 0) return `${h}:${mm}:${ss}`;
    return `${mm}:${ss}`;
  }

  function getDurationMinutes(): number {
    if (!sessionStartTime) return 0;
    const end = sessionEndTime ?? new Date();
    return Math.round((end.getTime() - sessionStartTime.getTime()) / 60000);
  }

  // ── Handlers ──
  const handleStartSession = useCallback(() => {
    const now = new Date();
    setSessionStartTime(now);
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
        date: todayStr,
        week,
        dayIndex,
        exerciseId: activeExercise.id,
        exerciseName: activeExercise.name,
        liftType: activeExercise.liftType ?? null,
        isMain: activeExercise.isMain ?? false,
        setNumber,
        weight,
        reps,
        rpe,
        notes,
        isWarmup,
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
    const weightKg = data.profile.startingWeight;
    const burn = calculateTrainingCalories(durationMin, weightKg, sessionType);

    const completionPercent =
      totalProgrammedSets > 0
        ? Math.round((totalCompletedSets / totalProgrammedSets) * 100)
        : 100;

    const session: WorkoutSession = {
      id: sessionIdRef.current ?? Date.now().toString(),
      date: todayStr,
      week,
      dayIndex,
      workoutName: selectedDay.name,
      startTime: sessionStartTime.toISOString(),
      endTime: now.toISOString(),
      completed: true,
      completionPercent,
      estimatedBurnKcal: burn,
    };

    await upsertSession(session);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSummaryVisible(true);
  }, [
    sessionStartTime,
    selectedDay,
    data,
    week,
    dayIndex,
    todayStr,
    totalCompletedSets,
    totalProgrammedSets,
    upsertSession,
  ]);

  const handleSummaryClose = useCallback(() => {
    setSummaryVisible(false);
    setSessionStartTime(null);
    setSessionEndTime(null);
    setElapsed(0);
    sessionPRs.current = [];
    sessionIdRef.current = null;
  }, []);

  // ── Early returns after all hooks ──
  if (loading || !data) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 60 }} />
      </View>
    );
  }

  const sessionActive = sessionStartTime !== null && sessionEndTime === null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* PR Toast */}
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
        {/* ── Header ── */}
        <Text style={styles.screenTitle}>WORKOUT</Text>
        <Text style={styles.meta}>
          Week {week} {'\u00B7'} {block.name}
          {isDeload ? '  [DELOAD]' : ''}
        </Text>

        {/* ── Day Selector ── */}
        <SectionLabel>SELECT DAY</SectionLabel>
        <View style={styles.pillRow}>
          {workouts.map(w => {
            const active = w.dayIndex === dayIndex;
            return (
              <TouchableOpacity
                key={w.dayIndex}
                onPress={() => {
                  setDayIndex(w.dayIndex);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[styles.pill, active && styles.pillActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>
                  Day {w.dayIndex}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Selected Day Name ── */}
        <Card delay={50}>
          <Text style={styles.dayName}>{selectedDay?.name}</Text>
          <Text style={styles.dayMeta}>
            {selectedDay?.exercises.length} exercises {'\u00B7'} {totalCompletedSets}/{totalProgrammedSets} sets done
          </Text>
        </Card>

        {/* ── Session Timer ── */}
        <SectionLabel>SESSION</SectionLabel>
        <Card delay={100}>
          {!sessionStartTime ? (
            <TouchableOpacity
              onPress={handleStartSession}
              style={styles.startBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.startBtnText}>START SESSION</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.timerContainer}>
              <Text style={styles.timerLabel}>ELAPSED</Text>
              <Text style={styles.timerValue}>{formatElapsed(elapsed)}</Text>
              {sessionEndTime && (
                <Text style={styles.timerDone}>SESSION ENDED</Text>
              )}
            </View>
          )}
        </Card>

        {/* ── Exercise List ── */}
        <SectionLabel>EXERCISES</SectionLabel>
        {selectedDay?.exercises.map((exercise, idx) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            completedSets={setsForExercise(exercise.id)}
            onLogSet={() => handleOpenLogger(exercise)}
          />
        ))}

        {/* ── Finish Workout Button ── */}
        {sessionActive && totalCompletedSets > 0 && (
          <TouchableOpacity
            onPress={handleFinishWorkout}
            style={styles.finishBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.finishBtnText}>FINISH WORKOUT</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* ── Set Logger Modal ── */}
      <SetLoggerModal
        visible={loggerVisible}
        exercise={activeExercise}
        onClose={() => setLoggerVisible(false)}
        onLog={handleLogSet}
      />

      {/* ── Session Summary Modal ── */}
      <SessionSummary
        visible={summaryVisible}
        workoutName={selectedDay?.name ?? ''}
        duration={getDurationMinutes()}
        sets={todaySets.filter(s => !s.isWarmup)}
        prs={sessionPRs.current}
        estimatedBurn={(() => {
          if (!sessionStartTime || !data) return 0;
          const durationMin = getDurationMinutes();
          const sessionType = inferSessionType(week, dayIndex);
          return calculateTrainingCalories(durationMin, data.profile.startingWeight, sessionType);
        })()}
        onClose={handleSummaryClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textPrimary,
    fontFamily: mono,
    letterSpacing: 3,
    marginTop: 12,
  },
  meta: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: mono,
    marginTop: 4,
    marginBottom: 16,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.ghostBorder,
    backgroundColor: COLORS.card,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    fontFamily: mono,
    letterSpacing: 1,
  },
  pillTextActive: {
    color: '#E8EAF0',
  },
  dayName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: mono,
  },
  dayMeta: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: mono,
    marginTop: 4,
  },
  startBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  startBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#E8EAF0',
    fontFamily: mono,
    letterSpacing: 2,
  },
  timerContainer: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  timerLabel: {
    fontSize: 9,
    color: COLORS.label,
    fontFamily: mono,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  timerValue: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.primary,
    fontFamily: mono,
    letterSpacing: 2,
  },
  timerDone: {
    fontSize: 10,
    color: COLORS.success,
    fontFamily: mono,
    letterSpacing: 2,
    fontWeight: '700',
    marginTop: 6,
  },
  finishBtn: {
    backgroundColor: COLORS.success,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  finishBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#E8EAF0',
    fontFamily: mono,
    letterSpacing: 3,
  },
});
