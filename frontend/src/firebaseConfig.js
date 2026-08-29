import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Configuración completa obtenida de tu aplicación web registrada en Firebase
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "agentes-b04f8",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:971866569417:web:38a7570be6bf25ef88eb18",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "agentes-b04f8.firebasestorage.app",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA97u8d2t_Qp8-CyViW93pGtDPDNPQeABw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "agentes-b04f8.firebaseapp.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "971866569417",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-4QCJ8NRT15"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
