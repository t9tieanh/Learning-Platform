import csv
import os
import random
from collections import defaultdict

EXPERTISE_TARGET = 5
EXPERTISE_VARIANCE = 2
EXPERTISE_MIN = EXPERTISE_TARGET - EXPERTISE_VARIANCE  # 3
EXPERTISE_MAX = EXPERTISE_TARGET + EXPERTISE_VARIANCE  # 7
EXPERTISE_RANDOM_SEED = 42

def normalize_expertise(normalized_dir):
    courses_file = os.path.join(normalized_dir, 'courses.csv')
    tags_file = os.path.join(normalized_dir, 'tags.csv')
    course_tag_file = os.path.join(normalized_dir, 'course_tag.csv')
    
    output_expertise_file = os.path.join(normalized_dir, 'expertise.csv')
    output_user_expertise_file = os.path.join(normalized_dir, 'user_expertise.csv')

    print(f"Normalizing expertise from {normalized_dir}...")

    # 1. Load course_id -> instructor_id
    course_instructor = {}
    try:
        with open(courses_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                course_instructor[row['id']] = row['instructor_id']
    except Exception as e:
        print(f"Error loading courses: {e}")
        return

    # 2. Load tag_id -> tag_data (name, image_url)
    tags_data = {}
    try:
        with open(tags_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                tags_data[row['id']] = {
                    'name': row['name'],
                    'image': row.get('image_url', '')
                }
    except Exception as e:
        print(f"Error loading tags: {e}")
        return

    # 3. Process course_tag to link instructor to expertise
    user_expertise_set = set() # (user_id, tag_id)
    
    try:
        with open(course_tag_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                course_id = row['course_id']
                tag_id = row['tag_id']
                
                instructor_id = course_instructor.get(course_id)
                if instructor_id:
                    user_expertise_set.add((instructor_id, tag_id))
    except Exception as e:
        print(f"Error loading course_tag: {e}")
        return

    # 4. Limit each user to ~5 ± 2 expertise
    user_tags = defaultdict(set)
    for user_id, tag_id in user_expertise_set:
        user_tags[user_id].add(tag_id)

    rng = random.Random(EXPERTISE_RANDOM_SEED)
    limited_user_expertise = set()
    for user_id, tag_ids in user_tags.items():
        tags = list(tag_ids)
        target = rng.randint(EXPERTISE_MIN, EXPERTISE_MAX)
        count = min(len(tags), target)
        for tag_id in rng.sample(tags, count):
            limited_user_expertise.add((user_id, tag_id))

    print(f"Limited user expertise to {EXPERTISE_MIN}-{EXPERTISE_MAX} per user ({len(limited_user_expertise)} relations)")

    # 5. Write expertise.csv
    # Schema: id, image, name
    expertise_header = ['id', 'image', 'name']
    with open(output_expertise_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=expertise_header)
        writer.writeheader()
        for tag_id, data in tags_data.items():
            writer.writerow({
                'id': tag_id,
                'image': data['image'],
                'name': data['name']
            })
    print(f"Created {len(tags_data)} expertise entries in: {output_expertise_file}")

    # 6. Write user_expertise.csv
    # Schema: user_id, expertise_id
    user_expertise_header = ['user_id', 'expertise_id']
    with open(output_user_expertise_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=user_expertise_header)
        writer.writeheader()
        for user_id, tag_id in limited_user_expertise:
            writer.writerow({
                'user_id': user_id,
                'expertise_id': tag_id
            })
    print(f"Created {len(limited_user_expertise)} user-expertise relations in: {output_user_expertise_file}")

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_root = os.path.abspath(os.path.join(script_dir, '..', '..'))
    normalized_dir = os.path.join(data_root, 'data', 'normalized')
    
    normalize_expertise(normalized_dir)
