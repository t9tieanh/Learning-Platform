import { FilterQuery } from 'mongoose'
import { BlogModel, IBlog } from '~/models/blog/blog.model'

interface GetAllParams {
  page: number
  limit: number
  search?: string
  instructorId?: string
  tag?: string
}

interface CreateBlogParams {
  instructor_id: string
  instructor_name?: string
  instructor_image?: string
  title: string
  image_url: string
  content: string
  tags?: string[]
  markdown_file_url?: string[]
}

interface UpdateBlogParams {
  title?: string
  image_url?: string
  content?: string
  tags?: string[]
  markdown_file_url?: string[]
}

interface BlogListItem {
  _id: string
  instructor_id: string
  instructor_name: string
  instructor_image: string
  title: string
  image_url: string
  content: string
  tags: string[]
  markdown_file_url: string[]
  createdAt: Date
  updatedAt: Date
}

interface BlogListResult {
  items: BlogListItem[]
  availableTags: string[]
  page: number
  limit: number
  total: number
  totalPages: number
}

interface BlogLeanDocument {
  _id: unknown
  instructor_id: unknown
  instructor_name?: string
  instructor_image?: string
  title: string
  image_url: string
  content: string
  tags?: string[]
  markdown_file_url?: string[]
  createdAt: Date
  updatedAt: Date
}

const normalizeTag = (value: string): string => value.trim()

const normalizeTags = (values: unknown): string[] => {
  if (!Array.isArray(values)) return []

  const normalized: string[] = []
  const seen = new Set<string>()

  for (let i = 0; i < values.length; i += 1) {
    const raw = values[i]
    if (typeof raw !== 'string') continue

    const display = normalizeTag(raw)
    if (!display) continue

    const key = display.toLowerCase()
    if (seen.has(key)) continue

    seen.add(key)
    normalized.push(display)
  }

  return normalized
}

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const buildListQuery = ({ search = '', instructorId, tag }: Pick<GetAllParams, 'search' | 'instructorId' | 'tag'>) => {
  const trimmedSearch = search.trim()
  const normalizedTag = typeof tag === 'string' ? tag.trim().toLowerCase() : ''
  const query: FilterQuery<IBlog> = {}

  if (trimmedSearch.length > 0) {
    query.$text = { $search: trimmedSearch }
  }

  if (typeof instructorId === 'string' && instructorId.trim().length > 0) {
    query.instructor_id = instructorId.trim()
  }

  if (normalizedTag.length > 0) {
    query.tags = {
      $elemMatch: {
        $regex: `^${escapeRegex(normalizedTag)}$`,
        $options: 'i'
      }
    }
  }

  return query
}

const getAvailableTags = async ({
  search = '',
  instructorId
}: Pick<GetAllParams, 'search' | 'instructorId'>): Promise<string[]> => {
  const query = buildListQuery({ search, instructorId })

  const rows = await BlogModel.aggregate<{ _id: string; display: string }>([
    { $match: query },
    { $unwind: '$tags' },
    {
      $group: {
        _id: { $toLower: '$tags' },
        display: { $first: '$tags' }
      }
    },
    { $sort: { display: 1 } }
  ])

  const availableTags: string[] = []
  for (let i = 0; i < rows.length; i += 1) {
    const value = typeof rows[i].display === 'string' ? rows[i].display : rows[i]._id
    if (typeof value === 'string' && value.trim().length > 0) {
      availableTags.push(value)
    }
  }

  return availableTags
}

const toBlogListItem = (b: BlogLeanDocument): BlogListItem => {
  return {
    _id: String(b._id),
    instructor_id: String(b.instructor_id),
    instructor_name: typeof b.instructor_name === 'string' ? b.instructor_name : '',
    instructor_image: typeof b.instructor_image === 'string' ? b.instructor_image : '',
    title: b.title,
    image_url: b.image_url,
    content: b.content,
    tags: normalizeTags(b.tags),
    markdown_file_url: Array.isArray(b.markdown_file_url) ? b.markdown_file_url : [],
    createdAt: b.createdAt,
    updatedAt: b.updatedAt
  }
}

const getAllBlogs = async ({ page, limit, search = '', instructorId, tag }: GetAllParams): Promise<BlogListResult> => {
  const skip = (page - 1) * limit
  const trimmedSearch = search.trim()
  const hasSearch = trimmedSearch.length > 0
  const query = buildListQuery({ search, instructorId, tag })

  let findQuery = BlogModel.find(query)

  if (hasSearch) {
    findQuery = findQuery.select({ score: { $meta: 'textScore' } }).sort({
      score: { $meta: 'textScore' },
      createdAt: -1
    })
  } else {
    findQuery = findQuery.sort({ createdAt: -1 })
  }

  const [itemsRaw, total, availableTags] = await Promise.all([
    findQuery.skip(skip).limit(limit).lean(),
    BlogModel.countDocuments(query),
    getAvailableTags({ search, instructorId })
  ])

  const items: BlogListItem[] = []
  for (let i = 0; i < itemsRaw.length; i += 1) {
    items.push(toBlogListItem(itemsRaw[i] as BlogLeanDocument))
  }

  const totalPages = Math.ceil(total / limit) || 1
  return {
    items,
    availableTags,
    page,
    limit,
    total,
    totalPages
  }
}

const getNew = async (limit = 3) => {
  const items = await BlogModel.find({}).sort({ createdAt: -1 }).limit(limit).lean()
  const data: BlogListItem[] = []
  for (let i = 0; i < items.length; i += 1) {
    data.push(toBlogListItem(items[i] as BlogLeanDocument))
  }
  return data
}

const getTrending = async (limit = 3) => {
  const items = await BlogModel.find({}).sort({ updatedAt: -1 }).limit(limit).lean()
  const data: BlogListItem[] = []
  for (let i = 0; i < items.length; i += 1) {
    data.push(toBlogListItem(items[i] as BlogLeanDocument))
  }
  return data
}

const getDetails = async (id: string) => {
  const b = await BlogModel.findById(id).lean()
  if (!b) return null
  return toBlogListItem(b as BlogLeanDocument)
}

const create = async (params: CreateBlogParams) => {
  const createdDoc = await BlogModel.create({
    instructor_id: params.instructor_id,
    instructor_name: params.instructor_name || '',
    instructor_image: params.instructor_image || '',
    title: params.title,
    image_url: params.image_url,
    content: params.content,
    tags: normalizeTags(params.tags),
    markdown_file_url: Array.isArray(params.markdown_file_url) ? params.markdown_file_url : []
  })

  const created = await BlogModel.findById(createdDoc._id).lean()
  if (!created) return null
  return toBlogListItem(created as BlogLeanDocument)
}

const update = async (id: string, params: UpdateBlogParams) => {
  const updateData: {
    title?: string
    image_url?: string
    content?: string
    tags?: string[]
    markdown_file_url?: string[]
  } = {}

  if (typeof params.title === 'string') updateData.title = params.title
  if (typeof params.image_url === 'string') updateData.image_url = params.image_url
  if (typeof params.content === 'string') updateData.content = params.content
  if (Array.isArray(params.tags)) updateData.tags = normalizeTags(params.tags)
  if (Array.isArray(params.markdown_file_url)) updateData.markdown_file_url = params.markdown_file_url

  const b = await BlogModel.findByIdAndUpdate(id, updateData, { new: true }).lean()
  if (!b) return null
  return toBlogListItem(b as BlogLeanDocument)
}

const remove = async (id: string) => {
  const result = await BlogModel.deleteOne({ _id: id })
  return { deleted: result.deletedCount === 1 }
}

const BlogService = {
  getAll: getAllBlogs,
  getNew,
  getTrending,
  getDetails,
  create,
  update,
  remove
}

export default BlogService
