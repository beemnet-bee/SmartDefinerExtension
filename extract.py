import fitz # PyMuPDF
import os
import glob

dicts_dir = 'dicts'
output_file = 'extracted_text.txt'

all_text = ""

for pdf_file in glob.glob(os.path.join(dicts_dir, '*.pdf')):
    print(f"Parsing {pdf_file}...")
    try:
        doc = fitz.open(pdf_file)
        text = ""
        for page in doc:
            text += page.get_text()
        all_text += f"\n\n--- Source: {os.path.basename(pdf_file)} ---\n{text}"
    except Exception as e:
        print(f"Error parsing {pdf_file}: {e}")

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(all_text)

print(f"Finished extracting text to {output_file}")
