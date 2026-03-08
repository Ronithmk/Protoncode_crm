// ============================================================
// features/leads/LeadDetail.tsx
// The primary workspace. Two-column layout:
// Left: lead info + stage tracker
// Right: timeline + role-conditional action panels
// ============================================================

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "../../utils/cn";
import {
  StageBadge, Avatar, Button, Card,
  SectionLabel, Input, Select, Divider, Modal,
} from "../../components/ui";
import { MOCK_LEADS, MOCK_TIMELINE } from "../../data/mockData";
import { useRole } from "../../store/useAuthStore";
import type { LifecycleStage, TimelineEntry } from "../../types/crm.types";

// ─── CONSTANTS ───────────────────────────────────────────
const LIFECYCLE_STAGES: LifecycleStage[] = [
  "Lead Created","Call Handling","Followup","Trial Booked",
  "Trial Done","Joined","Membership Active","Renewal",
];

const TIMELINE_CONFIG: Record<TimelineEntry["type"], { icon: string; color: string; bg: string }> = {
  call:         { icon:"📞", color:"text-indigo-400",  bg:"bg-indigo-500/10" },
  followup:     { icon:"↩",  color:"text-amber-400",   bg:"bg-amber-500/10" },
  trial:        { icon:"🥋", color:"text-emerald-400", bg:"bg-emerald-500/10" },
  note:         { icon:"📝", color:"text-slate-400",   bg:"bg-slate-500/10" },
  membership:   { icon:"💳", color:"text-green-400",   bg:"bg-green-500/10" },
  stage_change: { icon:"→",  color:"text-violet-400",  bg:"bg-violet-500/10" },
};

// ─── LOG CALL MODAL ──────────────────────────────────────
const LogCallModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [outcome, setOutcome] = useState("interested");
  const [notes, setNotes] = useState("");
  const [followupDate, setFollowupDate] = useState("");

  return (
    <Modal open={open} onClose={onClose} title="Log Call" width="max-w-md">
      <div className="space-y-4">
        <Select label="Call Outcome" value={outcome} onChange={e => setOutcome(e.target.value)}>
          <option value="interested">Interested</option>
          <option value="not_interested">Not Interested</option>
          <option value="call_back">Call Back Later</option>
          <option value="no_answer">No Answer</option>
          <option value="wrong_number">Wrong Number</option>
        </Select>
        <div>
          <label className="text-[12px] font-medium text-secondary block mb-1.5">Call Notes</label>
          <textarea
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="What was discussed..."
            className="w-full bg-card border border-theme rounded-lg px-3 py-2 text-[13px] text-primary placeholder:text-secondary outline-none focus:border-indigo-500 resize-none"
          />
        </div>
        <Input label="Schedule Follow-up (optional)" type="date" value={followupDate} onChange={e => setFollowupDate(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={onClose}>Save Call Log</Button>
      </div>
    </Modal>
  );
};

// ─── BOOK TRIAL MODAL ────────────────────────────────────
const BookTrialModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [batch, setBatch] = useState("BJJ Basics");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("6:00 PM");

  return (
    <Modal open={open} onClose={onClose} title="Book Trial Session">
      <div className="space-y-4">
        <Select label="Program" value={batch} onChange={e => setBatch(e.target.value)}>
          {["BJJ Basics","Kickboxing","MMA Intro","Wrestling","Muay Thai"].map(b => <option key={b}>{b}</option>)}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Trial Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
          <Select label="Time Slot" value={time} onChange={e => setTime(e.target.value)}>
            {["6:00 AM","7:30 AM","9:00 AM","5:00 PM","6:00 PM","7:30 PM"].map(t => <option key={t}>{t}</option>)}
          </Select>
        </div>
        <Select label="Trainer">
          <option>Coach Reddy</option>
          <option>Coach Meena</option>
        </Select>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={onClose}>Confirm Trial</Button>
      </div>
    </Modal>
  );
};

// ─── CREATE MEMBERSHIP MODAL ─────────────────────────────
const CreateMembershipModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [plan, setPlan] = useState("Monthly");
  const [amount, setAmount] = useState("2500");
  const [startDate, setStartDate] = useState("");

  return (
    <Modal open={open} onClose={onClose} title="Create Membership">
      <div className="space-y-4">
        <Select label="Membership Plan" value={plan} onChange={e => setPlan(e.target.value)}>
          {["Monthly","Quarterly","Half-Yearly","Annual"].map(p => <option key={p}>{p}</option>)}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Amount (₹)" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
          <Input label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <Select label="Payment Mode">
          <option>Online Transfer</option>
          <option>Cash</option>
          <option>UPI</option>
          <option>Card</option>
        </Select>
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
          <p className="text-[12px] text-emerald-400 font-medium">Payment Summary</p>
          <p className="text-[13px] text-primary mt-1">{plan} Plan · ₹{parseInt(amount).toLocaleString("en-IN")}</p>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={onClose}>Create Membership</Button>
      </div>
    </Modal>
  );
};

// ─── STAGE TRACKER ───────────────────────────────────────
const StageTracker = ({ currentStage }: { currentStage: LifecycleStage }) => {
  const currentIdx = LIFECYCLE_STAGES.indexOf(currentStage);
  return (
    <div className="space-y-1">
      {LIFECYCLE_STAGES.map((stage, i) => {
        const isDone   = i < currentIdx;
        const isActive = i === currentIdx;
        return (
          <div key={stage} className="flex items-center gap-2.5">
            <div
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 transition-all",
                !isDone && !isActive && "bg-surface border border-theme text-secondary"
              )}
              style={
                isDone
                  ? {
                      background: "var(--success-color)",
                      color: "#fff",
                    }
                  : isActive
                  ? {
                      background: "var(--primary-color)",
                      color: "#fff",
                      boxShadow: `0 0 0 2px var(--primary-color)30`,
                    }
                  : undefined
              }
            >
              {isDone ? "✓" : i + 1}
            </div>
            <span className={cn(
              "text-[12px] transition-colors",
              isActive && "text-primary font-semibold",
              isDone   && "text-secondary",
              !isDone && !isActive && "text-secondary",
            )}>
              {stage}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ─── TIMELINE ENTRY ──────────────────────────────────────
const TimelineItem = ({ entry }: { entry: TimelineEntry }) => {
  const cfg = TIMELINE_CONFIG[entry.type];
  return (
    <div className="flex gap-3 relative">
      <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[12px] flex-shrink-0 z-10", cfg.bg)}>
        {cfg.icon}
      </div>
      <div className="flex-1 pb-4">
        <div className="bg-card border border-theme rounded-xl p-3.5 hover:border-[#2d4a80] transition-colors">
          <div className="flex items-center justify-between mb-1.5 gap-2">
            <span className={cn("text-[11px] font-bold uppercase tracking-wide", cfg.color)}>
              {entry.type.replace("_", " ")}
            </span>
            <span className="text-[10px] text-secondary flex-shrink-0">{entry.date} · {entry.by}</span>
          </div>
          <p className="text-[13px] text-secondary leading-relaxed">{entry.content}</p>
          {entry.metadata?.from && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-secondary">{entry.metadata.from as string}</span>
              <span className="text-secondary">→</span>
              <span className="text-[11px] text-violet-400 font-medium">{entry.metadata.to as string}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── ACTION PANEL ────────────────────────────────────────
const ActionPanel = ({
  title, accent, children,
}: { title: string; accent: string; children: React.ReactNode }) => (
  <Card className={cn("overflow-hidden")} style={{ borderColor: `${accent}30` } as React.CSSProperties}>
    <div
      className="px-4 py-3 border-b"
      style={{ borderColor: `${accent}20`, background: `${accent}08` } as React.CSSProperties}
    >
      <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: accent }}>{title}</p>
    </div>
    <div className="p-4">{children}</div>
  </Card>
);

const ActionGrid = ({ actions }: { actions: string[]; }) => (
  <div className="grid grid-cols-2 gap-2">
    {actions.map(action => (
      <button
        key={action}
        className="px-3 py-2 rounded-lg text-[12px] font-medium text-secondary bg-white/3 border border-theme hover:text-primary hover:border-[#2d4a80] transition-all text-left"
      >
        {action}
      </button>
    ))}
  </div>
);

// ─── MAIN COMPONENT ──────────────────────────────────────
export const LeadDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const role = useRole();

  const lead = MOCK_LEADS.find(l => l.id === id) ?? MOCK_LEADS[0];

  const [noteText, setNoteText] = useState("");
  const [showCallModal, setShowCallModal] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);

  const canCall       = ["SUPER_ADMIN","ADMIN","RM"].includes(role);
  const canTrial      = ["SUPER_ADMIN","ADMIN","RM","TRAINING_MANAGER"].includes(role);
  const canMembership = ["SUPER_ADMIN","FM"].includes(role);
  const canRenewal    = ["SUPER_ADMIN","ADMIN","FM"].includes(role);

  return (
    <div className="p-6 max-w-[1400px]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5 text-[13px]">
        <button
          onClick={() => navigate("/leads")}
          className="text-secondary hover:text-primary transition-colors flex items-center gap-1"
        >
          ← Leads
        </button>
        <span className="text-secondary">/</span>
        <span className="text-primary font-medium">{lead.name}</span>
        <StageBadge stage={lead.stage} size="sm" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-5">
        {/* ── LEFT COLUMN ── */}
        <div className="space-y-4">
          {/* Profile card */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 p-5 flex flex-col items-center gap-3 border-b border-theme">
              <Avatar name={lead.name} size={56} />
              <div className="text-center">
                <p className="text-[15px] font-bold text-primary">{lead.name}</p>
                <StageBadge stage={lead.stage} />
              </div>
              <div className="flex gap-2 w-full">
                {canCall && (
                  <Button variant="primary" size="sm" className="flex-1" onClick={() => setShowCallModal(true)}>
                    📞 Call
                  </Button>
                )}
                <Button variant="secondary" size="sm" className="flex-1">💬 WhatsApp</Button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {[
                { label:"Phone",       value:lead.phone,       icon:"📞" },
                { label:"Email",       value:lead.email || "—", icon:"✉" },
                { label:"Source",      value:lead.source,      icon:"◈" },
                { label:"Center",      value:lead.center,      icon:"📍" },
                { label:"Created",     value:lead.createdAt,   icon:"📅" },
                { label:"Assigned To", value:lead.assignedTo,  icon:"◎" },
              ].map(item => (
                <div key={item.label} className="flex gap-3">
                  <span className="text-sm flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-[10px] text-secondary font-medium uppercase tracking-wider">{item.label}</p>
                    <p className="text-[13px] text-secondary font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
              {lead.membershipPlan && (
                <>
                  <Divider />
                  {[
                    { label:"Plan",    value:lead.membershipPlan },
                    { label:"Start",   value:lead.membershipStart || "—" },
                    { label:"Expires", value:lead.membershipEnd || "—" },
                    { label:"Revenue", value:lead.totalRevenue ? `₹${lead.totalRevenue.toLocaleString("en-IN")}` : "—" },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between">
                      <span className="text-[12px] text-secondary">{item.label}</span>
                      <span className="text-[12px] text-primary font-medium">{item.value}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </Card>

          {/* Stage Tracker */}
          <Card className="p-4">
            <SectionLabel>Stage Progression</SectionLabel>
            <StageTracker currentStage={lead.stage} />
          </Card>

          {/* Quick Tags */}
          {lead.tags && lead.tags.length > 0 && (
            <Card className="p-4">
              <SectionLabel>Tags</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {lead.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-4">
          {/* Timeline */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-5">
              <SectionLabel className="mb-0">Activity Timeline</SectionLabel>
              <span className="text-[11px] text-secondary">{MOCK_TIMELINE.length} entries</span>
            </div>

            {/* Add note */}
            {canCall && (
              <div className="mb-5 pb-5 border-b border-theme">
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  rows={2}
                  placeholder="Add a note, call summary, or update..."
                  className="w-full bg-card border border-theme rounded-xl px-4 py-3 text-[13px] text-primary placeholder:text-secondary outline-none focus:border-indigo-500 resize-none transition-colors"
                />
                <div className="flex gap-2 mt-2.5">
                  <Button variant="primary" size="sm" disabled={!noteText.trim()}>Add Note</Button>
                  <Button variant="secondary" size="sm" onClick={() => setShowCallModal(true)}>Log Call</Button>
                </div>
              </div>
            )}

            {/* Timeline entries */}
            <div className="relative">
              <div className="absolute left-[13px] top-2 bottom-2 w-px bg-theme" />
              {MOCK_TIMELINE.map(entry => (
                <TimelineItem key={entry.id} entry={entry} />
              ))}
            </div>
          </Card>

          {/* ── ROLE-CONDITIONAL ACTION PANELS ── */}

          {/* Call Handling — RM, ADMIN, SUPER_ADMIN */}
          {canCall && (
            <ActionPanel title="📞 Call Handling" accent="#6366f1">
              <ActionGrid
                actions={["Log Call","Schedule Follow-up","Send WhatsApp","Mark No Answer","Update Stage","Add to Pipeline"]}
              />
            </ActionPanel>
          )}

          {/* Trial Management — RM, TRAINING_MANAGER, SUPER_ADMIN */}
          {canTrial && (
            <ActionPanel title="🥋 Trial Management" accent="#10b981">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Button variant="primary" size="sm" onClick={() => setShowTrialModal(true)}>
                  Book Trial
                </Button>
                <Button variant="secondary" size="sm">Confirm Trial</Button>
                <Button variant="secondary" size="sm">Mark Trial Done</Button>
                <Button variant="secondary" size="sm">Reschedule</Button>
              </div>
              {lead.trialDate && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                  <p className="text-[11px] text-emerald-400 font-semibold">Trial Scheduled</p>
                  <p className="text-[12px] text-secondary mt-0.5">{lead.trialDate} · 6:00 PM</p>
                </div>
              )}
            </ActionPanel>
          )}

          {/* Membership Conversion — FM, SUPER_ADMIN */}
          {canMembership && (
            <ActionPanel title="💳 Membership Conversion" accent="#f59e0b">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Button variant="primary" size="sm" onClick={() => setShowMembershipModal(true)}>
                  Create Membership
                </Button>
                <Button variant="secondary" size="sm">Send Invoice</Button>
                <Button variant="secondary" size="sm">Record Payment</Button>
                <Button variant="secondary" size="sm">Generate Receipt</Button>
              </div>
            </ActionPanel>
          )}

          {/* Renewal Panel — FM, ADMIN, SUPER_ADMIN */}
          {canRenewal && lead.stage === "Renewal" && (
            <ActionPanel title="↺ Renewal" accent="#f87171">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="primary" size="sm">Renew Membership</Button>
                <Button variant="secondary" size="sm">Send Reminder</Button>
                <Button variant="secondary" size="sm">Apply Discount</Button>
                <Button variant="danger" size="sm">Mark Lapsed</Button>
              </div>
            </ActionPanel>
          )}
        </div>
      </div>

      {/* Modals */}
      <LogCallModal open={showCallModal} onClose={() => setShowCallModal(false)} />
      <BookTrialModal open={showTrialModal} onClose={() => setShowTrialModal(false)} />
      <CreateMembershipModal open={showMembershipModal} onClose={() => setShowMembershipModal(false)} />
    </div>
  );
};
