import csv
import os
import uuid
import random
from datetime import datetime, timedelta
from mock_data import FEEDBACK_TEMPLATES

def generate_object_id():
    """Generates a random 24-character hex string representing a MongoDB ObjectId."""
    return uuid.uuid4().hex[:24]

# Step 1: Get 10 users from the existing user list to use as reviewers
def get_feedback_users(users_csv):
    try:
        with open(users_csv, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            users = list(reader)
            
        if len(users) >= 10:
            return users[:10]
        return users
    except FileNotFoundError:
        print(f"Error: Cannot find file {users_csv}.")
        return []

# Step 2: 10 feedback templates with rating and message are imported from mock_data

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_root = os.path.abspath(os.path.join(script_dir, '..', '..'))
    
    users_csv = os.path.join(data_root, 'data', 'normalized', 'users.csv')
    courses_csv = os.path.join(data_root, 'data', 'normalized', 'courses.csv')
    feedbacks_csv = os.path.join(data_root, 'data', 'normalized', 'feedbacks.csv')
    
    print("--- [STEP 1] Get 10 Feedback Users from normalized data ---")
    feedback_users = get_feedback_users(users_csv)
    if not feedback_users:
        return
        
    feedback_user_ids = [u['id'] for u in feedback_users]

    print("--- [STEP 2 & 3] Generate Mock Data for Feedback Collection ---")
    
    try:
        with open(courses_csv, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            courses = list(reader)
    except FileNotFoundError:
        print(f"Error: Cannot find file {courses_csv}.")
        return
        
    feedback_data = []
    base_time = datetime.now()
    
    for course in courses:
        course_id = course['id']
        course_created_at_str = course.get('created_at')
        
        # Get a random timestamp after the course was created
        try:
            course_time = datetime.strptime(course_created_at_str, '%Y-%m-%d %H:%M:%S.%f')
        except (ValueError, TypeError):
            course_time = base_time - timedelta(days=365)
            
        now_time = datetime.now()
        
        # Randomly pick 5 users from the 10 selected feedback users
        selected_users = random.sample(feedback_user_ids, 5)
        
        for uid in selected_users:
            template = random.choice(FEEDBACK_TEMPLATES)
            
            # Random time between course creation time and current time
            delta_seconds = int((now_time - course_time).total_seconds())
            if delta_seconds <= 0: 
                delta_seconds = 1
                
            random_second = random.randint(0, delta_seconds)
            comment_time = course_time + timedelta(seconds=random_second)
            
            feedback = {
                '_id': generate_object_id(),
                'userId': uid,
                'courseId': course_id,
                'rating': template['rating'],
                'message': template['message'],
                'createdAt': comment_time.strftime('%Y-%m-%d %H:%M:%S.%f'),
                'updatedAt': comment_time.strftime('%Y-%m-%d %H:%M:%S.%f')
            }
            feedback_data.append(feedback)
            
    print(f"Writing {len(feedback_data)} feedback records to {feedbacks_csv}...")
    
    with open(feedbacks_csv, 'w', encoding='utf-8', newline='') as f:
        fieldnames = ['_id', 'userId', 'courseId', 'rating', 'message', 'createdAt', 'updatedAt']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(feedback_data)
        
    print("Feedback mock data generation completed!")

if __name__ == "__main__":
    main()