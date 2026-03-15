// features/renewals/LapsedMembersPage.tsx  →  /renewals/lapsed

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Card, PageHeader, Button, Avatar, EmptyState,
  StatCard, Table, Th, Td, Tr, SectionLabel, ProgressBar,
} from "../../components/ui";
import { MOCK_LEADS } from "../../data/mockData";
import { useRole } from "../../store/useAuthStore";
import { SearchBar, CentreFilter, ChartTooltip } from "./DueRenewalsPage";

export const LapsedMembersPage = () => {
  const navigate   = useNavigate();
  const role       = useRole();
  const [search, setSearch]     = useState("");
  const [centre, setCentre]     = useState("All");
  const [selected, setSelected] = useState<string[]>([]);

  const canWinback = ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER", "FM", "RM"].includes(role);

  // Lapsed = was a member (has membershipPlan or totalRevenue) but now in early-stage
  const lapsed = MOCK_LEADS.filter(l =>
    ["Followup", "Call Handling"].includes(l.stage)
  );

  const filtered = lapsed.filter(l =>
    (centre === "All" || l.center === centre) &&
    (!search || l.name.toLowerCase().includes(search.toLowerCase()))
  );

  const lostRevEst = lapsed.length * 4500;
  const recoverable = Math.ceil(lapsed.length * 0.6);

  // Lapsed by centre
  const centreData = ["Koramangala", "Indiranagar", "Whitefield"].map(c => ({
    name:    c,
    lapsed:  lapsed.filter(l => l.center === c).length,
    est_rev: Math.round(lapsed.filter(l => l.center === c).length * 4.5),
  }));

  // Lapsed by stage (shows where they dropped off)
  const stageData = ["Call Handling", "Followup"].map(stage => ({
    name:  stage,
    count: lapsed.filter(l => l.stage === stage).length,
  }));

  // Toggle row selection
  const toggleSelect = (id: string) =>
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map(l => l.id));

  return (
    <div className="p-6 max-w-[1400px] space-y-5">
      <PageHeader
        title="Lapsed Members"
        subtitle="Former members who haven't renewed — win-back opportunities"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">⬇ Export</Button>
            {canWinback && selected.length > 0 && (
              <Button variant="primary" size="sm">
                📢 Remind {selected.length} Selected
              </Button>
            )}
            {canWinback && selected.length === 0 && (
              <Button variant="primary" size="sm">📢 Bulk Remind</Button>
            )}
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Lapsed"         value={lapsed.length}                                delta="Needs win-back" deltaType="down" />
        <StatCard label="Recoverable"    value={recoverable}                                  delta="~60% return"   deltaType="up"   />
        <StatCard label="Lost Rev/Month" value={`₹${(lostRevEst/1000).toFixed(0)}K`}         delta="Estimated"     deltaType="down" />
        <StatCard label="Win-back Rate"  value="60%"                                           delta="Industry avg"  deltaType="up"   />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <SectionLabel className="mb-4">Lapsed by Centre</SectionLabel>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={centreData} barGap={4} barCategoryGap="40%">
              <CartesianGrid vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
              <Bar dataKey="lapsed"  name="Lapsed"    fill="var(--danger-color)"   radius={[4,4,0,0]} />
              <Bar dataKey="est_rev" name="Lost (₹K)" fill="var(--warning-color)" radius={[4,4,0,0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <SectionLabel className="mb-4">Drop-off Stage</SectionLabel>
          <div className="space-y-4 mt-6">
            {stageData.map(s => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-600 text-primary">{s.name}</span>
                  <span className="text-[14px] font-800 danger-text">{s.count}</span>
                </div>
                <ProgressBar value={s.count} max={lapsed.length || 1} color="var(--danger-color)" />
                <p className="text-[11px] text-secondary mt-1">
                  {lapsed.length > 0 ? Math.round((s.count / lapsed.length) * 100) : 0}% of lapsed members
                </p>
              </div>
            ))}
          </div>

          {/* Win-back potential */}
          <div className="mt-6 pt-4 border-t border-theme">
            <p className="text-[11px] font-700 text-secondary uppercase tracking-wider mb-3">Win-back Potential</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface border border-theme rounded-xl p-3 text-center">
                <p className="text-[22px] font-800 success-text">{recoverable}</p>
                <p className="text-[10px] text-secondary mt-0.5">Recoverable</p>
              </div>
              <div className="bg-surface border border-theme rounded-xl p-3 text-center">
                <p className="text-[22px] font-800 warning-text">₹{(recoverable * 4.5).toFixed(0)}K</p>
                <p className="text-[10px] text-secondary mt-0.5">Est. Recovery</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <SearchBar value={search} onChange={setSearch} />
        <CentreFilter value={centre} onChange={setCentre} />
      </div>

      {/* Members table */}
      <Card>
        <div className="px-5 py-3.5 card-header flex items-center justify-between">
          <p className="text-[11px] font-700 text-secondary uppercase tracking-wider">
            Lapsed Members
            {selected.length > 0 && (
              <span className="ml-2 text-[var(--primary-color)]">· {selected.length} selected</span>
            )}
          </p>
          <p className="text-[11px] text-secondary">{filtered.length} records</p>
        </div>
        {filtered.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th className="w-10">
                  <input type="checkbox"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="rounded border-theme bg-transparent" />
                </Th>
                <Th>Member</Th><Th>Centre</Th><Th>Last Stage</Th>
                <Th>Last Activity</Th>
                {canWinback && <Th>Actions</Th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <Tr key={lead.id} onClick={() => navigate(`/leads/${lead.id}`)}>
                  <Td>
                    <input type="checkbox" checked={selected.includes(lead.id)}
                      onChange={e => { e.stopPropagation(); toggleSelect(lead.id); }}
                      onClick={e => e.stopPropagation()}
                      className="rounded border-theme bg-transparent" />
                  </Td>
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
                  <Td>
                    <span className="text-[11px] font-600 text-primary">{lead.stage}</span>
                  </Td>
                  <Td className="text-secondary">{lead.lastActivity}</Td>
                  {canWinback && (
                    <Td>
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        <Button variant="secondary" size="sm">Call</Button>
                        <Button variant="primary"   size="sm">Offer</Button>
                      </div>
                    </Td>
                  )}
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState icon="🎉" title="No lapsed members" description="Everyone's still active." />
        )}
      </Card>
    </div>
  );
};
