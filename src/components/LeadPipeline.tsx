import React from 'react';
import { 
  Search, 
  Download, 
  UserPlus, 
  Filter, 
  MoreVertical, 
  Phone, 
  ChevronLeft, 
  ChevronRight,
  Megaphone,
  Globe,
  UserX
} from 'lucide-react';
import { MOCK_LEADS } from '../types';
import { cn } from '../lib/utils';

export const LeadPipeline: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-500">
      <div className="p-8 pb-2 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Lead Pipeline</h1>
            <p className="text-slate-500 text-sm">Managing 1,284 leads from Meta Ads campaigns</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 text-slate-300 text-sm font-bold rounded-lg hover:bg-white/10 transition-colors border border-white/10">
              <Download className="size-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-xl shadow-primary/20 hover:brightness-110 transition-all">
              <UserPlus className="size-4" />
              Add New Lead
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/5">
          <div className="relative flex items-center flex-1 max-w-sm">
            <Search className="absolute left-3 text-slate-500 size-5" />
            <input 
              className="w-full h-10 bg-transparent border-none focus:ring-0 text-sm placeholder:text-slate-500 pl-10 text-white" 
              placeholder="Search by name, email, phone..."
            />
          </div>
          <div className="h-6 w-px bg-white/10 mx-1"></div>
          
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#101322] rounded-lg text-[10px] font-bold uppercase tracking-wider border border-white/5 hover:border-primary/40 transition-all text-slate-400">
            <span className="text-slate-500">Center:</span>
            <span className="text-white">All Locations</span>
            <ChevronRight className="size-3 rotate-90" />
          </button>
          
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#101322] rounded-lg text-[10px] font-bold uppercase tracking-wider border border-white/5 hover:border-primary/40 transition-all text-slate-400">
            <span className="text-slate-500">Source:</span>
            <span className="flex items-center gap-1 text-white"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Meta Ads</span>
            <ChevronRight className="size-3 rotate-90" />
          </button>

          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#101322] rounded-lg text-[10px] font-bold uppercase tracking-wider border border-white/5 hover:border-primary/40 transition-all text-slate-400">
            <span className="text-slate-500">Stage:</span>
            <span className="text-primary">Trial Scheduled</span>
            <ChevronRight className="size-3 rotate-90" />
          </button>

          <button className="ml-auto p-2 text-slate-500 hover:text-primary transition-colors">
            <Filter className="size-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8 pb-6 custom-scrollbar">
        <table className="w-full border-separate border-spacing-y-2">
          <thead className="sticky top-0 bg-[#101322]/95 backdrop-blur-sm z-10">
            <tr className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <th className="px-4 py-3"><input className="rounded bg-transparent border-white/20 text-primary focus:ring-primary" type="checkbox"/></th>
              <th className="px-4 py-3">Lead Details</th>
              <th className="px-4 py-3">Source & Campaign</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Relationship Manager</th>
              <th className="px-4 py-3">Last Activity</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_LEADS.map((lead) => (
              <tr key={lead.id} className="group bg-white/5 hover:bg-primary/5 transition-colors border-y border-white/5">
                <td className="px-4 py-4 rounded-l-xl border-l border-y border-white/5">
                  <input className="rounded bg-transparent border-white/20 text-primary focus:ring-primary" type="checkbox"/>
                </td>
                <td className="px-4 py-4 border-y border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={cn("size-9 rounded-full flex items-center justify-center font-bold text-xs", lead.color)}>
                      {lead.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{lead.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{lead.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 border-y border-white/5">
                  <span className={cn(
                    "px-2 py-1 rounded text-[9px] font-bold flex items-center gap-1 w-fit uppercase tracking-wider",
                    lead.source === 'Meta Ads' ? "bg-blue-500/10 text-blue-500" : "bg-slate-500/10 text-slate-400"
                  )}>
                    {lead.source === 'Meta Ads' ? <Megaphone className="size-3" /> : <Globe className="size-3" />}
                    {lead.campaign}
                  </span>
                </td>
                <td className="px-4 py-4 border-y border-white/5">
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold border",
                    lead.stage === 'Trial Scheduled' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                    lead.stage === 'New Lead' ? "bg-primary/10 text-primary border-primary/20" :
                    lead.stage === 'Attempted Call' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                    "bg-slate-500/10 text-slate-500 border-slate-500/20"
                  )}>
                    {lead.stage}
                  </span>
                </td>
                <td className="px-4 py-4 border-y border-white/5">
                  <div className="flex items-center gap-2">
                    {lead.managerAvatar ? (
                      <img className="size-6 rounded-full object-cover border border-white/10" src={lead.managerAvatar} alt={lead.manager} />
                    ) : (
                      <UserX className="size-6 text-slate-600" />
                    )}
                    <span className="text-[11px] font-medium text-slate-300">{lead.manager}</span>
                  </div>
                </td>
                <td className="px-4 py-4 border-y border-white/5">
                  <p className="text-[11px] font-bold text-slate-200">{lead.lastActivity}</p>
                  <p className="text-[9px] text-slate-500 font-medium">{lead.lastActivityType}</p>
                </td>
                <td className="px-4 py-4 rounded-r-xl border-r border-y border-white/5 text-right">
                  <div className="flex justify-end gap-2">
                    <button className={cn(
                      "p-1.5 rounded-lg text-white shadow-lg transition-all",
                      lead.stage === 'Disqualified' ? "bg-slate-700 opacity-50 cursor-not-allowed" : "bg-emerald-500 shadow-emerald-500/20 hover:brightness-110"
                    )}>
                      <Phone className="size-4" />
                    </button>
                    <button className="p-1.5 rounded-lg bg-white/5 text-slate-500 hover:text-primary transition-colors">
                      <MoreVertical className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="px-8 py-4 border-t border-white/5 flex items-center justify-between bg-[#0a0c1a]/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <p className="text-[11px] text-slate-500 font-medium">Showing <span className="font-bold text-white">1-10</span> of 1,284 leads</p>
          <select className="bg-transparent border-none text-[11px] font-bold text-slate-400 focus:ring-0 cursor-pointer uppercase tracking-wider">
            <option>10 per page</option>
            <option>25 per page</option>
            <option>50 per page</option>
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded hover:bg-white/5 text-slate-500 disabled:opacity-30" disabled>
            <ChevronLeft className="size-4" />
          </button>
          <button className="px-3 py-1 text-xs font-bold rounded bg-primary text-white shadow-lg shadow-primary/20">1</button>
          <button className="px-3 py-1 text-xs font-bold rounded text-slate-400 hover:bg-white/5 transition-colors">2</button>
          <button className="px-3 py-1 text-xs font-bold rounded text-slate-400 hover:bg-white/5 transition-colors">3</button>
          <span className="px-2 text-slate-600">...</span>
          <button className="px-3 py-1 text-xs font-bold rounded text-slate-400 hover:bg-white/5 transition-colors">129</button>
          <button className="p-2 rounded hover:bg-white/5 text-slate-500">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};
