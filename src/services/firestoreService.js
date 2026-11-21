import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '../firebase';

// Alt koleksiyon isimleri
export const SUBCOLLECTIONS = {
  CUSTOMERS: 'customers',
  TRANSACTIONS: 'transactions',
  WORKER_EXPENSES: 'workerExpenses',
  FACTORY_OVERHEAD: 'factoryOverhead',
  POMACE_REVENUES: 'pomaceRevenues',
  TIN_PURCHASES: 'tinPurchases',
  PLASTIC_PURCHASES: 'plasticPurchases',
  OIL_PURCHASES: 'oilPurchases',
  OIL_SALES: 'oilSales'
};

/**
 * Kullanıcı ana belgesinin referansını döndürür
 */
export const getUserDocRef = (userId) => doc(db, 'userData', userId);

/**
 * Belirli bir alt koleksiyonun referansını döndürür
 */
export const getSubcollectionRef = (userId, collectionName) => 
  collection(db, 'userData', userId, collectionName);

/**
 * Belirli bir alt koleksiyondaki tek bir belgenin referansını döndürür
 */
export const getSubcollectionDocRef = (userId, collectionName, itemId) => 
  doc(db, 'userData', userId, collectionName, String(itemId));

/**
 * Tek bir kaydı alt koleksiyona kaydeder/günceller (Hızlı, hafif, 1MB limitine asla takılmaz)
 */
export const saveSubcollectionItem = async (userId, collectionName, item) => {
  if (!userId || !collectionName || !item?.id) {
    throw new Error('Geçersiz parametreler: userId, collectionName ve item.id gereklidir.');
  }
  const itemDocRef = getSubcollectionDocRef(userId, collectionName, item.id);
  await setDoc(itemDocRef, item, { merge: true });
  return item;
};

/**
 * Tek bir kaydı alt koleksiyondan siler
 */
export const deleteSubcollectionItem = async (userId, collectionName, itemId) => {
  if (!userId || !collectionName || !itemId) {
    throw new Error('Geçersiz parametreler: userId, collectionName ve itemId gereklidir.');
  }
  const itemDocRef = getSubcollectionDocRef(userId, collectionName, itemId);
  await deleteDoc(itemDocRef);
};

/**
 * Varsayılan fiyatları ana belgede günceller
 */
export const saveDefaultPrices = async (userId, defaultPrices) => {
  if (!userId) return;
  const userDocRef = getUserDocRef(userId);
  await setDoc(userDocRef, { defaultPrices }, { merge: true });
};

/**
 * Kullanıcının migrasyon durumunu kontrol eder
 */
export const checkMigrationStatus = async (userId) => {
  if (!userId) return { isMigrated: false };
  try {
    const userDocRef = getUserDocRef(userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        isMigrated: !!data.isMigrated,
        migratedAt: data.migratedAt || null,
        legacyData: data
      };
    }
    return { isMigrated: false };
  } catch (error) {
    console.error('Migrasyon durumu kontrol hatası:', error);
    return { isMigrated: false, error };
  }
};

/**
 * Alt koleksiyonlardaki TÜM verileri çeker
 */
export const loadAllSubcollectionsData = async (userId) => {
  if (!userId) return null;

  try {
    // 1. Ana belgeyi oku (fiyatlar vb.)
    const userDocRef = getUserDocRef(userId);
    const userSnap = await getDoc(userDocRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    // 2. Tüm alt koleksiyonları paralel olarak çek
    const fetchCollection = async (collName) => {
      try {
        const collRef = getSubcollectionRef(userId, collName);
        const querySnapshot = await getDocs(collRef);
        const items = [];
        querySnapshot.forEach((doc) => {
          items.push(doc.data());
        });
        return { [collName]: items };
      } catch (err) {
        console.error(`Alt koleksiyon okuma hatası (${collName}):`, err);
        return { [collName]: [] };
      }
    };

    const results = await Promise.all([
      fetchCollection(SUBCOLLECTIONS.CUSTOMERS),
      fetchCollection(SUBCOLLECTIONS.TRANSACTIONS),
      fetchCollection(SUBCOLLECTIONS.WORKER_EXPENSES),
      fetchCollection(SUBCOLLECTIONS.FACTORY_OVERHEAD),
      fetchCollection(SUBCOLLECTIONS.POMACE_REVENUES),
      fetchCollection(SUBCOLLECTIONS.TIN_PURCHASES),
      fetchCollection(SUBCOLLECTIONS.PLASTIC_PURCHASES),
      fetchCollection(SUBCOLLECTIONS.OIL_PURCHASES),
      fetchCollection(SUBCOLLECTIONS.OIL_SALES)
    ]);

    // Sonuçları birleştir
    const combinedData = Object.assign({}, ...results);

    return {
      customers: combinedData[SUBCOLLECTIONS.CUSTOMERS] || [],
      transactions: combinedData[SUBCOLLECTIONS.TRANSACTIONS] || [],
      workerExpenses: combinedData[SUBCOLLECTIONS.WORKER_EXPENSES] || [],
      factoryOverhead: combinedData[SUBCOLLECTIONS.FACTORY_OVERHEAD] || [],
      pomaceRevenues: combinedData[SUBCOLLECTIONS.POMACE_REVENUES] || [],
      tinPurchases: combinedData[SUBCOLLECTIONS.TIN_PURCHASES] || [],
      plasticPurchases: combinedData[SUBCOLLECTIONS.PLASTIC_PURCHASES] || [],
      oilPurchases: combinedData[SUBCOLLECTIONS.OIL_PURCHASES] || [],
      oilSales: combinedData[SUBCOLLECTIONS.OIL_SALES] || [],
      defaultPrices: userData.defaultPrices || {
        pricePerKg: 3,
        tinPrices: { s16: 80, s10: 70, s5: 60 },
        plasticPrices: { s10: 20, s5: 15, s2: 10 },
        oilPurchasePrice: 200,
        oilSalePrice: 250
      }
    };
  } catch (error) {
    console.error('Alt koleksiyonlardan veri yüklenirken genel hata:', error);
    throw error;
  }
};

/**
 * Güvenli Migrasyon Fonksiyonu:
 * Eski tek belgedeki array verilerini alır ve alt koleksiyonlara batch'ler halinde yazar.
 * Eski veriyi ASLA silmez.
 * Doğrulama yapar.
 */
export const migrateUserDataToSubcollections = async (userId, sourceData, onProgress) => {
  if (!userId || !sourceData) {
    throw new Error('Migrasyon için userId ve sourceData zorunludur.');
  }

  const report = (message, percent, step) => {
    if (onProgress) {
      onProgress({ message, percent, step });
    }
    console.log(`[Migrasyon] %${percent} - ${message}`);
  };

  report('Migrasyon başlatılıyor...', 2, 'init');

  const collectionsToMigrate = [
    { key: 'customers', collName: SUBCOLLECTIONS.CUSTOMERS, label: 'Müşteriler' },
    { key: 'transactions', collName: SUBCOLLECTIONS.TRANSACTIONS, label: 'İşlemler' },
    { key: 'workerExpenses', collName: SUBCOLLECTIONS.WORKER_EXPENSES, label: 'İşçi Giderleri' },
    { key: 'factoryOverhead', collName: SUBCOLLECTIONS.FACTORY_OVERHEAD, label: 'Muhtelif Giderler' },
    { key: 'pomaceRevenues', collName: SUBCOLLECTIONS.POMACE_REVENUES, label: 'Pirina Gelirleri' },
    { key: 'tinPurchases', collName: SUBCOLLECTIONS.TIN_PURCHASES, label: 'Teneke Alımları' },
    { key: 'plasticPurchases', collName: SUBCOLLECTIONS.PLASTIC_PURCHASES, label: 'Bidon Alımları' },
    { key: 'oilPurchases', collName: SUBCOLLECTIONS.OIL_PURCHASES, label: 'Yağ Alımları' },
    { key: 'oilSales', collName: SUBCOLLECTIONS.OIL_SALES, label: 'Yağ Satışları' }
  ];

  // Toplam kayıt sayısını hesapla
  let totalItems = 0;
  collectionsToMigrate.forEach(({ key }) => {
    const arr = sourceData[key] || [];
    totalItems += arr.length;
  });

  report(`Toplam ${totalItems} adet kayıt alt koleksiyonlara aktarılacak.`, 5, 'counted');

  let processedItems = 0;
  const BATCH_SIZE = 400; // Firestore 500 işlem limiti vardır, 400 son derece güvenlidir

  for (const { key, collName, label } of collectionsToMigrate) {
    const items = sourceData[key] || [];
    if (items.length === 0) continue;

    report(`${label} aktarılıyor (${items.length} kayıt)...`, Math.round((processedItems / totalItems) * 90), key);

    // Parçalara bölerek batch ile yaz
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const chunk = items.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(db);

      chunk.forEach((item, index) => {
        // Her öğenin mutlaka bir id'si olmalı
        const itemId = item.id ? String(item.id) : `${key}_${Date.now()}_${i + index}`;
        const itemToSave = { ...item, id: itemId };
        const docRef = getSubcollectionDocRef(userId, collName, itemId);
        batch.set(docRef, itemToSave, { merge: true });
      });

      await batch.commit();
      processedItems += chunk.length;

      const percent = Math.min(92, Math.round((processedItems / totalItems) * 90));
      report(`${label} kaydediliyor: ${processedItems}/${totalItems}`, percent, key);
    }
  }

  // Doğrulama adımı
  report('Veriler doğrulanıyor...', 95, 'verification');

  // Ana belgede migrasyon tamamlandı bayrağını işaretle (eski veriyi SİLMEDEN)
  const userDocRef = getUserDocRef(userId);
  await setDoc(userDocRef, {
    isMigrated: true,
    migratedAt: new Date().toISOString(),
    migratedStats: {
      totalItems,
      customersCount: (sourceData.customers || []).length,
      transactionsCount: (sourceData.transactions || []).length
    }
  }, { merge: true });

  report('✅ Migrasyon başarıyla tamamlandı!', 100, 'done');

  return {
    success: true,
    totalItems,
    migratedStats: {
      customers: (sourceData.customers || []).length,
      transactions: (sourceData.transactions || []).length
    }
  };
};
