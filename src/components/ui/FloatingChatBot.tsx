// features/ai/FloatingChatBot.tsx
// Proton AI — floating CRM assistant.
// 100% Tailwind CSS — the only <style> block is 8 @keyframe definitions
// that Tailwind cannot express at runtime (nth-child animation-delays, custom bezier curves).

import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import { useUser, useRole } from "../../store/useAuthStore";
import {
  MOCK_LEADS, MOCK_TASKS, MOCK_TRIALS,
  REPORT_METRICS, LEAD_CHART_DATA, SOURCE_CHART_DATA,
} from "../../data/mockData";

// ─── SpeechRecognition types ─────────────────────────────
interface ISpeechRecognition extends EventTarget {
  lang: string; interimResults: boolean;
  onresult: ((e: ISpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null; onend: (() => void) | null;
  start(): void; stop(): void;
}
interface ISpeechRecognitionEvent { results: { 0: { 0: { transcript: string } } }; }
interface SpeechRecognitionConstructor { new(): ISpeechRecognition; }
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

// ─── Types ───────────────────────────────────────────────
type Sender   = "user" | "bot";
type CardType = "analytics" | "lead_form" | "lead_list" | "task_list" | "trial_list" | "quick_nav";
interface CardData { type: CardType; payload?: Record<string, unknown>; }
interface Message  { id: string; sender: Sender; text: string; card?: CardData; streaming?: boolean; }

// ─── Intent matcher ──────────────────────────────────────
function detectIntent(text: string): string {
  const t = text.toLowerCase();
  if (/analytics|source|roi|performance|revenue|conversion|stats|report|metric/.test(t)) return "analytics";
  if (/create|add|new lead|add lead/.test(t))          return "create_lead";
  if (/my leads?|assigned to me|my pipeline/.test(t))  return "my_leads";
  if (/leads?|pipeline|list|show leads/.test(t))       return "show_leads";
  if (/task|todo|pending|due today/.test(t))           return "show_tasks";
  if (/trial|session|schedule|batch/.test(t))          return "show_trials";
  if (/follow.?up|call due|whatsapp/.test(t))          return "show_followups";
  if (/renewal|expire|lapsed|member/.test(t))          return "show_renewals";
  if (/dashboard|home|overview/.test(t))               return "nav_dashboard";
  if (/import/.test(t))                                return "nav_import";
  if (/setting/.test(t))                               return "nav_settings";
  if (/user|staff|team|invite/.test(t))                return "nav_users";
  if (/hello|hi|hey|start/.test(t))                    return "greet";
  if (/help|what can you|option/.test(t))              return "help";
  return "unknown";
}

// ─── Response builder ────────────────────────────────────
function buildResponse(
  intent: string,
  user: ReturnType<typeof useUser>,
  role: string,
): { text: string; card?: CardData; navigateTo?: string } {
  const name         = user?.name?.split(" ")[0] ?? "there";
  const myLeads      = MOCK_LEADS.filter(l => l.assignedTo === user?.name);
  const myTasks      = MOCK_TASKS.filter(t => t.assignedTo === user?.name && !t.done);
  const pendingTasks = MOCK_TASKS.filter(t => !t.done);
  const total        = MOCK_LEADS.length;
  const converted    = MOCK_LEADS.filter(l => ["Joined","Membership Active","Renewal"].includes(l.stage)).length;
  const convRate     = total > 0 ? Math.round((converted / total) * 100) : 0;
  const todayTrials  = MOCK_TRIALS.filter(t => t.date === "2025-02-28");

  switch (intent) {
    case "greet": return {
      text: `Hey ${name}! 👋 I'm Proton AI, your CRM assistant. Ask me about leads, analytics, tasks, or use the quick actions below.`,
      card: { type: "quick_nav" },
    };
    case "help": return {
      text: `Here's what I can do, ${name}:\n• 📊 Analytics & source performance\n• 📋 Your leads, tasks, trials\n• ➕ Create a new lead\n• 🔔 Pending follow-ups\n• 🔄 Renewals & lapsed members\n• 🧭 Navigate anywhere in the CRM`,
    };
    case "analytics": {
      const topSrc = SOURCE_CHART_DATA.reduce((a, b) => a.value > b.value ? a : b);
      const rev    = REPORT_METRICS.find(m => m.label === "Total Revenue");
      return {
        text: "Here's your CRM performance overview 📊",
        card: {
          type: "analytics",
          payload: {
            totalLeads: total, converted, convRate,
            topSource: topSrc.label,
            revenue: rev ? `₹${(rev.value / 1000).toFixed(0)}K` : "—",
            sources: SOURCE_CHART_DATA.map(s => ({ name: s.label, share: s.value })),
            trend:   LEAD_CHART_DATA.slice(-4),
          },
        },
      };
    }
    case "my_leads":
      if (!myLeads.length) return { text: `No leads assigned yet, ${name}.` };
      return {
        text: `You have ${myLeads.length} lead${myLeads.length > 1 ? "s" : ""} assigned 📋`,
        card: { type: "lead_list", payload: { leads: myLeads.slice(0,4), mine: true } },
        navigateTo: "/leads/mine",
      };
    case "show_leads": return {
      text: `Here are ${MOCK_LEADS.length} leads in the CRM 📋`,
      card: { type: "lead_list", payload: { leads: MOCK_LEADS.slice(0,4) } },
      navigateTo: "/leads",
    };
    case "create_lead": return {
      text: "Fill in the details to add a new lead ➕",
      card: { type: "lead_form" },
    };
    case "show_tasks": {
      const tasks = ["SUPER_ADMIN","ADMIN","CENTER_MANAGER","SALES_MANAGER"].includes(role)
        ? pendingTasks : myTasks;
      if (!tasks.length) return { text: `No pending tasks, ${name}! All clear ✓` };
      return {
        text: `${tasks.length} pending task${tasks.length > 1 ? "s" : ""} ✅`,
        card: { type: "task_list", payload: { tasks: tasks.slice(0,4) } },
        navigateTo: "/dashboard/tasks",
      };
    }
    case "show_trials":
      if (!todayTrials.length) return { text: "No trials scheduled for today." };
      return {
        text: `${todayTrials.length} trial${todayTrials.length > 1 ? "s" : ""} today 🥋`,
        card: { type: "trial_list", payload: { trials: todayTrials } },
        navigateTo: "/schedule/trials",
      };
    case "show_followups": return { text: "Opening follow-ups 📞",            navigateTo: "/schedule/followups" };
    case "show_renewals":  return { text: "Opening renewals overview 🔄",     navigateTo: "/renewals"           };
    case "nav_dashboard":  return { text: "Heading to Dashboard 🏠",           navigateTo: "/dashboard"          };
    case "nav_import":     return { text: "Opening lead import 📂",            navigateTo: "/leads/import"       };
    case "nav_settings":   return { text: "Opening settings ⚙",               navigateTo: "/settings"           };
    case "nav_users":      return { text: "Opening team directory 👥",         navigateTo: "/users"              };
    default: {
      const hints = [
        `Try: "show analytics", "my leads", or "my tasks".`,
        `Ask about "today's trials", "source analytics", or "pending renewals".`,
        `Not sure about that one. Try "show leads" or "show analytics".`,
      ];
      return { text: hints[Math.floor(Math.random() * hints.length)] };
    }
  }
}

// ─── Stream text ─────────────────────────────────────────
function streamText(full: string, onChunk: (s: string) => void, onDone: () => void) {
  let i = 0;
  const tick = () => {
    if (i <= full.length) { onChunk(full.slice(0, i)); i++; setTimeout(tick, 16); }
    else onDone();
  };
  tick();
}

// ─── Stage colours (static hex — no CSS var needed) ──────
const STAGE_COLOR: Record<string, string> = {
  "Lead Created":"#6366f1", "Call Handling":"#f59e0b", "Followup":"#fbbf24",
  "Trial Booked":"#10b981", "Trial Done":"#34d399",    "Joined":"#22c55e",
  "Membership Active":"#4ade80", "Renewal":"#f87171",
};

// ─── Shared card shell ───────────────────────────────────
const CardWrap = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-1.5 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3">
    {children}
  </div>
);
const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-2.5 text-[10px] font-800 uppercase tracking-wider text-secondary">{children}</p>
);
const CardBtn = ({ children, onClick, disabled }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean;
}) => (
  <button
    onClick={onClick} disabled={disabled}
    className="mt-2 w-full rounded-lg bg-[var(--primary-color)] py-1.5 text-[12px] font-600 text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
  >
    {children}
  </button>
);
const FIELD = "mb-1.5 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-base)] px-2.5 py-1.5 text-[12px] text-primary outline-none transition-colors focus:border-[var(--primary-color)]";

// ─── Analytics card ──────────────────────────────────────
const AnalyticsCard = ({ payload }: { payload: Record<string, unknown> }) => {
  const sources = payload.sources as { name: string; share: number }[];
  const trend   = payload.trend   as { label: string; value: number }[];
  const maxBar  = Math.max(...(trend?.map(d => d.value) ?? [1]));
  const SRC_BG: Record<string,string> = {
    "Meta Ads":"bg-[var(--primary-color)]",
    "WhatsApp":"bg-[var(--success-color)]",
    "Walk-in": "bg-[var(--warning-color)]",
  };
  return (
    <CardWrap>
      <CardTitle>📊 Performance Overview</CardTitle>
      <div className="mb-2.5 flex gap-1.5">
        {[
          { v: String(payload.totalLeads), l: "Leads"   },
          { v: `${payload.convRate}%`,     l: "Conv."   },
          { v: String(payload.revenue),   l: "Revenue" },
        ].map(s => (
          <div key={s.l} className="flex-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-base)] py-1.5 text-center">
            <p className="text-[13px] font-800 text-primary">{s.v}</p>
            <p className="text-[9px] text-secondary">{s.l}</p>
          </div>
        ))}
      </div>
      {sources?.map(s => (
        <div key={s.name} className="mb-1.5 flex items-center gap-2">
          <span className="w-14 flex-shrink-0 truncate text-[10px] text-secondary">{s.name}</span>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--bg-base)]">
            <div className={cn("h-full rounded-full transition-all duration-500", SRC_BG[s.name] ?? "bg-[var(--primary-color)]")}
              style={{ width: `${s.share}%` }} />
          </div>
          <span className="w-6 flex-shrink-0 text-right text-[10px] text-[var(--primary-color)]">{s.share}%</span>
        </div>
      ))}
      {trend && (
        <div className="mt-2.5 flex h-10 items-end gap-1">
          {trend.map((d, i) => (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-0.5">
              <div className="w-full min-h-[3px] rounded-t-sm bg-[var(--primary-color)]"
                style={{ height: `${Math.round((d.value / maxBar) * 32) + 3}px`, opacity: i === trend.length - 1 ? 1 : 0.3 + i * 0.2 }} />
              <span className="text-[8px] text-secondary">{d.label}</span>
            </div>
          ))}
        </div>
      )}
    </CardWrap>
  );
};

// ─── Lead list card ──────────────────────────────────────
const LeadListCard = ({ payload, onNavigate }: { payload: Record<string, unknown>; onNavigate: (p: string) => void }) => {
  const leads = payload.leads as typeof MOCK_LEADS;
  const mine  = payload.mine  as boolean;
  return (
    <CardWrap>
      <CardTitle>{mine ? "👤 My Leads" : "📋 All Leads"}</CardTitle>
      {leads.map((l, i) => (
        <div key={l.id} className={cn("flex items-center gap-2 py-1.5", i < leads.length - 1 && "border-b border-[var(--border-color)]")}>
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--primary-color)] text-[10px] font-700 text-white">
            {l.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-[11px] font-600 text-primary">{l.name}</p>
            <p className="text-[9px] text-secondary">{l.source} · {l.center}</p>
          </div>
          <span className="h-2 w-2 flex-shrink-0 rounded-full"
            style={{ background: STAGE_COLOR[l.stage] ?? "var(--text-secondary)" }} />
        </div>
      ))}
      <CardBtn onClick={() => onNavigate(mine ? "/leads/mine" : "/leads")}>View all leads →</CardBtn>
    </CardWrap>
  );
};

// ─── Lead form card ──────────────────────────────────────
const LeadFormCard = ({ onDone }: { onDone: (msg: string) => void }) => {
  const [form, setForm] = useState({ name:"", phone:"", source:"Meta Ads", stage:"Lead Created" });
  const [done, setDone] = useState(false);
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  if (done) return null;
  return (
    <CardWrap>
      <CardTitle>➕ Create New Lead</CardTitle>
      <input className={FIELD} placeholder="Full Name *"     value={form.name}  onChange={e => set("name",  e.target.value)} />
      <input className={FIELD} placeholder="Phone Number *"  value={form.phone} onChange={e => set("phone", e.target.value)} />
      <select className={FIELD} value={form.source} onChange={e => set("source", e.target.value)}>
        {["Meta Ads","WhatsApp","Walk-in"].map(s => <option key={s}>{s}</option>)}
      </select>
      <select className={FIELD} value={form.stage} onChange={e => set("stage", e.target.value)}>
        {["Lead Created","Call Handling","Followup","Trial Booked"].map(s => <option key={s}>{s}</option>)}
      </select>
      <CardBtn disabled={!form.name || !form.phone}
        onClick={() => { setDone(true); onDone(`✅ Lead "${form.name}" created — ${form.source}, ${form.stage}`); }}>
        Create Lead →
      </CardBtn>
    </CardWrap>
  );
};

// ─── Task list card ──────────────────────────────────────
const TYPE_ICON: Record<string,string> = { followup:"↩", trial:"🥋", renewal:"↺", call:"📞" };
const PRIO_CLS: Record<string,string> = {
  high:   "bg-red-500/15 text-red-400",
  medium: "bg-amber-500/15 text-amber-400",
  low:    "bg-slate-500/15 text-slate-400",
};
const TaskListCard = ({ payload, onNavigate }: { payload: Record<string, unknown>; onNavigate: (p: string) => void }) => {
  const tasks = payload.tasks as typeof MOCK_TASKS;
  return (
    <CardWrap>
      <CardTitle>✅ Pending Tasks</CardTitle>
      {tasks.map((t, i) => (
        <div key={t.id} className={cn("flex items-start gap-2 py-1.5", i < tasks.length - 1 && "border-b border-[var(--border-color)]")}>
          <span className="mt-0.5 flex-shrink-0 text-sm">{TYPE_ICON[t.type] ?? "◈"}</span>
          <div className="flex-1 min-w-0">
            <p className="truncate text-[11px] font-600 text-primary">{t.title}</p>
            <p className="text-[9px] text-secondary">{t.leadName} · Due {t.dueDate}</p>
          </div>
          <span className={cn("flex-shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-700 capitalize", PRIO_CLS[t.priority])}>
            {t.priority}
          </span>
        </div>
      ))}
      <CardBtn onClick={() => onNavigate("/dashboard/tasks")}>View all tasks →</CardBtn>
    </CardWrap>
  );
};

// ─── Trial list card ─────────────────────────────────────
const TrialListCard = ({ payload, onNavigate }: { payload: Record<string, unknown>; onNavigate: (p: string) => void }) => {
  const trials = payload.trials as typeof MOCK_TRIALS;
  return (
    <CardWrap>
      <CardTitle>🥋 Today's Trials</CardTitle>
      {trials.map((t, i) => (
        <div key={t.id} className={cn("flex items-start gap-2 py-1.5", i < trials.length - 1 && "border-b border-[var(--border-color)]")}>
          <span className="mt-0.5 flex-shrink-0 text-sm">🥋</span>
          <div className="flex-1 min-w-0">
            <p className="truncate text-[11px] font-600 text-primary">{t.leadName}</p>
            <p className="text-[9px] text-secondary">{t.batch} · {t.trainer} · {t.time}</p>
          </div>
          <span className={cn("flex-shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-700 capitalize",
            t.status === "confirmed" ? "success-text success-bg" : "warning-text warning-bg")}>
            {t.status}
          </span>
        </div>
      ))}
      <CardBtn onClick={() => onNavigate("/schedule/trials")}>View all trials →</CardBtn>
    </CardWrap>
  );
};

// ─── Quick nav card ──────────────────────────────────────
const NAV_ITEMS = [
  { icon:"🏠", label:"Dashboard", path:"/dashboard"  },
  { icon:"📋", label:"Leads",     path:"/leads"       },
  { icon:"📅", label:"Schedule",  path:"/schedule"    },
  { icon:"🔄", label:"Renewals",  path:"/renewals"    },
  { icon:"📊", label:"Reports",   path:"/reports"     },
  { icon:"⚙",  label:"Settings", path:"/settings"    },
];
const QuickNavCard = ({ onNavigate }: { onNavigate: (p: string) => void }) => (
  <CardWrap>
    <CardTitle>🧭 Quick Navigation</CardTitle>
    <div className="grid grid-cols-3 gap-1.5">
      {NAV_ITEMS.map(n => (
        <button key={n.path} onClick={() => onNavigate(n.path)}
          className="flex flex-col items-center gap-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-base)] py-2 px-1 transition-all hover:border-[var(--primary-color)] hover:bg-[var(--hover-bg)]">
          <span className="text-base leading-none">{n.icon}</span>
          <span className="text-[9px] font-600 text-secondary">{n.label}</span>
        </button>
      ))}
    </div>
  </CardWrap>
);

// ─── Chips + localStorage ────────────────────────────────
const CHIPS = ["Show analytics", "My leads", "My tasks", "Today's trials", "Renewals"];
const LS_KEY = "proton_chat_history";
const saveHistory = (msgs: Message[]) => { try { localStorage.setItem(LS_KEY, JSON.stringify(msgs.slice(-40))); } catch {} };
const loadHistory = (): Message[] => { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } };

// ─── Main component ──────────────────────────────────────
export const FloatingChatBot = () => {
  const navigate = useNavigate();
  const user     = useUser();
  const role     = useRole();

  const [isOpen,      setIsOpen]      = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages,    setMessages]    = useState<Message[]>(() => loadHistory());
  const [input,       setInput]       = useState("");
  const [isTyping,    setIsTyping]    = useState(false);
  const [unread,      setUnread]      = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [greeted,     setGreeted]     = useState(() => loadHistory().length > 0);

  const msgEndRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const recRef     = useRef<ISpeechRecognition | null>(null);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);
  useEffect(() => { if (messages.length) saveHistory(messages); }, [messages]);

  const uid    = () => Math.random().toString(36).slice(2);
  const addMsg = useCallback((msg: Omit<Message, "id">) => {
    setMessages(p => [...p, { ...msg, id: uid() }]);
  }, []);

  const handleOpen = () => {
    setIsOpen(true); setIsMinimized(false); setUnread(0);
    if (!greeted) {
      setGreeted(true);
      const botId = uid();
      setTimeout(() => {
        setMessages(p => [...p, { id: botId, sender: "bot", text: "", streaming: true }]);
        streamText(
          `Hey ${user?.name?.split(" ")[0] ?? "there"} 👋  I'm Proton AI. Ask me about leads, analytics, tasks, or use the quick actions below.`,
          partial => setMessages(p => p.map(m => m.id === botId ? { ...m, text: partial } : m)),
          ()      => setMessages(p => p.map(m => m.id === botId ? { ...m, streaming: false, card: { type: "quick_nav" } } : m))
        );
      }, 250);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const doNavigate = (path: string) => { navigate(path); };

  const processMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;
    setInput(""); addMsg({ sender: "user", text }); setIsTyping(true);
    await new Promise(r => setTimeout(r, 450 + Math.random() * 350));
    const resp  = buildResponse(detectIntent(text), user, role);
    const botId = uid();
    setIsTyping(false);
    setMessages(p => [...p, { id: botId, sender: "bot", text: "", streaming: true }]);
    streamText(
      resp.text,
      partial => setMessages(p => p.map(m => m.id === botId ? { ...m, text: partial } : m)),
      ()      => {
        setMessages(p => p.map(m => m.id === botId ? { ...m, streaming: false, card: resp.card } : m));
        if (resp.navigateTo) setTimeout(() => doNavigate(resp.navigateTo!), 900);
        if (!isOpen) setUnread(n => n + 1);
      }
    );
  };

  const startVoice = () => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) { alert("Voice not supported in this browser."); return; }
    const rec: ISpeechRecognition = new SR();
    rec.lang = "en-IN"; rec.interimResults = false; recRef.current = rec;
    setIsListening(true);
    rec.onresult = (e: ISpeechRecognitionEvent) => { setInput(e.results[0][0].transcript); setIsListening(false); };
    rec.onerror  = () => setIsListening(false);
    rec.onend    = () => setIsListening(false);
    rec.start();
  };

  const clearHistory = () => {
    setMessages([]); setGreeted(false);
    try { localStorage.removeItem(LS_KEY); } catch {}
  };

  const renderCard = (card: CardData) => {
    switch (card.type) {
      case "analytics":  return <AnalyticsCard  payload={card.payload!} />;
      case "lead_list":  return <LeadListCard   payload={card.payload!} onNavigate={doNavigate} />;
      case "lead_form":  return <LeadFormCard   onDone={msg => addMsg({ sender: "bot", text: msg })} />;
      case "task_list":  return <TaskListCard   payload={card.payload!} onNavigate={doNavigate} />;
      case "trial_list": return <TrialListCard  payload={card.payload!} onNavigate={doNavigate} />;
      case "quick_nav":  return <QuickNavCard   onNavigate={doNavigate} />;
      default:           return null;
    }
  };

  // The only style block: @keyframe definitions Tailwind can't produce.
  // All layout, colour, spacing, and interaction is plain Tailwind below.
  const KEYFRAMES = `
    @keyframes proton-pulse  { 0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--primary-color) 40%,transparent)} 60%{box-shadow:0 0 0 10px transparent} }
    @keyframes proton-pop    { from{transform:scale(0)} to{transform:scale(1)} }
    @keyframes proton-in     { from{transform:scale(0.85) translateY(8px);opacity:0} to{transform:scale(1) translateY(0);opacity:1} }
    @keyframes proton-msg    { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
    @keyframes proton-blink  { 0%,100%{opacity:1} 50%{opacity:0.3} }
    @keyframes proton-cur    { 0%,100%{opacity:1} 50%{opacity:0} }
    @keyframes proton-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px);background:var(--primary-color)} }
    @keyframes proton-mic    { 0%,100%{opacity:1} 50%{opacity:0.35} }
    .proton-pulse  { animation: proton-pulse  2.8s ease-in-out infinite; }
    .proton-pop    { animation: proton-pop    0.25s cubic-bezier(0.34,1.56,0.64,1); }
    .proton-in     { animation: proton-in     0.22s cubic-bezier(0.34,1.56,0.64,1); }
    .proton-msg    { animation: proton-msg    0.16s ease-out; }
    .proton-blink  { animation: proton-blink  2s   ease-in-out infinite; }
    .proton-cur    { animation: proton-cur    0.55s ease-in-out infinite; }
    .proton-bounce { animation: proton-bounce 1.1s  ease-in-out infinite; }
    .proton-bounce:nth-child(2) { animation-delay: 0.18s; }
    .proton-bounce:nth-child(3) { animation-delay: 0.36s; }
    .proton-mic    { animation: proton-mic    0.9s  ease-in-out infinite; }
    .proton-msgs::-webkit-scrollbar       { width: 3px; }
    .proton-msgs::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 2px; }
  `;

  return (
    <>
      <style>{KEYFRAMES}</style>

      {/* ── FAB ──────────────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          aria-label="Open Proton AI"
          className="proton-pulse fixed bottom-6 right-6 z-[1000] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-none bg-[var(--primary-color)] transition-transform duration-200 hover:scale-110"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.518 3.66 1.418 5.174L2 22l4.826-1.418A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
            <circle cx="8"  cy="12" r="1" fill="white" stroke="none"/>
            <circle cx="12" cy="12" r="1" fill="white" stroke="none"/>
            <circle cx="16" cy="12" r="1" fill="white" stroke="none"/>
          </svg>
          {unread > 0 && (
            <span className="proton-pop absolute -right-0.5 -top-0.5 flex h-[19px] w-[19px] items-center justify-center rounded-full border-2 border-[var(--bg-base)] bg-[var(--danger-color)] text-[10px] font-700 text-white">
              {unread}
            </span>
          )}
        </button>
      )}

      {/* ── Chat window ──────────────────────────────── */}
      {isOpen && (
        <div
          className={cn(
            "proton-in fixed right-6 z-[999] flex flex-col overflow-hidden rounded-[18px]",
            "border border-[var(--border-color)] bg-[var(--bg-base)]",
            "shadow-[0_24px_64px_rgba(0,0,0,0.4)]",
            "w-[min(360px,calc(100vw-48px))]",
            isMinimized ? "bottom-[90px] h-[54px]" : "bottom-[90px] h-[min(560px,calc(100dvh-108px))]"
          )}
          style={{ transformOrigin: "bottom right" }}
        >
          {/* ── Header ── */}
          <div className="flex flex-shrink-0 items-center gap-2.5 border-b border-[var(--border-color)] bg-[var(--bg-surface)] px-3.5 py-2.5">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--primary-color)] text-base">
              🤖
            </div>
            {!isMinimized ? (
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-800 tracking-wide text-primary">PROTON AI</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[var(--success-color)]">
                  <span className="proton-blink h-1.5 w-1.5 rounded-full bg-[var(--success-color)]" />
                  Online · CRM Assistant
                </p>
              </div>
            ) : (
              <span className="flex-1 text-[13px] font-700 text-primary">Proton AI</span>
            )}
            <div className="flex items-center gap-1.5">
              {!isMinimized && (
                <button onClick={clearHistory} title="Clear chat"
                  className="flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--hover-bg)] text-[12px] text-secondary transition-all hover:border-[var(--danger-color)] hover:text-[var(--danger-color)]">
                  🗑
                </button>
              )}
              <button onClick={() => setIsMinimized(m => !m)} title={isMinimized ? "Expand" : "Minimize"}
                className="flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--hover-bg)] text-[11px] text-secondary transition-all hover:border-[var(--primary-color)] hover:text-primary">
                {isMinimized ? "▲" : "▼"}
              </button>
              <button onClick={() => setIsOpen(false)} title="Close"
                className="flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--hover-bg)] text-[11px] text-secondary transition-all hover:border-[var(--danger-color)] hover:text-[var(--danger-color)]">
                ✕
              </button>
            </div>
          </div>

          {/* ── Body ── */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="proton-msgs flex flex-1 flex-col gap-2.5 overflow-y-auto bg-[var(--bg-base)] p-3">
                {messages.map(msg => (
                  <div key={msg.id} className={cn("proton-msg flex gap-2", msg.sender === "user" && "flex-row-reverse")}>
                    {/* Avatar */}
                    <div className={cn(
                      "mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[7px] text-[11px]",
                      msg.sender === "bot"
                        ? "bg-[var(--primary-color)]"
                        : "border border-[var(--border-color)] bg-[var(--bg-surface)]"
                    )}>
                      {msg.sender === "bot" ? "🤖" : (user?.name?.charAt(0) ?? "👤")}
                    </div>
                    {/* Bubble + card */}
                    <div className={cn("flex max-w-[230px] flex-col gap-1", msg.sender === "user" ? "items-end" : "items-start")}>
                      <div className={cn(
                        "rounded-[13px] px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap",
                        msg.sender === "bot"
                          ? "rounded-bl-[4px] border border-[var(--border-color)] bg-[var(--bg-card)] text-primary"
                          : "rounded-br-[4px] bg-[var(--primary-color)] text-white"
                      )}>
                        {msg.text}
                        {msg.streaming && msg.text.length > 0 && (
                          <span className="proton-cur ml-0.5 inline-block h-3 w-0.5 align-middle bg-[var(--primary-color)]" />
                        )}
                      </div>
                      {msg.card && !msg.streaming && renderCard(msg.card)}
                    </div>
                  </div>
                ))}

                {/* Typing dots */}
                {isTyping && (
                  <div className="flex gap-2">
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[7px] bg-[var(--primary-color)] text-[11px]">🤖</div>
                    <div className="flex items-center gap-1 rounded-[13px] rounded-bl-[4px] border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2">
                      <span className="proton-bounce h-1.5 w-1.5 rounded-full bg-[var(--text-secondary)]" />
                      <span className="proton-bounce h-1.5 w-1.5 rounded-full bg-[var(--text-secondary)]" />
                      <span className="proton-bounce h-1.5 w-1.5 rounded-full bg-[var(--text-secondary)]" />
                    </div>
                  </div>
                )}
                <div ref={msgEndRef} />
              </div>

              {/* Chips */}
              {messages.length > 0 && (
                <div className="flex flex-wrap gap-1.5 border-t border-[var(--border-color)] bg-[var(--bg-base)] px-3 py-2">
                  {CHIPS.map(c => (
                    <button key={c} onClick={() => processMessage(c)}
                      className="cursor-pointer rounded-full border border-[var(--border-color)] bg-[var(--bg-surface)] px-2.5 py-1 text-[11px] text-secondary transition-all hover:border-[var(--primary-color)] hover:text-[var(--primary-color)]">
                      {c}
                    </button>
                  ))}
                </div>
              )}

              {/* Input row */}
              <div className="flex flex-shrink-0 items-center gap-1.5 border-t border-[var(--border-color)] bg-[var(--bg-surface)] px-2.5 py-2">
                <div className="flex flex-1 items-center gap-1.5 rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-base)] px-2.5 focus-within:border-[var(--primary-color)] transition-colors">
                  <input
                    ref={inputRef}
                    value={input}
                    placeholder="Ask Proton AI anything..."
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && processMessage(input)}
                    className="flex-1 border-none bg-transparent py-2 text-[13px] text-primary outline-none placeholder:text-secondary"
                  />
                  <button onClick={startVoice} title="Voice input"
                    className={cn(
                      "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md transition-colors hover:bg-[var(--hover-bg)]",
                      isListening && "proton-mic"
                    )}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke={isListening ? "var(--danger-color)" : "var(--text-secondary)"}
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="2" width="6" height="12" rx="3"/>
                      <path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6"/>
                    </svg>
                  </button>
                </div>
                <button
                  onClick={() => processMessage(input)}
                  disabled={isTyping || !input.trim()}
                  className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[9px] bg-[var(--primary-color)] transition-all hover:scale-105 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
