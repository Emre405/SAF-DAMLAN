import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FormField, TextAreaField } from './FormFields';
import PrintableReceipt from './PrintableReceipt';
import { roundToTwo, formatNumber, formatOilRatioDisplay, toInputDateString } from './utils';

const NewTransactionModal = ({ onClose, onSave, customers, editingTransaction, defaultPrices, onSaveDefaultPrices, isOnline }) => {
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [selectedCustomerOption, setSelectedCustomerOption] = useState(null);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [customDefaults, setCustomDefaults] = useState(defaultPrices);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    date: new Date(),
    oliveKg: '', pricePerKg: defaultPrices.pricePerKg,
    oilLitre: '',
    tinCounts: { s16: '', s10: '', s5: '' },
    tinPrices: { s16: defaultPrices.tinPrices.s16, s10: defaultPrices.tinPrices.s10, s5: defaultPrices.tinPrices.s5 },
    plasticCounts: { s10: '', s5: '', s2: '' },
    plasticPrices: { s10: defaultPrices.plasticPrices.s10, s5: defaultPrices.plasticPrices.s5, s2: defaultPrices.plasticPrices.s2 },
    paymentReceived: '',
    paymentLoss: '',
    description: '',
  });

  const customerSearchRef = useRef(null);
  const receiptRef = useRef();

  useEffect(() => {
    const initialTinCounts = { s16: '', s10: '', s5: '' };
    const initialPlasticCounts = { s10: '', s5: '', s2: '' };
    const initialTinPrices = { ...defaultPrices.tinPrices };
    const initialPlasticPrices = { ...defaultPrices.plasticPrices };
    if (editingTransaction) {
      const transactionDate = new Date(editingTransaction.date);
      setFormData({
        date: !isNaN(transactionDate.getTime()) ? transactionDate : new Date(),
        oliveKg: editingTransaction.oliveKg || '',
        pricePerKg: editingTransaction.pricePerKg || defaultPrices.pricePerKg,
        oilLitre: editingTransaction.oilLitre || '',
        tinCounts: { ...initialTinCounts, ...editingTransaction.tinCounts },
        tinPrices: { ...initialTinPrices, ...editingTransaction.tinPrices },
        plasticCounts: { ...initialPlasticCounts, ...editingTransaction.plasticCounts },
        plasticPrices: { ...initialPlasticPrices, ...editingTransaction.plasticPrices },
        paymentReceived: editingTransaction.paymentReceived || '',
        paymentLoss: editingTransaction.paymentLoss || '',
        description: editingTransaction.description || '',
      });
      setCustomerSearchTerm(editingTransaction.customerName || '');
      setSelectedCustomerOption({ id: editingTransaction.customerId, name: editingTransaction.customerName });
    } else {
      setFormData({
        date: new Date(),
        oliveKg: '', pricePerKg: defaultPrices.pricePerKg,
        oilLitre: '',
        tinCounts: initialTinCounts, tinPrices: initialTinPrices,
        plasticCounts: initialPlasticCounts, plasticPrices: initialPlasticPrices,
        paymentReceived: '',
        paymentLoss: '',
        description: '',
      });
      setCustomerSearchTerm('');
      setSelectedCustomerOption(null);
    }
  }, [editingTransaction, defaultPrices]);
  
  useEffect(() => {
      setCustomDefaults(defaultPrices);
  }, [defaultPrices]);

  useEffect(() => {
    const handleClickOutside = (event) => { 
      if (customerSearchRef.current && !customerSearchRef.current.contains(event.target)) {
        setShowCustomerSuggestions(false); 
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => { 
    const { name, value } = e.target; 
    setFormData(prev => ({ ...prev, [name]: value })); 
  };
  
  const handleContainerChange = (type, size, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: { ...prev[type], [size]: value }
    }));
  };

  const handleDateChange = (e) => {
    const dateString = e.target.value;
    setFormData(prev => ({
        ...prev,
        date: dateString ? new Date(dateString + 'T00:00:00') : new Date()
    }));
  };

  const handleCustomerSearchChange = (e) => { 
    setCustomerSearchTerm(e.target.value); 
    setSelectedCustomerOption(null); 
    setShowCustomerSuggestions(true); 
  };

  const handleSelectCustomer = (customer) => { 
    setSelectedCustomerOption(customer); 
    setCustomerSearchTerm(customer.name); 
    setShowCustomerSuggestions(false); 
  };

  const handleDefaultsChange = (e) => { 
    const { name, value } = e.target; 
    setCustomDefaults(prev => ({ ...prev, [name]: Number(value) || 0 })); 
  };

  const handleNestedDefaultsChange = (type, size, value) => {
    setCustomDefaults(prev => ({
      ...prev,
      [type]: { ...prev[type], [size]: Number(value) || 0 }
    }));
  };

  const handleSaveDefaults = () => { 
    onSaveDefaultPrices(customDefaults); 
  };

  const filteredCustomerSuggestions = customers.filter(c => c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()));

  const oliveCost = Number(formData.oliveKg) * Number(formData.pricePerKg);
  const tinCost = (Number(formData.tinCounts.s16) * Number(formData.tinPrices.s16)) + (Number(formData.tinCounts.s10) * Number(formData.tinPrices.s10)) + (Number(formData.tinCounts.s5) * Number(formData.tinPrices.s5));
  const plasticCost = (Number(formData.plasticCounts.s10) * Number(formData.plasticPrices.s10)) + (Number(formData.plasticCounts.s5) * Number(formData.plasticPrices.s5)) + (Number(formData.plasticCounts.s2) * Number(formData.plasticPrices.s2));
  const totalCost = roundToTwo(oliveCost + tinCost + plasticCost);
  const oilRatio = Number(formData.oliveKg) > 0 ? (Number(formData.oilLitre) / Number(formData.oliveKg)) : 0;
  const remainingBalance = roundToTwo(totalCost - Number(formData.paymentReceived) - Number(formData.paymentLoss));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerSearchTerm) { alert('Lütfen müşteri adı giriniz.'); return; }
    
    const transactionData = {
      ...formData,
      customerName: customerSearchTerm,
      customerId: selectedCustomerOption?.id || null,
      totalCost,
      oilRatio,
      remainingBalance,
      id: editingTransaction?.id,
    };
    
    if (!navigator.onLine) {
      console.log("🔴 Offline - direkt kaydet ve kapat");
      onSave(transactionData);
      onClose();
      return;
    }
    
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      await onSave(transactionData);
      setIsLoading(false);
      onClose();
    } catch (err) {
      setErrorMsg(err?.message || 'Kayıt sırasında bir hata oluştu.');
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (printContent) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>İşlem Fişi</title>');
        printWindow.document.write(`
          <style>
            @media print {
              @page { size: A5; margin: 8mm; }
              body { margin: 0; padding: 0; }
            }
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
          </style>
        `);
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-75 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto p-0 relative">
        <div className="sticky top-0 z-10 bg-white rounded-t-2xl px-6 sm:px-8 pt-6 pb-3 border-b flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold text-emerald-800">{editingTransaction ? 'İşlemi Düzenle' : 'Yeni İşlem Ekle'}</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold p-1">×</button>
        </div>
        
        {errorMsg && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 text-center font-semibold">{errorMsg}</div>}
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 px-6 sm:px-8 pb-8 pt-4">
          {/* Üst Bölüm */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="col-span-1">
              <button type="button" onClick={() => setShowSettings(!showSettings)} className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border font-semibold text-gray-700 mb-2 min-h-[48px]">
                <span>Varsayılan Fiyatlar</span>
                {showSettings ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
              </button>
              {showSettings && (
                <div className="p-4 space-y-4 border rounded-lg bg-gray-50 mb-2">
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Kg Başına Ücret (₺)</label><input type="number" name="pricePerKg" inputMode="decimal" value={customDefaults.pricePerKg} onChange={handleDefaultsChange} className="block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 min-h-[44px]"/></div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Teneke Fiyatları (₺)</label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <input type="number" inputMode="decimal" value={customDefaults.tinPrices.s16} onChange={e => handleNestedDefaultsChange('tinPrices', 's16', e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 min-h-[44px]" placeholder="16'lık"/>
                      <input type="number" inputMode="decimal" value={customDefaults.tinPrices.s10} onChange={e => handleNestedDefaultsChange('tinPrices', 's10', e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 min-h-[44px]" placeholder="10'luk"/>
                      <input type="number" inputMode="decimal" value={customDefaults.tinPrices.s5} onChange={e => handleNestedDefaultsChange('tinPrices', 's5', e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 min-h-[44px]" placeholder="5'lik"/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Bidon Fiyatları (₺)</label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <input type="number" inputMode="decimal" value={customDefaults.plasticPrices.s10} onChange={e => handleNestedDefaultsChange('plasticPrices', 's10', e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 min-h-[44px]" placeholder="10'luk"/>
                      <input type="number" inputMode="decimal" value={customDefaults.plasticPrices.s5} onChange={e => handleNestedDefaultsChange('plasticPrices', 's5', e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 min-h-[44px]" placeholder="5'lik"/>
                      <input type="number" inputMode="decimal" value={customDefaults.plasticPrices.s2} onChange={e => handleNestedDefaultsChange('plasticPrices', 's2', e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 min-h-[44px]" placeholder="2'lik"/>
                    </div>
                  </div>
                  <div className="flex justify-end"><button type="button" onClick={handleSaveDefaults} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm min-h-[44px]">Kaydet</button></div>
                </div>
              )}
            </div>
            <div className="col-span-1 relative" ref={customerSearchRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri Adı Soyadı</label>
              <input type="text" value={customerSearchTerm} onChange={handleCustomerSearchChange} onFocus={() => setShowCustomerSuggestions(true)} className="block w-full border rounded-md shadow-sm py-3 px-3 min-h-[48px]" placeholder="Müşteri adı girin veya seçin" required />
              {showCustomerSuggestions && customerSearchTerm && (
                <ul className="absolute z-20 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto mt-1">
                  {filteredCustomerSuggestions.length > 0 ? filteredCustomerSuggestions.map(c => <li key={c.id} className="px-4 py-2 cursor-pointer hover:bg-gray-100" onClick={() => handleSelectCustomer(c)}>{c.name}</li>) : <li className="px-4 py-2 text-gray-500">Yeni müşteri oluşturulacak.</li>}
                </ul>
              )}
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="block w-full border rounded-md shadow-sm py-2 px-3" rows="2" placeholder="İşlemle ilgili notlar..."/>
            </div>
          </div>

          {/* İşlem Detayları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="İşlem Tarihi" id="date" type="date" name="date" value={toInputDateString(formData.date)} onChange={handleDateChange} required className="block w-full border rounded-md shadow-sm py-3 px-3 min-h-[48px]" />
            <FormField label="Zeytin Miktarı (kg)" id="oliveKg" type="number" inputMode="decimal" name="oliveKg" value={formData.oliveKg} onChange={handleChange} className="block w-full border rounded-md shadow-sm py-3 px-3 min-h-[48px]" min="0" step="any" placeholder="Örn: 150.5"/>
            <FormField label="Kg Başına Ücret (₺)" id="pricePerKg" type="number" inputMode="decimal" name="pricePerKg" value={formData.pricePerKg} onChange={handleChange} className="block w-full border rounded-md shadow-sm py-3 px-3 min-h-[48px]" min="0" step="any"/>
            
            <div className="grid grid-cols-2 gap-2">
              <FormField label="Çıkan Yağ (litre)" id="oilLitre" type="number" inputMode="decimal" name="oilLitre" value={formData.oilLitre} onChange={handleChange} className="block w-full border rounded-md shadow-sm py-3 px-3 min-h-[48px]" min="0" step="any" placeholder="Örn: 30.2"/>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yağ Oranı</label>
                <div className="flex items-center justify-center border rounded-md shadow-sm py-3 px-3 min-h-[48px] bg-emerald-50 text-emerald-900 font-bold text-base sm:text-lg border-emerald-200 text-center">
                  {Number(formData.oliveKg) > 0 && Number(formData.oilLitre) > 0 
                    ? (Number(formData.oliveKg) / Number(formData.oilLitre)).toFixed(2) 
                    : '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Tenekeler */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-emerald-800 mb-2">Tenekeler</h3>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="16'lık Sayısı" id="t16" type="number" inputMode="numeric" value={formData.tinCounts.s16} onChange={e => handleContainerChange('tinCounts', 's16', e.target.value)} className="block w-full border rounded-md shadow-sm py-3 px-3 min-h-[48px]"/>
              <FormField label="10'luk Sayısı" id="t10" type="number" inputMode="numeric" value={formData.tinCounts.s10} onChange={e => handleContainerChange('tinCounts', 's10', e.target.value)} className="block w-full border rounded-md shadow-sm py-3 px-3 min-h-[48px]"/>
              <FormField label="5'lik Sayısı" id="t5" type="number" inputMode="numeric" value={formData.tinCounts.s5} onChange={e => handleContainerChange('tinCounts', 's5', e.target.value)} className="block w-full border rounded-md shadow-sm py-3 px-3 min-h-[48px]"/>
            </div>
          </div>

          {/* Bidonlar */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-emerald-800 mb-2">Bidonlar</h3>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="10'luk Sayısı" id="pc10" type="number" inputMode="numeric" value={formData.plasticCounts.s10} onChange={e => handleContainerChange('plasticCounts', 's10', e.target.value)} className="block w-full border rounded-md shadow-sm py-3 px-3 min-h-[48px]"/>
              <FormField label="5'lik Sayısı" id="pc5" type="number" inputMode="numeric" value={formData.plasticCounts.s5} onChange={e => handleContainerChange('plasticCounts', 's5', e.target.value)} className="block w-full border rounded-md shadow-sm py-3 px-3 min-h-[48px]"/>
              <FormField label="2'lik Sayısı" id="pc2" type="number" inputMode="numeric" value={formData.plasticCounts.s2} onChange={e => handleContainerChange('plasticCounts', 's2', e.target.value)} className="block w-full border rounded-md shadow-sm py-3 px-3 min-h-[48px]"/>
            </div>
          </div>

          {/* Ödeme ve Özet */}
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="bg-gray-50 p-3 rounded-md border"><span className="block text-xs font-medium text-gray-500">Zeytin Sıkım Ücreti</span><p className="text-base font-bold text-gray-800">{formatNumber(oliveCost, '₺')}</p></div>
              <div className="bg-gray-50 p-3 rounded-md border"><span className="block text-xs font-medium text-gray-500">Toplam Teneke Fiyatı</span><p className="text-base font-bold text-gray-800">{formatNumber(tinCost, '₺')}</p></div>
              <div className="bg-gray-50 p-3 rounded-md border"><span className="block text-xs font-medium text-gray-500">Toplam Bidon Fiyatı</span><p className="text-base font-bold text-gray-800">{formatNumber(plasticCost, '₺')}</p></div>
            </div>

            {/* Genel Toplam Kartı (Alınan Ödeme ve Ödeme Firesinin hemen üstünde) */}
            <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-200 text-center shadow-sm">
              <span className="block text-xs font-semibold text-blue-700 uppercase tracking-wide">Genel Toplam Tutarı</span>
              <p className="text-xl sm:text-2xl font-extrabold text-blue-900 mt-0.5">{formatNumber(totalCost, '₺')}</p>
            </div>

            {/* Ödeme Giriş Kutuları */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
              <FormField label="Alınan Ödeme (₺)" id="payRec" type="number" inputMode="decimal" name="paymentReceived" value={formData.paymentReceived} onChange={handleChange} className="block w-full border rounded-md shadow-sm py-3 px-3 min-h-[48px]" min="0" step="any" placeholder="0"/>
              <FormField label="Ödeme Firesi (₺)" id="payLoss" type="number" inputMode="decimal" name="paymentLoss" value={formData.paymentLoss} onChange={handleChange} className="block w-full border rounded-md shadow-sm py-3 px-3 min-h-[48px]" min="0" step="any" placeholder="0"/>
            </div>

            {/* En Alttaki Sonuç Kartları (Alınan Ödeme ve Kalan Bakiye) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 flex justify-between items-center"><span className="text-xs font-semibold text-emerald-700">Alınan Ödeme</span><p className="text-lg font-bold text-emerald-800">{formatNumber(formData.paymentReceived, '₺')}</p></div>
              <div className="bg-red-50 p-3.5 rounded-xl border border-red-200 flex justify-between items-center"><span className="text-xs font-semibold text-red-700">Kalan Bakiye</span><p className="text-lg font-bold text-red-800">{formatNumber(remainingBalance, '₺')}</p></div>
            </div>
          </div>

          {/* Footer */}
          <div className="col-span-full flex flex-col-reverse sm:flex-row justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors shadow-sm min-h-[48px]">İptal</button>
            <button type="button" onClick={handlePrint} className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md min-h-[48px]">Yazdır</button>
            <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-md min-h-[48px] disabled:opacity-50" disabled={isLoading}>
              {isLoading ? (navigator.onLine ? '☁️ Kaydediliyor...' : '📱 Offline Kaydediliyor...') : 'Kaydet'}
            </button>
          </div>
        </form>
        
        {/* Gizli fiş bileşeni */}
        <div style={{ display: "none" }}>
          <PrintableReceipt 
            ref={receiptRef} 
            transactionData={{
              ...formData,
              customerName: customerSearchTerm,
              totalCost: (
                (Number(formData.oliveKg) || 0) * (Number(formData.pricePerKg) || 0)
                + (Number(formData.tinCounts?.s16 || 0) * Number(formData.tinPrices?.s16 || 0))
                + (Number(formData.tinCounts?.s10 || 0) * Number(formData.tinPrices?.s10 || 0))
                + (Number(formData.tinCounts?.s5 || 0) * Number(formData.tinPrices?.s5 || 0))
                + (Number(formData.plasticCounts?.s10 || 0) * Number(formData.plasticPrices?.s10 || 0))
                + (Number(formData.plasticCounts?.s5 || 0) * Number(formData.plasticPrices?.s5 || 0))
                + (Number(formData.plasticCounts?.s2 || 0) * Number(formData.plasticPrices?.s2 || 0))
              ),
              remainingBalance: roundToTwo(
                (
                  (Number(formData.oliveKg) || 0) * (Number(formData.pricePerKg) || 0)
                  + (Number(formData.tinCounts?.s16 || 0) * Number(formData.tinPrices?.s16 || 0))
                  + (Number(formData.tinCounts?.s10 || 0) * Number(formData.tinPrices?.s10 || 0))
                  + (Number(formData.tinCounts?.s5 || 0) * Number(formData.tinPrices?.s5 || 0))
                  + (Number(formData.plasticCounts?.s10 || 0) * Number(formData.plasticPrices?.s10 || 0))
                  + (Number(formData.plasticCounts?.s5 || 0) * Number(formData.plasticPrices?.s5 || 0))
                  + (Number(formData.plasticCounts?.s2 || 0) * Number(formData.plasticPrices?.s2 || 0))
                  - Number(formData.paymentReceived || 0)
                  - Number(formData.paymentLoss || 0)
                )
              )
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default NewTransactionModal;
