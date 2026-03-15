// features/dashboard/MyTasksPage.tsx  →  /dashboard/tasks

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { cn } from "../../../utils/cn";
import {
  Card, PageHeader, Button, EmptyState,
  PriorityBadge, Modal, Input, Select, SectionLabel,
} from "../../../components/ui";
import { MOCK_TASKS } from "../../../data/mockData";
import { useRole, useUser } from "../../../store/useAuthStore";
import type { Task } from "../../../types/crm.types";

// ─── CONSTANTS ────────────────────────────────────────────

const TYPE_ICON: Record<string, string>  = { followup:"↩", trial:"🥋", renewal:"↺", call:"📞" };
const TYPE_LABEL: Record<string, string> = { followup:"Follow-up", trial:"Trial", renewal:"Renewal", call:"Call" };
const TYPE_COLOR: Record<string, string> = {
  followup: "var(--primary-color)",
  trial:    "#f472b6",
  renewal:  "var(--warning-color)",
  call:     "var(--success-color)",
};

const TODAY    = "2025-02-28";
// const TOMORROW = "2025-03-01";

// ─── CHART TOOLTIP ────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-theme rounded-xl px-3 py-2 text-[12px] shadow-xl">
      {label && <p className="text-secondary mb-1 font-600">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.fill ?? p.color }} className="font-700">{p.name ?? p.dataKey}: {p.value}</p>
      ))}
    </div>
  );
};

// ─── ADD TASK MODAL ───────────────────────────────────────

const AddTaskModal = ({ open, onClose, onAdd }: {
  open: boolean; onClose: () => void; onAdd: (t: Task) => void;
}) => {
  const [form, setForm] = useState({
    title:"", leadName:"", leadId:"L001", dueDate: TODAY,
    priority:"medium" as Task["priority"], type:"call" as Task["type"], assignedTo:"",
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleAdd = () => {
    if (!form.title) return;
    onAdd({ ...form, id: `TK${Date.now()}`, done: false });
    setForm({ title:"", leadName:"", leadId:"L001", dueDate: TODAY, priority:"medium", type:"call", assignedTo:"" });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New Task" width="max-w-lg">
      <div className="space-y-4">
        <Input label="Task Title *" placeholder="e.g. Follow up after trial"
          value={form.title} onChange={e => set("title", e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Lead Name" placeholder="Arjun Mehta"
            value={form.leadName} onChange={e => set("leadName", e.target.value)} />
          <Input label="Due Date" type="date"
            value={form.dueDate} onChange={e => set("dueDate", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Type" value={form.type} onChange={e => set("type", e.target.value)}>
            {Object.entries(TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
          <Select label="Priority" value={form.priority} onChange={e => set("priority", e.target.value)}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
        </div>
        <Input label="Assign To" placeholder="Priya R"
          value={form.assignedTo} onChange={e => set("assignedTo", e.target.value)} />
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleAdd} disabled={!form.title}>Create Task</Button>
      </div>
    </Modal>
  );
};

// ─── TASK ROW ─────────────────────────────────────────────

const TaskItem = ({ task, onToggle, isAdmin }: {
  task: Task; onToggle: (id: string) => void; isAdmin: boolean;
}) => {
  const navigate  = useNavigate();
  const isOverdue = !task.done && task.dueDate < TODAY;

  return (
    <div className={cn(
      "flex items-start gap-3 px-5 py-4 hover-theme transition-colors group",
      task.done && "opacity-40"
    )}>
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className={cn(
          "mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all",
          task.done
            ? "bg-[var(--success-color)] border-[var(--success-color)]"
            : "border-theme hover:border-[var(--primary-color)]"
        )}
      >
        {task.done && <span className="text-white text-[9px] leading-none">✓</span>}
      </button>

      {/* Type icon */}
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
        style={{ background: `${TYPE_COLOR[task.type]}15`, color: TYPE_COLOR[task.type] }}
      >
        {TYPE_ICON[task.type] ?? "◈"}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/leads/${task.leadId}`)}>
        <p className={cn(
          "text-[13px] font-600 text-primary",
          task.done && "line-through text-secondary"
        )}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {task.leadName && (
            <span className="text-[11px] text-secondary">{task.leadName}</span>
          )}
          <span className="text-[11px] text-secondary">·</span>
          <span className={cn(
            "text-[11px] font-600",
            isOverdue ? "danger-text" : task.dueDate === TODAY ? "warning-text" : "text-secondary"
          )}>
            {isOverdue ? "Overdue · " : task.dueDate === TODAY ? "Today · " : "Due "}{task.dueDate}
          </span>
          {isAdmin && task.assignedTo && (
            <>
              <span className="text-[11px] text-secondary">·</span>
              <span className="text-[11px] text-secondary">{task.assignedTo}</span>
            </>
          )}
        </div>
      </div>

      {/* Priority badge */}
      <PriorityBadge priority={task.priority} />

      {/* Hover arrow */}
      <span
        className="text-secondary text-[12px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        onClick={() => navigate(`/leads/${task.leadId}`)}
      >→</span>
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────

export const MyTasksPage = () => {
  // const navigate    = useNavigate();
  const user        = useUser();
  const currentRole = useRole();

  const [tasks, setTasks]     = useState<Task[]>(MOCK_TASKS);
  const [tab, setTab]         = useState<"pending" | "done" | "all">("pending");
  const [prioFilter, setPrio] = useState<"all" | "high" | "medium" | "low">("all");
  const [typeFilter, setType] = useState<"all" | Task["type"]>("all");
  const [showAdd, setShowAdd] = useState(false);

  const toggle = (id: string) =>
    setTasks(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const addTask = (t: Task) => setTasks(p => [t, ...p]);

  const isAdmin     = ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER", "SALES_MANAGER"].includes(currentRole);
  const scopedTasks = isAdmin ? tasks : tasks.filter(t => t.assignedTo === user?.name);

  const visible = scopedTasks.filter(t => {
    const matchTab  = tab === "all" ? true : tab === "pending" ? !t.done : t.done;
    const matchPrio = prioFilter === "all" ? true : t.priority === prioFilter;
    const matchType = typeFilter === "all" ? true : t.type === typeFilter;
    return matchTab && matchPrio && matchType;
  });

  const pending  = scopedTasks.filter(t => !t.done).length;
  const done     = scopedTasks.filter(t =>  t.done).length;
  const overdue  = scopedTasks.filter(t => !t.done && t.dueDate < TODAY).length;
  const dueToday = scopedTasks.filter(t => !t.done && t.dueDate === TODAY).length;
  const highPri  = scopedTasks.filter(t => !t.done && t.priority === "high").length;

  // Type breakdown chart
  const typeChartData = (["call","followup","trial","renewal"] as const).map(type => ({
    name:    TYPE_LABEL[type],
    pending: scopedTasks.filter(t => t.type === type && !t.done).length,
    done:    scopedTasks.filter(t => t.type === type &&  t.done).length,
    color:   TYPE_COLOR[type],
  }));

  // Priority breakdown
  const prioChartData = (["high", "medium", "low"] as const).map(p => ({
    name:  p.charAt(0).toUpperCase() + p.slice(1),
    count: scopedTasks.filter(t => !t.done && t.priority === p).length,
    color: p === "high" ? "var(--danger-color)" : p === "medium" ? "var(--warning-color)" : "var(--text-secondary)",
  }));

  return (
    <div className="p-6 max-w-[1200px] space-y-5">
      <PageHeader
        title="My Tasks"
        subtitle={`${pending} pending · ${done} completed`}
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>
            + Add Task
          </Button>
        }
      />

      {/* ── Summary KPI strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label:"Pending",   value: pending,  color:"var(--primary-color)",  onClick: () => setTab("pending") },
          { label:"Done",      value: done,     color:"var(--success-color)",  onClick: () => setTab("done")    },
          { label:"Overdue",   value: overdue,  color:"var(--danger-color)",   onClick: () => setTab("pending") },
          { label:"Due Today", value: dueToday, color:"var(--warning-color)",  onClick: () => setTab("pending") },
          { label:"High Pri",  value: highPri,  color:"var(--danger-color)",   onClick: () => setPrio("high")   },
        ].map(s => (
          <button key={s.label} onClick={s.onClick}
            className="bg-card border border-theme rounded-2xl px-4 py-3 text-left hover-theme transition-colors group">
            <p className="text-[24px] font-800" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] text-secondary mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* ── Overdue alert ── */}
      {overdue > 0 && (
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl border danger-bg"
          style={{ borderColor:"var(--danger-color)30" }}>
          <span className="text-lg">⚠</span>
          <div className="flex-1">
            <p className="text-[13px] font-700 danger-text">
              {overdue} task{overdue > 1 ? "s are" : " is"} overdue
            </p>
            <p className="text-[11px] text-secondary">These tasks passed their due date and need immediate attention.</p>
          </div>
          <Button variant="danger" size="sm" onClick={() => { setTab("pending"); setPrio("all"); }}>
            View Overdue
          </Button>
        </div>
      )}

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <SectionLabel className="mb-4">Tasks by Type</SectionLabel>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={typeChartData} barGap={3} barCategoryGap="35%">
              <CartesianGrid vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
              <Bar dataKey="pending" name="Pending" radius={[4,4,0,0]}>
                {typeChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
              <Bar dataKey="done" name="Done" fill="var(--success-color)" radius={[4,4,0,0]} opacity={0.4} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <SectionLabel className="mb-4">Priority Breakdown</SectionLabel>
          <div className="space-y-4 mt-2">
            {prioChartData.map(p => (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <button
                    onClick={() => setPrio(p.name.toLowerCase() as any)}
                    className="text-[13px] font-600 text-primary hover:underline"
                  >
                    {p.name}
                  </button>
                  <span className="text-[14px] font-800" style={{ color: p.color }}>{p.count}</span>
                </div>
                <div className="h-2 rounded-full bg-surface overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width:`${pending > 0 ? (p.count/pending)*100 : 0}%`, background: p.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Type quick-filter chips */}
          <div className="mt-5 pt-4 border-t border-theme">
            <p className="text-[11px] font-700 text-secondary uppercase tracking-wider mb-2.5">Filter by type</p>
            <div className="flex flex-wrap gap-2">
              {(["all", "call", "followup", "trial", "renewal"] as const).map(t => (
                <button key={t} onClick={() => setType(t)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-600 transition-all border",
                    typeFilter === t
                      ? "border-[var(--primary-color)] text-[var(--primary-color)] bg-[var(--hover-bg)]"
                      : "border-theme text-secondary hover-theme"
                  )}>
                  {t !== "all" && <span style={{ color: TYPE_COLOR[t] }}>{TYPE_ICON[t]}</span>}
                  {t === "all" ? "All" : TYPE_LABEL[t]}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Task list ── */}
      <Card>
        {/* Tabs + priority filter */}
        <div className="px-5 py-3.5 card-header flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1 bg-surface border border-theme rounded-xl p-1">
            {(["pending", "done", "all"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={cn("px-4 py-1.5 rounded-lg text-[12px] font-600 transition-all",
                  tab === t ? "bg-[var(--primary-color)] text-white" : "text-secondary hover-theme")}>
                {t.charAt(0).toUpperCase() + t.slice(1)}{" "}
                <span className="opacity-60 text-[10px]">
                  {t === "pending" ? pending : t === "done" ? done : scopedTasks.length}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {(["all", "high", "medium", "low"] as const).map(p => (
              <button key={p} onClick={() => setPrio(p)}
                className={cn("px-3 py-1.5 rounded-lg text-[12px] font-600 transition-all capitalize",
                  prioFilter === p ? "bg-[var(--primary-color)] text-white" : "text-secondary hover-theme")}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Task rows */}
        {visible.length > 0 ? (
          <div className="divide-theme">
            {visible.map(task => (
              <TaskItem key={task.id} task={task} onToggle={toggle} isAdmin={isAdmin} />
            ))}
          </div>
        ) : (
          <EmptyState icon="✓" title="All clear!" description="No tasks match your current filters." />
        )}
      </Card>

      <AddTaskModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={addTask} />
    </div>
  );
};
