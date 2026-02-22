import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAbSNLeVZi42v6r-lBkFhGlxOeqUsFtpyY",
  authDomain: "portfolio-9005c.firebaseapp.com",
  projectId: "portfolio-9005c",
  storageBucket: "portfolio-9005c.firebasestorage.app",
  messagingSenderId: "245942499916",
  appId: "1:245942499916:web:498bc75ea3961e98fe92e9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);
