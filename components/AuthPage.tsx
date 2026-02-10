
import React, { useState } from 'react';
import { 
  auth,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  googleProvider
} from '../firebase';
import { 
  Coffee, 
  Mail, 
  Lock, 
  UserPlus, 
  LogIn, 
  ArrowRight,
  Loader2,
  AlertCircle,
  Chrome
} from 'lucide-react';

interface FirebaseError extends Error {
  code?: string;
}

const AuthPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<{ message: string; isConfigError?: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  // Login com Google (Sincronização)
  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const firebaseError = err as FirebaseError;
      setError({ message: `Erro ao entrar com Google: ${firebaseError.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: unknown) {
      const firebaseError = err as FirebaseError;
      let errorMessage = 'Erro ao processar. Tente novamente.';
      if (firebaseError.code === 'auth/invalid-credential') errorMessage = 'E-mail ou senha incorretos.';
      setError({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-theme-app p-4">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="bg-white rounded-[3rem] shadow-2xl border-4 border-theme-secondary p-10 space-y-6 relative overflow-hidden">
          
          <div className="text-center space-y-2">
            <div className="inline-flex p-4 bg-theme-secondary/30 rounded-full text-theme-primary mb-2">
              <Coffee size={40} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-title font-black text-theme-primary">Paper&Coffee</h1>
            <p className="text-xs font-bold opacity-60 px-4 uppercase tracking-widest">Atelier de Papelaria Criativa</p>
          </div>

          {/* Botão Google - Sincronização Direta */}
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-4 bg-white border-2 border-theme-secondary/30 text-theme-primary font-black rounded-3xl shadow-sm flex items-center justify-center gap-3 hover:bg-theme-app transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Chrome size={20} className="text-blue-500" />}
            <span className="uppercase tracking-widest text-[10px]">Entrar com Google</span>
          </button>

          <div className="flex items-center gap-4 py-2 opacity-20">
            <div className="flex-1 h-[1px] bg-theme-primary"></div>
            <span className="text-[10px] font-black uppercase">OU</span>
            <div className="flex-1 h-[1px] bg-theme-primary"></div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-bold border border-red-100">
              <AlertCircle size={16} />
              <span>{error.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black opacity-40 uppercase tracking-widest ml-4">E-mail Profissional</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                <input 
                  type="email" required
                  placeholder="seu@atelier.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-theme-app/50 border-2 border-theme-secondary/20 rounded-3xl outline-none font-bold text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black opacity-40 uppercase tracking-widest ml-4">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                <input 
                  type="password" required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-theme-app/50 border-2 border-theme-secondary/20 rounded-3xl outline-none font-bold text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full py-4 bg-theme-primary text-white font-black rounded-3xl shadow-xl flex items-center justify-center gap-3 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <span className="uppercase tracking-widest text-[10px]">{isRegister ? 'Criar Cadastro' : 'Entrar no Sistema'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="text-[10px] font-black text-theme-primary opacity-50 hover:opacity-100 uppercase tracking-widest"
            >
              {isRegister ? 'Já tenho acesso ☕' : 'Não tenho conta ✨'}
            </button>
          </div>
        </div>
        <p className="text-center mt-6 text-[9px] font-black opacity-30 uppercase tracking-[0.3em]">
          Paper&Coffee Brasil • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
