// features/renewals/RenewalsOverviewPage.tsx  →  /renewals/overview
// Quick-view dashboard for the entire renewals module.
// Surfaces all 4 sub-sections at a glance with action items.

import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { cn } from "../../utils/cn";
import {
  Card, PageHeader, Button, Avatar,
  SectionLabel, ProgressBar,
} from "../../components/ui";
import { MOCK_LEADS, LEAD_CHART_DATA } from "../../data/mockData";
import { useRole } from "../../store/useAuthStore";
import { PlanBadge, ChartTooltip } from "./DueRenewalsPage";

const PIE_COLORS = ["var(--primary-color)", "var(--success-color)", "var(--warning-color)", "#f472b6"];

// ─── KPI CARD ─────────────────────────────────────────────

const KpiCard = ({
  label, value, sub, accent, icon, onClick,
}: {
  label: string; value: string | number; sub: string;
  accent: string; icon: string; onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "bg-card border border-theme rounded-2xl p-5 text-left w-full transition-all duration-150",
      onClick && "hover-theme hover:border-[var(--primary-color)] cursor-pointer group"
    )}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: `${accent}18`, color: accent }}>
        {icon}
      </div>
      {onClick && (
        <span className="text-secondary text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
      )}
    </div>
    <p className="text-[28px] font-800 text-primary leading-none mb-1" style={{ color: accent }}>{value}</p>
    <p className="text-[13px] font-600 text-primary">{label}</p>
    <p className="text-[11px] text-secondary mt-0.5">{sub}</p>
  </button>
);

// ─── SECTION HEADER ───────────────────────────────────────

const SectionHead = ({
  title, sub, linkLabel, linkTo,
}: {
  title: string; sub: string; linkLabel: string; linkTo: string;
}) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between px-5 py-4 card-header">
      <div>
        <p className="text-[14px] font-700 text-primary">{title}</p>
        <p className="text-[12px] text-secondary mt-0.5">{sub}</p>
      </div>
      <Button variant="secondary" size="sm" onClick={() => navigate(linkTo)}>
        {linkLabel} →
      </Button>
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────

export const RenewalsOverviewPage = () => {
  const navigate = useNavigate();
  const role     = useRole();

  const canProcess  = ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER", "FM"].includes(role);
  const showRevenue = ["SUPER_ADMIN", "CENTER_MANAGER", "FM"].includes(role);

  // ── Data buckets ─────────────────────────────────────
  const dueRenewals  = MOCK_LEADS.filter(l => l.stage === "Renewal");
  const active       = MOCK_LEADS.filter(l => ["Membership Active", "Joined"].includes(l.stage) && l.membershipPlan);
  const lapsed       = MOCK_LEADS.filter(l => ["Followup", "Call Handling"].includes(l.stage));
  const allRevLeads  = MOCK_LEADS.filter(l => l.totalRevenue);

  const totalRev     = allRevLeads.reduce((s, l) => s + (l.totalRevenue || 0), 0);
  // const riskRev      = dueRenewals.reduce((s, l) => s + (l.totalRevenue || 0), 0);
  const mrr          = Math.round(totalRev * 0.08);

  const plans        = ["Monthly", "Quarterly", "Half-Yearly", "Annual"];

  // ── Plan distribution ────────────────────────────────
  const planData = plans.map(p => ({
    name:    p,
    active:  active.filter(l => l.membershipPlan === p).length,
    due:     dueRenewals.filter(l => l.membershipPlan === p).length,
    revenue: allRevLeads.filter(l => l.membershipPlan === p).reduce((s,l) => s+(l.totalRevenue||0), 0),
  }));

  const pieData = planData.filter(p => p.active > 0).map(p => ({ name: p.name, value: p.active }));

  // ── Revenue trend ────────────────────────────────────
  const revTrend = LEAD_CHART_DATA.map(d => ({
    label:    d.label,
    revenue:  d.value * 4800,
    renewed:  d.value * 1800,
  }));

  // ── Centre snapshot ──────────────────────────────────
  const centres = ["Koramangala", "Indiranagar", "Whitefield"];
  const centreSnap = centres.map((c, i) => ({
    name:    c,
    active:  active.filter(l => l.center === c).length,
    due:     dueRenewals.filter(l => l.center === c).length,
    lapsed:  lapsed.filter(l => l.center === c).length,
    color:   ["var(--primary-color)", "var(--success-color)", "var(--warning-color)"][i],
  }));

  // ── Quick-nav cards ──────────────────────────────────
  const navCards = [
    {
      label:"Due Renewals",   count: dueRenewals.length, icon:"⚠",
      accent:"var(--danger-color)",   sub:"Needs action now",  path:"/renewals/due",
    },
    {
      label:"Active Members", count: active.length,      icon:"◎",
      accent:"var(--success-color)",  sub:"Paying memberships", path:"/renewals/completed",
    },
    {
      label:"Lapsed Members", count: lapsed.length,      icon:"↓",
      accent:"var(--warning-color)",  sub:"Win-back opportunities", path:"/renewals/lapsed",
    },
    {
      label:"Revenue",        count: `₹${(totalRev/1000).toFixed(0)}K`, icon:"₹",
      accent:"#f472b6",               sub:"All-time collected",  path:"/renewals/revenue",
    },
  ];

  return (
    <div className="p-6 max-w-[1400px] space-y-6">
      <PageHeader
        title="Renewals Overview"
        subtitle="Health of your membership pipeline at a glance"
        actions={
          <div className="flex gap-2">
            {canProcess && <Button variant="primary" size="sm">📢 Bulk Remind All</Button>}
            <Button variant="secondary" size="sm">⬇ Export Report</Button>
          </div>
        }
      />

      {/* ── Quick-nav KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {navCards.map(c => (
          <KpiCard
            key={c.label}
            label={c.label}
            value={c.count}
            sub={c.sub}
            accent={c.accent}
            icon={c.icon}
            onClick={() => navigate(c.path)}
          />
        ))}
      </div>

      {/* ── Revenue trend + Plan pie ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <SectionLabel className="mb-0.5">Revenue Trend</SectionLabel>
              <p className="text-[13px] text-secondary">Collected vs renewed memberships (₹)</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/renewals/revenue")}>
              Full report →
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revTrend}>
              <CartesianGrid vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="label" tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="var(--success-color)" strokeWidth={2.5}
                dot={{ fill:"var(--success-color)", strokeWidth:0, r:3 }} />
              <Line type="monotone" dataKey="renewed" name="Renewed" stroke="var(--primary-color)" strokeWidth={2}
                dot={{ fill:"var(--primary-color)", strokeWidth:0, r:3 }} />
            </LineChart>
          </ResponsiveContainer>
          {/* Mini MRR callout */}
          <div className="mt-4 pt-4 border-t border-theme flex items-center justify-between">
            <p className="text-[12px] text-secondary">Estimated MRR</p>
            <p className="text-[18px] font-800 success-text">₹{(mrr/1000).toFixed(0)}K</p>
          </div>
        </Card>

        <Card className="p-5">
          <SectionLabel className="mb-3">Active Plan Mix</SectionLabel>
          <div className="flex justify-center mb-3">
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%"
                  innerRadius={38} outerRadius={60} dataKey="value" strokeWidth={0}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2.5">
            {planData.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: PIE_COLORS[i] }} />
                  <span className="text-[12px] text-secondary">{p.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-secondary">{p.active} active</span>
                  {p.due > 0 && (
                    <span className="text-[10px] font-700 px-1.5 py-0.5 rounded-full danger-text danger-bg">
                      {p.due} due
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Centre snapshot bar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {centreSnap.map(c => (
          <Card key={c.name} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[14px] font-700 text-primary">{c.name}</p>
              <div className="flex gap-1.5">
                {c.due > 0 && (
                  <span className="text-[10px] font-700 px-2 py-0.5 rounded-full danger-text danger-bg">
                    {c.due} due
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                { label:"Active",  value: c.active, max: active.length || 1,    color:"var(--success-color)" },
                { label:"Due",     value: c.due,    max: dueRenewals.length || 1, color:"var(--danger-color)"  },
                { label:"Lapsed",  value: c.lapsed, max: lapsed.length || 1,    color:"var(--warning-color)" },
              ].map(s => (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-secondary">{s.label}</span>
                    <span className="text-[12px] font-700" style={{ color: s.color }}>{s.value}</span>
                  </div>
                  <ProgressBar value={s.value} max={s.max} color={s.color} />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* ── Due renewals queue + Lapsed win-back side by side ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Due renewals — top 5 */}
        <Card>
          <SectionHead
            title="Due Renewals"
            sub={`${dueRenewals.length} members pending`}
            linkLabel="View all"
            linkTo="/renewals/due"
          />
          <div className="divide-theme">
            {dueRenewals.length > 0 ? dueRenewals.slice(0, 5).map(lead => (
              <div key={lead.id}
                onClick={() => navigate(`/leads/${lead.id}`)}
                className="flex items-center gap-3 px-5 py-3.5 hover-theme transition-colors cursor-pointer">
                <Avatar name={lead.name} size={32} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-600 text-primary truncate">{lead.name}</p>
                  <p className="text-[11px] text-secondary">{lead.center} · {lead.phone}</p>
                </div>
                {lead.membershipPlan && <PlanBadge plan={lead.membershipPlan} />}
                <div className="text-right flex-shrink-0">
                  <p className="text-[13px] font-700 text-primary">
                    ₹{lead.totalRevenue?.toLocaleString("en-IN") ?? "—"}
                  </p>
                </div>
                {canProcess && (
                  <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                    <Button variant="secondary" size="sm">Remind</Button>
                    <Button variant="primary"   size="sm">Renew</Button>
                  </div>
                )}
              </div>
            )) : (
              <div className="px-5 py-10 text-center">
                <p className="text-2xl mb-2">✓</p>
                <p className="text-[13px] font-600 text-primary">No renewals due</p>
                <p className="text-[11px] text-secondary">All members are up to date.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Lapsed win-back — top 5 */}
        <Card>
          <SectionHead
            title="Win-back Opportunities"
            sub={`${lapsed.length} lapsed members`}
            linkLabel="View all"
            linkTo="/renewals/lapsed"
          />
          <div className="divide-theme">
            {lapsed.length > 0 ? lapsed.slice(0, 5).map(lead => (
              <div key={lead.id}
                onClick={() => navigate(`/leads/${lead.id}`)}
                className="flex items-center gap-3 px-5 py-3.5 hover-theme transition-colors cursor-pointer">
                <Avatar name={lead.name} size={32} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-600 text-primary truncate">{lead.name}</p>
                  <p className="text-[11px] text-secondary">{lead.center} · last active {lead.lastActivity}</p>
                </div>
                <span className="text-[10px] font-700 px-2 py-0.5 rounded-full warning-text warning-bg flex-shrink-0">
                  {lead.stage}
                </span>
                {canProcess && (
                  <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                    <Button variant="secondary" size="sm">Call</Button>
                    <Button variant="primary"   size="sm">Offer</Button>
                  </div>
                )}
              </div>
            )) : (
              <div className="px-5 py-10 text-center">
                <p className="text-2xl mb-2">🎉</p>
                <p className="text-[13px] font-600 text-primary">No lapsed members</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Active members snapshot ── */}
      <Card>
        <SectionHead
          title="Active Members"
          sub={`${active.length} paying memberships`}
          linkLabel="View all"
          linkTo="/renewals/completed"
        />
        <div className="divide-theme">
          {active.slice(0, 5).map(lead => (
            <div key={lead.id}
              onClick={() => navigate(`/leads/${lead.id}`)}
              className="flex items-center gap-3 px-5 py-3.5 hover-theme transition-colors cursor-pointer">
              <Avatar name={lead.name} size={32} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-600 text-primary truncate">{lead.name}</p>
                <p className="text-[11px] text-secondary">{lead.center} · expires {lead.membershipEnd ?? "—"}</p>
              </div>
              {lead.membershipPlan && <PlanBadge plan={lead.membershipPlan} />}
              <p className="text-[13px] font-700 success-text flex-shrink-0">
                ₹{lead.totalRevenue?.toLocaleString("en-IN") ?? "—"}
              </p>
              <span className="text-[10px] font-700 px-2 py-0.5 rounded-full success-text success-bg flex-shrink-0">
                Active
              </span>
            </div>
          ))}
          {active.length > 5 && (
            <div className="px-5 py-3 text-center">
              <Button variant="ghost" size="sm" onClick={() => navigate("/renewals/completed")}>
                View all {active.length} members →
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* ── Revenue plan breakdown ── */}
      {showRevenue && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <SectionLabel className="mb-0.5">Revenue by Plan</SectionLabel>
              <p className="text-[13px] text-secondary">Active vs due renewals per membership type</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/renewals/revenue")}>
              Full summary →
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={planData} barGap={4} barCategoryGap="35%">
              <CartesianGrid vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
              <Bar dataKey="active" name="Active"     fill="var(--success-color)" radius={[4,4,0,0]} />
              <Bar dataKey="due"    name="Due Renewal" fill="var(--danger-color)"  radius={[4,4,0,0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
};
