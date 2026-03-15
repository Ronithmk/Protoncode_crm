// features/schedule/CalendarPage.tsx  →  /schedule

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import {
  Card, PageHeader, Button, Avatar,
    StatCard, Modal, Select, Input,
} from "../../components/ui";
import { MOCK_TRIALS, MOCK_LEADS } from "../../data/mockData";
import { useRole } from "../../store/useAuthStore";

// ─── CONSTANTS ────────────────────────────────────────────

const DAYS   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const TODAY = "2025-02-28";

const STATUS_CFG: Record<string, { dot: string; pill: string; label: string }> = {
  scheduled: { dot:"var(--warning-color)",  pill:"warning-text warning-bg",                          label:"Scheduled" },
  confirmed: { dot:"var(--success-color)",  pill:"success-text success-bg",                          label:"Confirmed" },
  done:      { dot:"var(--text-secondary)", pill:"text-secondary bg-surface border border-theme",    label:"Done"      },
  cancelled: { dot:"var(--danger-color)",   pill:"danger-text danger-bg",                            label:"Cancelled" },
  no_show:   { dot:"var(--danger-color)",   pill:"danger-text danger-bg",                            label:"No-show"   },
};

const PROG_COLOR: Record<string, string> = {
  BJJ:"var(--primary-color)", Kickboxing:"var(--warning-color)",
  MMA:"var(--danger-color)",  Wrestling:"#f472b6",
};

// ─── HELPERS ──────────────────────────────────────────────

function getCalendarDays(year: number, month: number) {
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev  = new Date(year, month, 0).getDate();

  const days: { date: number; month: "prev" | "cur" | "next"; full: string }[] = [];
  for (let i = firstDay - 1; i >= 0; i--)
    days.push({ date: daysInPrev - i, month: "prev", full: "" });
  for (let d = 1; d <= daysInMonth; d++) {
    const full = `${year}-${String(month + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    days.push({ date: d, month: "cur", full });
  }
  while (days.length % 7 !== 0)
    days.push({ date: days.length - daysInMonth - firstDay + 1, month: "next", full: "" });
  return days;
}

function fmtDate(dateStr: string) {
  return new Date(dateStr + "T00:00").toLocaleDateString("en-IN", {
    weekday:"long", month:"long", day:"numeric",
  });
}

// ─── SCHEDULE TRIAL MODAL ─────────────────────────────────

const ScheduleModal = ({ open, onClose, defaultDate }: {
  open: boolean; onClose: () => void; defaultDate: string;
}) => {
  const [form, setForm] = useState({
    lead:"", date: defaultDate, time:"6:00 PM",
    batch:"BJJ Basics", trainer:"Coach Reddy", program:"BJJ",
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  return (
    <Modal open={open} onClose={onClose} title="Schedule Trial Session" width="max-w-lg">
      <div className="space-y-4">
        <Select label="Lead *" value={form.lead} onChange={e => set("lead", e.target.value)}>
          <option value="">Select lead...</option>
          {MOCK_LEADS.filter(l => !["Joined","Membership Active","Renewal"].includes(l.stage)).map(l => (
            <option key={l.id} value={l.id}>{l.name} — {l.stage}</option>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Date *" type="date" value={form.date} onChange={e => set("date", e.target.value)} />
          <Input label="Time *" placeholder="6:00 PM" value={form.time} onChange={e => set("time", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Program" value={form.program} onChange={e => set("program", e.target.value)}>
            {["BJJ","Kickboxing","MMA","Wrestling"].map(p => <option key={p}>{p}</option>)}
          </Select>
          <Select label="Batch" value={form.batch} onChange={e => set("batch", e.target.value)}>
            {["BJJ Basics","Kickboxing AM","MMA Intro","BJJ Advanced","Kids BJJ"].map(b => <option key={b}>{b}</option>)}
          </Select>
        </div>
        <Select label="Trainer" value={form.trainer} onChange={e => set("trainer", e.target.value)}>
          {["Coach Reddy","Coach Meena","Coach Kumar"].map(t => <option key={t}>{t}</option>)}
        </Select>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={!form.lead}>Schedule Trial →</Button>
      </div>
    </Modal>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────

export const ScheduleCalendar = () => {
  const navigate   = useNavigate();
  const role       = useRole();

  // const todayDate  = new Date();
  const [year, setYear]   = useState(2025);
  const [month, setMonth] = useState(1);  // Feb 2025
  const [selectedDate, setSelectedDate]   = useState(TODAY);
  const [progFilter, setProgFilter]       = useState("All");
  const [showSchedule, setShowSchedule]   = useState(false);

  const canManage = ["SUPER_ADMIN","ADMIN","CENTER_MANAGER","TRAINING_MANAGER"].includes(role);

  const calDays = getCalendarDays(year, month);

  const trialsOnDate = (dateStr: string) => {
    let t = MOCK_TRIALS.filter(t => t.date === dateStr);
    if (progFilter !== "All") t = t.filter(t => t.program === progFilter);
    return t;
  };

  const selectedTrials = trialsOnDate(selectedDate);

  const prevMonth = () => { if (month === 0) { setYear(y => y-1); setMonth(11); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y+1); setMonth(0); } else setMonth(m => m+1); };

  // KPI data
  const allTrials      = MOCK_TRIALS;
  const todayTrials    = allTrials.filter(t => t.date === TODAY);
  const upcomingTrials = allTrials.filter(t => t.date > TODAY);
  const confirmed      = todayTrials.filter(t => t.status === "confirmed").length;

  // Upcoming 5 sessions
  const upcoming = [...allTrials]
    .filter(t => t.date >= TODAY)
    .sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 5);

  return (
    <div className="p-6 max-w-[1400px] space-y-5">
      <PageHeader
        title="Schedule"
        subtitle="Trial sessions, batches and follow-ups"
        actions={
          <div className="flex gap-2">
            {/* Programme filter pills */}
            <div className="flex gap-1 bg-surface border border-theme rounded-xl p-1">
              {["All","BJJ","Kickboxing","MMA","Wrestling"].map(p => (
                <button key={p} onClick={() => setProgFilter(p)}
                  className={cn("px-3 py-1.5 rounded-lg text-[12px] font-600 transition-all",
                    progFilter === p ? "bg-[var(--primary-color)] text-white" : "text-secondary hover-theme")}>
                  {p}
                </button>
              ))}
            </div>
            {canManage && (
              <Button variant="primary" size="sm" onClick={() => setShowSchedule(true)}>
                + Schedule Trial
              </Button>
            )}
          </div>
        }
      />

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Trials"   value={todayTrials.length}    delta={`${confirmed} confirmed`}    deltaType="up" />
        <StatCard label="Upcoming"         value={upcomingTrials.length}  delta="Next 7 days"                deltaType="up" />
        <StatCard label="Confirmed Today"  value={confirmed}              delta="Ready"                      deltaType="up" />
        <StatCard label="Total (Month)"    value={allTrials.length}       delta="Feb 2025"                   deltaType="up" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">

        {/* ── Calendar grid ── */}
        <Card className="p-5">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[16px] font-700 text-primary">
              {MONTHS[month]} {year}
            </h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={prevMonth}>←</Button>
              <Button variant="secondary" size="sm"
                onClick={() => { setYear(2025); setMonth(1); setSelectedDate(TODAY); }}>
                Today
              </Button>
              <Button variant="ghost" size="sm" onClick={nextMonth}>→</Button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-[11px] font-700 text-secondary text-center py-1">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {calDays.map((day, i) => {
              const isOther    = day.month !== "cur";
              const isToday    = day.full === TODAY;
              const isSelected = day.full === selectedDate;
              const trials     = trialsOnDate(day.full);
              // const hasTrials  = trials.length > 0;

              return (
                <div key={i}
                  onClick={() => !isOther && day.full && setSelectedDate(day.full)}
                  className={cn(
                    "relative min-h-[72px] rounded-xl p-1.5 transition-all duration-150",
                    isOther    ? "opacity-20 pointer-events-none" : "cursor-pointer",
                    isSelected && !isOther ? "bg-[var(--hover-bg)] ring-2 ring-[var(--primary-color)]" : "",
                    !isSelected && !isOther ? "hover:bg-[var(--hover-bg)]" : "",
                  )}
                >
                  {/* Date number */}
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-700 mb-1",
                    isToday
                      ? "bg-[var(--primary-color)] text-white"
                      : "text-secondary"
                  )}>
                    {day.date}
                  </div>

                  {/* Trial pills */}
                  {trials.slice(0,2).map((t, ti) => (
                    <div key={ti}
                      className="text-[9px] font-700 rounded-md px-1 py-0.5 truncate mb-0.5 leading-tight"
                      style={{
                        background: `${PROG_COLOR[t.program] ?? "var(--primary-color)"}20`,
                        color:       PROG_COLOR[t.program] ?? "var(--primary-color)",
                      }}>
                      {t.leadName.split(" ")[0]}
                    </div>
                  ))}
                  {trials.length > 2 && (
                    <div className="text-[9px] text-secondary px-1">+{trials.length-2}</div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* ── Day detail panel ── */}
        <Card className="flex flex-col overflow-hidden">
          <div className="px-5 py-4 card-header">
            <p className="text-[13px] font-700 text-primary">
              {selectedDate ? fmtDate(selectedDate) : "Select a date"}
            </p>
            <p className="text-[11px] text-secondary mt-0.5">
              {selectedTrials.length} session{selectedTrials.length !== 1 ? "s" : ""}
              {progFilter !== "All" && ` · ${progFilter} only`}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto divide-theme">
            {selectedTrials.length > 0 ? selectedTrials.map(t => {
              const cfg = STATUS_CFG[t.status] ?? STATUS_CFG.scheduled;
              return (
                <div key={t.id}
                  onClick={() => navigate(`/leads/${t.leadId}`)}
                  className="p-4 hover-theme transition-colors cursor-pointer">

                  {/* Lead row */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <Avatar name={t.leadName} size={30} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-700 text-primary">{t.leadName}</p>
                      <p className="text-[11px] text-secondary">{t.phone}</p>
                    </div>
                    <span className={cn("text-[10px] font-700 px-2 py-0.5 rounded-full capitalize flex-shrink-0", cfg.pill)}>
                      {cfg.label}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 pl-1">
                    {[
                      { icon:"🥋", val:`${t.batch} · ${t.program}`, color: PROG_COLOR[t.program] },
                      { icon:"⏰", val:t.time },
                      { icon:"👤", val:t.trainer },
                    ].map(r => (
                      <div key={r.icon} className="flex items-center gap-2">
                        <span className="text-[12px] w-4">{r.icon}</span>
                        <span className="text-[12px] text-secondary" style={r.color ? { color:r.color } : undefined}>
                          {r.val}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  {canManage && t.status !== "done" && (
                    <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
                      {t.status === "scheduled" && (
                        <Button variant="secondary" size="sm">Confirm</Button>
                      )}
                      {t.status === "confirmed" && (
                        <Button variant="primary" size="sm">Mark Done</Button>
                      )}
                      <Button variant="danger" size="sm">No-show</Button>
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="flex flex-col items-center justify-center py-14 text-center px-5">
                <p className="text-3xl mb-3">📅</p>
                <p className="text-[13px] font-600 text-primary mb-1">No sessions</p>
                <p className="text-[12px] text-secondary">
                  {canManage ? "Click '+ Schedule Trial' to add one." : "No trials scheduled for this date."}
                </p>
              </div>
            )}
          </div>

          {canManage && (
            <div className="p-4 border-t border-theme">
              <Button variant="primary" size="sm" className="w-full"
                onClick={() => setShowSchedule(true)}>
                + Add Session on this Day
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* ── Upcoming sessions strip ── */}
      <Card>
        <div className="px-5 py-4 card-header flex items-center justify-between">
          <div>
            <p className="text-[14px] font-700 text-primary">Upcoming Sessions</p>
            <p className="text-[12px] text-secondary mt-0.5">Next scheduled trials</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate("/schedule/trials")}>
            All Trials →
          </Button>
        </div>
        <div className="divide-theme">
          {upcoming.length > 0 ? upcoming.map(t => {
            const cfg = STATUS_CFG[t.status] ?? STATUS_CFG.scheduled;
            return (
              <div key={t.id}
                onClick={() => navigate(`/leads/${t.leadId}`)}
                className="flex items-center gap-3 px-5 py-3.5 hover-theme transition-colors cursor-pointer">
                <div className="w-10 flex-shrink-0 text-center">
                  <p className="text-[10px] text-secondary uppercase">{t.date.slice(5,7)}/{t.date.slice(8)}</p>
                  <p className="text-[11px] font-700 text-primary">{t.time}</p>
                </div>
                <div className="w-px h-8 bg-[var(--border-color)] flex-shrink-0" />
                <Avatar name={t.leadName} size={30} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-600 text-primary">{t.leadName}</p>
                  <p className="text-[11px] text-secondary">{t.batch} · {t.trainer}</p>
                </div>
                <span className="text-[11px] font-600 flex-shrink-0"
                  style={{ color: PROG_COLOR[t.program] ?? "var(--primary-color)" }}>
                  {t.program}
                </span>
                <span className={cn("text-[10px] font-700 px-2 py-0.5 rounded-full flex-shrink-0", cfg.pill)}>
                  {cfg.label}
                </span>
              </div>
            );
          }) : (
            <div className="px-5 py-8 text-center">
              <p className="text-[13px] text-secondary">No upcoming sessions.</p>
            </div>
          )}
        </div>
      </Card>

      <ScheduleModal
        open={showSchedule}
        onClose={() => setShowSchedule(false)}
        defaultDate={selectedDate}
      />
    </div>
  );
};
