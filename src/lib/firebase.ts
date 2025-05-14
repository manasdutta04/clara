import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

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

// Initialize Firebase
let app;
let auth;
let googleProvider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  
  // Add scopes for Google provider (optional)
  googleProvider.addScope('profile');
  googleProvider.addScope('email');
  
  // Set custom parameters (optional)
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
  
} catch (error) {
  console.error("Firebase initialization error:", error);
  throw new Error("Failed to initialize Firebase. Please check your configuration.");
}

export { auth, googleProvider }; 