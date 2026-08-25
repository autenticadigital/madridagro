import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Vendas } from './pages/Vendas';
import { Estoque } from './pages/Estoque';
import { Clientes } from './pages/Clientes';
import { Fiados } from './pages/Fiados';
import { Configuracoes } from './pages/Configuracoes';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-palette-5/50 flex items-center justify-center text-palette-1 font-bold animate-pulse">Carregando...</div>;
  }

  if (!session) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="vendas" element={<Vendas />} />
          <Route path="estoque" element={<Estoque />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="fiados" element={<Fiados />} />
          <Route path="configuracoes" element={<Configuracoes />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
