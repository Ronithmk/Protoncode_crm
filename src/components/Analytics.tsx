import React from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MousePointer2, 
  DollarSign, 
  UserPlus,
  MoreVertical,
  Calendar,
  RefreshCw,
  Download,
  Bell,
  Minus
} from 'lucide-react';
import { cn } from '../lib/utils';

const LINE_DATA = [
  { name: 'Mon', value: 150 },
  { name: 'Tue', value: 130 },
  { name: 'Wed', value: 160 },
  { name: 'Thu', value: 120 },
  { name: 'Fri', value: 180 },
  { name: 'Sat', value: 100 },
  { name: 'Sun', value: 200 },
];

const BAR_DATA = [
  { name: 'Jan', value: 40 },
  { name: 'Feb', value: 65 },
  { name: 'Mar', value: 55 },
  { name: 'Apr', value: 85 },
  { name: 'May', value: 70 },
  { name: 'Jun', value: 95 },
];

export const Analytics: React.FC = () => {
  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-500 max-w-[1440px] mx-auto w-full">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-white text-4xl font-black tracking-tight">Growth & Analytics Intelligence</h1>
          <p className="text-slate-500 text-lg">Real-time martial arts business performance tracking</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#101322] rounded-lg shadow-sm">
            <Calendar className="size-4 text-primary" />
            <span className="text-sm font-semibold text-slate-300">Oct 1, 2023 - Oct 31, 2023</span>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400">
            <RefreshCw className="size-5" />
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Leads', value: '1,284', trend: '+12.4%', icon: Users, color: 'text-primary', glow: 'shadow-primary/10' },
          { label: 'Conversion Rate', value: '18.5%', trend: '+2.1%', icon: MousePointer2, color: 'text-purple-500', glow: 'shadow-purple-500/10' },
          { label: 'Ad Spend', value: '$4,200', trend: '-5.3%', icon: DollarSign, color: 'text-slate-400', glow: '' },
          { label: 'Member Growth', value: '+124', trend: '+8.7%', icon: UserPlus, color: 'text-primary', glow: 'shadow-primary/10' },
        ].map((kpi) => (
          <div key={kpi.label} className={cn(
            "bg-[#161b33]/40 backdrop-blur-sm border border-white/5 p-6 rounded-xl hover:border-primary/50 transition-all shadow-xl",
            kpi.glow
          )}>
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{kpi.label}</p>
              <kpi.icon className={cn("size-5", kpi.color)} />
            </div>
            <p className="text-white text-3xl font-bold mb-1">{kpi.value}</p>
            <div className={cn(
              "flex items-center gap-1.5 font-bold text-xs",
              kpi.trend.startsWith('+') ? "text-emerald-500" : "text-orange-500"
            )}>
              {kpi.trend.startsWith('+') ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              <span>{kpi.trend}</span>
              <span className="text-slate-500 font-normal ml-1">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Meta Ads Performance */}
        <div className="lg:col-span-1 flex flex-col gap-6 bg-[#161b33]/20 border border-white/5 rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white text-lg font-bold">Meta Ads Performance</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-3xl font-black text-primary">45.2k</span>
                <span className="text-emerald-500 text-[10px] font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">+15%</span>
              </div>
            </div>
            <button className="text-slate-500 hover:text-white"><MoreVertical className="size-5" /></button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={LINE_DATA}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2547f4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2547f4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#2547f4" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161b33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Growth */}
        <div className="lg:col-span-1 flex flex-col gap-6 bg-[#161b33]/20 border border-white/5 rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white text-lg font-bold">Sales Growth</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-3xl font-black text-purple-500">$12,400</span>
                <span className="text-emerald-500 text-[10px] font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">+22%</span>
              </div>
            </div>
            <button className="text-slate-500 hover:text-white"><MoreVertical className="size-5" /></button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BAR_DATA}>
                <Bar dataKey="value" fill="#a855f7" radius={[4, 4, 0, 0]} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#161b33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RM Call Performance */}
        <div className="lg:col-span-1 flex flex-col gap-6 bg-[#161b33]/20 border border-white/5 rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white text-lg font-bold">RM Call Performance</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-3xl font-black text-white">88%</span>
                <span className="text-emerald-500 text-[10px] font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">Optimal</span>
              </div>
            </div>
            <button className="text-slate-500 hover:text-white"><MoreVertical className="size-5" /></button>
          </div>
          <div className="space-y-6 pt-4">
            {[
              { team: 'Team Alpha', value: 94, color: 'bg-primary' },
              { team: 'Team Bravo', value: 82, color: 'bg-purple-500' },
              { team: 'Team Charlie', value: 71, color: 'bg-slate-500' },
              { team: 'Team Delta', value: 45, color: 'bg-slate-700' },
            ].map((team) => (
              <div key={team.team} className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-500">{team.team}</span>
                  <span className="text-white">{team.value}%</span>
                </div>
                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-1000", team.color)} style={{ width: `${team.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Table */}
      <div className="bg-[#161b33]/20 border border-white/5 rounded-xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Recent Meta Leads Performance</h3>
          <button className="text-primary text-sm font-bold hover:underline">View All Leads</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Campaign Name</th>
                <th className="px-6 py-4">Leads</th>
                <th className="px-6 py-4">CPL</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { name: 'Trial Pass Special - Oct 23', leads: 412, cpl: '$8.40', status: 'Active', trend: 'up' },
                { name: 'Kids MMA - Fall Enrollment', leads: 288, cpl: '$12.10', status: 'Active', trend: 'up' },
                { name: 'Adult BJJ Intro Course', leads: 194, cpl: '$15.50', status: 'Paused', trend: 'neutral' },
              ].map((campaign) => (
                <tr key={campaign.name} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <TrendingUp className="size-4" />
                      </div>
                      <span className="font-bold text-slate-200 text-sm">{campaign.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-extrabold text-white">{campaign.leads}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm font-medium">{campaign.cpl}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      campaign.status === 'Active' ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 text-slate-500"
                    )}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {campaign.trend === 'up' ? <TrendingUp className="size-4 text-emerald-500 ml-auto" /> : <Minus className="size-4 text-slate-500 ml-auto" />}
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
