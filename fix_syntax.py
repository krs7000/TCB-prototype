import os

file_path = r'c:\Users\Owen\OneDrive\Desktop\TCB-prototype\main\app.js'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip_until = -1

for i, line in enumerate(lines):
    if i < skip_until:
        continue
    
    # Fix : "badge-", at line 1662 (0-indexed 1661)
    if ': "badge-",' in line:
        continue # skip the broken line
    
    # Fix renderFilingHub broken option at 3192 (0-indexed 3191)
    if "{ id: typeKey: '', title:  icon: 'fa-stamp'," in line:
        continue # skip the broken line
        
    # Fix case : at 3283 (0-indexed 3282)
    if 'case :' in line:
        # Skip until the next break;
        for j in range(i, i+10):
            if 'break;' in lines[j]:
                skip_until = j + 1
                break
        continue

    # Fix if (submission.type === "") formPage = ; at 5010 (0-indexed 5009)
    if 'if (submission.type === "") formPage = ;' in line:
        continue
        
    # Fix broken checklist/FAQ blocks
    if '   [' in line and i > 2800:
        # Check if it's the broken one
        if i + 1 < len(lines) and ('key: "-application-form"' in lines[i+1] or '"Complete the applicant and mark details."' in lines[i+1] or '{' in lines[i+1]):
             # Skip until ]
            for j in range(i, i+15):
                if '],' in lines[j] or ']' in lines[j]:
                    skip_until = j + 1
                    break
            continue
            
    # Fix faqData. at 3990 (0-indexed 3989)
    if 'faqData.,' in line:
        continue

    # Fix configs[submission.type] block at 12745 (0-indexed 12744)
    if '    : {' in line:
         # Skip until },
        for j in range(i, i+20):
            if '    },' in lines[j]:
                skip_until = j + 1
                break
        continue
        
    # Fix typeMap at 12899 (0-indexed 12898)
    if ": 'Application'," in line:
        continue

    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Fixed syntax errors in app.js")
