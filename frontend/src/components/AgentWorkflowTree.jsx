import React from 'react';
import { 
  Bot, 
  Code2, 
  CheckCircle2, 
  Eye, 
  TerminalSquare, 
  FlaskConical, 
  MoreHorizontal, 
  GitBranch, 
  UploadCloud, 
  Check, 
  Bug,
  Settings
} from 'lucide-react';

export default function AgentWorkflowTree({ isRunning, onSelectAgent }) {
  return (
    <div className="w-full h-full rounded-2xl bg-[#090f1d]/85 border border-[#1e293b] p-5 flex flex-col relative overflow-hidden backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between z-20 mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold tracking-wider text-slate-200 uppercase font-mono">
            AGENT WORKFLOW TREE
          </h2>
        </div>
        <button className="text-slate-500 hover:text-slate-300">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Graph Visual Area */}
      <div className="relative flex-1 w-full h-full min-h-[460px]">
        {/* SVG Curved Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="tealGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
            </linearGradient>
            <filter id="neonFilter" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Line 1: Super Agent -> Developer (Top Left) */}
          <path
            d="M 440 230 C 370 230, 340 100, 270 100"
            fill="none"
            stroke="url(#cyanGlow)"
            strokeWidth="2.5"
            filter="url(#neonFilter)"
            strokeLinecap="round"
          />

          {/* Line 2: Super Agent -> QA Analyst (Top Right) */}
          <path
            d="M 560 230 C 630 230, 650 100, 710 100"
            fill="none"
            stroke="url(#tealGlow)"
            strokeWidth="2.5"
            filter="url(#neonFilter)"
            strokeLinecap="round"
          />

          {/* Line 3: Super Agent -> Security / QA Analyst (Bottom Left) */}
          <path
            d="M 440 250 C 360 250, 340 360, 270 360"
            fill="none"
            stroke="url(#cyanGlow)"
            strokeWidth="2.5"
            filter="url(#neonFilter)"
            strokeLinecap="round"
          />

          {/* Line 4: Super Agent -> DevOps (Mid Right) */}
          <path
            d="M 560 250 C 640 250, 650 280, 710 280"
            fill="none"
            stroke="url(#cyanGlow)"
            strokeWidth="2.5"
            filter="url(#neonFilter)"
            strokeLinecap="round"
          />

          {/* Line 5: Super Agent -> Data Scientist (Bottom Right) */}
          <path
            d="M 520 280 C 560 380, 620 400, 710 400"
            fill="none"
            stroke="url(#tealGlow)"
            strokeWidth="2.5"
            filter="url(#neonFilter)"
            strokeLinecap="round"
          />
        </svg>

        {/* ============================================================== */}
        {/* CENTER NODE: SUPER AGENT                                       */}
        {/* ============================================================== */}
        <div 
          className="absolute z-10 w-[150px] p-3 rounded-2xl bg-[#0c162d]/95 border border-[#38bdf8] shadow-[0_0_30px_rgba(56,189,248,0.35)] transition-all"
          style={{ top: '48%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono text-slate-400">AI-100</span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-cyan-300">
              <Settings className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white leading-tight">SUPER AGENT</h3>
              <p className="text-[9px] text-slate-400">Node</p>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TOP LEFT NODE: DEVELOPER                                       */}
        {/* ============================================================== */}
        <div 
          className="absolute z-10 w-[180px] p-3 rounded-2xl bg-[#0b1329]/95 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          style={{ top: '4%', left: '4%' }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono text-slate-400">AI-100</span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">Active</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Code2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">DEVELOPER</h4>
              <p className="text-[9px] text-slate-400">Node</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-400 mb-2">
            <span>12 Tasks</span>
            <span>Tasks</span>
          </div>
          {/* Nested Sub Action Badges */}
          <div className="space-y-1">
            <div className="p-1.5 rounded-lg bg-[#070d1d] border border-blue-500/30 flex items-center gap-1.5 text-[9px] text-slate-300">
              <GitBranch className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="truncate">Feature Branch: GitHub Integration</span>
            </div>
            <div className="p-1.5 rounded-lg bg-[#070d1d] border border-blue-500/30 flex items-center gap-1.5 text-[9px] text-slate-300">
              <UploadCloud className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>Push to Repo</span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TOP RIGHT NODE: QA ANALYST                                     */}
        {/* ============================================================== */}
        <div 
          className="absolute z-10 w-[180px] p-3 rounded-2xl bg-[#0b1329]/95 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          style={{ top: '4%', right: '4%' }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono text-slate-400">AI-100</span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400">Running</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">QA ANALYST</h4>
              <p className="text-[9px] text-slate-400">Node</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-400 mb-2">
            <span>9 Tasks</span>
            <span>Tasks</span>
          </div>
          <div className="space-y-1">
            <div className="p-1.5 rounded-lg bg-[#070d1d] border border-emerald-500/30 flex items-center gap-1.5 text-[9px] text-slate-300">
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Run Test Suite v3.2</span>
            </div>
            <div className="p-1.5 rounded-lg bg-[#070d1d] border border-emerald-500/30 flex items-center gap-1.5 text-[9px] text-slate-300">
              <Bug className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Log Bugs</span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* BOTTOM LEFT NODE: QA ANALYST / AUDIT                           */}
        {/* ============================================================== */}
        <div 
          className="absolute z-10 w-[180px] p-3 rounded-2xl bg-[#0b1329]/95 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          style={{ bottom: '4%', left: '4%' }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono text-slate-400">AI-100</span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400">Running</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-cyan-300">
              <Eye className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">QA ANALYST</h4>
              <p className="text-[9px] text-slate-400">Node</p>
            </div>
          </div>
          <div className="space-y-1 pt-1">
            <div className="p-1.5 rounded-lg bg-[#070d1d] border border-blue-500/30 flex items-center gap-1.5 text-[9px] text-slate-300">
              <Check className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>Run Test Suite</span>
            </div>
            <div className="p-1.5 rounded-lg bg-[#070d1d] border border-blue-500/30 flex items-center gap-1.5 text-[9px] text-slate-300">
              <Bug className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>Log Bugs</span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MID RIGHT NODE: DEVOPS                                         */}
        {/* ============================================================== */}
        <div 
          className="absolute z-10 w-[180px] p-3 rounded-2xl bg-[#0b1329]/95 border border-slate-700/60"
          style={{ top: '48%', right: '4%' }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono text-slate-400">Idle</span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">Idle</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <TerminalSquare className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">DEVOPS</h4>
              <p className="text-[9px] text-slate-400">Node</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-400">
            <span>5 Tasks</span>
            <span>Tasks</span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* BOTTOM RIGHT NODE: DATA SCIENTIST                              */}
        {/* ============================================================== */}
        <div 
          className="absolute z-10 w-[180px] p-3 rounded-2xl bg-[#0b1329]/95 border border-slate-700/60"
          style={{ bottom: '4%', right: '4%' }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono text-slate-400">Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
              <FlaskConical className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">DATA SCIENTIST</h4>
              <p className="text-[9px] text-slate-400">Node</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
