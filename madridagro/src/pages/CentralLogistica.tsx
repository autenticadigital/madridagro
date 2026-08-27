import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Truck, History, PhoneCall, Plus, Fuel, DollarSign, MapPin, Wrench, Search, FileText, MessageSquare, MessageCircle, X, AlertTriangle, Navigation, Pencil, Trash2 } from 'lucide-react';

export function CentralLogistica() {
  const [activeTab, setActiveTab] = useState<'ativas' | 'historico' | 'contatos'>('ativas');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isSOSMode, setIsSOSMode] = useState(false);
  const [selectedSOSContacts, setSelectedSOSContacts] = useState<number[]>([]);

  const [gpsLocation, setGpsLocation] = useState<GeolocationCoordinates | null>(null);
  const [isCapturingGps, setIsCapturingGps] = useState(false);

  const handleCaptureGps = () => {
    setIsCapturingGps(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation(position.coords);
          setIsCapturingGps(false);
          toast.success("Localização capturada com sucesso!");
        },
        (error) => {
          console.error("GPS Error", error);
          toast.error("Não foi possível capturar a localização.");
          setIsCapturingGps(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      toast.error("Geolocalização não suportada no seu navegador.");
      setIsCapturingGps(false);
    }
  };


  
  const [trips, setTrips] = useState<any[]>([]);
  const [, setLoading] = useState(true);
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

  const [contacts, setContacts] = useState<any[]>([]);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    type: 'Manutenção',
    location: ''
  });


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

  const handleAddTrip = async (e: React.FormEvent) => {
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
  };

  const [newNoteText, setNewNoteText] = useState('');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  useEffect(() => {
    fetchTrips();
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
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  

  const fetchTrips = async () => {
    try {
      const { data: tripsData, error: tripsError } = await supabase
        .from('logistics_trips')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (tripsError) throw tripsError;

      const { data: notesData, error: notesError } = await supabase
        .from('logistics_notes')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (notesError) throw notesError;

      const formattedTrips = (tripsData || []).map((trip: any) => ({
        id: trip.id.substring(0, 8).toUpperCase(),
        originalId: trip.id,
        date: trip.date,
        truck: trip.truck,
        driver: trip.driver,
        supplier: trip.supplier,
        volumeTon: Number(trip.volume_ton),
        costMercadoria: Number(trip.cost_mercadoria),
        costLogistico: Number(trip.cost_logistico),
        costAlimentacao: Number(trip.cost_alimentacao),
        costManutencao: Number(trip.cost_manutencao),
        costOutros: Number(trip.cost_outros),
        revenue: Number(trip.revenue),
        occurrences: (notesData || [])
          .filter((note: any) => note.trip_id === trip.id)
          .map((note: any) => ({
            time: note.time,
            text: note.text,
            noteId: note.id
          }))
      }));
      
      setTrips(formattedTrips);
    } catch (error) {
      console.error('Error fetching logistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim() || !selectedTripId) return;
    
    const now = new Date();
    const timeString = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')} - ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    try {
      await supabase.from('logistics_notes').insert([{
        trip_id: selectedTripId,
        time: timeString,
        text: newNoteText
      }]);
      setNewNoteText('');
      setIsNoteModalOpen(false);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };


  const mockHistory = [
    { id: 'VG-1041', date: '20/08/2026', truck: 'Volvo FH540', status: 'Concluída', profit: 3400 },
    { id: 'VG-1040', date: '15/08/2026', truck: 'Scania R440', status: 'Concluída', profit: 2850 },
  ];





  async function fetchContacts() {
    try {
      const { data, error } = await supabase.from('logistics_contacts').select('*').order('name');
      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'Manutenção': return <Wrench size={24} />;
      case 'Fornecedor': return <MapPin size={24} />;
      case 'Emergência': return <PhoneCall size={24} />;
      default: return <PhoneCall size={24} />;
    }
  };

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
            <button onClick={openNewTripModal} className="flex items-center gap-2 bg-palette-1 text-white px-4 py-2 rounded-xl font-bold hover:bg-palette-2 transition-colors shadow-sm">
              <Plus size={20} /> Nova Carga
            </button>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {trips.map((trip) => {
              const totalCost = trip.costMercadoria + trip.costLogistico + trip.costAlimentacao + trip.costManutencao + trip.costOutros;
              const netProfit = trip.revenue - totalCost;
            

  return (
                <div key={trip.id} className="bg-white border border-palette-4 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                                    <div className="p-4 border-b border-palette-4 flex justify-between items-center bg-palette-5/10">
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
                          onClick={() => { setSelectedTripId(trip.originalId); setIsNoteModalOpen(true); }}
                          className="text-[10px] uppercase font-bold text-palette-1 hover:text-palette-2 transition-colors"
                        >
                          + Add Nota
                        </button>
                      </div>
                      <div className="space-y-3">
                        {trip.occurrences?.map((occ: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between items-start text-sm group">
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
              onClick={() => { setEditingContactId(null); setNewContact({name: '', phone: '', type: 'Manutenção', location: ''}); setIsContactModalOpen(true); }}
              className="flex items-center gap-2 bg-palette-1 text-white px-4 py-2 rounded-xl font-bold hover:bg-palette-2 transition-colors shadow-sm"
            >
              <Plus size={20} /> Novo Contato
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            {contacts.length === 0 && (
              <div className="col-span-full p-8 text-center text-palette-2 border-2 border-dashed border-palette-4 rounded-2xl">
                Nenhum contato cadastrado.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Novo Contato */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-palette-4">
              <h3 className="font-bold text-lg text-text-main">{editingContactId ? 'Editar Contato' : 'Novo Contato de Apoio'}</h3>
              <button onClick={() => setIsContactModalOpen(false)} className="text-palette-2 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddContact}>
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
            </form>
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
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
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
                    <button 
                      type="button"
                      onClick={handleCaptureGps}
                      disabled={isCapturingGps}
                      className={`w-full flex items-center justify-center gap-2 border font-bold py-2 rounded-lg text-sm transition-colors ${
                        gpsLocation 
                          ? 'bg-green-50 border-green-200 text-green-700' 
                          : 'bg-white border-red-200 text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <Navigation size={16} className={isCapturingGps ? 'animate-pulse' : ''} /> 
                      {isCapturingGps ? 'Buscando satélites...' : gpsLocation ? 'Localização GPS Capturada!' : 'Capturar Minha Localização GPS'}
                    </button>
                    <div className="bg-white rounded-lg p-3 border border-red-100 shadow-sm">
                      <p className="text-xs font-bold text-red-800 mb-2">Selecione para quem enviar o alerta:</p>
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                        {contacts.map(contact => (
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
              <button onClick={() => { setIsNoteModalOpen(false); setIsSOSMode(false); setSelectedSOSContacts([]); setGpsLocation(null); setIsCapturingGps(false); }} className="px-4 py-2 font-bold text-palette-2 hover:text-text-main transition-colors">
                Cancelar
              </button>
              <button 
                onClick={() => { 
                  if (isSOSMode && selectedSOSContacts.length > 0) {
                    const selectedPhones = contacts
                      .filter(c => selectedSOSContacts.includes(c.id))
                      .map(c => c.phone.replace(/\D/g, ''));
                      
                    const sendSMS = (text: string) => {
                      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                      const separator = isIOS ? ',' : ';';
                      const phoneString = selectedPhones.join(separator);
                      window.location.href = `sms:${phoneString}${isIOS ? '&' : '?'}body=${encodeURIComponent(text)}`;
                      
                      setIsNoteModalOpen(false); 
                      setIsSOSMode(false); 
                      setSelectedSOSContacts([]);
                    };

                    const text = gpsLocation
                      ? `🚨 ALERTA SOS - MADRID AGRO 🚨\nEmergência na carga!\nLocalização: https://maps.google.com/?q=${gpsLocation.latitude},${gpsLocation.longitude}`
                      : `🚨 ALERTA SOS - MADRID AGRO 🚨\nEmergência na carga!`;
                    sendSMS(text);
                  } else {
                    handleAddNote();
                  }
                }} 
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

      {/* Modal: Nova Carga */}
      {isNewTripModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-palette-4">
              <h3 className="font-bold text-lg text-text-main">{editingTripId ? 'Editar Carga' : 'Nova Carga'}</h3>
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
                  {editingTripId ? 'Salvar Edição' : 'Salvar Carga'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
