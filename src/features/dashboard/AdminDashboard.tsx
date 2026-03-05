// ============================================================
// features/dashboard/admin/AdminDashboard.tsx
// Full org overview for SUPER_ADMIN and ADMIN roles.
// Shows: pipeline health, revenue, all centres, team, leads.
// ============================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card, CardHeader, StatCard, Btn, Avatar, StageBadge,
  ProgressBar, MiniBarChart, TaskRow, TrialRow, EmptyRow,
  STAGE_COLORS, ROLE_COLORS, LIFECYCLE_STAGES,
} from "./shared/DashboardPrimitives";
import {
  MOCK_LEADS, MOCK_TASKS, MOCK_TRIALS, MOCK_USERS, LEAD_CHART_DATA,
} from "../../data/mockData";
import { useUser } from "../../store/useAuthStore";

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = useUser();
  const [tasks, setTasks] = useState(MOCK_TASKS);

  // ── Derived data ─────────────────────────────────────────
  const totalLeads = MOCK_LEADS.length;
  const stageCounts = MOCK_LEADS.reduce<Record<string, number>>((acc, l) => {
    acc[l.stage] = (acc[l.stage] || 0) + 1;
    return acc;
  }, {});
  const todayTrials = MOCK_TRIALS.filter((t) => t.date === "2025-02-28");
  const revenue = MOCK_LEADS.reduce((s, l) => s + (l.totalRevenue || 0), 0);
  const activeMembers =
    (stageCounts["Membership Active"] || 0) + (stageCounts["Joined"] || 0);
  const pendingTasks = tasks.filter((t) => !t.done).length;

  const toggleTask = (id: string) =>
    setTasks((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  // ── Centre breakdown ──────────────────────────────────────
  const centreData = ["Koramangala", "Indiranagar", "Whitefield"].map((c) => ({
    name: c,
    leads: MOCK_LEADS.filter((l) => l.center === c).length,
    active: MOCK_LEADS.filter((l) => l.center === c && l.stage === "Membership Active").length,
  }));

  const SOURCE_COLORS: Record<string, string> = {
    "Meta Ads": "#818cf8",
    WhatsApp: "#22c55e",
    "Walk-in": "#f59e0b",
  };

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      {/* ── Greeting ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-800 text-primary">
            Good morning, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-[13px] text-secondary mt-0.5">
            Here's what's happening across all centres today.
          </p>
        </div>
        <Btn variant="pri" onClick={() => navigate("/reports")}>
          View Full Reports →
        </Btn>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={totalLeads} delta="12%" deltaUp icon="◈" accent="#818cf8" />
        <StatCard label="Revenue MTD" value={`₹${(revenue / 1000).toFixed(0)}K`} delta="18%" deltaUp icon="₹" accent="#f59e0b" />
        <StatCard label="Active Members" value={activeMembers} delta="2 new" deltaUp icon="◎" accent="#22c55e" />
        <StatCard
          label="Trials Today"
          value={todayTrials.length}
          delta={`${todayTrials.filter((t) => t.status === "confirmed").length} confirmed`}
          deltaUp
          icon="🥋"
          accent="#10b981"
        />
      </div>

      {/* ── Pipeline + Trend ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Lifecycle Pipeline"
            sub={`${totalLeads} leads across all stages`}
            action={<Btn onClick={() => navigate("/leads/pipeline")}>View Pipeline</Btn>}
          />
          <div className="p-5 grid grid-cols-4 lg:grid-cols-8 gap-3">
            {LIFECYCLE_STAGES.map((stage) => {
              const count = stageCounts[stage] || 0;
              const color = STAGE_COLORS[stage];
              return (
                <div key={stage} className="flex flex-col items-stretch gap-2">
                  <span
                    className="text-[22px] font-800 tabular-nums text-center"
                    style={{ color: count > 0 ? color : "var(--border-color)" }}
                  >
                    {count}
                  </span>
                  <ProgressBar value={count} max={totalLeads} color={color} />
                  <span className="text-[9px] text-secondary text-center leading-tight">
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader title="Lead Trend" sub="Leads vs Conversions" />
          <div className="p-5">
            <MiniBarChart data={LEAD_CHART_DATA} />
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: "var(--primary-color)" }} />
                <span className="text-[11px] text-secondary">Leads</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: "var(--success-color)", opacity: 0.5 }} />
                <span className="text-[11px] text-secondary">Converted</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Centres + Tasks + Trials ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="Centres" sub="Leads & active members" />
          <div className="p-5 space-y-4">
            {centreData.map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-600 text-primary">{c.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] text-secondary">{c.leads} leads</span>
                    <span className="text-[12px] font-600" style={{ color: "var(--success-color)" }}>
                      {c.active} active
                    </span>
                  </div>
                </div>
                <ProgressBar value={c.leads} max={totalLeads} color="var(--primary-color)" />
              </div>
            ))}
            <div className="pt-4 border-t border-theme">
              <p className="text-[11px] font-700 text-secondary uppercase tracking-wider mb-3">
                Lead Sources
              </p>
              {(["Meta Ads", "WhatsApp", "Walk-in"] as const).map((src) => {
                const cnt = MOCK_LEADS.filter((l) => l.source === src).length;
                return (
                  <div key={src} className="flex items-center justify-between mb-2">
                    <span className="text-[12px] text-secondary">{src}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20">
                        <ProgressBar value={cnt} max={totalLeads} color={SOURCE_COLORS[src]} />
                      </div>
                      <span className="text-[12px] font-600 text-primary w-4 text-right">{cnt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHeader
            title="All Pending Tasks"
            sub={`${pendingTasks} tasks`}
            action={<Btn onClick={() => navigate("/dashboard/tasks")}>All</Btn>}
          />
          <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ maxHeight: 300 }}>
            {tasks.slice(0, 5).length > 0
              ? tasks.slice(0, 5).map((t) => <TaskRow key={t.id} task={t} onToggle={toggleTask} />)
              : <EmptyRow message="No tasks" />}
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHeader
            title="Today's Trials"
            sub="Feb 28, 2025"
            action={<Btn onClick={() => navigate("/schedule/trials")}>Schedule</Btn>}
          />
          <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ maxHeight: 300 }}>
            {todayTrials.length > 0
              ? todayTrials.map((t) => <TrialRow key={t.id} trial={t} />)
              : <EmptyRow message="No trials today" />}
          </div>
        </Card>
      </div>

      {/* ── Team + Recent Leads ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader
            title="Team"
            sub="Active staff members"
            action={<Btn onClick={() => navigate("/users")}>Manage</Btn>}
          />
          <div className="divide-theme">
            {MOCK_USERS.filter((u) => u.status === "active")
              .slice(0, 5)
              .map((u) => (
                <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover-theme transition-colors">
                  <Avatar name={u.name} size={30} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-600 text-primary truncate">{u.name}</p>
                    <p className="text-[11px] text-secondary">{u.center}</p>
                  </div>
                  <span
                    className="text-[10px] font-700 px-2 py-0.5 rounded-full"
                    style={{ background: `${ROLE_COLORS[u.role]}15`, color: ROLE_COLORS[u.role] }}
                  >
                    {u.role.replace("_", " ")}
                  </span>
                </div>
              ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent Leads"
            action={<Btn onClick={() => navigate("/leads")}>View All</Btn>}
          />
          <div className="divide-theme">
            {MOCK_LEADS.slice(0, 5).map((l) => (
              <div
                key={l.id}
                onClick={() => navigate(`/leads/${l.id}`)}
                className="flex items-center gap-3 px-5 py-3 hover-theme transition-colors cursor-pointer"
              >
                <Avatar name={l.name} size={30} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-600 text-primary truncate">{l.name}</p>
                  <p className="text-[11px] text-secondary">{l.phone}</p>
                </div>
                <StageBadge stage={l.stage} />
                <div className="hidden sm:flex items-center gap-1.5">
                  <Avatar name={l.assignedTo} size={20} />
                  <span className="text-[11px] text-secondary">{l.assignedTo}</span>
                </div>
                <span className="text-[11px] text-secondary hidden md:block">{l.lastActivity}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
