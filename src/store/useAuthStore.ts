// ============================================================
// store/useAuthStore.ts  (UPDATED)
// Zustand store for authentication and role state.
//
// Changes from v1:
//  - isAuthenticated defaults to false (no auto-login)
//  - user defaults to null (must go through login flow)
//  - Added login() action that accepts a full User object
//  - setRole() removed — role is now owned by the session
//  - persist() only saves the session; clears on logout
// ============================================================

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Role } from "../config/navigationConfig";

// ─── TYPES ───────────────────────────────────────────────
export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  center: string;
  avatar?: string;
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;

  // Actions
  login: (user: User) => void;
  logout: () => void;
};

// ─── STORE ───────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        // ── Initial state: not logged in ──────────────────
        user: null,
        isAuthenticated: false,

        // ── login: called after credentials are verified ──
        login: (user) =>
          set({ user, isAuthenticated: true }, false, "auth/login"),

        // ── logout: wipes session ─────────────────────────
        logout: () =>
          set({ user: null, isAuthenticated: false }, false, "auth/logout"),
      }),
      {
        name: "proton-auth-session",
        // Persist the full session so a page refresh keeps the user logged in.
        // Remove `partialize` entirely to persist everything, or scope it:
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);

// ─── SELECTOR HOOKS ──────────────────────────────────────
// Prefer these over accessing the store directly in components
// to avoid unnecessary re-renders.

/** The current user's role, or HR as a safe fallback. */
export const useRole = () =>
  useAuthStore((s) => s.user?.role ?? "HR");

/** The full current user object (may be null if not logged in). */
export const useUser = () =>
  useAuthStore((s) => s.user);

/** Whether the user is currently authenticated. */
export const useIsAuthenticated = () =>
  useAuthStore((s) => s.isAuthenticated);

/** Login action — call with a User object after verifying credentials. */
export const useLogin = () =>
  useAuthStore((s) => s.login);

/** Logout action — clears session and redirects to /login. */
export const useLogout = () =>
  useAuthStore((s) => s.logout);
