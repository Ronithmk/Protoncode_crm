import React from 'react';
import { 
  Share2, 
  Zap, 
  CreditCard, 
  ShieldCheck, 
  Webhook, 
  BellRing,
  Plus,
  Facebook,
  Instagram,
  History,
  Edit3,
  ArrowRight,
  MessageSquare,
  FileText,
  ChevronDown
} from 'lucide-react';
import { cn } from '../lib/utils';

export const Settings: React.FC = () => {
  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-500 max-w-5xl mx-auto w-full">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-white tracking-tight">Meta Lead Sync</h1>
          <p className="text-slate-500 max-w-md">Connect your Facebook and Instagram lead forms to automatically import prospects into your martial arts pipeline.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-primary/20">
          <Plus className="size-5" />
          Connect New Page
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Facebook Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 flex flex-col gap-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-[#1877F2] flex items-center justify-center text-white">
                <Facebook className="size-7 fill-current" />
              </div>
              <div>
                <h3 className="font-bold text-white">Elite Martial Arts Main</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Facebook Page Connected</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full border border-emerald-500/20 uppercase tracking-widest">
              Connected
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div>
                <p className="text-sm font-bold text-white">Auto-import Lead Forms</p>
                <p className="text-[10px] text-slate-500 font-medium">Syncs every 5 minutes</p>
              </div>
              <div className="w-10 h-5 bg-primary rounded-full relative">
                <div className="absolute right-1 top-1 size-3 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div>
                <p className="text-sm font-bold text-white">Map Lead Stages</p>
                <p className="text-[10px] text-slate-500 font-medium">Custom CRM field mapping</p>
              </div>
              <button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline">Configure</button>
            </div>
          </div>
        </div>

        {/* Instagram Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 flex flex-col gap-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white">
                <Instagram className="size-7" />
              </div>
              <div>
                <h3 className="font-bold text-white">@elite_karate_official</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Instagram Professional Connected</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full border border-emerald-500/20 uppercase tracking-widest">
              Connected
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div>
                <p className="text-sm font-bold text-white">DM Automation</p>
                <p className="text-[10px] text-slate-500 font-medium">Reply to prospects instantly</p>
              </div>
              <div className="w-10 h-5 bg-slate-700 rounded-full relative">
                <div className="absolute left-1 top-1 size-3 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div>
                <p className="text-sm font-bold text-white">Profile Widget</p>
                <p className="text-[10px] text-slate-500 font-medium">Capture leads via Bio link</p>
              </div>
              <button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline">Setup</button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Active Automation Rule</h2>
          <div className="flex gap-2">
            <button className="p-2 text-slate-500 hover:text-white"><History className="size-5" /></button>
            <button className="p-2 text-slate-500 hover:text-white"><Edit3 className="size-5" /></button>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 flex flex-col gap-8 relative overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 p-4">
            <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full text-primary text-[10px] font-bold border border-primary/20 tracking-widest">
              <span className="size-1.5 bg-primary rounded-full animate-pulse"></span>
              RUNNING
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full bg-[#101322]/50 rounded-2xl border border-white/5 p-6 border-l-4 border-l-amber-500">
              <div className="flex items-center gap-3 mb-4 text-amber-500">
                <Zap className="size-4 fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Trigger</span>
              </div>
              <p className="text-slate-500 text-[10px] font-bold uppercase mb-2 tracking-wider">If Lead Stage is equal to</p>
              <div className="flex items-center justify-between bg-[#0a0c1a] px-4 py-3 rounded-xl border border-white/10">
                <span className="font-bold text-white text-sm">Trial Membership</span>
                <ChevronDown className="size-4 text-slate-500" />
              </div>
            </div>
            
            <ArrowRight className="size-8 text-primary rotate-90 md:rotate-0" />
            
            <div className="flex-1 w-full bg-[#101322]/50 rounded-2xl border border-white/5 p-6 border-l-4 border-l-primary">
              <div className="flex items-center gap-3 mb-4 text-primary">
                <ArrowRight className="size-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Action</span>
              </div>
              <p className="text-slate-500 text-[10px] font-bold uppercase mb-2 tracking-wider">Then execute task</p>
              <div className="flex items-center gap-3 bg-[#0a0c1a] px-4 py-3 rounded-xl border border-white/10">
                <div className="size-6 bg-[#25D366] rounded flex items-center justify-center text-white">
                  <MessageSquare className="size-3.5 fill-current" />
                </div>
                <span className="font-bold text-white text-sm">Send WhatsApp Message</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-6 bg-primary/5 rounded-2xl border border-primary/10">
            <div className="flex items-center gap-2 text-primary">
              <FileText className="size-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Message Content</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              "Hi <span className="text-primary font-mono font-bold">{"{lead_first_name}"}</span>! Welcome to Elite Martial Arts. We've confirmed your trial for <span className="text-primary font-mono font-bold">{"{trial_date}"}</span>. See you on the mats! 🥋"
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Recent Sync Activity</h2>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#101322]">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Lead Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { source: 'FB Lead Form', name: 'John Wick', email: 'john.wick@continental.com', status: 'Synced', time: '2 mins ago', icon: Facebook, color: 'text-[#1877F2]' },
                { source: 'IG DM', name: 'Sarah Connor', email: 'connor.s@resistance.net', status: 'Synced', time: '14 mins ago', icon: Instagram, color: 'text-[#ee2a7b]' },
                { source: 'FB Lead Form', name: 'Bruce Wayne', email: 'bruce@waynecorp.com', status: 'Pending', time: '1 hour ago', icon: Facebook, color: 'text-[#1877F2]' },
              ].map((sync) => (
                <tr key={sync.email} className="hover:bg-primary/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <sync.icon className={cn("size-4", sync.color)} />
                      <span className="text-xs font-bold text-slate-300">{sync.source}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{sync.name}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{sync.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      sync.status === 'Synced' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                    )}>
                      {sync.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[11px] text-slate-500 font-medium">{sync.time}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-primary hover:underline text-xs font-bold uppercase tracking-widest">
                      {sync.status === 'Synced' ? 'View Pipeline' : 'Retrying...'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
