import React from 'react';
import { Settings, Bell, Search, Zap, Command, CheckCircle2, GitFork, Menu } from 'lucide-react';
import { useAgentStore } from '../store/useAgentStore';

export default function TopHeader({ pageTitle = "Dashboard", onOpenTrigger, setActiveTab, onOpenMobileMenu }) {
  const { setCommandPaletteOpen, repoUrl } = useAgentStore();

  return (
    <header className="h-16 px-4 sm:px-6 border-b border-blue-500/15 flex items-center justify-between bg-[#040814]/80 backdrop-blur-xl z-20 select-none">
      {/* Left: Mobile Menu Trigger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all cursor-pointer"
          title="Abrir Menú"
        >
          <Menu className="w-4 h-4" />
        </button>

        <h1 className="text-base sm:text-lg font-black tracking-tight text-white">{pageTitle}</h1>

        {repoUrl ? (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-cyan-500/30 text-xs text-slate-300">
            <GitFork className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-cyan-300 truncate max-w-[220px]">
              {repoUrl.replace("https://github.com/", "")}
            </span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>Cloud Cluster Ready</span>
          </div>
        )}
      </div>

      {/* Right: Search, Actions, Notifications */}
      <div className="flex items-center gap-3">
        {/* Quick Search / Command Palette Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-slate-200 text-xs transition-all cursor-pointer shadow-sm"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span>Buscar o comandos...</span>
          <kbd className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-slate-800 rounded text-slate-400 border border-slate-700">
            ?K
          </kbd>
        </button>

        {/* Detonate Agent CTA */}
        <button
          onClick={onOpenTrigger}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black tracking-wide transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 fill-slate-950" />
          <span className="hidden sm:inline">Detonar Agente</span>
        </button>

        {/* Notifications Button */}
        <div className="relative">
          <button className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer">
            <Bell className="w-4 h-4" />
          </button>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-950"></span>
        </div>

        {/* Settings */}
        <button 
          onClick={() => setActiveTab("settings")}
          className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Profile Avatar */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1.5px] cursor-pointer">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-xs text-cyan-300">
            OP
          </div>
        </div>
      </div>
    </header>
  );
}
