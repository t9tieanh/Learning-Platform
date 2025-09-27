-- Xóa dữ liệu cũ để tránh trùng lặp (nếu chạy lại)
DELETE FROM categories;
DELETE FROM tags;

-- Seed Categorys (20 rows)
INSERT INTO categories (id, name, description, created_at, updated_at) VALUES
(1, 'Web Development', 'Learn how to build modern websites', NOW(), NOW()),
(2, 'Mobile Apps', 'Build Android and iOS applications', NOW(), NOW()),
(3, 'Data Science', 'Data analysis and machine learning', NOW(), NOW()),
(4, 'Artificial Intelligence', 'AI concepts and deep learning', NOW(), NOW()),
(5, 'Cloud Computing', 'AWS, Azure, GCP fundamentals', NOW(), NOW()),
(6, 'Cyber Security', 'Protect systems and networks', NOW(), NOW()),
(7, 'Software Engineering', 'Principles of software development', NOW(), NOW()),
(8, 'Game Development', 'Learn to create 2D/3D games', NOW(), NOW()),
(9, 'Blockchain', 'Cryptocurrency and blockchain basics', NOW(), NOW()),
(10, 'DevOps', 'CI/CD pipelines and automation', NOW(), NOW()),
(11, 'UI/UX Design', 'Design beautiful and usable interfaces', NOW(), NOW()),
(12, 'Big Data', 'Work with large-scale data systems', NOW(), NOW()),
(13, 'IoT', 'Internet of Things applications', NOW(), NOW()),
(14, 'AR/VR', 'Augmented and Virtual Reality', NOW(), NOW()),
(15, 'Project Management', 'Agile, Scrum, Kanban', NOW(), NOW()),
(16, 'Digital Marketing', 'SEO, SEM, Social Media Ads', NOW(), NOW()),
(17, 'Database Systems', 'SQL, NoSQL, and optimization', NOW(), NOW()),
(18, 'Operating Systems', 'Linux, Windows, and system internals', NOW(), NOW()),
(19, 'Computer Networks', 'Networking basics and protocols', NOW(), NOW()),
(20, 'Programming Basics', 'Learn programming from scratch', NOW(), NOW());

-- Seed Tags (20 rows)
-- Seed Tags (20 rows với logo thật)
INSERT INTO tags (id, name, image_url, created_at, updated_at) VALUES
(1, 'Java', 'https://upload.wikimedia.org/wikipedia/en/3/30/Java_programming_language_logo.svg', NOW(), NOW()),
(2, 'Python', 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg', NOW(), NOW()),
(3, 'JavaScript', 'https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png', NOW(), NOW()),
(4, 'React', 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg', NOW(), NOW()),
(5, 'Spring Boot', 'https://upload.wikimedia.org/wikipedia/commons/4/44/Spring_Framework_Logo_2018.svg', NOW(), NOW()),
(6, 'Kotlin', 'https://upload.wikimedia.org/wikipedia/commons/7/74/Kotlin_Icon.png', NOW(), NOW()),
(7, 'Flutter', 'https://upload.wikimedia.org/wikipedia/commons/1/17/Google-flutter-logo.png', NOW(), NOW()),
(8, 'Node.js', 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg', NOW(), NOW()),
(9, 'Angular', 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Angular_full_color_logo.svg', NOW(), NOW()),
(10, 'Vue.js', 'https://upload.wikimedia.org/wikipedia/commons/9/95/Vue.js_Logo_2.svg', NOW(), NOW()),
(11, 'Docker', 'https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png', NOW(), NOW()),
(12, 'Kubernetes', 'https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg', NOW(), NOW()),
(13, 'AWS', 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg', NOW(), NOW()),
(14, 'Azure', 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Microsoft_Azure_Logo.svg', NOW(), NOW()),
(15, 'GCP', 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Google_Cloud_logo.svg', NOW(), NOW()),
(16, 'MongoDB', 'https://upload.wikimedia.org/wikipedia/en/4/45/MongoDB-Logo.svg', NOW(), NOW()),
(17, 'PostgreSQL', 'https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg', NOW(), NOW()),
(18, 'MySQL', 'https://upload.wikimedia.org/wikipedia/en/d/dd/MySQL_logo.svg', NOW(), NOW()),
(19, 'Redis', 'https://upload.wikimedia.org/wikipedia/en/6/6b/Redis_Logo.svg', NOW(), NOW()),
(20, 'GraphQL', 'https://upload.wikimedia.org/wikipedia/commons/1/17/GraphQL_Logo.svg', NOW(), NOW());
