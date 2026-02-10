
import React, { useState } from 'react';
import { Product, Material } from '../types';
import { formatCurrency } from '../constants';
import { Plus, Search, Edit, Trash2, Box, X, Save } from 'lucide-react';

interface ProductsProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  materials: Material[];
}

const Products: React.FC<ProductsProps> = ({ products, setProducts, materials }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: '',
    description: '',
    type: 'físico',
    calculatedCost: 0,
    suggestedPrice: 0,
    stock: 0,
    minStock: 5
  });

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleOpenModal = (prod?: Product) => {
    if (prod) {
      setEditingProduct(prod);
      setFormData(prod);
    } else {
      setEditingProduct(null);
      setFormData({ name: '', category: '', description: '', type: 'físico', calculatedCost: 0, suggestedPrice: 0, stock: 0, minStock: 5 });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) return;
    
    // IMPORTANTE: Uso de atualização funcional (prev => ...) para garantir que o React não ignore a mudança
    setProducts(prev => {
      if (editingProduct) {
        return prev.map(p => p.id === editingProduct.id ? { ...p, ...formData } as Product : p);
      } else {
        const newProd: Product = {
          id: Math.random().toString(36).substr(2, 9),
          name: formData.name || '',
          category: formData.category || 'Geral',
          description: formData.description || '',
          type: (formData.type as Product['type']) || 'físico',
          calculatedCost: Number(formData.calculatedCost) || 0,
          suggestedPrice: Number(formData.suggestedPrice) || 0,
          stock: Number(formData.stock) || 0,
          minStock: Number(formData.minStock) || 5
        };
        return [newProd, ...prev];
      }
    });
    
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir este produto permanentemente?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <>
      <div className="space-y-8 animate-fadeIn">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 bg-white p-2 px-6 rounded-full border-2 border-theme-secondary/30 flex-1 max-w-md shadow-sm">
            <Search size={18} className="text-theme-primary opacity-40" />
            <input 
              type="text" 
              placeholder="Buscar produtos..." 
              className="bg-transparent border-none outline-none text-sm w-full font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-8 py-3 bg-theme-primary text-white rounded-full hover:opacity-90 shadow-lg font-bold"
          >
            <Plus size={20} /> Novo Produto
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white p-8 border-2 border-theme-secondary/20 group hover:border-theme-primary/30 transition-all flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-theme-app text-theme-primary rounded-full mb-2 inline-block shadow-sm">
                    {product.category}
                  </span>
                  <h4 className="font-title font-black text-xl text-theme-primary">{product.name}</h4>
                </div>
                <div className={`px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${product.stock <= product.minStock ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-theme-sidebar text-theme-primary opacity-80'}`}>
                  Stock: {product.stock}
                </div>
              </div>

              <p className="text-xs font-medium opacity-50 mb-8 line-clamp-2 min-h-[2.5rem] leading-relaxed">{product.description || 'Sem descrição cadastrada.'}</p>

              <div className="flex items-center justify-between mb-8 mt-auto">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Preço Sugerido</span>
                  <span className="text-2xl font-black text-theme-primary">{formatCurrency(product.suggestedPrice)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Custo Médio</span>
                  <span className="text-sm font-bold opacity-60">{formatCurrency(product.calculatedCost)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-6 border-t border-theme-app">
                <button onClick={() => handleOpenModal(product)} className="p-3 text-amber-500 hover:bg-amber-50 rounded-2xl transition-all">
                  <Edit size={20} />
                </button>
                <button onClick={() => handleDelete(product.id)} className="p-3 text-red-400 hover:bg-red-50 rounded-2xl transition-all">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-theme-secondary animate-fadeIn">
            <header className="p-8 border-b border-theme-app flex justify-between items-center bg-theme-sidebar/20">
              <h3 className="text-xl font-title font-black text-theme-primary">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-red-50 text-red-400 rounded-full">
                <X size={28} />
              </button>
            </header>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-2">Nome do Produto</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-theme-app/50 border-2 border-theme-secondary/20 rounded-3xl outline-none font-bold"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-2">Categoria</label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-theme-app/50 border-2 border-theme-secondary/20 rounded-3xl outline-none font-bold"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-2">Tipo</label>
                  <select 
                    className="w-full p-4 bg-theme-app/50 border-2 border-theme-secondary/20 rounded-3xl outline-none font-bold"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as Product['type']})}
                  >
                    <option value="físico">Físico</option>
                    <option value="digital">Digital</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-2">Estoque Inicial</label>
                  <input 
                    type="number" 
                    className="w-full p-4 bg-theme-app/50 border-2 border-theme-secondary/20 rounded-3xl outline-none font-bold"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-2">Preço de Venda</label>
                  <input 
                    type="number" 
                    className="w-full p-4 bg-theme-app/50 border-2 border-theme-secondary/20 rounded-3xl outline-none font-bold"
                    value={formData.suggestedPrice}
                    onChange={(e) => setFormData({...formData, suggestedPrice: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>
            <footer className="p-8 bg-theme-sidebar/20 flex justify-end gap-4">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-xs font-black opacity-40 hover:opacity-100 uppercase">Cancelar</button>
              <button onClick={handleSave} className="px-10 py-4 bg-theme-primary text-white font-black rounded-full flex items-center gap-2 shadow-lg uppercase tracking-widest">
                <Save size={20} /> Salvar Produto
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default Products;
