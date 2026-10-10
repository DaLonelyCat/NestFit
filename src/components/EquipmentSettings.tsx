import React, { useState, useEffect } from 'react';
import { WorkoutLogItem, DayRoutine } from '../types';
import { DEFAULT_INVENTORY } from '../utils/weightCalculator';
import { getMuscularReadiness } from '../utils/suggestionEngine';
import { EXERCISES } from '../data/exercises';
import {
  History,
  Trash2,
  Award,
  Calendar,
  Clock,
  Check,
  ShieldCheck
} from 'lucide-react';

export const EquipmentSettings: React.FC = () => {
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

  const handleClearHistory = () => {
    if (window.confirm('Clear all local workout history? This cannot be undone.')) {
      localStorage.removeItem('gymbuddy_history');
      setHistory([]);
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s}s`;
  };

  const totalPlatesCount = DEFAULT_INVENTORY.plates.reduce((sum, p) => sum + p.count, 0);
  const totalPlatesWeight = DEFAULT_INVENTORY.plates.reduce((sum, p) => sum + p.weightKg * p.count, 0);

  // Full body evaluation for readiness matrix
  const fullBodyRoutine: DayRoutine = {
    dayName: 'Monday',
    splitName: 'Full Body Assessment',
    tagline: 'All Muscle Groups',
    focusMuscles: ['Chest', 'Back', 'Arm', 'Shoulder', 'Leg', 'Core'],
    isRestDay: false,
    exerciseIds: []
  };

  const readinessSummary = getMuscularReadiness(fullBodyRoutine, history, EXERCISES);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Equipment Inventory Summary Card */}
      <div className="rounded-2xl p-6 bg-cyber-surface border border-cyber-border shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Equipment Inventory
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Hardware registered for symmetric dumbbell assembly and barbell conversion.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyber-dark border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Balanced Kit</span>
          </div>
        </div>

        {/* Hardware specifications matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">Handle Bars</span>
            <span className="text-xl font-bold text-white mt-1 block">
              {DEFAULT_INVENTORY.handleBars} bars
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Threaded steel</span>
          </div>

          <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">Connector</span>
            <span className="text-xl font-bold text-amber-400 mt-1 block">
              {DEFAULT_INVENTORY.barConnectors} unit
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Barbell adapter</span>
          </div>

          <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">Collars</span>
            <span className="text-xl font-bold text-white mt-1 block">
              {DEFAULT_INVENTORY.nuts} nuts
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Spinlock safety</span>
          </div>

          <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">Total Weight</span>
            <span className="text-xl font-bold text-emerald-400 mt-1 block">
              {totalPlatesWeight.toFixed(1)} kg
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{totalPlatesCount} plates total</span>
          </div>
        </div>

        {/* Weight plates breakdown */}
        <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
            Plates Breakdown ({totalPlatesCount} total):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="flex items-center justify-between p-3 rounded-lg bg-cyber-surface border border-cyber-border">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-cyber-amber"></span>
                <span className="text-xs font-semibold text-white">2.0 kg Plates</span>
              </div>
              <span className="text-sm font-bold text-amber-400">
                4× (8.0 kg)
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-cyber-surface border border-cyber-border">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-cyber-cyan"></span>
                <span className="text-xs font-semibold text-white">1.5 kg Plates</span>
              </div>
              <span className="text-sm font-bold text-sky-400">
                4× (6.0 kg)
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-cyber-surface border border-cyber-border">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-cyber-neon"></span>
                <span className="text-xs font-semibold text-white">1.25 kg Plates</span>
              </div>
              <span className="text-sm font-bold text-emerald-400">
                4× (5.0 kg)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Muscular Readiness Matrix */}
      <div className="rounded-2xl p-6 bg-cyber-surface border border-cyber-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyber-border pb-3">
          <div>
            <h3 className="text-lg font-bold text-white">
              Muscle Readiness
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Recovery status based on your logged workouts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 rounded-lg bg-cyber-dark border border-cyber-border text-slate-300">
              Sessions: <strong className="text-emerald-400">{history.length}</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {readinessSummary.muscleStatuses.map((st) => {
            let badgeBg = 'bg-cyber-dark border-cyber-border text-slate-400';
            let barWidth = 'w-0';
            let barColor = 'bg-slate-600';
            let label = 'Fresh';

            if (st.status === 'optimal') {
              badgeBg = 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300';
              barWidth = 'w-full';
              barColor = 'bg-emerald-400';
              label = 'Recovered';
            } else if (st.status === 'recovering') {
              badgeBg = 'bg-sky-500/15 border-sky-500/50 text-sky-300';
              barWidth = 'w-3/5';
              barColor = 'bg-sky-400';
              label = 'Recovering';
            } else if (st.status === 'fatigued') {
              badgeBg = 'bg-amber-950/40 border-amber-500 text-amber-300';
              barWidth = 'w-1/4';
              barColor = 'bg-amber-500';
              label = 'Fatigued';
            }

            return (
              <div
                key={st.muscleGroup}
                className="p-3.5 rounded-xl bg-cyber-dark border border-cyber-border flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-sm">
                    {st.muscleGroup}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${badgeBg}`}>
                    {label}
                  </span>
                </div>

                {/* Progress recovery bar */}
                <div className="w-full h-1.5 bg-cyber-surface rounded-full overflow-hidden border border-cyber-border">
                  <div className={`h-full ${barWidth} ${barColor} transition-all duration-500 rounded-full`} />
                </div>

                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>
                    {st.hoursSinceTrained !== null
                      ? `${st.hoursSinceTrained}h elapsed`
                      : 'No recent logs'}
                  </span>
                  <span className="text-slate-500 truncate max-w-[140px] text-right">
                    {st.lastTrainedDateStr || 'Ready'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workout History Log */}
      <div className="rounded-2xl p-6 bg-cyber-surface border border-cyber-border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              Workout History
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Saved locally on your device.
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/20 border border-rose-500/30 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center bg-cyber-dark rounded-xl border border-dashed border-cyber-border">
            <Award className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-slate-300">
              No workouts logged yet
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Complete a workout from the Today tab to record your progress.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-cyber-dark border border-cyber-border hover:border-slate-600 transition-colors space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                      {item.splitName}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.date} ({item.dayName})
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDuration(item.durationSeconds)}
                  </span>
                </div>

                {/* Exercises logged */}
                <div className="space-y-1.5 pt-1">
                  {item.exercisesCompleted.map((ex, idx) => (
                    <div key={idx} className="text-xs flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        {ex.exerciseName}
                      </span>
                      <span className="text-slate-400">
                        {ex.sets.length} sets
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
