import os
import re

file_path = r'c:\Users\Owen\OneDrive\Desktop\TCB-prototype\main\app.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to find and remove "trademark" in various contexts
# Case-insensitive replacement of "Trademark" or "trademark"
# But we need to be careful with IDs and keys to not break the JS structure (e.g. empty strings)

content = re.sub(r'trademark', '', content, flags=re.IGNORECASE)

# Clean up broken strings/quotes like """, or , ,
content = content.replace('""', '""') # No change
content = content.replace(' ,', '')
content = content.replace(', ,', ',')
content = content.replace(',,', ',')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Massive scrub of 'trademark' (case-insensitive) completed.")
