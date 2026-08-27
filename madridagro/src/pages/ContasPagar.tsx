import { useState, useEffect } from 'react';
import { ArrowDownRight, Clock, CheckCircle2, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Payable {
  id: string;
  supplier: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid';
  description?: string;
}

export function ContasPagar() {
  const [payables, setPayables] = useState<Payable[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPayable, setNewPayable] = useState({
    supplier: '',
    amount: '',
    due_date: '',
    description: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const openNewModal = () => {
    setEditingId(null);
    setNewPayable({ supplier: '', amount: '', due_date: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Payable) => {
    setEditingId(item.id);
    setNewPayable({
      supplier: item.supplier,
      amount: item.amount.toString(),
      due_date: item.due_date.substring(0, 10),
      description: item.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
      try {
        const { error } = await supabase.from('accounts_payable').delete().eq('id', id);
        if (error) throw error;
        toast.success('Conta excluída com sucesso!');
      } catch (err) {
        toast.error('Erro ao excluir a conta');
      }
    }
  };

  useEffect(() => {
    fetchPayables();
    
    const channel = supabase.channel('custom-all-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts_payable' }, () => {
        fetchPayables();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPayables = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts_payable')
        .select('*')
        .order('due_date', { ascending: true });
        
      if (error) throw error;
      setPayables(data || []);
    } catch (error) {
      console.error('Error fetching payables:', error);
      toast.error('Erro ao carregar contas a pagar');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase.from('accounts_payable').update({
          supplier: newPayable.supplier,
          amount: parseFloat(newPayable.amount),
          due_date: new Date(newPayable.due_date).toISOString(),
          description: newPayable.description
        }).eq('id', editingId);
        if (error) throw error;
        toast.success('Conta atualizada com sucesso!');
      } else {
        const { error } = await supabase.from('accounts_payable').insert([{
          supplier: newPayable.supplier,
          amount: parseFloat(newPayable.amount),
          due_date: new Date(newPayable.due_date).toISOString(),
          description: newPayable.description,
          status: 'pending'
        }]);
        if (error) throw error;
        toast.success('Conta adicionada com sucesso!');
      }
      setIsModalOpen(false);
      setNewPayable({ supplier: '', amount: '', due_date: '', description: '' });
      setEditingId(null);
    } catch (error) {
      toast.error('Erro ao salvar conta');
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'pending' ? 'paid' : 'pending';
      const { error } = await supabase
        .from('accounts_payable')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) throw error;
      toast.success(`Conta marcada como ${newStatus === 'paid' ? 'paga' : 'pendente'}`);
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const totalPendente = payables
    .filter(p => p.status === 'pending')
    .reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-main">Contas a Pagar</h2>
          <p className="text-palette-2 text-sm">Gestão de pagamentos das safras aos produtores.</p>
        </div>
        <button 
          onClick={openNewModal}
          className="flex items-center gap-2 bg-palette-1 text-white px-4 py-2 rounded-xl font-bold hover:bg-palette-2 transition-colors shadow-sm"
        >
          <Plus size={20} /> Nova Conta
        </button>
      </header>

      <div className="bg-white border border-palette-4 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-palette-4 flex gap-4 bg-palette-5/10">
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg flex items-center gap-2 border border-red-200">
            <ArrowDownRight size={20} />
            <span className="font-black text-sm uppercase tracking-wider">
              Total a Pagar: R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-palette-2 font-bold animate-pulse">Carregando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-palette-4 text-palette-2 text-sm">
                  <th className="p-4 font-bold uppercase tracking-wider">Produtor</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Descrição/Carga</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Vencimento</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Valor</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Status</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {payables.map((item) => (
                  <tr key={item.id} className="border-b border-palette-5 hover:bg-palette-5/20 transition-colors">
                    <td className="p-4 font-bold text-text-main">{item.supplier}</td>
                    <td className="p-4 text-sm font-medium text-palette-3">{item.description || '-'}</td>
                    <td className="p-4 text-sm font-medium text-palette-2">
                      {new Date(item.due_date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4 font-black text-text-main">R$ {Number(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => toggleStatus(item.id, item.status)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase cursor-pointer transition-colors ${
                          item.status === 'pending' 
                            ? 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100' 
                            : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                        }`}
                      >
                        {item.status === 'pending' ? <><Clock size={14} /> Aguardando</> : <><CheckCircle2 size={14} /> Pago</>}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => openEditModal(item)} className="p-1.5 text-palette-3 hover:text-palette-1 transition-colors mr-2">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-palette-3 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {payables.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-palette-2">Nenhuma conta encontrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-palette-4 flex justify-between items-center bg-palette-5/20">
              <h3 className="font-bold text-text-main text-lg">{editingId ? 'Editar Conta' : 'Nova Conta a Pagar'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-palette-3 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddPayable} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-palette-2 mb-1">Produtor</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-palette-5/30 border border-palette-4 rounded-xl p-3 focus:ring-2 focus:ring-palette-1/50 outline-none transition-all font-medium text-text-main"
                  value={newPayable.supplier}
                  onChange={e => setNewPayable({...newPayable, supplier: e.target.value})}
                  placeholder="Nome da fazenda ou produtor"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-palette-2 mb-1">Descrição / Ref. Carga</label>
                <input 
                  type="text" 
                  className="w-full bg-palette-5/30 border border-palette-4 rounded-xl p-3 focus:ring-2 focus:ring-palette-1/50 outline-none transition-all font-medium text-text-main"
                  value={newPayable.description}
                  onChange={e => setNewPayable({...newPayable, description: e.target.value})}
                  placeholder="Ex: Carga VG-1042"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-palette-2 mb-1">Valor (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    className="w-full bg-palette-5/30 border border-palette-4 rounded-xl p-3 focus:ring-2 focus:ring-palette-1/50 outline-none transition-all font-medium text-text-main"
                    value={newPayable.amount}
                    onChange={e => setNewPayable({...newPayable, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-palette-2 mb-1">Vencimento</label>
                  <input 
                    type="date" 
                    required
                    className="w-full bg-palette-5/30 border border-palette-4 rounded-xl p-3 focus:ring-2 focus:ring-palette-1/50 outline-none transition-all font-medium text-text-main"
                    value={newPayable.due_date}
                    onChange={e => setNewPayable({...newPayable, due_date: e.target.value})}
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-palette-1 hover:bg-palette-2 text-white font-bold py-3 rounded-xl mt-4 transition-colors"
              >
                Salvar Conta
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
