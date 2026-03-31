import csv
import os
import json

BASE_URL = "https://learnova.t9tieanh.io.vn/course"

def load_course_ids_from_normalized(normalized_courses_file):
    """
    Load course IDs from normalized courses.csv file.
    Returns a dict: {title -> course_id} for mapping
    """
    course_map = {}
    try:
        with open(normalized_courses_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                title = row.get('title', '').strip()
                course_id = row.get('id', '').strip()
                if title and course_id:
                    course_map[title] = course_id
        print(f"Loaded {len(course_map)} course IDs from normalized courses.")
    except FileNotFoundError:
        print(f"Warning: Normalized courses file not found: {normalized_courses_file}")
    return course_map


def normalize_courses_for_supabase(input_file, output_file, normalized_courses_file=None):
    """
    Normalizes cleaned course data for Supabase course_embeddings table.
    
    Schema:
    - id: UUID (from normalized courses)
    - name: text (from title)
    - description: text (from short_description)
    - tags: text[] (array from comma-separated string)
    - created_at: timestamp (auto via now())
    - link: text (https://learnova.t9tieanh.io.vn/course/{course_id})
    - content: text (NULL - user will fill later)
    - metadata: jsonb (enriched data: category, rating, instructors, prices, thumbnail, row_count, tag_count)
    """
    
    # Load course IDs from normalized courses if provided
    course_ids = {}
    if normalized_courses_file:
        course_ids = load_course_ids_from_normalized(normalized_courses_file)
    
    try:
        with open(input_file, 'r', encoding='utf-8') as infile:
            reader = csv.DictReader(infile)
            fieldnames = reader.fieldnames
            
            if not fieldnames:
                print("Error: Empty file or no header found.")
                return
            
            # Prepare output header
            output_headers = ['id', 'name', 'description', 'tags', 'link', 'content', 'metadata']
            
            with open(output_file, 'w', encoding='utf-8', newline='') as outfile:
                writer = csv.DictWriter(outfile, fieldnames=output_headers)
                writer.writeheader()
                
                rows_processed = 0
                for row in reader:
                    try:
                        # Extract values from input row
                        title = row.get('title', '').strip()
                        short_description = row.get('short_description', '').strip()
                        category = row.get('category', '').strip()
                        tags_str = row.get('tags', '').strip()
                        instructors = row.get('instructors', '').strip()
                        rating = row.get('rating', '').strip()
                        thumbnail_url = row.get('thumbnail_url', '').strip()
                        final_price = row.get('final_price', '').strip()
                        original_price = row.get('original_price', '').strip()
                        
                        # Skip row if critical fields are empty
                        if not title or not short_description:
                            continue
                        
                        # Transform tags: split by comma and strip whitespace
                        tags_array = [tag.strip() for tag in tags_str.split(',') if tag.strip()]
                        tags_json = json.dumps(tags_array)
                        tag_count = len(tags_array)
                        
                        # Lookup course ID from normalized courses, fallback to empty string
                        course_id = course_ids.get(title, '')
                        
                        # Build link: https://learnova.t9tieanh.io.vn/course/{course_id}
                        link = f"{BASE_URL}/{course_id}" if course_id else ""
                        
                        # Build enriched metadata as JSONB
                        metadata = {
                            'category': category,
                            'rating': float(rating) if rating else None,
                            'instructors': instructors,
                            'final_price': int(final_price) if final_price else None,
                            'original_price': int(original_price) if original_price else None,
                            'thumbnail_url': thumbnail_url,
                            'tags': tags_array,  # Include tags array in metadata
                            'tag_count': tag_count,
                            'discount_percentage': None,
                        }
                        
                        # Calculate discount percentage if prices available
                        if final_price and original_price:
                            try:
                                discount = ((int(original_price) - int(final_price)) / int(original_price)) * 100
                                metadata['discount_percentage'] = round(discount, 2)
                            except (ValueError, ZeroDivisionError):
                                pass
                        
                        metadata_json = json.dumps(metadata)
                        
                        # Create output row
                        output_row = {
                            'id': course_id if course_id else '',
                            'name': title,
                            'description': short_description,
                            'tags': tags_json,
                            'link': link,
                            'content': '',
                            'metadata': metadata_json
                        }
                        
                        writer.writerow(output_row)
                        rows_processed += 1
                        
                    except Exception as e:
                        print(f"Warning: Error processing row: {e}")
                        continue
                
                print(f"Successfully processed {rows_processed} rows.")
                print(f"Normalized Supabase data saved to: {output_file}")

    
    except FileNotFoundError:
        print(f"Error: Input file not found at {input_file}")
    except Exception as e:
        print(f"An error occurred: {e}")


if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_root = os.path.abspath(os.path.join(script_dir, '..', '..'))
    
    input_csv_path = os.path.join(data_root, 'data', 'cleaned', 'cleaned_courses.csv')
    output_csv_path = os.path.join(data_root, 'data', 'normalized', 'courses_for_supabase.csv')
    normalized_courses_path = os.path.join(data_root, 'data', 'normalized', 'courses.csv')
    
    os.makedirs(os.path.dirname(output_csv_path), exist_ok=True)
    
    print(f"Input file: {input_csv_path}")
    print(f"Output file: {output_csv_path}")
    print(f"Normalized courses file: {normalized_courses_path}")
    
    normalize_courses_for_supabase(input_csv_path, output_csv_path, normalized_courses_path)
