import re

file_path = '/home/sergio/Documentos/office/madridagro/src/pages/CentralLogistica.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Add Pencil, Trash2 to lucide imports if not present
if "Pencil, Trash2" not in content:
    content = content.replace("Navigation } from 'lucide-react'", "Navigation, Pencil, Trash2 } from 'lucide-react'")

# 1. Update state for editing
state_add = """
  const [editingTripId, setEditingTripId] = useState<string | null>(null);

  const openNewTripModal = () => {
    setEditingTripId(null);
    setNewTrip({
      date: '', truck: '', driver: '', supplier: '', volume_ton: '', 
      cost_mercadoria: '', cost_logistico: '', cost_alimentacao: '', 
      cost_manutencao: '', cost_outros: '', revenue: ''
    });
    setIsNewTripModalOpen(true);
  };

  const openEditTripModal = (trip: any) => {
    setEditingTripId(trip.originalId);
    
    // Format date from dd/mm/yyyy to yyyy-mm-dd
    let formattedDate = trip.date;
    if (trip.date && trip.date.includes('/')) {
      formattedDate = trip.date.split('/').reverse().join('-');
    }

    setNewTrip({
      date: formattedDate,
      truck: trip.truck,
      driver: trip.driver,
      supplier: trip.supplier,
      volume_ton: trip.volumeTon.toString(),
      cost_mercadoria: trip.costMercadoria.toString(),
      cost_logistico: trip.costLogistico.toString(),
      cost_alimentacao: trip.costAlimentacao.toString(),
      cost_manutencao: trip.costManutencao.toString(),
      cost_outros: trip.costOutros.toString(),
      revenue: trip.revenue.toString()
    });
    setIsNewTripModalOpen(true);
  };

  const handleDeleteTrip = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta carga inteira e todo seu diário de bordo?')) {
      try {
        await supabase.from('logistics_trips').delete().eq('id', id);
        // Will auto-update via realtime
      } catch (err) {
        console.error('Error deleting trip:', err);
      }
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('Excluir esta anotação?')) {
      try {
        await supabase.from('logistics_notes').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting note:', err);
      }
    }
  };
"""
# Need to inject this after `const [newTrip, setNewTrip] = useState(...)` block
content = re.sub(r"(const \[newTrip, setNewTrip\] = useState\(\{.*?\n  \}\);)", r"\1\n" + state_add, content, flags=re.DOTALL)


# 2. Update handleAddTrip to handle Edit
edit_trip_logic = """  const handleAddTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tripData = {
        date: newTrip.date.split('-').reverse().join('/'),
        truck: newTrip.truck,
        driver: newTrip.driver,
        supplier: newTrip.supplier,
        volume_ton: parseFloat(newTrip.volume_ton) || 0,
        cost_mercadoria: parseFloat(newTrip.cost_mercadoria) || 0,
        cost_logistico: parseFloat(newTrip.cost_logistico) || 0,
        cost_alimentacao: parseFloat(newTrip.cost_alimentacao) || 0,
        cost_manutencao: parseFloat(newTrip.cost_manutencao) || 0,
        cost_outros: parseFloat(newTrip.cost_outros) || 0,
        revenue: parseFloat(newTrip.revenue) || 0
      };

      if (editingTripId) {
        await supabase.from('logistics_trips').update(tripData).eq('id', editingTripId);
      } else {
        await supabase.from('logistics_trips').insert([tripData]);
      }
      
      setIsNewTripModalOpen(false);
      setNewTrip({
        date: '', truck: '', driver: '', supplier: '', volume_ton: '', 
        cost_mercadoria: '', cost_logistico: '', cost_alimentacao: '', 
        cost_manutencao: '', cost_outros: '', revenue: ''
      });
      setEditingTripId(null);
    } catch (err) {
      console.error('Error creating/updating trip:', err);
    }
  };"""
content = re.sub(r"  const handleAddTrip = async.*?console\.error\('Error creating trip:', err\);\n    }\n  };", edit_trip_logic, content, flags=re.DOTALL)


# 3. Update Nova Carga button
content = content.replace("onClick={() => setIsNewTripModalOpen(true)}", "onClick={openNewTripModal}")

# 4. Update Trip Card Header to add Edit/Delete
card_header = """                  <div className="p-4 border-b border-palette-4 flex justify-between items-center bg-palette-5/10">
                    <div className="flex items-center gap-2 text-palette-1">
                      <Truck size={20} />
                      <h3 className="font-bold">Carga {trip.id}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-palette-3">{trip.date}</span>
                      <button onClick={() => openEditTripModal(trip)} className="text-palette-3 hover:text-palette-1 transition-colors">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDeleteTrip(trip.originalId)} className="text-palette-3 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>"""
content = re.sub(r"<div className=\"p-4 border-b border-palette-4 flex justify-between items-center bg-palette-5/10\">\n\s*<div className=\"flex items-center gap-2 text-palette-1\">\n\s*<Truck size=\{20\} />\n\s*<h3 className=\"font-bold\">Carga \{trip\.id\}</h3>\n\s*</div>\n\s*<span className=\"text-sm font-medium text-palette-3\">\{trip\.date\}</span>\n\s*</div>", card_header, content)


# 5. Update fetchTrips to also fetch `id` from `logistics_notes` so we can delete them
content = content.replace("time: note.time,\n            text: note.text", "time: note.time,\n            text: note.text,\n            noteId: note.id")


# 6. Update rendering of notes to include delete button
note_render = """                          <div key={idx} className="flex justify-between items-start text-sm group">
                            <div className="flex gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-palette-3 mt-1.5 shrink-0" />
                              <div>
                                <p className="text-xs font-bold text-palette-2 mb-0.5">{occ.time}</p>
                                <p className="text-text-main font-medium">{occ.text}</p>
                              </div>
                            </div>
                            <button onClick={() => handleDeleteNote(occ.noteId)} className="opacity-0 group-hover:opacity-100 p-1 text-palette-3 hover:text-red-500 transition-all">
                              <Trash2 size={14} />
                            </button>
                          </div>"""
content = re.sub(r"<div key=\{idx\} className=\"flex gap-3 text-sm\">\n\s*<div className=\"w-1\.5 h-1\.5 rounded-full bg-palette-3 mt-1\.5 shrink-0\" />\n\s*<div>\n\s*<p className=\"text-xs font-bold text-palette-2 mb-0\.5\">\{occ\.time\}</p>\n\s*<p className=\"text-text-main font-medium\">\{occ\.text\}</p>\n\s*</div>\n\s*</div>", note_render, content)

# 7. Update title of Nova Carga modal
content = content.replace("<h3 className=\"font-bold text-lg text-text-main\">Nova Carga</h3>", "<h3 className=\"font-bold text-lg text-text-main\">{editingTripId ? 'Editar Carga' : 'Nova Carga'}</h3>")
content = content.replace("<button type=\"submit\" className=\"px-4 py-2 bg-palette-1 text-white font-bold rounded-xl hover:bg-palette-2 transition-colors shadow-sm\">\n                  Salvar Carga\n                </button>", "<button type=\"submit\" className=\"px-4 py-2 bg-palette-1 text-white font-bold rounded-xl hover:bg-palette-2 transition-colors shadow-sm\">\n                  {editingTripId ? 'Salvar Edição' : 'Salvar Carga'}\n                </button>")


with open(file_path, 'w') as f:
    f.write(content)

print("CentralLogistica updated")
