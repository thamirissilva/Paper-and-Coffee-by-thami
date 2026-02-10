
import React, { useState } from 'react';
import { 
  Budget, 
  BudgetStatus, 
  Client, 
  Product, 
  BudgetItem, 
  Sale, 
  SaleStatus, 
  PaymentMethod,
  StoreSettings
} from '../types';
import { 
  formatCurrency, 
  formatDate
} from '../constants';
import { 
  Plus, 
  Search, 
  FileEdit, 
  Trash2, 
  Copy, 
  Printer, 
  CheckCircle,
  X,
  PlusCircle,
  ArrowRight
} from 'lucide-react';

interface BudgetsProps {
  budgets: Budget[];
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
  clients: Client[];
  products: Product[];
  settings: StoreSettings;
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  sales: Sale[];
}

const Budgets: React.FC<BudgetsProps> = ({ budgets, setBudgets, clients, products, settings, setSales, sales }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [printingBudget, setPrintingBudget] = useState<Budget | null>(null);

  const [selectedClientId, setSelectedClientId] = useState('');
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [internalNotes, setInternalNotes] = useState('');

  const filteredBudgets = budgets.filter(b => {
    const matchesSearch = b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget);
      setSelectedClientId(budget.clientId);
      setItems(budget.items);
      setInternalNotes(budget.internalNotes);
    } else {
      setEditingBudget(null);
      setSelectedClientId('');
      setItems([]);
      setInternalNotes('');
    }
    setIsModalOpen(true);
  };

  const handleSaveBudget = () => {
    if (!selectedClientId || items.length === 0) return;

    const selectedClient = clients.find(c => c.id === selectedClientId);
    const total = items.reduce((acc, item) => acc + item.totalPrice, 0);

    // ATUALIZAÇÃO FUNCIONAL: Crucial para o localStorage sincronizar corretamente
    setBudgets(prev => {
      if (editingBudget) {
        return prev.map(b => b.id === editingBudget.id ? {
          ...b,
          clientId: selectedClientId,
          clientName: selectedClient?.name || 'Cliente Desconhecido',
          items,
          totalValue: total,
          internalNotes
        } : b);
      } else {
        const newNumber = `ORC-${(prev.length + 1).toString().padStart(3, '0')}`;
        const newBudget: Budget = {
          id: Math.random().toString(36).substr(2, 9),
          number: newNumber,
          clientId: selectedClientId,
          clientName: selectedClient?.name || 'Cliente Desconhecido',
          items,
          totalValue: total,
          status: BudgetStatus.OPEN,
          date: new Date().toISOString(),
          internalNotes
        };
        return [newBudget, ...prev];
      }
    });
    
    setIsModalOpen(false);
  };

  const handleDeleteBudget = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      setBudgets(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleDuplicateBudget = (budget: Budget) => {
    setBudgets(prev => {
      const newNumber = `ORC-${(prev.length + 1).toString().padStart(3, '0')}`;
      const duplicate: Budget = {
        ...budget,
        id: Math.random().toString(36).substr(2, 9),
        number: newNumber,
        status: BudgetStatus.OPEN,
        date: new Date().toISOString()
      };
      return [duplicate, ...prev];
    });
  };

  const handleConvertToSale = (budget: Budget) => {
    if (window.confirm('Transformar este orçamento em venda definitiva?')) {
      // Usando prev em ambas as listas para manter consistência
      setSales(prevSales => {
        const newSale: Sale = {
          id: Math.random().toString(36).substr(2, 9),
          number: `VEN-${(prevSales.length + 1).toString().padStart(3, '0')}`,
          clientId: budget.clientId,
          clientName: budget.clientName,
          budgetId: budget.id,
          items: [...budget.items], 
          totalValue: budget.totalValue,
          paymentMethod: PaymentMethod.PIX,
          status: SaleStatus.PAID,
          date: new Date().toISOString()
        };
        return [newSale, ...prevSales];
      });

      setBudgets(prevBudgets => prevBudgets.map(b => b.id === budget.id ? { ...b, status: BudgetStatus.APPROVED } : b));
      alert('Orçamento aprovado e venda registrada com sucesso! ☕✨');
    }
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

  const handlePrint = (budget: Budget) => {
    setPrintingBudget(budget);
    setIsPrintModalOpen(true);
  };

  const selectedClientInfo = clients.find(c => c.id === printingBudget?.clientId);

  return (
    <>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 bg-white p-2 px-6 rounded-full border-2 border-theme-secondary/30 flex-1 max-w-md shadow-sm">
            <Search size={18} className="opacity-40" />
            <input 
              type="text" 
              placeholder="Buscar por cliente ou número..." 
              className="bg-transparent border-none outline-none text-sm w-full font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <select 
              className="p-3 bg-white rounded-2xl border-2 border-theme-secondary/30 text-sm outline-none font-bold"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Todos os Status</option>
              <option value={BudgetStatus.OPEN}>Abertos</option>
              <option value={BudgetStatus.APPROVED}>Aprovados</option>
              <option value={BudgetStatus.REJECTED}>Recusados</option>
            </select>
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-6 py-3 bg-theme-primary text-white rounded-full hover:opacity-90 shadow-lg font-bold transition-transform active:scale-95"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Novo Orçamento</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-theme-secondary/30 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-theme-sidebar/50 border-b-2 border-theme-secondary/20">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Número</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Cliente</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Total</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Data</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-60 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-app">
                {filteredBudgets.map((budget) => (
                  <tr key={budget.id} className="hover:bg-theme-app/40 transition-colors group cursor-pointer" onClick={() => handlePrint(budget)}>
                    <td className="px-6 py-3 font-black text-theme-primary">{budget.number}</td>
                    <td className="px-6 py-3 font-bold opacity-80">{budget.clientName}</td>
                    <td className="px-6 py-3 font-black text-theme-primary">{formatCurrency(budget.totalValue)}</td>
                    <td className="px-6 py-3">
                      <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                        budget.status === BudgetStatus.OPEN ? 'bg-amber-100 text-amber-800' :
                        budget.status === BudgetStatus.APPROVED ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {budget.status === BudgetStatus.OPEN ? 'Aberto' :
                         budget.status === BudgetStatus.APPROVED ? 'Aprovado' : 'Recusado'}
                      </span>
                    </td>
                    <td className="px-6 py-3 opacity-50 text-xs font-bold">{formatDate(budget.date)}</td>
                    <td className="px-6 py-3 text-right flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handlePrint(budget)} className="p-2 text-theme-primary hover:bg-theme-secondary/20 rounded-xl transition-colors" title="Imprimir">
                        <Printer size={18} />
                      </button>
                      <button onClick={() => handleConvertToSale(budget)} className="p-2 text-green-500 hover:bg-green-50 rounded-xl transition-colors" title="Transformar em Venda">
                        <CheckCircle size={18} />
                      </button>
                      <button onClick={() => handleOpenModal(budget)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-colors" title="Editar">
                        <FileEdit size={18} />
                      </button>
                      <button onClick={() => handleDeleteBudget(budget.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors" title="Excluir">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredBudgets.length === 0 && (
              <div className="py-20 text-center opacity-40 italic text-sm font-bold">Nenhum orçamento encontrado. ☕</div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 no-print">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-theme-secondary flex flex-col animate-fadeIn">
            <header className="p-8 border-b border-theme-app flex justify-between items-center bg-theme-sidebar/20">
              <h3 className="text-2xl font-title font-black text-theme-primary">
                {editingBudget ? '☕ Editar Orçamento' : '☕ Novo Orçamento'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-red-50 text-red-400 rounded-full transition-colors">
                <X size={28} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 coffee-scroll space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-2">Cliente Selecionado</label>
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
                  <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-2">Status do Orçamento</label>
                  <select 
                    className="w-full p-4 bg-theme-app/50 border-2 border-theme-secondary/30 rounded-3xl outline-none font-bold"
                    value={editingBudget?.status || BudgetStatus.OPEN}
                    onChange={(e) => {
                      if(editingBudget) setEditingBudget({...editingBudget, status: e.target.value as BudgetStatus});
                    }}
                  >
                    <option value={BudgetStatus.OPEN}>Aberto</option>
                    <option value={BudgetStatus.APPROVED}>Aprovado</option>
                    <option value={BudgetStatus.REJECTED}>Recusado</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h4 className="font-title font-black text-theme-primary">Itens do Pedido</h4>
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

              <div className="space-y-2">
                <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-2">Notas Internas</label>
                <textarea 
                  className="w-full p-6 bg-theme-app/30 border-2 border-theme-secondary/20 rounded-[2rem] outline-none min-h-[120px] font-medium"
                  placeholder="Anotações para controle da loja..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-6">
                <div className="text-right bg-theme-primary text-white p-6 rounded-[2.5rem] shadow-xl min-w-[280px]">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Estimado</p>
                  <p className="text-4xl font-title font-black">
                    {formatCurrency(items.reduce((acc, item) => acc + item.totalPrice, 0))}
                  </p>
                </div>
              </div>
            </div>

            <footer className="p-8 bg-theme-sidebar/20 border-t-2 border-theme-app flex justify-end gap-4">
              <button onClick={() => setIsModalOpen(false)} className="px-8 py-3 text-sm font-black opacity-40 hover:opacity-100 uppercase transition-opacity">Cancelar</button>
              <button 
                onClick={handleSaveBudget}
                disabled={!selectedClientId || items.length === 0}
                className="px-12 py-4 bg-theme-primary text-white text-sm font-black rounded-full hover:opacity-90 disabled:opacity-30 shadow-lg uppercase tracking-widest transition-all active:scale-95"
              >
                Salvar Tudo
              </button>
            </footer>
          </div>
        </div>
      )}

      {isPrintModalOpen && printingBudget && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 no-print overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col my-auto">
            <header className="p-6 border-b flex justify-between items-center bg-theme-app">
              <h3 className="font-title font-black text-theme-primary flex items-center gap-2">
                <Printer size={20} /> Visualização do Orçamento
              </h3>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-theme-primary text-white text-xs font-black rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all">
                  <Printer size={16} /> Imprimir Agora
                </button>
                <button onClick={() => setIsPrintModalOpen(false)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
            </header>
            
            <div className="flex-1 overflow-y-auto p-12 bg-white print-area" id="budget-printable">
              <div className="print-container space-y-10">
                <div className="flex justify-between items-start border-b-4 border-theme-secondary pb-8">
                  <div className="flex items-center gap-4">
                    <img src={settings.logoUrl} alt="Logo" className="w-24 h-24 rounded-full object-cover border-4 border-theme-sidebar" />
                    <div className="space-y-1">
                      <h1 className="text-3xl font-title font-black text-theme-primary leading-none">{settings.storeName}</h1>
                      <p className="text-xs font-bold opacity-60 uppercase tracking-widest">Papelaria & Afeto</p>
                    </div>
                  </div>
                  <div className="text-right text-xs font-bold space-y-1 opacity-80">
                    <p>{settings.document}</p>
                    <p>{settings.phone}</p>
                    <p>{settings.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-theme-primary border-b border-theme-secondary pb-1">Cliente:</h4>
                    <div className="space-y-1">
                      <p className="text-lg font-black text-theme-primary">{printingBudget.clientName}</p>
                      <p className="text-xs font-bold opacity-60">Doc: {selectedClientInfo?.document || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-theme-primary border-b border-theme-secondary pb-1">Orçamento:</h4>
                    <div className="space-y-1">
                      <p className="text-lg font-black text-theme-primary">{printingBudget.number}</p>
                      <p className="text-xs font-bold opacity-60">Data: {formatDate(printingBudget.date)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-theme-sidebar/30 text-[10px] font-black uppercase tracking-widest text-theme-primary">
                        <th className="px-6 py-4 rounded-l-3xl">Item</th>
                        <th className="px-6 py-4 text-center">Qtd</th>
                        <th className="px-6 py-4 text-center">Unitário</th>
                        <th className="px-6 py-4 text-right rounded-r-3xl">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-theme-app">
                      {printingBudget.items.map((item, i) => (
                        <tr key={i}>
                          <td className="px-6 py-4 font-black text-theme-primary">{item.name}</td>
                          <td className="px-6 py-4 text-center font-bold opacity-70">{item.quantity}</td>
                          <td className="px-6 py-4 text-center font-bold opacity-70">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-6 py-4 text-right font-black text-theme-primary">{formatCurrency(item.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-end pt-8 border-t-4 border-theme-secondary">
                  <p className="text-[10px] font-black text-theme-primary uppercase tracking-widest">Obrigado por escolher nossa arte! ☕✨</p>
                  <div className="bg-theme-primary text-white p-8 rounded-[3rem] text-right shadow-xl">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Total</p>
                    <p className="text-5xl font-title font-black leading-none">{formatCurrency(printingBudget.totalValue)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Budgets;
