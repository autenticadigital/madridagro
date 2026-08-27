import re

file_path = '/home/sergio/Documentos/office/madridagro/src/pages/CentralLogistica.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Add new states
state_addition = """
  const [contacts, setContacts] = useState<any[]>([]);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    type: 'Manutenção',
    location: ''
  });
"""

content = re.sub(r"(const \[newTrip, setNewTrip\] = useState\(\{.*?\n  \}\);)", r"\1\n" + state_addition, content, flags=re.DOTALL)

# Add fetch function
fetch_contacts = """
  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase.from('logistics_contacts').select('*').order('name');
      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };
"""

content = content.replace("const fetchTrips = async () => {", fetch_contacts + "\n  const fetchTrips = async () => {")

# Update useEffect to call fetchContacts and listen to changes
use_effect_mod = """    fetchTrips();
    fetchContacts();
    
    const channel = supabase.channel('custom-all-channel-logistics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logistics_trips' }, () => {
        fetchTrips();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logistics_notes' }, () => {
        fetchTrips();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logistics_contacts' }, () => {
        fetchContacts();
      })
      .subscribe();"""
content = re.sub(r"    fetchTrips\(\);\n\s*const channel = supabase\.channel\('custom-all-channel'\)\n.*?\.subscribe\(\);", use_effect_mod, content, flags=re.DOTALL)


# Create handler for Add/Edit Contact
handlers = """
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingContactId) {
        await supabase.from('logistics_contacts').update({
          name: newContact.name,
          phone: newContact.phone,
          type: newContact.type,
          location: newContact.location
        }).eq('id', editingContactId);
        toast.success("Contato atualizado!");
      } else {
        await supabase.from('logistics_contacts').insert([{
          name: newContact.name,
          phone: newContact.phone,
          type: newContact.type,
          location: newContact.location
        }]);
        toast.success("Contato adicionado!");
      }
      setIsContactModalOpen(false);
      setNewContact({ name: '', phone: '', type: 'Manutenção', location: '' });
      setEditingContactId(null);
    } catch (err) {
      toast.error('Erro ao salvar contato');
    }
  };

  const handleEditContact = (contact: any) => {
    setEditingContactId(contact.id);
    setNewContact({
      name: contact.name,
      phone: contact.phone,
      type: contact.type,
      location: contact.location || ''
    });
    setIsContactModalOpen(true);
  };

  const handleDeleteContact = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este contato?")) {
      try {
        await supabase.from('logistics_contacts').delete().eq('id', id);
        toast.success("Contato excluído!");
      } catch (err) {
        toast.error("Erro ao excluir");
      }
    }
  };
"""

content = content.replace("  const handleAddTrip = async", handlers + "\n  const handleAddTrip = async")


# Replace mockContacts variable with an empty array so it doesn't break anywhere, 
# but we will replace its usage in the rendering. 
# Wait, actually let's delete the mockContacts entirely!
content = re.sub(r"  const mockContacts = \[\n.*?  \];\n", "", content, flags=re.DOTALL)


# Let's write a helper function in the component for the icons
icons_helper = """
  const getContactIcon = (type: string) => {
    switch (type) {
      case 'Manutenção': return <Wrench size={24} />;
      case 'Fornecedor': return <MapPin size={24} />;
      case 'Emergência': return <PhoneCall size={24} />;
      default: return <PhoneCall size={24} />;
    }
  };
"""
content = content.replace("  return (", icons_helper + "\n  return (")

# Update contact rendering in activeTab === 'contatos'
old_contact_render = """          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockContacts.map(contact => (
              <div key={contact.id} className="bg-white border border-palette-4 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-palette-5/30 rounded-xl text-palette-1">
                    <contact.icon size={24} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-palette-5/50 rounded-md text-palette-3">
                    {contact.type}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-text-main">{contact.name}</h3>
                  <p className="text-palette-2 text-sm font-medium">{contact.location}</p>
                </div>
                <div className="pt-4 border-t border-palette-4 flex justify-between items-center mt-auto">
                  <span className="font-bold text-text-main">{contact.phone}</span>
                  <a 
                    href={`https://wa.me/55${contact.phone.replace(/\\D/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs bg-green-500/10 text-green-600 px-3 py-1.5 rounded-lg font-bold hover:bg-green-500 hover:text-white transition-colors"
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>"""

new_contact_render = """          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map(contact => (
              <div key={contact.id} className="bg-white border border-palette-4 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col gap-4 relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button onClick={() => handleEditContact(contact)} className="p-1.5 bg-white border border-palette-4 rounded-lg text-palette-3 hover:text-palette-1 shadow-sm">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDeleteContact(contact.id)} className="p-1.5 bg-white border border-palette-4 rounded-lg text-palette-3 hover:text-red-500 shadow-sm">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="flex justify-between items-start mt-2">
                  <div className="p-3 bg-palette-5/30 rounded-xl text-palette-1">
                    {getContactIcon(contact.type)}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-palette-5/50 rounded-md text-palette-3">
                    {contact.type}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-text-main pr-16">{contact.name}</h3>
                  <p className="text-palette-2 text-sm font-medium">{contact.location || '-'}</p>
                </div>
                <div className="pt-4 border-t border-palette-4 flex justify-between items-center mt-auto">
                  <span className="font-bold text-text-main">{contact.phone}</span>
                  <a 
                    href={`https://wa.me/55${contact.phone.replace(/\\D/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs bg-green-500/10 text-green-600 px-3 py-1.5 rounded-lg font-bold hover:bg-green-500 hover:text-white transition-colors"
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                </div>
              </div>
            ))}
            {contacts.length === 0 && (
              <div className="col-span-full p-8 text-center text-palette-2 border-2 border-dashed border-palette-4 rounded-2xl">
                Nenhum contato cadastrado.
              </div>
            )}
          </div>"""
content = content.replace(old_contact_render, new_contact_render)

# Update Contact Modal
old_contact_modal = """            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-palette-2 mb-1">Nome / Empresa</label>
                <input type="text" className="w-full border border-palette-4 rounded-xl px-4 py-2 focus:outline-none focus:border-palette-1" placeholder="Ex: Borracharia 24h" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-palette-2 mb-1">Telefone (WhatsApp)</label>
                  <input type="text" className="w-full border border-palette-4 rounded-xl px-4 py-2 focus:outline-none focus:border-palette-1" placeholder="(00) 00000-0000" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-palette-2 mb-1">Tipo</label>
                  <select className="w-full border border-palette-4 rounded-xl px-4 py-2 focus:outline-none focus:border-palette-1 bg-white">
                    <option>Manutenção</option>
                    <option>Fornecedor</option>
                    <option>Emergência</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-palette-2 mb-1">Localização (Opcional)</label>
                <input type="text" className="w-full border border-palette-4 rounded-xl px-4 py-2 focus:outline-none focus:border-palette-1" placeholder="Ex: BR-101, km 20" />
              </div>
            </div>
            <div className="p-4 border-t border-palette-4 bg-palette-5/10 flex justify-end gap-3">
              <button onClick={() => setIsContactModalOpen(false)} className="px-4 py-2 font-bold text-palette-2 hover:text-text-main transition-colors">
                Cancelar
              </button>
              <button onClick={() => setIsContactModalOpen(false)} className="px-4 py-2 bg-palette-1 text-white font-bold rounded-xl hover:bg-palette-2 transition-colors shadow-sm">
                Salvar Contato
              </button>
            </div>"""

new_contact_modal = """            <form onSubmit={handleAddContact}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-palette-2 mb-1">Nome / Empresa</label>
                  <input required type="text" className="w-full border border-palette-4 rounded-xl px-4 py-2 focus:outline-none focus:border-palette-1" placeholder="Ex: Borracharia 24h" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-palette-2 mb-1">Telefone (WhatsApp)</label>
                    <input required type="text" className="w-full border border-palette-4 rounded-xl px-4 py-2 focus:outline-none focus:border-palette-1" placeholder="(00) 00000-0000" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-palette-2 mb-1">Tipo</label>
                    <select className="w-full border border-palette-4 rounded-xl px-4 py-2 focus:outline-none focus:border-palette-1 bg-white" value={newContact.type} onChange={e => setNewContact({...newContact, type: e.target.value})}>
                      <option value="Manutenção">Manutenção</option>
                      <option value="Fornecedor">Fornecedor</option>
                      <option value="Emergência">Emergência</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-palette-2 mb-1">Localização (Opcional)</label>
                  <input type="text" className="w-full border border-palette-4 rounded-xl px-4 py-2 focus:outline-none focus:border-palette-1" placeholder="Ex: BR-101, km 20" value={newContact.location} onChange={e => setNewContact({...newContact, location: e.target.value})} />
                </div>
              </div>
              <div className="p-4 border-t border-palette-4 bg-palette-5/10 flex justify-end gap-3">
                <button type="button" onClick={() => setIsContactModalOpen(false)} className="px-4 py-2 font-bold text-palette-2 hover:text-text-main transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-palette-1 text-white font-bold rounded-xl hover:bg-palette-2 transition-colors shadow-sm">
                  {editingContactId ? 'Salvar Edição' : 'Salvar Contato'}
                </button>
              </div>
            </form>"""
content = content.replace(old_contact_modal, new_contact_modal)

# Update Modal Title
content = content.replace('<h3 className="font-bold text-lg text-text-main">Novo Contato de Apoio</h3>', '<h3 className="font-bold text-lg text-text-main">{editingContactId ? \'Editar Contato\' : \'Novo Contato de Apoio\'}</h3>')

# Reset Form when clicking "Novo Contato" button
content = content.replace("onClick={() => setIsContactModalOpen(true)}", "onClick={() => { setEditingContactId(null); setNewContact({name: '', phone: '', type: 'Manutenção', location: ''}); setIsContactModalOpen(true); }}")

# In the SOS Modal, we iterate `contacts` instead of `mockContacts`
# wait, actually we used `mockContacts.map(contact =>` in SOS Modal
content = content.replace("mockContacts.map(contact =>", "contacts.map(contact =>")
content = content.replace("const selectedPhones = mockContacts", "const selectedPhones = contacts")

with open(file_path, 'w') as f:
    f.write(content)

print("Contacts fixed")
