
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Garante que o Firebase seja inicializado apenas uma vez.
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const firestore = getFirestore(app);

// Exporta as instâncias prontas para serem usadas em qualquer lugar da aplicação.
export { app, auth, firestore };
