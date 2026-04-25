import csv
import os
import re
import random
import sys
from pathlib import Path

# Setup Path
SCRIPT_ROOT = Path(__file__).resolve().parents[1]
if str(SCRIPT_ROOT) not in sys.path:
    sys.path.insert(0, str(SCRIPT_ROOT))

def parse_rating(rating_str):
    """Parses numeric rating from string."""
    if not rating_str:
        return ''
    match = re.search(r"(\d+(\.\d+)?)", rating_str)
    return match.group(1) if match else ''

def clean_courses(input_file, output_file):
    """Pure cleaning script: mapping, parsing, and defaults."""
    columns_mapping = {
        'Title': 'title',
        'Short Intro': 'short_description',
        'Category': 'category',
        'Skills': 'tags',
        'Instructors': 'instructors',
        'Rating': 'rating'
    }

    try:
        with open(input_file, 'r', encoding='utf-8') as infile:
            reader = csv.DictReader(infile)
            fieldnames = reader.fieldnames
            
            output_headers = list(columns_mapping.values())
            output_headers.extend(['thumbnail_url', 'introductory_video', 'final_price', 'original_price'])
            
            with open(output_file, 'w', encoding='utf-8', newline='') as outfile:
                writer = csv.DictWriter(outfile, fieldnames=output_headers)
                writer.writeheader()
                
                rows_processed = 0
                for row in reader:
                    cleaned_row = {}
                    for input_col, output_col in columns_mapping.items():
                        val = row.get(input_col, '') or ''
                        
                        if output_col == 'rating':
                            val = parse_rating(val)
                        elif output_col == 'instructors':
                             if val:
                                parts = val.split(',')
                                val = parts[0].strip() if parts else ''

                        cleaned_row[output_col] = val
                    
                    if not all(cleaned_row.values()):
                        continue

                    cleaned_row['thumbnail_url'] = f"https://picsum.photos/seed/course_{rows_processed+1:04d}/1280/720"
                    cleaned_row['introductory_video'] = "https://core-learnova.t9tieanh.io.vn/api/v1/learning/storage/1774780379542-YTDown.com_YouTube_What-is-Docker-in-5-minutes_Media_dfLOzuIg2o_001_1080p.mp4"
                    
                    variance = random.randint(0, 9) * 1000
                    cleaned_row['final_price'] = 194000 + variance
                    cleaned_row['original_price'] = 300000 + variance

                    writer.writerow(cleaned_row)
                    rows_processed += 1
                    
            print(f"✅ Successfully processed {rows_processed} rows (Clean only).")
            print(f"Output saved to: {output_file}")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    data_root = Path(__file__).resolve().parents[2]
    input_csv = data_root / 'data' / 'raw' / 'online-courses' / 'Online_Courses.csv'
    output_csv = data_root / 'data' / 'cleaned' / 'cleaned_courses.csv'
    
    os.makedirs(output_csv.parent, exist_ok=True)
    clean_courses(input_csv, output_csv)
