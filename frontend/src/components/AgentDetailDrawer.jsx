import React from 'react';
import { X, Play, Pause, Bot, Code2, CheckCircle2, ShieldAlert, Cpu, Sparkles, Terminal, Activity, Check } from 'lucide-react';
import { useAgentStore } from '../store/useAgentStore';

export default function AgentDetailDrawer({ agentId, onClose }) {
  const { agents, tasks, logs, toggleAgentPause } = useAgentStore();
  if (!agentId) return null;

  const agent = agents.find(a => a.id === agentId);
  if (!agent) return null;

  const agentTasks = tasks.filter(t => {
    if (!t) return false;
    const taskAgent = (t.agentName || t.agentId || "").toLowerCase();
    const currentAgentName = agent.name.toLowerCase();
    const currentAgentId = agent.id.toLowerCase();
    return t.agentId === agent.id || currentAgentName.includes(taskAgent) || taskAgent.includes(currentAgentId) || currentAgentId.includes(taskAgent);
  });

  const agentLogs = logs.filter(l => {
    if (!l) return false;
    const logAgent = (l.agentName || l.agentId || "").toLowerCase();
    const currentAgentName = agent.name.toLowerCase();
    const currentAgentId = agent.id.toLowerCase();
    return l.agentId === agent.id || currentAgentName.includes(logAgent) || logAgent.includes(currentAgentId) || currentAgentId.includes(logAgent);
  });

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#070c1a]/95 border-l border-cyan-500/30 backdrop-blur-2xl shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">{agent.name}</h3>
              <p className="text-xs text-cyan-400 font-mono">{agent.type}</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* State and Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-[#0a1226] border border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono block mb-1">STATUS</span>
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              {agent.status}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#0a1226] border border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono block mb-1">MODEL CORE</span>
            <span className="text-xs font-bold text-slate-200 truncate block">
              {agent.model}
            </span>
          </div>
        </div>

        {/* Current Task Progress */}
        <div className="p-4 rounded-xl bg-[#0a1226] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200">Current Task</span>
            <span className="text-cyan-400 font-mono font-bold">{agent.progress}%</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            {agent.currentTask}
          </p>
          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${agent.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Agent Assigned Tasks */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Assigned Tasks ({agentTasks.length})
          </h4>
          <div className="space-y-2">
            {agentTasks.map(t => (
              <div key={t.id} className="p-3 rounded-xl bg-[#0a1226] border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-200 truncate max-w-[240px]">{t.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 uppercase font-bold">
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-6 border-t border-slate-800 flex items-center gap-3">
        <button
          onClick={() => toggleAgentPause(agent.id)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-xs font-bold text-slate-200 transition-all cursor-pointer"
        >
          {agent.status === "PAUSED" ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
          <span>{agent.status === "PAUSED" ? "Resume Agent" : "Pause Agent"}</span>
        </button>

        <button 
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/30 cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
}
