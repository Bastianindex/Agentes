import React from 'react';
import { 
  LayoutDashboard, 
  FolderGit2, 
  Bot, 
  Terminal, 
  Settings, 
  Sparkles,
  Zap,
  Activity,
  X
} from 'lucide-react';
import { useAgentStore } from '../store/useAgentStore';

export default function Sidebar({ activeTab, setActiveTab, onOpenTrigger, isMobileOpen, onCloseMobile }) {
  const { agents } = useAgentStore();
  const activeCount = agents.filter(a => a.status === "RUNNING").length;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'agents', label: 'Agents', icon: Bot, badge: activeCount > 0 ? `${activeCount} active` : null },
    { id: 'logs', label: 'Logs', icon: Terminal },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelectTab = (id) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-4">
      <div className="flex flex-col gap-6">
        {/* Brand Logo & Mobile Close */}
        <div className="flex items-center justify-between px-2 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 p-[1.5px] shadow-lg shadow-cyan-500/30">
              <div className="w-full h-full bg-[#070d1d] rounded-[10px] flex items-center justify-center">
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-blue-400 to-indigo-400 text-lg">
                  N
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black tracking-wider text-sm text-white">NEXUS</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  OS
                </span>
              </div>
              <p className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">Agent Mission Control</p>
            </div>
          </div>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button 
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={"w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer group " + (
                  isActive
                    ? "bg-[#0b1736] text-cyan-300 border border-cyan-500/50 shadow-lg shadow-cyan-500/15"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={"w-4 h-4 transition-transform duration-200 group-hover:scale-110 " + (
                    isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200"
                  )} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Cloud Trigger Card */}
      <div className="flex flex-col gap-3">
        <div className="p-3.5 rounded-2xl bg-[#081124] border border-cyan-500/30 relative overflow-hidden group shadow-lg">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200">100% Cloud Core</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            Google Gemini 3.7 + NVIDIA Nemotron 120B en GitHub.
          </p>
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onOpenTrigger();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold tracking-wide transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>Detonar Flujo</span>
          </button>
        </div>

        {/* System Health */}
        <div className="flex items-center justify-between px-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-slate-300 font-mono">Cloud Online</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400">v3.2 Production</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile, visible on lg+) */}
      <aside className="hidden lg:flex w-60 h-screen border-r border-blue-500/15 flex-col justify-between bg-[#050914] z-30 select-none shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay (visible only on mobile when open) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          ></div>

          {/* Drawer Panel */}
          <aside className="relative w-72 max-w-[80vw] h-full bg-[#050914] border-r border-cyan-500/30 z-10 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
