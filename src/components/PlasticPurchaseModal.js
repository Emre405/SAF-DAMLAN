import React, { useState, useEffect } from 'react';
import { FormField, TextAreaField } from './FormFields';
import { toInputDateString, roundToTwo, formatNumber } from './utils';

const PlasticPurchaseModal = ({ onClose, onSave, editingPurchase }) => {
  const [formData, setFormData] = useState({ date: new Date(), description: '', s10: '', s5: '', s2: '', plasticPrice: '' });
  
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

  const totalCount = (Number(formData.s10) || 0) + (Number(formData.s5) || 0) + (Number(formData.s2) || 0);
  const totalCost = roundToTwo(totalCount * Number(formData.plasticPrice));

  const handleSubmit = (e) => { 
    e.preventDefault(); 
    onSave({ ...formData, totalCost, id: editingPurchase?.id }); 
    onClose(); 
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-emerald-800">
          {editingPurchase ? 'Bidon Alımını Düzenle' : 'Yeni Bidon Alımı Ekle'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Tarih" id="date" type="date" name="date" value={toInputDateString(formData.date)} onChange={handleChange} required className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 min-h-[48px]" />
          
          <div className="grid grid-cols-3 gap-4">
            <FormField label="10'luk Sayısı" id="s10" type="number" inputMode="numeric" name="s10" value={formData.s10} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 min-h-[48px]" />
            <FormField label="5'lik Sayısı" id="s5" type="number" inputMode="numeric" name="s5" value={formData.s5} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 min-h-[48px]" />
            <FormField label="2'lik Sayısı" id="s2" type="number" inputMode="numeric" name="s2" value={formData.s2} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 min-h-[48px]" />
          </div>
          
          <FormField label="Birim Fiyat (₺)" id="plasticPrice" type="number" inputMode="decimal" name="plasticPrice" value={formData.plasticPrice} onChange={handleChange} required className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 min-h-[48px]" />
          <TextAreaField label="Açıklama (örn: Satıcı Firma)" id="description" name="description" value={formData.description} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3" />
          
          <div className="bg-gray-50 p-3 rounded-md border text-center">
            <span className="block text-xs font-semibold text-gray-500 mb-1">Hesaplanan Toplam Maliyet</span>
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

export default PlasticPurchaseModal;
