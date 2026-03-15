// features/leads/MyLeadsPage.tsx  →  /leads/mine
// Personal workspace for the RM role.
// Scoped entirely to the logged-in user's assigned leads.

import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { cn } from "../../utils/cn";
import {
  Card, PageHeader, Button, Avatar, EmptyState,
  StageBadge, SourceBadge, SectionLabel,
  Table, Th, Td, Tr,
} from "../../components/ui";
import { MOCK_LEADS, MOCK_TASKS, MOCK_TRIALS } from "../../data/mockData";
import { useUser } from "../../store/useAuthStore";
import type { Lead, LifecycleStage } from "../../types/crm.types";

// ─── CONSTANTS ────────────────────────────────────────────

const LIFECYCLE_STAGES: LifecycleStage[] = [
  "Lead Created", "Call Handling", "Followup", "Trial Booked",
  "Trial Done", "Joined", "Membership Active", "Renewal",
];

const STAGE_DOT: Record<LifecycleStage, string> = {
  "Lead Created":      "bg-indigo-400",
  "Call Handling":     "bg-amber-400",
  "Followup":          "bg-amber-300",
  "Trial Booked":      "bg-emerald-400",
  "Trial Done":        "bg-emerald-300",
  "Joined":            "bg-green-400",
  "Membership Active": "bg-green-300",
  "Renewal":           "bg-red-400",
};

const STAGE_COLOR: Record<string, string> = {
  "Lead Created":      "#6366f1",
  "Call Handling":     "#f59e0b",
  "Followup":          "#fbbf24",
  "Trial Booked":      "#10b981",
  "Trial Done":        "#34d399",
  "Joined":            "#22c55e",
  "Membership Active": "#4ade80",
  "Renewal":           "#f87171",
};

const TODAY = "2025-02-28";

// ─── INLINE STAGE PICKER ─────────────────────────────────

const InlineStagePicker = ({
  stage, leadId, onChange,
}: {
  stage: LifecycleStage;
  leadId: string;
  onChange: (id: string, stage: LifecycleStage) => void;
}) => {
  const [open, setOpen]     = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = (newStage: LifecycleStage) => {
    if (newStage === stage) { setOpen(false); return; }
    setSaving(true);
    setTimeout(() => { onChange(leadId, newStage); setSaving(false); setOpen(false); }, 350);
  };

  return (
    <div ref={ref} className="relative inline-block" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(p => !p)}
        title="Click to change stage"
        className={cn(
          "group flex items-center gap-1 rounded-full outline-none transition-all",
          open && "ring-2 ring-indigo-500/30",
        )}
      >
        <StageBadge stage={stage} size="sm" />
        <span className={cn("text-[9px] text-secondary group-hover:text-primary transition-all -ml-0.5",
          open && "rotate-180")}>▾</span>
        {saving && <span className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin" />}
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+5px)] z-40 w-[200px] bg-surface border border-theme rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.5)] py-1.5">
          <p className="text-[10px] font-700 text-secondary uppercase tracking-widest px-3 pt-1 pb-2">
            Move to stage
          </p>
          {LIFECYCLE_STAGES.map(s => {
            const isActive = s === stage;
            const isPast   = LIFECYCLE_STAGES.indexOf(s) < LIFECYCLE_STAGES.indexOf(stage);
            return (
              <button key={s} onClick={() => handleSelect(s)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 text-[12px] transition-colors text-left",
                  isActive ? "bg-indigo-500/10 text-primary font-600" : "text-secondary hover:bg-white/[0.04] hover:text-primary"
                )}>
                <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", STAGE_DOT[s], !isActive && "opacity-50")} />
                {s}
                {isActive && <span className="ml-auto text-[10px] text-indigo-400 font-700">current</span>}
                {isPast && !isActive && <span className="ml-auto text-[9px] text-secondary">↩ revert</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── CHART TOOLTIP ────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-theme rounded-xl px-3 py-2.5 text-[12px] shadow-xl">
      {label && <p className="text-secondary mb-1 font-600">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.fill ?? p.color }} className="font-700">{p.name ?? p.dataKey}: {p.value}</p>
      ))}
    </div>
  );
};

// ─── ACTION CARD ──────────────────────────────────────────

const ActionCard = ({
  icon, label, count, accent, onClick,
}: {
  icon: string; label: string; count: number; accent: string; onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="bg-card border border-theme rounded-2xl px-5 py-4 text-left w-full hover-theme transition-colors group"
  >
    <div className="flex items-start justify-between mb-2">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
        style={{ background:`${accent}18`, color:accent }}>
        {icon}
      </div>
      <span className="text-[10px] text-secondary opacity-0 group-hover:opacity-100 transition-opacity">→</span>
    </div>
    <p className="text-[26px] font-800" style={{ color: accent }}>{count}</p>
    <p className="text-[12px] text-secondary mt-0.5">{label}</p>
  </button>
);

// ─── MAIN PAGE ────────────────────────────────────────────

export const MyLeadsPage = () => {
  const navigate = useNavigate();
  const user     = useUser();

  const [leads, setLeads]     = useState<Lead[]>(MOCK_LEADS);
  const [stageFilter, setStageFilter] = useState("All");
  const [search, setSearch]           = useState("");
  const [activeTab, setActiveTab]     = useState<"all" | "today" | "hot" | "pipeline">("all");

  const handleStageChange = (id: string, newStage: LifecycleStage) => {
    setLeads(p => p.map(l => l.id === id ? { ...l, stage: newStage } : l));
  };

  // ── Scope to me ───────────────────────────────────────
  const myLeads = leads.filter(l => l.assignedTo === user?.name);
  const myTasks = MOCK_TASKS.filter(t => t.assignedTo === user?.name && !t.done);
  const myTrialsToday = MOCK_TRIALS.filter(t =>
    t.date === TODAY && myLeads.some(l => l.id === t.leadId)
  );

  // ── Derived metrics ───────────────────────────────────
  const total       = myLeads.length;
  const converted   = myLeads.filter(l => ["Joined", "Membership Active", "Renewal"].includes(l.stage)).length;
  const convRate    = total > 0 ? Math.round((converted / total) * 100) : 0;
  const hotLeads    = myLeads.filter(l => l.tags?.includes("Hot"));
  const callsDue    = myTasks.filter(t => t.type === "call").length;
  const followupsDue = myTasks.filter(t => t.type === "followup").length;
  // const trialsDue   = myTasks.filter(t => t.type === "trial").length;

  // ── Pipeline chart data ───────────────────────────────
  const pipelineChartData = LIFECYCLE_STAGES.map(stage => ({
    name:  stage,
    count: myLeads.filter(l => l.stage === stage).length,
    color: STAGE_COLOR[stage],
  })).filter(d => d.count > 0);

  // ── Filtered leads for table ──────────────────────────
  const tableLeads = useMemo(() => {
    let base = myLeads;
    if (activeTab === "hot")     base = myLeads.filter(l => l.tags?.includes("Hot"));
    if (activeTab === "today")   base = myLeads.filter(l =>
      myTasks.some(t => t.leadId === l.id) ||
      myTrialsToday.some(t => t.leadId === l.id)
    );
    if (activeTab === "pipeline") base = myLeads.filter(l =>
      ["Call Handling", "Followup", "Trial Booked"].includes(l.stage)
    );

    if (stageFilter !== "All") base = base.filter(l => l.stage === stageFilter);
    if (search) base = base.filter(l =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search)
    );
    return base;
  }, [myLeads, activeTab, stageFilter, search, myTasks, myTrialsToday]);

  return (
    <div className="p-6 max-w-[1400px] space-y-5">
      <PageHeader
        title={`My Leads${user?.name ? ` — ${user.name}` : ""}`}
        subtitle={`${total} leads assigned to you · ${convRate}% conversion rate`}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate("/leads")}>
              All Leads
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate("/leads/pipeline")}>
              Pipeline View
            </Button>
          </div>
        }
      />

      {/* ── Personal KPI strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <ActionCard icon="◈" label="My Leads"       count={total}          accent="var(--primary-color)"  onClick={() => setActiveTab("all")} />
        <ActionCard icon="🔥" label="Hot Leads"      count={hotLeads.length} accent="var(--danger-color)"  onClick={() => setActiveTab("hot")} />
        <ActionCard icon="📞" label="Calls Due"      count={callsDue}       accent="var(--warning-color)"  onClick={() => setActiveTab("today")} />
        <ActionCard icon="↩"  label="Follow-ups Due" count={followupsDue}   accent="#f472b6"               onClick={() => setActiveTab("today")} />
        <ActionCard icon="🥋" label="Trials Today"   count={myTrialsToday.length} accent="var(--success-color)" onClick={() => setActiveTab("today")} />
      </div>

      {/* ── Conversion stat + Pipeline chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">

        {/* Conversion summary */}
        <Card className="p-5 flex flex-col justify-between gap-4">
          <SectionLabel className="mb-0">My Performance</SectionLabel>

          <div className="text-center py-3">
            <p className="text-[48px] font-800 leading-none"
              style={{ color: convRate >= 50 ? "var(--success-color)" : convRate >= 30 ? "var(--warning-color)" : "var(--danger-color)" }}>
              {convRate}%
            </p>
            <p className="text-[12px] text-secondary mt-1">Conversion Rate</p>
          </div>

          <div className="space-y-2">
            {[
              { label:"Total Assigned",  value: total,     color:"var(--primary-color)"  },
              { label:"Converted",       value: converted, color:"var(--success-color)"  },
              { label:"In Progress",     value: myLeads.filter(l => ["Call Handling","Followup","Trial Booked","Trial Done"].includes(l.stage)).length, color:"var(--warning-color)" },
              { label:"New / Pending",   value: myLeads.filter(l => l.stage === "Lead Created").length, color:"var(--text-secondary)" },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-[12px] text-secondary">{s.label}</span>
                <span className="text-[13px] font-700" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Pipeline bar chart */}
        <Card className="p-5">
          <SectionLabel className="mb-4">My Pipeline by Stage</SectionLabel>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={pipelineChartData} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill:"var(--text-secondary)", fontSize:10 }}
                axisLine={false} tickLine={false} interval={0}
                angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fill:"var(--text-secondary)", fontSize:11 }}
                axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
              <Bar dataKey="count" name="Leads" radius={[4,4,0,0]}>
                {pipelineChartData.map((entry, i) => (
                  <rect key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Today's actions ── */}
      {(callsDue > 0 || followupsDue > 0 || myTrialsToday.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Tasks due today */}
          {(callsDue > 0 || followupsDue > 0) && (
            <Card>
              <div className="px-5 py-4 card-header flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-700 text-primary">Actions Due Today</p>
                  <p className="text-[12px] text-secondary mt-0.5">{myTasks.length} pending tasks</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => navigate("/dashboard/tasks")}>
                  All Tasks →
                </Button>
              </div>
              <div className="divide-theme">
                {myTasks.slice(0, 5).map(task => {
                  // const lead = myLeads.find(l => l.id === task.leadId);
                  const TYPE_ICON: Record<string, string> = { call:"📞", followup:"↩", trial:"🥋", renewal:"↺" };
                  const isOverdue = task.dueDate < TODAY;
                  return (
                    <div key={task.id}
                      onClick={() => navigate(`/leads/${task.leadId}`)}
                      className="flex items-center gap-3 px-5 py-3.5 hover-theme transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                        style={{ background:"var(--hover-bg)", color:"var(--primary-color)" }}>
                        {TYPE_ICON[task.type] ?? "◈"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-600 text-primary truncate">{task.title}</p>
                        <p className="text-[11px] text-secondary">{task.leadName}</p>
                      </div>
                      <span className={cn("text-[11px] font-600 flex-shrink-0",
                        isOverdue ? "danger-text" : task.dueDate === TODAY ? "warning-text" : "text-secondary")}>
                        {isOverdue ? "Overdue" : "Today"}
                      </span>
                      <span className={cn("text-[10px] font-700 px-2 py-0.5 rounded-full flex-shrink-0",
                        task.priority === "high" ? "danger-text danger-bg" :
                        task.priority === "medium" ? "warning-text warning-bg" :
                        "text-secondary bg-surface border border-theme")}>
                        {task.priority}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Trials today */}
          {myTrialsToday.length > 0 && (
            <Card>
              <div className="px-5 py-4 card-header flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-700 text-primary">Today's Trials</p>
                  <p className="text-[12px] text-secondary mt-0.5">{myTrialsToday.length} scheduled</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => navigate("/schedule/trials")}>
                  Schedule →
                </Button>
              </div>
              <div className="divide-theme">
                {myTrialsToday.map(trial => (
                  <div key={trial.id}
                    onClick={() => navigate(`/leads/${trial.leadId}`)}
                    className="flex items-center gap-3 px-5 py-3.5 hover-theme transition-colors cursor-pointer">
                    <Avatar name={trial.leadName} size={34} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-600 text-primary">{trial.leadName}</p>
                      <p className="text-[11px] text-secondary">{trial.batch} · {trial.trainer}</p>
                    </div>
                    <p className="text-[12px] font-600 text-primary flex-shrink-0">{trial.time}</p>
                    <span className={cn(
                      "text-[10px] font-700 px-2 py-0.5 rounded-full flex-shrink-0",
                      trial.status === "confirmed" ? "success-text success-bg" :
                      trial.status === "done"      ? "text-secondary bg-surface border border-theme" :
                      "warning-text warning-bg"
                    )}>
                      {trial.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── Hot leads callout ── */}
      {hotLeads.length > 0 && (
        <Card>
          <div className="px-5 py-4 card-header flex items-center justify-between">
            <div>
              <p className="text-[14px] font-700 text-primary">🔥 Hot Leads</p>
              <p className="text-[12px] text-secondary mt-0.5">High-intent leads needing immediate action</p>
            </div>
          </div>
          <div className="divide-theme">
            {hotLeads.map(lead => (
              <div key={lead.id}
                onClick={() => navigate(`/leads/${lead.id}`)}
                className="flex items-center gap-3 px-5 py-3.5 hover-theme transition-colors cursor-pointer">
                <Avatar name={lead.name} size={34} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-600 text-primary">{lead.name}</p>
                  <p className="text-[11px] text-secondary">{lead.phone} · {lead.center}</p>
                </div>
                <StageBadge stage={lead.stage} size="sm" />
                <SourceBadge source={lead.source as any} />
                {lead.tags?.map(tag => (
                  <span key={tag} className="text-[10px] font-700 px-2 py-0.5 rounded-full danger-text danger-bg flex-shrink-0">
                    {tag}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── My leads table ── */}
      <Card>
        {/* Tabs + filters */}
        <div className="px-5 py-3.5 card-header space-y-3">
          {/* Tab row */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1 bg-surface border border-theme rounded-xl p-1">
              {([
                { key:"all",      label:"All",        count: myLeads.length },
                { key:"today",    label:"Due Today",  count: myLeads.filter(l => myTasks.some(t => t.leadId === l.id)).length },
                { key:"hot",      label:"Hot",        count: hotLeads.length },
                { key:"pipeline", label:"In Progress",count: myLeads.filter(l => ["Call Handling","Followup","Trial Booked"].includes(l.stage)).length },
              ] as const).map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={cn("px-3 py-1.5 rounded-lg text-[12px] font-600 transition-all",
                    activeTab === t.key ? "bg-[var(--primary-color)] text-white" : "text-secondary hover-theme")}>
                  {t.label}
                  <span className="ml-1.5 opacity-60 text-[10px]">{t.count}</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 bg-surface border border-theme rounded-lg px-3 py-2 min-w-[200px]">
              <svg className="w-3.5 h-3.5 text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search my leads..."
                className="bg-transparent text-[13px] text-primary placeholder:text-secondary outline-none w-full" />
            </div>
          </div>

          {/* Stage filter chips */}
          <div className="flex items-center gap-1 flex-wrap">
            <button onClick={() => setStageFilter("All")}
              className={cn("px-2.5 py-1 rounded-lg text-[11px] font-600 transition-all border",
                stageFilter === "All" ? "border-[var(--primary-color)] text-[var(--primary-color)] bg-[var(--hover-bg)]" : "border-theme text-secondary hover-theme")}>
              All Stages
            </button>
            {LIFECYCLE_STAGES.map(stage => {
              const count = myLeads.filter(l => l.stage === stage).length;
              if (count === 0) return null;
              return (
                <button key={stage} onClick={() => setStageFilter(stage)}
                  className={cn("px-2.5 py-1 rounded-lg text-[11px] font-600 transition-all border",
                    stageFilter === stage
                      ? "border-[var(--primary-color)] text-[var(--primary-color)] bg-[var(--hover-bg)]"
                      : "border-theme text-secondary hover-theme")}>
                  {stage}
                  <span className="ml-1 opacity-60">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        {tableLeads.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th>Lead</Th>
                <Th>Source</Th>
                <Th>Stage</Th>
                <Th>Centre</Th>
                <Th>Last Activity</Th>
                <Th>Tags</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {tableLeads.map(lead => {
                const hasTaskToday = myTasks.some(t => t.leadId === lead.id && t.dueDate === TODAY);
                const hasTrialToday = myTrialsToday.some(t => t.leadId === lead.id);
                return (
                  <Tr key={lead.id} onClick={() => navigate(`/leads/${lead.id}`)}>
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <Avatar name={lead.name} size={30} />
                          {(hasTaskToday || hasTrialToday) && (
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card"
                              style={{ background:"var(--warning-color)" }} />
                          )}
                        </div>
                        <div>
                          <p className="text-[13px] font-600 text-primary">{lead.name}</p>
                          <p className="text-[11px] text-secondary">{lead.phone}</p>
                        </div>
                      </div>
                    </Td>
                    <Td><SourceBadge source={lead.source as any} /></Td>
                    <Td>
                      <InlineStagePicker
                        stage={lead.stage}
                        leadId={lead.id}
                        onChange={handleStageChange}
                      />
                    </Td>
                    <Td className="text-secondary">{lead.center}</Td>
                    <Td className="text-secondary">{lead.lastActivity}</Td>
                    <Td>
                      <div className="flex gap-1 flex-wrap">
                        {lead.tags?.map(tag => (
                          <span key={tag} className="text-[10px] font-700 px-1.5 py-0.5 rounded-md danger-text danger-bg">
                            {tag}
                          </span>
                        ))}
                        {hasTaskToday && (
                          <span className="text-[10px] font-700 px-1.5 py-0.5 rounded-md warning-text warning-bg">
                            Task Due
                          </span>
                        )}
                        {hasTrialToday && (
                          <span className="text-[10px] font-700 px-1.5 py-0.5 rounded-md" style={{ color:"#f472b6", background:"#f472b618" }}>
                            Trial Today
                          </span>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                        <Button variant="secondary" size="sm" onClick={() => navigate(`/leads/${lead.id}`)}>
                          Open
                        </Button>
                        <Button variant="ghost" size="sm">📞</Button>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        ) : (
          <EmptyState icon="◈" title="No leads match your filters" description="Try switching tabs or clearing the stage filter." />
        )}
      </Card>
    </div>
  );
};
