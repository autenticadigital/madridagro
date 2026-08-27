import re

file_path = '/home/sergio/Documentos/office/madridagro/src/pages/CentralLogistica.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Remove the broken injection
content = re.sub(r"  const fetchContacts = async \(\) => \{\n.*?  \};\n\n  const getContactIcon = \(type: string\) => \{\n.*?  \};\n", "", content, flags=re.DOTALL)

# Inject them right before the REAL return statement (which should be `return (\n    <div className="space-y-6...`)
icons_helper = """
  const fetchContacts = async () => {
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
"""

content = content.replace("  return (\n    <div className=\"space-y-6", icons_helper + "\n  return (\n    <div className=\"space-y-6")

with open(file_path, 'w') as f:
    f.write(content)

print("Duplicates fixed 2")
