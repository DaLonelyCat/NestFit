import { describe, it, expect } from 'vitest';
import {
  SPLIT_TEMPLATES,
  ROUTINE_CATALOG,
  getSplitTemplate,
  buildScheduleFromMapping,
  getTodayRoutine,
  getExercisesForRoutine
} from '../src/utils/workoutSplit';
import { SplitTemplateId, DayOfWeek, RoutineCategoryKey } from '../src/types';

describe('workoutSplit Engine & Templates', () => {
  const templateIds: SplitTemplateId[] = [
    'hybrid_default',
    'ppl_6day',
    'ppl_3day',
    'upper_lower_4day',
    'full_body_3day',
    'bro_split_5day'
  ];

  templateIds.forEach(tplId => {
    it(`should generate a complete 7-day schedule for template: ${tplId}`, () => {
      const schedule = getSplitTemplate(tplId);
      expect(schedule).toHaveLength(7);

      const days: DayOfWeek[] = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ];

      days.forEach((day, idx) => {
        expect(schedule[idx].dayName).toBe(day);
        expect(schedule[idx].splitName).toBeTruthy();
        expect(schedule[idx].tagline).toBeTruthy();
        expect(Array.isArray(schedule[idx].exerciseIds)).toBe(true);
        expect(Array.isArray(schedule[idx].gymExerciseIds)).toBe(true);
      });
    });
  });

  it('should correctly build a custom split from individual day mappings', () => {
    const customMapping: Record<DayOfWeek, RoutineCategoryKey> = {
      Monday: 'push',
      Tuesday: 'pull',
      Wednesday: 'legs',
      Thursday: 'upper',
      Friday: 'lower',
      Saturday: 'full_body',
      Sunday: 'rest'
    };

    const schedule = buildScheduleFromMapping(customMapping);
    expect(schedule).toHaveLength(7);
    expect(schedule[0].categoryKey).toBe('push');
    expect(schedule[1].categoryKey).toBe('pull');
    expect(schedule[2].categoryKey).toBe('legs');
    expect(schedule[3].categoryKey).toBe('upper');
    expect(schedule[4].categoryKey).toBe('lower');
    expect(schedule[5].categoryKey).toBe('full_body');
    expect(schedule[6].categoryKey).toBe('rest');
    expect(schedule[6].isRestDay).toBe(true);
  });

  it('should provide exercises for training modes', () => {
    const pushRoutine = ROUTINE_CATALOG.push;
    const homeExercises = getExercisesForRoutine(
      { ...pushRoutine, dayName: 'Monday' },
      'home'
    );
    const gymExercises = getExercisesForRoutine(
      { ...pushRoutine, dayName: 'Monday' },
      'gym'
    );

    expect(homeExercises.length).toBeGreaterThan(0);
    expect(gymExercises.length).toBeGreaterThan(0);
  });

  it('should get today routine without error', () => {
    const today = getTodayRoutine();
    expect(today).toBeDefined();
    expect(today.dayName).toBeTruthy();
  });
});
