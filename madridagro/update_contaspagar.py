import re

file_path = '/home/sergio/Documentos/office/madridagro/src/pages/ContasPagar.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Add Pencil, Trash2 to lucide-react imports
content = content.replace("ArrowDownRight, Clock, CheckCircle2, Plus, X", "ArrowDownRight, Clock, CheckCircle2, Plus, X, Pencil, Trash2")

# Add editingId state and update handleAddPayable logic
state_add = """  const [editingId, setEditingId] = useState<string | null>(null);

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
"""
content = content.replace("  const [newPayable, setNewPayable] = useState({\n    supplier: '',\n    amount: '',\n    due_date: '',\n    description: ''\n  });\n", "  const [newPayable, setNewPayable] = useState({\n    supplier: '',\n    amount: '',\n    due_date: '',\n    description: ''\n  });\n" + state_add)

# Change handleAddPayable to handleEdit
save_logic = """  const handleAddPayable = async (e: React.FormEvent) => {
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
  };"""
content = re.sub(r"  const handleAddPayable = async.*?toast\.error\('Erro ao adicionar conta'\);\n    }\n  };", save_logic, content, flags=re.DOTALL)

# Update the "Nova Conta" button
content = content.replace("onClick={() => setIsModalOpen(true)}", "onClick={openNewModal}")

# Update the modal title
content = content.replace("Nova Conta a Pagar", "{editingId ? 'Editar Conta' : 'Nova Conta a Pagar'}")

# Update table headers to add "Ações"
content = content.replace('<th className="p-4 font-bold uppercase tracking-wider">Status</th>', '<th className="p-4 font-bold uppercase tracking-wider">Status</th>\n                  <th className="p-4 font-bold uppercase tracking-wider text-right">Ações</th>')

# Update table rows to add edit/delete buttons
action_buttons = """                    <td className="p-4 text-right">
                      <button onClick={() => openEditModal(item)} className="p-1.5 text-palette-3 hover:text-palette-1 transition-colors mr-2">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-palette-3 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>"""
content = content.replace('                    </td>\n                  </tr>', '                    </td>\n' + action_buttons + '\n                  </tr>')

# Update colspan for empty state
content = content.replace('colSpan={5}', 'colSpan={6}')

with open(file_path, 'w') as f:
    f.write(content)

print("ContasPagar updated")
