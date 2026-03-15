// features/renewals/RevenueSummaryPage.tsx  →  /renewals/revenue

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { cn } from "../../utils/cn";
import {
  Card, PageHeader, Button, Avatar,
  StatCard, Table, Th, Td, Tr, SectionLabel, ProgressBar,
} from "../../components/ui";
import { MOCK_LEADS, LEAD_CHART_DATA } from "../../data/mockData";
import { useRole } from "../../store/useAuthStore";
import { PLAN_COLOR, PlanBadge, ChartTooltip } from "./DueRenewalsPage";

const PIE_COLORS = ["var(--primary-color)", "var(--success-color)", "var(--warning-color)", "#f472b6"];

export const RevenueSummaryPage = () => {
  const navigate = useNavigate();
  const role     = useRole();
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");

  const showFull   = ["SUPER_ADMIN", "CENTER_MANAGER", "FM"].includes(role);
  const active     = MOCK_LEADS.filter(l => l.totalRevenue);
  const totalRev   = active.reduce((s, l) => s + (l.totalRevenue || 0), 0);
  const avgDeal    = active.length > 0 ? Math.round(totalRev / active.length) : 0;
  const mrr        = Math.round(totalRev * 0.08);

  const plans = ["Monthly", "Quarterly", "Half-Yearly", "Annual"];

  const planBreakdown = plans.map(plan => ({
    plan,
    count:   active.filter(l => l.membershipPlan === plan).length,
    revenue: active.filter(l => l.membershipPlan === plan).reduce((s,l) => s+(l.totalRevenue||0), 0),
  }));

  const centreBreakdown = ["Koramangala", "Indiranagar", "Whitefield"].map((c, i) => ({
    centre:  c,
    count:   active.filter(l => l.center === c).length,
    revenue: active.filter(l => l.center === c).reduce((s,l) => s+(l.totalRevenue||0), 0),
    color:   ["var(--primary-color)", "var(--success-color)", "var(--warning-color)"][i],
  }));

  // Revenue trend
  const revenueTrend = LEAD_CHART_DATA.map(d => ({
    label:   d.label,
    revenue: d.value * 4800 + (d.secondary ?? 0) * 2000,
    target:  d.value * 5500,
    renewed: d.value * 1800,
  }));

  // Pie: plan share
  const pieData = planBreakdown.filter(p => p.count > 0).map(p => ({
    name: p.plan, value: p.count,
  }));

  return (
    <div className="p-6 max-w-[1400px] space-y-5">
      <PageHeader
        title="Revenue Summary"
        subtitle="Membership revenue, plan distribution and collection trends"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-surface border border-theme rounded-xl p-1">
              {(["month", "quarter", "year"] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={cn("px-3 py-1.5 rounded-lg text-[12px] font-600 transition-all capitalize",
                    period === p ? "bg-[var(--primary-color)] text-white" : "text-secondary hover-theme")}>
                  {p}
                </button>
              ))}
            </div>
            <Button variant="secondary" size="sm">⬇ Export</Button>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue"  value={`₹${(totalRev/1000).toFixed(0)}K`}           delta="All time"   deltaType="up" />
        <StatCard label="Active Members" value={active.length}                                 delta="Paying"     deltaType="up" />
        <StatCard label="Avg Deal Size"  value={`₹${avgDeal.toLocaleString("en-IN")}`}         delta="Per member" deltaType="up" />
        <StatCard label="Est. MRR"       value={`₹${(mrr/1000).toFixed(0)}K`}                  delta="Monthly"    deltaType="up" />
      </div>

      {/* Revenue trend — full width */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <SectionLabel className="mb-0.5">Revenue Trend</SectionLabel>
            <p className="text-[13px] text-secondary">Collected vs Target (₹)</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={revenueTrend}>
            <CartesianGrid vertical={false} stroke="var(--border-color)" />
            <XAxis dataKey="label" tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false}
              tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
            <Tooltip content={<ChartTooltip />} />
            <Legend formatter={v => <span className="text-[11px] text-secondary">{v}</span>} iconType="circle" iconSize={6} />
            <Line type="monotone" dataKey="revenue" name="Revenue" stroke="var(--success-color)" strokeWidth={2.5}
              dot={{ fill:"var(--success-color)", strokeWidth:0, r:3 }} />
            <Line type="monotone" dataKey="target"  name="Target"  stroke="var(--text-secondary)" strokeWidth={1.5}
              strokeDasharray="5 4" dot={false} />
            <Line type="monotone" dataKey="renewed" name="Renewed" stroke="var(--primary-color)" strokeWidth={2}
              dot={{ fill:"var(--primary-color)", strokeWidth:0, r:3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Plan breakdown + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        <Card>
          <div className="px-5 py-4 card-header">
            <p className="text-[14px] font-700 text-primary">By Membership Plan</p>
          </div>
          <div className="p-5 space-y-4">
            {planBreakdown.map(p => {
              const pct = totalRev > 0 ? (p.revenue / totalRev) * 100 : 0;
              return (
                <div key={p.plan}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <PlanBadge plan={p.plan} />
                      <span className="text-[12px] text-secondary">{p.count} members</span>
                    </div>
                    <span className="text-[13px] font-700 text-primary">₹{p.revenue.toLocaleString("en-IN")}</span>
                  </div>
                  <ProgressBar value={p.revenue} max={totalRev} color={PLAN_COLOR[p.plan] ?? "var(--primary-color)"} />
                  <p className="text-[10px] text-secondary mt-0.5">{pct.toFixed(1)}% of revenue</p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <SectionLabel className="mb-3">Plan Share</SectionLabel>
          <div className="flex justify-center mb-4">
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
      </div>

      {/* Centre breakdown */}
      {showFull && (
        <div className="grid grid-cols-3 gap-4">
          {centreBreakdown.map(c => {
            const pct = totalRev > 0 ? (c.revenue / totalRev) * 100 : 0;
            return (
              <Card key={c.centre} className="p-5">
                <p className="text-[14px] font-700 text-primary mb-1">{c.centre}</p>
                <p className="text-[26px] font-800" style={{ color: c.color }}>
                  ₹{(c.revenue/1000).toFixed(0)}K
                </p>
                <p className="text-[11px] text-secondary mt-0.5">{c.count} members</p>
                <div className="mt-3">
                  <ProgressBar value={c.revenue} max={totalRev} color={c.color} />
                </div>
                <p className="text-[11px] text-secondary mt-1">{pct.toFixed(1)}% of total</p>
              </Card>
            );
          })}
        </div>
      )}

      {/* Recent transactions */}
      <Card>
        <div className="px-5 py-4 card-header">
          <p className="text-[14px] font-700 text-primary">Recent Transactions</p>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Member</Th><Th>Centre</Th><Th>Plan</Th>
              <Th>Amount</Th><Th>Started</Th><Th>Expires</Th>
            </tr>
          </thead>
          <tbody>
            {active.slice(0, 8).map(lead => (
              <Tr key={lead.id} onClick={() => navigate(`/leads/${lead.id}`)}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={lead.name} size={28} />
                    <div>
                      <p className="text-[13px] font-600 text-primary">{lead.name}</p>
                      <p className="text-[11px] text-secondary">{lead.phone}</p>
                    </div>
                  </div>
                </Td>
                <Td className="text-secondary">{lead.center}</Td>
                <Td>{lead.membershipPlan ? <PlanBadge plan={lead.membershipPlan} /> : "—"}</Td>
                <Td className="font-800 success-text text-[14px]">
                  ₹{lead.totalRevenue?.toLocaleString("en-IN")}
                </Td>
                <Td className="text-secondary">{lead.membershipStart ?? "—"}</Td>
                <Td className="text-secondary">{lead.membershipEnd ?? "—"}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};
