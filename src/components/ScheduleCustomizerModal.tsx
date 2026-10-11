import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  SplitTemplateId,
  RoutineCategoryKey,
  DayOfWeek
} from '../types';
import {
  SPLIT_TEMPLATES,
  ROUTINE_CATALOG,
  DAYS_ORDER,
  buildScheduleFromMapping
} from '../utils/workoutSplit';
import {
  X,
  Calendar,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

interface ScheduleCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScheduleCustomizerModal: React.FC<ScheduleCustomizerModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    user,
    activeSchedule,
    activeTemplateId,
    updateSchedule,
    resetScheduleToDefault,
    openAuthModal
  } = useAuth();

  // Selected template tab
  const [selectedTemplateId, setSelectedTemplateId] = useState<SplitTemplateId>(activeTemplateId);

  // Current working day-by-day mapping
  const [dayMapping, setDayMapping] = useState<Record<DayOfWeek, RoutineCategoryKey>>(() => {
    const mapping: Record<DayOfWeek, RoutineCategoryKey> = {
      Monday: 'push',
      Tuesday: 'pull',
      Wednesday: 'legs',
      Thursday: 'rest',
      Friday: 'upper',
      Saturday: 'lower',
      Sunday: 'rest'
    };
    activeSchedule.forEach(routine => {
      if (routine.categoryKey) {
        mapping[routine.dayName] = routine.categoryKey;
      }
    });
    return mapping;
  });

  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSelectTemplate = (templateId: SplitTemplateId) => {
    setSelectedTemplateId(templateId);
    if (templateId !== 'custom') {
      const tpl = SPLIT_TEMPLATES[templateId];
      if (tpl) {
        setDayMapping({ ...tpl.dayMapping });
      }
    }
  };

  const handleDayChange = (dayName: DayOfWeek, categoryKey: RoutineCategoryKey) => {
    setDayMapping(prev => ({
      ...prev,
      [dayName]: categoryKey
    }));
    setSelectedTemplateId('custom');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const newSchedule = buildScheduleFromMapping(dayMapping);
      await updateSchedule(newSchedule, selectedTemplateId);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset workout schedule to the default 5-Day Hybrid Split?')) {
      await resetScheduleToDefault();
      setSelectedTemplateId('hybrid_default');
      const resetMapping: Record<DayOfWeek, RoutineCategoryKey> = {
        Monday: 'push',
        Tuesday: 'pull',
        Wednesday: 'legs',
        Thursday: 'rest',
        Friday: 'upper',
        Saturday: 'lower',
        Sunday: 'rest'
      };
      setDayMapping(resetMapping);
      onClose();
    }
  };

  const availableCategories: { key: RoutineCategoryKey; label: string }[] = [
    { key: 'push', label: 'Push Day' },
    { key: 'pull', label: 'Pull Day' },
    { key: 'legs', label: 'Legs & Core' },
    { key: 'upper', label: 'Upper Body Power' },
    { key: 'lower', label: 'Lower Body' },
    { key: 'full_body', label: 'Full Body' },
    { key: 'chest', label: 'Chest & Triceps' },
    { key: 'back', label: 'Back & Biceps' },
    { key: 'shoulders', label: 'Shoulders & Traps' },
    { key: 'arms', label: 'Arms & Core' },
    { key: 'rest', label: 'Rest Day' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl rounded-2xl bg-cyber-surface border border-cyber-border shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-cyber-border flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyber-dark border border-cyber-border flex items-center justify-center text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Customize Workout Schedule
              </h3>
              <p className="text-xs text-slate-400">
                Choose a pre-made split template or customize routines for each day.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-cyber-dark hover:bg-slate-800 border border-cyber-border text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Preset Split Templates */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Pre-Made Split Templates
              </span>
              <span className="text-[11px] text-slate-500">
                Select to apply preset
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {Object.values(SPLIT_TEMPLATES)
                .filter(t => t.id !== 'custom')
                .map(tpl => {
                  const isSelected = selectedTemplateId === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tpl.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/30'
                          : 'bg-cyber-dark/60 hover:bg-cyber-dark border-cyber-border text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">
                            {tpl.name}
                          </span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px]">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {tpl.description}
                        </p>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-cyber-border/40 text-[10px] font-semibold text-emerald-400">
                        {tpl.daysPerWeek} training days • {7 - tpl.daysPerWeek} rest
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Day-by-Day Mapping Configurator */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Day-by-Day Routine Assignments
              </span>
              <span className="text-[11px] text-slate-500">
                7 Days of the Week
              </span>
            </div>

            <div className="space-y-2">
              {DAYS_ORDER.map(dayName => {
                const currentCat = dayMapping[dayName] || 'rest';
                const routineDef = ROUTINE_CATALOG[currentCat] || ROUTINE_CATALOG.rest;
                const isRest = routineDef.isRestDay;

                return (
                  <div
                    key={dayName}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      isRest
                        ? 'bg-cyber-dark/40 border-cyber-border/60 text-slate-400'
                        : 'bg-cyber-dark/80 border-cyber-border text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-[120px]">
                      <span className="w-20 font-bold text-xs text-white">
                        {dayName}
                      </span>
                      {isRest ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                          Rest Day
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
                          Workout
                        </span>
                      )}
                    </div>

                    {/* Routine Category Dropdown */}
                    <div className="flex-1 max-w-xs">
                      <select
                        value={currentCat}
                        onChange={(e) => handleDayChange(dayName, e.target.value as RoutineCategoryKey)}
                        className="w-full bg-cyber-surface border border-cyber-border hover:border-slate-600 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-hidden focus:border-emerald-400 cursor-pointer"
                      >
                        {availableCategories.map(cat => (
                          <option key={cat.key} value={cat.key} className="bg-slate-900 text-white">
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Focus muscles preview */}
                    <div className="flex items-center gap-1.5 flex-wrap min-w-[140px] justify-start sm:justify-end">
                      {routineDef.focusMuscles.length > 0 ? (
                        routineDef.focusMuscles.map(m => (
                          <span
                            key={m}
                            className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-cyber-surface border border-cyber-border text-slate-300"
                          >
                            {m}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">
                          Recovery flow
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Account Sync Status Banner */}
          <div className="p-3.5 rounded-xl bg-cyber-dark border border-cyber-border flex items-center justify-between text-xs">
            {user ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>
                  Logged in as <strong>{user.name}</strong>. Your custom schedule will be synced to your Cloudflare account.
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full flex-wrap gap-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <HelpCircle className="w-4 h-4 flex-shrink-0 text-slate-500" />
                  <span>
                    Guest mode: Saved locally in your browser.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => { onClose(); openAuthModal(); }}
                  className="text-xs font-semibold text-emerald-400 hover:underline cursor-pointer"
                >
                  Sign in to sync across devices →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-cyber-border bg-cyber-dark/40 flex items-center justify-between gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyber-dark hover:bg-slate-800 border border-cyber-border text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-cyber-border text-slate-300 hover:text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wide transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Schedule'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
