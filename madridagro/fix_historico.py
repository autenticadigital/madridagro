import re

file_path = '/home/sergio/Documentos/office/madridagro/src/pages/CentralLogistica.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Remove the mockHistory definition
content = re.sub(r"  const mockHistory = \[\n.*?  \];\n", "", content, flags=re.DOTALL)

# Let's find how trips is rendered in ativas
# In ativas it is: {trips.map((trip) => ...
# We should probably filter active trips. If the database schema has a status field, we can filter it.
# Wait, let's just make the "Histórico" use `trips.filter(t => t.status === 'Concluída')`
# Or if it doesn't have a status field in the interface, we just say t.status === 'Concluída'.
# Let's check if there is a 'Concluir Carga' button in my previous implementation.
# In my previous implementation I did NOT add a "Concluir" button, just edit and delete.
# For now, I will just display trips with status 'Concluída' in the Histórico tab.

# Replace the mockHistory.map in the historico tab rendering:
# Find the start of historico tab
old_historico_render = """        {activeTab === 'historico' && (
          <div className="bg-white rounded-2xl shadow-sm border border-palette-4 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-palette-5/30 text-palette-2 text-sm border-b border-palette-4">
                    <th className="p-4 font-bold">Data</th>
                    <th className="p-4 font-bold">Carga</th>
                    <th className="p-4 font-bold">Placa</th>
                    <th className="p-4 font-bold text-right">Faturamento</th>
                    <th className="p-4 font-bold text-right">Custos</th>
                    <th className="p-4 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                {mockHistory.map((trip) => (
                  <tr key={trip.id} className="border-b border-palette-4/50 hover:bg-palette-5/10 transition-colors">
                    <td className="p-4 font-medium text-text-main">{trip.date}</td>
                    <td className="p-4 font-bold text-palette-1">{trip.title}</td>
                    <td className="p-4 text-palette-2">{trip.plate}</td>
                    <td className="p-4 font-bold text-green-600 text-right">{trip.revenue}</td>
                    <td className="p-4 font-bold text-red-600 text-right">{trip.costs}</td>
                    <td className="p-4 text-center">
                      <span className="bg-palette-5/50 text-palette-3 font-bold px-3 py-1 rounded-full text-xs">
                        Concluída
                      </span>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        )}"""

new_historico_render = """        {activeTab === 'historico' && (
          <div className="bg-white rounded-2xl shadow-sm border border-palette-4 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-palette-5/30 text-palette-2 text-sm border-b border-palette-4">
                    <th className="p-4 font-bold">Data</th>
                    <th className="p-4 font-bold">Carga</th>
                    <th className="p-4 font-bold">Placa</th>
                    <th className="p-4 font-bold text-right">Faturamento</th>
                    <th className="p-4 font-bold text-right">Custos</th>
                    <th className="p-4 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                {trips.filter(t => t.status === 'Concluída').map((trip) => (
                  <tr key={trip.id} className="border-b border-palette-4/50 hover:bg-palette-5/10 transition-colors">
                    <td className="p-4 font-medium text-text-main">{new Date(trip.date).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4 font-bold text-palette-1">{trip.title}</td>
                    <td className="p-4 text-palette-2">{trip.plate}</td>
                    <td className="p-4 font-bold text-green-600 text-right">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(trip.revenue || 0)}
                    </td>
                    <td className="p-4 font-bold text-red-600 text-right">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(trip.costs || 0)}
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-palette-5/50 text-palette-3 font-bold px-3 py-1 rounded-full text-xs">
                        Concluída
                      </span>
                    </td>
                  </tr>
                ))}
                {trips.filter(t => t.status === 'Concluída').length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-palette-2 font-medium">
                      Nenhuma carga concluída no histórico.
                    </td>
                  </tr>
                )}
                </tbody>
              </table>
            </div>
          </div>
        )}"""

# If they don't have a status field yet, all trips are effectively active. Let's make "ativas" only show non-concluída.
# Replace active tab rendering:
old_ativas_render = """        {activeTab === 'ativas' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {trips.map((trip) => ("""

new_ativas_render = """        {activeTab === 'ativas' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {trips.filter(t => t.status !== 'Concluída').map((trip) => ("""

content = content.replace(old_historico_render, new_historico_render)
content = content.replace(old_ativas_render, new_ativas_render)

with open(file_path, 'w') as f:
    f.write(content)

print("Historico fixed")
