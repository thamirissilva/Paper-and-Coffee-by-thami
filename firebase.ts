
// Importações modulares do Firebase v9+ para garantir compatibilidade com Vite e Vercel.
// Sistema de Gestão de Papelaria Criativa - Fuso Horário: Brasília (GMT-3).
import { initializeApp } from "firebase/app";
// Importações do Firebase Auth consolidadas para evitar falhas de resolução em certos ambientes de build (Vite/Vercel).
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { User } from "./types";

/**
 * Configuração do Firebase para o Atelier Paper&Coffee.
 * Os valores são específicos para o ambiente de produção/desenvolvimento do atelier.
 */
const firebaseConfig = {
  apiKey: "AIzaSyD0WGpoZ3nka4D-BG5qcWmZdKe_rcHtPpw",
  authDomain: "paper-and-coffee.firebaseapp.com",
  projectId: "paper-and-coffee",
  storageBucket: "paper-and-coffee.firebasestorage.app",
  messagingSenderId: "983581521455",
  appId: "1:983581521455:web:ce476b709d7348998655e8"
};

// Inicialização centralizada do Firebase (v9+ Modular)
const app = initializeApp(firebaseConfig);

// Instâncias de serviços exportadas para uso em todo o sistema.
// Nota: O uso de 'auth' aqui fornece o ponto de entrada para a autenticação no atelier.
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * Nota sobre Gemini API (@google/genai):
 * Conforme as diretrizes, não inicializamos uma instância global do GenAI aqui.
 * A instância 'new GoogleGenAI({ apiKey: process.env.API_KEY })' deve ser criada 
 * diretamente no local da chamada (ex: dentro de uma função asíncrona no componente),
 * garantindo que a chave mais recente e as configurações de sessão sejam respeitadas.
 */

// Re-exportação nominal das funções para compatibilidade com os componentes do atelier.
// Todas as funções seguem o padrão modular para permitir tree-shaking e otimização de bundle.
export { 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signInWithPopup,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  ref,
  uploadBytes,
  getDownloadURL
};

export type { User };
