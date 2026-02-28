// ============================================================
// features/schedule/ScheduleCalendar.tsx
// Monthly calendar with trial overlays + daily drill-down.
// ============================================================

import { useState } from "react";
import { cn } from "../../utils/cn";
import { PageHeader, Button, Card, Avatar } from "../../components/ui";
import { MOCK_TRIALS } from "../../data/mockData";

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

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

const STATUS_PILL: Record<string, string> = {
  scheduled: "bg-amber-500/15 text-amber-400",
  confirmed:  "bg-emerald-500/15 text-emerald-400",
  done:       "bg-slate-500/15 text-slate-400",
  cancelled:  "bg-red-500/15 text-red-400",
  no_show:    "bg-red-500/15 text-red-400",
};

export const ScheduleCalendar = () => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 1 = Feb
  const [selectedDate, setSelectedDate] = useState<string>("2025-02-28");

  const calDays = getCalendarDays(year, month);

  const trialsOnDate = (dateStr: string) =>
    MOCK_TRIALS.filter(t => t.date === dateStr);

  const selectedTrials = trialsOnDate(selectedDate);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  return (
    <div className="p-6 max-w-[1400px]">
      <PageHeader
        title="Calendar"
        subtitle="Schedule and upcoming sessions"
        actions={<Button variant="primary" size="sm">+ Schedule Trial</Button>}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        {/* Calendar grid */}
        <Card className="p-5">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-bold text-primary">
              {MONTHS[month]} {year}
            </h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={prevMonth}>←</Button>
              <Button variant="secondary" size="sm" onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDate("2025-02-28"); }}>
                Today
              </Button>
              <Button variant="ghost" size="sm" onClick={nextMonth}>→</Button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-[11px] font-semibold text-slate-600 text-center py-1">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {calDays.map((day, i) => {
              const isOtherMonth = day.month !== "cur";
              const isToday = day.full === "2025-02-28";
              const isSelected = day.full === selectedDate;
              const trials = trialsOnDate(day.full);

              return (
                <div
                  key={i}
                  onClick={() => !isOtherMonth && day.full && setSelectedDate(day.full)}
                  className={cn(
                    "relative min-h-[72px] rounded-lg p-1.5 transition-colors",
                    isOtherMonth ? "opacity-25 pointer-events-none" : "cursor-pointer",
                    isSelected && !isOtherMonth && "bg-indigo-500/10 ring-1 ring-indigo-500/30",
                    !isSelected && !isOtherMonth && "hover:bg-white/3",
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-semibold mb-1",
                    isToday && "bg-indigo-500 text-primary",
                    !isToday && "text-secondary",
                  )}>
                    {day.date}
                  </div>
                  {trials.map((t, ti) => (
                    <div
                      key={ti}
                      className={cn("text-[9px] font-medium rounded px-1 py-0.5 truncate mb-0.5", STATUS_PILL[t.status])}
                    >
                      {t.leadName.split(" ")[0]}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Day detail panel */}
        <Card className="flex flex-col">
          <div className="px-4 py-3.5 border-b border-theme">
            <p className="text-[13px] font-semibold text-primary">
              {selectedDate ? new Date(selectedDate + "T00:00").toLocaleDateString("en-IN", { weekday:"long", month:"long", day:"numeric" }) : "Select a date"}
            </p>
            <p className="text-[11px] text-secondary mt-0.5">{selectedTrials.length} sessions</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {selectedTrials.length > 0 ? selectedTrials.map(t => (
              <div
                key={t.id}
                className="bg-card border border-theme rounded-xl p-3 hover:border-[var(--primary-color)] transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Avatar name={t.leadName} size={26} />
                  <div>
                    <p className="text-[12px] font-semibold text-primary">{t.leadName}</p>
                    <p className="text-[10px] text-secondary">{t.phone}</p>
                  </div>
                  <span className={cn("ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full capitalize", STATUS_PILL[t.status])}>
                    {t.status.replace("_"," ")}
                  </span>
                </div>
                <div className="space-y-1">
                  {[
                    { icon:"🥋", val:`${t.batch} · ${t.program}` },
                    { icon:"⏰", val:t.time },
                    { icon:"◎",  val:t.trainer },
                  ].map(r => (
                    <div key={r.icon} className="flex items-center gap-2">
                      <span className="text-[11px]">{r.icon}</span>
                      <span className="text-[11px] text-slate-400">{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )) : (
              <div className="py-12 text-center">
                <p className="text-slate-600 text-[13px]">No sessions</p>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-theme">
            <Button variant="primary" size="sm" className="w-full">+ Add Session</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ============================================================
// features/schedule/TrialsPage.tsx
// Flat list of all trial sessions with filters + status management.
// ============================================================

export const TrialsPage = () => {
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = MOCK_TRIALS.filter(t =>
    statusFilter === "all" || t.status === statusFilter
  );

  const STATUS_LABEL: Record<string, string> = {
    scheduled:"Scheduled", confirmed:"Confirmed", done:"Done", cancelled:"Cancelled", no_show:"No Show",
  };
  const counts = MOCK_TRIALS.reduce<Record<string,number>>((a, t) => { a[t.status] = (a[t.status]||0)+1; return a; }, {});

  return (
    <div className="p-6 max-w-[1400px]">
      <PageHeader
        title="Trials"
        subtitle="All trial sessions across centers"
        actions={<Button variant="primary" size="sm">+ Schedule Trial</Button>}
      />

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto">
        {[{ key:"all", label:`All (${MOCK_TRIALS.length})` }, ...Object.entries(STATUS_LABEL).map(([k,v]) => ({ key:k, label:`${v} (${counts[k]||0})` }))].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={cn(
              "px-4 py-2 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap",
              statusFilter === tab.key
                ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                : "text-secondary hover:text-primary hover:bg-white/5"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trial cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(trial => (
          <Card key={trial.id} hover className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={trial.leadName} size={36} />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-primary truncate">{trial.leadName}</p>
                <p className="text-[12px] text-secondary">{trial.phone}</p>
              </div>
              <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full capitalize", STATUS_PILL[trial.status])}>
                {trial.status.replace("_"," ")}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              {[
                { icon:"📅", val:`${trial.date} · ${trial.time}` },
                { icon:"🥋", val:`${trial.batch} — ${trial.program}` },
                { icon:"◎",  val:trial.trainer },
              ].map(r => (
                <div key={r.icon} className="flex items-center gap-2">
                  <span className="text-sm flex-shrink-0">{r.icon}</span>
                  <span className="text-[12px] text-secondary">{r.val}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              {trial.status === "scheduled" && (
                <Button variant="primary" size="sm" className="flex-1">Confirm</Button>
              )}
              {trial.status === "confirmed" && (
                <Button variant="primary" size="sm" className="flex-1">Mark Done</Button>
              )}
              <Button variant="secondary" size="sm">Reschedule</Button>
              {["scheduled","confirmed"].includes(trial.status) && (
                <Button variant="danger" size="sm">Cancel</Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
