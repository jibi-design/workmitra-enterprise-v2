/** Job Mitra | authStore.ts | src/shared/store/authStore.ts */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StateStorage } from "zustand/middleware";
import { AUTH_BACKEND_ENABLED } from "../config/authConfig";
import { authService } from "../../features/auth/services/authService";
import { roleStorage } from "../../app/storage/roleStorage";
import { piiSecureStorage } from "../security/piiSecureStorage";
import {
  clearShiftOpsAuthSession,
  ensureShiftOpsAuthSession,
} from "../../features/shiftOps/services/authBridge.service";
import { publishAuthSessionEpoch } from "../auth/authSessionSync";

const AUTH_STORAGE_KEY = "wm-auth-storage";

const safeStorage: StateStorage = {
  getItem: (name) => piiSecureStorage.getItem(name),
  setItem: (name, value) => {
    piiSecureStorage.setItem(name, value);
  },
  removeItem: (name) => {
    piiSecureStorage.removeItem(name);
  },
};

/** Scrub legacy bearer tokens; cookie session is SoT when auth backend is on. */
try {
  localStorage.removeItem("wm_auth_token");
  if (AUTH_BACKEND_ENABLED) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
} catch {
  // ignore
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
    void token;
    syncRoleBridge(user);
    // Never keep bearer tokens in client memory/persist (Phase-0 demo uses role bridge only).
    set({
      user,
      token: null,
      isAuthenticated: true,
      sessionChecked: true,
    });
    publishAuthSessionEpoch(user.id, user.role);
  },

  clearAuth: () => {
    syncRoleBridge(null);
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      sessionChecked: true,
    });
    publishAuthSessionEpoch(null, null);
  },

  updateProfile: (updates) =>
    set((state) => {
      if (!state.user) return {};
      // P0/P1: role is server-owned — never allow client partials to escalate.
      const { role: _ignoredRole, ...safeUpdates } = updates;
      void _ignoredRole;
      return { user: { ...state.user, ...safeUpdates } };
    }),

  hydrateSession: async () => {
    if (!AUTH_BACKEND_ENABLED) {
      set({ sessionChecked: true });
      return;
    }
    const user = await authService.fetchMe();
    if (user) {
      get().setAuth(user, null);
      void ensureShiftOpsAuthSession().catch(() => {
        /* bridge optional until server env configured */
      });
    } else {
      get().clearAuth();
      void clearShiftOpsAuthSession();
    }
  },

  loginWithCredentials: async (email, password) => {
    const user = await authService.login({ email, password });
    get().setAuth(user, null);
    void ensureShiftOpsAuthSession().catch(() => {
      /* bridge optional until server env configured */
    });
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
    await clearShiftOpsAuthSession();
    get().clearAuth();
  },
});

export const useAuthStore = AUTH_BACKEND_ENABLED
  ? create<AuthState>()(createAuthSlice)
  : create<AuthState>()(
      persist(createAuthSlice, {
        name: AUTH_STORAGE_KEY,
        version: 4,
        storage: createJSONStorage(() => safeStorage),
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
        migrate: (persistedState) => {
          const p = persistedState as {
            user?: UserProfile | null;
            isAuthenticated?: boolean;
          } | null;
          return {
            user: p?.user ?? null,
            isAuthenticated: Boolean(p?.isAuthenticated && p?.user),
          };
        },
        onRehydrateStorage: () => (_state, error) => {
          if (error) console.error("Auth hydration failed", error);
        },
      }),
    );
