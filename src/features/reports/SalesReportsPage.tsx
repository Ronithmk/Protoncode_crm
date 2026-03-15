// features/reports/SalesReportsPage.tsx  →  /reports/sales

import { useState } from "react";
import {
  LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { cn } from "../../utils/cn";
import {
  Card, PageHeader, Button, Avatar, StatCard,
  Table, Th, Td, Tr, SectionLabel, ProgressBar,
} from "../../components/ui";
import { MOCK_LEADS, LEAD_CHART_DATA } from "../../data/mockData";
import { useRole } from "../../store/useAuthStore";

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-theme rounded-xl px-3 py-2.5 text-[12px] shadow-xl">
      {label && <p className="text-secondary mb-1 font-600">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-700">
          {p.name}: {typeof p.value === "number" && p.value > 999 ? `₹${p.value.toLocaleString("en-IN")}` : p.value}
        </p>
      ))}
    </div>
  );
};

const PLAN_COLOR: Record<string, string> = {
  Monthly: "var(--primary-color)", Quarterly: "var(--success-color)",
  "Half-Yearly": "var(--warning-color)", Annual: "#f472b6",
};

export const SalesReportsPage = () => {
  const role    = useRole();
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");

  const isAdmin = ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER", "SALES_MANAGER"].includes(role);

  const activeLeads    = MOCK_LEADS.filter(l => l.totalRevenue);
  const totalRevenue   = activeLeads.reduce((s, l) => s + (l.totalRevenue || 0), 0);
  const avgDeal        = activeLeads.length > 0 ? Math.round(totalRevenue / activeLeads.length) : 0;
  const renewalRevenue = MOCK_LEADS.filter(l => l.stage === "Renewal").reduce((s,l) => s+(l.totalRevenue||0), 0);

  // Revenue trend data
  const revenueTrend = LEAD_CHART_DATA.map(d => ({
    label: d.label,
    revenue: d.value * 4800 + (d.secondary ?? 0) * 2000,
    target:  d.value * 5000,
  }));

  // Plan breakdown
  const plans = ["Monthly", "Quarterly", "Half-Yearly", "Annual"];
  const planData = plans.map(plan => ({
    plan,
    count:   activeLeads.filter(l => l.membershipPlan === plan).length,
    revenue: activeLeads.filter(l => l.membershipPlan === plan).reduce((s,l) => s+(l.totalRevenue||0), 0),
  }));

  // RM performance
  const assignees = [...new Set(MOCK_LEADS.map(l => l.assignedTo))];
  const rmSales = assignees.map(name => ({
    name,
    revenue: MOCK_LEADS.filter(l => l.assignedTo === name && l.totalRevenue)
               .reduce((s,l) => s+(l.totalRevenue||0), 0),
    deals: MOCK_LEADS.filter(l => l.assignedTo === name && l.totalRevenue).length,
  })).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="p-6 max-w-[1400px] space-y-5">
      <PageHeader
        title="Sales Reports"
        subtitle="Revenue, membership plans and RM sales performance"
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
        <StatCard label="Total Revenue"  value={`₹${(totalRevenue/1000).toFixed(0)}K`}    delta="18%" deltaType="up" />
        <StatCard label="Avg Deal Size"  value={`₹${avgDeal.toLocaleString("en-IN")}`}    delta="4%"  deltaType="up" />
        <StatCard label="Active Members" value={activeLeads.length}                        delta="6%"  deltaType="up" />
        <StatCard label="Renewal Rev"    value={`₹${(renewalRevenue/1000).toFixed(0)}K`}              />
      </div>

      {/* Revenue trend */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <SectionLabel className="mb-0.5">Revenue vs Target</SectionLabel>
            <p className="text-[13px] text-secondary">Monthly revenue actuals and targets (₹)</p>
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
            <Line type="monotone" dataKey="revenue" name="Revenue" stroke="var(--success-color)" strokeWidth={2}
              dot={{ fill:"var(--success-color)", strokeWidth:0, r:3 }} />
            <Line type="monotone" dataKey="target"  name="Target"  stroke="var(--text-secondary)" strokeWidth={1.5}
              strokeDasharray="5 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Plan breakdown */}
        <Card>
          <div className="px-5 py-4 card-header">
            <p className="text-[14px] font-700 text-primary">By Membership Plan</p>
          </div>
          <div className="p-5 space-y-4">
            {planData.map(p => {
              const pct = totalRevenue > 0 ? (p.revenue / totalRevenue) * 100 : 0;
              return (
                <div key={p.plan}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-700 px-2 py-0.5 rounded-full"
                        style={{ color: PLAN_COLOR[p.plan], background: `${PLAN_COLOR[p.plan]}18` }}>
                        {p.plan}
                      </span>
                      <span className="text-[11px] text-secondary">{p.count} members</span>
                    </div>
                    <span className="text-[13px] font-700 text-primary">₹{p.revenue.toLocaleString("en-IN")}</span>
                  </div>
                  <ProgressBar value={p.revenue} max={totalRevenue} color={PLAN_COLOR[p.plan]} />
                  <p className="text-[10px] text-secondary mt-0.5">{pct.toFixed(1)}% of revenue</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* RM sales table */}
        {isAdmin && (
          <Card>
            <div className="px-5 py-4 card-header">
              <p className="text-[14px] font-700 text-primary">RM Sales Performance</p>
            </div>
            <Table>
              <thead><tr><Th>RM</Th><Th>Deals</Th><Th>Revenue</Th></tr></thead>
              <tbody>
                {rmSales.map((rm, i) => (
                  <Tr key={rm.name}>
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-800 w-5 text-secondary"
                          style={{ color: i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : undefined }}>
                          #{i+1}
                        </span>
                        <Avatar name={rm.name} size={26} />
                        <span className="text-[13px] font-600 text-primary">{rm.name}</span>
                      </div>
                    </Td>
                    <Td className="font-600 text-primary">{rm.deals}</Td>
                    <Td className="success-text font-700">₹{rm.revenue.toLocaleString("en-IN")}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
};
