import os
import sys
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
from pathlib import Path

# Add utils to path for importing
# Current script is in data/scripts/supabase/export-data/export_lesson_data.py
# utils is in data/scripts/utils
sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'utils'))
try:
    from env_loader import load_env
    # Load environment variables from data/.env
    load_env()
except ImportError:
    print("Warning: env_loader not found. Falling back to manual env loading.")
    from dotenv import load_dotenv
    load_dotenv()

# Database Configuration
DB_CONNECTION_STRING = os.getenv('DB_CONNECTION_STRING', '')

if not DB_CONNECTION_STRING:
    print("Error: DB_CONNECTION_STRING not found in environment.")
    sys.exit(1)

def date_serializer(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

def export_lesson_data(lesson_id):
    conn = None
    try:
        print(f"Connecting to database...")
        conn = psycopg2.connect(DB_CONNECTION_STRING)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        print(f"Fetching data for lesson: {lesson_id}")
        
        # 1. Fetch Lesson
        cur.execute("SELECT * FROM lessons WHERE id = %s", (lesson_id,))
        lesson = cur.fetchone()
        
        if not lesson:
            print("Lesson not found!")
            return
            
        # 2. Fetch Chunks (including embedding cast to text then to list)
        cur.execute("""
            SELECT id, "lessonId", content, title, summary, "chunkIndex", 
                   "subtitleIndex", "startTime", "endTime", "timestamp", 
                   "sentenceCount", "startSentenceIndex", "endSentenceIndex",
                   "createdAt", "updatedAt",
                   embedding::text as embedding_str
            FROM lesson_chunks 
            WHERE "lessonId" = %s 
            ORDER BY "chunkIndex" ASC
        """, (lesson_id,))
        chunks = cur.fetchall()
        
        # Convert embedding string "[1.2, 3.4, ...]" to list
        for chunk in chunks:
            if chunk['embedding_str']:
                # pgvector format is "[v1,v2,...]"
                chunk['embedding'] = [float(x) for x in chunk['embedding_str'].strip('[]').split(',')]
            else:
                chunk['embedding'] = None
            del chunk['embedding_str']
        
        # 3. For each chunk, fetch quizzes
        for chunk in chunks:
            cur.execute("""
                SELECT * FROM quizzes WHERE "chunkId" = %s
            """, (chunk['id'],))
            quizzes = cur.fetchall()
            
            # 4. For each quiz, fetch choices
            for quiz in quizzes:
                cur.execute("""
                    SELECT * FROM quiz_choices WHERE "quizId" = %s ORDER BY "order" ASC
                """, (quiz['id'],))
                choices = cur.fetchall()
                quiz['choices'] = choices
            
            chunk['quizzes'] = quizzes
            
        data = {
            "lesson": lesson,
            "chunks": chunks
        }
        
        # Determine output directory: data/scripts/supabase/data
        script_dir = Path(__file__).parent
        output_dir = script_dir.parent / 'data'
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Save to file
        output_path = output_dir / f"lesson_{lesson_id}.json"
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False, default=date_serializer)
            
        print(f"Successfully exported data to {output_path}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    target_id = "208126fd-3544-4551-8c9b-5110c33261af"
    if len(sys.argv) > 1:
        target_id = sys.argv[1]
    
    export_lesson_data(target_id)
