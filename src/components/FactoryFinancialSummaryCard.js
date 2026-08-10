import React from 'react';
import { DollarSign, Info, BarChart2 } from 'lucide-react';
import { formatNumber } from './utils';

const FactoryFinancialSummaryCard = ({ summary }) => {
  if (!summary) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md col-span-full text-center text-gray-500">
        Finansal özet hesaplanıyor...
      </div>
    );
  }
  
  const { 
    totalFactoryIncome, 
    totalFactoryExpenses, 
    netFactoryBalance, 
    totalWorkerExpenses, 
    totalFactoryOverhead, 
    totalPomaceRevenues, 
    totalBilledAmount, 
    totalPaymentLoss, 
    toplamTenekeKalanMaliyet, 
    toplamBidonKalanMaliyet,
    totalTinPurchaseCost,
    totalPlasticPurchaseCost
  } = summary;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md col-span-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-4" style={{ fontSize: '26px', textAlign: 'center' }}>Fabrika Toplam Gelir Gider Özeti</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-emerald-50 p-4 rounded-lg flex flex-col items-center justify-center">
          <DollarSign className="w-8 h-8 text-emerald-600 mb-2" />
          <p className="text-lg font-medium text-gray-700" style={{ fontSize: '22px', color: '#212121' }}>Gelirler Toplamı</p>
          <p className="text-2xl font-bold text-emerald-800">{formatNumber(totalFactoryIncome, '₺')}</p>
          <div className="text-sm text-gray-600 mt-2 text-center space-y-1">
            <p>Toplam Hasılat: {formatNumber(totalBilledAmount, '₺')}</p>
            <p>Pirina Geliri: {formatNumber(totalPomaceRevenues, '₺')}</p>
            <p>Ödeme Firesi: -{formatNumber(totalPaymentLoss, '₺')}</p>
            <p>Kalan Teneke Stok Değeri: {formatNumber(toplamTenekeKalanMaliyet, '₺')}</p>
            <p>Kalan Bidon Stok Değeri: {formatNumber(toplamBidonKalanMaliyet, '₺')}</p>
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg flex flex-col items-center justify-center">
          <Info className="w-8 h-8 text-red-600 mb-2" />
          <p className="text-lg font-medium text-gray-700" style={{ fontSize: '22px', color: '#212121' }}>Giderler Toplamı</p>
          <p className="text-2xl font-bold text-red-800">{formatNumber(totalFactoryExpenses, '₺')}</p>
          <div className="text-sm text-gray-600 mt-2 space-y-1">
            <p>İşçi Giderleri: {formatNumber(totalWorkerExpenses, '₺')}</p>
            <p>Muhtelif Giderler: {formatNumber(totalFactoryOverhead, '₺')}</p>
            <p>Teneke Alımları: {formatNumber(totalTinPurchaseCost, '₺')}</p>
            <p>Bidon Alımları: {formatNumber(totalPlasticPurchaseCost, '₺')}</p>
          </div>
        </div>
        <div className={`p-4 rounded-lg flex flex-col items-center justify-center ${netFactoryBalance >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}> 
          <BarChart2 className={`w-8 h-8 mb-2 ${netFactoryBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
          <p className="text-lg font-medium text-gray-700" style={{ fontSize: '22px', color: '#212121' }}>Net Kar-Zarar</p>
          <p className={`text-2xl font-bold ${netFactoryBalance >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>{formatNumber(netFactoryBalance, '₺')}</p>
        </div>
      </div>
    </div>
  );
};

export default FactoryFinancialSummaryCard;
