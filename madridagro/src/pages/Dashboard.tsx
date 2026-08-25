import { useLiveSupabase } from '../hooks/useLiveSupabase';
import { supabase } from '../lib/supabase';
import type { Sale, AccountReceivable, Product, Client } from '../lib/types';
import { TrendingUp, Users, Package, AlertCircle, LogOut } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

export function Dashboard() {
  const sales = useLiveSupabase<Sale>('sales', 'date', false);
  const receivables = useLiveSupabase<AccountReceivable>('accounts_receivable', 'created_at', false);
  const products = useLiveSupabase<Product>('products', 'name', true);
  const clients = useLiveSupabase<Client>('clients', 'name', true);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const salesToday = sales?.filter(s => new Date(s.date) >= today).reduce((acc, s) => acc + s.total_amount, 0) || 0;
  
  const pendingReceivables = receivables?.filter(r => r.status === 'pending') || [];
  const totalPending = pendingReceivables.reduce((acc, r) => acc + r.amount, 0);
  const lateReceivables = pendingReceivables.filter(r => new Date(r.due_date) < new Date()).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Logo da Empresa */}
      <div className="flex flex-col items-center md:items-start mb-6">
        <Logo className="w-[75px] h-auto drop-shadow-md mb-2" />
        <h1 className="text-4xl md:text-5xl font-black text-palette-5 tracking-tight uppercase">Madrid Agro</h1>
        <p className="text-palette-4 font-bold mt-1 uppercase tracking-widest text-sm">Gestão de Estoque e Vendas</p>
      </div>

      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-main">Visão Geral</h2>
          <p className="text-palette-2 text-sm">Resumo da operação de hoje.</p>
        </div>
        
        <button 
          onClick={async () => await supabase.auth.signOut()}
          className="md:hidden flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700 font-bold py-2 px-4 rounded-xl transition-all shadow-sm"
        >
          <LogOut size={16} /> Sair
        </button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white border border-palette-4 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-palette-2 transition-all flex flex-col gap-2">
          <div className="flex items-center gap-2 text-palette-1">
            <TrendingUp size={22} /> <span className="font-bold text-sm uppercase tracking-wider">Vendas Hoje</span>
          </div>
          <p className="text-3xl font-black text-text-main mt-2">R$ {salesToday.toFixed(2)}</p>
        </div>

        <div className="bg-white border border-palette-4 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col gap-2 relative overflow-hidden">
          {lateReceivables > 0 && <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm">{lateReceivables} Atrasados</div>}
          <div className="flex items-center gap-2 text-amber-500">
            <AlertCircle size={22} /> <span className="font-bold text-sm uppercase tracking-wider">A Receber</span>
          </div>
          <p className="text-3xl font-black text-text-main mt-2">R$ {totalPending.toFixed(2)}</p>
        </div>

        <div className="bg-white border border-palette-4 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-palette-2 transition-all flex flex-col gap-2">
          <div className="flex items-center gap-2 text-palette-2">
            <Package size={22} /> <span className="font-bold text-sm uppercase tracking-wider">Produtos</span>
          </div>
          <p className="text-3xl font-black text-text-main mt-2">{products?.length || 0}</p>
        </div>

        <div className="bg-white border border-palette-4 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-palette-2 transition-all flex flex-col gap-2">
          <div className="flex items-center gap-2 text-palette-3">
            <Users size={22} /> <span className="font-bold text-sm uppercase tracking-wider">Clientes</span>
          </div>
          <p className="text-3xl font-black text-text-main mt-2">{clients?.length || 0}</p>
        </div>
      </div>
    </div>
  );
}
