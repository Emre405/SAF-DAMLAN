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
  
  // Detaylı teneke/bidon stok ve maliyet yardımcı fonksiyonları (dosya içinde kullanılacak)
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
      s16: { alinan: toplamAlinan.s16, kullanilan: kullanilan.s16, kalan: kalan.s16, maliyet_kalan: kalan.s16 * ortMaliyet.s16 },
      s10: { alinan: toplamAlinan.s10, kullanilan: kullanilan.s10, kalan: kalan.s10, maliyet_kalan: kalan.s10 * ortMaliyet.s10 },
      s5: { alinan: toplamAlinan.s5, kullanilan: kullanilan.s5, kalan: kalan.s5, maliyet_kalan: kalan.s5 * ortMaliyet.s5 },
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
      s10: { alinan: toplamAlinan.s10, kullanilan: kullanilan.s10, kalan: kalan.s10, maliyet_kalan: kalan.s10 * ortMaliyet.s10 },
      s5: { alinan: toplamAlinan.s5, kullanilan: kullanilan.s5, kalan: kalan.s5, maliyet_kalan: kalan.s5 * ortMaliyet.s5 },
      s2: { alinan: toplamAlinan.s2, kullanilan: kullanilan.s2, kalan: kalan.s2, maliyet_kalan: kalan.s2 * ortMaliyet.s2 },
    };
  }

  const handleDownloadTxt = async () => {
    try {
      const allData = await readUserData();

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

      fileContent += `==================================================\n`;
      fileContent += `--- TENEKE/BİDON STOKLARI ---\n`;
      const kalanTeneke = detayliStokMaliyet;
      const kalanBidon = detayliBidonStokMaliyet;
      fileContent += `Kalan Teneke Stokları:\n`;
      fileContent += `  16'lık: ${kalanTeneke.s16.kalan} adet (Değer: ${formatNumber(kalanTeneke.s16.maliyet_kalan, '₺')})\n`;
      fileContent += `  10'luk: ${kalanTeneke.s10.kalan} adet (Değer: ${formatNumber(kalanTeneke.s10.maliyet_kalan, '₺')})\n`;
      fileContent += `  5'lik: ${kalanTeneke.s5.kalan} adet (Değer: ${formatNumber(kalanTeneke.s5.maliyet_kalan, '₺')})\n`;
      fileContent += `Kalan Bidon Stokları:\n`;
      fileContent += `  10'luk: ${kalanBidon.s10.kalan} adet (Değer: ${formatNumber(kalanBidon.s10.maliyet_kalan, '₺')})\n`;
      fileContent += `  5'lik: ${kalanBidon.s5.kalan} adet (Değer: ${formatNumber(kalanBidon.s5.maliyet_kalan, '₺')})\n`;
      fileContent += `  2'lik: ${kalanBidon.s2.kalan} adet (Değer: ${formatNumber(kalanBidon.s2.maliyet_kalan, '₺')})\n`;
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
      alert("Yedekleme dosyası oluşturulurken bir hata oluştu.");
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
      alert("Borçsuz müşteriler dosyası oluşturulurken bir hata oluştu.");
    }
  };

  // HTML YEDEKLEME YARDIMCI FONKSİYONU
  const handleDownloadHtmlBackup = async (mode) => {
    try {
      const allData = await readUserData();
      const isDebtorOnly = mode === 'debtors';

      // 1. Müşteri Verilerini Hesapla ve Filtrele
      const processedCustomers = customers.map(c => {
        const cTransactions = (allData.transactions || []).filter(t => t.customerId === c.id);
        const totalBilled = cTransactions.reduce((sum, t) => sum + Number(t.totalCost || 0), 0);
        const totalPaid = cTransactions.reduce((sum, t) => sum + Number(t.paymentReceived || 0), 0);
        const totalLoss = cTransactions.reduce((sum, t) => sum + Number(t.paymentLoss || 0), 0);
        const balance = totalBilled - totalPaid - totalLoss;
        const totalOlive = cTransactions.reduce((sum, t) => sum + Number(t.oliveKg || 0), 0);
        
        return {
          ...c,
          totalBilled,
          totalPaid,
          totalLoss,
          balance,
          totalOlive,
          transactions: cTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))
        };
      }).filter(c => {
        if (isDebtorOnly) return c.balance > 0;
        return c.balance <= 0;
      }).sort((a, b) => b.balance - a.balance);

      const title = isDebtorOnly ? "Tüm Fabrika Verileri & Borçlu Müşteriler" : "Borçsuz Müşteriler Raporu";
      const dateStr = new Date().toLocaleString('tr-TR');

      // Toplam finansal özetler
      const totalBilledAll = (allData.transactions || []).reduce((sum, t) => sum + Number(t.totalCost || 0), 0);
      const totalPaidAll = (allData.transactions || []).reduce((sum, t) => sum + Number(t.paymentReceived || 0), 0);
      const totalLossAll = (allData.transactions || []).reduce((sum, t) => sum + Number(t.paymentLoss || 0), 0);
      const pendingAll = totalBilledAll - totalPaidAll - totalLossAll;

      const totalWorkerExp = (allData.workerExpenses || []).reduce((sum, e) => sum + Number(e.amount || 0), 0);
      const totalOverhead = (allData.factoryOverhead || []).reduce((sum, e) => sum + Number(e.amount || 0), 0);
      const totalTinCost = (allData.tinPurchases || []).reduce((sum, p) => sum + Number(p.totalCost || 0), 0);
      const totalPlasticCost = (allData.plasticPurchases || []).reduce((sum, p) => sum + Number(p.totalCost || 0), 0);
      const totalFactoryExpenses = totalWorkerExp + totalOverhead + totalTinCost + totalPlasticCost;

      const totalPomaceRev = (allData.pomaceRevenues || []).reduce((sum, r) => sum + Number(r.totalRevenue || 0), 0);
      const detayliStok = hesaplaDetayliStokDegeri(allData.tinPurchases || [], allData.transactions || []);
      const detayliBidonStok = hesaplaDetayliBidonStokDegeri(allData.plasticPurchases || [], allData.transactions || []);
      const totalTinStockVal = Object.values(detayliStok).reduce((sum, v) => sum + (v.maliyet_kalan || 0), 0);
      const totalPlasticStockVal = Object.values(detayliBidonStok).reduce((sum, v) => sum + (v.maliyet_kalan || 0), 0);

      const totalFactoryIncome = (totalBilledAll - totalLossAll) + totalPomaceRev + totalTinStockVal + totalPlasticStockVal;
      const netProfit = totalFactoryIncome - totalFactoryExpenses;

      let htmlContent = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Saf Damla - ${title}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Outfit', sans-serif; }
          .tab-content { display: none; }
          .tab-content.active { display: block; }
        </style>
      </head>
      <body class="bg-slate-50 text-slate-800 min-h-screen">
        <header class="bg-emerald-800 text-white shadow-lg sticky top-0 z-30">
          <div class="max-w-7xl mx-auto px-4 py-5 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 class="text-2xl font-bold tracking-tight">SAF DAMLA ZEYTİNYAĞI FABRİKASI</h1>
              <p class="text-sm text-emerald-100 mt-1">${title} - Çevrimdışı Rapor Portalı</p>
            </div>
            <div class="text-right">
              <span class="inline-block px-3 py-1 bg-emerald-700 text-emerald-100 rounded-full text-xs font-semibold">Yedek Dosyası</span>
              <p class="text-xs text-emerald-200 mt-1.5">Tarih: ${dateStr}</p>
            </div>
          </div>
        </header>

        <main class="max-w-7xl mx-auto px-4 py-8 sm:px-6 space-y-8">
      `;

      if (isDebtorOnly) {
        // TÜM VERİLERİN ÖZET KARTLARI
        htmlContent += `
          <!-- Finansal Özet Tablosu -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between">
              <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Fabrika Toplam Gelir</span>
              <span class="text-2xl font-bold text-emerald-800 mt-2">${formatNumber(totalFactoryIncome, ' ₺')}</span>
              <span class="text-slate-400 text-xs mt-1">Hasılat + Pirina + Kalan Stok Değeri</span>
            </div>
            <div class="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between">
              <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Fabrika Toplam Gider</span>
              <span class="text-2xl font-bold text-rose-700 mt-2">${formatNumber(totalFactoryExpenses, ' ₺')}</span>
              <span class="text-slate-400 text-xs mt-1">İşçi + Giderler + Stok Alımları</span>
            </div>
            <div class="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between">
              <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Net Kar / Zarar</span>
              <span class="text-2xl font-bold ${netProfit >= 0 ? 'text-blue-700' : 'text-rose-700'} mt-2">${formatNumber(netProfit, ' ₺')}</span>
              <span class="text-slate-400 text-xs mt-1">İşletme Kar Durumu</span>
            </div>
            <div class="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between">
              <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Bekleyen Müşteri Alacağı</span>
              <span class="text-2xl font-bold text-rose-600 mt-2">${formatNumber(pendingAll, ' ₺')}</span>
              <span class="text-slate-400 text-xs mt-1">Müşterilerden Toplam Alacak</span>
            </div>
          </div>

          <!-- TABS -->
          <div class="flex flex-wrap gap-2 border-b pb-3">
            <button onclick="switchTab(event, 'debtor-customers-tab')" class="tab-btn px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-sm">Müşteriler (${processedCustomers.length})</button>
            <button onclick="switchTab(event, 'worker-expenses-tab')" class="tab-btn px-4 py-2.5 bg-white border text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50">İşçi Ücretleri (${(allData.workerExpenses || []).length})</button>
            <button onclick="switchTab(event, 'factory-overhead-tab')" class="tab-btn px-4 py-2.5 bg-white border text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50">Fabrika Giderleri (${(allData.factoryOverhead || []).length})</button>
            <button onclick="switchTab(event, 'tin-stocks-tab')" class="tab-btn px-4 py-2.5 bg-white border text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50">Teneke Alım & Stok</button>
            <button onclick="switchTab(event, 'plastic-stocks-tab')" class="tab-btn px-4 py-2.5 bg-white border text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50">Bidon Alım & Stok</button>
            <button onclick="switchTab(event, 'pomace-tab')" class="tab-btn px-4 py-2.5 bg-white border text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50">Pirina Geliri</button>
          </div>
        `;
      } else {
        htmlContent += `
          <!-- Borçsuz Müşteriler Özet -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-2xl border shadow-sm">
              <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Borçsuz Müşteri Sayısı</span>
              <p class="text-3xl font-bold text-emerald-800 mt-2">${processedCustomers.length} Müşteri</p>
            </div>
            <div class="bg-white p-6 rounded-2xl border shadow-sm">
              <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Toplam Çekilen Zeytin</span>
              <p class="text-3xl font-bold text-slate-800 mt-2">${formatNumber(processedCustomers.reduce((sum, c) => sum + c.totalOlive, 0), ' kg')}</p>
            </div>
            <div class="bg-white p-6 rounded-2xl border shadow-sm">
              <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Toplam Alınan Ödeme</span>
              <p class="text-3xl font-bold text-emerald-600 mt-2">${formatNumber(processedCustomers.reduce((sum, c) => sum + c.totalPaid, 0), ' ₺')}</p>
            </div>
          </div>
        `;
      }

      // MÜŞTERİ KARTLARI TAB ALANI (Tüm modlarda var)
      htmlContent += `
        <!-- Müşteri Listesi İçeriği -->
        <div id="${isDebtorOnly ? 'debtor-customers-tab' : 'default-tab'}" class="tab-content active space-y-6">
          <div class="bg-white p-4 sm:p-6 rounded-2xl border shadow-sm">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 class="text-lg font-bold text-slate-800">${title} Listesi</h2>
              <input type="text" id="cust-search" oninput="searchCustomers()" placeholder="Müşteri adıyla ara..." class="px-4 py-2 border rounded-xl w-full sm:w-80 min-h-[44px] focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>

            <div class="grid grid-cols-1 gap-4" id="customers-list-container">
              ${processedCustomers.map(c => `
                <div class="border rounded-2xl bg-white shadow-sm hover:shadow transition-shadow p-4 sm:p-6 customer-item-card" data-name="${c.name.toLowerCase()}">
                  <div class="flex justify-between items-start border-b pb-3">
                    <div>
                      <h3 class="text-lg font-bold text-slate-800">${c.name}</h3>
                      <p class="text-xs text-slate-400 mt-1">İşlem Sayısı: ${c.transactions.length}</p>
                    </div>
                    <span class="px-4 py-1.5 rounded-full text-sm font-bold ${c.balance > 0 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}">
                      Bakiye: ${formatNumber(c.balance, ' ₺')}
                    </span>
                  </div>

                  <div class="grid grid-cols-3 gap-2 text-center text-xs text-slate-600 py-3 bg-slate-50 rounded-xl mt-3">
                    <div><span class="block text-slate-400">Toplam Sıkım</span><span class="font-bold text-slate-800">${formatNumber(c.totalOlive, ' kg')}</span></div>
                    <div><span class="block text-slate-400">Toplam Ücret</span><span class="font-bold text-slate-800">${formatNumber(c.totalBilled, ' ₺')}</span></div>
                    <div><span class="block text-slate-400">Toplam Ödenen</span><span class="font-bold text-emerald-600">${formatNumber(c.totalPaid, ' ₺')}</span></div>
                  </div>

                  <div class="mt-4 pt-3 border-t">
                    <button onclick="toggleDetails('${c.id}')" class="text-xs text-blue-600 font-bold hover:text-blue-800 flex items-center min-h-[32px]">İşlem Detaylarını Gör ▾</button>
                    <div id="details-${c.id}" class="hidden mt-3 space-y-2">
                      ${c.transactions.map(t => {
                        const tBakiye = (t.totalCost || 0) - (t.paymentReceived || 0) - (t.paymentLoss || 0);
                        const desc = t.description ? `${t.description} (${formatNumber(t.oliveKg)} kg zeytin)` : `${formatNumber(t.oliveKg)} kg zeytin`;
                        return `
                          <div class="bg-slate-50 p-3 rounded-xl border text-xs space-y-1">
                            <div class="flex justify-between font-semibold">
                              <span class="text-slate-500">${new Date(t.date).toLocaleDateString('tr-TR')}</span>
                              <span class="${tBakiye > 0 ? 'text-rose-600' : 'text-emerald-600'}">Kalan: ${formatNumber(tBakiye, ' ₺')}</span>
                            </div>
                            <p class="text-slate-700 mt-1">${desc}</p>
                            <div class="flex justify-between text-[11px] text-slate-400 pt-1 border-t mt-1">
                              <span>Ücret: ${formatNumber(t.totalCost, ' ₺')}</span>
                              <span>Ödenen: ${formatNumber(t.paymentReceived, ' ₺')}</span>
                            </div>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      if (isDebtorOnly) {
        // İŞÇİ GİDERLERİ TABI
        htmlContent += `
          <div id="worker-expenses-tab" class="tab-content space-y-6">
            <div class="bg-white p-6 rounded-2xl border shadow-sm">
              <h2 class="text-lg font-bold text-slate-800 mb-4">İşçi Ücretleri Ödemeleri</h2>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 text-sm">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left font-semibold text-slate-600">Tarih</th>
                      <th class="px-6 py-3 text-left font-semibold text-slate-600">İşçi Adı</th>
                      <th class="px-6 py-3 text-left font-semibold text-slate-600">Çalıştığı Gün</th>
                      <th class="px-6 py-3 text-left font-semibold text-slate-600">Verilen Ücret</th>
                      <th class="px-6 py-3 text-left font-semibold text-slate-600">Açıklama</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    ${(allData.workerExpenses || []).map(e => `
                      <tr>
                        <td class="px-6 py-4">${new Date(e.date).toLocaleDateString('tr-TR')}</td>
                        <td class="px-6 py-4 font-semibold">${e.workerName}</td>
                        <td class="px-6 py-4">${e.daysWorked} gün</td>
                        <td class="px-6 py-4 text-rose-700 font-bold">${formatNumber(e.amount, ' ₺')}</td>
                        <td class="px-6 py-4 text-slate-500">${e.description || '-'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- MÜHTELİF GİDERLER TABI -->
          <div id="factory-overhead-tab" class="tab-content space-y-6">
            <div class="bg-white p-6 rounded-2xl border shadow-sm">
              <h2 class="text-lg font-bold text-slate-800 mb-4">Muhtelif Fabrika Giderleri</h2>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 text-sm">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left font-semibold text-slate-600">Tarih</th>
                      <th class="px-6 py-3 text-left font-semibold text-slate-600">Açıklama</th>
                      <th class="px-6 py-3 text-left font-semibold text-slate-600">Gider Tutarı</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    ${(allData.factoryOverhead || []).map(e => `
                      <tr>
                        <td class="px-6 py-4">${new Date(e.date).toLocaleDateString('tr-TR')}</td>
                        <td class="px-6 py-4 font-semibold">${e.description}</td>
                        <td class="px-6 py-4 text-rose-700 font-bold">${formatNumber(e.amount, ' ₺')}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- TENEKE ALIM VE STOK TABI -->
          <div id="tin-stocks-tab" class="tab-content space-y-6">
            <!-- Stok Durumu -->
            <div class="bg-white p-6 rounded-2xl border shadow-sm">
              <h2 class="text-lg font-bold text-slate-800 mb-4">Teneke Stok Durumu</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                ${['s16', 's10', 's5'].map(size => {
                  const s = detayliStok[size];
                  return `
                    <div class="p-4 rounded-xl border bg-slate-50 text-center">
                      <h3 class="font-bold text-slate-700">${size.replace('s', '')}'lık Teneke</h3>
                      <div class="grid grid-cols-3 gap-2 mt-3 text-xs">
                        <div><span class="text-slate-400">Alınan</span><p class="font-bold text-slate-700">${s.alinan}</p></div>
                        <div><span class="text-slate-400">Kullanılan</span><p class="font-bold text-slate-700">${s.kullanilan}</p></div>
                        <div><span class="text-slate-400">Kalan</span><p class="font-bold text-emerald-600">${s.kalan}</p></div>
                      </div>
                      <p class="text-xs text-slate-500 font-semibold mt-3">Değer: ${formatNumber(s.maliyet_kalan, ' ₺')}</p>
                    </div>
                  `;
                }).join('')}
              </div>
              <div class="mt-4 p-3 bg-emerald-50 rounded-xl text-center border border-emerald-100 text-emerald-800 font-bold">
                Toplam Kalan Teneke Stok Değeri: ${formatNumber(totalTinStockVal, ' ₺')}
              </div>
            </div>

            <!-- Teneke Alımları Geçmişi -->
            <div class="bg-white p-6 rounded-2xl border shadow-sm">
              <h2 class="text-lg font-bold text-slate-800 mb-4">Teneke Alımları Listesi</h2>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 text-sm">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left font-semibold text-slate-600">Tarih</th>
                      <th class="px-6 py-3 text-left font-semibold text-slate-600">16'lık</th>
                      <th class="px-6 py-3 text-left font-semibold text-slate-600">10'luk</th>
                      <th class="px-6 py-3 text-left font-semibold text-slate-600">5'lik</th>
                      <th class="px-6 py-3 text-left font-semibold text-slate-600">Toplam Maliyet</th>
                      <th class="px-6 py-3 text-left font-semibold text-slate-600">Açıklama</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    ${(allData.tinPurchases || []).map(p => `
                      <tr>
                        <td class="px-6 py-4">${new Date(p.date).toLocaleDateString('tr-TR')}</td>
                        <td class="px-6 py-4">${p.s16 || 0} ad</td>
                        <td class="px-6 py-4">${p.s10 || 0} ad</td>
                        <td class="px-6 py-4">${p.s5 || 0} ad</td>
                        <td class="px-6 py-4 text-rose-700 font-bold">${formatNumber(p.totalCost, ' ₺')}</td>
                        <td class="px-6 py-4 text-slate-500">${p.description || '-'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- BİDON ALIM VE STOK TABI -->
          <div id="plastic-stocks-tab" class="tab-content space-y-6">
            <!-- Stok Durumu -->
            <div class="bg-white p-6 rounded-2xl border shadow-sm">
              <h2 class="text-lg font-bold text-slate-800 mb-4">Bidon Stok Durumu</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                ${['s10', 's5', 's2'].map(size => {
                  const s = detayliBidonStok[size];
                  return `
                    <div class="p-4 rounded-xl border bg-slate-50 text-center">
                      <h3 class="font-bold text-slate-700">${size.replace('s', '')}'luk Bidon</h3>
                      <div class="grid grid-cols-3 gap-2 mt-3 text-xs">
                        <div><span class="text-slate-400">Alınan</span><p class="font-bold text-slate-700">${s.alinan}</p></div>
                        <div><span class="text-slate-400">Kullanılan</span><p class="font-bold text-slate-700">${s.kullanilan}</p></div>
                        <div><span class="text-slate-400">Kalan</span><p class="font-bold text-emerald-600">${s.kalan}</p></div>
                      </div>
                      <p class="text-xs text-slate-500 font-semibold mt-3">Değer: ${formatNumber(s.maliyet_kalan, ' ₺')}</p>
                    </div>
                  `;
                }).join('')}
              </div>
              <div class="mt-4 p-3 bg-emerald-50 rounded-xl text-center border border-emerald-100 text-emerald-800 font-bold">
                Toplam Kalan Bidon Stok Değeri: ${formatNumber(totalPlasticStockVal, ' ₺')}
              </div>
            </div>

            <!-- Bidon Alımları Geçmişi -->
            <div class="bg-white p-6 rounded-2xl border shadow-sm">
              <h2 class="text-lg font-bold text-slate-800 mb-4">Bidon Alımları Listesi</h2>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 text-sm">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left font-semibold text-slate-600">Tarih</th>
                      <th class="px-6 py-3 text-left font-semibold text-slate-600">10'luk</th>
                      <th class="px-6 py-3 text-left font-semibold text-slate-600">5'lik</th>
                      <th class="px-6 py-3 text-left font-semibold text-slate-600">2'lik</th>
                      <th class="px-6 py-3 text-left font-semibold text-slate-600">Toplam Maliyet</th>
                      <th class="px-6 py-3 text-left font-semibold text-slate-600">Açıklama</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    ${(allData.plasticPurchases || []).map(p => `
                      <tr>
                        <td class="px-6 py-4">${new Date(p.date).toLocaleDateString('tr-TR')}</td>
                        <td class="px-6 py-4">${p.s10 || 0} ad</td>
                        <td class="px-6 py-4">${p.s5 || 0} ad</td>
                        <td class="px-6 py-4">${p.s2 || 0} ad</td>
                        <td class="px-6 py-4 text-rose-700 font-bold">${formatNumber(p.totalCost, ' ₺')}</td>
                        <td class="px-6 py-4 text-slate-500">${p.description || '-'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- PİRİNA TABI -->
          <div id="pomace-tab" class="tab-content space-y-6">
            <div class="bg-white p-6 rounded-2xl border shadow-sm">
              <h2 class="text-lg font-bold text-slate-800 mb-4">Pirina (Sıkım Posası) Gelir Listesi</h2>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 text-sm">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left font-semibold text-slate-600">Tarih</th>
                      <th class="px-6 py-3 text-left font-semibold text-slate-600">Tır Sayısı</th>
                      <th class="px-6 py-3 text-left font-semibold text-slate-600">Toplam Yük</th>
                      <th class="px-6 py-3 text-left font-semibold text-slate-600">Fiyat / kg</th>
                      <th class="px-6 py-3 text-left font-semibold text-slate-600">Toplam Gelir</th>
                      <th class="px-6 py-3 text-left font-semibold text-slate-600">Açıklama</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    ${(allData.pomaceRevenues || []).map(r => `
                      <tr>
                        <td class="px-6 py-4">${new Date(r.date).toLocaleDateString('tr-TR')}</td>
                        <td class="px-6 py-4 font-semibold">${r.truckCount} tır</td>
                        <td class="px-6 py-4">${formatNumber(r.loadKg, ' kg')}</td>
                        <td class="px-6 py-4">${formatNumber(r.pricePerKg, ' ₺')}</td>
                        <td class="px-6 py-4 text-emerald-600 font-bold">${formatNumber(r.totalRevenue, ' ₺')}</td>
                        <td class="px-6 py-4 text-slate-500">${r.description || '-'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `;
      }

      // FOOTER VE JAVASCRIPT BLOKLARI
      htmlContent += `
        </main>

        <footer class="text-center text-xs text-slate-400 py-10 mt-12 border-t">
          <p>© ${new Date().getFullYear()} Saf Damla Zeytinyağı Fabrikası. Tüm Hakları Saklıdır.</p>
          <p class="mt-1">Bu web sayfası internet gerektirmeyen bağımsız bir yedekleme dosyasıdır.</p>
        </footer>

        <script>
          // TABS SWITCHER
          function switchTab(event, tabId) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            
            document.querySelectorAll('.tab-btn').forEach(btn => {
              btn.classList.remove('bg-emerald-600', 'text-white', 'shadow-sm');
              btn.classList.add('bg-white', 'text-slate-700', 'border');
            });
            
            event.currentTarget.classList.remove('bg-white', 'text-slate-700', 'border');
            event.currentTarget.classList.add('bg-emerald-600', 'text-white', 'shadow-sm');
          }

          // SEARCH FUNCTIONALITY
          function searchCustomers() {
            const query = document.getElementById('cust-search').value.toLowerCase().trim();
            const cards = document.querySelectorAll('.customer-item-card');
            
            cards.forEach(card => {
              const name = card.getAttribute('data-name');
              if (name.includes(query)) {
                card.style.display = 'block';
              } else {
                card.style.display = 'none';
              }
            });
          }

          // DETAILS COLLAPSIBLE
          function toggleDetails(id) {
            const el = document.getElementById('details-' + id);
            if (el.classList.contains('hidden')) {
              el.classList.remove('hidden');
              event.currentTarget.innerHTML = 'İşlem Detaylarını Gizle ▴';
            } else {
              el.classList.add('hidden');
              event.currentTarget.innerHTML = 'İşlem Detaylarını Gör ▾';
            }
          }
        </script>
      </body>
      </html>
      `;

      // Download trigger
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `safdamla_${isDebtorOnly ? 'fabrika_ve_borclular' : 'borcsuz_musteriler'}_${new Date().toISOString().split('T')[0]}.html`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("HTML yedek oluşturulurken hata oluştu:", err);
      alert("HTML yedek dosyası oluşturulurken hata oluştu.");
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Veri Yedekleme</h1>

      {/* METIN YEDEKLERİ */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border shadow space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Metin Dosyası (.txt) Olarak İndir</h2>
        <p className="text-sm text-gray-600">
          Tüm sistem kayıtlarını cihazınızda kolayca okuyabileceğiniz düz bir metin dosyası formatında indirir.
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

      {/* HTML PANEL YEDEKLERİ */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border shadow space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">İnteraktif HTML Raporu Olarak İndir</h2>
        <p className="text-sm text-gray-600">
          Verileri açtığınızda telefon veya bilgisayar ekranında tıpkı bir uygulama paneli gibi etkileşimli, tablolar ve arama kutusu içeren modern bir arayüzde sunan özel bir web dosyası indirir.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button 
            onClick={() => handleDownloadHtmlBackup('debtors')} 
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md transition-colors min-h-[48px] text-sm w-full sm:w-auto"
          >
            <Download className="w-5 h-5" />
            <span>1. Tüm Veriler & Borçlu Müşteriler (.html)</span>
          </button>
          <button 
            onClick={() => handleDownloadHtmlBackup('non-debtors')}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-colors min-h-[48px] text-sm w-full sm:w-auto"
          >
            <Download className="w-5 h-5" />
            <span>2. Sadece Borçsuz Müşteriler (.html)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackupPage;
