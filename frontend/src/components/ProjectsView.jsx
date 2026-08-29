import React from 'react';
import { FolderGit2, GitFork, ExternalLink, GitCommit, ShieldCheck, Sparkles } from 'lucide-react';

export default function ProjectsView({ repoUrl, onOpenTrigger }) {
  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">Repositorios & Proyectos GitHub</h2>
          <p className="text-xs text-slate-400">Espacio de trabajo conectado a GitHub API en tiempo real</p>
        </div>
        <button
          onClick={onOpenTrigger}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/25"
        >
          <GitFork className="w-4 h-4" />
          <span>Conectar Nuevo Repo</span>
        </button>
      </div>

      <div className="p-6 rounded-2xl glass-panel border border-cyan-500/30 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {repoUrl ? repoUrl.replace("https://github.com/", "") : "Ningún Repositorio Conectado"}
                </h3>
                <span className={"text-[10px] px-2 py-0.5 rounded-full border " + (
                  repoUrl 
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" 
                    : "bg-slate-800 text-slate-400 border-slate-700"
                )}>
                  {repoUrl ? "Conectado" : "En Espera"}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                {repoUrl || "Pulsa 'Conectar Nuevo Repo' o 'Detonar Agente' para ingresar tu URL de GitHub."}
              </p>
            </div>
          </div>

          {repoUrl && (
            <a
              href={repoUrl.startsWith("http") ? repoUrl : "https://github.com/" + repoUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-300 text-xs font-medium transition-all"
            >
              <span>Abrir en GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <GitCommit className="w-5 h-5 text-cyan-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">Capacidad de Commit</span>
              <span className="font-bold text-slate-200">GitHub API Activa</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">Seguridad & Secrets</span>
              <span className="font-bold text-slate-200">Google Secret Manager</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">Motor de IA</span>
              <span className="font-bold text-slate-200">Gemini 3.7 + Nemotron 120B</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
