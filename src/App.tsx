import React, { useState, useEffect } from 'react';
import { Navbar, TabType } from './components/Navbar';
import { TodayWorkout } from './components/TodayWorkout';
import { DumbbellVisualizer } from './components/DumbbellVisualizer';
import { ExerciseCatalog } from './components/ExerciseCatalog';
import { EquipmentSettings } from './components/EquipmentSettings';
import { WorkoutRunner } from './components/WorkoutRunner';
import { Exercise, DayRoutine, EquipmentMode, TrainingMode } from './types';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('nestfit_theme') || localStorage.getItem('gymbuddy_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [trainingMode, setTrainingMode] = useState<TrainingMode>(() => {
    const saved = localStorage.getItem('nestfit_training_mode') || localStorage.getItem('gymbuddy_training_mode');
    return (saved === 'gym' || saved === 'home') ? saved : 'home';
  });

  // Active workout runner state
  const [activeWorkoutSession, setActiveWorkoutSession] = useState<{
    exercises: Exercise[];
    routine: DayRoutine;
    superSetPairs?: { [exerciseId: number]: number };
  } | null>(null);

  // Pre-configured visualizer state when jumped from an exercise
  const [visualizerPreload, setVisualizerPreload] = useState<{
    mode: EquipmentMode;
    weight: number;
  }>({
    mode: 'single-dumbbell',
    weight: 5.5
  });

  useEffect(() => {
    localStorage.setItem('nestfit_training_mode', trainingMode);
  }, [trainingMode]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nestfit_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nestfit_theme', 'light');
    }
  }, [isDark]);

  const handleStartWorkout = (
    exercises: Exercise[],
    routine: DayRoutine,
    superSetPairs?: { [exerciseId: number]: number }
  ) => {
    setActiveWorkoutSession({ exercises, routine, superSetPairs });
  };

  const handleFinishWorkout = () => {
    setActiveWorkoutSession(null);
    setActiveTab('equipment'); // View the newly saved history
  };

  const handleCancelWorkout = () => {
    if (window.confirm('Do you want to end this active workout session?')) {
      setActiveWorkoutSession(null);
    }
  };

  const handleNavigateToVisualizer = (mode: EquipmentMode, weight: number) => {
    setVisualizerPreload({ mode, weight });
    setActiveTab('visualizer');
  };

  return (
    <div className="min-h-screen flex flex-col bg-cyber-black text-slate-100 selection:bg-cyber-cyan selection:text-cyber-black">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (activeWorkoutSession) {
            if (window.confirm('You have an active workout in progress. Leave session?')) {
              setActiveWorkoutSession(null);
              setActiveTab(tab);
            }
          } else {
            setActiveTab(tab);
          }
        }}
        isDark={isDark}
        setIsDark={setIsDark}
        trainingMode={trainingMode}
        setTrainingMode={setTrainingMode}
        hideMobileBottomBar={!!activeWorkoutSession}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8">
        {activeWorkoutSession ? (
          <WorkoutRunner
            trainingMode={trainingMode}
            exercises={activeWorkoutSession.exercises}
            routine={activeWorkoutSession.routine}
            superSetPairs={activeWorkoutSession.superSetPairs}
            onFinish={handleFinishWorkout}
            onCancel={handleCancelWorkout}
          />
        ) : (
          <>
            {activeTab === 'today' && (
              <TodayWorkout
                trainingMode={trainingMode}
                setTrainingMode={setTrainingMode}
                onStartWorkout={handleStartWorkout}
                onNavigateToVisualizer={handleNavigateToVisualizer}
              />
            )}

            {activeTab === 'visualizer' && (
              <DumbbellVisualizer
                key={`${visualizerPreload.mode}-${visualizerPreload.weight}`}
                initialMode={visualizerPreload.mode}
                initialTargetWeight={visualizerPreload.weight}
              />
            )}

            {activeTab === 'catalog' && (
              <ExerciseCatalog
                onSelectForVisualizer={handleNavigateToVisualizer}
              />
            )}

            {activeTab === 'equipment' && (
              <EquipmentSettings />
            )}
          </>
        )}
      </main>

      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>NestFit • Workout & Weight Companion</p>
      </footer>

      {/* Global Auth Modal */}
      <AuthModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
