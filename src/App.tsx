import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { LeadPipeline } from './components/LeadPipeline';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { LeadProfile } from './components/LeadProfile';
import { Login } from './components/Login';
import { Search, Bell } from 'lucide-react';

import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard key="dashboard" />;
      case 'pipeline':
        return <LeadPipeline key="pipeline" />;
      case 'analytics':
        return <Analytics key="analytics" />;
      case 'settings':
        return <Settings key="settings" />;
      case 'members':
        return <LeadProfile key="profile" />;
      default:
        return <Dashboard key="dashboard" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background-dark font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 sticky top-0 bg-background-dark/80 backdrop-blur-md z-50 border-b border-white/5">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black tracking-tight text-white uppercase">
              {activeTab === 'dashboard' ? 'Strategic Overview' : 
               activeTab === 'pipeline' ? 'Lead Pipeline' : 
               activeTab === 'analytics' ? 'Growth & Analytics' : 
               activeTab === 'settings' ? 'Meta Lead Sync' : 'Lead Profile'}
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative group hidden md:block">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-500 group-focus-within:text-primary transition-colors">
                <Search className="size-4" />
              </span>
              <input 
                className="w-64 bg-white/5 border-none focus:ring-2 focus:ring-primary/40 rounded-lg pl-10 text-sm text-white placeholder:text-slate-600" 
                placeholder="Search members or leads..." 
                type="text"
              />
            </div>
            
            <button className="relative p-2 text-slate-500 hover:bg-white/5 rounded-lg transition-colors">
              <Bell className="size-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-background-dark"></span>
            </button>
            
            <div className="h-8 w-px bg-white/5"></div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden xl:block">
                <p className="text-xs font-bold text-white">Alex Rivera</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Dojo Owner</p>
              </div>
              <img 
                src="https://i.pravatar.cc/150?u=alex" 
                className="size-9 rounded-full border-2 border-primary/20" 
                alt="Profile"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
