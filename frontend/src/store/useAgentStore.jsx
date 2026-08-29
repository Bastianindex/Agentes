import { useState, useEffect, createContext, useContext } from 'react';

const AgentContext = createContext(null);

export const INITIAL_AGENTS = [
  {
    id: "super-admin",
    name: "SUPER AGENT",
    type: "Orchestrator Core",
    model: "Google Gemini 3.7 Flash",
    status: "IDLE", // Inicia en reposo real
    currentTask: "En espera de requerimiento",
    progress: 0,
    runtime: "00:00",
    taskCount: 0,
    lastActivity: "Standby",
    x: 48,
    y: 46,
    iconType: "bot",
    color: "#38bdf8",
    contract: "Supervisa todo el pipeline de agentes, lee el repositorio de GitHub y delega tareas a los especialistas."
  },
  {
    id: "developer",
    name: "DEVELOPER AGENT",
    type: "FullStack Engineer",
    model: "NVIDIA Nemotron-3-Super 120B",
    status: "IDLE",
    currentTask: "En espera de asignación",
    progress: 0,
    runtime: "00:00",
    taskCount: 0,
    lastActivity: "Standby",
    x: 14,
    y: 16,
    iconType: "code",
    color: "#6366f1",
    subActions: ["Feature Branch: GitHub Integration", "Push to Repo"]
  },
  {
    id: "qa-analyst",
    name: "QA ANALYST",
    type: "Quality & Test Engineer",
    model: "NVIDIA Nemotron-3-Super 120B",
    status: "IDLE",
    currentTask: "En espera de pruebas",
    progress: 0,
    runtime: "00:00",
    taskCount: 0,
    lastActivity: "Standby",
    x: 82,
    y: 16,
    iconType: "check-circle",
    color: "#10b981",
    subActions: ["Run Test Suite v3.2", "Log Bugs"]
  },
  {
    id: "security-auditor",
    name: "SECURITY AUDITOR",
    type: "OWASP & Vulnerability Analyst",
    model: "NVIDIA Nemotron-3-Super 120B",
    status: "IDLE",
    currentTask: "En espera de análisis",
    progress: 0,
    runtime: "00:00",
    taskCount: 0,
    lastActivity: "Standby",
    x: 14,
    y: 78,
    iconType: "shield",
    color: "#06b6d4",
    subActions: ["Scan Vulnerabilities", "Enforce Zero-Leaks"]
  },
  {
    id: "devops-deployer",
    name: "DEVOPS DEPLOYER",
    type: "CI/CD & Infrastructure",
    model: "NVIDIA Nemotron-3-Super 120B",
    status: "IDLE",
    currentTask: "En espera de despliegue",
    progress: 0,
    runtime: "00:00",
    taskCount: 0,
    lastActivity: "Standby",
    x: 82,
    y: 52,
    iconType: "terminal",
    color: "#f59e0b",
    subActions: ["GitHub Actions Workflow", "Docker Validation"]
  },
  {
    id: "data-scientist",
    name: "DATA SCIENTIST",
    type: "Metrics & Performance Analyst",
    model: "NVIDIA Nemotron-3-Super 120B",
    status: "IDLE",
    currentTask: "En espera de métricas",
    progress: 0,
    runtime: "00:00",
    taskCount: 0,
    lastActivity: "Standby",
    x: 82,
    y: 84,
    iconType: "flask",
    color: "#14b8a6",
    subActions: ["Analyze Code Complexity", "Telemetry"]
  }
];

export const INITIAL_TASKS = [];

export const INITIAL_LOGS = [
  {
    id: "init-1",
    timestamp: new Date().toLocaleTimeString('es-ES', { hour12: false }),
    agentId: "super-admin",
    agentName: "SYSTEM",
    severity: "SUCCESS",
    message: "Sistema 100% en la nube conectado y listo. Esperando instrucciones..."
  }
];

export function AgentProvider({ children }) {
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [activeWorkflowRunning, setActiveWorkflowRunning] = useState(false); // Inicia en reposo real
  const [repoUrl, setRepoUrl] = useState("");
  const [prompt, setPrompt] = useState("");

  // Pause / Resume an Agent
  const toggleAgentPause = (agentId) => {
    setAgents(prev => prev.map(ag => {
      if (ag.id === agentId) {
        const nextStatus = ag.status === "PAUSED" ? "RUNNING" : "PAUSED";
        return { ...ag, status: nextStatus };
      }
      return ag;
    }));

    // Add log
    const target = agents.find(a => a.id === agentId);
    if (target) {
      addLog({
        agentId: target.id,
        agentName: target.name,
        severity: target.status === "PAUSED" ? "SUCCESS" : "WARN",
        message: target.status === "PAUSED" ? `Agent resumed operational mode.` : `Agent paused by human operator.`
      });
    }
  };

  // Add a new log entry
  const addLog = (logEntry) => {
    const newLog = {
      id: `l-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour12: false }),
      ...logEntry
    };
    setLogs(prev => [...prev, newLog]);
  };

  // Move task to a different status column
  const moveTask = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { 
          ...t, 
          status: newStatus,
          progress: newStatus === "done" ? 100 : t.progress 
        };
      }
      return t;
    }));
  };

  // Add a new custom agent
  const addNewAgent = (agentData) => {
    const newAgent = {
      id: "agent-" + Date.now(),
      status: "IDLE",
      currentTask: "Listo para recibir asignaciones",
      progress: 0,
      runtime: "00:00",
      taskCount: 0,
      lastActivity: "Creado recientemente",
      x: 50,
      y: 50,
      iconType: "bot",
      color: "#38bdf8",
      ...agentData
    };
    setAgents(prev => [...prev, newAgent]);
    addLog({
      agentId: newAgent.id,
      agentName: newAgent.name,
      severity: "SUCCESS",
      message: `Nuevo agente sumado al gremio: ${newAgent.name} (${newAgent.role || newAgent.type}) con ${newAgent.model}.`
    });
    return newAgent;
  };

  return (
    <AgentContext.Provider value={{
      agents,
      setAgents,
      tasks,
      setTasks,
      logs,
      setLogs,
      addLog,
      selectedAgentId,
      setSelectedAgentId,
      commandPaletteOpen,
      setCommandPaletteOpen,
      activeWorkflowRunning,
      setActiveWorkflowRunning,
      toggleAgentPause,
      moveTask,
      addNewAgent,
      repoUrl,
      setRepoUrl,
      prompt,
      setPrompt
    }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgentStore() {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error("useAgentStore must be used within an AgentProvider");
  }
  return context;
}
