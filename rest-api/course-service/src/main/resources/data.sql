-- Xóa dữ liệu cũ để tránh trùng lặp (nếu chạy lại)
DELETE FROM categories;
DELETE FROM tags;

-- Seed Categories (20 rows)
INSERT INTO categories (id, name, description, created_at, updated_at, deleted) VALUES
                                                                                    (1, 'Web Development', 'Learn how to build modern websites', NOW(), NOW(), false),
                                                                                    (2, 'Mobile Apps', 'Build Android and iOS applications', NOW(), NOW(), false),
                                                                                    (3, 'Data Science', 'Data analysis and machine learning', NOW(), NOW(), false),
                                                                                    (4, 'Artificial Intelligence', 'AI concepts and deep learning', NOW(), NOW(), false),
                                                                                    (5, 'Cloud Computing', 'AWS, Azure, GCP fundamentals', NOW(), NOW(), false),
                                                                                    (6, 'Cyber Security', 'Protect systems and networks', NOW(), NOW(), false),
                                                                                    (7, 'Software Engineering', 'Principles of software development', NOW(), NOW(), false),
                                                                                    (8, 'Game Development', 'Learn to create 2D/3D games', NOW(), NOW(), false),
                                                                                    (9, 'Blockchain', 'Cryptocurrency and blockchain basics', NOW(), NOW(), false),
                                                                                    (10, 'DevOps', 'CI/CD pipelines and automation', NOW(), NOW(), false),
                                                                                    (11, 'UI/UX Design', 'Design beautiful and usable interfaces', NOW(), NOW(), false),
                                                                                    (12, 'Big Data', 'Work with large-scale data systems', NOW(), NOW(), false),
                                                                                    (13, 'IoT', 'Internet of Things applications', NOW(), NOW(), false),
                                                                                    (14, 'AR/VR', 'Augmented and Virtual Reality', NOW(), NOW(), false),
                                                                                    (15, 'Project Management', 'Agile, Scrum, Kanban', NOW(), NOW(), false),
                                                                                    (16, 'Digital Marketing', 'SEO, SEM, Social Media Ads', NOW(), NOW(), false),
                                                                                    (17, 'Database Systems', 'SQL, NoSQL, and optimization', NOW(), NOW(), false),
                                                                                    (18, 'Operating Systems', 'Linux, Windows, and system internals', NOW(), NOW(), false),
                                                                                    (19, 'Computer Networks', 'Networking basics and protocols', NOW(), NOW(), false),
                                                                                    (20, 'Programming Basics', 'Learn programming from scratch', NOW(), NOW(), false);

-- Seed Tags (20 rows với logo thật)
INSERT INTO tags (id, name, image_url, created_at, updated_at, deleted) VALUES
                                                                            (1, 'Java', 'https://upload.wikimedia.org/wikipedia/en/3/30/Java_programming_language_logo.svg', NOW(), NOW(), false),
                                                                            (2, 'Python', 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg', NOW(), NOW(), false),
                                                                            (3, 'JavaScript', 'https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png', NOW(), NOW(), false),
                                                                            (4, 'React', 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg', NOW(), NOW(), false),
                                                                            (5, 'Spring Boot', 'https://upload.wikimedia.org/wikipedia/commons/4/44/Spring_Framework_Logo_2018.svg', NOW(), NOW(), false),
                                                                            (6, 'Kotlin', 'https://upload.wikimedia.org/wikipedia/commons/7/74/Kotlin_Icon.png', NOW(), NOW(), false),
                                                                            (7, 'Flutter', 'https://upload.wikimedia.org/wikipedia/commons/1/17/Google-flutter-logo.png', NOW(), NOW(), false),
                                                                            (8, 'Node.js', 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg', NOW(), NOW(), false),
                                                                            (9, 'Angular', 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Angular_full_color_logo.svg', NOW(), NOW(), false),
                                                                            (10, 'Vue.js', 'https://upload.wikimedia.org/wikipedia/commons/9/95/Vue.js_Logo_2.svg', NOW(), NOW(), false),
                                                                            (11, 'Docker', 'https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png', NOW(), NOW(), false),
                                                                            (12, 'Kubernetes', 'https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg', NOW(), NOW(), false),
                                                                            (13, 'AWS', 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg', NOW(), NOW(), false),
                                                                            (14, 'Azure', 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Microsoft_Azure_Logo.svg', NOW(), NOW(), false),
                                                                            (15, 'GCP', 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Google_Cloud_logo.svg', NOW(), NOW(), false),
                                                                            (16, 'MongoDB', 'https://upload.wikimedia.org/wikipedia/en/4/45/MongoDB-Logo.svg', NOW(), NOW(), false),
                                                                            (17, 'PostgreSQL', 'https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg', NOW(), NOW(), false),
                                                                            (18, 'MySQL', 'https://upload.wikimedia.org/wikipedia/en/d/dd/MySQL_logo.svg', NOW(), NOW(), false),
                                                                            (19, 'Redis', 'https://upload.wikimedia.org/wikipedia/en/6/6b/Redis_Logo.svg', NOW(), NOW(), false),
                                                                            (20, 'GraphQL', 'https://upload.wikimedia.org/wikipedia/commons/1/17/GraphQL_Logo.svg', NOW(), NOW(), false);
