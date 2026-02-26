import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  KanbanSquare, 
  CalendarCheck, 
  CreditCard, 
  Zap, 
  Settings, 
  LogOut,
  ChevronRight,
  Bell,
  Search,
  Plus,
  Sword
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'WORKSPACE' },
    { id: 'pipeline', label: 'Lead Pipeline', icon: KanbanSquare, group: 'WORKSPACE' },
    { id: 'members', label: 'Active Members', icon: Users, group: 'WORKSPACE' },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, group: 'SALES & CRM' },
    { id: 'payments', label: 'Payments', icon: CreditCard, group: 'SALES & CRM' },
    { id: 'automations', label: 'Automations', icon: Zap, group: 'SALES & CRM' },
    { id: 'analytics', label: 'Analytics', icon: LayoutDashboard, group: 'SYSTEM' },
    { id: 'settings', label: 'Settings', icon: Settings, group: 'SYSTEM' },
  ];

  const groups = ['WORKSPACE', 'SALES & CRM', 'SYSTEM'];

  return (
    <aside className="w-64 border-r border-white/5 bg-[#0a0c1a] flex flex-col p-4 gap-2 shrink-0 overflow-y-auto h-screen sticky top-0 no-scrollbar">
      <div className="flex items-center gap-3 text-primary mb-8 px-2">
        <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <Zap className="size-6 fill-current" />
        </div>
        <div>
          <h2 className="text-white text-lg font-bold leading-tight tracking-tight">DojoCRM</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Elite Edition</p>
        </div>
      </div>

      {groups.map((group) => (
        <div key={group} className="mb-4">
          <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">{group}</h3>
          <div className="space-y-1">
            {menuItems
              .filter((item) => item.group === group)
              .map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                    activeTab === item.id 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  )}
                >
                  <item.icon className={cn("size-5", activeTab === item.id ? "text-white" : "text-slate-500 group-hover:text-slate-300")} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
          </div>
        </div>
      ))}

      <div className="mt-auto p-4 bg-primary/5 rounded-xl border border-primary/10">
        <p className="text-xs font-bold text-primary mb-1">New Meta Lead</p>
        <p className="text-[11px] text-slate-500 mb-2">John Doe just signed up via Facebook Ads.</p>
        <button className="w-full py-2 text-[11px] font-bold bg-primary text-white rounded-lg hover:brightness-110 transition-all">
          Review Lead
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5">
          <img 
            src="https://i.pravatar.cc/150?u=masterchen" 
            className="size-10 rounded-full border-2 border-primary/20" 
            alt="User"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">Master Chen</p>
            <p className="text-[10px] text-slate-500 truncate">Head Instructor</p>
          </div>
          <button className="text-slate-500 hover:text-white">
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
