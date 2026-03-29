import csv
import os
import uuid
import json

def generate_object_id():
    """Generates a random 24-character hex string representing a MongoDB ObjectId."""
    return uuid.uuid4().hex[:24]

def generate_blog_content(title, desc):
    """Generates an HTML content string for the blog."""
    paragraphs = [
        f"<h3>Tổng quan về {title}</h3>",
        f"<p class='lead'>{desc}</p>",
        "<br/>",
        "<h4>Tại sao nội dung này lại quan trọng?</h4>",
        "<p>Bài viết này được thiết kế để cung cấp cho bạn những góc nhìn thực tế, đi sâu vào các khái niệm cốt lõi, giúp bạn tiếp cận kiến thức một cách dễ dàng và hiệu quả nhất. Đừng bỏ lỡ cơ hội nâng cao kỹ năng của mình thông qua những chia sẻ từ chuyên gia trong ngành.</p>",
        "<blockquote><p>\"Đầu tư vào tri thức luôn mang lại lợi nhuận cao nhất.\" - Benjamin Franklin</p></blockquote>",
        "<h4>Những điều bạn sẽ đạt được:</h4>",
        "<ul>",
        "  <li><strong>Cập nhật xu hướng:</strong> Bổ sung kiến thức chuyên môn mới nhất.</li>",
        "  <li><strong>Thực chiến:</strong> Thực hành sát với các dự án thực tế thông qua các case study.</li>",
        "  <li><strong>Tối ưu hóa:</strong> Nắm bắt các tips & tricks để làm việc hiệu quả và nhân mức năng suất.</li>",
        "</ul>",
        "<br/>",
        "<h4>Kết luận</h4>",
        "<p>Hành trình học tập không bao giờ dừng lại. Hãy tiếp tục theo dõi seri blog của hệ thống để cập nhật thêm nhiều bài học, tài liệu độc quyền và thông tin ưu đãi hấp dẫn nhé. Chúc bạn thành công!</p>"
    ]
    return "".join(paragraphs)

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_root = os.path.abspath(os.path.join(script_dir, '..', '..'))
    
    input_csv = os.path.join(data_root, 'data', 'normalized', 'courses.csv')
    output_dir = os.path.join(data_root, 'data', 'normalized')
    output_csv = os.path.join(output_dir, 'blogs.csv')
    
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Reading {input_csv}...")
    try:
        with open(input_csv, 'r', encoding='utf-8') as infile:
            reader = csv.DictReader(infile)
            rows = list(reader)
    except FileNotFoundError:
        print(f"Error: {input_csv} not found.")
        return

    blogs_data = []

    for idx, row in enumerate(rows, start=1):
        base_img = row.get('thumbnail_url', '')
        
        # Modify the image slightly to make it look like a blog cover
        if "picsum.photos" in base_img:
            # Change the seed to get a different image cover
            img_url = base_img.replace(f"course_{idx:04d}", f"blog_{idx:04d}").replace("1280/720", "1200/630")
        else:
            img_url = base_img
            
        created_at = row.get('created_at', None)
        title = row.get('title', 'No Title')
        short_desc = row.get('short_description', '')

        blog = {
            '_id': generate_object_id(),
            'instructor_id': row.get('instructor_id', ''),
            'title': f"Khám phá: {title}",
            'image_url': img_url,
            'content': generate_blog_content(title, short_desc),
            'markdown_file_url': json.dumps([]),
            'createdAt': created_at,
            'updatedAt': created_at,
            '__v': 0
        }
        blogs_data.append(blog)

    print(f"Writing {len(blogs_data)} blogs to {output_csv}...")
    if blogs_data:
        fieldnames = blogs_data[0].keys()
        with open(output_csv, 'w', encoding='utf-8', newline='') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=fieldnames)
            writer.writeheader()
            for blog in blogs_data:
                writer.writerow(blog)
                
    print("Done!")

if __name__ == "__main__":
    main()
