import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import WorkerExpenseModal from '../components/WorkerExpenseModal';
import MiscellaneousExpenseModal from '../components/MiscellaneousExpenseModal';
import PomaceRevenueModal from '../components/PomaceRevenueModal';
import TinPurchaseModal from '../components/TinPurchaseModal';
import PlasticPurchaseModal from '../components/PlasticPurchaseModal';
import { formatNumber } from '../components/utils';

const FactoryExpenses = ({ 
  workerExpenses, 
  factoryOverhead, 
  pomaceRevenues, 
  tinPurchases, 
  plasticPurchases, 
  onSaveWorkerExpense, 
  onSaveFactoryOverhead, 
  onSavePomaceRevenue, 
  onSaveTinPurchase, 
  onSavePlasticPurchase, 
  onDeleteItem, 
  isOnline, 
  showMessage, 
  setPendingSync 
}) => {
  const [showWorkerExpenseModal, setShowWorkerExpenseModal] = useState(false);
  const [editingWorkerExpense, setEditingWorkerExpense] = useState(null);
  const [showMiscellaneousExpenseModal, setShowMiscellaneousExpenseModal] = useState(false);
  const [editingMiscellaneousExpense, setEditingMiscellaneousExpense] = useState(null);
  const [showPomaceRevenueModal, setShowPomaceRevenueModal] = useState(false);
  const [editingPomaceRevenue, setEditingPomaceRevenue] = useState(null);
  const [showTinPurchaseModal, setShowTinPurchaseModal] = useState(false);
  const [editingTinPurchase, setEditingTinPurchase] = useState(null);
  const [showPlasticPurchaseModal, setShowPlasticPurchaseModal] = useState(false);
  const [editingPlasticPurchase, setEditingPlasticPurchase] = useState(null);

  const handleOpenModal = (type, item = null) => {
    if (type === 'worker') { setEditingWorkerExpense(item); setShowWorkerExpenseModal(true); }
    if (type === 'overhead') { setEditingMiscellaneousExpense(item); setShowMiscellaneousExpenseModal(true); }
    if (type === 'pomace') { setEditingPomaceRevenue(item); setShowPomaceRevenueModal(true); }
    if (type === 'tin') { setEditingTinPurchase(item); setShowTinPurchaseModal(true); }
    if (type === 'plastic') { setEditingPlasticPurchase(item); setShowPlasticPurchaseModal(true); }
  };

  const handleCloseModals = () => {
    setShowWorkerExpenseModal(false); setEditingWorkerExpense(null);
    setShowMiscellaneousExpenseModal(false); setEditingMiscellaneousExpense(null);
    setShowPomaceRevenueModal(false); setEditingPomaceRevenue(null);
    setShowTinPurchaseModal(false); setEditingTinPurchase(null);
    setShowPlasticPurchaseModal(false); setEditingPlasticPurchase(null);
  };

  const handleSaveAndClose = async (type, data) => {
    try {
      if (!isOnline) {
        handleCloseModals();
        if (typeof setPendingSync === 'function') {
          setPendingSync(prev => [...prev, {
            id: Date.now().toString(),
            type: type,
            data: data,
            timestamp: new Date().toISOString()
          }]);
        }
        showMessage('📱 Offline kaydedildi, internet bağlandığında senkronize edilecek', 'success');
        return;
      }
      
      if (type === 'worker') await onSaveWorkerExpense(data);
      if (type === 'overhead') await onSaveFactoryOverhead(data);
      if (type === 'pomace') await onSavePomaceRevenue(data);
      if (type === 'tin') await onSaveTinPurchase(data);
      if (type === 'plastic') await onSavePlasticPurchase(data);
      
      handleCloseModals();
      showMessage('✅ Başarıyla kaydedildi ve senkronize edildi', 'success');
      
    } catch (error) {
      console.error('Save error:', error);
      showMessage('❌ Kayıt sırasında hata oluştu: ' + error.message, 'error');
      handleCloseModals();
    }
  };

  const formatTinDetails = (item) => {
    const parts = [];
    if (item.s16 && Number(item.s16) > 0) parts.push(`${formatNumber(item.s16)} Adet 16'lık`);
    if (item.s10 && Number(item.s10) > 0) parts.push(`${formatNumber(item.s10)} Adet 10'luk`);
    if (item.s5 && Number(item.s5) > 0) parts.push(`${formatNumber(item.s5)} Adet 5'lik`);
    return parts.length > 0 ? parts.join(', ') : '-';
  };

  const formatPlasticDetails = (item) => {
    const parts = [];
    if (item.s10 && Number(item.s10) > 0) parts.push(`${formatNumber(item.s10)} Adet 10'luk`);
    if (item.s5 && Number(item.s5) > 0) parts.push(`${formatNumber(item.s5)} Adet 5'lik`);
    if (item.s2 && Number(item.s2) > 0) parts.push(`${formatNumber(item.s2)} Adet 2'lik`);
    return parts.length > 0 ? parts.join(', ') : '-';
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Giderler ve Diğer Gelirler</h1>
      
      <ExpenseTable title="İşçi Harcamaları" data={workerExpenses} onAddItem={() => handleOpenModal('worker')} onEditItem={(item) => handleOpenModal('worker', item)} onDeleteItem={(id) => onDeleteItem('workerExpenses', id)} columns={['Tarih', 'İşçi Adı', 'Çalıştığı Gün', 'Verilen Ücret', 'Açıklama']} fields={['date', 'workerName', 'daysWorked', 'amount', 'description']} />
      <ExpenseTable title="Muhtelif Giderler" data={factoryOverhead} onAddItem={() => handleOpenModal('overhead')} onEditItem={(item) => handleOpenModal('overhead', item)} onDeleteItem={(id) => onDeleteItem('factoryOverhead', id)} columns={['Tarih', 'Açıklama', 'Gider Tutarı']} fields={['date', 'description', 'amount']} />
      
      <ExpenseTable 
        title="Teneke Alımları" 
        data={tinPurchases} 
        onAddItem={() => handleOpenModal('tin')} 
        onEditItem={(item) => handleOpenModal('tin', item)} 
        onDeleteItem={(id) => onDeleteItem('tinPurchases', id)} 
        columns={['Tarih', 'Alınan Teneke', 'Toplam Maliyet', 'Açıklama']} 
        customRowRenderer={(item) => [
          { label: 'Tarih', value: item.date ? new Date(item.date).toLocaleDateString() : '-' },
          { label: 'Alınan Teneke', value: formatTinDetails(item), className: 'font-semibold text-emerald-800' },
          { label: 'Toplam Maliyet', value: formatNumber(item.totalCost, ' ₺'), className: 'font-bold text-red-600' },
          { label: 'Açıklama', value: item.description || '-' }
        ]}
      />
      
      <ExpenseTable 
        title="Bidon Alımları" 
        data={plasticPurchases} 
        onAddItem={() => handleOpenModal('plastic')} 
        onEditItem={(item) => handleOpenModal('plastic', item)} 
        onDeleteItem={(id) => onDeleteItem('plasticPurchases', id)} 
        columns={['Tarih', 'Alınan Bidon', 'Toplam Maliyet', 'Açıklama']} 
        customRowRenderer={(item) => [
          { label: 'Tarih', value: item.date ? new Date(item.date).toLocaleDateString() : '-' },
          { label: 'Alınan Bidon', value: formatPlasticDetails(item), className: 'font-semibold text-teal-800' },
          { label: 'Toplam Maliyet', value: formatNumber(item.totalCost, ' ₺'), className: 'font-bold text-red-600' },
          { label: 'Açıklama', value: item.description || '-' }
        ]}
      />
      
      <ExpenseTable title="Pirina Geliri" data={pomaceRevenues} onAddItem={() => handleOpenModal('pomace')} onEditItem={(item) => handleOpenModal('pomace', item)} onDeleteItem={(id) => onDeleteItem('pomaceRevenues', id)} columns={['Tarih', 'Tır Sayısı', 'Toplam Yük (kg)', 'Kg Ücreti', 'Toplam Gelir', 'Açıklama']} fields={['date', 'truckCount', 'loadKg', 'pricePerKg', 'totalRevenue', 'description']} />

      {showWorkerExpenseModal && <WorkerExpenseModal onClose={handleCloseModals} onSave={(data) => handleSaveAndClose('worker', data)} editingExpense={editingWorkerExpense} />}
      {showMiscellaneousExpenseModal && <MiscellaneousExpenseModal onClose={handleCloseModals} onSave={(data) => handleSaveAndClose('overhead', data)} editingExpense={editingMiscellaneousExpense} />}
      {showPomaceRevenueModal && <PomaceRevenueModal onClose={handleCloseModals} onSave={(data) => handleSaveAndClose('pomace', data)} editingRevenue={editingPomaceRevenue} />}
      {showTinPurchaseModal && <TinPurchaseModal onClose={handleCloseModals} onSave={(data) => handleSaveAndClose('tin', data)} editingPurchase={editingTinPurchase} />}
      {showPlasticPurchaseModal && <PlasticPurchaseModal onClose={handleCloseModals} onSave={(data) => handleSaveAndClose('plastic', data)} editingPurchase={editingPlasticPurchase} />}
    </div>
  );
};

const ExpenseTable = ({ title, data, onAddItem, onEditItem, onDeleteItem, columns, fields, customRowRenderer }) => {
  const [limit, setLimit] = useState(5);
  const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
  const limitedData = limit === 'all' ? sortedData : sortedData.slice(0, Number(limit));

  const getRowCells = (item) => {
    if (customRowRenderer) return customRowRenderer(item);
    return fields.map((field, idx) => {
      let val = item[field];
      if (field === 'date') val = val ? new Date(val).toLocaleDateString() : '-';
      else if (typeof val === 'number') {
        const isCurrency = field.toLowerCase().includes('fiyat') || field.toLowerCase().includes('maliyet') || field.toLowerCase().includes('gelir') || field.toLowerCase().includes('ücret') || field.toLowerCase().includes('tutar') || field.toLowerCase().includes('amount') || field.toLowerCase().includes('price') || field.toLowerCase().includes('revenue') || field.toLowerCase().includes('cost');
        val = formatNumber(val, isCurrency ? ' ₺' : '');
      } else {
        val = val || '-';
      }
      return { label: columns[idx], value: val };
    });
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">{title}</h2>
        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
          <select 
            value={limit} 
            onChange={(e) => setLimit(e.target.value)} 
            className="border rounded-lg px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 min-h-[40px] bg-white"
          >
            <option value={5}>Son 5</option>
            <option value={10}>Son 10</option>
            <option value={25}>Son 25</option>
            <option value="all">Tümü</option>
          </select>
          <button 
            onClick={onAddItem} 
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>Ekle</span>
          </button>
        </div>
      </div>
      
      {data.length === 0 ? (
        <p className="text-gray-500 text-sm">Henüz kayıt bulunmamaktadır.</p>
      ) : (
        <>
          {/* MASAÜSTÜ TABLOSU */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map(col => <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{col}</th>)}
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {limitedData.map(item => {
                  const cells = getRowCells(item);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      {cells.map((cell, i) => (
                        <td key={i} className={`px-6 py-4 whitespace-nowrap ${cell.className || ''}`}>
                          {cell.value}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => onEditItem(item)} className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 hover:text-gray-800 transition-colors mr-2" title="Düzenle">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDeleteItem(item.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Sil">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBİL KART LİSTESİ */}
          <div className="block md:hidden space-y-3">
            {limitedData.map(item => {
              const cells = getRowCells(item);
              return (
                <div key={item.id} className="border rounded-xl p-4 shadow-sm bg-white space-y-2">
                  {cells.map((cell, idx) => (
                    <div key={idx} className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-400 font-semibold">{cell.label}:</span>
                      <span className={`font-bold ${cell.className || 'text-gray-800'}`}>{cell.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-end gap-2 border-t pt-2 mt-2">
                    <button 
                      onClick={() => onEditItem(item)} 
                      className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 border rounded-lg text-xs min-h-[36px]"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Düzenle</span>
                    </button>
                    <button 
                      onClick={() => onDeleteItem(item.id)} 
                      className="flex items-center space-x-1 px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-xs min-h-[36px]"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Sil</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default FactoryExpenses;
