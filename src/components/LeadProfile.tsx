import React from 'react';
import { 
  ChevronRight, 
  Edit, 
  Share2, 
  Phone, 
  PhoneMissed, 
  Calendar, 
  Award, 
  MessageSquare, 
  Mail, 
  Mic, 
  ArrowRight,
  History,
  Rocket,
  Filter,
  Voicemail
} from 'lucide-react';
import { cn } from '../lib/utils';

export const LeadProfile: React.FC = () => {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto w-full">
      {/* Breadcrumbs & Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            <span>CRM</span>
            <ChevronRight className="size-3" />
            <span>Leads</span>
            <ChevronRight className="size-3" />
            <span className="text-primary">John Doe</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Lead Profile</h1>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 rounded-lg border border-white/10 text-slate-300 font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2">
            <Edit className="size-4" /> Edit Lead
          </button>
          <button className="px-5 py-2.5 rounded-lg bg-primary text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 transition-all flex items-center gap-2">
            <Share2 className="size-4" /> Share Lead
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left Column: Basic Info */}
        <aside className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-[#161b33]/60 backdrop-blur-xl rounded-xl border border-white/5 overflow-hidden shadow-sm">
            <div className="p-8 flex flex-col items-center text-center border-b border-white/5">
              <div className="relative group mb-4">
                <img 
                  className="size-28 rounded-full border-4 border-primary/20 object-cover" 
                  src="https://i.pravatar.cc/150?u=johndoe" 
                  alt="John Doe"
                />
                <div className="absolute bottom-2 right-2 bg-emerald-500 size-5 rounded-full border-4 border-[#101322]"></div>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">John Doe</h3>
              <p className="text-primary text-sm font-bold uppercase tracking-widest mt-1">Active Prospect</p>
              <div className="flex gap-2 mt-4">
                <span className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-bold rounded-full uppercase tracking-widest border border-primary/20">High Intent</span>
                <span className="px-3 py-1 bg-white/5 text-slate-400 text-[9px] font-bold rounded-full uppercase tracking-widest border border-white/5">BJJ Adult</span>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">Source</label>
                <div className="flex items-center gap-3">
                  <Rocket className="size-5 text-primary" />
                  <p className="text-sm font-bold text-slate-200">Meta Ads (Instagram)</p>
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">Interest Level</label>
                <div className="w-full bg-white/5 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-primary h-full w-[85%] rounded-full shadow-[0_0_15px_rgba(37,71,244,0.5)]"></div>
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">Contact Info</label>
                <p className="text-sm font-bold text-slate-200">john.doe@example.com</p>
                <p className="text-sm font-bold text-slate-200 mt-1">+1 (555) 012-3456</p>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 rounded-xl border border-primary/20 p-6">
            <h4 className="text-xs font-bold text-primary flex items-center gap-2 mb-4 uppercase tracking-widest">
              <Rocket className="size-4" /> Campaign Data
            </h4>
            <ul className="text-[11px] space-y-3 text-slate-400 font-bold uppercase tracking-wider">
              <li className="flex justify-between"><span>Ad Set:</span> <span className="text-slate-200">BJJ_Early_Bird</span></li>
              <li className="flex justify-between"><span>Lead Date:</span> <span className="text-slate-200">Oct 24, 2023</span></li>
              <li className="flex justify-between"><span>Lead ID:</span> <span className="text-slate-200">8829-AD</span></li>
            </ul>
          </div>
        </aside>

        {/* Center Column: Activity Timeline */}
        <section className="col-span-12 lg:col-span-6 space-y-6">
          <div className="bg-[#161b33]/60 backdrop-blur-xl rounded-xl border border-white/5 flex flex-col max-h-[800px]">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Activity Timeline</h3>
              <button className="text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:underline">
                <Filter className="size-4" /> Filter
              </button>
            </div>
            <div className="p-8 overflow-y-auto space-y-10 custom-scrollbar">
              {/* Timeline Items */}
              {[
                {
                  title: 'Call Log: Answered',
                  time: '2 hours ago',
                  content: 'Discussed trial options for the evening class. Lead is interested in the 6:00 PM Adult Fundamentals session.',
                  icon: Phone,
                  color: 'border-primary',
                  action: { icon: Voicemail, label: 'Listen to recording' }
                },
                {
                  title: 'Status Updated',
                  time: '5 hours ago',
                  content: (
                    <div className="flex items-center gap-3 mt-2">
                      <span className="px-2 py-1 rounded bg-white/5 text-slate-500 line-through text-[10px] font-bold uppercase">New Lead</span>
                      <ArrowRight className="size-3 text-slate-600" />
                      <span className="px-2 py-1 rounded bg-primary/20 text-primary text-[10px] font-bold uppercase">Contacted</span>
                    </div>
                  ),
                  icon: History,
                  color: 'border-primary/40'
                },
                {
                  title: 'Automated SMS Sent',
                  time: 'Yesterday, 10:45 AM',
                  content: (
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-xs italic text-slate-400 leading-relaxed mt-2">
                      "Hey John! Thanks for your interest in our BJJ classes. Ready to book your free intro?"
                    </div>
                  ),
                  icon: MessageSquare,
                  color: 'border-slate-700'
                },
                {
                  title: 'Lead Created via Meta API',
                  time: 'Oct 24, 09:12 AM',
                  content: 'New inquiry for \'Martial Arts for Beginners\' ad campaign.',
                  icon: Rocket,
                  color: 'bg-primary border-primary',
                  isDot: true
                }
              ].map((item, idx) => (
                <div key={idx} className="relative pl-10">
                  {idx !== 3 && <div className="absolute left-[3px] top-2 bottom-[-40px] w-0.5 bg-white/5"></div>}
                  <div className={cn(
                    "absolute left-[-4px] top-1 size-4 rounded-full border-2 bg-[#101322]",
                    item.color,
                    item.isDot && "bg-primary"
                  )}></div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white uppercase tracking-tight">{item.title}</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.time}</span>
                    </div>
                    <div className="text-sm text-slate-400 font-medium leading-relaxed">{item.content}</div>
                    {item.action && (
                      <div className="mt-3 flex items-center gap-2 text-primary">
                        <item.action.icon className="size-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:underline">{item.action.label}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Column: Dynamic Action Panel */}
        <aside className="col-span-12 lg:col-span-3 space-y-6">
          {/* Call Handling */}
          <div className="bg-[#161b33]/60 backdrop-blur-xl rounded-xl border border-white/5 overflow-hidden shadow-sm">
            <div className="p-4 bg-primary/10 border-b border-white/5">
              <h4 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
                <Phone className="size-4" /> Call Handling
              </h4>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/5 hover:bg-primary/10 transition-all group">
                <Phone className="size-6 text-emerald-500 mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-primary">Answered</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/5 hover:bg-white/5 transition-all group">
                <PhoneMissed className="size-6 text-rose-500 mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No Answer</span>
              </button>
            </div>
          </div>

          {/* Trial Booking */}
          <div className="bg-[#161b33]/60 backdrop-blur-xl rounded-xl border border-white/5 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-white/5">
              <h4 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
                <Calendar className="size-4" /> Trial Booking
              </h4>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-[9px] uppercase font-bold text-slate-500 block mb-2 tracking-widest">Select Date</label>
                <input className="w-full bg-[#0a0c1a] border border-white/10 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-primary" type="date" />
              </div>
              <div>
                <label className="text-[9px] uppercase font-bold text-slate-500 block mb-2 tracking-widest">Select Slot</label>
                <div className="grid grid-cols-2 gap-2">
                  <button className="text-[10px] font-bold uppercase tracking-widest py-2.5 rounded-lg border border-white/5 text-slate-500 hover:text-primary hover:border-primary transition-all">06:00 PM</button>
                  <button className="text-[10px] font-bold uppercase tracking-widest py-2.5 rounded-lg border border-primary bg-primary/10 text-primary">07:30 PM</button>
                </div>
              </div>
              <button className="w-full py-3 rounded-lg bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-primary/20">
                Book Intro Trial
              </button>
            </div>
          </div>

          {/* Membership Conversion */}
          <div className="bg-[#161b33]/60 backdrop-blur-xl rounded-xl border border-white/5 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-white/5">
              <h4 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
                <Award className="size-4" /> Convert to Member
              </h4>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-[9px] uppercase font-bold text-slate-500 block mb-2 tracking-widest">Plan Selection</label>
                <select className="w-full bg-[#0a0c1a] border border-white/10 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-primary appearance-none">
                  <option>BJJ Unlimited ($150/mo)</option>
                  <option>3 Sessions/Week ($120/mo)</option>
                  <option>Student Plan ($90/mo)</option>
                </select>
              </div>
              <button className="w-full py-3 rounded-lg border border-primary text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-primary/5 transition-all">
                Generate Contract
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#161b33]/80 backdrop-blur-2xl px-8 py-4 rounded-full flex items-center gap-8 shadow-2xl border border-white/10 z-[100]">
        <div className="flex items-center gap-6 border-r border-white/10 pr-8">
          <button className="flex items-center gap-2 group">
            <MessageSquare className="size-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white uppercase tracking-widest">Send SMS</span>
          </button>
          <button className="flex items-center gap-2 group">
            <Mail className="size-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white uppercase tracking-widest">Email</span>
          </button>
        </div>
        <button className="flex items-center gap-2 group bg-primary px-6 py-2.5 rounded-full text-white shadow-xl shadow-primary/40 hover:scale-105 transition-all">
          <Mic className="size-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Start Dialer</span>
        </button>
      </div>
    </div>
  );
};
