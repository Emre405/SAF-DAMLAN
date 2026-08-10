import React from 'react';
import { formatNumber } from './utils';

const PrintableReceipt = React.forwardRef(({ transactionData }, ref) => {
  const oliveCost = (Number(transactionData.oliveKg) || 0) * (Number(transactionData.pricePerKg) || 0);
  const tinCost = (Number(transactionData.tinCounts?.s16 || 0) * Number(transactionData.tinPrices?.s16 || 0)) + (Number(transactionData.tinCounts?.s10 || 0) * Number(transactionData.tinPrices?.s10 || 0)) + (Number(transactionData.tinCounts?.s5 || 0) * Number(transactionData.tinPrices?.s5 || 0));
  const plasticCost = (Number(transactionData.plasticCounts?.s10 || 0) * Number(transactionData.plasticPrices?.s10 || 0)) + (Number(transactionData.plasticCounts?.s5 || 0) * Number(transactionData.plasticPrices?.s5 || 0)) + (Number(transactionData.plasticCounts?.s2 || 0) * Number(transactionData.plasticPrices?.s2 || 0));
  const totalCost = oliveCost + tinCost + plasticCost;
  const remainingBalance = totalCost - (Number(transactionData.paymentReceived) || 0) - (Number(transactionData.paymentLoss) || 0);
  
  return (
    <div ref={ref} style={{ width: '100%', fontFamily: 'Arial, sans-serif', padding: '10px' }}>
      <div style={{ border: '2px dashed #333', borderRadius: 12, padding: '16px', maxWidth: '100%', margin: '0 auto', background: '#fff' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: 20, marginBottom: 4 }}>SAF DAMLA ZEYTİNYAĞI FABRİKASI</h2>
        <h3 style={{ textAlign: 'center', fontWeight: 600, fontSize: 16, marginBottom: 12 }}>İşlem Fişi / Makbuz</h3>
        <table style={{ width: '100%', marginBottom: 8, fontSize: 14 }}>
          <tbody>
            <tr><td style={{ padding: '2px 0' }}><b>Müşteri:</b></td><td style={{ padding: '2px 0' }}>{transactionData.customerName}</td></tr>
            <tr><td style={{ padding: '2px 0' }}><b>Tarih:</b></td><td style={{ padding: '2px 0' }}>{transactionData.date ? new Date(transactionData.date).toLocaleDateString() : ''}</td></tr>
            <tr><td style={{ padding: '2px 0' }}><b>Açıklama:</b></td><td style={{ padding: '2px 0' }}>{transactionData.description ? `${transactionData.description} (${formatNumber(transactionData.oliveKg)} kg zeytin)` : `${formatNumber(transactionData.oliveKg)} kg zeytin`}</td></tr>
          </tbody>
        </table>
        <hr style={{ margin: '8px 0' }} />
        <table style={{ width: '100%', fontSize: 14, marginBottom: 8 }}>
          <tbody>
            <tr><td style={{ padding: '2px 0' }}>Zeytin (kg):</td><td style={{ padding: '2px 0' }}>{transactionData.oliveKg || 0}</td></tr>
            <tr><td style={{ padding: '2px 0' }}>Çıkan Yağ (L):</td><td style={{ padding: '2px 0' }}>{transactionData.oilLitre || 0}</td></tr>
            <tr><td style={{ padding: '2px 0' }}>Kg Başına Ücret (₺):</td><td style={{ padding: '2px 0' }}>{transactionData.pricePerKg || 0}</td></tr>
            <tr><td style={{ padding: '2px 0' }}>Yağ Oranı:</td><td style={{ padding: '2px 0' }}>{(Number(transactionData.oliveKg) > 0 && Number(transactionData.oilLitre) > 0) ? (Number(transactionData.oliveKg) / Number(transactionData.oilLitre)).toFixed(2) : '-'}</td></tr>
            <tr><td style={{ padding: '2px 0' }}>Teneke (16/10/5):</td><td style={{ padding: '2px 0' }}>{transactionData.tinCounts?.s16 || 0} / {transactionData.tinCounts?.s10 || 0} / {transactionData.tinCounts?.s5 || 0}</td></tr>
            <tr><td style={{ padding: '2px 0' }}>Bidon (10/5/2):</td><td style={{ padding: '2px 0' }}>{transactionData.plasticCounts?.s10 || 0} / {transactionData.plasticCounts?.s5 || 0} / {transactionData.plasticCounts?.s2 || 0}</td></tr>
          </tbody>
        </table>
        <hr style={{ margin: '8px 0' }} />
        <table style={{ width: '100%', fontSize: 14, marginBottom: 8 }}>
          <tbody>
            <tr><td style={{ padding: '2px 0' }}>Zeytin Sıkım Ücreti:</td><td style={{ padding: '2px 0' }}>{oliveCost.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺</td></tr>
            <tr><td style={{ padding: '2px 0' }}>Teneke Fiyatı:</td><td style={{ padding: '2px 0' }}>{tinCost.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺</td></tr>
            <tr><td style={{ padding: '2px 0' }}>Bidon Fiyatı:</td><td style={{ padding: '2px 0' }}>{plasticCost.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺</td></tr>
            <tr><td style={{ padding: '2px 0' }}><b>Genel Toplam:</b></td><td style={{ padding: '2px 0' }}><b>{totalCost.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺</b></td></tr>
            <tr><td style={{ padding: '2px 0' }}>Alınan Ödeme:</td><td style={{ padding: '2px 0' }}>{(Number(transactionData.paymentReceived) || 0).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺</td></tr>
            <tr><td style={{ padding: '2px 0' }}><b>Kalan Bakiye:</b></td><td style={{ padding: '2px 0' }}><b>{remainingBalance.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺</b></td></tr>
          </tbody>
        </table>
        <hr style={{ margin: '8px 0' }} />
      </div>
    </div>
  );
});

export default PrintableReceipt;
