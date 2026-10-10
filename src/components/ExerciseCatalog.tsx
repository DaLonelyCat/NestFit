import React, { useState } from 'react';
import { EXERCISES } from '../data/exercises';
import { Exercise, MuscleGroup, EquipmentCategory, EquipmentMode } from '../types';
import { Search, Eye, ExternalLink } from 'lucide-react';
import { DumbbellVisualizer } from './DumbbellVisualizer';

interface ExerciseCatalogProps {
  onSelectForVisualizer: (mode: EquipmentMode, weight: number) => void;
}

export const ExerciseCatalog: React.FC<ExerciseCatalogProps> = ({
  onSelectForVisualizer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'All'>('All');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentCategory | 'All'>('All');
  const [activeExerciseModal, setActiveExerciseModal] = useState<Exercise | null>(null);
  const [showVisualizerInModal, setShowVisualizerInModal] = useState(false);

  const muscleOptions: (MuscleGroup | 'All')[] = [
    'All',
    'Chest',
    'Back',
    'Arm',
    'Shoulder',
    'Leg',
    'Core'
  ];

  const equipmentOptions: (EquipmentCategory | 'All')[] = [
    'All',
    'Dumbbell',
    'Barbell',
    'Bodyweight',
    'Bench',
    'Basic Machine',
    'Advanced Machine'
  ];

  const filteredExercises = EXERCISES.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.namaExercise.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMuscle =
      selectedMuscle === 'All' || ex.muscleGroups.includes(selectedMuscle);

    const matchesEquipment =
      selectedEquipment === 'All' || ex.equipmentCategories.includes(selectedEquipment);

    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Search */}
      <div className="rounded-2xl p-6 bg-cyber-surface border border-cyber-border shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Exercises
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Browse exercises for modular dumbbells, barbells, bodyweight, and machines.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-cyber-dark px-3 py-1.5 rounded-xl border border-cyber-border">
            <span>{EXERCISES.length} exercises</span>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search exercises by name or muscle (e.g., Incline Curl, Squat, Bench Press)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-cyber-dark border border-cyber-border rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-400 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2 text-slate-400 hover:text-white text-xs w-5 h-5 flex items-center justify-center rounded-full bg-cyber-surface hover:bg-slate-700 cursor-pointer transition-colors"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Muscle group filter pills */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Muscle Group:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {muscleOptions.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMuscle(m)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedMuscle === m
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-cyber-dark border border-cyber-border text-slate-400 hover:text-white hover:border-slate-600'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment filter pills */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Equipment:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {equipmentOptions.map((eq) => (
              <button
                key={eq}
                onClick={() => setSelectedEquipment(eq)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedEquipment === eq
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-cyber-dark border border-cyber-border text-slate-400 hover:text-white hover:border-slate-600'
                }`}
              >
                {eq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Results */}
      <div>
        <div className="flex items-center justify-between px-1 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Showing {filteredExercises.length} exercises
          </span>
        </div>

        {filteredExercises.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-cyber-surface border border-cyber-border">
            <p className="text-slate-400 text-sm">No exercises found matching your filters.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredExercises.map((exercise) => {
              const usesBarbell = exercise.suitableGear.includes('barbell');
              const usesDumbbell = exercise.suitableGear.includes('dumbbell');
              const suggestedWeight = exercise.suggestedWeightKg || (usesBarbell ? 7.0 : 4.0);

              return (
                <div
                  key={exercise.id}
                  onClick={() => {
                    setActiveExerciseModal(exercise);
                    setShowVisualizerInModal(false);
                  }}
                  className="rounded-xl p-4 bg-cyber-surface border border-cyber-border hover:border-slate-600 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="h-44 w-full rounded-lg bg-cyber-dark overflow-hidden mb-3 border border-cyber-border flex items-center justify-center">
                      <img
                        src={`/assets/exercises/${exercise.imageFileName}`}
                        alt={exercise.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/assets/exercises/dumbbell.png';
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                      {exercise.muscleGroups.map((m) => (
                        <span
                          key={m}
                          className="px-2 py-0.5 rounded bg-cyber-dark border border-cyber-border text-slate-300 text-[10px] font-medium"
                        >
                          {m}
                        </span>
                      ))}
                    </div>

                    <h4 className="font-bold text-white text-base">
                      {exercise.name}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {exercise.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-cyber-border flex items-center justify-between text-xs text-slate-400">
                    <span>{exercise.defaultSets} sets × {exercise.defaultReps} reps</span>
                    {(usesDumbbell || usesBarbell) && (
                      <span className="font-semibold text-emerald-400">
                        {suggestedWeight} kg
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Exercise Detail Modal */}
      {activeExerciseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 bg-cyber-surface border border-cyber-border space-y-5">
            <div className="flex items-start justify-between border-b border-cyber-border pb-3">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  {activeExerciseModal.muscleGroups.map((m) => (
                    <span
                      key={m}
                      className="px-2 py-0.5 rounded bg-cyber-dark border border-cyber-border text-slate-300 text-xs font-medium"
                    >
                      {m}
                    </span>
                  ))}
                  {activeExerciseModal.equipmentCategories.map((eq) => (
                    <span
                      key={eq}
                      className="px-2 py-0.5 rounded bg-cyber-dark border border-cyber-border text-slate-400 text-xs"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {activeExerciseModal.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveExerciseModal(null)}
                className="w-8 h-8 rounded-lg bg-cyber-dark border border-cyber-border flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Exercise Image */}
            <div className="h-56 w-full rounded-xl bg-cyber-dark overflow-hidden border border-cyber-border flex items-center justify-center">
              <img
                src={`/assets/exercises/${activeExerciseModal.imageFileName}`}
                alt={activeExerciseModal.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/assets/exercises/dumbbell.png';
                }}
              />
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Overview
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeExerciseModal.description}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-1.5">
                Instructions:
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeExerciseModal.steps}
              </p>
            </div>

            {/* Dumbbell / Barbell Integration */}
            {(activeExerciseModal.suitableGear.includes('dumbbell') ||
              activeExerciseModal.suitableGear.includes('barbell')) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Plate Setup
                  </span>
                  <button
                    onClick={() => setShowVisualizerInModal(!showVisualizerInModal)}
                    className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {showVisualizerInModal ? 'Hide Plates' : 'Show Plates'}
                  </button>
                </div>

                {showVisualizerInModal && (
                  <DumbbellVisualizer
                    initialMode={
                      activeExerciseModal.suitableGear.includes('barbell')
                        ? 'barbell'
                        : 'single-dumbbell'
                    }
                    initialTargetWeight={
                      activeExerciseModal.suggestedWeightKg ||
                      (activeExerciseModal.suitableGear.includes('barbell') ? 7.0 : 4.0)
                    }
                  />
                )}
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              {(activeExerciseModal.suitableGear.includes('dumbbell') ||
                activeExerciseModal.suitableGear.includes('barbell')) && (
                <button
                  onClick={() => {
                    const mode = activeExerciseModal.suitableGear.includes('barbell')
                      ? 'barbell'
                      : 'single-dumbbell';
                    const weight =
                      activeExerciseModal.suggestedWeightKg ||
                      (activeExerciseModal.suitableGear.includes('barbell') ? 7.0 : 4.0);
                    setActiveExerciseModal(null);
                    onSelectForVisualizer(mode, weight);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in Calculator
                </button>
              )}
              <button
                onClick={() => setActiveExerciseModal(null)}
                className="px-5 py-2.5 rounded-xl bg-cyber-dark hover:bg-slate-800 border border-cyber-border text-slate-300 font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
