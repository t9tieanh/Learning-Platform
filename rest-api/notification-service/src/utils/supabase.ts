import { clear } from 'console'
import supabase from '~/config/supabase'
import AiChatService from '~/services/aiChat.service';

async function saveToSupabase(
    courseId: number,
    courseName: string,
    courseDescription: string,
    courseTags: string[],
    courseLink: string,
    embedding: number[]
): Promise<boolean> {

    const { error } = await supabase
        .from('course_embeddings')
        .insert([
            {
                id: courseId,
                name: courseName,
                description: courseDescription,
                tags: courseTags,
                embedding: embedding,
                link: courseLink,
            }
        ]);

    if (error) {
        console.error("Lưu embedding lỗi:", error);
        return false;
    }

    return true;
}

async function saveCourseToSupabase(
    courseId: number,
    courseName: string,
    courseDescription: string,
    courseTags: string[],
    courseLink: string,
): Promise<boolean> {
    const text = `${courseName} - ${courseTags}\n${courseDescription}`;
    const embedding = await AiChatService.generateEmbedding(text);
    const { error } = await supabase
        .from('course_embeddings')
        .insert([
            {
                id: courseId,
                name: courseName,
                description: courseDescription,
                tags: courseTags,
                link: courseLink,
                embedding,
            }
        ]);

    if (error) {
        console.error("Lưu embedding lỗi:", error);
        return false;
    }

    return true;
}

async function insertPurchasedCourse(
    id?: number,
    userId?: string,
    courseId?: string
): Promise<boolean> {
    const { error } = await supabase
        .from('user_purchased_courses')
        .insert([
            {
                id: id,
                user_id: userId,
                course_id: courseId,
            }
        ])

    if (error) {
        console.error('Lưu purchased course lỗi:', error)
        return false
    }
    return true
}

// Lấy danh sách course_id mà user đã mua
async function getPurchasedCourseIds(userId: string): Promise<string[]> {
    if (!userId) return []
    const { data, error } = await supabase
        .from('user_purchased_courses')
        .select('course_id')
        .eq('user_id', userId)

    if (error) {
        console.error('Lấy purchased courses lỗi:', error)
        return []
    }
    return (data || []).map((row: any) => String(row.course_id)).filter(Boolean)
}

export {
    saveToSupabase,
    insertPurchasedCourse,
    getPurchasedCourseIds,
}

