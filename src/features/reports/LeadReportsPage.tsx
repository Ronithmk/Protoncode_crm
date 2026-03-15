// features/reports/LeadReportsPage.tsx  →  /reports/leads

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { cn } from "../../utils/cn";
import {
  Card, PageHeader, Button, Avatar, StatCard,
  Table, Th, Td, Tr, SectionLabel,
} from "../../components/ui";
import { MOCK_LEADS, LEAD_CHART_DATA, STAGE_FUNNEL_DATA } from "../../data/mockData";
import { useRole } from "../../store/useAuthStore";

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-theme rounded-xl px-3 py-2.5 text-[12px] shadow-xl">
      {label && <p className="text-secondary mb-1 font-600">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-700">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export const LeadReportsPage = () => {
  const role    = useRole();
  const [period, setPeriod] = useState<"week" | "month" | "quarter">("month");

  const isAdmin = ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER", "SALES_MANAGER"].includes(role);

  const total      = MOCK_LEADS.length;
  const newLeads   = MOCK_LEADS.filter(l => l.stage === "Lead Created").length;
  const inProgress = MOCK_LEADS.filter(l => ["Call Handling", "Followup", "Trial Booked", "Trial Done"].includes(l.stage)).length;
  const converted  = MOCK_LEADS.filter(l => ["Joined", "Membership Active", "Renewal"].includes(l.stage)).length;
  const convRate   = total > 0 ? Math.round((converted / total) * 100) : 0;

  const assignees = [...new Set(MOCK_LEADS.map(l => l.assignedTo))];
  const assigneeRows = assignees.map(name => {
    const leads = MOCK_LEADS.filter(l => l.assignedTo === name);
    const conv  = leads.filter(l => ["Joined", "Membership Active", "Renewal"].includes(l.stage)).length;
    return { name, total: leads.length, converted: conv, rate: Math.round((conv / leads.length) * 100) };
  }).sort((a, b) => b.total - a.total);

  const centreData = ["Koramangala", "Indiranagar", "Whitefield"].map(c => ({
    name: c,
    total:     MOCK_LEADS.filter(l => l.center === c).length,
    converted: MOCK_LEADS.filter(l => l.center === c && ["Joined", "Membership Active", "Renewal"].includes(l.stage)).length,
  }));

  return (
    <div className="p-6 max-w-[1400px] space-y-5">
      <PageHeader
        title="Lead Reports"
        subtitle="Lead volume, conversion performance and assignee breakdown"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-surface border border-theme rounded-xl p-1">
              {(["week", "month", "quarter"] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={cn("px-3 py-1.5 rounded-lg text-[12px] font-600 transition-all capitalize",
                    period === p ? "bg-[var(--primary-color)] text-white" : "text-secondary hover-theme")}>
                  {p}
                </button>
              ))}
            </div>
            <Button variant="secondary" size="sm">⬇ Export CSV</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Leads"     value={total}           delta="12%" deltaType="up" />
        <StatCard label="New"             value={newLeads}        delta="8%"  deltaType="up" />
        <StatCard label="In Progress"     value={inProgress}                                 />
        <StatCard label="Conversion Rate" value={`${convRate}%`}  delta="5%"  deltaType="up" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
        {/* Trend chart */}
        <Card className="p-5">
          <SectionLabel className="mb-1">Monthly Lead Volume</SectionLabel>
          <p className="text-[13px] text-secondary mb-4">Leads generated vs converted</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={LEAD_CHART_DATA} barGap={4} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="label" tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
              <Legend formatter={v => <span className="text-[11px] text-secondary">{v}</span>} iconType="circle" iconSize={6} />
              <Bar dataKey="value"     name="Leads"     fill="var(--primary-color)" radius={[4,4,0,0]} />
              <Bar dataKey="secondary" name="Converted" fill="var(--success-color)" radius={[4,4,0,0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Stage funnel */}
        <Card className="p-5">
          <SectionLabel className="mb-4">Stage Funnel</SectionLabel>
          <div className="space-y-2">
            {STAGE_FUNNEL_DATA.map((d, i) => {
              const maxV = STAGE_FUNNEL_DATA[0].value;
              const pct  = Math.round((d.value / maxV) * 100);
              const COLS = ["#6366f1","#818cf8","#a78bfa","#10b981","#34d399","#22c55e","#4ade80","#f87171"];
              const drop = i > 0 ? Math.round(((STAGE_FUNNEL_DATA[i-1].value - d.value) / STAGE_FUNNEL_DATA[i-1].value) * 100) : 0;
              return (
                <div key={d.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-secondary truncate max-w-[140px]">{d.label}</span>
                    <div className="flex items-center gap-2">
                      {i > 0 && <span className="text-[10px] danger-text">-{drop}%</span>}
                      <span className="text-[12px] font-700" style={{ color: COLS[i] }}>{d.value}</span>
                    </div>
                  </div>
                  <div className="h-5 bg-surface rounded-lg overflow-hidden">
                    <div className="h-full rounded-lg flex items-center justify-end pr-2"
                      style={{ width:`${pct}%`, background:`${COLS[i]}30`, borderRight:`2px solid ${COLS[i]}` }}>
                      <span className="text-[9px] font-700" style={{ color: COLS[i] }}>{pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Assignee table */}
          <Card>
            <div className="px-5 py-4 card-header">
              <p className="text-[14px] font-700 text-primary">By Assignee</p>
            </div>
            <Table>
              <thead><tr><Th>RM</Th><Th>Total</Th><Th>Converted</Th><Th>Rate</Th></tr></thead>
              <tbody>
                {assigneeRows.map(a => (
                  <Tr key={a.name}>
                    <Td><div className="flex items-center gap-2"><Avatar name={a.name} size={26} /><span className="text-[13px] font-600 text-primary">{a.name}</span></div></Td>
                    <Td className="font-600 text-primary">{a.total}</Td>
                    <Td className="success-text font-600">{a.converted}</Td>
                    <Td><span className={cn("text-[12px] font-700", a.rate >= 60 ? "success-text" : a.rate >= 40 ? "warning-text" : "danger-text")}>{a.rate}%</span></Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Card>

          {/* Centre chart */}
          <Card className="p-5">
            <SectionLabel className="mb-4">By Centre</SectionLabel>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={centreData} barGap={4} barCategoryGap="35%">
                <CartesianGrid vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
                <Legend formatter={v => <span className="text-[11px] text-secondary">{v}</span>} iconType="circle" iconSize={6} />
                <Bar dataKey="total"     name="Total"     fill="var(--primary-color)" radius={[4,4,0,0]} />
                <Bar dataKey="converted" name="Converted" fill="var(--success-color)" radius={[4,4,0,0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  );
};
