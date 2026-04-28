import os
import re

file_path = r'c:\Users\Owen\OneDrive\Desktop\TCB-prototype\main\styles.css'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove specific classes
classes_to_remove = [
    r'\.service-icon\.trademark\s*\{.*?\}',
    r'\.badge-trademark\s*\{.*?\}',
]

for pattern in classes_to_remove:
    content = re.sub(pattern, '', content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Scrubbed trademark classes from styles.css")
