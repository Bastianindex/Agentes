import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { AgentProvider, useAgentStore } from './store/useAgentStore';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import WorkflowCanvas from './components/WorkflowCanvas';
import AgentLogsTerminal from './components/AgentLogsTerminal';
import TaskKanbanBoard from './components/TaskKanbanBoard';
import AgentDetailDrawer from './components/AgentDetailDrawer';
import CommandPalette from './components/CommandPalette';
import TriggerWorkflowModal from './components/TriggerWorkflowModal';
import SandboxModal from './components/SandboxModal';
import AgentsGuildView from './components/AgentsGuildView';
import ProjectsView from './components/ProjectsView';
import SettingsView from './components/SettingsView';

function MainDashboard() {
  const { 
    agents, 
    tasks, 
    logs, 
    setLogs, 
    setTasks, 
    addLog,
    selectedAgentId, 
    setSelectedAgentId,
    repoUrl,
    setRepoUrl,
    prompt,
    setPrompt
  } = useAgentStore();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [isTriggerOpen, setIsTriggerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Firestore Realtime Bridge
  useEffect(() => {
    const qLogs = query(collection(db, "conversaciones_agentes"), orderBy("creadoEn", "desc"), limit(30));
    const unsubLogs = onSnapshot(qLogs, (snap) => {
      if (!snap.empty) {
        const list = [];
        snap.forEach(doc => {
          const d = doc.data();
          list.push({
            id: doc.id,
            timestamp: d.creadoEn?.toDate ? d.creadoEn.toDate().toLocaleTimeString() : "Live",
            agentName: d.remitente || "SUPER AGENT",
            severity: "TOOL",
            message: d.mensaje
          });
        });
        setLogs(prev => [...list.reverse(), ...prev.slice(-10)]);
      }
    }, (err) => console.log("Firestore logs standby:", err.message));

    const qTasks = query(collection(db, "tareas_agentes"), orderBy("creadoEn", "desc"), limit(30));
    const unsubTasks = onSnapshot(qTasks, (snap) => {
      if (!snap.empty) {
        const list = [];
        snap.forEach(doc => {
          const d = doc.data();
          list.push({
            id: doc.id,
            title: d.descripcion,
            agentName: d.agente,
            status: d.estado === "completada" ? "done" : d.estado === "en-progreso" ? "in-progress" : "todo",
            priority: "NEON",
            sandboxCode: d.sandboxCode,
            progress: d.estado === "completada" ? 100 : d.estado === "en-progreso" ? 65 : 20,
            createdAt: "Live"
          });
        });
        setTasks(list);
      }
    }, (err) => console.log("Firestore tasks standby:", err.message));

    return () => {
      unsubLogs();
      unsubTasks();
    };
  }, [setLogs, setTasks]);

  const handleRunAgent = async () => {
    setIsRunning(true);
    setIsTriggerOpen(false);
    setNotification({ type: "info", text: "?? Super Agente iniciado en Google Cloud..." });

    addLog({
      agentId: "super-admin",
      agentName: "SUPER AGENT",
      severity: "THINKING",
      message: `Orquestando nuevo requerimiento en GitHub: "${prompt}"`
    });

    try {
      const functionEndpoint = "https://us-central1-agentes-b04f8.cloudfunctions.net/orquestadorAgente";
      const response = await fetch(functionEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          repoUrl: repoUrl || undefined
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Error en Cloud Function");
      }

      const data = await response.json();
      setNotification({ 
        type: "success", 
        text: "✅ Tarea completada con éxito por el equipo de agentes." 
      });

      if (data.tareasGeneradas && data.tareasGeneradas.length > 0) {
        const tareasList = data.tareasGeneradas.map(t => ({
          id: t.id,
          title: t.descripcion,
          agentName: t.agente,
          status: t.estado === "completada" ? "done" : t.estado === "en-progreso" ? "in-progress" : "todo",
          priority: "NEON",
          sandboxCode: t.sandboxCode,
          progress: t.estado === "completada" ? 100 : 50,
          createdAt: "Just now"
        }));
        setTasks(tareasList);

        // Actualizar el estado de cada agente en el gremio y en el grafo
        setAgents(prev => prev.map(ag => {
          const matchedTasks = tareasList.filter(t => {
            const taskAgent = (t.agentName || "").toLowerCase();
            const currentAgentName = ag.name.toLowerCase();
            const currentAgentId = ag.id.toLowerCase();
            return currentAgentName.includes(taskAgent) || taskAgent.includes(currentAgentId) || currentAgentId.includes(taskAgent);
          });
          if (matchedTasks.length > 0) {
            return {
              ...ag,
              status: "SUCCESS",
              taskCount: matchedTasks.length,
              currentTask: matchedTasks[matchedTasks.length - 1].title,
              progress: 100,
              lastActivity: "Completada recientemente"
            };
          }
          if (ag.id === "super-admin") {
            return {
              ...ag,
              status: "SUCCESS",
              taskCount: tareasList.length,
              currentTask: "Orquestación y supervisión completada con éxito",
              progress: 100,
              lastActivity: "Hace un momento"
            };
          }
          return ag;
        }));
      }

      if (data.conversaciones && data.conversaciones.length > 0) {
        data.conversaciones.forEach(c => {
          addLog({
            agentId: (c.remitente || "").toLowerCase(),
            agentName: c.remitente || "AGENT",
            severity: "TOOL",
            message: c.mensaje
          });
        });
      }

      addLog({
        agentId: "super-admin",
        agentName: "SUPER AGENT",
        severity: "SUCCESS",
        message: data.respuestaAdmin || "Todas las tareas fueron completadas y guardadas en GitHub."
      });
    } catch (err) {
      console.error(err);
      setNotification({ 
        type: "error", 
        text: "Error: " + err.message 
      });
      addLog({
        agentId: "super-admin",
        agentName: "SUPER AGENT",
        severity: "ERROR",
        message: "Error de ejecuci?n: " + err.message
      });
    } finally {
      setIsRunning(false);
      setTimeout(() => setNotification(null), 6000);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#030712] text-slate-100 overflow-hidden font-sans select-none relative">
      {/* Background Cosmic Starfield Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,50,110,0.3),rgba(255,255,255,0))]"></div>
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* 1. Left Sidebar (Responsive: auto-collapses on mobile into a drawer) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenTrigger={() => setIsTriggerOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. Main Center Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden z-10">
        <TopHeader 
          pageTitle={
            activeTab === "dashboard" ? "Dashboard" :
            activeTab === "projects" ? "Projects & GitHub" :
            activeTab === "agents" ? "Agents Guild" :
            activeTab === "logs" ? "System Logs" : "Settings"
          }
          onOpenTrigger={() => setIsTriggerOpen(true)}
          setActiveTab={setActiveTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Global Toast Notification */}
        {notification && (
          <div className="px-4 sm:px-8 pt-3">
            <div className={"px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border shadow-lg backdrop-blur-xl animate-in slide-in-from-top duration-300 " + (
              notification.type === "success" 
                ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200" 
                : notification.type === "error"
                ? "bg-rose-950/90 border-rose-500/50 text-rose-200"
                : "bg-blue-950/90 border-cyan-500/50 text-cyan-200"
            )}>
              <span>{notification.text}</span>
              <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
          </div>
        )}

        {/* Dynamic Views with Smooth Scroll */}
        <main className="flex-1 px-4 sm:px-8 pb-12 overflow-y-auto flex flex-col">
          {activeTab === "dashboard" && (
            <div className="flex flex-col gap-6 w-full pb-8">
              {/* 1. Top Section: Full-Width Dominant Agent Workflow Canvas (Ample vertical breathing room) */}
              <div className="w-full min-h-[640px] h-[640px] shrink-0">
                <WorkflowCanvas 
                  onSelectAgent={(agentId) => setSelectedAgentId(agentId)}
                />
              </div>

              {/* 2. Middle Section: Full-Width Agent Logs & Terminal */}
              <div className="w-full flex flex-col min-h-[280px]">
                <AgentLogsTerminal />
              </div>

              {/* 3. Bottom Section: Full-Width SaaS Kanban Task Board (Maximum Space) */}
              <div className="w-full flex flex-col min-h-[380px]">
                <TaskKanbanBoard onOpenSandbox={(t) => setSelectedTask(t)} />
              </div>
            </div>
          )}

          {activeTab === "projects" && (
            <ProjectsView repoUrl={repoUrl} onOpenTrigger={() => setIsTriggerOpen(true)} />
          )}

          {activeTab === "agents" && (
            <AgentsGuildView />
          )}

          {activeTab === "logs" && (
            <div className="flex-1 p-2 h-full flex flex-col">
              <AgentLogsTerminal />
            </div>
          )}

          {activeTab === "settings" && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* 3. Contextual Overlays & Drawers */}
      <AgentDetailDrawer 
        agentId={selectedAgentId} 
        onClose={() => setSelectedAgentId(null)} 
      />

      <CommandPalette 
        onOpenTrigger={() => setIsTriggerOpen(true)}
        setActiveTab={setActiveTab}
      />

      <TriggerWorkflowModal 
        isOpen={isTriggerOpen}
        onClose={() => setIsTriggerOpen(false)}
        onRun={handleRunAgent}
        isRunning={isRunning}
        repoUrl={repoUrl}
        setRepoUrl={setRepoUrl}
        prompt={prompt}
        setPrompt={setPrompt}
      />

      <SandboxModal 
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
      />
    </div>
  );
}

export default function App() {
  return (
    <AgentProvider>
      <MainDashboard />
    </AgentProvider>
  );
}
