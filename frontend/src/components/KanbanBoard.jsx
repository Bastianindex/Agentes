import React from 'react';
import { MoreHorizontal, MoreVertical } from 'lucide-react';

export default function KanbanBoard({ tasks = [], onOpenSandbox }) {
  return (
    <div className="w-full flex-1 rounded-2xl bg-[#090f1d]/85 border border-[#1e293b] p-4 flex flex-col backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-black tracking-wider text-slate-200 uppercase font-mono">
          SaaS KANBAN TASK BOARD
        </h3>
        <button className="text-slate-500 hover:text-slate-300">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-3 gap-3 flex-1">
        {/* Column 1: To Do */}
        <div className="flex flex-col bg-[#070c1a] rounded-xl p-2.5 border border-[#1e293b]">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="text-xs font-bold text-slate-200">To Do</span>
            <MoreVertical className="w-3 h-3 text-slate-500 cursor-pointer" />
          </div>

          <div className="space-y-2 overflow-y-auto max-h-56 pr-0.5">
            {/* Card 1 */}
            <div className="p-2.5 rounded-xl bg-[#0a1226] border border-[#1e293b] hover:border-cyan-500/40 transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] text-slate-400 font-medium">Members</span>
                <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-full border border-fuchsia-500/50 text-fuchsia-300">Neon</span>
              </div>
              <h5 className="text-[11px] font-bold text-white mb-2 leading-snug">Optimize API Latency</h5>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-cyan-600 flex items-center justify-center text-[8px]">?????</div>
                <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-[8px]">?????</div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-2.5 rounded-xl bg-[#0a1226] border border-[#1e293b] hover:border-cyan-500/40 transition-all">
              <div className="flex items-center justify-between mb-1">
                <div className="flex gap-1 text-[8px] text-slate-400">
                  <span>Dev</span>
                  <span>Automations</span>
                </div>
                <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-full border border-fuchsia-500/50 text-fuchsia-300">Neon</span>
              </div>
              <h5 className="text-[11px] font-bold text-white mb-2 leading-snug">UI/UX Enhancements</h5>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-cyan-600 flex items-center justify-center text-[8px]">?????</div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-2.5 rounded-xl bg-[#0a1226] border border-[#1e293b] hover:border-cyan-500/40 transition-all">
              <div className="flex items-center justify-between mb-1">
                <div className="flex gap-1 text-[8px] text-slate-400">
                  <span>Etma</span>
                  <span>Linked</span>
                </div>
                <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-full border border-fuchsia-500/50 text-fuchsia-300">Neon</span>
              </div>
              <h5 className="text-[11px] font-bold text-white mb-2 leading-snug">Featured Branch</h5>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-cyan-600 flex items-center justify-center text-[8px]">?????</div>
                <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-[8px]">?????</div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="flex flex-col bg-[#070c1a] rounded-xl p-2.5 border border-[#1e293b]">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="text-xs font-bold text-slate-200">In Progress</span>
            <MoreVertical className="w-3 h-3 text-slate-500 cursor-pointer" />
          </div>

          <div className="space-y-2 overflow-y-auto max-h-56 pr-0.5">
            {/* Card 1 */}
            <div className="p-2.5 rounded-xl bg-[#0a1226] border border-[#1e293b] hover:border-cyan-500/40 transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] text-slate-400 font-medium">Members</span>
                <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-full border border-fuchsia-500/50 text-fuchsia-300">Neon</span>
              </div>
              <h5 className="text-[11px] font-bold text-white mb-2 leading-snug">LinkedIn Automation (Dev)</h5>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[8px]">?????</div>
                <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-[8px]">?????</div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-2.5 rounded-xl bg-[#0a1226] border border-[#1e293b] hover:border-cyan-500/40 transition-all">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] text-slate-400">Dev</span>
                <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-full border border-fuchsia-500/50 text-fuchsia-300">Neon</span>
              </div>
              <h5 className="text-[11px] font-bold text-white mb-2 leading-snug">Code Quality Test (QA)</h5>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[8px]">?????</div>
                <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-[8px]">?????</div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-2.5 rounded-xl bg-[#0a1226] border border-[#1e293b] hover:border-cyan-500/40 transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] text-slate-400 font-medium">Members</span>
                <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-full border border-fuchsia-500/50 text-fuchsia-300">Neon</span>
              </div>
              <h5 className="text-[11px] font-bold text-white mb-2 leading-snug">API Security Review</h5>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-cyan-600 flex items-center justify-center text-[8px]">?????</div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Done */}
        <div className="flex flex-col bg-[#070c1a] rounded-xl p-2.5 border border-[#1e293b]">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="text-xs font-bold text-slate-200">Done</span>
            <MoreVertical className="w-3 h-3 text-slate-500 cursor-pointer" />
          </div>

          <div className="space-y-2 overflow-y-auto max-h-56 pr-0.5">
            {/* Card 1 */}
            <div className="p-2.5 rounded-xl bg-[#0a1226] border border-[#1e293b] hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] text-slate-400 font-medium">Members</span>
                <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/50 text-emerald-300">Done</span>
              </div>
              <h5 className="text-[11px] font-bold text-white mb-2 leading-snug">User Authentication</h5>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-[8px]">??</div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-2.5 rounded-xl bg-[#0a1226] border border-[#1e293b] hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between mb-1">
                <div className="flex gap-1 text-[8px] text-slate-400">
                  <span>Brand</span>
                  <span>Refactors</span>
                </div>
                <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/50 text-emerald-300">Done</span>
              </div>
              <h5 className="text-[11px] font-bold text-white mb-2 leading-snug">Refactor Auth Service</h5>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-[8px]">??</div>
                <div className="w-4 h-4 rounded-full bg-cyan-600 flex items-center justify-center text-[8px]">?????</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
