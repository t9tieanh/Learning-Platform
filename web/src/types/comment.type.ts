import { ApiResponse } from '@/types/response.type'

export interface CreateLessonCommentDto {
  lessonId: string
  parentId?: string | null
  content: string
}

export interface LessonComment {
  id: string
  lessonId: string
  userId: string
  userName: string
  userAvt: string
  parentId: string | null
  content: string
  createdAt: string
  isInstructor?: boolean
  children: LessonComment[]
}

export type CreateLessonCommentResponse = ApiResponse<LessonComment>
export type LoadLessonCommentsResponse = ApiResponse<LessonComment[]>
export type DeleteLessonCommentResponse = ApiResponse<boolean>
export interface UpdateLessonCommentDto {
  content: string
}
export type UpdateLessonCommentResponse = ApiResponse<boolean>
