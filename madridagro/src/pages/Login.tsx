import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Logo } from '../components/ui/Logo';
import toast from 'react-hot-toast';

type AuthMode = 'login' | 'reset';

export function Login() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        toast.success('Instruções enviadas para o seu e-mail!');
        setMode('login');
      }
    } catch (err: any) {
      toast.error(err.message || 'Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-palette-5/50 flex items-center justify-center p-4 animate-fade-in duration-500">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white border border-palette-4 p-8 rounded-3xl shadow-xl relative animate-slide-up">
        <div className="flex flex-col items-center mb-8">
           <Logo className="w-[75px] h-auto drop-shadow-md hover:scale-105 transition-transform mb-4" />
           <h1 className="text-3xl font-black text-center text-palette-5 uppercase tracking-tight">Madrid Agro</h1>
           <p className="text-center text-palette-4 font-bold mt-1 uppercase tracking-widest text-xs">Gestão de Vendas</p>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-text-main mb-1">E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-palette-5/20 border border-palette-4 rounded-xl p-3 text-text-main focus:outline-none focus:border-palette-1 focus:ring-1 focus:ring-palette-1 transition-all" />
          </div>
          {mode !== 'reset' && (
            <div>
              <label className="block text-sm font-bold text-text-main mb-1">Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full bg-palette-5/20 border border-palette-4 rounded-xl p-3 text-text-main focus:outline-none focus:border-palette-1 focus:ring-1 focus:ring-palette-1 transition-all" />
            </div>
          )}
          <button disabled={loading} type="submit"
            className="w-full bg-palette-1 hover:brightness-110 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:shadow-none disabled:transform-none mt-2">
            {loading ? 'Aguarde...' : mode === 'login' ? 'Acessar Sistema' : 'Recuperar Senha'}
          </button>

          <div className="flex flex-col items-center space-y-3 mt-6 text-sm font-bold text-palette-1">
            {mode === 'login' ? (
              <>
                <button type="button" onClick={() => setMode('reset')} className="hover:underline text-palette-2 mt-2">Esqueci minha senha</button>
              </>
            ) : (
              <button type="button" onClick={() => setMode('login')} className="hover:underline">Voltar para o Login</button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
