export type CourseEmbeddingMetadata = {
  category?: string | null
  instructors?: string | null
  rating?: number | null
  final_price?: number | null
  original_price?: number | null
  discount_percentage?: number | null
  thumbnail_url?: string | null
  instructor_id?: string | null
}

export type CourseEmbeddingContentInput = {
  name: string
  description: string
  tags: string[]
  metadata: CourseEmbeddingMetadata
}

export function buildCourseEmbeddingMetadata(input: {
  categoryName?: string | null
  instructorName?: string | null
  instructorId: string
  rating?: number | null
  originalPrice?: number | null
  finalPrice?: number | null
  thumbnailUrl?: string | null
}): CourseEmbeddingMetadata {
  const metadata: CourseEmbeddingMetadata = {
    category: input.categoryName ?? null,
    instructors: input.instructorName ?? null,
    rating: input.rating ?? null,
    final_price: input.finalPrice ?? null,
    original_price: input.originalPrice ?? null,
    thumbnail_url: input.thumbnailUrl ?? null,
    instructor_id: input.instructorId
  }

  if (
    metadata.final_price != null &&
    metadata.original_price != null &&
    metadata.original_price > 0
  ) {
    metadata.discount_percentage = Math.round(
      ((metadata.original_price - metadata.final_price) / metadata.original_price) * 10000
    ) / 100
  }

  return metadata
}

export function buildCourseEmbeddingContent(input: CourseEmbeddingContentInput): string {
  const { name, description, tags, metadata } = input
  const keyTopics = tags.length ? tags.join(', ') : ''
  const whatYouWillLearn = tags.length
    ? tags
        .map(
          (tag) =>
            `- Learn ${tag} (Học về ${tag.toLowerCase()} trong thực tế)`
        )
        .join('\n')
    : ''

  const priceLine =
    metadata.final_price != null
      ? `${metadata.final_price} VND (discount ${metadata.discount_percentage ?? 0}%)`
      : ''

  return [
    'COURSE TITLE:',
    name,
    '',
    'DESCRIPTION:',
    description,
    '',
    'KEY TOPICS:',
    keyTopics,
    '',
    'WHAT YOU WILL LEARN:',
    whatYouWillLearn,
    '',
    'CATEGORY:',
    metadata.category ?? '',
    '',
    'INSTRUCTOR:',
    metadata.instructors ?? '',
    '',
    'RATING:',
    metadata.rating != null ? String(metadata.rating) : '',
    '',
    'PRICE:',
    priceLine,
    '',
    'SUMMARY:',
    `This course teaches ${name} and its practical applications.`,
    `Khóa học này giúp học viên hiểu và ứng dụng ${name} trong thực tế.`
  ].join('\n')
}
