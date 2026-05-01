import csv
import os

def join_raw_and_cleaned(raw_file, cleaned_file, output_file):
    print(f"Reading raw data from {raw_file}...")
    raw_data = {}
    
    # We use 'Skills' as the key. Since it might not be unique, 
    # we might store a list or just the first one found.
    # However, to be more precise, maybe (Title, Skills) would be better?
    # But the user specifically asked for 'Skills' and 'tags'.
    
    with open(raw_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            skills = row.get('Skills', '').strip()
            if skills:
                # If there are duplicates, the last one wins. 
                # This is a limitation of joining on non-unique fields.
                raw_data[skills] = row.get('URL', '')

    print(f"Reading cleaned data from {cleaned_file} and joining...")
    
    with open(cleaned_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        cleaned_fieldnames = reader.fieldnames
        output_fieldnames = cleaned_fieldnames + ['url']
        
        with open(output_file, 'w', encoding='utf-8', newline='') as out_f:
            writer = csv.DictWriter(out_f, fieldnames=output_fieldnames)
            writer.writeheader()
            
            joined_count = 0
            total_count = 0
            
            for row in reader:
                total_count += 1
                tags = row.get('tags', '').strip()
                url = raw_data.get(tags, '')
                
                if url:
                    joined_count += 1
                
                row['url'] = url
                writer.writerow(row)
                
    print(f"Done! Joined {joined_count}/{total_count} records.")
    print(f"Result saved to {output_file}")

if __name__ == "__main__":
    # Adjust paths based on your structure
    data_root = "/home/t9tieanh/learn/Learning-Platform/data"
    raw_csv = os.path.join(data_root, "data/raw/online-courses/Online_Courses.csv")
    cleaned_csv = os.path.join(data_root, "data/cleaned/cleaned_courses.csv")
    output_csv = os.path.join(data_root, "data/cleaned/cleaned_courses_with_url.csv")
    
    join_raw_and_cleaned(raw_csv, cleaned_csv, output_csv)
