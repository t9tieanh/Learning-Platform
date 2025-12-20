import supabase from '~/config/supabase'
import AiChatService from '~/services/aiChat.service'
import { env } from '~/config/env'

async function saveToSupabase(
  courseId: number,
  courseName: string,
  courseDescription: string,
  courseTags: string[],
  courseLink: string,
  embedding: number[]
): Promise<boolean> {
  const { error } = await supabase.from('course_embeddings').insert([
    {
      id: courseId,
      name: courseName,
      description: courseDescription,
      tags: courseTags,
      embedding: embedding,
      link: courseLink
    }
  ])

  if (error) {
    console.error('Lưu embedding lỗi:', error)
    return false
  }

  return true
}

// use while new course is approved
async function saveCourseToSupabase(
  courseId: string,
  courseName: string,
  courseDescription: string,
  courseTags: string[]
): Promise<boolean> {
  const text = `${courseName} - ${courseTags}\n${courseDescription}`
  const embedding = await AiChatService.generateEmbedding(text)
  const { error } = await supabase.from('course_embeddings').insert([
    {
      id: Math.floor(10000 + Math.random() * 90000),
      name: courseName,
      description: courseDescription,
      tags: courseTags,
      link: env.FRONTEND_ORIGIN + '/course/' + courseId,
      embedding
    }
  ])

  if (error) {
    console.error('Lưu embedding lỗi:', error)
    return false
  }

  return true
}

// save while user purchase a course
async function insertPurchasedCourse(userId?: string, courseId?: string): Promise<boolean> {
  const { error } = await supabase.from('user_purchased_courses').insert([
    {
      id: Math.floor(10000 + Math.random() * 90000),
      user_id: userId,
      course_id: courseId
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
  const { data, error } = await supabase.from('user_purchased_courses').select('course_id').eq('user_id', userId)

  if (error) {
    console.error('Lấy purchased courses lỗi:', error)
    return []
  }
  return (data || []).map((row: any) => String(row.course_id)).filter(Boolean)
}

export { saveToSupabase, insertPurchasedCourse, getPurchasedCourseIds, saveCourseToSupabase }
