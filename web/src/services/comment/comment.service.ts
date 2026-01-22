import axiosClient from '@/lib/axiosClient.lib'
import {
  CreateLessonCommentDto,
  CreateLessonCommentResponse,
  LoadLessonCommentsResponse,
  DeleteLessonCommentResponse,
  UpdateLessonCommentDto,
  UpdateLessonCommentResponse
} from '@/types/comment.type'

class CommentService {
  async createLessonComment(payload: CreateLessonCommentDto): Promise<CreateLessonCommentResponse> {
    const body = { ...payload, parentId: payload.parentId ?? null }
    const res = await axiosClient.axiosInstance.post('/learning/lesson-comment', body)
    return res.data as CreateLessonCommentResponse
  }

  async getLessonComments(lessonId: string): Promise<LoadLessonCommentsResponse> {
    const res = await axiosClient.axiosInstance.get('/learning/lesson-comment', {
      params: { lessonId }
    })
    return res.data as LoadLessonCommentsResponse
  }

  async deleteLessonComment(id: string): Promise<DeleteLessonCommentResponse> {
    const res = await axiosClient.axiosInstance.delete(`/learning/lesson-comment/${id}`)
    return res.data as DeleteLessonCommentResponse
  }

  async updateLessonComment(id: string, payload: UpdateLessonCommentDto): Promise<UpdateLessonCommentResponse> {
    const res = await axiosClient.axiosInstance.put(`/learning/lesson-comment/${id}`, payload)
    return res.data as UpdateLessonCommentResponse
  }
}

export const commentService = new CommentService()
export default commentService
