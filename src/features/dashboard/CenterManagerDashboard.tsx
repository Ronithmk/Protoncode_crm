// ============================================================
// features/dashboard/center_manager/CenterManagerDashboard.tsx
// Centre Manager dashboard.
// Scoped to their own centre — sees everything for that centre:
// leads, schedule, renewals, revenue, staff headcount, trials.
// ============================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card, CardHeader, StatCard, Btn, Avatar, StageBadge,
  ProgressBar, MiniBarChart, TaskRow, TrialRow, EmptyRow,
  STAGE_COLORS, LIFECYCLE_STAGES,
} from "./shared/DashboardPrimitives";
import { MOCK_LEADS, MOCK_TASKS, MOCK_TRIALS, MOCK_USERS, LEAD_CHART_DATA } from "../../data/mockData";
import { useUser } from "../../store/useAuthStore";

export const CenterManagerDashboard = () => {
  const navigate = useNavigate();
  const user = useUser();

  // ── Scope everything to this manager's centre ─────────────
  const myCenter = user?.center ?? "Koramangala";
  const centerLeads = MOCK_LEADS.filter((l) => l.center === myCenter);
  const centerStaff = MOCK_USERS.filter((u) => u.center === myCenter || u.center === "All");
  const centerTrialsToday = MOCK_TRIALS.filter(
    (t) => t.date === "2025-02-28" && centerLeads.some((l) => l.id === t.leadId),
  );

  const [tasks, setTasks] = useState(MOCK_TASKS);
  const toggleTask = (id: string) =>
    setTasks((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  // ── Derived metrics ───────────────────────────────────────
  const totalLeads = centerLeads.length;
  const renewalLeads = centerLeads.filter((l) => l.stage === "Renewal");
  const activeMembers = centerLeads.filter((l) =>
    ["Membership Active", "Joined"].includes(l.stage),
  );
  const revenue = centerLeads.reduce((s, l) => s + (l.totalRevenue || 0), 0);
  const pendingTasks = tasks.filter((t) => !t.done).length;

  const stageCounts = centerLeads.reduce<Record<string, number>>((acc, l) => {
    acc[l.stage] = (acc[l.stage] || 0) + 1;
    return acc;
  }, {});

  // ── RM performance within centre ─────────────────────────
  const centreRMs = [...new Set(centerLeads.map((l) => l.assignedTo))];
  const rmPerf = centreRMs.map((rm) => {
    const rmLeads = centerLeads.filter((l) => l.assignedTo === rm);
    const converted = rmLeads.filter((l) =>
      ["Joined", "Membership Active", "Renewal"].includes(l.stage),
    ).length;
    return { name: rm, leads: rmLeads.length, converted, rate: rmLeads.length > 0 ? Math.round((converted / rmLeads.length) * 100) : 0 };
  });

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      {/* ── Greeting ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-800 text-primary">
            Good morning, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-[13px] text-secondary mt-0.5">
            {myCenter} Centre · {renewalLeads.length} renewals pending · {centerTrialsToday.length} trials today
          </p>
        </div>
        <div className="flex gap-2">
          <Btn onClick={() => navigate("/leads")}>All Leads</Btn>
          <Btn variant="pri" onClick={() => navigate("/reports")}>Reports →</Btn>
        </div>
      </div>

      {/* ── Centre Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Centre Leads"    value={totalLeads}          delta="This month" deltaUp icon="◈" accent="#818cf8" />
        <StatCard label="Active Members"  value={activeMembers.length} delta="2 new"     deltaUp icon="◎" accent="#22c55e" />
        <StatCard label="Revenue MTD"     value={`₹${(revenue / 1000).toFixed(0)}K`} delta="12%" deltaUp icon="₹" accent="#f59e0b" />
        <StatCard label="Renewals Due"    value={renewalLeads.length}                         icon="↺" accent="#f87171" />
      </div>

      {/* ── Pipeline + Trend ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Centre Pipeline"
            sub={`${totalLeads} leads in ${myCenter}`}
            action={<Btn onClick={() => navigate("/leads/pipeline")}>Pipeline View</Btn>}
          />
          <div className="p-5 space-y-3">
            {LIFECYCLE_STAGES.map((stage) => {
              const cnt = stageCounts[stage] || 0;
              return (
                <div key={stage} className="flex items-center gap-3">
                  <span className="text-[12px] text-secondary w-[130px] flex-shrink-0">{stage}</span>
                  <div className="flex-1">
                    <ProgressBar value={cnt} max={Math.max(totalLeads, 1)} color={STAGE_COLORS[stage]} />
                  </div>
                  <span className="text-[13px] font-700 text-primary w-4 text-right tabular-nums">{cnt}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader title="Lead Trend" sub={`${myCenter} this year`} />
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

      {/* ── RM Performance + Trials + Tasks ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* RM Performance */}
        <Card>
          <CardHeader title="RM Performance" sub={`${myCenter} team`} action={<Btn onClick={() => navigate("/users")}>Staff</Btn>} />
          <div className="p-5 space-y-4">
            {rmPerf.length > 0 ? rmPerf.map((rm) => (
              <div key={rm.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Avatar name={rm.name} size={24} />
                    <span className="text-[13px] font-500 text-primary">{rm.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[12px] font-700 text-primary">{rm.converted}/{rm.leads}</span>
                    <span className="text-[11px] text-secondary block">{rm.rate}% conv.</span>
                  </div>
                </div>
                <ProgressBar value={rm.converted} max={Math.max(rm.leads, 1)} color="var(--success-color)" />
              </div>
            )) : <EmptyRow message="No RM data" />}

            {/* Centre staff count */}
            <div className="pt-4 border-t border-theme">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-secondary">Staff at {myCenter}</span>
                <span className="text-[13px] font-700 text-primary">{centerStaff.length} members</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Today's Trials */}
        <Card className="flex flex-col">
          <CardHeader
            title="Today's Trials"
            sub={`${myCenter} · Feb 28`}
            action={<Btn onClick={() => navigate("/schedule/trials")}>Schedule</Btn>}
          />
          <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ maxHeight: 300 }}>
            {centerTrialsToday.length > 0
              ? centerTrialsToday.map((t) => <TrialRow key={t.id} trial={t} />)
              : <EmptyRow message="No trials today" />}
          </div>
        </Card>

        {/* Tasks */}
        <Card className="flex flex-col">
          <CardHeader
            title="Pending Tasks"
            sub={`${pendingTasks} open`}
            action={<Btn onClick={() => navigate("/dashboard/tasks")}>All</Btn>}
          />
          <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ maxHeight: 300 }}>
            {tasks.slice(0, 5).map((t) => <TaskRow key={t.id} task={t} onToggle={toggleTask} />)}
          </div>
        </Card>
      </div>

      {/* ── Renewals Due ── */}
      <Card>
        <CardHeader
          title="Renewals Due"
          sub={`${renewalLeads.length} members at ${myCenter}`}
          action={<Btn variant="pri" onClick={() => navigate("/renewals")}>All Renewals</Btn>}
        />
        <div className="divide-theme">
          {renewalLeads.length > 0 ? renewalLeads.map((l) => (
            <div
              key={l.id}
              onClick={() => navigate(`/leads/${l.id}`)}
              className="flex items-center gap-3 px-5 py-3.5 hover-theme transition-colors cursor-pointer"
            >
              <Avatar name={l.name} size={32} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-600 text-primary truncate">{l.name}</p>
                <p className="text-[11px] text-secondary">{l.membershipPlan} · {l.phone}</p>
              </div>
              <span className="text-[13px] font-700 text-primary">₹{l.totalRevenue?.toLocaleString("en-IN")}</span>
              <div className="flex gap-2">
                <Btn>Remind</Btn>
                <Btn variant="pri">Renew</Btn>
              </div>
            </div>
          )) : <EmptyRow message="No renewals pending" />}
        </div>
      </Card>

      {/* ── Recent Centre Leads ── */}
      <Card>
        <CardHeader
          title={`${myCenter} Leads`}
          action={<Btn onClick={() => navigate("/leads")}>View All</Btn>}
        />
        <div className="divide-theme">
          {centerLeads.slice(0, 5).map((l) => (
            <div
              key={l.id}
              onClick={() => navigate(`/leads/${l.id}`)}
              className="flex items-center gap-3 px-5 py-3.5 hover-theme transition-colors cursor-pointer"
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
  );
};
