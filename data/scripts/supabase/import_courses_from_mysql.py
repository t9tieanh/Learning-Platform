import os
import sys
import json
import psycopg2
import mysql.connector
from contextlib import contextmanager
from pathlib import Path
from datetime import datetime

# Add utils to path for importing
sys.path.insert(0, str(Path(__file__).parent.parent / 'utils'))
from env_loader import load_env

# Load environment variables
script_dir = Path(__file__).parent
data_root = script_dir.parent.parent
load_env()

# ============================================
# MYSQL Configuration (Course Service Source)
# ============================================
MYSQL_HOST = os.getenv('DB_HOST', 'localhost')
MYSQL_USER = os.getenv('DB_USER', 'avnadmin')
MYSQL_PASSWORD = os.getenv('DB_PASSWORD', '')
MYSQL_PORT = int(os.getenv('DB_PORT', '3307'))
MYSQL_DATABASE = os.getenv('MYSQL_DATABASE', 'course_service')

# ============================================
# SUPABASE Configuration (Destination)
# ============================================
SUPABASE_CONNECTION_STRING = os.getenv('DB_CONNECTION_STRING', '')

if not SUPABASE_CONNECTION_STRING:
    raise ValueError(
        "Missing Supabase configuration. Set DB_CONNECTION_STRING in .env file.\n"
        "Format: postgresql://user:password@host:port/dbname"
    )

@contextmanager
def get_mysql_connection():
    """Context manager for MySQL connection"""
    conn = None
    try:
        conn = mysql.connector.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            port=MYSQL_PORT,
            database=MYSQL_DATABASE,
            autocommit=False
        )
        yield conn
        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            conn.close()

@contextmanager
def get_supabase_connection():
    """Context manager for Supabase connection"""
    conn = None
    try:
        conn = psycopg2.connect(SUPABASE_CONNECTION_STRING)
        yield conn
        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            conn.close()

def fetch_courses_from_mysql():
    """
    Fetch courses from MySQL course_service database.

    Returns:
        list: List of course dictionaries
    """
    print(f"Connecting to MySQL: {MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}...")

    courses = []

    try:
        with get_mysql_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # Fetch courses with basic info
            query = """
            SELECT
                id,
                title as name,
                short_description as description,
                long_description as content,
                original_price,
                final_price,
                status,
                instructor_id,
                created_at,
                rating,
                thumbnail_url
            FROM courses
            WHERE deleted = 0 AND status IN ('PUBLISHED', 'PENDING_REVIEW')
            ORDER BY created_at DESC
            """

            cursor.execute(query)
            courses = cursor.fetchall()

            print(f"✅ Fetched {len(courses)} courses from MySQL")

            cursor.close()

    except mysql.connector.Error as e:
        print(f"❌ MySQL error: {e}")
        raise
    except Exception as e:
        print(f"❌ Error connecting to MySQL: {e}")
        raise

    return courses

def transform_course_data(courses):
    """
    Transform MySQL course data to Supabase format.

    Args:
        courses (list): List of course dictionaries from MySQL

    Returns:
        list: Transformed courses ready for Supabase
    """
    print("Transforming course data...")

    transformed = []

    for course in courses:
        try:
            # Convert MySQL None/null to appropriate values
            course_id = str(course.get('id', ''))
            name = course.get('name', '') or 'Untitled Course'
            description = course.get('description', '') or ''
            content = course.get('content', '') or ''

            # Combine description and content for better RAG
            full_content = f"{description}\n\n{content}".strip()

            # Generate tags from status and price
            tags = []
            if course.get('status') == 'PUBLISHED':
                tags.append('published')
            if course.get('rating') and course.get('rating') > 4:
                tags.append('highly-rated')
            if course.get('final_price', 0) == 0:
                tags.append('free')
            elif course.get('final_price', 0) < 50000:
                tags.append('affordable')

            # Build metadata
            metadata = {
                'course_id': course_id,
                'instructor_id': course.get('instructor_id', ''),
                'status': course.get('status', ''),
                'original_price': float(course.get('original_price') or 0),
                'final_price': float(course.get('final_price') or 0),
                'rating': float(course.get('rating') or 0),
                'thumbnail_url': course.get('thumbnail_url', ''),
                'created_at': course.get('created_at').isoformat() if course.get('created_at') else None,
                'sync_timestamp': datetime.now().isoformat()
            }

            # Link to course (can be customized)
            link = f"/course/{course_id}"

            transformed_course = {
                'id': course_id,
                'name': name,
                'description': description,
                'tags': tags,
                'link': link,
                'content': full_content,
                'metadata': metadata
            }

            transformed.append(transformed_course)

        except Exception as e:
            print(f"⚠️  Warning: Error transforming course {course.get('id')}: {e}")
            continue

    print(f"✅ Transformed {len(transformed)} courses")
    return transformed

def import_to_supabase(courses):
    """
    Import transformed courses to Supabase course_embeddings table.

    Args:
        courses (list): List of transformed course dictionaries
    """
    print(f"Importing {len(courses)} courses to Supabase...")

    try:
        with get_supabase_connection() as conn:
            cursor = conn.cursor()

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

            for course in courses:
                try:
                    rows_to_insert.append((
                        course['id'],
                        course['name'],
                        course['description'],
                        course['tags'],
                        course['link'],
                        course['content'],
                        json.dumps(course['metadata'])
                    ))
                except Exception as e:
                    print(f"⚠️  Warning: Error preparing course {course.get('id')}: {e}")
                    continue

            # Bulk insert
            if rows_to_insert:
                cursor.executemany(insert_sql, rows_to_insert)
                print(f"✅ Inserted {cursor.rowcount} courses into Supabase course_embeddings table")
            else:
                print("❌ No rows to insert")

            cursor.close()

    except psycopg2.Error as e:
        print(f"❌ Supabase database error: {e}")
        raise
    except Exception as e:
        print(f"❌ Error importing to Supabase: {e}")
        raise

def main():
    """Main execution function"""
    print("=" * 60)
    print("Importing Courses: MySQL → Supabase")
    print("=" * 60)
    print()

    try:
        # Step 1: Fetch from MySQL
        print("[1/3] Fetching courses from MySQL course_service...")
        print(f"      Host: {MYSQL_HOST}:{MYSQL_PORT}")
        print(f"      Database: {MYSQL_DATABASE}")
        print(f"      User: {MYSQL_USER}")
        print()

        courses = fetch_courses_from_mysql()
        print()

        # Step 2: Transform data
        print("[2/3] Transforming data...")
        transformed_courses = transform_course_data(courses)
        print()

        # Step 3: Import to Supabase
        print("[3/3] Importing to Supabase...")
        print(f"      Connection: {SUPABASE_CONNECTION_STRING[:50]}...")
        print()

        import_to_supabase(transformed_courses)
        print()

        print("=" * 60)
        print("✅ Import completed successfully!")
        print("=" * 60)

    except Exception as e:
        print()
        print("=" * 60)
        print(f"❌ Import failed: {e}")
        print("=" * 60)
        sys.exit(1)

if __name__ == "__main__":
    main()
