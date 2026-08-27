import re

file_path = '/home/sergio/Documentos/office/madridagro/src/pages/CentralLogistica.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Remove all getContactIcon definitions
content = re.sub(r"  const getContactIcon = \(type: string\) => \{\n.*?    \}\n  \};\n", "", content, flags=re.DOTALL)
# Remove all fetchContacts definitions
content = re.sub(r"  const fetchContacts = async \(\) => \{\n    try \{\n.*?    \}\n  \};\n", "", content, flags=re.DOTALL)

# Now add them back exactly once before `return (`
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

# Replace the first `return (`
content = content.replace("  return (", icons_helper + "\n  return (", 1)

with open(file_path, 'w') as f:
    f.write(content)

print("Duplicates fixed")
