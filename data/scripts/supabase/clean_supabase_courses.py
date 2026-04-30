import os
import sys
import psycopg2
from pathlib import Path

# Add utils to path for importing
sys.path.insert(0, str(Path(__file__).parent.parent / 'utils'))
try:
    from env_loader import load_env
    load_env()
except ImportError:
    from dotenv import load_dotenv
    load_dotenv()

# Database Configuration - Supabase
DB_CONNECTION_STRING = os.getenv('DB_CONNECTION_STRING', '')

if not DB_CONNECTION_STRING:
    print("Error: DB_CONNECTION_STRING not found in environment.")
    sys.exit(1)

def clean_supabase_courses():
    """
    Clears all data from public.course_embeddings table.
    """
    conn = None
    try:
        print(f"Connecting to Supabase...")
        conn = psycopg2.connect(DB_CONNECTION_STRING)
        cur = conn.cursor()
        
        print("Cleaning public.course_embeddings table...")
        # TRUNCATE is faster and resets auto-increment if any (though we use UUIDs)
        cur.execute("TRUNCATE TABLE public.course_embeddings RESTART IDENTITY CASCADE;")
        
        conn.commit()
        print("✅ Successfully cleared all data from course_embeddings table.")
        
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"❌ Error cleaning table: {e}")
        sys.exit(1)
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    confirm = input("ARE YOU SURE you want to clear all course data from Supabase? (y/n): ")
    if confirm.lower() == 'y':
        clean_supabase_courses()
    else:
        print("Operation cancelled.")
