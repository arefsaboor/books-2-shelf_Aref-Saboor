// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration using environment variables
// These are safe to expose (client-side) - security is managed by Firebase rules
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCu7ybGax9QvbHENewEw54aanKDijD5zYo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "books2shelf.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "books2shelf",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "books2shelf.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "550048212654",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:550048212654:web:21e0d1f7f90dbf85776f3f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

export default app;
