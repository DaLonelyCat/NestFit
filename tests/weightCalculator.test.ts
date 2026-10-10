import { describe, it, expect } from 'vitest';
import {
  getAchievableWeights,
  calculateWeightCombination,
  DEFAULT_INVENTORY
} from '../src/utils/weightCalculator';
import { getExercisesForRoutine, WEEKLY_SPLIT } from '../src/utils/workoutSplit';
import { EXERCISES } from '../src/data/exercises';

describe('Customizable Weight Calculator (4x Plates Inventory = 19.0 kg)', () => {
  it('correctly calculates symmetrical single-dumbbell weight combinations up to 11.0 kg (max 3 plates/side)', () => {
    const options = getAchievableWeights('single-dumbbell', DEFAULT_INVENTORY);
    const weights = options.map(o => o.weightKg);

    expect(weights[0]).toBe(0);
    expect(weights[weights.length - 1]).toBe(11.0);
    expect(weights).toContain(2.5);
    expect(weights).toContain(5.0);
    expect(weights).toContain(5.5);
    expect(weights).toContain(9.5);
    expect(weights).toContain(10.5);
    expect(weights).toContain(11.0);

    // Verify every single-dumbbell preset physically respects the 3-plate sleeve limit
    options.forEach(opt => {
      expect(opt.left.length).toBeLessThanOrEqual(3);
      expect(opt.right.length).toBeLessThanOrEqual(3);
    });
  });

  it('correctly calculates pair-of-dumbbells weight combinations up to 9.5 kg per DB', () => {
    const options = getAchievableWeights('dumbbell-pair', DEFAULT_INVENTORY);
    const weights = options.map(o => o.weightKg);

    expect(weights[0]).toBe(0);
    expect(weights[weights.length - 1]).toBe(9.5);
    expect(weights).toContain(2.5);
    expect(weights).toContain(3.0);
    expect(weights).toContain(4.0);
    expect(weights).toContain(5.5);
    expect(weights).toContain(7.0);
    expect(weights).toContain(9.5);

    // Verify dumbbell pair also respects max 3 plates per side
    options.forEach(opt => {
      expect(opt.left.length).toBeLessThanOrEqual(3);
      expect(opt.right.length).toBeLessThanOrEqual(3);
    });
  });

  it('handles exact target weight request for single dumbbell at maximum physical capacity of 11.0 kg', () => {
    const result = calculateWeightCombination(11.0, 'single-dumbbell');

    expect(result.achievable).toBe(true);
    expect(result.perDumbbellWeightKg).toBe(11.0);
    expect(result.leftPlates).toEqual([2.0, 2.0, 1.5]);
    expect(result.rightPlates).toEqual([2.0, 2.0, 1.5]);
    expect(result.leftPlates.length).toBe(3);
    expect(result.rightPlates.length).toBe(3);
    expect(result.nutsRequired).toBe(2);
    expect(result.barsRequired).toBe(1);
    expect(result.connectorRequired).toBe(false);
  });

  it('handles connected barbell mode requirements up to 19.0 kg', () => {
    const result = calculateWeightCombination(19.0, 'barbell');

    expect(result.achievable).toBe(true);
    expect(result.perDumbbellWeightKg).toBe(19.0);
    expect(result.leftPlates.length).toBe(6);
    expect(result.rightPlates.length).toBe(6);
    expect(result.connectorRequired).toBe(true);
    expect(result.barsRequired).toBe(2);
    expect(result.nutsRequired).toBe(2);
  });

  it('correctly configures symmetrical pair of dumbbells at 9.5 kg each using all 12 plates', () => {
    const result = calculateWeightCombination(9.5, 'dumbbell-pair');

    expect(result.achievable).toBe(true);
    expect(result.perDumbbellWeightKg).toBe(9.5);
    expect(result.totalLoadedWeightKg).toBe(19.0);
    expect(result.barsRequired).toBe(2);
    expect(result.nutsRequired).toBe(4);
    expect(result.connectorRequired).toBe(false);
  });

  it('verifies expanded exercise database has over 150 workouts across all equipments', () => {
    expect(EXERCISES.length).toBeGreaterThanOrEqual(150);
  });

  it('filters home exercises correctly vs gym machine exercises in weekly split', () => {
    const mondayRoutine = WEEKLY_SPLIT.find(s => s.dayName === 'Monday')!;

    const homeExercises = getExercisesForRoutine(mondayRoutine, 'home');
    const gymExercises = getExercisesForRoutine(mondayRoutine, 'gym');

    // Home exercises must not include machine-only exercises like Pec Deck or Machine Chest Press
    expect(homeExercises.some(e => e.name === 'Pec Deck Fly')).toBe(false);
    expect(homeExercises.some(e => e.name === 'Machine Chest Press')).toBe(false);

    // Gym exercises must include Pec Deck Fly and Machine Chest Press
    expect(gymExercises.some(e => e.name === 'Pec Deck Fly')).toBe(true);
    expect(gymExercises.some(e => e.name === 'Machine Chest Press')).toBe(true);
  });

  it('verifies that all equipment categories have substantial workout coverage', () => {
    const dumbbellExercises = EXERCISES.filter(e => e.equipmentCategories.includes('Dumbbell'));
    const barbellExercises = EXERCISES.filter(e => e.equipmentCategories.includes('Barbell'));
    const bodyweightExercises = EXERCISES.filter(e => e.equipmentCategories.includes('Bodyweight'));
    const benchExercises = EXERCISES.filter(e => e.equipmentCategories.includes('Bench'));
    const basicMachineExercises = EXERCISES.filter(e => e.equipmentCategories.includes('Basic Machine'));
    const advancedMachineExercises = EXERCISES.filter(e => e.equipmentCategories.includes('Advanced Machine'));

    expect(dumbbellExercises.length).toBeGreaterThanOrEqual(35);
    expect(barbellExercises.length).toBeGreaterThanOrEqual(35);
    expect(bodyweightExercises.length).toBeGreaterThanOrEqual(30);
    expect(benchExercises.length).toBeGreaterThanOrEqual(15);
    expect(basicMachineExercises.length).toBeGreaterThanOrEqual(20);
    expect(advancedMachineExercises.length).toBeGreaterThanOrEqual(20);
  });

  it('strictly enforces max 3 plates on single dumbbell sleeve and handles overload gracefully', () => {
    // 14.0 kg on a single dumbbell would require 4+ plates per side, which violates the short sleeve limit
    const result = calculateWeightCombination(14.0, 'single-dumbbell');

    expect(result.achievable).toBe(false);
    expect(result.leftPlates.length).toBeLessThanOrEqual(3);
    expect(result.rightPlates.length).toBeLessThanOrEqual(3);
    expect(result.perDumbbellWeightKg).toBeLessThanOrEqual(11.0);
  });

  it('verifies catalog deduplication: no composite Pull Up / Inverted Row or duplicate overhead extensions', () => {
    // ID 13 should be clean 'Pull Up'
    const ex13 = EXERCISES.find(e => e.id === 13);
    expect(ex13).toBeDefined();
    expect(ex13?.name).toBe('Pull Up');

    // ID 71 should be 'Cross-Body Dumbbell Triceps Extension' rather than duplicate of ID 33
    const ex71 = EXERCISES.find(e => e.id === 71);
    expect(ex71).toBeDefined();
    expect(ex71?.name).toBe('Cross-Body Dumbbell Triceps Extension');

    // ID 135 should be 'Incline Dumbbell Hammer Curl' rather than redundant hybrid
    const ex135 = EXERCISES.find(e => e.id === 135);
    expect(ex135).toBeDefined();
    expect(ex135?.name).toBe('Incline Dumbbell Hammer Curl');
  });
});
