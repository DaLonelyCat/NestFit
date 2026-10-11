import {
  DayRoutine,
  Exercise,
  TrainingMode,
  DayOfWeek,
  SplitTemplateId,
  RoutineCategoryKey,
  ExtendedDayRoutine,
  MuscleGroup
} from '../types';
import { EXERCISES } from '../data/exercises';

export type { ExtendedDayRoutine };

export interface RoutineDefinition {
  categoryKey: RoutineCategoryKey;
  splitName: string;
  tagline: string;
  focusMuscles: MuscleGroup[];
  isRestDay: boolean;
  exerciseIds: number[];
  gymExerciseIds: number[];
}

export const ROUTINE_CATALOG: Record<RoutineCategoryKey, RoutineDefinition> = {
  push: {
    categoryKey: 'push',
    splitName: 'Push Day',
    tagline: 'Chest, Shoulders & Triceps Hypertrophy',
    focusMuscles: ['Chest', 'Shoulder', 'Arm'],
    isRestDay: false,
    exerciseIds: [1, 2, 7, 8, 32, 12, 14, 33, 34, 40],
    gymExerciseIds: [26, 7, 8, 24, 25, 14, 23, 48, 49, 1]
  },
  pull: {
    categoryKey: 'pull',
    splitName: 'Pull Day',
    tagline: 'Upper Back, Lats & Biceps Hypertrophy',
    focusMuscles: ['Back', 'Arm'],
    isRestDay: false,
    exerciseIds: [6, 20, 13, 4, 35, 15, 18, 36, 5, 38],
    gymExerciseIds: [44, 22, 20, 6, 27, 47, 4, 18, 5, 13]
  },
  legs: {
    categoryKey: 'legs',
    splitName: 'Legs & Core Day',
    tagline: 'Quads, Hamstrings, Glutes & Abdominal Wall',
    focusMuscles: ['Leg', 'Core'],
    isRestDay: false,
    exerciseIds: [3, 19, 30, 31, 16, 39, 43, 9, 17, 42],
    gymExerciseIds: [21, 3, 45, 46, 30, 31, 10, 28, 9, 42]
  },
  upper: {
    categoryKey: 'upper',
    splitName: 'Upper Body Power',
    tagline: 'Compound Press & Pull Strength Overload',
    focusMuscles: ['Chest', 'Back', 'Shoulder', 'Arm'],
    isRestDay: false,
    exerciseIds: [7, 32, 6, 12, 35, 34, 14, 41],
    gymExerciseIds: [44, 26, 7, 22, 25, 23, 47, 49]
  },
  lower: {
    categoryKey: 'lower',
    splitName: 'Lower Body & Posterior Chain',
    tagline: 'Deadlifts, Squats, Glute Thrusts & Stability',
    focusMuscles: ['Back', 'Leg', 'Core'],
    isRestDay: false,
    exerciseIds: [11, 31, 19, 30, 39, 43, 42],
    gymExerciseIds: [11, 21, 45, 46, 29, 28, 43]
  },
  full_body: {
    categoryKey: 'full_body',
    splitName: 'Full Body Compound Blast',
    tagline: 'Multi-Joint Compound Overload Across All Major Muscles',
    focusMuscles: ['Chest', 'Back', 'Leg', 'Shoulder', 'Arm'],
    isRestDay: false,
    exerciseIds: [3, 7, 6, 12, 19, 18, 14, 42],
    gymExerciseIds: [21, 26, 44, 25, 45, 22, 48, 42]
  },
  chest: {
    categoryKey: 'chest',
    splitName: 'Chest & Triceps Focus',
    tagline: 'Pectoral Fiber Density & Triceps Extension Power',
    focusMuscles: ['Chest', 'Arm'],
    isRestDay: false,
    exerciseIds: [7, 32, 1, 2, 14, 33, 40],
    gymExerciseIds: [26, 7, 24, 48, 14, 49, 1]
  },
  back: {
    categoryKey: 'back',
    splitName: 'Back & Biceps Focus',
    tagline: 'Lat Thickness, Traps & Elbow Flexor Mass',
    focusMuscles: ['Back', 'Arm'],
    isRestDay: false,
    exerciseIds: [6, 20, 13, 35, 18, 36, 38],
    gymExerciseIds: [44, 22, 20, 27, 47, 18, 5]
  },
  shoulders: {
    categoryKey: 'shoulders',
    splitName: 'Shoulders & Traps',
    tagline: 'Deltoid Broadening, Lateral Head & Rotator Health',
    focusMuscles: ['Shoulder', 'Back'],
    isRestDay: false,
    exerciseIds: [12, 8, 34, 41, 15, 37],
    gymExerciseIds: [25, 8, 23, 47, 15, 37]
  },
  arms: {
    categoryKey: 'arms',
    splitName: 'Arms & Core Direct Focus',
    tagline: 'Biceps Peak, Triceps Lateral Head & Abdominal Wall',
    focusMuscles: ['Arm', 'Core'],
    isRestDay: false,
    exerciseIds: [18, 36, 14, 33, 40, 17, 42],
    gymExerciseIds: [22, 18, 48, 49, 14, 17, 42]
  },
  rest: {
    categoryKey: 'rest',
    splitName: 'Active Recovery / Rest',
    tagline: 'Neuromuscular Recovery, Mobility & Hydration',
    focusMuscles: [],
    isRestDay: true,
    exerciseIds: [],
    gymExerciseIds: []
  }
};

export interface SplitTemplateConfig {
  id: SplitTemplateId;
  name: string;
  description: string;
  daysPerWeek: number;
  dayMapping: Record<DayOfWeek, RoutineCategoryKey>;
}

export const SPLIT_TEMPLATES: Record<SplitTemplateId, SplitTemplateConfig> = {
  hybrid_default: {
    id: 'hybrid_default',
    name: 'Hybrid Strength & Hypertrophy (5-Day)',
    description: 'Push, Pull, Legs followed by Upper & Lower power sessions',
    daysPerWeek: 5,
    dayMapping: {
      Monday: 'push',
      Tuesday: 'pull',
      Wednesday: 'legs',
      Thursday: 'rest',
      Friday: 'upper',
      Saturday: 'lower',
      Sunday: 'rest'
    }
  },
  ppl_6day: {
    id: 'ppl_6day',
    name: 'Push / Pull / Legs (6-Day High Frequency)',
    description: 'High-frequency athlete program hitting every muscle group 2x weekly',
    daysPerWeek: 6,
    dayMapping: {
      Monday: 'push',
      Tuesday: 'pull',
      Wednesday: 'legs',
      Thursday: 'push',
      Friday: 'pull',
      Saturday: 'legs',
      Sunday: 'rest'
    }
  },
  ppl_3day: {
    id: 'ppl_3day',
    name: 'Push / Pull / Legs (3-Day Essential)',
    description: 'Time-efficient schedule with dedicated recovery days between workouts',
    daysPerWeek: 3,
    dayMapping: {
      Monday: 'push',
      Tuesday: 'rest',
      Wednesday: 'pull',
      Thursday: 'rest',
      Friday: 'legs',
      Saturday: 'rest',
      Sunday: 'rest'
    }
  },
  upper_lower_4day: {
    id: 'upper_lower_4day',
    name: 'Upper / Lower Split (4-Day)',
    description: 'Optimal balance of progressive overload and systemic nervous recovery',
    daysPerWeek: 4,
    dayMapping: {
      Monday: 'upper',
      Tuesday: 'lower',
      Wednesday: 'rest',
      Thursday: 'upper',
      Friday: 'lower',
      Saturday: 'rest',
      Sunday: 'rest'
    }
  },
  full_body_3day: {
    id: 'full_body_3day',
    name: 'Full Body Compound (3-Day)',
    description: 'Full body stimulus each session to maximize muscle protein synthesis',
    daysPerWeek: 3,
    dayMapping: {
      Monday: 'full_body',
      Tuesday: 'rest',
      Wednesday: 'full_body',
      Thursday: 'rest',
      Friday: 'full_body',
      Saturday: 'rest',
      Sunday: 'rest'
    }
  },
  bro_split_5day: {
    id: 'bro_split_5day',
    name: 'Body Part / Bro Split (5-Day)',
    description: 'Dedicated volume focus on 1-2 muscle groups per session for pump & isolation',
    daysPerWeek: 5,
    dayMapping: {
      Monday: 'chest',
      Tuesday: 'back',
      Wednesday: 'shoulders',
      Thursday: 'legs',
      Friday: 'arms',
      Saturday: 'rest',
      Sunday: 'rest'
    }
  },
  custom: {
    id: 'custom',
    name: 'Custom User Split',
    description: 'User-configured custom day assignments',
    daysPerWeek: 5,
    dayMapping: {
      Monday: 'push',
      Tuesday: 'pull',
      Wednesday: 'legs',
      Thursday: 'rest',
      Friday: 'upper',
      Saturday: 'lower',
      Sunday: 'rest'
    }
  }
};

export const DAYS_ORDER: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export function buildScheduleFromMapping(mapping: Record<DayOfWeek, RoutineCategoryKey>): ExtendedDayRoutine[] {
  return DAYS_ORDER.map(dayName => {
    const categoryKey = mapping[dayName] || 'rest';
    const def = ROUTINE_CATALOG[categoryKey] || ROUTINE_CATALOG.rest;
    return {
      dayName,
      splitName: def.splitName,
      tagline: def.tagline,
      focusMuscles: def.focusMuscles,
      isRestDay: def.isRestDay,
      exerciseIds: def.exerciseIds,
      gymExerciseIds: def.gymExerciseIds,
      categoryKey: def.categoryKey
    };
  });
}

export function getSplitTemplate(templateId: SplitTemplateId): ExtendedDayRoutine[] {
  const tpl = SPLIT_TEMPLATES[templateId] || SPLIT_TEMPLATES.hybrid_default;
  return buildScheduleFromMapping(tpl.dayMapping);
}

export const WEEKLY_SPLIT: ExtendedDayRoutine[] = getSplitTemplate('hybrid_default');

export function loadActiveWeeklySplit(): ExtendedDayRoutine[] {
  try {
    const saved = localStorage.getItem('nestfit_active_schedule');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 7) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return WEEKLY_SPLIT;
}

export function loadActiveTemplateId(): SplitTemplateId {
  try {
    const saved = localStorage.getItem('nestfit_active_template_id') as SplitTemplateId;
    if (saved && SPLIT_TEMPLATES[saved]) {
      return saved;
    }
  } catch {
    // fallback
  }
  return 'hybrid_default';
}

export function saveActiveWeeklySplit(split: ExtendedDayRoutine[], templateId: SplitTemplateId = 'custom'): void {
  try {
    localStorage.setItem('nestfit_active_schedule', JSON.stringify(split));
    localStorage.setItem('nestfit_active_template_id', templateId);
  } catch {
    // ignore
  }
}

export function getTodayRoutine(customSplit?: ExtendedDayRoutine[]): ExtendedDayRoutine {
  const activeList = customSplit || loadActiveWeeklySplit();
  const dayNames: DayOfWeek[] = [
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
  return activeList.find(s => s.dayName === currentDayName) || activeList[0];
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
        return !e.suitableGear.includes('gym_machine') ||
               e.suitableGear.includes('dumbbell') ||
               e.suitableGear.includes('barbell') ||
               e.suitableGear.includes('bodyweight');
      }
      return true;
    });
}
