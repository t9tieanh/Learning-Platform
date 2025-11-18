import AiChatService from "~/services/aiChat.service";
import { saveToSupabase } from "./supabase";

const mockCourses = [
    {
        id: 1,
        name: "ReactJS từ cơ bản đến nâng cao",
        description: "Khóa học giúp bạn học ReactJS từ cơ bản đến nâng cao, làm project thực tế.",
        tags: ["ReactJS", "Frontend", "JavaScript"],
        link: "https://example.com/course/reactjs"
    },
    {
        id: 2,
        name: "Java Spring Boot nâng cao",
        description: "Học backend Java với Spring Boot, xây dựng REST API chuyên nghiệp.",
        tags: ["Java", "Spring Boot", "Backend"],
        link: "https://example.com/course/java-spring-boot"
    },
    {
        id: 3,
        name: "Python AI & Machine Learning",
        description: "Khóa học Python cho AI, Machine Learning, học qua project thực tế.",
        tags: ["Python", "AI", "Machine Learning"],
        link: "https://example.com/course/python-ml"
    },
    {
        id: 4,
        name: "NodeJS & Express cho Web Developer",
        description: "Xây dựng backend NodeJS với Express, kết nối DB, REST API.",
        tags: ["NodeJS", "Express", "Backend", "JavaScript"],
        link: "https://example.com/course/nodejs"
    },
];

export async function seedCourses() {
    for (const course of mockCourses) {
        const text = `${course.name} - ${course.tags}\n${course.description}`;
        const embedding = await AiChatService.generateEmbedding(text);

        const res = await saveToSupabase(course.id, course.name, course.description, course.tags, course.link, embedding);
        if (res) {
            console.log(`Saved course ${course.name} ✅`);
        }
    }
}

