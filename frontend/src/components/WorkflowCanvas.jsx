import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Code2, 
  CheckCircle2, 
  ShieldAlert, 
  TerminalSquare, 
  FlaskConical, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Play, 
  Pause, 
  Eye, 
  GitBranch, 
  UploadCloud, 
  Bug, 
  Check, 
  Settings,
  Sparkles,
  Activity
} from 'lucide-react';
import { useAgentStore } from '../store/useAgentStore';

export default function WorkflowCanvas({ onSelectAgent }) {
  const { agents, activeWorkflowRunning, setActiveWorkflowRunning, toggleAgentPause } = useAgentStore();
  const [zoom, setZoom] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showConnections, setShowConnections] = useState(true);
  const containerRef = useRef(null);

  const superAgent = agents.find(a => a.id === "super-admin") || agents[0];
  const developer = agents.find(a => a.id === "developer");
  const qaAnalyst = agents.find(a => a.id === "qa-analyst");
  const security = agents.find(a => a.id === "security-auditor");
  const devops = agents.find(a => a.id === "devops-deployer");
  const dataScientist = agents.find(a => a.id === "data-scientist");

  const getStatusBadge = (status) => {
    switch (status) {
      case "RUNNING":
        return { bg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40", dot: "bg-cyan-400 animate-ping", label: "Running" };
      case "THINKING":
        return { bg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40", dot: "bg-indigo-400 animate-pulse", label: "Thinking" };
      case "SUCCESS":
        return { bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40", dot: "bg-emerald-400", label: "Active" };
      case "PAUSED":
        return { bg: "bg-amber-500/20 text-amber-300 border-amber-500/40", dot: "bg-amber-400", label: "Paused" };
      default:
        return { bg: "bg-slate-800 text-slate-400 border-slate-700", dot: "bg-slate-500", label: "Idle" };
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full rounded-2xl bg-[#070d1d]/90 border border-blue-500/20 p-5 flex flex-col relative overflow-hidden backdrop-blur-xl shadow-2xl group"
    >
      {/* Top Toolbar */}
      <div className="flex items-center justify-between z-20 pb-3 border-b border-slate-800/80 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold tracking-wider text-slate-200 uppercase font-mono">
              AGENT WORKFLOW GRAPH
            </h2>
          </div>

          <span className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-mono border border-cyan-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            Live Topology
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-900/90 rounded-lg border border-slate-800 p-0.5">
            <button 
              onClick={() => setZoom(prev => Math.max(0.7, prev - 0.1))}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1.5 text-slate-400">
              {Math.round(zoom * 100)}%
            </span>
            <button 
              onClick={() => setZoom(prev => Math.min(1.3, prev + 0.1))}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setZoom(1)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors border-l border-slate-800 ml-0.5"
              title="Reset View"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Toggle Flow Pause */}
          <button
            onClick={() => setActiveWorkflowRunning(prev => !prev)}
            className={"flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all border " + (
              activeWorkflowRunning 
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30" 
                : "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
            )}
          >
            {activeWorkflowRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{activeWorkflowRunning ? "Flowing" : "Paused"}</span>
          </button>
        </div>
      </div>

      {/* Scalable Canvas Content */}
      <div className="relative flex-1 w-full h-full min-h-[580px] overflow-x-auto overflow-y-hidden flex items-center justify-center">
        <div 
          className="relative w-full h-full min-w-[720px] min-h-[580px] flex items-center justify-center"
          style={{ transform: `scale(${zoom})`, transformOrigin: "center center", transition: "transform 0.2s ease-out" }}
        >
        {/* SVG Bezier Splines Overlay with Standard ViewBox Numbers */}
        {showConnections && (
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none z-0" 
            viewBox="0 0 1000 600" 
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="cyanDataStream" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#818cf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="emeraldDataStream" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
              </linearGradient>
              <filter id="glowEffect" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Path 1: Super Agent to Developer (Top Left) */}
            <path
              d="M 500 300 C 350 300, 260 110, 160 110"
              fill="none"
              stroke="url(#cyanDataStream)"
              strokeWidth="2.5"
              filter="url(#glowEffect)"
              className={activeWorkflowRunning ? "animate-dash-flow" : ""}
            />

            {/* Path 2: Super Agent to QA Analyst (Top Right) */}
            <path
              d="M 500 300 C 650 300, 740 110, 840 110"
              fill="none"
              stroke="url(#emeraldDataStream)"
              strokeWidth="2.5"
              filter="url(#glowEffect)"
              className={activeWorkflowRunning ? "animate-dash-flow" : ""}
            />

            {/* Path 3: Super Agent to Security Auditor (Bottom Left) */}
            <path
              d="M 500 300 C 350 300, 260 480, 160 480"
              fill="none"
              stroke="url(#cyanDataStream)"
              strokeWidth="2.5"
              filter="url(#glowEffect)"
              className={activeWorkflowRunning ? "animate-dash-flow" : ""}
            />

            {/* Path 4: Super Agent to DevOps (Mid Right) */}
            <path
              d="M 500 300 C 650 300, 740 310, 840 310"
              fill="none"
              stroke="url(#cyanDataStream)"
              strokeWidth="2.5"
              filter="url(#glowEffect)"
              className={activeWorkflowRunning ? "animate-dash-flow" : ""}
            />

            {/* Path 5: Super Agent to Data Scientist (Bottom Right) */}
            <path
              d="M 500 300 C 650 420, 740 500, 840 500"
              fill="none"
              stroke="url(#emeraldDataStream)"
              strokeWidth="2.5"
              filter="url(#glowEffect)"
              className={activeWorkflowRunning ? "animate-dash-flow" : ""}
            />
          </svg>
        )}

        {/* ============================================================== */}
        {/* CENTER NODE: SUPER AGENT CORE                                  */}
        {/* ============================================================== */}
        {superAgent && (
          <div 
            onClick={() => onSelectAgent(superAgent.id)}
            className="absolute z-20 w-[190px] p-3.5 rounded-2xl bg-[#09152e]/95 border-2 border-cyan-400 shadow-[0_0_35px_rgba(56,189,248,0.4)] hover:shadow-[0_0_45px_rgba(56,189,248,0.6)] cursor-pointer transition-all duration-300 hover:scale-105"
            style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-cyan-300">AI-100 CORE</span>
              {(() => {
                const b = getStatusBadge(superAgent.status);
                return (
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${b.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${b.dot}`}></span>
                    {b.label}
                  </span>
                );
              })()}
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1.5px] shadow-lg shadow-cyan-500/30">
                <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-cyan-300 animate-pulse" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-black tracking-wide text-white truncate">{superAgent.name}</h3>
                <p className="text-[10px] text-cyan-400 font-mono truncate">{superAgent.model}</p>
              </div>
            </div>

            {/* Mini Progress Bar */}
            <div className="mt-2.5 pt-2 border-t border-cyan-500/30 flex items-center justify-between text-[9px] text-slate-300 font-mono">
              <span>Runtime: {superAgent.runtime}</span>
              <span className="text-cyan-300 font-bold">{superAgent.progress}%</span>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* NODE 1: DEVELOPER (Top Left)                                   */}
        {/* ============================================================== */}
        {developer && (
          <div 
            onClick={() => onSelectAgent(developer.id)}
            className="absolute z-10 w-[200px] p-3 rounded-2xl bg-[#09132b]/95 border border-indigo-500/40 hover:border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] cursor-pointer transition-all duration-300 hover:scale-105"
            style={{ top: '5%', left: '4%' }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-mono text-slate-400">AI-100</span>
              {(() => {
                const b = getStatusBadge(developer.status);
                return (
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border flex items-center gap-1 ${b.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${b.dot}`}></span>
                    {b.label}
                  </span>
                );
              })()}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                <Code2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black text-white truncate">{developer.name}</h4>
                <p className="text-[9px] text-slate-400 font-mono truncate">{developer.model}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[9px] text-slate-400 mb-2">
              <span>{developer.taskCount} Tasks</span>
              <span className="text-indigo-300 font-semibold font-mono">Auto-Commit</span>
            </div>

            {/* Sub actions */}
            <div className="space-y-1">
              <div className="p-1.5 rounded-lg bg-[#060b18] border border-indigo-500/30 flex items-center gap-1.5 text-[9px] text-slate-300">
                <GitBranch className="w-3 h-3 text-indigo-400 shrink-0" />
                <span className="truncate">Feature: GitHub Integration</span>
              </div>
              <div className="p-1.5 rounded-lg bg-[#060b18] border border-indigo-500/30 flex items-center gap-1.5 text-[9px] text-slate-300">
                <UploadCloud className="w-3 h-3 text-indigo-400 shrink-0" />
                <span>Push to Repo</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* NODE 2: QA ANALYST (Top Right)                                 */}
        {/* ============================================================== */}
        {qaAnalyst && (
          <div 
            onClick={() => onSelectAgent(qaAnalyst.id)}
            className="absolute z-10 w-[200px] p-3 rounded-2xl bg-[#09132b]/95 border border-emerald-500/40 hover:border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] cursor-pointer transition-all duration-300 hover:scale-105"
            style={{ top: '5%', right: '4%' }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-mono text-slate-400">AI-100</span>
              {(() => {
                const b = getStatusBadge(qaAnalyst.status);
                return (
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border flex items-center gap-1 ${b.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${b.dot}`}></span>
                    {b.label}
                  </span>
                );
              })()}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black text-white truncate">{qaAnalyst.name}</h4>
                <p className="text-[9px] text-slate-400 font-mono truncate">{qaAnalyst.model}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[9px] text-slate-400 mb-2">
              <span>{qaAnalyst.taskCount} Tests</span>
              <span className="text-emerald-300 font-semibold font-mono">Zero Errors</span>
            </div>

            <div className="space-y-1">
              <div className="p-1.5 rounded-lg bg-[#060b18] border border-emerald-500/30 flex items-center gap-1.5 text-[9px] text-slate-300">
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Run Test Suite v3.2</span>
              </div>
              <div className="p-1.5 rounded-lg bg-[#060b18] border border-emerald-500/30 flex items-center gap-1.5 text-[9px] text-slate-300">
                <Bug className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Log Automated Bugs</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* NODE 3: SECURITY AUDITOR (Bottom Left)                         */}
        {/* ============================================================== */}
        {security && (
          <div 
            onClick={() => onSelectAgent(security.id)}
            className="absolute z-10 w-[200px] p-3 rounded-2xl bg-[#09132b]/95 border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] cursor-pointer transition-all duration-300 hover:scale-105"
            style={{ bottom: '6%', left: '4%' }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-mono text-slate-400">AI-100</span>
              {(() => {
                const b = getStatusBadge(security.status);
                return (
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border flex items-center gap-1 ${b.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${b.dot}`}></span>
                    {b.label}
                  </span>
                );
              })()}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-cyan-300">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black text-white truncate">{security.name}</h4>
                <p className="text-[9px] text-slate-400 font-mono truncate">OWASP Standard</p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="p-1.5 rounded-lg bg-[#060b18] border border-blue-500/30 flex items-center gap-1.5 text-[9px] text-slate-300">
                <Check className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>Scan Vulnerabilities</span>
              </div>
              <div className="p-1.5 rounded-lg bg-[#060b18] border border-blue-500/30 flex items-center gap-1.5 text-[9px] text-slate-300">
                <ShieldAlert className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>Zero Secret Leaks</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* NODE 4: DEVOPS (Mid Right)                                     */}
        {/* ============================================================== */}
        {devops && (
          <div 
            onClick={() => onSelectAgent(devops.id)}
            className="absolute z-10 w-[190px] p-3 rounded-2xl bg-[#09132b]/95 border border-slate-700/60 hover:border-slate-500 cursor-pointer transition-all duration-300 hover:scale-105"
            style={{ top: '48%', right: '4%' }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-mono text-slate-400">Idle</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">Standby</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <TerminalSquare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">{devops.name}</h4>
                <p className="text-[9px] text-slate-400 font-mono">CI/CD Pipeline</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-400">
              <span>{devops.taskCount} Tasks</span>
              <span>Cloud Ready</span>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* NODE 5: DATA SCIENTIST (Bottom Right)                          */}
        {/* ============================================================== */}
        {dataScientist && (
          <div 
            onClick={() => onSelectAgent(dataScientist.id)}
            className="absolute z-10 w-[190px] p-3 rounded-2xl bg-[#09132b]/95 border border-teal-500/30 hover:border-teal-400 cursor-pointer transition-all duration-300 hover:scale-105"
            style={{ bottom: '6%', right: '4%' }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-mono text-slate-400">Node</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">{dataScientist.name}</h4>
                <p className="text-[9px] text-slate-400 font-mono">Code Analytics</p>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
