import React, { useState } from 'react';
import { ShieldCheck, Database, Download, AlertTriangle, CheckCircle, ArrowRight, Loader } from 'lucide-react';
import { migrateUserDataToSubcollections } from '../services/firestoreService';

const MigrationModal = ({ userId, sourceData, onMigrationComplete, onClose }) => {
  const [step, setStep] = useState('confirm'); // 'confirm', 'migrating', 'success', 'error'
  const [progress, setProgress] = useState({ message: '', percent: 0, step: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [backupDownloaded, setBackupDownloaded] = useState(false);

  const customerCount = (sourceData?.customers || []).length;
  const transactionCount = (sourceData?.transactions || []).length;

  const handleDownloadJson = () => {
    try {
      const tarihDosya = new Date().toISOString().replace('T', '_').replace(/:/g, '-').split('.')[0];
      const blob = new Blob([JSON.stringify(sourceData, null, 2)], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      link.setAttribute('href', URL.createObjectURL(blob));
      link.setAttribute('download', `safdamla_migrasyon_oncesi_tam_yedek_${tarihDosya}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setBackupDownloaded(true);
    } catch (err) {
      console.error('Yedek alma hatası:', err);
      alert('Yedek indirilirken hata oluştu.');
    }
  };

  const handleStartMigration = async () => {
    setStep('migrating');
    try {
      await migrateUserDataToSubcollections(userId, sourceData, (prog) => {
        setProgress(prog);
      });
      setStep('success');
    } catch (error) {
      console.error('Migrasyon hatası:', error);
      setErrorMessage(error.message || 'Bilinmeyen bir hata oluştu');
      setStep('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
        {/* Başlık Çubuğu */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Database className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Veritabanı Güvenlik ve Hız Güncellemesi</h2>
              <p className="text-emerald-100 text-xs mt-0.5">1 MB Limit Koruması & Yüksek Performans</p>
            </div>
          </div>
        </div>

        {/* Gövde */}
        <div className="p-6 space-y-5">
          {step === 'confirm' && (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs sm:text-sm text-amber-900 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Neden bu güncelleme gerekiyor?</p>
                  <p>
                    Firestore tek bir belgede en fazla 1 MB veriye izin verir. Sisteminizde <strong>{customerCount} müşteri</strong> ve <strong>{transactionCount} işlem</strong> bulunmaktadır. Verilerinizin kaybolmaması ve her işlemin anında kaydedilmesi için verileriniz yeni alt-koleksiyon yapısına aktarılacaktır.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs space-y-2">
                <div className="flex items-center text-emerald-700 font-semibold">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  <span>Mevcut eski veriniz silinmez, güvenle korunur.</span>
                </div>
                <div className="flex items-center text-emerald-700 font-semibold">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  <span>Kayıt sayıları (%100) doğrulanır.</span>
                </div>
                <div className="flex items-center text-emerald-700 font-semibold">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  <span>Ekrandaki hiçbir verinizde değişiklik veya kayıp olmaz.</span>
                </div>
              </div>

              {/* Adım 1: Yedek İndir */}
              <div className="border border-blue-100 bg-blue-50/50 rounded-xl p-4">
                <p className="text-xs font-bold text-blue-900 mb-2">1. Güvenlik Önlemi: Ham Veri Yedeği İndirin</p>
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 font-semibold rounded-lg text-xs transition shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>{backupDownloaded ? '✅ Ham Veri Yedeği İndirildi (Tekrar İndir)' : 'Ham Veri Yedeği İndir (.json)'}</span>
                </button>
              </div>

              {/* Adım 2: Aktarımı Başlat */}
              <div className="flex gap-3 pt-2">
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition"
                  >
                    Daha Sonra
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleStartMigration}
                  className="flex-[2] py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition shadow-md flex items-center justify-center gap-2"
                >
                  <span>Aktarımı Başlat</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {step === 'migrating' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-pulse">
                <Loader className="w-8 h-8 animate-spin" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Verileriniz Güvenle Aktarılıyor...</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Lütfen bu işlem devam ederken sayfayı kapatmayın veya yenilemeyin.
              </p>

              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden border">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress.percent}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-xs text-gray-600 px-1 font-mono">
                <span>{progress.message || 'Aktarılıyor...'}</span>
                <span className="font-bold">%{progress.percent}</span>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="font-bold text-emerald-800 text-xl">Aktarım Başarıyla Tamamlandı!</h3>
              <p className="text-xs text-gray-600 max-w-md mx-auto">
                Tüm müşterileriniz ve işlemleriniz yeni alt-koleksiyon mimarisine aktarıldı. 1 MB limit sorunu kalıcı olarak çözüldü. Artık yapacağınız her işlem anında güvenle veritabanına yazılacaktır.
              </p>

              <button
                type="button"
                onClick={() => {
                  if (onMigrationComplete) onMigrationComplete();
                }}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition shadow-md"
              >
                Uygulamayı Kullanmaya Devam Et
              </button>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="font-bold text-red-800 text-lg">Aktarım Sırasında Bir Hata Oluştu</h3>
              <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                {errorMessage}
              </p>
              <p className="text-xs text-gray-500">
                Endişelenmeyin! Eski verileriniz olduğu gibi durmaktadır. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('confirm')}
                  className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold text-sm transition"
                >
                  Tekrar Dene
                </button>
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition"
                  >
                    Kapat
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MigrationModal;
