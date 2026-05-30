import type { AxiosError } from 'axios'
import axiosClient from '@/lib/axiosClient.lib'
import type { ApiResponse } from '@/types/response.type'
import type { GeneratedQuiz } from '@/types/quiz'
import {
  LessonTestGroupGenStatus,
  LessonTestJobSnapshotStatus,
  type BulkEnqueueJobsResult,
  type CreateLessonTestChunkGroupPayload,
  type GroupGenTerminalDto,
  type GroupGenerateAcceptedDto,
  type LessonTestBundleResponse,
  type LessonTestChunkGroupCreatedDto,
  type LessonTestHeaderDto,
  type LessonTestJobSnapshotItemDto,
  type PatchLessonTestChunkGroupPayload,
  type PutLessonTestPayload,
} from '@/types/lesson-test.type'

function bulkStatusQuery(jobIds: string[]): string {
  const q = new URLSearchParams()
  for (const id of jobIds) {
    q.append('jobId', id)
  }
  return q.toString()
}

class LessonTestService {
  /**
   * Loads blueprint + chunk groups. Returns null when the lesson has no lesson-test row (HTTP 404).
   */
  async fetchLessonTestBundle(lessonId: string): Promise<LessonTestBundleResponse | null> {
    try {
      const res = await axiosClient.axiosInstance.get(
        `assistant/analysis/lessons/${lessonId}/lesson-test`
      )
      const body = res.data as ApiResponse<LessonTestBundleResponse | null>
      if (body.code === 404 || body.result == null) {
        return null
      }
      const r = body.result
      return {
        ...r,
        quizzes: Array.isArray(r.quizzes) ? r.quizzes : [],
      }
    } catch (e) {
      const err = e as AxiosError<{ message?: string }>
      if (err.response?.status === 404) {
        return null
      }
      throw e
    }
  }

  async putLessonTest(
    lessonId: string,
    body: PutLessonTestPayload
  ): Promise<ApiResponse<LessonTestHeaderDto>> {
    const res = await axiosClient.axiosInstance.put(
      `assistant/analysis/lessons/${lessonId}/lesson-test`,
      body
    )
    return res.data as ApiResponse<LessonTestHeaderDto>
  }

  /**
   * Pre-calculated stats for matrix analysis (ranges, chunk summaries, totals).
   */
  async fetchBlueprintStats(lessonId: string): Promise<ApiResponse<any>> {
    const res = await axiosClient.axiosInstance.get(
      `assistant/analysis/lesson-tests/${lessonId}/stats`
    )
    return res.data as ApiResponse<any>
  }

  /**
   * Xóa một chunk group trên assistant-service.
   * DELETE `assistant/analysis/lesson-test/chunk-groups/:groupId`
   */
  async deleteChunkGroup(groupId: string): Promise<ApiResponse<void>> {
    try {
      const res = await axiosClient.axiosInstance.delete(
        `assistant/analysis/lesson-test/chunk-groups/${groupId}`
      )
      return res.data as ApiResponse<void>
    } catch (e) {
      const err = e as AxiosError
      if (err.response?.status === 404) {
        return { code: 200, message: 'Group not found' }
      }
      throw e
    }
  }

  /**
   * Cập nhật một chunk group (tiêu đề, gợi ý AI, số câu, phân đoạn…).
   * PATCH `assistant/analysis/lesson-test/chunk-groups/:groupId`
   */
  async patchChunkGroup(
    groupId: string,
    body: PatchLessonTestChunkGroupPayload
  ): Promise<ApiResponse<LessonTestChunkGroupCreatedDto>> {
    const res = await axiosClient.axiosInstance.patch(
      `assistant/analysis/lesson-test/chunk-groups/${groupId}`,
      body
    )
    return res.data as ApiResponse<LessonTestChunkGroupCreatedDto>
  }

  async createChunkGroup(
    lessonId: string,
    body: CreateLessonTestChunkGroupPayload
  ): Promise<ApiResponse<LessonTestChunkGroupCreatedDto>> {
    const res = await axiosClient.axiosInstance.post(
      `assistant/analysis/lessons/${lessonId}/lesson-test/chunk-groups`,
      body
    )
    return res.data as ApiResponse<LessonTestChunkGroupCreatedDto>
  }

  async postBulkGenerateLessonTestQuizzes(
    lessonId: string,
    body: { groupIds?: string[] } = {}
  ): Promise<ApiResponse<BulkEnqueueJobsResult>> {
    const res = await axiosClient.axiosInstance.post(
      `assistant/analysis/lessons/${lessonId}/lesson-test/generate-quizzes`,
      body,
      { timeout: 120_000 }
    )
    return res.data as ApiResponse<BulkEnqueueJobsResult>
  }

  async getBulkGenerationStatus(
    lessonId: string,
    jobIds: string[]
  ): Promise<ApiResponse<{ items: LessonTestJobSnapshotItemDto[] }>> {
    const qs = bulkStatusQuery(jobIds)
    const res = await axiosClient.axiosInstance.get(
      `assistant/analysis/lessons/${lessonId}/lesson-test/generate-quizzes/status?${qs}`
    )
    return res.data as ApiResponse<{ items: LessonTestJobSnapshotItemDto[] }>
  }

  async postGroupGenerateQuizzes(
    groupId: string,
    body: { userPrompt?: string } = {}
  ): Promise<ApiResponse<GroupGenerateAcceptedDto>> {
    const res = await axiosClient.axiosInstance.post(
      `assistant/analysis/lesson-test/chunk-groups/${groupId}/generate-quizzes`,
      body,
      { timeout: 120_000 }
    )
    return res.data as ApiResponse<GroupGenerateAcceptedDto>
  }

  async getChunkGroupQuizzes(groupId: string): Promise<ApiResponse<GeneratedQuiz[]>> {
    const res = await axiosClient.axiosInstance.get(
      `assistant/analysis/lesson-test/chunk-groups/${groupId}/quizzes`
    )
    return res.data as ApiResponse<GeneratedQuiz[]>
  }

  async getGroupGenerationStatus(
    groupId: string,
    jobId: string
  ): Promise<ApiResponse<GroupGenTerminalDto>> {
    const res = await axiosClient.axiosInstance.get(
      `assistant/analysis/lesson-test/chunk-groups/${groupId}/generate-quizzes/status`,
      { params: { jobId }, timeout: 70_000 }
    )
    return res.data as ApiResponse<GroupGenTerminalDto>
  }

  /**
   * Polls bulk job snapshots until every job is COMPLETED or any FAILED / missing items.
   */
  async pollBulkJobsUntilTerminal(
    lessonId: string,
    jobIds: string[],
    opts?: {
      intervalMs?: number
      maxWaitMs?: number
      /** Called after each successful snapshot (before aborting on failure / completion). */
      onSnapshot?: (items: LessonTestJobSnapshotItemDto[]) => void | Promise<void>
    }
  ): Promise<{ allOk: boolean; failedReason?: string }> {
    const intervalMs = opts?.intervalMs ?? 2500
    const maxWaitMs = opts?.maxWaitMs ?? 600_000
    const deadline = Date.now() + maxWaitMs

    let currentInterval = intervalMs
    while (Date.now() < deadline) {
      const res = await this.getBulkGenerationStatus(lessonId, jobIds)
      if (res.code !== 200 || !res.result?.items || res.result.items.length !== jobIds.length) {
        return {
          allOk: false,
          failedReason: res.message || 'Không lấy được trạng thái job.',
        }
      }

      const items: LessonTestJobSnapshotItemDto[] = res.result.items
      await opts?.onSnapshot?.(items)

      const failed = items.find((item) => item.status === LessonTestJobSnapshotStatus.FAILED)
      if (failed) {
        return {
          allOk: false,
          failedReason: failed.reason || 'Một nhóm sinh câu thất bại.',
        }
      }

      const pending = items.some(
        (item) =>
          item.status === LessonTestJobSnapshotStatus.QUEUED ||
          item.status === LessonTestJobSnapshotStatus.PROCESSING
      )
      if (!pending) {
        const allCompleted = items.every((item) => item.status === LessonTestJobSnapshotStatus.COMPLETED)
        return { allOk: allCompleted }
      }

      await new Promise((r) => setTimeout(r, currentInterval))
      currentInterval = Math.min(currentInterval * 1.5, 15000)
    }

    return { allOk: false, failedReason: 'Hết thời gian chờ sinh câu.' }
  }

  /**
   * Follows long-poll snapshots until COMPLETED / FAILED or timeout.
   */
  async waitSingleGroupJob(
    groupId: string,
    jobId: string,
    opts?: { maxWaitMs?: number }
  ): Promise<{ ok: boolean; message?: string }> {
    const maxWaitMs = opts?.maxWaitMs ?? 600_000
    const deadline = Date.now() + maxWaitMs

    let currentInterval = 500
    while (Date.now() < deadline) {
      const res = await this.getGroupGenerationStatus(groupId, jobId)
      const payload = res.result
      if (!payload || typeof payload !== 'object' || !('status' in payload)) {
        await new Promise((r) => setTimeout(r, currentInterval))
        currentInterval = Math.min(currentInterval * 1.5, 10000)
        continue
      }

      if (payload.status === LessonTestGroupGenStatus.COMPLETED) {
        return { ok: true }
      }
      if (payload.status === LessonTestGroupGenStatus.FAILED) {
        return { ok: false, message: payload.reason }
      }

      await new Promise((r) => setTimeout(r, currentInterval))
      currentInterval = Math.min(currentInterval * 1.5, 10000)
    }

    return { ok: false, message: 'Hết thời gian chờ sinh câu cho nhóm này.' }
  }
}

export default new LessonTestService()
