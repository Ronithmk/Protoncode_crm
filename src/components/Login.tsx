import React, { useState } from 'react';
import { Bolt, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('sensei@dojomaster.com');
  const [password, setPassword] = useState('password123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6 cyber-grid relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10"></div>

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="glass-card rounded-3xl p-8 md:p-12 shadow-2xl border-primary/10">
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="bg-primary size-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-primary/30">
              <Bolt className="size-10 fill-current" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Cyber CRM</h1>
            <p className="text-slate-500 text-sm font-medium">Lead Lifecycle Management for Modern Dojos</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background-dark/50 border border-border-dark rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-700"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background-dark/50 border border-border-dark rounded-2xl py-3 pl-12 pr-12 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-700"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="rounded border-border-dark bg-background-dark text-primary focus:ring-primary/50 size-4" />
                <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-xs text-primary font-bold hover:underline">Forgot Password?</a>
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:brightness-110 text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
            >
              Sign In to Dashboard
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-dark/50"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#16162d] px-4 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Enterprise</span>
            </div>
          </div>

          {/* SSO */}
          <button className="w-full bg-background-dark/50 border border-border-dark hover:border-primary/50 text-slate-300 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all group">
            <ShieldCheck className="size-5 text-slate-500 group-hover:text-primary transition-colors" />
            <span className="text-sm">SSO Login</span>
          </button>
        </div>

        <p className="text-center mt-8 text-xs text-slate-500">
          Don't have an account? <a href="#" className="text-primary font-bold hover:underline">Contact administration</a>
        </p>
      </div>

      {/* Footer Status */}
      <div className="absolute bottom-6 left-6 flex items-center gap-2 text-[9px] font-bold text-slate-700 uppercase tracking-widest">
        <ShieldCheck className="size-3" />
        Protocol V4.2.0 Active
      </div>
    </div>
  );
};
