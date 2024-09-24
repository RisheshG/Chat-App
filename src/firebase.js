import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAQm6Li5RGx0qa86N_zQBSmMuS0BEHf6bc",
    authDomain: "chat-app-f6795.firebaseapp.com",
    projectId: "chat-app-f6795",
    storageBucket: "chat-app-f6795.appspot.com",
    messagingSenderId: "273993949481",
    appId: "1:273993949481:web:b11f096d9712dc24add738",
    measurementId: "G-731T6YTB88"
  };

  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };
