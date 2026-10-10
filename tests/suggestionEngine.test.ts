import { describe, it, expect } from 'vitest';
import {
  getProgressiveOverloadAdvice,
  getMuscularReadiness,
  getExerciseAlternatives,
  getPlateTransitionPlan
} from '../src/utils/suggestionEngine';
import { WorkoutLogItem, DayRoutine } from '../src/types';
import { EXERCISES } from '../src/data/exercises';

describe('Suggestion Engine (Intelligence Telemetry)', () => {
  it('recommends baseline weight when no history exists for an exercise', () => {
    const advice = getProgressiveOverloadAdvice(2, 'single-dumbbell', [], undefined, 4.0);

    expect(advice.action).toBe('baseline');
    expect(advice.currentSuggestedWeightKg).toBe(4.0);
    expect(advice.message).toContain('Baseline load');
  });

  it('recommends progressive overload increase after high-rep completed session', () => {
    const mockHistory: WorkoutLogItem[] = [
      {
        id: '1',
        date: new Date().toLocaleDateString('en-US'),
        dayName: 'Monday',
        splitName: 'Push Day',
        durationSeconds: 1800,
        exercisesCompleted: [
          {
            exerciseId: 2, // Dumbbell Bench Press
            exerciseName: 'Dumbbell Bench Press',
            sets: [
              { setNumber: 1, reps: 10, weightKg: 4.0 },
              { setNumber: 2, reps: 10, weightKg: 4.0 },
              { setNumber: 3, reps: 10, weightKg: 4.0 }
            ]
          }
        ]
      }
    ];

    const advice = getProgressiveOverloadAdvice(2, 'single-dumbbell', mockHistory);

    expect(advice.action).toBe('increase');
    expect(advice.previousWeightKg).toBe(4.0);
    expect(advice.currentSuggestedWeightKg).toBeGreaterThan(4.0); // should step up to 5.0kg
    expect(advice.message).toContain('Overload Target');
  });

  it('recommends consolidation when reps were struggling or incomplete', () => {
    const mockHistory: WorkoutLogItem[] = [
      {
        id: '1',
        date: new Date().toLocaleDateString('en-US'),
        dayName: 'Monday',
        splitName: 'Push Day',
        durationSeconds: 1800,
        exercisesCompleted: [
          {
            exerciseId: 2,
            exerciseName: 'Dumbbell Bench Press',
            sets: [
              { setNumber: 1, reps: 6, weightKg: 7.0 },
              { setNumber: 2, reps: 5, weightKg: 7.0 }
            ]
          }
        ]
      }
    ];

    const advice = getProgressiveOverloadAdvice(2, 'single-dumbbell', mockHistory);

    expect(advice.action).toBe('maintain');
    expect(advice.currentSuggestedWeightKg).toBe(7.0);
    expect(advice.message).toContain('Consolidation');
  });

  it('detects muscular readiness and warns on high fatigue (< 36 hours)', () => {
    const mockRoutine: DayRoutine = {
      dayName: 'Monday',
      splitName: 'Push Day',
      tagline: 'Chest focus',
      focusMuscles: ['Chest'],
      isRestDay: false,
      exerciseIds: [1, 2]
    };

    // Trained 4 hours ago
    const mockHistory: WorkoutLogItem[] = [
      {
        id: '1',
        date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        dayName: 'Sunday',
        splitName: 'Chest Day',
        durationSeconds: 2000,
        exercisesCompleted: [
          {
            exerciseId: 2, // Chest
            exerciseName: 'Dumbbell Bench Press',
            sets: [{ setNumber: 1, reps: 10, weightKg: 4.0 }]
          }
        ]
      }
    ];

    const readiness = getMuscularReadiness(mockRoutine, mockHistory, EXERCISES);

    expect(readiness.overallStatus).toBe('caution');
    expect(readiness.muscleStatuses[0].status).toBe('fatigued');
    expect(readiness.primaryMessage).toContain('Neural Fatigue Warning');
  });

  it('finds valid biomechanical exercise alternatives for swaps', () => {
    const dbPress = EXERCISES.find(e => e.id === 2)!; // Dumbbell Bench Press (Chest)
    const alternatives = getExerciseAlternatives(dbPress, 'home', EXERCISES);

    expect(alternatives.directAlternatives.length).toBeGreaterThan(0);
    // All direct alternatives must target Chest
    alternatives.directAlternatives.forEach(alt => {
      expect(alt.muscleGroups).toContain('Chest');
      expect(alt.id).not.toBe(dbPress.id);
    });
  });

  it('calculates plate transition diff correctly between sets', () => {
    // Transition from 4.0 kg to 5.5 kg in single dumbbell mode
    const transition = getPlateTransitionPlan(4.0, 5.5, 'single-dumbbell');

    expect(transition.fromWeightKg).toBe(4.0);
    expect(transition.toWeightKg).toBe(5.5);
    expect(transition.summaryText).toBeDefined();
    expect(transition.summaryText.length).toBeGreaterThan(0);
  });
});
