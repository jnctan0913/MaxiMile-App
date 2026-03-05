import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAuyUHg-GO6v2ZJGHL_20mZ8wGnGcCq7Tk",
  authDomain: "maximile-app.firebaseapp.com",
  projectId: "maximile-app",
  storageBucket: "maximile-app.firebasestorage.app",
  messagingSenderId: "195425949677",
  appId: "1:195425949677:web:877d88bb8252d9a81d39e4",
  measurementId: "G-F22907ED68"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };