import { useState } from 'react';
import { useLiveSupabase } from '../hooks/useLiveSupabase';
import { supabase } from '../lib/supabase';
import type { AccountReceivable, Client, PartialPayment } from '../lib/types';
import { Receipt, CheckCircle, Trash2, Edit2, X, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export function Fiados() {
  const receivables = useLiveSupabase<AccountReceivable>('accounts_receivable', 'created_at', false);
  const clients = useLiveSupabase<Client>('clients', 'name', true);
  const partialPayments = useLiveSupabase<PartialPayment>('partial_payments', 'created_at', false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');

  const handlePay = async (id: string) => {
    if (!window.confirm('Confirmar baixa TOTAL deste fiado?')) return;
    try {
      const { error } = await supabase.from('accounts_receivable').update({ status: 'paid' }).eq('id', id);
      if (error) throw error;
      toast.success('Baixa registrada com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao registrar baixa: ' + error.message);
    }
  };

  const handlePartialPayment = async (id: string, currentAmount: number) => {
    const amountStr = window.prompt(`Valor a abater do saldo de R$ ${currentAmount.toFixed(2)}?`);
    if (!amountStr) return;
    const amount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return toast.error('Valor inválido.');
    if (amount > currentAmount) return toast.error('Valor não pode ser maior que a dívida restante!');

    try {
      const now = new Date().toISOString();
      const { error: insertError } = await supabase.from('partial_payments').insert([{
        account_receivable_id: id,
        amount,
        date: now
      }]);
      if (insertError) throw insertError;

      if (amount >= currentAmount) {
        const { error: updateError } = await supabase.from('accounts_receivable').update({ status: 'paid' }).eq('id', id);
        if (updateError) throw updateError;
        toast.success('Dívida quitada com sucesso!');
      } else {
        toast.success(`Abatimento de R$ ${amount.toFixed(2)} registrado!`);
      }
    } catch (error: any) {
      toast.error('Erro ao abater valor: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Atenção: Ao excluir este fiado, a venda continuará existindo, mas sem registro de dívida. Deseja mesmo excluir?')) return;
    try {
      const { error } = await supabase.from('accounts_receivable').delete().eq('id', id);
      if (error) throw error;
      toast.success('Fiado excluído com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao excluir: ' + error.message);
    }
  };

  const startEditing = (rec: any) => {
    setEditingId(rec.id);
    setEditAmount(rec.amount.toString());
    setEditDate(new Date(rec.due_date).toISOString().split('T')[0]);
  };

  const saveEdit = async (id: string) => {
    try {
      const { error } = await supabase.from('accounts_receivable').update({
        amount: parseFloat(editAmount),
        due_date: new Date(editDate).toISOString()
      }).eq('id', id);
      if (error) throw error;
      toast.success('Fiado atualizado!');
      setEditingId(null);
    } catch (error: any) {
      toast.error('Erro ao atualizar: ' + error.message);
    }
  };

  const pending = receivables?.filter(r => r.status === 'pending') || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-main">Fiados</h1>
          <p className="text-palette-2 text-sm">Contas a receber pendentes.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pending.map(rec => {
          const client = clients?.find(c => c.id === rec.client_id);
          const isLate = new Date(rec.due_date) < new Date();
          const isEditing = editingId === rec.id;
          const recPayments = partialPayments?.filter(p => p.account_receivable_id === rec.id) || [];
          const totalPaid = recPayments.reduce((acc, p) => acc + p.amount, 0);
          const remainingAmount = rec.amount - totalPaid;
          
          return (
            <div key={rec.id} className="bg-white border border-palette-4 p-5 rounded-2xl flex flex-col gap-4 relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
              <div className={`absolute top-0 left-0 w-full h-1.5 ${isLate ? 'bg-red-500' : 'bg-amber-500'}`}></div>
              
              <div className="flex justify-between items-start pt-2">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${isLate ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                    <Receipt size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-main text-lg leading-tight">{client?.name || 'Cliente Excluído'}</h3>
                    {isEditing ? (
                      <input 
                        type="date" 
                        value={editDate} 
                        onChange={e => setEditDate(e.target.value)}
                        className="mt-1 p-1 border rounded text-xs"
                      />
                    ) : (
                      <p className={`text-xs mt-1 ${isLate ? 'text-red-500 font-bold' : 'text-palette-2 font-medium'}`}>
                        Vence(u): {new Date(rec.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isEditing ? (
                    <button onClick={() => setEditingId(null)} className="p-1.5 text-palette-2 hover:bg-palette-5/30 rounded-lg"><X size={16}/></button>
                  ) : (
                    <>
                      <button onClick={() => startEditing(rec)} className="p-1.5 text-palette-3 hover:text-palette-1 bg-palette-5/20 hover:bg-palette-5/50 rounded-lg transition-colors"><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete(rec.id)} className="p-1.5 text-red-300 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={16}/></button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2 pt-4 border-t border-palette-4/50">
                {isEditing ? (
                  <input 
                    type="number" step="0.01"
                    value={editAmount}
                    onChange={e => setEditAmount(e.target.value)}
                    className="text-xl font-black text-text-main w-24 p-1 border rounded"
                  />
                ) : (
                  totalPaid > 0 ? (
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-text-main">R$ {remainingAmount.toFixed(2)}</span>
                      <span className="text-xs font-bold text-emerald-500">Já pago: R$ {totalPaid.toFixed(2)} (Total: R$ {rec.amount.toFixed(2)})</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-black text-text-main">R$ {rec.amount.toFixed(2)}</p>
                  )
                )}

                {isEditing ? (
                  <button 
                    onClick={() => saveEdit(rec.id)}
                    className="bg-palette-1 hover:bg-palette-1-dark text-white p-2 px-4 rounded-xl transition-all flex items-center gap-2 text-sm font-bold shadow-sm"
                  >
                    Salvar
                  </button>
                ) : (
                  <div className="flex flex-col md:flex-row gap-2">
                    <button 
                      onClick={() => handlePartialPayment(rec.id, remainingAmount)}
                      className="bg-white hover:bg-emerald-50 text-emerald-600 border border-emerald-300 p-2 rounded-xl transition-all flex items-center justify-center gap-1 text-sm font-bold shadow-sm"
                      title="Abater Valor"
                    >
                      <DollarSign size={16} /> Abater
                    </button>
                    <button 
                      onClick={() => handlePay(rec.id)}
                      className="bg-white hover:bg-palette-5/30 text-palette-1 border border-palette-1 p-2 rounded-xl transition-all flex items-center justify-center gap-1 text-sm font-bold shadow-sm"
                      title="Quitar Tudo"
                    >
                      <CheckCircle size={16} /> Baixa
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {pending.length === 0 && (
          <div className="col-span-full p-10 text-center text-palette-2 font-medium bg-white rounded-2xl border border-palette-4 border-dashed">
            Nenhum fiado pendente. Que beleza!
          </div>
        )}
      </div>
    </div>
  );
}
