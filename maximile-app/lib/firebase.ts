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

// Conditionally initialize analytics only on the client-side to avoid SSR errors.
const getAnalyticsIfSupported = () => {
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getAnalytics } = require('firebase/analytics');
    return getAnalytics(app);
  }
  return null;
};

const analytics = getAnalyticsIfSupported();

export { analytics };