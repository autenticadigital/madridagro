import re

file_path = '/home/sergio/Documentos/office/madridagro/src/pages/CentralLogistica.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Replace the useEffect block
old_use_effect = """  useEffect(() => {
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
  }, []);"""

new_use_effect = """  useEffect(() => {
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
  }, []);"""

content = content.replace(old_use_effect, new_use_effect)

with open(file_path, 'w') as f:
    f.write(content)

print("UseEffect fixed")
