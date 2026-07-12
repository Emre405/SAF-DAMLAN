import React, { useState } from 'react';
import { Search, Info } from 'lucide-react';
import PaymentCollectionModal from '../components/PaymentCollectionModal';
import { formatNumber } from '../components/utils';

const OurCustomers = ({ 
  customers, 
  transactions, 
  navigateToCustomerDetails, 
  onOpenNewTransactionModal, 
  onCollectPayment, 
  onDeleteSelected 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [balanceFilter, setBalanceFilter] = useState('all'); // 'all', 'debtors', 'non-debtors'
  const [paymentModalState, setPaymentModalState] = useState({ isOpen: false, customer: null });
  const [selectedCustomers, setSelectedCustomers] = useState([]);

  const customerSummaries = customers.map(customer => {
      const customerTransactions = transactions.filter(t => t.customerId === customer.id);
      const totalBilled = customerTransactions.reduce((sum, t) => sum + Number(t.totalCost || 0), 0);
      const totalPaid = customerTransactions.reduce((sum, t) => sum + Number(t.paymentReceived || 0), 0);
      const totalLoss = customerTransactions.reduce((sum, t) => sum + Number(t.paymentLoss || 0), 0);
      return { ...customer, remainingBalance: totalBilled - totalPaid - totalLoss };
  });

  const sortedCustomers = customerSummaries.sort((a, b) => a.name.localeCompare(b.name, 'tr', { sensitivity: 'base' }));
  
  const filteredCustomers = sortedCustomers
    .filter(customer => customer.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(customer => {
      if (balanceFilter === 'debtors') {
        return customer.remainingBalance > 0;
      }
      if (balanceFilter === 'non-debtors') {
        return customer.remainingBalance <= 0;
      }
      return true;
    });

  const allVisibleCustomerIds = filteredCustomers.map(c => c.id);
  const isAllSelected = allVisibleCustomerIds.length > 0 && allVisibleCustomerIds.every(id => selectedCustomers.includes(id));
  
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCustomers(allVisibleCustomerIds);
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (id) => {
    setSelectedCustomers(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]);
  };

  const handleSavePayment = (customerId, customerName, amount) => {
    onCollectPayment(customerId, customerName, amount);
    setPaymentModalState({ isOpen: false, customer: null });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Müşterilerimiz</h1>
        
        {/* Arama ve Filtreleme */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Müşteri Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 w-full min-h-[48px]"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setBalanceFilter('all')}
              className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors min-h-[40px] ${balanceFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Tümü
            </button>
            <button 
              onClick={() => setBalanceFilter('debtors')}
              className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors min-h-[40px] ${balanceFilter === 'debtors' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Borçlular
            </button>
            <button 
              onClick={() => setBalanceFilter('non-debtors')}
              className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors min-h-[40px] ${balanceFilter === 'non-debtors' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Borçsuzlar
            </button>
            {selectedCustomers.length > 0 && (
              <button 
                onClick={() => onDeleteSelected(selectedCustomers)} 
                className="px-4 py-2.5 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors min-h-[40px]"
              >
                Seçilen ({selectedCustomers.length}) Müşteriyi Sil
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
          <p>Aramanızla eşleşen müşteri bulunamadı.</p>
        </div>
      ) : (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Tüm Müşteriler</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <input 
                type="checkbox" 
                checked={isAllSelected} 
                onChange={handleSelectAll} 
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded" 
              />
              <span>Tümünü Seç</span>
            </div>
          </div>
          
          {/* MASAÜSTÜ GÖRÜNÜMÜ */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-3 text-center w-12">Seç</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri Adı</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kalan Bakiye</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-2 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedCustomers.includes(customer.id)} 
                        onChange={() => handleSelectCustomer(customer.id)} 
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <button onClick={() => navigateToCustomerDetails('customerDetails', customer)} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold transition-colors hover:bg-blue-200">{customer.name}</button>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${customer.remainingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {formatNumber(customer.remainingBalance, ' ₺')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => setPaymentModalState({ isOpen: true, customer: customer })} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm mr-2 min-h-[36px]" title="Tahsilat Yap">Tahsilat Yap</button>
                      <button onClick={() => onOpenNewTransactionModal({ customerId: customer.id, customerName: customer.name })} className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm mr-2 min-h-[36px]" title="İşlem Ekle">İşlem Ekle</button>
                      <button onClick={() => navigateToCustomerDetails('customerDetails', customer)} className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 hover:text-gray-800 transition-colors inline-flex items-center justify-center min-h-[36px]" title="Müşteri Detaylarını Görüntüle">
                        <Info className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBİL GÖRÜNÜMÜ */}
          <div className="block md:hidden space-y-4">
            {filteredCustomers.map(customer => (
              <div key={customer.id} className="border rounded-xl shadow-md p-4 space-y-3 bg-white">
                <div className="flex justify-between items-center border-b pb-2">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={selectedCustomers.includes(customer.id)} 
                      onChange={() => handleSelectCustomer(customer.id)} 
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <button 
                      onClick={() => navigateToCustomerDetails('customerDetails', customer)} 
                      className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-sm font-bold border border-blue-200 min-h-[32px]"
                    >
                      {customer.name}
                    </button>
                  </div>
                  <span className={`text-sm font-bold ${customer.remainingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {formatNumber(customer.remainingBalance, ' ₺')}
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 pt-1 justify-end">
                  <button 
                    onClick={() => setPaymentModalState({ isOpen: true, customer: customer })} 
                    className="w-full sm:w-auto px-4 py-2.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 text-center font-semibold min-h-[40px] shadow"
                  >
                    Tahsilat Yap
                  </button>
                  <button 
                    onClick={() => onOpenNewTransactionModal({ customerId: customer.id, customerName: customer.name })} 
                    className="w-full sm:w-auto px-4 py-2.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-center font-semibold min-h-[40px] shadow"
                  >
                    İşlem Ekle
                  </button>
                  <button 
                    onClick={() => navigateToCustomerDetails('customerDetails', customer)} 
                    className="w-full sm:w-auto flex items-center justify-center gap-1 px-4 py-2.5 text-xs bg-gray-100 text-gray-700 border hover:bg-gray-200 rounded-lg font-semibold min-h-[40px]"
                  >
                    <Info className="w-4 h-4" />
                    <span>Detayları Gör</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {paymentModalState.isOpen && (
        <PaymentCollectionModal 
          customer={paymentModalState.customer}
          onClose={() => setPaymentModalState({ isOpen: false, customer: null })}
          onSavePayment={handleSavePayment}
        />
      )}
    </div>
  );
};

export default OurCustomers;
