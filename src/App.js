import React, { useState, useEffect } from 'react';
import {
  Home, List, Users, BarChart2, Download, AlertCircle, Factory, Coins, LogOut, Package, Menu, X
} from 'lucide-react';
import { auth, enableOfflineSupport, getNetworkStatus } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import Login from './Login';

// Sayfalar
import Dashboard from './pages/Dashboard';
import Records from './pages/Records';
import OurCustomers from './pages/OurCustomers';
import Statistics from './pages/Statistics';
import StockPage from './pages/StockPage';
import FactoryExpenses from './pages/FactoryExpenses';
import CustomerDetails from './pages/CustomerDetails';
import BackupPage from './pages/BackupPage';

// Modallar ve Bileşenler
import NewTransactionModal from './components/NewTransactionModal';
import ConfirmationModal from './components/ConfirmationModal';
import MigrationModal from './components/MigrationModal';
import NavItem from './components/NavItem';
import { formatNumber } from './components/utils';

// Alt-Koleksiyon ve Veritabanı Servisleri
import {
  checkMigrationStatus,
  loadAllSubcollectionsData,
  saveSubcollectionItem,
  deleteSubcollectionItem,
  saveDefaultPrices as saveDefaultPricesSubcollection,
  SUBCOLLECTIONS
} from './services/firestoreService';

const mockData = {
  customers: [],
  transactions: [],
  workerExpenses: [],
  factoryOverhead: [],
  pomaceRevenues: [],
  tinPurchases: [],
  plasticPurchases: [],
  oilPurchases: [],
  oilSales: [],
  defaultPrices: {
    pricePerKg: 3,
    tinPrices: { s16: 80, s10: 70, s5: 60 },
    plasticPrices: { s10: 20, s5: 15, s2: 10 },
    oilPurchasePrice: 200,
    oilSalePrice: 250
  }
};

const readData = async (userId) => {
  if (!userId) {
    console.log("No user ID, returning mock data");
    return mockData;
  }

  const userLocalKey = `safDamlaData_${userId}`;

  try {
    console.log("Reading data from Firestore for user:", userId);
    const docRef = doc(db, 'userData', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Data found in Firestore");
      const firestoreData = docSnap.data();

      const localData = localStorage.getItem(userLocalKey);
      if (localData) {
        const parsedLocalData = JSON.parse(localData);
        console.log("🔄 Merging user-specific localStorage data with Firestore data");

        const mergedData = {
          ...firestoreData,
          customers: [...(firestoreData.customers || [])],
          transactions: [...(firestoreData.transactions || [])],
          workerExpenses: [...(firestoreData.workerExpenses || [])],
          factoryOverhead: [...(firestoreData.factoryOverhead || [])],
          pomaceRevenues: [...(firestoreData.pomaceRevenues || [])],
          tinPurchases: [...(firestoreData.tinPurchases || [])],
          plasticPurchases: [...(firestoreData.plasticPurchases || [])],
          oilPurchases: [...(firestoreData.oilPurchases || [])],
          oilSales: [...(firestoreData.oilSales || [])],
          defaultPrices: firestoreData.defaultPrices || mockData.defaultPrices
        };

        if (parsedLocalData.customers) {
          const allCustomers = [...mergedData.customers];
          parsedLocalData.customers.forEach(localCustomer => {
            if (!allCustomers.some(fsCustomer => fsCustomer.id === localCustomer.id)) {
              allCustomers.push(localCustomer);
            }
          });
          mergedData.customers = allCustomers;
        }

        if (parsedLocalData.transactions) {
          const allTransactions = [...mergedData.transactions];
          parsedLocalData.transactions.forEach(localTransaction => {
            if (!allTransactions.some(fsTransaction => fsTransaction.id === localTransaction.id)) {
              allTransactions.push(localTransaction);
            }
          });
          mergedData.transactions = allTransactions;
        }

        if (parsedLocalData.workerExpenses) {
          const allWorkerExpenses = [...mergedData.workerExpenses];
          parsedLocalData.workerExpenses.forEach(localExpense => {
            if (!allWorkerExpenses.some(fsExpense => fsExpense.id === localExpense.id)) {
              allWorkerExpenses.push(localExpense);
            }
          });
          mergedData.workerExpenses = allWorkerExpenses;
        }

        if (parsedLocalData.factoryOverhead) {
          const allFactoryOverhead = [...mergedData.factoryOverhead];
          parsedLocalData.factoryOverhead.forEach(localOverhead => {
            if (!allFactoryOverhead.some(fsOverhead => fsOverhead.id === localOverhead.id)) {
              allFactoryOverhead.push(localOverhead);
            }
          });
          mergedData.factoryOverhead = allFactoryOverhead;
        }

        if (parsedLocalData.pomaceRevenues) {
          const allPomaceRevenues = [...mergedData.pomaceRevenues];
          parsedLocalData.pomaceRevenues.forEach(localRevenue => {
            if (!allPomaceRevenues.some(fsRevenue => fsRevenue.id === localRevenue.id)) {
              allPomaceRevenues.push(localRevenue);
            }
          });
          mergedData.pomaceRevenues = allPomaceRevenues;
        }

        if (parsedLocalData.tinPurchases) {
          const allTinPurchases = [...mergedData.tinPurchases];
          parsedLocalData.tinPurchases.forEach(localPurchase => {
            if (!allTinPurchases.some(fsPurchase => fsPurchase.id === localPurchase.id)) {
              allTinPurchases.push(localPurchase);
            }
          });
          mergedData.tinPurchases = allTinPurchases;
        }

        if (parsedLocalData.plasticPurchases) {
          const allPlasticPurchases = [...mergedData.plasticPurchases];
          parsedLocalData.plasticPurchases.forEach(localPurchase => {
            if (!allPlasticPurchases.some(fsPurchase => fsPurchase.id === localPurchase.id)) {
              allPlasticPurchases.push(localPurchase);
            }
          });
          mergedData.plasticPurchases = allPlasticPurchases;
        }

        if (parsedLocalData.oilPurchases) {
          const allOilPurchases = [...mergedData.oilPurchases];
          parsedLocalData.oilPurchases.forEach(localPurchase => {
            if (!allOilPurchases.some(fsPurchase => fsPurchase.id === localPurchase.id)) {
              allOilPurchases.push(localPurchase);
            }
          });
          mergedData.oilPurchases = allOilPurchases;
        }

        if (parsedLocalData.oilSales) {
          const allOilSales = [...mergedData.oilSales];
          parsedLocalData.oilSales.forEach(localSale => {
            if (!allOilSales.some(fsSale => fsSale.id === localSale.id)) {
              allOilSales.push(localSale);
            }
          });
          mergedData.oilSales = allOilSales;
        }

        localStorage.setItem(userLocalKey, JSON.stringify(mergedData));
        return mergedData;
      }

      // If user local key doesn't exist yet, we save firestore data into it
      localStorage.setItem(userLocalKey, JSON.stringify(firestoreData));
      return firestoreData;
    } else {
      console.log("No data in Firestore for user:", userId);

      // Try user-specific local storage first
      const savedData = localStorage.getItem(userLocalKey);
      if (savedData) {
        return JSON.parse(savedData);
      }

      return mockData;
    }
  } catch (error) {
    console.error("Error reading data from Firestore:", error);
    const savedData = localStorage.getItem(userLocalKey);
    if (savedData) {
      return JSON.parse(savedData);
    }
    return mockData;
  }
};

const writeData = (data, userId, setSyncStatusCallback) => {
  if (!userId) {
    localStorage.setItem('safDamlaData_guest', JSON.stringify(data));
    return;
  }

  const userLocalKey = `safDamlaData_${userId}`;
  localStorage.setItem(userLocalKey, JSON.stringify(data));

  if (!localStorage.getItem('safDamlaData_owner')) {
    localStorage.setItem('safDamlaData_owner', userId);
  }

  try {
    if (setSyncStatusCallback) setSyncStatusCallback('syncing');
    const docRef = doc(db, 'userData', userId);

    // Background non-blocking write to Firestore
    setDoc(docRef, data, { merge: true })
      .then(() => {
        if (setSyncStatusCallback) setSyncStatusCallback('synced');
      })
      .catch(error => {
        console.error("❌ Error writing data to Firestore (background):", error);
        if (setSyncStatusCallback) setSyncStatusCallback('offline');
      });
  } catch (error) {
    console.error("❌ Error initializing Firestore write:", error);
    if (setSyncStatusCallback) setSyncStatusCallback('offline');
  }
};

function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [customerDetailsBackPage, setCustomerDetailsBackPage] = useState('records');
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [isOnline, setIsOnline] = useState(getNetworkStatus());
  const [syncStatus, setSyncStatus] = useState('synced');

  // Migrasyon ve Alt-Koleksiyon Durumu
  const [isMigrated, setIsMigrated] = useState(false);
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [migrationSourceData, setMigrationSourceData] = useState(null);

  const [workerExpenses, setWorkerExpenses] = useState([]);
  const [factoryOverhead, setFactoryOverhead] = useState([]);
  const [pomaceRevenues, setPomaceRevenues] = useState([]);
  const [tinPurchases, setTinPurchases] = useState([]);
  const [plasticPurchases, setPlasticPurchases] = useState([]);
  const [oilPurchases, setOilPurchases] = useState([]);
  const [oilSales, setOilSales] = useState([]);
  const [defaultPrices, setDefaultPrices] = useState({
    pricePerKg: 3,
    tinPrices: { s16: 80, s10: 70, s5: 60 },
    plasticPrices: { s10: 20, s5: 15, s2: 10 },
    oilPurchasePrice: 200,
    oilSalePrice: 250
  });

  // LocalStorage güncelleme yardımcısı
  const updateLocalData = (key, updatedList) => {
    if (!user?.uid) return;
    const userLocalKey = `safDamlaData_${user.uid}`;
    try {
      const currentRaw = localStorage.getItem(userLocalKey);
      const current = currentRaw ? JSON.parse(currentRaw) : {};
      current[key] = updatedList;
      localStorage.setItem(userLocalKey, JSON.stringify(current));
    } catch (e) {
      console.warn("localStorage quota warning:", e);
    }
  };

  const readUserData = async () => {
    if (isMigrated && user?.uid) {
      const userLocalKey = `safDamlaData_${user.uid}`;
      const saved = localStorage.getItem(userLocalKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
      return {
        customers,
        transactions,
        workerExpenses,
        factoryOverhead,
        pomaceRevenues,
        tinPurchases,
        plasticPurchases,
        oilPurchases,
        oilSales,
        defaultPrices
      };
    }
    return readData(user?.uid);
  };
  const writeUserData = (data) => writeData(data, user?.uid, setSyncStatus);

  const migrateLegacyOfflineData = async (userId) => {
    try {
      const offlineDataStr = localStorage.getItem('offlineData');
      if (!offlineDataStr) return;

      const offlineData = JSON.parse(offlineDataStr);
      const userOfflineItems = offlineData.filter(item => item.userId === userId);
      if (userOfflineItems.length === 0) return;

      console.log(`⚠️ Legacy offline data migration started for user: ${userId}. Merging ${userOfflineItems.length} items.`);

      const userLocalKey = `safDamlaData_${userId}`;
      const localDataStr = localStorage.getItem(userLocalKey);
      let mergedData = localDataStr ? JSON.parse(localDataStr) : { ...mockData };

      const mergeArraysById = (arr1 = [], arr2 = []) => {
        const combined = [...arr1, ...arr2];
        return combined.filter((item, index, self) =>
          item && item.id && index === self.findIndex(t => t && t.id === item.id)
        );
      };

      for (const item of userOfflineItems) {
        if (item.data) {
          mergedData = {
            ...mergedData,
            ...item.data,
            customers: mergeArraysById(mergedData.customers, item.data.customers),
            transactions: mergeArraysById(mergedData.transactions, item.data.transactions),
            workerExpenses: mergeArraysById(mergedData.workerExpenses, item.data.workerExpenses),
            factoryOverhead: mergeArraysById(mergedData.factoryOverhead, item.data.factoryOverhead),
            pomaceRevenues: mergeArraysById(mergedData.pomaceRevenues, item.data.pomaceRevenues),
            tinPurchases: mergeArraysById(mergedData.tinPurchases, item.data.tinPurchases),
            plasticPurchases: mergeArraysById(mergedData.plasticPurchases, item.data.plasticPurchases),
            oilPurchases: mergeArraysById(mergedData.oilPurchases, item.data.oilPurchases),
            oilSales: mergeArraysById(mergedData.oilSales, item.data.oilSales),
            defaultPrices: item.data.defaultPrices || mergedData.defaultPrices || mockData.defaultPrices
          };
        }
      }

      localStorage.setItem(userLocalKey, JSON.stringify(mergedData));

      // Non-blocking background save to Firestore
      const docRef = doc(db, 'userData', userId);
      setDoc(docRef, mergedData, { merge: true })
        .then(() => {
          console.log("✅ Legacy offline data successfully synced to Firestore");
        })
        .catch(err => {
          console.warn("⚠️ Legacy offline data write to Firestore deferred:", err);
        });

      const remainingOfflineData = offlineData.filter(item => item.userId !== userId);
      if (remainingOfflineData.length > 0) {
        localStorage.setItem('offlineData', JSON.stringify(remainingOfflineData));
      } else {
        localStorage.removeItem('offlineData');
      }

      console.log("✅ Legacy offline data migration finished");

      setCustomers(mergedData.customers || []);
      setTransactions(mergedData.transactions || []);
      setWorkerExpenses(mergedData.workerExpenses || []);
      setFactoryOverhead(mergedData.factoryOverhead || []);
      setPomaceRevenues(mergedData.pomaceRevenues || []);
      setTinPurchases(mergedData.tinPurchases || []);
      setPlasticPurchases(mergedData.plasticPurchases || []);
      setOilPurchases(mergedData.oilPurchases || []);
      setOilSales(mergedData.oilSales || []);
      if (mergedData.defaultPrices) setDefaultPrices(mergedData.defaultPrices);

    } catch (error) {
      console.error("❌ Error migrating legacy offline data:", error);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('syncing');
      setTimeout(() => setSyncStatus('synced'), 1500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);
    setSyncStatus(navigator.onLine ? 'synced' : 'offline');

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const initOfflineSupport = async () => {
      try {
        await enableOfflineSupport();
      } catch (error) {
        console.error("❌ Failed to enable offline support:", error);
      }
    };
    initOfflineSupport();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    const userLocalKey = `safDamlaData_${user.uid}`;

    // 1. Instantly load from localStorage on startup (0ms delay)
    const savedLocalData = localStorage.getItem(userLocalKey);
    if (savedLocalData) {
      try {
        const data = JSON.parse(savedLocalData);
        setCustomers(data.customers || []);
        setTransactions(data.transactions || []);
        setWorkerExpenses(data.workerExpenses || []);
        setFactoryOverhead(data.factoryOverhead || []);
        setPomaceRevenues(data.pomaceRevenues || []);
        setTinPurchases(data.tinPurchases || []);
        setPlasticPurchases(data.plasticPurchases || []);
        setOilPurchases(data.oilPurchases || []);
        setOilSales(data.oilSales || []);
        if (data.defaultPrices) setDefaultPrices(data.defaultPrices);
        console.log("⚡ Instantly loaded data from localStorage on startup");
      } catch (e) {
        console.error("Error parsing localStorage data on startup:", e);
      }
    }

    // 2. Perform legacy offline migration (if any legacy offlineData exists)
    migrateLegacyOfflineData(user.uid);

    let unsubscribe = null;

    // 3. Veritabanı durumu ve veri yükleme (Alt-Koleksiyon veya Eski Yapı)
    const loadUserData = async () => {
      try {
        const migStatus = await checkMigrationStatus(user.uid);

        if (migStatus.isMigrated) {
          setIsMigrated(true);
          console.log("✅ Kullanıcı güvenli alt-koleksiyon mimarisinde.");
          setSyncStatus('syncing');

          const fullData = await loadAllSubcollectionsData(user.uid);
          setCustomers(fullData.customers || []);
          setTransactions(fullData.transactions || []);
          setWorkerExpenses(fullData.workerExpenses || []);
          setFactoryOverhead(fullData.factoryOverhead || []);
          setPomaceRevenues(fullData.pomaceRevenues || []);
          setTinPurchases(fullData.tinPurchases || []);
          setPlasticPurchases(fullData.plasticPurchases || []);
          setOilPurchases(fullData.oilPurchases || []);
          setOilSales(fullData.oilSales || []);
          if (fullData.defaultPrices) setDefaultPrices(fullData.defaultPrices);

          try {
            localStorage.setItem(userLocalKey, JSON.stringify(fullData));
          } catch (e) {
            console.warn("localStorage quota warning:", e);
          }
          setSyncStatus('synced');
        } else {
          setIsMigrated(false);
          console.log("ℹ️ Kullanıcı eski tek-belge yapısında. Kaynak veri hazırlanıyor.");

          const legacyData = migStatus.legacyData || await readData(user.uid);
          setMigrationSourceData(legacyData);
          setCustomers(legacyData.customers || []);
          setTransactions(legacyData.transactions || []);
          setWorkerExpenses(legacyData.workerExpenses || []);
          setFactoryOverhead(legacyData.factoryOverhead || []);
          setPomaceRevenues(legacyData.pomaceRevenues || []);
          setTinPurchases(legacyData.tinPurchases || []);
          setPlasticPurchases(legacyData.plasticPurchases || []);
          setOilPurchases(legacyData.oilPurchases || []);
          setOilSales(legacyData.oilSales || []);
          if (legacyData.defaultPrices) setDefaultPrices(legacyData.defaultPrices);

          // Eski yapı dinleyicisi
          const docRef = doc(db, 'userData', user.uid);
          unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data.isMigrated) {
                setIsMigrated(true);
                return;
              }
              try {
                localStorage.setItem(userLocalKey, JSON.stringify(data));
              } catch (e) {}
              setCustomers(data.customers || []);
              setTransactions(data.transactions || []);
              setWorkerExpenses(data.workerExpenses || []);
              setFactoryOverhead(data.factoryOverhead || []);
              setPomaceRevenues(data.pomaceRevenues || []);
              setTinPurchases(data.tinPurchases || []);
              setPlasticPurchases(data.plasticPurchases || []);
              setOilPurchases(data.oilPurchases || []);
              setOilSales(data.oilSales || []);
              if (data.defaultPrices) setDefaultPrices(data.defaultPrices);
              setSyncStatus('synced');
            }
          }, (error) => {
            console.error("Real-time listener error:", error);
            setSyncStatus('offline');
          });
        }
      } catch (err) {
        console.error("Veri yükleme hatası:", err);
      }
    };

    loadUserData();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.uid]);

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  const navigateTo = (page, data = null) => {
    if (page === 'customerDetails') {
      setCustomerDetailsBackPage(currentPage);
    }
    setCurrentPage(page);
    if (page === 'customerDetails') {
      setSelectedCustomer(data);
    } else {
      setSelectedCustomer(null);
    }
  };

  const handleOpenNewTransactionModal = (transaction = null) => {
    setEditingTransaction(transaction);
    setShowNewTransactionModal(true);
  };

  const handleCloseNewTransactionModal = () => {
    setShowNewTransactionModal(false);
    setEditingTransaction(null);
  };

  const handleSaveDefaultPrices = async (newPrices) => {
    try {
      if (isMigrated && user?.uid) {
        await saveDefaultPricesSubcollection(user.uid, newPrices);
        updateLocalData('defaultPrices', newPrices);
      } else {
        const data = await readData(user?.uid);
        data.defaultPrices = newPrices;
        writeData(data, user?.uid, setSyncStatus);
      }
      setDefaultPrices(newPrices);
      showMessage('Varsayılan fiyatlar kaydedildi!', 'success');
    } catch (error) {
      console.error('Error saving default prices:', error);
      showMessage('Hata oluştu!', 'error');
    }
  };

  const handleSaveCustomer = async (customerData) => {
    try {
      const currentCustomers = [...customers];
      let updatedCustomers;
      let customerToSave = { ...customerData };

      if (customerData.id) {
        updatedCustomers = currentCustomers.map(c => c.id === customerData.id ? { ...c, ...customerData } : c);
        showMessage('Müşteri güncellendi!', 'success');
      } else {
        customerToSave.id = Date.now().toString();
        customerToSave.createdAt = new Date().toISOString();
        updatedCustomers = [...currentCustomers, customerToSave];
        showMessage('Müşteri eklendi!', 'success');
      }

      if (isMigrated && user?.uid) {
        await saveSubcollectionItem(user.uid, SUBCOLLECTIONS.CUSTOMERS, customerToSave);
        updateLocalData('customers', updatedCustomers);
      } else {
        const data = await readUserData();
        data.customers = updatedCustomers;
        writeUserData(data);
      }

      setCustomers(updatedCustomers);
    } catch (error) {
      console.error('Error saving customer:', error);
      showMessage('Müşteri kaydedilirken hata oluştu!', 'error');
    }
  };

  const handleSaveTransaction = async (transactionData) => {
    try {
      let customerId = transactionData.customerId;
      let newCustomer = null;

      if (!customerId) {
        const existingCustomer = customers.find(c => c.name.toLowerCase() === transactionData.customerName.toLowerCase());
        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          newCustomer = {
            id: Date.now().toString(),
            name: transactionData.customerName,
            phone: '',
            address: '',
            createdAt: new Date().toISOString()
          };
          customerId = newCustomer.id;
        }
      }

      const transactionToSave = {
        ...transactionData,
        customerId,
        customerName: transactionData.customerName,
        date: transactionData.date instanceof Date ? transactionData.date.toISOString() : new Date(transactionData.date).toISOString(),
        id: transactionData.id || Date.now().toString()
      };

      let updatedTransactions;
      if (transactionData.id) {
        updatedTransactions = transactions.map(t => t.id === transactionData.id ? transactionToSave : t);
      } else {
        updatedTransactions = [...transactions, transactionToSave];
      }

      let updatedCustomers = [...customers];
      if (newCustomer) {
        updatedCustomers.push(newCustomer);
      }

      if (isMigrated && user?.uid) {
        if (newCustomer) {
          await saveSubcollectionItem(user.uid, SUBCOLLECTIONS.CUSTOMERS, newCustomer);
          setCustomers(updatedCustomers);
          updateLocalData('customers', updatedCustomers);
        }
        await saveSubcollectionItem(user.uid, SUBCOLLECTIONS.TRANSACTIONS, transactionToSave);
        updateLocalData('transactions', updatedTransactions);
      } else {
        const data = await readUserData();
        data.transactions = updatedTransactions;
        if (newCustomer) {
          data.customers = updatedCustomers;
          setCustomers(updatedCustomers);
        }
        writeUserData(data);
      }

      setTransactions(updatedTransactions);
      showMessage(transactionData.id ? 'İşlem güncellendi!' : 'İşlem eklendi!', 'success');
    } catch (error) {
      console.error('Error saving transaction:', error);
      showMessage('İşlem kaydedilirken hata oluştu!', 'error');
    }
  };

  const handleCollectPayment = async (customerId, customerName, amount) => {
    try {
      const paymentTransaction = {
        id: Date.now().toString(),
        customerId,
        customerName,
        date: new Date().toISOString(),
        paymentReceived: Number(amount),
        oliveKg: 0,
        oilLitre: 0,
        pricePerKg: 0,
        tinCounts: { s16: 0, s10: 0, s5: 0 },
        tinPrices: { s16: 0, s10: 0, s5: 0 },
        plasticCounts: { s10: 0, s5: 0, s2: 0 },
        plasticPrices: { s10: 0, s5: 0, s2: 0 },
        totalCost: 0,
        oilRatio: 0,
        paymentLoss: 0,
        remainingBalance: -Number(amount),
        description: 'Ara Tahsilat'
      };

      const updatedTransactions = [...transactions, paymentTransaction];

      if (isMigrated && user?.uid) {
        await saveSubcollectionItem(user.uid, SUBCOLLECTIONS.TRANSACTIONS, paymentTransaction);
        updateLocalData('transactions', updatedTransactions);
      } else {
        const data = await readUserData();
        data.transactions = updatedTransactions;
        writeUserData(data);
      }

      setTransactions(updatedTransactions);
      showMessage(`${formatNumber(amount, ' ₺')} tahsilat kaydedildi.`, 'success');
    } catch (error) {
      console.error('Error collecting payment:', error);
      showMessage('Tahsilat sırasında hata oluştu!', 'error');
    }
  };

  const handleSaveOilPurchase = async (purchaseData) => {
    try {
      const normalizedPurchaseData = {
        ...purchaseData,
        date: new Date(purchaseData.date).toISOString()
      };
      let updatedPurchases;
      if (purchaseData.id) {
        updatedPurchases = oilPurchases.map(p => p.id === purchaseData.id ? { ...p, ...normalizedPurchaseData } : p);
        showMessage('Zeytinyağı alımı güncellendi!', 'success');
      } else {
        normalizedPurchaseData.id = Date.now().toString();
        normalizedPurchaseData.createdAt = new Date().toISOString();
        updatedPurchases = [...oilPurchases, normalizedPurchaseData];
        showMessage('Zeytinyağı alımı eklendi!', 'success');
      }

      if (isMigrated && user?.uid) {
        await saveSubcollectionItem(user.uid, SUBCOLLECTIONS.OIL_PURCHASES, normalizedPurchaseData);
        updateLocalData('oilPurchases', updatedPurchases);
      } else {
        const data = await readUserData();
        data.oilPurchases = updatedPurchases;
        writeUserData(data);
      }

      setOilPurchases(updatedPurchases);
    } catch (error) {
      console.error('Error saving oil purchase:', error);
      showMessage('Hata oluştu!', 'error');
    }
  };

  const handleSaveOilSale = async (saleData) => {
    try {
      const normalizedSaleData = {
        ...saleData,
        date: new Date(saleData.date).toISOString()
      };
      let updatedSales;
      if (saleData.id) {
        updatedSales = oilSales.map(s => s.id === saleData.id ? { ...s, ...normalizedSaleData } : s);
        showMessage('Zeytinyağı satışı güncellendi!', 'success');
      } else {
        normalizedSaleData.id = Date.now().toString();
        normalizedSaleData.createdAt = new Date().toISOString();
        updatedSales = [...oilSales, normalizedSaleData];
        showMessage('Zeytinyağı satışı eklendi!', 'success');
      }

      if (isMigrated && user?.uid) {
        await saveSubcollectionItem(user.uid, SUBCOLLECTIONS.OIL_SALES, normalizedSaleData);
        updateLocalData('oilSales', updatedSales);
      } else {
        const data = await readUserData();
        data.oilSales = updatedSales;
        writeUserData(data);
      }

      setOilSales(updatedSales);
    } catch (error) {
      console.error('Error saving oil sale:', error);
      showMessage('Hata oluştu!', 'error');
    }
  };

  const handleSaveWorkerExpense = async (expenseData) => {
    try {
      const normalizedExpenseData = {
        ...expenseData,
        date: new Date(expenseData.date).toISOString()
      };
      let updatedExpenses;
      if (expenseData.id) {
        updatedExpenses = workerExpenses.map(e => e.id === expenseData.id ? { ...e, ...normalizedExpenseData } : e);
        showMessage('Harcama güncellendi!', 'success');
      } else {
        normalizedExpenseData.id = Date.now().toString();
        normalizedExpenseData.createdAt = new Date().toISOString();
        updatedExpenses = [...workerExpenses, normalizedExpenseData];
        showMessage('Harcama eklendi!', 'success');
      }

      if (isMigrated && user?.uid) {
        await saveSubcollectionItem(user.uid, SUBCOLLECTIONS.WORKER_EXPENSES, normalizedExpenseData);
        updateLocalData('workerExpenses', updatedExpenses);
      } else {
        const data = await readUserData();
        data.workerExpenses = updatedExpenses;
        writeUserData(data);
      }

      setWorkerExpenses(updatedExpenses);
    } catch (error) {
      console.error('Error saving worker expense:', error);
      showMessage('Hata oluştu!', 'error');
    }
  };

  const handleSaveFactoryOverhead = async (overheadData) => {
    try {
      const normalizedOverheadData = {
        ...overheadData,
        date: new Date(overheadData.date).toISOString()
      };
      let updatedOverhead;
      if (overheadData.id) {
        updatedOverhead = factoryOverhead.map(e => e.id === overheadData.id ? { ...e, ...normalizedOverheadData } : e);
        showMessage('Gider güncellendi!', 'success');
      } else {
        normalizedOverheadData.id = Date.now().toString();
        normalizedOverheadData.createdAt = new Date().toISOString();
        updatedOverhead = [...factoryOverhead, normalizedOverheadData];
        showMessage('Gider eklendi!', 'success');
      }

      if (isMigrated && user?.uid) {
        await saveSubcollectionItem(user.uid, SUBCOLLECTIONS.FACTORY_OVERHEAD, normalizedOverheadData);
        updateLocalData('factoryOverhead', updatedOverhead);
      } else {
        const data = await readUserData();
        data.factoryOverhead = updatedOverhead;
        writeUserData(data);
      }

      setFactoryOverhead(updatedOverhead);
    } catch (error) {
      console.error('Error saving factory overhead:', error);
      showMessage('Hata oluştu!', 'error');
    }
  };

  const handleSavePomaceRevenue = async (revenueData) => {
    try {
      const normalizedRevenueData = {
        ...revenueData,
        date: new Date(revenueData.date).toISOString()
      };
      let updatedRevenues;
      if (revenueData.id) {
        updatedRevenues = pomaceRevenues.map(e => e.id === revenueData.id ? { ...e, ...normalizedRevenueData } : e);
        showMessage('Gelir güncellendi!', 'success');
      } else {
        normalizedRevenueData.id = Date.now().toString();
        normalizedRevenueData.createdAt = new Date().toISOString();
        updatedRevenues = [...pomaceRevenues, normalizedRevenueData];
        showMessage('Gelir eklendi!', 'success');
      }

      if (isMigrated && user?.uid) {
        await saveSubcollectionItem(user.uid, SUBCOLLECTIONS.POMACE_REVENUES, normalizedRevenueData);
        updateLocalData('pomaceRevenues', updatedRevenues);
      } else {
        const data = await readUserData();
        data.pomaceRevenues = updatedRevenues;
        writeUserData(data);
      }

      setPomaceRevenues(updatedRevenues);
    } catch (error) {
      console.error('Error saving pomace revenue:', error);
      showMessage('Hata oluştu!', 'error');
    }
  };

  const handleSaveTinPurchase = async (purchaseData) => {
    try {
      const normalizedPurchaseData = {
        ...purchaseData,
        date: new Date(purchaseData.date).toISOString()
      };
      let updatedPurchases;
      if (purchaseData.id) {
        updatedPurchases = tinPurchases.map(e => e.id === purchaseData.id ? { ...e, ...normalizedPurchaseData } : e);
        showMessage('Alım güncellendi!', 'success');
      } else {
        normalizedPurchaseData.id = Date.now().toString();
        normalizedPurchaseData.createdAt = new Date().toISOString();
        updatedPurchases = [...tinPurchases, normalizedPurchaseData];
        showMessage('Alım eklendi!', 'success');
      }

      if (isMigrated && user?.uid) {
        await saveSubcollectionItem(user.uid, SUBCOLLECTIONS.TIN_PURCHASES, normalizedPurchaseData);
        updateLocalData('tinPurchases', updatedPurchases);
      } else {
        const data = await readUserData();
        data.tinPurchases = updatedPurchases;
        writeUserData(data);
      }

      setTinPurchases(updatedPurchases);
    } catch (error) {
      console.error('Error saving tin purchase:', error);
      showMessage('Hata oluştu!', 'error');
    }
  };

  const handleSavePlasticPurchase = async (purchaseData) => {
    try {
      const normalizedPurchaseData = {
        ...purchaseData,
        date: new Date(purchaseData.date).toISOString()
      };
      let updatedPurchases;
      if (purchaseData.id) {
        updatedPurchases = plasticPurchases.map(e => e.id === purchaseData.id ? { ...e, ...normalizedPurchaseData } : e);
        showMessage('Alım güncellendi!', 'success');
      } else {
        normalizedPurchaseData.id = Date.now().toString();
        normalizedPurchaseData.createdAt = new Date().toISOString();
        updatedPurchases = [...plasticPurchases, normalizedPurchaseData];
        showMessage('Alım eklendi!', 'success');
      }

      if (isMigrated && user?.uid) {
        await saveSubcollectionItem(user.uid, SUBCOLLECTIONS.PLASTIC_PURCHASES, normalizedPurchaseData);
        updateLocalData('plasticPurchases', updatedPurchases);
      } else {
        const data = await readUserData();
        data.plasticPurchases = updatedPurchases;
        writeUserData(data);
      }

      setPlasticPurchases(updatedPurchases);
    } catch (error) {
      console.error('Error saving plastic purchase:', error);
      showMessage('Hata oluştu!', 'error');
    }
  };

  const handleDeleteItem = async (collectionName, id) => {
    try {
      if (isMigrated && user?.uid) {
        await deleteSubcollectionItem(user.uid, collectionName, id);
      }

      let collection;
      switch (collectionName) {
        case 'transactions':
          collection = transactions.filter(item => item.id !== id);
          setTransactions(collection);
          break;
        case 'workerExpenses':
          collection = workerExpenses.filter(item => item.id !== id);
          setWorkerExpenses(collection);
          break;
        case 'factoryOverhead':
          collection = factoryOverhead.filter(item => item.id !== id);
          setFactoryOverhead(collection);
          break;
        case 'pomaceRevenues':
          collection = pomaceRevenues.filter(item => item.id !== id);
          setPomaceRevenues(collection);
          break;
        case 'tinPurchases':
          collection = tinPurchases.filter(item => item.id !== id);
          setTinPurchases(collection);
          break;
        case 'plasticPurchases':
          collection = plasticPurchases.filter(item => item.id !== id);
          setPlasticPurchases(collection);
          break;
        case 'oilPurchases':
          collection = oilPurchases.filter(item => item.id !== id);
          setOilPurchases(collection);
          break;
        case 'oilSales':
          collection = oilSales.filter(item => item.id !== id);
          setOilSales(collection);
          break;
        default: break;
      }

      if (isMigrated && user?.uid) {
        updateLocalData(collectionName, collection);
      } else {
        const data = await readUserData();
        data[collectionName] = collection;
        writeUserData(data);
      }

      showMessage('Kayıt silindi.', 'success');
    } catch (error) {
      console.error('Error deleting item:', error);
      showMessage('Hata oluştu!', 'error');
    }
  };

  const handleDeleteSingleCustomer = async (customerId) => {
    try {
      const updatedCustomers = customers.filter(c => c.id !== customerId);
      const updatedTransactions = transactions.filter(t => t.customerId !== customerId);

      if (isMigrated && user?.uid) {
        await deleteSubcollectionItem(user.uid, SUBCOLLECTIONS.CUSTOMERS, customerId);
        const relatedTrans = transactions.filter(t => t.customerId === customerId);
        for (const t of relatedTrans) {
          await deleteSubcollectionItem(user.uid, SUBCOLLECTIONS.TRANSACTIONS, t.id);
        }
        updateLocalData('customers', updatedCustomers);
        updateLocalData('transactions', updatedTransactions);
      } else {
        const data = await readUserData();
        data.customers = updatedCustomers;
        data.transactions = updatedTransactions;
        writeUserData(data);
      }

      setCustomers(updatedCustomers);
      setTransactions(updatedTransactions);
      showMessage('Müşteri ve işlemleri silindi.', 'success');
    } catch (error) {
      console.error('Error deleting customer:', error);
      showMessage('Hata oluştu!', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!confirmationAction) return;
    const { type, id, ids, collection: collectionName } = confirmationAction;
    setIsDeleting(true);
    try {
      if (type === 'delete-single-item') {
        await handleDeleteItem(collectionName, id);
      } else if (type === 'delete-single-customer') {
        await handleDeleteSingleCustomer(id);
        navigateTo('customers');
      } else if (type === 'delete-multiple-customers') {
        for (const customerId of ids) {
          await handleDeleteSingleCustomer(customerId);
        }
        navigateTo('customers');
      }
    } catch (error) {
      console.error('Silme hatası:', error);
      showMessage(`Hata: ${error.message}`, 'error');
    } finally {
      setIsDeleting(false);
      setShowConfirmationModal(false);
      setConfirmationAction(null);
    }
  };

  const handleDeleteSelectedCustomers = (customerIds) => {
    const msg = `${customerIds.length} müşteriyi ve bu müşterilere ait tüm işlemleri silmek istediğinizden emin misiniz?`;
    setConfirmationAction({ type: 'delete-multiple-customers', ids: customerIds, message: msg });
    setShowConfirmationModal(true);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center">
        <div className="text-center p-4">
          <div className="w-20 h-20 mx-auto mb-6 bg-emerald-600 rounded-full flex items-center justify-center shadow-xl animate-pulse">
            <Coins className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-emerald-800 mb-2">SAF DAMLA</h1>
          <h2 className="text-lg text-emerald-600 mb-6">Zeytinyağı Fabrikası</h2>
          <div className="flex justify-center items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-emerald-700 font-medium text-sm">Sistem hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={() => setUser(auth.currentUser)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-inter flex flex-col pb-20 md:pb-0">
      {/* ÜST HEADER */}
      <header className="relative w-full bg-white shadow z-10 border-b">
        <nav className="flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-700">SAF DAMLA ZEYTİNYAĞI</h1>
            </div>

            {/* DESKTOP NAV MENU */}
            <div className="hidden md:flex items-center space-x-1">
              <NavItem text="Ana Sayfa" icon={<Home className="w-5 h-5" />} active={currentPage === 'dashboard'} onClick={() => navigateTo('dashboard')} textClassName="text-sm" />
              <NavItem text="Kayıtlar" icon={<List className="w-5 h-5" />} active={currentPage === 'records'} onClick={() => navigateTo('records')} textClassName="text-sm" />
              <NavItem text="Müşteriler" icon={<Users className="w-5 h-5" />} active={currentPage === 'customers'} onClick={() => navigateTo('customers')} textClassName="text-sm" />
              <NavItem text="Gelir/Gider" icon={<Factory className="w-5 h-5" />} active={currentPage === 'expenses'} onClick={() => navigateTo('expenses')} textClassName="text-sm" />
              <NavItem text="İstatistikler" icon={<BarChart2 className="w-5 h-5" />} active={currentPage === 'statistics'} onClick={() => navigateTo('statistics')} textClassName="text-sm" />
              <NavItem text="Stok" icon={<Package className="w-5 h-5" />} active={currentPage === 'stock'} onClick={() => navigateTo('stock')} textClassName="text-sm" />
              <NavItem text="Yedekler" icon={<Download className="w-5 h-5" />} active={currentPage === 'backup'} onClick={() => navigateTo('backup')} textClassName="text-sm" />
              <button
                onClick={async () => {
                  try {
                    await signOut(auth);
                    setUser(null);
                    setAuthChecked(true);
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-semibold">Çıkış</span>
              </button>
            </div>

            {/* MOBİL HIZLI ÇIKIŞ BUTONU */}
            <div className="flex md:hidden items-center">
              <button
                onClick={async () => {
                  try {
                    await signOut(auth);
                    setUser(null);
                    setAuthChecked(true);
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border"
                title="Çıkış"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Migrasyon Uyarısı Banner */}
      {!isMigrated && (
        <div className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3 shadow-md border-b border-amber-600">
          <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-xs sm:text-sm font-medium">
              <AlertCircle className="w-5 h-5 flex-shrink-0 animate-pulse text-amber-100" />
              <span>
                ⚠️ <strong>Önemli Güncelleme:</strong> Veritabanınız 1 MB tek-belge limitine ulaştı. Veri kaybını kalıcı olarak önlemek için güvenli aktarımı başlatın.
              </span>
            </div>
            <button
              onClick={() => setShowMigrationModal(true)}
              className="px-4 py-1.5 bg-white text-amber-700 hover:bg-amber-50 font-bold rounded-lg text-xs shadow transition-all hover:scale-105 whitespace-nowrap flex items-center gap-1.5"
            >
              🚀 Veritabanını Güvenle Aktar
            </button>
          </div>
        </div>
      )}

      {/* Offline banner */}
      {!isOnline && (
        <div className="w-full bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-3 text-xs sm:text-sm">
          <div className="flex items-center container mx-auto px-4">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <p className="font-semibold">
              🔌 Çevrimdışı Mod. İşlemleriniz internet bağlantısı kurulduğunda senkronize edilecektir.
            </p>
          </div>
        </div>
      )}

      {/* Syncing banner */}
      {syncStatus === 'syncing' && (
        <div className="w-full bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-2 text-xs sm:text-sm">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
            <p className="font-semibold">Veriler senkronize ediliyor...</p>
          </div>
        </div>
      )}

      {/* ANA İÇERİK ALANI */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-6 px-4">
        {currentPage === 'dashboard' && (
          <Dashboard
            customers={customers}
            transactions={transactions}
            workerExpenses={workerExpenses}
            factoryOverhead={factoryOverhead}
            pomaceRevenues={pomaceRevenues}
            tinPurchases={tinPurchases}
            plasticPurchases={plasticPurchases}
            onOpenNewTransactionModal={handleOpenNewTransactionModal}
            navigateToCustomerDetails={navigateTo}
          />
        )}
        {currentPage === 'records' && (
          <Records
            customers={customers}
            transactions={transactions}
            onOpenNewTransactionModal={handleOpenNewTransactionModal}
            onEditTransaction={setEditingTransaction}
            onDeleteTransaction={(id) => {
              setConfirmationAction({ type: 'delete-single-item', collection: 'transactions', id, message: 'Bu işlemi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.' });
              setShowConfirmationModal(true);
            }}
            navigateToCustomerDetails={navigateTo}
          />
        )}
        {currentPage === 'customers' && (
          <OurCustomers
            customers={customers}
            transactions={transactions}
            navigateToCustomerDetails={navigateTo}
            onOpenNewTransactionModal={handleOpenNewTransactionModal}
            onCollectPayment={handleCollectPayment}
            onDeleteSelected={handleDeleteSelectedCustomers}
          />
        )}
        {currentPage === 'statistics' && (
          <Statistics
            transactions={transactions}
            tinPurchases={tinPurchases}
            plasticPurchases={plasticPurchases}
          />
        )}
        {currentPage === 'stock' && (
          <StockPage
            tinPurchases={tinPurchases}
            plasticPurchases={plasticPurchases}
            transactions={transactions}
          />
        )}
        {currentPage === 'expenses' && (
          <FactoryExpenses
            workerExpenses={workerExpenses}
            factoryOverhead={factoryOverhead}
            pomaceRevenues={pomaceRevenues}
            tinPurchases={tinPurchases}
            plasticPurchases={plasticPurchases}
            onSaveWorkerExpense={handleSaveWorkerExpense}
            onSaveFactoryOverhead={handleSaveFactoryOverhead}
            onSavePomaceRevenue={handleSavePomaceRevenue}
            onSaveTinPurchase={handleSaveTinPurchase}
            onSavePlasticPurchase={handleSavePlasticPurchase}
            onDeleteItem={(collectionName, id) => {
              setConfirmationAction({ type: 'delete-single-item', collection: collectionName, id, message: 'Bu kaydı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.' });
              setShowConfirmationModal(true);
            }}
            isOnline={isOnline}
            showMessage={showMessage}
          />
        )}
        {currentPage === 'customerDetails' && (
          <CustomerDetails
            customer={selectedCustomer}
            transactions={transactions.filter(t => t.customerId === selectedCustomer.id)}
            onBack={() => navigateTo(customerDetailsBackPage)}
            onEditTransaction={handleOpenNewTransactionModal}
            onDeleteTransaction={(id) => {
              setConfirmationAction({ type: 'delete-single-item', collection: 'transactions', id, message: 'Bu işlemi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.' });
              setShowConfirmationModal(true);
            }}
            onDeleteCustomer={(customerId, customerName) => {
              setConfirmationAction({ type: 'delete-single-customer', id: customerId, message: `"${customerName}" müşterisini ve bu müşteriye ait TÜM işlemleri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!` });
              setShowConfirmationModal(true);
            }}
          />
        )}
        {currentPage === 'backup' && (
          <BackupPage
            customers={customers}
            transactions={transactions}
            workerExpenses={workerExpenses}
            factoryOverhead={factoryOverhead}
            pomaceRevenues={pomaceRevenues}
            tinPurchases={tinPurchases}
            plasticPurchases={plasticPurchases}
            oilPurchases={oilPurchases}
            oilSales={oilSales}
            readUserData={readUserData}
          />
        )}
      </main>

      {/* MOBİL BOTTOM NAV BAR (md altı ekranlar) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => { navigateTo('dashboard'); setShowMobileMenu(false); }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${currentPage === 'dashboard' ? 'text-emerald-600 font-bold' : 'text-gray-500'}`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Ana Sayfa</span>
        </button>
        <button
          onClick={() => { navigateTo('records'); setShowMobileMenu(false); }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${currentPage === 'records' ? 'text-emerald-600 font-bold' : 'text-gray-500'}`}
        >
          <List className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Kayıtlar</span>
        </button>
        <button
          onClick={() => { navigateTo('customers'); setShowMobileMenu(false); }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${currentPage === 'customers' ? 'text-emerald-600 font-bold' : 'text-gray-500'}`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Müşteriler</span>
        </button>
        <button
          onClick={() => { navigateTo('expenses'); setShowMobileMenu(false); }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${currentPage === 'expenses' ? 'text-emerald-600 font-bold' : 'text-gray-500'}`}
        >
          <Factory className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Gelir/Gider</span>
        </button>
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${showMobileMenu ? 'text-emerald-600 font-bold' : 'text-gray-500'}`}
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Menü</span>
        </button>
      </div>

      {/* MOBİL MENU OVERLAY (Daha Fazla) */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end animate-fade-in" onClick={() => setShowMobileMenu(false)}>
          <div className="w-full bg-white rounded-t-3xl p-6 space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-800 text-lg">Menü</h3>
              <button onClick={() => setShowMobileMenu(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 py-2">
              <button
                onClick={() => { navigateTo('statistics'); setShowMobileMenu(false); }}
                className={`flex items-center space-x-3 p-4 rounded-xl border transition-all ${currentPage === 'statistics' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-gray-50 border-gray-100 text-gray-700'}`}
              >
                <BarChart2 className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-sm">İstatistikler</span>
              </button>
              <button
                onClick={() => { navigateTo('stock'); setShowMobileMenu(false); }}
                className={`flex items-center space-x-3 p-4 rounded-xl border transition-all ${currentPage === 'stock' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-gray-50 border-gray-100 text-gray-700'}`}
              >
                <Package className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-sm">Stok Takibi</span>
              </button>
              <button
                onClick={() => { navigateTo('backup'); setShowMobileMenu(false); }}
                className={`flex items-center space-x-3 p-4 rounded-xl border transition-all ${currentPage === 'backup' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-gray-50 border-gray-100 text-gray-700'}`}
              >
                <Download className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-sm">Yedekler</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL MODALS */}
      {showNewTransactionModal && (
        <NewTransactionModal
          onClose={handleCloseNewTransactionModal}
          onSave={handleSaveTransaction}
          customers={customers}
          editingTransaction={editingTransaction}
          defaultPrices={defaultPrices}
          onSaveDefaultPrices={handleSaveDefaultPrices}
          isOnline={isOnline}
        />
      )}

      {showConfirmationModal && (
        <ConfirmationModal
          message={confirmationAction?.message}
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirmationModal(false)}
          isLoading={isDeleting}
        />
      )}

      {/* Migrasyon Modalı */}
      {showMigrationModal && user && (
        <MigrationModal
          userId={user.uid}
          sourceData={migrationSourceData || {
            customers,
            transactions,
            workerExpenses,
            factoryOverhead,
            pomaceRevenues,
            tinPurchases,
            plasticPurchases,
            oilPurchases,
            oilSales,
            defaultPrices
          }}
          onMigrationComplete={async () => {
            setIsMigrated(true);
            setShowMigrationModal(false);
            showMessage('Verileriniz yeni güvenli yapıya aktarıldı!', 'success');
            try {
              const fullData = await loadAllSubcollectionsData(user.uid);
              setCustomers(fullData.customers || []);
              setTransactions(fullData.transactions || []);
              setWorkerExpenses(fullData.workerExpenses || []);
              setFactoryOverhead(fullData.factoryOverhead || []);
              setPomaceRevenues(fullData.pomaceRevenues || []);
              setTinPurchases(fullData.tinPurchases || []);
              setPlasticPurchases(fullData.plasticPurchases || []);
              setOilPurchases(fullData.oilPurchases || []);
              setOilSales(fullData.oilSales || []);
              if (fullData.defaultPrices) setDefaultPrices(fullData.defaultPrices);
            } catch (err) {
              console.error('Yeniden yükleme hatası:', err);
            }
          }}
          onClose={() => setShowMigrationModal(false)}
        />
      )}

      {/* Global bildirim mesajı */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-fade-in ${messageType === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {message}
        </div>
      )}
    </div>
  );
}

export default App;
