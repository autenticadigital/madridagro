import re

file_path = '/home/sergio/Documentos/office/madridagro/src/pages/CentralLogistica.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Add import toast from 'react-hot-toast';
if "import toast" not in content:
    content = content.replace("import { supabase } from '../lib/supabase';", "import { supabase } from '../lib/supabase';\nimport toast from 'react-hot-toast';")

with open(file_path, 'w') as f:
    f.write(content)

print("Imports fixed")
