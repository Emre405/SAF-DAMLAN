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
import NavItem from './components/NavItem';
import { formatNumber } from './components/utils';

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

  const readUserData = async () => readData(user?.uid);
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

    // 1. Instantly load from localStorage on startup (0ms delay)
    const userLocalKey = `safDamlaData_${user.uid}`;
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

    // 3. Set up native persistent real-time listener
    console.log("Setting up real-time listener for user:", user.uid);
    const docRef = doc(db, 'userData', user.uid);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Keep local storage copy updated
        localStorage.setItem(userLocalKey, JSON.stringify(data));
        
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
      } else {
        // Doc doesn't exist yet, fall back to readData (migrating mock/localStorage fallback)
        async function migrateData() {
          const data = await readData(user.uid);
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
          
          if (data.customers && data.customers.length > 0) {
            // Background write
            writeData(data, user.uid, setSyncStatus);
          }
        }
        migrateData();
      }
    }, (error) => {
      console.error("Real-time listener error:", error);
      setSyncStatus('offline');
    });

    return () => unsubscribe();
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
      const data = await readData(user?.uid);
      data.defaultPrices = newPrices;
      writeData(data, user?.uid, setSyncStatus);
      setDefaultPrices(newPrices);
      showMessage('Varsayılan fiyatlar kaydedildi!', 'success');
    } catch (error) {
      console.error('Error saving default prices:', error);
      showMessage('Hata oluştu!', 'error');
    }
  };

  const handleSaveCustomer = async (customerData) => {
    try {
      const data = await readUserData();
      let customersList = data.customers || [];
      if (customerData.id) {
        customersList = customersList.map(c => c.id === customerData.id ? { ...c, ...customerData } : c);
        showMessage('Müşteri güncellendi!', 'success');
      } else {
        customerData.id = Date.now().toString();
        customerData.createdAt = new Date().toISOString();
        customersList.push(customerData);
        showMessage('Müşteri eklendi!', 'success');
      }
      data.customers = customersList;
      writeUserData(data);
      setCustomers(customersList);
    } catch (error) {
      console.error('Error saving customer:', error);
      showMessage('Müşteri kaydedilirken hata oluştu!', 'error');
    }
  };

  const handleSaveTransaction = async (transactionData) => {
    try {
      const data = await readUserData();
      let trans = data.transactions || [];
      let customerId = transactionData.customerId;
      
      if (!customerId) {
        const existingCustomer = customers.find(c => c.name.toLowerCase() === transactionData.customerName.toLowerCase());
        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          const newCustomer = {
            id: Date.now().toString(),
            name: transactionData.customerName,
            phone: '',
            address: '',
            createdAt: new Date().toISOString()
          };
          data.customers = [...(data.customers || []), newCustomer];
          customerId = newCustomer.id;
          setCustomers(data.customers);
        }
      }
      
      const transactionToSave = {
        ...transactionData,
        customerId,
        customerName: transactionData.customerName,
        date: transactionData.date.toISOString(),
        id: transactionData.id || Date.now().toString()
      };
      
      if (transactionData.id) {
        trans = trans.map(t => t.id === transactionData.id ? transactionToSave : t);
      } else {
        trans.push(transactionToSave);
      }
      data.transactions = trans;
      
      writeUserData(data);
      setTransactions(trans);
      showMessage(transactionData.id ? 'İşlem güncellendi!' : 'İşlem eklendi!', 'success');
    } catch (error) {
      console.error('Error saving transaction:', error);
      showMessage('İşlem kaydedilirken hata oluştu!', 'error');
    }
  };

  const handleCollectPayment = async (customerId, customerName, amount) => {
    try {
      const data = await readUserData();
      let trans = data.transactions || [];
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
      trans.push(paymentTransaction);
      data.transactions = trans;
      writeUserData(data);
      setTransactions(trans);
      showMessage(`${formatNumber(amount, ' ₺')} tahsilat kaydedildi.`, 'success');
    } catch (error) {
      console.error('Error collecting payment:', error);
      showMessage('Tahsilat sırasında hata oluştu!', 'error');
    }
  };
  
  const handleSaveOilPurchase = async (purchaseData) => {
    try {
      const data = await readUserData();
      let purchases = data.oilPurchases || [];
      const normalizedPurchaseData = {
        ...purchaseData,
        date: new Date(purchaseData.date).toISOString()
      };
      if (purchaseData.id) {
        purchases = purchases.map(p => p.id === purchaseData.id ? { ...p, ...normalizedPurchaseData } : p);
        showMessage('Zeytinyağı alımı güncellendi!', 'success');
      } else {
        normalizedPurchaseData.id = Date.now().toString();
        normalizedPurchaseData.createdAt = new Date().toISOString();
        purchases.push(normalizedPurchaseData);
        showMessage('Zeytinyağı alımı eklendi!', 'success');
      }
      data.oilPurchases = purchases;
      writeUserData(data);
      setOilPurchases(purchases);
    } catch (error) {
      console.error('Error saving oil purchase:', error);
      showMessage('Hata oluştu!', 'error');
    }
  };

  const handleSaveOilSale = async (saleData) => {
    try {
      const data = await readUserData();
      let sales = data.oilSales || [];
      const normalizedSaleData = {
        ...saleData,
        date: new Date(saleData.date).toISOString()
      };
      if (saleData.id) {
        sales = sales.map(s => s.id === saleData.id ? { ...s, ...normalizedSaleData } : s);
        showMessage('Zeytinyağı satışı güncellendi!', 'success');
      } else {
        normalizedSaleData.id = Date.now().toString();
        normalizedSaleData.createdAt = new Date().toISOString();
        sales.push(normalizedSaleData);
        showMessage('Zeytinyağı satışı eklendi!', 'success');
      }
      data.oilSales = sales;
      writeUserData(data);
      setOilSales(sales);
    } catch (error) {
      console.error('Error saving oil sale:', error);
      showMessage('Hata oluştu!', 'error');
    }
  };

  const handleSaveWorkerExpense = async (expenseData) => {
    try {
      const data = await readUserData();
      let expenses = data.workerExpenses || [];
      const normalizedExpenseData = {
        ...expenseData,
        date: new Date(expenseData.date).toISOString()
      };
      if (expenseData.id) {
        expenses = expenses.map(e => e.id === expenseData.id ? { ...e, ...normalizedExpenseData } : e);
        showMessage('Harcama güncellendi!', 'success');
      } else {
        normalizedExpenseData.id = Date.now().toString();
        normalizedExpenseData.createdAt = new Date().toISOString();
        expenses.push(normalizedExpenseData);
        showMessage('Harcama eklendi!', 'success');
      }
      data.workerExpenses = expenses;
      writeUserData(data);
      setWorkerExpenses(expenses);
    } catch (error) {
      console.error('Error saving worker expense:', error);
      showMessage('Hata oluştu!', 'error');
    }
  };

  const handleSaveFactoryOverhead = async (overheadData) => {
    try {
      const data = await readUserData();
      let overhead = data.factoryOverhead || [];
      const normalizedOverheadData = {
        ...overheadData,
        date: new Date(overheadData.date).toISOString()
      };
      if (overheadData.id) {
        overhead = overhead.map(e => e.id === overheadData.id ? { ...e, ...normalizedOverheadData } : e);
        showMessage('Gider güncellendi!', 'success');
      } else {
        normalizedOverheadData.id = Date.now().toString();
        normalizedOverheadData.createdAt = new Date().toISOString();
        overhead.push(normalizedOverheadData);
        showMessage('Gider eklendi!', 'success');
      }
      data.factoryOverhead = overhead;
      writeUserData(data);
      setFactoryOverhead(overhead);
    } catch (error) {
      console.error('Error saving factory overhead:', error);
      showMessage('Hata oluştu!', 'error');
    }
  };

  const handleSavePomaceRevenue = async (revenueData) => {
    try {
      const data = await readUserData();
      let revenues = data.pomaceRevenues || [];
      const normalizedRevenueData = {
        ...revenueData,
        date: new Date(revenueData.date).toISOString()
      };
      if (revenueData.id) {
        revenues = revenues.map(e => e.id === revenueData.id ? { ...e, ...normalizedRevenueData } : e);
        showMessage('Gelir güncellendi!', 'success');
      } else {
        normalizedRevenueData.id = Date.now().toString();
        normalizedRevenueData.createdAt = new Date().toISOString();
        revenues.push(normalizedRevenueData);
        showMessage('Gelir eklendi!', 'success');
      }
      data.pomaceRevenues = revenues;
      writeUserData(data);
      setPomaceRevenues(revenues);
    } catch (error) {
      console.error('Error saving pomace revenue:', error);
      showMessage('Hata oluştu!', 'error');
    }
  };

  const handleSaveTinPurchase = async (purchaseData) => {
    try {
      const data = await readUserData();
      let purchases = data.tinPurchases || [];
      const normalizedPurchaseData = {
        ...purchaseData,
        date: new Date(purchaseData.date).toISOString()
      };
      if (purchaseData.id) {
        purchases = purchases.map(e => e.id === purchaseData.id ? { ...e, ...normalizedPurchaseData } : e);
        showMessage('Alım güncellendi!', 'success');
      } else {
        normalizedPurchaseData.id = Date.now().toString();
        normalizedPurchaseData.createdAt = new Date().toISOString();
        purchases.push(normalizedPurchaseData);
        showMessage('Alım eklendi!', 'success');
      }
      data.tinPurchases = purchases;
      writeUserData(data);
      setTinPurchases(purchases);
    } catch (error) {
      console.error('Error saving tin purchase:', error);
      showMessage('Hata oluştu!', 'error');
    }
  };

  const handleSavePlasticPurchase = async (purchaseData) => {
    try {
      const data = await readUserData();
      let purchases = data.plasticPurchases || [];
      const normalizedPurchaseData = {
        ...purchaseData,
        date: new Date(purchaseData.date).toISOString()
      };
      if (purchaseData.id) {
        purchases = purchases.map(e => e.id === purchaseData.id ? { ...e, ...normalizedPurchaseData } : e);
        showMessage('Alım güncellendi!', 'success');
      } else {
        normalizedPurchaseData.id = Date.now().toString();
        normalizedPurchaseData.createdAt = new Date().toISOString();
        purchases.push(normalizedPurchaseData);
        showMessage('Alım eklendi!', 'success');
      }
      data.plasticPurchases = purchases;
      writeUserData(data);
      setPlasticPurchases(purchases);
    } catch (error) {
      console.error('Error saving plastic purchase:', error);
      showMessage('Hata oluştu!', 'error');
    }
  };

  const handleDeleteItem = async (collectionName, id) => {
    try {
      const data = await readUserData();
      let collection = data[collectionName] || [];
      collection = collection.filter(item => item.id !== id);
      data[collectionName] = collection;
      writeUserData(data);
      
      switch (collectionName) {
        case 'transactions': setTransactions(collection); break;
        case 'workerExpenses': setWorkerExpenses(collection); break;
        case 'factoryOverhead': setFactoryOverhead(collection); break;
        case 'pomaceRevenues': setPomaceRevenues(collection); break;
        case 'tinPurchases': setTinPurchases(collection); break;
        case 'plasticPurchases': setPlasticPurchases(collection); break;
        case 'oilPurchases': setOilPurchases(collection); break;
        case 'oilSales': setOilSales(collection); break;
        default: break;
      }
      showMessage('Kayıt silindi.', 'success');
    } catch (error) {
      console.error('Error deleting item:', error);
      showMessage('Hata oluştu!', 'error');
    }
  };

  const handleDeleteSingleCustomer = async (customerId) => {
    try {
      const data = await readUserData();
      let customersList = data.customers || [];
      let trans = data.transactions || [];
      customersList = customersList.filter(c => c.id !== customerId);
      trans = trans.filter(t => t.customerId !== customerId);
      data.customers = customersList;
      data.transactions = trans;
      writeUserData(data);
      setCustomers(customersList);
      setTransactions(trans);
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
            <div className="w-3 h-3 bg-emerald-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-3 h-3 bg-emerald-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-3 h-3 bg-emerald-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
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
              <NavItem text="Gider/Gelir" icon={<Factory className="w-5 h-5" />} active={currentPage === 'expenses'} onClick={() => navigateTo('expenses')} textClassName="text-sm" />
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
            onDeleteTransaction={(id) => handleDeleteItem('transactions', id)}
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
            onDeleteItem={(collectionName, id) => handleDeleteItem(collectionName, id)}
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
            onDeleteTransaction={(id) => handleDeleteItem('transactions', id)}
            onDeleteCustomer={handleDeleteSingleCustomer}
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
          <span className="text-[10px]">Giderler</span>
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
