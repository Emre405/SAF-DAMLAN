import React, { useState } from 'react';
import { formatNumber } from './utils';

const PaymentCollectionModal = ({ customer, onClose, onSavePayment }) => {
  const [amount, setAmount] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (Number(amount) > 0) {
      onSavePayment(customer.id, customer.name, amount);
      onClose();
    } else {
      alert('Lütfen geçerli bir tutar girin.');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-4">Tahsilat Yap</h2>
        <p className="mb-4">Müşteri: <span className="font-semibold">{customer.name}</span></p>
        <p className="mb-4">Mevcut Bakiye: <span className="font-semibold">{formatNumber(customer.remainingBalance, '₺')}</span></p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-1">Tahsil Edilen Tutar (₺)</label>
            <input 
              type="number" 
              inputMode="decimal"
              id="paymentAmount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Tutar girin" 
              className="w-full border rounded p-3 min-h-[48px]" 
              required 
              autoFocus
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors shadow-sm min-h-[48px]">İptal</button>
            <button type="submit" className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md min-h-[48px]">Tahsil Et</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentCollectionModal;
