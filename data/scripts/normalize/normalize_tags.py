import csv
import os
import uuid
import datetime

def normalize_tags_and_add_ids(input_courses_file, output_courses_file, output_tags_file, output_course_tags_file, output_outcomes_file, output_requirements_file, output_chapters_file, output_lessons_file):
    """
    1. Adds UUID 'id' to each course.
    2. Extracts 'tags' (split by comma) into a separate 'tags.csv'.
    3. Creates 'course_tag.csv' linking courses and tags.
    4. Generates 'course_outcomes.csv' and 'course_requirements.csv' based on tags.
    5. Generates 'chapters.csv' and 'lessons.csv' based on tags.
    6. Removes 'tags' column from courses data.
    7. Adds default timestamps.
    """
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')
    
    tags_map = {} # tag_name -> tag_id
    course_tags_relations = [] # list of dicts {id, course_id, tag_id}
    course_outcomes = [] # list of dicts {id, course_id, outcome}
    course_requirements = [] # list of dicts {id, course_id, requirement}
    chapters = []
    lessons = []
    
    updated_courses = []
    course_fieldnames = []

    try:
        with open(input_courses_file, 'r', encoding='utf-8') as infile:
            reader = csv.DictReader(infile)
            if not reader.fieldnames:
                print("Error: Empty file or no header found.")
                return
            
            # Determine new header for courses
            # We add 'id', 'created_at', 'deleted', 'updated_at'
            # We remove 'tags'
            original_fields = reader.fieldnames
            course_fieldnames = ['id', 'created_at', 'deleted', 'updated_at'] + [f for f in original_fields if f != 'tags']
            
            for row in reader:
                # Generate Course ID
                course_id = str(uuid.uuid4())
                
                # Process Tags
                tags_str = row.get('tags', '')
                if tags_str:
                    # Clean and split
                    # Some tags might be quoted or contain extra spaces?
                    # basic split by comma
                    tag_list = [t.strip() for t in tags_str.split(',') if t.strip()]
                    
                    for i, tag_name in enumerate(tag_list):
                        if tag_name not in tags_map:
                            tags_map[tag_name] = str(uuid.uuid4())
                        
                        tag_id = tags_map[tag_name]
                        
                        # Create Relation
                        course_tags_relations.append({
                            'id': str(uuid.uuid4()),
                            'course_id': course_id,
                            'tag_id': tag_id
                        })

                        # Generate Outcome and Requirement (Mock Logic)
                        # Outcome: "You will allow to skill [Tag]"
                        # Requirement: "Have basic knowledge about [Tag]"
                        course_outcomes.append({
                            'id': str(uuid.uuid4()),
                            'course_id': course_id,
                            'outcome': f"Nắm vững kiến thức và kỹ năng về {tag_name}"
                        })

                        course_requirements.append({
                            'id': str(uuid.uuid4()),
                            'course_id': course_id,
                            'requirement': f"Có tìm hiểu cơ bản về {tag_name}"
                        })

                        # Generate Chapter
                        chapter_id = str(uuid.uuid4())
                        chapters.append({
                            'id': chapter_id,
                            'created_at': timestamp,
                            'deleted': 0,
                            'updated_at': timestamp,
                            'description': f"Chương về {tag_name}",
                            'is_open': 1,
                            'position': i + 1,
                            'title': f"Tìm hiểu về: {tag_name}",
                            'course_id': course_id
                        })

                        # Generate Lesson 1
                        lessons.append({
                            'id': str(uuid.uuid4()),
                            'created_at': timestamp,
                            'deleted': 0,
                            'updated_at': timestamp,
                            'content': f"Nội dung bài học về khái niệm {tag_name}",
                            'duration': 600, # 10 minutes
                            'is_public': 1,
                            'position': 1,
                            'title': f"Các khái niệm về {tag_name}",
                            'type': 'video',
                            'url': "https://core-learnova.t9tieanh.io.vn/api/v1/learning/storage/1774779780632-YTDown.com_YouTube_The-Only-Docker-Tutorial-You-Need-To-Get_Media_DQdB7wFEygo_001_1080p.mp4",
                            'chapter_id': chapter_id
                        })

                        # Generate Lesson 2
                        lessons.append({
                            'id': str(uuid.uuid4()),
                            'created_at': timestamp,
                            'deleted': 0,
                            'updated_at': timestamp,
                            'content': f"Nội dung bài học ôn tập về {tag_name}",
                            'duration': 0,
                            'is_public': 0,
                            'position': 2,
                            'title': f"Ôn tập về {tag_name}",
                            'type': 'article', 
                            'url': "https://core-learnova.t9tieanh.io.vn/api/v1/learning/storage/1774780585454-Chuong04.pdf",
                            'chapter_id': chapter_id
                        })

                # Prepare updated course row
                new_row = {
                    'id': course_id,
                    'created_at': timestamp,
                    'deleted': 0,
                    'updated_at': timestamp
                }
                for k, v in row.items():
                    if k != 'tags':
                        new_row[k] = v
                
                updated_courses.append(new_row)

        # Write Tags CSV
        tags_header = ['id', 'created_at', 'deleted', 'updated_at', 'image_url', 'name']
        with open(output_tags_file, 'w', encoding='utf-8', newline='') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=tags_header)
            writer.writeheader()
            for i, (name, t_id) in enumerate(tags_map.items()):
                writer.writerow({
                    'id': t_id,
                    'created_at': timestamp,
                    'deleted': 0,
                    'updated_at': timestamp,
                    'image_url': f"https://picsum.photos/seed/tag_{i+1:04d}/320/240", 
                    'name': name
                })
        print(f"Extracted {len(tags_map)} tags to: {output_tags_file}")

        # Write Course_Tag CSV
        course_tag_header = ['id', 'course_id', 'tag_id']
        with open(output_course_tags_file, 'w', encoding='utf-8', newline='') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=course_tag_header)
            writer.writeheader()
            writer.writerows(course_tags_relations)
        print(f"Created {len(course_tags_relations)} course-tag relations to: {output_course_tags_file}")
        
        # Write Course Outcomes CSV
        outcomes_header = ['id', 'course_id', 'outcome']
        with open(output_outcomes_file, 'w', encoding='utf-8', newline='') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=outcomes_header)
            writer.writeheader()
            writer.writerows(course_outcomes)
        print(f"Created {len(course_outcomes)} course outcomes to: {output_outcomes_file}")

        # Write Course Requirements CSV
        requirements_header = ['id', 'course_id', 'requirement']
        with open(output_requirements_file, 'w', encoding='utf-8', newline='') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=requirements_header)
            writer.writeheader()
            writer.writerows(course_requirements)
        print(f"Created {len(course_requirements)} course requirements to: {output_requirements_file}")

        # Write Chapters CSV
        # Schema: id, created_at, deleted, updated_at, description, is_open, position, title, course_id
        chapters_header = ['id', 'created_at', 'deleted', 'updated_at', 'description', 'is_open', 'position', 'title', 'course_id']
        with open(output_chapters_file, 'w', encoding='utf-8', newline='') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=chapters_header)
            writer.writeheader()
            writer.writerows(chapters)
        print(f"Created {len(chapters)} chapters to: {output_chapters_file}")

        # Write Lessons CSV
        # Schema: id, created_at, deleted, updated_at, content, duration, is_public, position, title, type, url, chapter_id
        lessons_header = ['id', 'created_at', 'deleted', 'updated_at', 'content', 'duration', 'is_public', 'position', 'title', 'type', 'url', 'chapter_id']
        with open(output_lessons_file, 'w', encoding='utf-8', newline='') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=lessons_header)
            writer.writeheader()
            writer.writerows(lessons)
        print(f"Created {len(lessons)} lessons to: {output_lessons_file}")

        # Write Updated Courses CSV
        with open(output_courses_file, 'w', encoding='utf-8', newline='') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=course_fieldnames)
            writer.writeheader()
            writer.writerows(updated_courses)
        print(f"Updated {len(updated_courses)} courses (added IDs, removed tags) to: {output_courses_file}")


    except FileNotFoundError:
        print(f"Error: Input file not found at {input_courses_file}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_root = os.path.abspath(os.path.join(script_dir, '..', '..'))
    
    # Input is the output from previous step (normalized courses with category_id)
    # NOTE: Since normalize_tags modifies courses.csv in place or re-reads it, we should be careful.
    # The user workflow implies we read categories-normalized courses (without IDs yet, but with category_id)
    # BUT wait, the previous script 'normalize_categories.py' produced 'courses.csv' with 'category_id'.
    # This script adds 'id'. So INPUT should be the file that HAS category_id but NO id.
    
    # However, if we re-run this, we might be reading an already processed file?
    # The pipeline seems linear: 
    # 1. clean -> cleaned_courses.csv
    # 2. normalize_categories(cleaned_courses.csv) -> courses.csv (has cat_id)
    # 3. normalize_users(courses.csv) -> courses.csv (has user_id, cat_id) 
    # 4. normalize_tags(courses.csv) -> courses.csv (has id, user_id, cat_id, removed tags)
    
    # So we should technically read 'courses.csv' (output of normalize_users)
    input_courses_path = os.path.join(data_root, 'data', 'normalized', 'courses.csv')
    
    output_courses_path = os.path.join(data_root, 'data', 'normalized', 'courses.csv')
    output_tags_path = os.path.join(data_root, 'data', 'normalized', 'tags.csv')
    output_course_tags_path = os.path.join(data_root, 'data', 'normalized', 'course_tag.csv')
    output_outcomes_path = os.path.join(data_root, 'data', 'normalized', 'course_outcomes.csv')
    output_requirements_path = os.path.join(data_root, 'data', 'normalized', 'course_requirements.csv')
    output_chapters_path = os.path.join(data_root, 'data', 'normalized', 'chapters.csv')
    output_lessons_path = os.path.join(data_root, 'data', 'normalized', 'lessons.csv')
    
    print(f"Processing file: {input_courses_path}")
    
    normalize_tags_and_add_ids(input_courses_path, output_courses_path, output_tags_path, output_course_tags_path, output_outcomes_path, output_requirements_path, output_chapters_path, output_lessons_path)
