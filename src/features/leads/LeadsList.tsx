// ============================================================
// features/leads/LeadsList.tsx
// Full leads table with search, multi-filter, sort, pagination.
// ============================================================

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import {
  PageHeader, Button, Input, Select, StageBadge, SourceBadge,
  Avatar, Table, Th, Td, Tr, Card, EmptyState, Modal,
} from "../../components/ui";
import { MOCK_LEADS } from "../../data/mockData";
import { useRole } from "../../store/useAuthStore";
import type { Lead, LifecycleStage } from "../../types/crm.types";

const LIFECYCLE_STAGES: LifecycleStage[] = [
  "Lead Created","Call Handling","Followup","Trial Booked",
  "Trial Done","Joined","Membership Active","Renewal",
];

// ─── ADD LEAD MODAL ──────────────────────────────────────
const AddLeadModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [form, setForm] = useState({ name: "", phone: "", email: "", source: "Meta Ads", stage: "Lead Created", assignedTo: "", center: "" });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Modal open={open} onClose={onClose} title="Add New Lead" width="max-w-xl">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Full Name *" placeholder="Arjun Mehta" value={form.name} onChange={e => set("name", e.target.value)} className="col-span-2" />
        <Input label="Phone *" placeholder="+91 98765 43210" value={form.phone} onChange={e => set("phone", e.target.value)} />
        <Input label="Email" placeholder="arjun@email.com" value={form.email} onChange={e => set("email", e.target.value)} />
        <Select label="Lead Source *" value={form.source} onChange={e => set("source", e.target.value)}>
          {["Meta Ads","WhatsApp","Walk-in"].map(s => <option key={s}>{s}</option>)}
        </Select>
        <Select label="Initial Stage" value={form.stage} onChange={e => set("stage", e.target.value)}>
          {LIFECYCLE_STAGES.map(s => <option key={s}>{s}</option>)}
        </Select>
        <Input label="Assign To" placeholder="Priya R" value={form.assignedTo} onChange={e => set("assignedTo", e.target.value)} />
        <Select label="Center" value={form.center} onChange={e => set("center", e.target.value)}>
          <option value="">Select center</option>
          {["Koramangala","Indiranagar","Whitefield"].map(c => <option key={c}>{c}</option>)}
        </Select>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={onClose}>Create Lead</Button>
      </div>
    </Modal>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────
export const LeadsList = () => {
  const navigate = useNavigate();
  const role = useRole();
  const canAdd = ["SUPER_ADMIN","ADMIN","RM"].includes(role);

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("All");
  const [sourceFilter, setSourceFilter] = useState<string>("All");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("All");
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const PER_PAGE = 8;

  const filtered = useMemo(() => MOCK_LEADS.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.name.toLowerCase().includes(q) || l.phone.includes(q) || (l.email?.toLowerCase().includes(q) ?? false);
    const matchStage  = stageFilter === "All" || l.stage === stageFilter;
    const matchSource = sourceFilter === "All" || l.source === sourceFilter;
    const matchAssign = assigneeFilter === "All" || l.assignedTo === assigneeFilter;
    return matchSearch && matchStage && matchSource && matchAssign;
  }), [search, stageFilter, sourceFilter, assigneeFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const assignees = Array.from(new Set(MOCK_LEADS.map(l => l.assignedTo)));

  const toggleSelect = (id: string) =>
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  return (
    <div className="p-6 max-w-[1400px]">
      <PageHeader
        title="All Leads"
        subtitle={`${filtered.length} leads found`}
        actions={
          <>
            {selected.length > 0 && (
              <Button variant="secondary" size="sm">{selected.length} selected · Actions</Button>
            )}
            {canAdd && (
              <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>
                + Add Lead
              </Button>
            )}
          </>
        }
      />

      {/* ── FILTERS ── */}
      <Card className="p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-xs bg-surface border border-theme rounded-lg px-3 py-2">
            <svg className="w-3.5 h-3.5 text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, phone, email..."
              className="bg-transparent text-[13px] text-primary placeholder:text-secondary outline-none w-full"
            />
          </div>

          <Select value={stageFilter} onChange={e => { setStageFilter(e.target.value); setPage(1); }}>
            <option value="All">All Stages</option>
            {LIFECYCLE_STAGES.map(s => <option key={s}>{s}</option>)}
          </Select>

          <Select value={sourceFilter} onChange={e => { setSourceFilter(e.target.value); setPage(1); }}>
            <option value="All">All Sources</option>
            {["Meta Ads","WhatsApp","Walk-in"].map(s => <option key={s}>{s}</option>)}
          </Select>

          <Select value={assigneeFilter} onChange={e => { setAssigneeFilter(e.target.value); setPage(1); }}>
            <option value="All">All Assignees</option>
            {assignees.map(a => <option key={a}>{a}</option>)}
          </Select>

          {(stageFilter !== "All" || sourceFilter !== "All" || assigneeFilter !== "All" || search) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearch(""); setStageFilter("All"); setSourceFilter("All"); setAssigneeFilter("All"); setPage(1); }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </Card>

      {/* ── TABLE ── */}
      <Card>
        <Table>
          <thead>
            <tr>
              <Th className="w-10">
                <input
                  type="checkbox"
                  className="rounded border-theme bg-transparent"
                  checked={selected.length === paged.length && paged.length > 0}
                  onChange={() => setSelected(selected.length === paged.length ? [] : paged.map(l => l.id))}
                />
              </Th>
              <Th>Lead</Th>
              <Th>Phone</Th>
              <Th>Source</Th>
              <Th>Stage</Th>
              <Th>Assigned To</Th>
              <Th>Center</Th>
              <Th>Last Activity</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {paged.length > 0 ? paged.map(lead => (
              <Tr key={lead.id} onClick={() => navigate(`/leads/${lead.id}`)}>
                <Td>
                  <input
                    type="checkbox"
                    checked={selected.includes(lead.id)}
                    onChange={e => { e.stopPropagation(); toggleSelect(lead.id); }}
                    onClick={e => e.stopPropagation()}
                    className="rounded border-secondary bg-transparent"
                  />
                </Td>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={lead.name} size={28} />
                    <div>
                      <p className="text-[13px] font-semibold text-primary">{lead.name}</p>
                      <p className="text-[11px] text-secondary">{lead.email || "—"}</p>
                    </div>
                  </div>
                </Td>
                <Td className="text-secondary font-mono text-[12px]">{lead.phone}</Td>
                <Td><SourceBadge source={lead.source} /></Td>
                <Td><StageBadge stage={lead.stage} size="sm" /></Td>
                <Td>
                  <div className="flex items-center gap-1.5">
                    <Avatar name={lead.assignedTo} size={20} />
                    <span className="text-[12px] text-secondary">{lead.assignedTo}</span>
                  </div>
                </Td>
                <Td className="text-secondary text-[12px]">{lead.center}</Td>
                <Td className="text-secondary text-[12px]">{lead.lastActivity}</Td>
                <Td>
                  <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    <Button size="sm" variant="secondary" onClick={() => navigate(`/leads/${lead.id}`)}>
                      Open
                    </Button>
                    {["SUPER_ADMIN","ADMIN","RM"].includes(role) && (
                      <Button size="sm" variant="ghost">📞</Button>
                    )}
                  </div>
                </Td>
              </Tr>
            )) : (
              <tr>
                <td colSpan={9}>
                  <EmptyState icon="◈" title="No leads found" description="Try adjusting your filters." />
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-theme">
            <p className="text-[12px] text-secondary">
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                ← Prev
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={cn(
                    "w-7 h-7 rounded-md text-[12px] font-medium transition-colors",
                    page === i + 1
                      ? "bg-[var(--primary-color)] text-primary"
                      : "text-secondary hover-theme"
                  )}
                >
                  {i + 1}
                </button>
              ))}
              <Button size="sm" variant="ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                Next →
              </Button>
            </div>
          </div>
        )}
      </Card>

      <AddLeadModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
};

// ============================================================
// features/leads/LeadsPipeline.tsx
// Kanban-style lifecycle pipeline view.
// ============================================================

const STAGE_ACCENT_BG: Record<string, { bg: string; border: string; text: string }> = {
  "Lead Created":      { bg:"bg-indigo-500/5",  border:"border-indigo-500/15",  text:"text-indigo-400" },
  "Call Handling":     { bg:"bg-amber-500/5",   border:"border-amber-500/15",   text:"text-amber-400" },
  "Followup":          { bg:"bg-amber-500/5",   border:"border-amber-400/15",   text:"text-amber-300" },
  "Trial Booked":      { bg:"bg-emerald-500/5", border:"border-emerald-500/15", text:"text-emerald-400" },
  "Trial Done":        { bg:"bg-emerald-500/5", border:"border-emerald-400/15", text:"text-emerald-300" },
  "Joined":            { bg:"bg-green-500/5",   border:"border-green-500/15",   text:"text-green-400" },
  "Membership Active": { bg:"bg-green-500/5",   border:"border-green-400/15",   text:"text-green-300" },
  "Renewal":           { bg:"bg-red-500/5",     border:"border-red-500/15",     text:"text-red-400" },
};

const PipelineCard = ({ lead, onClick }: { lead: Lead; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="bg-card border border-theme rounded-xl p-3.5 cursor-pointer hover:border-[var(--primary-color)] transition-colors group"
  >
    <div className="flex items-center gap-2 mb-2.5">
      <Avatar name={lead.name} size={26} />
      <div className="min-w-0">
        <p className="text-[12px] font-semibold text-primary truncate group-hover:text-indigo-300 transition-colors">
          {lead.name}
        </p>
        <p className="text-[10px] text-secondary truncate">{lead.phone}</p>
      </div>
    </div>
    <SourceBadge source={lead.source} />
    <div className="flex items-center justify-between mt-2.5">
      <span className="text-[10px] text-secondary">{lead.assignedTo}</span>
      <span className="text-[10px] text-secondary">{lead.createdAt}</span>
    </div>
  </div>
);

export const LeadsPipeline = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-[1400px]">
      <PageHeader
        title="Pipeline"
        subtitle="Drag leads between stages to update their lifecycle"
        actions={<Button variant="secondary" size="sm" onClick={() => navigate("/leads")}>← Table View</Button>}
      />

      <div className="flex gap-3 overflow-x-auto pb-4">
        {LIFECYCLE_STAGES.map(stage => {
          const stageLeads = MOCK_LEADS.filter(l => l.stage === stage);
          const cfg = STAGE_ACCENT_BG[stage];
          return (
            <div
              key={stage}
              className={cn("flex-shrink-0 w-[220px] rounded-xl border p-3", cfg.bg, cfg.border)}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className={cn("text-[11px] font-bold uppercase tracking-wide", cfg.text)}>
                    {stage}
                  </p>
                  <p className="text-[11px] text-secondary mt-0.5">{stageLeads.length} leads</p>
                </div>
                <span className={cn("text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center", cfg.bg, cfg.text)}>
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2">
                {stageLeads.map(lead => (
                  <PipelineCard
                    key={lead.id}
                    lead={lead}
                    onClick={() => navigate(`/leads/${lead.id}`)}
                  />
                ))}
                {stageLeads.length === 0 && (
                  <div className="py-8 flex items-center justify-center border-2 border-dashed border-secondary/20 rounded-lg">
                    <p className="text-[11px] text-secondary">Empty</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
