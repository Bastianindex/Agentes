import React, { useState, useEffect } from 'react';
import { Search, Bot, Play, Pause, FolderGit2, Terminal, Settings, Zap, X } from 'lucide-react';
import { useAgentStore } from '../store/useAgentStore';

export default function CommandPalette({ onOpenTrigger, setActiveTab }) {
  const { commandPaletteOpen, setCommandPaletteOpen, agents, toggleAgentPause } = useAgentStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const actions = [
    { label: "Detonar Super Agente (Google Cloud)", icon: Zap, action: () => { setCommandPaletteOpen(false); onOpenTrigger(); } },
    { label: "Ir al Dashboard Principal", icon: Bot, action: () => { setCommandPaletteOpen(false); setActiveTab("dashboard"); } },
    { label: "Ver Repositorios & Proyectos GitHub", icon: FolderGit2, action: () => { setCommandPaletteOpen(false); setActiveTab("projects"); } },
    { label: "Inspeccionar Logs de Ejecuci?n", icon: Terminal, action: () => { setCommandPaletteOpen(false); setActiveTab("logs"); } },
    { label: "Configuraci?n y Secret Manager", icon: Settings, action: () => { setCommandPaletteOpen(false); setActiveTab("settings"); } },
  ];

  const filteredActions = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));
  const filteredAgents = agents.filter(a => a.name.toLowerCase().includes(query.toLowerCase()) || a.type.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-[#091124] border border-cyan-500/40 shadow-2xl overflow-hidden flex flex-col">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-cyan-400" />
          <input 
            autoFocus
            type="text" 
            placeholder="Buscar agentes, workflows, tareas o comandos... (Esc para salir)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm text-slate-100 placeholder-slate-500"
          />
          <button onClick={() => setCommandPaletteOpen(false)} className="text-slate-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="p-3 max-h-80 overflow-y-auto space-y-4 text-xs">
          {/* Quick Actions */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase px-2">Acciones R?pidas</span>
            {filteredActions.map((act, i) => {
              const Icon = act.icon;
              return (
                <button
                  key={i}
                  onClick={act.action}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 transition-all text-left cursor-pointer"
                >
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold">{act.label}</span>
                </button>
              );
            })}
          </div>

          {/* Agents Management */}
          {filteredAgents.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase px-2">Control de Agentes</span>
              {filteredAgents.map(ag => (
                <div key={ag.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    <span className="font-bold text-slate-200">{ag.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({ag.model})</span>
                  </div>
                  <button
                    onClick={() => toggleAgentPause(ag.id)}
                    className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-[10px] font-bold text-slate-300 hover:border-cyan-500 cursor-pointer"
                  >
                    {ag.status === "PAUSED" ? "Resume" : "Pause"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
