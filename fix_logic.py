import os

file_path = r'c:\Users\Owen\OneDrive\Desktop\TCB-prototype\main\app.js'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    # Remove empty currentFormType checks that were trademarks
    if 'if (currentFormType === "") return "Mark Details";' in line:
        continue
    if '} else if (currentFormType === "") {' in line:
        # This one is tricky as it has a block. I'll just keep it for now if it doesn't break syntax.
        # But wait, it was:
        # } else if (currentFormType === "") {
        #   return `...`
        # }
        # If I remove the if, I might break the sequence.
        pass
    
    # Fix the badge- thing if it's still there in any form
    if 'badge-"' in line and ':' in line:
        continue

    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Cleaned up logical leftovers in app.js")
