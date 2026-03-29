import csv
import os
import re
import random

def parse_rating(rating_str):
    """
    Parses the rating string (e.g., "4.7stars") to extract the numeric value (e.g., 4.7).
    """
    if not rating_str:
        return ''
    # Look for a number at the beginning of the string
    match = re.search(r"(\d+(\.\d+)?)", rating_str)
    if match:
        return match.group(1) # Return as string to preserve formatting, or float
    return ''

def clean_courses(input_file, output_file):
    """
    Cleans the course data by keeping only specific columns, renaming them to match the database schema,
    and transforming values (e.g., rating).
    """
    # Define the columns to keep and their new names
    # Input column name -> Output column name (Database schema friendly)
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
            
            # verify input columns exist
            fieldnames = reader.fieldnames
            if not fieldnames:
                print("Error: Empty file or no header found.")
                return

            missing_columns = [col for col in columns_mapping.keys() if col not in fieldnames]
            if missing_columns:
                print(f"Warning: The following columns are missing in the input file: {missing_columns}")
            
            # Prepare output header
            output_headers = list(columns_mapping.values())
            output_headers.append('thumbnail_url')
            output_headers.append('introductory_video')
            output_headers.append('final_price')
            output_headers.append('original_price')
            
            with open(output_file, 'w', encoding='utf-8', newline='') as outfile:
                writer = csv.DictWriter(outfile, fieldnames=output_headers)
                writer.writeheader()
                
                rows_processed = 0
                for row in reader:
                    cleaned_row = {}
                    for input_col, output_col in columns_mapping.items():
                        # Get value from input row, default to empty string if missing
                        val = row.get(input_col, '')
                        if val is None:
                            val = ''
                        
                        # Transformations
                        if output_col == 'rating':
                            val = parse_rating(val)
                        elif output_col == 'instructors':
                             if val:
                                parts = val.split(',')
                                if parts:
                                    val = parts[0].strip()

                        cleaned_row[output_col] = val
                    
                    # Skip row if any field is empty
                    if not all(cleaned_row.values()):
                        continue

                    # Generate thumbnail_url
                    # Pattern: https://picsum.photos/seed/course_xxxx/1280/720
                    cleaned_row['thumbnail_url'] = f"https://picsum.photos/seed/course_{rows_processed+1:04d}/1280/720"
                    
                    # Add introductory_video with default value
                    cleaned_row['introductory_video'] = "https://core-learnova.t9tieanh.io.vn/api/v1/learning/storage/1774780379542-YTDown.com_YouTube_What-is-Docker-in-5-minutes_Media_dfLOzuIg2o_001_1080p.mp4"
                    
                    # Add default prices
                    # Generate a random variance: 0 to 9 * 1000 (e.g., 0, 1000, 2000, ... 9000)
                    variance = random.randint(0, 9) * 1000
                    cleaned_row['final_price'] = 194000 + variance
                    cleaned_row['original_price'] = 300000 + variance

                    writer.writerow(cleaned_row)
                    rows_processed += 1
                    
            print(f"Successfully processed {rows_processed} rows.")
            print(f"Cleaned data saved to: {output_file}")

    except FileNotFoundError:
        print(f"Error: Input file not found at {input_file}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    # Define paths relative to the script location or absolute
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_root = os.path.abspath(os.path.join(script_dir, '..', '..')) # points to 'data' folder
    
    input_csv_path = os.path.join(data_root, 'data', 'raw', 'online-courses', 'Online_Courses.csv')
    output_csv_path = os.path.join(data_root, 'data', 'cleaned', 'cleaned_courses.csv')
    
    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_csv_path), exist_ok=True)
    
    print(f"Input file: {input_csv_path}")
    print(f"Output file: {output_csv_path}")
    
    clean_courses(input_csv_path, output_csv_path)
