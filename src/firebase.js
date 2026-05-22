import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAxJecPHZ6ztZyW5milD-DFUIr6KVh13mY",
  authDomain: "church-analytics-50e7e.firebaseapp.com",
  projectId: "church-analytics-50e7e",
  storageBucket: "church-analytics-50e7e.firebasestorage.app",
  messagingSenderId: "660760351137",
  appId: "1:660760351137:web:6a29720e74e8e214ab7be0",
  measurementId: "G-XYG1WVN761"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
