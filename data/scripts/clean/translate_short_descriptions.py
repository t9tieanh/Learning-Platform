import csv
import os
import sys
from pathlib import Path

# Thêm SCRIPT_ROOT vào sys.path để import utils
SCRIPT_ROOT = Path(__file__).resolve().parents[1]
if str(SCRIPT_ROOT) not in sys.path:
    sys.path.insert(0, str(SCRIPT_ROOT))

import deepl
from utils import load_env

# Load biến môi trường
load_env()

DEEPL_API_KEY = os.getenv('DEEPL_API_KEY') or os.getenv('DEEPL_AUTH_KEY')
_translator = None
_translation_cache = {}

def get_translator():
    global _translator
    if _translator is not None:
        return _translator

    if not DEEPL_API_KEY:
        print("Warning: Deepl API key not found. Set DEEPL_API_KEY to enable translation.")
        return None

    try:
        _translator = deepl.Translator(DEEPL_API_KEY)
    except deepl.DeepLException as exc:
        print(f"Warning: Could not initialize Deepl translator ({exc}).")
        _translator = None

    return _translator

def translate_to_vietnamese(text):
    if not text:
        return ''

    normalized = text.strip()
    if not normalized:
        return ''

    if normalized in _translation_cache:
        return _translation_cache[normalized]

    translator = get_translator()
    if not translator:
        return normalized

    try:
        translated = translator.translate_text(normalized, target_lang='VI')
        translated_text = translated.text.strip()
        if not translated_text:
            translated_text = normalized
    except deepl.DeepLException as exc:
        print(f"Warning: Deepl translation failed ({exc}). Using original text.")
        translated_text = normalized

    _translation_cache[normalized] = translated_text
    return translated_text

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_root = os.path.abspath(os.path.join(script_dir, '..', '..'))
    
    input_file = os.path.join(data_root, 'data', 'cleaned', 'cleaned_courses.csv')
    output_temp = os.path.join(data_root, 'data', 'cleaned', 'cleaned_courses_temp.csv')
    
    if not os.path.exists(input_file):
        print(f"Error: Input file not found at {input_file}")
        return

    print(f"Reading from: {input_file}")
    
    try:
        with open(input_file, 'r', encoding='utf-8') as infile:
            reader = csv.DictReader(infile)
            fieldnames = reader.fieldnames
            rows = list(reader)
            total_rows = len(rows)
            
            print(f"Processing {total_rows} rows. This might take a while...")
            
            for i, row in enumerate(rows):
                original_desc = row.get('short_description', '')
                if original_desc:
                    row['short_description'] = translate_to_vietnamese(original_desc)
                
                if (i + 1) % 10 == 0 or (i + 1) == total_rows:
                    print(f"Progress: {i + 1}/{total_rows} rows processed.")

        with open(output_temp, 'w', encoding='utf-8', newline='') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
        
        os.replace(output_temp, input_file)
        print(f"✅ Successfully updated: {input_file}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
