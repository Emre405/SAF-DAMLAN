import React from 'react';
import { Package } from 'lucide-react';
import { formatNumber, calculateDetailedTinStatistics, calculateTinProfitLoss } from '../components/utils';

const Statistics = ({ transactions, tinPurchases, plasticPurchases }) => {
  const monthlyStatsMap = transactions.reduce((acc, t) => {
    const date = new Date(t.date);
    const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    if (!acc[monthYear]) {
        acc[monthYear] = { totalOlive: 0, totalOil: 0, transactionCount: 0 };
    }
    acc[monthYear].totalOlive += Number(t.oliveKg || 0);
    acc[monthYear].totalOil += Number(t.oilLitre || 0);
    if (Number(t.oliveKg || 0) > 0) {
      acc[monthYear].transactionCount++;
    }
    return acc;
  }, {});

  const monthlyStats = Object.keys(monthlyStatsMap).map(monthYear => {
    const stats = monthlyStatsMap[monthYear];
    const avgRatio = stats.totalOlive > 0 && stats.totalOil > 0 ? (stats.totalOlive / stats.totalOil) : 0;
    return { monthYear, ...stats, avgRatio };
  }).sort((a, b) => new Date(a.monthYear) - new Date(b.monthYear));

  const totalTinRevenue = transactions.reduce((sum, t) =>
    sum + (Number(t.tinCounts?.s16 || 0) * Number(t.tinPrices?.s16 || 0)) +
          (Number(t.tinCounts?.s10 || 0) * Number(t.tinPrices?.s10 || 0)) +
          (Number(t.tinCounts?.s5 || 0) * Number(t.tinPrices?.s5 || 0)), 0);
  const totalTinPurchaseCost = tinPurchases.reduce((sum, p) => sum + Number(p.totalCost || 0), 0);
  const netTinProfit = totalTinRevenue - totalTinPurchaseCost;

  const totalPlasticRevenue = transactions.reduce((sum, t) => sum + (Number(t.plasticCounts?.s10 || 0) * Number(t.plasticPrices?.s10 || 0)) + (Number(t.plasticCounts?.s5 || 0) * Number(t.plasticPrices?.s5 || 0)) + (Number(t.plasticCounts?.s2 || 0) * Number(t.plasticPrices?.s2 || 0)), 0);
  const totalPlasticPurchaseCost = plasticPurchases.reduce((sum, p) => sum + Number(p.totalCost || 0), 0);
  const netPlasticProfit = totalPlasticRevenue - totalPlasticPurchaseCost;

  const totalOliveAll = transactions.reduce((sum, t) => sum + Number(t.oliveKg || 0), 0);
  const totalOilAll = transactions.reduce((sum, t) => sum + Number(t.oilLitre || 0), 0);
  const overallAvgRatio = totalOliveAll > 0 && totalOilAll > 0 ? (totalOliveAll / totalOilAll).toFixed(2) : '-';

  const detailedTinStats = calculateDetailedTinStatistics(tinPurchases);
  const tinProfitLoss = calculateTinProfitLoss(tinPurchases, transactions);

  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">İstatistikler</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Teneke K/Z */}
        <div className="bg-white p-6 rounded-xl border shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Package className="w-5 h-5 mr-2 text-orange-500" />Teneke Kar/Zarar Durumu</h2>
          <div className="space-y-3">
            <p className="flex justify-between text-sm"><span>Toplam Satış Geliri:</span> <span className="font-bold">{formatNumber(totalTinRevenue, ' ₺')}</span></p>
            <p className="flex justify-between text-sm"><span>Toplam Alım Maliyeti:</span> <span className="font-bold">{formatNumber(totalTinPurchaseCost, ' ₺')}</span></p>
            <p className="flex justify-between text-base border-t pt-2 font-semibold"><span>Net Kar/Zarar:</span> <span className={netTinProfit >= 0 ? 'text-green-600' : 'text-red-600'}>{formatNumber(netTinProfit, ' ₺')}</span></p>
          </div>
        </div>

        {/* Bidon K/Z */}
        <div className="bg-white p-6 rounded-xl border shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Package className="w-5 h-5 mr-2 text-teal-500" />Bidon Kar/Zarar Durumu</h2>
          <div className="space-y-3">
            <p className="flex justify-between text-sm"><span>Toplam Satış Geliri:</span> <span className="font-bold">{formatNumber(totalPlasticRevenue, ' ₺')}</span></p>
            <p className="flex justify-between text-sm"><span>Toplam Alım Maliyeti:</span> <span className="font-bold">{formatNumber(totalPlasticPurchaseCost, ' ₺')}</span></p>
            <p className="flex justify-between text-base border-t pt-2 font-semibold"><span>Net Kar/Zarar:</span> <span className={netPlasticProfit >= 0 ? 'text-green-600' : 'text-red-600'}>{formatNumber(netPlasticProfit, ' ₺')}</span></p>
          </div>
        </div>
      </div>

      {/* Teneke Detaylı İstatistikler */}
      <div className="bg-white p-6 rounded-xl border shadow">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Teneke Alımları Ortalama Fiyat Analizi</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Kap Tipi</th>
                <th className="px-4 py-2 text-left">Alınan Toplam Adet</th>
                <th className="px-4 py-2 text-left">Toplam Maliyet</th>
                <th className="px-4 py-2 text-left">Ortalama Birim Alım Fiyatı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2">16'lık Teneke</td>
                <td className="px-4 py-2 font-semibold">{formatNumber(detailedTinStats.s16.toplam_adet)}</td>
                <td className="px-4 py-2">{formatNumber(detailedTinStats.s16.toplam_maliyet, ' ₺')}</td>
                <td className="px-4 py-2 text-blue-700 font-bold">{formatNumber(detailedTinStats.s16.ortalama_birim_fiyat, ' ₺')}</td>
              </tr>
              <tr>
                <td className="px-4 py-2">10'luk Teneke</td>
                <td className="px-4 py-2 font-semibold">{formatNumber(detailedTinStats.s10.toplam_adet)}</td>
                <td className="px-4 py-2">{formatNumber(detailedTinStats.s10.toplam_maliyet, ' ₺')}</td>
                <td className="px-4 py-2 text-blue-700 font-bold">{formatNumber(detailedTinStats.s10.ortalama_birim_fiyat, ' ₺')}</td>
              </tr>
              <tr>
                <td className="px-4 py-2">5'lik Teneke</td>
                <td className="px-4 py-2 font-semibold">{formatNumber(detailedTinStats.s5.toplam_adet)}</td>
                <td className="px-4 py-2">{formatNumber(detailedTinStats.s5.toplam_maliyet, ' ₺')}</td>
                <td className="px-4 py-2 text-blue-700 font-bold">{formatNumber(detailedTinStats.s5.ortalama_birim_fiyat, ' ₺')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Aylık Çekim Grafiği Tablosu */}
      <div className="bg-white p-6 rounded-xl border shadow">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Aylık Sıkım ve Verim İstatistikleri</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Ay / Yıl</th>
                <th className="px-4 py-2 text-left">Sıkım Sayısı</th>
                <th className="px-4 py-2 text-left">Toplam Zeytin</th>
                <th className="px-4 py-2 text-left">Toplam Yağ</th>
                <th className="px-4 py-2 text-left">Ortalama Verim (Zeytin / Yağ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {monthlyStats.map(stat => (
                <tr key={stat.monthYear}>
                  <td className="px-4 py-2 font-semibold">{stat.monthYear}</td>
                  <td className="px-4 py-2">{stat.transactionCount}</td>
                  <td className="px-4 py-2">{formatNumber(stat.totalOlive, ' kg')}</td>
                  <td className="px-4 py-2">{formatNumber(stat.totalOil, ' L')}</td>
                  <td className="px-4 py-2 text-emerald-700 font-bold">{stat.avgRatio.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="bg-emerald-50 font-bold">
                <td className="px-4 py-2">GENEL TOPLAM</td>
                <td className="px-4 py-2">{transactions.filter(t => Number(t.oliveKg) > 0).length}</td>
                <td className="px-4 py-2">{formatNumber(totalOliveAll, ' kg')}</td>
                <td className="px-4 py-2">{formatNumber(totalOilAll, ' L')}</td>
                <td className="px-4 py-2 text-emerald-800">{overallAvgRatio}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
