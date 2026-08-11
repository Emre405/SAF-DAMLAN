export const formatNumber = (value, unit = '') => {
    if (value === null || value === undefined || isNaN(value)) return '0' + unit;
    return new Intl.NumberFormat('tr-TR').format(value) + unit;
};

export const formatOilRatioDisplay = (oliveKg, oilLitre) => {
  const numOliveKg = Number(oliveKg);
  const numOilLitre = Number(oilLitre);

  if (numOliveKg > 0 && numOilLitre > 0) {
    const ratio = (numOliveKg / numOilLitre).toFixed(2);
    return `${formatNumber(numOliveKg)} kg zeytin / ${formatNumber(numOilLitre)} litre yağ = ${ratio}`;
  }
  return '-';
};

export const roundToTwo = (num) => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

export const toInputDateString = (date) => {
  try {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error("Error formatting date:", e);
    return '';
  }
};

export function calculateDetailedTinStatistics(tinPurchases) {
  const stats = {
    s16: { toplam_adet: 0, toplam_maliyet: 0, ortalama_birim_fiyat: 0 },
    s10: { toplam_adet: 0, toplam_maliyet: 0, ortalama_birim_fiyat: 0 },
    s5: { toplam_adet: 0, toplam_maliyet: 0, ortalama_birim_fiyat: 0 },
  };
  tinPurchases.forEach(p => {
    const adet16 = Number(p.s16) || 0;
    const adet10 = Number(p.s10) || 0;
    const adet5 = Number(p.s5) || 0;
    const birimFiyat = Number(p.tinPrice) || 0;
    stats.s16.toplam_adet += adet16;
    stats.s10.toplam_adet += adet10;
    stats.s5.toplam_adet += adet5;
    stats.s16.toplam_maliyet += adet16 * birimFiyat;
    stats.s10.toplam_maliyet += adet10 * birimFiyat;
    stats.s5.toplam_maliyet += adet5 * birimFiyat;
  });
  ['s16','s10','s5'].forEach(key => {
    stats[key].ortalama_birim_fiyat = stats[key].toplam_adet > 0 ? (stats[key].toplam_maliyet / stats[key].toplam_adet) : 0;
  });
  return stats;
}

export function calculateTinProfitLoss(tinPurchases, transactions) {
  const alinan = { s16: 0, s10: 0, s5: 0 };
  const alinanMaliyet = { s16: 0, s10: 0, s5: 0 };
  tinPurchases.forEach(p => {
    const adet16 = Number(p.s16) || 0;
    const adet10 = Number(p.s10) || 0;
    const adet5 = Number(p.s5) || 0;
    const birimFiyat = Number(p.tinPrice) || 0;
    alinan.s16 += adet16;
    alinan.s10 += adet10;
    alinan.s5 += adet5;
    alinanMaliyet.s16 += adet16 * birimFiyat;
    alinanMaliyet.s10 += adet10 * birimFiyat;
    alinanMaliyet.s5 += adet5 * birimFiyat;
  });
  const ortMaliyet = {
    s16: alinan.s16 > 0 ? alinanMaliyet.s16 / alinan.s16 : 0,
    s10: alinan.s10 > 0 ? alinanMaliyet.s10 / alinan.s10 : 0,
    s5:  alinan.s5  > 0 ? alinanMaliyet.s5  / alinan.s5  : 0,
  };
  const satilan = { s16: 0, s10: 0, s5: 0 };
  const satisGeliri = { s16: 0, s10: 0, s5: 0 };
  transactions.forEach(t => {
    satilan.s16 += Number(t.tinCounts?.s16 || 0);
    satilan.s10 += Number(t.tinCounts?.s10 || 0);
    satilan.s5  += Number(t.tinCounts?.s5  || 0);
    satisGeliri.s16 += (Number(t.tinCounts?.s16 || 0) * Number(t.tinPrices?.s16 || 0));
    satisGeliri.s10 += (Number(t.tinCounts?.s10 || 0) * Number(t.tinPrices?.s10 || 0));
    satisGeliri.s5  += (Number(t.tinCounts?.s5  || 0) * Number(t.tinPrices?.s5  || 0));
  });
  const smm = {
    s16: satilan.s16 * ortMaliyet.s16,
    s10: satilan.s10 * ortMaliyet.s10,
    s5:  satilan.s5  * ortMaliyet.s5,
  };
  const netKar = {
    s16: satisGeliri.s16 - smm.s16,
    s10: satisGeliri.s10 - smm.s10,
    s5:  satisGeliri.s5  - smm.s5,
  };
  const toplamSatisGeliri = satisGeliri.s16 + satisGeliri.s10 + satisGeliri.s5;
  const toplamSMM = smm.s16 + smm.s10 + smm.s5;
  const toplamNetKar = netKar.s16 + netKar.s10 + netKar.s5;
  return {
    detay: { 
      s16: { ...satilan, gelir: satisGeliri.s16, smm: smm.s16, netKar: netKar.s16 }, 
      s10: { ...satilan, gelir: satisGeliri.s10, smm: smm.s10, netKar: netKar.s10 }, 
      s5:  { ...satilan, gelir: satisGeliri.s5,  smm: smm.s5,  netKar: netKar.s5 } 
    },
    toplamSatisGeliri,
    toplamSMM,
    toplamNetKar,
  };
}

export function calculateFactorySummary({ transactions, workerExpenses, factoryOverhead, pomaceRevenues, tinPurchases, plasticPurchases }) {
  const totalBilledAmount = transactions.reduce((sum, t) => sum + Number(t.totalCost || 0), 0);
  const totalPomaceRevenues = pomaceRevenues.reduce((sum, r) => sum + Number(r.totalRevenue || 0), 0);
  const totalPaymentLoss = transactions.reduce((sum, t) => sum + Number(t.paymentLoss || 0), 0);
  const totalWorkerExpenses = workerExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalFactoryOverhead = factoryOverhead.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalTinPurchaseCost = tinPurchases.reduce((sum, p) => sum + Number(p.totalCost || 0), 0);
  const totalPlasticPurchaseCost = plasticPurchases.reduce((sum, p) => sum + Number(p.totalCost || 0), 0);

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

  const detayliStokMaliyet = hesaplaDetayliStokDegeri(tinPurchases || [], transactions);
  const detayliBidonStokMaliyet = hesaplaDetayliBidonStokDegeri(plasticPurchases || [], transactions);
  const toplamTenekeKalanMaliyet = Object.values(detayliStokMaliyet).reduce((sum, v) => sum + (v.maliyet_kalan || 0), 0);
  const toplamBidonKalanMaliyet = Object.values(detayliBidonStokMaliyet).reduce((sum, v) => sum + (v.maliyet_kalan || 0), 0);

  const totalFactoryExpenses = totalWorkerExpenses + totalFactoryOverhead + totalTinPurchaseCost + totalPlasticPurchaseCost;
  const totalFactoryIncome = totalBilledAmount + totalPomaceRevenues - totalPaymentLoss + toplamTenekeKalanMaliyet + toplamBidonKalanMaliyet;
  const netFactoryBalance = totalFactoryIncome - totalFactoryExpenses;

  return {
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
  };
}

export const printHtml = (htmlContent, title = 'Yazdır') => {
  try {
    const existingIframe = document.getElementById('app-print-iframe');
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'app-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = '0px';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const pri = iframe.contentWindow || iframe.contentDocument;
    const doc = pri.document || pri;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            @media print {
              @page {
                size: A5;
                margin: 8mm;
              }
              body {
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              margin: 0;
              padding: 10px;
              color: #000;
              background: #fff;
            }
            .print-header { text-align: center; font-size: 1.6rem; font-weight: bold; margin-bottom: 8px; letter-spacing: 1px; }
            .print-section { margin-bottom: 8px; }
            .print-table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
            .print-table th, .print-table td { border: 1px solid #bbb; padding: 4px 6px; text-align: left; }
            .print-table th { background: #f3f3f3; }
            .print-summary { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
            .print-summary-item { flex: 1 1 40%; min-width: 120px; margin-bottom: 2px; }
            .print-label { font-weight: bold; }
            .print-value { margin-left: 4px; }
            .print-border { border: 2px dashed #333; border-radius: 12px; padding: 18px; max-width: 650px; margin: 0 auto; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        pri.focus();
        pri.print();
      } catch (err) {
        console.error('Yazdırma tetikleme hatası:', err);
      }
    }, 250);
  } catch (err) {
    console.error('Yazdırma hatası:', err);
  }
};

export const printTransactionReceipt = (t) => {
  const oliveCost = (Number(t.oliveKg) || 0) * (Number(t.pricePerKg) || 0);
  const tinCost = (Number(t.tinCounts?.s16 || 0) * Number(t.tinPrices?.s16 || 0)) + (Number(t.tinCounts?.s10 || 0) * Number(t.tinPrices?.s10 || 0)) + (Number(t.tinCounts?.s5 || 0) * Number(t.tinPrices?.s5 || 0));
  const plasticCost = (Number(t.plasticCounts?.s10 || 0) * Number(t.plasticPrices?.s10 || 0)) + (Number(t.plasticCounts?.s5 || 0) * Number(t.plasticPrices?.s5 || 0)) + (Number(t.plasticCounts?.s2 || 0) * Number(t.plasticPrices?.s2 || 0));
  const totalCost = t.totalCost !== undefined && t.totalCost !== null ? Number(t.totalCost) : roundToTwo(oliveCost + tinCost + plasticCost);
  const remainingBalance = roundToTwo(totalCost - (Number(t.paymentReceived) || 0) - (Number(t.paymentLoss) || 0));
  const formattedDate = t.date ? new Date(t.date).toLocaleDateString('tr-TR') : '';
  const descriptionText = t.description ? `${t.description} (${formatNumber(t.oliveKg)} kg zeytin)` : `${formatNumber(t.oliveKg)} kg zeytin`;
  const oilRatioStr = (Number(t.oliveKg) > 0 && Number(t.oilLitre) > 0) ? (Number(t.oliveKg) / Number(t.oilLitre)).toFixed(2) : '-';
  const custName = t.customerName || t.customer || '';

  const receiptHtml = `
    <div style="width: 100%; font-family: Arial, sans-serif; padding: 10px;">
      <div style="border: 2px dashed #333; border-radius: 12px; padding: 16px; max-width: 100%; margin: 0 auto; background: #fff;">
        <h2 style="text-align: center; font-weight: 700; font-size: 20px; margin-bottom: 4px; color: #1e3a8a;">SAF DAMLA ZEYTİNYAĞI FABRİKASI</h2>
        <h3 style="text-align: center; font-weight: 600; font-size: 16px; margin-bottom: 12px; color: #374151;">İşlem Fişi / Makbuz</h3>
        <table style="width: 100%; margin-bottom: 8px; font-size: 14px;">
          <tbody>
            <tr><td style="padding: 2px 0;"><b>Müşteri:</b></td><td style="padding: 2px 0;">${custName}</td></tr>
            <tr><td style="padding: 2px 0;"><b>Tarih:</b></td><td style="padding: 2px 0;">${formattedDate}</td></tr>
            <tr><td style="padding: 2px 0;"><b>Açıklama:</b></td><td style="padding: 2px 0;">${descriptionText}</td></tr>
          </tbody>
        </table>
        <hr style="margin: 8px 0; border: 0; border-top: 1px solid #ddd;" />
        <table style="width: 100%; font-size: 14px; margin-bottom: 8px;">
          <tbody>
            <tr><td style="padding: 2px 0;">Zeytin (kg):</td><td style="padding: 2px 0;">${formatNumber(t.oliveKg)}</td></tr>
            <tr><td style="padding: 2px 0;">Çıkan Yağ (L):</td><td style="padding: 2px 0;">${formatNumber(t.oilLitre)}</td></tr>
            <tr><td style="padding: 2px 0;">Kg Başına Ücret (₺):</td><td style="padding: 2px 0;">${formatNumber(t.pricePerKg)}</td></tr>
            <tr><td style="padding: 2px 0;">Yağ Oranı:</td><td style="padding: 2px 0;">${oilRatioStr}</td></tr>
            <tr><td style="padding: 2px 0;">Teneke (16/10/5):</td><td style="padding: 2px 0;">${t.tinCounts?.s16 || 0} / ${t.tinCounts?.s10 || 0} / ${t.tinCounts?.s5 || 0}</td></tr>
            <tr><td style="padding: 2px 0;">Bidon (10/5/2):</td><td style="padding: 2px 0;">${t.plasticCounts?.s10 || 0} / ${t.plasticCounts?.s5 || 0} / ${t.plasticCounts?.s2 || 0}</td></tr>
          </tbody>
        </table>
        <hr style="margin: 8px 0; border: 0; border-top: 1px solid #ddd;" />
        <table style="width: 100%; font-size: 14px; margin-bottom: 8px;">
          <tbody>
            <tr><td style="padding: 2px 0;">Zeytin Sıkım Ücreti:</td><td style="padding: 2px 0;">${formatNumber(oliveCost, ' ₺')}</td></tr>
            <tr><td style="padding: 2px 0;">Teneke Fiyatı:</td><td style="padding: 2px 0;">${formatNumber(tinCost, ' ₺')}</td></tr>
            <tr><td style="padding: 2px 0;">Bidon Fiyatı:</td><td style="padding: 2px 0;">${formatNumber(plasticCost, ' ₺')}</td></tr>
            <tr><td style="padding: 2px 0;"><b>Genel Toplam:</b></td><td style="padding: 2px 0;"><b>${formatNumber(totalCost, ' ₺')}</b></td></tr>
            <tr><td style="padding: 2px 0;">Alınan Ödeme:</td><td style="padding: 2px 0;">${formatNumber(t.paymentReceived || 0, ' ₺')}</td></tr>
            <tr><td style="padding: 2px 0;"><b>Kalan Bakiye:</b></td><td style="padding: 2px 0;"><b>${formatNumber(remainingBalance, ' ₺')}</b></td></tr>
          </tbody>
        </table>
        <hr style="margin: 8px 0; border: 0; border-top: 1px solid #ddd;" />
      </div>
    </div>
  `;

  printHtml(receiptHtml, `İşlem Fişi - ${custName}`);
};

