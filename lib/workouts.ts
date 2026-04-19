import type { WorkoutDay } from '@/types';

export const BLOCK_1_WORKOUTS: WorkoutDay[] = [
  {
    dayIndex: 1,
    name: 'Squat Priority + Posterior Chain',
    exercises: [
      { id: 'b1d1e1', name: 'Competition Squat', sets: 4, reps: '6', rpe: '7-8', liftType: 'squat', isMain: true },
      { id: 'b1d1e2', name: 'Pause Squat (3-sec)', sets: 3, reps: '4', rpe: '7', liftType: 'squat' },
      { id: 'b1d1e3', name: 'Romanian Deadlift', sets: 3, reps: '8', rpe: '7' },
      { id: 'b1d1e4', name: 'Leg Curl', sets: 3, reps: '12', rpe: '8' },
      { id: 'b1d1e5', name: 'Ab Wheel', sets: 3, reps: '10-15' },
    ],
  },
  {
    dayIndex: 2,
    name: 'Bench Priority + Triceps',
    exercises: [
      { id: 'b1d2e1', name: 'Competition Bench', sets: 4, reps: '6', rpe: '7-8', liftType: 'bench', isMain: true },
      { id: 'b1d2e2', name: 'Close-Grip Bench', sets: 3, reps: '8', rpe: '7-8', liftType: 'bench' },
      { id: 'b1d2e3', name: 'Barbell Row', sets: 4, reps: '8', rpe: '7-8' },
      { id: 'b1d2e4', name: 'Overhead Press', sets: 3, reps: '8', rpe: '7' },
      { id: 'b1d2e5', name: 'Tate Press / Skull Crushers', sets: 3, reps: '12', rpe: '8' },
      { id: 'b1d2e6', name: 'Face Pulls', sets: 3, reps: '15', rpe: '7' },
    ],
  },
  {
    dayIndex: 3,
    name: 'Deadlift + Back',
    exercises: [
      { id: 'b1d3e1', name: 'Competition Deadlift', sets: 4, reps: '5', rpe: '7-8', liftType: 'deadlift', isMain: true },
      { id: 'b1d3e2', name: 'Deficit Deadlift (2-inch)', sets: 3, reps: '6', rpe: '6-7', liftType: 'deadlift' },
      { id: 'b1d3e3', name: 'Chest-Supported Row', sets: 3, reps: '10', rpe: '8' },
      { id: 'b1d3e4', name: 'Lat Pulldown', sets: 3, reps: '12', rpe: '8' },
      { id: 'b1d3e5', name: 'Back Extension (weighted)', sets: 3, reps: '12', rpe: '7' },
      { id: 'b1d3e6', name: 'Farmer Walks', sets: 3, reps: '30m' },
    ],
  },
  {
    dayIndex: 4,
    name: 'Squat Variation + Quads',
    exercises: [
      { id: 'b1d4e1', name: 'Front Squat / SSB Squat', sets: 3, reps: '6', rpe: '7', liftType: 'squat' },
      { id: 'b1d4e2', name: 'Belt Squat', sets: 3, reps: '10-12', rpe: '7-8' },
      { id: 'b1d4e3', name: 'Bulgarian Split Squat', sets: 3, reps: '10/leg', rpe: '7-8' },
      { id: 'b1d4e4', name: 'Leg Extension', sets: 3, reps: '15', rpe: '8' },
      { id: 'b1d4e5', name: 'Calf Raise', sets: 3, reps: '15', rpe: '8' },
    ],
  },
  {
    dayIndex: 5,
    name: 'Bench Variation + Upper',
    exercises: [
      { id: 'b1d5e1', name: 'Paused Bench (2-sec)', sets: 4, reps: '5', rpe: '7', liftType: 'bench', isMain: true },
      { id: 'b1d5e2', name: 'Incline Dumbbell Press', sets: 3, reps: '10', rpe: '8' },
      { id: 'b1d5e3', name: 'Weighted Pull-Ups', sets: 4, reps: '8', rpe: '8' },
      { id: 'b1d5e4', name: 'Dumbbell OHP', sets: 3, reps: '10', rpe: '7' },
      { id: 'b1d5e5', name: 'Weighted Dips', sets: 3, reps: '10', rpe: '8' },
      { id: 'b1d5e6', name: 'Bicep Curls', sets: 3, reps: '12', rpe: '7' },
    ],
  },
];

export const BLOCK_2_WORKOUTS: WorkoutDay[] = [
  {
    dayIndex: 1,
    name: 'Heavy Squat + Bench',
    exercises: [
      { id: 'b2d1e1', name: 'Back Squat', sets: 5, reps: '3-5', rpe: '7-8', liftType: 'squat', isMain: true },
      { id: 'b2d1e2', name: 'Bench Press', sets: 5, reps: '3-5', rpe: '7-8', liftType: 'bench', isMain: true },
      { id: 'b2d1e3', name: 'Leg Press', sets: 3, reps: '8-10', rpe: '7' },
      { id: 'b2d1e4', name: 'Incline Dumbbell Press', sets: 3, reps: '8-10' },
      { id: 'b2d1e5', name: 'Cable Rows', sets: 3, reps: '10-12' },
    ],
  },
  {
    dayIndex: 2,
    name: 'Heavy Deadlift + Back',
    exercises: [
      { id: 'b2d2e1', name: 'Conventional Deadlift', sets: 5, reps: '3-5', rpe: '7-8', liftType: 'deadlift', isMain: true },
      { id: 'b2d2e2', name: 'Barbell Rows', sets: 4, reps: '5-8', rpe: '7-8' },
      { id: 'b2d2e3', name: 'Pull-ups / Lat Pulldown', sets: 3, reps: '6-10' },
      { id: 'b2d2e4', name: 'Face Pulls', sets: 3, reps: '15-20' },
      { id: 'b2d2e5', name: 'Hammer Curls', sets: 3, reps: '10-12' },
    ],
  },
  {
    dayIndex: 3,
    name: 'Bench Focus + Squat',
    exercises: [
      { id: 'b2d3e1', name: 'Bench Press', sets: 5, reps: '3-5', rpe: '7-9', liftType: 'bench', isMain: true },
      { id: 'b2d3e2', name: 'Front Squat', sets: 4, reps: '4-6', rpe: '7-8', liftType: 'squat', isMain: true },
      { id: 'b2d3e3', name: 'Close-Grip Bench', sets: 3, reps: '6-8', rpe: '7' },
      { id: 'b2d3e4', name: 'Romanian Deadlift', sets: 3, reps: '8-10' },
      { id: 'b2d3e5', name: 'Overhead Press', sets: 3, reps: '6-8' },
    ],
  },
  {
    dayIndex: 4,
    name: 'Variation + Volume',
    exercises: [
      { id: 'b2d4e1', name: 'Paused Squat', sets: 4, reps: '4-6', rpe: '7', liftType: 'squat' },
      { id: 'b2d4e2', name: 'Dumbbell Bench Press', sets: 3, reps: '8-10', rpe: '7' },
      { id: 'b2d4e3', name: 'Hip Thrust', sets: 3, reps: '8-10' },
      { id: 'b2d4e4', name: 'Dumbbell Rows', sets: 3, reps: '8-10' },
      { id: 'b2d4e5', name: 'Lateral Raises', sets: 3, reps: '15-20' },
      { id: 'b2d4e6', name: 'Tricep Pushdowns', sets: 3, reps: '10-12' },
    ],
  },
];

export const BLOCK_3_WORKOUTS: WorkoutDay[] = [
  {
    dayIndex: 1,
    name: 'Heavy Squat + Bench',
    exercises: [
      { id: 'b3d1e1', name: 'Back Squat', sets: 5, reps: '1-3', rpe: '8-9', liftType: 'squat', isMain: true },
      { id: 'b3d1e2', name: 'Bench Press', sets: 5, reps: '1-3', rpe: '8-9', liftType: 'bench', isMain: true },
      { id: 'b3d1e3', name: 'Leg Press', sets: 3, reps: '6-8', rpe: '7' },
      { id: 'b3d1e4', name: 'Incline Press', sets: 3, reps: '6-8' },
    ],
  },
  {
    dayIndex: 2,
    name: 'Heavy Deadlift',
    exercises: [
      { id: 'b3d2e1', name: 'Conventional Deadlift', sets: 5, reps: '1-3', rpe: '8-9', liftType: 'deadlift', isMain: true },
      { id: 'b3d2e2', name: 'Barbell Rows', sets: 4, reps: '5-8', rpe: '7-8' },
      { id: 'b3d2e3', name: 'Pull-ups / Lat Pulldown', sets: 3, reps: '6-10' },
      { id: 'b3d2e4', name: 'Face Pulls', sets: 3, reps: '15-20' },
    ],
  },
  {
    dayIndex: 3,
    name: 'Squat + Bench Doubles',
    exercises: [
      { id: 'b3d3e1', name: 'Back Squat', sets: 4, reps: '2', rpe: '8-9.5', liftType: 'squat', isMain: true },
      { id: 'b3d3e2', name: 'Bench Press', sets: 4, reps: '2', rpe: '8-9.5', liftType: 'bench', isMain: true },
      { id: 'b3d3e3', name: 'Romanian Deadlift', sets: 3, reps: '6-8' },
      { id: 'b3d3e4', name: 'Close-Grip Bench', sets: 3, reps: '4-6' },
    ],
  },
];

export const BLOCK_4_WORKOUTS: WorkoutDay[] = [
  {
    dayIndex: 1,
    name: 'Heavy Singles -- Squat',
    exercises: [
      { id: 'b4d1e1', name: 'Back Squat', sets: 3, reps: '1', rpe: '9-9.5', liftType: 'squat', isMain: true },
      { id: 'b4d1e2', name: 'Leg Press (Light)', sets: 2, reps: '8-10' },
      { id: 'b4d1e3', name: 'Leg Curls', sets: 2, reps: '10-12' },
    ],
  },
  {
    dayIndex: 2,
    name: 'Heavy Singles -- Bench + Dead',
    exercises: [
      { id: 'b4d2e1', name: 'Bench Press', sets: 3, reps: '1', rpe: '9-9.5', liftType: 'bench', isMain: true },
      { id: 'b4d2e2', name: 'Conventional Deadlift', sets: 3, reps: '1', rpe: '9-9.5', liftType: 'deadlift', isMain: true },
      { id: 'b4d2e3', name: 'Barbell Rows (Light)', sets: 2, reps: '8-10' },
    ],
  },
  {
    dayIndex: 3,
    name: 'Openers Practice',
    exercises: [
      { id: 'b4d3e1', name: 'Back Squat (Opener)', sets: 2, reps: '1', rpe: '8', liftType: 'squat', isMain: true },
      { id: 'b4d3e2', name: 'Bench Press (Opener)', sets: 2, reps: '1', rpe: '8', liftType: 'bench', isMain: true },
      { id: 'b4d3e3', name: 'Deadlift (Opener)', sets: 2, reps: '1', rpe: '8', liftType: 'deadlift', isMain: true },
    ],
  },
];

export function getBlockWorkouts(week: number): WorkoutDay[] {
  if (week >= 1 && week <= 8) return BLOCK_1_WORKOUTS;
  if (week >= 9 && week <= 16) return BLOCK_2_WORKOUTS;
  if (week >= 17 && week <= 26) return BLOCK_3_WORKOUTS;
  return BLOCK_4_WORKOUTS;
}

export function getWorkoutForDay(week: number, dayIndex: number): WorkoutDay | undefined {
  const workouts = getBlockWorkouts(week);
  return workouts.find(w => w.dayIndex === dayIndex);
}
