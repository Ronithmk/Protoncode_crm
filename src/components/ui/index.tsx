// ============================================================
// components/ui/index.tsx
// Shared primitives: Badge, Avatar, StatCard, PageHeader,
// EmptyState, Spinner, Modal, Select, Input, Textarea, Button
// ============================================================

import { cn } from "../../utils/cn";
import type { LifecycleStage, LeadSource } from "../../types/crm.types";
import {
  STAGE_CONFIG, SOURCE_CONFIG, ROLE_BADGE_COLORS,
} from "./ui.config";

// ─── BADGE ────────────────────────────────────────────────
type StageBadgeProps = { stage: LifecycleStage; size?: "sm" | "md" };
export const StageBadge = ({ stage, size = "md" }: StageBadgeProps) => {
  const cfg = STAGE_CONFIG[stage];
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 font-semibold rounded-full border",
      cfg.bg, cfg.text, cfg.border,
      size === "sm" ? "text-[10px] px-2 py-0.5" : "text-[11px] px-2.5 py-1",
    )}>
      <span className={cn("rounded-full flex-shrink-0", cfg.text.replace("text-", "bg-"), size === "sm" ? "w-1 h-1" : "w-1.5 h-1.5")} />
      {stage}
    </span>
  );
};

// ─── SOURCE BADGE ─────────────────────────────────────────
export const SourceBadge = ({ source }: { source: LeadSource }) => {
  const cfg = SOURCE_CONFIG[source];

  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-surface border border-theme rounded-md px-2 py-0.5">
      <span className={cfg.color}>{cfg.icon}</span>
      <span className="text-secondary">
        {source}
      </span>
    </span>
  );
};

// ─── AVATAR ───────────────────────────────────────────────
const AVATAR_COLORS = [
  "from-indigo-500/40 to-violet-500/40 border-indigo-500/30 text-indigo-300",
  "from-emerald-500/40 to-teal-500/40 border-emerald-500/30 text-emerald-300",
  "from-amber-500/40 to-orange-500/40 border-amber-500/30 text-amber-300",
  "from-pink-500/40 to-rose-500/40 border-pink-500/30 text-pink-300",
  "from-blue-500/40 to-cyan-500/40 border-blue-500/30 text-blue-300",
];

type AvatarProps = { name: string; size?: number; className?: string };
export const Avatar = ({ name, size = 32, className }: AvatarProps) => {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  //const sz = `w-[${size}px] h-[${size}px]`;
  return (
    <div
      className={cn("rounded-full bg-gradient-to-br border flex items-center justify-center font-bold flex-shrink-0", color, className)}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
};

// ─── STAT CARD ────────────────────────────────────────────
type StatCardProps = {
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  accent?: string;
  className?: string;
};
export const StatCard = ({ label, value, delta, deltaType = "up", icon, accent, className }: StatCardProps) => (
  <div className={cn(
    "bg-card border border-theme rounded-xl p-5 flex flex-col gap-3",
    "hover:border-[var(--primary-color)] transition-colors duration-200 group",
    className
  )}>
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">{label}</span>
      {icon && <div className="text-muted group-hover:text-theme transition-colors">{icon}</div>}
    </div>
    <div className="flex items-end justify-between gap-2">
       <span
        className="text-[28px] font-bold tracking-tight tabular-nums leading-none text-primary"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </span>

      {delta && (
        <span
          className={cn(
            "text-[11px] font-semibold px-2 py-0.5 rounded-full mb-1 border",
            deltaType === "up" && "success-bg success-text success-border",
            deltaType === "down" && "danger-bg danger-text danger-border",
            deltaType === "neutral" && "bg-surface text-secondary border-theme"
          )}
        >
          {deltaType === "up"
            ? "↑"
            : deltaType === "down"
            ? "↓"
            : ""}{" "}
          {delta}
        </span>
      )}
    </div>
  </div>
);

// ─── PAGE HEADER ──────────────────────────────────────────
type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};
export const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => (
  <div className="flex items-start justify-between mb-6 gap-4">
    <div>
      <h1 className="text-[20px] font-bold text-theme tracking-tight">{title}</h1>
      {subtitle && <p className="text-[13px] text-muted mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
  </div>
);

// ─── BUTTON ───────────────────────────────────────────────
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};
export const Button = ({
  variant = "secondary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) => (
  <button
    {...props}
    className={cn(
      "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:pointer-events-none",

      variant === "primary" &&
        "bg-[var(--primary-color)] text-white hover:opacity-90",

      variant === "secondary" &&
        "bg-surface border border-theme text-theme hover-theme",

      variant === "ghost" &&
        "text-muted hover:text-theme hover-theme",

      variant === "danger" &&
        "danger-bg danger-text border danger-border hover:opacity-90",

      size === "sm" && "text-[12px] px-3 py-1.5",
      size === "md" && "text-[13px] px-4 py-2",
      size === "lg" && "text-[14px] px-5 py-2.5",

      className
    )}
  >
    {children}
  </button>
);

// ─── INPUT ────────────────────────────────────────────────
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = ({
  label,
  error,
  className,
  ...props
}: InputProps) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-[12px] font-medium text-secondary">
        {label}
      </label>
    )}

    <input
      {...props}
      className={cn(
        "bg-surface border border-theme rounded-lg px-3 py-2 text-[13px] text-primary",
        "placeholder:text-secondary outline-none",
        "focus:border-[var(--primary-color)]",
        "transition-colors duration-150",

        error && "danger-border focus:border-[var(--danger-color)]",

        className
      )}
    />

    {error && (
      <span className="text-[11px] danger-text">
        {error}
      </span>
    )}
  </div>
);

// ─── SELECT ───────────────────────────────────────────────
type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string };
export const Select = ({ label, className, children, ...props }: SelectProps) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-[12px] font-medium text-slate-400">{label}</label>}
    <select
      {...props}
      className={cn(
        "bg-surface border border-theme rounded-lg px-3 py-2 text-[13px] text-theme",
        "outline-none focus:border-[var(--primary-color)] transition-colors cursor-pointer",
        className
      )}
    >
      {children}
    </select>
  </div>
);

// ─── CARD ────────────────────────────────────────────────
type CardProps = { className?: string; children: React.ReactNode; hover?: boolean };
export const Card = ({ className, children, hover }: CardProps) => (
  <div className={cn(
    "bg-card border border-theme rounded-xl",
    hover && "hover:border-[var(--primary-color)] transition-colors cursor-pointer",
    className
  )}>
    {children}
  </div>
);

// ─── SECTION HEADING ──────────────────────────────────────
export const SectionLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn("text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3", className)}>
    {children}
  </p>
);

// ─── EMPTY STATE ──────────────────────────────────────────
export const EmptyState = ({ icon, title, description }: { icon: string; title: string; description?: string }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
    <span className="text-4xl opacity-30">{icon}</span>
    <p className="text-[14px] font-semibold text-slate-400">{title}</p>
    {description && <p className="text-[12px] text-slate-600 max-w-xs">{description}</p>}
  </div>
);

// ─── MODAL ────────────────────────────────────────────────
type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
};
export const Modal = ({ open, onClose, title, children, width = "max-w-lg" }: ModalProps) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-card border border-theme rounded-2xl w-full shadow-2xl",
          width
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme">
          <h2 className="text-[15px] font-bold text-primary">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="text-secondary hover:text-primary transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// ─── DIVIDER ─────────────────────────────────────────────
export const Divider = ({ className }: { className?: string }) => (
  <div className={cn("h-px border-divider", className)} />
);

// ─── PRIORITY BADGE ──────────────────────────────────────
export const PriorityBadge = ({ priority }: { priority: "high" | "medium" | "low" }) => (
  <span className={cn(
    "inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border",
    priority === "high"   && "danger-bg danger-text danger-border",
    priority === "medium" && "warning-bg warning-text warning-border",
    priority === "low"    && "bg-surface text-muted border-theme",
  )}>
    {priority}
  </span>
);

// ─── STATUS DOT ──────────────────────────────────────────
export const StatusDot = ({ status }: { status: "active" | "inactive" | "pending" }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className={cn(
      "w-1.5 h-1.5 rounded-full",
      status === "active" && "bg-[var(--success-color)]",
      status === "inactive" && "bg-[var(--text-secondary)]",
      status === "pending" && "bg-[var(--warning-color)]"
    )} />
    <span className={cn(
      "text-[11px] font-medium capitalize",
      status === "active"  && "text-[var(--success-color)]",
      status === "inactive"&& "text-[var(--text-secondary)]",
      status === "pending" && "text-[var(--warning-color)]",
    )}>
      {status}
    </span>
  </span>
);

export const RoleBadge = ({ role }: { role: string }) => (
  <span className={cn("inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border", ROLE_BADGE_COLORS[role] || "bg-slate-500/10 text-slate-400 border-slate-500/20")}>
    {role.replace("_", " ")}
  </span>
);

// ─── PROGRESS BAR ────────────────────────────────────────
type ProgressBarProps = {
  value: number;
  max?: number;
  variant?: "primary" | "success" | "warning" | "danger";
  color?: string; // optional override
  className?: string;
};

export const ProgressBar = ({
  value,
  max = 100,
  variant = "primary",
  color,
  className,
}: ProgressBarProps) => {
  const percentage = Math.min(100, (value / max) * 100);

  const variantColor = {
    primary: "var(--primary-color)",
    success: "var(--success-color)",
    warning: "var(--warning-color)",
    danger: "var(--danger-color)",
  }[variant];

  return (
    <div
      className={cn(
        "h-1.5 rounded-full bg-surface border border-theme overflow-hidden",
        className
      )}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${percentage}%`,
          background: color || variantColor,
        }}
      />
    </div>
  );
};

// ─── TABLE COMPONENTS ────────────────────────────────────
export const Table = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("w-full overflow-x-auto", className)}>
    <table className="w-full border-collapse">{children}</table>
  </div>
);

export const Th = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <th className={cn("text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 bg-surface first:rounded-tl-lg last:rounded-tr-lg", className)}>
    {children}
  </th>
);

export const Td = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <td className={cn("px-4 py-3 text-[13px] border-b border-theme", className)}>{children}</td>
);

export const Tr = ({ children, onClick, className }: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => (
  <tr
    onClick={onClick}
    className={cn(
      "transition-colors duration-100",
      onClick && "cursor-pointer hover-theme",
      className
    )}
  >
    {children}
  </tr>
);
