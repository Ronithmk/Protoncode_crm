// ============================================================
// features/settings/SettingsPage.tsx
// All settings sub-pages: General, Security, Integrations,
// WhatsApp automation, Meta Ads, Lead Stage configuration.
// ============================================================

import { useState } from "react";
import { cn } from "../../utils/cn";
import {
  PageHeader, Button, Card,  Input, Select, Divider,
} from "../../components/ui";
import { useThemeStore } from "../../store/useThemeStore";

// ─── TOGGLE SWITCH ───────────────────────────────────────
const Toggle = ({
  checked, onChange, label, description,
}: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) => (
  <div className="flex items-start justify-between gap-4 py-3">
    <div className="flex-1">
      <p className="text-[13px] font-medium text-theme">{label}</p>
      {description && <p className="text-[12px] text-muted mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-9 h-5 rounded-full transition-colors flex-shrink-0 mt-0.5",
        checked ? "bg-[var(--primary-color)]" : "bg-surface border border-theme"
      )}
    >
      <span className={cn(
        "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
        checked && "translate-x-4"
      )} />
    </button>
  </div>
);

// ─── SETTINGS SECTION ────────────────────────────────────
const SettingsSection = ({
  title, description, children,
}: { title: string; description?: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 py-8 border-b border-theme last:border-0">
    <div>
      <p className="text-[14px] font-semibold text-theme">{title}</p>
      {description && <p className="text-[12px] text-muted mt-1.5 leading-relaxed">{description}</p>}
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

// ─── THEME SELECTOR (example of a custom setting control) ─────────────────
const ThemeSelector = () => {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const options: { value: "light" | "dark"| "system"; label: string; icon: string }[] = [
    { value: "light", label: "Light", icon: "☀" },
    { value: "dark", label: "Dark", icon: "🌙" },
    { value: "system", label: "System", icon: "🖥" },
  ];

  return (
    <div className="flex items-center gap-2 bg-surface border border-theme rounded-xl p-1 w-fit">
      {options.map((opt) => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all",
              active
                ? "bg-[var(--primary-color)] text-white shadow-sm"
                : "text-muted hover:text-theme hover-theme"
            )}
          >
            <span>{opt.icon}</span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

// ─── GENERAL SETTINGS ────────────────────────────────────
export const GeneralSettings = () => {
  const [orgName, setOrgName] = useState("Proton Martial Arts");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [currency, setCurrency] = useState("INR");

  return (
    <div className="p-6 max-w-[900px]">
      <PageHeader
        title="General Settings"
        subtitle="Organisation-wide configuration"
        actions={<Button variant="primary" size="sm">Save Changes</Button>}
      />

      <Card className="px-6">
        <SettingsSection title="Organisation" description="Basic information about your organisation displayed throughout the CRM.">
          <Input label="Organisation Name" value={orgName} onChange={e => setOrgName(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Website" placeholder="https://dojomartialarts.com" />
            <Input label="Support Email" placeholder="support@dojo.com" />
          </div>
        </SettingsSection>

        <SettingsSection title="Centres" description="Manage the physical training centres in your network.">
          <div className="space-y-2">
            {["Koramangala","Indiranagar","Whitefield"].map(c => (
              <div key={c} className="flex items-center justify-between bg-surface border border-theme rounded-xl px-4 py-3">
                <div>
                  <p className="text-[13px] font-semibold text-theme">{c}</p>
                  <p className="text-[11px] text-muted">Bengaluru · Active</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost">Edit</Button>
                  <Button size="sm" variant="ghost">⋮</Button>
                </div>
              </div>
            ))}
            <Button variant="secondary" size="sm" className="w-full">+ Add Centre</Button>
          </div>
        </SettingsSection>

        <SettingsSection title="Regional" description="Date, time, and currency display preferences.">
          <div className="grid grid-cols-2 gap-3">
            <Select label="Timezone" value={timezone} onChange={e => setTimezone(e.target.value)}>
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST)</option>
              <option value="UTC">UTC</option>
            </Select>
            <Select label="Currency" value={currency} onChange={e => setCurrency(e.target.value)}>
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="AED">UAE Dirham (د.إ)</option>
            </Select>
          </div>
          <Select label="Date Format">
            <option>DD/MM/YYYY</option>
            <option>MM/DD/YYYY</option>
            <option>YYYY-MM-DD</option>
          </Select>
        </SettingsSection>

        <SettingsSection
          title="Appearance"
          description="Customise how the CRM interface looks for your organisation."
        >
          <div className="space-y-3">
            <div>
              <p className="text-[13px] font-medium text-theme">Theme</p>
              <p className="text-[12px] text-muted mt-0.5">
                Choose between light and dark mode.
              </p>
            </div>

            <ThemeSelector />
          </div>
        </SettingsSection>
      </Card>
    </div>
  );
};

// ─── SECURITY SETTINGS ───────────────────────────────────
export const SecuritySettings = () => {
  const [twoFA, setTwoFA] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);

  return (
    <div className="p-6 max-w-[900px]">
      <PageHeader title="Security" subtitle="Manage authentication and access security" />

      <Card className="px-6">
        <SettingsSection title="Authentication" description="Control how users sign in to the CRM.">
          <Toggle
            checked={twoFA}
            onChange={setTwoFA}
            label="Two-Factor Authentication"
            description="Require all users to set up 2FA for their accounts."
          />
          <Divider />
          <Toggle
            checked={sessionTimeout}
            onChange={setSessionTimeout}
            label="Auto Session Timeout"
            description="Automatically log out inactive users after 30 minutes."
          />
          <Divider />
          <Toggle
            checked={loginAlerts}
            onChange={setLoginAlerts}
            label="Login Alert Emails"
            description="Send email notifications on new device logins."
          />
        </SettingsSection>

        <SettingsSection title="Password Policy" description="Set requirements for user passwords.">
          <div className="grid grid-cols-2 gap-3">
            <Select label="Minimum Length">
              {["8","10","12","16"].map(n => <option key={n}>{n} characters</option>)}
            </Select>
            <Select label="Password Expiry">
              <option>Never</option>
              <option>30 days</option>
              <option>60 days</option>
              <option>90 days</option>
            </Select>
          </div>
          <Toggle checked label="Require uppercase letters" onChange={() => {}} />
          <Toggle checked label="Require numbers" onChange={() => {}} />
          <Toggle checked={false} label="Require special characters" onChange={() => {}} />
        </SettingsSection>

        <SettingsSection title="API Access" description="Manage API keys for external integrations.">
          <div className="bg-surface border border-theme rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-theme">Production API Key</p>
              <p className="text-[12px] font-mono text-muted mt-0.5">sk_live_••••••••••••••••••••••••••••••</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary">Reveal</Button>
              <Button size="sm" variant="danger">Revoke</Button>
            </div>
          </div>
          <Button variant="secondary" size="sm">Generate New API Key</Button>
        </SettingsSection>
      </Card>
    </div>
  );
};

// ─── INTEGRATIONS ────────────────────────────────────────
type Integration = { name: string; icon: string; description: string; connected: boolean; color: string };

const INTEGRATIONS: Integration[] = [
  { name:"Meta Ads",      icon:"⬡", description:"Automatically import leads from Facebook and Instagram ad campaigns.", connected:true,  color:"#1877F2" },
  { name:"WhatsApp",      icon:"◉", description:"Send automated messages and receive replies directly in the CRM.",     connected:true,  color:"#25D366" },
  { name:"Google Sheets", icon:"⊞", description:"Sync leads and data to Google Sheets for custom reporting.",           connected:false, color:"#0F9D58" },
  { name:"Razorpay",      icon:"₹", description:"Process payments and sync transactions for membership billing.",        connected:false, color:"#3395FF" },
  { name:"Mailchimp",     icon:"✉", description:"Sync contacts for email marketing campaigns.",                         connected:false, color:"#FFE01B" },
  { name:"Zapier",        icon:"⚡", description:"Connect with 5000+ apps via automated workflows.",                    connected:false, color:"#FF4A00" },
];

export const IntegrationsSettings = () => (
  <div className="p-6 max-w-[900px]">
    <PageHeader title="Integrations" subtitle="Connect your CRM with external platforms" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {INTEGRATIONS.map(intg => (
        <Card key={intg.name} className="p-5 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 text-white"
              style={{ background: intg.color + "20", border:`1px solid ${intg.color}30` }}
            >
              <span style={{ color: intg.color }}>{intg.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-[14px] font-semibold text-theme">{intg.name}</p>
                {intg.connected && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Connected
                  </span>
                )}
              </div>
              <p className="text-[12px] text-muted mt-1 leading-relaxed">{intg.description}</p>
            </div>
          </div>
          <Button
            variant={intg.connected ? "danger" : "primary"}
            size="sm"
          >
            {intg.connected ? "Disconnect" : "Connect"}
          </Button>
        </Card>
      ))}
    </div>
  </div>
);

// ─── WHATSAPP SETTINGS ───────────────────────────────────
export const WhatsAppSettings = () => {
  const [autoReply, setAutoReply] = useState(true);
  const [trialReminder, setTrialReminder] = useState(true);
  const [renewalAlert, setRenewalAlert] = useState(false);

  return (
    <div className="p-6 max-w-[900px]">
      <PageHeader title="WhatsApp Automation" subtitle="Configure automated WhatsApp messages for lead communication" />

      <Card className="px-6">
        <SettingsSection title="Business Account" description="WhatsApp Business API connection details.">
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl text-emerald-400">◉</span>
            <div>
              <p className="text-[13px] font-semibold text-emerald-400">Connected</p>
              <p className="text-[12px] text-slate-500">+91 98000 00000 · Dojo Martial Arts</p>
            </div>
            <Button size="sm" variant="danger" className="ml-auto">Disconnect</Button>
          </div>
        </SettingsSection>

        <SettingsSection title="Automation Rules" description="Set up automatic WhatsApp messages triggered by CRM events.">
          <Toggle checked={autoReply}      onChange={setAutoReply}      label="Auto-reply to new WhatsApp leads" description="Send welcome message when a new lead messages via WhatsApp." />
          <Divider />
          <Toggle checked={trialReminder}  onChange={setTrialReminder}  label="Trial session reminders"         description="Send reminder 24h and 1h before a scheduled trial." />
          <Divider />
          <Toggle checked={renewalAlert}   onChange={setRenewalAlert}   label="Renewal due alerts"              description="Send reminder 7 days before membership expires." />
        </SettingsSection>

        <SettingsSection title="Message Templates" description="Pre-approved message templates for automation.">
          {[
            { name:"Welcome Message",      status:"Approved",  trigger:"New Lead" },
            { name:"Trial Reminder (24h)",  status:"Approved",  trigger:"Trial Booked" },
            { name:"Trial Reminder (1h)",   status:"Pending",   trigger:"Trial Booked" },
            { name:"Membership Welcome",    status:"Approved",  trigger:"Joined" },
            { name:"Renewal Reminder",      status:"Rejected",  trigger:"Renewal" },
          ].map(t => (
            <div key={t.name} className="flex items-center justify-between bg-surface border border-theme rounded-xl px-4 py-3">
              <div>
                <p className="text-[13px] font-semibold text-white">{t.name}</p>
                <p className="text-[11px] text-muted">Trigger: {t.trigger}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full",
                  t.status === "Approved" && "bg-emerald-500/10 text-emerald-400",
                  t.status === "Pending"  && "bg-amber-500/10 text-amber-400",
                  t.status === "Rejected" && "bg-red-500/10 text-red-400",
                )}>
                  {t.status}
                </span>
                <Button size="sm" variant="ghost">Edit</Button>
              </div>
            </div>
          ))}
          <Button variant="secondary" size="sm">+ Create Template</Button>
        </SettingsSection>
      </Card>
    </div>
  );
};

// ─── META ADS SETTINGS ───────────────────────────────────
export const MetaAdsSettings = () => {
  const [autoImport, setAutoImport] = useState(true);
  const [dedup, setDedup] = useState(true);

  return (
    <div className="p-6 max-w-[900px]">
      <PageHeader title="Meta Ads Integration" subtitle="Automatically import leads from Facebook and Instagram campaigns" />

      <Card className="px-6">
        <SettingsSection title="Connection" description="Facebook Ads Manager account linked to this CRM.">
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">⬡</span>
            <div>
              <p className="text-[13px] font-semibold text-blue-400">Connected</p>
              <p className="text-[12px] text-slate-500">Dojo Martial Arts · Ad Account #9821xxxxxx</p>
            </div>
            <Button size="sm" variant="secondary" className="ml-auto">Re-authenticate</Button>
          </div>
        </SettingsSection>

        <SettingsSection title="Lead Forms" description="Select which Meta Lead Ad forms should automatically sync.">
          <div className="space-y-2">
            {[
              { name:"Koramangala - BJJ Enquiry",  status:true,  count:42 },
              { name:"Indiranagar - Kickboxing",    status:true,  count:28 },
              { name:"Whitefield - General Enquiry",status:false, count:0 },
              { name:"All Centres - Free Trial",    status:true,  count:78 },
            ].map(form => (
              <div key={form.name} className="flex items-center justify-between bg-surface border border-theme rounded-xl px-4 py-3">
                <div>
                  <p className="text-[13px] font-semibold text-white">{form.name}</p>
                  <p className="text-[11px] text-muted">{form.count} leads imported</p>
                </div>
                <Toggle checked={form.status} onChange={() => {}} label="" />
              </div>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection title="Import Rules" description="Configure how leads are handled when they arrive from Meta.">
          <Toggle checked={autoImport} onChange={setAutoImport} label="Auto-assign to available RM" description="Automatically round-robin new Meta leads to active RMs." />
          <Divider />
          <Toggle checked={dedup} onChange={setDedup} label="Deduplicate leads by phone" description="Skip import if a lead with the same phone already exists." />
        </SettingsSection>
      </Card>
    </div>
  );
};

// ─── LEAD STAGES SETTINGS ────────────────────────────────
export const LeadStagesSettings = () => {
  const [stages, setStages] = useState([
    { id:"1", name:"Lead Created",     color:"#6366f1", order:1, required:true  },
    { id:"2", name:"Call Handling",    color:"#f59e0b", order:2, required:true  },
    { id:"3", name:"Followup",         color:"#fbbf24", order:3, required:false },
    { id:"4", name:"Trial Booked",     color:"#10b981", order:4, required:true  },
    { id:"5", name:"Trial Done",       color:"#34d399", order:5, required:true  },
    { id:"6", name:"Joined",           color:"#22c55e", order:6, required:true  },
    { id:"7", name:"Membership Active",color:"#4ade80", order:7, required:true  },
    { id:"8", name:"Renewal",          color:"#f87171", order:8, required:true  },
  ]);

  return (
    <div className="p-6 max-w-[900px]">
      <PageHeader
        title="Lead Stage Configuration"
        subtitle="Customise the lifecycle stages for your lead pipeline"
        actions={<Button variant="primary" size="sm">Save Order</Button>}
      />

      <Card className="p-4">
        <div className="space-y-2">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="flex items-center gap-3 bg-surface border border-theme rounded-xl px-4 py-3 hover:border-[var(--primary-color)] transition-colors group"
            >
              {/* Drag handle */}
              <div className="text-mute group-hover:text-slate-500 cursor-grab text-[14px] select-none">⠿</div>

              {/* Order number */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                style={{ background: stage.color + "20", color: stage.color, border:`1px solid ${stage.color}30` }}
              >
                {stage.order}
              </div>

              {/* Colour picker */}
              <input
                type="color"
                value={stage.color}
                onChange={e => setStages(prev => prev.map(s => s.id === stage.id ? { ...s, color:e.target.value } : s))}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
              />

              {/* Stage name */}
              <input
                value={stage.name}
                onChange={e => setStages(prev => prev.map(s => s.id === stage.id ? { ...s, name:e.target.value } : s))}
                className="flex-1 bg-transparent text-[13px] font-semibold text-white outline-none focus:text-indigo-300 transition-colors"
              />

              {/* Required badge */}
              {stage.required && (
                <span className="text-[10px] text-slate-600 font-medium">Required</span>
              )}

              {/* Actions */}
              {!stage.required && (
                <Button size="sm" variant="danger">Remove</Button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-theme">
          <Button variant="secondary" size="sm">+ Add Stage</Button>
        </div>
      </Card>
    </div>
  );
};
