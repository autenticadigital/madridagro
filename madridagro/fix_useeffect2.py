import re

file_path = '/home/sergio/Documentos/office/madridagro/src/pages/CentralLogistica.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Replace the whole useEffect block
content = re.sub(r"  useEffect\(\(\) => \{\n    fetchTrips\(\);\n.*?\n  \}, \[\]\);\n", """  useEffect(() => {
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
  }, []);\n""", content, flags=re.DOTALL)

with open(file_path, 'w') as f:
    f.write(content)

print("UseEffect fixed properly")
