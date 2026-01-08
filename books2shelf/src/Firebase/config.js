// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Replace with your Firebase project configuration
// Get this from Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
  apiKey: "AIzaSyCu7ybGax9QvbHENewEw54aanKDijD5zYo",
  authDomain: "books2shelf.firebaseapp.com",
  projectId: "books2shelf",
  storageBucket: "books2shelf.firebasestorage.app",
  messagingSenderId: "550048212654",
  appId: "1:550048212654:web:21e0d1f7f90dbf85776f3f"
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
