// ============================================================
// features/dashboard/fm/FMDashboard.tsx
// Finance Manager dashboard.
// Shows: renewals due, revenue MTD, active members,
//        membership plan breakdown, revenue trend.
// ============================================================

import { useNavigate } from "react-router-dom";
import {
  Card, CardHeader, StatCard, Btn, Avatar,
  ProgressBar, MiniBarChart, EmptyRow,
} from "./shared/DashboardPrimitives";
import { MOCK_LEADS, LEAD_CHART_DATA } from "../../data/mockData";
import { useUser } from "../../store/useAuthStore";

const PLAN_COLORS: Record<string, string> = {
  Monthly: "#818cf8",
  Quarterly: "#10b981",
  "Half-Yearly": "#f59e0b",
  Annual: "#ec4899",
};

export const FMDashboard = () => {
  const navigate = useNavigate();
  const user = useUser();

  // ── Derived data ─────────────────────────────────────────
  const renewalLeads = MOCK_LEADS.filter((l) => l.stage === "Renewal");
  const activeMembers = MOCK_LEADS.filter((l) => l.stage === "Membership Active");
  const totalRevenue = MOCK_LEADS.reduce((s, l) => s + (l.totalRevenue || 0), 0);
  const renewalRevenue = renewalLeads.reduce((s, l) => s + (l.totalRevenue || 0), 0);

  const planData = ["Monthly", "Quarterly", "Half-Yearly", "Annual"].map((p) => ({
    name: p,
    count: MOCK_LEADS.filter((l) => l.membershipPlan === p).length,
    revenue: MOCK_LEADS.filter((l) => l.membershipPlan === p).reduce(
      (s, l) => s + (l.totalRevenue || 0),
      0,
    ),
  }));

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      {/* ── Greeting ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-800 text-primary">
            Good morning, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-[13px] text-secondary mt-0.5">
            {renewalLeads.length} renewals are pending action today.
          </p>
        </div>
        <Btn variant="pri" onClick={() => navigate("/renewals")}>
          Manage Renewals →
        </Btn>
      </div>

      {/* ── Finance Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue MTD" value={`₹${(totalRevenue / 1000).toFixed(0)}K`} delta="18%" deltaUp icon="₹" accent="#f59e0b" />
        <StatCard label="Active Members" value={activeMembers.length} delta="2 new" deltaUp icon="◎" accent="#22c55e" />
        <StatCard label="Renewals Due" value={renewalLeads.length} icon="↺" accent="#f87171" />
        <StatCard label="Renewal Revenue" value={`₹${(renewalRevenue / 1000).toFixed(1)}K`} icon="💳" accent="#818cf8" />
      </div>

      {/* ── Renewals + Plan Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Renewals due */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader
            title="Renewals Due"
            sub={`${renewalLeads.length} members`}
            action={<Btn variant="pri" onClick={() => navigate("/renewals")}>All Renewals</Btn>}
          />
          <div className="divide-theme">
            {renewalLeads.length > 0 ? (
              renewalLeads.map((l) => (
                <div
                  key={l.id}
                  onClick={() => navigate(`/leads/${l.id}`)}
                  className="flex items-center gap-3 px-5 py-3.5 hover-theme transition-colors cursor-pointer"
                >
                  <Avatar name={l.name} size={32} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-600 text-primary truncate">{l.name}</p>
                    <p className="text-[11px] text-secondary">
                      {l.membershipPlan} · {l.phone}
                    </p>
                  </div>
                  <span className="text-[13px] font-700 text-primary">
                    ₹{l.totalRevenue?.toLocaleString("en-IN")}
                  </span>
                  <div className="flex gap-2">
                    <Btn>Send Reminder</Btn>
                    <Btn variant="pri">Renew</Btn>
                  </div>
                </div>
              ))
            ) : (
              <EmptyRow message="No renewals pending" />
            )}
          </div>
        </Card>

        {/* Membership plan breakdown */}
        <Card>
          <CardHeader title="Membership Plans" sub="Revenue by plan" />
          <div className="p-5 space-y-4">
            {planData
              .filter((p) => p.count > 0)
              .map((p) => (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: PLAN_COLORS[p.name] }}
                      />
                      <span className="text-[13px] font-500 text-primary">{p.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[12px] font-700 text-primary block">
                        {p.count} members
                      </span>
                      <span className="text-[11px] text-secondary">
                        ₹{p.revenue.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  <ProgressBar
                    value={p.revenue}
                    max={totalRevenue || 1}
                    color={PLAN_COLORS[p.name]}
                  />
                </div>
              ))}
          </div>

          {/* Revenue trend chart */}
          <div className="border-t border-theme p-5">
            <p className="text-[11px] font-700 text-secondary uppercase tracking-wider mb-3">
              Revenue Trend
            </p>
            <MiniBarChart
              data={LEAD_CHART_DATA.map((d) => ({
                ...d,
                value: d.value * 6800,
                secondary: undefined,
              }))}
              color="#f59e0b"
            />
          </div>
        </Card>
      </div>

      {/* ── Active Members ── */}
      <Card>
        <CardHeader
          title="Active Members"
          sub={`${activeMembers.length} members`}
          action={<Btn onClick={() => navigate("/leads")}>View All</Btn>}
        />
        <div className="divide-theme">
          {activeMembers.map((l) => (
            <div
              key={l.id}
              onClick={() => navigate(`/leads/${l.id}`)}
              className="flex items-center gap-3 px-5 py-3.5 hover-theme transition-colors cursor-pointer"
            >
              <Avatar name={l.name} size={30} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-600 text-primary truncate">{l.name}</p>
                <p className="text-[11px] text-secondary">{l.center}</p>
              </div>
              <span
                className="text-[12px] font-600 text-secondary px-2 py-0.5 rounded-lg"
                style={{ background: "var(--hover-bg)" }}
              >
                {l.membershipPlan}
              </span>
              <span className="text-[13px] font-700 text-primary">
                ₹{l.totalRevenue?.toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] text-secondary hidden md:block">
                Expires {l.membershipEnd || "—"}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
