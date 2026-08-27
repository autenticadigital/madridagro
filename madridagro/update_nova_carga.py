import re

file_path = '/home/sergio/Documentos/office/madridagro/src/pages/CentralLogistica.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Add states
state_addition = """
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false);
  const [newTrip, setNewTrip] = useState({
    date: '',
    truck: '',
    driver: '',
    supplier: '',
    volume_ton: '',
    cost_mercadoria: '',
    cost_logistico: '',
    cost_alimentacao: '',
    cost_manutencao: '',
    cost_outros: '',
    revenue: ''
  });

  const handleAddTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('logistics_trips').insert([{
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
      }]);
      if (error) throw error;
      setIsNewTripModalOpen(false);
      setNewTrip({
        date: '', truck: '', driver: '', supplier: '', volume_ton: '', 
        cost_mercadoria: '', cost_logistico: '', cost_alimentacao: '', 
        cost_manutencao: '', cost_outros: '', revenue: ''
      });
    } catch (err) {
      console.error('Error creating trip:', err);
    }
  };
"""
content = content.replace("const [, setLoading] = useState(true);", "const [, setLoading] = useState(true);" + state_addition)

# Update the button
content = content.replace(
    "<button className=\"flex items-center gap-2 bg-palette-1 text-white px-4 py-2 rounded-xl font-bold hover:bg-palette-2 transition-colors shadow-sm\">\n              <Plus size={20} /> Nova Carga\n            </button>",
    "<button onClick={() => setIsNewTripModalOpen(true)} className=\"flex items-center gap-2 bg-palette-1 text-white px-4 py-2 rounded-xl font-bold hover:bg-palette-2 transition-colors shadow-sm\">\n              <Plus size={20} /> Nova Carga\n            </button>"
)

# Add the modal HTML at the end before the last </div>
modal_html = """
      {/* Modal: Nova Carga */}
      {isNewTripModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-palette-4">
              <h3 className="font-bold text-lg text-text-main">Nova Carga</h3>
              <button onClick={() => setIsNewTripModalOpen(false)} className="text-palette-2 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddTrip}>
              <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-palette-2 mb-1">Data</label>
                    <input type="date" required className="w-full border border-palette-4 rounded-xl px-4 py-2 focus:outline-none focus:border-palette-1" value={newTrip.date} onChange={e => setNewTrip({...newTrip, date: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-palette-2 mb-1">Caminhão (Placa)</label>
                    <input type="text" required className="w-full border border-palette-4 rounded-xl px-4 py-2 focus:outline-none focus:border-palette-1" value={newTrip.truck} onChange={e => setNewTrip({...newTrip, truck: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-palette-2 mb-1">Motorista</label>
                    <input type="text" required className="w-full border border-palette-4 rounded-xl px-4 py-2 focus:outline-none focus:border-palette-1" value={newTrip.driver} onChange={e => setNewTrip({...newTrip, driver: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-palette-2 mb-1">Fornecedor (Fazenda)</label>
                    <input type="text" required className="w-full border border-palette-4 rounded-xl px-4 py-2 focus:outline-none focus:border-palette-1" value={newTrip.supplier} onChange={e => setNewTrip({...newTrip, supplier: e.target.value})} />
                  </div>
                </div>
                
                <hr className="border-palette-4 my-4" />
                <h4 className="font-bold text-palette-1 mb-2">Financeiro (Estimativa Inicial)</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-palette-2 mb-1">Volume (Ton)</label>
                    <input type="number" step="0.1" required className="w-full border border-palette-4 rounded-xl px-4 py-2 focus:outline-none focus:border-palette-1" value={newTrip.volume_ton} onChange={e => setNewTrip({...newTrip, volume_ton: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-palette-2 mb-1">Custo da Mercadoria (R$)</label>
                    <input type="number" step="0.01" required className="w-full border border-palette-4 rounded-xl px-4 py-2 focus:outline-none focus:border-palette-1" value={newTrip.cost_mercadoria} onChange={e => setNewTrip({...newTrip, cost_mercadoria: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-palette-2 mb-1">Custo Logístico (Diesel/Pedágio)</label>
                    <input type="number" step="0.01" required className="w-full border border-palette-4 rounded-xl px-4 py-2 focus:outline-none focus:border-palette-1" value={newTrip.cost_logistico} onChange={e => setNewTrip({...newTrip, cost_logistico: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-palette-2 mb-1">Alimentação (R$)</label>
                    <input type="number" step="0.01" required className="w-full border border-palette-4 rounded-xl px-4 py-2 focus:outline-none focus:border-palette-1" value={newTrip.cost_alimentacao} onChange={e => setNewTrip({...newTrip, cost_alimentacao: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-palette-2 mb-1">Manutenção (R$)</label>
                    <input type="number" step="0.01" required className="w-full border border-palette-4 rounded-xl px-4 py-2 focus:outline-none focus:border-palette-1" value={newTrip.cost_manutencao} onChange={e => setNewTrip({...newTrip, cost_manutencao: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-palette-2 mb-1">Outros Gastos (R$)</label>
                    <input type="number" step="0.01" required className="w-full border border-palette-4 rounded-xl px-4 py-2 focus:outline-none focus:border-palette-1" value={newTrip.cost_outros} onChange={e => setNewTrip({...newTrip, cost_outros: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-palette-2 mb-1">Receita / Venda (R$)</label>
                    <input type="number" step="0.01" required className="w-full border border-palette-4 rounded-xl px-4 py-2 focus:outline-none focus:border-palette-1" value={newTrip.revenue} onChange={e => setNewTrip({...newTrip, revenue: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-palette-4 bg-palette-5/10 flex justify-end gap-3">
                <button type="button" onClick={() => setIsNewTripModalOpen(false)} className="px-4 py-2 font-bold text-palette-2 hover:text-text-main transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-palette-1 text-white font-bold rounded-xl hover:bg-palette-2 transition-colors shadow-sm">
                  Salvar Carga
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
"""
content = re.sub(r"    </div>\n  \);\n}\n$", modal_html + "    </div>\n  );\n}\n", content)

with open(file_path, 'w') as f:
    f.write(content)

print("Modal added")
