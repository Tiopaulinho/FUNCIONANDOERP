// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For more information on how to access Firebase in your app, visit:
// https://firebase.google.com/docs/web/setup#access-firebase

export const firebaseConfig = {
  apiKey: "AIzaSyCHQp-0HF4O2NVv9aC2FGeKhOsS2lbgqnE",
  authDomain: "erpnovo-483a1.firebaseapp.com",
  projectId: "erpnovo-483a1",
  storageBucket: "erpnovo-483a1.firebasestorage.app",
  messagingSenderId: "280722278498",
  appId: "1:280722278498:web:36637e9d80eed537d2293b",
  measurementId: "G-16SGNW39FZ"
};


// Initialize Firebase
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(firebaseApp);

export { firebaseApp, auth };
