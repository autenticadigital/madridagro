import re

file_path = '/home/sergio/Documentos/office/madridagro/src/pages/CentralLogistica.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Add imports
content = content.replace("import { useState } from 'react';", "import { useState, useEffect } from 'react';\nimport { supabase } from '../lib/supabase';")

# 2. Add states and effects
state_code = """
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  useEffect(() => {
    fetchTrips();
    
    const channel = supabase.channel('custom-all-channel-logistics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logistics_trips' }, () => {
        fetchTrips();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logistics_notes' }, () => {
        fetchTrips();
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
            text: note.text
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
"""

# Replace mockTrips definition with state_code
content = re.sub(r"const mockTrips = \[.*?\];", state_code, content, flags=re.DOTALL)

# Replace mockTrips.map with trips.map
content = content.replace("mockTrips.map((trip)", "trips.map((trip)")

# Update "Add Nota" button to capture the trip id
content = content.replace("onClick={() => setIsNoteModalOpen(true)}", "onClick={() => { setSelectedTripId(trip.originalId); setIsNoteModalOpen(true); }}")

# Update textarea to be controlled
content = content.replace("<textarea \n                  rows={3}", "<textarea \n                  value={newNoteText}\n                  onChange={(e) => setNewNoteText(e.target.value)}\n                  rows={3}")

# Update "Salvar Nota" button to call handleAddNote
content = content.replace("{isSOSMode ? `Emitir Alerta SOS (${selectedSOSContacts.length})` : 'Salvar Nota'}\n              </button>", "{isSOSMode ? `Emitir Alerta SOS (${selectedSOSContacts.length})` : 'Salvar Nota'}\n              </button>")
# Actually we need to change the onClick of the Salvar Nota to handleAddNote if it's not SOS mode
replacement_button = """                  } else {
                    handleAddNote();
                  }"""
content = content.replace("""                  } else {
                    setIsNoteModalOpen(false); 
                    setIsSOSMode(false); 
                    setSelectedSOSContacts([]);
                  }""", replacement_button)

with open(file_path, 'w') as f:
    f.write(content)

print("Updated Logistica")
