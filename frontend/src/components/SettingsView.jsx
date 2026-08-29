import React from 'react';
import { Settings, ShieldCheck, Key, Cloud, CheckCircle2 } from 'lucide-react';

export default function SettingsView() {
  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      <div>
        <h2 className="text-xl font-black text-white">Configuraci?n del Sistema</h2>
        <p className="text-xs text-slate-400">Estado de la infraestructura 100% Nube en Google Cloud & Firebase</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-blue-500/20 space-y-4">
          <div className="flex items-center gap-3">
            <Cloud className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Infraestructura Nube</h3>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-300">Firebase Hosting (Global CDN)</span>
              <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Online
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-300">Google Cloud Functions (2nd Gen)</span>
              <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Activo
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-300">Google Cloud Firestore (Real-Time)</span>
              <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Conectado
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-blue-500/20 space-y-4">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Gestor de Secretos (Google Secret Manager)</h3>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-300">GEMINI_API_KEY</span>
              <span className="text-emerald-400 font-mono font-bold">Protegido en Nube</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-300">NVIDIA_API_KEY (Nemotron 120B)</span>
              <span className="text-emerald-400 font-mono font-bold">Protegido en Nube</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-300">GITHUB_TOKEN (Personal Access Token)</span>
              <span className="text-emerald-400 font-mono font-bold">Protegido en Nube</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
