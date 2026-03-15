// ============================================================
// features/reports/ReportsPage.tsx
// Analytics dashboard: lead funnel, source breakdown,
// conversion trend, and revenue summary.
// Uses Recharts for all charts.
// ============================================================

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { PageHeader, Button, Card, SectionLabel, StatCard } from "../../components/ui";
import {
  REPORT_METRICS, LEAD_CHART_DATA, SOURCE_CHART_DATA, STAGE_FUNNEL_DATA,
} from "../../data/mockData";

// ─── CUSTOM TOOLTIP ──────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111d35] border border-[#1e2f52] rounded-xl px-3 py-2.5 text-[12px] shadow-xl">
      {label && <p className="text-slate-400 mb-1 font-medium">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === "number" && p.value > 999 ? `₹${p.value.toLocaleString("en-IN")}` : p.value}
        </p>
      ))}
    </div>
  );
};

// ─── SOURCE PIE COLOURS ──────────────────────────────────
const PIE_COLORS = ["#6366f1","#10b981","#f59e0b"];

// ─── METRIC CARD ROW ─────────────────────────────────────
const MetricsRow = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
    {REPORT_METRICS.map(m => (
      <StatCard
        key={m.label}
        label={m.label}
        value={m.unit === "₹"
          ? `₹${(m.value / 1000).toFixed(0)}K`
          : m.unit === "%"
          ? `${m.value}%`
          : m.value
        }
        delta={`${Math.abs(m.change)}%`}
        deltaType={m.changeType === "increase" ? "up" : "down"}
      />
    ))}
  </div>
);

// ─── LEAD CONVERSION TREND ───────────────────────────────
const LeadTrendChart = () => (
  <Card className="p-5">
    <div className="flex items-center justify-between mb-5">
      <div>
        <SectionLabel className="mb-0.5">Lead & Conversion Trend</SectionLabel>
        <p className="text-[13px] text-slate-500">Monthly leads generated vs converted</p>
      </div>
      <Button variant="secondary" size="sm">Export CSV</Button>
    </div>
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={LEAD_CHART_DATA} barGap={4} barCategoryGap="30%">
        <CartesianGrid vertical={false} stroke="#1e2f52" />
        <XAxis dataKey="label" tick={{ fill:"#4a5a7a", fontSize:11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill:"#4a5a7a", fontSize:11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
        <Legend
          formatter={(v) => <span className="text-[11px] text-slate-400">{v}</span>}
          iconType="circle" iconSize={6}
        />
        <Bar dataKey="value"     name="Leads"     fill="#6366f1" radius={[4,4,0,0]} />
        <Bar dataKey="secondary" name="Converted" fill="#10b981" radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  </Card>
);

// ─── STAGE FUNNEL ────────────────────────────────────────
const StageFunnelChart = () => {
  const maxVal = STAGE_FUNNEL_DATA[0].value;
  return (
    <Card className="p-5">
      <SectionLabel className="mb-4">Lifecycle Funnel</SectionLabel>
      <div className="space-y-2">
        {STAGE_FUNNEL_DATA.map((d, i) => {
          const pct = Math.round((d.value / maxVal) * 100);
          const COLORS = ["#6366f1","#818cf8","#a78bfa","#10b981","#34d399","#22c55e","#4ade80","#f87171"];
          const dropOff = i > 0 ? STAGE_FUNNEL_DATA[i-1].value - d.value : 0;
          const dropPct = i > 0 ? Math.round((dropOff / STAGE_FUNNEL_DATA[i-1].value) * 100) : 0;
          return (
            <div key={d.label} className="group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-secondary font-medium">{d.label}</span>
                <div className="flex items-center gap-3">
                  {i > 0 && dropOff > 0 && (
                    <span className="text-[10px] text-red-400">-{dropPct}%</span>
                  )}
                  <span className="text-[12px] font-bold tabular-nums" style={{ color: COLORS[i] }}>
                    {d.value}
                  </span>
                </div>
              </div>
              <div className="h-6 bg-card rounded-lg overflow-hidden">
                <div
                  className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${pct}%`, background: COLORS[i] + "40", borderRight: `2px solid ${COLORS[i]}` }}
                >
                  <span className="text-[9px] font-bold" style={{ color: COLORS[i] }}>{pct}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// ─── SOURCE PIE ──────────────────────────────────────────
const SourcePieChart = () => (
  <Card className="p-5">
    <SectionLabel className="mb-4">Lead Sources</SectionLabel>
    <div className="flex items-center gap-4">
      <ResponsiveContainer width="60%" height={160}>
        <PieChart>
          <Pie
            data={SOURCE_CHART_DATA}
            cx="50%" cy="50%"
            innerRadius={45} outerRadius={70}
            dataKey="value"
            strokeWidth={0}
          >
            {SOURCE_CHART_DATA.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-3 flex-1">
        {SOURCE_CHART_DATA.map((d, i) => (
          <div key={d.label}>
            <div className="flex justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                <span className="text-[12px] text-slate-400">{d.label}</span>
              </div>
              <span className="text-[12px] font-bold text-white tabular-nums">{d.value}%</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width:`${d.value}%`, background: PIE_COLORS[i] }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </Card>
);

// ─── REVENUE TREND ───────────────────────────────────────
const REVENUE_DATA = LEAD_CHART_DATA.map(d => ({
  label: d.label,
  revenue: d.value * 4200 + Math.random() * 10000,
}));

const RevenueTrendChart = () => (
  <Card className="p-5">
    <div className="flex items-center justify-between mb-5">
      <div>
        <SectionLabel className="mb-0.5">Revenue Trend</SectionLabel>
        <p className="text-[13px] text-slate-500">Monthly membership revenue (₹)</p>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={REVENUE_DATA}>
        <CartesianGrid vertical={false} stroke="#1e2f52" />
        <XAxis dataKey="label" tick={{ fill:"#4a5a7a", fontSize:11 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill:"#4a5a7a", fontSize:11 }} axisLine={false} tickLine={false}
          tickFormatter={v => `₹${(v/1000).toFixed(0)}K`}
        />
        <Tooltip content={<ChartTooltip />} />
        <Line
          type="monotone" dataKey="revenue" name="Revenue"
          stroke="#f59e0b" strokeWidth={2}
          dot={{ fill:"#f59e0b", strokeWidth:0, r:3 }}
          activeDot={{ r:5, fill:"#f59e0b" }}
        />
      </LineChart>
    </ResponsiveContainer>
  </Card>
);

// ─── MAIN COMPONENT ──────────────────────────────────────
export const ReportsPage = () => {
  return (
    <div className="p-6 max-w-[1400px]">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Lead performance, conversion rates, and revenue insights"
        actions={
          <>
            <Button variant="secondary" size="sm">← Last 30 Days</Button>
            <Button variant="secondary" size="sm">Export Report</Button>
          </>
        }
      />

      <MetricsRow />

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5 mb-5">
        <LeadTrendChart />
        <SourcePieChart />
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-5">
        <StageFunnelChart />
        <RevenueTrendChart />
      </div>
    </div>
  );
};
