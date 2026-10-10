export type MuscleGroup = 'Chest' | 'Back' | 'Arm' | 'Shoulder' | 'Leg' | 'Core';

export type EquipmentCategory = 'Dumbbell' | 'Barbell' | 'Bodyweight' | 'Bench' | 'Basic Machine' | 'Advanced Machine';

export type TrainingMode = 'home' | 'gym';

export interface Exercise {
  id: number;
  name: string;
  namaExercise: string;
  description: string;
  imageFileName: string;
  steps: string;
  equipmentCategories: EquipmentCategory[];
  muscleGroups: MuscleGroup[];
  defaultSets: number;
  defaultReps: number;
  suitableGear: ('dumbbell' | 'barbell' | 'bodyweight' | 'gym_machine')[];
  suggestedWeightKg?: number; // suggested base working weight
}

export type EquipmentMode = 'single-dumbbell' | 'dumbbell-pair' | 'barbell';

export interface EquipmentInventory {
  handleBars: number;       // default 2
  barConnectors: number;    // default 1
  nuts: number;             // default 4
  barWeightKg: number;      // default 0 kg (per user specification: plates only)
  connectorWeightKg: number;// default 0 kg
  plates: {
    weightKg: number;
    count: number;
  }[];                      // default: 1.25kg x 2, 1.5kg x 2, 2.0kg x 2
}

export interface PlatePlacement {
  leftPlates: number[];     // weights on the left collar
  rightPlates: number[];    // weights on the right collar
  isBalanced: boolean;
  totalWeightKg: number;
  nutsUsed: number;
  connectorUsed: boolean;
  barsUsed: number;
}

export interface WeightCalculationResult {
  targetWeightKg: number;
  achievable: boolean;
  mode: EquipmentMode;
  perDumbbellWeightKg: number; // For pair mode, this is weight per DB
  totalLoadedWeightKg: number;
  leftPlates: number[];
  rightPlates: number[];
  db1?: { left: number[]; right: number[] };
  db2?: { left: number[]; right: number[] };
  nutsRequired: number;
  connectorRequired: boolean;
  barsRequired: number;
  instructions: string[];
  nearestLower?: number;
  nearestHigher?: number;
}

export interface DayRoutine {
  dayName: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  splitName: string;
  tagline: string;
  focusMuscles: MuscleGroup[];
  isRestDay: boolean;
  exerciseIds: number[];
}

export interface SuperSetPair {
  exerciseIdA: number;
  exerciseIdB: number;
}

export interface WorkoutLogItem {
  id: string;
  date: string;
  dayName: string;
  splitName: string;
  durationSeconds: number;
  exercisesCompleted: {
    exerciseId: number;
    exerciseName: string;
    isSuperSet?: boolean;
    superSetPartnerId?: number;
    sets: {
      setNumber: number;
      reps: number;
      weightKg: number;
      toFailure?: boolean;
    }[];
  }[];
}
