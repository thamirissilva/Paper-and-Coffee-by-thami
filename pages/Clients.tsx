
import React, { useState } from 'react';
import { Client } from '../types';
import { Plus, Search, Edit, Trash2, X, Save } from 'lucide-react';

interface ClientsProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

const Clients: React.FC<ClientsProps> = ({ clients, setClients }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    document: '',
    phone: '',
    email: '',
    notes: ''
  });

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.document.includes(searchTerm)
  );

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData(client);
    } else {
      setEditingClient(null);
      setFormData({ name: '', document: '', phone: '', email: '', notes: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) return;
    
    // ATUALIZAÇÃO FUNCIONAL: Impede que o estado se perca
    setClients(prev => {
      if (editingClient) {
        return prev.map(c => c.id === editingClient.id ? { ...c, ...formData } as Client : c);
      } else {
        const newClient: Client = {
          id: Math.random().toString(36).substr(2, 9),
          name: formData.name || '',
          document: formData.document || '',
          phone: formData.phone || '',
          email: formData.email || '',
          notes: formData.notes || ''
        };
        return [newClient, ...prev];
      }
    });
    
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir este cliente do seu atelier?')) {
      setClients(prev => prev.filter(c => c.id !== id));
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
              placeholder="Buscar por nome ou documento..." 
              className="bg-transparent border-none outline-none text-sm w-full font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-8 py-3 bg-theme-primary text-white rounded-full hover:opacity-90 shadow-lg font-bold"
          >
            <Plus size={20} /> Novo Cliente
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredClients.map(client => (
            <div key={client.id} className="bg-white p-8 border-2 border-theme-secondary/20 relative group hover:border-theme-primary/40">
              <h4 className="font-title font-black text-xl text-theme-primary mb-1">{client.name}</h4>
              <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-6">{client.document || 'Sem documento registrado'}</p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-black opacity-30 text-[10px] uppercase">Telefone:</span>
                  <span className="font-bold">{client.phone || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-black opacity-30 text-[10px] uppercase">E-mail:</span>
                  <span className="font-bold">{client.email || '-'}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-theme-app">
                <button onClick={() => handleOpenModal(client)} className="p-3 text-amber-500 hover:bg-amber-50 rounded-2xl transition-colors">
                  <Edit size={20} />
                </button>
                <button onClick={() => handleDelete(client.id)} className="p-3 text-red-400 hover:bg-red-50 rounded-2xl transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
          {filteredClients.length === 0 && (
            <div className="col-span-full py-20 text-center opacity-30 italic text-sm">Nenhum cliente por aqui ainda. ☕</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-theme-secondary animate-fadeIn">
            <header className="p-8 border-b border-theme-app flex justify-between items-center bg-theme-sidebar/20">
              <h3 className="text-xl font-title font-black text-theme-primary">{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-red-50 text-red-400 rounded-full">
                <X size={28} />
              </button>
            </header>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-2">Nome Completo</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-theme-app/50 border-2 border-theme-secondary/20 rounded-3xl outline-none font-bold"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-2">CPF / CNPJ</label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-theme-app/50 border-2 border-theme-secondary/20 rounded-3xl outline-none font-bold"
                    value={formData.document}
                    onChange={(e) => setFormData({...formData, document: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-2">Telefone</label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-theme-app/50 border-2 border-theme-secondary/20 rounded-3xl outline-none font-bold"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-2">E-mail</label>
                <input 
                  type="email" 
                  className="w-full p-4 bg-theme-app/50 border-2 border-theme-secondary/20 rounded-3xl outline-none font-bold"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-2">Observações Internas</label>
                <textarea 
                  className="w-full p-4 bg-theme-app/50 border-2 border-theme-secondary/20 rounded-3xl outline-none min-h-[120px] font-medium"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>
            <footer className="p-8 bg-theme-sidebar/20 flex justify-end gap-4">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-xs font-black opacity-40 hover:opacity-100 uppercase">Cancelar</button>
              <button onClick={handleSave} className="px-10 py-4 bg-theme-primary text-white font-black rounded-full flex items-center gap-2 shadow-lg uppercase tracking-widest">
                <Save size={20} /> Salvar Cliente
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default Clients;
