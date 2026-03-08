// ============================================================
// features/auth/LoginHeader.tsx
// Fixed top header shown on the login page.
// Contains: app brand (left), theme toggle + support (right).
// Exports useTheme hook so LoginPage can read the dark state.
// =========================================================

import { useThemeStore } from "../../store/useThemeStore";

// ─── ICONS ───────────────────────────────────────────────
const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const HelpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
);

// ─── COMPONENT ───────────────────────────────────────────
export const LoginHeader = () => {
  const { resolvedTheme, setTheme } = useThemeStore();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 backdrop-blur-xl border-b border-theme bg-surface"
      style={{ backdropFilter: "blur(12px)" }}
    >
      {/* LEFT */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm shadow-[0_0_16px_rgba(99,102,241,0.4)]">
          ⚔
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-[15px] font-800 text-primary tracking-tight">
            Proton<span className="text-indigo-500">CRM</span>
          </span>

          <span className="text-[10px] text-secondary tracking-widest uppercase hidden sm:block">
            Management
          </span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-1.5">
        {/* Support */}
        <a
          href="#support"
          title="Help & Support"
          onClick={(e) => e.preventDefault()}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary hover:text-primary hover-theme transition-all duration-150 border border-transparent hover:border-theme"
        >
          <HelpIcon />
        </a>

        {/* Divider */}
        <div className="w-px h-4 border-divider mx-1" />

        {/* Theme toggle */}
        <button
          type="button"
          onClick={() =>
            setTheme(resolvedTheme === "dark" ? "light" : "dark")
          }
          title={
            resolvedTheme === "dark"
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-600 text-secondary hover:text-primary hover-theme border border-transparent hover:border-theme transition-all duration-150"
        >
          {resolvedTheme === "dark" ? (
            <>
              <SunIcon />
              <span className="hidden sm:block">Light</span>
            </>
          ) : (
            <>
              <MoonIcon />
              <span className="hidden sm:block">Dark</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};