// ============================================================
// features/users/UsersPage.tsx
// User list, role assignments, invite flow + permissions matrix.
// ============================================================

import { useState } from "react";
import { cn } from "../../utils/cn";
import {
  PageHeader, Button, Card, SectionLabel, Avatar, Modal,
  Input, Select, RoleBadge, StatusDot, Table, Th, Td, Tr, EmptyState,
} from "../../components/ui";
import { MOCK_USERS } from "../../data/mockData";
import type { StaffUser } from "../../types/crm.types";

// ─── INVITE MODAL ────────────────────────────────────────
const InviteUserModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <Modal open={open} onClose={onClose} title="Invite New User">
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="First Name" placeholder="Priya" />
        <Input label="Last Name" placeholder="Sharma" />
      </div>
      <Input label="Email Address *" placeholder="priya@dojo.com" type="email" />
      <Input label="Phone" placeholder="+91 98765 43210" />
      <Select label="Role *">
        {["ADMIN","RM","FM","TRAINING_MANAGER","HR"].map(r => <option key={r}>{r}</option>)}
      </Select>
      <Select label="Center">
        <option value="">All Centers</option>
        {["Koramangala","Indiranagar","Whitefield"].map(c => <option key={c}>{c}</option>)}
      </Select>
      <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-3">
        <p className="text-[12px] text-indigo-400 font-medium">📧 Invite email will be sent to the address above.</p>
      </div>
    </div>
    <div className="flex justify-end gap-2 mt-6">
      <Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button variant="primary" onClick={onClose}>Send Invite</Button>
    </div>
  </Modal>
);

// ─── USER DETAIL SLIDE-OVER ──────────────────────────────
const UserDetail = ({ user, onClose }: { user: StaffUser | null; onClose: () => void }) => {
  if (!user) return null;
  return (
    <div
      className="fixed inset-0 z-40 flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#080e1a] border-l border-theme h-full overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-theme flex items-center justify-between">
          <p className="text-[14px] font-bold text-primary">User Details</p>
          <button onClick={onClose} className="text-slate-500 hover:text-primary transition-colors">✕</button>
        </div>
        <div className="p-5 space-y-5">
          {/* Profile */}
          <div className="flex flex-col items-center gap-3 py-4">
            <Avatar name={user.name} size={56} />
            <div className="text-center">
                <p className="text-[16px] font-bold text-primary">{user.name}</p>
              <p className="text-[13px] text-slate-500">{user.email}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <RoleBadge role={user.role} />
                <StatusDot status={user.status} />
              </div>
            </div>
          </div>

          {/* Details */}
          <Card className="p-4 space-y-3">
            {[
              { label:"Phone",      value:user.phone },
              { label:"Center",     value:user.center },
              { label:"Joined",     value:user.joinedAt },
              { label:"Last Login", value:user.lastLogin },
            ].map(item => (
              <div key={item.label} className="flex justify-between">
                <span className="text-[12px] text-slate-500">{item.label}</span>
                <span className="text-[12px] text-primary font-medium">{item.value}</span>
              </div>
            ))}
          </Card>

          {/* Permissions */}
          <div>
            <SectionLabel>Permissions</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {user.permissions.map(p => (
                <span
                  key={p}
                  className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-md bg-indigo-500/8 text-indigo-400 border border-indigo-500/20"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <Button variant="secondary" className="w-full">Edit User</Button>
            <Button variant={user.status === "active" ? "danger" : "secondary"} className="w-full">
              {user.status === "active" ? "Deactivate User" : "Activate User"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN USERS LIST ────────────────────────────────────
export const UsersListPage = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showInvite, setShowInvite] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null);

  const filtered = MOCK_USERS.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roles = Array.from(new Set(MOCK_USERS.map(u => u.role)));

  return (
    <div className="p-6 max-w-[1400px]">
      <PageHeader
        title="All Users"
        subtitle={`${MOCK_USERS.filter(u => u.status === "active").length} active, ${MOCK_USERS.length} total`}
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowInvite(true)}>
            + Invite User
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label:"Total Users",  value:MOCK_USERS.length, color:"#818cf8" },
          { label:"Active",       value:MOCK_USERS.filter(u => u.status==="active").length,   color:"#34d399" },
          { label:"Inactive",     value:MOCK_USERS.filter(u => u.status==="inactive").length, color:"#f87171" },
          { label:"Roles",        value:roles.length, color:"#fbbf24" },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <p className="text-[11px] text-secondary uppercase tracking-wide mb-1">{s.label}</p>
            <p className="text-[26px] font-bold" style={{ color: s.color }}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-card border border-theme rounded-lg px-3 py-2 flex-1 min-w-[200px] max-w-xs">
            <svg className="w-3.5 h-3.5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="bg-transparent text-[13px] text-primary placeholder:text-slate-600 outline-none w-full"
            />
          </div>
          <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="All">All Roles</option>
            {roles.map(r => <option key={r}>{r}</option>)}
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <thead>
            <tr>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Center</Th>
              <Th>Status</Th>
              <Th>Last Login</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map(user => (
              <Tr key={user.id} onClick={() => setSelectedUser(user)}>
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} size={32} />
                    <div>
                      <p className="text-[13px] font-semibold text-primary">{user.name}</p>
                      <p className="text-[11px] text-secondary">{user.email}</p>
                    </div>
                  </div>
                </Td>
                <Td><RoleBadge role={user.role} /></Td>
                <Td className="text-secondary text-[12px]">{user.center}</Td>
                <Td><StatusDot status={user.status} /></Td>
                <Td className="text-secondary text-[12px]">{user.lastLogin}</Td>
                <Td>
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <Button size="sm" variant="secondary" onClick={() => setSelectedUser(user)}>
                      View
                    </Button>
                    <Button size="sm" variant="ghost">Edit</Button>
                  </div>
                </Td>
              </Tr>
            )) : (
              <tr><td colSpan={6}><EmptyState icon="◎" title="No users found" /></td></tr>
            )}
          </tbody>
        </Table>
      </Card>

      <InviteUserModal open={showInvite} onClose={() => setShowInvite(false)} />
      <UserDetail user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
};

// ============================================================
// features/users/RolesPage.tsx
// Roles & Permissions matrix.
// ============================================================

const ALL_PERMISSIONS = [
  { id:"CALL_LEAD",         label:"Call Lead",          category:"Leads" },
  { id:"UPDATE_TRIAL",      label:"Update Trial",       category:"Schedule" },
  { id:"CREATE_MEMBERSHIP", label:"Create Membership",  category:"Finance" },
  { id:"HANDLE_RENEWAL",    label:"Handle Renewal",     category:"Finance" },
  { id:"VIEW_REPORTS",      label:"View Reports",       category:"Reports" },
  { id:"MANAGE_USERS",      label:"Manage Users",       category:"Admin" },
  { id:"VIEW_SETTINGS",     label:"View Settings",      category:"Admin" },
  { id:"MANAGE_SETTINGS",   label:"Manage Settings",    category:"Admin" },
];

const DEFAULT_ROLE_PERMS: Record<string, string[]> = {
  SUPER_ADMIN:      ALL_PERMISSIONS.map(p => p.id),
  ADMIN:            ["CALL_LEAD","UPDATE_TRIAL","CREATE_MEMBERSHIP","HANDLE_RENEWAL","VIEW_REPORTS","VIEW_SETTINGS"],
  RM:               ["CALL_LEAD","UPDATE_TRIAL"],
  FM:               ["CREATE_MEMBERSHIP","HANDLE_RENEWAL","VIEW_REPORTS"],
  TRAINING_MANAGER: ["UPDATE_TRIAL","VIEW_REPORTS"],
  HR:               ["VIEW_REPORTS"],
};

const ROLES_LIST = Object.keys(DEFAULT_ROLE_PERMS);

export const RolesPage = () => {
  const [perms, setPerms] = useState(DEFAULT_ROLE_PERMS);

  const toggle = (role: string, perm: string) => {
    if (role === "SUPER_ADMIN") return; // locked
    setPerms(prev => ({
      ...prev,
      [role]: prev[role].includes(perm)
        ? prev[role].filter(p => p !== perm)
        : [...prev[role], perm],
    }));
  };

  const categories = Array.from(new Set(ALL_PERMISSIONS.map(p => p.category)));

  return (
    <div className="p-6 max-w-[1400px]">
      <PageHeader
        title="Roles & Permissions"
        subtitle="Define what each role can access across the CRM"
        actions={<Button variant="primary" size="sm">Save Changes</Button>}
      />

      <Card className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-card sticky left-0 min-w-[200px]">
                Permission
              </th>
              {ROLES_LIST.map(role => (
                <th key={role} className="px-4 py-3 text-center bg-card min-w-[120px]">
                  <RoleBadge role={role} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <>
                <tr key={`cat-${cat}`}>
                  <td
                    colSpan={ROLES_LIST.length + 1}
                    className="px-5 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-[#080e1a] border-b border-theme"
                  >
                    {cat}
                  </td>
                </tr>
                {ALL_PERMISSIONS.filter(p => p.category === cat).map(perm => (
                  <tr key={perm.id} className="border-b border-theme hover:bg-white/[0.01] transition-colors">
                    <td className="px-5 py-3 sticky left-0 bg-card">
                      <p className="text-[13px] font-medium text-primary">{perm.label}</p>
                      <p className="text-[10px] font-mono text-secondary mt-0.5">{perm.id}</p>
                    </td>
                    {ROLES_LIST.map(role => {
                      const has = perms[role]?.includes(perm.id);
                      const locked = role === "SUPER_ADMIN";
                      return (
                        <td key={role} className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggle(role, perm.id)}
                            disabled={locked}
                            className={cn(
                              "w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition-all",
                              locked && "cursor-not-allowed opacity-60",
                              has
                                ? "bg-indigo-500 border-indigo-500 text-primary"
                                : "border-slate-700 hover:border-indigo-400",
                            )}
                          >
                            {has && <span className="text-[10px] font-bold">✓</span>}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
