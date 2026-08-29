import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Copy, Check, Trash2, Search, ArrowDown, Sparkles, Filter } from 'lucide-react';
import { useAgentStore } from '../store/useAgentStore';

export default function AgentLogsTerminal() {
  const { logs, setLogs, activeWorkflowRunning } = useAgentStore();
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const handleCopy = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.agentName || 'AGENT'}] [${l.severity || 'INFO'}]: ${l.message}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setLogs([]);
  };

  const filteredLogs = logs.filter(l => {
    const matchesSearch = searchQuery === "" || 
      (l.message || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.agentName || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity === "all" || (l.severity || "").toLowerCase() === filterSeverity.toLowerCase();
    return matchesSearch && matchesSeverity;
  });

  const getSeverityBadge = (sev) => {
    switch ((sev || "").toUpperCase()) {
      case "THINKING":
        return "text-indigo-400 bg-indigo-500/10 border-indigo-500/30";
      case "TOOL":
        return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
      case "SUCCESS":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "WARN":
        return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      case "ERROR":
        return "text-rose-400 bg-rose-500/10 border-rose-500/30";
      default:
        return "text-slate-400 bg-slate-800 border-slate-700";
    }
  };

  return (
    <div className="w-full rounded-2xl bg-[#070d1d]/90 border border-blue-500/20 flex flex-col overflow-hidden backdrop-blur-xl shadow-2xl min-h-[220px]">
      {/* Title & Toolbar Bar */}
      <div className="px-4 py-2.5 bg-[#050914] border-b border-slate-800 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold tracking-wider text-slate-200 uppercase font-mono">
            AGENT LOGS & TERMINAL
          </span>
          {activeWorkflowRunning && (
            <span className="flex items-center gap-1 px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-mono border border-cyan-500/40 animate-pulse">
              STREAMING
            </span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={handleCopy}
            title="Copiar logs"
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button 
            onClick={handleClear}
            title="Limpiar terminal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setAutoScroll(prev => !prev)}
            title={autoScroll ? "Pausar Auto-scroll" : "Activar Auto-scroll"}
            className={"p-1.5 rounded-lg transition-colors cursor-pointer " + (autoScroll ? "text-cyan-400 bg-cyan-500/10" : "text-slate-500 hover:bg-slate-800")}
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-4 py-1.5 bg-[#060b18] border-b border-slate-800/80 flex items-center justify-between text-xs gap-3">
        <div className="flex items-center gap-1.5 flex-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
          <Search className="w-3 h-3 text-slate-500" />
          <input 
            type="text" 
            placeholder="Filtrar logs o agentes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-[11px] text-slate-200 w-full placeholder-slate-600 font-mono"
          />
        </div>

        <div className="flex items-center gap-1">
          {["all", "thinking", "tool", "success"].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={"px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold transition-all cursor-pointer " + (
                filterSeverity === sev 
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" 
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Log Stream */}
      <div className="p-4 font-mono text-xs overflow-y-auto max-h-56 bg-[#040814] space-y-2 leading-relaxed">
        {filteredLogs.length === 0 ? (
          <div className="text-slate-600 text-center py-6 text-[11px]">
            No hay registros para este filtro.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-2.5 text-[11px] hover:bg-slate-900/50 p-1 rounded transition-colors group">
              <span className="text-slate-500 select-none text-[10px] shrink-0 font-mono">
                {log.timestamp}
              </span>
              <span className={"text-[9px] px-1.5 py-0.2 rounded border font-bold uppercase shrink-0 " + getSeverityBadge(log.severity)}>
                {log.severity || "INFO"}
              </span>
              <span className="text-cyan-300 font-bold uppercase shrink-0">
                {log.agentName || "AGENT"}:
              </span>
              <span className="text-slate-300 break-words flex-1">
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
