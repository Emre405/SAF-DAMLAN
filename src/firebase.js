import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBlZDnB4UOXSBBCxrxnyQ4v8FkisWR0O4s",
  authDomain: "safdamlan.firebaseapp.com",
  projectId: "safdamlan",
  storageBucket: "safdamlan.firebasestorage.app",
  messagingSenderId: "655520823019",
  appId: "1:655520823019:web:931f0ee5803d01847bb0ae",
  measurementId: "G-RML9Y7MGF3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics
export const analytics = getAnalytics(app);

// Offline persistence'ı etkinleştir
export const enableOfflineSupport = async () => {
  try {
    await enableIndexedDbPersistence(db);
    console.log("✅ Offline persistence enabled!");
    return true;
  } catch (err) {
    if (err.code === 'failed-precondition') {
      console.warn("⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time.");
    } else if (err.code === 'unimplemented') {
      console.warn("⚠️ The current browser doesn't support offline persistence.");
    }
    return false;
  }
};

// Network durumunu kontrol et
export const getNetworkStatus = () => {
  return navigator.onLine;
};

// Network değişikliklerini dinle
export const setupNetworkListener = (onOnline, onOffline) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  // Cleanup function
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};

// Manuel olarak network'ü enable/disable et
export const toggleNetwork = async (enable) => {
  try {
    if (enable) {
      await enableNetwork(db);
      console.log("✅ Network enabled");
    } else {
      await disableNetwork(db);
      console.log("🔌 Network disabled");
    }
  } catch (error) {
    console.error("Network toggle error:", error);
  }
};

export default app; 