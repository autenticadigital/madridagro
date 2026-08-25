import { useState } from 'react';
import { useLiveSupabase } from '../hooks/useLiveSupabase';
import { supabase } from '../lib/supabase';
import type { Product, Sale, SaleItem, AccountReceivable, Client } from '../lib/types';
import { Plus, CheckCircle, Trash2, ClipboardList, Package, FileText } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

import { generateSaleReceipt } from '../lib/pdf';

export function Vendas() {
  const [tab, setTab] = useState<'nova' | 'historico'>('nova');
  const products = useLiveSupabase<Product>('products', 'name', true);
  const clients = useLiveSupabase<Client>('clients', 'name', true);
  const sales = useLiveSupabase<Sale>('sales', 'date', false);
  const allSaleItems = useLiveSupabase<SaleItem>('sale_items', 'id', true);

  const [items, setItems] = useState<{ product: Product; quantity: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit_card' | 'pix' | 'term'>('cash');
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  // Formulário de adição de item
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [addQuantity, setAddQuantity] = useState<string>('1');

  const handleAddItem = () => {
    if (!selectedProductId) return toast.error('Selecione um produto.');
    const qty = parseInt(addQuantity, 10);
    if (isNaN(qty) || qty <= 0) return toast.error('Quantidade inválida.');

    const product = products?.find(p => p.id === selectedProductId);
    if (!product) return;

    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, { product, quantity: qty }];
    });

    setSelectedProductId('');
    setAddQuantity('1');
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const total = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const handleSaveSale = async (generatePdf: boolean = false) => {
    if (items.length === 0) return toast.error('Adicione pelo menos um item à venda.');
    if (paymentMethod === 'term' && !selectedClientId) return toast.error('Para vendas a prazo (fiado), é obrigatório selecionar o cliente.');

    const saleId = uuidv4();
    const now = new Date().toISOString();

    const sale: Sale = {
      id: saleId,
      client_id: selectedClientId || undefined,
      total_amount: total,
      payment_method: paymentMethod,
      status: paymentMethod === 'term' ? 'pending' : 'paid',
      date: now,
      created_at: now
    };

    const saleItems: SaleItem[] = items.map(item => ({
      id: uuidv4(),
      sale_id: saleId,
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.product.price,
      subtotal: item.product.price * item.quantity
    }));

    try {
      const { error: saleError } = await supabase.from('sales').insert([sale]);
      if (saleError) throw saleError;

      const { error: itemsError } = await supabase.from('sale_items').insert(saleItems);
      if (itemsError) throw itemsError;

      const invTxs = saleItems.map(item => ({
        id: uuidv4(),
        product_id: item.product_id,
        type: 'out' as const,
        quantity: item.quantity,
        date: now,
        notes: `Saída (Venda ${saleId.slice(0,6)})`,
        created_at: now
      }));
      const { error: invError } = await supabase.from('inventory').insert(invTxs);
      if (invError) throw invError;

      if (paymentMethod === 'term' && selectedClientId) {
        const receivable: AccountReceivable = {
          id: uuidv4(),
          sale_id: saleId,
          client_id: selectedClientId,
          amount: total,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          created_at: now
        };
        const { error: recError } = await supabase.from('accounts_receivable').insert([receivable]);
        if (recError) throw recError;
      }

      if (generatePdf) {
        const client = clients?.find(c => c.id === selectedClientId);
        const saleWithDetails = {
          ...sale,
          client,
          items: items.map(i => ({
            id: uuidv4(),
            sale_id: saleId,
            product_id: i.product.id,
            quantity: i.quantity,
            unit_price: i.product.price,
            subtotal: i.product.price * i.quantity,
            product: i.product
          }))
        };
        await generateSaleReceipt(saleWithDetails);
      }

      toast.success(generatePdf ? 'Venda registrada e PDF gerado!' : 'Venda registrada com sucesso!');
      setItems([]);
      setSelectedClientId('');
      setPaymentMethod('cash');
    } catch (error: any) {
      console.error(error);
      toast.error('Erro ao salvar a venda: ' + error.message);
    }
  };

  const handleCancelSale = async (sale: Sale) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta venda? Os produtos serão devolvidos ao estoque e cobranças removidas.')) return;
    
    const now = new Date().toISOString();
    
    try {
      const saleItemsToCancel = allSaleItems?.filter(si => si.sale_id === sale.id) || [];
      if (saleItemsToCancel.length > 0) {
        const invTxs = saleItemsToCancel.map(item => ({
          id: uuidv4(),
          product_id: item.product_id,
          type: 'in' as const,
          quantity: item.quantity,
          date: now,
          notes: `Estorno (Cancelamento Venda ${sale.id.slice(0,6)})`,
          created_at: now
        }));
        await supabase.from('inventory').insert(invTxs);
        await supabase.from('sale_items').delete().eq('sale_id', sale.id);
      }

      await supabase.from('accounts_receivable').delete().eq('sale_id', sale.id);
      await supabase.from('sales').delete().eq('id', sale.id);
      
      toast.success('Venda cancelada com sucesso!');
    } catch(e: any) {
      toast.error('Erro ao cancelar venda: ' + e.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-text-main">Ponto de Venda</h1>
        <p className="text-palette-2 text-sm">Registre suas vendas rapidamente.</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-palette-4">
        <button 
          onClick={() => setTab('nova')}
          className={`pb-3 px-2 font-bold transition-all ${tab === 'nova' ? 'border-b-2 border-palette-1 text-palette-1' : 'text-palette-3 hover:text-palette-2'}`}
        >
          Nova Venda
        </button>
        <button 
          onClick={() => setTab('historico')}
          className={`pb-3 px-2 font-bold transition-all ${tab === 'historico' ? 'border-b-2 border-palette-1 text-palette-1' : 'text-palette-3 hover:text-palette-2'}`}
        >
          Histórico
        </button>
      </div>

      {tab === 'nova' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          {/* Lado Esquerdo: Formulário */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-palette-4 p-5 rounded-2xl shadow-sm space-y-4">
              <h2 className="font-bold text-lg text-text-main flex items-center gap-2 border-b border-palette-4 pb-2">
                <Package size={20} className="text-palette-1"/> Adicionar Produto
              </h2>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-text-main mb-1">Produto *</label>
                  <select 
                    value={selectedProductId} 
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-palette-5/20 border border-palette-4 rounded-xl p-3 text-text-main focus:outline-none focus:border-palette-1 focus:ring-1 focus:ring-palette-1 appearance-none"
                  >
                    <option value="">Selecione um produto...</option>
                    {products?.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - R$ {p.price.toFixed(2)}</option>
                    ))}
                  </select>
                </div>
                <div className="w-full md:w-32">
                  <label className="block text-sm font-bold text-text-main mb-1">Qtd *</label>
                  <input 
                    type="number" min="1" 
                    value={addQuantity} 
                    onChange={e => setAddQuantity(e.target.value)}
                    className="w-full bg-palette-5/20 border border-palette-4 rounded-xl p-3 text-text-main focus:outline-none focus:border-palette-1 focus:ring-1 focus:ring-palette-1"
                  />
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={handleAddItem}
                    className="w-full md:w-auto bg-palette-1 hover:bg-palette-1-dark text-white font-bold p-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Plus size={20}/> Adicionar
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white border border-palette-4 p-5 rounded-2xl shadow-sm">
              <h2 className="font-bold text-lg text-text-main flex items-center gap-2 border-b border-palette-4 pb-2 mb-4">
                <ClipboardList size={20} className="text-palette-1"/> Itens da Venda
              </h2>

              <div className="space-y-3">
                {items.length === 0 ? (
                  <p className="text-center py-6 text-palette-2 font-medium">Nenhum produto adicionado.</p>
                ) : (
                  items.map(item => (
                    <div key={item.product.id} className="flex items-center justify-between bg-palette-5/20 p-3 rounded-xl border border-palette-4 hover:border-palette-2 transition-colors">
                      <div className="flex-1">
                        <p className="font-bold text-text-main">{item.product.name}</p>
                        <p className="text-sm text-palette-2">{item.quantity}x de R$ {item.product.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-black text-palette-1">R$ {(item.quantity * item.product.price).toFixed(2)}</p>
                        <button onClick={() => removeItem(item.product.id)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Lado Direito: Fechamento */}
          <div className="bg-white border border-palette-4 p-5 rounded-2xl shadow-sm h-fit sticky top-6">
            <h2 className="font-bold text-lg text-text-main border-b border-palette-4 pb-2 mb-4">Fechamento</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-text-main mb-1">Forma de Pagamento</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setPaymentMethod('cash')} className={`py-2 px-3 rounded-xl font-bold text-sm transition-all border ${paymentMethod === 'cash' ? 'bg-palette-1 text-white border-palette-1' : 'bg-white text-palette-2 border-palette-4 hover:border-palette-1'}`}>Dinheiro</button>
                  <button onClick={() => setPaymentMethod('credit_card')} className={`py-2 px-3 rounded-xl font-bold text-sm transition-all border ${paymentMethod === 'credit_card' ? 'bg-palette-1 text-white border-palette-1' : 'bg-white text-palette-2 border-palette-4 hover:border-palette-1'}`}>Cartão</button>
                  <button onClick={() => setPaymentMethod('pix')} className={`py-2 px-3 rounded-xl font-bold text-sm transition-all border ${paymentMethod === 'pix' ? 'bg-palette-1 text-white border-palette-1' : 'bg-white text-palette-2 border-palette-4 hover:border-palette-1'}`}>PIX</button>
                  <button onClick={() => setPaymentMethod('term')} className={`py-2 px-3 rounded-xl font-bold text-sm transition-all border ${paymentMethod === 'term' ? 'bg-palette-1 text-white border-palette-1' : 'bg-white text-palette-2 border-palette-4 hover:border-palette-1'}`}>A Prazo</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-main mb-1">Vincular Cliente</label>
                <select 
                  value={selectedClientId} 
                  onChange={e => setSelectedClientId(e.target.value)}
                  className="w-full bg-palette-5/20 border border-palette-4 rounded-xl p-3 text-text-main focus:outline-none focus:border-palette-1 transition-all"
                >
                  <option value="">Cliente Opcional (Avulso)</option>
                  {clients?.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {paymentMethod === 'term' && !selectedClientId && (
                  <p className="text-red-500 text-xs mt-1 font-bold">Obrigatório para venda a prazo.</p>
                )}
              </div>

              <div className="pt-4 border-t border-palette-4 mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-text-main font-bold">Total Geral</span>
                  <span className="text-2xl font-black text-palette-1">R$ {total.toFixed(2)}</span>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <button 
                    onClick={() => handleSaveSale(false)}
                    disabled={items.length === 0 || (paymentMethod === 'term' && !selectedClientId)}
                    className="w-full bg-palette-1 hover:bg-palette-1-dark text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={20} /> Registrar Venda
                  </button>
                  
                  <button 
                    onClick={() => handleSaveSale(true)}
                    disabled={items.length === 0 || (paymentMethod === 'term' && !selectedClientId)}
                    className="w-full bg-white border-2 border-palette-1 text-palette-1 hover:bg-palette-5/10 font-bold py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                  >
                    <FileText size={20} /> Registrar e Gerar PDF
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {tab === 'historico' && (
        <div className="bg-white border border-palette-4 rounded-2xl overflow-hidden shadow-sm animate-in fade-in">
          <table className="w-full text-left text-sm">
            <thead className="bg-palette-5/30 border-b border-palette-4 text-text-main font-bold">
              <tr>
                <th className="p-4">Data/Hora</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Pagamento</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4 w-20 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sales?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(sale => {
                const client = clients?.find(c => c.id === sale.client_id);
                return (
                  <tr key={sale.id} className="border-b border-palette-4/50 hover:bg-palette-5/10 transition-colors group">
                    <td className="p-4 text-palette-2 font-medium">{new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                    <td className="p-4 font-bold text-text-main">{client?.name || 'Venda Avulsa'}</td>
                    <td className="p-4">
                      {sale.payment_method === 'cash' && <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-bold text-xs">DINHEIRO</span>}
                      {sale.payment_method === 'credit_card' && <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold text-xs">CARTÃO</span>}
                      {sale.payment_method === 'pix' && <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded font-bold text-xs">PIX</span>}
                      {sale.payment_method === 'term' && <span className="bg-red-50 text-red-700 px-2 py-1 rounded font-bold text-xs">A PRAZO</span>}
                    </td>
                    <td className="p-4 text-right font-black text-palette-1">R$ {sale.total_amount.toFixed(2)}</td>
                    <td className="p-4 text-center flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleCancelSale(sale)} 
                        className="p-1.5 text-red-300 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100" 
                        title="Cancelar Venda"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sales?.length === 0 && (
            <p className="text-center p-10 text-palette-2 font-medium">Nenhuma venda registrada.</p>
          )}
        </div>
      )}
    </div>
  );
}
