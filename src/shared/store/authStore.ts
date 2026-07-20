/** Job Mitra | authStore.ts | src/shared/store/authStore.ts */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StateStorage } from "zustand/middleware";
import { AUTH_BACKEND_ENABLED } from "../config/authConfig";
import { authService } from "../../features/auth/services/authService";
import { roleStorage } from "../../app/storage/roleStorage";

const AUTH_STORAGE_KEY = "wm-auth-storage";

const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch (e) {
      console.error("Storage read error", e);
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch (e) {
      console.error("Storage write error", e);
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch (e) {
      console.error("Storage delete error", e);
    }
  },
};

/** Backend auth: cookie session is SoT — never cache auth state in localStorage. */
if (AUTH_BACKEND_ENABLED) {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem("wm_auth_token");
  } catch {
    // ignore
  }
}

export type UserRole = "employee" | "employer" | "admin";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  sessionChecked: boolean;
  token: string | null;

  setAuth: (user: UserProfile, token: string | null) => void;
  clearAuth: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  hydrateSession: () => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<UserProfile>;
  logoutSession: () => Promise<void>;
}

/** Legacy UX bridge for components still reading roleStorage — not security. */
function syncRoleBridge(user: UserProfile | null) {
  if (!AUTH_BACKEND_ENABLED) return;
  if (user) roleStorage.set(user.role);
  else roleStorage.clear();
}

type AuthStoreSlice = (
  set: (partial: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>)) => void,
  get: () => AuthState,
) => AuthState;

const createAuthSlice: AuthStoreSlice = (set, get) => ({
  user: null,
  isAuthenticated: false,
  sessionChecked: !AUTH_BACKEND_ENABLED,
  token: null,

  setAuth: (user, token) => {
    syncRoleBridge(user);
    set({
      user,
      token: AUTH_BACKEND_ENABLED ? null : token,
      isAuthenticated: true,
      sessionChecked: true,
    });
  },

  clearAuth: () => {
    syncRoleBridge(null);
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      sessionChecked: true,
    });
  },

  updateProfile: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  hydrateSession: async () => {
    if (!AUTH_BACKEND_ENABLED) {
      set({ sessionChecked: true });
      return;
    }
    const user = await authService.fetchMe();
    if (user) {
      get().setAuth(user, null);
    } else {
      get().clearAuth();
    }
  },

  loginWithCredentials: async (email, password) => {
    const user = await authService.login({ email, password });
    get().setAuth(user, null);
    return user;
  },

  logoutSession: async () => {
    if (AUTH_BACKEND_ENABLED) {
      try {
        await authService.logout();
      } catch {
        // still clear client state
      }
    }
    get().clearAuth();
  },
});

export const useAuthStore = AUTH_BACKEND_ENABLED
  ? create<AuthState>()(createAuthSlice)
  : create<AuthState>()(
      persist(createAuthSlice, {
        name: AUTH_STORAGE_KEY,
        version: 3,
        storage: createJSONStorage(() => safeStorage),
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          token: state.token,
        }),
        onRehydrateStorage: () => (_state, error) => {
          if (error) console.error("Auth hydration failed", error);
        },
      }),
    );
