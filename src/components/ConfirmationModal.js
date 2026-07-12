import React from 'react';

const ConfirmationModal = ({ message, onConfirm, onCancel, isLoading }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Onay Gerekli</h3>
      <p className="text-gray-700 mb-6">{message}</p>
      <div className="flex justify-end space-x-3">
        <button onClick={onCancel} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 shadow-sm min-h-[44px]" disabled={isLoading}>İptal</button>
        <button 
          onClick={onConfirm} 
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 shadow-md disabled:opacity-50 disabled:cursor-wait min-h-[44px] flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? 'Siliniyor...' : 'Onayla'}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmationModal;
