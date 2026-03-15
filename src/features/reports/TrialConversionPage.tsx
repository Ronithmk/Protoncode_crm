// features/reports/TrialConversionPage.tsx  →  /reports/trials

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { cn } from "../../utils/cn";
import {
  Card, PageHeader, Button, Avatar, StatCard,
  Table, Th, Td, Tr, SectionLabel, ProgressBar,
} from "../../components/ui";
import { MOCK_LEADS, MOCK_TRIALS } from "../../data/mockData";
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

const STATUS_CFG = {
  confirmed: { cls: "success-text success-bg",  label: "Confirmed" },
  scheduled: { cls: "warning-text warning-bg",  label: "Scheduled" },
  done:      { cls: "text-secondary bg-surface border border-theme", label: "Done" },
  "no-show": { cls: "danger-text danger-bg",    label: "No-show"  },
} as const;

export const TrialConversionPage = () => {
  const role    = useRole();
  const [filter, setFilter] = useState<"all" | "confirmed" | "scheduled" | "done" | "no-show">("all");

  const isAdmin = ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER", "TRAINING_MANAGER"].includes(role);

  // Trial stats from mock data
  const total     = MOCK_TRIALS.length;
  const confirmed = MOCK_TRIALS.filter(t => t.status === "confirmed").length;
  const done      = MOCK_TRIALS.filter(t => t.status === "done").length;
  const noShow    = MOCK_TRIALS.filter(t => t.status === "no_show").length;
  const scheduled = MOCK_TRIALS.filter(t => t.status === "scheduled").length;

  // Conversion: leads who did trial and then joined
  const trialLeads   = MOCK_LEADS.filter(l => ["Trial Booked", "Trial Done", "Joined", "Membership Active"].includes(l.stage));
  const convertedFromTrial = MOCK_LEADS.filter(l => ["Joined", "Membership Active"].includes(l.stage)).length;
  const trialConvRate = trialLeads.length > 0 ? Math.round((convertedFromTrial / trialLeads.length) * 100) : 0;

  // Program breakdown
  const programs = [...new Set(MOCK_TRIALS.map(t => t.program))];
  const programData = programs.map(p => ({
    program: p,
    total:   MOCK_TRIALS.filter(t => t.program === p).length,
    done:    MOCK_TRIALS.filter(t => t.program === p && t.status === "done").length,
    noShow:  MOCK_TRIALS.filter(t => t.program === p && t.status === "no_show").length,
  }));

  // Trainer performance
  const trainers = [...new Set(MOCK_TRIALS.map(t => t.trainer))];
  const trainerData = trainers.map(name => ({
    name,
    total:     MOCK_TRIALS.filter(t => t.trainer === name).length,
    completed: MOCK_TRIALS.filter(t => t.trainer === name && t.status === "done").length,
    noShow:    MOCK_TRIALS.filter(t => t.trainer === name && t.status === "no_show").length,
  }));

  // Chart data: trials by day
  const byDate = [...new Set(MOCK_TRIALS.map(t => t.date))].sort().map(date => ({
    label:     date.slice(5),
    trials:    MOCK_TRIALS.filter(t => t.date === date).length,
    confirmed: MOCK_TRIALS.filter(t => t.date === date && t.status === "confirmed").length,
  }));

  const visible = filter === "all" ? MOCK_TRIALS : MOCK_TRIALS.filter(t => t.status === filter);

  return (
    <div className="p-6 max-w-[1400px] space-y-5">
      <PageHeader
        title="Trial Conversion"
        subtitle="Trial session performance, attendance and post-trial conversions"
        actions={<Button variant="secondary" size="sm">⬇ Export</Button>}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Trials"     value={total}              delta="8%"  deltaType="up"   />
        <StatCard label="Conversion Rate"  value={`${trialConvRate}%`} delta="5%" deltaType="up"   />
        <StatCard label="No-shows"         value={noShow}             delta="2%"  deltaType="down" />
        <StatCard label="Completed"        value={done}                                            />
      </div>

      {/* Status pills + chart */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5">
        <Card className="p-5">
          <SectionLabel className="mb-4">Trials by Date</SectionLabel>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byDate} barGap={3} barCategoryGap="35%">
              <CartesianGrid vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="label" tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
              <Bar dataKey="trials"    name="Total"     fill="var(--primary-color)" radius={[4,4,0,0]} />
              <Bar dataKey="confirmed" name="Confirmed" fill="var(--success-color)" radius={[4,4,0,0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Status breakdown */}
        <Card className="p-5">
          <SectionLabel className="mb-4">Status Breakdown</SectionLabel>
          <div className="space-y-3">
            {[
              { label:"Confirmed", value: confirmed, color:"var(--success-color)" },
              { label:"Scheduled", value: scheduled, color:"var(--warning-color)" },
              { label:"Done",      value: done,      color:"var(--text-secondary)" },
              { label:"No-show",   value: noShow,    color:"var(--danger-color)"  },
            ].map(s => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] text-secondary">{s.label}</span>
                  <span className="text-[13px] font-700 text-primary">{s.value}</span>
                </div>
                <ProgressBar value={s.value} max={total} color={s.color} />
              </div>
            ))}
          </div>

          {/* Program stats */}
          <div className="mt-5 pt-4 border-t border-theme">
            <p className="text-[11px] font-700 text-secondary uppercase tracking-wider mb-3">By Program</p>
            {programData.map(p => (
              <div key={p.program} className="flex items-center justify-between py-1.5">
                <span className="text-[12px] text-secondary">{p.program}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] success-text">{p.done} done</span>
                  <span className="text-[11px] font-600 text-primary">{p.total} total</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Trainer performance */}
      {isAdmin && (
        <Card>
          <div className="px-5 py-4 card-header">
            <p className="text-[14px] font-700 text-primary">Trainer Performance</p>
          </div>
          <Table>
            <thead>
              <tr><Th>Trainer</Th><Th>Total Trials</Th><Th>Completed</Th><Th>No-shows</Th><Th>Completion Rate</Th></tr>
            </thead>
            <tbody>
              {trainerData.map(t => {
                const rate = t.total > 0 ? Math.round((t.completed / t.total) * 100) : 0;
                return (
                  <Tr key={t.name}>
                    <Td><div className="flex items-center gap-2"><Avatar name={t.name} size={26} /><span className="text-[13px] font-600 text-primary">{t.name}</span></div></Td>
                    <Td className="font-600 text-primary">{t.total}</Td>
                    <Td className="success-text font-600">{t.completed}</Td>
                    <Td className="danger-text font-600">{t.noShow}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <ProgressBar value={rate} max={100} color={rate >= 80 ? "var(--success-color)" : "var(--warning-color)"} className="w-20" />
                        <span className={cn("text-[12px] font-700", rate >= 80 ? "success-text" : "warning-text")}>{rate}%</span>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      )}

      {/* Trial list with filter */}
      <Card>
        <div className="px-5 py-4 card-header flex items-center justify-between flex-wrap gap-3">
          <p className="text-[14px] font-700 text-primary">All Trials</p>
          <div className="flex items-center gap-1">
            {(["all", "confirmed", "scheduled", "done", "no-show"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn("px-3 py-1 rounded-lg text-[11px] font-600 transition-all capitalize",
                  filter === f ? "bg-[var(--primary-color)] text-white" : "text-secondary hover-theme")}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <Table>
          <thead><tr><Th>Lead</Th><Th>Program</Th><Th>Batch</Th><Th>Trainer</Th><Th>Date</Th><Th>Time</Th><Th>Status</Th></tr></thead>
          <tbody>
            {visible.map(t => (
              <Tr key={t.id}>
                <Td><div className="flex items-center gap-2"><Avatar name={t.leadName} size={26} /><div><p className="text-[13px] font-600 text-primary">{t.leadName}</p><p className="text-[11px] text-secondary">{t.phone}</p></div></div></Td>
                <Td className="text-secondary">{t.program}</Td>
                <Td className="text-secondary">{t.batch}</Td>
                <Td className="text-secondary">{t.trainer}</Td>
                <Td className="text-secondary">{t.date}</Td>
                <Td className="font-600 text-primary">{t.time}</Td>
                <Td>
                  <span className={cn("text-[10px] font-700 px-2 py-0.5 rounded-full", STATUS_CFG[t.status as keyof typeof STATUS_CFG]?.cls ?? "text-secondary bg-surface")}>
                    {STATUS_CFG[t.status as keyof typeof STATUS_CFG]?.label ?? t.status}
                  </span>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};
