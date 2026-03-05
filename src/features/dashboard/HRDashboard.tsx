// ============================================================
// features/dashboard/hr/HRDashboard.tsx
// HR dashboard — read-only org view.
// Shows: headcount stats, staff by role, staff by centre,
//        org-at-a-glance metrics, full staff directory.
// ============================================================

import { useNavigate } from "react-router-dom";
import {
  Card, CardHeader, StatCard, Btn, Avatar,
  ProgressBar, ROLE_COLORS,
} from "./shared/DashboardPrimitives";
import { MOCK_LEADS, MOCK_TRIALS, MOCK_USERS } from "../../data/mockData";
import { useUser } from "../../store/useAuthStore";

export const HRDashboard = () => {
  const navigate = useNavigate();
  const user = useUser();

  // ── Derived data ─────────────────────────────────────────
  const totalStaff    = MOCK_USERS.length;
  const activeStaff   = MOCK_USERS.filter((u) => u.status === "active").length;
  const inactiveStaff = MOCK_USERS.filter((u) => u.status === "inactive").length;

  // Role breakdown
  const roles    = [...new Set(MOCK_USERS.map((u) => u.role))];
  const roleData = roles.map((r) => ({
    role:  r,
    count: MOCK_USERS.filter((u) => u.role === r).length,
  }));

  // Centre breakdown
  const centres    = ["All", "Koramangala", "Indiranagar", "Whitefield"];
  const centreData = centres.map((c) => ({
    name:  c,
    count: c === "All"
      ? MOCK_USERS.filter((u) => u.center === "All").length
      : MOCK_USERS.filter((u) => u.center === c).length,
  }));

  const ORG_STATS = [
    { label: "Total Leads",     value: MOCK_LEADS.length,  color: "#818cf8" },
    { label: "Active Members",  value: MOCK_LEADS.filter((l) => l.stage === "Membership Active").length, color: "#22c55e" },
    { label: "Trials This Month", value: MOCK_TRIALS.length, color: "#f59e0b" },
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
            Here's your staff overview for today.
          </p>
        </div>
        <Btn variant="pri" onClick={() => navigate("/users")}>
          Staff Directory →
        </Btn>
      </div>

      {/* ── HR Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Staff" value={totalStaff}    icon="◎"  accent="#818cf8" />
        <StatCard label="Active"      value={activeStaff}   delta={`${Math.round((activeStaff / totalStaff) * 100)}%`} deltaUp icon="◈" accent="#22c55e" />
        <StatCard label="Inactive"    value={inactiveStaff} icon="◎"  accent="#f87171" />
        <StatCard label="Centres"     value={3}             icon="📍" accent="#f59e0b" />
      </div>

      {/* ── Role Breakdown + Centre Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* By role */}
        <Card>
          <CardHeader title="Staff by Role" sub="Role distribution" />
          <div className="p-5 space-y-4">
            {roleData.map((r) => (
              <div key={r.role}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: ROLE_COLORS[r.role] }}
                    />
                    <span className="text-[13px] font-500 text-primary">
                      {r.role.replace("_", " ")}
                    </span>
                  </div>
                  <span className="text-[13px] font-700 text-primary">{r.count}</span>
                </div>
                <ProgressBar value={r.count} max={totalStaff} color={ROLE_COLORS[r.role]} />
              </div>
            ))}
          </div>
        </Card>

        {/* By centre */}
        <Card>
          <CardHeader title="Staff by Centre" sub="Headcount per location" />
          <div className="p-5 space-y-4">
            {centreData.map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-500 text-primary">{c.name}</span>
                  <span className="text-[13px] font-700 text-primary">{c.count}</span>
                </div>
                <ProgressBar value={c.count} max={totalStaff} color="var(--primary-color)" />
              </div>
            ))}
          </div>

          {/* Org at a glance — read-only */}
          <div className="border-t border-theme p-5">
            <p className="text-[11px] font-700 text-secondary uppercase tracking-wider mb-3">
              Org at a Glance
            </p>
            <div className="grid grid-cols-3 gap-3">
              {ORG_STATS.map((s) => (
                <div key={s.label} className="rounded-xl p-3 text-center border border-theme">
                  <p className="text-[20px] font-800 text-primary">{s.value}</p>
                  <p className="text-[10px] text-secondary leading-tight mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Full Staff Directory (read-only) ── */}
      <Card>
        <CardHeader
          title="Staff Directory"
          sub={`${totalStaff} members`}
          action={<Btn onClick={() => navigate("/users")}>Full Directory</Btn>}
        />
        <div className="divide-theme">
          {MOCK_USERS.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 px-5 py-3.5 hover-theme transition-colors"
            >
              <Avatar name={u.name} size={32} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-600 text-primary">{u.name}</p>
                <p className="text-[11px] text-secondary">{u.email}</p>
              </div>
              <span
                className="text-[10px] font-700 px-2 py-0.5 rounded-full"
                style={{ background: `${ROLE_COLORS[u.role]}15`, color: ROLE_COLORS[u.role] }}
              >
                {u.role.replace("_", " ")}
              </span>
              <span className="text-[12px] text-secondary hidden sm:block">{u.center}</span>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background:
                      u.status === "active" ? "var(--success-color)" : "var(--danger-color)",
                  }}
                />
                <span className="text-[11px] text-secondary capitalize">{u.status}</span>
              </div>
              <span className="text-[11px] text-secondary hidden md:block">
                Last login: {u.lastLogin}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
