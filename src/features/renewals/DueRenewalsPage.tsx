// features/renewals/DueRenewalsPage.tsx  →  /renewals

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { cn } from "../../utils/cn";
import {
  Card, PageHeader, Button, Avatar, EmptyState,
  StatCard, Table, Th, Td, Tr, SectionLabel,
} from "../../components/ui";
import { MOCK_LEADS } from "../../data/mockData";
import { useRole } from "../../store/useAuthStore";

// ─── SHARED WITHIN RENEWALS ───────────────────────────────

export const PLAN_COLOR: Record<string, string> = {
  Monthly: "var(--primary-color)", Quarterly: "var(--success-color)",
  "Half-Yearly": "var(--warning-color)", Annual: "#f472b6",
};

export const PlanBadge = ({ plan }: { plan: string }) => (
  <span className="text-[10px] font-700 px-2 py-0.5 rounded-full"
    style={{ color: PLAN_COLOR[plan] ?? "var(--text-secondary)", background: `${PLAN_COLOR[plan] ?? "var(--text-secondary)"}18` }}>
    {plan}
  </span>
);

export const SearchBar = ({ value, onChange, placeholder = "Search members..." }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) => (
  <div className="flex items-center gap-2 bg-surface border border-theme rounded-lg px-3 py-2 min-w-[220px]">
    <svg className="w-3.5 h-3.5 text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="bg-transparent text-[13px] text-primary placeholder:text-secondary outline-none w-full" />
  </div>
);

export const CentreFilter = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="flex items-center gap-1 bg-surface border border-theme rounded-xl p-1">
    {["All", "Koramangala", "Indiranagar", "Whitefield"].map(c => (
      <button key={c} onClick={() => onChange(c)}
        className={cn("px-3 py-1.5 rounded-lg text-[12px] font-600 transition-all",
          value === c ? "bg-[var(--primary-color)] text-white" : "text-secondary hover-theme")}>
        {c}
      </button>
    ))}
  </div>
);

export const ChartTooltip = ({ active, payload, label }: any) => {
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

// ─── PAGE ─────────────────────────────────────────────────

export const DueRenewalsPage = () => {
  const navigate = useNavigate();
  const role     = useRole();

  const [search, setSearch] = useState("");
  const [centre, setCentre] = useState("All");
  const [sortBy, setSortBy] = useState<"revenue" | "name" | "plan">("revenue");

  const canProcess = ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER", "FM"].includes(role);

  const allRenewals = MOCK_LEADS.filter(l => l.stage === "Renewal");

  const filtered = allRenewals
    .filter(l =>
      (centre === "All" || l.center === centre) &&
      (!search || l.name.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "revenue") return (b.totalRevenue ?? 0) - (a.totalRevenue ?? 0);
      if (sortBy === "name")    return a.name.localeCompare(b.name);
      return (a.membershipPlan ?? "").localeCompare(b.membershipPlan ?? "");
    });

  const revenueAtRisk = allRenewals.reduce((s, l) => s + (l.totalRevenue || 0), 0);
  const urgent        = allRenewals.filter(l => (l.totalRevenue ?? 0) >= 10000);
  const moderate      = allRenewals.filter(l => (l.totalRevenue ?? 0) >= 5000 && (l.totalRevenue ?? 0) < 10000);
  const low           = allRenewals.filter(l => (l.totalRevenue ?? 0) < 5000);

  const centreChartData = ["Koramangala", "Indiranagar", "Whitefield"].map(c => ({
    name:    c,
    due:     allRenewals.filter(l => l.center === c).length,
    revenue: Math.round(allRenewals.filter(l => l.center === c).reduce((s,l)=>s+(l.totalRevenue||0),0) / 1000),
  }));

  const planChartData = ["Monthly", "Quarterly", "Half-Yearly", "Annual"].map(plan => ({
    name:  plan,
    count: allRenewals.filter(l => l.membershipPlan === plan).length,
  }));

  return (
    <div className="p-6 max-w-[1400px] space-y-5">
      <PageHeader
        title="Due Renewals"
        subtitle={`${allRenewals.length} members need renewal action`}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">⬇ Export</Button>
            {canProcess && <Button variant="primary" size="sm">📢 Bulk Remind</Button>}
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Due Now"         value={allRenewals.length}                             delta="Needs action" deltaType="down" />
        <StatCard label="Revenue at Risk" value={`₹${(revenueAtRisk/1000).toFixed(0)}K`}        delta="If all lapse" deltaType="down" />
        <StatCard label="Critical"        value={urgent.length}                                  delta="High-value"   deltaType="down" />
        <StatCard label="Avg Value"       value={`₹${allRenewals.length > 0 ? Math.round(revenueAtRisk/allRenewals.length).toLocaleString("en-IN") : 0}`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <SectionLabel className="mb-4">Due by Centre</SectionLabel>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={centreChartData} barGap={4} barCategoryGap="40%">
              <CartesianGrid vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
              <Bar dataKey="due"     name="Members Due" fill="var(--danger-color)"   radius={[4,4,0,0]} />
              <Bar dataKey="revenue" name="Risk (₹K)"   fill="var(--warning-color)" radius={[4,4,0,0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <SectionLabel className="mb-4">Due by Plan</SectionLabel>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={planChartData} barCategoryGap="40%">
              <CartesianGrid vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
              <Bar dataKey="count" name="Members" fill="var(--primary-color)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Urgency tiers */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:"Critical",    members: urgent,   color:"var(--danger-color)",   desc:"Annual / ≥ ₹10K plans" },
          { label:"Moderate",    members: moderate, color:"var(--warning-color)",  desc:"Quarterly / Half-Yearly" },
          { label:"Low Priority",members: low,      color:"var(--text-secondary)", desc:"Monthly plans" },
        ].map(tier => (
          <div key={tier.label} className="bg-card border border-theme rounded-2xl px-5 py-4">
            <div className="flex items-start justify-between mb-1">
              <p className="text-[12px] font-700 text-secondary uppercase tracking-wide">{tier.label}</p>
              <p className="text-[24px] font-800" style={{ color: tier.color }}>{tier.members.length}</p>
            </div>
            <p className="text-[11px] text-secondary">{tier.desc}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <SearchBar value={search} onChange={setSearch} />
          <CentreFilter value={centre} onChange={setCentre} />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[12px] text-secondary mr-1">Sort by:</span>
          {(["revenue", "name", "plan"] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className={cn("px-3 py-1.5 rounded-lg text-[12px] font-600 transition-all capitalize",
                sortBy === s ? "bg-[var(--primary-color)] text-white" : "text-secondary hover-theme")}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="px-5 py-3.5 card-header flex items-center justify-between">
          <p className="text-[11px] font-700 text-secondary uppercase tracking-wider">Renewal Queue</p>
          <p className="text-[11px] text-secondary">{filtered.length} members</p>
        </div>
        {filtered.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th>Member</Th><Th>Centre</Th><Th>Plan</Th>
                <Th>Last Value</Th><Th>Expiry</Th>
                {canProcess && <Th>Actions</Th>}
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
                  <Td>{lead.membershipPlan ? <PlanBadge plan={lead.membershipPlan} /> : <span className="text-secondary">—</span>}</Td>
                  <Td className="font-700 text-primary">₹{lead.totalRevenue?.toLocaleString("en-IN") ?? "—"}</Td>
                  <Td className="text-secondary">{lead.membershipEnd ?? "—"}</Td>
                  {canProcess && (
                    <Td>
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        <Button variant="secondary" size="sm">Remind</Button>
                        <Button variant="primary"   size="sm">Renew</Button>
                      </div>
                    </Td>
                  )}
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState icon="✓" title="No renewals pending" description="All members are up to date." />
        )}
      </Card>
    </div>
  );
};
