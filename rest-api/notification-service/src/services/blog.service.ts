import { FilterQuery } from 'mongoose'
import { BlogModel, IBlog } from '~/models/blog/blog.model'

interface GetAllParams {
    page: number
    limit: number
    search?: string
}

interface CreateBlogParams {
    instructor_id: string
    title: string
    image_url: string
    content: string
    markdown_file_url?: string[]
}

interface UpdateBlogParams {
    title?: string
    image_url?: string
    content?: string
    markdown_file_url?: string[]
}

const getAll = async ({ page, limit, search = '' }: GetAllParams) => {
    const skip = (page - 1) * limit

    const query: FilterQuery<IBlog> = {}
    if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i')
        query.$or = [{ title: regex }, { content: regex }]
    }

    const [items, total] = await Promise.all([
        BlogModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        BlogModel.countDocuments(query)
    ])

    const totalPages = Math.ceil(total / limit) || 1
    return {
        items: items.map((b) => ({
            _id: String(b._id),
            instructor_id: String(b.instructor_id),
            title: b.title,
            image_url: b.image_url,
            content: b.content,
            markdown_file_url: b.markdown_file_url || [],
            createdAt: b.createdAt,
            updatedAt: b.updatedAt
        })),
        page,
        limit,
        total,
        totalPages
    }
}

const getNew = async (limit = 3) => {
    const items = await BlogModel.find({}).sort({ createdAt: -1 }).limit(limit).lean()
    return items.map((b) => ({
        _id: String(b._id),
        instructor_id: String(b.instructor_id),
        title: b.title,
        image_url: b.image_url,
        content: b.content,
        markdown_file_url: b.markdown_file_url || [],
        createdAt: b.createdAt,
        updatedAt: b.updatedAt
    }))
}

const getTrending = async (limit = 3) => {
    // Assumption: trending by updatedAt desc due to lack of view/like fields
    const items = await BlogModel.find({}).sort({ updatedAt: -1 }).limit(limit).lean()
    return items.map((b) => ({
        _id: String(b._id),
        instructor_id: String(b.instructor_id),
        title: b.title,
        image_url: b.image_url,
        content: b.content,
        markdown_file_url: b.markdown_file_url || [],
        createdAt: b.createdAt,
        updatedAt: b.updatedAt
    }))
}

const getDetails = async (id: string) => {
    const b = await BlogModel.findById(id).lean()
    if (!b) return null
    return {
        _id: String(b._id),
        instructor_id: String(b.instructor_id),
        title: b.title,
        image_url: b.image_url,
        content: b.content,
        markdown_file_url: b.markdown_file_url || [],
        createdAt: b.createdAt,
        updatedAt: b.updatedAt
    }
}

const create = async (params: CreateBlogParams) => {
    const doc = await BlogModel.create({
        instructor_id: params.instructor_id,
        title: params.title,
        image_url: params.image_url,
        content: params.content,
        markdown_file_url: params.markdown_file_url || []
    })
    const b = await doc.toObject()
    return {
        _id: String(b._id),
        instructor_id: String(b.instructor_id),
        title: b.title,
        image_url: b.image_url,
        content: b.content,
        markdown_file_url: b.markdown_file_url || [],
        createdAt: (doc as any).createdAt,
        updatedAt: (doc as any).updatedAt
    }
}

const update = async (id: string, params: UpdateBlogParams) => {
    const updateData: any = {}
    if (typeof params.title === 'string') updateData.title = params.title
    if (typeof params.image_url === 'string') updateData.image_url = params.image_url
    if (typeof params.content === 'string') updateData.content = params.content
    if (Array.isArray(params.markdown_file_url)) updateData.markdown_file_url = params.markdown_file_url

    const b = await BlogModel.findByIdAndUpdate(id, updateData, { new: true }).lean()
    if (!b) return null
    return {
        _id: String(b._id),
        instructor_id: String(b.instructor_id),
        title: b.title,
        image_url: b.image_url,
        content: b.content,
        markdown_file_url: b.markdown_file_url || [],
        createdAt: b.createdAt,
        updatedAt: b.updatedAt
    }
}

const remove = async (id: string) => {
    const result = await BlogModel.deleteOne({ _id: id })
    return { deleted: result.deletedCount === 1 }
}

const BlogService = {
    getAll,
    getNew,
    getTrending,
    getDetails,
    create,
    update,
    remove
}

export default BlogService
