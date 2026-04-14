import axiosClient from '@/lib/axiosClient.lib'

export interface BlogItem {
  _id: string
  instructor_id: string
  instructor_name: string
  instructor_image: string
  title: string
  image_url: string
  content: string
  markdown_file_url: string[]
  createdAt: string
  updatedAt: string
  userAvt: string
  userName: string
}

export interface BlogListResponse {
  items: BlogItem[]
  page: number
  limit: number
  total: number
  totalPages: number
}

interface BlogItemRaw extends Partial<BlogItem> {
  instructor_name?: string
  instructor_image?: string
  userName?: string
  userAvt?: string
}

function normalizeBlogItem(item: BlogItemRaw): BlogItem {
  const instructorName = item.instructor_name || item.userName || ''
  const instructorImage = item.instructor_image || item.userAvt || ''

  return {
    _id: item._id || '',
    instructor_id: item.instructor_id || '',
    instructor_name: instructorName,
    instructor_image: instructorImage,
    title: item.title || '',
    image_url: item.image_url || '',
    content: item.content || '',
    markdown_file_url: Array.isArray(item.markdown_file_url) ? item.markdown_file_url : [],
    createdAt: item.createdAt || '',
    updatedAt: item.updatedAt || '',
    // Backward-compatible aliases for existing UI components
    userName: item.userName || instructorName,
    userAvt: item.userAvt || instructorImage
  }
}

function normalizeBlogListResponse(raw: Partial<BlogListResponse>, limitFallback: number): BlogListResponse {
  const rawItems = Array.isArray(raw.items) ? raw.items : []
  const items = rawItems.map((item) => normalizeBlogItem(item as BlogItemRaw))
  return {
    items,
    page: Number(raw.page) || 1,
    limit: Number(raw.limit) || limitFallback,
    total: Number(raw.total) || 0,
    totalPages: Number(raw.totalPages) || 1
  }
}

export interface CreateBlogRequest {
  instructor_id: string
  title: string
  image_url: string
  content: string
  markdown_file_url?: string[]
}

export interface UpdateBlogRequest {
  title?: string
  image_url?: string
  content?: string
  markdown_file_url?: string[]
}

async function getTrending(): Promise<BlogItem[]> {
  const res = await axiosClient.axiosInstance.get('/notify/blog/trending')
  const raw = Array.isArray(res.data?.result) ? res.data.result : []
  return raw.map((item: BlogItemRaw) => normalizeBlogItem(item))
}

async function getNew(): Promise<BlogItem[]> {
  const res = await axiosClient.axiosInstance.get('/notify/blog/new')
  const raw = Array.isArray(res.data?.result) ? res.data.result : []
  return raw.map((item: BlogItemRaw) => normalizeBlogItem(item))
}

async function getDetails(id: string): Promise<BlogItem> {
  const res = await axiosClient.axiosInstance.get(`/notify/blog/details/${id}`)
  return normalizeBlogItem((res.data?.result || {}) as BlogItemRaw)
}

async function getAll(params: {
  page?: number
  limit?: number
  search?: string
}): Promise<BlogListResponse> {
  const { page = 1, limit = 6, search = '' } = params || {}
  const qs = new URLSearchParams()
  qs.set('page', String(page))
  qs.set('limit', String(limit))
  if (search) qs.set('search', search)
  const res = await axiosClient.axiosInstance.get(`/notify/blog/all?${qs.toString()}`)
  return normalizeBlogListResponse((res.data?.result || {}) as Partial<BlogListResponse>, limit)
}

async function getAllByInstructorId(params: {
  page?: number
  limit?: number
  search?: string
  instructorId?: string
}): Promise<BlogListResponse> {
  const { page = 1, limit = 6, search = '', instructorId } = params || {}
  const qs = new URLSearchParams()
  qs.set('page', String(page))
  qs.set('limit', String(limit))
  qs.set('instructorId', String(instructorId))
  if (search) qs.set('search', search)
  const res = await axiosClient.axiosInstance.get(`/notify/blog/tc-all?${qs.toString()}`)
  return normalizeBlogListResponse((res.data?.result || {}) as Partial<BlogListResponse>, limit)
}

async function create(body: CreateBlogRequest): Promise<BlogItem> {
  const res = await axiosClient.axiosInstance.post('/notify/blog/create', body)
  return normalizeBlogItem((res.data?.result || {}) as BlogItemRaw)
}

async function update(id: string, body: UpdateBlogRequest): Promise<BlogItem> {
  const res = await axiosClient.axiosInstance.patch(`/notify/blog/update/${id}`, body)
  return normalizeBlogItem((res.data?.result || {}) as BlogItemRaw)
}

async function remove(id: string): Promise<{ deleted: boolean }> {
  const res = await axiosClient.axiosInstance.delete(`/notify/blog/${id}`)
  return res.data?.result as { deleted: boolean }
}

export const blogService = { getTrending, getNew, getAll, getDetails, create, update, remove, getAllByInstructorId }

export default blogService
