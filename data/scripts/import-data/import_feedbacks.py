import csv
import os
import sys
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

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
# Using notification-service as default since Feedback model is there
DB_NAME = os.getenv('MONGO_DB_NAME', 'learning_platform')

def main():
    feedbacks_csv = os.path.join(data_dir, 'data', 'normalized', 'feedbacks.csv')
    
    if not os.path.exists(feedbacks_csv):
        print(f"Error: {feedbacks_csv} not found.")
        print("Please run the normalize_feedbacks.py script first.")
        return

    print(f"Connecting to MongoDB at {MONGO_URI} ...")
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        print("Connected successfully!")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        return

    db = client[DB_NAME]
    feedbacks_collection = db["feedbacks"]

    print("Dropping existing feedbacks collection to ensure clean import...")
    feedbacks_collection.drop()

    print(f"Reading {feedbacks_csv}...")
    documents = []
    
    with open(feedbacks_csv, 'r', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)
        for row in reader:
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

            doc = {
                "_id": ObjectId(row['_id']) if row.get('_id') else None,
                "userId": row['userId'],
                "courseId": row['courseId'],
                "rating": int(row['rating']),
                "message": row['message'],
                "createdAt": created_at,
                "updatedAt": updated_at
            }
            documents.append(doc)

    if documents:
        print(f"Importing {len(documents)} documents into {DB_NAME}.feedbacks ...")
        try:
            result = feedbacks_collection.insert_many(documents, ordered=False)
            print(f"Successfully inserted {len(result.inserted_ids)} feedbacks.")
        except Exception as e:
            print(f"Import finished with some warnings/errors: {e}")
            
        # Create Index as per Schema
        # FeedbackSchema.index({ courseId: 1, _id: -1 })
        print("Creating index for pagination { courseId: 1, _id: -1 }...")
        feedbacks_collection.create_index([("courseId", 1), ("_id", -1)])
        print("Done creating index.")
    else:
        print("No documents to import.")

if __name__ == "__main__":
    main()
