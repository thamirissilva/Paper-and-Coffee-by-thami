
import React, { useState } from 'react';
import { StoreSettings } from '../types';
import { QrCode, Copy, Save } from 'lucide-react';

interface PixSettingsProps {
  settings: StoreSettings;
  setSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
}

const PixSettings: React.FC<PixSettingsProps> = ({ settings, setSettings }) => {
  const [pixKey, setPixKey] = useState(settings.pixKey);

  const handleSave = () => {
    setSettings({...settings, pixKey});
    alert('Chave Pix salva com sucesso!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <div className="bg-white p-8 rounded-3xl border border-[#D2B48C] shadow-sm flex flex-col items-center text-center">
        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mb-6">
          <QrCode size={48} />
        </div>
        <h3 className="text-2xl font-serif font-bold text-[#6F4E37] mb-2">Configurações do Pix</h3>
        <p className="text-[#A67B5B] text-sm mb-8">Cadastre sua chave Pix para aparecer nas vendas e orçamentos.</p>

        <div className="w-full space-y-6 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#A67B5B] uppercase tracking-wider">Sua Chave Pix (E-mail, CPF, CNPJ ou Aleatória)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 p-3 bg-[#FDFBF7] border border-[#D2B48C] rounded-xl outline-none focus:ring-2 focus:ring-[#6F4E37]/20"
                placeholder="Ex: financeiro@sualoja.com.br"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
              />
            </div>
          </div>

          <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
            <div className="mt-1 text-blue-600">
              <Copy size={20} />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-blue-900 mb-1">Dica de Segurança</h4>
              <p className="text-xs text-blue-800 leading-relaxed">
                Ao salvar sua chave, certifique-se de que ela está correta para evitar problemas nos pagamentos dos seus clientes.
              </p>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full py-4 bg-[#6F4E37] text-white font-bold rounded-2xl hover:bg-[#5D4037] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            <Save size={20} /> Salvar Configuração de Pix
          </button>
        </div>
      </div>
    </div>
  );
};

export default PixSettings;
