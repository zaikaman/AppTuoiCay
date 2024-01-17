import { getApp, getApps, initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth"; 
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

let firebaseApp;

export const getFirebaseApp = () => {
  // If the Firebase app is already initialized, return it
  if (firebaseApp) {
    return firebaseApp;
  }

  // Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyCuJE_JJyazIKRj-CtvuJPcsz_Sb2t2ghg",
      authDomain: "money-tree-a4f83.firebaseapp.com",
      projectId: "money-tree-a4f83",
      storageBucket: "money-tree-a4f83.appspot.com",
      messagingSenderId: "246102898681",
      appId: "1:246102898681:web:b3b85add59fba70cc8af28",
      measurementId: "G-TES608LZ67"
    };

  // Initialize Firebase
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

  // Initialize Firebase Auth with React Native persistence
  initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });

  // Store the initialized app to avoid reinitialization
  firebaseApp = app;

  return app;
};

