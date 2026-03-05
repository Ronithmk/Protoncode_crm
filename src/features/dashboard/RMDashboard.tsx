// ============================================================
// features/dashboard/rm/RMDashboard.tsx
// Relationship Manager dashboard.
// Shows: my leads only, my tasks, pending calls/follow-ups,
//        hot leads, personal pipeline breakdown, my trials today.
// ============================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card, CardHeader, StatCard, Btn, Avatar, StageBadge,
  ProgressBar, TaskRow, TrialRow, EmptyRow,
  STAGE_COLORS, LIFECYCLE_STAGES,
} from "./shared/DashboardPrimitives";
import { MOCK_LEADS, MOCK_TASKS, MOCK_TRIALS } from "../../data/mockData";
import { useUser } from "../../store/useAuthStore";

export const RMDashboard = () => {
  const navigate = useNavigate();
  const user = useUser();

  const [tasks, setTasks] = useState(
    MOCK_TASKS.filter((t) => t.assignedTo === user?.name),
  );

  // ── Derived data (my leads only) ─────────────────────────
  const myLeads = MOCK_LEADS.filter((l) => l.assignedTo === user?.name);
  const totalLeads = myLeads.length;

  const myTrialsToday = MOCK_TRIALS.filter(
    (t) => t.date === "2025-02-28" && myLeads.some((l) => l.id === t.leadId),
  );

  const hotLeads = myLeads.filter((l) => l.tags?.includes("Hot"));
  const pendingCalls = tasks.filter((t) => !t.done && t.type === "call").length;
  const pendingFollowups = tasks.filter((t) => !t.done && t.type === "followup").length;
  const converted = myLeads.filter((l) =>
    ["Joined", "Membership Active", "Renewal"].includes(l.stage),
  ).length;
  const convRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0;

  const stageCounts = myLeads.reduce<Record<string, number>>((acc, l) => {
    acc[l.stage] = (acc[l.stage] || 0) + 1;
    return acc;
  }, {});

  const toggleTask = (id: string) =>
    setTasks((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      {/* ── Greeting ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-800 text-primary">
            Good morning, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-[13px] text-secondary mt-0.5">
            You have {pendingCalls} calls and {pendingFollowups} follow-ups pending today.
          </p>
        </div>
        <Btn variant="pri" onClick={() => navigate("/leads")}>
          My Leads →
        </Btn>
      </div>

      {/* ── My Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Leads" value={totalLeads} delta="This month" deltaUp icon="◈" accent="#818cf8" />
        <StatCard label="Conversion Rate" value={`${convRate}%`} delta="5%" deltaUp icon="◎" accent="#22c55e" />
        <StatCard label="Calls Today" value={pendingCalls} icon="📞" accent="#f59e0b" />
        <StatCard label="Follow-ups Due" value={pendingFollowups} icon="↩" accent="#ec4899" />
      </div>

      {/* ── Tasks + Hot Leads ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="flex flex-col">
          <CardHeader
            title="My Tasks"
            sub={`${tasks.filter((t) => !t.done).length} pending`}
            action={<Btn onClick={() => navigate("/dashboard/tasks")}>All Tasks</Btn>}
          />
          <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ maxHeight: 280 }}>
            {tasks.length > 0
              ? tasks.map((t) => <TaskRow key={t.id} task={t} onToggle={toggleTask} />)
              : <EmptyRow message="No tasks assigned to you" />}
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHeader
            title="Hot Leads"
            sub="Requires immediate attention"
            action={<Btn onClick={() => navigate("/leads")}>All Leads</Btn>}
          />
          <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ maxHeight: 280 }}>
            {hotLeads.length > 0 ? (
              hotLeads.map((l) => (
                <div
                  key={l.id}
                  onClick={() => navigate(`/leads/${l.id}`)}
                  className="flex items-center gap-3 px-5 py-3 border-b border-theme last:border-0 hover-theme transition-colors cursor-pointer"
                >
                  <Avatar name={l.name} size={30} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-600 text-primary truncate">{l.name}</p>
                    <p className="text-[11px] text-secondary">{l.phone}</p>
                  </div>
                  <StageBadge stage={l.stage} />
                  <div className="flex gap-1">
                    {l.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-700 px-2 py-0.5 rounded-full"
                        style={{ background: "var(--danger-bg)", color: "var(--danger-color)" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <EmptyRow message="No hot leads right now" />
            )}
          </div>
        </Card>
      </div>

      {/* ── My Pipeline + Trials ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader
            title="My Pipeline"
            sub={`${totalLeads} leads`}
            action={<Btn onClick={() => navigate("/leads/pipeline")}>Pipeline View</Btn>}
          />
          <div className="p-5 space-y-3">
            {LIFECYCLE_STAGES.map((stage) => {
              const cnt = stageCounts[stage] || 0;
              return (
                <div key={stage} className="flex items-center gap-3">
                  <span className="text-[12px] text-secondary w-[130px] flex-shrink-0">
                    {stage}
                  </span>
                  <div className="flex-1">
                    <ProgressBar
                      value={cnt}
                      max={Math.max(totalLeads, 1)}
                      color={STAGE_COLORS[stage]}
                    />
                  </div>
                  <span className="text-[13px] font-700 text-primary w-4 text-right tabular-nums">
                    {cnt}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHeader
            title="My Trials Today"
            sub="Feb 28, 2025"
            action={<Btn onClick={() => navigate("/schedule/trials")}>All</Btn>}
          />
          <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ maxHeight: 320 }}>
            {myTrialsToday.length > 0
              ? myTrialsToday.map((t) => <TrialRow key={t.id} trial={t} />)
              : <EmptyRow message="No trials scheduled today" />}
          </div>
        </Card>
      </div>

      {/* ── My Recent Leads ── */}
      <Card>
        <CardHeader
          title="My Recent Leads"
          action={<Btn onClick={() => navigate("/leads/mine")}>View All</Btn>}
        />
        <div className="divide-theme">
          {myLeads.slice(0, 5).map((l) => (
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
              <span className="text-[11px] text-secondary hidden md:block">{l.lastActivity}</span>
              <Btn onClick={(e) => { e?.stopPropagation(); }}>📞 Call</Btn>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
