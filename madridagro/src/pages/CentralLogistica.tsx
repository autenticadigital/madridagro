import { useState } from 'react';
import { Truck, History, PhoneCall, Plus, Fuel, DollarSign, MapPin, Wrench, Search, FileText, MessageSquare, MessageCircle, X, AlertTriangle, Navigation } from 'lucide-react';

export function CentralLogistica() {
  const [activeTab, setActiveTab] = useState<'ativas' | 'historico' | 'contatos'>('ativas');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isSOSMode, setIsSOSMode] = useState(false);
  const [selectedSOSContacts, setSelectedSOSContacts] = useState<number[]>([]);

  const mockTrips = [
    {
      id: 'VG-1042',
      date: '25/08/2026',
      truck: 'Scania R440 (ABC-1234)',
      driver: 'Carlos Silva',
      supplier: 'Fazenda Boa Vista',
      volumeTon: 14.5,
      costMercadoria: 25000,
      costLogistico: 1700, // Diesel/Pedágio
      costAlimentacao: 350,
      costManutencao: 500,
      costOutros: 100,
      revenue: 32000,
      occurrences: [
        { time: '25/08 - 02:00', text: 'Pneu furado em Linhares. Atraso de 3 horas.' },
        { time: '25/08 - 09:30', text: 'Carga liberada na fazenda. Saindo para rota.' }
      ]
    }
  ];

  const mockHistory = [
    { id: 'VG-1041', date: '20/08/2026', truck: 'Volvo FH540', status: 'Concluída', profit: 3400 },
    { id: 'VG-1040', date: '15/08/2026', truck: 'Scania R440', status: 'Concluída', profit: 2850 },
  ];

  const mockContacts = [
    { id: 1, name: 'Borracharia do Zé', type: 'Manutenção', phone: '(11) 99999-1111', location: 'Rod. Fernão Dias, km 45', icon: Wrench },
    { id: 2, name: 'Fazenda Boa Vista', type: 'Fornecedor', phone: '(31) 98888-2222', location: 'Linhares - ES', icon: MapPin },
    { id: 3, name: 'Guincho 24h', type: 'Emergência', phone: '0800-123-456', location: 'Nacional', icon: PhoneCall },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-main">Central Logística</h2>
          <p className="text-palette-2 text-sm">Gestão operacional de viagens e apoios.</p>
        </div>
        
        {/* Navegação por Abas */}
        <div className="flex bg-white rounded-xl border border-palette-4 p-1 shadow-sm overflow-x-auto">
          <button 
            onClick={() => setActiveTab('ativas')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'ativas' ? 'bg-palette-1 text-white shadow-sm' : 'text-palette-2 hover:bg-palette-5/50 hover:text-palette-1'
            }`}
          >
            <Truck size={16} /> Cargas Ativas
          </button>
          <button 
            onClick={() => setActiveTab('historico')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'historico' ? 'bg-palette-1 text-white shadow-sm' : 'text-palette-2 hover:bg-palette-5/50 hover:text-palette-1'
            }`}
          >
            <History size={16} /> Histórico
          </button>
          <button 
            onClick={() => setActiveTab('contatos')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'contatos' ? 'bg-palette-1 text-white shadow-sm' : 'text-palette-2 hover:bg-palette-5/50 hover:text-palette-1'
            }`}
          >
            <PhoneCall size={16} /> Contatos de Apoio
          </button>
        </div>
      </header>

      {/* Conteúdo Aba 1: Cargas Ativas */}
      {activeTab === 'ativas' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="flex items-center gap-2 bg-palette-1 text-white px-4 py-2 rounded-xl font-bold hover:bg-palette-2 transition-colors shadow-sm">
              <Plus size={20} /> Nova Carga
            </button>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {mockTrips.map((trip) => {
              const totalCost = trip.costMercadoria + trip.costLogistico + trip.costAlimentacao + trip.costManutencao + trip.costOutros;
              const netProfit = trip.revenue - totalCost;
              return (
                <div key={trip.id} className="bg-white border border-palette-4 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-palette-4 flex justify-between items-center bg-palette-5/10">
                    <div className="flex items-center gap-2 text-palette-1">
                      <Truck size={20} />
                      <h3 className="font-bold">Carga {trip.id}</h3>
                    </div>
                    <span className="text-sm font-medium text-palette-3">{trip.date}</span>
                  </div>
                  
                  <div className="p-5 flex-1 space-y-5">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-palette-2 font-medium">Fornecedor</p>
                        <p className="font-bold text-text-main">{trip.supplier}</p>
                      </div>
                      <div>
                        <p className="text-palette-2 font-medium">Volume</p>
                        <p className="font-bold text-text-main">{trip.volumeTon} Ton</p>
                      </div>
                      <div>
                        <p className="text-palette-2 font-medium">Caminhão</p>
                        <p className="font-bold text-text-main">{trip.truck}</p>
                      </div>
                      <div>
                        <p className="text-palette-2 font-medium">Motorista</p>
                        <p className="font-bold text-text-main">{trip.driver}</p>
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-palette-4 pt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-palette-2 flex items-center gap-1.5"><DollarSign size={16}/> Compra (Fazenda)</span>
                        <span className="text-red-500 font-medium">- R$ {trip.costMercadoria.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-palette-2 flex items-center gap-1.5"><Fuel size={16}/> Logística (Diesel/Pedágio)</span>
                        <span className="text-red-500 font-medium">- R$ {trip.costLogistico.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-palette-2 flex items-center gap-1.5 ml-5">Alimentação (Motorista)</span>
                        <span className="text-red-500 font-medium">- R$ {trip.costAlimentacao.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-palette-2 flex items-center gap-1.5 ml-5">Manutenção Rápida</span>
                        <span className="text-red-500 font-medium">- R$ {trip.costManutencao.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-palette-2 flex items-center gap-1.5 ml-5">Outros Gastos</span>
                        <span className="text-red-500 font-medium">- R$ {trip.costOutros.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold pt-2 border-t border-palette-4/50">
                        <span className="text-text-main">Venda (CEASA)</span>
                        <span className="text-green-600">+ R$ {trip.revenue.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>

                    {/* Diário de Bordo */}
                    <div className="bg-palette-5/10 rounded-xl p-4 border border-palette-4/50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-text-main flex items-center gap-2 text-sm">
                          <MessageSquare size={16} className="text-palette-1" />
                          Diário de Bordo
                        </h4>
                        <button 
                          onClick={() => setIsNoteModalOpen(true)}
                          className="text-[10px] uppercase font-bold text-palette-1 hover:text-palette-2 transition-colors"
                        >
                          + Add Nota
                        </button>
                      </div>
                      <div className="space-y-3">
                        {trip.occurrences?.map((occ, idx) => (
                          <div key={idx} className="flex gap-3 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-palette-3 mt-1.5 shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-palette-2 mb-0.5">{occ.time}</p>
                              <p className="text-text-main font-medium">{occ.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-palette-5/20 p-4 border-t border-palette-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-palette-2 uppercase font-bold tracking-wider">Lucro Líquido</p>
                      <p className="text-2xl font-black text-palette-1">R$ {netProfit.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Conteúdo Aba 2: Histórico */}
      {activeTab === 'historico' && (
        <div className="bg-white border border-palette-4 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-palette-4 flex justify-between items-center bg-palette-5/10">
             <div className="flex items-center gap-2 w-full max-w-sm bg-white border border-palette-4 rounded-xl px-3 py-2">
               <Search size={18} className="text-palette-3" />
               <input type="text" placeholder="Buscar no histórico..." className="bg-transparent border-none outline-none text-sm w-full font-medium" />
             </div>
             <button className="hidden sm:flex items-center gap-2 text-palette-1 hover:text-palette-2 font-bold px-3 py-2">
               <FileText size={18} /> Relatório
             </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white border-b border-palette-4 text-palette-2 text-sm">
                  <th className="p-4 font-bold uppercase tracking-wider">Carga</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Data</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Caminhão</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Lucro</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockHistory.map((trip) => (
                  <tr key={trip.id} className="border-b border-palette-5 hover:bg-palette-5/20 transition-colors">
                    <td className="p-4 font-bold text-text-main flex items-center gap-2"><History size={16} className="text-palette-1"/>{trip.id}</td>
                    <td className="p-4 text-sm font-medium text-palette-3">{trip.date}</td>
                    <td className="p-4 text-sm font-bold text-text-main">{trip.truck}</td>
                    <td className="p-4 font-black text-green-600">R$ {trip.profit.toLocaleString('pt-BR')}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700">
                        {trip.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conteúdo Aba 3: Contatos */}
      {activeTab === 'contatos' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white border border-palette-4 rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2 bg-palette-5/10 rounded-lg px-3 py-1.5 w-full max-w-sm">
              <Search size={18} className="text-palette-3" />
              <input type="text" placeholder="Buscar contato..." className="bg-transparent border-none outline-none text-sm w-full font-medium" />
            </div>
            <button 
              onClick={() => setIsContactModalOpen(true)}
              className="flex items-center gap-2 bg-palette-1 text-white px-4 py-2 rounded-xl font-bold hover:bg-palette-2 transition-colors shadow-sm"
            >
              <Plus size={20} /> Novo Contato
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    href={`https://wa.me/55${contact.phone.replace(/\D/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs bg-green-500/10 text-green-600 px-3 py-1.5 rounded-lg font-bold hover:bg-green-500 hover:text-white transition-colors"
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Novo Contato */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-palette-4">
              <h3 className="font-bold text-lg text-text-main">Novo Contato de Apoio</h3>
              <button onClick={() => setIsContactModalOpen(false)} className="text-palette-2 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
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
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nova Nota no Diário de Bordo */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-palette-4">
              <h3 className="font-bold text-lg text-text-main flex items-center gap-2">
                <MessageSquare size={20} className="text-palette-1" />
                Diário de Bordo
              </h3>
              <button onClick={() => { setIsNoteModalOpen(false); setIsSOSMode(false); }} className="text-palette-2 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-palette-2 mb-2">Relato / Ocorrência</label>
                <textarea 
                  rows={3} 
                  className="w-full border border-palette-4 rounded-xl px-4 py-3 focus:outline-none focus:border-palette-1 resize-none" 
                  placeholder="Descreva o que aconteceu com a carga..." 
                />
              </div>

              {/* Botão de Pânico / SOS (Estilo Escudo Lilás) */}
              <div className={`border-2 rounded-xl p-4 transition-all ${isSOSMode ? 'border-red-500 bg-red-50' : 'border-palette-4 bg-palette-5/10'}`}>
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsSOSMode(!isSOSMode)}>
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${isSOSMode ? 'bg-red-500 text-white' : 'bg-white text-palette-2 shadow-sm'}`}>
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${isSOSMode ? 'text-red-700' : 'text-text-main'}`}>Alerta de Emergência</p>
                      <p className="text-[10px] text-palette-2 font-medium">Acionar resgate ou apoio tático</p>
                    </div>
                  </div>
                  <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${isSOSMode ? 'bg-red-500 justify-end' : 'bg-palette-4 justify-start'}`}>
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </div>
                </div>

                {/* Opções SOS Expandidas */}
                {isSOSMode && (
                  <div className="mt-4 pt-4 border-t border-red-200 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <button className="w-full flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 font-bold py-2 rounded-lg text-sm hover:bg-red-50 transition-colors">
                      <Navigation size={16} /> Capturar Minha Localização GPS
                    </button>
                    <div className="bg-white rounded-lg p-3 border border-red-100 shadow-sm">
                      <p className="text-xs font-bold text-red-800 mb-2">Selecione para quem enviar o alerta:</p>
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                        {mockContacts.map(contact => (
                          <label key={contact.id} className="flex items-center gap-3 p-2 hover:bg-red-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-red-100">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 text-red-600 rounded border-red-300 focus:ring-red-500"
                              checked={selectedSOSContacts.includes(contact.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSOSContacts([...selectedSOSContacts, contact.id]);
                                } else {
                                  setSelectedSOSContacts(selectedSOSContacts.filter(id => id !== contact.id));
                                }
                              }}
                            />
                            <div className="flex-1">
                              <p className="text-xs font-bold text-text-main leading-tight">{contact.name}</p>
                              <p className="text-[10px] text-palette-2 font-medium">{contact.type} • {contact.phone}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-palette-4 bg-palette-5/10 flex justify-end gap-3">
              <button onClick={() => { setIsNoteModalOpen(false); setIsSOSMode(false); setSelectedSOSContacts([]); }} className="px-4 py-2 font-bold text-palette-2 hover:text-text-main transition-colors">
                Cancelar
              </button>
              <button 
                onClick={() => { setIsNoteModalOpen(false); setIsSOSMode(false); setSelectedSOSContacts([]); }} 
                disabled={isSOSMode && selectedSOSContacts.length === 0}
                className={`px-6 py-2 text-white font-bold rounded-xl transition-colors shadow-sm ${
                  isSOSMode 
                    ? selectedSOSContacts.length > 0 ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-red-300 cursor-not-allowed'
                    : 'bg-palette-1 hover:bg-palette-2'
                }`}
              >
                {isSOSMode ? `Emitir Alerta SOS (${selectedSOSContacts.length})` : 'Salvar Nota'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
