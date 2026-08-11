import React, { useState } from 'react';
import { Search, Calendar, Download, Plus, Edit, Trash2, Printer } from 'lucide-react';
import { formatNumber, formatOilRatioDisplay, printTransactionReceipt } from '../components/utils';

const Records = ({ 
  customers, 
  transactions, 
  onOpenNewTransactionModal, 
  onEditTransaction, 
  onDeleteTransaction, 
  navigateToCustomerDetails 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedCustomerId, setExpandedCustomerId] = useState(null);

  const customerSummary = customers.map(customer => {
    const customerTransactions = transactions.filter(t => t.customerId === customer.id);
    const totalCustomerBilled = customerTransactions.reduce((sum, t) => sum + Number(t.totalCost || 0), 0);
    const totalCustomerPaid = customerTransactions.reduce((sum, t) => sum + Number(t.paymentReceived || 0), 0);
    const totalCustomerLoss = customerTransactions.reduce((sum, t) => sum + Number(t.paymentLoss || 0), 0);
    const totalCustomerOlive = customerTransactions.reduce((sum, t) => sum + Number(t.oliveKg || 0), 0);
    return { 
      ...customer, 
      totalBilled: totalCustomerBilled, 
      totalPaid: totalCustomerPaid, 
      totalOlive: totalCustomerOlive, 
      remainingBalance: totalCustomerBilled - totalCustomerPaid - totalCustomerLoss, 
      transactions: customerTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)) 
    };
  }).sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(Number(a.id) || 0);
    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(Number(b.id) || 0);
    return dateB - dateA;
  });

  const filteredCustomers = customerSummary.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const customerHasTransactionsInDateRange = customer.transactions.some(t => {
      const transactionDate = new Date(t.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      return (!start || transactionDate >= start) && (!end || transactionDate <= end);
    });
    return matchesSearch && (customer.transactions.length === 0 || customerHasTransactionsInDateRange);
  });

  const handleExport = () => {
    const headers = ["Müşteri Adı", "İşlem Tarihi", "Zeytin (kg)", "Yağ (L)", "Yağ Oranı", "Kg Başına Ücret (₺)", "Teneke Kap Sayısı", "Teneke Kap Fiyatı (₺)", "Plastik Kap Sayısı", "Plastik Kap Fiyatı (₺)", "Toplam Ücret (₺)", "Alınan Ödeme (₺)", "Kalan Bakiye (₺)"];
    let csvContent = headers.join(";") + "\n";
    filteredCustomers.forEach(customer => {
      customer.transactions.forEach(t => {
        const row = [
          `"${customer.name}"`, 
          new Date(t.date).toLocaleDateString(), 
          t.oliveKg || 0, 
          t.oilLitre || 0, 
          formatOilRatioDisplay(t.oliveKg, t.oilLitre), 
          t.pricePerKg || 0, 
          (t.tinCounts?.s16 || 0) + (t.tinCounts?.s10 || 0) + (t.tinCounts?.s5 || 0), 
          t.tinPrice || 0, 
          (t.plasticCounts?.s10 || 0) + (t.plasticCounts?.s5 || 0) + (t.plasticCounts?.s2 || 0), 
          t.plasticPrice || 0, 
          t.totalCost || 0, 
          t.paymentReceived || 0, 
          (t.totalCost || 0) - (t.paymentReceived || 0) - (t.paymentLoss || 0)
        ];
        csvContent += row.join(";") + "\n";
      });
    });
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `zeytinyagi_kayitlar_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Kayıtlar</h1>
      
      {/* Filtreleme ve Arama Çubuğu */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow border flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Müşteri Ara..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-10 pr-4 py-3 border rounded-lg w-full min-h-[48px]" 
            />
          </div>
          <div className="relative w-full">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="pl-10 pr-4 py-3 border rounded-lg w-full min-h-[48px]" 
            />
          </div>
          <div className="relative w-full">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="pl-10 pr-4 py-3 border rounded-lg w-full min-h-[48px]" 
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 justify-end w-full">
          <button 
            onClick={handleExport} 
            className="flex items-center justify-center space-x-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm min-h-[48px]"
          >
            <Download className="w-5 h-5" />
            <span>Dışa Aktar</span>
          </button>
          <button 
            onClick={() => onOpenNewTransactionModal(null)} 
            className="flex items-center justify-center space-x-2 px-5 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm min-h-[48px]"
          >
            <Plus className="w-5 h-5" />
            <span>İşlem Ekle</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow border">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Müşteri Kayıtları</h2>
        {filteredCustomers.length === 0 ? (
          <p className="text-gray-500">Filtrelerinize uygun müşteri bulunamadı.</p>
        ) : (
          <>
            {/* MASAÜSTÜ GÖRÜNÜMÜ */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Müşteri Adı</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toplam Zeytin (kg)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toplam Ücret</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alınan Ödeme</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kalan Bakiye</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map(customer => (
                    <React.Fragment key={customer.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => navigateToCustomerDetails('customerDetails', customer)} 
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold transition-colors hover:bg-blue-200"
                          >
                            {customer.name}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{formatNumber(customer.totalOlive)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{formatNumber(customer.totalBilled, ' ₺')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium">{formatNumber(customer.totalPaid, ' ₺')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">{formatNumber(customer.remainingBalance, ' ₺')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button 
                            onClick={() => setExpandedCustomerId(expandedCustomerId === customer.id ? null : customer.id)} 
                            className="text-blue-600 hover:text-blue-900 font-semibold"
                          >
                            {expandedCustomerId === customer.id ? 'Daralt' : 'İşlemleri Gör'} ({customer.transactions.length})
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => onOpenNewTransactionModal({ customerId: customer.id, customerName: customer.name })} className="px-3 py-1 text-xs bg-emerald-600 text-white rounded-md hover:bg-emerald-700 shadow-sm mr-2 min-h-[30px]">İşlem Ekle</button>
                          <button onClick={() => navigateToCustomerDetails('customerDetails', customer)} className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 hover:text-gray-800 transition-colors"><Edit className="w-5 h-5" /></button>
                        </td>
                      </tr>
                      {expandedCustomerId === customer.id && customer.transactions.length > 0 && (
                        <tr className="bg-gray-50">
                          <td colSpan="7" className="p-0">
                            <div className="px-6 py-4">
                              <h4 className="text-md font-semibold text-gray-700 mb-2">İşlem Detayları:</h4>
                              <div className="overflow-x-auto border rounded-lg shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Tarih</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Açıklama</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Ücret</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Alınan Ödeme</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Bakiye</th>
                                      <th className="px-4 py-2"></th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-100">
                                    {customer.transactions.map(t => {
                                      const remainingBalance = (t.totalCost || 0) - (t.paymentReceived || 0) - (t.paymentLoss || 0);
                                      const description = t.description ? `${t.description} (${formatNumber(t.oliveKg)} kg zeytin)` : `${formatNumber(t.oliveKg)} kg zeytin`;
                                      return (
                                        <tr key={t.id}>
                                          <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(t.date).toLocaleDateString()}</td>
                                          <td className="px-4 py-2 whitespace-nowrap text-sm">{description}</td>
                                          <td className="px-4 py-2 whitespace-nowrap text-sm">{formatNumber(t.totalCost, ' ₺')}</td>
                                          <td className="px-4 py-2 whitespace-nowrap text-sm">{formatNumber(t.paymentReceived, ' ₺')}</td>
                                          <td className={`px-4 py-2 whitespace-nowrap text-sm ${remainingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatNumber(remainingBalance, ' ₺')}</td>
                                          <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => printTransactionReceipt({ ...t, customerName: customer.name })} title="Fiş Yazdır" className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 inline-flex items-center min-h-[32px] mr-1"><Printer className="w-4 h-4" /></button>
                                            <button onClick={() => onEditTransaction(t)} className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 hover:text-gray-800 transition-colors mr-1" disabled={t.description === 'Ara Tahsilat'}><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => onDeleteTransaction(t.id)} className="text-red-600 p-2 rounded-full hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBİL GÖRÜNÜMÜ */}
            <div className="block md:hidden space-y-4">
              {filteredCustomers.map(customer => (
                <div key={customer.id} className="bg-white p-4 rounded-lg border shadow-sm space-y-3">
                  <div className="flex justify-between items-start border-b pb-2">
                    <div>
                      <h3 className="font-bold text-gray-800 text-base">{customer.name}</h3>
                      <p className="text-xs text-gray-500">{customer.transactions.length} İşlem | {formatNumber(customer.totalOlive, ' kg')} Zeytin</p>
                    </div>
                    <span className={`text-sm font-bold ${customer.remainingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {formatNumber(customer.remainingBalance, ' ₺')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2 rounded border">
                    <div><span className="text-gray-500">Ücret:</span> {formatNumber(customer.totalBilled, ' ₺')}</div>
                    <div><span className="text-gray-500">Ödenen:</span> {formatNumber(customer.totalPaid, ' ₺')}</div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button onClick={() => onOpenNewTransactionModal({ customerId: customer.id, customerName: customer.name })} className="flex-1 px-3 py-2 bg-emerald-600 text-white text-xs font-semibold rounded hover:bg-emerald-700 min-h-[36px]">İşlem Ekle</button>
                    <button onClick={() => navigateToCustomerDetails('customerDetails', customer)} className="px-3 py-2 bg-gray-200 text-gray-700 text-xs font-semibold rounded hover:bg-gray-300 min-h-[36px]">Detay</button>
                    <button onClick={() => setExpandedCustomerId(expandedCustomerId === customer.id ? null : customer.id)} className="px-3 py-2 bg-gray-100 text-gray-600 text-xs font-semibold rounded hover:bg-gray-200 min-h-[36px]">
                      {expandedCustomerId === customer.id ? 'Gizle' : 'İşlemler'}
                    </button>
                  </div>

                  {expandedCustomerId === customer.id && (
                    <div className="pt-2 border-t space-y-2">
                      {customer.transactions.map(t => {
                        const remainingBalance = (t.totalCost || 0) - (t.paymentReceived || 0) - (t.paymentLoss || 0);
                        const description = t.description ? `${t.description} (${formatNumber(t.oliveKg)} kg zeytin)` : `${formatNumber(t.oliveKg)} kg zeytin`;
                        return (
                          <div key={t.id} className="bg-white p-2 rounded border text-xs space-y-1 relative shadow-sm">
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-500">{new Date(t.date).toLocaleDateString()}</span>
                              <span className={`font-bold ${remainingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>Bakiye: {formatNumber(remainingBalance, ' ₺')}</span>
                            </div>
                            <p className="text-gray-700">{description}</p>
                            <div className="flex justify-between pt-1 border-t mt-1">
                              <span>Ücret: {formatNumber(t.totalCost, ' ₺')}</span>
                              <span>Ödenen: {formatNumber(t.paymentReceived, ' ₺')}</span>
                            </div>
                            <div className="flex justify-end gap-1 pt-1">
                              <button onClick={() => printTransactionReceipt({ ...t, customerName: customer.name })} title="Fiş Yazdır" className="p-1 text-blue-600 bg-blue-50 rounded hover:bg-blue-100 min-h-[28px] border border-blue-200"><Printer className="w-3 h-3" /></button>
                              <button onClick={() => onEditTransaction(t)} className="p-1 bg-gray-100 text-gray-600 rounded border hover:bg-gray-200 min-h-[28px]" disabled={t.description === 'Ara Tahsilat'}><Edit className="w-3 h-3" /></button>
                              <button onClick={() => onDeleteTransaction(t.id)} className="p-1 text-red-600 bg-red-50 rounded hover:bg-red-100 min-h-[28px] border border-red-200"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Records;
