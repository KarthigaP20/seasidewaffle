// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDU2ZDs4oRjptM8d-XtHHCh7Vs8nSpXwE4",
  authDomain: "sea-side-waffle.firebaseapp.com",
  projectId: "sea-side-waffle",
  storageBucket: "sea-side-waffle.appspot.com",
  messagingSenderId: "1092486799783",
  appId: "1:1092486799783:web:88009d9fbbd431efdf5682",
  measurementId: "G-TMNK6D32J9",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
