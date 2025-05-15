import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Your Firebase configuration
// Replace these with your actual Firebase project configuration from Firebase console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

console.log("Firebase config project ID:", firebaseConfig.projectId);
console.log("Firebase config storage bucket:", firebaseConfig.storageBucket);

// Initialize Firebase
let app;
let auth;
let googleProvider;
let firestore;
let storage;

try {
  // Check if Firebase config is valid
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.storageBucket) {
    console.error("Firebase configuration is incomplete. Please check your environment variables.");
    console.error("Current config:", {
      apiKey: firebaseConfig.apiKey ? "Set" : "Missing",
      projectId: firebaseConfig.projectId || "Missing",
      storageBucket: firebaseConfig.storageBucket || "Missing"
    });
  }

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  auth.useDeviceLanguage(); // Use the device's preferred language
  
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('profile');
  googleProvider.addScope('email');
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
  
  // Initialize Firestore
  firestore = getFirestore(app);
  console.log("Firestore initialized with config:", app.options);
  
  // Initialize Storage with cross-origin settings
  storage = getStorage(app);
  console.log("Firebase Storage initialized with bucket:", app.options.storageBucket);
  
  // Check if we're in development mode (localhost)
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
  
  // Use emulator if we're in development and it's available (not required)
  if (isLocalhost && process.env.NODE_ENV === 'development') {
    try {
      // Try to connect to the storage emulator if it's running
      // Commenting out emulator connection since it's causing connection errors
      // connectStorageEmulator(storage, 'localhost', 9199);
      // console.log('Connected to Firebase Storage emulator');
      
      // Connect to Firestore emulator if needed
      // connectFirestoreEmulator(firestore, 'localhost', 8080);
      // console.log('Connected to Firebase Firestore emulator');
    } catch (emulatorError) {
      console.info('No Firebase emulators detected, using production:', emulatorError);
    }
  }
  
} catch (error) {
  console.error("Firebase initialization error:", error);
  console.error("Detailed error info:", JSON.stringify(error, null, 2));
  throw new Error("Failed to initialize Firebase. Please check your configuration.");
}

export { app, auth, googleProvider, firestore, storage }; 