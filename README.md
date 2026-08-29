# 🤖 Sistema Autónomo Multi-Agente con IA

Plataforma integral de orquestación y colaboración multi-agente impulsada por inteligencia artificial (Google Gemini, NVIDIA NIM y Ollama Local). Diseñada para delegar, planificar, ejecutar y auditar tareas de desarrollo de software, testing, seguridad y despliegue de manera totalmente autónoma o supervisada.

---

## 🌟 Características Principales

- **🧠 Orquestador Central (Super Agente Administrador):** Descompone requerimientos en subtareas y coordina agentes especializados.
- **👥 Roles Especializados de Agentes:**
  - **Super Admin / Project Manager:** Coordinación, planificación de backlog y delegación.
  - **Frontend Developer:** Creación e iteración de interfaces en React/Vite, UI/UX y estilos.
  - **Backend Developer:** Arquitectura de APIs, endpoints, bases de datos y lógica de negocio.
  - **Auditor de Ciberseguridad:** Análisis estático de vulnerabilidades (XSS, inyecciones, secrets, headers).
  - **QA Tester:** Creación y ejecución de pruebas de calidad y reporte de bugs.
  - **DevOps Deployer:** Pipelines CI/CD, configuración de infraestructura y despliegue.
- **⚡ Múltiples Motores de IA:**
  - **Google Gemini** vía `@google/genai` SDK oficial.
  - **NVIDIA NIM / Nemotron** para inferencias de alto rendimiento.
  - **Ollama (Local GPU)** para procesamiento offline y privacidad de datos.
- **🛠️ Herramientas Nativas (Function Calling):**
  - Manipulación y lectura de archivos de código.
  - Ejecución de comandos de prueba en sandbox.
  - Automatización web y scraping con **Playwright**.
  - Parseo y extracción de documentos con **PDF-Parse**.
- **💻 Panel de Control en Tiempo Real:** Dashboard interactivo en React con monitorización de agentes, logs en streaming, base de conocimiento y gestión de tareas.

---

## 🏗️ Estructura del Proyecto

```plaintext
├── agents/                     # Definición de roles y prompts del sistema para agentes
│   ├── super-admin.md
│   ├── frontend-dev.md
│   ├── backend-dev.md
│   ├── qa-tester.md
│   ├── security-specialist.md
│   └── devops-deployer.md
├── frontend/                   # Aplicación de interfaz web (React + Vite)
├── functions/                  # Cloud Functions / Backend serverless (Firebase)
├── agente.js                   # Ejecución autónoma con SDK @google/genai y herramientas
├── devServer.js                # Servidor backend de desarrollo local y orquestador
├── firebase.json               # Configuración de Firebase Hosting y Emuladores
├── .env.example                # Plantilla de variables de entorno
└── package.json                # Dependencias y scripts del proyecto
```

---

## 🚀 Requisitos Previos

- [Node.js](https://nodejs.org/) v18 o superior
- [npm](https://www.npmjs.com/)
- Clave de API de [Google Gemini](https://aistudio.google.com/) o [NVIDIA Build](https://build.nvidia.com/)
- *(Opcional)* [Ollama](https://ollama.com/) para ejecución de modelos locales en GPU

---

## ⚙️ Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd Agentes
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   npm run frontend -- install # o cd frontend && npm install
   ```

3. **Configurar variables de entorno:**
   Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
   Edita `.env` y coloca tus credenciales:
   ```env
   GEMINI_API_KEY=tu_api_key_de_gemini
   NVIDIA_API_KEY=tu_api_key_de_nvidia
   NVIDIA_MODEL=nvidia/nemotron-3-super-120b-a12b
   ```

---

## 🖥️ Ejecución del Proyecto

- **Iniciar Backend y Servidor de Orquestación:**
  ```bash
  npm run backend
  ```

- **Iniciar Frontend (Panel de Control React):**
  ```bash
  npm run frontend
  ```

- **Ejecutar Agente Autónomo CLI directo:**
  ```bash
  npm start
  ```

---

## 🔒 Seguridad

- El archivo `.env` está protegido en `.gitignore` para prevenir la filtración involuntaria de claves de API.
- Nunca subas credenciales reales a repositorios públicos.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
