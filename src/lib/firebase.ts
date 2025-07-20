// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app;
if (!firebaseConfig.apiKey) {
    console.error("Firebase API Key is missing. Please add NEXT_PUBLIC_FIREBASE_API_KEY to your .env file.");
    app = null;
} else {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
}

const auth = app ? getAuth(app) : null;
const googleProvider = app ? new GoogleAuthProvider() : null;
const analytics = app && typeof window !== "undefined" ? getAnalytics(app) : null;

// Ensure auth is not null before exporting
if (!auth) {
    console.error("Firebase Auth could not be initialized. Please check your Firebase config.");
}

export { app, auth, googleProvider, analytics };
