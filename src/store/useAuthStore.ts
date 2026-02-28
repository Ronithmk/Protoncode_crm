// ============================================================
// store/useAuthStore.ts
// Zustand store for authentication and role state.
// In production, hydrate this from your auth provider / JWT.
// ============================================================

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Role } from "../config/navigationConfig";

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
};

type AuthState = {
  user: User | null;
  role: Role;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User) => void;
  setRole: (role: Role) => void;   // dev-only role switcher
  logout: () => void;
};

const DEFAULT_USER: User = {
  id: "usr_001",
  name: "Admin User",
  email: "admin@dojo.com",
  role: "SUPER_ADMIN",
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: DEFAULT_USER,
        role: DEFAULT_USER.role,
        isAuthenticated: true,

        setUser: (user) =>
          set({ user, role: user.role, isAuthenticated: true }),

        setRole: (role) =>
          set((state) => ({
            role,
            user: state.user ? { ...state.user, role } : null,
          })),

        logout: () =>
          set({ user: null, role: "HR", isAuthenticated: false }),
      }),
      {
        name: "dojo-auth",
        // Only persist role for dev convenience; remove in production
        partialize: (state) => ({ role: state.role }),
      }
    )
  )
);

// ─────────────────────────────────────────────
// Selector hooks (prevents unnecessary re-renders)
// ─────────────────────────────────────────────
export const useRole = () => useAuthStore((s) => s.role);
export const useUser = () => useAuthStore((s) => s.user);
export const useSetRole = () => useAuthStore((s) => s.setRole);
