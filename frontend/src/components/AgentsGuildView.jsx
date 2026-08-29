import React, { useState } from 'react';
import { 
  Bot, 
  Code2, 
  CheckCircle2, 
  ShieldAlert, 
  TerminalSquare, 
  FlaskConical, 
  Cpu, 
  Zap, 
  Plus, 
  X, 
  Check, 
  Sparkles,
  Layers,
  Settings2
} from 'lucide-react';
import { useAgentStore } from '../store/useAgentStore';

export default function AgentsGuildView() {
  const { agents, addNewAgent } = useAgentStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [model, setModel] = useState("NVIDIA Nemotron-3-Super 120B");
  const [desc, setDesc] = useState("");
  const [iconType, setIconType] = useState("bot");
  const [colorTheme, setColorTheme] = useState("cyan");

  const iconMap = {
    bot: Bot,
    code: Code2,
    shield: ShieldAlert,
    check: CheckCircle2,
    terminal: TerminalSquare,
    flask: FlaskConical,
    cpu: Cpu
  };

  const colorMap = {
    cyan: "from-cyan-500 to-blue-600",
    indigo: "from-indigo-500 to-purple-600",
    emerald: "from-emerald-500 to-teal-600",
    amber: "from-amber-500 to-rose-600",
    teal: "from-teal-500 to-emerald-600",
    fuchsia: "from-fuchsia-500 to-pink-600"
  };

  const handleCreateAgent = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    addNewAgent({
      name: name.trim().toUpperCase(),
      type: role.trim() || "Especialista Aut?nomo",
      model: model,
      contract: desc.trim() || "Agente especializado creado por el operador.",
      iconType: iconType,
      color: colorTheme === "cyan" ? "#38bdf8" : colorTheme === "indigo" ? "#6366f1" : "#10b981",
      colorGradient: colorMap[colorTheme]
    });

    // Reset form
    setName("");
    setRole("");
    setDesc("");
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Header with Create Agent CTA */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Gremio de Agentes Aut?nomos</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestiona, configura y crea nuevos agentes especializados para tu sistema operativo.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black tracking-wide transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Nuevo Agente</span>
        </button>
      </div>

      {/* Agents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {agents.map((ag) => {
          const Icon = iconMap[ag.iconType] || Bot;
          const gradient = ag.colorGradient || colorMap.cyan;
          return (
            <div 
              key={ag.id} 
              className="p-5 rounded-2xl bg-[#081124] flex flex-col justify-between border border-blue-500/20 hover:border-cyan-500/50 transition-all hover:shadow-xl hover:shadow-cyan-500/10 group relative"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${gradient} p-[1.5px] shadow-lg`}>
                    <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <span className={"text-[10px] font-bold px-2.5 py-0.5 rounded-full border " + (
                    ag.status === "RUNNING" ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse" :
                    ag.status === "THINKING" ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" :
                    "bg-slate-800 text-slate-400 border-slate-700"
                  )}>
                    {ag.status || "Standby"}
                  </span>
                </div>

                <h3 className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors">
                  {ag.name}
                </h3>
                <p className="text-xs text-cyan-400 font-semibold mb-2.5">
                  {ag.type || ag.rol}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {ag.contract || ag.desc || "Especialista configurado para asistir en el pipeline de agentes."}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{ag.model}</span>
                </span>
                <span className="text-[10px] text-slate-500 font-bold">
                  {ag.taskCount || 0} tareas
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Crear Nuevo Agente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-[#091124] border border-cyan-500/40 shadow-2xl p-6 relative flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h3 className="text-base font-black text-white">Configurar Nuevo Agente</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nombre del Agente</label>
                <input 
                  type="text" 
                  required
                  placeholder="ej: RUST CORE SPECIALIST, SOLIDITY AUDITOR..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#050914] border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none placeholder-slate-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Rol / Cargo</label>
                <input 
                  type="text" 
                  placeholder="ej: Ingeniero de Rendimiento & WASM, Auditor de Contratos..."
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#050914] border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Motor de IA (Modelo)</label>
                <select 
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-[#050914] border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none font-mono"
                >
                  <option value="NVIDIA Nemotron-3-Super 120B">NVIDIA Nemotron-3-Super 120B (Recomendado para C?digo)</option>
                  <option value="Google Gemini 3.7 Flash">Google Gemini 3.7 Flash (Orquestaci?n & Razonamiento)</option>
                  <option value="DeepSeek Coder V2">DeepSeek Coder V2 (Sintaxis Estricta)</option>
                  <option value="Meta Llama 3.3 70B">Meta Llama 3.3 70B (Seguridad & Documentaci?n)</option>
                  <option value="Mistral Large 2">Mistral Large 2 (L?gica & Tests)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Instrucciones y Misi?n del Agente</label>
                <textarea 
                  rows={3}
                  placeholder="Describe qu? tareas espec?ficas resolver? este agente y qu? buenas pr?cticas debe seguir..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-[#050914] border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-slate-100 outline-none placeholder-slate-600 resize-none font-mono"
                ></textarea>
              </div>

              {/* Icon & Color selector */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-400 font-mono text-[10px] mb-1.5 uppercase">?cono</label>
                  <div className="flex items-center gap-1.5 bg-[#050914] p-1.5 rounded-xl border border-slate-800">
                    {["bot", "code", "shield", "terminal", "flask"].map((ic) => {
                      const IconComponent = iconMap[ic];
                      return (
                        <button
                          key={ic}
                          type="button"
                          onClick={() => setIconType(ic)}
                          className={"p-1.5 rounded-lg transition-all " + (
                            iconType === ic ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
                          )}
                        >
                          <IconComponent className="w-3.5 h-3.5" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[10px] mb-1.5 uppercase">Color de Aura</label>
                  <div className="flex items-center gap-2 bg-[#050914] p-2 rounded-xl border border-slate-800">
                    {[
                      { id: "cyan", bg: "bg-cyan-400" },
                      { id: "indigo", bg: "bg-indigo-500" },
                      { id: "emerald", bg: "bg-emerald-400" },
                      { id: "amber", bg: "bg-amber-400" }
                    ].map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setColorTheme(c.id)}
                        className={"w-5 h-5 rounded-full " + c.bg + " transition-transform " + (
                          colorTheme === c.id ? "ring-2 ring-white scale-110" : "opacity-60 hover:opacity-100"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                >
                  Sumar al Gremio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
