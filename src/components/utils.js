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
