// features/leads/LeadSourcesPage.tsx  →  /leads/sources

import { useState } from "react";
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { cn } from "../../utils/cn";
import {
  Card, PageHeader, Button, SectionLabel,
  Table, Th, Td, Tr, ProgressBar, StatCard,
} from "../../components/ui";
import {
  MOCK_LEADS, LEAD_CHART_DATA, SOURCE_CHART_DATA,
} from "../../data/mockData";
import { useRole } from "../../store/useAuthStore";

// ─── CONSTANTS ────────────────────────────────────────────

const SOURCE_COLOR: Record<string, string> = {
  "Meta Ads": "var(--primary-color)",
  "WhatsApp": "var(--success-color)",
  "Walk-in":  "var(--warning-color)",
};
const SOURCE_ICON: Record<string, string> = {
  "Meta Ads": "⬡", "WhatsApp": "◉", "Walk-in": "◈",
};
const PIE_COLORS = [
  "var(--primary-color)",
  "var(--success-color)",
  "var(--warning-color)",
];

// Estimated cost-per-lead by source (mock)
const CPL: Record<string, number> = {
  "Meta Ads": 320, "WhatsApp": 80, "Walk-in": 0,
};

const SOURCES = ["Meta Ads", "WhatsApp", "Walk-in"];

// ─── CHART TOOLTIP ────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-theme rounded-xl px-3 py-2.5 text-[12px] shadow-xl">
      {label && <p className="text-secondary mb-1 font-600">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? p.fill }} className="font-700">
          {p.name}: {typeof p.value === "number" && p.value > 999
            ? `₹${p.value.toLocaleString("en-IN")}`
            : p.value}
        </p>
      ))}
    </div>
  );
};

// ─── PAGE ─────────────────────────────────────────────────

export const LeadSourcesPage = () => {
  // const navigate = useNavigate();
  const role     = useRole();
  const [period, setPeriod] = useState<"week" | "month" | "all">("month");
  const [activeSource, setActiveSource] = useState<string | null>(null);

  const isAdmin = ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER", "SALES_MANAGER"].includes(role);
  const totalLeads = MOCK_LEADS.length;

  // ── Per-source stats ────────────────────────────────────
  const sourceStats = SOURCES.map(src => {
    const leads     = MOCK_LEADS.filter(l => l.source === src);
    const converted = leads.filter(l =>
      ["Joined", "Membership Active", "Renewal"].includes(l.stage)
    );
    const revenue = converted.reduce((s, l) => s + (l.totalRevenue || 0), 0);
    const roi = CPL[src] > 0
      ? Math.round((revenue / (leads.length * CPL[src])) * 100)
      : null;
    return {
      source:    src,
      count:     leads.length,
      converted: converted.length,
      rate:      leads.length > 0 ? Math.round((converted.length / leads.length) * 100) : 0,
      revenue,
      cpl:       CPL[src],
      roi,
      pct:       totalLeads > 0 ? Math.round((leads.length / totalLeads) * 100) : 0,
    };
  }).sort((a, b) => b.count - a.count);

  // ── Stage funnel per source ─────────────────────────────
  const FUNNEL_STAGES = [
    "Lead Created", "Call Handling", "Followup",
    "Trial Booked", "Trial Done", "Joined", "Membership Active",
  ];
  const stageFunnelData = FUNNEL_STAGES.map(stage => {
    const row: Record<string, number | string> = { stage };
    SOURCES.forEach(src => {
      row[src] = MOCK_LEADS.filter(l => l.source === src && l.stage === stage).length;
    });
    return row;
  });

  // ── Trend data (per source using LEAD_CHART_DATA split) ─
  const trendData = LEAD_CHART_DATA.map((d, i) => ({
    label:      d.label,
    "Meta Ads": Math.round(d.value * 0.55) + (i % 2),
    "WhatsApp": Math.round(d.value * 0.28),
    "Walk-in":  Math.round(d.value * 0.17),
  }));

  // ── Centre comparison ───────────────────────────────────
  const centreData = ["Koramangala", "Indiranagar", "Whitefield"].map(c => ({
    name: c,
    "Meta Ads": MOCK_LEADS.filter(l => l.center === c && l.source === "Meta Ads").length,
    "WhatsApp": MOCK_LEADS.filter(l => l.center === c && l.source === "WhatsApp").length,
    "Walk-in":  MOCK_LEADS.filter(l => l.center === c && l.source === "Walk-in").length,
  }));

  const bestRate   = Math.max(...sourceStats.map(s => s.rate));
  const totalRev   = sourceStats.reduce((s, x) => s + x.revenue, 0);

  return (
    <div className="p-6 max-w-[1400px] space-y-5">
      <PageHeader
        title="Lead Sources"
        subtitle="Acquisition channel performance, conversion rates and ROI"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-surface border border-theme rounded-xl p-1">
              {(["week", "month", "all"] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={cn("px-3 py-1.5 rounded-lg text-[12px] font-600 transition-all",
                    period === p ? "bg-[var(--primary-color)] text-white" : "text-secondary hover-theme")}>
                  {p === "week" ? "This Week" : p === "month" ? "This Month" : "All Time"}
                </button>
              ))}
            </div>
            <Button variant="secondary" size="sm">⬇ Export</Button>
          </div>
        }
      />

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Leads"    value={totalLeads}                                   delta="12%" deltaType="up"   />
        <StatCard label="Best Conv. Rate" value={`${bestRate}%`}                              delta="Meta Ads"             />
        <StatCard label="Total Revenue"  value={`₹${(totalRev/1000).toFixed(0)}K`}            delta="18%" deltaType="up"   />
        <StatCard label="Active Sources" value={SOURCES.length}                                                            />
      </div>

      {/* ── Source scorecards + Pie ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sourceStats.map(s => (
            <button
              key={s.source}
              onClick={() => setActiveSource(activeSource === s.source ? null : s.source)}
              className={cn(
                "bg-card border rounded-2xl p-5 text-left transition-all duration-150",
                activeSource === s.source
                  ? "border-[var(--primary-color)] ring-1 ring-[var(--primary-color)]"
                  : "border-theme hover-theme hover:border-[var(--primary-color)]"
              )}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background:`${SOURCE_COLOR[s.source]}18`, color:SOURCE_COLOR[s.source] }}>
                  {SOURCE_ICON[s.source]}
                </div>
                <div>
                  <p className="text-[14px] font-700 text-primary">{s.source}</p>
                  <p className="text-[11px] text-secondary">{s.pct}% of all leads</p>
                </div>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-[24px] font-800 text-primary">{s.count}</p>
                  <p className="text-[10px] text-secondary uppercase tracking-wide">Leads</p>
                </div>
                <div>
                  <p className="text-[24px] font-800" style={{ color: SOURCE_COLOR[s.source] }}>{s.rate}%</p>
                  <p className="text-[10px] text-secondary uppercase tracking-wide">Conv. Rate</p>
                </div>
              </div>

              <ProgressBar value={s.rate} max={100} color={SOURCE_COLOR[s.source]} />

              <div className="mt-3 pt-3 border-t border-theme space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-secondary">Revenue</span>
                  <span className="text-[12px] font-700 success-text">₹{s.revenue.toLocaleString("en-IN")}</span>
                </div>
                {s.cpl > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-secondary">Cost / Lead</span>
                    <span className="text-[12px] font-600 text-primary">₹{s.cpl}</span>
                  </div>
                )}
                {s.roi !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-secondary">ROI</span>
                    <span className={cn("text-[12px] font-700", s.roi >= 100 ? "success-text" : "warning-text")}>
                      {s.roi}%
                    </span>
                  </div>
                )}
                {s.cpl === 0 && (
                  <p className="text-[10px] text-secondary italic">Organic / no cost</p>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Pie — volume share */}
        <Card className="p-5">
          <SectionLabel className="mb-3">Volume Share</SectionLabel>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={SOURCE_CHART_DATA} cx="50%" cy="50%"
                innerRadius={42} outerRadius={68} dataKey="value" strokeWidth={0}
              >
                {SOURCE_CHART_DATA.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-3 mt-2">
            {sourceStats.map((s, i) => (
              <div key={s.source}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: PIE_COLORS[i] }} />
                    <span className="text-[12px] text-secondary">{s.source}</span>
                  </div>
                  <span className="text-[12px] font-700 text-primary">{s.pct}%</span>
                </div>
                <ProgressBar value={s.count} max={totalLeads} color={PIE_COLORS[i]} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Lead trend per source ── */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <SectionLabel className="mb-0.5">Lead Volume Trend by Source</SectionLabel>
            <p className="text-[13px] text-secondary">Monthly leads per acquisition channel</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trendData}>
            <CartesianGrid vertical={false} stroke="var(--border-color)" />
            <XAxis dataKey="label" tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} />
            <Legend formatter={v => <span className="text-[11px] text-secondary">{v}</span>} iconType="circle" iconSize={6} />
            {SOURCES.map((src, i) => (
              <Line key={src} type="monotone" dataKey={src} name={src}
                stroke={PIE_COLORS[i]} strokeWidth={2}
                dot={{ fill: PIE_COLORS[i], strokeWidth:0, r:3 }}
                activeDot={{ r:5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Stage funnel + Centre breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Stage funnel per source */}
        <Card className="p-5">
          <SectionLabel className="mb-4">Stage Funnel by Source</SectionLabel>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stageFunnelData} layout="vertical" barGap={2} barCategoryGap="25%">
              <CartesianGrid horizontal={false} stroke="var(--border-color)" />
              <XAxis type="number" tick={{ fill:"var(--text-secondary)", fontSize:10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="stage" tick={{ fill:"var(--text-secondary)", fontSize:10 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
              <Legend formatter={v => <span className="text-[11px] text-secondary">{v}</span>} iconType="circle" iconSize={6} />
              {SOURCES.map((src, i) => (
                <Bar key={src} dataKey={src} fill={PIE_COLORS[i]} radius={[0,3,3,0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Centre breakdown */}
        {isAdmin && (
          <Card className="p-5">
            <SectionLabel className="mb-4">Source Mix by Centre</SectionLabel>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={centreData} barGap={3} barCategoryGap="30%">
                <CartesianGrid vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
                <Legend formatter={v => <span className="text-[11px] text-secondary">{v}</span>} iconType="circle" iconSize={6} />
                {SOURCES.map((src, i) => (
                  <Bar key={src} dataKey={src} fill={PIE_COLORS[i]} radius={[4,4,0,0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* ── Full comparison table ── */}
      <Card>
        <div className="px-5 py-4 card-header">
          <p className="text-[14px] font-700 text-primary">Source Comparison</p>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Source</Th>
              <Th>Leads</Th>
              <Th>Share</Th>
              <Th>Converted</Th>
              <Th>Conv. Rate</Th>
              <Th>Revenue</Th>
              <Th>Cost / Lead</Th>
              <Th>ROI</Th>
            </tr>
          </thead>
          <tbody>
            {sourceStats.map(s => (
              <Tr key={s.source}>
                <Td>
                  <div className="flex items-center gap-2">
                    <span style={{ color: SOURCE_COLOR[s.source], fontSize:16 }}>
                      {SOURCE_ICON[s.source]}
                    </span>
                    <span className="text-[13px] font-600 text-primary">{s.source}</span>
                  </div>
                </Td>
                <Td className="font-700 text-primary">{s.count}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <ProgressBar value={s.count} max={totalLeads} color={SOURCE_COLOR[s.source]} className="w-16" />
                    <span className="text-[12px] text-secondary">{s.pct}%</span>
                  </div>
                </Td>
                <Td className="success-text font-600">{s.converted}</Td>
                <Td>
                  <span className={cn("text-[12px] font-700",
                    s.rate >= 60 ? "success-text" : s.rate >= 40 ? "warning-text" : "danger-text")}>
                    {s.rate}%
                  </span>
                </Td>
                <Td className="font-700 success-text">₹{s.revenue.toLocaleString("en-IN")}</Td>
                <Td className="text-secondary">{s.cpl > 0 ? `₹${s.cpl}` : "Free"}</Td>
                <Td>
                  {s.roi !== null ? (
                    <span className={cn("text-[12px] font-700",
                      s.roi >= 200 ? "success-text" : s.roi >= 100 ? "warning-text" : "danger-text")}>
                      {s.roi}%
                    </span>
                  ) : (
                    <span className="text-secondary text-[12px]">—</span>
                  )}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};
