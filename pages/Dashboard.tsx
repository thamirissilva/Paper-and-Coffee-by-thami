
import React from 'react';
import { 
  formatCurrency, 
  COLORS 
} from '../constants';
import { 
  Product, 
  Budget, 
  Sale, 
  BudgetStatus 
} from '../types';
import { 
  TrendingUp, 
  FileText, 
  AlertTriangle, 
  PlusCircle,
  ShoppingBag
} from 'lucide-react';

interface DashboardProps {
  products: Product[];
  budgets: Budget[];
  sales: Sale[];
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ products, budgets, sales, setActiveTab }) => {
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  const openBudgets = budgets.filter(b => b.status === BudgetStatus.OPEN);
  const totalSalesMonth = sales.reduce((acc, sale) => acc + sale.totalValue, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 border-2 border-theme-secondary/30 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-2xl text-green-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] text-theme-primary font-bold uppercase tracking-widest opacity-60">Vendas do Mês</p>
            <p className="text-xl font-title font-black">{formatCurrency(totalSalesMonth)}</p>
          </div>
        </div>

        <div className="bg-white p-6 border-2 border-theme-secondary/30 flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-[10px] text-theme-primary font-bold uppercase tracking-widest opacity-60">Orçamentos Abertos</p>
            <p className="text-xl font-title font-black">{openBudgets.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 border-2 border-theme-secondary/30 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl text-red-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-[10px] text-theme-primary font-bold uppercase tracking-widest opacity-60">Estoque Baixo</p>
            <p className="text-xl font-title font-black">{lowStockProducts.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 border-2 border-theme-secondary/30 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-[10px] text-theme-primary font-bold uppercase tracking-widest opacity-60">Total de Vendas</p>
            <p className="text-xl font-title font-black">{sales.length}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <section>
        <h3 className="text-lg font-title font-bold mb-4 flex items-center gap-2">Atalhos Rápidos</h3>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => setActiveTab('budgets')}
            className="flex items-center gap-2 px-8 py-4 bg-theme-primary text-white rounded-3xl hover:opacity-90 shadow-lg font-bold"
          >
            <PlusCircle size={20} />
            Novo Orçamento
          </button>
          <button 
            onClick={() => setActiveTab('sales')}
            className="flex items-center gap-2 px-8 py-4 bg-theme-secondary text-theme-primary rounded-3xl hover:opacity-90 shadow-lg font-bold"
          >
            <ShoppingBag size={20} />
            Nova Venda
          </button>
        </div>
      </section>

      {/* Lists Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 border-2 border-theme-secondary/30">
          <h3 className="text-md font-title font-bold mb-4 border-b border-theme-app pb-3 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-400" /> Estoque Crítico
          </h3>
          {lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {lowStockProducts.map(p => (
                <div key={p.id} className="flex justify-between items-center p-4 bg-red-50/50 rounded-2xl border border-red-100">
                  <span className="font-bold text-sm">{p.name}</span>
                  <span className="text-xs px-3 py-1 bg-white rounded-full text-red-600 font-black shadow-sm">{p.stock} un</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm opacity-40 italic text-center py-8">Tudo em ordem com o estoque! ✨</p>
          )}
        </div>

        <div className="bg-white p-8 border-2 border-theme-secondary/30">
          <h3 className="text-md font-title font-bold mb-4 border-b border-theme-app pb-3 flex items-center gap-2">
            <FileText size={18} className="text-theme-secondary" /> Últimos Orçamentos
          </h3>
          {budgets.length > 0 ? (
            <div className="space-y-3">
              {budgets.slice(0, 5).map(b => (
                <div key={b.id} className="flex justify-between items-center p-4 bg-theme-app/30 border border-theme-secondary/20 rounded-2xl">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{b.clientName}</span>
                    <span className="text-[10px] opacity-40 font-bold uppercase">{b.number}</span>
                  </div>
                  <span className="font-black text-sm text-theme-primary">{formatCurrency(b.totalValue)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm opacity-40 italic text-center py-8">Nenhum orçamento gerado ainda. ☕</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
