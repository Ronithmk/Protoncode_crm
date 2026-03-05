// ============================================================
// features/dashboard/training/TrainingManagerDashboard.tsx
// Training Manager dashboard.
// Shows: today's trials with confirm/done actions, batch
//        overview, trial status summary, upcoming schedule.
// ============================================================

import { useNavigate } from "react-router-dom";
import {
  Card, CardHeader, StatCard, Btn, Avatar,
  ProgressBar, EmptyRow,
} from "./shared/DashboardPrimitives";
import { MOCK_TRIALS } from "../../data/mockData";
import { useUser } from "../../store/useAuthStore";

export const TrainingManagerDashboard = () => {
  const navigate = useNavigate();
  const user = useUser();

  // ── Derived data ─────────────────────────────────────────
  const todayTrials    = MOCK_TRIALS.filter((t) => t.date === "2025-02-28");
  const upcomingTrials = MOCK_TRIALS.filter((t) => t.date > "2025-02-28");
  const doneTrials     = MOCK_TRIALS.filter((t) => t.status === "done");
  const confirmedToday = todayTrials.filter((t) => t.status === "confirmed").length;
  const scheduledToday = todayTrials.filter((t) => t.status === "scheduled").length;
  const totalTrials    = MOCK_TRIALS.length;
  const convRate       = totalTrials > 0 ? Math.round((doneTrials.length / totalTrials) * 100) : 0;

  // Batch breakdown
  const batches   = [...new Set(MOCK_TRIALS.map((t) => t.batch))];
  const batchData = batches.map((b) => ({
    name:    b,
    today:   todayTrials.filter((t) => t.batch === b).length,
    total:   MOCK_TRIALS.filter((t) => t.batch === b).length,
    trainer: MOCK_TRIALS.find((t) => t.batch === b)?.trainer || "—",
  }));

  const STATUS_PILLS = [
    { label: "Confirmed", count: MOCK_TRIALS.filter((t) => t.status === "confirmed").length,  color: "var(--success-color)", bg: "var(--success-bg)" },
    { label: "Scheduled", count: MOCK_TRIALS.filter((t) => t.status === "scheduled").length,  color: "var(--warning-color)", bg: "var(--warning-bg)" },
    { label: "Completed", count: doneTrials.length,                                            color: "var(--text-secondary)", bg: "rgba(0,0,0,0.05)" },
    { label: "No Shows",  count: MOCK_TRIALS.filter((t) => t.status === "no_show").length,    color: "var(--danger-color)",  bg: "var(--danger-bg)" },
  ];

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      {/* ── Greeting ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-800 text-primary">
            Good morning, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-[13px] text-secondary mt-0.5">
            {confirmedToday} confirmed trials and {scheduledToday} pending confirmations today.
          </p>
        </div>
        <Btn variant="pri" onClick={() => navigate("/schedule")}>
          Full Schedule →
        </Btn>
      </div>

      {/* ── Training Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Trials Today"     value={todayTrials.length}    delta={`${confirmedToday} confirmed`} deltaUp icon="🥋" accent="#10b981" />
        <StatCard label="Upcoming Trials"  value={upcomingTrials.length} icon="📅" accent="#818cf8" />
        <StatCard label="Trial Completion" value={`${convRate}%`}        delta="8%" deltaUp icon="◎" accent="#22c55e" />
        <StatCard label="Total Sessions"   value={totalTrials}           delta="This month" deltaUp icon="◈" accent="#f59e0b" />
      </div>

      {/* ── Today's Schedule + Batch Overview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's trials */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader
            title="Today's Trials"
            sub="Feb 28, 2025"
            action={
              <div className="flex gap-2">
                <Btn onClick={() => navigate("/schedule/trials")}>All Trials</Btn>
                <Btn variant="pri">+ Add Session</Btn>
              </div>
            }
          />
          <div className="divide-theme">
            {todayTrials.length > 0 ? (
              todayTrials.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover-theme transition-colors"
                >
                  <Avatar name={t.leadName} size={32} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-600 text-primary">{t.leadName}</p>
                    <p className="text-[11px] text-secondary">{t.phone}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-[12px] font-600 text-primary">{t.batch}</p>
                    <p className="text-[11px] text-secondary">{t.time} · {t.trainer}</p>
                  </div>
                  <span
                    className="text-[10px] font-700 px-2 py-0.5 rounded-full capitalize"
                    style={{
                      background: t.status === "confirmed" ? "var(--success-bg)" : "var(--warning-bg)",
                      color:      t.status === "confirmed" ? "var(--success-color)" : "var(--warning-color)",
                    }}
                  >
                    {t.status}
                  </span>
                  <div className="flex gap-1.5">
                    {t.status === "scheduled" && <Btn variant="pri">Confirm</Btn>}
                    {t.status === "confirmed"  && <Btn>Mark Done</Btn>}
                  </div>
                </div>
              ))
            ) : (
              <EmptyRow message="No trials scheduled today" />
            )}
          </div>
        </Card>

        {/* Batch overview */}
        <Card>
          <CardHeader title="Batches" sub="Program breakdown" />
          <div className="p-5 space-y-4">
            {batchData.map((b) => (
              <div key={b.name}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="text-[13px] font-600 text-primary">{b.name}</p>
                    <p className="text-[11px] text-secondary">{b.trainer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-700 text-primary">{b.today} today</p>
                    <p className="text-[11px] text-secondary">{b.total} total</p>
                  </div>
                </div>
                <ProgressBar
                  value={b.today}
                  max={Math.max(...batchData.map((x) => x.total), 1)}
                  color="var(--primary-color)"
                />
              </div>
            ))}
          </div>

          {/* Trial status pills */}
          <div className="border-t border-theme p-5 grid grid-cols-2 gap-3">
            {STATUS_PILLS.map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-3 text-center"
                style={{ background: s.bg }}
              >
                <p className="text-[20px] font-800" style={{ color: s.color }}>{s.count}</p>
                <p className="text-[10px] font-600" style={{ color: s.color }}>{s.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Upcoming Trials ── */}
      <Card>
        <CardHeader
          title="Upcoming Trials"
          sub="Next sessions"
          action={<Btn onClick={() => navigate("/schedule")}>Calendar View</Btn>}
        />
        <div className="divide-theme">
          {upcomingTrials.length > 0 ? (
            upcomingTrials.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 px-5 py-3.5 hover-theme transition-colors"
              >
                <Avatar name={t.leadName} size={30} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-600 text-primary">{t.leadName}</p>
                  <p className="text-[11px] text-secondary">{t.phone}</p>
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-[12px] font-600 text-primary">{t.batch}</p>
                  <p className="text-[11px] text-secondary">{t.trainer}</p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-600 text-primary">{t.date}</p>
                  <p className="text-[11px] text-secondary">{t.time}</p>
                </div>
                <span
                  className="text-[10px] font-700 px-2 py-0.5 rounded-full"
                  style={{ background: "var(--warning-bg)", color: "var(--warning-color)" }}
                >
                  {t.status}
                </span>
              </div>
            ))
          ) : (
            <EmptyRow message="No upcoming trials" />
          )}
        </div>
      </Card>
    </div>
  );
};
