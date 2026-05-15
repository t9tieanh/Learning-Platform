import os
import sys
import json
import psycopg2
import mysql.connector
import uuid
from datetime import datetime
from pathlib import Path

# Add utils to path for importing
sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'utils'))
try:
    from env_loader import load_env
    load_env()
except ImportError:
    from dotenv import load_dotenv
    load_dotenv()

# Configuration
# The script can target a specific course to sync analysis data to all its video lessons
TARGET_COURSE_ID = "011c5746-1359-4c2f-9810-ce132e566cc8"

# MySQL Database Configuration (Source of lessons)
MYSQL_HOST = os.getenv('DB_HOST', 'localhost')
MYSQL_USER = os.getenv('DB_USER', 'root')
MYSQL_PASSWORD = os.getenv('DB_PASSWORD', '')
MYSQL_PORT = int(os.getenv('DB_PORT', 3306))
MYSQL_DATABASE = 'course_service'

# Supabase (PostgreSQL) Configuration (Target)
SUPABASE_CONNECTION_STRING = os.getenv('DB_CONNECTION_STRING', '')

if not SUPABASE_CONNECTION_STRING:
    print("Error: DB_CONNECTION_STRING (Supabase) not found in environment.")
    sys.exit(1)

def get_video_lessons_from_mysql():
    lessons = []
    conn = None
    try:
        print(f"Connecting to MySQL at {MYSQL_HOST}...")
        conn = mysql.connector.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            port=MYSQL_PORT,
            database=MYSQL_DATABASE
        )
        cur = conn.cursor(dictionary=True)
        # Filter lessons by course_id via chapters table
        print(f"Filtering lessons for course: {TARGET_COURSE_ID}")
        cur.execute("""
            SELECT l.id, l.title, l.content, l.duration, l.position, l.is_public, l.type, l.url, 
                   l.chapter_id, l.created_at, l.updated_at, l.deleted 
            FROM lessons l
            JOIN chapters c ON l.chapter_id = c.id
            WHERE c.course_id = %s AND l.type = 'video'
        """, (TARGET_COURSE_ID,))
        lessons = cur.fetchall()
        print(f"Retrieved {len(lessons)} video lessons for this course.")
    except Exception as e:
        print(f"Error querying MySQL: {e}")
    finally:
        if conn:
            conn.close()
    return lessons

def sync_data():
    # 1. Load exported analysis data to use as template
    script_dir = Path(__file__).parent
    # We use the latest exported lesson as the standard template for seeding
    sample_json_path = script_dir.parent / 'data-template' / 'lesson_5d5d9206-4a7f-49c3-8272-7e04b2f01c8c.json'
    
    if not sample_json_path.exists():
        # Fallback to the other common template if first one is missing
        sample_json_path = script_dir.parent / 'data-template' / 'lesson_5d5d9206-4a7f-49c3-8272-7e04b2f01c8c.json'
    
    if not sample_json_path.exists():
        print(f"Error: Sample JSON not found at {sample_json_path}")
        return

    print(f"Using template: {sample_json_path.name}")
    with open(sample_json_path, 'r', encoding='utf-8') as f:
        sample_data = json.load(f)

    # 2. Get target lessons from MySQL
    mysql_lessons = get_video_lessons_from_mysql()
    if not mysql_lessons:
        print(f"No video lessons found for course {TARGET_COURSE_ID}. Exiting.")
        return

    # 3. Connect to Supabase and Sync
    conn = None
    try:
        print(f"Connecting to Supabase...")
        conn = psycopg2.connect(SUPABASE_CONNECTION_STRING)
        cur = conn.cursor()
        
        batch_size = 10
        for i in range(0, len(mysql_lessons), batch_size):
            batch = mysql_lessons[i:i + batch_size]
            print(f"Processing batch {i//batch_size + 1} ({len(batch)} lessons)...")
            
            for m_lesson in batch:
                lesson_id = m_lesson['id']
                
                # A. Upsert Lesson Analysis
                cur.execute("""
                    INSERT INTO lessons (
                        id, title, content, duration, position, "isPublic", type, url, 
                        "chapterId", "createdAt", "updatedAt", deleted,
                        transcript, subtitles, summary, "suggestedTitle", status
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET
                        transcript = EXCLUDED.transcript,
                        subtitles = EXCLUDED.subtitles,
                        summary = EXCLUDED.summary,
                        "suggestedTitle" = EXCLUDED."suggestedTitle",
                        status = EXCLUDED.status,
                        "updatedAt" = EXCLUDED."updatedAt"
                """, (
                    lesson_id,
                    m_lesson['title'],
                    m_lesson['content'],
                    m_lesson['duration'],
                    m_lesson['position'],
                    bool(m_lesson['is_public']),
                    m_lesson['type'],
                    m_lesson['url'],
                    m_lesson['chapter_id'],
                    m_lesson['created_at'] or datetime.now(),
                    m_lesson['updated_at'] or datetime.now(),
                    bool(m_lesson['deleted']),
                    sample_data['lesson']['transcript'],
                    sample_data['lesson']['subtitles'],
                    sample_data['lesson']['summary'],
                    sample_data['lesson']['suggestedTitle'],
                    sample_data['lesson'].get('status', 'COMPLETED')
                ))

                # B. Clear existing analysis data (Cascade should handle quizzes but we clear headers first)
                cur.execute("DELETE FROM lesson_tests WHERE \"lesson_id\" = %s", (lesson_id,))
                cur.execute("DELETE FROM lesson_chunks WHERE \"lessonId\" = %s", (lesson_id,))
                
                # C. Prepare mapping to track old chunk IDs to new chunk IDs for this lesson
                chunk_id_map = {}
                
                def replace_chunk_ids(text, mapping):
                    if not text: return text
                    import re
                    # Regex to find @{{uuid}}@
                    pattern = r'@{{([0-9a-fA-F-]+)}}@'
                    def replace_func(match):
                        old_id = match.group(1)
                        return f"@{{{{{mapping.get(old_id, old_id)}}}}}@"
                    return re.sub(pattern, replace_func, text)
                
                # D. Insert Chunks & Standalone Quizzes
                for chunk_sample in sample_data['chunks']:
                    old_chunk_id = chunk_sample['id']
                    new_chunk_id = str(uuid.uuid4())
                    chunk_id_map[old_chunk_id] = new_chunk_id
                    
                    cur.execute("""
                        INSERT INTO lesson_chunks 
                        (id, "lessonId", content, title, summary, "chunkIndex", 
                         "subtitleIndex", "startTime", "endTime", "timestamp", 
                         "sentenceCount", "startSentenceIndex", "endSentenceIndex",
                         embedding, "createdAt", "updatedAt")
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        new_chunk_id,
                        lesson_id,
                        chunk_sample['content'],
                        chunk_sample['title'],
                        chunk_sample['summary'],
                        chunk_sample['chunkIndex'],
                        chunk_sample['subtitleIndex'],
                        chunk_sample['startTime'],
                        chunk_sample['endTime'],
                        chunk_sample['timestamp'],
                        chunk_sample['sentenceCount'],
                        chunk_sample['startSentenceIndex'],
                        chunk_sample['endSentenceIndex'],
                        chunk_sample['embedding'],
                        datetime.now(),
                        datetime.now()
                    ))
                    
                    # Insert CHUNK_STANDALONE quizzes
                    for quiz_sample in chunk_sample.get('quizzes', []):
                        new_quiz_id = str(uuid.uuid4())
                        # Process explanation to replace old chunk IDs with new ones
                        explanation = replace_chunk_ids(quiz_sample['explanation'], chunk_id_map)
                        
                        cur.execute("""
                            INSERT INTO quizzes 
                            (id, "chunkId", "quiz_scope", question, explanation, type, difficulty, "bloomLevel", 
                             "aiGenerated", "aiModel", "aiConfidence", "createdBy", "isApproved", status,
                             "createdAt", "updatedAt")
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, (
                            new_quiz_id,
                            new_chunk_id,
                            'CHUNK_STANDALONE',
                            quiz_sample['question'],
                            explanation,
                            quiz_sample['type'],
                            quiz_sample['difficulty'],
                            quiz_sample['bloomLevel'],
                            quiz_sample['aiGenerated'],
                            quiz_sample['aiModel'],
                            quiz_sample['aiConfidence'],
                            quiz_sample['createdBy'],
                            quiz_sample['isApproved'],
                            quiz_sample['status'],
                            datetime.now(),
                            datetime.now()
                        ))
                        
                        for choice_sample in quiz_sample.get('choices', []):
                            cur.execute("""
                                INSERT INTO quiz_choices (id, "quizId", text, "isCorrect", "order", feedback, "createdAt", "updatedAt")
                                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                            """, (
                                str(uuid.uuid4()),
                                new_quiz_id,
                                choice_sample['text'],
                                choice_sample['isCorrect'],
                                choice_sample['order'],
                                choice_sample['feedback'],
                                datetime.now(),
                                datetime.now()
                            ))

                # E. Insert LessonTest Blueprint
                lt_sample = sample_data.get('lessonTest')
                if lt_sample:
                    cur.execute("""
                        INSERT INTO lesson_tests 
                        ("lesson_id", title, status, "target_total_questions", notes, "created_by", "created_at", "updated_at")
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        lesson_id,
                        lt_sample['title'],
                        'PUBLISHED',
                        lt_sample['target_total_questions'],
                        lt_sample['notes'],
                        lt_sample['created_by'],
                        datetime.now(),
                        datetime.now()
                    ))

                # F. Insert LessonTestChunkGroups & LESSON_TEST quizzes
                for group_sample in sample_data.get('lessonTestChunkGroups', []):
                    new_group_id = str(uuid.uuid4())
                    
                    # Map old chunk IDs in array to new chunk IDs
                    old_group_chunk_ids = group_sample.get('chunk_ids', [])
                    new_group_chunk_ids = [chunk_id_map.get(old_id, old_id) for old_id in old_group_chunk_ids]
                    
                    cur.execute("""
                        INSERT INTO lesson_test_chunk_groups 
                        (id, "lesson_id", "chunk_ids", "question_count", label, "batch_user_prompt", distribution, "created_at", "updated_at")
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        new_group_id,
                        lesson_id,
                        json.dumps(new_group_chunk_ids),
                        group_sample['question_count'],
                        group_sample['label'],
                        group_sample['batch_user_prompt'],
                        json.dumps(group_sample['distribution']) if group_sample.get('distribution') else None,
                        datetime.now(),
                        datetime.now()
                    ))
                    
                    # Insert quizzes linked to this group
                    for quiz_sample in group_sample.get('quizzes', []):
                        new_quiz_id = str(uuid.uuid4())
                        # Process explanation to replace old chunk IDs with new ones
                        explanation = replace_chunk_ids(quiz_sample['explanation'], chunk_id_map)

                        cur.execute("""
                            INSERT INTO quizzes 
                            (id, "lesson_test_chunk_group_id", "quiz_scope", question, explanation, type, difficulty, "bloomLevel", 
                             "aiGenerated", "aiModel", "aiConfidence", "createdBy", "isApproved", status,
                             "createdAt", "updatedAt")
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, (
                            new_quiz_id,
                            new_group_id,
                            'LESSON_TEST',
                            quiz_sample['question'],
                            explanation,
                            quiz_sample['type'],
                            quiz_sample['difficulty'],
                            quiz_sample['bloomLevel'],
                            quiz_sample['aiGenerated'],
                            quiz_sample['aiModel'],
                            quiz_sample['aiConfidence'],
                            quiz_sample['createdBy'],
                            quiz_sample['isApproved'],
                            quiz_sample['status'],
                            datetime.now(),
                            datetime.now()
                        ))
                        
                        for choice_sample in quiz_sample.get('choices', []):
                            cur.execute("""
                                INSERT INTO quiz_choices (id, "quizId", text, "isCorrect", "order", feedback, "createdAt", "updatedAt")
                                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                            """, (
                                str(uuid.uuid4()),
                                new_quiz_id,
                                choice_sample['text'],
                                choice_sample['isCorrect'],
                                choice_sample['order'],
                                choice_sample['feedback'],
                                datetime.now(),
                                datetime.now()
                            ))
            
            conn.commit()
            print(f"Batch {i//batch_size + 1} for course {TARGET_COURSE_ID} complete.")

        print(f"--- Sync & Seeding for Course {TARGET_COURSE_ID} Complete ---")

    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Sync error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    sync_data()
