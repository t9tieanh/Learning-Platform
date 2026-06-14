import csv
import json
import os
from collections import defaultdict

BASE_URL = "https://learnova.t9tieanh.io.vn/course"
OUTPUT_HEADERS = ['id', 'name', 'description', 'tags', 'link', 'content', 'metadata']


def load_categories(categories_file):
    categories = {}
    with open(categories_file, 'r', encoding='utf-8') as f:
        for row in csv.DictReader(f):
            category_id = row.get('id', '').strip()
            if not category_id:
                continue
            categories[category_id] = {
                'id': category_id,
                'name': row.get('name', '').strip(),
                'description': row.get('description', '').strip(),
            }
    return categories


def load_id_name_map(file_path, id_field='id', name_field='name'):
    mapping = {}
    with open(file_path, 'r', encoding='utf-8') as f:
        for row in csv.DictReader(f):
            row_id = row.get(id_field, '').strip()
            row_name = row.get(name_field, '').strip()
            if row_id and row_name:
                mapping[row_id] = row_name
    return mapping


def load_course_tags(course_tag_file, tag_names):
    course_tags = defaultdict(list)
    with open(course_tag_file, 'r', encoding='utf-8') as f:
        for row in csv.DictReader(f):
            course_id = row.get('course_id', '').strip()
            tag_id = row.get('tag_id', '').strip()
            tag_name = tag_names.get(tag_id)
            if course_id and tag_name:
                course_tags[course_id].append(tag_name)
    return course_tags


def build_metadata(category, rating, instructors, final_price, original_price, thumbnail_url, tags_array):
    metadata = {
        'category': category,
        'rating': float(rating) if rating else None,
        'instructors': instructors,
        'final_price': int(final_price) if final_price else None,
        'original_price': int(original_price) if original_price else None,
        'thumbnail_url': thumbnail_url,
        'tags': tags_array,
        'tag_count': len(tags_array),
        'discount_percentage': None,
    }

    if final_price and original_price:
        try:
            discount = ((int(original_price) - int(final_price)) / int(original_price)) * 100
            metadata['discount_percentage'] = round(discount, 2)
        except (ValueError, ZeroDivisionError):
            pass

    return metadata


def normalize_courses_for_supabase(normalized_dir, output_file):
    """
    Build Supabase course_embeddings CSV from normalized courses.csv.

    Schema:
    - id: UUID (from courses.csv)
    - name: text (from title)
    - description: text (from short_description)
    - tags: text[] (from course_tag + tags)
    - link: text (https://learnova.t9tieanh.io.vn/course/{id})
    - content: text (empty)
    - metadata: jsonb (category object, rating, instructors, prices, thumbnail, tags, tag_count)
    """
    courses_file = os.path.join(normalized_dir, 'courses.csv')
    categories_file = os.path.join(normalized_dir, 'categories.csv')
    users_file = os.path.join(normalized_dir, 'users.csv')
    tags_file = os.path.join(normalized_dir, 'tags.csv')
    course_tag_file = os.path.join(normalized_dir, 'course_tag.csv')

    categories = load_categories(categories_file)
    instructor_names = load_id_name_map(users_file)
    tag_names = load_id_name_map(tags_file)
    course_tags = load_course_tags(course_tag_file, tag_names)

    rows_processed = 0

    with open(courses_file, 'r', encoding='utf-8') as infile, \
         open(output_file, 'w', encoding='utf-8', newline='') as outfile:
        reader = csv.DictReader(infile)
        writer = csv.DictWriter(outfile, fieldnames=OUTPUT_HEADERS)
        writer.writeheader()

        for row in reader:
            course_id = row.get('id', '').strip()
            title = row.get('title', '').strip()
            short_description = row.get('short_description', '').strip()

            if not course_id or not title or not short_description:
                continue

            category_id = row.get('category_id', '').strip()
            instructor_id = row.get('instructor_id', '').strip()
            rating = row.get('rating', '').strip()
            thumbnail_url = row.get('thumbnail_url', '').strip()
            final_price = row.get('final_price', '').strip()
            original_price = row.get('original_price', '').strip()

            tags_array = course_tags.get(course_id, [])
            category = categories.get(category_id, {
                'id': category_id or None,
                'name': '',
                'description': '',
            })
            metadata = build_metadata(
                category=category,
                rating=rating,
                instructors=instructor_names.get(instructor_id, ''),
                final_price=final_price,
                original_price=original_price,
                thumbnail_url=thumbnail_url,
                tags_array=tags_array,
            )

            writer.writerow({
                'id': course_id,
                'name': title,
                'description': short_description,
                'tags': json.dumps(tags_array),
                'link': f"{BASE_URL}/{course_id}",
                'content': '',
                'metadata': json.dumps(metadata),
            })
            rows_processed += 1

    print(f"Successfully processed {rows_processed} rows.")
    print(f"Normalized Supabase data saved to: {output_file}")


if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_root = os.path.abspath(os.path.join(script_dir, '..', '..'))
    normalized_dir = os.path.join(data_root, 'data', 'normalized')
    output_csv_path = os.path.join(normalized_dir, 'courses_for_supabase.csv')
    courses_csv_path = os.path.join(normalized_dir, 'courses.csv')

    os.makedirs(os.path.dirname(output_csv_path), exist_ok=True)

    print(f"Input file: {courses_csv_path}")
    print(f"Output file: {output_csv_path}")

    try:
        normalize_courses_for_supabase(normalized_dir, output_csv_path)
    except FileNotFoundError as e:
        print(f"Error: Required file not found: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")
