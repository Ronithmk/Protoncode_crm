// features/users/InviteUserPage.tsx  →  /users/invite

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { cn } from "../../utils/cn";
import {
  Card, PageHeader, Button, Input, Select,
  Avatar, RoleBadge, Table, Th, Td, Tr,
  SectionLabel, StatCard,
} from "../../components/ui";
import { MOCK_USERS } from "../../data/mockData";
import { useRole } from "../../store/useAuthStore";
import type { Role } from "../../config/navigationConfig";

// ─── ROLE META ────────────────────────────────────────────

const ROLES_META: {
  role: Role; label: string; desc: string; color: string;
  permissions: string[];
}[] = [
  {
    role: "SUPER_ADMIN", label: "Super Admin", color: "#818cf8",
    desc: "Full system access — all modules, all centres",
    permissions: ["All Leads", "All Reports", "Users & Roles", "Settings", "Billing", "All Centres"],
  },
  {
    role: "ADMIN", label: "Admin / Team Lead", color: "#a78bfa",
    desc: "Centre admin — leads, schedule, renewals, settings",
    permissions: ["All Leads", "Schedule", "Renewals", "Reports", "Settings (limited)"],
  },
  {
    role: "CENTER_MANAGER", label: "Center Manager", color: "#22d3ee",
    desc: "Full centre ops — staff, leads, renewals, reports",
    permissions: ["Centre Leads", "Schedule", "Renewals", "Revenue", "Centre Staff"],
  },
  {
    role: "SALES_MANAGER", label: "Sales Manager", color: "#f97316",
    desc: "Pipeline & performance across all RMs",
    permissions: ["All Leads", "Pipeline", "Sales Reports", "Source Analytics"],
  },
  {
    role: "RM", label: "Relationship Manager", color: "#22c55e",
    desc: "Leads, calls, trials — personal scope",
    permissions: ["My Leads", "Schedule", "My Tasks", "Notifications"],
  },
  {
    role: "FM", label: "Finance Manager", color: "#f59e0b",
    desc: "Renewals, memberships, revenue",
    permissions: ["Renewals", "Revenue Summary", "Reports (Finance)"],
  },
  {
    role: "TRAINING_MANAGER", label: "Training Manager", color: "#f472b6",
    desc: "Schedule, trials, batch management",
    permissions: ["Schedule", "Trials", "Batch Schedule", "Reports (Trials)"],
  },
  {
    role: "HR", label: "HR", color: "#94a3b8",
    desc: "Read-only staff & org dashboard",
    permissions: ["HR Dashboard", "Staff List", "Activity Log (view)"],
  },
];

// ─── PENDING INVITATIONS ──────────────────────────────────

type PendingInvite = {
  id: string; email: string; role: Role; centre: string;
  sentAt: string; expiresIn: string; expired: boolean;
};

const PENDING: PendingInvite[] = [
  { id:"PI001", email:"coach.kumar@dojo.com",  role:"TRAINING_MANAGER", centre:"Whitefield",   sentAt:"2 days ago",  expiresIn:"5 days",  expired:false },
  { id:"PI002", email:"neha.fm@dojo.com",       role:"FM",               centre:"Indiranagar",  sentAt:"5 days ago",  expiresIn:"2 days",  expired:false },
  { id:"PI003", email:"sunita.rm@dojo.com",     role:"RM",               centre:"Koramangala",  sentAt:"8 days ago",  expiresIn:"Expired", expired:true  },
];

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

export const InviteUserPage = () => {
  const navigate    = useNavigate();
  const role        = useRole();
  const isCenterMgr = role === "CENTER_MANAGER";

  const availableRoles = isCenterMgr
    ? ROLES_META.filter(r => ["RM", "TRAINING_MANAGER", "FM"].includes(r.role))
    : ROLES_META;

  const [form, setForm] = useState({
    name: "", email: "", role: "" as Role | "",
    centre: isCenterMgr ? "Koramangala" : "",
    phone: "",
  });
  const [sent, setSent]             = useState(false);
  const [pendingList, setPending]   = useState<PendingInvite[]>(PENDING);
  const [selectedRole, setSelectedRole] = useState<typeof ROLES_META[0] | null>(null);
  const [showBulk, setShowBulk]     = useState(false);
  const [bulkEmails, setBulkEmails] = useState("");

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const canSubmit = form.name && form.email && form.role && form.centre;

  const handleSend = () => {
    if (!canSubmit) return;
    setSent(true);
  };

  const resend = (id: string) => setPending(p =>
    p.map(i => i.id === id ? { ...i, expiresIn:"7 days", expired:false } : i)
  );
  const revoke = (id: string) => setPending(p => p.filter(i => i.id !== id));

  // Team composition chart
  const roleChartData = ROLES_META.map(r => ({
    name:  r.label.split(" ")[0],
    count: MOCK_USERS.filter(u => u.role === r.role).length,
    fill:  r.color,
  })).filter(d => d.count > 0);

  // Team stats
  const activeCount   = MOCK_USERS.filter(u => u.status === "active").length;
  const pendingCount  = pendingList.filter(p => !p.expired).length;
  const expiredCount  = pendingList.filter(p =>  p.expired).length;
  const centres       = [...new Set(MOCK_USERS.map(u => u.center).filter(c => c !== "All"))];

  if (sent) {
    return (
      <div className="p-6 max-w-[1000px]">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-5"
            style={{ background:"var(--success-bg)", color:"var(--success-color)" }}>
            ✓
          </div>
          <h2 className="text-[22px] font-800 text-primary mb-2">Invitation Sent!</h2>
          <p className="text-[14px] text-secondary mb-1">
            An email was sent to <span className="text-primary font-700">{form.email}</span>
          </p>
          <p className="text-[13px] text-secondary mb-8">
            They'll receive a one-time setup link valid for 7 days.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => {
              setSent(false);
              setForm({ name:"", email:"", role:"", centre: isCenterMgr ? "Koramangala" : "", phone:"" });
            }}>
              Invite Another
            </Button>
            <Button variant="primary" onClick={() => navigate("/users")}>
              View All Users →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] space-y-5">
      <PageHeader
        title="Invite User"
        subtitle="Send a one-time setup link to a new team member"
        actions={
          <Button variant="secondary" size="sm" onClick={() => setShowBulk(b => !b)}>
            {showBulk ? "Single Invite" : "Bulk Invite"}
          </Button>
        }
      />

      {/* ── Team stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Staff"     value={activeCount}  delta="All centres" deltaType="up" />
        <StatCard label="Pending Invites"  value={pendingCount}                                    />
        <StatCard label="Expired Invites"  value={expiredCount} delta="Resend needed" deltaType="down" />
        <StatCard label="Centres"          value={centres.length}                                  />
      </div>

      {/* ── Team composition chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
        <Card className="p-5">
          <SectionLabel className="mb-4">Current Team by Role</SectionLabel>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={roleChartData} barCategoryGap="35%">
              <CartesianGrid vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"var(--text-secondary)", fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
              <Bar dataKey="count" name="Staff" radius={[4,4,0,0]}>
                {roleChartData.map((entry, i) => (
                  <Bar key={i} dataKey="count" fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Role permission preview */}
        <Card className="p-5">
          <SectionLabel className="mb-3">Role Permissions</SectionLabel>
          {selectedRole ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background:`${selectedRole.color}20`, color:selectedRole.color }}>
                  ◈
                </div>
                <div>
                  <p className="text-[13px] font-700 text-primary">{selectedRole.label}</p>
                  <p className="text-[10px] text-secondary">{selectedRole.desc}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {selectedRole.permissions.map(perm => (
                  <div key={perm} className="flex items-center gap-2">
                    <span className="text-[10px] success-text">✓</span>
                    <span className="text-[12px] text-secondary">{perm}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setSelectedRole(null)}
                className="text-[11px] text-secondary hover:text-primary transition-colors mt-3">
                ← Back to all roles
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {availableRoles.map(r => (
                <button key={r.role} onClick={() => setSelectedRole(r)}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover-theme transition-colors text-left">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
                  <span className="text-[12px] text-secondary flex-1">{r.label}</span>
                  <span className="text-[10px] text-secondary opacity-60">→</span>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Invite form ── */}
      {!showBulk ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <Card className="lg:col-span-3 p-6 space-y-4">
            <p className="text-[14px] font-700 text-primary">New Invitation</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Full Name *" placeholder="Arjun Mehta"
                value={form.name} onChange={e => set("name", e.target.value)} />
              <Input label="Phone" placeholder="+91 98765 43210"
                value={form.phone} onChange={e => set("phone", e.target.value)} />
            </div>
            <Input label="Email Address *" type="email" placeholder="arjun@dojo.com"
              value={form.email} onChange={e => set("email", e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Role *" value={form.role} onChange={e => {
                set("role", e.target.value);
                setSelectedRole(availableRoles.find(r => r.role === e.target.value) ?? null);
              }}>
                <option value="">Select a role...</option>
                {availableRoles.map(r => (
                  <option key={r.role} value={r.role}>{r.label}</option>
                ))}
              </Select>
              <Select label="Assigned Centre *" value={form.centre}
                onChange={e => set("centre", e.target.value)} disabled={isCenterMgr}>
                <option value="">Select centre...</option>
                {["Koramangala", "Indiranagar", "Whitefield", "All"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost"
                onClick={() => setForm({ name:"", email:"", role:"", centre: isCenterMgr ? "Koramangala" : "", phone:"" })}>
                Clear
              </Button>
              <Button variant="primary" disabled={!canSubmit} onClick={handleSend}>
                Send Invitation →
              </Button>
            </div>
          </Card>

          {/* Role selector cards */}
          <div className="lg:col-span-2 space-y-2">
            <p className="text-[11px] font-700 text-secondary uppercase tracking-wider mb-2">
              Click to select role
            </p>
            {availableRoles.map(r => (
              <button key={r.role} onClick={() => { set("role", r.role); setSelectedRole(r); }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                  form.role === r.role
                    ? "border-[var(--primary-color)] bg-[var(--hover-bg)]"
                    : "border-theme bg-card hover-theme"
                )}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background:`${r.color}20`, color:r.color }}>
                  ◈
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-700 text-primary">{r.label}</p>
                  <p className="text-[11px] text-secondary truncate">{r.desc}</p>
                </div>
                {form.role === r.role && (
                  <span style={{ color:"var(--primary-color)" }} className="font-700">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ── Bulk invite ── */
        <Card className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[14px] font-700 text-primary">Bulk Invite</p>
              <p className="text-[12px] text-secondary mt-0.5">
                Paste multiple email addresses, one per line
              </p>
            </div>
          </div>
          <textarea
            value={bulkEmails}
            onChange={e => setBulkEmails(e.target.value)}
            placeholder={"arjun@dojo.com\nmeena@dojo.com\nkiran@dojo.com"}
            rows={6}
            className="w-full bg-surface border border-theme rounded-xl px-4 py-3 text-[13px] text-primary placeholder:text-secondary outline-none resize-none focus:border-[var(--primary-color)] transition-colors font-mono"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Assign Role *">
              <option value="">Select a role...</option>
              {availableRoles.map(r => <option key={r.role} value={r.role}>{r.label}</option>)}
            </Select>
            <Select label="Assign Centre *" disabled={isCenterMgr}>
              <option value="">Select centre...</option>
              {["Koramangala", "Indiranagar", "Whitefield", "All"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div className="flex items-center justify-between pt-2">
            <p className="text-[12px] text-secondary">
              {bulkEmails.split("\n").filter(e => e.trim()).length} email{bulkEmails.split("\n").filter(e => e.trim()).length !== 1 ? "s" : ""} detected
            </p>
            <Button variant="primary"
              disabled={!bulkEmails.trim()}>
              Send {bulkEmails.split("\n").filter(e => e.trim()).length} Invitations →
            </Button>
          </div>
        </Card>
      )}

      {/* ── Pending invitations ── */}
      <Card>
        <div className="px-5 py-4 card-header flex items-center justify-between">
          <div>
            <p className="text-[14px] font-700 text-primary">Pending Invitations</p>
            <p className="text-[12px] text-secondary mt-0.5">
              {pendingList.filter(p => !p.expired).length} active · {pendingList.filter(p => p.expired).length} expired
            </p>
          </div>
        </div>
        {pendingList.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th>Email</Th><Th>Role</Th><Th>Centre</Th>
                <Th>Sent</Th><Th>Expires</Th><Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {pendingList.map(inv => (
                <Tr key={inv.id}>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-surface border border-theme flex items-center justify-center text-secondary text-sm flex-shrink-0">
                        ✉
                      </div>
                      <span className="text-[13px] font-600 text-primary">{inv.email}</span>
                    </div>
                  </Td>
                  <Td><RoleBadge role={inv.role} /></Td>
                  <Td className="text-secondary">{inv.centre}</Td>
                  <Td className="text-secondary">{inv.sentAt}</Td>
                  <Td>
                    <span className={cn("text-[11px] font-600",
                      inv.expired ? "danger-text" : "warning-text")}>
                      {inv.expiresIn}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => resend(inv.id)}>
                        Resend
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => revoke(inv.id)}>
                        Revoke
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="px-5 py-10 text-center">
            <p className="text-[13px] text-secondary">No pending invitations.</p>
          </div>
        )}
      </Card>

      {/* ── Current team quick-view ── */}
      <Card>
        <div className="px-5 py-4 card-header flex items-center justify-between">
          <p className="text-[14px] font-700 text-primary">Current Team</p>
          <Button variant="secondary" size="sm" onClick={() => navigate("/users")}>
            Full Directory →
          </Button>
        </div>
        <div className="divide-theme">
          {MOCK_USERS.map(u => (
            <div key={u.id} className="flex items-center gap-3 px-5 py-3.5 hover-theme transition-colors">
              <Avatar name={u.name} size={34} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-600 text-primary">{u.name}</p>
                <p className="text-[11px] text-secondary">{u.email} · {u.center}</p>
              </div>
              <RoleBadge role={u.role} />
              <span className={cn("text-[10px] font-700 px-2 py-0.5 rounded-full",
                u.status === "active" ? "success-text success-bg" : "text-secondary bg-surface border border-theme")}>
                {u.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
