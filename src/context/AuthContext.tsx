import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, SplitTemplateId, ExtendedDayRoutine } from '../types';
import { authService } from '../utils/authService';
import {
  loadActiveWeeklySplit,
  loadActiveTemplateId,
  saveActiveWeeklySplit,
  getSplitTemplate
} from '../utils/workoutSplit';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  activeSchedule: ExtendedDayRoutine[];
  activeTemplateId: SplitTemplateId;
  updateSchedule: (schedule: ExtendedDayRoutine[], templateId: SplitTemplateId) => Promise<void>;
  resetScheduleToDefault: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(authService.getCachedUser());
  const [token, setToken] = useState<string | null>(authService.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const [activeSchedule, setActiveSchedule] = useState<ExtendedDayRoutine[]>(() =>
    loadActiveWeeklySplit()
  );
  const [activeTemplateId, setActiveTemplateId] = useState<SplitTemplateId>(() =>
    loadActiveTemplateId()
  );

  // Initialize session on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const result = await authService.fetchCurrentUser();
        if (mounted && result) {
          setUser(result.user);
          setToken(authService.getToken());
          if (result.schedule && result.schedule.scheduleData) {
            setActiveSchedule(result.schedule.scheduleData);
            setActiveTemplateId(result.schedule.templateId);
            saveActiveWeeklySplit(result.schedule.scheduleData, result.schedule.templateId);
          }
        }
      } catch {
        // Continue with local cache
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    setUser(res.user);
    setToken(res.token);
    if (res.schedule && res.schedule.scheduleData) {
      setActiveSchedule(res.schedule.scheduleData);
      setActiveTemplateId(res.schedule.templateId);
      saveActiveWeeklySplit(res.schedule.scheduleData, res.schedule.templateId);
    }
    closeAuthModal();
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authService.register(name, email, password);
    setUser(res.user);
    setToken(res.token);
    // Sync current active schedule to newly registered user
    await authService.saveSchedule(activeTemplateId, activeSchedule);
    closeAuthModal();
  };

  const logout = () => {
    authService.clearSession();
    setUser(null);
    setToken(null);
  };

  const updateSchedule = async (schedule: ExtendedDayRoutine[], templateId: SplitTemplateId) => {
    setActiveSchedule(schedule);
    setActiveTemplateId(templateId);
    await authService.saveSchedule(templateId, schedule);
  };

  const resetScheduleToDefault = async () => {
    const defaultSplit = getSplitTemplate('hybrid_default');
    setActiveSchedule(defaultSplit);
    setActiveTemplateId('hybrid_default');
    await authService.saveSchedule('hybrid_default', defaultSplit);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        activeSchedule,
        activeTemplateId,
        updateSchedule,
        resetScheduleToDefault
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
