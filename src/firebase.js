import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, enableNetwork, disableNetwork, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
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

// Initialize Cloud Firestore with cache settings - YENİ YÖNTEM
let db;
try {
  db = initializeFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    ignoreUndefinedProperties: true
  });
  console.log("✅ Firestore initialized with unlimited cache");
} catch (error) {
  console.warn("⚠️ Firestore already initialized, using existing instance");
  db = getFirestore(app);
}

export { db };

// Initialize Analytics
export const analytics = getAnalytics(app);

// Network durumunu kontrol et - Geliştirilmiş versiyon
export const getNetworkStatus = () => {
  const isOnline = navigator.onLine;
  console.log("🌐 Network status check:", isOnline ? "ONLINE" : "OFFLINE");
  return isOnline;
};

// Network değişikliklerini dinle - Geliştirilmiş versiyon
export const setupNetworkListener = (onOnline, onOffline) => {
  console.log(" Setting up network listeners...");
  
  const handleOnline = () => {
    console.log("🟢 Network came online");
    if (onOnline) onOnline();
  };
  
  const handleOffline = () => {
    console.log("🔴 Network went offline");
    if (onOffline) onOffline();
  };
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Cleanup function
  return () => {
    console.log("🧹 Cleaning up network listeners");
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// Manuel olarak network'ü enable/disable et - Geliştirilmiş versiyon
export const toggleNetwork = async (enable) => {
  try {
    if (enable) {
      await enableNetwork(db);
      console.log("✅ Network enabled manually");
    } else {
      await disableNetwork(db);
      console.log("🔌 Network disabled manually");
    }
  } catch (error) {
    console.error("❌ Network toggle error:", error);
    throw error;
  }
};

// Çevrimdışı veri yönetimi için yardımcı fonksiyonlar
export const saveOfflineData = (data, userId) => {
  try {
    const offlineData = JSON.parse(localStorage.getItem('offlineData') || '[]');
    offlineData.push({
      timestamp: new Date().toISOString(),
      userId: userId,
      data: data
    });
    localStorage.setItem('offlineData', JSON.stringify(offlineData));
    console.log(" Data saved offline for user:", userId);
    return true;
  } catch (error) {
    console.error("❌ Error saving offline data:", error);
    return false;
  }
};

export const getOfflineData = (userId) => {
  try {
    const offlineData = JSON.parse(localStorage.getItem('offlineData') || '[]');
    return offlineData.filter(item => item.userId === userId);
  } catch (error) {
    console.error("❌ Error getting offline data:", error);
    return [];
  }
};

export const clearOfflineData = (userId) => {
  try {
    if (userId) {
      const offlineData = JSON.parse(localStorage.getItem('offlineData') || '[]');
      const filteredData = offlineData.filter(item => item.userId !== userId);
      localStorage.setItem('offlineData', JSON.stringify(filteredData));
      console.log("🧹 Cleared offline data for user:", userId);
    } else {
      localStorage.removeItem('offlineData');
      console.log("🧹 Cleared all offline data");
    }
    return true;
  } catch (error) {
    console.error("❌ Error clearing offline data:", error);
    return false;
  }
};

// Offline persistence'ı etkinleştir - YENİ YÖNTEM (Deprecated method yerine)
export const enableOfflineSupport = async () => {
  try {
    console.log(" Offline support is enabled via Firestore cache settings");
    // Yeni yöntemde persistence otomatik olarak etkin
    return true;
  } catch (err) {
    console.error("❌ Failed to enable offline support:", err);
    return false;
  }
};

export default app; 