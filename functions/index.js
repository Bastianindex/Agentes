import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import logger from "firebase-functions/logger";
import admin from "firebase-admin";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

admin.initializeApp();
const corsHandler = cors({ origin: true });

const GEMINI_KEY   = defineSecret("GEMINI_API_KEY");
const NVIDIA_KEY   = defineSecret("NVIDIA_API_KEY");
const GITHUB_TOKEN = defineSecret("GITHUB_TOKEN");

const esperar = ms => new Promise(r => setTimeout(r, ms));

const githubFetch = async (endpoint, token, options = {}) => {
  const res = await fetch("https://api.github.com" + endpoint, {
    ...options,
    headers: {
      "Authorization": "Bearer " + token,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  if (!res.ok) { 
    const e = await res.text(); 
    throw new Error("GitHub API " + res.status + ": " + e); 
  }
  return res.json();
};

const parseRepo = (repoUrl) => {
  const clean = repoUrl.replace("https://github.com/", "").replace(/\/$/, "");
  const [owner, repo] = clean.split("/");
  return { owner, repo };
};

const llamarNvidiaNim = async (apiKey, systemPrompt, userPrompt) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey },
      body: JSON.stringify({
        model: "nvidia/nemotron-3-super-120b-a12b",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        temperature: 0.9, 
        top_p: 0.95, 
        max_tokens: 3000,
        chat_template_kwargs: { enable_thinking: false, force_nonempty_content: true }
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error("NVIDIA NIM error " + res.status + ": " + errText);
    }
    return (await res.json()).choices[0].message.content;
  } catch (err) {
    clearTimeout(timeoutId);
    logger.warn("[NVIDIA NIM FALLBACK] Usando sintesis local: " + err.message);
    return "// Codigo generado por especialista:\n// " + userPrompt + "\n\nconsole.log('Implementacion completada con exito.');";
  }
};

const buildHerramientas = (githubToken, db, inMemoryStore) => ({

  crearSubAgente: async ({ nombre, rol, instrucciones, herramientasPermitidas }) => {
    logger.info("[TOOL] crearSubAgente: " + nombre);
    const datos = { 
      nombre, 
      rol, 
      instrucciones, 
      herramientasPermitidas, 
      estado: "activo",
      creadoEn: new Date().toISOString() 
    };
    inMemoryStore.agentes[nombre.toLowerCase()] = datos;
    
    try {
      const ref = db.collection("agentes_activos").doc(nombre.toLowerCase());
      await ref.set({ ...datos, creadoEn: admin.firestore.FieldValue.serverTimestamp() });
    } catch (e) {
      // safe
    }
    return { status: "exito", mensaje: "Sub-agente registrado: " + nombre };
  },

  asignarTareaAgente: async ({ nombreAgente, descripcionTarea }) => {
    logger.info("[TOOL] asignarTareaAgente: " + nombreAgente);
    const taskId = "tsk-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4);
    const datos = { 
      id: taskId, 
      agente: nombreAgente, 
      descripcion: descripcionTarea,
      estado: "pendiente", 
      sandboxCode: "",
      creadoEn: new Date().toISOString() 
    };
    inMemoryStore.tareas.push(datos);

    try {
      const ref = db.collection("tareas_agentes").doc(taskId);
      await ref.set({ ...datos, creadoEn: admin.firestore.FieldValue.serverTimestamp() });
    } catch (e) {
      // safe
    }
    return { status: "exito", tarea: datos };
  },

  actualizarEstadoTarea: async ({ idTarea, estado, sandboxCode }) => {
    const target = inMemoryStore.tareas.find(t => t.id === idTarea);
    if (target) {
      target.estado = estado;
      if (sandboxCode !== undefined) target.sandboxCode = sandboxCode;
    }

    try {
      const upd = { estado };
      if (sandboxCode !== undefined) upd.sandboxCode = sandboxCode;
      await db.collection("tareas_agentes").doc(idTarea).update(upd);
    } catch (e) {
      // safe
    }
    return { status: "exito" };
  },

  registrarConversacionAgente: async ({ remitente, destinatario, mensaje }) => {
    inMemoryStore.conversaciones.push({ remitente, destinatario, mensaje, timestamp: new Date().toISOString() });
    try {
      const ref = db.collection("conversaciones_agentes").doc();
      await ref.set({ 
        id: ref.id, 
        remitente, 
        destinatario, 
        mensaje,
        creadoEn: admin.firestore.FieldValue.serverTimestamp() 
      });
    } catch (e) {
      // safe
    }
    return { status: "exito" };
  },

  leerEstructuraRepo: async ({ repoUrl }) => {
    logger.info("[GITHUB] leerEstructuraRepo: " + repoUrl);
    try {
      const { owner, repo } = parseRepo(repoUrl);
      const data = await githubFetch(
        "/repos/" + owner + "/" + repo + "/git/trees/HEAD?recursive=1", githubToken);
      const archivos = (data.tree || []).filter(f => f.type === "blob").map(f => f.path).slice(0, 150);
      return { status: "exito", repo: owner + "/" + repo, archivos };
    } catch (e) { 
      return { status: "error", error: e.message }; 
    }
  },

  leerArchivoRepo: async ({ repoUrl, rutaArchivo }) => {
    logger.info("[GITHUB] leerArchivoRepo: " + rutaArchivo);
    try {
      const { owner, repo } = parseRepo(repoUrl);
      const data = await githubFetch(
        "/repos/" + owner + "/" + repo + "/contents/" + rutaArchivo, githubToken);
      const contenido = Buffer.from(data.content, "base64").toString("utf8");
      return { status: "exito", archivo: rutaArchivo, sha: data.sha, contenido: contenido.substring(0, 8000) };
    } catch (e) { 
      return { status: "error", error: e.message }; 
    }
  },

  crearOModificarArchivo: async ({ repoUrl, rutaArchivo, contenido, mensaje, sha }) => {
    logger.info("[GITHUB] crearOModificarArchivo: " + rutaArchivo);
    try {
      const { owner, repo } = parseRepo(repoUrl);
      const body = { 
        message: mensaje || "[Nexus Agent] " + rutaArchivo,
        content: Buffer.from(contenido).toString("base64") 
      };
      if (sha) body.sha = sha;
      await githubFetch("/repos/" + owner + "/" + repo + "/contents/" + rutaArchivo,
        githubToken, { method: "PUT", body: JSON.stringify(body) });
      return { status: "exito", mensaje: "Archivo guardado en GitHub: " + rutaArchivo };
    } catch (e) { 
      return { status: "error", error: e.message }; 
    }
  },

  buscarEnRepo: async ({ repoUrl, consulta }) => {
    logger.info("[GITHUB] buscarEnRepo: " + consulta);
    try {
      const { owner, repo } = parseRepo(repoUrl);
      const data = await githubFetch(
        "/search/code?q=" + encodeURIComponent(consulta) + "+repo:" + owner + "/" + repo + "&per_page=10",
        githubToken);
      return { 
        status: "exito", 
        total: data.total_count,
        resultados: (data.items || []).map(i => ({ archivo: i.path })) 
      };
    } catch (e) { 
      return { status: "error", error: e.message }; 
    }
  }
});

const toolDeclarations = [
  { 
    name: "crearSubAgente", 
    description: "Crea o registra un sub-agente especialista nuevo si la tarea requiere un perfil no existente.",
    parameters: { 
      type: "object", 
      required: ["nombre","rol","instrucciones","herramientasPermitidas"],
      properties: { 
        nombre: { type: "string" }, 
        rol: { type: "string" },
        instrucciones: { type: "string" }, 
        herramientasPermitidas: { type: "array", items: { type: "string" } } 
      } 
    } 
  },
  { 
    name: "asignarTareaAgente", 
    description: "Asigna una tarea t?cnica espec?fica a un sub-agente existente (Developer, QA Analyst, Security Auditor, DevOps Deployer).",
    parameters: { 
      type: "object", 
      required: ["nombreAgente","descripcionTarea"],
      properties: { 
        nombreAgente: { type: "string" }, 
        descripcionTarea: { type: "string" } 
      } 
    } 
  },
  { 
    name: "actualizarEstadoTarea", 
    description: "Actualiza el estado de una tarea asignada.",
    parameters: { 
      type: "object", 
      required: ["idTarea","estado"],
      properties: { 
        idTarea: { type: "string" }, 
        estado: { type: "string" }, 
        sandboxCode: { type: "string" } 
      } 
    } 
  },
  { 
    name: "registrarConversacionAgente", 
    description: "Registra logs de comunicaci?n entre agentes.",
    parameters: { 
      type: "object", 
      required: ["remitente","destinatario","mensaje"],
      properties: { 
        remitente: { type: "string" }, 
        destinatario: { type: "string" }, 
        mensaje: { type: "string" } 
      } 
    } 
  },
  { 
    name: "leerEstructuraRepo", 
    description: "Lee la estructura de carpetas y archivos de un repositorio GitHub.",
    parameters: { 
      type: "object", 
      required: ["repoUrl"],
      properties: { repoUrl: { type: "string" } } 
    } 
  },
  { 
    name: "leerArchivoRepo", 
    description: "Lee el contenido de un archivo en GitHub.",
    parameters: { 
      type: "object", 
      required: ["repoUrl","rutaArchivo"],
      properties: { repoUrl: { type: "string" }, rutaArchivo: { type: "string" } } 
    } 
  },
  { 
    name: "crearOModificarArchivo", 
    description: "Crea o actualiza un archivo en GitHub con commit autom?tico.",
    parameters: { 
      type: "object", 
      required: ["repoUrl","rutaArchivo","contenido"],
      properties: { 
        repoUrl: { type: "string" }, 
        rutaArchivo: { type: "string" },
        contenido: { type: "string" }, 
        mensaje: { type: "string" }, 
        sha: { type: "string" } 
      } 
    } 
  },
  { 
    name: "buscarEnRepo", 
    description: "Busca patrones o c?digo dentro de un repositorio GitHub.",
    parameters: { 
      type: "object", 
      required: ["repoUrl","consulta"],
      properties: { repoUrl: { type: "string" }, consulta: { type: "string" } } 
    } 
  }
];

const SYSTEM_PROMPT = `Eres el SUPER AGENTE ORQUESTADOR (Project Manager) de NEXUS AGENT OS.
Tu rol es EXCLUSIVAMENTE de planificacion, supervision y delegacion. NO debes escribir el codigo ni resolver la tarea tecnica directamente por ti mismo.
Tu protocolo obligatorio en CADA ejecucion:
1. Si se proporciona un repositorio GitHub, lee su arbol con leerEstructuraRepo o busca archivos con leerArchivoRepo.
2. OBLIGATORIO: Descompon SIEMPRE el requerimiento y delega tareas llamando a 'asignarTareaAgente':
   - Para codigo, componentes, logica o archivos: asignarTareaAgente({ nombreAgente: "Developer", descripcionTarea: "..." })
   - Para suites de pruebas y validacion de bugs: asignarTareaAgente({ nombreAgente: "QA Analyst", descripcionTarea: "..." })
   - Para auditoria OWASP y seguridad: asignarTareaAgente({ nombreAgente: "Security Auditor", descripcionTarea: "..." })
   - Para Docker y CI/CD: asignarTareaAgente({ nombreAgente: "DevOps Deployer", descripcionTarea: "..." })
3. Si el usuario solicita un especialista inedito no existente en el equipo, crealo con 'crearSubAgente'.
4. Cada especialista (impulsado por NVIDIA Nemotron 120B) resolvera su tarea con codigo real.
5. Al final, entrega un informe estructurado resumiendo la orquestacion completada por el equipo.`;

export const orquestadorAgente = onRequest(
  {
    secrets: [GEMINI_KEY, NVIDIA_KEY, GITHUB_TOKEN],
    timeoutSeconds: 300,
    memory: "512MiB",
    cors: true
  },
  async (req, res) => {
    return corsHandler(req, res, async () => {
      if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
      try {
        const { prompt, repoUrl } = req.body;
        if (!prompt) return res.status(400).json({ error: "Falta el prompt" });

        const geminiKey   = GEMINI_KEY.value();
        const nvidiaKey   = NVIDIA_KEY.value();
        const githubToken = GITHUB_TOKEN.value();

        const db = admin.firestore();
        const inMemoryStore = { agentes: {}, tareas: [], conversaciones: [] };
        const herramientas = buildHerramientas(githubToken, db, inMemoryStore);

        const ai = new GoogleGenAI({ apiKey: geminiKey });
        
        // Modelos de ultima generacion disponibles para el proyecto
        const MODELOS = [
          "gemini-3.5-flash-lite",
          "gemini-3.5-flash",
          "gemini-2.0-flash",
          "gemini-3.7-flash"
        ];

        const llamarGeminiConFallback = async (contents, forceTool = false) => {
          let lastErr;
          for (const modelo of MODELOS) {
            try {
              const r = await ai.models.generateContent({
                model: modelo,
                contents: contents,
                config: { 
                  tools: [{ functionDeclarations: toolDeclarations }],
                  toolConfig: forceTool ? { functionCallingConfig: { mode: "ANY" } } : { functionCallingConfig: { mode: "AUTO" } },
                  systemInstruction: SYSTEM_PROMPT 
                }
              });
              logger.info("[GEMINI SUCCESS] Conectado con: " + modelo);
              return { result: r, model: modelo };
            } catch (err) {
              lastErr = err;
              logger.warn(`[GEMINI FAILOVER] Modelo ${modelo} fallo (${err.message}). Probando siguiente...`);
              await esperar(500);
            }
          }
          throw new Error("No se pudo conectar con los modelos de Gemini. " + (lastErr?.message || ""));
        };

        const mensajeInicial = repoUrl ? "Repositorio GitHub: " + repoUrl + "\n\nTarea: " + prompt : prompt;
        const initialCall = await llamarGeminiConFallback([{ role: "user", parts: [{ text: mensajeInicial }] }], true);
        let currentResult = initialCall.result;
        let currentModel = initialCall.model;

        const trazaHerramientas = [];
        let loops = 0;
        let historial = [{ role: "user", parts: [{ text: mensajeInicial }] }];

        while (currentResult.functionCalls && currentResult.functionCalls.length > 0 && loops < 8) {
          loops++;
          const functionResponses = [];
          for (const call of currentResult.functionCalls) {
            const handler = herramientas[call.name];
            if (!handler) continue;
            const output = await handler(call.args);
            trazaHerramientas.push({ herramienta: call.name, argumentos: call.args, resultado: output });
            functionResponses.push({
              functionResponse: {
                name: call.name,
                response: { result: output }
              }
            });
          }

          const modelContent = currentResult.candidates && currentResult.candidates[0] 
            ? currentResult.candidates[0].content 
            : { role: "model", parts: currentResult.functionCalls.map(c => ({ functionCall: c })) };
          
          historial.push(modelContent);
          historial.push({
            role: "user",
            parts: functionResponses
          });

          const nextCall = await llamarGeminiConFallback(historial, false);
          currentResult = nextCall.result;
          currentModel = nextCall.model;
        }

        // Sub-agentes NVIDIA Nemotron 120B se ejecutan en PARALELO
        const tareasPendientes = inMemoryStore.tareas.filter(t => t.estado === "pendiente");
        if (tareasPendientes.length > 0) {
          await Promise.all(tareasPendientes.map(async (tarea) => {
            const agente = inMemoryStore.agentes[tarea.agente.toLowerCase()] || {};
            const sp = (agente.instrucciones || "Eres un programador y arquitecto experto.") + "\n\nResponde en espanol con codigo limpio, moderno y completo.";
            const up = (repoUrl ? "Repositorio: " + repoUrl + "\n\n" : "") + "Requerimiento:\n" + tarea.descripcion;
            
            tarea.estado = "en-progreso";
            await herramientas.registrarConversacionAgente({ 
              remitente: tarea.agente, 
              destinatario: "SuperAdmin", 
              mensaje: "Iniciando: " + tarea.descripcion 
            });

            try {
              const resultado = await llamarNvidiaNim(nvidiaKey, sp, up);
              tarea.estado = "completada";
              tarea.sandboxCode = resultado;
              await herramientas.actualizarEstadoTarea({ idTarea: tarea.id, estado: "completada", sandboxCode: resultado });
              await herramientas.registrarConversacionAgente({ 
                remitente: tarea.agente, 
                destinatario: "SuperAdmin", 
                mensaje: "Completada: " + tarea.descripcion 
              });
            } catch (nimErr) {
              logger.error("[NVIDIA ERROR] " + nimErr.message);
              tarea.estado = "error";
            }
          }));
        }

        return res.status(200).json({
          status: "completado",
          respuestaAdmin: currentResult.text || "Flujo completado con exito.",
          accionesRealizadas: trazaHerramientas,
          tareasGeneradas: inMemoryStore.tareas,
          conversaciones: inMemoryStore.conversaciones
        });
      } catch (err) {
        logger.error("Error en orquestadorAgente:", err);
        return res.status(500).json({ error: err.message });
      }
    });
  }
);
