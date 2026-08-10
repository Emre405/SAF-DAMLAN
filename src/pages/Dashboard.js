import React, { useState } from 'react';
import { Plus, Leaf, Droplet, Percent, Coins, DollarSign, AlertCircle, Edit } from 'lucide-react';
import SummaryCard from '../components/SummaryCard';
import FactoryFinancialSummaryCard from '../components/FactoryFinancialSummaryCard';
import { formatNumber, calculateFactorySummary } from '../components/utils';

const Dashboard = ({ 
  customers, 
  transactions, 
  workerExpenses, 
  factoryOverhead, 
  pomaceRevenues, 
  tinPurchases, 
  plasticPurchases, 
  onOpenNewTransactionModal, 
  navigateToCustomerDetails 
}) => {
  const [transactionLimit, setTransactionLimit] = useState(5);

  const totalOlive = transactions.reduce((sum, t) => sum + Number(t.oliveKg || 0), 0);
  const totalProducedOil = transactions.reduce((sum, t) => sum + Number(t.oilLitre || 0), 0);
  const totalReceivedPayment = transactions.reduce((sum, t) => sum + Number(t.paymentReceived || 0), 0);
  const totalBilledAmount = transactions.reduce((sum, t) => sum + Number(t.totalCost || 0), 0);
  const totalPaymentLoss = transactions.reduce((sum, t) => sum + Number(t.paymentLoss || 0), 0);
  const pendingPayments = totalBilledAmount - totalReceivedPayment - totalPaymentLoss;

  const totalFactoryWorkerExpenses = workerExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const totalFactoryOverheadExpenses = factoryOverhead.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const totalFactoryPomaceRevenues = pomaceRevenues.reduce((sum, revenue) => sum + Number(revenue.totalRevenue || 0), 0);
  
  const totalFactoryIncome = totalBilledAmount + totalFactoryPomaceRevenues - totalPaymentLoss;
  const totalFactoryExpenses = totalFactoryWorkerExpenses + totalFactoryOverheadExpenses;

  // Hasılat kalemleri
  const oliveIncome = transactions.reduce((sum, t) => sum + (Number(t.oliveKg || 0) * Number(t.pricePerKg || 0)), 0);
  const tinIncome = transactions.reduce((sum, t) => sum +
    (Number(t.tinCounts?.s16 || 0) * Number(t.tinPrices?.s16 || 0)) +
    (Number(t.tinCounts?.s10 || 0) * Number(t.tinPrices?.s10 || 0)) +
    (Number(t.tinCounts?.s5 || 0) * Number(t.tinPrices?.s5 || 0)), 0);

  const plasticIncome = transactions.reduce((sum, t) => sum +
    (Number(t.plasticCounts?.s10 || 0) * Number(t.plasticPrices?.s10 || 0)) +
    (Number(t.plasticCounts?.s5 || 0) * Number(t.plasticPrices?.s5 || 0)) +
    (Number(t.plasticCounts?.s2 || 0) * Number(t.plasticPrices?.s2 || 0)), 0);

  const totalOlivePressingFee = transactions.reduce((sum, t) => {
    const oliveFee = (Number(t.oliveKg) || 0) * (Number(t.pricePerKg) || 0);
    return sum + oliveFee;
  }, 0);

  const totalOliveAll = transactions.reduce((sum, t) => sum + Number(t.oliveKg || 0), 0);
  const totalOilAll = transactions.reduce((sum, t) => sum + Number(t.oilLitre || 0), 0);
  const overallAvgRatio = totalOliveAll > 0 && totalOilAll > 0 
    ? (totalOliveAll / totalOilAll).toFixed(2) 
    : '-';

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latestTransactions = transactionLimit === 'all' ? sortedTransactions : sortedTransactions.slice(0, Number(transactionLimit));
  
  const getCustomerName = (customerId) => customers.find(c => c.id === customerId)?.name || 'Bilinmeyen Müşteri';

  const factorySummary = calculateFactorySummary({
    transactions,
    workerExpenses,
    factoryOverhead,
    pomaceRevenues,
    tinPurchases,
    plasticPurchases
  });

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Başlık ve Buton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Ana Ekran</h1>
        <button 
          onClick={() => onOpenNewTransactionModal(null)} 
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 shadow-md transition-all duration-200 min-h-[48px]"
        >
          <Plus className="w-5 h-5" />
          <span>İşlem Ekle</span>
        </button>
      </div>

      {/* Özet Kartları */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
        <SummaryCard title="Toplam İşlenen Zeytin" value={formatNumber(totalOlive, ' kg')} icon={<Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-[#556B2F]" />} />
        <SummaryCard title="Toplam Çıkan Yağ" value={formatNumber(totalProducedOil, ' L')} icon={<Droplet className="w-5 h-5 sm:w-6 sm:h-6 text-[#556B2F]" />} />
        <SummaryCard title="Genel Zeytin/Yağ Oranı" value={overallAvgRatio} icon={<Percent className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />} />
        <SummaryCard title="Zeytin Sıkım Ücreti" value={formatNumber(totalOlivePressingFee, ' ₺')} icon={<Coins className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />} />
        
        <SummaryCard
          title="Toplam Hasılat"
          value={formatNumber(totalBilledAmount - totalPaymentLoss, ' ₺')}
          icon={<DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />}
          iconColorClass="text-blue-600"
        >
          <div className="text-[11px] sm:text-xs text-gray-600 flex flex-col gap-0.5 mt-1">
            <div><span className="font-semibold">Zeytin Sıkımı:</span> {formatNumber(oliveIncome, ' ₺')}</div>
            <div><span className="font-semibold">Teneke Satışı:</span> {formatNumber(tinIncome, ' ₺')}</div>
            <div><span className="font-semibold">Bidon Satışı:</span> {formatNumber(plasticIncome, ' ₺')}</div>
          </div>
        </SummaryCard>
        <SummaryCard title="Alınan Ödeme" value={formatNumber(totalReceivedPayment, ' ₺')} icon={<DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-[#556B2F]" />} iconColorClass="text-green-600" />
        <SummaryCard title="Bekleyen Ödemeler" value={formatNumber(pendingPayments, ' ₺')} icon={<AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#556B2F]" />} iconColorClass="text-red-600" />
        <SummaryCard title="Ödeme Firesi" value={formatNumber(totalPaymentLoss, ' ₺')} icon={<Coins className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />} />
      </div>

      {/* Gelir-Gider Kartı */}
      <div className="mt-2">
        <FactoryFinancialSummaryCard summary={factorySummary} />
      </div>

      {/* Son İşlemler Başlığı */}
      <div className="flex items-center justify-between mt-4 mb-2">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Son İşlemler</h2>
        <select 
          value={transactionLimit} 
          onChange={e => setTransactionLimit(e.target.value)} 
          className="border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-h-[40px]"
        >
          <option value={5}>Son 5</option>
          <option value={10}>Son 10</option>
          <option value={20}>Son 20</option>
          <option value="all">Tümü</option>
        </select>
      </div>

      {/* Son İşlemler - Masaüstü Görünümü */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow border">
        <table className="min-w-full bg-white divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Müşteri</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Açıklama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alınan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bakiye</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {latestTransactions.map(t => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(t.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => navigateToCustomerDetails('customerDetails', { id: t.customerId, name: getCustomerName(t.customerId) })} 
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold transition-colors hover:bg-blue-200"
                  >
                    {getCustomerName(t.customerId)}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {t.description ? `${t.description} (${formatNumber(t.oliveKg)} kg zeytin)` : `${formatNumber(t.oliveKg)} kg zeytin`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatNumber(t.totalCost, ' ₺')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600">
                  {formatNumber(t.paymentReceived, ' ₺')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  {formatNumber((t.totalCost || 0) - (t.paymentReceived || 0) - (t.paymentLoss || 0), ' ₺')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => onOpenNewTransactionModal(t)} 
                    className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 hover:text-gray-800 transition-colors"
                    title="İşlemi Düzenle"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Son İşlemler - Mobil Görünümü */}
      <div className="block md:hidden space-y-4">
        {latestTransactions.map(t => {
          const remaining = (t.totalCost || 0) - (t.paymentReceived || 0) - (t.paymentLoss || 0);
          return (
            <div key={t.id} className="bg-white rounded-xl shadow-md border p-4 space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-xs text-gray-500 font-semibold">{new Date(t.date).toLocaleDateString()}</span>
                <button 
                  onClick={() => navigateToCustomerDetails('customerDetails', { id: t.customerId, name: getCustomerName(t.customerId) })} 
                  className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-xs font-bold border border-blue-200 min-h-[30px]"
                >
                  {getCustomerName(t.customerId)}
                </button>
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-semibold text-gray-500">Açıklama:</span> {t.description ? `${t.description} (${formatNumber(t.oliveKg)} kg zeytin)` : `${formatNumber(t.oliveKg)} kg zeytin`}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs border-t pt-2">
                <div>
                  <span className="text-gray-500 block">Tutar</span>
                  <span className="font-bold text-gray-800">{formatNumber(t.totalCost, ' ₺')}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Alınan</span>
                  <span className="font-bold text-emerald-600">{formatNumber(t.paymentReceived, ' ₺')}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Bakiye</span>
                  <span className={`font-bold ${remaining > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatNumber(remaining, ' ₺')}</span>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button 
                  onClick={() => onOpenNewTransactionModal(t)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs min-h-[40px] border"
                >
                  <Edit className="w-4 h-4" />
                  <span>Düzenle</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
