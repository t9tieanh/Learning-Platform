import csv
import os
import sys
from pathlib import Path

# Setup Path
SCRIPT_ROOT = Path(__file__).resolve().parents[1]
if str(SCRIPT_ROOT) not in sys.path:
    sys.path.insert(0, str(SCRIPT_ROOT))

from utils.translator import translate_to_vietnamese

def translate_titles(file_path):
    print(f"Translating titles in {file_path}...")
    
    rows = []
    fieldnames = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            fieldnames = reader.fieldnames
            rows = list(reader)

        total = len(rows)
        for i, row in enumerate(rows):
            if row.get('title'):
                row['title'] = translate_to_vietnamese(row['title'])
            
            if (i + 1) % 10 == 0 or (i + 1) == total:
                print(f"Progress: {i + 1}/{total} rows processed.")

        # Overwrite same file
        temp_file = file_path + ".tmp"
        with open(temp_file, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
        
        os.replace(temp_file, file_path)
        print(f"✅ Successfully updated titles in: {file_path}")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    data_root = Path(__file__).resolve().parents[2]
    target_csv = data_root / 'data' / 'cleaned' / 'cleaned_courses.csv'
    
    if not target_csv.exists():
        print(f"Error: {target_csv} not found.")
        sys.exit(1)
        
    translate_titles(str(target_csv))
