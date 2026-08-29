import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Cargar variables de entorno del archivo .env
dotenv.config();

// Verificar la API Key
if (!process.env.GEMINI_API_KEY) {
  console.log("⚠️  ADVERTENCIA: GEMINI_API_KEY no está configurada en las variables de entorno o archivo .env.");
  console.log("Por favor, crea un archivo '.env' con 'GEMINI_API_KEY=tu_api_key' antes de ejecutar.");
}

// 1. Base de datos simulada del catálogo
const CATALOGO = {
  laptop: 899.99,
  teclado: 45.50,
  monitor: 199.99,
  mouse: 25.00,
  audifonos: 79.99
};

// 2. Definición del código ejecutable local para las herramientas
const herramientasEjecutables = {
  obtenerPrecioProducto: ({ nombreProducto }) => {
    const prod = nombreProducto.trim().toLowerCase();
    if (prod in CATALOGO) {
      return { producto: prod, precio_usd: CATALOGO[prod], status: "encontrado" };
    }
    return { producto: prod, status: "no_encontrado", error: "Producto no disponible en catálogo" };
  },

  calcularDescuento: ({ precio, porcentaje }) => {
    const montoDescuento = precio * (porcentaje / 100.0);
    const precioFinal = precio - montoDescuento;
    return {
      precio_original: precio,
      descuento_porcentaje: porcentaje,
      monto_descuento: Number(montoDescuento.toFixed(2)),
      precio_final: Number(precioFinal.toFixed(2))
    };
  },

  guardarRecibo: ({ nombreCliente, detalleCompra }) => {
    const nombreArchivo = `recibo_${nombreCliente.replace(/\s+/g, '_').toLowerCase()}.txt`;
    try {
      const contenido = `=========================================\n` +
                        `            RECIBO DE COMPRA             \n` +
                        `=========================================\n` +
                        `Cliente: ${nombreCliente}\n` +
                        `Detalle:\n${detalleCompra}\n` +
                        `=========================================\n` +
                        `¡Gracias por su compra!\n`;
      fs.writeFileSync(nombreArchivo, contenido, 'utf8');
      return { status: "exito", archivo_creado: nombreArchivo };
    } catch (error) {
      return { status: "error", error: error.message };
    }
  }
};

// 3. Declaraciones de la estructura de las herramientas para Gemini (JSON Schema)
const obtenerPrecioProductoTool = {
  name: "obtenerPrecioProducto",
  description: "Busca el precio unitario en USD de un producto específico en el catálogo de la tienda.",
  parameters: {
    type: "object",
    properties: {
      nombreProducto: {
        type: "string",
        description: "El nombre del producto a buscar (ej. 'laptop', 'teclado', 'monitor', 'mouse', 'audifonos')."
      }
    },
    required: ["nombreProducto"]
  }
};

const calcularDescuentoTool = {
  name: "calcularDescuento",
  description: "Calcula el monto de descuento a restar y el precio final de un producto.",
  parameters: {
    type: "object",
    properties: {
      precio: {
        type: "number",
        description: "El precio original del producto en USD."
      },
      porcentaje: {
        type: "number",
        description: "El porcentaje de descuento a aplicar (ej. 15 para 15% de descuento)."
      }
    },
    required: ["precio", "porcentaje"]
  }
};

const guardarReciboTool = {
  name: "guardarRecibo",
  description: "Genera y guarda de forma persistente un recibo de compra en un archivo de texto local (.txt).",
  parameters: {
    type: "object",
    properties: {
      nombreCliente: {
        type: "string",
        description: "El nombre del cliente que realiza la compra."
      },
      detalleCompra: {
        type: "string",
        description: "Un texto detallado que enumera el producto, precio original, el descuento aplicado y el precio final."
      }
    },
    required: ["nombreCliente", "detalleCompra"]
  }
};

// Configuración general del agente
const instruccionesSistema = (
  "Eres un agente de ventas y facturación autónomo. Tu objetivo es asistir al cliente " +
  "siguiendo secuencialmente los siguientes pasos:\n" +
  "1. Buscar el precio del producto solicitado en el catálogo.\n" +
  "2. Calcular el descuento solicitado utilizando la herramienta correspondiente.\n" +
  "3. Generar y guardar el recibo con los detalles de la compra en un archivo de texto.\n" +
  "Debes utilizar obligatoriamente las herramientas provistas para resolver el problema paso a paso. " +
  "No intentes adivinar precios ni calcular descuentos por tu cuenta. " +
  "Explica con claridad cada paso que ejecutas en español."
);

async function ejecutarAgente() {
  console.log("\n🤖 Inicializando Cliente de Google Gen AI...");
  
  // Inicializamos el cliente oficial de Google
  // Automáticamente lee la variable de entorno GEMINI_API_KEY
  const ai = new GoogleGenAI();

  const promptUsuario = (
    "Hola, soy Juan Pérez. Quiero comprar una laptop. " +
    "Por favor aplícame el descuento del 15% por primera compra " +
    "y guarda mi recibo en un archivo."
  );

  console.log(`\n🚀 Iniciando Agente Autónomo...`);
  console.log(`Objetivo: "${promptUsuario}"\n`);

  try {
    // Creamos la sesión de chat con las herramientas declaradas y la instrucción del sistema
    const chat = ai.chats.create({
      model: "gemini-3.6-flash",
      config: {
        systemInstruction: instruccionesSistema,
        tools: [{
          functionDeclarations: [
            obtenerPrecioProductoTool,
            calcularDescuentoTool,
            guardarReciboTool
          ]
        }]
      }
    });

    // Enviamos el mensaje inicial del usuario
    let result = await chat.sendMessage({ message: promptUsuario });

    // Bucle interactivo: Mientras Gemini decida que necesita llamar a alguna herramienta, la ejecutamos
    while (result.functionCalls && result.functionCalls.length > 0) {
      const call = result.functionCalls[0];
      console.log(`\n⚙️  [Llamada de Herramienta] Gemini solicitó ejecutar: ${call.name}`);
      console.log(`   Argumentos: ${JSON.stringify(call.args)}`);

      // Obtenemos la función ejecutable local correspondiente
      const handler = herramientasEjecutables[call.name];
      if (!handler) {
        throw new Error(`No se encontró un manejador ejecutable para la herramienta: ${call.name}`);
      }

      // Ejecutamos la función local
      const output = await handler(call.args);
      console.log(`   Resultado de ejecución: ${JSON.stringify(output)}`);

      // Enviamos de vuelta el resultado a Gemini para que continúe pensando
      result = await chat.sendMessage({
        message: [{
          functionResponse: {
            name: call.name,
            response: { result: output }
          }
        }]
      });
    }

    // Al salir del bucle, mostramos la respuesta final generada por el agente
    console.log("\n=============================================");
    console.log("            RESPUESTA FINAL DEL AGENTE       ");
    console.log("=============================================");
    console.log(result.text);
    console.log("=============================================\n");

  } catch (error) {
    console.error("\n❌ Ocurrió un error en la ejecución del agente:", error.message);
  }
}

ejecutarAgente();
