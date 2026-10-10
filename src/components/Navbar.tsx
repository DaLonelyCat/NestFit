import React from 'react';
import { Dumbbell, Calendar, BookOpen, Settings, Sun, Moon } from 'lucide-react';
import { TrainingMode } from '../types';

export type TabType = 'today' | 'visualizer' | 'catalog' | 'equipment';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  trainingMode: TrainingMode;
  setTrainingMode: (mode: TrainingMode) => void;
  hideMobileBottomBar?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark,
  trainingMode,
  setTrainingMode,
  hideMobileBottomBar = false
}) => {
  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'today', label: 'Today', icon: <Calendar className="w-5 h-5 sm:w-4 sm:h-4" /> },
    { id: 'visualizer', label: 'Dumbbell', icon: <Dumbbell className="w-5 h-5 sm:w-4 sm:h-4" /> },
    { id: 'catalog', label: 'Exercises', icon: <BookOpen className="w-5 h-5 sm:w-4 sm:h-4" /> },
    { id: 'equipment', label: 'Gear & Logs', icon: <Settings className="w-5 h-5 sm:w-4 sm:h-4" /> },
  ];

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div 
              onClick={() => handleTabClick('today')}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/50 transition-colors">
                <Dumbbell className="w-4 h-4 transform -rotate-45" />
              </div>
              <span className="text-base font-bold tracking-tight text-white flex items-center">
                Nest<span className="text-emerald-400">Fit</span>
              </span>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-400 font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Actions: Environment, Theme */}
            <div className="flex items-center gap-2">
              {/* Environment Toggle */}
              <button
                onClick={() => setTrainingMode(trainingMode === 'home' ? 'gym' : 'home')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                  trainingMode === 'home'
                    ? 'bg-slate-900 border-slate-800 text-amber-400'
                    : 'bg-slate-900 border-slate-800 text-sky-400'
                }`}
              >
                {trainingMode === 'home' ? 'Home' : 'Gym'}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="p-1.5 sm:p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Fixed Mobile Bottom Navigation Bar */}
      {!hideMobileBottomBar && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-lg flex items-center justify-around py-2 px-1 shadow-lg"
          style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'text-emerald-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="mb-0.5">{item.icon}</span>
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </>
  );
};

export default Navbar;
