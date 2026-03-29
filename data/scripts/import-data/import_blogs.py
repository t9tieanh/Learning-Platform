import csv
import os
import sys
import json
from datetime import datetime
from pathlib import Path
try:
    from pymongo import MongoClient
    from bson.objectid import ObjectId
except ImportError:
    print("Error: 'pymongo' library is not installed.")
    print("Please install it by running: pip install pymongo")
    exit(1)

SCRIPT_ROOT = Path(__file__).resolve().parents[1]
if str(SCRIPT_ROOT) not in sys.path:
    sys.path.insert(0, str(SCRIPT_ROOT))

from utils import load_env

script_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.abspath(os.path.join(script_dir, '..', '..'))
env_path = os.path.join(data_dir, '.env')
load_env([env_path])

# You can override this in your .env or export it.
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
DB_NAME = os.getenv('MONGO_DB_NAME', 'learning_platform')

def main():
    blogs_csv = os.path.join(data_dir, 'data', 'normalized', 'blogs.csv')
    
    if not os.path.exists(blogs_csv):
        print(f"Error: {blogs_csv} not found.")
        print("Please run the normalization script for blogs first.")
        return

    print(f"Connecting to MongoDB at {MONGO_URI} ...")
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        # Trigger connection check
        client.admin.command('ping')
        print("Connected successfully!")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        return

    db = client[DB_NAME]
    blogs_collection = db["blogs"]

    print("Dropping existing blogs collection to ensure clean import...")
    blogs_collection.drop()

    print(f"Reading {blogs_csv}...")
    documents = []
    
    with open(blogs_csv, 'r', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)
        for row in reader:
            # Parse dates
            created_at = row.get('createdAt')
            if created_at:
                try:
                    created_at = datetime.strptime(created_at, '%Y-%m-%d %H:%M:%S.%f')
                except ValueError:
                    pass
            updated_at = row.get('updatedAt')
            if updated_at:
                try:
                    updated_at = datetime.strptime(updated_at, '%Y-%m-%d %H:%M:%S.%f')
                except ValueError:
                    pass

            # Parse JSON array for markdown_file_url
            markdown_files = []
            if row.get('markdown_file_url'):
                try:
                    markdown_files = json.loads(row['markdown_file_url'])
                except json.JSONDecodeError:
                    pass

            doc = {
                "_id": ObjectId(row['_id']) if row.get('_id') else None,
                "instructor_id": row['instructor_id'],
                "title": row['title'],
                "image_url": row['image_url'],
                "content": row['content'],
                "markdown_file_url": markdown_files,
                "createdAt": created_at,
                "updatedAt": updated_at,
                "__v": int(row.get('__v', 0))
            }
            documents.append(doc)

    if documents:
        print(f"Importing {len(documents)} documents into {DB_NAME}.blogs ...")
        # Use ordered=False to continue inserting even if some _id already exist
        try:
            result = blogs_collection.insert_many(documents, ordered=False)
            print(f"Successfully inserted {len(result.inserted_ids)} blogs.")
        except Exception as e:
            # If some records already exist, it will throw a BulkWriteError but insert the others
            print(f"Import finished with some warnings/errors: {e}")
    else:
        print("No documents to import.")

if __name__ == "__main__":
    main()
