import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const ConfirmationModal = ({ message, onConfirm, onCancel, isLoading }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
  >
    <div
      className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
      style={{ animation: 'modalPop 0.22s cubic-bezier(0.34,1.56,0.64,1) both' }}
    >
      {/* Üst kırmızı bant */}
      <div className="bg-red-600 px-6 pt-6 pb-4 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg mb-3">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-white text-xl font-bold tracking-tight">Emin misiniz?</h3>
      </div>

      {/* Mesaj alanı */}
      <div className="px-6 py-5 text-center">
        <p className="text-gray-700 text-sm leading-relaxed">{message}</p>
      </div>

      {/* Butonlar */}
      <div className="flex gap-3 px-6 pb-6">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          İptal
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-60 disabled:cursor-wait"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Siliniyor...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              Evet, Sil
            </>
          )}
        </button>
      </div>
    </div>

    <style>{`
      @keyframes modalPop {
        from { opacity: 0; transform: scale(0.85) translateY(20px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }
    `}</style>
  </div>
);

export default ConfirmationModal;
