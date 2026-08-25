import { useState } from 'react';
import { useLiveSupabase } from '../hooks/useLiveSupabase';
import { supabase } from '../lib/supabase';
import type { Product, InventoryTransaction } from '../lib/types';
import { Plus, Package, ArrowDown, ArrowUp, Edit2, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

export function Estoque() {
  const [tab, setTab] = useState<'movimentacoes' | 'produtos'>('movimentacoes');
  const products = useLiveSupabase<Product>('products', 'name', true);
  const inventory = useLiveSupabase<InventoryTransaction>('inventory', 'date', false);

  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');

  const [isAddingMov, setIsAddingMov] = useState(false);
  const [movProductId, setMovProductId] = useState('');
  const [movType, setMovType] = useState<'in' | 'out'>('in');
  const [movQuantity, setMovQuantity] = useState('');

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setNewProductName(product.name);
    setNewProductPrice(product.price.toString());
    setIsAddingProduct(true);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o produto "${name}"?`)) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        toast.success(`Produto "${name}" excluído!`);
      } catch (error: any) {
        toast.error('Erro ao excluir: ' + error.message);
      }
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProductId) {
        const { error } = await supabase.from('products').update({
          name: newProductName,
          price: parseFloat(newProductPrice),
        }).eq('id', editingProductId);
        if (error) throw error;
        toast.success('Produto atualizado!');
      } else {
        const product = {
          id: uuidv4(),
          name: newProductName,
          price: parseFloat(newProductPrice),
          created_at: new Date().toISOString(),
        };
        const { error } = await supabase.from('products').insert([product]);
        if (error) throw error;
        toast.success('Produto cadastrado com sucesso!');
      }
      
      setIsAddingProduct(false);
      setEditingProductId(null);
      setNewProductName('');
      setNewProductPrice('');
    } catch (error: any) {
      toast.error('Erro ao salvar produto: ' + error.message);
    }
  };

  const handleCancelProduct = () => {
    setIsAddingProduct(false);
    setEditingProductId(null);
    setNewProductName('');
    setNewProductPrice('');
  };

  const handleSaveMov = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movProductId) return toast.error('Selecione um produto.');
    const now = new Date().toISOString();
    const mov = {
      id: uuidv4(),
      product_id: movProductId,
      type: movType,
      quantity: parseInt(movQuantity, 10),
      date: now,
      created_at: now
    };
    
    try {
      const { error } = await supabase.from('inventory').insert([mov]);
      if (error) throw error;
      
      toast.success('Movimentação registrada com sucesso!');
      setIsAddingMov(false);
      setMovQuantity('');
    } catch (error: any) {
      toast.error('Erro ao registrar movimentação: ' + error.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-main">Estoque</h1>
          <p className="text-palette-2 text-sm">Controle de entradas e produtos.</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-palette-4">
        <button 
          onClick={() => setTab('movimentacoes')}
          className={`pb-3 px-2 font-bold transition-all ${tab === 'movimentacoes' ? 'border-b-2 border-palette-1 text-palette-1' : 'text-palette-3 hover:text-palette-2'}`}
        >
          Movimentações
        </button>
        <button 
          onClick={() => setTab('produtos')}
          className={`pb-3 px-2 font-bold transition-all ${tab === 'produtos' ? 'border-b-2 border-palette-1 text-palette-1' : 'text-palette-3 hover:text-palette-2'}`}
        >
          Produtos Cadastrados
        </button>
      </div>

      {tab === 'produtos' && (
        <div className="space-y-4 animate-in fade-in">
          {!isAddingProduct && (
            <button 
              onClick={() => setIsAddingProduct(true)}
              className="bg-white border border-palette-4 hover:border-palette-1 text-palette-1 font-bold p-3 rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2"
            >
              <Plus size={20} /> Cadastrar Novo Produto
            </button>
          )}

          {isAddingProduct && (
            <form onSubmit={handleSaveProduct} className="bg-white border border-palette-4 p-5 rounded-2xl shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-text-main border-b border-palette-4 pb-2 mb-2">
                {editingProductId ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-text-main mb-1">Nome do Produto *</label>
                  <input type="text" value={newProductName} onChange={e => setNewProductName(e.target.value)} required
                    className="w-full bg-palette-5/20 border border-palette-4 rounded-xl p-3 text-text-main focus:outline-none focus:border-palette-1 focus:ring-1 focus:ring-palette-1 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-main mb-1">Preço de Venda (R$) *</label>
                  <input type="number" step="0.01" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} required
                    className="w-full bg-palette-5/20 border border-palette-4 rounded-xl p-3 text-text-main focus:outline-none focus:border-palette-1 focus:ring-1 focus:ring-palette-1 transition-all" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={handleCancelProduct} className="px-4 py-2 text-palette-2 hover:text-text-main font-semibold">Cancelar</button>
                <button type="submit" className="bg-palette-1 hover:bg-palette-1-dark text-white px-6 py-2 rounded-xl font-bold shadow-md transition-all">
                  {editingProductId ? 'Atualizar Produto' : 'Salvar Produto'}
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products?.map(p => {
              const productInventory = inventory?.filter(i => i.product_id === p.id) || [];
              const currentStock = productInventory.reduce((acc, curr) => curr.type === 'in' ? acc + curr.quantity : acc - curr.quantity, 0);

              return (
                <div key={p.id} className="bg-white border border-palette-4 p-5 rounded-2xl shadow-sm flex items-center justify-between hover:border-palette-2 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-palette-5/50 rounded-full flex items-center justify-center text-palette-1">
                      <Package size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-text-main">{p.name}</h3>
                      <p className="text-sm font-semibold text-palette-2">R$ {p.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-palette-3 uppercase font-bold tracking-wider">Estoque</p>
                      <p className={`text-2xl font-black ${currentStock < 0 ? 'text-red-500' : 'text-palette-1'}`}>{currentStock}</p>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <button onClick={() => handleEditProduct(p)} className="p-1.5 text-palette-3 hover:text-palette-1 bg-palette-5/20 hover:bg-palette-5/50 rounded-lg transition-colors" title="Editar">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteProduct(p.id, p.name)} className="p-1.5 text-red-300 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Excluir">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'movimentacoes' && (
        <div className="space-y-4 animate-in fade-in">
          <button 
            onClick={() => setIsAddingMov(!isAddingMov)}
            className="bg-white border border-palette-4 hover:border-palette-1 text-palette-1 font-bold p-3 rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2"
          >
            <Plus size={20} /> Registrar Entrada/Saída Manual
          </button>

          {isAddingMov && (
            <form onSubmit={handleSaveMov} className="bg-white border border-palette-4 p-5 rounded-2xl shadow-sm space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-text-main mb-1">Produto *</label>
                  <select value={movProductId} onChange={e => setMovProductId(e.target.value)} required
                    className="w-full bg-white border border-palette-4 rounded-xl p-3 text-text-main font-medium focus:outline-none focus:border-palette-1 focus:ring-1 focus:ring-palette-1 appearance-none"
                  >
                    <option value="">Selecione...</option>
                    {products?.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-main mb-1">Tipo *</label>
                  <select value={movType} onChange={e => setMovType(e.target.value as 'in'|'out')} required
                    className="w-full bg-white border border-palette-4 rounded-xl p-3 text-text-main font-medium focus:outline-none focus:border-palette-1 focus:ring-1 focus:ring-palette-1 appearance-none"
                  >
                    <option value="in">Entrada (Compra/Colheita)</option>
                    <option value="out">Saída (Perda/Avaria)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-main mb-1">Quantidade *</label>
                  <input type="number" min="1" value={movQuantity} onChange={e => setMovQuantity(e.target.value)} required
                    className="w-full bg-palette-5/20 border border-palette-4 rounded-xl p-3 text-text-main focus:outline-none focus:border-palette-1 focus:ring-1 focus:ring-palette-1" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsAddingMov(false)} className="px-4 py-2 text-palette-2 hover:text-text-main font-semibold">Cancelar</button>
                <button type="submit" className="bg-palette-1 hover:bg-palette-1-dark text-white px-6 py-2 rounded-xl font-bold shadow-md transition-all">Salvar Registro</button>
              </div>
            </form>
          )}

          <div className="bg-white border border-palette-4 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-palette-5/30 border-b border-palette-4 text-text-main font-bold">
                <tr>
                  <th className="p-4">Data</th>
                  <th className="p-4">Produto</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4 text-right">Qtd</th>
                  <th className="p-4 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {inventory?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(inv => {
                  const product = products?.find(p => p.id === inv.product_id);
                  return (
                    <tr key={inv.id} className="border-b border-palette-4/50 hover:bg-palette-5/10 transition-colors group">
                      <td className="p-4 text-palette-2 font-medium">{new Date(inv.date).toLocaleDateString()} {new Date(inv.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                      <td className="p-4 font-bold text-text-main">{product?.name || 'Produto Excluído'}</td>
                      <td className="p-4">
                        {inv.type === 'in' 
                          ? <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg text-xs font-bold"><ArrowUp size={12}/> ENTRADA</span>
                          : <span className="inline-flex items-center gap-1 text-red-500 bg-red-50 border border-red-100 px-2 py-1 rounded-lg text-xs font-bold"><ArrowDown size={12}/> SAÍDA</span>
                        }
                      </td>
                      <td className="p-4 text-right font-black text-text-main">{inv.quantity}</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={async () => {
                            if (window.confirm('Tem certeza que deseja excluir esta movimentação? O saldo do produto será afetado.')) {
                              try {
                                const { error } = await supabase.from('inventory').delete().eq('id', inv.id);
                                if (error) throw error;
                                toast.success('Movimentação excluída!');
                              } catch(e: any) {
                                toast.error('Erro ao excluir: ' + e.message);
                              }
                            }
                          }} 
                          className="p-1.5 text-red-300 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100" 
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {inventory?.length === 0 && (
              <p className="text-center p-10 text-palette-2 font-medium">Nenhuma movimentação registrada.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
