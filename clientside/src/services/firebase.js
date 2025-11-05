// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDEbORvAOtyMg4HPl_cmkFNFIvdrbddsTw",
  authDomain: "meddirect-7ff5f.firebaseapp.com",
  projectId: "meddirect-7ff5f",
  storageBucket: "meddirect-7ff5f.firebasestorage.app",
  messagingSenderId: "165016570795",
  appId: "1:165016570795:web:10357accbbe0796d9020ee",
  measurementId: "G-RGK4NSWTEE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Firebase Auth functions
export const signInWithGooglePopup = () => signInWithPopup(auth, googleProvider);
export const signOutUser = () => signOut(auth);

export { app, analytics, auth, googleProvider };