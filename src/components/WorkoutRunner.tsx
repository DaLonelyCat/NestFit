import React, { useState, useEffect } from 'react';
import { Exercise, DayRoutine, WorkoutLogItem, EquipmentMode, TrainingMode } from '../types';
import { DumbbellVisualizer } from './DumbbellVisualizer';
import { getAchievableWeights, DEFAULT_INVENTORY } from '../utils/weightCalculator';
import { EXERCISES } from '../data/exercises';
import {
  getProgressiveOverloadAdvice,
  getExerciseAlternatives,
  getPlateTransitionPlan
} from '../utils/suggestionEngine';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Dumbbell,
  Award,
  Clock,
  TrendingUp,
  RefreshCw,
  Lightbulb,
  Layers,
  Flame,
  Trash2,
  Zap
} from 'lucide-react';

interface WorkoutRunnerProps {
  trainingMode: TrainingMode;
  exercises: Exercise[];
  routine: DayRoutine;
  superSetPairs?: { [exerciseId: number]: number };
  onFinish: () => void;
  onCancel: () => void;
}

interface SetLog {
  setNumber: number;
  reps: number;
  weightKg: number;
  completed: boolean;
  toFailure?: boolean;
}

export const WorkoutRunner: React.FC<WorkoutRunnerProps> = ({
  trainingMode,
  exercises,
  routine,
  superSetPairs,
  onFinish,
  onCancel
}) => {
  // Session exercises list (supports in-session swaps)
  const [sessionExercises, setSessionExercises] = useState<Exercise[]>(exercises);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const currentExercise = sessionExercises[currentExerciseIndex];

  // History state for overload telemetry
  const [history, setHistory] = useState<WorkoutLogItem[]>([]);
  const [showSwapModal, setShowSwapModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nestfit_history') || localStorage.getItem('gymbuddy_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  // Map of exerciseId -> SetLog[]
  const [exerciseLogs, setExerciseLogs] = useState<{ [exerciseId: number]: SetLog[] }>(() => {
    const initial: { [exerciseId: number]: SetLog[] } = {};
    exercises.forEach(ex => {
      const defaultWeight = ex.suggestedWeightKg || (ex.suitableGear.includes('barbell') ? 7.0 : 4.0);
      initial[ex.id] = Array.from({ length: ex.defaultSets }, (_, i) => ({
        setNumber: i + 1,
        reps: ex.defaultReps,
        weightKg: ex.suitableGear.includes('bodyweight') ? 0 : defaultWeight,
        completed: false
      }));
    });
    return initial;
  });

  // Rest Timer State
  const [restSeconds, setRestSeconds] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showPlateModal, setShowPlateModal] = useState(false);

  // Overall workout session stopwatch
  const [totalSeconds, setTotalSeconds] = useState(0);

  useEffect(() => {
    const totalInterval = setInterval(() => {
      setTotalSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(totalInterval);
  }, []);

  // Rest timer countdown
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds(prev => {
          if (prev <= 1) {
            sound.playFinishChime();
            setTimerRunning(false);
            return 0;
          }
          if (prev <= 4) {
            sound.playShortBeep();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, restSeconds]);

  const currentSets = exerciseLogs[currentExercise.id] || [];

  const handleToggleSet = (index: number) => {
    setExerciseLogs(prev => {
      const updated = [...(prev[currentExercise.id] || [])];
      const isNowCompleted = !updated[index].completed;
      updated[index] = { ...updated[index], completed: isNowCompleted };

      // If user just marked set complete, automatically trigger a rest timer
      if (isNowCompleted) {
        sound.playShortBeep();
        const partnerId = superSetPairs?.[currentExercise.id];
        if (partnerId !== undefined) {
          // Super Set active: short 15s transition between paired movements
          setRestSeconds(15);
        } else {
          setRestSeconds(60);
        }
        setTimerRunning(true);
      }

      return { ...prev, [currentExercise.id]: updated };
    });
  };

  const handleToggleFailure = (index: number) => {
    setExerciseLogs(prev => {
      const updated = [...(prev[currentExercise.id] || [])];
      updated[index] = { ...updated[index], toFailure: !updated[index].toFailure };
      return { ...prev, [currentExercise.id]: updated };
    });
  };

  const handleDropCurrentExercise = () => {
    if (sessionExercises.length <= 1) {
      alert('Cannot drop the only exercise in session. Cancel or finish the workout instead.');
      return;
    }
    if (window.confirm(`Drop "${currentExercise.name}" from the remainder of this session?`)) {
      const newExercises = sessionExercises.filter((_, i) => i !== currentExerciseIndex);
      setSessionExercises(newExercises);
      if (currentExerciseIndex >= newExercises.length) {
        setCurrentExerciseIndex(newExercises.length - 1);
      }
    }
  };

  const handleUpdateSetWeight = (index: number, weight: number) => {
    setExerciseLogs(prev => {
      const updated = [...(prev[currentExercise.id] || [])];
      updated[index] = { ...updated[index], weightKg: weight };
      return { ...prev, [currentExercise.id]: updated };
    });
  };

  const handleUpdateSetReps = (index: number, reps: number) => {
    setExerciseLogs(prev => {
      const updated = [...(prev[currentExercise.id] || [])];
      updated[index] = { ...updated[index], reps };
      return { ...prev, [currentExercise.id]: updated };
    });
  };

  const handleAddSet = () => {
    setExerciseLogs(prev => {
      const updated = [...(prev[currentExercise.id] || [])];
      const last = updated[updated.length - 1];
      updated.push({
        setNumber: updated.length + 1,
        reps: last ? last.reps : 10,
        weightKg: last ? last.weightKg : 4.0,
        completed: false
      });
      return { ...prev, [currentExercise.id]: updated };
    });
  };

  const handleRemoveSet = (indexToRemove: number) => {
    setExerciseLogs(prev => {
      const current = prev[currentExercise.id] || [];
      if (current.length <= 1) return prev;
      const updated = current
        .filter((_, idx) => idx !== indexToRemove)
        .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      return { ...prev, [currentExercise.id]: updated };
    });
  };

  const handleInSessionSwap = (replacement: Exercise) => {
    const oldId = currentExercise.id;
    const defaultWeight = replacement.suggestedWeightKg || (replacement.suitableGear.includes('barbell') ? 7.0 : 4.0);

    setSessionExercises(prev =>
      prev.map((ex, idx) => (idx === currentExerciseIndex ? replacement : ex))
    );

    // Initialize logs for replacement exercise if not present
    setExerciseLogs(prev => ({
      ...prev,
      [replacement.id]: prev[oldId] || Array.from({ length: replacement.defaultSets }, (_, i) => ({
        setNumber: i + 1,
        reps: replacement.defaultReps,
        weightKg: replacement.suitableGear.includes('bodyweight') ? 0 : defaultWeight,
        completed: false
      }))
    }));

    setShowSwapModal(false);
  };

  const handleCompleteWorkout = () => {
    // Save to localStorage history
    const logItem: WorkoutLogItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dayName: routine.dayName,
      splitName: routine.splitName,
      durationSeconds: totalSeconds,
      exercisesCompleted: sessionExercises.map(ex => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        isSuperSet: superSetPairs?.[ex.id] !== undefined,
        superSetPartnerId: superSetPairs?.[ex.id],
        sets: (exerciseLogs[ex.id] || [])
          .filter(s => s.completed)
          .map(s => ({
            setNumber: s.setNumber,
            reps: s.reps,
            weightKg: s.weightKg,
            toFailure: s.toFailure
          }))
      }))
    };

    const savedHistoryStr = localStorage.getItem('nestfit_history') || localStorage.getItem('gymbuddy_history');
    const localHistory: WorkoutLogItem[] = savedHistoryStr ? JSON.parse(savedHistoryStr) : [];
    localHistory.unshift(logItem);
    localStorage.setItem('nestfit_history', JSON.stringify(localHistory));

    sound.playFinishChime();
    confetti({
      particleCount: 140,
      spread: 80,
      origin: { y: 0.6 }
    });

    onFinish();
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins}:${remainingSec < 10 ? '0' : ''}${remainingSec}`;
  };

  const usesBarbell = currentExercise.suitableGear.includes('barbell');
  const usesDumbbell = currentExercise.suitableGear.includes('dumbbell');
  const gearMode: EquipmentMode = usesBarbell ? 'barbell' : 'single-dumbbell';
  const currentWorkingWeight = currentSets[0]?.weightKg || 4.0;

  // Progressive overload recommendation
  const overloadAdvice = getProgressiveOverloadAdvice(
    currentExercise.id,
    gearMode,
    history,
    DEFAULT_INVENTORY,
    currentWorkingWeight
  );

  // Plate transition advice
  const previousExerciseWeight = currentExerciseIndex > 0
    ? exerciseLogs[sessionExercises[currentExerciseIndex - 1]?.id]?.[0]?.weightKg || 4.0
    : 0;

  const plateTransition = getPlateTransitionPlan(
    previousExerciseWeight,
    currentWorkingWeight,
    gearMode,
    DEFAULT_INVENTORY
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Session Progress Bar */}
      <div className="rounded-2xl p-4 bg-cyber-surface border border-cyber-border shadow-sm flex items-center justify-between">
        <button
          onClick={onCancel}
          className="text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
        >
          Exit
        </button>

        <div className="text-center">
          <span className="text-xs font-medium text-slate-400 block">
            {routine.splitName}
          </span>
          <p className="text-sm font-bold text-white">
            Exercise {currentExerciseIndex + 1} of {sessionExercises.length}
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block uppercase">Time</span>
          <span className="text-sm font-bold text-emerald-400 flex items-center justify-end gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatTimer(totalSeconds)}
          </span>
        </div>
      </div>

      {/* Main Exercise Card */}
      <div className="rounded-2xl p-6 bg-cyber-surface border border-cyber-border space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-24 h-24 rounded-xl bg-cyber-dark border border-cyber-border overflow-hidden flex-shrink-0 flex items-center justify-center">
            <img
              src={`/assets/exercises/${currentExercise.imageFileName}`}
              alt={currentExercise.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/assets/exercises/dumbbell.png';
              }}
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              {currentExercise.muscleGroups.map(m => (
                <span key={m} className="px-2 py-0.5 rounded bg-cyber-dark border border-cyber-border text-slate-300 text-[10px] font-medium">
                  {m}
                </span>
              ))}
            </div>
            <h2 className="text-2xl font-bold text-white">
              {currentExercise.name}
            </h2>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {currentExercise.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mid-Session Drop Action */}
            <button
              onClick={handleDropCurrentExercise}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyber-dark hover:bg-rose-950/40 border border-cyber-border hover:border-rose-500/60 text-slate-400 hover:text-rose-300 text-xs font-semibold transition-all cursor-pointer"
              title="Drop exercise from this session"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Drop</span>
            </button>

            {/* Mid-Session Swap Action */}
            <button
              onClick={() => setShowSwapModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyber-dark hover:bg-slate-800 border border-cyber-border text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              title="Substitute exercise with an alternative"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Swap</span>
            </button>

            {(usesDumbbell || usesBarbell) && (
              <button
                onClick={() => setShowPlateModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyber-dark hover:bg-slate-800 border border-emerald-500/40 text-emerald-400 text-xs font-semibold transition-all cursor-pointer"
              >
                <Dumbbell className="w-4 h-4" />
                <span>Plate Setup</span>
              </button>
            )}
          </div>
        </div>

        {/* Super Set Active Banner */}
        {superSetPairs?.[currentExercise.id] !== undefined && (() => {
          const partnerId = superSetPairs[currentExercise.id];
          const partnerExercise = sessionExercises.find(e => e.id === partnerId);
          if (!partnerExercise) return null;
          return (
            <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/50 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-300">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
                <span>
                  <strong>Super Set:</strong> Paired with <strong>{partnerExercise.name}</strong>
                </span>
              </div>
              <button
                onClick={() => {
                  const partnerIdx = sessionExercises.findIndex(e => e.id === partnerId);
                  if (partnerIdx !== -1) setCurrentExerciseIndex(partnerIdx);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500 text-amber-300 text-xs font-semibold flex-shrink-0 transition-colors cursor-pointer"
              >
                Switch to partner →
              </button>
            </div>
          );
        })()}

        {/* Smart Progressive Overload Advice Banner */}
        <div className="p-3 rounded-xl bg-cyber-dark border border-cyber-border flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="text-slate-300">
              {overloadAdvice.message}
            </span>
          </div>
          {overloadAdvice.action === 'increase' && (
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-[10px] font-semibold flex-shrink-0 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Ready to increase
            </span>
          )}
        </div>

        {/* Set Tracker Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Sets & Reps
            </h3>
            <span className="text-[11px] text-slate-400">
              {trainingMode === 'home' ? 'Preset weights' : 'Custom weights'}
            </span>
          </div>

          <div className="space-y-2.5">
            {currentSets.map((set, idx) => (
              <div
                key={set.setNumber}
                className={`p-2.5 sm:p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 transition-all ${
                  set.completed
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                    : 'bg-cyber-dark/80 border-cyber-border text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-bold text-xs flex items-center justify-center border flex-shrink-0 ${
                    set.completed
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-cyber-surface border-cyber-border text-slate-300'
                  }`}>
                    #{set.setNumber}
                  </span>

                  {/* Weight Selector / Input */}
                  {trainingMode === 'home' && !currentExercise.suitableGear.includes('bodyweight') ? (
                    <div className="flex items-center gap-1">
                      <select
                        value={set.weightKg}
                        onChange={(e) => handleUpdateSetWeight(idx, parseFloat(e.target.value))}
                        className="text-xs font-semibold bg-cyber-dark border border-cyber-border hover:border-slate-500 rounded-lg py-1.5 px-2 text-white cursor-pointer focus:outline-hidden min-h-[36px]"
                      >
                        {getAchievableWeights(gearMode, DEFAULT_INVENTORY).map((opt) => (
                          <option key={opt.weightKg} value={opt.weightKg} className="bg-cyber-dark text-white">
                            {opt.weightKg} kg
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step={trainingMode === 'gym' ? '2.5' : '0.25'}
                        min="0"
                        value={set.weightKg}
                        onChange={(e) => handleUpdateSetWeight(idx, parseFloat(e.target.value) || 0)}
                        className="w-14 sm:w-16 text-center text-xs font-semibold bg-cyber-dark border border-cyber-border rounded-lg py-1.5 text-white focus:border-emerald-400 focus:outline-hidden min-h-[36px]"
                      />
                      <span className="text-[11px] text-slate-400">kg</span>
                    </div>
                  )}

                  {/* Reps Input */}
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      value={set.reps}
                      onChange={(e) => handleUpdateSetReps(idx, parseInt(e.target.value, 10) || 0)}
                      className="w-12 sm:w-16 text-center text-xs font-semibold bg-cyber-dark border border-cyber-border rounded-lg py-1.5 text-white focus:border-emerald-400 focus:outline-hidden min-h-[36px]"
                    />
                    <span className="text-[11px] text-slate-400">reps</span>
                  </div>

                  {/* Till Failure / AMRAP Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleFailure(idx)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer min-h-[36px] ${
                      set.toFailure
                        ? 'bg-amber-500/25 border border-amber-500 text-amber-300'
                        : 'bg-cyber-dark border border-cyber-border text-slate-400 hover:text-white hover:border-slate-500'
                    }`}
                    title="Till Failure (AMRAP)"
                  >
                    <Flame className={`w-3 h-3 ${set.toFailure ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
                    <span>{set.toFailure ? 'Fail' : 'Fail?'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-end gap-1.5 self-end sm:self-center flex-shrink-0">
                  {/* Remove Set Button */}
                  {currentSets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSet(idx)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Remove this set"
                      aria-label={`Remove set ${set.setNumber}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Complete Set Button */}
                  <button
                    onClick={() => handleToggleSet(idx)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer min-h-[36px] ${
                      set.completed
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'border border-cyber-border hover:border-emerald-500 text-slate-300 hover:text-white bg-cyber-dark'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {set.completed ? 'Done' : 'Log'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddSet}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:underline pt-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            + Add Set
          </button>
        </div>

        {/* Embedded Rest Timer */}
        <div className="p-4 rounded-xl bg-cyber-surface border border-cyber-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyber-dark border border-cyber-border flex items-center justify-center text-emerald-400">
              <Timer className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                Rest Timer
              </span>
              <span className="text-xl font-bold text-emerald-400">
                {formatTimer(restSeconds)}
              </span>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold uppercase tracking-wider hover:bg-emerald-400 transition-all cursor-pointer"
            >
              {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {timerRunning ? 'Pause' : 'Start'}
            </button>

            <button
              onClick={() => {
                setTimerRunning(false);
                setRestSeconds(60);
              }}
              className="p-2 rounded-xl border border-cyber-border text-slate-300 hover:text-white bg-cyber-dark cursor-pointer"
              title="Reset to 60s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setRestSeconds(prev => prev + 30)}
              className="px-3 py-2 rounded-xl border border-cyber-border text-slate-300 text-xs font-semibold bg-cyber-dark hover:text-white cursor-pointer"
            >
              +30s
            </button>
            <button
              onClick={() => setRestSeconds(90)}
              className="px-3 py-2 rounded-xl border border-cyber-border text-slate-300 text-xs font-semibold bg-cyber-dark hover:text-white cursor-pointer"
            >
              90s
            </button>
          </div>
        </div>

        {/* Step Instructions */}
        <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border text-xs text-slate-300 leading-relaxed">
          <span className="font-semibold text-white block mb-1">
            Instructions:
          </span>
          {currentExercise.steps}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-cyber-border">
          <button
            disabled={currentExerciseIndex === 0}
            onClick={() => setCurrentExerciseIndex(prev => Math.max(0, prev - 1))}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-cyber-border text-xs font-semibold text-slate-300 disabled:opacity-30 hover:border-slate-500 hover:text-white cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {currentExerciseIndex < sessionExercises.length - 1 ? (
            <button
              onClick={() => setCurrentExerciseIndex(prev => Math.min(sessionExercises.length - 1, prev + 1))}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Next Exercise
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCompleteWorkout}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm"
            >
              <Award className="w-4 h-4" />
              Finish Workout
            </button>
          )}
        </div>
      </div>

      {/* Plate Setup Modal */}
      {showPlateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 bg-cyber-surface border border-cyber-border space-y-4">
            <div className="flex items-center justify-between border-b border-cyber-border pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {currentExercise.name} Plates
                </h3>
                <p className="text-xs text-emerald-400 font-semibold">
                  Target: {currentWorkingWeight} kg
                </p>
              </div>
              <button
                onClick={() => setShowPlateModal(false)}
                className="w-8 h-8 rounded-lg bg-cyber-dark border border-cyber-border flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Transition Optimization Tip */}
            {plateTransition.summaryText && previousExerciseWeight > 0 && (
              <div className="p-3 rounded-lg bg-cyber-dark border border-cyber-border text-xs text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  <strong className="text-emerald-400">Tip:</strong> {plateTransition.summaryText}
                </span>
              </div>
            )}

            <DumbbellVisualizer
              initialMode={gearMode}
              initialTargetWeight={currentWorkingWeight}
            />

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowPlateModal(false)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-Session Swap Modal */}
      {showSwapModal && (() => {
        const alternatives = getExerciseAlternatives(currentExercise, trainingMode, EXERCISES);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 bg-cyber-surface border border-cyber-border space-y-5">
              <div className="flex items-start justify-between border-b border-cyber-border pb-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs text-slate-400">
                      Target: {currentExercise.muscleGroups.join(', ')}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Substitute: {currentExercise.name}
                  </h3>
                </div>
                <button
                  onClick={() => setShowSwapModal(false)}
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
                      onClick={() => handleInSessionSwap(alt)}
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

              {/* Equipment Swaps */}
              {alternatives.equipmentSwaps.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-cyber-border">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                    Other Equipment Alternatives
                  </span>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {alternatives.equipmentSwaps.map((alt) => (
                      <div
                        key={alt.id}
                        onClick={() => handleInSessionSwap(alt)}
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
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowSwapModal(false)}
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
