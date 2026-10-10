import { EquipmentInventory, EquipmentMode, WeightCalculationResult } from '../types';

export const DEFAULT_INVENTORY: EquipmentInventory = {
  handleBars: 2,
  barConnectors: 1,
  nuts: 4,
  barWeightKg: 0, // Plates-only per user instruction
  connectorWeightKg: 0,
  plates: [
    { weightKg: 1.25, count: 4 },
    { weightKg: 1.5, count: 4 },
    { weightKg: 2.0, count: 4 }
  ]
};

export interface AchievableOption {
  weightKg: number;
  label: string;
  isSymmetric: boolean;
  left: number[];
  right: number[];
  db1?: { left: number[]; right: number[] };
  db2?: { left: number[]; right: number[] };
}

export const MAX_PLATES_PER_DUMBBELL_SLEEVE = 3;

/**
 * Returns all possible achievable weight options for a given mode and inventory.
 * Physical constraint: 1 dumbbell bar short end sleeve can only hold up to 3 plates per side.
 * Inventory has 4x 1.25kg, 4x 1.5kg, 4x 2.0kg plates (12 plates, 19.0 kg total).
 */
export function getAchievableWeights(
  mode: EquipmentMode,
  _inventory: EquipmentInventory = DEFAULT_INVENTORY
): AchievableOption[] {
  const optionsMap = new Map<number, AchievableOption>();

  if (mode === 'single-dumbbell') {
    // Symmetrical combinations constrained by dumbbell short end sleeve limit (max 3 plates/side)
    for (let c125 = 0; c125 <= 2; c125++) {
      for (let c15 = 0; c15 <= 2; c15++) {
        for (let c20 = 0; c20 <= 2; c20++) {
          // Enforce 1 dumbbell bar sleeve capacity: max 3 plates on one side
          if (c125 + c15 + c20 <= MAX_PLATES_PER_DUMBBELL_SLEEVE) {
            const platesPerSide: number[] = [
              ...Array(c20).fill(2.0),
              ...Array(c15).fill(1.5),
              ...Array(c125).fill(1.25)
            ];
            const sideWeight = c125 * 1.25 + c15 * 1.5 + c20 * 2.0;
            const totalWeight = Math.round(sideWeight * 2 * 100) / 100;

            if (!optionsMap.has(totalWeight)) {
              const label = totalWeight === 0 ? 'Empty Bar (0 kg)' : `${totalWeight} kg (Balanced, ${platesPerSide.length} plates/side)`;
              optionsMap.set(totalWeight, {
                weightKg: totalWeight,
                label,
                isSymmetric: true,
                left: [...platesPerSide],
                right: [...platesPerSide]
              });
            }
          }
        }
      }
    }

    const options = Array.from(optionsMap.values());
    options.sort((a, b) => a.weightKg - b.weightKg);
    return options;
  }

  if (mode === 'barbell') {
    // Connected barbell: uses central connector joining both bars, accommodating up to all 12 plates (19.0 kg)
    for (let c125 = 0; c125 <= 2; c125++) {
      for (let c15 = 0; c15 <= 2; c15++) {
        for (let c20 = 0; c20 <= 2; c20++) {
          const platesPerSide: number[] = [
            ...Array(c20).fill(2.0),
            ...Array(c15).fill(1.5),
            ...Array(c125).fill(1.25)
          ];
          const sideWeight = c125 * 1.25 + c15 * 1.5 + c20 * 2.0;
          const totalWeight = Math.round(sideWeight * 2 * 100) / 100;

          if (!optionsMap.has(totalWeight)) {
            const label = totalWeight === 0 ? 'Empty Bar (0 kg)' : `${totalWeight} kg (Balanced Barbell)`;
            optionsMap.set(totalWeight, {
              weightKg: totalWeight,
              label,
              isSymmetric: true,
              left: [...platesPerSide],
              right: [...platesPerSide]
            });
          }
        }
      }
    }

    const options = Array.from(optionsMap.values());
    options.sort((a, b) => a.weightKg - b.weightKg);
    return options;
  }

  if (mode === 'dumbbell-pair') {
    // For 2 dumbbells simultaneously with 4 of each plate:
    // Both dumbbells can be loaded identically and symmetrically (1 of each plate available per sleeve across 4 sleeves)
    for (let c125 = 0; c125 <= 1; c125++) {
      for (let c15 = 0; c15 <= 1; c15++) {
        for (let c20 = 0; c20 <= 1; c20++) {
          const platesPerSide: number[] = [
            ...Array(c20).fill(2.0),
            ...Array(c15).fill(1.5),
            ...Array(c125).fill(1.25)
          ];
          const sideWeight = c125 * 1.25 + c15 * 1.5 + c20 * 2.0;
          const perDbWeight = Math.round(sideWeight * 2 * 100) / 100;

          if (!optionsMap.has(perDbWeight)) {
            const label = perDbWeight === 0 ? 'Empty Handles (0 kg each)' : `${perDbWeight} kg each (Balanced)`;
            optionsMap.set(perDbWeight, {
              weightKg: perDbWeight,
              label,
              isSymmetric: true,
              left: [...platesPerSide],
              right: [...platesPerSide],
              db1: { left: [...platesPerSide], right: [...platesPerSide] },
              db2: { left: [...platesPerSide], right: [...platesPerSide] }
            });
          }
        }
      }
    }

    // Also include unilateral steps (e.g., 1 plate per DB) for finer progression
    const finePairSteps: { perDb: number; left: number[]; right: number[] }[] = [
      { perDb: 1.25, left: [1.25], right: [] },
      { perDb: 1.5, left: [1.5], right: [] },
      { perDb: 2.0, left: [2.0], right: [] },
      { perDb: 2.75, left: [1.5], right: [1.25] },
      { perDb: 3.25, left: [2.0], right: [1.25] },
      { perDb: 3.5, left: [2.0], right: [1.5] },
      { perDb: 4.75, left: [2.0], right: [1.5, 1.25] }
    ];

    for (const step of finePairSteps) {
      if (!optionsMap.has(step.perDb)) {
        optionsMap.set(step.perDb, {
          weightKg: step.perDb,
          label: `${step.perDb} kg each`,
          isSymmetric: step.left.length === step.right.length,
          left: step.left,
          right: step.right,
          db1: { left: step.left, right: step.right },
          db2: { left: step.left, right: step.right }
        });
      }
    }

    const options = Array.from(optionsMap.values());
    options.sort((a, b) => a.weightKg - b.weightKg);
    return options;
  }

  return [];
}

/**
 * Calculates plate combination for target weight.
 */
export function calculateWeightCombination(
  targetWeightKg: number,
  mode: EquipmentMode,
  inventory: EquipmentInventory = DEFAULT_INVENTORY
): WeightCalculationResult {
  const options = getAchievableWeights(mode, inventory);
  const exactMatch = options.find(o => Math.abs(o.weightKg - targetWeightKg) < 0.01);

  // Compute nearest lower and higher
  let nearestLower: number | undefined;
  let nearestHigher: number | undefined;

  for (const opt of options) {
    if (opt.weightKg < targetWeightKg) {
      if (nearestLower === undefined || opt.weightKg > nearestLower) {
        nearestLower = opt.weightKg;
      }
    } else if (opt.weightKg > targetWeightKg) {
      if (nearestHigher === undefined || opt.weightKg < nearestHigher) {
        nearestHigher = opt.weightKg;
      }
    }
  }

  if (exactMatch) {
    const instructions = generateInstructions(mode, exactMatch);
    const barsRequired = mode === 'dumbbell-pair' || mode === 'barbell' ? 2 : 1;
    const connectorRequired = mode === 'barbell';
    const nutsRequired = mode === 'dumbbell-pair' ? 4 : 2;

    return {
      targetWeightKg,
      achievable: true,
      mode,
      perDumbbellWeightKg: exactMatch.weightKg,
      totalLoadedWeightKg: mode === 'dumbbell-pair' ? exactMatch.weightKg * 2 : exactMatch.weightKg,
      leftPlates: exactMatch.left,
      rightPlates: exactMatch.right,
      db1: exactMatch.db1,
      db2: exactMatch.db2,
      nutsRequired,
      connectorRequired,
      barsRequired,
      instructions,
      nearestLower,
      nearestHigher
    };
  }

  // Not exact: find closest
  const closest = options.reduce((prev, curr) =>
    Math.abs(curr.weightKg - targetWeightKg) < Math.abs(prev.weightKg - targetWeightKg) ? curr : prev
  );

  const instructions = generateInstructions(mode, closest);
  const barsRequired = mode === 'dumbbell-pair' || mode === 'barbell' ? 2 : 1;
  const connectorRequired = mode === 'barbell';
  const nutsRequired = mode === 'dumbbell-pair' ? 4 : 2;

  return {
    targetWeightKg,
    achievable: false,
    mode,
    perDumbbellWeightKg: closest.weightKg,
    totalLoadedWeightKg: mode === 'dumbbell-pair' ? closest.weightKg * 2 : closest.weightKg,
    leftPlates: closest.left,
    rightPlates: closest.right,
    db1: closest.db1,
    db2: closest.db2,
    nutsRequired,
    connectorRequired,
    barsRequired,
    instructions,
    nearestLower,
    nearestHigher
  };
}

function generateInstructions(mode: EquipmentMode, option: AchievableOption): string[] {
  const steps: string[] = [];

  if (mode === 'barbell') {
    steps.push('1. Align both handle bars and screw firmly into the central handle connector to assemble the barbell.');
    if (option.left.length === 0) {
      steps.push('2. Use the empty assembled barbell (0 kg plates).');
      return steps;
    }
    steps.push(`2. Slide [${option.left.join('kg, ')}kg] onto the LEFT sleeve (heaviest plates first against inner stop collar, tapering outward) and tighten 1 spinlock nut.`);
    steps.push(`3. Slide matching [${option.right.join('kg, ')}kg] onto the RIGHT sleeve (heaviest plates first against inner stop collar, tapering outward) and tighten 1 spinlock nut.`);
    steps.push(`4. Barbell calibrated: ${option.weightKg} kg (balanced symmetrical loading).`);
    return steps;
  }

  if (mode === 'single-dumbbell') {
    steps.push('1. Take 1 handle bar.');
    if (option.left.length === 0) {
      steps.push('2. Use the empty dumbbell handle.');
      return steps;
    }
    steps.push(`2. Slide [${option.left.join('kg, ')}kg] onto the LEFT sleeve (max 3 plates per side, heaviest against inner collar) and tighten 1 spinlock nut.`);
    steps.push(`3. Slide matching [${option.right.join('kg, ')}kg] onto the RIGHT sleeve (max 3 plates per side, heaviest against inner collar) and tighten 1 spinlock nut.`);
    steps.push(`4. Single dumbbell calibrated: ${option.weightKg} kg (balanced symmetrical loading, ${option.left.length} plates per sleeve).`);
    return steps;
  }

  if (mode === 'dumbbell-pair') {
    steps.push('1. Take both handle bars and all 4 spinlock nuts.');
    if (option.left.length === 0 && option.right.length === 0) {
      steps.push('2. Hold 2 empty dumbbell handles (0 kg plates).');
      return steps;
    }
    const leftText = option.left.length > 0 ? `[${option.left.join('kg, ')}kg]` : 'no plates';
    const rightText = option.right.length > 0 ? `[${option.right.join('kg, ')}kg]` : 'no plates';
    steps.push(`2. Dumbbell 1: Slide ${leftText} on Side A, ${rightText} on Side B (heaviest against inner collars). Tighten 2 nuts.`);
    steps.push(`3. Dumbbell 2: Slide matching ${leftText} on Side A, ${rightText} on Side B. Tighten 2 nuts.`);
    steps.push(`4. Both dumbbells calibrated at ${option.weightKg} kg each (${option.weightKg * 2} kg total pair, symmetrical loading).`);
    return steps;
  }

  return steps;
}
