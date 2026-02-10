
import React, { useState } from 'react';
import { Sale, SaleStatus, PaymentMethod, Client, Product, Budget, StoreSettings, BudgetItem } from '../types';
import { formatCurrency, formatDate } from '../constants';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  X, 
  Save, 
  Printer, 
  PlusCircle, 
  CreditCard,
  CheckCircle,
  Clock
} from 'lucide-react';

interface SalesProps {
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  budgets: Budget[];
  clients: Client[];
  products: Product[];
  settings: StoreSettings;
}

const Sales: React.FC<SalesProps> = ({ sales, setSales, budgets, clients, products, settings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [printingSale, setPrintingSale] = useState<Sale | null>(null);

  // Estados do Formulário Unificado
  const [selectedClientId, setSelectedClientId] = useState('');
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.PIX);
  const [status, setStatus] = useState<SaleStatus>(SaleStatus.PAID);

  const filteredSales = sales.filter(s => 
    s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (sale?: Sale) => {
    if (sale) {
      setEditingSale(sale);
      setSelectedClientId(sale.clientId);
      setItems(sale.items);
      setPaymentMethod(sale.paymentMethod);
      setStatus(sale.status);
    } else {
      setEditingSale(null);
      setSelectedClientId('');
      setItems([]);
      setPaymentMethod(PaymentMethod.PIX);
      setStatus(SaleStatus.PAID);
    }
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    setItems([...items, { productId: '', name: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]);
  };

  const updateItem = (index: number, field: keyof BudgetItem, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === 'productId') {
      const prod = products.find(p => p.id === value);
      if (prod) {
        item.productId = value as string;
        item.name = prod.name;
        item.unitPrice = prod.suggestedPrice;
        item.totalPrice = item.quantity * prod.suggestedPrice;
      }
    } else if (field === 'quantity') {
      item.quantity = Number(value);
      item.totalPrice = item.quantity * item.unitPrice;
    } else if (field === 'unitPrice') {
      item.unitPrice = Number(value);
      item.totalPrice = item.quantity * item.unitPrice;
    }

    newItems[index] = item;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!selectedClientId || items.length === 0) return;

    const selectedClient = clients.find(c => c.id === selectedClientId);
    const total = items.reduce((acc, item) => acc + item.totalPrice, 0);

    if (editingSale) {
      setSales(sales.map(s => s.id === editingSale.id ? { 
        ...s, 
        clientId: selectedClientId,
        clientName: selectedClient?.name || s.clientName,
        items,
        totalValue: total,
        paymentMethod,
        status
      } as Sale : s));
    } else {
      const newSale: Sale = {
        id: Math.random().toString(36).substr(2, 9),
        number: `VEN-${(sales.length + 1).toString().padStart(3, '0')}`,
        clientId: selectedClientId,
        clientName: selectedClient?.name || 'Cliente Avulso',
        items,
        totalValue: total,
        paymentMethod,
        status,
        date: new Date().toISOString()
      };
      setSales([newSale, ...sales]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir venda permanentemente?')) {
      setSales(sales.filter(s => s.id !== id));
    }
  };

  const handlePrint = (sale: Sale) => {
    setPrintingSale(sale);
    setIsPrintModalOpen(true);
  };

  const selectedClientInfo = clients.find(c => c.id === printingSale?.clientId);

  return (
    <>
      <div className="space-y-6 animate-fadeIn">
        {/* Barra de Ferramentas */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 bg-white p-2 px-6 rounded-full border-2 border-theme-secondary/30 flex-1 max-w-md shadow-sm">
            <Search size={18} className="opacity-40" />
            <input 
              type="text" 
              placeholder="Buscar vendas por cliente ou número..." 
              className="bg-transparent border-none outline-none text-sm w-full font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-8 py-3 bg-theme-primary text-white rounded-full hover:opacity-90 transition-all shadow-lg font-bold active:scale-95"
          >
            <Plus size={20} /> Registrar Nova Venda
          </button>
        </div>

        {/* Tabela de Vendas Compacta */}
        <div className="bg-white rounded-3xl border-2 border-theme-secondary/30 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-theme-sidebar/50 border-b-2 border-theme-secondary/20">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Venda Nº</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Cliente</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Valor Total</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Pagamento</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-60 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-app">
                {filteredSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-theme-app/40 transition-colors group cursor-pointer" onClick={() => handlePrint(sale)}>
                    <td className="px-6 py-3 font-black text-theme-primary">{sale.number}</td>
                    <td className="px-6 py-3 font-bold opacity-80">{sale.clientName}</td>
                    <td className="px-6 py-3 font-black text-theme-primary">{formatCurrency(sale.totalValue)}</td>
                    <td className="px-6 py-3 text-xs font-black uppercase opacity-60 tracking-widest">{sale.paymentMethod}</td>
                    <td className="px-6 py-3">
                      <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                        sale.status === SaleStatus.PAID ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {sale.status === SaleStatus.PAID ? 'PAGO' : 'PENDENTE'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handlePrint(sale)} className="p-2 text-theme-primary hover:bg-theme-secondary/20 rounded-xl transition-colors" title="Imprimir Comprovante">
                        <Printer size={18} />
                      </button>
                      <button onClick={() => handleOpenModal(sale)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-colors" title="Editar">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(sale.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors" title="Excluir">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSales.length === 0 && (
              <div className="py-20 text-center opacity-40 italic text-sm font-bold">Nenhuma venda encontrada. 🥯</div>
            )}
          </div>
        </div>
      </div>

      {/* MODAIS FORA DO CONTAINER ANIMADO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 no-print">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-theme-secondary flex flex-col animate-fadeIn">
            <header className="p-8 border-b border-theme-app flex justify-between items-center bg-theme-sidebar/20">
              <h3 className="text-2xl font-title font-black text-theme-primary">
                {editingSale ? '☕ Editar Venda' : '☕ Registrar Venda'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-red-50 text-red-400 rounded-full transition-colors">
                <X size={28} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 coffee-scroll space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2 space-y-2">
                  <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-2">Cliente</label>
                  <select 
                    className="w-full p-4 bg-theme-app/50 border-2 border-theme-secondary/30 rounded-3xl outline-none font-bold"
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                  >
                    <option value="">Selecione um cliente...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-2">Forma de Pgto</label>
                  <select 
                    className="w-full p-4 bg-theme-app/50 border-2 border-theme-secondary/30 rounded-3xl outline-none font-bold"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  >
                    {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-2">Status</label>
                  <select 
                    className="w-full p-4 bg-theme-app/50 border-2 border-theme-secondary/30 rounded-3xl outline-none font-bold"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as SaleStatus)}
                  >
                    <option value={SaleStatus.PAID}>Pago</option>
                    <option value={SaleStatus.PENDING}>Pendente</option>
                  </select>
                </div>
              </div>

              {/* Itens da Venda */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h4 className="font-title font-black text-theme-primary flex items-center gap-2">
                    <CheckCircle size={18} className="text-theme-secondary" /> Itens Vendidos
                  </h4>
                  <button 
                    onClick={handleAddItem}
                    className="text-xs flex items-center gap-2 font-black text-theme-primary hover:bg-theme-secondary/50 transition-colors bg-theme-secondary/30 px-4 py-2 rounded-full"
                  >
                    <PlusCircle size={16} /> Adicionar Item
                  </button>
                </div>
                
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 p-4 bg-theme-app/20 border-2 border-theme-secondary/10 rounded-[2rem] items-center">
                      <div className="col-span-5">
                        <select 
                          className="w-full p-3 text-sm bg-white border-2 border-theme-secondary/20 rounded-2xl outline-none font-bold"
                          value={item.productId}
                          onChange={(e) => updateItem(index, 'productId', e.target.value)}
                        >
                          <option value="">Produto...</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input 
                          type="number" 
                          className="w-full p-3 text-sm bg-white border-2 border-theme-secondary/20 rounded-2xl outline-none text-center font-bold"
                          placeholder="Qtd"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <input 
                          type="number" 
                          className="w-full p-3 text-sm bg-white border-2 border-theme-secondary/20 rounded-2xl outline-none text-center font-bold"
                          placeholder="R$ Unit"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="text-xs font-black text-theme-primary">{formatCurrency(item.totalPrice)}</span>
                      </div>
                      <div className="col-span-1 text-right">
                        <button onClick={() => removeItem(index)} className="p-2 text-red-300 hover:text-red-500 rounded-full transition-colors">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <div className="text-right bg-theme-primary text-white p-8 rounded-[3rem] shadow-xl min-w-[300px]">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Total da Venda</p>
                  <p className="text-5xl font-title font-black leading-none">
                    {formatCurrency(items.reduce((acc, item) => acc + item.totalPrice, 0))}
                  </p>
                </div>
              </div>
            </div>

            <footer className="p-8 bg-theme-sidebar/20 border-t-2 border-theme-app flex justify-end gap-4">
              <button onClick={() => setIsModalOpen(false)} className="px-8 py-3 text-sm font-black opacity-40 hover:opacity-100 uppercase tracking-widest transition-opacity">Cancelar</button>
              <button 
                onClick={handleSave}
                disabled={!selectedClientId || items.length === 0}
                className="px-12 py-4 bg-theme-primary text-white text-sm font-black rounded-full hover:opacity-90 disabled:opacity-30 shadow-lg uppercase tracking-widest transition-all active:scale-95"
              >
                Salvar Venda
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Comprovante de Venda Profissional */}
      {isPrintModalOpen && printingSale && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 no-print overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl flex flex-col my-auto">
            <header className="p-6 border-b flex justify-between items-center bg-theme-app">
              <h3 className="font-title font-black text-theme-primary flex items-center gap-2">
                <Printer size={20} /> Comprovante de Venda
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-6 py-3 bg-theme-primary text-white text-xs font-black rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all"
                >
                  <Printer size={16} /> Imprimir
                </button>
                <button onClick={() => setIsPrintModalOpen(false)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
            </header>
            
            <div className="p-10 space-y-8 bg-white print-area" id="sale-printable">
              <div className="print-container space-y-6 text-center">
                <div className="flex flex-col items-center gap-3 border-b-2 border-theme-secondary pb-6">
                  <img src={settings.logoUrl} alt="Logo" className="w-20 h-20 rounded-full object-cover border-4 border-theme-sidebar shadow-md" />
                  <h1 className="text-2xl font-title font-black text-theme-primary leading-none">{settings.storeName}</h1>
                  <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Cupom de Venda • {printingSale.number}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left text-xs font-bold border-b border-theme-app pb-6">
                  <div className="space-y-1">
                    <p className="opacity-40 uppercase text-[9px]">Cliente:</p>
                    <p>{printingSale.clientName}</p>
                    <p className="opacity-40">{selectedClientInfo?.document || ''}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="opacity-40 uppercase text-[9px]">Pagamento:</p>
                    <p className="font-black text-theme-primary">{printingSale.paymentMethod}</p>
                    <p className="opacity-40">{formatDate(printingSale.date)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-40 px-2">
                    <span>Descrição do Item</span>
                    <span>Total</span>
                  </div>
                  <div className="space-y-2">
                    {printingSale.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-sm px-2">
                        <div className="text-left">
                          <p className="font-black text-theme-primary">{item.name}</p>
                          <p className="text-[10px] opacity-60 font-bold">{item.quantity}x {formatCurrency(item.unitPrice)}</p>
                        </div>
                        <span className="font-black text-theme-primary">{formatCurrency(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-theme-app p-6 rounded-[2.5rem] border-2 border-theme-secondary/20 flex flex-col items-center">
                  <span className="text-[9px] font-black opacity-40 uppercase tracking-widest mb-1">Total Pago</span>
                  <span className="text-4xl font-title font-black text-theme-primary leading-none">
                    {formatCurrency(printingSale.totalValue)}
                  </span>
                  <div className="mt-4 px-4 py-1.5 bg-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm text-green-600 flex items-center gap-1">
                    <CheckCircle size={10} /> {printingSale.status === SaleStatus.PAID ? 'Pagamento Confirmado' : 'Aguardando Pagamento'}
                  </div>
                </div>

                <div className="pt-8 border-t-2 border-theme-sidebar border-dashed">
                   <p className="text-[10px] font-black opacity-50 uppercase tracking-widest">☕ Obrigado pela sua compra! ✨</p>
                   <p className="text-[9px] opacity-40 mt-1 italic font-medium">Seu apoio faz nosso atelier brilhar mais forte.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sales;
