// features/schedule/BatchSchedulePage.tsx  →  /schedule/batches

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { cn } from "../../utils/cn";
import {
  Card, PageHeader, Button, Avatar, EmptyState,
  ProgressBar, SectionLabel, StatCard, Modal, Input, Select,
} from "../../components/ui";
import { MOCK_TRIALS } from "../../data/mockData";
import { useRole } from "../../store/useAuthStore";

// ─── TYPES ────────────────────────────────────────────────

type BatchStatus = "active" | "full" | "paused";

type Batch = {
  id: string; name: string; program: string; trainer: string;
  days: string; time: string; centre: string;
  capacity: number; enrolled: number; status: BatchStatus;
  startDate: string;
};

// ─── MOCK DATA ────────────────────────────────────────────

const BATCHES: Batch[] = [
  { id:"B001", name:"BJJ Basics",     program:"BJJ",        trainer:"Coach Reddy", days:"Mon/Wed/Fri", time:"6:00 PM",  centre:"Koramangala", capacity:15, enrolled:12, status:"active", startDate:"2025-01-06" },
  { id:"B002", name:"Kickboxing AM",  program:"Kickboxing", trainer:"Coach Meena", days:"Tue/Thu/Sat", time:"8:00 AM",  centre:"Koramangala", capacity:20, enrolled:20, status:"full",   startDate:"2025-01-07" },
  { id:"B003", name:"MMA Intro",      program:"MMA",        trainer:"Coach Reddy", days:"Mon/Wed/Fri", time:"7:30 PM",  centre:"Indiranagar",  capacity:12, enrolled:7,  status:"active", startDate:"2025-01-13" },
  { id:"B004", name:"BJJ Advanced",   program:"BJJ",        trainer:"Coach Reddy", days:"Tue/Thu",     time:"6:30 PM",  centre:"Indiranagar",  capacity:10, enrolled:9,  status:"active", startDate:"2024-12-03" },
  { id:"B005", name:"Kickboxing Eve", program:"Kickboxing", trainer:"Coach Meena", days:"Mon/Wed/Fri", time:"7:00 PM",  centre:"Whitefield",   capacity:18, enrolled:14, status:"active", startDate:"2025-01-06" },
  { id:"B006", name:"Kids BJJ",       program:"BJJ",        trainer:"Coach Reddy", days:"Sat/Sun",     time:"10:00 AM", centre:"Koramangala", capacity:10, enrolled:6,  status:"active", startDate:"2025-02-01" },
  { id:"B007", name:"Wrestling",      program:"Wrestling",  trainer:"Coach Kumar", days:"Tue/Thu/Sat", time:"5:30 PM",  centre:"Whitefield",   capacity:12, enrolled:4,  status:"paused", startDate:"2025-01-14" },
];

// ─── CONSTANTS ────────────────────────────────────────────

const PROG_COLOR: Record<string, string> = {
  BJJ:        "var(--primary-color)",
  Kickboxing: "var(--warning-color)",
  MMA:        "var(--danger-color)",
  Wrestling:  "#f472b6",
};

const STATUS_CFG: Record<BatchStatus, { cls: string; label: string }> = {
  active: { cls:"success-text success-bg",                          label:"Active" },
  full:   { cls:"warning-text warning-bg",                          label:"Full"   },
  paused: { cls:"text-secondary bg-surface border border-theme",    label:"Paused" },
};

// ─── CHART TOOLTIP ────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-theme rounded-xl px-3 py-2 text-[12px] shadow-xl">
      {label && <p className="text-secondary mb-1 font-600">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.fill ?? "var(--primary-color)" }} className="font-700">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

// ─── BATCH DETAIL MODAL ───────────────────────────────────

const BatchDetailModal = ({ batch, onClose }: { batch: Batch; onClose: () => void }) => {
  const trialsForBatch = MOCK_TRIALS.filter(t => t.batch === batch.name);
  const fillPct = Math.round((batch.enrolled / batch.capacity) * 100);
  const barColor = fillPct >= 90 ? "var(--danger-color)" : fillPct >= 70 ? "var(--warning-color)" : "var(--success-color)";
  const cfg = STATUS_CFG[batch.status];

  return (
    <Modal open={true} onClose={onClose} title={batch.name} width="max-w-xl">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-theme">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background:`${PROG_COLOR[batch.program]}18`, color:PROG_COLOR[batch.program] }}>
            🥋
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-700 px-2 py-0.5 rounded-full"
                style={{ color:PROG_COLOR[batch.program], background:`${PROG_COLOR[batch.program]}18` }}>
                {batch.program}
              </span>
              <span className={cn("text-[10px] font-700 px-2 py-0.5 rounded-full", cfg.cls)}>
                {cfg.label}
              </span>
            </div>
            <p className="text-[11px] text-secondary mt-1">{batch.centre} · Started {batch.startDate}</p>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label:"Trainer",   value:batch.trainer },
            { label:"Schedule",  value:batch.days    },
            { label:"Time",      value:batch.time    },
            { label:"Centre",    value:batch.centre  },
          ].map(d => (
            <div key={d.label} className="bg-surface border border-theme rounded-xl px-4 py-3">
              <p className="text-[10px] text-secondary uppercase tracking-wider">{d.label}</p>
              <p className="text-[13px] font-700 text-primary mt-0.5">{d.value}</p>
            </div>
          ))}
        </div>

        {/* Capacity */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-600 text-primary">Capacity</p>
            <p className="text-[14px] font-800 text-primary">{batch.enrolled}/{batch.capacity}</p>
          </div>
          <ProgressBar value={batch.enrolled} max={batch.capacity} color={barColor} />
          <div className="flex justify-between mt-1">
            <p className="text-[11px] text-secondary">{fillPct}% filled</p>
            <p className="text-[11px] text-secondary">{batch.capacity - batch.enrolled} spots available</p>
          </div>
        </div>

        {/* Recent trial sessions */}
        {trialsForBatch.length > 0 && (
          <div>
            <p className="text-[12px] font-700 text-secondary uppercase tracking-wider mb-2">Trial Sessions</p>
            <div className="space-y-2">
              {trialsForBatch.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-theme">
                  <Avatar name={t.leadName} size={28} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-600 text-primary">{t.leadName}</p>
                    <p className="text-[11px] text-secondary">{t.date} · {t.time}</p>
                  </div>
                  <span className={cn("text-[10px] font-700 px-2 py-0.5 rounded-full",
                    t.status === "confirmed" ? "success-text success-bg" :
                    t.status === "done"      ? "text-secondary bg-surface border border-theme" :
                    "warning-text warning-bg")}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2 mt-6">
        <Button variant="secondary" className="flex-1">View Full Roster</Button>
        <Button variant="primary"   className="flex-1">Edit Batch</Button>
      </div>
    </Modal>
  );
};

// ─── NEW BATCH MODAL ──────────────────────────────────────

const NewBatchModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [form, setForm] = useState({
    name:"", program:"BJJ", trainer:"Coach Reddy",
    days:"Mon/Wed/Fri", time:"", centre:"Koramangala", capacity:"12",
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Modal open={open} onClose={onClose} title="Create New Batch" width="max-w-lg">
      <div className="space-y-4">
        <Input label="Batch Name *" placeholder="e.g. BJJ Intermediate" value={form.name} onChange={e => set("name", e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Program" value={form.program} onChange={e => set("program", e.target.value)}>
            {["BJJ","Kickboxing","MMA","Wrestling"].map(p => <option key={p}>{p}</option>)}
          </Select>
          <Select label="Trainer" value={form.trainer} onChange={e => set("trainer", e.target.value)}>
            {["Coach Reddy","Coach Meena","Coach Kumar"].map(t => <option key={t}>{t}</option>)}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Days" placeholder="Mon/Wed/Fri" value={form.days} onChange={e => set("days", e.target.value)} />
          <Input label="Time" placeholder="6:00 PM" value={form.time} onChange={e => set("time", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Centre" value={form.centre} onChange={e => set("centre", e.target.value)}>
            {["Koramangala","Indiranagar","Whitefield"].map(c => <option key={c}>{c}</option>)}
          </Select>
          <Input label="Max Capacity" type="number" value={form.capacity} onChange={e => set("capacity", e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={!form.name || !form.time}>Create Batch →</Button>
      </div>
    </Modal>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────

export const BatchSchedulePage = () => {
  const navigate    = useNavigate();
  const role        = useRole();

  const [centreFilter, setCentreFilter] = useState("All");
  const [progFilter, setProgFilter]     = useState("All");
  const [search, setSearch]             = useState("");
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showNewBatch, setShowNewBatch] = useState(false);
  const [viewMode, setViewMode]         = useState<"grid" | "table">("grid");

  const canManage = ["SUPER_ADMIN","ADMIN","CENTER_MANAGER","TRAINING_MANAGER"].includes(role);

  const visible = BATCHES.filter(b =>
    (centreFilter === "All" || b.centre === centreFilter) &&
    (progFilter   === "All" || b.program === progFilter) &&
    (!search || b.name.toLowerCase().includes(search.toLowerCase()) || b.trainer.toLowerCase().includes(search.toLowerCase()))
  );

  const totalEnrolled  = BATCHES.reduce((s,b) => s + b.enrolled, 0);
  const totalCap       = BATCHES.reduce((s,b) => s + b.capacity, 0);
  const activeBatches  = BATCHES.filter(b => b.status === "active").length;
  const fullBatches    = BATCHES.filter(b => b.status === "full").length;

  // Programme breakdown chart
  const progChartData = ["BJJ","Kickboxing","MMA","Wrestling"].map(prog => ({
    name:     prog,
    batches:  BATCHES.filter(b => b.program === prog).length,
    enrolled: BATCHES.filter(b => b.program === prog).reduce((s,b) => s+b.enrolled, 0),
  }));

  // Capacity per centre
  const centreCapData = ["Koramangala","Indiranagar","Whitefield"].map(c => ({
    name:     c,
    enrolled: BATCHES.filter(b => b.centre === c).reduce((s,b) => s+b.enrolled, 0),
    capacity: BATCHES.filter(b => b.centre === c).reduce((s,b) => s+b.capacity, 0),
  }));

  // Today's trials
  const todayTrials = MOCK_TRIALS.filter(t => t.date === "2025-02-28");

  return (
    <div className="p-6 max-w-[1400px] space-y-5">
      <PageHeader
        title="Batch Schedule"
        subtitle="All training batches across centres"
        actions={
          <div className="flex gap-2">
            {/* View toggle */}
            <div className="flex gap-1 bg-surface border border-theme rounded-xl p-1">
              {(["grid","table"] as const).map(v => (
                <button key={v} onClick={() => setViewMode(v)}
                  className={cn("px-3 py-1.5 rounded-lg text-[12px] font-600 transition-all capitalize",
                    viewMode === v ? "bg-[var(--primary-color)] text-white" : "text-secondary hover-theme")}>
                  {v}
                </button>
              ))}
            </div>
            {canManage && (
              <Button variant="primary" size="sm" onClick={() => setShowNewBatch(true)}>
                + New Batch
              </Button>
            )}
          </div>
        }
      />

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Batches"  value={activeBatches}                                     delta="Running now"   deltaType="up"   />
        <StatCard label="Total Enrolled"  value={totalEnrolled}                                     delta="Across all"   deltaType="up"   />
        <StatCard label="Capacity Used"   value={`${Math.round((totalEnrolled/totalCap)*100)}%`}   delta={`${totalCap} total spots`}         />
        <StatCard label="Full Batches"    value={fullBatches}                                       delta="No spots left" deltaType={fullBatches > 0 ? "down" : "up"} />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <SectionLabel className="mb-4">Batches by Programme</SectionLabel>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={progChartData} barGap={4} barCategoryGap="35%">
              <CartesianGrid vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
              <Bar dataKey="batches"  name="Batches"  radius={[4,4,0,0]}>
                {progChartData.map((e,i) => <Cell key={i} fill={PROG_COLOR[e.name] ?? "var(--primary-color)"} />)}
              </Bar>
              <Bar dataKey="enrolled" name="Enrolled" fill="var(--success-color)" radius={[4,4,0,0]} opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <SectionLabel className="mb-4">Capacity by Centre</SectionLabel>
          <div className="space-y-4 mt-2">
            {centreCapData.map((c, i) => {
              const pct = c.capacity > 0 ? Math.round((c.enrolled/c.capacity)*100) : 0;
              const color = ["var(--primary-color)","var(--success-color)","var(--warning-color)"][i];
              return (
                <div key={c.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] font-600 text-primary">{c.name}</span>
                    <span className="text-[12px] text-secondary">{c.enrolled}/{c.capacity}</span>
                  </div>
                  <ProgressBar value={c.enrolled} max={c.capacity} color={color} />
                  <p className="text-[10px] text-secondary mt-0.5">{pct}% filled</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-surface border border-theme rounded-lg px-3 py-2 min-w-[200px]">
          <svg className="w-3.5 h-3.5 text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search batches, trainers..."
            className="bg-transparent text-[13px] text-primary placeholder:text-secondary outline-none w-full" />
        </div>
        <div className="flex gap-1 bg-surface border border-theme rounded-xl p-1">
          {["All","Koramangala","Indiranagar","Whitefield"].map(c => (
            <button key={c} onClick={() => setCentreFilter(c)}
              className={cn("px-3 py-1.5 rounded-lg text-[12px] font-600 transition-all",
                centreFilter === c ? "bg-[var(--primary-color)] text-white" : "text-secondary hover-theme")}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {["All","BJJ","Kickboxing","MMA","Wrestling"].map(p => (
            <button key={p} onClick={() => setProgFilter(p)}
              className={cn("px-3 py-1.5 rounded-lg text-[12px] font-600 transition-all border",
                progFilter === p
                  ? "border-[var(--primary-color)] text-[var(--primary-color)] bg-[var(--hover-bg)]"
                  : "border-theme text-secondary hover-theme")}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── Batch grid / table ── */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map(batch => {
            const fillPct  = Math.round((batch.enrolled / batch.capacity) * 100);
            const barColor = fillPct >= 90 ? "var(--danger-color)" : fillPct >= 70 ? "var(--warning-color)" : "var(--success-color)";
            const cfg      = STATUS_CFG[batch.status];
            return (
              <div key={batch.id}
                className="bg-card border border-theme rounded-2xl p-5 hover-theme transition-colors cursor-pointer"
                onClick={() => setSelectedBatch(batch)}>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[14px] font-700 text-primary">{batch.name}</p>
                    <p className="text-[11px] text-secondary mt-0.5">{batch.centre}</p>
                  </div>
                  <span className={cn("text-[10px] font-700 px-2 py-0.5 rounded-full", cfg.cls)}>
                    {cfg.label}
                  </span>
                </div>

                {/* Programme badge */}
                <span className="text-[10px] font-700 px-2 py-0.5 rounded-full mb-3 inline-block"
                  style={{ color:PROG_COLOR[batch.program], background:`${PROG_COLOR[batch.program]}18` }}>
                  {batch.program}
                </span>

                {/* Info */}
                <div className="space-y-1.5 mt-2 text-[12px] text-secondary">
                  <p>👤 {batch.trainer}</p>
                  <p>📅 {batch.days}</p>
                  <p>⏰ {batch.time}</p>
                </div>

                {/* Capacity bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-secondary">Capacity</span>
                    <span className="text-[12px] font-700 text-primary">{batch.enrolled}/{batch.capacity}</span>
                  </div>
                  <ProgressBar value={batch.enrolled} max={batch.capacity} color={barColor} />
                  <p className="text-[10px] text-secondary mt-1">
                    {fillPct}% filled · {batch.capacity - batch.enrolled} spots left
                  </p>
                </div>

                {canManage && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-theme" onClick={e => e.stopPropagation()}>
                    <Button variant="secondary" size="sm" className="flex-1"
                      onClick={() => setSelectedBatch(batch)}>
                      Details
                    </Button>
                    <Button variant="primary" size="sm" className="flex-1">
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

          {visible.length === 0 && (
            <div className="col-span-3">
              <Card>
                <EmptyState icon="📅" title="No batches found" description="Try adjusting your filters." />
              </Card>
            </div>
          )}
        </div>
      ) : (
        /* ── Table view ── */
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-theme">
                  {["Batch","Programme","Trainer","Schedule","Time","Centre","Capacity","Status",""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-700 text-secondary uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map(batch => {
                  const fillPct  = Math.round((batch.enrolled / batch.capacity) * 100);
                  const barColor = fillPct >= 90 ? "var(--danger-color)" : fillPct >= 70 ? "var(--warning-color)" : "var(--success-color)";
                  const cfg      = STATUS_CFG[batch.status];
                  return (
                    <tr key={batch.id}
                      onClick={() => setSelectedBatch(batch)}
                      className="border-b border-theme hover-theme transition-colors cursor-pointer">
                      <td className="px-4 py-3.5">
                        <p className="text-[13px] font-600 text-primary">{batch.name}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] font-700 px-2 py-0.5 rounded-full"
                          style={{ color:PROG_COLOR[batch.program], background:`${PROG_COLOR[batch.program]}18` }}>
                          {batch.program}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-secondary text-[12px]">{batch.trainer}</td>
                      <td className="px-4 py-3.5 text-secondary text-[12px]">{batch.days}</td>
                      <td className="px-4 py-3.5 text-secondary text-[12px]">{batch.time}</td>
                      <td className="px-4 py-3.5 text-secondary text-[12px]">{batch.centre}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <ProgressBar value={batch.enrolled} max={batch.capacity} color={barColor} className="w-16" />
                          <span className="text-[11px] text-secondary">{batch.enrolled}/{batch.capacity}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn("text-[10px] font-700 px-2 py-0.5 rounded-full", cfg.cls)}>{cfg.label}</span>
                      </td>
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        {canManage && (
                          <Button variant="ghost" size="sm">Edit</Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Today's trials ── */}
      <Card>
        <div className="px-5 py-4 card-header flex items-center justify-between">
          <div>
            <p className="text-[14px] font-700 text-primary">Today's Trial Slots</p>
            <p className="text-[12px] text-secondary mt-0.5">{todayTrials.length} scheduled for Feb 28</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate("/schedule/trials")}>
            All Trials →
          </Button>
        </div>
        {todayTrials.length > 0 ? (
          <div className="divide-theme">
            {todayTrials.map(t => (
              <div key={t.id}
                onClick={() => navigate(`/leads/${t.leadId}`)}
                className="flex items-center gap-3 px-5 py-3.5 hover-theme transition-colors cursor-pointer">
                <Avatar name={t.leadName} size={32} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-600 text-primary">{t.leadName}</p>
                  <p className="text-[11px] text-secondary">{t.batch} · {t.trainer}</p>
                </div>
                <span className="text-[12px] font-600 text-primary flex-shrink-0">{t.time}</span>
                <span className="text-[11px] font-600 flex-shrink-0"
                  style={{ color:PROG_COLOR[t.program] ?? "var(--primary-color)" }}>
                  {t.program}
                </span>
                <span className={cn(
                  "text-[10px] font-700 px-2 py-0.5 rounded-full flex-shrink-0",
                  t.status === "confirmed" ? "success-text success-bg" :
                  t.status === "done"      ? "text-secondary bg-surface border border-theme" :
                  "warning-text warning-bg"
                )}>
                  {t.status}
                </span>
                {canManage && t.status !== "done" && (
                  <Button variant="secondary" size="sm"
                    onClick={e => e.stopPropagation()}>
                    Mark Done
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="📅" title="No trials today" />
        )}
      </Card>

      {/* ── Modals ── */}
      {selectedBatch && (
        <BatchDetailModal batch={selectedBatch} onClose={() => setSelectedBatch(null)} />
      )}
      <NewBatchModal open={showNewBatch} onClose={() => setShowNewBatch(false)} />
    </div>
  );
};
