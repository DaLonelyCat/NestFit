import React, { useState } from 'react';
import { EquipmentMode } from '../types';
import {
  getAchievableWeights,
  calculateWeightCombination,
  DEFAULT_INVENTORY
} from '../utils/weightCalculator';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

interface DumbbellVisualizerProps {
  initialMode?: EquipmentMode;
  initialTargetWeight?: number;
}

export const DumbbellVisualizer: React.FC<DumbbellVisualizerProps> = ({
  initialMode = 'single-dumbbell',
  initialTargetWeight = 5.5
}) => {
  const [mode, setMode] = useState<EquipmentMode>(initialMode);
  const achievableOptions = getAchievableWeights(mode, DEFAULT_INVENTORY);

  // Ensure targetWeight always defaults to a valid preset
  const [targetWeight, setTargetWeight] = useState<number>(() => {
    const valid = achievableOptions.find(o => Math.abs(o.weightKg - initialTargetWeight) < 0.01);
    return valid ? valid.weightKg : (achievableOptions[achievableOptions.length - 2]?.weightKg || 4.0);
  });

  const currentPresetIndex = Math.max(0, achievableOptions.findIndex(o => Math.abs(o.weightKg - targetWeight) < 0.01));
  const calculation = calculateWeightCombination(targetWeight, mode, DEFAULT_INVENTORY);

  // Helper to get plate color classes
  const getPlateStyle = (weight: number) => {
    switch (weight) {
      case 2.0:
        return {
          bg: 'bg-cyber-amber/90 hover:bg-cyber-amber',
          border: 'border-cyber-amber',
          text: 'text-slate-950',
          height: 'h-32',
          width: 'w-7 sm:w-8',
          label: '2.0',
          badge: 'AMBER_HEAVY'
        };
      case 1.5:
        return {
          bg: 'bg-cyber-cyan/90 hover:bg-cyber-cyan',
          border: 'border-cyber-cyan',
          text: 'text-slate-950',
          height: 'h-26',
          width: 'w-6 sm:w-7',
          label: '1.5',
          badge: 'CYAN_MID'
        };
      case 1.25:
      default:
        return {
          bg: 'bg-cyber-neon/90 hover:bg-cyber-neon',
          border: 'border-cyber-neon',
          text: 'text-slate-950',
          height: 'h-20',
          width: 'w-5 sm:w-6',
          label: '1.25',
          badge: 'ACID_LIGHT'
        };
    }
  };

  // Mirrored Spinlock Collar Nut
  const renderSpinlockNut = (side: 'left' | 'right') => {
    if (side === 'left') {
      return (
        <div className="flex items-center z-10 select-none flex-shrink-0" title="Outer Spinlock Collar Nut (Left)">
          <div className="h-12 w-3.5 bg-gradient-to-b from-slate-600 via-slate-700 to-slate-600 border border-slate-500 rounded-l flex items-center justify-center">
          </div>
          <div className="h-6 w-2 bg-slate-500 border-y border-r border-slate-400 rounded-r-xs"></div>
        </div>
      );
    }
    return (
      <div className="flex items-center z-10 select-none flex-shrink-0" title="Outer Spinlock Collar Nut (Right)">
        <div className="h-6 w-2 bg-slate-500 border-y border-l border-slate-400 rounded-l-xs"></div>
        <div className="h-12 w-3.5 bg-gradient-to-b from-slate-600 via-slate-700 to-slate-600 border border-slate-500 rounded-r flex items-center justify-center">
        </div>
      </div>
    );
  };

  // Inner Stop Collar Flange
  const renderInnerCollar = (side: 'left' | 'right') => (
    <div
      className={`h-12 w-3 bg-gradient-to-b from-slate-600 via-slate-500 to-slate-600 border border-slate-400 flex items-center justify-center z-10 shadow-xs flex-shrink-0 ${
        side === 'left' ? 'rounded-l-xs' : 'rounded-r-xs'
      }`}
      title={`Inner Stop Collar (${side === 'left' ? 'Left' : 'Right'})`}
    >
      <div className="w-0.5 h-6 bg-slate-300/40 rounded-full"></div>
    </div>
  );

  // Sleeve Plates with Bilateral Symmetrical Ordering
  const renderSleevePlates = (plates: number[], side: 'left' | 'right') => {
    const displayPlates = side === 'left' ? [...plates].reverse() : plates;

    return (
      <div className="relative flex items-center justify-center min-w-[70px] px-1">
        {/* Continuous horizontal steel threaded rod through sleeve */}
        <div className="absolute h-3.5 w-full bg-gradient-to-b from-slate-500 via-slate-400 to-slate-600 border-y border-slate-400 z-0">
          <div className="w-full h-full opacity-30 bg-[repeating-linear-gradient(90deg,_#000_0px,_#000_2px,_transparent_2px,_transparent_4px)]" />
        </div>

        {plates.length === 0 ? (
          <div className="relative z-10 h-10 flex items-center justify-center px-3 text-[10px] font-medium text-slate-400 bg-cyber-dark rounded border border-cyber-border">
            Empty
          </div>
        ) : (
          <div className="relative z-10 flex items-center gap-1">
            {displayPlates.map((plateWeight, idx) => {
              const style = getPlateStyle(plateWeight);
              const highlightClass = side === 'left' ? 'border-l-white/40' : 'border-r-white/40';

              return (
                <div
                  key={idx}
                  className={`${style.height} ${style.width} ${style.bg} ${style.border} ${highlightClass} border-2 rounded-xs flex flex-col items-center justify-center font-mono font-black text-[10px] sm:text-xs ${style.text} transition-all transform hover:scale-105 select-none relative shadow-sm`}
                  title={`${plateWeight} kg plate (${side === 'left' ? 'Left' : 'Right'} sleeve)`}
                >
                  <span>{style.label}</span>
                  <span className="text-[7px] font-bold opacity-90">KG</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl p-6 bg-cyber-surface border border-cyber-border shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-slate-400">
                {mode === 'single-dumbbell'
                  ? 'Max 3 plates / sleeve (11.0 kg max)'
                  : mode === 'dumbbell-pair'
                  ? 'Max 3 plates / sleeve (9.5 kg each)'
                  : 'Barbell: up to 19.0 kg'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
              Weight Calculator
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure symmetric plate setup and verify sleeve thread capacity.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-3 w-full sm:w-auto p-1 bg-cyber-dark border border-cyber-border rounded-lg">
            <button
              onClick={() => {
                setMode('single-dumbbell');
                setTargetWeight(5.5);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer text-center ${
                mode === 'single-dumbbell'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Single DB
            </button>
            <button
              onClick={() => {
                setMode('dumbbell-pair');
                setTargetWeight(4.75);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer text-center ${
                mode === 'dumbbell-pair'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              DB Pair
            </button>
            <button
              onClick={() => {
                setMode('barbell');
                setTargetWeight(9.5);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer text-center ${
                mode === 'barbell'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Barbell
            </button>
          </div>
        </div>
      </div>

      {/* Preset-Only Weight Controller */}
      <div className="rounded-xl p-6 bg-cyber-surface border border-cyber-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyber-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <label className="block text-sm font-bold text-white">
                Target Weight
              </label>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Balanced
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === 'dumbbell-pair'
                ? 'Weight loaded on each dumbbell'
                : 'Weight loaded evenly on left & right sleeves'}
            </p>
          </div>

          {/* Stepper & Select Box */}
          <div className="flex items-center gap-2">
            <button
              disabled={currentPresetIndex <= 0}
              onClick={() => {
                if (currentPresetIndex > 0) {
                  setTargetWeight(achievableOptions[currentPresetIndex - 1].weightKg);
                }
              }}
              title="Previous valid weight preset"
              className="w-9 h-9 rounded bg-cyber-dark border border-cyber-border flex items-center justify-center font-bold text-slate-300 hover:border-slate-500 hover:text-white disabled:opacity-20 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={targetWeight}
              onChange={(e) => setTargetWeight(parseFloat(e.target.value))}
              aria-label="Preset weight selection"
              className="text-base font-bold bg-cyber-dark border border-cyber-border hover:border-slate-500 rounded py-1.5 px-3 text-white focus:outline-hidden cursor-pointer"
            >
              {achievableOptions.map((opt) => (
                <option key={opt.weightKg} value={opt.weightKg} className="bg-cyber-dark text-white">
                  {opt.weightKg} kg {opt.weightKg === 0 ? '(Empty)' : ''}
                </option>
              ))}
            </select>

            <button
              disabled={currentPresetIndex >= achievableOptions.length - 1}
              onClick={() => {
                if (currentPresetIndex < achievableOptions.length - 1) {
                  setTargetWeight(achievableOptions[currentPresetIndex + 1].weightKg);
                }
              }}
              title="Next valid weight preset"
              className="w-9 h-9 rounded bg-cyber-dark border border-cyber-border flex items-center justify-center font-bold text-slate-300 hover:border-slate-500 hover:text-white disabled:opacity-20 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Preset Selector Pills */}
        <div>
          <span className="text-[11px] text-slate-400 block mb-2 font-medium">
            Presets ({achievableOptions.length}):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {achievableOptions.map((opt) => {
              const isSelected = Math.abs(opt.weightKg - targetWeight) < 0.01;
              return (
                <button
                  key={opt.weightKg}
                  onClick={() => setTargetWeight(opt.weightKg)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-bold'
                      : 'bg-cyber-dark text-slate-300 border-cyber-border hover:border-slate-500 hover:text-white'
                  }`}
                >
                  {opt.weightKg}kg
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Plate Setup Diagram Container */}
      <div className="rounded-xl p-6 bg-cyber-surface border border-cyber-border shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyber-border pb-3">
          <h3 className="text-sm font-bold text-white tracking-wide uppercase">
            Plate Setup Diagram
          </h3>

          {/* Color legend */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-amber"></span>
              <span>2.0kg (4x)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-cyan"></span>
              <span>1.5kg (4x)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-neon"></span>
              <span>1.25kg (4x)</span>
            </div>
          </div>
        </div>

        {/* Canvas Graphic */}
        <div className="p-4 sm:p-6 bg-slate-950 rounded-lg border border-cyber-border overflow-x-auto touch-pan-x relative scrollbar-thin">
          <div className="sm:hidden text-[10px] text-slate-500 text-center mb-2 flex items-center justify-center gap-1 font-medium">
            <span>↔ Scroll horizontally to view entire bar</span>
          </div>
          {mode === 'dumbbell-pair' ? (
            /* Pair of Dumbbells rendering */
            <div className="space-y-7 min-w-[520px] relative z-10">
              {/* Dumbbell 1 */}
              <div>
                <p className="text-xs font-semibold text-slate-300 mb-2 text-center">
                  Dumbbell 1 ({calculation.perDumbbellWeightKg} kg)
                </p>
                <div className="flex items-center justify-center">
                  {renderSpinlockNut('left')}
                  {renderSleevePlates(calculation.leftPlates, 'left')}
                  {renderInnerCollar('left')}

                  <div className="h-8 w-36 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 border-y border-cyber-border flex items-center justify-center text-[10px] font-medium text-slate-300">
                    Handle 1
                  </div>

                  {renderInnerCollar('right')}
                  {renderSleevePlates(calculation.rightPlates, 'right')}
                  {renderSpinlockNut('right')}
                </div>
              </div>

              {/* Dumbbell 2 */}
              <div>
                <p className="text-xs font-semibold text-slate-300 mb-2 text-center">
                  Dumbbell 2 ({calculation.perDumbbellWeightKg} kg)
                </p>
                <div className="flex items-center justify-center">
                  {renderSpinlockNut('left')}
                  {renderSleevePlates(calculation.leftPlates, 'left')}
                  {renderInnerCollar('left')}

                  <div className="h-8 w-36 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 border-y border-cyber-border flex items-center justify-center text-[10px] font-medium text-slate-300">
                    Handle 2
                  </div>

                  {renderInnerCollar('right')}
                  {renderSleevePlates(calculation.rightPlates, 'right')}
                  {renderSpinlockNut('right')}
                </div>
              </div>
            </div>
          ) : mode === 'barbell' ? (
            /* Barbell Mode rendering */
            <div className="min-w-[660px] flex items-center justify-center py-6 relative z-10">
              {/* Left Outer Nut */}
              {renderSpinlockNut('left')}

              {/* Left Sleeve */}
              {renderSleevePlates(calculation.leftPlates, 'left')}

              {/* Left Inner Collar */}
              {renderInnerCollar('left')}

              {/* Bar A */}
              <div className="h-7 w-28 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 border-y border-cyber-border flex items-center justify-center text-[10px] font-medium text-slate-300">
                Bar A
              </div>

              {/* Central Connector */}
              <div className="h-10 w-28 bg-cyber-dark border border-emerald-500/50 flex flex-col items-center justify-center text-[9px] font-bold text-emerald-400 z-20 flex-shrink-0">
                Connector
              </div>

              {/* Bar B */}
              <div className="h-7 w-28 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 border-y border-cyber-border flex items-center justify-center text-[10px] font-medium text-slate-300">
                Bar B
              </div>

              {/* Right Inner Collar */}
              {renderInnerCollar('right')}

              {/* Right Sleeve */}
              {renderSleevePlates(calculation.rightPlates, 'right')}

              {/* Right Outer Nut */}
              {renderSpinlockNut('right')}
            </div>
          ) : (
            /* Single Dumbbell Mode rendering */
            <div className="min-w-[500px] flex items-center justify-center py-6 relative z-10">
              {renderSpinlockNut('left')}
              {renderSleevePlates(calculation.leftPlates, 'left')}
              {renderInnerCollar('left')}

              <div className="h-9 w-44 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 border-y border-cyber-border flex items-center justify-center text-xs font-medium text-slate-200">
                Handle
              </div>

              {renderInnerCollar('right')}
              {renderSleevePlates(calculation.rightPlates, 'right')}
              {renderSpinlockNut('right')}
            </div>
          )}
        </div>

        {/* Hardware & Diagnostics Checklist */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-cyber-dark border border-cyber-border">
            <span className="text-[10px] uppercase text-slate-400 block font-medium">Handles</span>
            <span className="text-sm font-bold text-white">
              {calculation.barsRequired} of 2 bars
            </span>
          </div>

          <div className="p-3 rounded-xl bg-cyber-dark border border-cyber-border">
            <span className="text-[10px] uppercase text-slate-400 block font-medium">Connector</span>
            <span className="text-sm font-bold text-emerald-400">
              {calculation.connectorRequired ? 'Required' : 'None'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-cyber-dark border border-cyber-border">
            <span className="text-[10px] uppercase text-slate-400 block font-medium">Collars</span>
            <span className="text-sm font-bold text-white">
              {calculation.nutsRequired} of 4 collars
            </span>
          </div>

          <div className="p-3 rounded-xl bg-cyber-dark border border-cyber-border">
            <span className="text-[10px] uppercase text-slate-400 block font-medium">Total Weight</span>
            <span className="text-sm font-bold text-emerald-400">
              {calculation.totalLoadedWeightKg} kg
            </span>
          </div>
        </div>

        {/* Assembly Steps */}
        <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border space-y-2">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Assembly Steps
          </h4>
          <ul className="space-y-1 text-xs text-slate-300">
            {calculation.instructions.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
