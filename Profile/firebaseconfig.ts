import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCZARs_Mwm6kubtgheZPQg2hTLO0DDYces",
  authDomain: "profile-f5b40.firebaseapp.com",
  projectId: "profile-f5b40",
  storageBucket: "profile-f5b40.firebasestorage.app",
  messagingSenderId: "857374941276",
  appId: "1:857374941276:web:69101c0e2fc878c5568699",
  measurementId: "G-MP2YFDX2YV"

};


export const app = initializeApp(firebaseConfig);

const storage = getStorage(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
connectStorageEmulator(storage, 'localhost', 9199);

export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export { storage };