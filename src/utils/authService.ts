import { User, AuthResponse, UserScheduleData, SplitTemplateId, ExtendedDayRoutine } from '../types';

const TOKEN_KEY = 'nestfit_auth_token';
const USER_KEY = 'nestfit_auth_user';
const LOCAL_USERS_KEY = 'nestfit_local_accounts';

export const authService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setSession(user: User, token: string): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearSession(): void {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  getCachedUser(): User | null {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, email: cleanEmail, password }),
      });

      if (res.ok) {
        const data = await res.json() as AuthResponse;
        this.setSession(data.user, data.token);
        return data;
      }

      // If backend explicitly rejected with user-actionable message (e.g. 409 already exists)
      if (res.status === 409 || res.status === 400) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error || 'Registration failed');
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('already exists') || err.message.includes('required'))) {
        throw err;
      }
      // If serverless endpoint is offline / D1 not bound (503), use local account fallback
    }

    // Local account fallback (offline / pre-D1 binding mode)
    return this._localRegister(cleanName, cleanEmail, password);
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const cleanEmail = email.toLowerCase().trim();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      if (res.ok) {
        const data = await res.json() as AuthResponse;
        this.setSession(data.user, data.token);
        return data;
      }

      if (res.status === 401 || res.status === 400) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error || 'Invalid email or password');
      }
    } catch (err: any) {
      if (err.message && err.message.includes('Invalid email or password')) {
        throw err;
      }
    }

    // Local account fallback
    return this._localLogin(cleanEmail, password);
  },

  async fetchCurrentUser(): Promise<{ user: User; schedule?: UserScheduleData | null } | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json() as { user: User; schedule?: UserScheduleData | null };
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return data;
      }
    } catch {
      // offline
    }

    const cached = this.getCachedUser();
    if (cached) {
      const savedSched = localStorage.getItem(`nestfit_user_schedule_${cached.id}`);
      let schedule: UserScheduleData | null = null;
      if (savedSched) {
        try { schedule = JSON.parse(savedSched); } catch {}
      }
      return { user: cached, schedule };
    }

    return null;
  },

  async saveSchedule(templateId: SplitTemplateId, scheduleData: ExtendedDayRoutine[]): Promise<void> {
    const token = this.getToken();
    const user = this.getCachedUser();

    // Cache locally
    localStorage.setItem('nestfit_active_schedule', JSON.stringify(scheduleData));
    localStorage.setItem('nestfit_active_template_id', templateId);

    if (user) {
      localStorage.setItem(`nestfit_user_schedule_${user.id}`, JSON.stringify({
        templateId,
        scheduleData,
        updatedAt: new Date().toISOString()
      }));
    }

    if (token) {
      try {
        await fetch('/api/schedule', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ templateId, scheduleData })
        });
      } catch {
        // Sync will occur on next connection
      }
    }
  },

  // Private local account helpers for offline / development resilience
  _localRegister(name: string, email: string, password: string): AuthResponse {
    const localUsersStr = localStorage.getItem(LOCAL_USERS_KEY);
    const localUsers: Array<{ id: string; email: string; name: string; passwordHash: string; createdAt: string }> =
      localUsersStr ? JSON.parse(localUsersStr) : [];

    if (localUsers.some(u => u.email === email)) {
      throw new Error('An account with this email already exists');
    }

    const newUser = {
      id: 'local_' + Date.now().toString(),
      email,
      name,
      passwordHash: btoa(password), // simple local encoding
      createdAt: new Date().toISOString()
    };
    localUsers.push(newUser);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));

    const user: User = { id: newUser.id, email: newUser.email, name: newUser.name, createdAt: newUser.createdAt };
    const token = 'local_token_' + btoa(JSON.stringify({ userId: user.id, email: user.email }));
    this.setSession(user, token);

    return { user, token };
  },

  _localLogin(email: string, password: string): AuthResponse {
    const localUsersStr = localStorage.getItem(LOCAL_USERS_KEY);
    const localUsers: Array<{ id: string; email: string; name: string; passwordHash: string; createdAt: string }> =
      localUsersStr ? JSON.parse(localUsersStr) : [];

    const found = localUsers.find(u => u.email === email && u.passwordHash === btoa(password));
    if (!found) {
      throw new Error('Invalid email or password');
    }

    const user: User = { id: found.id, email: found.email, name: found.name, createdAt: found.createdAt };
    const token = 'local_token_' + btoa(JSON.stringify({ userId: user.id, email: user.email }));
    this.setSession(user, token);

    const savedSched = localStorage.getItem(`nestfit_user_schedule_${user.id}`);
    let schedule: UserScheduleData | null = null;
    if (savedSched) {
      try { schedule = JSON.parse(savedSched); } catch {}
    }

    return { user, token, schedule };
  }
};
