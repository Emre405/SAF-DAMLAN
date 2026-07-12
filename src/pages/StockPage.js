import React from 'react';
import { Package } from 'lucide-react';
import { formatNumber } from '../components/utils';

const StockPage = ({ tinPurchases, plasticPurchases, transactions }) => {
  const stock = {
    tin: { s16: { purchased: 0, used: 0 }, s10: { purchased: 0, used: 0 }, s5: { purchased: 0, used: 0 } },
    plastic: { s10: { purchased: 0, used: 0 }, s5: { purchased: 0, used: 0 }, s2: { purchased: 0, used: 0 } },
  };

  tinPurchases.forEach(p => {
    stock.tin.s16.purchased += (Number(p.s16) || 0);
    stock.tin.s10.purchased += (Number(p.s10) || 0);
    stock.tin.s5.purchased += (Number(p.s5) || 0);
  });

  plasticPurchases.forEach(p => {
    stock.plastic.s10.purchased += (Number(p.s10) || 0);
    stock.plastic.s5.purchased += (Number(p.s5) || 0);
    stock.plastic.s2.purchased += (Number(p.s2) || 0);
  });

  transactions.forEach(t => {
    stock.tin.s16.used += (Number(t.tinCounts?.s16) || 0);
    stock.tin.s10.used += (Number(t.tinCounts?.s10) || 0);
    stock.tin.s5.used += (Number(t.tinCounts?.s5) || 0);
    stock.plastic.s10.used += (Number(t.plasticCounts?.s10) || 0);
    stock.plastic.s5.used += (Number(t.plasticCounts?.s5) || 0);
    stock.plastic.s2.used += (Number(t.plasticCounts?.s2) || 0);
  });

  function hesaplaDetayliStokMaliyet(tinPurchases, transactions) {
    let toplamAlinan = { s16: 0, s10: 0, s5: 0 };
    let toplamMaliyet = { s16: 0, s10: 0, s5: 0 };
    tinPurchases.forEach(p => {
      toplamAlinan.s16 += Number(p.s16 || 0);
      toplamAlinan.s10 += Number(p.s10 || 0);
      toplamAlinan.s5 += Number(p.s5 || 0);
      toplamMaliyet.s16 += (Number(p.s16 || 0) * Number(p.tinPrice || 0));
      toplamMaliyet.s10 += (Number(p.s10 || 0) * Number(p.tinPrice || 0));
      toplamMaliyet.s5 += (Number(p.s5 || 0) * Number(p.tinPrice || 0));
    });
    const ortMaliyet = {
      s16: toplamAlinan.s16 > 0 ? toplamMaliyet.s16 / toplamAlinan.s16 : 0,
      s10: toplamAlinan.s10 > 0 ? toplamMaliyet.s10 / toplamAlinan.s10 : 0,
      s5: toplamAlinan.s5 > 0 ? toplamMaliyet.s5 / toplamAlinan.s5 : 0,
    };
    let kullanilan = { s16: 0, s10: 0, s5: 0 };
    transactions.forEach(t => {
      kullanilan.s16 += Number(t.tinCounts?.s16 || 0);
      kullanilan.s10 += Number(t.tinCounts?.s10 || 0);
      kullanilan.s5 += Number(t.tinCounts?.s5 || 0);
    });
    let kalan = {
      s16: toplamAlinan.s16 - kullanilan.s16,
      s10: toplamAlinan.s10 - kullanilan.s10,
      s5: toplamAlinan.s5 - kullanilan.s5,
    };
    return {
      s16: { maliyet_alinan: toplamAlinan.s16 * ortMaliyet.s16, maliyet_kullanilan: kullanilan.s16 * ortMaliyet.s16, maliyet_kalan: kalan.s16 * ortMaliyet.s16 },
      s10: { maliyet_alinan: toplamAlinan.s10 * ortMaliyet.s10, maliyet_kullanilan: kullanilan.s10 * ortMaliyet.s10, maliyet_kalan: kalan.s10 * ortMaliyet.s10 },
      s5: { maliyet_alinan: toplamAlinan.s5 * ortMaliyet.s5, maliyet_kullanilan: kullanilan.s5 * ortMaliyet.s5, maliyet_kalan: kalan.s5 * ortMaliyet.s5 },
    };
  }

  function hesaplaDetayliBidonStokDegeri(plasticPurchases, transactions) {
    let toplamAlinan = { s10: 0, s5: 0, s2: 0 };
    let toplamMaliyet = { s10: 0, s5: 0, s2: 0 };
    plasticPurchases.forEach(p => {
      toplamAlinan.s10 += Number(p.s10 || 0);
      toplamAlinan.s5 += Number(p.s5 || 0);
      toplamAlinan.s2 += Number(p.s2 || 0);
      toplamMaliyet.s10 += (Number(p.s10 || 0) * Number(p.plasticPrice || 0));
      toplamMaliyet.s5 += (Number(p.s5 || 0) * Number(p.plasticPrice || 0));
      toplamMaliyet.s2 += (Number(p.s2 || 0) * Number(p.plasticPrice || 0));
    });
    const ortMaliyet = {
      s10: toplamAlinan.s10 > 0 ? toplamMaliyet.s10 / toplamAlinan.s10 : 0,
      s5: toplamAlinan.s5 > 0 ? toplamMaliyet.s5 / toplamAlinan.s5 : 0,
      s2: toplamAlinan.s2 > 0 ? toplamMaliyet.s2 / toplamAlinan.s2 : 0,
    };
    let kullanilan = { s10: 0, s5: 0, s2: 0 };
    transactions.forEach(t => {
      kullanilan.s10 += Number(t.plasticCounts?.s10 || 0);
      kullanilan.s5 += Number(t.plasticCounts?.s5 || 0);
      kullanilan.s2 += Number(t.plasticCounts?.s2 || 0);
    });
    let kalan = {
      s10: toplamAlinan.s10 - kullanilan.s10,
      s5: toplamAlinan.s5 - kullanilan.s5,
      s2: toplamAlinan.s2 - kullanilan.s2,
    };
    return {
      s10: { maliyet_alinan: toplamAlinan.s10 * ortMaliyet.s10, maliyet_kullanilan: kullanilan.s10 * ortMaliyet.s10, maliyet_kalan: kalan.s10 * ortMaliyet.s10 },
      s5: { maliyet_alinan: toplamAlinan.s5 * ortMaliyet.s5, maliyet_kullanilan: kullanilan.s5 * ortMaliyet.s5, maliyet_kalan: kalan.s5 * ortMaliyet.s5 },
      s2: { maliyet_alinan: toplamAlinan.s2 * ortMaliyet.s2, maliyet_kullanilan: kullanilan.s2 * ortMaliyet.s2, maliyet_kalan: kalan.s2 * ortMaliyet.s2 },
    };
  }

  const detayliStokMaliyet = hesaplaDetayliStokMaliyet(tinPurchases, transactions);
  const detayliBidonStokMaliyet = hesaplaDetayliBidonStokDegeri(plasticPurchases, transactions);

  const toplamTenekeKalanMaliyet = Object.values(detayliStokMaliyet).reduce((sum, v) => sum + (v.maliyet_kalan || 0), 0);
  const toplamBidonKalanMaliyet = Object.values(detayliBidonStokMaliyet).reduce((sum, v) => sum + (v.maliyet_kalan || 0), 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Stok Durumu</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Teneke */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border shadow">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center"><Package className="w-6 h-6 mr-2 text-orange-500" />Teneke Stok Durumu</h2>
          <div className="space-y-6 mt-4">
            {Object.keys(stock.tin).map(size => (
              <div key={size} className="border-b pb-4 last:border-b-0 last:pb-0">
                <h3 className="text-base sm:text-lg font-bold text-gray-700 mb-2">{size.replace('s', "")}'luk Teneke</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-gray-500">Alınan</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-800">{formatNumber(stock.tin[size].purchased)}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatNumber(detayliStokMaliyet[size].maliyet_alinan, ' ₺')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Kullanılan</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-800">{formatNumber(stock.tin[size].used)}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatNumber(detayliStokMaliyet[size].maliyet_kullanilan, ' ₺')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Kalan</p>
                    <p className="text-lg sm:text-xl font-bold text-emerald-600">{formatNumber(stock.tin[size].purchased - stock.tin[size].used)}</p>
                    <p className="text-xs text-gray-600 mt-1 font-semibold">{formatNumber(detayliStokMaliyet[size].maliyet_kalan, ' ₺')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4 flex flex-col items-center justify-center">
            <span className="text-xs font-semibold text-orange-700 mb-1">Toplam Kalan Teneke Stok Değeri</span>
            <span className="text-xl font-bold text-orange-950">{formatNumber(toplamTenekeKalanMaliyet, ' ₺')}</span>
          </div>
        </div>

        {/* Bidon */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border shadow">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center"><Package className="w-6 h-6 mr-2 text-teal-500" />Bidon Stok Durumu</h2>
          <div className="space-y-6 mt-4">
            {Object.keys(stock.plastic).map(size => (
              <div key={size} className="border-b pb-4 last:border-b-0 last:pb-0">
                <h3 className="text-base sm:text-lg font-bold text-gray-700 mb-2">{size.replace('s', "")}'luk Bidon</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-gray-500">Alınan</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-800">{formatNumber(stock.plastic[size].purchased)}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatNumber(detayliBidonStokMaliyet[size].maliyet_alinan, ' ₺')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Kullanılan</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-800">{formatNumber(stock.plastic[size].used)}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatNumber(detayliBidonStokMaliyet[size].maliyet_kullanilan, ' ₺')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Kalan</p>
                    <p className="text-lg sm:text-xl font-bold text-emerald-600">{formatNumber(stock.plastic[size].purchased - stock.plastic[size].used)}</p>
                    <p className="text-xs text-gray-600 mt-1 font-semibold">{formatNumber(detayliBidonStokMaliyet[size].maliyet_kalan, ' ₺')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-teal-50 border border-teal-200 rounded-xl p-4 flex flex-col items-center justify-center">
            <span className="text-xs font-semibold text-teal-700 mb-1">Toplam Kalan Bidon Stok Değeri</span>
            <span className="text-xl font-bold text-teal-950">{formatNumber(toplamBidonKalanMaliyet, ' ₺')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockPage;
