// features/renewals/RenewedMembersPage.tsx  →  /renewals/completed

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "../../utils/cn";
import {
  Card, PageHeader, Button, Avatar, EmptyState,
  StatCard, Table, Th, Td, Tr, SectionLabel, ProgressBar,
} from "../../components/ui";
import { MOCK_LEADS } from "../../data/mockData";
import { PlanBadge, SearchBar, CentreFilter, ChartTooltip } from "./DueRenewalsPage";

const PIE_COLORS = ["var(--primary-color)", "var(--success-color)", "var(--warning-color)", "#f472b6"];

export const RenewedMembersPage = () => {
  const navigate = useNavigate();
  const [search, setSearch]   = useState("");
  const [centre, setCentre]   = useState("All");
  const [planFilter, setPlanFilter] = useState("All");

  const active = MOCK_LEADS.filter(l =>
    ["Membership Active", "Joined"].includes(l.stage) && l.membershipPlan
  );

  const filtered = active.filter(l =>
    (centre === "All"     || l.center === centre) &&
    (planFilter === "All" || l.membershipPlan === planFilter) &&
    (!search || l.name.toLowerCase().includes(search.toLowerCase()))
  );

  const totalRevenue  = active.reduce((s, l) => s + (l.totalRevenue || 0), 0);
  const plans         = ["Monthly", "Quarterly", "Half-Yearly", "Annual"];

  // Plan distribution for pie
  const pieData = plans.map(plan => ({
    name:  plan,
    value: active.filter(l => l.membershipPlan === plan).length,
  })).filter(d => d.value > 0);

  // Revenue per plan for bar
  const planRevData = plans.map(plan => ({
    name:    plan,
    members: active.filter(l => l.membershipPlan === plan).length,
    revenue: Math.round(active.filter(l => l.membershipPlan === plan).reduce((s,l)=>s+(l.totalRevenue||0),0) / 1000),
  }));

  // Centre breakdown
  const centreData = ["Koramangala", "Indiranagar", "Whitefield"].map(c => ({
    centre:   c,
    count:    active.filter(l => l.center === c).length,
    revenue:  active.filter(l => l.center === c).reduce((s,l)=>s+(l.totalRevenue||0),0),
  }));

  // Retention trend (simulated from LEAD_CHART_DATA)
  // const retentionTrend = LEAD_CHART_DATA.map(d => ({
  //   label:     d.label,
  //   retained:  d.secondary ?? Math.round(d.value * 0.7),
  //   churned:   Math.round(d.value * 0.15),
  // }));

  return (
    <div className="p-6 max-w-[1400px] space-y-5">
      <PageHeader
        title="Renewed Members"
        subtitle={`${active.length} active memberships across all centres`}
        actions={<Button variant="secondary" size="sm">⬇ Export</Button>}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Members"  value={active.length}                                  delta="6%"  deltaType="up" />
        <StatCard label="Revenue MTD"     value={`₹${(totalRevenue/1000).toFixed(0)}K`}          delta="18%" deltaType="up" />
        <StatCard label="Retention Rate"  value="84%"                                             delta="3%"  deltaType="up" />
        <StatCard label="Avg Plan Value"  value={`₹${active.length > 0 ? Math.round(totalRevenue/active.length).toLocaleString("en-IN") : 0}`} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Plan distribution pie */}
        <Card className="p-5">
          <SectionLabel className="mb-3">Plan Distribution</SectionLabel>
          <div className="flex justify-center mb-3">
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%"
                  innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-[12px] text-secondary">{d.name}</span>
                </div>
                <span className="text-[12px] font-700 text-primary">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Revenue per plan */}
        <Card className="p-5 lg:col-span-2">
          <SectionLabel className="mb-4">Revenue by Plan</SectionLabel>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={planRevData} barGap={4} barCategoryGap="35%">
              <CartesianGrid vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
              <Bar dataKey="members" name="Members" fill="var(--primary-color)" radius={[4,4,0,0]} />
              <Bar dataKey="revenue" name="Rev (₹K)" fill="var(--success-color)" radius={[4,4,0,0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Centre breakdown */}
      <div className="grid grid-cols-3 gap-4">
        {centreData.map((c, i) => {
          const COLS = ["var(--primary-color)", "var(--success-color)", "var(--warning-color)"];
          return (
            <div key={c.centre} className="bg-card border border-theme rounded-2xl p-5">
              <p className="text-[13px] font-700 text-primary mb-1">{c.centre}</p>
              <p className="text-[26px] font-800" style={{ color: COLS[i] }}>{c.count}</p>
              <p className="text-[11px] text-secondary mt-0.5">active members</p>
              <div className="mt-3">
                <ProgressBar value={c.count} max={active.length} color={COLS[i]} />
              </div>
              <p className="text-[12px] text-secondary mt-2">₹{c.revenue.toLocaleString("en-IN")} revenue</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <SearchBar value={search} onChange={setSearch} />
        <CentreFilter value={centre} onChange={setCentre} />
        <div className="flex items-center gap-1 bg-surface border border-theme rounded-xl p-1">
          {["All", ...plans].map(p => (
            <button key={p} onClick={() => setPlanFilter(p)}
              className={cn("px-3 py-1.5 rounded-lg text-[12px] font-600 transition-all",
                planFilter === p ? "bg-[var(--primary-color)] text-white" : "text-secondary hover-theme")}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Members table */}
      <Card>
        <div className="px-5 py-3.5 card-header flex items-center justify-between">
          <p className="text-[11px] font-700 text-secondary uppercase tracking-wider">Active Members</p>
          <p className="text-[11px] text-secondary">{filtered.length} members</p>
        </div>
        {filtered.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th>Member</Th><Th>Centre</Th><Th>Plan</Th>
                <Th>Revenue</Th><Th>Started</Th><Th>Expires</Th><Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <Tr key={lead.id} onClick={() => navigate(`/leads/${lead.id}`)}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={lead.name} size={30} />
                      <div>
                        <p className="text-[13px] font-600 text-primary">{lead.name}</p>
                        <p className="text-[11px] text-secondary">{lead.phone}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-secondary">{lead.center}</Td>
                  <Td>{lead.membershipPlan ? <PlanBadge plan={lead.membershipPlan} /> : "—"}</Td>
                  <Td className="font-700 success-text">₹{lead.totalRevenue?.toLocaleString("en-IN") ?? "—"}</Td>
                  <Td className="text-secondary">{lead.membershipStart ?? "—"}</Td>
                  <Td className="text-secondary">{lead.membershipEnd ?? "—"}</Td>
                  <Td>
                    <span className="text-[10px] font-700 px-2 py-0.5 rounded-full success-text success-bg">Active</span>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState icon="◈" title="No members match your filters" />
        )}
      </Card>
    </div>
  );
};
