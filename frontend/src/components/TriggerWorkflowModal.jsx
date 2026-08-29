import React, { useState } from 'react';
import { X, Zap, GitFork, Sparkles, Code2, ShieldAlert, Cpu, Layers } from 'lucide-react';

export default function TriggerWorkflowModal({ 
  isOpen, 
  onClose, 
  onRun, 
  isRunning, 
  repoUrl, 
  setRepoUrl,
  prompt,
  setPrompt
}) {
  if (!isOpen) return null;

  const quickPrompts = [
    { label: "Auditoría de Seguridad OWASP", text: "Realiza una auditoría de seguridad y mejores prácticas OWASP en el código del repositorio y genera reporte con mitigaciones.", icon: ShieldAlert },
    { label: "Optimización y Refactorización", text: "Analiza la arquitectura del repositorio, identifica cuellos de botella de rendimiento y refactoriza componentes clave.", icon: Cpu },
    { label: "Suite de Tests Automatizados", text: "Crea una suite completa de pruebas unitarias y de integración para los endpoints y componentes principales.", icon: Code2 },
    { label: "Documentación y CI/CD", text: "Revisa los archivos del repositorio y genera la configuración completa de GitHub Actions CI/CD.", icon: Layers }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onRun();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl glass-panel-active p-6 flex flex-col gap-5 border border-cyan-500/40 shadow-2xl relative">
        {/* Close Button */}
        <button 
          onClick={onClose}
          disabled={isRunning}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1.5px] shadow-lg shadow-cyan-500/30">
            <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-300" />
            </div>
          </div>
          <div>
            <h2 className="text-base font-black text-white">Detonar Super Agente 100% Cloud</h2>
            <p className="text-xs text-slate-400">Orquestación Gemini 3.7 Flash + NVIDIA Nemotron 120B en GitHub</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* GitHub Repo Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <GitFork className="w-4 h-4 text-cyan-400" />
              <span>Repositorio de GitHub (URL o usuario/repo)</span>
            </label>
            <input
              type="text"
              placeholder="Ej. https://github.com/tu-usuario/tu-repositorio"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500/60 focus:outline-none text-xs text-slate-200 font-mono"
            />
          </div>

          {/* Prompt / Instruction Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Instrucción o Tarea para el Equipo de Agentes</span>
            </label>
            <textarea
              rows={4}
              placeholder="Describe lo que quieres que el Super Agente y sus especialistas realicen en el código..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500/60 focus:outline-none text-xs text-slate-200 resize-none leading-relaxed"
            />
          </div>

          {/* Quick Prompts Chips */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-slate-400">Atajos rápidos:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickPrompts.map((q, idx) => {
                const Icon = q.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(q.text)}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-left transition-all cursor-pointer group"
                  >
                    <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-slate-300 group-hover:text-cyan-200 font-medium truncate">
                      {q.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isRunning}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isRunning || !prompt.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold tracking-wide transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className={"w-4 h-4 fill-slate-950 " + (isRunning ? "animate-spin" : "")} />
              <span>{isRunning ? "Procesando en Google Cloud..." : "Iniciar Flujo Autónomo"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
