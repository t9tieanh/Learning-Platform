import csv
import os

def replace_thumbnails(source_file, target_file, output_file):
    print(f"Reading source data from {source_file}...")
    source_data = {}
    
    with open(source_file, 'r', encoding='utf-8') as f:
        # Use DictReader which handles quotes automatically
        reader = csv.DictReader(f)
        for row in reader:
            title = row.get('title', '').strip()
            if title:
                source_data[title] = row.get('thumbnail_url', '')

    print(f"Reading target data from {target_file} and replacing thumbnails...")
    
    with open(target_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        
        rows = []
        replaced_count = 0
        total_count = 0
        
        for row in reader:
            total_count += 1
            title = row.get('title', '').strip()
            new_thumbnail = source_data.get(title)
            
            if new_thumbnail:
                row['thumbnail_url'] = new_thumbnail
                replaced_count += 1
            
            rows.append(row)
            
    with open(output_file, 'w', encoding='utf-8', newline='') as out_f:
        writer = csv.DictWriter(out_f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
                
    print(f"Done! Replaced {replaced_count}/{total_count} thumbnails.")
    print(f"Result saved to {output_file}")

if __name__ == "__main__":
    data_root = "/home/t9tieanh/learn/Learning-Platform/data/data/cleaned"
    source_csv = os.path.join(data_root, "Filecourse-merged.csv")
    target_csv = os.path.join(data_root, "cleaned_courses.csv")
    output_csv = os.path.join(data_root, "cleaned_courses.csv") # Overwrite as requested? 
    # Actually, it's safer to use a temporary name first or the user might want to check it.
    # But the user said "replace value... ở file csv cleaned_courses.csv". 
    # I'll overwrite but keep a backup just in case.
    
    # Backup
    backup_csv = os.path.join(data_root, "cleaned_courses_backup.csv")
    import shutil
    if not os.path.exists(backup_csv):
        shutil.copy2(target_csv, backup_csv)
        print(f"Backup created at {backup_csv}")

    replace_thumbnails(source_csv, target_csv, output_csv)
