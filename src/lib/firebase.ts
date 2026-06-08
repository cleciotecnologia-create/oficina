import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Safe initialization to prevent Vercel/GitHub pages blank screens if configs are missing
let app;
try {
  if (getApps().length === 0) {
    const finalConfig = {
      apiKey: firebaseConfig.apiKey || "AIzaSyDummyKeyForVercelInitializationFallback",
      authDomain: firebaseConfig.authDomain || "dummy-project.firebaseapp.com",
      projectId: firebaseConfig.projectId || "dummy-project",
      storageBucket: firebaseConfig.storageBucket || "dummy-project.firebasestorage.app",
      messagingSenderId: firebaseConfig.messagingSenderId || "1234567890",
      appId: firebaseConfig.appId || "1:1234567890:web:1234567890abcdef"
    };
    app = initializeApp(finalConfig);
  } else {
    app = getApp();
  }
} catch (error) {
  console.error("Firebase app initialization failed, falling back to basic setup:", error);
  app = initializeApp({
    apiKey: "AIzaSyDummyKeyForVercelInitializationFallback",
    authDomain: "dummy-project.firebaseapp.com",
    projectId: "dummy-project",
  });
}

// CRITICAL: Set custom database ID from config to avoid default collection mapping breakages
export const db = (() => {
  try {
    return getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
  } catch (error) {
    console.error("Failed to initialize Firestore, using default db:", error);
    return getFirestore(app);
  }
})();

export const auth = getAuth(app);

// Test Connection on Startup
async function testConnection() {
  try {
    if (!db) return;
    const testDocRef = doc(db, 'test', 'connection');
    await getDocFromServer(testDocRef);
    console.log("Firebase connection verified and active!");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration: Client appears to be offline.");
    } else {
      console.warn("Firebase startup check skipped (offline mode or sandbox sandbox fallback ativo):", error);
    }
  }
}
testConnection();

// Structured Error Handlers as requested by firebase-integration skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): any {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error Payload: ', JSON.stringify(errInfo));
  
  if (operationType === OperationType.LIST) {
    console.warn(`Firestore collection subscription failed for path: ${path}. App will run on local state fallback seamlessly.`);
    return;
  }
  
  throw new Error(JSON.stringify(errInfo));
}
