// ============================================================
// MemberSupportPortal.tsx
// Public-facing member support page — no auth required.
// Route: /member-support
// Uses real ticketStore (localStorage) — same as agent TicketsPage.
// ============================================================

import { useState, useRef } from "react";
import { getTickets, addTicket, addComment } from "../store/ticketStore";
import type { Ticket, Comment } from "../types/ticket.types";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Category = "BILLING" | "MEMBERSHIP" | "EQUIPMENT" | "COACHING" | "APP" | "OTHER";
type Priority  = "LOW" | "MEDIUM" | "HIGH";
type Screen    = "home" | "submit" | "track" | "detail" | "success";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CATEGORIES: { value: Category; label: string; icon: string; desc: string }[] = [
  { value: "BILLING",    label: "Billing",    icon: "💳", desc: "Payment issues, invoices, refunds"  },
  { value: "MEMBERSHIP", label: "Membership", icon: "🏷️", desc: "Renewals, upgrades, freezes"         },
  { value: "EQUIPMENT",  label: "Equipment",  icon: "🏋️", desc: "Machine issues, facility problems"  },
  { value: "COACHING",   label: "Coaching",   icon: "🎯", desc: "Trainer issues, session scheduling" },
  { value: "APP",        label: "App / Tech", icon: "📱", desc: "Login, app bugs, access issues"     },
  { value: "OTHER",      label: "Other",      icon: "💬", desc: "Anything else"                      },
];

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  NEW:         { label: "Submitted",   color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  icon: "🕐" },
  IN_PROGRESS: { label: "In Progress", color: "#60a5fa", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)",  icon: "⚙️" },
  RESOLVED:    { label: "Resolved",    color: "#34d399", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)",  icon: "✅" },
};

// Agent is identified by author NOT containing "@" — agents use names, members use emails
const isAgent = (author: string) => !author.includes("@");

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function MemberSupportPortal() {
  const [screen, setScreen]                 = useState<Screen>("home");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText]           = useState("");
  const [trackEmail, setTrackEmail]         = useState("");
  const [trackPhone, setTrackPhone]         = useState("");
  const [trackError, setTrackError]         = useState("");
  const [myTickets, setMyTickets]           = useState<Ticket[]>([]);
  const [newTicketId, setNewTicketId]       = useState("");
  const [step, setStep]                     = useState(1);
  const [formError, setFormError]           = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    category: "" as Category | "",
    title: "", description: "",
    priority: "MEDIUM" as Priority,
  });

  const resetForm = () => {
    setForm({ name: "", email: "", phone: "", category: "", title: "", description: "", priority: "MEDIUM" });
    setStep(1);
    setFormError("");
  };

  const goHome = () => {
    setScreen("home");
    resetForm();
    setTrackEmail(""); setTrackPhone(""); setTrackError("");
    setMyTickets([]); setSelectedTicket(null);
  };

  // ── Submit → writes to shared localStorage via ticketStore ──
  const submitTicket = () => {
    if (!form.name || !form.email || !form.category || !form.title || !form.description) {
      setFormError("Please fill in all required fields.");
      return;
    }

    // Embed member info into description so agent can see name/phone
    // Email goes into createdBy for tracking lookups
    const fullDescription =
      `[Member: ${form.name}${form.phone ? ` | Phone: ${form.phone}` : ""}]\n\n${form.description}`;

    addTicket({
      title:       form.title,
      description: fullDescription,
      priority:    form.priority,
      type:        form.category.toLowerCase(), // e.g. "billing", "membership"
      createdBy:   form.email,                  // used to find tickets later
    });

    // Grab the ticket just added (addTicket unshifts, so index 0)
    const justAdded = getTickets()[0];
    setNewTicketId(justAdded?.id ?? Date.now().toString());
    setScreen("success");
    resetForm();
  };

  // ── Track → filter localStorage tickets by email or phone ──
  const trackTickets = () => {
    if (!trackEmail && !trackPhone) {
      setTrackError("Enter your email or phone number.");
      return;
    }
    const found = getTickets().filter((t) => {
      if (trackEmail && t.createdBy === trackEmail) return true;
      if (trackPhone && t.description.includes(trackPhone)) return true;
      return false;
    });
    if (found.length === 0) {
      setTrackError("No tickets found. Check your email or phone number.");
      return;
    }
    setTrackError("");
    setMyTickets(found);
  };

  // ── Reply → addComment with member's email as author ──
  const sendReply = () => {
    if (!replyText.trim() || !selectedTicket) return;

    // Comment shape matches your exact Comment type:
    // { id, message, author, createdAt }
    const comment: Comment = {
      id:        Date.now().toString(),
      message:   replyText,                          // ← your field is "message" not "text"
      author:    selectedTicket.createdBy || "Member", // email → identified as member
      createdAt: new Date().toISOString(),            // ← your field is "createdAt" not "timestamp"
    };

    addComment(selectedTicket.id, comment);

    // Re-read from store so UI reflects the saved state
    const refreshed = getTickets().find((t) => t.id === selectedTicket.id);
    if (refreshed) {
      setSelectedTicket(refreshed);
      setMyTickets((prev) => prev.map((t) => (t.id === refreshed.id ? refreshed : t)));
    }

    setReplyText("");
    setTimeout(() => chatRef.current?.scrollTo({ top: 9999, behavior: "smooth" }), 50);
  };

  const openTicket = (t: Ticket) => {
    // Always fetch fresh copy from store
    const fresh = getTickets().find((x) => x.id === t.id) || t;
    setSelectedTicket(fresh);
    setScreen("detail");
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", color: "#e2e8f0", fontFamily: "'Outfit', 'DM Sans', system-ui, sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2d3748; border-radius: 4px; }
        input, textarea { outline: none; font-family: inherit; }
        input::placeholder, textarea::placeholder { color: #374151; }
        button { cursor: pointer; font-family: inherit; }

        .grid-bg {
          position: fixed; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .glow-orb { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
        .portal-card { background: rgba(15,20,35,0.85); border: 1px solid rgba(99,102,241,0.15); border-radius: 20px; backdrop-filter: blur(12px); }
        .fade-up { animation: fadeUp 0.28s ease both; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }

        .cat-card { transition: all 0.16s; cursor: pointer; border-radius: 12px; border: 1.5px solid rgba(99,102,241,0.12); background: rgba(99,102,241,0.04); padding: 12px 10px; }
        .cat-card:hover { border-color: rgba(99,102,241,0.4); background: rgba(99,102,241,0.1); transform: translateY(-2px); }
        .cat-card.selected { border-color: #6366f1; background: rgba(99,102,241,0.15); }

        .btn-primary { background: linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; border:none; border-radius:10px; padding:12px 28px; font-size:14px; font-weight:600; transition:all 0.18s; }
        .btn-primary:hover:not(:disabled) { opacity:0.9; transform:translateY(-1px); box-shadow:0 8px 24px rgba(99,102,241,0.35); }
        .btn-primary:disabled { opacity:0.4; cursor:default; }
        .btn-secondary { background:rgba(99,102,241,0.08); color:#a5b4fc; border:1px solid rgba(99,102,241,0.2); border-radius:10px; padding:11px 24px; font-size:14px; font-weight:500; transition:all 0.18s; }
        .btn-secondary:hover { background:rgba(99,102,241,0.14); }

        .field-label { font-size:11px; color:#64748b; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:6px; display:block; }
        .field-input { width:100%; background:rgba(99,102,241,0.05); border:1px solid rgba(99,102,241,0.15); border-radius:10px; padding:11px 14px; font-size:14px; color:#e2e8f0; transition:border-color 0.15s; }
        .field-input:focus { border-color:#6366f1; background:rgba(99,102,241,0.08); outline:none; }

        .ticket-item { background:rgba(15,20,35,0.6); border:1px solid rgba(99,102,241,0.1); border-radius:12px; padding:14px 16px; cursor:pointer; transition:all 0.15s; }
        .ticket-item:hover { border-color:rgba(99,102,241,0.3); background:rgba(99,102,241,0.06); }

        .step-dot { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; transition:all 0.2s; flex-shrink:0; }
        .step-line { flex:1; height:1px; }

        .err-box { color:#ef4444; font-size:12px; background:rgba(239,68,68,0.08); padding:8px 12px; border-radius:7px; border:1px solid rgba(239,68,68,0.15); }
      `}</style>

      <div className="grid-bg" />
      <div className="glow-orb" style={{ width:500, height:500, background:"rgba(99,102,241,0.12)", top:-120, right:-100 }} />
      <div className="glow-orb" style={{ width:400, height:400, background:"rgba(139,92,246,0.08)", bottom:-80, left:-80 }} />

      {/* ── TOPBAR ── */}
      <div style={{ position:"relative", zIndex:10, padding:"16px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(99,102,241,0.1)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>💪</div>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:"#f1f5f9" }}>ProtonCode</div>
            <div style={{ fontSize:10, color:"#4a5568", fontWeight:500 }}>Member Support</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {screen !== "home" && (
            <button className="btn-secondary" onClick={goHome} style={{ padding:"7px 14px", fontSize:12 }}>← Back to Home</button>
          )}
          {screen === "home" && (
            <button className="btn-secondary" onClick={() => { setScreen("track"); setMyTickets([]); setTrackError(""); }} style={{ padding:"7px 14px", fontSize:12 }}>
              Track My Tickets
            </button>
          )}
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <div style={{ position:"relative", zIndex:10, maxWidth:720, margin:"0 auto", padding:"40px 24px 80px" }}>

        {/* ════ HOME ════ */}
        {screen === "home" && (
          <div className="fade-up">
            <div style={{ textAlign:"center", marginBottom:48 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:20, padding:"5px 14px", fontSize:11, color:"#a5b4fc", fontWeight:600, marginBottom:20, textTransform:"uppercase", letterSpacing:"0.08em" }}>
                🟢 Support · Mon–Sat 6AM–10PM
              </div>
              <h1 style={{ fontSize:42, fontWeight:800, color:"#f8fafc", letterSpacing:"-0.03em", lineHeight:1.15, marginBottom:14 }}>
                How can we<br />
                <span style={{ background:"linear-gradient(135deg,#6366f1,#a78bfa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>help you today?</span>
              </h1>
              <p style={{ fontSize:16, color:"#64748b", lineHeight:1.7, maxWidth:440, margin:"0 auto" }}>
                Submit a support request or track your existing tickets. We typically respond within 2 hours.
              </p>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:32 }}>
              {/* Submit card */}
              <button onClick={() => setScreen("submit")}
                style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.1))", border:"1px solid rgba(99,102,241,0.25)", borderRadius:16, padding:"28px 24px", textAlign:"left", transition:"all 0.2s", cursor:"pointer" }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 12px 32px rgba(99,102,241,0.2)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
                <div style={{ fontSize:36, marginBottom:14 }}>🎫</div>
                <div style={{ fontSize:17, fontWeight:700, color:"#f1f5f9", marginBottom:6 }}>Submit a Ticket</div>
                <div style={{ fontSize:13, color:"#64748b", lineHeight:1.5 }}>Report an issue, request a refund, or ask for help with your membership.</div>
                <div style={{ marginTop:18, fontSize:13, color:"#818cf8", fontWeight:600 }}>Get Started →</div>
              </button>

              {/* Track card */}
              <button onClick={() => { setScreen("track"); setMyTickets([]); setTrackError(""); }}
                style={{ background:"rgba(15,20,35,0.6)", border:"1px solid rgba(99,102,241,0.15)", borderRadius:16, padding:"28px 24px", textAlign:"left", transition:"all 0.2s", cursor:"pointer" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(99,102,241,0.3)"; e.currentTarget.style.transform="translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(99,102,241,0.15)"; e.currentTarget.style.transform="none"; }}>
                <div style={{ fontSize:36, marginBottom:14 }}>🔍</div>
                <div style={{ fontSize:17, fontWeight:700, color:"#f1f5f9", marginBottom:6 }}>Track My Tickets</div>
                <div style={{ fontSize:13, color:"#64748b", lineHeight:1.5 }}>Check status of your existing requests using your email or phone number.</div>
                <div style={{ marginTop:18, fontSize:13, color:"#64748b", fontWeight:600 }}>View Tickets →</div>
              </button>
            </div>

            {/* Quick pills */}
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, color:"#4a5568", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>Common Requests</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {[
                  { icon:"💳", label:"Payment not reflecting" },
                  { icon:"🔄", label:"Renew membership"       },
                  { icon:"❄️", label:"Freeze membership"      },
                  { icon:"🏋️", label:"Equipment issue"        },
                  { icon:"🎯", label:"Change trainer"         },
                  { icon:"📱", label:"App not working"        },
                ].map(q => (
                  <button key={q.label}
                    onClick={() => { setForm(p => ({ ...p, title: q.label })); setScreen("submit"); }}
                    style={{ display:"flex", alignItems:"center", gap:7, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.12)", borderRadius:20, padding:"7px 14px", fontSize:12, color:"#94a3b8", fontWeight:500, transition:"all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.color="#a5b4fc"; e.currentTarget.style.borderColor="rgba(99,102,241,0.3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color="#94a3b8"; e.currentTarget.style.borderColor="rgba(99,102,241,0.12)"; }}>
                    {q.icon} {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display:"flex", gap:16, marginTop:28 }}>
              {[
                { icon:"⚡", label:"Avg Response",   value:"< 2 hrs"         },
                { icon:"✅", label:"Resolution Rate", value:"97%"             },
                { icon:"📞", label:"Direct Call",    value:"+91 98765 43210" },
              ].map(s => (
                <div key={s.label} style={{ flex:1, background:"rgba(15,20,35,0.5)", border:"1px solid rgba(99,102,241,0.08)", borderRadius:10, padding:"12px 14px", textAlign:"center" }}>
                  <div style={{ fontSize:18, marginBottom:4 }}>{s.icon}</div>
                  <div style={{ fontSize:14, fontWeight:700, color:"#f1f5f9" }}>{s.value}</div>
                  <div style={{ fontSize:10, color:"#4a5568", marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ SUBMIT — 3-step wizard ════ */}
        {screen === "submit" && (
          <div className="fade-up">
            <div style={{ marginBottom:28 }}>
              <h2 style={{ fontSize:26, fontWeight:800, color:"#f1f5f9", letterSpacing:"-0.02em", marginBottom:6 }}>Submit a Support Ticket</h2>
              <p style={{ fontSize:13, color:"#64748b" }}>Fill in the details below. We'll get back to you within 2 hours.</p>
            </div>

            {/* Steps */}
            <div style={{ display:"flex", alignItems:"center", marginBottom:32 }}>
              {[1,2,3].map((s, i) => (
                <div key={s} style={{ display:"flex", alignItems:"center", flex: i < 2 ? 1 : undefined }}>
                  <div className="step-dot" style={{ background: step >= s ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(99,102,241,0.1)", color: step >= s ? "#fff" : "#4a5568", border: step === s ? "2px solid #6366f1" : "2px solid transparent" }}>
                    {step > s ? "✓" : s}
                  </div>
                  {i < 2 && <div className="step-line" style={{ background: step > s ? "rgba(99,102,241,0.4)" : "rgba(99,102,241,0.12)" }} />}
                </div>
              ))}
              <div style={{ marginLeft:12, fontSize:12, color:"#64748b", fontWeight:500, flexShrink:0 }}>
                {step === 1 ? "Your Info" : step === 2 ? "Issue Details" : "Review & Submit"}
              </div>
            </div>

            <div className="portal-card" style={{ padding:28 }}>

              {/* Step 1 */}
              {step === 1 && (
                <div className="fade-up" style={{ display:"flex", flexDirection:"column", gap:18 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:"#f1f5f9" }}>Your Contact Information</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                    <div>
                      <label className="field-label">Full Name *</label>
                      <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Arjun Sharma" className="field-input" />
                    </div>
                    <div>
                      <label className="field-label">Phone Number</label>
                      <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="9876543210" className="field-input" />
                    </div>
                  </div>
                  <div>
                    <label className="field-label">Email Address *</label>
                    <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" type="email" className="field-input" />
                    <div style={{ fontSize:11, color:"#4a5568", marginTop:5 }}>Used to track your tickets later</div>
                  </div>
                  {formError && <div className="err-box">{formError}</div>}
                  <div style={{ display:"flex", justifyContent:"flex-end" }}>
                    <button className="btn-primary" onClick={() => { if (!form.name || !form.email) { setFormError("Name and email are required."); return; } setFormError(""); setStep(2); }}>
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="fade-up" style={{ display:"flex", flexDirection:"column", gap:20 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:"#f1f5f9" }}>What's the issue about?</div>

                  <div>
                    <label className="field-label" style={{ marginBottom:10 }}>Category *</label>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                      {CATEGORIES.map(cat => (
                        <div key={cat.value} className={`cat-card${form.category === cat.value ? " selected" : ""}`} onClick={() => setForm(p => ({ ...p, category: cat.value }))}>
                          <div style={{ fontSize:22, marginBottom:5 }}>{cat.icon}</div>
                          <div style={{ fontSize:12, fontWeight:600, color:"#e2e8f0" }}>{cat.label}</div>
                          <div style={{ fontSize:10, color:"#4a5568", marginTop:2, lineHeight:1.4 }}>{cat.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="field-label">Subject *</label>
                    <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Brief description of your issue" className="field-input" />
                  </div>

                  <div>
                    <label className="field-label">Describe the Issue *</label>
                    <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Provide as much detail as possible — transaction IDs, dates, what happened…" rows={4} className="field-input" style={{ resize:"vertical", lineHeight:1.6 }} />
                  </div>

                  <div>
                    <label className="field-label">Priority</label>
                    <div style={{ display:"flex", gap:8 }}>
                      {(["LOW","MEDIUM","HIGH"] as Priority[]).map(p => (
                        <button key={p} onClick={() => setForm(prev => ({ ...prev, priority: p }))}
                          style={{ flex:1, padding:"8px 4px", borderRadius:8, border:"1px solid", cursor:"pointer", fontSize:12, fontWeight:600, transition:"all 0.15s",
                            borderColor: form.priority === p ? ({ LOW:"#64748b", MEDIUM:"#60a5fa", HIGH:"#f97316" }[p]) : "rgba(99,102,241,0.15)",
                            background:  form.priority === p ? "rgba(99,102,241,0.12)" : "transparent",
                            color:       form.priority === p ? ({ LOW:"#94a3b8", MEDIUM:"#60a5fa", HIGH:"#f97316" }[p]) : "#4a5568",
                          }}>
                          {p === "LOW" ? "🔵 Low" : p === "MEDIUM" ? "🟡 Medium" : "🟠 High"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formError && <div className="err-box">{formError}</div>}
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <button className="btn-secondary" onClick={() => { setStep(1); setFormError(""); }}>← Back</button>
                    <button className="btn-primary" onClick={() => { if (!form.category || !form.title || !form.description) { setFormError("Please fill all required fields."); return; } setFormError(""); setStep(3); }}>
                      Review →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 — Review */}
              {step === 3 && (
                <div className="fade-up" style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:"#f1f5f9" }}>Review your ticket</div>
                  {[
                    { label:"Name",        value: form.name },
                    { label:"Email",       value: form.email },
                    { label:"Phone",       value: form.phone || "—" },
                    { label:"Category",    value: `${CATEGORIES.find(c => c.value === form.category)?.icon} ${CATEGORIES.find(c => c.value === form.category)?.label}` },
                    { label:"Subject",     value: form.title },
                    { label:"Priority",    value: form.priority },
                    { label:"Description", value: form.description },
                  ].map(row => (
                    <div key={row.label} style={{ display:"grid", gridTemplateColumns:"110px 1fr", gap:12, paddingBottom:12, borderBottom:"1px solid rgba(99,102,241,0.08)" }}>
                      <span style={{ fontSize:11, color:"#4a5568", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>{row.label}</span>
                      <span style={{ fontSize:13, color:"#e2e8f0", lineHeight:1.6 }}>{row.value}</span>
                    </div>
                  ))}
                  <div style={{ background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.15)", borderRadius:10, padding:"12px 14px", fontSize:12, color:"#64748b", marginTop:4 }}>
                    📧 Track this ticket anytime using your email <strong style={{ color:"#a5b4fc" }}>{form.email}</strong> on this page.
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                    <button className="btn-secondary" onClick={() => setStep(2)}>← Edit</button>
                    <button className="btn-primary" onClick={submitTicket}>Submit Ticket 🚀</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════ SUCCESS ════ */}
        {screen === "success" && (
          <div className="fade-up" style={{ textAlign:"center", paddingTop:40 }}>
            <div style={{ fontSize:72, marginBottom:20 }}>🎉</div>
            <h2 style={{ fontSize:28, fontWeight:800, color:"#f1f5f9", letterSpacing:"-0.02em", marginBottom:10 }}>Ticket Submitted!</h2>
            <p style={{ fontSize:15, color:"#64748b", marginBottom:8 }}>Your ticket ID is</p>
            <div style={{ display:"inline-block", background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.25)", borderRadius:10, padding:"8px 20px", fontSize:18, fontWeight:700, color:"#a5b4fc", fontFamily:"monospace", marginBottom:24 }}>
              #{newTicketId.slice(-8)}
            </div>
            <p style={{ fontSize:14, color:"#64748b", maxWidth:400, margin:"0 auto 32px", lineHeight:1.7 }}>
              Our support team will respond within <strong style={{ color:"#e2e8f0" }}>2 hours</strong> during working hours (Mon–Sat, 6AM–10PM).
            </p>
            <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
              <button className="btn-primary" onClick={() => { setTrackEmail(""); setScreen("track"); setMyTickets([]); setTrackError(""); }}>Track My Ticket</button>
              <button className="btn-secondary" onClick={goHome}>Back to Home</button>
            </div>
          </div>
        )}

        {/* ════ TRACK — search form ════ */}
        {screen === "track" && myTickets.length === 0 && (
          <div className="fade-up">
            <div style={{ marginBottom:28 }}>
              <h2 style={{ fontSize:26, fontWeight:800, color:"#f1f5f9", letterSpacing:"-0.02em", marginBottom:6 }}>Track Your Tickets</h2>
              <p style={{ fontSize:13, color:"#64748b" }}>Enter the email or phone number you used when submitting.</p>
            </div>
            <div className="portal-card" style={{ padding:28, maxWidth:440 }}>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div>
                  <label className="field-label">Email Address</label>
                  <input value={trackEmail} onChange={e => { setTrackEmail(e.target.value); setTrackError(""); }} placeholder="your@email.com" type="email" className="field-input" onKeyDown={e => e.key === "Enter" && trackTickets()} />
                </div>
                <div style={{ textAlign:"center", fontSize:12, color:"#4a5568" }}>— or —</div>
                <div>
                  <label className="field-label">Phone Number</label>
                  <input value={trackPhone} onChange={e => { setTrackPhone(e.target.value); setTrackError(""); }} placeholder="9876543210" className="field-input" onKeyDown={e => e.key === "Enter" && trackTickets()} />
                </div>
                {trackError && <div className="err-box">{trackError}</div>}
                <button className="btn-primary" onClick={trackTickets} style={{ width:"100%" }}>
                  Find My Tickets →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════ TICKET LIST ════ */}
        {screen === "track" && myTickets.length > 0 && (
          <div className="fade-up">
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <div>
                <h2 style={{ fontSize:20, fontWeight:700, color:"#f1f5f9" }}>Your Tickets</h2>
                <p style={{ fontSize:12, color:"#64748b", marginTop:2 }}>{myTickets.length} ticket{myTickets.length !== 1 ? "s" : ""} found</p>
              </div>
              <button className="btn-secondary" onClick={() => setMyTickets([])} style={{ fontSize:12, padding:"6px 12px" }}>Search Again</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {myTickets.map(t => {
                const cfg = STATUS_CFG[t.status] ?? STATUS_CFG.NEW;
                return (
                  <div key={t.id} className="ticket-item" onClick={() => openTicket(t)}>
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5, flexWrap:"wrap" }}>
                          <span style={{ fontSize:10, fontFamily:"monospace", color:"#4a5568" }}>#{t.id.slice(-8)}</span>
                          <span style={{ fontSize:11, padding:"2px 9px", borderRadius:5, fontWeight:600, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>
                            {cfg.icon} {cfg.label}
                          </span>
                          {t.type && (
                            <span style={{ fontSize:10, padding:"2px 7px", borderRadius:4, background:"rgba(99,102,241,0.08)", color:"#64748b", border:"1px solid rgba(99,102,241,0.12)", textTransform:"uppercase" }}>
                              {t.type}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize:14, fontWeight:600, color:"#e2e8f0", marginBottom:4 }}>{t.title}</div>
                        <div style={{ fontSize:12, color:"#4a5568" }}>
                          Updated {timeAgo(t.updatedAt)} · {t.comments.length} message{t.comments.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <span style={{ color:"#4a5568", fontSize:18, flexShrink:0 }}>›</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════ TICKET DETAIL ════ */}
        {screen === "detail" && selectedTicket && (() => {
          const cfg = STATUS_CFG[selectedTicket.status] ?? STATUS_CFG.NEW;
          return (
            <div className="fade-up">
              <div style={{ marginBottom:20 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <span style={{ fontSize:10, fontFamily:"monospace", color:"#4a5568" }}>#{selectedTicket.id.slice(-8)}</span>
                  <span style={{ fontSize:11, padding:"3px 10px", borderRadius:5, fontWeight:600, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>
                <h2 style={{ fontSize:20, fontWeight:700, color:"#f1f5f9", lineHeight:1.4 }}>{selectedTicket.title}</h2>
                <div style={{ fontSize:12, color:"#4a5568", marginTop:4 }}>
                  Submitted {timeAgo(selectedTicket.createdAt)} · Last updated {timeAgo(selectedTicket.updatedAt)}
                </div>
              </div>

              <div className="portal-card" style={{ padding:0, overflow:"hidden" }}>
                <div style={{ padding:"12px 18px", borderBottom:"1px solid rgba(99,102,241,0.1)", fontSize:12, color:"#64748b", fontWeight:600 }}>
                  💬 Conversation · {selectedTicket.comments.length + 1} messages
                </div>

                <div ref={chatRef} style={{ padding:"16px 18px", display:"flex", flexDirection:"column", gap:12, maxHeight:420, overflowY:"auto" }}>

                  {/* Original description — always member bubble */}
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end" }}>
                    <div style={{ fontSize:10, color:"#4a5568", marginBottom:3 }}>You · {timeAgo(selectedTicket.createdAt)}</div>
                    <div style={{ background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:"12px 4px 12px 12px", padding:"10px 14px", maxWidth:"80%", fontSize:13, color:"#e2e8f0", lineHeight:1.65 }}>
                      {selectedTicket.description}
                    </div>
                  </div>

                  {/* Comments from store — Comment type: { id, message, author, createdAt } */}
                  {selectedTicket.comments.map((c: Comment) => {
                    const fromAgent = isAgent(c.author);
                    return (
                      <div key={c.id} style={{ display:"flex", flexDirection:"column", alignItems: fromAgent ? "flex-start" : "flex-end" }}>
                        <div style={{ fontSize:10, color:"#4a5568", marginBottom:3 }}>
                          {fromAgent ? c.author : "You"} · {timeAgo(c.createdAt)}
                        </div>
                        <div style={{
                          background:  fromAgent ? "rgba(16,185,129,0.08)"  : "rgba(99,102,241,0.12)",
                          border:      `1px solid ${fromAgent ? "rgba(16,185,129,0.2)" : "rgba(99,102,241,0.2)"}`,
                          borderRadius: fromAgent ? "4px 12px 12px 12px"   : "12px 4px 12px 12px",
                          padding:"10px 14px", maxWidth:"80%", fontSize:13, color:"#e2e8f0", lineHeight:1.65,
                        }}>
                          {fromAgent && <div style={{ fontSize:10, color:"#34d399", fontWeight:600, marginBottom:4 }}>🎧 Support Agent</div>}
                          {c.message}  {/* ← "message" field from your Comment type */}
                        </div>
                      </div>
                    );
                  })}

                  {selectedTicket.comments.length === 0 && (
                    <div style={{ textAlign:"center", color:"#4a5568", fontSize:13, padding:"20px 0" }}>
                      Our team will reply here shortly.
                    </div>
                  )}
                </div>

                {/* Reply box — only if not resolved */}
                {selectedTicket.status !== "RESOLVED" && (
                  <div style={{ padding:"12px 18px", borderTop:"1px solid rgba(99,102,241,0.1)", display:"flex", gap:10, alignItems:"flex-end" }}>
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                      placeholder="Add more details or reply… (Enter to send)"
                      rows={2}
                      className="field-input"
                      style={{ flex:1, resize:"none", lineHeight:1.5 }}
                    />
                    <button onClick={sendReply} disabled={!replyText.trim()} className="btn-primary" style={{ padding:"10px 16px" }}>
                      Send
                    </button>
                  </div>
                )}

                {selectedTicket.status === "RESOLVED" && (
                  <div style={{ padding:"12px 18px", borderTop:"1px solid rgba(99,102,241,0.1)", textAlign:"center", fontSize:13, color:"#34d399" }}>
                    ✅ This ticket has been resolved. If the issue persists, please submit a new ticket.
                  </div>
                )}
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}