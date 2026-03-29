import csv
import os
import sys
from datetime import datetime
from pathlib import Path

import mysql.connector

SCRIPT_ROOT = Path(__file__).resolve().parents[1]
if str(SCRIPT_ROOT) not in sys.path:
    sys.path.insert(0, str(SCRIPT_ROOT))

from utils import load_env

script_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.abspath(os.path.join(script_dir, '..', '..'))
env_path = os.path.join(data_dir, '.env')
load_env([env_path])

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '') # Assume empty for local dev
DB_PORT = int(os.getenv('DB_PORT', 3306))

def connect_db():
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        port=DB_PORT
    )

def execute_sql_file(cursor, file_path):
    print(f"Executing SQL file: {file_path}")
    with open(file_path, 'r') as f:
        sql_commands = f.read()
        # Simple split by semicolon for basic scripts. 
        # For complex dumps with delimiters, this might be fragile but sufficient for schema dumps.
        commands = sql_commands.split(';')
        for command in commands:
            if command.strip():
                try:
                    cursor.execute(command)
                except mysql.connector.Error as err:
                    # Ignore "Table exists" or similar non-critical errors if handled by schema
                    print(f"Warning/Error executing command: {err}")

def import_users(cursor, file_path):
    print(f"Importing Users from {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        sql = """
        INSERT INTO users (id, description, email, image, name, password, phone, position, status, username) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE name=VALUES(name)
        """
        data = []
        for row in reader:
            data.append((
                row['id'], row['description'], row['email'], row['image'], row['name'], 
                row['password'], row['phone'], row['position'], row['status'], row['username']
            ))
        
        cursor.executemany(sql, data)
        print(f"Inserted {cursor.rowcount} users.")

def import_categories(cursor, file_path):
    print(f"Importing Categories from {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        sql = """
        INSERT INTO categories (id, created_at, deleted, updated_at, description, name) 
        VALUES (%s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE name=VALUES(name)
        """
        data = []
        for row in reader:
            # Handle booleans for bit(1) - usually 0 or 1
            deleted = 1 if row.get('deleted') == 'True' or row.get('deleted') == '1' else 0
            
            data.append((
                row['id'], row['created_at'], deleted, row['updated_at'], 
                row['description'], row['name']
            ))
        
        cursor.executemany(sql, data)
        print(f"Inserted {cursor.rowcount} categories.")

def import_tags(cursor, file_path):
    print(f"Importing Tags from {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        sql = """
        INSERT INTO tags (id, created_at, deleted, updated_at, image_url, name) 
        VALUES (%s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE name=VALUES(name)
        """
        data = []
        for row in reader:
            deleted = 1 if row.get('deleted') == 'True' or row.get('deleted') == '1' else 0
            data.append((
                row['id'], row['created_at'], deleted, row['updated_at'], 
                row['image_url'], row['name']
            ))
        
        cursor.executemany(sql, data)
        print(f"Inserted {cursor.rowcount} tags.")

def import_courses(cursor, file_path):
    print(f"Importing Courses from {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        # Schema: id, created_at, deleted, updated_at, final_price, instructor_id, language, long_description, 
        # original_price, progress_step, short_description, status, thumbnail_url, title, category_id, 
        # introductory_video, rating, reason
        
        sql = """
        INSERT INTO courses (
            id, created_at, deleted, updated_at, final_price, instructor_id, language, 
            long_description, original_price, progress_step, short_description, status, 
            thumbnail_url, title, category_id, introductory_video, rating
        ) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE title=VALUES(title)
        """
        data = []
        for row in reader:
            deleted = 1 if row.get('deleted') == 'True' or row.get('deleted') == '1' else 0
            
            # Defaults
            final_price = float(row.get('final_price', 194000.0))
            original_price = float(row.get('original_price', 300000.0))
            language = 'en'
            progress_step = 'COMPLETED'
            status = 'PUBLISHED'
            long_description = row['short_description'][:255] if row['short_description'] else None # Default long to short, truncated
            short_description = row['short_description'][:255] if row['short_description'] else None

            data.append((
                row['id'], row['created_at'], deleted, row['updated_at'], 
                final_price, row['instructor_id'], language, 
                long_description, original_price, progress_step, 
                short_description, status, row['thumbnail_url'], 
                row['title'], row['category_id'], row['introductory_video'], row['rating']
            ))
        
        cursor.executemany(sql, data)
        print(f"Inserted {cursor.rowcount} courses.")

def import_course_tags(cursor, file_path):
    print(f"Importing Course Tags from {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        # Schema: id, course_id, tag_id
        sql = """
        INSERT IGNORE INTO course_tag (id, course_id, tag_id) 
        VALUES (%s, %s, %s)
        """
        data = []
        for row in reader:
            data.append((row['id'], row['course_id'], row['tag_id']))
        
        cursor.executemany(sql, data)
        print(f"Inserted {cursor.rowcount} course-tag relations.")

def import_course_outcomes(cursor, file_path):
    print(f"Importing Course Outcomes from {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        sql = """
        INSERT INTO course_outcomes (id, course_id, outcome) 
        VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE outcome=VALUES(outcome)
        """
        data = []
        for row in reader:
            data.append((row['id'], row['course_id'], row['outcome']))
        
        cursor.executemany(sql, data)
        print(f"Inserted {cursor.rowcount} course outcomes.")

def import_course_requirements(cursor, file_path):
    print(f"Importing Course Requirements from {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        sql = """
        INSERT INTO course_requirements (id, course_id, requirement) 
        VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE requirement=VALUES(requirement)
        """
        data = []
        for row in reader:
            data.append((row['id'], row['course_id'], row['requirement']))
        
        cursor.executemany(sql, data)
        print(f"Inserted {cursor.rowcount} course requirements.")

def import_chapters(cursor, file_path):
    print(f"Importing Chapters from {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        sql = """
        INSERT INTO chapters (id, created_at, deleted, updated_at, description, is_open, position, title, course_id) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE title=VALUES(title)
        """
        data = []
        for row in reader:
            deleted = 1 if row.get('deleted') == 'True' or row.get('deleted') == '1' else 0
            is_open = 1 if row.get('is_open') == 'True' or row.get('is_open') == '1' else 0
            
            data.append((
                row['id'], row['created_at'], deleted, row['updated_at'], 
                row['description'], is_open, row['position'], 
                row['title'], row['course_id']
            ))
        
        cursor.executemany(sql, data)
        print(f"Inserted {cursor.rowcount} chapters.")

def import_lessons(cursor, file_path):
    print(f"Importing Lessons from {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        sql = """
        INSERT INTO lessons (id, created_at, deleted, updated_at, content, duration, is_public, position, title, type, url, chapter_id) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE title=VALUES(title)
        """
        data = []
        for row in reader:
            deleted = 1 if row.get('deleted') == 'True' or row.get('deleted') == '1' else 0
            is_public = 1 if row.get('is_public') == 'True' or row.get('is_public') == '1' else 0
            
            data.append((
                row['id'], row['created_at'], deleted, row['updated_at'], 
                row['content'], row['duration'], is_public, 
                row['position'], row['title'], row['type'], 
                row['url'], row['chapter_id']
            ))
        
        cursor.executemany(sql, data)
        print(f"Inserted {cursor.rowcount} lessons.")

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_root = os.path.abspath(os.path.join(script_dir, '..', '..'))
    
    # Files
    users_csv = os.path.join(data_root, 'data', 'normalized', 'users.csv')
    categories_csv = os.path.join(data_root, 'data', 'normalized', 'categories.csv')
    tags_csv = os.path.join(data_root, 'data', 'normalized', 'tags.csv')
    courses_csv = os.path.join(data_root, 'data', 'normalized', 'courses.csv')
    course_tags_csv = os.path.join(data_root, 'data', 'normalized', 'course_tag.csv')
    course_outcomes_csv = os.path.join(data_root, 'data', 'normalized', 'course_outcomes.csv')
    course_requirements_csv = os.path.join(data_root, 'data', 'normalized', 'course_requirements.csv')
    chapters_csv = os.path.join(data_root, 'data', 'normalized', 'chapters.csv')
    lessons_csv = os.path.join(data_root, 'data', 'normalized', 'lessons.csv')
    
    # Schemas
    user_schema = os.path.join(data_root, 'backup', 'user_service_schema.sql')
    course_schema = os.path.join(data_root, 'backup', 'course_service_schema.sql')

    try:
        conn = connect_db()
        cursor = conn.cursor()
        
        # 1. Setup User Service
        print("--- Setting up User Service ---")
        cursor.execute("CREATE DATABASE IF NOT EXISTS user_service")
        cursor.execute("USE user_service")
        
        # Execute Schema if table doesn't exist (approximation: just run dump, it has IF EXISTS drops usually)
        # But wait, dumps usually recreate tables. This effectively resets data if we run it.
        # This is good for "importing normalized data" to have a clean state.
        execute_sql_file(cursor, user_schema)
        
        # Import Users
        import_users(cursor, users_csv)
        conn.commit()
        
        # 2. Setup Course Service
        print("\n--- Setting up Course Service ---")
        cursor.execute("CREATE DATABASE IF NOT EXISTS course_service")
        cursor.execute("USE course_service")
        
        execute_sql_file(cursor, course_schema)
        
        # Import Categories & Tags (Foreign Keys for Courses)
        import_categories(cursor, categories_csv)
        import_tags(cursor, tags_csv)
        conn.commit()
        
        # Import Courses
        import_courses(cursor, courses_csv)
        conn.commit()
        
        # Import Course Tags (Junction)
        import_course_tags(cursor, course_tags_csv)
        conn.commit()

        # Import Course Outcomes & Requirements
        import_course_outcomes(cursor, course_outcomes_csv)
        import_course_requirements(cursor, course_requirements_csv)
        conn.commit()

        # Import Chapters & Lessons
        import_chapters(cursor, chapters_csv)
        import_lessons(cursor, lessons_csv)
        conn.commit()
        
        print("\n--- Import Complete ---")
        
    except mysql.connector.Error as err:
        print(f"Database Error: {err}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    main()
