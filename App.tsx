
import React, { useState, useEffect } from 'react';
import { 
  auth,
  onAuthStateChanged, 
  signOut,
  db 
} from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc 
} from "firebase/firestore";
import { 
  MENU_ITEMS
} from './constants';
import { 
  StoreSettings, 
  Product, 
  Client, 
  Budget, 
  Sale, 
  Material,
  Theme,
  PricingDetail,
  User
} from './types';
import { LogOut, Loader2, CloudCheck, AlertTriangle, ExternalLink, ShieldAlert, RefreshCw } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Stock from './pages/Stock';
import Clients from './pages/Clients';
import Budgets from './pages/Budgets';
import Sales from './pages/Sales';
import PricingModule from './pages/PricingModule';
import PixSettings from './pages/PixSettings';
import SettingsPage from './pages/SettingsPage';
import AuthPage from './components/AuthPage';

/**
 * Interface para tratamento seguro de erros vindos do SDK do Firebase.
 * Evita o uso do tipo 'any' conforme as boas práticas.
 */
interface FirebaseSyncError {
  code?: string;
  message?: string;
}

const App: React.FC = () => {
  // --- ESTADOS DE CONTROLE DE INTERFACE ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // --- ESTADOS DE SINCRONIZAÇÃO COM A NUVEM (BRASIL) ---
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [permissionError, setPermissionError] = useState(false);

  // --- ESTADOS DOS DADOS DO ATELIER ---
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'Minha Papelaria Criativa',
    systemName: 'Paper&Coffee',
    document: '',
    phone: '',
    email: '',
    logoUrl: 'https://picsum.photos/200/200',
    pixKey: '',
    theme: Theme.CLASSIC
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [pricings, setPricings] = useState<PricingDetail[]>([]);

  // 1. MONITORAMENTO DA SESSÃO DO USUÁRIO
  // Verifica se existe um profissional logado no atelier.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser as unknown as User | null);
      setAuthLoading(false);
      
      // Limpa a memória local ao sair do sistema.
      if (!currentUser) {
        setDataLoaded(false);
        setPermissionError(false);
        setProducts([]);
        setClients([]);
        setBudgets([]);
        setSales([]);
        setMaterials([]);
        setPricings([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. RECUPERAÇÃO DE DADOS DO FIRESTORE (Nuvem)
  // Carrega todas as informações do banco de dados assim que o login é confirmado.
  useEffect(() => {
    if (!user) return;

    const loadCloudData = async () => {
      try {
        const u = user.uid;
        
        // Helper para buscar documentos específicos dentro da sub-pasta do usuário
        const getAtelierDoc = async (id: string) => {
          const docRef = doc(db, "users", u, "data", id);
          const docSnap = await getDoc(docRef);
          return docSnap.exists() ? docSnap.data().items : null;
        };

        // Carrega Configurações da Loja
        const settingsRef = doc(db, "users", u, "data", "settings");
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          const cloudSettings = settingsSnap.data() as StoreSettings;
          setSettings(cloudSettings);
          document.body.setAttribute('data-theme', cloudSettings.theme || Theme.CLASSIC);
        }

        // Carrega Listas em paralelo para maior performance
        const [cloudProducts, cloudClients, cloudBudgets, cloudSales, cloudMaterials, cloudPricings] = await Promise.all([
          getAtelierDoc("products"),
          getAtelierDoc("clients"),
          getAtelierDoc("budgets"),
          getAtelierDoc("sales"),
          getAtelierDoc("materials"),
          getAtelierDoc("pricings")
        ]);

        if (cloudProducts) setProducts(cloudProducts);
        if (cloudClients) setClients(cloudClients);
        if (cloudBudgets) setBudgets(cloudBudgets);
        if (cloudSales) setSales(cloudSales);
        if (cloudMaterials) setMaterials(cloudMaterials);
        if (cloudPricings) setPricings(cloudPricings);

        setDataLoaded(true);
        setPermissionError(false);
      } catch (err: unknown) {
        const error = err as FirebaseSyncError;
        // Trata especificamente o erro de permissão (Missing or insufficient permissions)
        if (error.code === 'permission-denied') {
          console.error("Erro Crítico: Regras de Segurança do Firestore bloqueando o acesso.");
          setPermissionError(true);
        }
      }
    };

    loadCloudData();
  }, [user]);

  // 3. PERSISTÊNCIA AUTOMÁTICA (Sincronização reativa)
  // Qualquer mudança na tela é enviada para o Firebase instantaneamente.
  const syncToFirebase = async (collectionId: string, data: unknown) => {
    if (!user || !dataLoaded || permissionError) return;
    
    setIsSyncing(true);
    try {
      const docRef = doc(db, "users", user.uid, "data", collectionId);
      await setDoc(docRef, collectionId === 'settings' ? data as object : { items: data });
    } catch (err: unknown) {
      const error = err as FirebaseSyncError;
      if (error.code === 'permission-denied') setPermissionError(true);
    } finally {
      // Pequeno timeout apenas para dar tempo do usuário ver o ícone de "Sincronizando"
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  // Efeitos que observam mudanças nos estados e acionam a nuvem
  useEffect(() => { syncToFirebase("settings", settings); }, [settings, user, dataLoaded]);
  useEffect(() => { syncToFirebase("products", products); }, [products, user, dataLoaded]);
  useEffect(() => { syncToFirebase("clients", clients); }, [clients, user, dataLoaded]);
  useEffect(() => { syncToFirebase("budgets", budgets); }, [budgets, user, dataLoaded]);
  useEffect(() => { syncToFirebase("sales", sales); }, [sales, user, dataLoaded]);
  useEffect(() => { syncToFirebase("materials", materials); }, [materials, user, dataLoaded]);
  useEffect(() => { syncToFirebase("pricings", pricings); }, [pricings, user, dataLoaded]);

  // Função para deslogar do sistema
  const handleLogout = async () => {
    if (window.confirm('Deseja fechar o atelier e sair? ☕')) {
      await signOut(auth);
    }
  };

  // TELA DE CARREGAMENTO (Splash Screen)
  if (authLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-theme-app text-theme-primary">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-title font-black uppercase tracking-widest text-sm text-center">Abrindo o Atelier...<br/>Brasil • {new Date().toLocaleTimeString('pt-BR')}</p>
      </div>
    );
  }

  // Se não houver usuário logado, mostra a tela de autenticação
  if (!user) return <AuthPage />;

  // Seletor dinâmico de páginas
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard products={products} budgets={budgets} sales={sales} setActiveTab={setActiveTab} />;
      case 'products': return <Products products={products} setProducts={setProducts} materials={materials} />;
      case 'stock': return <Stock products={products} setProducts={setProducts} />;
      case 'clients': return <Clients clients={clients} setClients={setClients} />;
      case 'budgets': return <Budgets budgets={budgets} setBudgets={setBudgets} clients={clients} products={products} settings={settings} setSales={setSales} sales={sales} />;
      case 'sales': return <Sales sales={sales} setSales={setSales} budgets={budgets} clients={clients} products={products} settings={settings} />;
      case 'pricing': return <PricingModule materials={materials} setMaterials={setMaterials} products={products} setProducts={setProducts} pricings={pricings} setPricings={setPricings} />;
      case 'pix': return <PixSettings settings={settings} setSettings={setSettings} />;
      case 'settings': return <SettingsPage settings={settings} setSettings={setSettings} />;
      default: return <Dashboard products={products} budgets={budgets} sales={sales} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-theme-app text-theme-primary overflow-hidden transition-colors duration-300">
      
      {/* TELA DE BLOQUEIO PARA ERRO DE CONFIGURAÇÃO DO FIRESTORE */}
      {permissionError && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 text-white text-center">
          <div className="max-w-xl space-y-8 animate-fadeIn">
            <div className="inline-flex p-6 bg-red-500 rounded-full mb-4 shadow-2xl">
              <ShieldAlert size={64} />
            </div>
            <h2 className="text-3xl font-title font-black uppercase tracking-tight">Banco de Dados Travado</h2>
            <p className="opacity-80 text-lg leading-relaxed">
              O Firebase está recusando o acesso. Isso acontece porque você ainda não configurou as <b>Regras de Segurança</b> no Console.
            </p>
            <div className="bg-white/10 p-6 rounded-[2rem] text-left border border-white/20">
              <p className="text-xs font-black uppercase tracking-widest mb-3 text-red-400 font-title">Como resolver agora:</p>
              <ol className="text-sm space-y-3 opacity-90 list-decimal ml-4 font-medium">
                <li>Abra o <b>Firebase Console</b>.</li>
                <li>Vá em <b>Firestore Database</b> > Aba <b>Rules</b>.</li>
                <li>Copie as regras do arquivo <code>firestore.rules</code> ou do README.</li>
                <li>Clique em <b>Publish</b> e depois recarregue esta página.</li>
              </ol>
            </div>
            <div className="flex flex-col gap-4">
               <a 
                href="https://console.firebase.google.com/" 
                target="_blank" 
                className="flex items-center justify-center gap-2 px-10 py-5 bg-white text-black font-black rounded-3xl shadow-xl hover:scale-105 transition-transform uppercase text-sm"
               >
                 <ExternalLink size={20} /> Abrir Firebase Console
               </a>
               <button onClick={() => window.location.reload()} className="flex items-center justify-center gap-2 px-10 py-4 bg-transparent border-2 border-white/30 text-white font-black rounded-3xl hover:bg-white/10 transition-all uppercase text-xs">
                 <RefreshCw size={18} /> Já configurei, atualizar atelier
               </button>
            </div>
          </div>
        </div>
      )}

      {/* BARRA LATERAL (SIDEBAR) */}
      <aside className="w-64 bg-theme-sidebar border-r border-theme-secondary flex flex-col shadow-sm z-10 transition-colors duration-300">
        <div className="p-6 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-theme-secondary mb-3 flex items-center justify-center overflow-hidden border-2 border-theme-primary transition-all duration-300 shadow-lg">
            <img src={settings.logoUrl} alt="Logo da Papelaria" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-title font-bold text-center leading-tight transition-all duration-300">{settings.systemName}</h1>
          <p className="text-[10px] opacity-70 mt-1 uppercase tracking-widest font-bold">{settings.storeName}</p>
        </div>
        
        <nav className="flex-1 mt-4 overflow-y-auto coffee-scroll">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 transition-all text-sm font-bold ${activeTab === item.id ? 'bg-theme-secondary text-theme-primary border-r-4 border-theme-primary' : 'hover:bg-theme-secondary/20 opacity-60 hover:opacity-100'}`}
            >
              <span className="opacity-70">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-theme-secondary space-y-4">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-6 py-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all text-sm font-bold">
            <LogOut size={20} /> Sair do Atelier
          </button>
          <div className="text-[10px] text-center opacity-40 uppercase tracking-widest font-black">&copy; {new Date().getFullYear()} {settings.systemName}<br/>Brasil</div>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-theme-secondary flex items-center justify-between px-8 shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-3">
             <h2 className="text-lg font-title font-bold opacity-80">{MENU_ITEMS.find(i => i.id === activeTab)?.label}</h2>
             {/* Indicador de Status da Nuvem */}
             <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${isSyncing ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-green-50 text-green-600'}`}>
                {isSyncing ? <Loader2 size={10} className="animate-spin" /> : <CloudCheck size={10} />}
                {isSyncing ? 'Sincronizando...' : 'Nuvem OK'}
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            {!dataLoaded && !permissionError && <div className="text-[10px] font-black uppercase text-amber-500 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Sincronizando Atelier...</div>}
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40 font-title">Profissional:</span>
              <span className="text-xs font-bold text-theme-primary">{user?.email?.split('@')[0]}</span>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 coffee-scroll relative">
          {/* Cortina de carregamento interno */}
          {!dataLoaded && !permissionError && (
            <div className="absolute inset-0 z-50 bg-theme-app/50 backdrop-blur-sm flex items-center justify-center">
               <div className="flex flex-col items-center gap-2">
                 <Loader2 size={32} className="animate-spin text-theme-primary opacity-30" />
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 font-title">Organizando Papéis e Tintas...</p>
               </div>
            </div>
          )}
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
