import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, update, onValue, push, remove } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAOj6-xK0uUSi1Bl_KWL_hPU9K2VW86RU4",
  authDomain: "kitchensync-4e4bd.firebaseapp.com",
  databaseURL: "https://kitchensync-4e4bd-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "kitchensync-4e4bd",
  storageBucket: "kitchensync-4e4bd.firebasestorage.app",
  messagingSenderId: "378925158715",
  appId: "1:378925158715:web:b9cd04460002bf8577a71e"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export const dbRef = (path) => ref(db, path);

// Leer una vez
export async function dbGet(path) {
  const snap = await get(ref(db, path));
  return snap.exists() ? snap.val() : null;
}

// Escribir (sobreescribe)
export async function dbSet(path, value) {
  await set(ref(db, path), value);
}

// Actualizar parcialmente
export async function dbUpdate(path, value) {
  await update(ref(db, path), value);
}

// Escuchar cambios en tiempo real — devuelve función unsubscribe
export function dbListen(path, callback) {
  const r = ref(db, path);
  const unsub = onValue(r, (snap) => {
    callback(snap.exists() ? snap.val() : null);
  });
  return unsub;
}

// Borrar
export async function dbRemove(path) {
  await remove(ref(db, path));
}

// Push (genera ID automático)
export async function dbPush(path, value) {
  const r = ref(db, path);
  const newRef = push(r);
  await set(newRef, value);
  return newRef.key;
}
