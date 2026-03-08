// ============================================================
// features/dashboard/shared/DashboardPrimitives.tsx
// Shared UI components used across all role-specific dashboards.
// Import from here — never duplicate in individual dashboards.
// ============================================================

import { cn } from "../../../utils/cn";
import { MOCK_TASKS, MOCK_TRIALS } from "../../../data/mockData";

// ─── CARD ────────────────────────────────────────────────
export const Card = ({
  children, className = "", onClick,
}: {
  children: React.ReactNode; className?: string; onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className={cn(
      "bg-card border border-theme rounded-2xl overflow-hidden",
      onClick && "cursor-pointer",
      className,
    )}
  >
    {children}
  </div>
);

// ─── CARD HEADER ─────────────────────────────────────────
export const CardHeader = ({
  title, sub, action,
}: {
  title: string; sub?: string; action?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between px-5 py-4 card-header">
    <div>
      <p className="text-[14px] font-700 text-primary">{title}</p>
      {sub && <p className="text-[12px] text-secondary mt-0.5">{sub}</p>}
    </div>
    {action}
  </div>
);

// ─── STAT CARD ───────────────────────────────────────────
export const StatCard = ({
  label, value, delta, deltaUp, accent, icon,
}: {
  label: string;
  value: string | number;
  delta?: string;
  deltaUp?: boolean;
  accent: string;
  icon: string;
}) => (
  <Card className="p-5">
    <div className="flex items-start justify-between mb-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: `${accent}15`, color: accent }}
      >
        {icon}
      </div>
      {delta && (
        <span
          className="text-[11px] font-700 px-2 py-0.5 rounded-full"
          style={{
            background: deltaUp ? "var(--success-bg)" : "var(--danger-bg)",
            color: deltaUp ? "var(--success-color)" : "var(--danger-color)",
          }}
        >
          {deltaUp ? "↑" : "↓"} {delta}
        </span>
      )}
    </div>
    <p className="text-[26px] font-800 text-primary tabular-nums leading-none mb-1.5">
      {value}
    </p>
    <p className="text-[12px] text-secondary font-500">{label}</p>
  </Card>
);

// ─── BUTTON ──────────────────────────────────────────────
export const Btn = ({
  children, onClick, variant = "sec", size = "sm",
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  variant?: "pri" | "sec" | "ghost";
  size?: "sm" | "md";
}) => {
  const base =
    "inline-flex items-center gap-1.5 font-600 rounded-lg transition-all duration-150 cursor-pointer border";
  const sz = size === "sm" ? "text-[12px] px-3 py-1.5" : "text-[13px] px-4 py-2";
  const variants = {
    pri: "bg-[var(--primary-color)] text-white border-transparent hover:opacity-90",
    sec: "bg-card text-secondary border-theme hover-theme hover:text-primary",
    ghost: "bg-transparent border-transparent text-secondary hover-theme hover:text-primary",
  };
  return (
    <button onClick={onClick} className={cn(base, sz, variants[variant])}>
      {children}
    </button>
  );
};

// ─── AVATAR ──────────────────────────────────────────────
export const Avatar = ({ name, size = 32 }: { name: string; size?: number }) => {
  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#3b82f6", "#8b5cf6"];
  const color = COLORS[name.charCodeAt(0) % COLORS.length];
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center font-700 flex-shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
        background: `${color}20`,
        color,
        border: `1.5px solid ${color}30`,
      }}
    >
      {initials}
    </div>
  );
};

// ─── STAGE BADGE ─────────────────────────────────────────
export const StageBadge = ({ stage }: { stage: string }) => {
  const MAP: Record<string, { text: string; bg: string }> = {
    "Lead Created":      { text: "#818cf8", bg: "rgba(129,140,248,0.1)" },
    "Call Handling":     { text: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    "Followup":          { text: "#fcd34d", bg: "rgba(252,211,77,0.1)" },
    "Trial Booked":      { text: "#10b981", bg: "rgba(16,185,129,0.1)" },
    "Trial Done":        { text: "#34d399", bg: "rgba(52,211,153,0.1)" },
    "Joined":            { text: "#22c55e", bg: "rgba(34,197,94,0.1)" },
    "Membership Active": { text: "#4ade80", bg: "rgba(74,222,128,0.1)" },
    "Renewal":           { text: "#f87171", bg: "rgba(248,113,113,0.1)" },
  };
  const cfg = MAP[stage] || { text: "var(--text-secondary)", bg: "rgba(0,0,0,0.05)" };
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-600 px-2.5 py-0.5 rounded-full"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: cfg.text }}
      />
      {stage}
    </span>
  );
};

// ─── PROGRESS BAR ────────────────────────────────────────
export const ProgressBar = ({
  value, max, color,
}: {
  value: number; max: number; color: string;
}) => (
  <div className="h-1.5 rounded-full bg-base overflow-hidden">
    <div
      className="h-full rounded-full transition-all duration-500"
      style={{ width: `${Math.min(100, (value / Math.max(max, 1)) * 100)}%`, background: color }}
    />
  </div>
);

// ─── MINI BAR CHART ──────────────────────────────────────
export const MiniBarChart = ({
  data,
  color = "var(--primary-color)",
}: {
  data: { label: string; value: number; secondary?: number }[];
  color?: string;
}) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5" style={{ height: 80 }}>
      {data.map((d, i) => {
        const isLast = i === data.length - 1;
        return (
          <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full flex flex-col justify-end gap-px"
              style={{ height: 64 }}
            >
              {d.secondary !== undefined && (
                <div
                  className="w-full rounded-t-sm"
                  style={{
                    height: `${(d.secondary / max) * 64}px`,
                    background: "var(--success-bg)",
                    border: "1px solid var(--success-color)",
                    borderBottom: "none",
                    opacity: 0.7,
                  }}
                />
              )}
              <div
                className="w-full rounded-t-sm transition-all"
                style={{
                  height: `${((d.value - (d.secondary ?? 0)) / max) * 64}px`,
                  background: isLast ? color : `${color}35`,
                }}
              />
            </div>
            <span className="text-[9px] text-secondary">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
};

// ─── EMPTY STATE ─────────────────────────────────────────
export const EmptyRow = ({ message }: { message: string }) => (
  <div className="py-10 text-center text-secondary text-[13px]">{message}</div>
);

// ─── TASK ROW ────────────────────────────────────────────
export const TaskRow = ({
  task,
  onToggle,
}: {
  task: (typeof MOCK_TASKS)[0];
  onToggle: (id: string) => void;
}) => {
  const ICONS: Record<string, string> = {
    call: "📞", followup: "↩", trial: "🥋", renewal: "↺",
  };
  const PRIORITY: Record<string, string> = {
    high: "var(--danger-color)",
    medium: "var(--warning-color)",
    low: "var(--text-secondary)",
  };
  return (
    <div className="flex items-center gap-3 px-5 py-3 border-b border-theme last:border-0 hover-theme transition-colors">
      <button
        onClick={() => onToggle(task.id)}
        className="w-4 h-4 rounded border border-theme flex-shrink-0 flex items-center justify-center transition-colors"
        style={
          task.done
            ? { background: "var(--primary-color)", borderColor: "var(--primary-color)" }
            : {}
        }
      >
        {task.done && <span className="text-white text-[9px]">✓</span>}
      </button>
      <span className="text-sm flex-shrink-0">{ICONS[task.type]}</span>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-[13px] font-500 truncate text-primary",
            task.done && "line-through text-secondary",
          )}
        >
          {task.title}
        </p>
        <p className="text-[11px] text-secondary truncate">
          {task.leadName} · {task.dueDate}
        </p>
      </div>
      <span
        className="text-[10px] font-700 uppercase"
        style={{ color: PRIORITY[task.priority] }}
      >
        {task.priority}
      </span>
    </div>
  );
};

// ─── TRIAL ROW ───────────────────────────────────────────
export const TrialRow = ({ trial }: { trial: (typeof MOCK_TRIALS)[0] }) => {
  const STATUS: Record<string, { text: string; bg: string }> = {
    scheduled: { text: "var(--warning-color)",  bg: "var(--warning-bg)" },
    confirmed:  { text: "var(--success-color)", bg: "var(--success-bg)" },
    done:       { text: "var(--text-secondary)", bg: "rgba(0,0,0,0.05)" },
    cancelled:  { text: "var(--danger-color)",  bg: "var(--danger-bg)" },
    no_show:    { text: "var(--danger-color)",  bg: "var(--danger-bg)" },
  };
  const s = STATUS[trial.status] || STATUS.scheduled;
  return (
    <div className="flex items-center gap-3 px-5 py-3 border-b border-theme last:border-0 hover-theme transition-colors">
      <Avatar name={trial.leadName} size={30} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-600 text-primary truncate">{trial.leadName}</p>
        <p className="text-[11px] text-secondary">
          {trial.batch} · {trial.time}
        </p>
      </div>
      <span
        className="text-[10px] font-700 px-2 py-0.5 rounded-full capitalize"
        style={{ background: s.bg, color: s.text }}
      >
        {trial.status.replace("_", " ")}
      </span>
    </div>
  );
};

// ─── STAGE COLOURS (shared constant) ─────────────────────
export const STAGE_COLORS: Record<string, string> = {
  "Lead Created":      "#818cf8",
  "Call Handling":     "#f59e0b",
  "Followup":          "#fcd34d",
  "Trial Booked":      "#10b981",
  "Trial Done":        "#34d399",
  "Joined":            "#22c55e",
  "Membership Active": "#4ade80",
  "Renewal":           "#f87171",
} as const;

export const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN:      "#818cf8",
  ADMIN:            "#a78bfa",
  RM:               "#22c55e",
  FM:               "#f59e0b",
  TRAINING_MANAGER: "#ec4899",
  HR:               "#94a3b8",
} as const;

export const LIFECYCLE_STAGES = [
  "Lead Created", "Call Handling", "Followup", "Trial Booked",
  "Trial Done", "Joined", "Membership Active", "Renewal",
] as const;
