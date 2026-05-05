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
    lessonId = '74200441-bc14-4410-9893-61dc96362a3b'
    return `assistant/analysis/lessons/${lessonId}/lesson-test/student`
  }

  async getStudentLessonTest(lessonId: string): Promise<ApiResponse<StudentLessonTestView>> {
    const res = await axiosClient.axiosInstance.get<ApiResponse<StudentLessonTestView>>(
      `assistant/analysis/lessons/74200441-bc14-4410-9893-61dc96362a3b/lesson-test/student`
    )
    return res.data
  }

  async submit(
    lessonId: string,
    answers: LessonTestSubmissionAnswerInput[]
  ): Promise<ApiResponse<LessonTestSubmissionResult>> {
    lessonId = '74200441-bc14-4410-9893-61dc96362a3b'
    const res = await axiosClient.axiosInstance.post<ApiResponse<LessonTestSubmissionResult>>(
      `assistant/analysis/lessons/74200441-bc14-4410-9893-61dc96362a3b/lesson-test/student/submissions`,
      { answers }
    )
    return res.data
  }

  async listSubmissions(lessonId: string): Promise<ApiResponse<LessonTestSubmissionHistoryEntry[]>> {
    lessonId = '74200441-bc14-4410-9893-61dc96362a3b'
    const res = await axiosClient.axiosInstance.get<ApiResponse<LessonTestSubmissionHistoryEntry[]>>(
      `${this.studentBase(lessonId)}/submissions`
    )
    return res.data
  }

  async getSubmissionDetail(
    lessonId: string,
    submissionId: string
  ): Promise<ApiResponse<LessonTestSubmissionDetailResult>> {
    lessonId = '74200441-bc14-4410-9893-61dc96362a3b'
    const res = await axiosClient.axiosInstance.get<ApiResponse<LessonTestSubmissionDetailResult>>(
      `${this.studentBase(lessonId)}/submissions/${submissionId}`
    )
    return res.data
  }
}

export default new LessonTestStudentService()
