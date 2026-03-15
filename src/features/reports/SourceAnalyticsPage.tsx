// features/reports/SourceAnalyticsPage.tsx  →  /reports/sources

import { useState } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { cn } from "../../utils/cn";
import {
  Card, PageHeader, Button, StatCard,
  Table, Th, Td, Tr, SectionLabel, ProgressBar,
} from "../../components/ui";
import { MOCK_LEADS, SOURCE_CHART_DATA } from "../../data/mockData";

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

const SOURCE_COLOR: Record<string, string> = {
  "Meta Ads": "var(--primary-color)",
  "WhatsApp": "var(--success-color)",
  "Walk-in":  "var(--warning-color)",
};
const SOURCE_ICON: Record<string, string> = {
  "Meta Ads": "⬡", "WhatsApp": "◉", "Walk-in": "◈",
};
const PIE_COLORS = ["var(--primary-color)", "var(--success-color)", "var(--warning-color)"];

export const SourceAnalyticsPage = () => {
  const [view, setView] = useState<"volume" | "conversion" | "revenue">("volume");

  const sources    = ["Meta Ads", "WhatsApp", "Walk-in"];
  const totalLeads = MOCK_LEADS.length;

  const sourceStats = sources.map((src, i) => {
    const leads     = MOCK_LEADS.filter(l => l.source === src);
    const converted = leads.filter(l => ["Joined", "Membership Active", "Renewal"].includes(l.stage));
    const revenue   = converted.reduce((s,l) => s+(l.totalRevenue||0), 0);
    return {
      source:    src,
      count:     leads.length,
      converted: converted.length,
      rate:      leads.length > 0 ? Math.round((converted.length / leads.length) * 100) : 0,
      revenue,
      pct:       Math.round((leads.length / totalLeads) * 100),
      color:     PIE_COLORS[i],
    };
  }).sort((a, b) => b.count - a.count);

  // const totalRevenue = sourceStats.reduce((s, x) => s + x.revenue, 0);

  // Stage breakdown per source
  const STAGES = ["Lead Created", "Call Handling", "Followup", "Trial Booked", "Trial Done", "Joined", "Membership Active", "Renewal"];
  const stageBySource = sources.map(src => {
    const row: Record<string, number | string> = { source: src };
    STAGES.forEach(stage => {
      row[stage] = MOCK_LEADS.filter(l => l.source === src && l.stage === stage).length;
    });
    return row;
  });

  // Bar chart data based on selected view
  const barData = sourceStats.map(s => ({
    name:       s.source,
    Volume:     s.count,
    Converted:  s.converted,
    "Conv. %":  s.rate,
    Revenue:    s.revenue,
  }));

  const barKey  = view === "volume" ? ["Volume", "Converted"] : view === "conversion" ? ["Conv. %"] : ["Revenue"];
  const barFill = ["var(--primary-color)", "var(--success-color)"];

  return (
    <div className="p-6 max-w-[1400px] space-y-5">
      <PageHeader
        title="Source Analytics"
        subtitle="Lead acquisition channel performance and ROI breakdown"
        actions={<Button variant="secondary" size="sm">⬇ Export</Button>}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Sources"    value={sources.length}                                    />
        <StatCard label="Best Conv. Rate"  value={`${Math.max(...sourceStats.map(s=>s.rate))}%`}  delta="Meta Ads" deltaType="up" />
        <StatCard label="Top by Volume"    value={sourceStats[0]?.source ?? "—"}                    />
        <StatCard label="Revenue (Top Src)"value={`₹${((sourceStats.sort((a,b)=>b.revenue-a.revenue)[0]?.revenue??0)/1000).toFixed(0)}K`} delta="All time" deltaType="up" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">
        {/* Bar chart with view toggle */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <SectionLabel className="mb-0">Source Performance</SectionLabel>
            <div className="flex gap-1 bg-surface border border-theme rounded-xl p-1">
              {(["volume", "conversion", "revenue"] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={cn("px-3 py-1 rounded-lg text-[11px] font-600 transition-all capitalize",
                    view === v ? "bg-[var(--primary-color)] text-white" : "text-secondary hover-theme")}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barGap={4} barCategoryGap="40%">
              <CartesianGrid vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false}
                tickFormatter={view === "revenue" ? (v => `₹${(v/1000).toFixed(0)}K`) : undefined} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
              <Legend formatter={v => <span className="text-[11px] text-secondary">{v}</span>} iconType="circle" iconSize={6} />
              {barKey.map((k, i) => (
                <Bar key={k} dataKey={k} fill={barFill[i] ?? "var(--warning-color)"} radius={[4,4,0,0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie chart */}
        <Card className="p-5">
          <SectionLabel className="mb-4">Volume Share</SectionLabel>
          <div className="flex justify-center mb-4">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={SOURCE_CHART_DATA} cx="50%" cy="50%"
                  innerRadius={45} outerRadius={68} dataKey="value" strokeWidth={0}>
                  {SOURCE_CHART_DATA.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {sourceStats.map(s => (
              <div key={s.source}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span style={{ color: SOURCE_COLOR[s.source] }}>{SOURCE_ICON[s.source]}</span>
                    <span className="text-[12px] text-secondary">{s.source}</span>
                  </div>
                  <span className="text-[12px] font-700 text-primary">{s.pct}%</span>
                </div>
                <ProgressBar value={s.count} max={totalLeads} color={SOURCE_COLOR[s.source]} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Source scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sourceStats.map(s => (
          <Card key={s.source} className="p-5">
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
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-[22px] font-800 text-primary">{s.count}</p>
                <p className="text-[10px] text-secondary uppercase tracking-wide">Leads</p>
              </div>
              <div>
                <p className="text-[22px] font-800" style={{ color: SOURCE_COLOR[s.source] }}>{s.rate}%</p>
                <p className="text-[10px] text-secondary uppercase tracking-wide">Converted</p>
              </div>
            </div>
            <ProgressBar value={s.rate} max={100} color={SOURCE_COLOR[s.source]} />
            <div className="mt-3 pt-3 border-t border-theme flex items-center justify-between">
              <span className="text-[11px] text-secondary">Revenue</span>
              <span className="text-[13px] font-700 success-text">₹{s.revenue.toLocaleString("en-IN")}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Stage breakdown table */}
      <Card>
        <div className="px-5 py-4 card-header">
          <p className="text-[14px] font-700 text-primary">Stage Breakdown by Source</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <Th>Source</Th>
                {["Lead Created","Followup","Trial Booked","Trial Done","Joined","Membership Active","Renewal"].map(s => (
                  <Th key={s}>{s}</Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stageBySource.map(row => (
                <Tr key={row.source as string}>
                  <Td>
                    <span className="flex items-center gap-2 font-600 text-primary">
                      <span style={{ color: SOURCE_COLOR[row.source as string] }}>
                        {SOURCE_ICON[row.source as string]}
                      </span>
                      {row.source}
                    </span>
                  </Td>
                  {["Lead Created","Followup","Trial Booked","Trial Done","Joined","Membership Active","Renewal"].map(stage => (
                    <Td key={stage} className="font-600 text-primary text-center">
                      {(row[stage] as number) > 0 ? row[stage] : <span className="text-secondary">—</span>}
                    </Td>
                  ))}
                </Tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
