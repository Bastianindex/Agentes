import http from 'http';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

// Cargar variables de entorno del archivo .env
dotenv.config();

const FILE_AGENTS = './db_agents_activos.json';
const FILE_TASKS = './db_tareas_agentes.json';
const FILE_CONVERSATIONS = './db_conversaciones_agentes.json';
const FILE_KNOWLEDGE = './db_knowledge_base.json';

// Inicializar archivos JSON si no existen
if (!fs.existsSync(FILE_AGENTS)) fs.writeFileSync(FILE_AGENTS, JSON.stringify([]), 'utf8');
if (!fs.existsSync(FILE_TASKS)) fs.writeFileSync(FILE_TASKS, JSON.stringify([]), 'utf8');
if (!fs.existsSync(FILE_CONVERSATIONS)) fs.writeFileSync(FILE_CONVERSATIONS, JSON.stringify([]), 'utf8');
if (!fs.existsSync(FILE_KNOWLEDGE)) fs.writeFileSync(FILE_KNOWLEDGE, JSON.stringify([]), 'utf8');

// Pre-poblar agentes predefinidos si la BD está vacía
const AGENTES_PREDEFINIDOS = [
  {
    nombre: "Super Agente Administrador",
    rol: "Project Manager & Orquestador",
    instrucciones: "Recibe requerimientos del cliente, planifica el backlog y coordina a todos los sub-agentes de forma autónoma.",
    herramientasPermitidas: ["todas"],
    estado: "online",
    modelo: "Gemini (Nube)",
    emoji: "🧠",
    creadoEn: new Date().toISOString()
  },
  {
    nombre: "Frontend Developer",
    rol: "Desarrollador de Interfaces",
    instrucciones: "Diseña y desarrolla componentes React, HTML, CSS y lógica de UI. Aplica mejores prácticas de accesibilidad y diseño responsivo.",
    herramientasPermitidas: ["modificarArchivoProyecto", "leerContenidoArchivo"],
    estado: "inactivo",
    modelo: "Ollama (GPU Local)",
    emoji: "🎨",
    creadoEn: new Date().toISOString()
  },
  {
    nombre: "Backend Developer",
    rol: "Desarrollador de APIs y Bases de Datos",
    instrucciones: "Diseña y desarrolla endpoints REST, lógica de negocio, conexiones a bases de datos y arquitectura de servidores.",
    herramientasPermitidas: ["modificarArchivoProyecto", "leerContenidoArchivo", "ejecutarComandoPrueba"],
    estado: "inactivo",
    modelo: "Ollama (GPU Local)",
    emoji: "⚙️",
    creadoEn: new Date().toISOString()
  },
  {
    nombre: "Auditor de Ciberseguridad",
    rol: "Especialista en Seguridad",
    instrucciones: "Audita el código en busca de vulnerabilidades XSS, inyección SQL, credenciales expuestas, headers inseguros y malas configuraciones. Reporta con línea y severidad.",
    herramientasPermitidas: ["leerContenidoArchivo", "leerEstructuraProyecto", "registrarConversacionAgente"],
    estado: "inactivo",
    modelo: "Ollama (GPU Local)",
    emoji: "🔒",
    creadoEn: new Date().toISOString()
  },
  {
    nombre: "QA Tester",
    rol: "Ingeniero de Calidad y Testing",
    instrucciones: "Diseña casos de prueba, ejecuta suites de testing automatizado y valida que el código cumpla los requerimientos. Reporta bugs con reproducción detallada.",
    herramientasPermitidas: ["ejecutarComandoPrueba", "leerContenidoArchivo", "registrarConversacionAgente"],
    estado: "inactivo",
    modelo: "Ollama (GPU Local)",
    emoji: "🧪",
    creadoEn: new Date().toISOString()
  },
  {
    nombre: "DevOps Deployer",
    rol: "Ingeniero de Infraestructura y Despliegue",
    instrucciones: "Gestiona pipelines CI/CD, configuración de entornos, contenedores Docker y despliegues a producción. Verifica que la infraestructura sea robusta y segura.",
    herramientasPermitidas: ["ejecutarComandoPrueba", "modificarArchivoProyecto", "leerEstructuraProyecto"],
    estado: "inactivo",
    modelo: "Ollama (GPU Local)",
    emoji: "🚀",
    creadoEn: new Date().toISOString()
  }
];

const agentesActuales = JSON.parse(fs.readFileSync(FILE_AGENTS, 'utf8'));
if (agentesActuales.length === 0) {
  fs.writeFileSync(FILE_AGENTS, JSON.stringify(AGENTES_PREDEFINIDOS, null, 2), 'utf8');
  console.log('👥 [INIT] 6 agentes predefinidos cargados en la base de datos local.');
}

// Cargar contratos de trabajo (.md) de cada agente desde la carpeta /agents/
const AGENTES_MD = {};
const agentsMdMap = {
  'Frontend Developer':              'agents/frontend-dev.md',
  'Backend Developer':               'agents/backend-dev.md',
  'Especialista en Buenas Practicas':'agents/security-specialist.md',
  'Auditor de Ciberseguridad':       'agents/security-specialist.md',
  'QA Tester':                       'agents/qa-tester.md',
  'DevOps Deployer':                 'agents/devops-deployer.md',
  'Super Agente Administrador':      'agents/super-admin.md',
};
Object.entries(agentsMdMap).forEach(([nombre, ruta]) => {
  if (fs.existsSync(ruta)) {
    AGENTES_MD[nombre] = fs.readFileSync(ruta, 'utf8');
    console.log(`📋 [INIT] Contrato cargado: ${nombre}`);
  }
});

// Helper para sub-agentes usando NVIDIA Nemotron-3-Super-120B via NIM API
const llamarNvidiaNim = async (systemPrompt, userPrompt) => {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return "[Error] Falta NVIDIA_API_KEY en el archivo .env. Obtén tu clave en https://build.nvidia.com";
  }
  try {
    const modelo = process.env.NVIDIA_MODEL || "nvidia/nemotron-3-super-120b-a12b";
    console.log(`\n🟢 [NVIDIA NIM] Llamando a ${modelo} (120B activos: 12B)...`);
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelo,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: userPrompt }
        ],
        temperature: 1.0,
        top_p: 0.95,
        max_tokens: 4096,
        // Parámetros recomendados por NVIDIA para coding agents
        chat_template_kwargs: {
          enable_thinking: false,       // Desactivado para respuestas más rápidas
          force_nonempty_content: true  // Requerido para agentes de código
        }
      })
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`NVIDIA NIM error ${response.status}: ${err}`);
    }
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (err) {
    console.error("Error al conectar con NVIDIA NIM:", err.message);
    return `[Error NVIDIA NIM] ${err.message}`;
  }
};

// 1. Manejadores de herramientas locales
const herramientasEjecutables = {
  crearSubAgente: async ({ nombre, rol, instrucciones, herramientasPermitidas }) => {
    console.log(`\n👷 [ADMIN TOOL] Creando sub-agente: ${nombre} (${rol})`);
    try {
      const data = fs.readFileSync(FILE_AGENTS, 'utf8');
      const agentes = JSON.parse(data);
      
      const nuevoAgente = {
        nombre,
        rol,
        instrucciones,
        herramientasPermitidas,
        estado: "activo",
        creadoEn: new Date().toISOString()
      };
      
      const index = agentes.findIndex(a => a.nombre.toLowerCase() === nombre.toLowerCase());
      if (index !== -1) {
        agentes[index] = nuevoAgente;
      } else {
        agentes.push(nuevoAgente);
      }
      
      fs.writeFileSync(FILE_AGENTS, JSON.stringify(agentes, null, 2), 'utf8');
      return { 
        status: "exito", 
        mensaje: `Sub-agente '${nombre}' instanciado como '${rol}' y guardado localmente.`,
        agente: nuevoAgente
      };
    } catch (error) {
      console.error(error);
      return { status: "error", error: error.message };
    }
  },

  asignarTareaAgente: async ({ nombreAgente, descripcionTarea }) => {
    console.log(`\n📋 [ADMIN TOOL] Asignando tarea a: ${nombreAgente}`);
    try {
      const dataAgents = fs.readFileSync(FILE_AGENTS, 'utf8');
      const agentes = JSON.parse(dataAgents);
      
      const agenteExiste = agentes.some(a => a.nombre.toLowerCase() === nombreAgente.toLowerCase());
      if (!agenteExiste) {
        return { 
          status: "error", 
          error: `El agente '${nombreAgente}' no está registrado. Debes crearlo primero.` 
        };
      }
      
      const dataTasks = fs.readFileSync(FILE_TASKS, 'utf8');
      const tareas = JSON.parse(dataTasks);
      
      const nuevaTarea = {
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        agente: nombreAgente,
        descripcion: descripcionTarea,
        estado: "pendiente",
        sandboxCode: "",
        creadoEn: new Date().toISOString()
      };
      
      tareas.push(nuevaTarea);
      fs.writeFileSync(FILE_TASKS, JSON.stringify(tareas, null, 2), 'utf8');
      
      return { 
        status: "exito", 
        mensaje: `Tarea asignada al agente ${nombreAgente} correctamente.`,
        tarea: nuevaTarea
      };
    } catch (error) {
      console.error(error);
      return { status: "error", error: error.message };
    }
  },

  actualizarEstadoTarea: async ({ idTarea, estado, sandboxCode }) => {
    console.log(`\n🔄 [ADMIN TOOL] Actualizando tarea ${idTarea} a estado: ${estado}`);
    try {
      const dataTasks = fs.readFileSync(FILE_TASKS, 'utf8');
      const tareas = JSON.parse(dataTasks);
      
      const index = tareas.findIndex(t => t.id === idTarea);
      if (index === -1) {
        return { status: "error", error: `No se encontró la tarea con ID '${idTarea}'.` };
      }
      
      tareas[index].estado = estado;
      if (sandboxCode !== undefined) {
        tareas[index].sandboxCode = sandboxCode;
      }
      
      fs.writeFileSync(FILE_TASKS, JSON.stringify(tareas, null, 2), 'utf8');
      return { 
        status: "exito", 
        mensaje: `Tarea ${idTarea} actualizada a estado '${estado}'.`,
        tarea: tareas[index]
      };
    } catch (error) {
      console.error(error);
      return { status: "error", error: error.message };
    }
  },

  registrarConversacionAgente: async ({ remitente, destinatario, mensaje }) => {
    console.log(`\n💬 [CHAT TOOL] ${remitente} ➔ ${destinatario}: "${mensaje.substring(0, 40)}..."`);
    try {
      const data = fs.readFileSync(FILE_CONVERSATIONS, 'utf8');
      const conversaciones = JSON.parse(data);
      
      const nuevoMensaje = {
        id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        remitente,
        destinatario,
        mensaje,
        creadoEn: new Date().toISOString()
      };
      
      conversaciones.push(nuevoMensaje);
      fs.writeFileSync(FILE_CONVERSATIONS, JSON.stringify(conversaciones, null, 2), 'utf8');
      
      return { status: "exito", mensaje: "Mensaje de conversación registrado con éxito." };
    } catch (error) {
      console.error(error);
      return { status: "error", error: error.message };
    }
  },

  // HERRAMIENTA: Escanear estructura de proyecto local existente
  leerEstructuraProyecto: async ({ rutaProyecto }) => {
    console.log(`\n📂 [AUDIT TOOL] Escaneando estructura del proyecto: ${rutaProyecto}`);
    try {
      const normalizarRuta = path.normalize(rutaProyecto);
      if (!fs.existsSync(normalizarRuta)) {
        return { status: "error", error: `La ruta '${normalizarRuta}' no existe.` };
      }

      const escanearDirectorio = (dir, listaArchivos = []) => {
        const archivos = fs.readdirSync(dir);
        archivos.forEach(archivo => {
          const rutaCompleta = path.join(dir, archivo);
          const stat = fs.statSync(rutaCompleta);
          
          // Ignorar carpetas pesadas o innecesarias
          if (stat.isDirectory()) {
            const nombreCarpeta = path.basename(rutaCompleta);
            if (['node_modules', '.git', 'dist', 'build', '.gemini'].includes(nombreCarpeta)) return;
            escanearDirectorio(rutaCompleta, listaArchivos);
          } else {
            const relPath = path.relative(normalizarRuta, rutaCompleta);
            listaArchivos.push(relPath);
          }
        });
        return listaArchivos;
      };

      const estructura = escanearDirectorio(normalizarRuta);
      return { status: "exito", archivos: estructura.slice(0, 50) }; // Capped a 50 archivos
    } catch (e) {
      console.error(e);
      return { status: "error", error: e.message };
    }
  },

  // HERRAMIENTA: Leer archivo del proyecto local (Soporta PDF de forma transparente usando pdf-parse)
  leerContenidoArchivo: async ({ rutaProyecto, rutaRelativa }) => {
    console.log(`\n📄 [AUDIT TOOL] Leyendo archivo local: ${rutaRelativa}`);
    try {
      const rutaSegura = path.join(path.normalize(rutaProyecto), path.normalize(rutaRelativa));
      if (!rutaSegura.startsWith(path.normalize(rutaProyecto))) {
        return { status: "error", error: "Intento de navegación de directorios no permitido." };
      }

      if (!fs.existsSync(rutaSegura)) {
        return { status: "error", error: `El archivo '${rutaRelativa}' no existe en el proyecto.` };
      }

      const ext = path.extname(rutaSegura).toLowerCase();
      if (ext === '.pdf') {
        console.log(`📚 [PDF PARSER] Detectado archivo PDF. Extrayendo texto usando pdf-parse...`);
        const dataBuffer = fs.readFileSync(rutaSegura);
        const pdfData = await pdf(dataBuffer);
        return { status: "exito", contenido: pdfData.text };
      } else {
        const contenido = fs.readFileSync(rutaSegura, 'utf8');
        return { status: "exito", contenido };
      }
    } catch (e) {
      console.error(e);
      return { status: "error", error: e.message };
    }
  },

  // HERRAMIENTA: Escribir/Modificar archivo local
  modificarArchivoProyecto: async ({ rutaProyecto, rutaRelativa, nuevoContenido }) => {
    console.log(`\n✏️ [AUDIT TOOL] Modificando archivo local: ${rutaRelativa}`);
    try {
      const rutaSegura = path.join(path.normalize(rutaProyecto), path.normalize(rutaRelativa));
      if (!rutaSegura.startsWith(path.normalize(rutaProyecto))) {
        return { status: "error", error: "Intento de navegación de directorios no permitido." };
      }

      const parentDir = path.dirname(rutaSegura);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }

      fs.writeFileSync(rutaSegura, nuevoContenido, 'utf8');
      return { status: "exito", mensaje: `Archivo '${rutaRelativa}' modificado y guardado con éxito.` };
    } catch (e) {
      console.error(e);
      return { status: "error", error: e.message };
    }
  },

  // HERRAMIENTA: Ejecutar comandos de consola locales (Tests reales en tu máquina)
  ejecutarComandoPrueba: async ({ rutaProyecto, comando }) => {
    console.log(`\n💻 [QA TOOL] Ejecutando comando de consola en '${rutaProyecto}': "${comando}"`);
    try {
      const rutaNormalizada = path.normalize(rutaProyecto);
      if (!fs.existsSync(rutaNormalizada)) {
        return { status: "error", error: "La ruta del proyecto no existe." };
      }

      // Sanitizar el comando: Permitir solo comandos de testing y linters seguros
      const comandoLimpio = comando.trim();
      const comandosPermitidos = ['npm test', 'npm run build', 'npm run lint', 'vitest run', 'jest', 'eslint'];
      const esPermitido = comandosPermitidos.some(allowed => comandoLimpio.startsWith(allowed));

      if (!esPermitido) {
        return { 
          status: "error", 
          error: `Comando rechazado por seguridad. Solo se permiten: ${comandosPermitidos.join(', ')}` 
        };
      }

      return new Promise((resolve) => {
        exec(comandoLimpio, { cwd: rutaNormalizada, timeout: 15000 }, (error, stdout, stderr) => {
          if (error && error.killed) {
            resolve({ status: "error", error: "Ejecución de comando interrumpida por exceder el límite de tiempo (15s)." });
            return;
          }
          resolve({
            status: error ? "fallo" : "exito",
            stdout: stdout || "",
            stderr: stderr || ""
          });
        });
      });

    } catch (e) {
      console.error(e);
      return { status: "error", error: e.message };
    }
  },

  // HERRAMIENTA: Búsqueda local en base de conocimiento RAG (NotebookLM alternativo)
  buscarEnBaseConocimiento: async ({ consulta }) => {
    console.log(`\n🔍 [RAG TOOL] Buscando en Base de Conocimiento Local para: "${consulta}"`);
    try {
      const data = fs.readFileSync(FILE_KNOWLEDGE, 'utf8');
      const fragmentos = JSON.parse(data);
      if (fragmentos.length === 0) {
        return { status: "exito", resultados: "La base de conocimientos está vacía. Sube archivos primero en el dashboard." };
      }

      // Buscar por palabras clave simples (TF-IDF mock)
      const palabras = consulta.toLowerCase().split(/\s+/).filter(p => p.length > 2);
      const ranking = fragmentos.map(frag => {
        let matches = 0;
        palabras.forEach(palabra => {
          if (frag.contenido.toLowerCase().includes(palabra)) matches++;
        });
        return { ...frag, matches };
      });

      const filtrados = ranking
        .filter(r => r.matches > 0)
        .sort((a, b) => b.matches - a.matches)
        .slice(0, 3);

      if (filtrados.length === 0) {
        return { status: "exito", resultados: "No se encontraron coincidencias directas en la base de datos de conocimiento." };
      }

      const respuesta = filtrados.map((f, i) => `[Resultado ${i+1} de ${f.archivo}] ... ${f.contenido.substring(0, 800)} ...`).join("\n\n");
      return { status: "exito", resultados: respuesta };
    } catch (e) {
      console.error(e);
      return { status: "error", error: e.message };
    }
  }
};

// 2. Declaraciones de herramientas para Gemini
const crearSubAgenteTool = {
  name: "crearSubAgente",
  description: "Crea e instancia un nuevo sub-agente especialista en el equipo de desarrollo de la empresa virtual.",
  parameters: {
    type: "object",
    properties: {
      nombre: { type: "string", description: "El nombre del sub-agente (ej. 'AgenteProgramador', 'AgenteTester'). Sin espacios." },
      rol: { type: "string", description: "El rol o cargo dentro del equipo (ej. 'Desarrollador Frontend', 'Auditor Ciberseguridad')." },
      instrucciones: { type: "string", description: "Prompt del sistema que define sus reglas, lenguajes preferidos y estilo de desarrollo." },
      herramientasPermitidas: { type: "array", items: { type: "string" }, description: "Lista de herramientas permitidas." }
    },
    required: ["nombre", "rol", "instrucciones", "herramientasPermitidas"]
  }
};

const asignarTareaAgenteTool = {
  name: "asignarTareaAgente",
  description: "Asigna una tarea de desarrollo o auditoría de software a un sub-agente previamente creado.",
  parameters: {
    type: "object",
    properties: {
      nombreAgente: { type: "string", description: "El nombre del sub-agente asignado (ej. 'AgenteProgramadorBackend')." },
      descripcionTarea: { type: "string", description: "Descripción detallada de la tarea técnica a realizar." }
    },
    required: ["nombreAgente", "descripcionTarea"]
  }
};

const actualizarEstadoTareaTool = {
  name: "actualizarEstadoTarea",
  description: "Actualiza el estado de una tarea técnica en el tablero Kanban y opcionalmente adjunta el código fuente resultante (sandboxCode).",
  parameters: {
    type: "object",
    properties: {
      idTarea: { type: "string", description: "El ID único de la tarea (ej. 'task_1720000000000')." },
      estado: { type: "string", enum: ["pendiente", "en-progreso", "completada"], description: "El nuevo estado de la tarea en el tablero Kanban." },
      sandboxCode: { type: "string", description: "Código fuente completo generado (HTML, CSS o JavaScript) para previsualización interactiva en el Sandbox." }
    },
    required: ["idTarea", "estado"]
  }
};

const registrarConversacionAgenteTool = {
  name: "registrarConversacionAgente",
  description: "Registra un mensaje de comunicación o debate técnico entre los agentes (remitente y destinatario) para auditoría visual en el dashboard.",
  parameters: {
    type: "object",
    properties: {
      remitente: { type: "string", description: "El nombre del agente que envía el mensaje (ej. 'SuperAdmin', 'AgenteProgramador')." },
      destinatario: { type: "string", description: "El nombre del agente que recibe el mensaje (ej. 'AgenteTester')." },
      mensaje: { type: "string", description: "El contenido del mensaje de negociación o reporte técnico." }
    },
    required: ["remitente", "destinatario", "mensaje"]
  }
};

const leerEstructuraProyectoTool = {
  name: "leerEstructuraProyecto",
  description: "Escanea la ruta del proyecto local del usuario y devuelve el árbol de directorios y archivos de código para poder auditarlo.",
  parameters: {
    type: "object",
    properties: {
      rutaProyecto: { type: "string", description: "La ruta absoluta del proyecto en el disco duro (ej. 'C:/Proyectos/MiWeb')." }
    },
    required: ["rutaProyecto"]
  }
};

const leerContenidoArchivoTool = {
  name: "leerContenidoArchivo",
  description: "Lee el contenido de texto (código fuente) de un archivo específico de un proyecto local para analizarlo en búsqueda de vulnerabilidades o bugs.",
  parameters: {
    type: "object",
    properties: {
      rutaProyecto: { type: "string", description: "La ruta absoluta del proyecto en el disco duro (ej. 'C:/Proyectos/MiWeb')." },
      rutaRelativa: { type: "string", description: "La ruta relativa del archivo dentro del proyecto (ej. 'src/App.jsx')." }
    },
    required: ["rutaProyecto", "rutaRelativa"]
  }
};

const modificarArchivoProyectoTool = {
  name: "modificarArchivoProyecto",
  description: "Modifica o escribe código nuevo en un archivo de un proyecto local del usuario. Es una herramienta poderosa para refactorizar y corregir errores.",
  parameters: {
    type: "object",
    properties: {
      rutaProyecto: { type: "string", description: "La ruta absoluta del proyecto en el disco duro." },
      rutaRelativa: { type: "string", description: "La ruta relativa del archivo dentro del proyecto." },
      nuevoContenido: { type: "string", description: "Código fuente completo corregido o refactorizado que se guardará." }
    },
    required: ["rutaProyecto", "rutaRelativa", "nuevoContenido"]
  }
};

const ejecutarComandoPruebaTool = {
  name: "ejecutarComandoPrueba",
  description: "Ejecuta un comando real de consola (npm test, eslint, vitest run) en el proyecto local del usuario para comprobar si el código compila y pasa las pruebas.",
  parameters: {
    type: "object",
    properties: {
      rutaProyecto: { type: "string", description: "La ruta absoluta del proyecto local." },
      comando: { type: "string", description: "El comando de consola a ejecutar (ej. 'npm test' o 'npm run build')." }
    },
    required: ["rutaProyecto", "comando"]
  }
};

const buscarEnBaseConocimientoTool = {
  name: "buscarEnBaseConocimiento",
  description: "Realiza una búsqueda semántica de información sobre manuales y documentos PDF subidos a la base de conocimiento local para orientar las decisiones de diseño.",
  parameters: {
    type: "object",
    properties: {
      consulta: { type: "string", description: "La frase o término a buscar en la documentación." }
    },
    required: ["consulta"]
  }
};

const instruccionesSuperAdmin = (
  "Eres el Project Manager de una empresa de software. Tu equipo está compuesto por: " +
  "Frontend Developer, Backend Developer, Especialista en Calidad de Código (QA), Ingeniero de Buenas Prácticas y DevOps Engineer.\n" +
  "Tu misión es coordinar a tu equipo para REVISAR, MEJORAR y REFACTORIZAR el código del proyecto del cliente siguiendo " +
  "las mejores prácticas de desarrollo de software (clean code, SOLID, OWASP guidelines for developers).\n" +
  "Cuando el cliente provea una 'rutaProyecto':\n" +
  "1. Usa 'leerEstructuraProyecto' para listar los archivos del proyecto.\n" +
  "2. Usa 'leerContenidoArchivo' para leer el código fuente de los archivos principales.\n" +
  "3. Crea sub-agentes con 'crearSubAgente' para tu equipo (Frontend, Backend, QA, BuenasPracticas).\n" +
  "4. Asigna tareas con 'asignarTareaAgente' a cada especialista para revisar su área.\n" +
  "5. El especialista en Buenas Prácticas revisa que el código siga las guías OWASP para desarrolladores: " +
  "uso correcto de variables de entorno, sanitización de inputs, headers HTTP apropiados y manejo seguro de errores.\n" +
  "6. El QA usa 'ejecutarComandoPrueba' para correr linters y tests del proyecto.\n" +
  "7. Si hay mejoras necesarias, el desarrollador correspondiente usa 'modificarArchivoProyecto' para aplicarlas.\n" +
  "8. Usa 'registrarConversacionAgente' constantemente para que el usuario vea el debate técnico del equipo.\n" +
  "Comunica todo en español. Sé constructivo, técnico y detallado en cada revisión de código."
);

const calcularCosto = (usage) => {
  if (!usage) return { promptTokens: 0, candidatesTokens: 0, totalTokens: 0, costo: 0 };
  const promptTokens = usage.promptTokenCount || 0;
  const candidatesTokens = usage.candidatesTokenCount || 0;
  const totalTokens = usage.totalTokenCount || 0;
  const costo = (promptTokens * 0.000000075) + (candidatesTokens * 0.00000030);
  return {
    promptTokens,
    candidatesTokens,
    totalTokens,
    costo: parseFloat(costo.toFixed(6))
  };
};

// 3. Servidor HTTP
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);



  // Endpoint: GET /api/agents
  if (url.pathname === '/api/agents' && req.method === 'GET') {
    try {
      const data = fs.readFileSync(FILE_AGENTS, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // Endpoint: GET /api/tasks
  if (url.pathname === '/api/tasks' && req.method === 'GET') {
    try {
      const data = fs.readFileSync(FILE_TASKS, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // Endpoint: GET /api/conversations
  if (url.pathname === '/api/conversations' && req.method === 'GET') {
    try {
      const data = fs.readFileSync(FILE_CONVERSATIONS, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // Endpoint: DELETE /api/reset
  if (url.pathname === '/api/reset' && req.method === 'DELETE') {
    try {
      fs.writeFileSync(FILE_AGENTS, JSON.stringify([]), 'utf8');
      fs.writeFileSync(FILE_TASKS, JSON.stringify([]), 'utf8');
      fs.writeFileSync(FILE_CONVERSATIONS, JSON.stringify([]), 'utf8');
      fs.writeFileSync(FILE_KNOWLEDGE, JSON.stringify([]), 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: "exito", mensaje: "Base de datos y base de conocimiento limpiados." }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // Endpoint: POST /api/process-file (RAG Local de PDFs / Textos)
  if (url.pathname === '/api/process-file' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const { filePath } = payload;
        
        if (!filePath) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "La ruta del archivo 'filePath' es requerida." }));
          return;
        }

        const normPath = path.normalize(filePath);
        if (!fs.existsSync(normPath)) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `El archivo en '${normPath}' no existe en tu PC.` }));
          return;
        }

        console.log(`\n📚 [RAG PROCESS] Leyendo y procesando: ${normPath}`);
        const ext = path.extname(normPath).toLowerCase();
        let textContent = "";

        if (ext === '.pdf') {
          const dataBuffer = fs.readFileSync(normPath);
          const pdfData = await pdf(dataBuffer);
          textContent = pdfData.text;
        } else if (['.txt', '.md', '.json', '.js', '.jsx', '.html', '.css', '.ts'].includes(ext)) {
          textContent = fs.readFileSync(normPath, 'utf8');
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Formato de archivo '${ext}' no soportado para RAG.` }));
          return;
        }

        if (!textContent.trim()) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "El archivo está vacío." }));
          return;
        }

        // Dividir en fragmentos (chunks) de 1000 caracteres con 200 caracteres de solapamiento
        const size = 1000;
        const overlap = 200;
        const chunks = [];
        const filename = path.basename(normPath);
        
        for (let i = 0; i < textContent.length; i += (size - overlap)) {
          const content = textContent.substring(i, i + size);
          chunks.push({
            id: `chunk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            archivo: filename,
            contenido: content,
            creadoEn: new Date().toISOString()
          });
          if (i + size >= textContent.length) break;
        }

        const dataKnowledge = fs.readFileSync(FILE_KNOWLEDGE, 'utf8');
        const dbKnowledge = JSON.parse(dataKnowledge);
        dbKnowledge.push(...chunks);
        
        fs.writeFileSync(FILE_KNOWLEDGE, JSON.stringify(dbKnowledge, null, 2), 'utf8');
        console.log(`✅ [RAG PROCESS] Fragmentado con éxito: ${chunks.length} fragmentos añadidos a la base de conocimiento.`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: "exito", 
          mensaje: `Archivo '${filename}' procesado y guardado con éxito.`,
          fragmentosCreados: chunks.length
        }));

      } catch (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Endpoint: POST /api/upload-file-content (Soporta cargar archivos base64 desde buscador de archivos)
  if (url.pathname === '/api/upload-file-content' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const { fileName, fileContentBase64 } = payload;
        
        if (!fileName || !fileContentBase64) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "fileName y fileContentBase64 son requeridos." }));
          return;
        }

        console.log(`\n📚 [RAG UPLOAD] Procesando archivo subido: ${fileName}`);
        const ext = path.extname(fileName).toLowerCase();
        let textContent = "";
        
        const fileBuffer = Buffer.from(fileContentBase64, 'base64');

        if (ext === '.pdf') {
          const pdfData = await pdf(fileBuffer);
          textContent = pdfData.text;
        } else if (['.txt', '.md', '.json', '.js', '.jsx', '.html', '.css', '.ts'].includes(ext)) {
          textContent = fileBuffer.toString('utf8');
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Formato '${ext}' no soportado para RAG.` }));
          return;
        }

        if (!textContent.trim()) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "El archivo está vacío." }));
          return;
        }

        // Chunks
        const size = 1000;
        const overlap = 200;
        const chunks = [];
        
        for (let i = 0; i < textContent.length; i += (size - overlap)) {
          const content = textContent.substring(i, i + size);
          chunks.push({
            id: `chunk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            archivo: fileName,
            contenido: content,
            creadoEn: new Date().toISOString()
          });
          if (i + size >= textContent.length) break;
        }

        const dataKnowledge = fs.readFileSync(FILE_KNOWLEDGE, 'utf8');
        const dbKnowledge = JSON.parse(dataKnowledge);
        dbKnowledge.push(...chunks);
        fs.writeFileSync(FILE_KNOWLEDGE, JSON.stringify(dbKnowledge, null, 2), 'utf8');
        console.log(`✅ [RAG UPLOAD] Fragmentado con éxito: ${chunks.length} fragmentos añadidos a la base de conocimiento.`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: "exito", 
          mensaje: `Archivo '${fileName}' procesado y guardado con éxito.`,
          fragmentosCreados: chunks.length
        }));

      } catch (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Endpoint: POST /api/runAgent
  if (url.pathname === '/api/runAgent' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());

    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const { prompt, api_key, projectPath } = payload;
        
        if (!prompt) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "El prompt es requerido." }));
          return;
        }

        const key = api_key || process.env.GEMINI_API_KEY;
        if (!key) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "Falta la API Key de Gemini." }));
          return;
        }

        // Inyectar ruta del proyecto si existe
        let promptFinal = prompt;
        if (projectPath && projectPath.trim() !== "") {
          promptFinal = `[Proyecto Local del Usuario: "${projectPath}"]\n\n${prompt}`;
        }

        console.log(`\n🤖 Ejecutando Super Agente: "${prompt}"`);
        const ai = new GoogleGenAI({ apiKey: key });

        let chat = null;
        let result = null;
        let errorUltimo = null;

        // Modelos en orden de preferencia — cada uno tiene cuota separada de 20 req/día en tier gratuito
        const modelos = [
          "antigravity-preview-05-2026",
          "gemini-3.6-flash",
          "gemini-3.7-flash",
          "gemini-3.5-flash",
          "gemini-3.5-flash-lite",
          "gemini-3.1-flash-lite",
          "gemini-2.5-flash",
          "gemini-2.5-flash-lite",
          "gemini-flash-latest"
        ];

        const esperar = (ms) => new Promise(r => setTimeout(r, ms));

        for (const modelo of modelos) {
          try {
            console.log(`🤖 Conectando con modelo: ${modelo}...`);
            chat = ai.chats.create({
              model: modelo,
              config: {
                systemInstruction: instruccionesSuperAdmin,
                tools: [{
                  functionDeclarations: [
                    crearSubAgenteTool, 
                    asignarTareaAgenteTool,
                    actualizarEstadoTareaTool,
                    registrarConversacionAgenteTool,
                    leerEstructuraProyectoTool,
                    leerContenidoArchivoTool,
                    modificarArchivoProyectoTool,
                    ejecutarComandoPruebaTool,
                    buscarEnBaseConocimientoTool
                  ]
                }],
                temperature: 0.3
              }
            });
            
            result = await chat.sendMessage({ message: promptFinal });
            console.log(`✅ Conectado con el modelo: ${modelo}`);
            break;
          } catch (err) {
            const is429 = err.message && err.message.includes('429');
            const is503 = err.message && err.message.includes('503');
            console.warn(`⚠️ Modelo ${modelo} falló (${is429 ? 'CUOTA AGOTADA' : is503 ? 'ALTA DEMANDA' : 'ERROR'}): saltando al siguiente...`);
            errorUltimo = err;
            chat = null;
            result = null;
            // Solo esperar en caso de 503 transitorio, nunca en 429 (cuota diaria)
            if (is503) {
              console.log('⏳ Esperando 2s por alta demanda...');
              await esperar(2000);
            }
          }
        }

        if (!chat || !result) {
          throw new Error(`Cuota diaria agotada en todos los modelos disponibles. Último error: ${errorUltimo?.message || 'Sin disponibilidad'}`);
        }

        // Helper: reintenta sendMessage hasta 3 veces con backoff si hay un 503 transitorio
        const sendMessageConReintentos = async (payload) => {
          const delays = [3000, 6000, 12000];
          for (let i = 0; i <= delays.length; i++) {
            try {
              return await chat.sendMessage(payload);
            } catch (err) {
              const is503 = err.message && err.message.includes('503');
              if (is503 && i < delays.length) {
                console.log(`⏳ [503 transitorio] Reintentando en ${delays[i]/1000}s... (intento ${i+1}/${delays.length})`);
                await esperar(delays[i]);
              } else {
                throw err;
              }
            }
          }
        };

        const trazaHerramientas = [];
        let metadataCostoTotal = { promptTokens: 0, candidatesTokens: 0, totalTokens: 0, costo: 0 };

        // Acumular costos iniciales
        if (result.usageMetadata) {
          const metrics = calcularCosto(result.usageMetadata);
          metadataCostoTotal.promptTokens += metrics.promptTokens;
          metadataCostoTotal.candidatesTokens += metrics.candidatesTokens;
          metadataCostoTotal.totalTokens += metrics.totalTokens;
          metadataCostoTotal.costo += metrics.costo;
        }

        // Bucle de ejecución autónoma (limite de 15 llamadas o $0.05 de costo preventivo)
        let loops = 0;
        const LIMITE_PRESUPUESTO = 0.05; // $0.05 USD Cortafuegos
        
        while (result.functionCalls && result.functionCalls.length > 0 && loops < 15) {
          if (metadataCostoTotal.costo > LIMITE_PRESUPUESTO) {
            console.log(`\n🚨 [CIRCUIT BREAKER] Cortafuegos de presupuesto activado ($${metadataCostoTotal.costo.toFixed(5)} USD). Deteniendo ejecución autónoma.`);
            break;
          }

          loops++;
          const call = result.functionCalls[0];
          const handler = herramientasEjecutables[call.name];
          
          if (!handler) {
            throw new Error(`La herramienta '${call.name}' no está registrada.`);
          }

          const output = await handler(call.args);
          
          trazaHerramientas.push({
            herramienta: call.name,
            argumentos: call.args,
            resultado: output
          });

          result = await sendMessageConReintentos({
            message: [{
              functionResponse: {
                name: call.name,
                response: { result: output }
              }
            }]
          });

          if (result.usageMetadata) {
            const metrics = calcularCosto(result.usageMetadata);
            metadataCostoTotal.promptTokens += metrics.promptTokens;
            metadataCostoTotal.candidatesTokens += metrics.candidatesTokens;
            metadataCostoTotal.totalTokens += metrics.totalTokens;
            metadataCostoTotal.costo += metrics.costo;
          }
        }

        // Una vez completado el plan con Gemini, realizaremos ejecuciones locales con Ollama si hay tareas en backlog
        // que no hayan sido procesadas. Los sub-agentes especialistas ejecutan localmente!
        const dataTasks = fs.readFileSync(FILE_TASKS, 'utf8');
        const tareasBacklog = JSON.parse(dataTasks);
        
        const tareasPendientes = tareasBacklog.filter(t => t.estado === 'pendiente');
        if (tareasPendientes.length > 0) {
          console.log(`\n⚙️ [NVIDIA NIM] Procesando ${tareasPendientes.length} tareas con sub-agentes especializados...`);
          const dataAgents = fs.readFileSync(FILE_AGENTS, 'utf8');
          const agentes = JSON.parse(dataAgents);

          for (const tarea of tareasPendientes) {
            // Usar el contrato .md del agente como system prompt
            const agenteAsignado = agentes.find(a => a.nombre.toLowerCase() === tarea.agente.toLowerCase());
            const mdContrato = AGENTES_MD[tarea.agente] || AGENTES_MD[agenteAsignado?.nombre] || null;
            const systemPrompt = mdContrato
              ? `${mdContrato}\n\n---\nResponde siempre en español. Escribe código completo y funcional.`
              : (agenteAsignado ? agenteAsignado.instrucciones : "Eres un programador experto. Responde en español.");
            
            tarea.estado = "en-progreso";
            fs.writeFileSync(FILE_TASKS, JSON.stringify(tareasBacklog, null, 2), 'utf8');
            
            await herramientasEjecutables.registrarConversacionAgente({
              remitente: tarea.agente,
              destinatario: "SuperAdmin",
              mensaje: `Inicio el desarrollo de la tarea: "${tarea.descripcion}".`
            });

            const userPrompt = `Requerimiento:\n${tarea.descripcion}\n\nEscribe el código fuente completo en un formato estructurado. Si es código HTML/CSS/JS, devuélvelo directamente para previsualizarlo en el Sandbox.`;
            const codigoGenerado = await llamarNvidiaNim(systemPrompt, userPrompt);
            
            tarea.estado = "completada";
            tarea.sandboxCode = codigoGenerado;
            fs.writeFileSync(FILE_TASKS, JSON.stringify(tareasBacklog, null, 2), 'utf8');
            
            await herramientasEjecutables.registrarConversacionAgente({
              remitente: tarea.agente,
              destinatario: "SuperAdmin",
              mensaje: `Completé la tarea asignada. He subido el resultado al Sandbox.`
            });
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: "completado",
          respuestaAdmin: result.text,
          accionesRealizadas: trazaHerramientas,
          costoMetricas: {
            ...metadataCostoTotal,
            costo: parseFloat(metadataCostoTotal.costo.toFixed(5))
          }
        }));

      } catch (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Ruta no encontrada
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: "Ruta no encontrada." }));
});

const PORT = 5001;
server.listen(PORT, () => {
  console.log(`\n🚀 Backend Local Nexus listo en http://127.0.0.1:${PORT}`);
});
