import axiosClient from '@/lib/axiosClient.lib'

export interface BlogItem {
    _id: string
    instructor_id: string
    title: string
    image_url: string
    content: string
    markdown_file_url: string[]
    createdAt: string
    updatedAt: string
}

export interface BlogListResponse {
    items: BlogItem[]
    page: number
    limit: number
    total: number
    totalPages: number
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
    return (res.data?.result || []) as BlogItem[]
}

async function getNew(): Promise<BlogItem[]> {
    const res = await axiosClient.axiosInstance.get('/notify/blog/new')
    return (res.data?.result || []) as BlogItem[]
}

async function getDetails(id: string): Promise<BlogItem> {
    const res = await axiosClient.axiosInstance.get(`/notify/blog/details/${id}`)
    return res.data?.result as BlogItem
}

async function getAll(params: { page?: number; limit?: number; search?: string }): Promise<BlogListResponse> {
    const { page = 1, limit = 6, search = '' } = params || {}
    const qs = new URLSearchParams()
    qs.set('page', String(page))
    qs.set('limit', String(limit))
    if (search) qs.set('search', search)
    const res = await axiosClient.axiosInstance.get(`/notify/blog/all?${qs.toString()}`)
    return (res.data?.result || { items: [], page: 1, limit, total: 0, totalPages: 1 }) as BlogListResponse
}

async function create(body: CreateBlogRequest): Promise<BlogItem> {
    const res = await axiosClient.axiosInstance.post('/notify/blog/create', body)
    return res.data?.result as BlogItem
}

async function update(id: string, body: UpdateBlogRequest): Promise<BlogItem> {
    const res = await axiosClient.axiosInstance.patch(`/notify/blog/update/${id}`, body)
    return res.data?.result as BlogItem
}

async function remove(id: string): Promise<{ deleted: boolean }> {
    const res = await axiosClient.axiosInstance.delete(`/notify/blog/${id}`)
    return res.data?.result as { deleted: boolean }
}

export const blogService = { getTrending, getNew, getAll, getDetails, create, update, remove }

export default blogService
