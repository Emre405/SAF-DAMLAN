import React, { useState, useEffect } from 'react';
import { FormField } from './FormFields';
import { toInputDateString, roundToTwo, formatNumber } from './utils';

const OilPurchaseModal = ({ onClose, onSave, editingPurchase }) => {
  const [formData, setFormData] = useState({ date: new Date(), supplierName: '', tinCount: '', tinPrice: '' });
  
  useEffect(() => { 
    if (editingPurchase) { 
      const d = new Date(editingPurchase.date); 
      setFormData({ ...editingPurchase, date: !isNaN(d.getTime()) ? d : new Date() }); 
    } 
  }, [editingPurchase]);

  const handleChange = (e) => { 
    const { name, value } = e.target; 
    setFormData(p => ({ ...p, [name]: value })); 
  };

  const totalCost = roundToTwo(Number(formData.tinCount) * Number(formData.tinPrice));

  const handleSubmit = (e) => { 
    e.preventDefault(); 
    onSave({ ...formData, totalCost, id: editingPurchase?.id }); 
    onClose(); 
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-emerald-800">
          {editingPurchase ? 'Zeytinyağı Alımını Düzenle' : 'Yeni Zeytinyağı Alımı Ekle'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Tarih" id="date" type="date" name="date" value={toInputDateString(formData.date)} onChange={handleChange} required className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 min-h-[48px]" />
          <FormField label="Firma/Şahıs Adı" id="supplierName" type="text" name="supplierName" value={formData.supplierName} onChange={handleChange} required className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 min-h-[48px]" />
          <FormField label="Teneke Sayısı" id="tinCount" type="number" inputMode="numeric" name="tinCount" value={formData.tinCount} onChange={handleChange} required className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 min-h-[48px]" />
          <FormField label="Teneke Fiyatı (₺)" id="tinPrice" type="number" inputMode="decimal" name="tinPrice" value={formData.tinPrice} onChange={handleChange} required className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 min-h-[48px]" />
          
          <div className="bg-gray-50 p-3 rounded-md border text-center">
            <span className="block text-xs font-semibold text-gray-500 mb-1">Hesaplanan Alım Maliyet</span>
            <span className="text-lg font-bold text-red-700">{formatNumber(totalCost, '₺')}</span>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors shadow-sm min-h-[48px]">İptal</button>
            <button type="submit" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-md min-h-[48px]">Kaydet</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OilPurchaseModal;
