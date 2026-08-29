import React, { useState } from 'react';
import { Kanban, MoreHorizontal, Code2, Plus, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { useAgentStore } from '../store/useAgentStore';

export default function TaskKanbanBoard({ onOpenSandbox }) {
  const { tasks, moveTask } = useAgentStore();
  const [activeFilter, setActiveFilter] = useState("all");

  const columns = [
    { id: "todo", title: "To Do", status: "todo", dot: "bg-slate-400" },
    { id: "in-progress", title: "In Progress", status: "in-progress", dot: "bg-cyan-400 animate-ping" },
    { id: "review", title: "Review", status: "review", dot: "bg-amber-400" },
    { id: "done", title: "Done", status: "done", dot: "bg-emerald-400" },
  ];

  const getPriorityBadge = (p) => {
    switch ((p || "").toUpperCase()) {
      case "URGENT":
        return "border-rose-500/50 text-rose-300 bg-rose-500/10";
      case "NEON":
        return "border-fuchsia-500/50 text-fuchsia-300 bg-fuchsia-500/10";
      case "HIGH":
        return "border-amber-500/50 text-amber-300 bg-amber-500/10";
      case "DONE":
        return "border-emerald-500/50 text-emerald-300 bg-emerald-500/10";
      default:
        return "border-slate-700 text-slate-400 bg-slate-800";
    }
  };

  return (
    <div className="w-full flex-1 rounded-2xl bg-[#070d1d]/90 border border-blue-500/20 p-4 flex flex-col backdrop-blur-xl shadow-2xl overflow-hidden min-h-[300px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Kanban className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-black tracking-wider text-slate-200 uppercase font-mono">
            SaaS KANBAN TASK BOARD
          </h3>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
          Realtime Pipeline
        </span>
      </div>

      {/* 4 Pipeline Columns - Full Width */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.status);
          return (
            <div key={col.id} className="flex flex-col bg-[#050914] rounded-xl p-3.5 border border-slate-800/90 flex-1 min-w-[200px]">
              {/* Column Title */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`}></span>
                  <span className="text-xs font-bold text-slate-200 tracking-wide">{col.title}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold border border-slate-700/60">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards List */}
              <div className="space-y-2.5 overflow-y-auto max-h-80 pr-1 flex-1">
                {colTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-3 text-center border border-dashed border-slate-800/80 rounded-xl text-slate-600 text-[11px]">
                    <span>Sin tareas en esta etapa</span>
                  </div>
                ) : (
                  colTasks.map(task => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl bg-[#091124] border border-slate-800/90 hover:border-cyan-500/50 transition-all cursor-pointer group shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-cyan-400 font-semibold truncate max-w-[120px]">
                          {task.agentName || "Agent"}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(task.priority)}`}>
                          {task.priority || "NEON"}
                        </span>
                      </div>

                      <h5 className="text-xs font-bold text-white mb-2.5 leading-snug line-clamp-2">
                        {task.title}
                      </h5>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                        <span>{task.createdAt}</span>

                        {task.sandboxCode ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); onOpenSandbox(task); }}
                            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 font-bold transition-colors cursor-pointer"
                          >
                            <Code2 className="w-3.5 h-3.5" />
                            <span>Code</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{task.progress}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
