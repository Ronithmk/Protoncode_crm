// ============================================================
// features/dashboard/sales_manager/SalesManagerDashboard.tsx
// Sales Manager dashboard.
// Owns the sales pipeline across all RMs and centres.
// Shows: pipeline funnel, team performance, lead sources,
//        conversion tracking, reports. No finance/schedule.
// ============================================================

import { useNavigate } from "react-router-dom";
import {
  Card, CardHeader, StatCard, Btn, Avatar, StageBadge,
  ProgressBar, MiniBarChart, EmptyRow,
  STAGE_COLORS, LIFECYCLE_STAGES,
} from "./shared/DashboardPrimitives";
import { MOCK_LEADS, LEAD_CHART_DATA } from "../../data/mockData";
import { useUser } from "../../store/useAuthStore";

export const SalesManagerDashboard = () => {
  const navigate = useNavigate();
  const user = useUser();

  // ── Derived metrics ───────────────────────────────────────
  const totalLeads = MOCK_LEADS.length;
  const converted = MOCK_LEADS.filter((l) =>
    ["Joined", "Membership Active", "Renewal"].includes(l.stage),
  ).length;
  const convRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0;
  const hotLeads = MOCK_LEADS.filter((l) => l.tags?.includes("Hot"));
  const newThisWeek = MOCK_LEADS.filter((l) => l.createdAt >= "2025-02-24").length;

  const stageCounts = MOCK_LEADS.reduce<Record<string, number>>((acc, l) => {
    acc[l.stage] = (acc[l.stage] || 0) + 1;
    return acc;
  }, {});

  // ── RM performance across all centres ────────────────────
  const allRMs = [...new Set(MOCK_LEADS.map((l) => l.assignedTo))];
  const rmPerf = allRMs.map((rm) => {
    const rmLeads = MOCK_LEADS.filter((l) => l.assignedTo === rm);
    const conv = rmLeads.filter((l) =>
      ["Joined", "Membership Active", "Renewal"].includes(l.stage),
    ).length;
    const centre = rmLeads[0]?.center ?? "—";
    return {
      name: rm,
      centre,
      leads: rmLeads.length,
      converted: conv,
      rate: rmLeads.length > 0 ? Math.round((conv / rmLeads.length) * 100) : 0,
    };
  }).sort((a, b) => b.rate - a.rate);

  // ── Lead source breakdown ────────────────────────────────
  const SOURCES = ["Meta Ads", "WhatsApp", "Walk-in"] as const;
  const SOURCE_COLORS: Record<string, string> = {
    "Meta Ads": "#818cf8",
    WhatsApp:   "#22c55e",
    "Walk-in":  "#f59e0b",
  };
  const sourceData = SOURCES.map((s) => ({
    name: s,
    count: MOCK_LEADS.filter((l) => l.source === s).length,
    converted: MOCK_LEADS.filter((l) => l.source === s && ["Joined","Membership Active","Renewal"].includes(l.stage)).length,
  }));

  // ── Centre breakdown ──────────────────────────────────────
  const centres = ["Koramangala", "Indiranagar", "Whitefield"];
  const centreData = centres.map((c) => ({
    name: c,
    leads: MOCK_LEADS.filter((l) => l.center === c).length,
    converted: MOCK_LEADS.filter((l) => l.center === c && ["Joined","Membership Active","Renewal"].includes(l.stage)).length,
  }));

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      {/* ── Greeting ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-800 text-primary">
            Good morning, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-[13px] text-secondary mt-0.5">
            {newThisWeek} new leads this week · overall conversion at {convRate}%
          </p>
        </div>
        <div className="flex gap-2">
          <Btn onClick={() => navigate("/leads/pipeline")}>Pipeline View</Btn>
          <Btn variant="pri" onClick={() => navigate("/reports")}>Full Reports →</Btn>
        </div>
      </div>

      {/* ── Sales Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Leads"     value={totalLeads}       delta="12%"        deltaUp icon="◈" accent="#818cf8" />
        <StatCard label="Conversion Rate" value={`${convRate}%`}   delta="5%"         deltaUp icon="◎" accent="#22c55e" />
        <StatCard label="Hot Leads"       value={hotLeads.length}                             icon="🔥" accent="#f97316" />
        <StatCard label="New This Week"   value={newThisWeek}      delta="vs last wk" deltaUp icon="↑" accent="#f59e0b" />
      </div>

      {/* ── Full Pipeline Funnel + Trend ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Sales Pipeline"
            sub="Full funnel across all centres"
            action={<Btn onClick={() => navigate("/leads/pipeline")}>Kanban View</Btn>}
          />
          <div className="p-5 space-y-3">
            {LIFECYCLE_STAGES.map((stage) => {
              const cnt = stageCounts[stage] || 0;
              const pct = totalLeads > 0 ? Math.round((cnt / totalLeads) * 100) : 0;
              return (
                <div key={stage} className="flex items-center gap-3">
                  <span className="text-[12px] text-secondary w-[130px] flex-shrink-0">{stage}</span>
                  <div className="flex-1">
                    <ProgressBar value={cnt} max={Math.max(totalLeads, 1)} color={STAGE_COLORS[stage]} />
                  </div>
                  <span className="text-[13px] font-700 text-primary w-6 text-right tabular-nums">{cnt}</span>
                  <span className="text-[11px] text-secondary w-8 text-right">{pct}%</span>
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

          {/* Centre breakdown */}
          <div className="border-t border-theme p-5">
            <p className="text-[11px] font-700 text-secondary uppercase tracking-wider mb-3">By Centre</p>
            {centreData.map((c) => (
              <div key={c.name} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] text-secondary">{c.name}</span>
                  <span className="text-[12px] font-600 text-primary">{c.converted}/{c.leads}</span>
                </div>
                <ProgressBar value={c.converted} max={Math.max(c.leads, 1)} color="var(--primary-color)" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── RM Performance + Lead Sources ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* RM leaderboard */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="RM Performance"
            sub="Conversion rate across all RMs"
            action={<Btn onClick={() => navigate("/reports/sales")}>Full Report</Btn>}
          />
          <div className="divide-theme">
            {rmPerf.map((rm, i) => (
              <div key={rm.name} className="flex items-center gap-3 px-5 py-3.5 hover-theme transition-colors">
                <span
                  className="text-[11px] font-800 w-5 text-center flex-shrink-0"
                  style={{ color: i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : "var(--text-secondary)" }}
                >
                  #{i + 1}
                </span>
                <Avatar name={rm.name} size={30} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-600 text-primary truncate">{rm.name}</p>
                  <p className="text-[11px] text-secondary">{rm.centre} · {rm.leads} leads</p>
                </div>
                <div className="w-28 hidden sm:block">
                  <ProgressBar value={rm.converted} max={Math.max(rm.leads, 1)} color="var(--success-color)" />
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-700 text-primary">{rm.rate}%</p>
                  <p className="text-[11px] text-secondary">{rm.converted} conv.</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Lead sources */}
        <Card>
          <CardHeader title="Lead Sources" sub="Volume & conversion" />
          <div className="p-5 space-y-5">
            {sourceData.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: SOURCE_COLORS[s.name] }} />
                    <span className="text-[13px] font-500 text-primary">{s.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[12px] font-700 text-primary block">{s.count} leads</span>
                    <span className="text-[11px] text-secondary">
                      {s.count > 0 ? Math.round((s.converted / s.count) * 100) : 0}% conv.
                    </span>
                  </div>
                </div>
                <ProgressBar value={s.count} max={Math.max(totalLeads, 1)} color={SOURCE_COLORS[s.name]} />
              </div>
            ))}
          </div>

          {/* Quick stats */}
          <div className="border-t border-theme p-5 grid grid-cols-2 gap-3">
            {[
              { label: "Trial Booked",      count: stageCounts["Trial Booked"] || 0,      color: STAGE_COLORS["Trial Booked"] },
              { label: "Trial Done",        count: stageCounts["Trial Done"] || 0,         color: STAGE_COLORS["Trial Done"] },
              { label: "Joined",            count: stageCounts["Joined"] || 0,             color: STAGE_COLORS["Joined"] },
              { label: "Membership Active", count: stageCounts["Membership Active"] || 0,  color: STAGE_COLORS["Membership Active"] },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-3 text-center border border-theme">
                <p className="text-[20px] font-800" style={{ color: s.color }}>{s.count}</p>
                <p className="text-[9px] text-secondary leading-tight mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Hot Leads ── */}
      <Card>
        <CardHeader
          title="Hot Leads"
          sub="Needs immediate action"
          action={<Btn onClick={() => navigate("/leads")}>All Leads</Btn>}
        />
        <div className="divide-theme">
          {hotLeads.length > 0 ? hotLeads.map((l) => (
            <div
              key={l.id}
              onClick={() => navigate(`/leads/${l.id}`)}
              className="flex items-center gap-3 px-5 py-3.5 hover-theme transition-colors cursor-pointer"
            >
              <Avatar name={l.name} size={30} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-600 text-primary truncate">{l.name}</p>
                <p className="text-[11px] text-secondary">{l.phone} · {l.center}</p>
              </div>
              <StageBadge stage={l.stage} />
              <div className="flex items-center gap-1.5">
                <Avatar name={l.assignedTo} size={20} />
                <span className="text-[11px] text-secondary">{l.assignedTo}</span>
              </div>
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
          )) : <EmptyRow message="No hot leads right now" />}
        </div>
      </Card>
    </div>
  );
};
