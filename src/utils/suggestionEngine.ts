import {
  WorkoutLogItem,
  Exercise,
  EquipmentMode,
  EquipmentInventory,
  DayRoutine,
  MuscleGroup,
  TrainingMode
} from '../types';
import {
  calculateWeightCombination,
  getAchievableWeights,
  DEFAULT_INVENTORY
} from './weightCalculator';

export interface OverloadAdvice {
  exerciseId: number;
  currentSuggestedWeightKg: number;
  previousWeightKg?: number;
  previousReps?: number;
  previousSetsCount?: number;
  action: 'increase' | 'maintain' | 'baseline';
  message: string;
}

export interface ReadinessStatus {
  muscleGroup: MuscleGroup;
  status: 'optimal' | 'recovering' | 'fatigued' | 'cold';
  hoursSinceTrained: number | null; // null if never logged
  lastTrainedDateStr: string | null;
  message: string;
}

export interface RoutineReadinessSummary {
  overallStatus: 'optimal' | 'caution' | 'cold' | 'ready';
  primaryMessage: string;
  muscleStatuses: ReadinessStatus[];
}

export interface PlateTransitionPlan {
  fromWeightKg: number;
  toWeightKg: number;
  mode: EquipmentMode;
  platesToAddPerSleeve: number[];
  platesToRemovePerSleeve: number[];
  platesToKeepPerSleeve: number[];
  summaryText: string;
}

/**
 * 1. Progressive Overload Advisor
 * Analyzes past completed sessions for an exercise and suggests the next achievable preset weight.
 */
export function getProgressiveOverloadAdvice(
  exerciseId: number,
  gearMode: EquipmentMode,
  history: WorkoutLogItem[] = [],
  inventory: EquipmentInventory = DEFAULT_INVENTORY,
  defaultSuggestedWeight: number = 4.0
): OverloadAdvice {
  // Find all past occurrences of this exercise
  const pastSessions: {
    date: string;
    sets: { setNumber: number; reps: number; weightKg: number }[];
  }[] = [];

  for (const session of history) {
    const found = session.exercisesCompleted.find(e => e.exerciseId === exerciseId);
    if (found && found.sets.length > 0) {
      pastSessions.push({
        date: session.date,
        sets: found.sets
      });
    }
  }

  // If never trained before, return baseline recommendation
  if (pastSessions.length === 0) {
    return {
      exerciseId,
      currentSuggestedWeightKg: defaultSuggestedWeight,
      action: 'baseline',
      message: `Baseline load: Start with ${defaultSuggestedWeight} kg to establish movement mechanics.`
    };
  }

  // Look at the most recent session
  const latest = pastSessions[0];
  const maxWeightInLatest = Math.max(...latest.sets.map(s => s.weightKg));
  const avgReps = latest.sets.reduce((sum, s) => sum + s.reps, 0) / latest.sets.length;
  const completedSetsCount = latest.sets.length;

  const achievable = getAchievableWeights(gearMode, inventory);
  const currentPresetIdx = achievable.findIndex(o => Math.abs(o.weightKg - maxWeightInLatest) < 0.01);

  // If user completed >= 3 sets and average reps >= 10, recommend step up!
  if (avgReps >= 10 && completedSetsCount >= 2 && currentPresetIdx >= 0 && currentPresetIdx < achievable.length - 1) {
    const nextWeight = achievable[currentPresetIdx + 1].weightKg;
    return {
      exerciseId,
      currentSuggestedWeightKg: nextWeight,
      previousWeightKg: maxWeightInLatest,
      previousReps: Math.round(avgReps),
      previousSetsCount: completedSetsCount,
      action: 'increase',
      message: `Overload Target: Hit ${completedSetsCount} sets @ ${maxWeightInLatest} kg last session. Step up to ${nextWeight} kg!`
    };
  }

  // Otherwise, recommend consolidating at current load
  return {
    exerciseId,
    currentSuggestedWeightKg: maxWeightInLatest,
    previousWeightKg: maxWeightInLatest,
    previousReps: Math.round(avgReps),
    previousSetsCount: completedSetsCount,
    action: 'maintain',
    message: `Consolidation: Repeat ${maxWeightInLatest} kg to build volume stability before jumping weight.`
  };
}

/**
 * 2. Muscular Recovery & Volume Readiness Engine
 * Evaluates elapsed recovery hours per muscle group based on workout logs.
 */
export function getMuscularReadiness(
  routine: DayRoutine,
  history: WorkoutLogItem[],
  exercises: Exercise[] = []
): RoutineReadinessSummary {
  const muscleMap: { [key in MuscleGroup]?: { lastDate: Date; dateStr: string } } = {};

  // Build a lookup map of exerciseId -> muscleGroups
  const exerciseMuscleLookup: { [id: number]: MuscleGroup[] } = {};
  exercises.forEach(ex => {
    exerciseMuscleLookup[ex.id] = ex.muscleGroups;
  });

  const now = new Date();

  // Scan history from newest to oldest
  for (const session of history) {
    // Parse date if possible
    const sessionDate = new Date(session.date);
    const validDate = isNaN(sessionDate.getTime()) ? now : sessionDate;

    for (const completed of session.exercisesCompleted) {
      const muscles = exerciseMuscleLookup[completed.exerciseId] || [];
      for (const m of muscles) {
        if (!muscleMap[m]) {
          muscleMap[m] = {
            lastDate: validDate,
            dateStr: session.date
          };
        }
      }
    }
  }

  const allMuscles: MuscleGroup[] = ['Chest', 'Back', 'Arm', 'Shoulder', 'Leg', 'Core'];
  const focusMuscles = routine.focusMuscles.length > 0 ? routine.focusMuscles : allMuscles;

  const muscleStatuses: ReadinessStatus[] = focusMuscles.map(m => {
    const record = muscleMap[m];
    if (!record) {
      return {
        muscleGroup: m,
        status: 'cold',
        hoursSinceTrained: null,
        lastTrainedDateStr: null,
        message: `${m} has no recorded training logs yet. Ready for stimulus.`
      };
    }

    const diffMs = now.getTime() - record.lastDate.getTime();
    const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

    if (diffHours < 36) {
      return {
        muscleGroup: m,
        status: 'fatigued',
        hoursSinceTrained: diffHours,
        lastTrainedDateStr: record.dateStr,
        message: `High Fatigue: Trained ${diffHours}h ago (${record.dateStr}). Consider lighter volume.`
      };
    }

    if (diffHours >= 36 && diffHours < 48) {
      return {
        muscleGroup: m,
        status: 'recovering',
        hoursSinceTrained: diffHours,
        lastTrainedDateStr: record.dateStr,
        message: `Rebuilding: ${diffHours}h of recovery logged. Steady conditioning advised.`
      };
    }

    if (diffHours >= 48 && diffHours <= 120) {
      return {
        muscleGroup: m,
        status: 'optimal',
        hoursSinceTrained: diffHours,
        lastTrainedDateStr: record.dateStr,
        message: `Peak Supercompensation: ${diffHours}h rested. Ideal window for progressive overload!`
      };
    }

    return {
      muscleGroup: m,
      status: 'cold',
      hoursSinceTrained: diffHours,
      lastTrainedDateStr: record.dateStr,
      message: `Cold / De-conditioned: ${Math.floor(diffHours / 24)} days since last stimulus.`
    };
  });

  // Calculate overall summary
  const hasFatigue = muscleStatuses.some(s => s.status === 'fatigued');
  const allOptimal = muscleStatuses.length > 0 && muscleStatuses.every(s => s.status === 'optimal');

  if (hasFatigue) {
    return {
      overallStatus: 'caution',
      primaryMessage: 'Neural Fatigue Warning: Target muscles were loaded within the last 36 hours.',
      muscleStatuses
    };
  }

  if (allOptimal) {
    return {
      overallStatus: 'optimal',
      primaryMessage: 'Peak Readiness: Target muscles are fully recovered (>48h). Prime window for heavy sets!',
      muscleStatuses
    };
  }

  return {
    overallStatus: 'ready',
    primaryMessage: 'Readiness Confirmed: Neuromuscular state verified for today\'s directive.',
    muscleStatuses
  };
}

/**
 * 3. 1-Click Exercise Swapper / Alternative Engine
 * Finds biomechanically viable substitutions sharing the same primary muscle anatomy.
 */
export function getExerciseAlternatives(
  currentExercise: Exercise,
  trainingMode: TrainingMode,
  allExercises: Exercise[]
): {
  directAlternatives: Exercise[];
  equipmentSwaps: Exercise[];
} {
  const primaryMuscle = currentExercise.muscleGroups[0];

  // Candidates targeting the same primary muscle
  const candidates = allExercises.filter(ex => {
    if (ex.id === currentExercise.id) return false;
    if (!ex.muscleGroups.includes(primaryMuscle)) return false;

    if (trainingMode === 'home') {
      return ex.suitableGear.includes('dumbbell') ||
             ex.suitableGear.includes('barbell') ||
             ex.suitableGear.includes('bodyweight');
    }
    return true;
  });

  // Direct alternatives: same suitable gear (e.g. dumbbell to dumbbell)
  const directAlternatives = candidates.filter(ex =>
    ex.suitableGear.some(g => currentExercise.suitableGear.includes(g))
  ).slice(0, 4);

  // Equipment swaps: different equipment gear (e.g. dumbbell to barbell or bodyweight)
  const equipmentSwaps = candidates.filter(ex =>
    !ex.suitableGear.some(g => currentExercise.suitableGear.includes(g))
  ).slice(0, 4);

  return {
    directAlternatives,
    equipmentSwaps
  };
}

/**
 * 4. Plate Loading Transition Optimizer
 * Calculates the minimal plate differences between two weights to minimize collar adjustments.
 */
export function getPlateTransitionPlan(
  fromWeightKg: number,
  toWeightKg: number,
  mode: EquipmentMode,
  inventory: EquipmentInventory = DEFAULT_INVENTORY
): PlateTransitionPlan {
  const fromCalc = calculateWeightCombination(fromWeightKg, mode, inventory);
  const toCalc = calculateWeightCombination(toWeightKg, mode, inventory);

  const fromPlates = [...fromCalc.leftPlates];
  const toPlates = [...toCalc.leftPlates];

  const platesToKeep: number[] = [];
  const platesToRemove: number[] = [];
  const platesToAdd: number[] = [...toPlates];

  // Find intersection of plates to keep
  fromPlates.forEach(p => {
    const matchIdx = platesToAdd.indexOf(p);
    if (matchIdx !== -1) {
      platesToKeep.push(p);
      platesToAdd.splice(matchIdx, 1);
    } else {
      platesToRemove.push(p);
    }
  });

  let summaryText = '';
  if (fromWeightKg === toWeightKg) {
    summaryText = `Maintain current load: ${toWeightKg} kg. No plate swaps needed.`;
  } else if (platesToRemove.length === 0 && platesToAdd.length > 0) {
    summaryText = `Add ${platesToAdd.join('kg, ')}kg onto each sleeve (keep existing ${platesToKeep.join('kg, ')}kg).`;
  } else if (platesToRemove.length > 0 && platesToAdd.length === 0) {
    summaryText = `Remove ${platesToRemove.join('kg, ')}kg from each sleeve (retain ${platesToKeep.join('kg, ')}kg).`;
  } else {
    summaryText = `Swap outer plates: Remove [${platesToRemove.join('kg, ')}kg], slide on [${platesToAdd.join('kg, ')}kg]. Keep inner [${platesToKeep.join('kg, ')}kg].`;
  }

  return {
    fromWeightKg,
    toWeightKg,
    mode,
    platesToAddPerSleeve: platesToAdd,
    platesToRemovePerSleeve: platesToRemove,
    platesToKeepPerSleeve: platesToKeep,
    summaryText
  };
}
