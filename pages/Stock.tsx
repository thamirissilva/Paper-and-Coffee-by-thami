
import React, { useState } from 'react';
import { Product } from '../types';
import { PlusCircle, MinusCircle, History, Package } from 'lucide-react';

interface StockProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const Stock: React.FC<StockProps> = ({ products, setProducts }) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [amount, setAmount] = useState(1);
  const [type, setType] = useState<'IN' | 'OUT'>('IN');

  const handleUpdateStock = () => {
    if (!selectedProductId || amount <= 0) return;

    // ATUALIZAÇÃO FUNCIONAL: Crucial para o localStorage sincronizar corretamente
    setProducts(prev => prev.map(p => {
      if (p.id === selectedProductId) {
        const newStock = type === 'IN' ? p.stock + amount : Math.max(0, p.stock - amount);
        return { ...p, stock: newStock };
      }
      return p;
    }));

    alert(`Estoque atualizado com sucesso (${type === 'IN' ? 'Entrada' : 'Saída'} de ${amount} unidades)`);
    setAmount(1);
    setSelectedProductId('');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="bg-white p-6 rounded-3xl border border-[#D2B48C] shadow-sm flex flex-col space-y-6 lg:col-span-1">
          <h3 className="text-lg font-serif font-bold text-[#6F4E37] flex items-center gap-2">
            <Package size={22} /> Movimentação de Estoque
          </h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#A67B5B] uppercase">Produto</label>
              <select 
                className="w-full p-3 bg-[#FDFBF7] border border-[#D2B48C] rounded-xl outline-none font-bold"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
              >
                <option value="">Selecione um produto...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (Atual: {p.stock})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setType('IN')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all ${type === 'IN' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-[#F5EFE6] text-gray-400'}`}
              >
                <PlusCircle size={18} /> Entrada
              </button>
              <button 
                onClick={() => setType('OUT')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all ${type === 'OUT' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-[#F5EFE6] text-gray-400'}`}
              >
                <MinusCircle size={18} /> Saída
              </button>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#A67B5B] uppercase">Quantidade</label>
              <input 
                type="number" 
                min="1"
                className="w-full p-3 bg-white border border-[#D2B48C] rounded-xl outline-none font-bold"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
            <button 
              onClick={handleUpdateStock}
              disabled={!selectedProductId}
              className="w-full py-4 bg-[#6F4E37] text-white font-bold rounded-2xl hover:bg-[#5D4037] transition-all disabled:opacity-50 shadow-md"
            >
              Confirmar Lançamento
            </button>
          </div>
        </section>

        <section className="bg-white p-6 rounded-3xl border border-[#D2B48C] shadow-sm lg:col-span-2 space-y-6">
          <h3 className="text-lg font-serif font-bold text-[#6F4E37] flex items-center gap-2">
            <History size={22} /> Status Geral
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#F5EFE6] text-[#A67B5B] text-[10px] uppercase font-bold">
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3 text-center">Atual</th>
                  <th className="px-4 py-3 text-center">Mínimo</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FDFBF7]">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-[#FDFBF7]">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-center font-bold">{p.stock}</td>
                    <td className="px-4 py-3 text-center">{p.minStock}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.stock <= p.minStock ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {p.stock <= p.minStock ? 'CRÍTICO' : 'NORMAL'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Stock;
