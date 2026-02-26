import React from 'react';
import { 
  TrendingUp, 
  Minus, 
  History, 
  Calendar, 
  Phone, 
  CheckCircle2, 
  ArrowRight,
  ChevronRight,
  Plus
} from 'lucide-react';
import { STATS, FUNNEL_DATA } from '../types';
import { cn } from '../lib/utils';

export const Dashboard: React.FC = () => {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Strategic Overview</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wide">Live Performance</span>
            <p className="text-slate-500 text-sm">Real-time martial arts business performance tracking</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
            <Calendar className="size-4 text-primary" />
            <span className="text-sm font-semibold text-slate-300">Oct 1, 2023 - Oct 31, 2023</span>
          </div>
          <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-xl shadow-primary/20">
            <Plus className="size-4" />
            New Lead
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat) => (
          <div key={stat.label} className={cn(
            "bg-[#161b33]/60 backdrop-blur-xl p-6 rounded-xl border border-white/5 hover:shadow-2xl transition-all border-l-4 group",
            stat.color
          )}>
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
              <span className={cn(
                "text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
                stat.trend.startsWith('+') ? "text-emerald-500 bg-emerald-500/10" : "text-slate-400 bg-slate-500/10"
              )}>
                {stat.trend.startsWith('+') ? <TrendingUp className="size-3" /> : <Minus className="size-3" />}
                {stat.trend}
              </span>
            </div>
            <h3 className="text-3xl font-extrabold tracking-tight text-white">{stat.value}</h3>
            <p className="text-slate-400 text-[10px] mt-2 font-medium">{stat.subtext}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Funnel Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#161b33]/60 backdrop-blur-xl p-8 rounded-xl border border-white/5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-white">Conversion Funnel</h3>
                <p className="text-sm text-slate-500">Analysis of Meta Lead to Membership Lifecycle</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-white/5 text-xs font-bold text-white hover:bg-white/10 transition-colors">Last 30 Days</button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500">Yearly</button>
              </div>
            </div>
            
            <div className="space-y-6">
              {FUNNEL_DATA.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="text-white">{item.percentage}%</span>
                  </div>
                  <div className="w-full h-10 bg-white/5 rounded-lg overflow-hidden flex items-center px-4 relative">
                    <div className={cn("absolute inset-y-0 left-0 opacity-20 w-full", item.color)}></div>
                    <div 
                      className={cn("absolute inset-y-0 left-0 transition-all duration-1000", item.color)}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                    <span className="relative z-10 text-sm font-extrabold text-white">{item.value} {item.label.split(' ')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#161b33]/60 backdrop-blur-xl p-6 rounded-xl border border-white/5 flex items-center gap-4">
              <div className="size-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <TrendingUp className="size-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lead Drop-off Alert</p>
                <p className="text-sm font-bold text-white">35% drop-off at Contact Stage</p>
              </div>
            </div>
            <div className="bg-[#161b33]/60 backdrop-blur-xl p-6 rounded-xl border border-white/5 flex items-center gap-4">
              <div className="size-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="size-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Trial Success</p>
                <p className="text-sm font-bold text-white">85% attendance for booked trials</p>
              </div>
            </div>
          </div>
        </div>

        {/* Side Feed */}
        <div className="space-y-8">
          <section className="bg-[#161b33]/60 backdrop-blur-xl rounded-xl border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="font-bold text-sm flex items-center gap-2 uppercase tracking-wide text-white">
                <History className="size-4 text-primary" />
                Daily Follow-ups
              </h3>
              <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">4 Due</span>
            </div>
            <div className="divide-y divide-white/5">
              {[
                { name: 'Sarah Jenkins', time: '2 hours ago', icon: 'social_leaderboard', avatar: 'https://i.pravatar.cc/150?u=sarahj' },
                { name: 'Marcus Thorne', time: '5 hours ago', icon: 'retweet', avatar: 'https://i.pravatar.cc/150?u=marcus' },
                { name: 'Elena Rodriguez', time: 'Yesterday', icon: 'social_leaderboard', avatar: 'https://i.pravatar.cc/150?u=elena' },
              ].map((followup) => (
                <div key={followup.name} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer group">
                  <img src={followup.avatar} className="size-10 rounded-full flex-shrink-0 border border-white/10" alt={followup.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{followup.name}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <History className="size-3" /> {followup.time}
                    </p>
                  </div>
                  <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                    <Phone className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white/5 text-center">
              <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">View All Leads</button>
            </div>
          </section>

          <section className="bg-[#161b33]/60 backdrop-blur-xl rounded-xl border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="font-bold text-sm flex items-center gap-2 uppercase tracking-wide text-white">
                <Calendar className="size-4 text-purple-500" />
                Upcoming Trials
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex flex-col items-center justify-center min-w-[40px]">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Oct</span>
                  <span className="text-lg font-extrabold leading-none text-white">24</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">Intro Jiu-Jitsu Class</p>
                  <p className="text-[10px] text-slate-500 mb-2">4:30 PM • 3 Attending</p>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <img key={i} src={`https://i.pravatar.cc/150?u=${i}`} className="size-6 rounded-full border-2 border-[#101322]" alt="User" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex flex-col items-center justify-center min-w-[40px]">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Oct</span>
                  <span className="text-lg font-extrabold leading-none text-white">25</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">Youth Kickboxing Trial</p>
                  <p className="text-[10px] text-slate-500 mb-2">5:15 PM • 1 Attending</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
