import React, { useState, useEffect } from 'react';
import { DayRoutine, Exercise, EquipmentMode, TrainingMode, WorkoutLogItem } from '../types';
import { WEEKLY_SPLIT, getTodayRoutine, getExercisesForRoutine } from '../utils/workoutSplit';
import { EXERCISES } from '../data/exercises';
import {
  getMuscularReadiness,
  getProgressiveOverloadAdvice,
  getExerciseAlternatives
} from '../utils/suggestionEngine';
import {
  Play,
  Calendar,
  Eye,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Clock,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { DumbbellVisualizer } from './DumbbellVisualizer';

interface TodayWorkoutProps {
  trainingMode: TrainingMode;
  setTrainingMode: (mode: TrainingMode) => void;
  onStartWorkout: (
    exercises: Exercise[],
    routine: DayRoutine,
    superSetPairs?: { [exerciseId: number]: number }
  ) => void;
  onNavigateToVisualizer: (mode: EquipmentMode, weight: number) => void;
}

export const TodayWorkout: React.FC<TodayWorkoutProps> = ({
  trainingMode,
  setTrainingMode,
  onStartWorkout,
  onNavigateToVisualizer
}) => {
  const todayDefault = getTodayRoutine();
  const [selectedRoutine, setSelectedRoutine] = useState<DayRoutine>(todayDefault);

  // History state for intelligence engine
  const [history, setHistory] = useState<WorkoutLogItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('gymbuddy_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  // Customized session exercises state (allows swapping exercises)
  const [sessionExercises, setSessionExercises] = useState<Exercise[]>(() =>
    getExercisesForRoutine(todayDefault, trainingMode)
  );

  useEffect(() => {
    setSessionExercises(getExercisesForRoutine(selectedRoutine, trainingMode));
  }, [selectedRoutine, trainingMode]);

  // Modal states
  const [activePlateModal, setActivePlateModal] = useState<{
    exercise: Exercise;
    mode: EquipmentMode;
    weight: number;
  } | null>(null);

  const [swapTargetExercise, setSwapTargetExercise] = useState<Exercise | null>(null);

  // Super Set pairing state: exerciseId -> partnerExerciseId
  const [superSetPairs, setSuperSetPairs] = useState<{ [exerciseId: number]: number }>({});

  const handleToggleSuperSet = (exerciseId: number) => {
    setSuperSetPairs(prev => {
      const next = { ...prev };
      if (next[exerciseId] !== undefined) {
        const partner = next[exerciseId];
        delete next[exerciseId];
        delete next[partner];
        return next;
      }
      // Pair with the adjacent exercise in sessionExercises
      const currentIndex = sessionExercises.findIndex(e => e.id === exerciseId);
      const partnerIndex = currentIndex < sessionExercises.length - 1 ? currentIndex + 1 : currentIndex - 1;
      if (partnerIndex >= 0 && partnerIndex < sessionExercises.length) {
        const partnerId = sessionExercises[partnerIndex].id;
        // Clean up any old pairings for partner
        if (next[partnerId] !== undefined) {
          delete next[next[partnerId]];
        }
        next[exerciseId] = partnerId;
        next[partnerId] = exerciseId;
      }
      return next;
    });
  };

  const handleRemoveExercise = (exerciseId: number) => {
    setSessionExercises(prev => prev.filter(ex => ex.id !== exerciseId));
    // Clean up any superset link
    setSuperSetPairs(prev => {
      const next = { ...prev };
      if (next[exerciseId] !== undefined) {
        const partner = next[exerciseId];
        delete next[exerciseId];
        delete next[partner];
      }
      return next;
    });
  };

  const handleRestoreRoutine = () => {
    setSessionExercises(getExercisesForRoutine(selectedRoutine, trainingMode));
    setSuperSetPairs({});
  };

  const handleUpdateExerciseSets = (exerciseId: number, delta: number) => {
    setSessionExercises(prev =>
      prev.map(ex => {
        if (ex.id !== exerciseId) return ex;
        const newSets = Math.max(1, (ex.defaultSets || 3) + delta);
        return { ...ex, defaultSets: newSets };
      })
    );
  };

  const defaultRoutineExercises = getExercisesForRoutine(selectedRoutine, trainingMode);
  const isCustomized =
    sessionExercises.length !== defaultRoutineExercises.length ||
    sessionExercises.some((e, i) => {
      const def = defaultRoutineExercises[i];
      return !def || e.id !== def.id || e.defaultSets !== def.defaultSets;
    });

  const isCurrentToday = selectedRoutine.dayName === todayDefault.dayName;
  const readiness = getMuscularReadiness(selectedRoutine, history, EXERCISES);

  const handleSwapExercise = (replacement: Exercise) => {
    if (!swapTargetExercise) return;
    setSessionExercises(prev =>
      prev.map(ex => (ex.id === swapTargetExercise.id ? replacement : ex))
    );
    setSwapTargetExercise(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Primary Workout Banner */}
      <div className="rounded-2xl bg-cyber-surface border border-cyber-border p-6 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyber-dark border border-cyber-border text-xs font-semibold text-emerald-400">
                <Calendar className="w-3.5 h-3.5" />
                {isCurrentToday ? 'Today' : selectedRoutine.dayName}
              </span>

              <button
                onClick={() => setTrainingMode(trainingMode === 'home' ? 'gym' : 'home')}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyber-dark hover:bg-slate-900 border border-cyber-border text-xs font-medium text-slate-300 transition-colors cursor-pointer"
                title="Switch between Home Kit and Gym"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{trainingMode === 'home' ? 'Home Kit (Modular DB)' : 'Commercial Gym'}</span>
              </button>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {selectedRoutine.splitName}
              </h1>
            </div>

            {/* Focus Muscle Badges */}
            {selectedRoutine.focusMuscles.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-0.5">
                {selectedRoutine.focusMuscles.map((muscle) => (
                  <span
                    key={muscle}
                    className="px-2.5 py-1 rounded-md bg-cyber-dark/80 border border-cyber-border text-slate-300 text-xs font-medium"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Start Workout Action */}
          {!selectedRoutine.isRestDay && sessionExercises.length > 0 && (
            <div className="flex-shrink-0">
              <button
                onClick={() => onStartWorkout(sessionExercises, selectedRoutine, superSetPairs)}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm tracking-wide transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Workout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Neural & Muscular Readiness Banner */}
      {!selectedRoutine.isRestDay && (
        <div
          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition-all ${
            readiness.overallStatus === 'caution'
              ? 'bg-amber-950/20 border-amber-500/50 text-amber-200'
              : readiness.overallStatus === 'optimal'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-100'
              : 'bg-cyber-surface border-cyber-border text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                readiness.overallStatus === 'caution'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {readiness.overallStatus === 'caution' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Readiness
              </span>
              <p className="text-xs font-semibold text-white">
                {readiness.primaryMessage}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {readiness.muscleStatuses.map((st) => (
              <span
                key={st.muscleGroup}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                  st.status === 'fatigued'
                    ? 'bg-rose-950/40 border-rose-500/60 text-rose-300'
                    : st.status === 'optimal'
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                    : 'bg-cyber-dark border-cyber-border text-slate-400'
                }`}
                title={st.message}
              >
                {st.muscleGroup}: {st.hoursSinceTrained !== null ? `${st.hoursSinceTrained}h` : 'Fresh'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Schedule */}
      <div className="rounded-2xl p-4 bg-cyber-surface border border-cyber-border">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Weekly Schedule
          </span>
          {!isCurrentToday && (
            <button
              onClick={() => setSelectedRoutine(todayDefault)}
              className="text-xs font-semibold text-emerald-400 hover:underline cursor-pointer"
            >
              Back to Today ({todayDefault.dayName.slice(0, 3)})
            </button>
          )}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {WEEKLY_SPLIT.map((split) => {
            const isSelected = split.dayName === selectedRoutine.dayName;
            const isToday = split.dayName === todayDefault.dayName;

            return (
              <button
                key={split.dayName}
                onClick={() => setSelectedRoutine(split)}
                className={`p-1.5 sm:p-2.5 rounded-xl text-center sm:text-left transition-all border cursor-pointer flex flex-col items-center sm:items-stretch justify-center min-h-[52px] sm:min-h-0 ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500 text-white'
                    : 'bg-cyber-dark/60 border-cyber-border text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-center sm:justify-between text-xs mb-0.5 sm:mb-1 w-full relative">
                  <span className="font-bold text-white text-[11px] sm:text-xs">{split.dayName.slice(0, 3)}</span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 sm:static absolute -top-0.5 -right-0.5" title="Today"></span>
                  )}
                </div>
                <div className="text-[9px] sm:text-[11px] font-medium truncate text-slate-300 w-full hidden sm:block">
                  {split.isRestDay ? 'Rest' : split.splitName.replace(' Day', '')}
                </div>
                <div className="text-[8px] font-medium text-slate-400 block sm:hidden truncate w-full text-center">
                  {split.isRestDay ? 'Rest' : split.splitName.split(' ')[0]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Routine Content: Rest Day or Exercises List */}
      {selectedRoutine.isRestDay ? (
        <div className="rounded-2xl p-8 bg-cyber-surface border border-cyber-border text-center space-y-3">
          <h3 className="text-lg font-bold text-white">
            Rest Day
          </h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            Take time to recover and refuel for your next session.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-200 tracking-wide uppercase">
              Exercises ({sessionExercises.length})
            </h3>
          </div>

          {isCustomized && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-cyber-surface border border-cyber-border text-xs">
              <span className="text-slate-300">
                Custom plan • {sessionExercises.length} exercises
              </span>
              <button
                onClick={handleRestoreRoutine}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyber-dark hover:bg-slate-800 border border-cyber-border text-slate-300 hover:text-white font-medium transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          )}

          {sessionExercises.length === 0 ? (
            <div className="rounded-2xl p-8 bg-cyber-surface border border-cyber-border text-center space-y-3">
              <p className="text-sm text-slate-400">All exercises have been removed from today's plan.</p>
              <button
                onClick={handleRestoreRoutine}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Restore Default Exercises
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {sessionExercises.map((exercise) => {
                const usesBarbell = exercise.suitableGear.includes('barbell');
                const usesDumbbell = exercise.suitableGear.includes('dumbbell');
                const gearMode: EquipmentMode = usesBarbell ? 'barbell' : 'single-dumbbell';
                const baseWeight = exercise.suggestedWeightKg || (usesBarbell ? 7.0 : 4.0);

                const isPairedInSuperSet = superSetPairs[exercise.id] !== undefined;
                const partner = isPairedInSuperSet
                  ? sessionExercises.find(e => e.id === superSetPairs[exercise.id])
                  : undefined;

                // Smart overload recommendation from past logs
                const overload = getProgressiveOverloadAdvice(
                  exercise.id,
                  gearMode,
                  history,
                  undefined,
                  baseWeight
                );

                return (
                  <div
                    key={exercise.id}
                    className={`rounded-xl p-4 border transition-all flex flex-col justify-between group ${
                      isPairedInSuperSet
                        ? 'border-amber-500/60 bg-cyber-surface/90'
                        : 'bg-cyber-surface border-cyber-border hover:border-slate-600'
                    }`}
                  >
                    <div>
                      {/* Super Set Indicator Banner */}
                      {isPairedInSuperSet && partner && (
                        <div className="mb-2.5 px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/50 text-amber-300 text-[10px] font-semibold flex items-center justify-between">
                          <div className="flex items-center gap-1.5 truncate">
                            <Zap className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                            <span className="truncate">Super Set ↔ {partner.name}</span>
                          </div>
                          <span className="text-[9px] opacity-80 flex-shrink-0">(0s rest)</span>
                        </div>
                      )}

                      <div className="flex gap-4">
                        {/* Exercise Thumbnail */}
                        <div className="w-20 h-20 rounded-lg bg-cyber-dark border border-cyber-border overflow-hidden flex-shrink-0 flex items-center justify-center">
                          <img
                            src={`/assets/exercises/${exercise.imageFileName}`}
                            alt={exercise.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/assets/exercises/dumbbell.png';
                            }}
                          />
                        </div>

                        {/* Exercise Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <div className="inline-flex items-center bg-cyber-dark/90 border border-cyber-border rounded-md px-1 py-0.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateExerciseSets(exercise.id, -1)}
                                disabled={exercise.defaultSets <= 1}
                                className="w-4 h-4 flex items-center justify-center rounded text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:text-slate-400 cursor-pointer font-bold text-xs transition-colors"
                                title="Remove 1 set"
                                aria-label="Decrease sets"
                              >
                                −
                              </button>
                              <span className="font-semibold text-emerald-400 px-1.5 text-[11px] select-none">
                                {exercise.defaultSets} {exercise.defaultSets === 1 ? 'set' : 'sets'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateExerciseSets(exercise.id, 1)}
                                className="w-4 h-4 flex items-center justify-center rounded text-slate-400 hover:text-white cursor-pointer font-bold text-xs transition-colors"
                                title="Add 1 set"
                                aria-label="Increase sets"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-[11px] font-medium text-slate-400">
                              × {exercise.defaultReps} reps
                            </span>
                          </div>
                          <h4 className="font-bold text-white text-base truncate">
                            {exercise.name}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {exercise.description}
                          </p>
                        </div>
                      </div>

                      {/* Progressive Overload Advisory Pill */}
                      <div className="mt-3 pt-2 border-t border-cyber-border/40">
                        <div className="flex items-center gap-1.5">
                          {overload.action === 'increase' ? (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold w-full">
                              <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">Suggested: {overload.currentSuggestedWeightKg} kg (+progressive overload)</span>
                            </div>
                          ) : overload.action === 'maintain' ? (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-500/10 border border-sky-500/30 text-sky-300 text-[10px] font-semibold w-full">
                              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">Target: {overload.currentSuggestedWeightKg} kg (repeat to consolidate)</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyber-dark border border-cyber-border text-slate-400 text-[10px] font-medium w-full">
                              <Zap className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                              <span className="truncate">Target: {overload.currentSuggestedWeightKg} kg</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Bottom: Equipment, Blueprint, Super Set, Swap & Remove */}
                    <div className="mt-3 pt-2.5 border-t border-cyber-border flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {exercise.equipmentCategories.slice(0, 2).map((eq) => (
                          <span
                            key={eq}
                            className="px-2 py-0.5 rounded bg-cyber-dark border border-cyber-border text-slate-300 text-[10px]"
                          >
                            {eq}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Super Set Toggle */}
                        <button
                          onClick={() => handleToggleSuperSet(exercise.id)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                            isPairedInSuperSet
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-cyber-dark hover:bg-slate-800 border-cyber-border text-slate-300 hover:text-white'
                          }`}
                          title={isPairedInSuperSet ? "Unlink Super Set" : "Pair as Super Set"}
                        >
                          <Zap className={`w-3 h-3 ${isPairedInSuperSet ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                          <span>{isPairedInSuperSet ? 'Linked' : 'Super Set'}</span>
                        </button>

                        {/* Exercise Swap Action */}
                        <button
                          onClick={() => setSwapTargetExercise(exercise)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyber-dark hover:bg-slate-800 border border-cyber-border text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                          title="Swap with an alternative exercise"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Swap</span>
                        </button>

                        {/* Exercise Remove Action */}
                        <button
                          onClick={() => handleRemoveExercise(exercise.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyber-dark hover:bg-rose-950/40 border border-cyber-border hover:border-rose-500/60 text-slate-400 hover:text-rose-300 text-xs font-semibold transition-all cursor-pointer"
                          title="Remove exercise from today's plan"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>

                        {(usesDumbbell || usesBarbell) && (
                          <button
                            onClick={() =>
                              setActivePlateModal({
                                exercise,
                                mode: gearMode,
                                weight: overload.currentSuggestedWeightKg
                              })
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-dark hover:bg-slate-800 border border-emerald-500/40 text-emerald-400 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Plates: {overload.currentSuggestedWeightKg}kg</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Quick Plate Setup Modal */}
      {activePlateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 bg-cyber-surface border border-cyber-border space-y-4">
            <div className="flex items-center justify-between border-b border-cyber-border pb-3">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                  Plate Setup
                </span>
                <h3 className="text-lg font-bold text-white">
                  {activePlateModal.exercise.name}
                </h3>
              </div>
              <button
                onClick={() => setActivePlateModal(null)}
                className="w-8 h-8 rounded-lg bg-cyber-dark border border-cyber-border flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <DumbbellVisualizer
              initialMode={activePlateModal.mode}
              initialTargetWeight={activePlateModal.weight}
            />

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  const { mode, weight } = activePlateModal;
                  setActivePlateModal(null);
                  onNavigateToVisualizer(mode, weight);
                }}
                className="px-4 py-2.5 rounded-xl bg-cyber-dark hover:bg-slate-800 border border-cyber-border text-slate-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                Open in Full Visualizer
              </button>
              <button
                onClick={() => setActivePlateModal(null)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Swap Modal */}
      {swapTargetExercise && (() => {
        const alternatives = getExerciseAlternatives(swapTargetExercise, trainingMode, EXERCISES);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 bg-cyber-surface border border-cyber-border space-y-5">
              <div className="flex items-start justify-between border-b border-cyber-border pb-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs text-slate-400">
                      Muscles: {swapTargetExercise.muscleGroups.join(', ')}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Replace: {swapTargetExercise.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSwapTargetExercise(null)}
                  className="w-8 h-8 rounded-lg bg-cyber-dark border border-cyber-border flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Direct Alternatives */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Matching Gear Alternatives
                </span>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {alternatives.directAlternatives.map((alt) => (
                    <div
                      key={alt.id}
                      onClick={() => handleSwapExercise(alt)}
                      className="p-3 rounded-xl bg-cyber-dark border border-cyber-border hover:border-emerald-500/60 transition-all cursor-pointer flex gap-3 group"
                    >
                      <div className="w-14 h-14 rounded-lg bg-cyber-surface border border-cyber-border overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <img
                          src={`/assets/exercises/${alt.imageFileName}`}
                          alt={alt.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/assets/exercises/dumbbell.png';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-xs truncate group-hover:text-emerald-400 transition-colors">
                          {alt.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                          {alt.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cross-Equipment Swaps */}
              {alternatives.equipmentSwaps.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-cyber-border">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                    Other Equipment Alternatives
                  </span>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {alternatives.equipmentSwaps.map((alt) => (
                      <div
                        key={alt.id}
                        onClick={() => handleSwapExercise(alt)}
                        className="p-3 rounded-xl bg-cyber-dark border border-cyber-border hover:border-sky-500/60 transition-all cursor-pointer flex gap-3 group"
                      >
                        <div className="w-14 h-14 rounded-lg bg-cyber-surface border border-cyber-border overflow-hidden flex-shrink-0 flex items-center justify-center">
                          <img
                            src={`/assets/exercises/${alt.imageFileName}`}
                            alt={alt.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/assets/exercises/dumbbell.png';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white text-xs truncate group-hover:text-sky-400 transition-colors">
                            {alt.name}
                          </h4>
                          <div className="flex items-center gap-1 mt-0.5">
                            {alt.equipmentCategories.slice(0, 2).map(eq => (
                              <span key={eq} className="text-[8px] px-1 py-0.2 rounded bg-cyber-surface text-slate-400">
                                {eq}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSwapTargetExercise(null)}
                  className="px-4 py-2 rounded-xl bg-cyber-dark hover:bg-slate-800 border border-cyber-border text-slate-300 font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
