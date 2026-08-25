import { useState } from 'react';
import { useLiveSupabase } from '../hooks/useLiveSupabase';
import { supabase } from '../lib/supabase';
import type { Client } from '../lib/types';
import { Plus, Search, User, Edit2, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

export function Clientes() {
  const clients = useLiveSupabase<Client>('clients', 'name', true);
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const filteredClients = clients?.filter(c => c.name.toLowerCase().includes(search.toLowerCase())) || [];

  const handleEdit = (client: Client) => {
    setEditingId(client.id);
    setName(client.name);
    setPhone(client.phone || '');
    setAddress(client.address || '');
    setIsAdding(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${name}"?`)) {
      try {
        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (error) throw error;
        toast.success(`Cliente "${name}" excluído com sucesso!`);
      } catch (error: any) {
        toast.error('Erro ao excluir cliente: ' + error.message);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase.from('clients').update({ name, phone, address }).eq('id', editingId);
        if (error) throw error;
        toast.success('Cliente atualizado com sucesso!');
      } else {
        const newClient = {
          id: uuidv4(),
          name,
          phone,
          address,
          created_at: new Date().toISOString()
        };
        const { error } = await supabase.from('clients').insert([newClient]);
        if (error) throw error;
        toast.success('Cliente cadastrado com sucesso!');
      }

      setIsAdding(false);
      setEditingId(null);
      setName('');
      setPhone('');
      setAddress('');
    } catch (error: any) {
      toast.error('Erro ao salvar cliente: ' + error.message);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setName('');
    setPhone('');
    setAddress('');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-main">Clientes</h1>
          <p className="text-palette-2 text-sm">Gerencie sua carteira de clientes.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-palette-1 hover:bg-palette-1-dark text-white p-3 rounded-2xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <Plus size={24} />
          </button>
        )}
      </header>

      {isAdding && (
        <form onSubmit={handleSave} className="bg-white border border-palette-4 p-5 rounded-2xl shadow-sm space-y-4 animate-in zoom-in-95 duration-200">
          <h2 className="text-lg font-bold text-text-main border-b border-palette-4 pb-2 mb-2">
            {editingId ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <div>
            <label className="block text-sm font-bold text-text-main mb-1">Nome Completo *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              className="w-full bg-palette-5/20 border border-palette-4 rounded-xl p-3 text-text-main focus:outline-none focus:border-palette-1 focus:ring-1 focus:ring-palette-1 transition-all" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-main mb-1">Telefone / WhatsApp</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full bg-palette-5/20 border border-palette-4 rounded-xl p-3 text-text-main focus:outline-none focus:border-palette-1 focus:ring-1 focus:ring-palette-1 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-main mb-1">Endereço</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                className="w-full bg-palette-5/20 border border-palette-4 rounded-xl p-3 text-text-main focus:outline-none focus:border-palette-1 focus:ring-1 focus:ring-palette-1 transition-all" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={handleCancel} className="px-4 py-2 text-palette-2 hover:text-text-main font-semibold transition-colors">Cancelar</button>
            <button type="submit" className="bg-palette-1 hover:bg-palette-1-dark text-white px-6 py-2 rounded-xl font-bold shadow-md transition-all">
              {editingId ? 'Atualizar Cliente' : 'Salvar Cliente'}
            </button>
          </div>
        </form>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-3.5 text-palette-2" size={20} />
        <input 
          type="text" 
          placeholder="Buscar cliente..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-palette-4 rounded-xl py-3 pl-10 pr-4 text-text-main shadow-sm focus:outline-none focus:border-palette-1 focus:ring-1 focus:ring-palette-1 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClients.map(client => (
          <div key={client.id} className="bg-white border border-palette-4 p-5 rounded-2xl shadow-sm flex flex-col hover:border-palette-2 transition-all group">
            <div className="flex items-start justify-between w-full">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-palette-5/50 rounded-full flex items-center justify-center text-palette-1 flex-shrink-0">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-text-main">{client.name}</h3>
                  {client.phone && <p className="text-sm text-palette-2 font-medium">{client.phone}</p>}
                  {client.address && <p className="text-sm text-palette-2 truncate max-w-[200px] mt-1">{client.address}</p>}
                </div>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(client)} className="p-2 text-palette-3 hover:text-palette-1 bg-palette-5/20 hover:bg-palette-5/50 rounded-lg transition-colors" title="Editar">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(client.id, client.name)} className="p-2 text-red-300 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Excluir">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredClients.length === 0 && !isAdding && (
          <div className="col-span-full text-center py-12 text-palette-2 bg-white rounded-2xl border border-palette-4 border-dashed">
            Nenhum cliente encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
