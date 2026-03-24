import { useState, useRef, useEffect } from "react";
import {
  getTickets,
  addTicket,
  updateTicket as storeUpdateTicket,
  updateTicketStatus,
  updatePriority,
  assignTicket,
  addComment,
} from "../store/ticketStore";
import type { Ticket, Comment } from "../types/ticket.types";

// ─── LOCAL UI TYPES (agent-side only) ────────────────────────────────────────
type StatusFilter   = "ALL" | "NEW" | "IN_PROGRESS" | "RESOLVED";
type PriorityFilter = "ALL" | "LOW" | "MEDIUM" | "HIGH";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const AGENTS = ["Unassigned", "Rajesh", "Priya", "Admin", "Support 1"];

const STATUS_CFG = {
  NEW:         { label: "Open",        dot: "#f59e0b", badge: { background: "rgba(245,158,11,0.12)",  color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)"  } },
  IN_PROGRESS: { label: "In Progress", dot: "#60a5fa", badge: { background: "rgba(59,130,246,0.12)",  color: "#60a5fa", border: "1px solid rgba(59,130,246,0.25)"  } },
  RESOLVED:    { label: "Resolved",    dot: "#34d399", badge: { background: "rgba(16,185,129,0.12)",  color: "#34d399", border: "1px solid rgba(16,185,129,0.25)"  } },
} as const;

const PRIORITY_CFG = {
  LOW:    { label: "Low",    color: "#64748b", icon: "○" },
  MEDIUM: { label: "Medium", color: "#60a5fa", icon: "◑" },
  HIGH:   { label: "High",   color: "#f97316", icon: "●" },
} as const;

const TYPE_ICONS: Record<string, string> = {
  billing: "💳", membership: "🏷️", equipment: "🏋️",
  coaching: "🎯", app: "📱", other: "📁", general: "📁",
};

function typeIcon(type: string) {
  return TYPE_ICONS[type?.toLowerCase()] ?? "📁";
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmtLabel(val: string) {
  if (val === "NEW") return "Open";
  if (val === "IN_PROGRESS") return "In Progress";
  return val.charAt(0) + val.slice(1).toLowerCase();
}

// Agent vs member bubble: agents use names (no @), members use emails
const isAgentComment = (c: Comment) => !c.author.includes("@");

// ─── INLINE DROPDOWN ──────────────────────────────────────────────────────────
function InlineSelect({
  value, options, onChange, renderValue,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  renderValue?: (v: string) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const handleBlur = () => setTimeout(() => setOpen(false), 150);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }} onBlur={handleBlur}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", border: "none", background: "none", padding: 0 }}
      >
        {renderValue ? renderValue(value) : <span style={{ fontSize: 12, color: "#94a3b8" }}>{fmtLabel(value)}</span>}
        <span style={{ fontSize: 9, color: "#4a5568", marginLeft: 2 }}>▾</span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 999, background: "#1c2230", border: "1px solid #2d3748", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.55)", minWidth: 148, overflow: "hidden" }}>
          {options.map(opt => (
            <div key={opt}
              onMouseDown={e => { e.preventDefault(); onChange(opt); setOpen(false); }}
              style={{ padding: "8px 12px", fontSize: 12, color: opt === value ? "#a5b4fc" : "#94a3b8", background: opt === value ? "rgba(99,102,241,0.14)" : "transparent", cursor: "pointer" }}
              onMouseEnter={e => { if (opt !== value) e.currentTarget.style.background = "rgba(99,102,241,0.07)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = opt === value ? "rgba(99,102,241,0.14)" : "transparent"; }}
            >
              {fmtLabel(opt)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter]                 = useState<StatusFilter>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("ALL");
  const [typeFilter, setTypeFilter]         = useState("ALL");
  const [search, setSearch]                 = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showCreate, setShowCreate]         = useState(false);
  const [view, setView]                     = useState<"list" | "kanban">("list");
  const [sortBy, setSortBy]                 = useState<"createdAt" | "priority">("createdAt");
  const [replyText, setReplyText]           = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    title: "", description: "", priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
    type: "general", createdBy: "",
  });

  // ── Load from localStorage ──
  const loadTickets = () => setTickets(getTickets());

  useEffect(() => {
    loadTickets();
    const interval = setInterval(loadTickets, 5000);
    return () => clearInterval(interval);
  }, []);

  // ── Store update helpers ──
  const handleStatusChange = (id: string, status: "NEW" | "IN_PROGRESS" | "RESOLVED") => {
    updateTicketStatus(id, status);
    loadTickets();
    if (selectedTicket?.id === id) setSelectedTicket(t => t ? { ...t, status, updatedAt: new Date().toISOString() } : null);
  };

  const handlePriorityChange = (id: string, priority: "LOW" | "MEDIUM" | "HIGH") => {
    updatePriority(id, priority);
    loadTickets();
    if (selectedTicket?.id === id) setSelectedTicket(t => t ? { ...t, priority, updatedAt: new Date().toISOString() } : null);
  };

  const handleAgentChange = (id: string, agent: string) => {
    assignTicket(id, agent === "Unassigned" ? "" : agent);
    loadTickets();
    if (selectedTicket?.id === id) setSelectedTicket(t => t ? { ...t, assignedTo: agent, updatedAt: new Date().toISOString() } : null);
  };

  const handleTypeChange = (id: string, type: string) => {
    storeUpdateTicket(id, { type });
    loadTickets();
    if (selectedTicket?.id === id) setSelectedTicket(t => t ? { ...t, type, updatedAt: new Date().toISOString() } : null);
  };

  // ── Agent reply ──
  const sendReply = () => {
    if (!replyText.trim() || !selectedTicket) return;
    const comment: Comment = {
      id:        Date.now().toString(),
      message:   replyText,
      author:    "Support",
      createdAt: new Date().toISOString(),
    };
    addComment(selectedTicket.id, comment);
    loadTickets();
    const refreshed = getTickets().find(t => t.id === selectedTicket.id);
    if (refreshed) setSelectedTicket(refreshed);
    setReplyText("");
    setTimeout(() => chatRef.current?.scrollTo({ top: 9999, behavior: "smooth" }), 50);
  };

  // ── Create ticket (agent side) ──
  const createTicket = () => {
    if (!form.title || !form.createdBy) return;
    addTicket({
      title:       form.title,
      description: form.description,
      priority:    form.priority,
      type:        form.type,
      createdBy:   form.createdBy,
    });
    loadTickets();
    setForm({ title: "", description: "", priority: "MEDIUM", type: "general", createdBy: "" });
    setShowCreate(false);
  };

  // ── Filter & sort ──
  const filtered = tickets
    .filter(t => filter === "ALL" || t.status === filter)
    .filter(t => priorityFilter === "ALL" || t.priority === priorityFilter)
    .filter(t => typeFilter === "ALL" || t.type === typeFilter)
    .filter(t => !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.id.includes(search) ||
      (t.createdBy || "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "priority") {
        const o = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return (o[a.priority as keyof typeof o] ?? 3) - (o[b.priority as keyof typeof o] ?? 3);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const stats = {
    total:       tickets.length,
    NEW:         tickets.filter(t => t.status === "NEW").length,
    IN_PROGRESS: tickets.filter(t => t.status === "IN_PROGRESS").length,
    RESOLVED:    tickets.filter(t => t.status === "RESOLVED").length,
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ color: "#e2e8f0" }}>
      <style>{`
        .tk-row:hover td { background: rgba(99,102,241,0.04); }
        .fade-in { animation: fi 0.15s ease; }
        @keyframes fi { from { opacity:0; transform:translateY(3px); } to { opacity:1; transform:none; } }
        .modal-bg { position:fixed;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(3px);z-index:200;display:flex;align-items:center;justify-content:center; }
        input:focus, select:focus, textarea:focus { border-color:#6366f1 !important; outline:none; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ padding: "18px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>Active Tickets</h1>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Manage all support requests</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", background: "#161b22", border: "1px solid #2d3748", borderRadius: 7, overflow: "hidden" }}>
            {(["list", "kanban"] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: "6px 13px", fontSize: 12, fontWeight: 500, background: view === v ? "#6366f1" : "transparent", color: view === v ? "#fff" : "#64748b", border: "none", cursor: "pointer", transition: "all 0.15s" }}>
                {v === "list" ? "⊞ List" : "⧉ Kanban"}
              </button>
            ))}
          </div>
          <button onClick={loadTickets} style={{ background: "#161b22", color: "#64748b", padding: "7px 12px", borderRadius: 7, fontSize: 12, border: "1px solid #2d3748", cursor: "pointer" }} title="Refresh">
            ↻ Refresh
          </button>
          <button onClick={() => setShowCreate(true)} style={{ background: "#6366f1", color: "#fff", padding: "7px 15px", borderRadius: 7, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>
            + Create Ticket
          </button>
        </div>
      </div>

      <div style={{ padding: "12px 24px", display: "flex", flexDirection: "column", gap: 10 }}>

        {/* ── STAT ROW ── */}
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { label: "Total",       value: stats.total,       color: "#6366f1", border: "rgba(99,102,241,0.25)", bg: "rgba(99,102,241,0.07)" },
            { label: "Open",        value: stats.NEW,         color: "#f59e0b", border: "rgba(245,158,11,0.25)", bg: "rgba(245,158,11,0.07)" },
            { label: "In Progress", value: stats.IN_PROGRESS, color: "#60a5fa", border: "rgba(59,130,246,0.25)", bg: "rgba(59,130,246,0.07)" },
            { label: "Resolved",    value: stats.RESOLVED,    color: "#34d399", border: "rgba(16,185,129,0.25)", bg: "rgba(16,185,129,0.07)" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8, padding: "6px 14px", flex: "1 1 0" }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</span>
              <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── FILTER BAR ── */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", background: "#161b22", border: "1px solid #2d3748", borderRadius: 9, padding: "8px 12px" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#4a5568" }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets, members…" style={{ background: "#0d1117", border: "1px solid #2d3748", borderRadius: 7, padding: "6px 10px 6px 28px", fontSize: 12, color: "#e2e8f0", width: 210 }} />
          </div>

          {(["ALL","NEW","IN_PROGRESS","RESOLVED"] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ padding: "4px 11px", borderRadius: 20, fontSize: 12, fontWeight: 500, border: "1px solid", cursor: "pointer", transition: "all 0.12s", borderColor: filter === s ? "#6366f1" : "#2d3748", background: filter === s ? "rgba(99,102,241,0.15)" : "transparent", color: filter === s ? "#a5b4fc" : "#64748b" }}>
              {s === "ALL" ? "All" : s === "NEW" ? "Open" : s === "IN_PROGRESS" ? "In Progress" : "Resolved"}
            </button>
          ))}

          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as PriorityFilter)} style={{ background: "#0d1117", border: "1px solid #2d3748", borderRadius: 7, padding: "5px 9px", fontSize: 12, color: "#94a3b8", cursor: "pointer" }}>
              <option value="ALL">All Priority</option>
              {["LOW","MEDIUM","HIGH"].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ background: "#0d1117", border: "1px solid #2d3748", borderRadius: 7, padding: "5px 9px", fontSize: 12, color: "#94a3b8", cursor: "pointer" }}>
              <option value="ALL">All Types</option>
              {["billing","membership","equipment","coaching","app","general","other"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={{ background: "#0d1117", border: "1px solid #2d3748", borderRadius: 7, padding: "5px 9px", fontSize: 12, color: "#94a3b8", cursor: "pointer" }}>
              <option value="createdAt">Latest First</option>
              <option value="priority">By Priority</option>
            </select>
          </div>
        </div>

        {/* ── LIST VIEW ── */}
        {view === "list" && (
          <div className="fade-in" style={{ background: "#1c2230", border: "1px solid #2d3748", borderRadius: 10, overflow: "visible" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#161b22" }}>
                  {["ID","Subject","Status","Priority","Type","Agent","Created","Action"].map(h => (
                    <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#4a5568", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #2d3748", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: "48px 20px", color: "#4a5568" }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🎫</div>
                    <div style={{ fontSize: 13 }}>{tickets.length === 0 ? "No tickets yet. Members can submit via /member-support" : "No tickets match your filters"}</div>
                  </td></tr>
                )}
                {filtered.map(t => {
                  // ✅ FIX: safe comments with fallback
                  const comments = t.comments || [];

                  return (
                    <tr key={t.id} className="tk-row" style={{ transition: "background 0.12s" }}>

                      {/* ID */}
                      <td style={{ padding: "10px 14px", borderBottom: "1px solid #2d3748", fontFamily: "monospace", fontSize: 11, color: "#4a5568", whiteSpace: "nowrap" }}>
                        #{t.id.slice(-6)}
                      </td>

                      {/* Subject */}
                      <td style={{ padding: "10px 14px", borderBottom: "1px solid #2d3748", maxWidth: 240 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>{t.title}</div>
                        <div style={{ fontSize: 11, color: "#4a5568", marginTop: 1 }}>{t.createdBy || "—"}</div>
                        {/* ✅ FIX: use safe comments variable */}
                        <div style={{ fontSize: 10, color: "#4a5568", marginTop: 1 }}>
                          {comments.length} message{comments.length !== 1 ? "s" : ""}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "10px 14px", borderBottom: "1px solid #2d3748", whiteSpace: "nowrap" }}>
                        <InlineSelect
                          value={t.status}
                          options={["NEW","IN_PROGRESS","RESOLVED"]}
                          onChange={val => handleStatusChange(t.id, val as any)}
                          renderValue={val => {
                            const cfg = STATUS_CFG[val as keyof typeof STATUS_CFG] ?? STATUS_CFG.NEW;
                            return (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 5, fontSize: 11, fontWeight: 600, ...cfg.badge }}>
                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
                                {cfg.label}
                              </span>
                            );
                          }}
                        />
                      </td>

                      {/* Priority */}
                      <td style={{ padding: "10px 14px", borderBottom: "1px solid #2d3748", whiteSpace: "nowrap" }}>
                        <InlineSelect
                          value={t.priority}
                          options={["LOW","MEDIUM","HIGH"]}
                          onChange={val => handlePriorityChange(t.id, val as any)}
                          renderValue={val => {
                            const cfg = PRIORITY_CFG[val as keyof typeof PRIORITY_CFG] ?? PRIORITY_CFG.MEDIUM;
                            return <span style={{ fontSize: 12, fontWeight: 600, color: cfg.color }}>{cfg.icon} {cfg.label}</span>;
                          }}
                        />
                      </td>

                      {/* Type */}
                      <td style={{ padding: "10px 14px", borderBottom: "1px solid #2d3748", whiteSpace: "nowrap" }}>
                        <InlineSelect
                          value={t.type || "general"}
                          options={["billing","membership","equipment","coaching","app","general","other"]}
                          onChange={val => handleTypeChange(t.id, val)}
                          renderValue={val => <span style={{ fontSize: 11, color: "#64748b" }}>{typeIcon(val)} {val}</span>}
                        />
                      </td>

                      {/* Agent */}
                      <td style={{ padding: "10px 14px", borderBottom: "1px solid #2d3748", whiteSpace: "nowrap" }}>
                        <InlineSelect
                          value={t.assignedTo || "Unassigned"}
                          options={AGENTS}
                          onChange={val => handleAgentChange(t.id, val)}
                          renderValue={val => (
                            <span style={{ fontSize: 12, color: !val || val === "Unassigned" ? "#ef4444" : "#94a3b8" }}>
                              {!val || val === "Unassigned" ? "Unassigned" : val}
                            </span>
                          )}
                        />
                      </td>

                      {/* Created */}
                      <td style={{ padding: "10px 14px", borderBottom: "1px solid #2d3748", fontSize: 11, color: "#4a5568", whiteSpace: "nowrap" }}>
                        {timeAgo(t.createdAt)}
                      </td>

                      {/* Action */}
                      <td style={{ padding: "10px 14px", borderBottom: "1px solid #2d3748" }}>
                        <button onClick={() => setSelectedTicket(t)} style={{ padding: "4px 11px", borderRadius: 6, background: "rgba(99,102,241,0.1)", color: "#818cf8", fontSize: 12, fontWeight: 500, border: "1px solid rgba(99,102,241,0.2)", cursor: "pointer", whiteSpace: "nowrap" }}>
                          Open →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── KANBAN VIEW ── */}
        {view === "kanban" && (
          <div className="fade-in" style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
            {(["NEW","IN_PROGRESS","RESOLVED"] as const).map(col => {
              const cfg = STATUS_CFG[col];
              const colT = filtered.filter(t => t.status === col);
              return (
                <div key={col} style={{ background: "#1c2230", border: "1px solid #2d3748", borderRadius: 10, overflow: "hidden", flexShrink: 0, width: 260 }}>
                  <div style={{ padding: "10px 12px", borderBottom: "1px solid #2d3748", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{cfg.label}</span>
                    </div>
                    <span style={{ background: "#161b22", padding: "1px 7px", borderRadius: 9, fontSize: 11, color: "#4a5568", fontWeight: 600 }}>{colT.length}</span>
                  </div>
                  <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 7, maxHeight: 520, overflowY: "auto" }}>
                    {colT.map(t => {
                      const pCfg = PRIORITY_CFG[t.priority as keyof typeof PRIORITY_CFG] ?? PRIORITY_CFG.MEDIUM;
                      return (
                        <div key={t.id} onClick={() => setSelectedTicket(t)} style={{ background: "#161b22", border: "1px solid #2d3748", borderRadius: 7, padding: 10, cursor: "pointer" }}>
                          <div style={{ fontSize: 10, color: "#4a5568", marginBottom: 5, fontFamily: "monospace" }}>#{t.id.slice(-6)} · {typeIcon(t.type)}</div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: "#e2e8f0", marginBottom: 6, lineHeight: 1.4 }}>{t.title}</div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 11, color: "#4a5568" }}>{t.createdBy || "—"}</span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: pCfg.color }}>{pCfg.icon} {t.priority}</span>
                          </div>
                          {t.assignedTo && t.assignedTo !== "Unassigned" && (
                            <div style={{ marginTop: 6, fontSize: 10, color: "#6366f1", background: "rgba(99,102,241,0.1)", padding: "2px 7px", borderRadius: 4, display: "inline-block" }}>👤 {t.assignedTo}</div>
                          )}
                        </div>
                      );
                    })}
                    {colT.length === 0 && <div style={{ textAlign: "center", padding: "20px 10px", color: "#2d3748", fontSize: 12 }}>No tickets</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── TICKET DETAIL MODAL ── */}
      {selectedTicket && (() => {
        // ✅ FIX: safe comments with fallback for entire modal
        const comments = selectedTicket.comments || [];
        return (
          <div className="modal-bg" onClick={() => setSelectedTicket(null)}>
            <div className="fade-in" onClick={e => e.stopPropagation()} style={{ background: "#161b22", border: "1px solid #2d3748", borderRadius: 14, width: "min(880px, 95vw)", maxHeight: "88vh", display: "flex", overflow: "hidden" }}>

              {/* Left sidebar */}
              <div style={{ width: 260, borderRight: "1px solid #2d3748", padding: 16, overflowY: "auto", flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 10, color: "#4a5568", fontFamily: "monospace" }}>#{selectedTicket.id.slice(-6)}</span>
                  <button onClick={() => setSelectedTicket(null)} style={{ color: "#4a5568", fontSize: 16, cursor: "pointer", lineHeight: 1 }}>×</button>
                </div>

                <h2 style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", lineHeight: 1.4 }}>{selectedTicket.title}</h2>

                <div style={{ background: "#1c2230", border: "1px solid #2d3748", borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 9, color: "#4a5568", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Member</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{selectedTicket.createdBy || "—"}</div>
                  <div style={{ fontSize: 10, color: "#4a5568", marginTop: 4 }}>via member portal</div>
                </div>

                {[
                  { label: "Status",   val: selectedTicket.status,                    opts: ["NEW","IN_PROGRESS","RESOLVED"],                                     key: "status"     },
                  { label: "Priority", val: selectedTicket.priority,                  opts: ["LOW","MEDIUM","HIGH"],                                               key: "priority"   },
                  { label: "Agent",    val: selectedTicket.assignedTo || "Unassigned", opts: AGENTS,                                                                key: "assignedTo" },
                  { label: "Type",     val: selectedTicket.type || "general",         opts: ["billing","membership","equipment","coaching","app","general","other"], key: "type"       },
                ].map(ctrl => (
                  <div key={ctrl.key}>
                    <div style={{ fontSize: 9, color: "#4a5568", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{ctrl.label}</div>
                    <select value={ctrl.val}
                      onChange={e => {
                        const v = e.target.value;
                        if      (ctrl.key === "status")     handleStatusChange(selectedTicket.id, v as any);
                        else if (ctrl.key === "priority")   handlePriorityChange(selectedTicket.id, v as any);
                        else if (ctrl.key === "assignedTo") handleAgentChange(selectedTicket.id, v);
                        else                                handleTypeChange(selectedTicket.id, v);
                      }}
                      style={{ width: "100%", background: "#1c2230", border: "1px solid #2d3748", borderRadius: 7, padding: "6px 9px", fontSize: 12, color: "#e2e8f0", cursor: "pointer" }}>
                      {ctrl.opts.map(o => <option key={o} value={o}>{fmtLabel(o)}</option>)}
                    </select>
                  </div>
                ))}

                <div style={{ fontSize: 11, color: "#4a5568" }}>
                  <div>Created {timeAgo(selectedTicket.createdAt)}</div>
                  <div style={{ marginTop: 2 }}>Updated {timeAgo(selectedTicket.updatedAt)}</div>
                </div>

                {selectedTicket.status !== "RESOLVED" && (
                  <button onClick={() => handleStatusChange(selectedTicket.id, "RESOLVED")} style={{ padding: "8px", borderRadius: 8, background: "rgba(16,185,129,0.1)", color: "#10b981", fontSize: 12, fontWeight: 600, border: "1px solid rgba(16,185,129,0.2)", cursor: "pointer" }}>
                    ✓ Mark Resolved
                  </button>
                )}
              </div>

              {/* Right: Conversation */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #2d3748", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>Conversation</span>
                  {/* ✅ FIX: use safe comments variable */}
                  <span style={{ fontSize: 11, color: "#4a5568" }}>· {comments.length + 1} messages</span>
                </div>

                <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {/* Original description bubble */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <div style={{ fontSize: 10, color: "#4a5568", marginBottom: 3 }}>{selectedTicket.createdBy || "Member"} · {timeAgo(selectedTicket.createdAt)}</div>
                    <div style={{ background: "#1c2230", border: "1px solid #2d3748", borderRadius: "11px 11px 11px 2px", padding: "9px 13px", maxWidth: "78%", fontSize: 13, color: "#e2e8f0", lineHeight: 1.6 }}>
                      {selectedTicket.description}
                    </div>
                  </div>

                  {/* ✅ FIX: use safe comments variable */}
                  {comments.map((c: Comment) => {
                    const fromAgent = isAgentComment(c);
                    return (
                      <div key={c.id} style={{ display: "flex", flexDirection: "column", alignItems: fromAgent ? "flex-end" : "flex-start" }}>
                        <div style={{ fontSize: 10, color: "#4a5568", marginBottom: 3 }}>{c.author} · {timeAgo(c.createdAt)}</div>
                        <div style={{
                          background:   fromAgent ? "rgba(99,102,241,0.14)" : "#1c2230",
                          border:       `1px solid ${fromAgent ? "rgba(99,102,241,0.22)" : "#2d3748"}`,
                          borderRadius: fromAgent ? "11px 11px 2px 11px" : "11px 11px 11px 2px",
                          padding: "9px 13px", maxWidth: "78%", fontSize: 13, color: "#e2e8f0", lineHeight: 1.6,
                        }}>
                          {c.message}
                        </div>
                      </div>
                    );
                  })}

                  {/* ✅ FIX: use safe comments variable */}
                  {comments.length === 0 && (
                    <div style={{ textAlign: "center", color: "#4a5568", fontSize: 13, padding: "20px 0" }}>No replies yet. Start the conversation.</div>
                  )}
                </div>

                {/* Reply box */}
                <div style={{ padding: "10px 16px", borderTop: "1px solid #2d3748", display: "flex", gap: 9, alignItems: "flex-end" }}>
                  <textarea value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }} placeholder="Type a reply… (Enter to send, Shift+Enter for new line)" rows={2} style={{ flex: 1, background: "#1c2230", border: "1px solid #2d3748", borderRadius: 9, padding: "8px 11px", fontSize: 13, color: "#e2e8f0", resize: "none", lineHeight: 1.5 }} />
                  <button onClick={sendReply} disabled={!replyText.trim()} style={{ padding: "9px 15px", borderRadius: 9, background: replyText.trim() ? "#6366f1" : "#1c2230", color: replyText.trim() ? "#fff" : "#4a5568", fontSize: 13, fontWeight: 600, border: "1px solid", borderColor: replyText.trim() ? "#6366f1" : "#2d3748", cursor: replyText.trim() ? "pointer" : "default", transition: "all 0.13s" }}>
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── CREATE TICKET MODAL ── */}
      {showCreate && (
        <div className="modal-bg" onClick={() => setShowCreate(false)}>
          <div className="fade-in" onClick={e => e.stopPropagation()} style={{ background: "#161b22", border: "1px solid #2d3748", borderRadius: 14, width: "min(500px, 95vw)", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>Create Ticket</h2>
              <button onClick={() => setShowCreate(false)} style={{ color: "#4a5568", fontSize: 18, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Member Email *", key: "createdBy", placeholder: "member@example.com" },
                { label: "Subject *",      key: "title",     placeholder: "Brief issue description" },
              ].map(f => (
                <div key={f.key}>
                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.label}</div>
                  <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: "100%", background: "#1c2230", border: "1px solid #2d3748", borderRadius: 7, padding: "8px 11px", fontSize: 13, color: "#e2e8f0" }} />
                </div>
              ))}
              <div>
                <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</div>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Detailed description…" rows={3} style={{ width: "100%", background: "#1c2230", border: "1px solid #2d3748", borderRadius: 7, padding: "8px 11px", fontSize: 13, color: "#e2e8f0", resize: "vertical" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "Priority", key: "priority", opts: ["LOW","MEDIUM","HIGH"] },
                  { label: "Type",     key: "type",     opts: ["billing","membership","equipment","coaching","app","general","other"] },
                ].map(f => (
                  <div key={f.key}>
                    <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.label}</div>
                    <select value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: "100%", background: "#1c2230", border: "1px solid #2d3748", borderRadius: 7, padding: "8px 11px", fontSize: 13, color: "#e2e8f0", cursor: "pointer" }}>
                      {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <button onClick={createTicket} style={{ marginTop: 4, padding: "11px", borderRadius: 9, background: "#6366f1", color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer" }}>
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}