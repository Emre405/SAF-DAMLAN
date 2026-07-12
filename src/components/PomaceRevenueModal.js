import React, { useState, useEffect } from 'react';
import { FormField, TextAreaField } from './FormFields';
import { toInputDateString, roundToTwo, formatNumber } from './utils';

const PomaceRevenueModal = ({ onClose, onSave, editingRevenue }) => {
  const [formData, setFormData] = useState({ date: new Date(), truckCount: '', loadKg: '', pricePerKg: '', description: '' });
  
  useEffect(() => { 
    if (editingRevenue) { 
      const d = new Date(editingRevenue.date); 
      setFormData({ ...editingRevenue, date: !isNaN(d.getTime()) ? d : new Date() }); 
    } 
  }, [editingRevenue]);

  const handleChange = (e) => { 
    const { name, value } = e.target; 
    setFormData(p => ({ ...p, [name]: value })); 
  };

  const totalRevenue = roundToTwo(Number(formData.loadKg) * Number(formData.pricePerKg));

  const handleSubmit = (e) => { 
    e.preventDefault(); 
    onSave({ ...formData, totalRevenue, id: editingRevenue?.id }); 
    onClose(); 
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-emerald-800">
          {editingRevenue ? 'Pirina Gelirini Düzenle' : 'Yeni Pirina Geliri Ekle'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Tarih" id="date" type="date" name="date" value={toInputDateString(formData.date)} onChange={handleChange} required className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 min-h-[48px]" />
          <FormField label="Giden Tır Sayısı" id="truckCount" type="number" inputMode="numeric" name="truckCount" value={formData.truckCount} onChange={handleChange} required className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 min-h-[48px]" />
          <FormField label="Toplam Yük (kg)" id="loadKg" type="number" inputMode="decimal" name="loadKg" value={formData.loadKg} onChange={handleChange} required className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 min-h-[48px]" />
          <FormField label="Kg Başına Ücret (₺)" id="pricePerKg" type="number" inputMode="decimal" name="pricePerKg" value={formData.pricePerKg} onChange={handleChange} required className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 min-h-[48px]" />
          <TextAreaField label="Açıklama (örn: Firma Adı)" id="description" name="description" value={formData.description} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3" />
          
          <div className="bg-gray-50 p-3 rounded-md border text-center">
            <span className="block text-xs font-semibold text-gray-500 mb-1">Hesaplanan Toplam Gelir</span>
            <span className="text-lg font-bold text-emerald-800">{formatNumber(totalRevenue, '₺')}</span>
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

export default PomaceRevenueModal;
