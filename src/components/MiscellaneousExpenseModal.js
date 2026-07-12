import React, { useState, useEffect } from 'react';
import { FormField, TextAreaField } from './FormFields';
import { toInputDateString } from './utils';

const MiscellaneousExpenseModal = ({ onClose, onSave, editingExpense }) => {
  const [formData, setFormData] = useState({ date: new Date(), description: '', amount: '' });
  
  useEffect(() => { 
    if (editingExpense) { 
      const d = new Date(editingExpense.date); 
      setFormData({ ...editingExpense, date: !isNaN(d.getTime()) ? d : new Date() }); 
    } 
  }, [editingExpense]);

  const handleChange = (e) => { 
    const { name, value } = e.target; 
    setFormData(p => ({ ...p, [name]: value })); 
  };

  const handleQuickAdd = (desc) => { 
    setFormData(p => ({ ...p, description: p.description ? `${p.description}, ${desc}` : desc }));
  };

  const handleSubmit = (e) => { 
    e.preventDefault(); 
    onSave({ ...formData, id: editingExpense?.id }); 
    onClose(); 
  };

  const quickAddItems = ['Elektrik', 'Su', 'Yemek', 'Yakıt'];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-emerald-800">
          {editingExpense ? 'Muhtelif Gideri Düzenle' : 'Yeni Muhtelif Gider Ekle'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {quickAddItems.map(item => (
              <button 
                type="button" 
                key={item} 
                onClick={() => handleQuickAdd(item)} 
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded-full hover:bg-gray-200 transition-colors min-h-[40px]"
              >
                {item}
              </button>
            ))}
          </div>
          <FormField label="Tarih" id="date" type="date" name="date" value={toInputDateString(formData.date)} onChange={handleChange} required className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 min-h-[48px]" />
          <TextAreaField label="Açıklama" id="description" name="description" value={formData.description} onChange={handleChange} required rows="3" className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3" />
          <FormField label="Gider Tutarı (₺)" id="amount" type="number" inputMode="decimal" name="amount" value={formData.amount} onChange={handleChange} required className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 min-h-[48px]" />
          
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors shadow-sm min-h-[48px]">İptal</button>
            <button type="submit" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-md min-h-[48px]">Kaydet</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MiscellaneousExpenseModal;
