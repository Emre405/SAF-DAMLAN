import React from 'react';
import { Download, FileText, Globe, AlertTriangle } from 'lucide-react';
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

  /* ─── YARDIMCI FONKSİYONLAR ─── */
  function hesaplaDetayliTenekeStok(tinPurchases, transactions) {
    let toplamAlinan = { s16: 0, s10: 0, s5: 0 };
    let toplamMaliyet = { s16: 0, s10: 0, s5: 0 };
    tinPurchases.forEach(p => {
      toplamAlinan.s16 += Number(p.s16 || 0);
      toplamAlinan.s10 += Number(p.s10 || 0);
      toplamAlinan.s5  += Number(p.s5  || 0);
      toplamMaliyet.s16 += Number(p.s16 || 0) * Number(p.tinPrice || 0);
      toplamMaliyet.s10 += Number(p.s10 || 0) * Number(p.tinPrice || 0);
      toplamMaliyet.s5  += Number(p.s5  || 0) * Number(p.tinPrice || 0);
    });
    const ort = {
      s16: toplamAlinan.s16 > 0 ? toplamMaliyet.s16 / toplamAlinan.s16 : 0,
      s10: toplamAlinan.s10 > 0 ? toplamMaliyet.s10 / toplamAlinan.s10 : 0,
      s5:  toplamAlinan.s5  > 0 ? toplamMaliyet.s5  / toplamAlinan.s5  : 0,
    };
    let kullanilan = { s16: 0, s10: 0, s5: 0 };
    transactions.forEach(t => {
      kullanilan.s16 += Number(t.tinCounts?.s16 || 0);
      kullanilan.s10 += Number(t.tinCounts?.s10 || 0);
      kullanilan.s5  += Number(t.tinCounts?.s5  || 0);
    });
    return {
      s16: { alinan: toplamAlinan.s16, kullanilan: kullanilan.s16, kalan: toplamAlinan.s16 - kullanilan.s16, maliyet_kalan: (toplamAlinan.s16 - kullanilan.s16) * ort.s16 },
      s10: { alinan: toplamAlinan.s10, kullanilan: kullanilan.s10, kalan: toplamAlinan.s10 - kullanilan.s10, maliyet_kalan: (toplamAlinan.s10 - kullanilan.s10) * ort.s10 },
      s5:  { alinan: toplamAlinan.s5,  kullanilan: kullanilan.s5,  kalan: toplamAlinan.s5  - kullanilan.s5,  maliyet_kalan: (toplamAlinan.s5  - kullanilan.s5)  * ort.s5  },
    };
  }

  function hesaplaDetayliBidonStok(plasticPurchases, transactions) {
    let toplamAlinan = { s10: 0, s5: 0, s2: 0 };
    let toplamMaliyet = { s10: 0, s5: 0, s2: 0 };
    plasticPurchases.forEach(p => {
      toplamAlinan.s10 += Number(p.s10 || 0);
      toplamAlinan.s5  += Number(p.s5  || 0);
      toplamAlinan.s2  += Number(p.s2  || 0);
      toplamMaliyet.s10 += Number(p.s10 || 0) * Number(p.plasticPrice || 0);
      toplamMaliyet.s5  += Number(p.s5  || 0) * Number(p.plasticPrice || 0);
      toplamMaliyet.s2  += Number(p.s2  || 0) * Number(p.plasticPrice || 0);
    });
    const ort = {
      s10: toplamAlinan.s10 > 0 ? toplamMaliyet.s10 / toplamAlinan.s10 : 0,
      s5:  toplamAlinan.s5  > 0 ? toplamMaliyet.s5  / toplamAlinan.s5  : 0,
      s2:  toplamAlinan.s2  > 0 ? toplamMaliyet.s2  / toplamAlinan.s2  : 0,
    };
    let kullanilan = { s10: 0, s5: 0, s2: 0 };
    transactions.forEach(t => {
      kullanilan.s10 += Number(t.plasticCounts?.s10 || 0);
      kullanilan.s5  += Number(t.plasticCounts?.s5  || 0);
      kullanilan.s2  += Number(t.plasticCounts?.s2  || 0);
    });
    return {
      s10: { alinan: toplamAlinan.s10, kullanilan: kullanilan.s10, kalan: toplamAlinan.s10 - kullanilan.s10, maliyet_kalan: (toplamAlinan.s10 - kullanilan.s10) * ort.s10 },
      s5:  { alinan: toplamAlinan.s5,  kullanilan: kullanilan.s5,  kalan: toplamAlinan.s5  - kullanilan.s5,  maliyet_kalan: (toplamAlinan.s5  - kullanilan.s5)  * ort.s5  },
      s2:  { alinan: toplamAlinan.s2,  kullanilan: kullanilan.s2,  kalan: toplamAlinan.s2  - kullanilan.s2,  maliyet_kalan: (toplamAlinan.s2  - kullanilan.s2)  * ort.s2  },
    };
  }

  /* ─── TXT YEDEKLEME ─── */
  const handleDownloadTxt = async () => {
    try {
      const allData = await readUserData();
      const trans  = allData.transactions    || [];
      const wexp   = allData.workerExpenses  || [];
      const fover  = allData.factoryOverhead || [];
      const pomace = allData.pomaceRevenues  || [];
      const tinP   = allData.tinPurchases    || [];
      const plasP  = allData.plasticPurchases|| [];
      const oilP   = allData.oilPurchases    || [];
      const oilS   = allData.oilSales        || [];

      /* ── DASHBOARD METRİKLERİ ── */
      const toplamZeytin   = trans.reduce((s,t) => s + Number(t.oliveKg   || 0), 0);
      const toplamYag      = trans.reduce((s,t) => s + Number(t.oilLitre  || 0), 0);
      const genel_oran     = toplamYag > 0 ? (toplamZeytin / toplamYag).toFixed(2) : '-';

      const oliveIncome    = trans.reduce((s,t) => s + Number(t.oliveKg || 0) * Number(t.pricePerKg || 0), 0);
      const tinIncome      = trans.reduce((s,t) =>
        s + (Number(t.tinCounts?.s16||0)*Number(t.tinPrices?.s16||0))
          + (Number(t.tinCounts?.s10||0)*Number(t.tinPrices?.s10||0))
          + (Number(t.tinCounts?.s5 ||0)*Number(t.tinPrices?.s5 ||0)), 0);
      const plasticIncome  = trans.reduce((s,t) =>
        s + (Number(t.plasticCounts?.s10||0)*Number(t.plasticPrices?.s10||0))
          + (Number(t.plasticCounts?.s5 ||0)*Number(t.plasticPrices?.s5 ||0))
          + (Number(t.plasticCounts?.s2 ||0)*Number(t.plasticPrices?.s2 ||0)), 0);
      const toplamHasilat  = oliveIncome + tinIncome + plasticIncome;

      const toplamBilled   = trans.reduce((s,t) => s + Number(t.totalCost        || 0), 0);
      const toplamOdenen   = trans.reduce((s,t) => s + Number(t.paymentReceived  || 0), 0);
      const toplamFire     = trans.reduce((s,t) => s + Number(t.paymentLoss      || 0), 0);
      const bekleyenOdeme  = toplamBilled - toplamOdenen - toplamFire;

      const toplamWorker   = wexp.reduce((s,e)  => s + Number(e.amount || 0), 0);
      const toplamOverhead = fover.reduce((s,e)  => s + Number(e.amount || 0), 0);
      const toplamTinCost  = tinP.reduce((s,p)   => s + Number(p.totalCost || 0), 0);
      const toplamPlasCost = plasP.reduce((s,p)  => s + Number(p.totalCost || 0), 0);
      const toplamPomace   = pomace.reduce((s,r) => s + Number(r.totalRevenue || 0), 0);

      const detayliTeneke  = hesaplaDetayliTenekeStok(tinP, trans);
      const detayliBidon   = hesaplaDetayliBidonStok(plasP, trans);
      const tenekeStokVal  = Object.values(detayliTeneke).reduce((s,v) => s + v.maliyet_kalan, 0);
      const bidonStokVal   = Object.values(detayliBidon).reduce((s,v)  => s + v.maliyet_kalan, 0);

      const toplamGider    = toplamWorker + toplamOverhead + toplamTinCost + toplamPlasCost;
      const toplamGelir    = (toplamBilled - toplamFire) + toplamPomace + tenekeStokVal + bidonStokVal;
      const netKar         = toplamGelir - toplamGider;

      const toplamOilAlimMaliyet  = oilP.reduce((s,p) => s + Number(p.totalCost    || 0), 0);
      const toplamOilSatisGelir   = oilS.reduce((s,p) => s + Number(p.totalRevenue || 0), 0);
      const toplamAlinanOilTin    = oilP.reduce((s,p) => s + Number(p.tinCount     || 0), 0);
      const toplamSatilanOilTin   = oilS.reduce((s,p) => s + Number(p.tinCount     || 0), 0);

      const tarih = new Date().toLocaleString('tr-TR', { dateStyle: 'full', timeStyle: 'medium' });

      let f = '';
      const sep = '==================================================\n';
      f += `SAF DAMLA ZEYTİNYAĞI FABRİKASI - TAM VERİ YEDEĞİ\n`;
      f += `Yedekleme Tarihi ve Saati: ${tarih}\n`;
      f += `${sep}\n`;

      /* ANA EKRAN ÖZETİ */
      f += `${sep}`;
      f += `--- ANA EKRAN ÖZETİ ---\n`;
      f += `Toplam İşlenen Zeytin  : ${formatNumber(toplamZeytin, ' kg')}\n`;
      f += `Toplam Çıkan Yağ       : ${formatNumber(toplamYag, ' L')}\n`;
      f += `Genel Yağ/Zeytin Oranı : ${genel_oran}\n`;
      f += `Zeytin Sıkım Hasılatı  : ${formatNumber(oliveIncome, ' ₺')}\n`;
      f += `Teneke Kap Hasılatı    : ${formatNumber(tinIncome, ' ₺')}\n`;
      f += `Bidon Kap Hasılatı     : ${formatNumber(plasticIncome, ' ₺')}\n`;
      f += `Toplam Hasılat         : ${formatNumber(toplamHasilat, ' ₺')}\n`;
      f += `Alınan Ödeme           : ${formatNumber(toplamOdenen, ' ₺')}\n`;
      f += `Bekleyen Ödemeler      : ${formatNumber(bekleyenOdeme, ' ₺')}\n`;
      f += `Ödeme Firesi           : ${formatNumber(toplamFire, ' ₺')}\n`;
      f += `\n`;

      /* FABRİKA GELİR/GİDER ÖZETİ */
      f += `${sep}`;
      f += `--- FABRİKA TOPLAM GELİR/GİDER ÖZETİ ---\n`;
      f += `Gelirler Toplamı       : ${formatNumber(toplamGelir, ' ₺')}\n`;
      f += `  - Toplam Hasılat     : ${formatNumber(toplamHasilat - toplamFire, ' ₺')}\n`;
      f += `  - Pirina Geliri      : ${formatNumber(toplamPomace, ' ₺')}\n`;
      f += `  - Kalan Teneke Stok  : ${formatNumber(tenekeStokVal, ' ₺')}\n`;
      f += `  - Kalan Bidon Stok   : ${formatNumber(bidonStokVal, ' ₺')}\n`;
      f += `Giderler Toplamı       : ${formatNumber(toplamGider, ' ₺')}\n`;
      f += `  - İşçi Giderleri     : ${formatNumber(toplamWorker, ' ₺')}\n`;
      f += `  - Muhtelif Giderler  : ${formatNumber(toplamOverhead, ' ₺')}\n`;
      f += `  - Teneke Alımları    : ${formatNumber(toplamTinCost, ' ₺')}\n`;
      f += `  - Bidon Alımları     : ${formatNumber(toplamPlasCost, ' ₺')}\n`;
      f += `Net Kâr / Zarar        : ${formatNumber(netKar, ' ₺')}\n`;
      f += `\n`;

      /* STOK DURUMU */
      f += `${sep}`;
      f += `--- TENEKE / BİDON STOK DURUMU ---\n`;
      f += `Teneke Stoku:\n`;
      f += `  16'lık : Alınan ${detayliTeneke.s16.alinan} | Kullanılan ${detayliTeneke.s16.kullanilan} | Kalan ${detayliTeneke.s16.kalan} (${formatNumber(detayliTeneke.s16.maliyet_kalan, ' ₺')})\n`;
      f += `  10'luk : Alınan ${detayliTeneke.s10.alinan} | Kullanılan ${detayliTeneke.s10.kullanilan} | Kalan ${detayliTeneke.s10.kalan} (${formatNumber(detayliTeneke.s10.maliyet_kalan, ' ₺')})\n`;
      f += `   5'lik : Alınan ${detayliTeneke.s5.alinan}  | Kullanılan ${detayliTeneke.s5.kullanilan}  | Kalan ${detayliTeneke.s5.kalan}  (${formatNumber(detayliTeneke.s5.maliyet_kalan, ' ₺')})\n`;
      f += `Bidon Stoku:\n`;
      f += `  10'luk : Alınan ${detayliBidon.s10.alinan} | Kullanılan ${detayliBidon.s10.kullanilan} | Kalan ${detayliBidon.s10.kalan} (${formatNumber(detayliBidon.s10.maliyet_kalan, ' ₺')})\n`;
      f += `   5'lik : Alınan ${detayliBidon.s5.alinan}  | Kullanılan ${detayliBidon.s5.kullanilan}  | Kalan ${detayliBidon.s5.kalan}  (${formatNumber(detayliBidon.s5.maliyet_kalan, ' ₺')})\n`;
      f += `   2'lik : Alınan ${detayliBidon.s2.alinan}  | Kullanılan ${detayliBidon.s2.kullanilan}  | Kalan ${detayliBidon.s2.kalan}  (${formatNumber(detayliBidon.s2.maliyet_kalan, ' ₺')})\n`;
      f += `\n`;

      /* ZEYTİNYAĞI ALIM/SATIM */
      f += `${sep}`;
      f += `--- ZEYTİNYAĞI ALIM/SATIM ÖZETİ ---\n`;
      f += `Toplam Alım Maliyeti   : ${formatNumber(toplamOilAlimMaliyet, ' ₺')}\n`;
      f += `Toplam Satış Geliri    : ${formatNumber(toplamOilSatisGelir, ' ₺')}\n`;
      f += `Net Kâr/Zarar          : ${formatNumber(toplamOilSatisGelir - toplamOilAlimMaliyet, ' ₺')}\n`;
      f += `Kalan Net Teneke Stoğu : ${formatNumber(toplamAlinanOilTin - toplamSatilanOilTin, ' adet')}\n`;
      f += `\n`;

      /* GİDER DETAYLARI */
      f += `${sep}`;
      f += `--- İŞÇİ GİDERLERİ (${wexp.length} kayıt) ---\n`;
      wexp.forEach(e => {
        f += `  ${new Date(e.date).toLocaleDateString('tr-TR')} | ${e.workerName} | ${e.daysWorked} gün | ${formatNumber(e.amount, ' ₺')} | ${e.description || '-'}\n`;
      });
      f += `\n`;

      f += `${sep}`;
      f += `--- MUHTELİF GİDERLER (${fover.length} kayıt) ---\n`;
      fover.forEach(e => {
        f += `  ${new Date(e.date).toLocaleDateString('tr-TR')} | ${e.description} | ${formatNumber(e.amount, ' ₺')}\n`;
      });
      f += `\n`;

      f += `${sep}`;
      f += `--- TENEKE ALIMLARI (${tinP.length} kayıt) ---\n`;
      tinP.forEach(e => {
        f += `  ${new Date(e.date).toLocaleDateString('tr-TR')} | 16'lık:${e.s16||0} 10'luk:${e.s10||0} 5'lik:${e.s5||0} | Birim:${formatNumber(e.tinPrice, ' ₺')} | Toplam:${formatNumber(e.totalCost, ' ₺')} | ${e.description||'-'}\n`;
      });
      f += `\n`;

      f += `${sep}`;
      f += `--- BİDON ALIMLARI (${plasP.length} kayıt) ---\n`;
      plasP.forEach(e => {
        f += `  ${new Date(e.date).toLocaleDateString('tr-TR')} | 10'luk:${e.s10||0} 5'lik:${e.s5||0} 2'lik:${e.s2||0} | Birim:${formatNumber(e.plasticPrice, ' ₺')} | Toplam:${formatNumber(e.totalCost, ' ₺')} | ${e.description||'-'}\n`;
      });
      f += `\n`;

      f += `${sep}`;
      f += `--- PİRİNA GELİRLERİ (${pomace.length} kayıt) ---\n`;
      pomace.forEach(e => {
        f += `  ${new Date(e.date).toLocaleDateString('tr-TR')} | ${e.truckCount} tır | ${e.loadKg} kg | ${e.pricePerKg} ₺/kg | Toplam:${formatNumber(e.totalRevenue, ' ₺')} | ${e.description||'-'}\n`;
      });
      f += `\n`;

      f += `${sep}`;
      f += `--- ZEYTİNYAĞI ALIMLARI (${oilP.length} kayıt) ---\n`;
      oilP.forEach(e => {
        f += `  ${new Date(e.date).toLocaleDateString('tr-TR')} | ${e.supplierName} | ${e.tinCount} teneke | ${formatNumber(e.tinPrice, ' ₺')}/teneke | Toplam:${formatNumber(e.totalCost, ' ₺')}\n`;
      });
      f += `\n`;

      f += `${sep}`;
      f += `--- ZEYTİNYAĞI SATIŞLARI (${oilS.length} kayıt) ---\n`;
      oilS.forEach(e => {
        f += `  ${new Date(e.date).toLocaleDateString('tr-TR')} | ${e.customerName} | ${e.tinCount} teneke | ${formatNumber(e.tinPrice, ' ₺')}/teneke | Toplam:${formatNumber(e.totalRevenue, ' ₺')}\n`;
      });
      f += `\n`;

      /* BORÇLU MÜŞTERİLER */
      const allCust = customers.map(c => {
        const ct = trans.filter(t => t.customerId === c.id);
        const billed = ct.reduce((s,t) => s + Number(t.totalCost||0), 0);
        const paid   = ct.reduce((s,t) => s + Number(t.paymentReceived||0), 0);
        const loss   = ct.reduce((s,t) => s + Number(t.paymentLoss||0), 0);
        const olive  = ct.reduce((s,t) => s + Number(t.oliveKg||0), 0);
        return { ...c, billed, paid, loss, balance: billed-paid-loss, olive, ct };
      });
      const debtors    = allCust.filter(c => c.balance > 0).sort((a,b) => b.balance - a.balance);
      const nonDebtors = allCust.filter(c => c.balance <= 0).sort((a,b) => a.name.localeCompare(b.name,'tr'));

      f += `${sep}`;
      f += `--- BORÇLU MÜŞTERİLER (${debtors.length} müşteri) ---\n`;
      debtors.forEach(c => {
        f += `\n*** ${c.name} ***\n`;
        f += `  Toplam Sıkım: ${formatNumber(c.olive,' kg')} | Toplam Ücret: ${formatNumber(c.billed,' ₺')} | Alınan: ${formatNumber(c.paid,' ₺')} | KALAN BORÇ: ${formatNumber(c.balance,' ₺')}\n`;
        c.ct.forEach(t => {
          const desc = t.description ? `${t.description} (${formatNumber(t.oliveKg)} kg)` : `${formatNumber(t.oliveKg)} kg zeytin`;
          const kalan = (t.totalCost||0)-(t.paymentReceived||0)-(t.paymentLoss||0);
          f += `    - ${new Date(t.date).toLocaleDateString('tr-TR')} | ${desc} | Ücret:${formatNumber(t.totalCost,' ₺')} | Alınan:${formatNumber(t.paymentReceived,' ₺')} | Kalan:${formatNumber(kalan,' ₺')}\n`;
        });
      });
      f += `\n`;

      /* BORÇSUZ MÜŞTERİLER */
      f += `${sep}`;
      f += `--- BORÇSUZ MÜŞTERİLER (${nonDebtors.length} müşteri) ---\n`;
      nonDebtors.forEach(c => {
        f += `\n*** ${c.name} ***\n`;
        f += `  Toplam Sıkım: ${formatNumber(c.olive,' kg')} | Toplam Ücret: ${formatNumber(c.billed,' ₺')} | Alınan: ${formatNumber(c.paid,' ₺')} | Kalan: ${formatNumber(c.balance,' ₺')}\n`;
        c.ct.forEach(t => {
          const desc = t.description ? `${t.description} (${formatNumber(t.oliveKg)} kg)` : `${formatNumber(t.oliveKg)} kg zeytin`;
          const kalan = (t.totalCost||0)-(t.paymentReceived||0)-(t.paymentLoss||0);
          f += `    - ${new Date(t.date).toLocaleDateString('tr-TR')} | ${desc} | Ücret:${formatNumber(t.totalCost,' ₺')} | Alınan:${formatNumber(t.paymentReceived,' ₺')} | Kalan:${formatNumber(kalan,' ₺')}\n`;
        });
      });

      const tarihDosya = new Date().toISOString().replace('T','_').replace(/:/g,'-').split('.')[0];
      const blob = new Blob(['\uFEFF' + f], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      link.setAttribute('href', URL.createObjectURL(blob));
      link.setAttribute('download', `safdamla_tam_yedek_${tarihDosya}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('TXT yedek hatası:', err);
      alert('TXT yedek dosyası oluşturulurken hata oluştu.');
    }
  };

  /* ─── HTML YEDEKLEME (tek dosya, borçlu + borçsuz ayrı sekmeler) ─── */
  const handleDownloadHtmlBackup = async () => {
    try {
      const allData = await readUserData();
      const trans  = allData.transactions     || [];
      const wexp   = allData.workerExpenses   || [];
      const fover  = allData.factoryOverhead  || [];
      const pomace = allData.pomaceRevenues   || [];
      const tinP   = allData.tinPurchases     || [];
      const plasP  = allData.plasticPurchases || [];
      const oilP   = allData.oilPurchases     || [];
      const oilS   = allData.oilSales         || [];

      /* ── HESAPLAMALAR ── */
      const toplamZeytin  = trans.reduce((s,t) => s + Number(t.oliveKg  || 0), 0);
      const toplamYag     = trans.reduce((s,t) => s + Number(t.oilLitre || 0), 0);
      const genel_oran    = toplamYag > 0 ? (toplamZeytin / toplamYag).toFixed(2) : '-';

      const oliveIncome   = trans.reduce((s,t) => s + Number(t.oliveKg||0)*Number(t.pricePerKg||0), 0);
      const tinIncome     = trans.reduce((s,t) =>
        s+(Number(t.tinCounts?.s16||0)*Number(t.tinPrices?.s16||0))
         +(Number(t.tinCounts?.s10||0)*Number(t.tinPrices?.s10||0))
         +(Number(t.tinCounts?.s5 ||0)*Number(t.tinPrices?.s5 ||0)), 0);
      const plasticIncome = trans.reduce((s,t) =>
        s+(Number(t.plasticCounts?.s10||0)*Number(t.plasticPrices?.s10||0))
         +(Number(t.plasticCounts?.s5 ||0)*Number(t.plasticPrices?.s5 ||0))
         +(Number(t.plasticCounts?.s2 ||0)*Number(t.plasticPrices?.s2 ||0)), 0);
      const toplamHasilat = oliveIncome + tinIncome + plasticIncome;

      const toplamBilled  = trans.reduce((s,t) => s + Number(t.totalCost       || 0), 0);
      const toplamOdenen  = trans.reduce((s,t) => s + Number(t.paymentReceived || 0), 0);
      const toplamFire    = trans.reduce((s,t) => s + Number(t.paymentLoss     || 0), 0);
      const bekleyenOdeme = toplamBilled - toplamOdenen - toplamFire;

      const totalWorker   = wexp.reduce((s,e)  => s + Number(e.amount     || 0), 0);
      const totalOverhead = fover.reduce((s,e)  => s + Number(e.amount     || 0), 0);
      const totalTinCost  = tinP.reduce((s,p)   => s + Number(p.totalCost || 0), 0);
      const totalPlasCost = plasP.reduce((s,p)  => s + Number(p.totalCost || 0), 0);
      const totalPomace   = pomace.reduce((s,r) => s + Number(r.totalRevenue || 0), 0);

      const detTeneke     = hesaplaDetayliTenekeStok(tinP, trans);
      const detBidon      = hesaplaDetayliBidonStok(plasP, trans);
      const tenekeStokVal = Object.values(detTeneke).reduce((s,v) => s + v.maliyet_kalan, 0);
      const bidonStokVal  = Object.values(detBidon).reduce((s,v)  => s + v.maliyet_kalan, 0);

      const toplamGider   = totalWorker + totalOverhead + totalTinCost + totalPlasCost;
      const toplamGelir   = (toplamBilled - toplamFire) + totalPomace + tenekeStokVal + bidonStokVal;
      const netKar        = toplamGelir - toplamGider;

      /* MÜŞTERİ GRUPLAMA */
      const allCust = customers.map(c => {
        const ct     = trans.filter(t => t.customerId === c.id);
        const billed = ct.reduce((s,t) => s + Number(t.totalCost       || 0), 0);
        const paid   = ct.reduce((s,t) => s + Number(t.paymentReceived || 0), 0);
        const loss   = ct.reduce((s,t) => s + Number(t.paymentLoss     || 0), 0);
        const olive  = ct.reduce((s,t) => s + Number(t.oliveKg         || 0), 0);
        const yag    = ct.reduce((s,t) => s + Number(t.oilLitre        || 0), 0);
        return { ...c, billed, paid, loss, balance: billed-paid-loss, olive, yag, ct: ct.sort((a,b)=>new Date(b.date)-new Date(a.date)) };
      });
      const debtors    = allCust.filter(c => c.balance > 0).sort((a,b) => b.balance - a.balance);
      const nonDebtors = allCust.filter(c => c.balance <= 0).sort((a,b) => a.name.localeCompare(b.name,'tr'));

      const dateStr = new Date().toLocaleString('tr-TR', { dateStyle: 'full', timeStyle: 'medium' });
      const tarihDosya = new Date().toISOString().replace('T','_').replace(/:/g,'-').split('.')[0];

      /* MÜŞTERİ KARTI OLUŞTURUCU */
      const musteriKartu = (c, renk) => `
        <div class="border rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow p-4 sm:p-5 customer-card" data-name="${c.name.toLowerCase()}">
          <div class="flex justify-between items-start border-b pb-3 mb-3">
            <div>
              <h3 class="text-base font-bold text-slate-800">${c.name}</h3>
              <p class="text-xs text-slate-400 mt-0.5">${c.ct.length} işlem · ${formatNumber(c.olive,' kg')} zeytin · ${formatNumber(c.yag,' L')} yağ</p>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-bold ${renk}">
              ${c.balance > 0 ? 'Borç: ' : 'Bakiye: '}${formatNumber(c.balance,' ₺')}
            </span>
          </div>
          <div class="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 rounded-xl p-2 mb-3">
            <div><span class="block text-slate-400">Toplam Ücret</span><span class="font-bold text-slate-800">${formatNumber(c.billed,' ₺')}</span></div>
            <div><span class="block text-slate-400">Alınan</span><span class="font-bold text-emerald-600">${formatNumber(c.paid,' ₺')}</span></div>
            <div><span class="block text-slate-400">Kalan</span><span class="font-bold ${c.balance>0?'text-rose-600':'text-emerald-600'}">${formatNumber(c.balance,' ₺')}</span></div>
          </div>
          <button onclick="toggleDet('${c.id}')" class="text-xs text-blue-600 font-semibold hover:underline">▸ İşlem Detayları (${c.ct.length})</button>
          <div id="det-${c.id}" class="hidden mt-3 space-y-2">
            ${c.ct.map(t => {
              const kalan = (t.totalCost||0)-(t.paymentReceived||0)-(t.paymentLoss||0);
              const desc  = t.description ? `${t.description} (${formatNumber(t.oliveKg)} kg)` : `${formatNumber(t.oliveKg)} kg zeytin`;
              return `
              <div class="bg-slate-50 border rounded-xl p-3 text-xs">
                <div class="flex justify-between font-semibold mb-1">
                  <span class="text-slate-500">${new Date(t.date).toLocaleDateString('tr-TR')}</span>
                  <span class="${kalan>0?'text-rose-600':'text-emerald-600'}">Kalan: ${formatNumber(kalan,' ₺')}</span>
                </div>
                <p class="text-slate-700 mb-1">${desc}</p>
                <div class="flex justify-between text-slate-400 border-t pt-1">
                  <span>Ücret: ${formatNumber(t.totalCost,' ₺')}</span>
                  <span>Ödenen: ${formatNumber(t.paymentReceived,' ₺')}</span>
                  <span>Yağ: ${formatNumber(t.oilLitre,' L')}</span>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>`;

      const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Saf Damla – Tam Veri Yedeği</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Outfit', sans-serif; }
    .tab-panel { display: none; }
    .tab-panel.active { display: block; }
  </style>
</head>
<body class="bg-slate-100 text-slate-800 min-h-screen">

  <!-- HEADER -->
  <header class="bg-emerald-800 text-white shadow-lg sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
      <div>
        <h1 class="text-xl font-bold tracking-tight">SAF DAMLA ZEYTİNYAĞI FABRİKASI</h1>
        <p class="text-emerald-200 text-xs mt-0.5">Tam Veri Yedeği – Çevrimdışı Rapor</p>
      </div>
      <div class="text-right">
        <span class="inline-block px-3 py-1 bg-emerald-700 text-emerald-100 rounded-full text-xs font-semibold">Yedek Dosyası</span>
        <p class="text-xs text-emerald-200 mt-1">📅 ${dateStr}</p>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 py-6 sm:px-6 space-y-6">

    <!-- ── ANA EKRAN KARTLARı ── -->
    <div>
      <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">📊 Ana Ekran Özeti</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-2xl border shadow-sm">
          <p class="text-xs text-slate-400">Toplam İşlenen Zeytin</p>
          <p class="text-xl font-bold text-slate-800 mt-1">${formatNumber(toplamZeytin,' kg')}</p>
        </div>
        <div class="bg-white p-4 rounded-2xl border shadow-sm">
          <p class="text-xs text-slate-400">Toplam Çıkan Yağ</p>
          <p class="text-xl font-bold text-slate-800 mt-1">${formatNumber(toplamYag,' L')}</p>
        </div>
        <div class="bg-white p-4 rounded-2xl border shadow-sm">
          <p class="text-xs text-slate-400">Genel Yağ / Zeytin Oranı</p>
          <p class="text-xl font-bold text-slate-800 mt-1">${genel_oran}</p>
        </div>
        <div class="bg-white p-4 rounded-2xl border shadow-sm">
          <p class="text-xs text-slate-400">Zeytin Sıkım Ücreti (Toplam)</p>
          <p class="text-xl font-bold text-emerald-700 mt-1">${formatNumber(oliveIncome,' ₺')}</p>
        </div>
        <div class="bg-white p-4 rounded-2xl border shadow-sm">
          <p class="text-xs text-slate-400">Toplam Hasılat</p>
          <p class="text-xl font-bold text-emerald-700 mt-1">${formatNumber(toplamHasilat,' ₺')}</p>
          <p class="text-xs text-slate-400 mt-1">Sıkım + Teneke + Bidon</p>
        </div>
        <div class="bg-white p-4 rounded-2xl border shadow-sm">
          <p class="text-xs text-slate-400">Alınan Ödeme</p>
          <p class="text-xl font-bold text-emerald-700 mt-1">${formatNumber(toplamOdenen,' ₺')}</p>
        </div>
        <div class="bg-white p-4 rounded-2xl border shadow-sm">
          <p class="text-xs text-slate-400">Bekleyen Ödemeler</p>
          <p class="text-xl font-bold text-rose-600 mt-1">${formatNumber(bekleyenOdeme,' ₺')}</p>
        </div>
        <div class="bg-white p-4 rounded-2xl border shadow-sm">
          <p class="text-xs text-slate-400">Ödeme Firesi</p>
          <p class="text-xl font-bold text-orange-600 mt-1">${formatNumber(toplamFire,' ₺')}</p>
        </div>
      </div>
    </div>

    <!-- ── FABRİKA GELİR/GİDER ÖZETİ ── -->
    <div>
      <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">🏭 Fabrika Toplam Gelir Gider Özeti</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm">
          <p class="text-xs font-bold text-emerald-600 uppercase mb-2">Gelirler Toplamı</p>
          <p class="text-2xl font-bold text-emerald-800">${formatNumber(toplamGelir,' ₺')}</p>
          <div class="text-xs text-emerald-700 mt-3 space-y-0.5">
            <p>• Toplam Hasılat: ${formatNumber(toplamHasilat - toplamFire,' ₺')}</p>
            <p>• Pirina Geliri: ${formatNumber(totalPomace,' ₺')}</p>
            <p>• Ödeme Firesi: -${formatNumber(toplamFire,' ₺')}</p>
            <p>• Kalan Teneke Stok Değeri: ${formatNumber(tenekeStokVal,' ₺')}</p>
            <p>• Kalan Bidon Stok Değeri: ${formatNumber(bidonStokVal,' ₺')}</p>
          </div>
        </div>
        <div class="bg-rose-50 border border-rose-200 p-5 rounded-2xl shadow-sm">
          <p class="text-xs font-bold text-rose-600 uppercase mb-2">Giderler Toplamı</p>
          <p class="text-2xl font-bold text-rose-800">${formatNumber(toplamGider,' ₺')}</p>
          <div class="text-xs text-rose-700 mt-3 space-y-0.5">
            <p>• İşçi Giderleri: ${formatNumber(totalWorker,' ₺')}</p>
            <p>• Muhtelif Giderler: ${formatNumber(totalOverhead,' ₺')}</p>
            <p>• Teneke Alımları: ${formatNumber(totalTinCost,' ₺')}</p>
            <p>• Bidon Alımları: ${formatNumber(totalPlasCost,' ₺')}</p>
          </div>
        </div>
        <div class="bg-white border p-5 rounded-2xl shadow-sm flex flex-col justify-center items-center">
          <p class="text-xs font-bold text-slate-500 uppercase mb-2">Net Kâr / Zarar</p>
          <p class="text-3xl font-bold ${netKar >= 0 ? 'text-blue-700' : 'text-rose-700'}">${formatNumber(netKar,' ₺')}</p>
        </div>
      </div>
    </div>

    <!-- ── ANA SEKMELER ── -->
    <div>
      <div class="flex flex-wrap gap-2 border-b pb-3 mb-4" id="main-tabs">
        <button onclick="switchTab('borclular')" id="tab-btn-borclular" class="tab-main-btn px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold shadow">
          🔴 Borçlu Müşteriler (${debtors.length})
        </button>
        <button onclick="switchTab('borcsuzlar')" id="tab-btn-borcsuzlar" class="tab-main-btn px-4 py-2 bg-white border text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50">
          🟢 Borçsuz Müşteriler (${nonDebtors.length})
        </button>
        <button onclick="switchTab('iscigider')" id="tab-btn-iscigider" class="tab-main-btn px-4 py-2 bg-white border text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50">
          👷 İşçi Giderleri (${wexp.length})
        </button>
        <button onclick="switchTab('muhtelifgider')" id="tab-btn-muhtelifgider" class="tab-main-btn px-4 py-2 bg-white border text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50">
          💸 Muhtelif Giderler (${fover.length})
        </button>
        <button onclick="switchTab('pirinagelir')" id="tab-btn-pirinagelir" class="tab-main-btn px-4 py-2 bg-white border text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50">
          🌿 Pirina Geliri (${pomace.length})
        </button>
        <button onclick="switchTab('tenekestok')" id="tab-btn-tenekestok" class="tab-main-btn px-4 py-2 bg-white border text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50">
          🥫 Teneke Alım & Stok
        </button>
        <button onclick="switchTab('bidonstok')" id="tab-btn-bidonstok" class="tab-main-btn px-4 py-2 bg-white border text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50">
          🛢 Bidon Alım & Stok
        </button>
      </div>

      <!-- BORÇLU MÜŞTERİLER PANELİ -->
      <div id="panel-borclular" class="tab-panel active">
        <div class="bg-white p-4 rounded-2xl border shadow-sm mb-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div>
            <h3 class="font-bold text-rose-700">Borçlu Müşteriler Listesi</h3>
            <p class="text-xs text-slate-400 mt-0.5">Toplam ${debtors.length} müşteri · Toplam alacak: ${formatNumber(debtors.reduce((s,c)=>s+c.balance,0),' ₺')}</p>
          </div>
          <input type="text" id="search-borclular" oninput="filterCards('borclular')" placeholder="Müşteri ara..." class="px-3 py-2 border rounded-xl text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-rose-400">
        </div>
        <div class="grid grid-cols-1 gap-3" id="list-borclular">
          ${debtors.map(c => musteriKartu(c,'bg-red-50 text-red-700 border border-red-200')).join('')}
        </div>
      </div>

      <!-- BORÇSUZ MÜŞTERİLER PANELİ -->
      <div id="panel-borcsuzlar" class="tab-panel">
        <div class="bg-white p-4 rounded-2xl border shadow-sm mb-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div>
            <h3 class="font-bold text-emerald-700">Borçsuz Müşteriler Listesi</h3>
            <p class="text-xs text-slate-400 mt-0.5">Toplam ${nonDebtors.length} müşteri · Toplam sıkılan zeytin: ${formatNumber(nonDebtors.reduce((s,c)=>s+c.olive,0),' kg')}</p>
          </div>
          <input type="text" id="search-borcsuzlar" oninput="filterCards('borcsuzlar')" placeholder="Müşteri ara..." class="px-3 py-2 border rounded-xl text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-400">
        </div>
        <div class="grid grid-cols-1 gap-3" id="list-borcsuzlar">
          ${nonDebtors.map(c => musteriKartu(c,'bg-emerald-50 text-emerald-700 border border-emerald-200')).join('')}
        </div>
      </div>

      <!-- İŞÇİ GİDERLERİ PANELİ -->
      <div id="panel-iscigider" class="tab-panel">

        <!-- İşçi Giderleri -->
        <div class="bg-white p-5 rounded-2xl border shadow-sm">
          <h3 class="font-bold text-slate-800 mb-3">İşçi Giderleri (${wexp.length} kayıt · Toplam: ${formatNumber(totalWorker,' ₺')})</h3>
          <div class="overflow-x-auto"><table class="min-w-full text-sm divide-y divide-gray-200">
            <thead class="bg-gray-50"><tr>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">Tarih</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">İşçi Adı</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">Gün</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">Ücret</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">Açıklama</th>
            </tr></thead>
            <tbody class="divide-y divide-gray-100">
              ${wexp.map(e => `<tr>
                <td class="px-4 py-2">${new Date(e.date).toLocaleDateString('tr-TR')}</td>
                <td class="px-4 py-2 font-semibold">${e.workerName}</td>
                <td class="px-4 py-2">${e.daysWorked} gün</td>
                <td class="px-4 py-2 text-rose-700 font-bold">${formatNumber(e.amount,' ₺')}</td>
                <td class="px-4 py-2 text-slate-500">${e.description||'-'}</td>
              </tr>`).join('')}
            </tbody>
          </table></div>
        </div>
      </div>

      <!-- MUHTELİF GİDERLER PANELİ -->
      <div id="panel-muhtelifgider" class="tab-panel">
        <!-- placeholder muhtelif -->
        <div class="bg-white p-5 rounded-2xl border shadow-sm">
          <h3 class="font-bold text-slate-800 mb-3">Muhtelif Giderler (${fover.length} kayıt · Toplam: ${formatNumber(totalOverhead,' ₺')})</h3>
          <div class="overflow-x-auto"><table class="min-w-full text-sm divide-y divide-gray-200">
            <thead class="bg-gray-50"><tr>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">Tarih</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">Açıklama</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">Tutar</th>
            </tr></thead>
            <tbody class="divide-y divide-gray-100">
              ${fover.map(e => `<tr>
                <td class="px-4 py-2">${new Date(e.date).toLocaleDateString('tr-TR')}</td>
                <td class="px-4 py-2 font-semibold">${e.description}</td>
                <td class="px-4 py-2 text-rose-700 font-bold">${formatNumber(e.amount,' ₺')}</td>
              </tr>`).join('')}
            </tbody>
          </table></div>
        </div>
      </div>

      <!-- PİRİNA GELİRİ PANELİ -->
      <div id="panel-pirinagelir" class="tab-panel">
        <!-- placeholder pirina -->
        <div class="bg-white p-5 rounded-2xl border shadow-sm">
          <h3 class="font-bold text-slate-800 mb-3">Pirina Gelirleri (${pomace.length} kayıt · Toplam: ${formatNumber(totalPomace,' ₺')})</h3>
          <div class="overflow-x-auto"><table class="min-w-full text-sm divide-y divide-gray-200">
            <thead class="bg-gray-50"><tr>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">Tarih</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">Tır</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">Yük</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">Fiyat/kg</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">Toplam Gelir</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">Açıklama</th>
            </tr></thead>
            <tbody class="divide-y divide-gray-100">
              ${pomace.map(r => `<tr>
                <td class="px-4 py-2">${new Date(r.date).toLocaleDateString('tr-TR')}</td>
                <td class="px-4 py-2">${r.truckCount} tır</td>
                <td class="px-4 py-2">${formatNumber(r.loadKg,' kg')}</td>
                <td class="px-4 py-2">${formatNumber(r.pricePerKg,' ₺')}</td>
                <td class="px-4 py-2 text-emerald-700 font-bold">${formatNumber(r.totalRevenue,' ₺')}</td>
                <td class="px-4 py-2 text-slate-500">${r.description||'-'}</td>
              </tr>`).join('')}
            </tbody>
          </table></div>
        </div>
      </div>

      <!-- TENEKE ALIM & STOK PANELİ -->
      <div id="panel-tenekestok" class="tab-panel space-y-4">
        <!-- Teneke Stok Durumu (Üstte) -->
        <div class="bg-white p-5 rounded-2xl border shadow-sm">
          <h3 class="font-bold text-slate-800 mb-4">Teneke Stok Durumu</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            ${['s16','s10','s5'].map(sz => {
              const s = detTeneke[sz];
              return `<div class="p-3 bg-slate-50 rounded-xl border text-center">
                <p class="font-bold text-slate-700 text-sm mb-2">${sz.replace('s','')}lık Teneke</p>
                <div class="grid grid-cols-3 gap-1 text-xs">
                  <div><span class="text-slate-400 block">Alınan</span><span class="font-bold">${s.alinan}</span></div>
                  <div><span class="text-slate-400 block">Kullanılan</span><span class="font-bold">${s.kullanilan}</span></div>
                  <div><span class="text-slate-400 block">Kalan</span><span class="font-bold text-emerald-600">${s.kalan}</span></div>
                </div>
                <p class="text-xs text-slate-500 mt-2 font-semibold">Değer: ${formatNumber(s.maliyet_kalan,' ₺')}</p>
              </div>`;
            }).join('')}
          </div>
          <div class="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-xl text-center font-bold text-orange-800">
            Toplam Kalan Teneke Stok Değeri: ${formatNumber(tenekeStokVal,' ₺')}
          </div>
        </div>

        <!-- Teneke Alımları (Altta) -->
        <div class="bg-white p-5 rounded-2xl border shadow-sm">
          <h3 class="font-bold text-slate-800 mb-3">Teneke Alımları (${tinP.length} kayıt · Toplam: ${formatNumber(totalTinCost,' ₺')})</h3>
          <div class="overflow-x-auto"><table class="min-w-full text-sm divide-y divide-gray-200">
            <thead class="bg-gray-50"><tr>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">Tarih</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">16'lık</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">10'luk</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">5'lik</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">Toplam Maliyet</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">Açıklama</th>
            </tr></thead>
            <tbody class="divide-y divide-gray-100">
              ${tinP.map(p => `<tr>
                <td class="px-4 py-2">${new Date(p.date).toLocaleDateString('tr-TR')}</td>
                <td class="px-4 py-2">${p.s16||0} ad</td>
                <td class="px-4 py-2">${p.s10||0} ad</td>
                <td class="px-4 py-2">${p.s5||0} ad</td>
                <td class="px-4 py-2 text-rose-700 font-bold">${formatNumber(p.totalCost,' ₺')}</td>
                <td class="px-4 py-2 text-slate-500">${p.description||'-'}</td>
              </tr>`).join('')}
            </tbody>
          </table></div>
        </div>
      </div>

      <!-- BİDON ALIM & STOK PANELİ -->
      <div id="panel-bidonstok" class="tab-panel space-y-4">
        <!-- Bidon Stok Durumu (Üstte) -->
        <div class="bg-white p-5 rounded-2xl border shadow-sm">
          <h3 class="font-bold text-slate-800 mb-4">Bidon Stok Durumu</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            ${['s10','s5','s2'].map(sz => {
              const s = detBidon[sz];
              return `<div class="p-3 bg-slate-50 rounded-xl border text-center">
                <p class="font-bold text-slate-700 text-sm mb-2">${sz.replace('s','')}luk Bidon</p>
                <div class="grid grid-cols-3 gap-1 text-xs">
                  <div><span class="text-slate-400 block">Alınan</span><span class="font-bold">${s.alinan}</span></div>
                  <div><span class="text-slate-400 block">Kullanılan</span><span class="font-bold">${s.kullanilan}</span></div>
                  <div><span class="text-slate-400 block">Kalan</span><span class="font-bold text-emerald-600">${s.kalan}</span></div>
                </div>
                <p class="text-xs text-slate-500 mt-2 font-semibold">Değer: ${formatNumber(s.maliyet_kalan,' ₺')}</p>
              </div>`;
            }).join('')}
          </div>
          <div class="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-xl text-center font-bold text-teal-800">
            Toplam Kalan Bidon Stok Değeri: ${formatNumber(bidonStokVal,' ₺')}
          </div>
        </div>

        <!-- Bidon Alımları (Altta) -->
        <div class="bg-white p-5 rounded-2xl border shadow-sm">
          <h3 class="font-bold text-slate-800 mb-3">Bidon Alımları (${plasP.length} kayıt · Toplam: ${formatNumber(totalPlasCost,' ₺')})</h3>
          <div class="overflow-x-auto"><table class="min-w-full text-sm divide-y divide-gray-200">
            <thead class="bg-gray-50"><tr>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">Tarih</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">10'luk</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">5'lik</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">2'lik</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">Toplam Maliyet</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-500">Açıklama</th>
            </tr></thead>
            <tbody class="divide-y divide-gray-100">
              ${plasP.map(p => `<tr>
                <td class="px-4 py-2">${new Date(p.date).toLocaleDateString('tr-TR')}</td>
                <td class="px-4 py-2">${p.s10||0} ad</td>
                <td class="px-4 py-2">${p.s5||0} ad</td>
                <td class="px-4 py-2">${p.s2||0} ad</td>
                <td class="px-4 py-2 text-rose-700 font-bold">${formatNumber(p.totalCost,' ₺')}</td>
                <td class="px-4 py-2 text-slate-500">${p.description||'-'}</td>
              </tr>`).join('')}
            </tbody>
          </table></div>
        </div>
      </div>
    </div>

  </main>

  <footer class="text-center text-xs text-slate-400 py-8 mt-8 border-t">
    <p>© ${new Date().getFullYear()} Saf Damla Zeytinyağı Fabrikası. Tüm Hakları Saklıdır.</p>
    <p class="mt-1">Bu dosya internet gerektirmeyen bağımsız bir yedekleme raporudur. Yedekleme: ${dateStr}</p>
  </footer>

  <script>
    function switchTab(name) {
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('panel-' + name).classList.add('active');
      const allColorClasses = ['bg-rose-600','bg-emerald-600','bg-orange-600','bg-amber-600','bg-lime-600','bg-blue-600','bg-teal-600','bg-purple-600','bg-slate-600','text-white','shadow'];
      document.querySelectorAll('.tab-main-btn').forEach(b => {
        b.classList.remove(...allColorClasses);
        b.classList.add('bg-white','border','text-slate-700');
      });
      const btn = document.getElementById('tab-btn-' + name);
      btn.classList.remove('bg-white','border','text-slate-700');
      const colorMap = { borclular:'bg-rose-600', borcsuzlar:'bg-emerald-600', iscigider:'bg-orange-600', muhtelifgider:'bg-amber-600', pirinagelir:'bg-lime-600', tenekestok:'bg-blue-600', bidonstok:'bg-teal-600' };
      btn.classList.add(colorMap[name] || 'bg-slate-600', 'text-white', 'shadow');
    }

    function filterCards(panel) {
      const q = document.getElementById('search-' + panel).value.toLowerCase();
      document.querySelectorAll('#list-' + panel + ' .customer-card').forEach(card => {
        card.style.display = card.dataset.name.includes(q) ? '' : 'none';
      });
    }

    function toggleDet(id) {
      const el = document.getElementById('det-' + id);
      const btn = el.previousElementSibling;
      if (el.classList.contains('hidden')) {
        el.classList.remove('hidden');
        btn.textContent = '▾ İşlem Detaylarını Gizle';
      } else {
        el.classList.add('hidden');
        btn.textContent = '▸ İşlem Detayları (' + el.children.length + ')';
      }
    }
  </script>
</body>
</html>`;

      const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
      const link = document.createElement('a');
      link.setAttribute('href', URL.createObjectURL(blob));
      link.setAttribute('download', `safdamla_tam_yedek_${tarihDosya}.html`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('HTML yedek hatası:', err);
      alert('HTML yedek dosyası oluşturulurken hata oluştu.');
    }
  };

  /* ─── RENDER ─── */
  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Veri Yedekleme</h1>

      {/* BİLGİ KUTUSU */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold mb-1">Yedekleme Hakkında</p>
          <p>Yedek dosyaları <strong>tüm fabrika verilerini</strong> (ana ekran özeti, gelir/gider, stok, borçlu/borçsuz müşteriler) içerir. Tarih ve saat bilgisi dosya adına ve içeriğe yazılır.</p>
        </div>
      </div>

      {/* TXT YEDEĞİ */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border shadow space-y-3">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Metin Dosyası (.txt)</h2>
        </div>
        <p className="text-sm text-gray-600">
          Tüm verileri düz metin formatında indirir. Ana ekran özeti, fabrika gelir/gider, stok durumu,
          <strong> borçlu ve borçsuz müşteriler ayrı bölümler halinde</strong> tek dosyada yer alır.
        </p>
        <button
          onClick={handleDownloadTxt}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow transition-colors min-h-[48px] text-sm"
        >
          <Download className="w-5 h-5" />
          <span>Tam Veri Yedeği İndir (.txt)</span>
        </button>
      </div>

      {/* HTML YEDEĞİ */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border shadow space-y-3">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">İnteraktif HTML Raporu (.html)</h2>
        </div>
        <p className="text-sm text-gray-600">
          Tarayıcıda açılabilen, arama ve sekme destekli interaktif rapor. Tek dosyada
          <strong> borçlu müşteriler 🔴</strong> ve <strong>borçsuz müşteriler 🟢</strong> ayrı sekmelerde,
          tüm fabrika verileri ve dashboard özeti ile birlikte yer alır.
        </p>
        <button
          onClick={handleDownloadHtmlBackup}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-colors min-h-[48px] text-sm"
        >
          <Download className="w-5 h-5" />
          <span>Tam İnteraktif Rapor İndir (.html)</span>
        </button>
      </div>
    </div>
  );
};

export default BackupPage;
