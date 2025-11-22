import { clear } from 'console'
import supabase from '~/config/supabase'

async function saveToSupabase(
  courseId: number,
  courseName: string,
  courseDescription: string,
  courseTags: string[],
  courseLink: string,
  embedding: number[]
) {
  const { data, error } = await supabase.from('course_embeddings').insert([
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
    return null
  }

  return data
}

export { saveToSupabase }
