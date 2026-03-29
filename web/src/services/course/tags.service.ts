import axiosClient from '@/lib/axiosClient.lib'
import { ApiResponse } from '@/types/response.type'

type TagDto = { id: string; name: string; imageUrl: string }

const TAGS_CACHE_TTL_MS = 10 * 60 * 1000

class TagsService {
  private allTagsCache: ApiResponse<TagDto[]> | null = null
  private allTagsCacheTime = 0
  private allTagsRequest: Promise<ApiResponse<TagDto[]> | null> | null = null

  getCachedAllTags(): ApiResponse<TagDto[]> | null {
    const isCacheFresh = Date.now() - this.allTagsCacheTime < TAGS_CACHE_TTL_MS
    return isCacheFresh ? this.allTagsCache : null
  }

  async getAllTags(): Promise<ApiResponse<TagDto[]> | null> {
    const cachedResponse = this.getCachedAllTags()
    if (cachedResponse) {
      return cachedResponse
    }

    if (this.allTagsRequest) {
      return this.allTagsRequest
    }

    this.allTagsRequest = axiosClient.axiosInstance
      .get('learning/tags')
      .then((response) => {
        this.allTagsCache = response.data
        this.allTagsCacheTime = Date.now()
        return response.data
      })
      .finally(() => {
        this.allTagsRequest = null
      })

    return this.allTagsRequest
  }

  async addTagsToCourse(courseId: string, tagIds: string[]): Promise<ApiResponse<null> | null> {
    const response = await axiosClient.axiosInstance.patch(`learning/instructor/courses/${courseId}/tags`, {
      tagIds
    })
    return response.data
  }

  async getAllByCourseId(
    courseId: string
  ): Promise<ApiResponse<{ id: string; name: string; imageUrl: string }[]> | null> {
    const response = await axiosClient.axiosInstance.get(`learning/instructor/courses/${courseId}/tags`)
    return response.data
  }
}

export default new TagsService()
