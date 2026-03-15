// features/dashboard/NotificationsPage.tsx  →  /dashboard/notifications

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { cn } from "../../../utils/cn";
import {
  Card, PageHeader, Button, EmptyState, SectionLabel,
} from "../../../components/ui";
import { useRole } from "../../../store/useAuthStore";

// ─── TYPES ────────────────────────────────────────────────

type NotifType = "lead" | "task" | "renewal" | "system" | "trial";

type Notif = {
  id: string; type: NotifType; title: string; body: string;
  time: string; timeGroup: "today" | "yesterday" | "earlier";
  read: boolean; link?: string; roles: string[];
};

// ─── CONSTANTS ────────────────────────────────────────────

const NOTIF_ICON: Record<NotifType, string> = {
  lead:"◈", task:"✓", renewal:"↺", system:"⚙", trial:"🥋",
};
const NOTIF_COLOR: Record<NotifType, string> = {
  lead:    "var(--primary-color)",
  task:    "var(--success-color)",
  renewal: "var(--warning-color)",
  system:  "var(--text-secondary)",
  trial:   "#f472b6",
};
const TYPE_LABEL: Record<NotifType, string> = {
  lead:"Leads", task:"Tasks", renewal:"Renewals", system:"System", trial:"Trials",
};

// ─── ALL NOTIFICATIONS ────────────────────────────────────

const ALL_NOTIFS: Notif[] = [
  { id:"N001", type:"lead",    title:"New lead assigned",         body:"Arjun Mehta was assigned to you from Meta Ads.",           time:"2 min ago",  timeGroup:"today",     read:false, link:"/leads/L001",        roles:["RM","SALES_MANAGER","CENTER_MANAGER","ADMIN","SUPER_ADMIN"] },
  { id:"N002", type:"task",    title:"Task due today",            body:"Follow up after trial — Arjun Mehta · High priority.",     time:"15 min ago", timeGroup:"today",     read:false, link:"/leads/L001",        roles:["RM","ADMIN","SUPER_ADMIN","CENTER_MANAGER","SALES_MANAGER"] },
  { id:"N003", type:"renewal", title:"Renewal overdue",           body:"Rohit Verma's membership expired 3 days ago.",             time:"1 hr ago",   timeGroup:"today",     read:false, link:"/leads/L005",        roles:["FM","CENTER_MANAGER","ADMIN","SUPER_ADMIN"] },
  { id:"N004", type:"trial",   title:"Trial confirmed",           body:"Arjun Mehta confirmed for BJJ Basics at 6:00 PM today.",   time:"2 hrs ago",  timeGroup:"today",     read:false, link:"/leads/L001",        roles:["TRAINING_MANAGER","CENTER_MANAGER","ADMIN","SUPER_ADMIN"] },
  { id:"N005", type:"system",  title:"WhatsApp connected",        body:"Meta WhatsApp Business API integration is now active.",    time:"3 hrs ago",  timeGroup:"today",     read:true,  link:"/settings/whatsapp", roles:["SUPER_ADMIN","ADMIN"] },
  { id:"N006", type:"lead",    title:"Hot lead flagged",          body:"Kabir Khan was tagged as Hot by Priya R.",                  time:"5 hrs ago",  timeGroup:"today",     read:true,  link:"/leads/L007",        roles:["SALES_MANAGER","CENTER_MANAGER","ADMIN","SUPER_ADMIN"] },
  { id:"N007", type:"trial",   title:"Trial no-show",             body:"Meera Nair did not show up for yesterday's scheduled trial.", time:"Yesterday", timeGroup:"yesterday", read:true, link:"/leads/L006",        roles:["TRAINING_MANAGER","CENTER_MANAGER","ADMIN","SUPER_ADMIN"] },
  { id:"N008", type:"renewal", title:"5 renewals due this week",  body:"Check your renewals dashboard — 5 members need action.",   time:"Yesterday",  timeGroup:"yesterday", read:true,  link:"/renewals",          roles:["FM","CENTER_MANAGER","ADMIN","SUPER_ADMIN"] },
  { id:"N009", type:"task",    title:"3 tasks overdue",           body:"You have tasks past their due date. Review now.",          time:"2 days ago", timeGroup:"earlier",   read:true,                             roles:["RM","FM","TRAINING_MANAGER","CENTER_MANAGER","ADMIN","SUPER_ADMIN","SALES_MANAGER","HR"] },
  { id:"N010", type:"system",  title:"Staff login alert",         body:"New login detected from Priya R on an unrecognised device.", time:"2 days ago",timeGroup:"earlier",  read:true,  link:"/users/activity",    roles:["SUPER_ADMIN","ADMIN","HR"] },
  { id:"N011", type:"lead",    title:"Lead stage updated",        body:"Dev Sharma moved to 'Membership Active' by Priya R.",      time:"3 days ago", timeGroup:"earlier",   read:true,  link:"/leads/L003",        roles:["ADMIN","SUPER_ADMIN","CENTER_MANAGER","SALES_MANAGER"] },
  { id:"N012", type:"system",  title:"Monthly report ready",      body:"February analytics report is ready to download.",         time:"3 days ago", timeGroup:"earlier",   read:true,  link:"/reports",           roles:["SUPER_ADMIN","ADMIN","CENTER_MANAGER","FM"] },
];

// ─── CHART TOOLTIP ────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-theme rounded-xl px-3 py-2 text-[12px] shadow-xl">
      {label && <p className="text-secondary mb-1 font-600">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.fill }} className="font-700">{p.dataKey}: {p.value}</p>
      ))}
    </div>
  );
};

// ─── NOTIFICATION ROW ─────────────────────────────────────

const NotifRow = ({
  notif, onRead, onDelete,
}: {
  notif: Notif;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    onRead(notif.id);
    if (notif.link) navigate(notif.link);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group flex items-start gap-4 px-5 py-4 cursor-pointer hover-theme transition-colors relative",
        !notif.read && "bg-[var(--hover-bg)]"
      )}
    >
      {/* Unread dot */}
      {!notif.read && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
          style={{ background:"var(--primary-color)" }} />
      )}

      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
        style={{ background:`${NOTIF_COLOR[notif.type]}18`, color:NOTIF_COLOR[notif.type] }}
      >
        {NOTIF_ICON[notif.type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className={cn("text-[13px] text-primary", !notif.read ? "font-700" : "font-500")}>
            {notif.title}
          </p>
          <span className="text-[10px] font-600 px-1.5 py-0.5 rounded-md"
            style={{ color: NOTIF_COLOR[notif.type], background:`${NOTIF_COLOR[notif.type]}15` }}>
            {TYPE_LABEL[notif.type]}
          </span>
        </div>
        <p className="text-[12px] text-secondary leading-relaxed">{notif.body}</p>
      </div>

      {/* Time + actions */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className="text-[11px] text-secondary">{notif.time}</span>
        <button
          onClick={e => { e.stopPropagation(); onDelete(notif.id); }}
          className="text-[10px] text-secondary hover:danger-text opacity-0 group-hover:opacity-100 transition-all"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────

export const NotificationsPage = () => {
  const currentRole = useRole();

  const [notifs, setNotifs]         = useState<Notif[]>(ALL_NOTIFS.filter(n => n.roles.includes(currentRole)));
  const [typeFilter, setTypeFilter] = useState<NotifType | "all">("all");
  const [showSettings, setShowSettings] = useState(false);

  const markRead    = (id: string) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifs(p => p.map(n => ({ ...n, read: true })));
  const deleteNotif = (id: string) => setNotifs(p => p.filter(n => n.id !== id));
  const clearAll    = () => setNotifs([]);

  const filtered = typeFilter === "all" ? notifs : notifs.filter(n => n.type === typeFilter);
  const unread   = notifs.filter(n => !n.read).length;

  // Group filtered by time
  const groups: { label: string; key: Notif["timeGroup"]; items: Notif[] }[] = [
    { label:"Today",     key:"today" as const,     items: filtered.filter(n => n.timeGroup === "today")     },
    { label:"Yesterday", key:"yesterday" as const, items: filtered.filter(n => n.timeGroup === "yesterday") },
    { label:"Earlier",   key:"earlier" as const,   items: filtered.filter(n => n.timeGroup === "earlier")   },
  ].filter(g => g.items.length > 0);

  // Type breakdown chart
  const chartData = (["lead","task","renewal","trial","system"] as NotifType[]).map(type => ({
    name:   TYPE_LABEL[type],
    count:  notifs.filter(n => n.type === type).length,
    unread: notifs.filter(n => n.type === type && !n.read).length,
    color:  NOTIF_COLOR[type],
  }));

  return (
    <div className="p-6 max-w-[1100px] space-y-5">
      <PageHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread` : "You're all caught up"}
        actions={
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllRead}>Mark all read</Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => setShowSettings(s => !s)}>
              ⚙ Preferences
            </Button>
            {notifs.length > 0 && (
              <Button variant="danger" size="sm" onClick={clearAll}>Clear all</Button>
            )}
          </div>
        }
      />

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:"Total",    value: notifs.length,                                     color:"var(--primary-color)"  },
          { label:"Unread",   value: unread,                                             color:"var(--danger-color)"   },
          { label:"Today",    value: notifs.filter(n => n.timeGroup === "today").length, color:"var(--warning-color)"  },
          { label:"Actioned", value: notifs.filter(n => n.read).length,                 color:"var(--success-color)"  },
        ].map(s => (
          <div key={s.label} className="bg-card border border-theme rounded-2xl px-5 py-4">
            <p className="text-[26px] font-800" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] text-secondary mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Breakdown chart + preferences ── */}
      <div className={cn("grid gap-5", showSettings ? "grid-cols-1 lg:grid-cols-[1fr_280px]" : "grid-cols-1")}>
        <Card className="p-5">
          <SectionLabel className="mb-4">Activity by Type</SectionLabel>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barGap={3} barCategoryGap="35%">
              <XAxis dataKey="name" tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
              <Bar dataKey="count" name="Total" radius={[4,4,0,0]}>
                {chartData.map((entry, i) => (
                  <Bar key={i} dataKey="count" fill={entry.color} />
                ))}
              </Bar>
              <Bar dataKey="unread" name="Unread" fill="var(--danger-color)" radius={[4,4,0,0]} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Preferences panel */}
        {showSettings && (
          <Card className="p-5">
            <SectionLabel className="mb-4">Preferences</SectionLabel>
            <div className="space-y-4">
              {(["lead","task","renewal","trial","system"] as NotifType[]).map(type => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span style={{ color: NOTIF_COLOR[type] }}>{NOTIF_ICON[type]}</span>
                    <span className="text-[13px] text-primary">{TYPE_LABEL[type]}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className={cn(
                      "w-9 h-5 rounded-full peer transition-colors",
                      "bg-surface border border-theme",
                      "peer-checked:bg-[var(--primary-color)] peer-checked:border-[var(--primary-color)]",
                      "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
                      "after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all",
                      "peer-checked:after:translate-x-4"
                    )} />
                  </label>
                </div>
              ))}
              <div className="pt-3 border-t border-theme">
                <p className="text-[11px] text-secondary">Email digest</p>
                <select className="mt-1.5 w-full bg-surface border border-theme rounded-lg px-3 py-2 text-[12px] text-primary outline-none">
                  <option>Real-time</option>
                  <option>Daily summary</option>
                  <option>Weekly digest</option>
                  <option>Off</option>
                </select>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* ── Type filter pills ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "lead", "task", "renewal", "trial", "system"] as const).map(t => {
          const count = t === "all" ? notifs.length : notifs.filter(n => n.type === t).length;
          const unreadCount = t === "all" ? unread : notifs.filter(n => n.type === t && !n.read).length;
          return (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-600 transition-all border",
                typeFilter === t
                  ? "border-[var(--primary-color)] text-[var(--primary-color)] bg-[var(--hover-bg)]"
                  : "border-theme text-secondary hover-theme"
              )}>
              {t !== "all" && <span style={{ color: NOTIF_COLOR[t] }}>{NOTIF_ICON[t]}</span>}
              {t === "all" ? "All" : TYPE_LABEL[t]}
              <span className="opacity-60">{count}</span>
              {unreadCount > 0 && (
                <span className="text-[9px] font-800 px-1.5 py-0.5 rounded-full danger-text danger-bg">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Grouped notification list ── */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {groups.map(group => (
            <div key={group.key}>
              {/* Group label */}
              <div className="flex items-center gap-3 mb-2 px-1">
                <p className="text-[11px] font-700 text-secondary uppercase tracking-wider">{group.label}</p>
                <div className="flex-1 h-px bg-[var(--border-color)]" />
                {group.items.filter(n => !n.read).length > 0 && (
                  <button
                    onClick={() => setNotifs(p => p.map(n =>
                      group.items.some(gi => gi.id === n.id) ? { ...n, read: true } : n
                    ))}
                    className="text-[10px] font-600 text-[var(--primary-color)] hover:underline"
                  >
                    Mark group read
                  </button>
                )}
              </div>

              <Card>
                <div className="divide-theme">
                  {group.items.map(n => (
                    <NotifRow key={n.id} notif={n} onRead={markRead} onDelete={deleteNotif} />
                  ))}
                </div>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState icon="🔔" title="You're all caught up" description="No notifications in this category." />
        </Card>
      )}
    </div>
  );
};
