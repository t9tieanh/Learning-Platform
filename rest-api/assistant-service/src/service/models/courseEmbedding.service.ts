import prismaService from '~/service/utils/prisma.service'
import { EmbeddingE5Service } from '~/service/embedding/embeddingE5.service'
import Logger from '~/utils/logger'
import { env } from '~/config/env'
import type { CourseApprovalEvent } from '~/dto/event/course-approval-event.dto'
import {
  buildCourseEmbeddingContent,
  buildCourseEmbeddingMetadata,
  type CourseEmbeddingMetadata
} from '~/utils/courseEmbeddingContent.util'

type CourseEmbeddingPersistInput = {
  id: string
  name: string
  description: string
  tags: string[]
  link: string
  content: string
  metadata: CourseEmbeddingMetadata
  embedding: number[]
}

class CourseEmbeddingService {
  private readonly embeddingService = new EmbeddingE5Service()

  async deleteFromApprovalEvent(event: CourseApprovalEvent): Promise<void> {
    if (!event.id) {
      Logger.warn('[CourseEmbedding] Skip delete: missing course id')
      return
    }

    const deleted = await prismaService.courseEmbedding.deleteMany({
      where: { id: event.id }
    })

    if (deleted.count === 0) {
      Logger.info(`[CourseEmbedding] No embedding found for rejected course ${event.id}`)
      return
    }

    Logger.info(`[CourseEmbedding] Deleted embedding for rejected course ${event.id}`)
  }

  async indexFromApprovalEvent(event: CourseApprovalEvent): Promise<void> {
    const name = event.title?.trim()
    const description = (event.shortDescription ?? event.longDescription ?? '').trim()

    if (!name || !description) {
      Logger.warn(
        `[CourseEmbedding] Skip course ${event.id}: missing title or description`
      )
      return
    }

    const tagNames = (event.tags ?? []).map((tag) => tag.name).filter(Boolean)
    const metadata = buildCourseEmbeddingMetadata({
      categoryName: event.categoryName,
      instructorName: event.instructorName,
      instructorId: event.instructorId,
      rating: event.rating,
      originalPrice: event.originalPrice,
      finalPrice: event.finalPrice,
      thumbnailUrl: event.thumbnailUrl
    })

    const content = buildCourseEmbeddingContent({
      name,
      description,
      tags: tagNames,
      metadata
    })

    const embedding = await this.embeddingService.embedPassage(content)
    if (!embedding?.length) {
      throw new Error(`Failed to generate embedding for course ${event.id}`)
    }

    const link = `${env.COURSE_PUBLIC_BASE_URL.replace(/\/$/, '')}/${event.id}`

    await this.upsertCourseEmbedding({
      id: event.id,
      name,
      description,
      tags: tagNames,
      link,
      content,
      metadata,
      embedding
    })

    Logger.info(`[CourseEmbedding] Indexed course ${event.id} (${name})`)
  }

  private async upsertCourseEmbedding(input: CourseEmbeddingPersistInput): Promise<void> {
    const metadataJson = JSON.stringify(input.metadata)

    await prismaService.$executeRaw`
      INSERT INTO course_embeddings (
        id,
        name,
        description,
        tags,
        link,
        content,
        metadata,
        "check",
        embedding,
        created_at
      )
      VALUES (
        ${input.id},
        ${input.name},
        ${input.description},
        ${input.tags}::text[],
        ${input.link},
        ${input.content},
        ${metadataJson}::jsonb,
        false,
        ${input.embedding}::vector(768),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        tags = EXCLUDED.tags,
        link = EXCLUDED.link,
        content = EXCLUDED.content,
        metadata = EXCLUDED.metadata,
        embedding = EXCLUDED.embedding
    `
  }
}

export default new CourseEmbeddingService()
