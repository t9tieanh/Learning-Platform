import csv
import os
import uuid
import datetime
import random
import time
from mock_data import VIETNAMESE_NAMES, POSITIONS

def normalize_users(input_courses_file, output_courses_file, output_users_file):
    """
    1. Extracts 'instructors' from courses.
    2. Creates 'users' table (instructors become users).
    3. Replaces 'instructors' name in courses with 'instructor_id' (which is user.id).
    4. Generates random user data (username, email, password, phone, position).
    """
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')

    users_map = {} # instructor_name -> user_id
    updated_courses = []
    course_fieldnames = []
    
    # Store user objects to write later
    users_data = []


    # 0. Generate 10 feedback users
    for i in range(10):
        users_data.append({
            'id': str(uuid.uuid4()),
            'description': f'Người học nhiệt huyết và tích cực số {i+1}',
            'email': f'student_feedback_{i+1}@gmail.com',
            'image': f'https://i.pravatar.cc/300?u=feedback_user_{i+1}',
            'name': VIETNAMESE_NAMES[i],
            'password': '$2a$10$K0xpqJczfZaDhN.eh9ZyQuMkyUZkWzj2qzi8nd0AQyeyNAkGnHYES', # password hash
            'phone': f'09876543{(i+1):02d}',
            'position': 'Learner',
            'status': 'ACTIVE',
            'username': f'student_feedback_{i+1}'
        })

    try:
        with open(input_courses_file, 'r', encoding='utf-8') as infile:
            reader = csv.DictReader(infile)
            if not reader.fieldnames:
                print("Error: Empty file or no header found.")
                return
            
            # Update course header: 'instructors' -> 'instructor_id'
            original_fields = reader.fieldnames
            course_fieldnames = [f if f != 'instructors' else 'instructor_id' for f in original_fields]
            
            for row in reader:
                instructor_name = row.get('instructors', '').strip()
                user_id = ''
                
                if instructor_name:
                    if instructor_name not in users_map:
                        user_id = str(uuid.uuid4())
                        users_map[instructor_name] = user_id
                        
                        # Generate User Data
                        # Username: name_timestamp
                        safe_name = "".join(c for c in instructor_name if c.isalnum()).lower()
                        ts_str = str(int(time.time() * 1000))[-6:] # last 6 digits of timestamp
                        username = f"{safe_name}_{ts_str}"
                        
                        email = f"{username}@example.com"
                        password = "$2a$10$K0xpqJczfZaDhN.eh9ZyQuMkyUZkWzj2qzi8nd0AQyeyNAkGnHYES"
                        phone = f"09{random.randint(10000000, 99999999)}"
                        position = random.choice(POSITIONS)
                        status = "ACTIVE"
                        
                        users_data.append({
                            'id': user_id,
                            'description': f"Instructor for courses. Experienced {position}.",
                            'email': email,
                            'image': f"https://i.pravatar.cc/300?u={username}", # Random avatar
                            'name': instructor_name,
                            'password': password,
                            'phone': phone,
                            'position': position,
                            'status': status,
                            'username': username
                        })
                    else:
                        user_id = users_map[instructor_name]
                
                # Update course row
                new_row = {}
                for k, v in row.items():
                    if k == 'instructors':
                        new_row['instructor_id'] = user_id
                    else:
                        new_row[k] = v
                updated_courses.append(new_row)

        # Write Users CSV
        # Schema: id, description, email, image, name, password, phone, position, status, username
        users_header = ['id', 'description', 'email', 'image', 'name', 'password', 'phone', 'position', 'status', 'username']
        with open(output_users_file, 'w', encoding='utf-8', newline='') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=users_header)
            writer.writeheader()
            writer.writerows(users_data)
            
        print(f"Extracted {len(users_data)} instructors/users to: {output_users_file}")

        # Write Updated Courses CSV
        with open(output_courses_file, 'w', encoding='utf-8', newline='') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=course_fieldnames)
            writer.writeheader()
            writer.writerows(updated_courses)
            
        print(f"Updated {len(updated_courses)} courses (instructors -> instructor_id) to: {output_courses_file}")

    except FileNotFoundError:
        print(f"Error: Input file not found at {input_courses_file}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_root = os.path.abspath(os.path.join(script_dir, '..', '..'))
    
    # Input is the output from previous step (normalized courses with tags removed)
    input_courses_path = os.path.join(data_root, 'data', 'normalized', 'courses.csv')
    
    # Outputs
    output_courses_path = os.path.join(data_root, 'data', 'normalized', 'courses.csv')
    output_users_path = os.path.join(data_root, 'data', 'normalized', 'users.csv')
    
    print(f"Processing file: {input_courses_path}")
    
    normalize_users(input_courses_path, output_courses_path, output_users_path)
