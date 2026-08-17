import glob
import re

files = glob.glob('**/*.html', recursive=True)
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '<<<<<<<' in content:
        # We want to extract the canonical link from the HEAD section, and the icon links from the other section
        def resolve_conflict(match):
            head_part = match.group(1)
            my_part = match.group(2)
            
            # Find the canonical link in HEAD
            canonical_match = re.search(r'<link rel="canonical" href="[^"]+">', head_part)
            canonical = canonical_match.group(0) if canonical_match else ''
            
            # Find the icon links in my part
            icon_links = []
            for line in my_part.split('\n'):
                if 'rel="icon"' in line:
                    icon_links.append(line.strip())
            
            icons = '\n    '.join(icon_links)
            return f'{canonical}\n    {icons}\n' if canonical else f'{icons}\n'
            
        new_content = re.sub(r'<<<<<<< HEAD\n(.*?)=======\n(.*?)>>>>>>> [^\n]+', resolve_conflict, content, flags=re.DOTALL)
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Resolved {file}')
