import subprocess
import sys
import os

try:
    import pypdf
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf"])
    import pypdf

pdf_path = "Proposal PPL_Kelompok E.docx (1).pdf"

with open(pdf_path, 'rb') as file:
    reader = pypdf.PdfReader(file)
    text = ''
    for page in reader.pages:
        text += page.extract_text() + '\n'

with open('extracted_text.txt', 'w', encoding='utf-8') as text_file:
    text_file.write(text)
    
print("Extraction complete.")
