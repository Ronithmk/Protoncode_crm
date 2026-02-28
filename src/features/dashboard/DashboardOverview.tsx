// ============================================================
// features/dashboard/DashboardOverview.tsx
// Main dashboard with pipeline health, tasks, upcoming trials,
// lead source breakdown, and recent activity.
// ============================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import {
  StatCard, Card, StageBadge, Avatar, SectionLabel,
  ProgressBar, PriorityBadge, Button, SourceBadge,
} from "../../components/ui";
import { MOCK_LEADS, MOCK_TASKS, MOCK_TRIALS, LEAD_CHART_DATA } from "../../data/mockData";
import { useRole } from "../../store/useAuthStore";
import type { LifecycleStage } from "../../types/crm.types";

// ─── CONSTANTS ───────────────────────────────────────────
const LIFECYCLE_STAGES: LifecycleStage[] = [
  "Lead Created", "Call Handling", "Followup",
  "Trial Booked", "Trial Done", "Joined",
  "Membership Active", "Renewal",
];

const STAGE_ACCENT: Record<string, string> = {
  "Lead Created": "#6366f1", "Call Handling": "#f59e0b", "Followup": "#fbbf24",
  "Trial Booked": "#10b981", "Trial Done": "#34d399", "Joined": "#22c55e",
  "Membership Active": "#4ade80", "Renewal": "#f87171",
};

// ─── MINI BAR CHART ──────────────────────────────────────
const MiniBarChart = () => {
  const maxVal = Math.max(...LEAD_CHART_DATA.map(d => d.value));
  return (
    <div className="flex items-end gap-1.5 h-20">
      {LEAD_CHART_DATA.map((d, i) => {
        const isLast = i === LEAD_CHART_DATA.length - 1;
        return (
          <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col justify-end gap-0.5" style={{ height: 60 }}>
              {d.secondary !== undefined && (
                <div
                  className="w-full rounded-sm bg-emerald-500/40"
                  style={{ height: `${(d.secondary / maxVal) * 60}px` }}
                />
              )}
              <div
                className={cn("w-full rounded-sm transition-all", isLast ? "bg-indigo-500" : "bg-indigo-500/30")}
                style={{ height: `${(d.value / maxVal) * 60}px` }}
              />
            </div>
            <span className="text-[9px] text-slate-600">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
};

// ─── PIPELINE STAGE CARD ─────────────────────────────────
const PipelineStage = ({ stage, count, total, accent }: {
  stage: LifecycleStage; count: number; total: number; accent: string;
}) => (
  <div className="flex flex-col items-center gap-2 min-w-0">
    <div
      className="text-2xl font-bold tabular-nums leading-none"
      style={{ color: count > 0 ? accent : "#1e2f52" }}
    >
      {count}
    </div>
    <div className="w-full">
      <ProgressBar value={count} max={total} color={accent} />
    </div>
    <p className="text-[9px] text-slate-600 text-center leading-tight line-clamp-2">{stage}</p>
  </div>
);

// ─── TASK ROW ────────────────────────────────────────────
const TaskRow = ({
  task,
  onToggle,
}: {
  task: (typeof MOCK_TASKS)[0];
  onToggle: (id: string) => void;
}) => {
  const TYPE_ICONS: Record<string, string> = {
    call: "📞",
    followup: "↩",
    trial: "🥋",
    renewal: "↺",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 border-b border-theme last:border-0",
        "hover-theme transition-colors group"
      )}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className={cn(
          "w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors",

          task.done
            ? "bg-[var(--primary-color)] border-[var(--primary-color)] text-white"
            : "border-theme hover:border-[var(--primary-color)]"
        )}
      >
        {task.done && <span className="text-[9px]">✓</span>}
      </button>

      {/* Icon */}
      <span className="text-sm flex-shrink-0">
        {TYPE_ICONS[task.type]}
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-[13px] font-medium truncate",
            task.done
              ? "line-through text-muted"
              : "text-primary"
          )}
        >
          {task.title}
        </p>

        <p className="text-[11px] text-secondary truncate">
          {task.leadName} · {task.dueDate}
        </p>
      </div>

      <PriorityBadge priority={task.priority} />
    </div>
  );
};

// ─── TRIAL ROW ───────────────────────────────────────────
const TrialRow = ({
  trial,
}: {
  trial: (typeof MOCK_TRIALS)[0];
}) => {
  const STATUS_VARIANT: Record<
    string,
    "warning" | "success" | "neutral" | "danger"
  > = {
    scheduled: "warning",
    confirmed: "success",
    done: "neutral",
    cancelled: "danger",
    no_show: "danger",
  };

  const variant = STATUS_VARIANT[trial.status];

  const badgeClasses = {
    warning: "warning-bg warning-text warning-border",
    success: "success-bg success-text success-border",
    danger: "danger-bg danger-text danger-border",
    neutral: "bg-surface text-secondary border-theme",
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-theme last:border-0 hover-theme transition-colors">
      <Avatar name={trial.leadName} size={30} />

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-primary truncate">
          {trial.leadName}
        </p>

        <p className="text-[11px] text-secondary">
          {trial.batch} · {trial.time}
        </p>
      </div>

      <span
        className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize",
          badgeClasses[variant]
        )}
      >
        {trial.status.replace("_", " ")}
      </span>
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────
export const DashboardOverview = () => {
  const role = useRole();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(MOCK_TASKS);

  const totalLeads = MOCK_LEADS.length;
  const stageCounts = MOCK_LEADS.reduce<Record<string, number>>((acc, l) => {
    acc[l.stage] = (acc[l.stage] || 0) + 1;
    return acc;
  }, {});

  const todayTrials = MOCK_TRIALS.filter(t => t.date === "2025-02-28");
  const pendingTasks = tasks.filter(t => !t.done);
  const revenue = MOCK_LEADS.reduce((s, l) => s + (l.totalRevenue || 0), 0);

  const toggleTask = (id: string) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Leads"
          value={totalLeads}
          delta="12% vs last month"
          deltaType="up"
          accent="#818cf8"
          icon={<span className="text-lg">◈</span>}
        />
        <StatCard
          label="Trials Today"
          value={todayTrials.length}
          delta={`${todayTrials.filter(t => t.status === "confirmed").length} confirmed`}
          deltaType="neutral"
          accent="#34d399"
          icon={<span className="text-lg">🥋</span>}
        />
        <StatCard
          label="Active Members"
          value={stageCounts["Membership Active"] || 0}
          delta="2 joined this week"
          deltaType="up"
          accent="#4ade80"
          icon={<span className="text-lg">◎</span>}
        />
        <StatCard
          label="Revenue MTD"
          value={`₹${(revenue / 1000).toFixed(0)}K`}
          delta="18% vs last month"
          deltaType="up"
          accent="#fbbf24"
          icon={<span className="text-lg">₹</span>}
        />
      </div>

      {/* ── ROW 2: PIPELINE + CHART ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Pipeline */}
        <Card className="xl:col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <SectionLabel className="mb-0.5">Lifecycle Pipeline</SectionLabel>
              <p className="text-[13px] text-secondary">All stages across {totalLeads} leads</p>
            </div>
            <Button size="sm" onClick={() => navigate("/leads/pipeline")}>View Pipeline</Button>
          </div>
          <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
            {LIFECYCLE_STAGES.map(stage => (
              <PipelineStage
                key={stage}
                stage={stage}
                count={stageCounts[stage] || 0}
                total={totalLeads}
                accent={STAGE_ACCENT[stage]}
              />
            ))}
          </div>
        </Card>

        {/* Lead trend */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <SectionLabel className="mb-0.5">Lead Trend</SectionLabel>
              <p className="text-[13px] text-secondary">Leads vs Conversions</p>
            </div>
          </div>
          <MiniBarChart />
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[var(--primary-color)]" />
              <span className="text-[11px] text-secondary">Leads</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[var(--success-color)]" />
              <span className="text-[11px] text-secondary">Converted</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ── ROW 3: TASKS + TRIALS + SOURCES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* My Tasks */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between px-4 py-3.5 card-header">
            <div>
              <p className="text-[13px] font-semibold text-primary">My Tasks</p>
              <p className="text-[11px] text-secondary">{pendingTasks.length} pending</p>
            </div>
            <Button size="sm" onClick={() => navigate("/dashboard/tasks")}>All Tasks</Button>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[280px]">
            {tasks.slice(0, 5).map(task => (
              <TaskRow key={task.id} task={task} onToggle={toggleTask} />
            ))}
          </div>
        </Card>

        {/* Today's Trials */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between px-4 py-3.5 card-header">
            <div>
              <p className="text-[13px] font-semibold text-primary">Today's Trials</p>
              <p className="text-[11px] text-secondary">Feb 28, 2025</p>
            </div>
            <Button size="sm" onClick={() => navigate("/schedule/trials")}>Schedule</Button>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[280px]">
            {todayTrials.length > 0
              ? todayTrials.map(t => <TrialRow key={t.id} trial={t} />)
              : <div className="py-12 text-center text-secondary text-[13px]">No trials today</div>
            }
          </div>
        </Card>

        {/* Lead Sources */}
        <Card className="p-5">
          <SectionLabel>Lead Sources</SectionLabel>

          {(["Meta Ads", "WhatsApp", "Walk-in"] as const).map(source => {
            const count = MOCK_LEADS.filter(l => l.source === source).length;
            const pct = Math.round((count / totalLeads) * 100);

            const variantMap: Record<string, "primary" | "success" | "warning"> = {
              "Meta Ads": "primary",
              "WhatsApp": "success",
              "Walk-in": "warning",
            };

            return (
              <div key={source} className="mb-4 last:mb-0">
                <div className="flex items-center justify-between mb-1.5">
                  <SourceBadge source={source} />

                  <span className="text-[12px] font-semibold text-primary tabular-nums">
                    {count}{" "}
                    <span className="text-secondary font-normal">
                      ({pct}%)
                    </span>
                  </span>
                </div>

                <ProgressBar
                  value={count}
                  max={totalLeads}
                  variant={variantMap[source]}
                />
              </div>
            );
          })}

          <div className="mt-5 pt-4 border-t border-theme grid grid-cols-3 gap-2">
            {LIFECYCLE_STAGES
              .filter(s =>
                ["Trial Booked", "Membership Active", "Renewal"].includes(s)
              )
              .map(s => {
                const stageVariant: Record<string, "success" | "warning" | "danger"> = {
                  "Trial Booked": "warning",
                  "Membership Active": "success",
                  "Renewal": "danger",
                };

                const variant = stageVariant[s];

                const colorMap = {
                  success: "var(--success-color)",
                  warning: "var(--warning-color)",
                  danger: "var(--danger-color)",
                };

                return (
                  <div key={s} className="text-center">
                    <p
                      className="text-[20px] font-bold"
                      style={{ color: colorMap[variant] }}
                    >
                      {stageCounts[s] || 0}
                    </p>

                    <p className="text-[9px] text-secondary leading-tight">
                      {s}
                    </p>
                  </div>
                );
              })}
          </div>
        </Card>
      </div>

      {/* ── ROW 4: RECENT LEADS ── */}
      <Card>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-theme">
          <p className="text-[13px] font-semibold text-primary">
            Recent Leads
          </p>

          <Button
            size="sm"
            onClick={() => navigate("/leads")}
          >
            View All Leads
          </Button>
        </div>

        {/* Body */}
        <div className="divide-theme">
          {MOCK_LEADS.slice(0, 5).map(lead => (
            <div
              key={lead.id}
              onClick={() => navigate(`/leads/${lead.id}`)}
              className="flex items-center gap-4 px-5 py-3.5 hover-theme transition-colors cursor-pointer"
            >
              <Avatar name={lead.name} size={32} />

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-primary truncate">
                  {lead.name}
                </p>

                <p className="text-[11px] text-secondary">
                  {lead.phone}
                </p>
              </div>

              <SourceBadge source={lead.source} />

              <StageBadge stage={lead.stage} size="sm" />

              <div className="hidden sm:flex items-center gap-1.5">
                <Avatar name={lead.assignedTo} size={20} />
                <span className="text-[11px] text-secondary">
                  {lead.assignedTo}
                </span>
              </div>

              <span className="text-[11px] text-muted hidden md:block">
                {lead.lastActivity}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
