import React, { useRef } from 'react';
import { List, Info, Droplet, Percent, DollarSign, Package, Trash2, Edit, Share2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import SummaryCard from '../components/SummaryCard';
import { formatNumber, formatOilRatioDisplay, roundToTwo } from '../components/utils';

const CustomerDetails = ({ 
  customer, 
  transactions, 
  onEditTransaction, 
  onDeleteTransaction, 
  onBack, 
  onDeleteCustomer 
}) => {
  const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current;
    if (printContent) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write('<html><head><title>Müşteri Detayları</title>');
      printWindow.document.write(`
        <style>
          @media print { @page { size: A5; margin: 10mm; } }
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
          .print-header { text-align: center; font-size: 1.6rem; font-weight: bold; margin-bottom: 8px; letter-spacing: 1px; }
          .print-section { margin-bottom: 8px; }
          .print-table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
          .print-table th, .print-table td { border: 1px solid #bbb; padding: 4px 6px; text-align: left; }
          .print-table th { background: #f3f3f3; }
          .print-summary { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
          .print-summary-item { flex: 1 1 40%; min-width: 120px; margin-bottom: 2px; }
          .print-label { font-weight: bold; }
          .print-value { margin-left: 4px; }
          .print-border { border:2px dashed #333; border-radius:12px; padding:18px; max-width:650px; margin:0 auto; }
        </style>
      `);
      printWindow.document.write('</head><body>');
      printWindow.document.write('<div class="print-border">');
      printWindow.document.write('<div class="print-header">SAF DAMLA ZEYTİNYAĞI FABRİKASI</div>');
      printWindow.document.write('<div class="print-section print-summary">');
      printWindow.document.write(`<div class="print-summary-item"><span class="print-label">Müşteri:</span><span class="print-value">${customer.name}</span></div>`);
      printWindow.document.write(`<div class="print-summary-item"><span class="print-label">Toplam İşlem:</span><span class="print-value">${transactions.length}</span></div>`);
      printWindow.document.write(`<div class="print-summary-item"><span class="print-label">İşlenen Zeytin:</span><span class="print-value">${formatNumber(totalOliveProcessed, ' kg')}</span></div>`);
      printWindow.document.write(`<div class="print-summary-item"><span class="print-label">Üretilen Yağ:</span><span class="print-value">${formatNumber(totalOilProduced, ' L')}</span></div>`);
      printWindow.document.write(`<div class="print-summary-item"><span class="print-label">Yağ Oranı:</span><span class="print-value">${(totalOliveProcessed > 0 && totalOilProduced > 0) ? (totalOliveProcessed / totalOilProduced).toFixed(2) : '-'}</span></div>`);
      printWindow.document.write(`<div class="print-summary-item"><span class="print-label">Toplam Ücret:</span><span class="print-value">${formatNumber(totalBilledAmount, ' ₺')}</span></div>`);
      printWindow.document.write(`<div class="print-summary-item"><span class="print-label">Alınan Ödeme:</span><span class="print-value">${formatNumber(totalPaymentReceived, ' ₺')}</span></div>`);
      printWindow.document.write(`<div class="print-summary-item"><span class="print-label">Kalan Bakiye:</span><span class="print-value">${formatNumber(remainingBalance, ' ₺')}</span></div>`);
      printWindow.document.write(`<div class="print-summary-item"><span class="print-label">Kullanılan Kaplar:</span><span class="print-value">Teneke: ${totalTinCount}, Bidon: ${totalPlasticCount}</span></div>`);
      printWindow.document.write('</div>');
      
      printWindow.document.write('<div class="print-section"><div class="print-label" style="margin-bottom:4px;">İşlem Geçmişi</div>');
      printWindow.document.write('<table class="print-table"><thead><tr><th>Tarih</th><th>Açıklama</th><th>Ücret</th><th>Alınan</th><th>Bakiye</th></tr></thead><tbody>');
      transactions.forEach(t => {
        const bakiye = (t.totalCost || 0) - (t.paymentReceived || 0) - (t.paymentLoss || 0);
        const description = t.description ? `${t.description} (${formatNumber(t.oliveKg)} kg zeytin)` : `${formatNumber(t.oliveKg)} kg zeytin`;
        printWindow.document.write(`<tr><td>${new Date(t.date).toLocaleDateString()}</td><td>${description}</td><td>${formatNumber(t.totalCost, ' ₺')}</td><td>${formatNumber(t.paymentReceived, ' ₺')}</td><td>${formatNumber(bakiye, ' ₺')}</td></tr>`);
      });
      printWindow.document.write('</tbody></table></div>');
      printWindow.document.write('</div>');
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 300);
    }
  };

  const handleDownloadPDF = async () => {
    if (!customer) return;
    
    try {
      const printableDiv = document.createElement('div');
      printableDiv.style.position = 'absolute';
      printableDiv.style.left = '-9999px';
      printableDiv.style.width = '210mm';
      printableDiv.style.padding = '20px';
      printableDiv.style.fontFamily = 'Arial, sans-serif';
      printableDiv.style.fontSize = '14px';
      printableDiv.style.backgroundColor = 'white';
      
      printableDiv.innerHTML = `
        <div style="border: 2px dashed #333; border-radius: 12px; padding: 20px; max-width: 500px; margin: 0 auto; background: #fff;">
          <h2 style="text-align: center; font-weight: 700; font-size: 20px; margin-bottom: 10px;">SAF DAMLA ZEYTİNYAĞI FABRİKASI</h2>
          <table style="width: 100%; margin-bottom: 15px; font-size: 13px;">
            <tbody>
              <tr><td style="padding: 2px 0;"><b>Müşteri:</b></td><td style="padding: 2px 0;">${customer.name}</td><td style="padding: 2px 0;"><b>Toplam İşlem:</b></td><td style="padding: 2px 0;">${transactions.length}</td></tr>
              <tr><td style="padding: 2px 0;"><b>İşlenen Zeytin:</b></td><td style="padding: 2px 0;">${formatNumber(totalOliveProcessed, 'kg')}</td><td style="padding: 2px 0;"><b>Üretilen Yağ:</b></td><td style="padding: 2px 0;">${formatNumber(totalOilProduced, 'L')}</td></tr>
              <tr><td style="padding: 2px 0;"><b>Yağ Oranı:</b></td><td style="padding: 2px 0;">${(totalOliveProcessed > 0 && totalOilProduced > 0) ? (totalOliveProcessed / totalOilProduced).toFixed(2) : '-'}</td><td style="padding: 2px 0;"><b>Toplam Ücret:</b></td><td style="padding: 2px 0;">${formatNumber(totalBilledAmount, '₺')}</td></tr>
              <tr><td style="padding: 2px 0;"><b>Alınan Ödeme:</b></td><td style="padding: 2px 0;">${formatNumber(totalPaymentReceived, '₺')}</td><td style="padding: 2px 0;"><b>Kalan Bakiye:</b></td><td style="padding: 2px 0;">${formatNumber(remainingBalance, '₺')}</td></tr>
              <tr><td colspan="4" style="padding: 2px 0;"><b>Kullanılan Kaplar:</b> Teneke: ${totalTinCount}, Bidon: ${totalPlasticCount}</td></tr>
            </tbody>
          </table>
          <h3 style="font-weight: 600; font-size: 16px; margin-bottom: 10px;">İşlem Geçmişi</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background-color: #f3f3f3;">
                <th style="border: 1px solid #bbbbbb; padding: 6px; text-align: left;">Tarih</th>
                <th style="border: 1px solid #bbbbbb; padding: 6px; text-align: left;">Açıklama</th>
                <th style="border: 1px solid #bbbbbb; padding: 6px; text-align: right;">Ücret</th>
                <th style="border: 1px solid #bbbbbb; padding: 6px; text-align: right;">Alınan</th>
                <th style="border: 1px solid #bbbbbb; padding: 6px; text-align: right;">Bakiye</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(t => {
                const bakiye = (t.totalCost || 0) - (t.paymentReceived || 0) - (t.paymentLoss || 0);
                const description = t.description ? `${t.description} (${formatNumber(t.oliveKg)} kg zeytin)` : `${formatNumber(t.oliveKg)} kg zeytin`;
                return `
                  <tr>
                    <td style="border: 1px solid #bbbbbb; padding: 4px;">${new Date(t.date).toLocaleDateString()}</td>
                    <td style="border: 1px solid #bbbbbb; padding: 4px;">${description}</td>
                    <td style="border: 1px solid #bbbbbb; padding: 4px; text-align: right;">${formatNumber(t.totalCost, '₺')}</td>
                    <td style="border: 1px solid #bbbbbb; padding: 4px; text-align: right;">${formatNumber(t.paymentReceived, '₺')}</td>
                    <td style="border: 1px solid #bbbbbb; padding: 4px; text-align: right;">${formatNumber(bakiye, '₺')}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
      
      document.body.appendChild(printableDiv);
      
      const canvas = await html2canvas(printableDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: 'white',
        width: 800,
        height: 1000
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const tarih = new Date().toLocaleDateString('tr-TR').replace(/\./g, '_');
      pdf.save(`${customer.name}_Musteri_Detay_${tarih}.pdf`);
      document.body.removeChild(printableDiv);
      
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert('PDF oluşturulurken hata oluştu!');
    }
  };

  if (!customer) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Müşteri seçilmedi.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 min-h-[44px]">Geri Dön</button>
      </div>
    );
  }

  const totalOliveProcessed = transactions.reduce((sum, t) => sum + Number(t.oliveKg || 0), 0);
  const totalOilProduced = transactions.reduce((sum, t) => sum + Number(t.oilLitre || 0), 0);
  const totalBilledAmount = transactions.reduce((sum, t) => sum + Number(t.totalCost || 0), 0);
  const totalPaymentReceived = transactions.reduce((sum, t) => sum + Number(t.paymentReceived || 0), 0);
  const totalPaymentLoss = transactions.reduce((sum, t) => sum + Number(t.paymentLoss || 0), 0);
  const remainingBalance = totalBilledAmount - totalPaymentReceived - totalPaymentLoss;
  const totalTinCount = transactions.reduce((sum, t) => sum + (Number(t.tinCounts?.s16) || 0) + (Number(t.tinCounts?.s10) || 0) + (Number(t.tinCounts?.s5) || 0), 0);
  const totalPlasticCount = transactions.reduce((sum, t) => sum + (Number(t.plasticCounts?.s10) || 0) + (Number(t.plasticCounts?.s5) || 0) + (Number(t.plasticCounts?.s2) || 0), 0);
  const avgOilRatioDisplay = formatOilRatioDisplay(totalOliveProcessed, totalOilProduced);

  const handleShareWhatsApp = () => {
    if (!customer) return;

    let text = `*SAF DAMLA ZEYTİNYAĞI FABRİKASI*\n`;
    text += `*Müşteri Raporu:* ${customer.name}\n`;
    text += `*Tarih:* ${new Date().toLocaleDateString('tr-TR')}\n`;
    text += `----------------------------------\n`;
    text += `*ÖZET BİLGİLER*\n`;
    text += `• Toplam İşlem: ${transactions.length}\n`;
    text += `• İşlenen Zeytin: ${formatNumber(totalOliveProcessed, ' kg')}\n`;
    text += `• Üretilen Yağ: ${formatNumber(totalOilProduced, ' L')}\n`;
    text += `• Ortalama Yağ Oranı: ${avgOilRatioDisplay}\n`;
    text += `• Toplam Ücret: ${formatNumber(totalBilledAmount, ' ₺')}\n`;
    text += `• Alınan Ödeme: ${formatNumber(totalPaymentReceived, ' ₺')}\n`;
    text += `• Ödeme Firesi: ${formatNumber(totalPaymentLoss, ' ₺')}\n`;
    text += `• *Kalan Bakiye: ${formatNumber(remainingBalance, ' ₺')}*\n`;
    text += `• Kullanılan Kaplar: Teneke: ${totalTinCount}, Bidon: ${totalPlasticCount}\n`;
    text += `----------------------------------\n`;
    
    if (transactions.length > 0) {
      text += `*İŞLEM GEÇMİŞİ*\n`;
      transactions.forEach(t => {
        const bakiye = (t.totalCost || 0) - (t.paymentReceived || 0) - (t.paymentLoss || 0);
        const desc = t.description ? `${t.description} (${formatNumber(t.oliveKg)} kg zeytin)` : `${formatNumber(t.oliveKg)} kg zeytin`;
        text += `\n• *${new Date(t.date).toLocaleDateString('tr-TR')}*\n`;
        text += `  Detay: ${desc}\n`;
        text += `  Tutar: ${formatNumber(t.totalCost, ' ₺')} | Alınan: ${formatNumber(t.paymentReceived, ' ₺')} | Bakiye: ${formatNumber(bakiye, ' ₺')}\n`;
      });
    }

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Üst Alan */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Müşteri Detayları: {customer.name}</h1>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <button onClick={onBack} className="flex-1 lg:flex-none px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold min-h-[40px] text-sm">Geri Dön</button>
          <button onClick={handleDownloadPDF} className="flex-1 lg:flex-none px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-sm min-h-[40px] text-sm transition-colors">PDF İndir</button>
          <button onClick={handleShareWhatsApp} className="flex-1 lg:flex-none px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-sm min-h-[40px] text-sm transition-colors flex items-center justify-center">
            <Share2 className="w-4 h-4 mr-2" />
            <span>WhatsApp Paylaş</span>
          </button>
          <button onClick={handlePrint} className="flex-1 lg:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm min-h-[40px] text-sm transition-colors">Yazdır</button>
          <button 
            onClick={() => onDeleteCustomer(customer.id, customer.name)} 
            className="w-full lg:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm min-h-[40px] text-sm transition-colors flex items-center justify-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            <span>Müşteriyi Sil</span>
          </button>
        </div>
      </div>
      
      {/* Özet Bilgiler */}
      <div ref={printRef}>
        <div className="bg-white p-4 sm:p-6 rounded-xl border shadow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <SummaryCard title="Toplam İşlem Sayısı" value={transactions.length} icon={<List className="w-6 h-6 text-blue-600" />} />
          <SummaryCard title="İşlenen Zeytin" value={formatNumber(totalOliveProcessed, ' kg')} icon={<Info className="w-6 h-6 text-emerald-600" />} />
          <SummaryCard title="Üretilen Yağ" value={formatNumber(totalOilProduced, ' L')} icon={<Droplet className="w-6 h-6 text-blue-600" />} />
          <SummaryCard title="Ortalama Yağ Oranı" value={avgOilRatioDisplay} icon={<Percent className="w-6 h-6 text-purple-600" />} />
          <SummaryCard title="Toplam Ücret" value={formatNumber(totalBilledAmount, ' ₺')} icon={<DollarSign className="w-6 h-6 text-emerald-600" />} />
          <SummaryCard title="Kullanılan Kaplar" value={`Teneke: ${totalTinCount}, Bidon: ${totalPlasticCount}`} icon={<Package className="w-6 h-6 text-orange-600" />} />
          <SummaryCard title="Alınan Ödeme" value={formatNumber(totalPaymentReceived, ' ₺')} icon={<DollarSign className="w-6 h-6 text-blue-600" />} />
          <SummaryCard title="Ödeme Firesi" value={formatNumber(totalPaymentLoss, ' ₺')} icon={<Trash2 className="w-6 h-6 text-orange-600" />} />
          <SummaryCard title="Kalan Bakiye" value={formatNumber(remainingBalance, ' ₺')} icon={<Info className="w-6 h-6 text-red-600" />} />
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">İşlem Geçmişi</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-500">Bu müşteriye ait henüz bir işlem bulunmamaktadır.</p>
          ) : (
            <>
              {/* MASAÜSTÜ TABLOSU */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Açıklama</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ücret</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alınan Ödeme</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bakiye</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map(t => {
                      const remainingBalance = (t.totalCost || 0) - (t.paymentReceived || 0) - (t.paymentLoss || 0);
                      const description = t.description ? `${t.description} (${formatNumber(t.oliveKg)} kg zeytin)` : `${formatNumber(t.oliveKg)} kg zeytin`;
                      return (
                        <tr key={t.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">{new Date(t.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{description}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{formatNumber(t.totalCost, ' ₺')}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-emerald-600">{formatNumber(t.paymentReceived, ' ₺')}</td>
                          <td className={`px-6 py-4 whitespace-nowrap font-semibold ${remainingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatNumber(remainingBalance, ' ₺')}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => onEditTransaction(t)} className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 hover:text-gray-800 transition-colors mr-2 inline-flex items-center min-h-[32px]" disabled={t.description === 'Ara Tahsilat'}><Edit className="w-4 h-4" /></button>
                            <button onClick={() => onDeleteTransaction(t.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-100 inline-flex items-center min-h-[32px]"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBİL KART GÖRÜNÜMÜ */}
              <div className="block md:hidden space-y-3">
                {transactions.map(t => {
                  const bakiye = (t.totalCost || 0) - (t.paymentReceived || 0) - (t.paymentLoss || 0);
                  const description = t.description ? `${t.description} (${formatNumber(t.oliveKg)} kg zeytin)` : `${formatNumber(t.oliveKg)} kg zeytin`;
                  return (
                    <div key={t.id} className="border rounded-xl p-4 shadow-sm bg-white space-y-2">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-xs text-gray-500 font-semibold">{new Date(t.date).toLocaleDateString()}</span>
                        <span className={`text-sm font-bold ${bakiye > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {formatNumber(bakiye, ' ₺')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-700">
                        <span className="font-semibold text-gray-400">Açıklama:</span> {description}
                      </div>
                      <div className="flex justify-between text-xs pt-1">
                        <span>Ücret: {formatNumber(t.totalCost, ' ₺')}</span>
                        <span>Alınan: {formatNumber(t.paymentReceived, ' ₺')}</span>
                      </div>
                      <div className="flex justify-end gap-2 border-t pt-2 mt-2">
                        <button 
                          onClick={() => onEditTransaction(t)} 
                          className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 border hover:bg-gray-200 rounded-lg text-xs min-h-[36px]"
                          disabled={t.description === 'Ara Tahsilat'}
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Düzenle</span>
                        </button>
                        <button 
                          onClick={() => onDeleteTransaction(t.id)} 
                          className="flex items-center space-x-1 px-3 py-2 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-lg text-xs min-h-[36px]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
      </div>
    </div>
  );
};

export default CustomerDetails;
