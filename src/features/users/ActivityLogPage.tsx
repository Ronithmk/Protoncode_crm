// features/users/ActivityLogPage.tsx  →  /users/activity

import { useState } from "react";
import { cn } from "../../utils/cn";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Card, PageHeader, Button, Avatar,
  RoleBadge, Table, Th, Td, Tr,
  EmptyState, SectionLabel, StatCard,
} from "../../components/ui";

// ─── TYPES ────────────────────────────────────────────────

type ActionType = "login" | "edit" | "delete" | "create" | "export" | "security";

type ActivityEntry = {
  id: string; user: string; role: string;
  action: string; target: string;
  ip: string; device: string; location: string;
  time: string; date: string;
  type: ActionType; isAlert?: boolean;
};

// ─── MOCK DATA ────────────────────────────────────────────

const ACTIVITY_LOG: ActivityEntry[] = [
  { id:"AL001", user:"Rajesh Kumar", role:"SUPER_ADMIN",      action:"Logged in",                    target:"Dashboard",        ip:"192.168.1.1",   device:"Chrome · macOS",   location:"Bangalore",  time:"9:02 AM",  date:"Today",     type:"login"    },
  { id:"AL002", user:"Priya R",      role:"RM",               action:"Updated lead stage",            target:"Arjun Mehta",       ip:"192.168.1.25",  device:"Chrome · Windows", location:"Bangalore",  time:"9:15 AM",  date:"Today",     type:"edit"     },
  { id:"AL003", user:"Meena Sharma", role:"FM",               action:"Created membership",            target:"Dev Sharma",        ip:"192.168.1.30",  device:"Safari · macOS",   location:"Bangalore",  time:"10:00 AM", date:"Today",     type:"create"   },
  { id:"AL004", user:"Dev Admin",    role:"ADMIN",            action:"Logged in from new device",     target:"Dashboard",        ip:"103.24.56.78",  device:"Chrome · Android", location:"Mumbai",     time:"10:30 AM", date:"Today",     type:"security", isAlert:true },
  { id:"AL005", user:"Kiran TM",     role:"TRAINING_MANAGER", action:"Confirmed trial session",       target:"Arjun Mehta",       ip:"192.168.1.40",  device:"Firefox · macOS",  location:"Bangalore",  time:"11:00 AM", date:"Today",     type:"edit"     },
  { id:"AL006", user:"Rajesh Kumar", role:"SUPER_ADMIN",      action:"Exported leads report",         target:"All Leads CSV",     ip:"192.168.1.1",   device:"Chrome · macOS",   location:"Bangalore",  time:"11:30 AM", date:"Today",     type:"export"   },
  { id:"AL007", user:"Ravi K",       role:"RM",               action:"Added note to lead",            target:"Sneha Kapoor",      ip:"192.168.1.26",  device:"Chrome · Windows", location:"Bangalore",  time:"12:15 PM", date:"Today",     type:"create"   },
  { id:"AL008", user:"Anita HR",     role:"HR",               action:"Logged in",                    target:"Dashboard",        ip:"192.168.1.50",  device:"Safari · iPhone",  location:"Bangalore",  time:"2:00 PM",  date:"Today",     type:"login"    },
  { id:"AL009", user:"Priya R",      role:"RM",               action:"Imported leads",               target:"meta_leads.csv",   ip:"192.168.1.25",  device:"Chrome · Windows", location:"Bangalore",  time:"3:30 PM",  date:"Today",     type:"create"   },
  { id:"AL010", user:"Meena Sharma", role:"FM",               action:"Processed renewal",            target:"Rohit Verma",       ip:"192.168.1.30",  device:"Safari · macOS",   location:"Bangalore",  time:"4:00 PM",  date:"Today",     type:"edit"     },
  { id:"AL011", user:"Dev Admin",    role:"ADMIN",            action:"Updated WhatsApp settings",    target:"Integration",      ip:"103.24.56.78",  device:"Chrome · Android", location:"Mumbai",     time:"9:00 AM",  date:"Yesterday", type:"edit"     },
  { id:"AL012", user:"Rajesh Kumar", role:"SUPER_ADMIN",      action:"Added new user role",          target:"Sales Manager",    ip:"192.168.1.1",   device:"Chrome · macOS",   location:"Bangalore",  time:"10:00 AM", date:"Yesterday", type:"create"   },
  { id:"AL013", user:"Ravi K",       role:"RM",               action:"Deleted draft lead",           target:"Unknown Lead",     ip:"192.168.1.26",  device:"Chrome · Windows", location:"Bangalore",  time:"11:45 AM", date:"Yesterday", type:"delete"   },
  { id:"AL014", user:"Kiran TM",     role:"TRAINING_MANAGER", action:"Created new batch",            target:"BJJ Advanced",     ip:"192.168.1.40",  device:"Firefox · macOS",  location:"Bangalore",  time:"2:20 PM",  date:"Yesterday", type:"create"   },
  { id:"AL015", user:"Unknown",      role:"—",                action:"Failed login attempt (3x)",    target:"admin@dojo.com",   ip:"45.33.120.84",  device:"Unknown",          location:"Unknown",    time:"11:00 PM", date:"Yesterday", type:"security", isAlert:true },
  { id:"AL016", user:"Rajesh Kumar", role:"SUPER_ADMIN",      action:"Viewed revenue summary",       target:"Revenue Report",   ip:"192.168.1.1",   device:"Chrome · macOS",   location:"Bangalore",  time:"8:30 AM",  date:"Earlier",   type:"login"    },
  { id:"AL017", user:"Meena Sharma", role:"FM",               action:"Exported renewal list",        target:"Renewals CSV",     ip:"192.168.1.30",  device:"Safari · macOS",   location:"Bangalore",  time:"9:00 AM",  date:"Earlier",   type:"export"   },
];

// ─── ACTION CONFIG ────────────────────────────────────────

const ACTION_CFG: Record<ActionType, { icon: string; cls: string; label: string }> = {
  login:    { icon:"→",  cls:"text-secondary bg-surface border border-theme",                      label:"Login"    },
  edit:     { icon:"✎",  cls:"warning-text warning-bg",                                            label:"Edit"     },
  delete:   { icon:"✕",  cls:"danger-text danger-bg",                                              label:"Delete"   },
  create:   { icon:"+",  cls:"success-text success-bg",                                            label:"Create"   },
  export:   { icon:"↓",  cls:"text-[var(--primary-color)] bg-[var(--hover-bg)]",                  label:"Export"   },
  security: { icon:"⚠",  cls:"danger-text danger-bg",                                              label:"Security" },
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

// ─── MAIN PAGE ────────────────────────────────────────────

export const ActivityLogPage = () => {
  const [search, setSearch]           = useState("");
  const [typeFilter, setTypeFilter]   = useState<ActionType | "all">("all");
  const [userFilter, setUserFilter]   = useState("All");
  const [dateFilter, setDateFilter]   = useState<"today" | "yesterday" | "all">("all");
  const [showAlerts, setShowAlerts]   = useState(false);

  const alerts = ACTIVITY_LOG.filter(e => e.isAlert);

  const filtered = ACTIVITY_LOG.filter(e => {
    const matchSearch  = !search || e.user.toLowerCase().includes(search.toLowerCase()) || e.action.toLowerCase().includes(search.toLowerCase()) || e.target.toLowerCase().includes(search.toLowerCase());
    const matchType    = typeFilter === "all" ? true : e.type === typeFilter;
    const matchUser    = userFilter === "All" ? true : e.user === userFilter;
    const matchDate    = dateFilter === "all"       ? true
                       : dateFilter === "today"     ? e.date === "Today"
                       : e.date === "Yesterday";
    const matchAlerts  = showAlerts ? e.isAlert : true;
    return matchSearch && matchType && matchUser && matchDate && matchAlerts;
  });

  // Group by date
  const groups = (["Today", "Yesterday", "Earlier"] as const).map(d => ({
    date:  d,
    items: filtered.filter(e => e.date === d),
  })).filter(g => g.items.length > 0);

  // Action type chart
  const actionTypes: ActionType[] = ["login", "create", "edit", "export", "delete", "security"];
  const chartData = actionTypes.map(t => ({
    name:  ACTION_CFG[t].label,
    count: ACTIVITY_LOG.filter(e => e.type === t).length,
    fill:  t === "security" ? "var(--danger-color)"   :
           t === "create"   ? "var(--success-color)"  :
           t === "edit"     ? "var(--warning-color)"  :
           t === "delete"   ? "var(--danger-color)"   :
           t === "export"   ? "var(--primary-color)"  :
                              "var(--text-secondary)",
  }));

  // Per-user action counts
  const uniqueUsers = [...new Set(ACTIVITY_LOG.filter(e => e.user !== "Unknown").map(e => e.user))];
  const userActivity = uniqueUsers.map(name => ({
    name,
    role:    ACTIVITY_LOG.find(e => e.user === name)?.role ?? "",
    actions: ACTIVITY_LOG.filter(e => e.user === name).length,
    lastSeen:ACTIVITY_LOG.find(e => e.user === name)?.time ?? "",
  })).sort((a, b) => b.actions - a.actions);

  const totalActions = ACTIVITY_LOG.length;
  const todayCount   = ACTIVITY_LOG.filter(e => e.date === "Today").length;
  const alertCount   = alerts.length;
  const uniqueCount  = uniqueUsers.length;

  return (
    <div className="p-6 max-w-[1300px] space-y-5">
      <PageHeader
        title="Activity Log"
        subtitle="Complete audit trail of all user actions across the system"
        actions={
          <div className="flex gap-2">
            {alertCount > 0 && (
              <Button
                variant={showAlerts ? "danger" : "secondary"}
                size="sm"
                onClick={() => setShowAlerts(a => !a)}
              >
                {showAlerts ? "Clear" : `⚠ ${alertCount} Security Alert${alertCount > 1 ? "s" : ""}`}
              </Button>
            )}
            <Button variant="secondary" size="sm">⬇ Export Log</Button>
          </div>
        }
      />

      {/* ── Security alerts banner ── */}
      {alerts.length > 0 && !showAlerts && (
        <div
          className="flex items-center gap-3 px-5 py-3.5 rounded-2xl border danger-bg cursor-pointer hover:opacity-90 transition-opacity"
          style={{ borderColor:"var(--danger-color)30" }}
          onClick={() => setShowAlerts(true)}
        >
          <span className="text-xl">⚠</span>
          <div className="flex-1">
            <p className="text-[13px] font-700 danger-text">
              {alerts.length} security event{alerts.length > 1 ? "s" : ""} detected
            </p>
            <p className="text-[11px] text-secondary">
              {alerts.map(a => a.action).join(" · ")}
            </p>
          </div>
          <Button variant="danger" size="sm">Review →</Button>
        </div>
      )}

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Actions"  value={totalActions}  delta="All time"  deltaType="up" />
        <StatCard label="Today"          value={todayCount}    delta="Active"    deltaType="up" />
        <StatCard label="Security Alerts" value={alertCount}   delta={alertCount > 0 ? "Review now" : "All clear"} deltaType={alertCount > 0 ? "down" : "up"} />
        <StatCard label="Active Users"   value={uniqueCount}                                    />
      </div>

      {/* ── Charts + User summary ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
        {/* Action type chart */}
        <Card className="p-5">
          <SectionLabel className="mb-4">Actions by Type</SectionLabel>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barCategoryGap="35%">
              <CartesianGrid vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
              <Bar dataKey="count" name="Count" radius={[4,4,0,0]}>
                {chartData.map((entry, i) => (
                  <Bar key={i} dataKey="count" fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Most active users */}
        <Card className="p-5">
          <SectionLabel className="mb-3">Most Active Today</SectionLabel>
          <div className="space-y-3">
            {userActivity.slice(0, 5).map((u, i) => (
              <div key={u.name} className="flex items-center gap-2">
                <span className="text-[11px] font-800 w-4 text-secondary">{i + 1}</span>
                <Avatar name={u.name} size={26} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-600 text-primary truncate">{u.name}</p>
                  <p className="text-[10px] text-secondary">{u.role.replace("_"," ")}</p>
                </div>
                <span className="text-[12px] font-700 text-primary flex-shrink-0">{u.actions}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 bg-surface border border-theme rounded-lg px-3 py-2 min-w-[240px]">
          <svg className="w-3.5 h-3.5 text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users, actions, targets..."
            className="bg-transparent text-[13px] text-primary placeholder:text-secondary outline-none w-full" />
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-1 flex-wrap">
          {(["all", ...actionTypes] as const).map(t => {
            const count = t === "all" ? totalActions : ACTIVITY_LOG.filter(e => e.type === t).length;
            return (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={cn("px-3 py-1.5 rounded-lg text-[12px] font-600 transition-all border",
                  typeFilter === t
                    ? "border-[var(--primary-color)] text-[var(--primary-color)] bg-[var(--hover-bg)]"
                    : "border-theme text-secondary hover-theme")}>
                {t === "all" ? "All" : ACTION_CFG[t].label}
                <span className="ml-1 opacity-60 text-[10px]">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Date filter */}
        <div className="flex items-center gap-1 bg-surface border border-theme rounded-xl p-1">
          {(["all", "today", "yesterday"] as const).map(d => (
            <button key={d} onClick={() => setDateFilter(d)}
              className={cn("px-3 py-1.5 rounded-lg text-[12px] font-600 transition-all capitalize",
                dateFilter === d ? "bg-[var(--primary-color)] text-white" : "text-secondary hover-theme")}>
              {d === "all" ? "All Time" : d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>

        {/* User filter */}
        <select
          value={userFilter}
          onChange={e => setUserFilter(e.target.value)}
          className="bg-surface border border-theme rounded-lg px-3 py-2 text-[13px] text-primary outline-none cursor-pointer"
        >
          <option value="All">All Users</option>
          {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      {/* ── Grouped timeline ── */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {groups.map(group => (
            <div key={group.date}>
              {/* Date group header */}
              <div className="flex items-center gap-3 mb-2 px-1">
                <p className="text-[11px] font-700 text-secondary uppercase tracking-wider">{group.date}</p>
                <div className="flex-1 h-px bg-[var(--border-color)]" />
                <p className="text-[11px] text-secondary">{group.items.length} action{group.items.length !== 1 ? "s" : ""}</p>
              </div>

              <Card>
                <Table>
                  <thead>
                    <tr>
                      <Th>User</Th><Th>Action</Th><Th>Target</Th>
                      <Th>Location · Device</Th><Th>Type</Th><Th>Time</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map(entry => {
                      const cfg = ACTION_CFG[entry.type];
                      return (
                        <Tr key={entry.id}
                          className={entry.isAlert ? "bg-[var(--danger-bg)]" : undefined}>
                          <Td>
                            <div className="flex items-center gap-2">
                              {entry.user !== "Unknown"
                                ? <Avatar name={entry.user} size={28} />
                                : <div className="w-7 h-7 rounded-full bg-surface border border-theme flex items-center justify-center text-secondary text-[11px]">?</div>
                              }
                              <div>
                                <p className="text-[12px] font-600 text-primary">{entry.user}</p>
                                {entry.role !== "—" && <RoleBadge role={entry.role} />}
                              </div>
                            </div>
                          </Td>
                          <Td>
                            <p className={cn("text-[13px] font-500",
                              entry.isAlert ? "danger-text font-700" : "text-primary")}>
                              {entry.action}
                            </p>
                          </Td>
                          <Td className="text-secondary">{entry.target}</Td>
                          <Td>
                            <p className="text-[11px] text-secondary">{entry.location}</p>
                            <p className="text-[11px] text-secondary">{entry.device} · {entry.ip}</p>
                          </Td>
                          <Td>
                            <span className={cn("text-[10px] font-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1", cfg.cls)}>
                              {cfg.icon} {cfg.label}
                            </span>
                          </Td>
                          <Td className="text-secondary text-[11px] whitespace-nowrap">{entry.time}</Td>
                        </Tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState icon="◈" title="No activity matching your filters" description="Try adjusting the search or filters above." />
        </Card>
      )}
    </div>
  );
};
