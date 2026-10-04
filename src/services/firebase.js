import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAFI77w9MxAnqqoYT36144bm-2gO5-Pc1w",
  authDomain: "smart-pg-finder-ef852.firebaseapp.com",
  projectId: "smart-pg-finder-ef852",
  storageBucket: "smart-pg-finder-ef852.firebasestorage.app",
  messagingSenderId: "1057396149357",
  appId: "1:1057396149357:web:b4c553fe8370714a280364",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export const storage = getStorage(app);