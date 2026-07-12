import React from 'react';
import { Download } from 'lucide-react';
import { formatNumber } from '../components/utils';

const BackupPage = ({ 
  customers, 
  transactions, 
  workerExpenses, 
  factoryOverhead, 
  pomaceRevenues, 
  tinPurchases, 
  plasticPurchases, 
  oilPurchases, 
  oilSales, 
  readUserData 
}) => {
  const handleDownloadTxt = async () => {
    try {
      const allData = await readUserData();

      const totalOlive = allData.transactions.reduce((sum, t) => sum + Number(t.oliveKg || 0), 0);
      const totalProducedOil = allData.transactions.reduce((sum, t) => sum + Number(t.oilLitre || 0), 0);
      const totalBilledAmount = allData.transactions.reduce((sum, t) => sum + Number(t.totalCost || 0), 0);
      const totalReceivedPayment = allData.transactions.reduce((sum, t) => sum + Number(t.paymentReceived || 0), 0);
      const totalPaymentLoss = allData.transactions.reduce((sum, t) => sum + Number(t.paymentLoss || 0), 0);
      const pendingPayments = totalBilledAmount - totalReceivedPayment - totalPaymentLoss;

      const totalFactoryWorkerExpenses = allData.workerExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
      const totalFactoryOverheadExpenses = allData.factoryOverhead.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
      const totalFactoryPomaceRevenues = allData.pomaceRevenues.reduce((sum, revenue) => sum + Number(revenue.totalRevenue || 0), 0);
      const totalTinPurchaseCost = allData.tinPurchases.reduce((sum, p) => sum + Number(p.totalCost || 0), 0);
      const totalPlasticPurchaseCost = allData.plasticPurchases.reduce((sum, p) => sum + Number(p.totalCost || 0), 0);

      const totalFactoryExpenses = totalFactoryWorkerExpenses + totalFactoryOverheadExpenses + totalTinPurchaseCost + totalPlasticPurchaseCost;
      const totalFactoryIncome = (totalBilledAmount - totalPaymentLoss) + totalFactoryPomaceRevenues;

      // Stok maliyetleri
      function hesaplaDetayliStokDegeri(tinPurchases, transactions) {
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
          s16: { maliyet_kalan: kalan.s16 * ortMaliyet.s16 },
          s10: { maliyet_kalan: kalan.s10 * ortMaliyet.s10 },
          s5: { maliyet_kalan: kalan.s5 * ortMaliyet.s5 },
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
          s10: { maliyet_kalan: kalan.s10 * ortMaliyet.s10 },
          s5: { maliyet_kalan: kalan.s5 * ortMaliyet.s5 },
          s2: { maliyet_kalan: kalan.s2 * ortMaliyet.s2 },
        };
      }

      const detayliStokMaliyet = hesaplaDetayliStokDegeri(allData.tinPurchases || [], allData.transactions || []);
      const detayliBidonStokMaliyet = hesaplaDetayliBidonStokDegeri(allData.plasticPurchases || [], allData.transactions || []);
      const toplamTenekeKalanMaliyet = Object.values(detayliStokMaliyet).reduce((sum, v) => sum + (v.maliyet_kalan || 0), 0);
      const toplamBidonKalanMaliyet = Object.values(detayliBidonStokMaliyet).reduce((sum, v) => sum + (v.maliyet_kalan || 0), 0);

      let fileContent = `SAF DAMLA ZEYTİNYAĞI FABRİKASI - YEDEK DOSYASI\n`;
      fileContent += `Yedekleme Tarihi: ${new Date().toLocaleString('tr-TR')}\n`;
      fileContent += `==================================================\n\n`;

      const toplamGelirKart = (totalBilledAmount - totalPaymentLoss) + totalFactoryPomaceRevenues + toplamTenekeKalanMaliyet + toplamBidonKalanMaliyet;
      fileContent += `==================================================\n`;
      fileContent += `--- FABRİKA GENEL ÖZETİ ---\n`;
      fileContent += `Toplam Gelir: ${formatNumber(toplamGelirKart, '₺')}\n`;
      fileContent += `Toplam Gider: ${formatNumber(totalFactoryExpenses, '₺')}\n`;
      fileContent += `Net Kâr/Zarar: ${formatNumber(toplamGelirKart - totalFactoryExpenses, '₺')}\n`;
      fileContent += `Kalan Teneke Stok Değeri: ${formatNumber(toplamTenekeKalanMaliyet, '₺')}\n`;
      fileContent += `Kalan Bidon Stok Değeri: ${formatNumber(toplamBidonKalanMaliyet, '₺')}\n`;
      fileContent += `\n`;

      const oliveIncome = allData.transactions.reduce((sum, t) => sum + (Number(t.oliveKg || 0) * Number(t.pricePerKg || 0)), 0);
      const tinIncome = allData.transactions.reduce((sum, t) =>
        sum + (Number(t.tinCounts?.s16 || 0) * Number(t.tinPrices?.s16 || 0))
            + (Number(t.tinCounts?.s10 || 0) * Number(t.tinPrices?.s10 || 0))
            + (Number(t.tinCounts?.s5 || 0) * Number(t.tinPrices?.s5 || 0)), 0);
      const plasticIncome = allData.transactions.reduce((sum, t) =>
        sum + (Number(t.plasticCounts?.s10 || 0) * Number(t.plasticPrices?.s10 || 0))
            + (Number(t.plasticCounts?.s5 || 0) * Number(t.plasticPrices?.s5 || 0))
            + (Number(t.plasticCounts?.s2 || 0) * Number(t.plasticPrices?.s2 || 0)), 0);
      const toplamHasılat = oliveIncome + tinIncome + plasticIncome;
      fileContent += `==================================================\n`;
      fileContent += `--- ZEYTİN ÇEKİM ÜCRETLERİ ---\n`;
      fileContent += `Zeytin Sıkımı Hasılatı: ${formatNumber(oliveIncome, '₺')}\n`;
      fileContent += `Teneke Satışı Hasılatı: ${formatNumber(tinIncome, '₺')}\n`;
      fileContent += `Bidon Satışı Hasılatı: ${formatNumber(plasticIncome, '₺')}\n`;
      fileContent += `Toplam Hasılat: ${formatNumber(toplamHasılat - totalPaymentLoss, '₺')}\n`;
      fileContent += `Toplam Alınan Ödeme: ${formatNumber(totalReceivedPayment, '₺')}\n`;
      fileContent += `Bekleyen Ödemeler: ${formatNumber(pendingPayments, '₺')}\n`;
      fileContent += `Ödeme Firesi: ${formatNumber(totalPaymentLoss, '₺')}\n`;
      fileContent += `\n`;

      // Zeytinyağı alım satım özeti
      const toplamOilPurchaseCost = (allData.oilPurchases || []).reduce((sum, p) => sum + Number(p.totalCost || 0), 0);
      const toplamOilSaleRevenue = (allData.oilSales || []).reduce((sum, s) => sum + Number(s.totalRevenue || 0), 0);
      const toplamAlinanOilTins = (allData.oilPurchases || []).reduce((sum, p) => sum + Number(p.tinCount || 0), 0);
      const toplamSatilanOilTins = (allData.oilSales || []).reduce((sum, s) => sum + Number(s.tinCount || 0), 0);
      const kalanOilTins = toplamAlinanOilTins - toplamSatilanOilTins;
      const netOilProfit = toplamOilSaleRevenue - toplamOilPurchaseCost;
      fileContent += `==================================================\n`;
      fileContent += `--- ZEYTİNYAĞI ALIM/SATIM ÖZETİ ---\n`;
      fileContent += `Toplam Alım Maliyeti: ${formatNumber(toplamOilPurchaseCost, '₺')}\n`;
      fileContent += `Toplam Satış Geliri: ${formatNumber(toplamOilSaleRevenue, '₺')}\n`;
      fileContent += `Kalan Net Teneke Stoğu: ${formatNumber(kalanOilTins, 'adet')}\n`;
      fileContent += `Net Kâr/Zarar: ${formatNumber(netOilProfit, '₺')}\n`;
      fileContent += `\n`;

      fileContent += `==================================================\n`;
      fileContent += `--- ZEYTİNYAĞI ALIMLARI (${(allData.oilPurchases || []).length} adet) ---\n`;
      (allData.oilPurchases || []).forEach(e => {
          fileContent += `Tarih: ${new Date(e.date).toLocaleDateString('tr-TR')}, Firma: ${e.supplierName}, Teneke Sayısı: ${e.tinCount}, Teneke Fiyatı: ${formatNumber(e.tinPrice, '₺')}, Toplam Maliyet: ${formatNumber(e.totalCost, '₺')}\n`;
      });
      fileContent += `\n`;
      fileContent += `==================================================\n`;
      fileContent += `--- ZEYTİNYAĞI SATIŞLARI (${(allData.oilSales || []).length} adet) ---\n`;
      (allData.oilSales || []).forEach(e => {
          fileContent += `Tarih: ${new Date(e.date).toLocaleDateString('tr-TR')}, Müşteri: ${e.customerName}, Teneke Sayısı: ${e.tinCount}, Teneke Fiyatı: ${formatNumber(e.tinPrice, '₺')}, Toplam Gelir: ${formatNumber(e.totalRevenue, '₺')}\n`;
      });
      fileContent += `\n`;

      // Giderler
      fileContent += `==================================================\n`;
      fileContent += `--- İŞÇİ GİDERLERİ (${allData.workerExpenses.length} adet) ---\n`;
      allData.workerExpenses.forEach(e => {
          fileContent += `Tarih: ${new Date(e.date).toLocaleDateString('tr-TR')}, İsim: ${e.workerName}, Çalıştığı Gün: ${e.daysWorked}, Tutar: ${formatNumber(e.amount, '₺')}, Açıklama: ${e.description}\n`;
      });
      fileContent += `\n`;
      fileContent += `==================================================\n`;
      fileContent += `--- MUHTELİF GİDERLER (${allData.factoryOverhead.length} adet) ---\n`;
      allData.factoryOverhead.forEach(e => {
          fileContent += `Tarih: ${new Date(e.date).toLocaleDateString('tr-TR')}, Açıklama: ${e.description}, Tutar: ${formatNumber(e.amount, '₺')}\n`;
      });
      fileContent += `\n`;
      fileContent += `==================================================\n`;
      fileContent += `--- TENEKE ALIMLARI (${allData.tinPurchases.length} adet) ---\n`;
      allData.tinPurchases.forEach(e => {
          fileContent += `Tarih: ${new Date(e.date).toLocaleDateString('tr-TR')}, 16'lık: ${e.s16 || 0}, 10'luk: ${e.s10 || 0}, 5'lik: ${e.s5 || 0}, Birim Fiyat: ${formatNumber(e.tinPrice, '₺')}, Toplam Maliyet: ${formatNumber(e.totalCost, '₺')}, Açıklama: ${e.description}\n`;
      });
      fileContent += `\n`;
      fileContent += `==================================================\n`;
      fileContent += `--- BİDON ALIMLARI (${allData.plasticPurchases.length} adet) ---\n`;
      allData.plasticPurchases.forEach(e => {
          fileContent += `Tarih: ${new Date(e.date).toLocaleDateString('tr-TR')}, 10'luk: ${e.s10 || 0}, 5'lik: ${e.s5 || 0}, 2'lik: ${e.s2 || 0}, Birim Fiyat: ${formatNumber(e.plasticPrice, '₺')}, Toplam Maliyet: ${formatNumber(e.totalCost, '₺')}, Açıklama: ${e.description}\n`;
      });
      fileContent += `\n`;
      fileContent += `==================================================\n`;
      fileContent += `--- PİRİNA GELİRLERİ (${allData.pomaceRevenues.length} adet) ---\n`;
      allData.pomaceRevenues.forEach(e => {
          fileContent += `Tarih: ${new Date(e.date).toLocaleDateString('tr-TR')}, Açıklama: ${e.description}, Tır Sayısı: ${e.truckCount}, Yük: ${e.loadKg} kg, Kg Fiyatı: ${e.pricePerKg} ₺, Toplam Gelir: ${formatNumber(e.totalRevenue, '₺')}\n`;
      });
      fileContent += `\n`;

      function kalanTenekeAdetleri(tinPurchases, transactions) {
        let alinan = { s16: 0, s10: 0, s5: 0 };
        let kullanilan = { s16: 0, s10: 0, s5: 0 };
        tinPurchases.forEach(p => {
          alinan.s16 += Number(p.s16 || 0);
          alinan.s10 += Number(p.s10 || 0);
          alinan.s5 += Number(p.s5 || 0);
        });
        transactions.forEach(t => {
          kullanilan.s16 += Number(t.tinCounts?.s16 || 0);
          kullanilan.s10 += Number(t.tinCounts?.s10 || 0);
          kullanilan.s5 += Number(t.tinCounts?.s5 || 0);
        });
        return { s16: alinan.s16 - kullanilan.s16, s10: alinan.s10 - kullanilan.s10, s5: alinan.s5 - kullanilan.s5 };
      }

      function kalanBidonAdetleri(plasticPurchases, transactions) {
        let alinan = { s10: 0, s5: 0, s2: 0 };
        let kullanilan = { s10: 0, s5: 0, s2: 0 };
        plasticPurchases.forEach(p => {
          alinan.s10 += Number(p.s10 || 0);
          alinan.s5 += Number(p.s5 || 0);
          alinan.s2 += Number(p.s2 || 0);
        });
        transactions.forEach(t => {
          kullanilan.s10 += Number(t.plasticCounts?.s10 || 0);
          kullanilan.s5 += Number(t.plasticCounts?.s5 || 0);
          kullanilan.s2 += Number(t.plasticCounts?.s2 || 0);
        });
        return { s10: alinan.s10 - kullanilan.s10, s5: alinan.s5 - kullanilan.s5, s2: alinan.s2 - kullanilan.s2 };
      }

      fileContent += `==================================================\n`;
      fileContent += `--- TENEKE/BİDON STOKLARI ---\n`;
      const kalanTeneke = kalanTenekeAdetleri(allData.tinPurchases || [], allData.transactions || []);
      const kalanBidon = kalanBidonAdetleri(allData.plasticPurchases || [], allData.transactions || []);
      fileContent += `Kalan Teneke Stokları:\n`;
      fileContent += `  16'lık: ${kalanTeneke.s16} adet\n`;
      fileContent += `  10'luk: ${kalanTeneke.s10} adet\n`;
      fileContent += `  5'lik: ${kalanTeneke.s5} adet\n`;
      fileContent += `Kalan Bidon Stokları:\n`;
      fileContent += `  10'luk: ${kalanBidon.s10} adet\n`;
      fileContent += `  5'lik: ${kalanBidon.s5} adet\n`;
      fileContent += `  2'lik: ${kalanBidon.s2} adet\n`;
      fileContent += `\n`;

      fileContent += `==================================================\n`;
      fileContent += `--- MÜŞTERİ KAYITLARI (Sadece Borçlu Müşteriler) ---\n`;
      const debtors = customers.filter(c => {
        const customerTransactions = allData.transactions.filter(t => t.customerId === c.id);
        const totalDebt = customerTransactions.reduce((sum, t) => sum + (Number(t.totalCost || 0) - Number(t.paymentReceived || 0) - Number(t.paymentLoss || 0)), 0);
        return totalDebt > 0;
      });
      debtors.forEach(c => {
        const customerTransactions = allData.transactions.filter(t => t.customerId === c.id);
        fileContent += `\n*** Müşteri Adı: ${c.name} ***\n`;
        fileContent += `  > İşlem Geçmişi:\n`;
        if (customerTransactions.length > 0) {
          customerTransactions.forEach(t => {
            const description = t.description ? `${t.description} (${formatNumber(t.oliveKg)} kg zeytin)` : `${formatNumber(t.oliveKg)} kg zeytin`;
            const remaining = (t.totalCost || 0) - (t.paymentReceived || 0) - (t.paymentLoss || 0);
            fileContent += `    - Tarih: ${new Date(t.date).toLocaleDateString()}, Açıklama: ${description}, Tutar: ${formatNumber(t.totalCost, '₺')}, Alınan: ${formatNumber(t.paymentReceived, '₺')}, Kalan: ${formatNumber(remaining, '₺')}\n`;
          });
        } else {
          fileContent += `    (Bu müşteriye ait işlem bulunmamaktadır.)\n`;
        }
      });
      fileContent += `\n`;

      const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `safdamla_yedek_${new Date().toISOString().split('T')[0]}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Yedekleme dosyası oluşturulurken hata oluştu:", err);
      alert("Yedekleme dosyası oluşturulurken bir hata oluştu. Lütfen konsolu kontrol edin.");
    }
  };

  const handleDownloadNonDebtorsTxt = async () => {
    try {
      const allData = await readUserData();
      let fileContent = `SAF DAMLA ZEYTİNYAĞI FABRİKASI - BORÇSUZ MÜŞTERİLER YEDEK DOSYASI\n`;
      fileContent += `Yedekleme Tarihi: ${new Date().toLocaleString('tr-TR')}\n`;
      fileContent += `==================================================\n\n`;
      fileContent += `--- MÜŞTERİ KAYITLARI (Sadece Borçsuz Müşteriler) ---\n`;
      
      const nonDebtors = customers.filter(c => {
        const customerTransactions = allData.transactions.filter(t => t.customerId === c.id);
        const totalDebt = customerTransactions.reduce((sum, t) => sum + (Number(t.totalCost || 0) - Number(t.paymentReceived || 0) - Number(t.paymentLoss || 0)), 0);
        return totalDebt <= 0;
      });
      nonDebtors.forEach(c => {
        const customerTransactions = allData.transactions.filter(t => t.customerId === c.id);
        fileContent += `\n*** Müşteri Adı: ${c.name} ***\n`;
        fileContent += `  > İşlem Geçmişi:\n`;
        if (customerTransactions.length > 0) {
          customerTransactions.forEach(t => {
            const description = t.description ? `${t.description} (${formatNumber(t.oliveKg)} kg zeytin)` : `${formatNumber(t.oliveKg)} kg zeytin`;
            const remaining = (t.totalCost || 0) - (t.paymentReceived || 0) - (t.paymentLoss || 0);
            fileContent += `    - Tarih: ${new Date(t.date).toLocaleDateString()}, Açıklama: ${description}, Tutar: ${formatNumber(t.totalCost, '₺')}, Alınan: ${formatNumber(t.paymentReceived, '₺')}, Kalan: ${formatNumber(remaining, '₺')}\n`;
          });
        } else {
          fileContent += `    (Bu müşteriye ait işlem bulunmamaktadır.)\n`;
        }
      });
      fileContent += `\n`;
      
      const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `safdamla_borcsuz_musteriler_${new Date().toISOString().split('T')[0]}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Borçsuz müşteriler dosyası oluşturulurken hata oluştu:", err);
      alert("Borçsuz müşteriler dosyası oluşturulurken bir hata oluştu. Lütfen konsolu kontrol edin.");
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Veri Yedekleme</h1>
      <div className="bg-white p-4 sm:p-6 rounded-xl border shadow space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Metin Dosyası (.txt) Olarak İndir</h2>
        <p className="text-sm text-gray-600">
          Sistemde kayıtlı olan tüm verileri (giderler, teneke/bidon stokları, borçlu/borçsuz müşteri kartları ve detaylı sıkım kayıtları) kolayca okunabilir bir .txt dosyası olarak bilgisayarınıza veya telefonunuza indirir.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button 
            onClick={handleDownloadTxt} 
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md transition-colors min-h-[48px] text-sm w-full sm:w-auto"
          >
            <Download className="w-5 h-5" />
            <span>Yedek Dosyasını İndir (.txt)</span>
          </button>
          <button 
            onClick={handleDownloadNonDebtorsTxt}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-colors min-h-[48px] text-sm w-full sm:w-auto"
          >
            <Download className="w-5 h-5" />
            <span>Borçsuz Müşterileri İndir (.txt)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackupPage;
