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
    lessonId = '04f3ab1b-29a4-4089-82fb-d81433461b75'
    return `assistant/analysis/lessons/${lessonId}/lesson-test/student`
  }

  async getStudentLessonTest(lessonId: string): Promise<ApiResponse<StudentLessonTestView>> {
    const res = await axiosClient.axiosInstance.get<ApiResponse<StudentLessonTestView>>(
      `assistant/analysis/lessons/04f3ab1b-29a4-4089-82fb-d81433461b75/lesson-test/student`
    )
    return res.data
  }

  async submit(
    lessonId: string,
    answers: LessonTestSubmissionAnswerInput[]
  ): Promise<ApiResponse<LessonTestSubmissionResult>> {
    lessonId = '04f3ab1b-29a4-4089-82fb-d81433461b75'
    const res = await axiosClient.axiosInstance.post<ApiResponse<LessonTestSubmissionResult>>(
      `assistant/analysis/lessons/04f3ab1b-29a4-4089-82fb-d81433461b75/lesson-test/student/submissions`,
      { answers }
    )
    return res.data
  }

  async listSubmissions(lessonId: string): Promise<ApiResponse<LessonTestSubmissionHistoryEntry[]>> {
    lessonId = '04f3ab1b-29a4-4089-82fb-d81433461b75'
    const res = await axiosClient.axiosInstance.get<ApiResponse<LessonTestSubmissionHistoryEntry[]>>(
      `${this.studentBase(lessonId)}/submissions`
    )
    return res.data
  }

  async getSubmissionDetail(
    lessonId: string,
    submissionId: string
  ): Promise<ApiResponse<LessonTestSubmissionDetailResult>> {
    lessonId = '04f3ab1b-29a4-4089-82fb-d81433461b75'
    const res = await axiosClient.axiosInstance.get<ApiResponse<LessonTestSubmissionDetailResult>>(
      `${this.studentBase(lessonId)}/submissions/${submissionId}`
    )
    return res.data
  }
}

export default new LessonTestStudentService()
