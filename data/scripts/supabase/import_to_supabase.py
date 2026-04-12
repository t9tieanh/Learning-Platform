import csv
import os
import sys
import psycopg2
import json
from contextlib import contextmanager
from pathlib import Path

# Add utils to path for importing
sys.path.insert(0, str(Path(__file__).parent.parent / 'utils'))
from env_loader import load_env

# Load environment variables
script_dir = Path(__file__).parent
data_root = script_dir.parent.parent
load_env()

# Database Configuration - Supabase
SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', '')
DB_CONNECTION_STRING = os.getenv('DB_CONNECTION_STRING', '')

# If DB_CONNECTION_STRING is not set, try to build from URL
if not DB_CONNECTION_STRING:
    raise ValueError(
        "Missing database configuration. Set DB_CONNECTION_STRING in .env file.\n"
        "Format: postgresql://user:password@host:port/dbname"
    )

@contextmanager
def get_connection():
    """Context manager for database connection"""
    conn = None
    try:
        conn = psycopg2.connect(DB_CONNECTION_STRING)
        yield conn
        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            conn.close()

def import_courses_to_supabase(csv_file):
    """
    Imports normalized courses to Supabase course_embeddings table.
    
    Table schema (without 'check' and 'embedding' columns):
    - id: UUID (PK)
    - name: text
    - description: text
    - tags: text[] (PostgreSQL array)
    - created_at: timestamp (default now())
    - link: text
    - content: text
    - metadata: jsonb
    """
    
    print(f"Importing courses from {csv_file}...")
    
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            
            # Prepare SQL for bulk insert
            insert_sql = """
            INSERT INTO public.course_embeddings 
            (id, name, description, tags, link, content, metadata)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                tags = EXCLUDED.tags,
                link = EXCLUDED.link,
                content = EXCLUDED.content,
                metadata = EXCLUDED.metadata;
            """
            
            rows_to_insert = []
            
            with open(csv_file, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                
                for row in reader:
                    try:
                        course_id = row.get('id')
                        name = row.get('name')
                        description = row.get('description')
                        tags_json_str = row.get('tags')  # Already JSON array string from normalize script
                        link = row.get('link') if row.get('link') else None
                        content = row.get('content') if row.get('content') else None
                        metadata_json_str = row.get('metadata')  # Already JSON string from normalize script
                        
                        # Parse JSON strings back to Python objects for psycopg2
                        tags_array = json.loads(tags_json_str) if tags_json_str else []
                        metadata = json.loads(metadata_json_str) if metadata_json_str else {}
                        
                        rows_to_insert.append((
                            course_id,
                            name,
                            description,
                            tags_array,  # psycopg2 will convert to PostgreSQL array
                            link,
                            content,
                            json.dumps(metadata)  # Pass as JSON string for JSONB column
                        ))
                    
                    except Exception as e:
                        print(f"Warning: Error processing row {row}: {e}")
                        continue
            
            # Bulk insert
            if rows_to_insert:
                cursor.executemany(insert_sql, rows_to_insert)
                print(f"✅ Inserted {cursor.rowcount} courses into course_embeddings table.")
            else:
                print("No rows to insert.")
            
            cursor.close()
    
    except psycopg2.Error as e:
        print(f"❌ Database error: {e}")
        raise
    except FileNotFoundError:
        print(f"❌ Input file not found: {csv_file}")
        raise
    except Exception as e:
        print(f"❌ An error occurred: {e}")
        raise


if __name__ == "__main__":
    normalized_csv_path = os.path.join(data_root, 'data', 'normalized', 'courses_for_supabase.csv')
    
    print(f"Database Connection: {DB_CONNECTION_STRING[:50]}...")
    print(f"Normalized CSV: {normalized_csv_path}")
    
    import_courses_to_supabase(normalized_csv_path)
