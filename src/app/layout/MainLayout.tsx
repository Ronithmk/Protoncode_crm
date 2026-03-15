import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import FloatingChatBot from "../../components/ui/FloatingChatBot";

export const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-base text-primary overflow-hidden font-sans">
      
      {/* ── Header ── */}
      <Header />

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* ── Sidebar ── */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
        />

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto bg-base">
          <Outlet />
        </main>
        
      </div>

        {/* Floating AI Chatbot */}
        <FloatingChatBot />
    </div>
  );
};