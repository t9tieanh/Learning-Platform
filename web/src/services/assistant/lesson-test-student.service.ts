import axiosClient from '@/lib/axiosClient.lib'
import type { ApiResponse } from '@/types/response.type'
import type {
  LessonTestSubmissionAnswerInput,
  LessonTestSubmissionHistoryEntry,
  LessonTestSubmissionDetailResult,
  LessonTestSubmissionResult,
  StudentLessonTestView,
} from '@/types/lesson-test-student.type'

class LessonTestStudentService {
  private studentBase(lessonId: string): string {
    return `assistant/analysis/lessons/${lessonId}/lesson-test/student`
  }

  async getStudentLessonTest(lessonId: string): Promise<ApiResponse<StudentLessonTestView>> {
    const res = await axiosClient.axiosInstance.get<ApiResponse<StudentLessonTestView>>(
      `${this.studentBase(lessonId)}`
    )
    return res.data
  }

  async submit(
    lessonId: string,
    answers: LessonTestSubmissionAnswerInput[]
  ): Promise<ApiResponse<LessonTestSubmissionResult>> {
    const res = await axiosClient.axiosInstance.post<ApiResponse<LessonTestSubmissionResult>>(
      `${this.studentBase(lessonId)}/submissions`,
      { answers }
    )
    return res.data
  }

  async listSubmissions(lessonId: string): Promise<ApiResponse<LessonTestSubmissionHistoryEntry[]>> {
    const res = await axiosClient.axiosInstance.get<ApiResponse<LessonTestSubmissionHistoryEntry[]>>(
      `${this.studentBase(lessonId)}/submissions`
    )
    return res.data
  }

  async getSubmissionDetail(
    lessonId: string,
    submissionId: string
  ): Promise<ApiResponse<LessonTestSubmissionDetailResult>> {
    const res = await axiosClient.axiosInstance.get<ApiResponse<LessonTestSubmissionDetailResult>>(
      `${this.studentBase(lessonId)}/submissions/${submissionId}`
    )
    return res.data
  }
}

export default new LessonTestStudentService()
