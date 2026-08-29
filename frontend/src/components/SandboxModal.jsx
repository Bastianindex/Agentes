import React, { useState } from 'react';
import { X, Copy, Check, Download, Code2 } from 'lucide-react';

export default function SandboxModal({ isOpen, onClose, task }) {
  const [copied, setCopied] = useState(false);
  if (!isOpen || !task) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(task.sandboxCode || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([task.sandboxCode || ""], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `entregable-${task.agente || 'agente'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[85vh] rounded-2xl glass-panel-active flex flex-col overflow-hidden border border-cyan-500/40 shadow-2xl">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-b border-cyan-500/25 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Sandbox de C?digo</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {task.agente || "NVIDIA Nemotron 120B"}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-lg">{task.descripcion}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copiado" : "Copiar"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Code Viewer */}
        <div className="flex-1 p-5 overflow-y-auto bg-slate-950 font-mono text-xs leading-relaxed text-slate-200">
          <pre className="whitespace-pre-wrap">{task.sandboxCode || "// No hay c?digo generado para esta tarea."}</pre>
        </div>
      </div>
    </div>
  );
}
