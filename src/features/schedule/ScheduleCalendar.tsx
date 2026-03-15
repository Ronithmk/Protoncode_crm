// ============================================================
// features/schedule/ScheduleCalendar.tsx
// Monthly calendar with trial overlays + daily drill-down.
// ============================================================

import { useState } from "react";
import { cn } from "../../utils/cn";
import { PageHeader, Button, Card, Avatar } from "../../components/ui";
import { MOCK_TRIALS } from "../../data/mockData";
 
const STATUS_PILL: Record<string, string> = {
  scheduled: "bg-amber-500/15 text-amber-400",
  confirmed:  "bg-emerald-500/15 text-emerald-400",
  done:       "bg-slate-500/15 text-slate-400",
  cancelled:  "bg-red-500/15 text-red-400",
  no_show:    "bg-red-500/15 text-red-400",
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
