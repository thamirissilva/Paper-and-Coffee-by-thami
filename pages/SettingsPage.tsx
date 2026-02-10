
import React, { useRef, useState } from 'react';
import { StoreSettings, Theme } from '../types';
import { auth, storage, ref, uploadBytes, getDownloadURL } from '../firebase';
import { Save, Upload, Building2, Monitor, Palette, Loader2, Check } from 'lucide-react';

interface SettingsPageProps {
  settings: StoreSettings;
  setSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, setSettings }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const user = auth.currentUser;
    if (!file || !user) return;

    setUploading(true);
    try {
      // Cria referência no Firebase Storage: users/UID/logo/nomedoarquivo
      const logoRef = ref(storage, `users/${user.uid}/logo/${Date.now()}_${file.name}`);
      await uploadBytes(logoRef, file);
      const downloadURL = await getDownloadURL(logoRef);
      
      setSettings(prev => ({ ...prev, logoUrl: downloadURL }));
      alert('Logotipo atualizado na nuvem! ✨');
    } catch (err) {
      console.error(err);
      alert('Erro ao fazer upload da imagem. Verifique o tamanho do arquivo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    alert('Todas as configurações do atelier foram sincronizadas!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Configurações da Loja */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-theme-secondary shadow-sm space-y-6">
          <h3 className="text-lg font-title font-bold text-theme-primary flex items-center gap-2">
            <Building2 size={22} className="text-theme-secondary" /> Identidade do Atelier
          </h3>
          
          <div className="space-y-6">
            {/* ÁREA DE UPLOAD DO LOGOTIPO */}
            <div className="flex flex-col items-center py-8 bg-theme-app/50 rounded-[2rem] border-2 border-dashed border-theme-secondary/40 relative group overflow-hidden">
              <div className="w-24 h-24 rounded-full bg-white mb-4 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-500">
                {uploading ? (
                  <Loader2 className="animate-spin text-theme-primary" size={32} />
                ) : (
                  <img src={settings.logoUrl} alt="Logo Atual" className="w-full h-full object-cover" />
                )}
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleLogoUpload} 
                className="hidden" 
                accept="image/*" 
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-6 py-2 bg-theme-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:opacity-90 transition-all flex items-center gap-2 shadow-md"
              >
                {uploading ? 'Enviando...' : <><Upload size={14} /> Alterar Logotipo</>}
              </button>
              
              <p className="text-[9px] opacity-40 mt-3 font-bold uppercase tracking-tight">Recomendado: 500x500px (PNG ou JPG)</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-2">Nome Comercial</label>
              <input 
                name="storeName"
                type="text" 
                className="w-full p-4 bg-theme-app/30 border-2 border-theme-secondary/20 rounded-3xl outline-none font-bold"
                value={settings.storeName}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-2">CNPJ ou CPF Profissional</label>
              <input 
                name="document"
                type="text" 
                className="w-full p-4 bg-theme-app/30 border-2 border-theme-secondary/20 rounded-3xl outline-none font-bold"
                value={settings.document}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-2">WhatsApp</label>
                <input 
                  name="phone"
                  type="text" 
                  className="w-full p-4 bg-theme-app/30 border-2 border-theme-secondary/20 rounded-3xl outline-none font-bold"
                  value={settings.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-2">E-mail</label>
                <input 
                  name="email"
                  type="email" 
                  className="w-full p-4 bg-theme-app/30 border-2 border-theme-secondary/20 rounded-3xl outline-none font-bold"
                  value={settings.email}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Configurações do Sistema */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-theme-secondary shadow-sm space-y-8">
          <h3 className="text-lg font-title font-bold text-theme-primary flex items-center gap-2">
            <Monitor size={22} className="text-theme-secondary" /> Personalização da Mesa
          </h3>

          <div className="space-y-8">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-2">Título do Sistema</label>
              <input 
                name="systemName"
                type="text" 
                className="w-full p-4 bg-theme-app/30 border-2 border-theme-secondary/20 rounded-3xl outline-none font-black text-theme-primary"
                value={settings.systemName}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black opacity-40 uppercase tracking-widest flex items-center gap-2 ml-2">
                <Palette size={16} /> Estilo Visual (Temas)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSettings(s => ({ ...s, theme: Theme.CLASSIC }))}
                  className={`p-6 rounded-3xl border-4 transition-all flex flex-col items-center gap-3 relative ${
                    settings.theme === Theme.CLASSIC 
                    ? 'border-theme-primary bg-theme-secondary/10' 
                    : 'border-theme-secondary/20 opacity-40 grayscale hover:grayscale-0'
                  }`}
                >
                  {settings.theme === Theme.CLASSIC && <div className="absolute top-2 right-2 bg-theme-primary text-white rounded-full p-1"><Check size={10} /></div>}
                  <div className="flex gap-1">
                    <div className="w-5 h-5 rounded-full bg-[#6F4E37] shadow-sm"></div>
                    <div className="w-5 h-5 rounded-full bg-[#D2B48C] shadow-sm"></div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Cozy Coffee</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettings(s => ({ ...s, theme: Theme.PASTEL }))}
                  className={`p-6 rounded-3xl border-4 transition-all flex flex-col items-center gap-3 relative ${
                    settings.theme === Theme.PASTEL 
                    ? 'border-theme-primary bg-theme-secondary/10' 
                    : 'border-theme-secondary/20 opacity-40 grayscale hover:grayscale-0'
                  }`}
                >
                  {settings.theme === Theme.PASTEL && <div className="absolute top-2 right-2 bg-theme-primary text-white rounded-full p-1"><Check size={10} /></div>}
                  <div className="flex gap-1">
                    <div className="w-5 h-5 rounded-full bg-[#FFB6C1] shadow-sm"></div>
                    <div className="w-5 h-5 rounded-full bg-[#FCE4EC] shadow-sm"></div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Pastel Art</span>
                </button>
              </div>
            </div>

            <div className="p-6 bg-theme-app rounded-[2rem] border-2 border-theme-secondary/20">
              <h4 className="text-[10px] font-black opacity-60 uppercase mb-4 tracking-[0.2em]">Recursos do Atelier</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input type="checkbox" className="peer hidden" defaultChecked />
                    <div className="w-10 h-6 bg-theme-secondary/40 rounded-full peer-checked:bg-theme-primary transition-colors"></div>
                    <div className="absolute left-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 transition-transform shadow-sm"></div>
                  </div>
                  <span className="text-[11px] font-bold opacity-70 group-hover:opacity-100 transition-opacity">Controle Automático de Estoque</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input type="checkbox" className="peer hidden" defaultChecked />
                    <div className="w-10 h-6 bg-theme-secondary/40 rounded-full peer-checked:bg-theme-primary transition-colors"></div>
                    <div className="absolute left-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 transition-transform shadow-sm"></div>
                  </div>
                  <span className="text-[11px] font-bold opacity-70 group-hover:opacity-100 transition-opacity">Sugestões da IA (Gemini) Ativadas</span>
                </label>
              </div>
            </div>
          </div>
        </section>

      </div>

      <div className="flex justify-center pt-8">
        <button 
          onClick={handleSave}
          className="px-16 py-5 bg-theme-primary text-white text-sm font-black rounded-full hover:opacity-95 transition-all shadow-xl flex items-center gap-3 active:scale-95 uppercase tracking-[0.2em]"
        >
          <Save size={20} /> Sincronizar Tudo
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
