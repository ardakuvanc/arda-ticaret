import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDgE78b8nLx_ptuWACECv3FgQcitARTa_M",
    authDomain: "arda-ticaret.firebaseapp.com",
    projectId: "arda-ticaret",
    storageBucket: "arda-ticaret.firebasestorage.app",
    messagingSenderId: "743617587449",
    appId: "1:743617587449:web:1d2e095751fb0a4cc75a28",
    measurementId: "G-ZL68T8KDME"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
