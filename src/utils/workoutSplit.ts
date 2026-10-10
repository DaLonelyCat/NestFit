import { DayRoutine, Exercise, TrainingMode } from '../types';
import { EXERCISES } from '../data/exercises';

export interface ExtendedDayRoutine extends DayRoutine {
  gymExerciseIds: number[];
}

export const WEEKLY_SPLIT: ExtendedDayRoutine[] = [
  {
    dayName: 'Monday',
    splitName: 'Push Day',
    tagline: 'Chest, Shoulders & Triceps Hypertrophy',
    focusMuscles: ['Chest', 'Shoulder', 'Arm'],
    isRestDay: false,
    exerciseIds: [1, 2, 7, 8, 32, 12, 14, 33, 34, 40], // Home kit
    gymExerciseIds: [26, 7, 8, 24, 25, 14, 23, 48, 49, 1] // Gym mode
  },
  {
    dayName: 'Tuesday',
    splitName: 'Pull Day',
    tagline: 'Upper Back, Lats & Biceps Hypertrophy',
    focusMuscles: ['Back', 'Arm'],
    isRestDay: false,
    exerciseIds: [6, 20, 13, 4, 35, 15, 18, 36, 5, 38], // Home kit
    gymExerciseIds: [44, 22, 20, 6, 27, 47, 4, 18, 5, 13] // Gym mode
  },
  {
    dayName: 'Wednesday',
    splitName: 'Legs & Core Day',
    tagline: 'Quads, Hamstrings, Glutes & Abdominal Wall',
    focusMuscles: ['Leg', 'Core'],
    isRestDay: false,
    exerciseIds: [3, 19, 30, 31, 16, 39, 43, 9, 17, 42], // Home kit
    gymExerciseIds: [21, 3, 45, 46, 30, 31, 10, 28, 9, 42] // Gym mode
  },
  {
    dayName: 'Thursday',
    splitName: 'Active Recovery / Rest',
    tagline: 'Mobility, Stretching & Recovery Flow',
    focusMuscles: [],
    isRestDay: true,
    exerciseIds: [1, 17, 42],
    gymExerciseIds: [1, 17, 42]
  },
  {
    dayName: 'Friday',
    splitName: 'Upper Body Power',
    tagline: 'Compound Press & Pull Strength Overload',
    focusMuscles: ['Chest', 'Back', 'Shoulder', 'Arm'],
    isRestDay: false,
    exerciseIds: [7, 32, 6, 12, 35, 34, 14, 41],
    gymExerciseIds: [44, 26, 7, 22, 25, 23, 47, 49]
  },
  {
    dayName: 'Saturday',
    splitName: 'Lower Body & Posterior Chain',
    tagline: 'Deadlifts, Squats, Glute Thrusts & Stability',
    focusMuscles: ['Back', 'Leg', 'Core'],
    isRestDay: false,
    exerciseIds: [11, 31, 19, 30, 39, 43, 42],
    gymExerciseIds: [11, 21, 45, 46, 29, 28, 43]
  },
  {
    dayName: 'Sunday',
    splitName: 'Full Rest & Recharge',
    tagline: 'Neuromuscular Recovery & Hydration',
    focusMuscles: [],
    isRestDay: true,
    exerciseIds: [],
    gymExerciseIds: []
  }
];

export function getTodayRoutine(): ExtendedDayRoutine {
  const dayNames: DayRoutine['dayName'][] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];
  const todayIndex = new Date().getDay();
  const currentDayName = dayNames[todayIndex];
  return WEEKLY_SPLIT.find(s => s.dayName === currentDayName) || WEEKLY_SPLIT[0];
}

export function getExercisesForRoutine(
  routine: ExtendedDayRoutine | DayRoutine,
  trainingMode: TrainingMode = 'home'
): Exercise[] {
  if (routine.isRestDay && routine.exerciseIds.length === 0) {
    return [];
  }

  const extended = routine as ExtendedDayRoutine;
  const targetIds = trainingMode === 'gym' && extended.gymExerciseIds
    ? extended.gymExerciseIds
    : routine.exerciseIds;

  return targetIds
    .map(id => EXERCISES.find(e => e.id === id))
    .filter((e): e is Exercise => {
      if (!e) return false;
      if (trainingMode === 'home') {
        // Exclude gym_machine only movements in home kit mode
        return !e.suitableGear.includes('gym_machine') || e.suitableGear.includes('dumbbell') || e.suitableGear.includes('barbell') || e.suitableGear.includes('bodyweight');
      }
      return true;
    });
}
