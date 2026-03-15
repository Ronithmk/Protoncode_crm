// features/schedule/FollowUpsPage.tsx  →  /schedule/followups

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { cn } from "../../utils/cn";
import {
  Card, PageHeader, Button,  EmptyState,
  PriorityBadge, SectionLabel, StatCard, Modal, Input, Select,
} from "../../components/ui";
import { MOCK_LEADS } from "../../data/mockData";
import { useRole, useUser } from "../../store/useAuthStore";

// ─── TYPES ────────────────────────────────────────────────

type FollowUpType = "call" | "whatsapp";
type Priority     = "high" | "medium" | "low";

type FollowUp = {
  id: string; leadName: string; leadId: string; phone: string;
  type: FollowUpType; dueDate: string; dueTime?: string;
  note: string; priority: Priority;
  assignedTo: string; done: boolean;
  lastAttempt?: string;
};

// ─── MOCK DATA ────────────────────────────────────────────

const TODAY    = "2025-02-28";
// const TOMORROW = "2025-03-01";

const FOLLOWUPS: FollowUp[] = [
  { id:"FU001", leadName:"Sneha Kapoor",  leadId:"L002", phone:"+91 87654 32109", type:"call",     dueDate:"2025-02-28", dueTime:"10:00 AM", note:"Second call — discuss pricing and batch timing.",          priority:"high",   assignedTo:"Ravi K",  done:false, lastAttempt:"Yesterday 5 PM" },
  { id:"FU002", leadName:"Meera Nair",    leadId:"L006", phone:"+91 43210 98765", type:"whatsapp", dueDate:"2025-02-28", dueTime:"12:00 PM", note:"Send batch schedule and fee PDF.",                         priority:"medium", assignedTo:"Ravi K",  done:false },
  { id:"FU003", leadName:"Kabir Khan",    leadId:"L007", phone:"+91 32109 87654", type:"call",     dueDate:"2025-02-28", dueTime:"11:00 AM", note:"First call — new lead from Meta Ads.",                     priority:"high",   assignedTo:"Priya R", done:false },
  { id:"FU004", leadName:"Divya Pillai",  leadId:"L010", phone:"+91 10876 54321", type:"call",     dueDate:"2025-03-01", dueTime:"9:00 AM",  note:"Initial enquiry follow-up.",                               priority:"medium", assignedTo:"Ravi K",  done:false },
  { id:"FU005", leadName:"Vikram Negi",   leadId:"L009", phone:"+91 11987 65432", type:"whatsapp", dueDate:"2025-03-01",                     note:"Share membership plan options.",                           priority:"low",    assignedTo:"Priya R", done:false },
  { id:"FU006", leadName:"Arjun Mehta",   leadId:"L001", phone:"+91 98765 43210", type:"call",     dueDate:"2025-02-26",                     note:"Post-trial follow-up — confirm joining.",                   priority:"high",   assignedTo:"Priya R", done:false, lastAttempt:"Feb 26 6 PM" },
  { id:"FU007", leadName:"Dev Sharma",    leadId:"L003", phone:"+91 76543 21098", type:"call",     dueDate:"2025-02-27",                     note:"Renewal discussion — plan upgrade.",                        priority:"high",   assignedTo:"Priya R", done:true  },
  { id:"FU008", leadName:"Rohit Verma",   leadId:"L005", phone:"+91 54321 09876", type:"whatsapp", dueDate:"2025-02-27",                     note:"Sent renewal reminder message.",                           priority:"medium", assignedTo:"Ravi K",  done:true  },
];

// ─── CONSTANTS ────────────────────────────────────────────

const TYPE_ICON:  Record<FollowUpType, string> = { call:"📞", whatsapp:"💬" };
const TYPE_LABEL: Record<FollowUpType, string> = { call:"Call", whatsapp:"WhatsApp" };
const TYPE_COLOR: Record<FollowUpType, string> = {
  call:      "var(--primary-color)",
  whatsapp:  "var(--success-color)",
};

// ─── CHART TOOLTIP ────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-theme rounded-xl px-3 py-2 text-[12px] shadow-xl">
      {label && <p className="text-secondary mb-1 font-600">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.fill }} className="font-700">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

// ─── ADD FOLLOW-UP MODAL ──────────────────────────────────

const AddFollowUpModal = ({ open, onClose, onAdd }: {
  open: boolean; onClose: () => void;
  onAdd: (f: FollowUp) => void;
}) => {
  const [form, setForm] = useState({
    leadId:"", dueDate: TODAY, dueTime:"",
    type:"call" as FollowUpType, priority:"medium" as Priority,
    note:"", assignedTo:"",
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const selectedLead = MOCK_LEADS.find(l => l.id === form.leadId);

  const handleAdd = () => {
    if (!form.leadId) return;
    onAdd({
      id:         `FU${Date.now()}`,
      leadName:   selectedLead?.name ?? "",
      leadId:     form.leadId,
      phone:      selectedLead?.phone ?? "",
      type:       form.type,
      dueDate:    form.dueDate,
      dueTime:    form.dueTime || undefined,
      note:       form.note,
      priority:   form.priority,
      assignedTo: (form.assignedTo || selectedLead?.assignedTo) ?? "",
      done:       false, 
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Follow-up" width="max-w-lg">
      <div className="space-y-4">
        <Select label="Lead *" value={form.leadId} onChange={e => set("leadId", e.target.value)}>
          <option value="">Select lead...</option>
          {MOCK_LEADS.map(l => (
            <option key={l.id} value={l.id}>{l.name} — {l.stage}</option>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Type" value={form.type} onChange={e => set("type", e.target.value)}>
            <option value="call">📞 Call</option>
            <option value="whatsapp">💬 WhatsApp</option>
          </Select>
          <Select label="Priority" value={form.priority} onChange={e => set("priority", e.target.value)}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Due Date" type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} />
          <Input label="Due Time" placeholder="10:00 AM" value={form.dueTime} onChange={e => set("dueTime", e.target.value)} />
        </div>
        <div>
          <label className="block text-[12px] font-600 text-secondary mb-1.5">Note</label>
          <textarea value={form.note} onChange={e => set("note", e.target.value)}
            placeholder="What's the purpose of this follow-up?"
            rows={3}
            className="w-full bg-surface border border-theme rounded-xl px-4 py-3 text-[13px] text-primary placeholder:text-secondary outline-none resize-none focus:border-[var(--primary-color)] transition-colors" />
        </div>
        <Input label="Assign To" placeholder="Priya R" value={form.assignedTo} onChange={e => set("assignedTo", e.target.value)} />
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={!form.leadId} onClick={handleAdd}>
          Add Follow-up
        </Button>
      </div>
    </Modal>
  );
};

// ─── FOLLOW-UP ROW ────────────────────────────────────────

const FollowUpRow = ({ fu, onToggle, isAdmin }: {
  fu: FollowUp; onToggle: (id: string) => void; isAdmin: boolean;
}) => {
  const navigate = useNavigate();
  const isOverdue = !fu.done && fu.dueDate < TODAY;
  const isDueToday = !fu.done && fu.dueDate === TODAY;

  return (
    <div className={cn(
      "flex items-start gap-3 px-5 py-4 hover-theme transition-colors group",
      fu.done && "opacity-40",
    )}>
      {/* Checkbox */}
      <button onClick={() => onToggle(fu.id)}
        className={cn(
          "mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all",
          fu.done ? "bg-[var(--success-color)] border-[var(--success-color)]" : "border-theme hover:border-[var(--primary-color)]"
        )}>
        {fu.done && <span className="text-white text-[9px] leading-none">✓</span>}
      </button>

      {/* Type icon */}
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 mt-0.5"
        style={{ background:`${TYPE_COLOR[fu.type]}15`, color:TYPE_COLOR[fu.type] }}>
        {TYPE_ICON[fu.type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/leads/${fu.leadId}`)}>
        <div className="flex items-center gap-2 flex-wrap">
          <p className={cn("text-[13px] font-700 text-primary", fu.done && "line-through text-secondary")}>
            {fu.leadName}
          </p>
          <span className="text-[11px] text-secondary">{fu.phone}</span>
        </div>
        <p className="text-[12px] text-secondary mt-0.5 leading-relaxed">{fu.note}</p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className={cn("text-[11px] font-600",
            isOverdue ? "danger-text" : isDueToday ? "warning-text" : "text-secondary")}>
            {isOverdue ? "⚠ Overdue — " : isDueToday ? "Due Today" : "Due "}
            {isOverdue || isDueToday ? "" : fu.dueDate}
            {fu.dueTime && ` · ${fu.dueTime}`}
          </span>
          {isAdmin && <span className="text-[11px] text-secondary">· {fu.assignedTo}</span>}
          {fu.lastAttempt && (
            <span className="text-[10px] text-secondary italic">Last attempt: {fu.lastAttempt}</span>
          )}
        </div>
      </div>

      {/* Priority + action */}
      <PriorityBadge priority={fu.priority} />
      {!fu.done && (
        <Button variant="secondary" size="sm" className="flex-shrink-0"
          onClick={e => { e.stopPropagation(); }}>
          {TYPE_ICON[fu.type]} {TYPE_LABEL[fu.type]}
        </Button>
      )}
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────

export const FollowUpsPage = () => {
  const role = useRole();
  const user = useUser();

  const [followUps, setFollowUps] = useState<FollowUp[]>(FOLLOWUPS);
  const [tab, setTab]             = useState<"pending" | "done">("pending");
  const [typeFilter, setTypeFilter] = useState<FollowUpType | "all">("all");
  const [prioFilter, setPrioFilter] = useState<Priority | "all">("all");
  const [showAdd, setShowAdd]     = useState(false);

  const toggle = (id: string) =>
    setFollowUps(p => p.map(f => f.id === id ? { ...f, done: !f.done } : f));
  const addFollowUp = (f: FollowUp) => setFollowUps(p => [f, ...p]);

  const isAdmin = ["SUPER_ADMIN","ADMIN","CENTER_MANAGER","SALES_MANAGER"].includes(role);
  const scoped  = isAdmin ? followUps : followUps.filter(f => f.assignedTo === user?.name);

  const pending  = scoped.filter(f => !f.done);
  const done     = scoped.filter(f =>  f.done);
  const overdue  = pending.filter(f => f.dueDate < TODAY);
  const dueToday = pending.filter(f => f.dueDate === TODAY);
  const calls    = pending.filter(f => f.type === "call");
  const msgs     = pending.filter(f => f.type === "whatsapp");

  const visible = scoped.filter(f => {
    const matchTab  = tab === "pending" ? !f.done : f.done;
    const matchType = typeFilter === "all" ? true : f.type === typeFilter;
    const matchPrio = prioFilter === "all" ? true : f.priority === prioFilter;
    return matchTab && matchType && matchPrio;
  });

  // Chart data
  const chartData = [
    { name:"Calls",    pending: calls.length,         done: done.filter(f=>f.type==="call").length,     fill:"var(--primary-color)" },
    { name:"WhatsApp", pending: msgs.length,           done: done.filter(f=>f.type==="whatsapp").length, fill:"var(--success-color)" },
    { name:"Overdue",  pending: overdue.length,        done: 0,                                          fill:"var(--danger-color)"  },
    { name:"High Pri", pending: pending.filter(f=>f.priority==="high").length, done: 0,                  fill:"#f472b6"              },
  ];

  // Group pending by urgency
  const overdueItems   = visible.filter(f => !f.done && f.dueDate < TODAY);
  const todayItems     = visible.filter(f => !f.done && f.dueDate === TODAY);
  const upcomingItems  = visible.filter(f => !f.done && f.dueDate > TODAY);

  return (
    <div className="p-6 max-w-[1200px] space-y-5">
      <PageHeader
        title="Follow-ups"
        subtitle={`${pending.length} pending · ${overdue.length} overdue`}
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>
            + Add Follow-up
          </Button>
        }
      />

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Pending"     value={pending.length}  delta={`${overdue.length} overdue`}  deltaType={overdue.length > 0 ? "down" : "up"} />
        <StatCard label="Due Today"   value={dueToday.length}                                       />
        <StatCard label="Calls"       value={calls.length}    delta="Pending calls"                 />
        <StatCard label="WhatsApp"    value={msgs.length}     delta="Messages pending"              />
      </div>

      {/* ── Overdue alert ── */}
      {overdue.length > 0 && (
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl border danger-bg"
          style={{ borderColor:"var(--danger-color)30" }}>
          <span className="text-lg flex-shrink-0">⚠</span>
          <div className="flex-1">
            <p className="text-[13px] font-700 danger-text">
              {overdue.length} follow-up{overdue.length > 1 ? "s are" : " is"} overdue
            </p>
            <p className="text-[12px] text-secondary">
              {overdue.map(f => f.leadName).join(", ")}
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={() => { setTab("pending"); setPrioFilter("all"); }}>
            Action Now
          </Button>
        </div>
      )}

      {/* ── Chart + Priority breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <SectionLabel className="mb-4">Follow-up Breakdown</SectionLabel>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barGap={4} barCategoryGap="35%">
              <CartesianGrid vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
              <Bar dataKey="pending" name="Pending" radius={[4,4,0,0]}>
                {chartData.map((e,i) => <Bar key={i} dataKey="pending" fill={e.fill} />)}
              </Bar>
              <Bar dataKey="done" name="Done" fill="var(--success-color)" radius={[4,4,0,0]} opacity={0.4} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <SectionLabel className="mb-4">Priority Queue</SectionLabel>
          <div className="space-y-3.5">
            {(["high","medium","low"] as Priority[]).map(p => {
              const count = pending.filter(f => f.priority === p).length;
              const color = p === "high" ? "var(--danger-color)" : p === "medium" ? "var(--warning-color)" : "var(--text-secondary)";
              return (
                <div key={p}>
                  <div className="flex items-center justify-between mb-1.5">
                    <button onClick={() => setPrioFilter(prioFilter === p ? "all" : p)}
                      className="text-[13px] font-600 text-primary capitalize hover:underline">
                      {p} Priority
                    </button>
                    <span className="text-[14px] font-800" style={{ color }}>{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width:`${pending.length > 0 ? (count/pending.length)*100 : 0}%`, background:color }} />
                  </div>
                </div>
              );
            })}

            <div className="mt-4 pt-3 border-t border-theme">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-secondary">Completed today</span>
                <span className="text-[13px] font-700 success-text">{done.filter(f => f.dueDate === TODAY || f.dueDate === "2025-02-27").length}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-3 flex-wrap justify-between">
        <div className="flex items-center gap-1 bg-surface border border-theme rounded-xl p-1">
          {(["pending","done"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-4 py-1.5 rounded-lg text-[12px] font-600 transition-all",
                tab === t ? "bg-[var(--primary-color)] text-white" : "text-secondary hover-theme")}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              <span className="ml-1.5 opacity-60 text-[10px]">{t === "pending" ? pending.length : done.length}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {(["all","call","whatsapp"] as const).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={cn("px-3 py-1.5 rounded-lg text-[12px] font-600 transition-all border",
                  typeFilter === t
                    ? "border-[var(--primary-color)] text-[var(--primary-color)] bg-[var(--hover-bg)]"
                    : "border-theme text-secondary hover-theme")}>
                {t === "all" ? "All" : TYPE_LABEL[t]}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {(["all","high","medium","low"] as const).map(p => (
              <button key={p} onClick={() => setPrioFilter(p)}
                className={cn("px-3 py-1.5 rounded-lg text-[12px] font-600 transition-all capitalize",
                  prioFilter === p ? "bg-[var(--primary-color)] text-white" : "text-secondary hover-theme")}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Grouped follow-up list ── */}
      {tab === "pending" ? (
        <div className="space-y-4">
          {[
            { label:"Overdue",  items: overdueItems,  accent:"var(--danger-color)"  },
            { label:"Due Today",items: todayItems,    accent:"var(--warning-color)" },
            { label:"Upcoming", items: upcomingItems, accent:"var(--text-secondary)"},
          ].filter(g => g.items.length > 0).map(group => (
            <div key={group.label}>
              <div className="flex items-center gap-3 mb-2 px-1">
                <span className="text-[11px] font-700 uppercase tracking-wider"
                  style={{ color:group.accent }}>
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-[var(--border-color)]" />
                <span className="text-[11px] text-secondary">{group.items.length}</span>
              </div>
              <Card>
                <div className="divide-theme">
                  {group.items.map(fu => (
                    <FollowUpRow key={fu.id} fu={fu} onToggle={toggle} isAdmin={isAdmin} />
                  ))}
                </div>
              </Card>
            </div>
          ))}
          {overdueItems.length + todayItems.length + upcomingItems.length === 0 && (
            <Card>
              <EmptyState icon="✓" title="All clear!" description="No pending follow-ups match your filters." />
            </Card>
          )}
        </div>
      ) : (
        <Card>
          {visible.length > 0 ? (
            <div className="divide-theme">
              {visible.map(fu => (
                <FollowUpRow key={fu.id} fu={fu} onToggle={toggle} isAdmin={isAdmin} />
              ))}
            </div>
          ) : (
            <EmptyState icon="◈" title="No completed follow-ups" />
          )}
        </Card>
      )}

      <AddFollowUpModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={addFollowUp} />
    </div>
  );
};
