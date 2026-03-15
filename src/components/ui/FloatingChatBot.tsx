import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────
type Sender = "user" | "bot";
type CardType = "analytics" | "lead_form" | "assign" | "contact_action" | "lead_list";

interface CardData {
  type: CardType;
  payload?: Record<string, unknown>;
}

interface Message {
  id: string;
  sender: Sender;
  text: string;
  card?: CardData;
  streaming?: boolean;
}

// ─── Mock CRM Data ────────────────────────────────────────────────────────────
const MOCK_ANALYTICS = {
  totalLeads: 127,
  converted: 42,
  convRate: "33%",
  topSource: "Meta Ads",
  revenue: "₹21K",
  sources: [
    { name: "Meta Ads", volume: 9, converted: 3, share: 45 },
    { name: "WhatsApp", volume: 7, converted: 2, share: 30 },
    { name: "Walk-in", volume: 5, converted: 1, share: 25 },
  ],
  agents: [
    { name: "Ravi Kumar", leads: 34, closed: 14 },
    { name: "Priya S", leads: 28, closed: 11 },
    { name: "Arun M", leads: 22, closed: 9 },
  ],
};

const MOCK_LEADS = [
  { id: "L001", name: "Sanjay Mehta", source: "Meta Ads", status: "New", agent: "Ravi Kumar", phone: "+91 98765 43210" },
  { id: "L002", name: "Divya Rao", source: "WhatsApp", status: "Follow-up", agent: "Priya S", phone: "+91 87654 32109" },
  { id: "L003", name: "Kiran Patel", source: "Walk-in", status: "Converted", agent: "Arun M", phone: "+91 76543 21098" },
];

// ─── Intent Matcher ───────────────────────────────────────────────────────────
function detectIntent(text: string): string {
  const t = text.toLowerCase();
  if (/analytics|source|roi|performance|revenue|conversion|stats|report/.test(t)) return "analytics";
  if (/create|add|new lead|add lead/.test(t)) return "create_lead";
  if (/assign|transfer|move lead/.test(t)) return "assign_lead";
  if (/whatsapp|email|message|contact|send/.test(t)) return "contact_action";
  if (/leads|pipeline|list|show leads/.test(t)) return "show_leads";
  if (/dashboard/.test(t)) return "navigate_dashboard";
  if (/meeting|schedule|appointment/.test(t)) return "navigate_meetings";
  if (/deals/.test(t)) return "navigate_deals";
  if (/hello|hi|hey|start/.test(t)) return "greet";
  if (/help|what can you|options/.test(t)) return "help";
  return "unknown";
}

// ─── Mock Response Generator ──────────────────────────────────────────────────
function getMockResponse(intent: string, text: string): { text: string; card?: CardData } {
  switch (intent) {
    case "analytics":
      return {
        text: "Here's your current source analytics breakdown 📊",
        card: { type: "analytics", payload: MOCK_ANALYTICS },
      };
    case "create_lead":
      return {
        text: "Sure! Fill in the details below to create a new lead 🎯",
        card: { type: "lead_form" },
      };
    case "assign_lead":
      return {
        text: "Select a lead to assign to one of your agents 👥",
        card: { type: "assign", payload: { leads: MOCK_LEADS, agents: MOCK_ANALYTICS.agents } },
      };
    case "contact_action":
      return {
        text: "Choose a lead to reach out to 📲",
        card: { type: "contact_action", payload: { leads: MOCK_LEADS } },
      };
    case "show_leads":
      return {
        text: "Here are your recent leads 📋",
        card: { type: "lead_list", payload: { leads: MOCK_LEADS } },
      };
    case "greet":
      return { text: "Hey there! 👋 I'm ProCody, your CRM assistant. Ask me about analytics, leads, assignments, or use the quick actions. What can I help with?" };
    case "help":
      return { text: "I can help you with:\n• 📊 View source analytics & ROI\n• 🎯 Create or update leads\n• 👥 Assign leads to agents\n• 📲 Send WhatsApp or email to leads\n• 📋 Browse your leads pipeline\n• 🧭 Navigate to any CRM section" };
    case "navigate_dashboard":
      return { text: "Navigating to Dashboard... 🏠" };
    case "navigate_meetings":
      return { text: "Opening your Schedule... 📅" };
    case "navigate_deals":
      return { text: "Opening Deals Pipeline... 💼" };
    default: {
      const fallbacks = [
        "I don't have that data right now, but once the backend is live I'll pull it in real-time! Try asking about 'analytics', 'leads', or 'assign leads'.",
        "That's a great question! My full intelligence kicks in when the backend is connected. For now, try: 'show analytics' or 'create a lead'.",
        "I'm in prototype mode 🚧 — ask me about analytics, leads, or assignments and I'll show you what the live experience will look like.",
      ];
      return { text: fallbacks[Math.floor(Math.random() * fallbacks.length)] };
    }
  }
}

// ─── Streaming Simulation ─────────────────────────────────────────────────────
function streamText(
  fullText: string,
  onChunk: (partial: string) => void,
  onDone: () => void
) {
  let i = 0;
  const speed = 18;
  const tick = () => {
    if (i <= fullText.length) {
      onChunk(fullText.slice(0, i));
      i++;
      setTimeout(tick, speed);
    } else {
      onDone();
    }
  };
  tick();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const AnalyticsCard = ({ data }: { data: typeof MOCK_ANALYTICS }) => (
  <div style={styles.card}>
    <div style={styles.cardTitle}>📊 Source Analytics</div>
    <div style={styles.statsRow}>
      <div style={styles.statBox}><div style={styles.statVal}>{data.totalLeads}</div><div style={styles.statLbl}>Total Leads</div></div>
      <div style={styles.statBox}><div style={styles.statVal}>{data.convRate}</div><div style={styles.statLbl}>Conv. Rate</div></div>
      <div style={styles.statBox}><div style={styles.statVal}>{data.revenue}</div><div style={styles.statLbl}>Revenue</div></div>
    </div>
    {data.sources.map((s) => (
      <div key={s.name} style={styles.sourceRow}>
        <span style={styles.sourceName}>{s.name}</span>
        <div style={styles.barWrap}>
          <div style={{ ...styles.bar, width: `${s.share}%`, background: s.name === "Meta Ads" ? "#6366f1" : s.name === "WhatsApp" ? "#4ade80" : "#f59e0b" }} />
        </div>
        <span style={styles.shareVal}>{s.share}%</span>
      </div>
    ))}
    <div style={styles.agentSection}>
      <div style={styles.agentTitle}>Top Agents</div>
      {data.agents.map((a) => (
        <div key={a.name} style={styles.agentRow}>
          <span style={styles.agentAvatar}>{a.name.charAt(0)}</span>
          <span style={styles.agentName}>{a.name}</span>
          <span style={styles.agentStat}>{a.closed}/{a.leads} closed</span>
        </div>
      ))}
    </div>
  </div>
);

const LeadFormCard = ({ onSubmit }: { onSubmit: (msg: string) => void }) => {
  const [form, setForm] = useState({ name: "", phone: "", source: "Meta Ads", status: "New" });
  const [submitted, setSubmitted] = useState(false);
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const handleSubmit = () => {
    if (!form.name || !form.phone) return;
    setSubmitted(true);
    onSubmit(`✅ Lead **${form.name}** created successfully! Source: ${form.source}, Status: ${form.status}`);
  };
  if (submitted) return null;
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>🎯 Create New Lead</div>
      <input style={styles.input} placeholder="Full Name *" value={form.name} onChange={e => set("name", e.target.value)} />
      <input style={styles.input} placeholder="Phone Number *" value={form.phone} onChange={e => set("phone", e.target.value)} />
      <select style={styles.select} value={form.source} onChange={e => set("source", e.target.value)}>
        {["Meta Ads", "WhatsApp", "Walk-in", "Referral"].map(s => <option key={s}>{s}</option>)}
      </select>
      <select style={styles.select} value={form.status} onChange={e => set("status", e.target.value)}>
        {["New", "Follow-up", "Qualified", "Converted", "Lost"].map(s => <option key={s}>{s}</option>)}
      </select>
      <button style={styles.cardBtn} onClick={handleSubmit}>Create Lead →</button>
    </div>
  );
};

const AssignCard = ({ leads, agents, onSubmit }: { leads: typeof MOCK_LEADS; agents: typeof MOCK_ANALYTICS.agents; onSubmit: (msg: string) => void }) => {
  const [sel, setSel] = useState({ lead: leads[0].id, agent: agents[0].name });
  const [done, setDone] = useState(false);
  const handleAssign = () => {
    setDone(true);
    const lead = leads.find(l => l.id === sel.lead);
    onSubmit(`✅ Lead **${lead?.name}** has been assigned to **${sel.agent}** successfully!`);
  };
  if (done) return null;
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>👥 Assign Lead</div>
      <div style={styles.fieldLabel}>Select Lead</div>
      <select style={styles.select} value={sel.lead} onChange={e => setSel(p => ({ ...p, lead: e.target.value }))}>
        {leads.map(l => <option key={l.id} value={l.id}>{l.name} — {l.status}</option>)}
      </select>
      <div style={styles.fieldLabel}>Assign to Agent</div>
      <select style={styles.select} value={sel.agent} onChange={e => setSel(p => ({ ...p, agent: e.target.value }))}>
        {agents.map(a => <option key={a.name}>{a.name} ({a.leads} leads)</option>)}
      </select>
      <button style={styles.cardBtn} onClick={handleAssign}>Assign →</button>
    </div>
  );
};

const ContactActionCard = ({ leads, onSubmit }: { leads: typeof MOCK_LEADS; onSubmit: (msg: string) => void }) => {
  const [sel, setSel] = useState(leads[0].id);
  const handle = (method: string) => {
    const lead = leads.find(l => l.id === sel);
    onSubmit(`📤 ${method} message queued for **${lead?.name}** (${lead?.phone}). Will send once backend is connected!`);
  };
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>📲 Contact Lead</div>
      <select style={styles.select} value={sel} onChange={e => setSel(e.target.value)}>
        {leads.map(l => <option key={l.id} value={l.id}>{l.name} — {l.phone}</option>)}
      </select>
      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        <button style={{ ...styles.cardBtn, flex: 1, background: "rgba(74,222,128,0.15)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" }} onClick={() => handle("WhatsApp")}>
          WhatsApp
        </button>
        <button style={{ ...styles.cardBtn, flex: 1, background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }} onClick={() => handle("Email")}>
          Email
        </button>
      </div>
    </div>
  );
};

const LeadListCard = ({ leads }: { leads: typeof MOCK_LEADS }) => {
  const statusColor: Record<string, string> = { New: "#60a5fa", "Follow-up": "#f59e0b", Converted: "#4ade80", Lost: "#f87171" };
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>📋 Recent Leads</div>
      {leads.map(l => (
        <div key={l.id} style={styles.leadRow}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ ...styles.leadAvatar, background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>{l.name.charAt(0)}</div>
            <div>
              <div style={styles.leadName}>{l.name}</div>
              <div style={styles.leadMeta}>{l.source} · {l.agent}</div>
            </div>
          </div>
          <span style={{ ...styles.statusBadge, color: statusColor[l.status] || "#e0e4ff", borderColor: statusColor[l.status] || "#e0e4ff" }}>{l.status}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Styles object ────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  card: { background: "rgba(30,34,53,0.95)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "12px 13px", marginTop: 4, width: "100%" },
  cardTitle: { fontSize: 12, fontWeight: 700, color: "#a5b4fc", marginBottom: 10, letterSpacing: 0.3 },
  statsRow: { display: "flex", gap: 6, marginBottom: 10 },
  statBox: { flex: 1, background: "rgba(99,102,241,0.1)", borderRadius: 8, padding: "7px 8px", textAlign: "center" },
  statVal: { fontSize: 15, fontWeight: 700, color: "#e0e4ff" },
  statLbl: { fontSize: 10, color: "#4a5568", marginTop: 1 },
  sourceRow: { display: "flex", alignItems: "center", gap: 7, marginBottom: 6 },
  sourceName: { fontSize: 11, color: "#8892b0", width: 60, flexShrink: 0 },
  barWrap: { flex: 1, height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" },
  bar: { height: "100%", borderRadius: 3, transition: "width 0.6s ease" },
  shareVal: { fontSize: 11, color: "#6366f1", width: 30, textAlign: "right" },
  agentSection: { marginTop: 10, borderTop: "1px solid rgba(99,102,241,0.1)", paddingTop: 8 },
  agentTitle: { fontSize: 10, color: "#4a5568", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 },
  agentRow: { display: "flex", alignItems: "center", gap: 7, marginBottom: 5 },
  agentAvatar: { width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "white", flexShrink: 0 },
  agentName: { flex: 1, fontSize: 12, color: "#c7d2fe" },
  agentStat: { fontSize: 11, color: "#4a5568" },
  input: { width: "100%", background: "#13161f", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, color: "#e0e4ff", padding: "7px 10px", fontSize: 12.5, marginBottom: 6, outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  select: { width: "100%", background: "#13161f", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, color: "#a5b4fc", padding: "7px 10px", fontSize: 12.5, marginBottom: 6, outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  cardBtn: { width: "100%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 8, color: "white", padding: "8px", fontSize: 12.5, cursor: "pointer", marginTop: 4, fontFamily: "inherit" },
  fieldLabel: { fontSize: 10, color: "#4a5568", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.8 },
  leadRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(99,102,241,0.07)" },
  leadAvatar: { width: 26, height: 26, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "white", flexShrink: 0 },
  leadName: { fontSize: 12.5, color: "#e0e4ff", fontWeight: 500 },
  leadMeta: { fontSize: 11, color: "#4a5568", marginTop: 1 },
  statusBadge: { fontSize: 10, padding: "2px 7px", borderRadius: 10, border: "1px solid", background: "transparent" },
};

// ─── Chips & Options ──────────────────────────────────────────────────────────
const CHIPS = ["Show analytics", "Create a lead", "Assign lead", "Show leads list", "Contact a lead"];

const NAV_OPTIONS = [
  { label: "📊 Dashboard", path: "/dashboard" },
  { label: "🎯 Leads", path: "/leads" },
  { label: "💼 Deals", path: "/deals" },
  { label: "📅 Schedule", path: "/meetings" },
  { label: "📈 Reports", path: "/reports" },
  { label: "👥 Contacts", path: "/contacts" },
];

// ─── LocalStorage helpers ─────────────────────────────────────────────────────
const LS_KEY = "procody_chat_history";
const saveHistory = (msgs: Message[]) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(msgs.slice(-40))); } catch {}
};
const loadHistory = (): Message[] => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
};

// ─── Main Component ───────────────────────────────────────────────────────────
const FloatingChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [messages, setMessages] = useState<Message[]>(() => loadHistory());
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [unread, setUnread] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [greeted, setGreeted] = useState(() => loadHistory().length > 0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const navigate = useNavigate();

  // Theme tokens
  const t = isDark ? {
    bg: "#13161f", header: "linear-gradient(135deg,#1e2035,#252847)",
    msgBg: "#1e2235", inputBg: "#1a1d2e", inputRow: "#0d0f1a",
    text: "#e0e4ff", sub: "#4a5568", border: "rgba(99,102,241,0.18)",
    chipBg: "rgba(99,102,241,0.08)", chipColor: "#818cf8",
    optBg: "#1a1d2e", optColor: "#a5b4fc", minimizeBg: "#1a1d2e",
    shadow: "0 32px 80px rgba(0,0,0,0.6)",
  } : {
    bg: "#f8f9ff", header: "linear-gradient(135deg,#eef0ff,#e8ebff)",
    msgBg: "#ffffff", inputBg: "#ffffff", inputRow: "#f0f2ff",
    text: "#1e2035", sub: "#9ca3af", border: "rgba(99,102,241,0.2)",
    chipBg: "rgba(99,102,241,0.06)", chipColor: "#6366f1",
    optBg: "#f0f2ff", optColor: "#4f46e5", minimizeBg: "#eef0ff",
    shadow: "0 32px 80px rgba(99,102,241,0.12)",
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);
  useEffect(() => { if (messages.length) saveHistory(messages); }, [messages]);

  const uid = () => Math.random().toString(36).slice(2);

  const addMessage = useCallback((msg: Omit<Message, "id">) => {
    setMessages(prev => [...prev, { ...msg, id: uid() }]);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnread(0);
    if (!greeted) {
      setGreeted(true);
      setTimeout(() => {
        const welcomeId = uid();
        setMessages(prev => [...prev, { id: welcomeId, sender: "bot", text: "", streaming: true }]);
        streamText(
          "Hey 👋 I'm ProCody, your CRM assistant. I can show analytics, create leads, assign agents, and more. What do you need?",
          (partial) => setMessages(prev => prev.map(m => m.id === welcomeId ? { ...m, text: partial } : m)),
          () => {
            setMessages(prev => prev.map(m => m.id === welcomeId ? { ...m, streaming: false } : m));
            setShowOptions(true);
          }
        );
      }, 300);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const processMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;
    setInput("");
    setShowOptions(false);
    addMessage({ sender: "user", text });
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));

    const intent = detectIntent(text);

    // Handle navigation intents
    if (["navigate_dashboard", "navigate_meetings", "navigate_deals"].includes(intent)) {
      const paths: Record<string, string> = {
        navigate_dashboard: "/dashboard",
        navigate_meetings: "/meetings",
        navigate_deals: "/deals",
      };
      const resp = getMockResponse(intent, text);
      const botId = uid();
      setIsTyping(false);
      setMessages(prev => [...prev, { id: botId, sender: "bot", text: "", streaming: true }]);
      streamText(resp.text, (p) => setMessages(prev => prev.map(m => m.id === botId ? { ...m, text: p } : m)),
        () => {
          setMessages(prev => prev.map(m => m.id === botId ? { ...m, streaming: false } : m));
          setTimeout(() => navigate(paths[intent]), 800);
        });
      return;
    }

    const resp = getMockResponse(intent, text);
    const botId = uid();
    setIsTyping(false);
    setMessages(prev => [...prev, { id: botId, sender: "bot", text: "", streaming: true, card: resp.card }]);
    streamText(
      resp.text,
      (partial) => setMessages(prev => prev.map(m => m.id === botId ? { ...m, text: partial } : m)),
      () => {
        setMessages(prev => prev.map(m => m.id === botId ? { ...m, streaming: false } : m));
        if (!isOpen) setUnread(n => n + 1);
      }
    );
  };

  const handleCardAction = (msg: string) => {
    addMessage({ sender: "bot", text: msg });
  };

  const startVoice = () => {
    const SR = (window as Window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition || (window as Window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) return alert("Voice input not supported in this browser.");
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = false;
    recognitionRef.current = rec;
    setIsListening(true);
    rec.onresult = (e: SpeechRecognitionEvent) => { setInput(e.results[0][0].transcript); setIsListening(false); };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    rec.start();
  };

  const clearHistory = () => {
    setMessages([]);
    setGreeted(false);
    setShowOptions(false);
    try { localStorage.removeItem(LS_KEY); } catch {}
  };

  const renderCard = (card: CardData, msgId: string) => {
    switch (card.type) {
      case "analytics": return <AnalyticsCard data={MOCK_ANALYTICS} />;
      case "lead_form": return <LeadFormCard onSubmit={handleCardAction} />;
      case "assign": return <AssignCard leads={MOCK_LEADS} agents={MOCK_ANALYTICS.agents} onSubmit={handleCardAction} />;
      case "contact_action": return <ContactActionCard leads={MOCK_LEADS} onSubmit={handleCardAction} />;
      case "lead_list": return <LeadListCard leads={MOCK_LEADS} />;
      default: return null;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Space+Mono:wght@400;700&display=swap');

        .pchat-fab {
          position:fixed; bottom:24px; right:24px;
          width:56px; height:56px; border-radius:50%;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          border:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 8px 32px rgba(99,102,241,0.45);
          z-index:1000; transition:transform 0.2s;
          animation:pchat-pulse 2.5s ease-in-out infinite;
        }
        .pchat-fab:hover { transform:scale(1.1); }
        @keyframes pchat-pulse {
          0%,100% { box-shadow:0 8px 32px rgba(99,102,241,0.45),0 0 0 0 rgba(99,102,241,0.3); }
          50%      { box-shadow:0 8px 32px rgba(99,102,241,0.45),0 0 0 12px rgba(99,102,241,0); }
        }
        .pchat-badge {
          position:absolute; top:-3px; right:-3px;
          background:#ef4444; color:white; border-radius:50%;
          width:19px; height:19px; font-size:10px; font-weight:700;
          display:flex; align-items:center; justify-content:center;
          border:2px solid #0f1117; animation:pchat-badgepop 0.3s cubic-bezier(0.34,1.56,0.64,1);
          font-family:'DM Sans',sans-serif;
        }
        @keyframes pchat-badgepop { from{transform:scale(0)} to{transform:scale(1)} }

        .pchat-win {
          position:fixed; right:24px;
          width:370px; border-radius:20px;
          display:flex; flex-direction:column;
          z-index:999; overflow:hidden;
          font-family:'DM Sans',sans-serif;
          transform-origin:bottom right;
        }
        .pchat-win-open {
          bottom:92px; height:540px;
          animation:pchat-popin 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .pchat-win-min {
          bottom:92px; height:56px;
          animation:pchat-popin 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes pchat-popin {
          from{transform:scale(0.75) translateY(10px);opacity:0}
          to{transform:scale(1) translateY(0);opacity:1}
        }

        .pchat-header {
          padding:13px 16px; display:flex;
          align-items:center; gap:11px; flex-shrink:0;
          border-bottom:1px solid rgba(99,102,241,0.12);
        }
        .pchat-avatar {
          width:34px; height:34px; border-radius:10px;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          display:flex; align-items:center; justify-content:center;
          font-size:17px; flex-shrink:0;
        }
        .pchat-hname {
          font-family:'Space Mono',monospace;
          font-size:11.5px; font-weight:700; letter-spacing:0.5px;
        }
        .pchat-hstatus {
          font-size:10.5px; color:#4ade80;
          display:flex; align-items:center; gap:4px; margin-top:2px;
        }
        .pchat-dot {
          width:6px; height:6px; border-radius:50%; background:#4ade80;
          animation:pchat-blink 2s ease-in-out infinite;
        }
        @keyframes pchat-blink { 0%,100%{opacity:1} 50%{opacity:0.35} }
        .pchat-hbtn {
          background:rgba(255,255,255,0.06); border:none; cursor:pointer;
          width:27px; height:27px; border-radius:7px; font-size:13px;
          display:flex; align-items:center; justify-content:center;
          transition:background 0.15s, color 0.15s; color:#8892b0;
        }
        .pchat-hbtn:hover { background:rgba(99,102,241,0.15); color:#a5b4fc; }
        .pchat-hbtn.danger:hover { background:rgba(239,68,68,0.15); color:#f87171; }

        .pchat-messages {
          flex:1; overflow-y:auto; padding:14px 13px;
          display:flex; flex-direction:column; gap:10px; scroll-behavior:smooth;
        }
        .pchat-messages::-webkit-scrollbar { width:3px; }
        .pchat-messages::-webkit-scrollbar-thumb { background:rgba(99,102,241,0.25); border-radius:2px; }

        .pchat-msg { display:flex; gap:8px; animation:pchat-msgin 0.18s ease-out; }
        @keyframes pchat-msgin { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        .pchat-msg.user { flex-direction:row-reverse; }

        .pchat-mavatar {
          width:26px; height:26px; border-radius:7px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          font-size:13px; margin-top:2px;
        }
        .pchat-msg.bot  .pchat-mavatar { background:linear-gradient(135deg,#6366f1,#8b5cf6); }
        .pchat-msg.user .pchat-mavatar { background:linear-gradient(135deg,#0ea5e9,#2563eb); }

        .pchat-bubble {
          max-width:238px; padding:9px 13px; border-radius:14px;
          font-size:13.5px; line-height:1.55; white-space:pre-wrap;
        }
        .pchat-msg.bot .pchat-bubble  { border-bottom-left-radius:4px; }
        .pchat-msg.user .pchat-bubble {
          background:linear-gradient(135deg,#4f46e5,#6d28d9) !important;
          border-bottom-right-radius:4px; color:white !important;
          border:none !important;
        }

        .pchat-cursor {
          display:inline-block; width:2px; height:13px;
          background:#6366f1; margin-left:2px; vertical-align:middle;
          animation:pchat-cur 0.6s ease-in-out infinite;
        }
        @keyframes pchat-cur { 0%,100%{opacity:1} 50%{opacity:0} }

        .pchat-typing-row { display:flex; gap:8px; }
        .pchat-typing-bubble {
          display:flex; gap:4px; align-items:center;
          padding:10px 13px; border-radius:14px; border-bottom-left-radius:4px;
        }
        .pchat-typing-bubble span {
          width:6px; height:6px; border-radius:50%; background:#4a5568;
          animation:pchat-bounce 1.2s ease-in-out infinite;
        }
        .pchat-typing-bubble span:nth-child(2) { animation-delay:0.2s; }
        .pchat-typing-bubble span:nth-child(3) { animation-delay:0.4s; }
        @keyframes pchat-bounce {
          0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px);background:#6366f1}
        }

        .pchat-options { padding:0 13px 6px; }
        .pchat-opt-label {
          font-size:9.5px; text-transform:uppercase; letter-spacing:1px;
          color:#3d4462; font-family:'Space Mono',monospace; margin-bottom:5px;
        }
        .pchat-opt-grid { display:grid; grid-template-columns:1fr 1fr; gap:5px; }
        .pchat-opt-btn {
          border:1px solid rgba(99,102,241,0.2); padding:8px 9px;
          border-radius:9px; font-size:12px; cursor:pointer; text-align:left;
          transition:all 0.15s; font-family:'DM Sans',sans-serif;
        }
        .pchat-opt-btn:hover { border-color:rgba(99,102,241,0.45); }

        .pchat-chips { display:flex; flex-wrap:wrap; gap:5px; padding:0 13px 8px; }
        .pchat-chip {
          border:1px solid rgba(99,102,241,0.18); font-size:11.5px;
          padding:4px 10px; border-radius:20px; cursor:pointer;
          transition:all 0.15s; font-family:'DM Sans',sans-serif;
        }
        .pchat-chip:hover { border-color:rgba(99,102,241,0.4); }

        .pchat-inputrow {
          padding:10px 12px; border-top:1px solid rgba(99,102,241,0.1);
          display:flex; gap:7px; align-items:center; flex-shrink:0;
        }
        .pchat-inputwrap {
          flex:1; border:1px solid rgba(99,102,241,0.18); border-radius:11px;
          display:flex; align-items:center; padding:0 10px; transition:border-color 0.15s;
        }
        .pchat-inputwrap:focus-within { border-color:rgba(99,102,241,0.5); }
        .pchat-inputwrap input {
          background:none; border:none; outline:none;
          font-family:'DM Sans',sans-serif; font-size:13.5px;
          padding:9px 0; flex:1; width:100%;
        }
        .pchat-iconbtn {
          background:none; border:none; cursor:pointer; padding:4px;
          display:flex; align-items:center; justify-content:center;
          border-radius:6px; transition:background 0.15s;
        }
        .pchat-iconbtn:hover { background:rgba(99,102,241,0.12); }
        .pchat-iconbtn.listening { animation:pchat-micpulse 1s ease-in-out infinite; }
        @keyframes pchat-micpulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .pchat-send {
          width:35px; height:35px; border-radius:9px;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          border:none; cursor:pointer; display:flex;
          align-items:center; justify-content:center;
          transition:transform 0.15s, opacity 0.15s; flex-shrink:0;
        }
        .pchat-send:hover { transform:scale(1.06); }
        .pchat-send:disabled { opacity:0.45; cursor:not-allowed; transform:none; }
      `}</style>

      {/* ── FAB ── */}
      {!isOpen && (
        <button className="pchat-fab" onClick={handleOpen} aria-label="Open ProCody AI" style={{ position: "fixed" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.518 3.66 1.418 5.174L2 22l4.826-1.418A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
            <circle cx="8" cy="12" r="1" fill="white" stroke="none"/>
            <circle cx="12" cy="12" r="1" fill="white" stroke="none"/>
            <circle cx="16" cy="12" r="1" fill="white" stroke="none"/>
          </svg>
          {unread > 0 && <span className="pchat-badge">{unread}</span>}
        </button>
      )}

      {/* ── Chat Window ── */}
      {isOpen && (
        <div
          className={`pchat-win ${isMinimized ? "pchat-win-min" : "pchat-win-open"}`}
          style={{ background: t.bg, border: `1px solid ${t.border}`, boxShadow: t.shadow }}
        >
          {/* Header */}
          <div className="pchat-header" style={{ background: t.header }}>
            <div className="pchat-avatar">🤖</div>
            {!isMinimized && (
              <div style={{ flex: 1 }}>
                <div className="pchat-hname" style={{ color: t.text }}>PROCODY AI</div>
                <div className="pchat-hstatus"><span className="pchat-dot" /> Online · CRM Assistant</div>
              </div>
            )}
            {isMinimized && <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: t.text }}>ProCody AI</span>}
            <div style={{ display: "flex", gap: 5 }}>
              {/* Dark/Light toggle */}
              <button className="pchat-hbtn" onClick={() => setIsDark(d => !d)} title="Toggle theme">
                {isDark ? "☀️" : "🌙"}
              </button>
              {/* Clear history */}
              {!isMinimized && (
                <button className="pchat-hbtn danger" onClick={clearHistory} title="Clear chat">
                  🗑
                </button>
              )}
              {/* Minimize */}
              <button className="pchat-hbtn" onClick={() => setIsMinimized(m => !m)} title={isMinimized ? "Expand" : "Minimize"}>
                {isMinimized ? "▲" : "▼"}
              </button>
              {/* Close */}
              <button className="pchat-hbtn danger" onClick={() => setIsOpen(false)} title="Close">✕</button>
            </div>
          </div>

          {/* Body — hidden when minimized */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="pchat-messages">
                {messages.map((msg) => (
                  <div key={msg.id} className={`pchat-msg ${msg.sender}`}>
                    <div className="pchat-mavatar">{msg.sender === "bot" ? "🤖" : "👤"}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5, maxWidth: 250 }}>
                      <div
                        className="pchat-bubble"
                        style={{
                          background: msg.sender === "bot" ? t.msgBg : undefined,
                          color: msg.sender === "bot" ? t.text : undefined,
                          border: msg.sender === "bot" ? `1px solid ${t.border}` : undefined,
                        }}
                      >
                        {msg.text}
                        {msg.streaming && msg.text.length > 0 && <span className="pchat-cursor" />}
                      </div>
                      {msg.card && !msg.streaming && renderCard(msg.card, msg.id)}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="pchat-typing-row">
                    <div className="pchat-mavatar" style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🤖</div>
                    <div className="pchat-typing-bubble" style={{ background: t.msgBg, border: `1px solid ${t.border}` }}>
                      <span /><span /><span />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Nav Options */}
              {showOptions && (
                <div className="pchat-options">
                  <div className="pchat-opt-label">Navigate to</div>
                  <div className="pchat-opt-grid">
                    {NAV_OPTIONS.map((opt) => (
                      <button
                        key={opt.path}
                        className="pchat-opt-btn"
                        style={{ background: t.optBg, color: t.optColor }}
                        onClick={() => { setShowOptions(false); navigate(opt.path); }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestion Chips */}
              {!showOptions && messages.length > 0 && (
                <div className="pchat-chips">
                  {CHIPS.map((c) => (
                    <span
                      key={c}
                      className="pchat-chip"
                      style={{ background: t.chipBg, color: t.chipColor }}
                      onClick={() => processMessage(c)}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="pchat-inputrow" style={{ background: t.inputRow }}>
                <div className="pchat-inputwrap" style={{ background: t.inputBg }}>
                  <input
                    ref={inputRef}
                    value={input}
                    placeholder="Ask ProCody anything..."
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && processMessage(input)}
                    style={{ color: t.text }}
                  />
                  {/* Voice button */}
                  <button
                    className={`pchat-iconbtn ${isListening ? "listening" : ""}`}
                    onClick={startVoice}
                    title="Voice input"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={isListening ? "#ef4444" : t.sub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="2" width="6" height="12" rx="3"/>
                      <path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6"/>
                    </svg>
                  </button>
                </div>
                <button className="pchat-send" onClick={() => processMessage(input)} disabled={isTyping || !input.trim()}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default FloatingChatBot;