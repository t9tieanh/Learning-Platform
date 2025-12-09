import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import sendResponse from '~/dto/response/send-response'
import BlogService from '~/services/blog.service'
import { getUser } from '~/grpc/userClient'

const getAll = async (req: Request, res: Response) => {
  try {
    const page = (req.data as any)?.page ?? (req.query.page ? Math.max(1, Number(req.query.page)) : 1)
    const limit =
      (req.data as any)?.limit ?? (req.query.limit ? Math.min(100, Math.max(1, Number(req.query.limit))) : 10)
    const search = (req.data as any)?.search ?? (req.query.q as string) ?? (req.query.search as string) ?? ''
    // If no search term: keep original paginated query (title/content only)
    if (!search.trim()) {
      const blogs = await BlogService.getAll({ page, limit, search: '' })
      const data = await Promise.all(
        blogs.items.map(async (b) => {
          const user = await getUser(b.instructor_id)
          return {
            ...b,
            userName: user?.name || '',
            userAvt: user?.image || ''
          }
        })
      )
      return sendResponse(res, {
        code: StatusCodes.OK,
        message: 'Lấy danh sách blog thành công',
        result: { ...blogs, data }
      })
    }

    // With search: include instructor name matching (diacritic-insensitive).
    // Fetch a large set then filter manually (optimize later if needed).
    const allBlogs = await BlogService.getAll({ page: 1, limit: 10000, search: '' })

    const normalize = (v: string) =>
      v
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .trim()

    const searchNorm = normalize(search)

    // Cache instructor info to avoid repeated gRPC calls
    const instructorCache: Record<string, { name: string; image: string }> = {}
    const getInstructorInfo = async (instructorId: string) => {
      if (instructorCache[instructorId]) return instructorCache[instructorId]
      const user = await getUser(instructorId)
      instructorCache[instructorId] = { name: user?.name || '', image: user?.image || '' }
      return instructorCache[instructorId]
    }

    // Preload instructor info for all blogs (can be optimized later)
    await Promise.all(
      allBlogs.items.map(async (b) => {
        await getInstructorInfo(b.instructor_id)
      })
    )

    const filtered = allBlogs.items.filter((b) => {
      const titleNorm = normalize(b.title || '')
      const contentNorm = normalize(b.content || '')
      const instrNorm = normalize(instructorCache[b.instructor_id]?.name || '')
      return titleNorm.includes(searchNorm) || contentNorm.includes(searchNorm) || instrNorm.includes(searchNorm)
    })

    const total = filtered.length
    const totalPages = Math.ceil(total / limit) || 1
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    const data = paginated.map((b) => ({
      ...b,
      userName: instructorCache[b.instructor_id]?.name || '',
      userAvt: instructorCache[b.instructor_id]?.image || ''
    }))

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Lấy danh sách blog thành công',
      result: {
        items: paginated,
        page,
        limit,
        total,
        totalPages,
        data
      }
    })
  } catch (e) {
    const err = e as Error
    sendResponse(res, {
      code: StatusCodes.BAD_REQUEST,
      message: err.message || 'Lỗi lấy danh sách blog',
      result: null
    })
  }
}

const getAllByInstructorId = async (req: Request, res: Response) => {
  try {
    const page = (req.data as any)?.page ?? (req.query.page ? Math.max(1, Number(req.query.page)) : 1)
    const limit =
      (req.data as any)?.limit ?? (req.query.limit ? Math.min(100, Math.max(1, Number(req.query.limit))) : 10)
    const search = (req.data as any)?.search ?? (req.query.q as string) ?? (req.query.search as string) ?? ''
    const instructorId = req.data.instructorId
    const blogs = await BlogService.getAll({ page, limit, search, instructorId })

    const data = await Promise.all(
      blogs.items.map(async (b) => {
        const user = await getUser(b.instructor_id)
        return {
          ...b,
          userName: user?.name || '',
          userAvt: user?.image || ''
        }
      })
    )

    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Lấy danh sách blog thành công',
      result: {
        ...blogs,
        data
      }
    })
  } catch (e) {
    const err = e as Error
    sendResponse(res, {
      code: StatusCodes.BAD_REQUEST,
      message: err.message || 'Lỗi lấy danh sách blog',
      result: null
    })
  }
}

const getNew = async (_req: Request, res: Response) => {
  try {
    const items = await BlogService.getNew(3)
    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Lấy blog mới nhất thành công',
      result: items
    })
  } catch (e) {
    const err = e as Error
    sendResponse(res, {
      code: StatusCodes.BAD_REQUEST,
      message: err.message || 'Lỗi lấy blog mới',
      result: null
    })
  }
}

const getTrending = async (_req: Request, res: Response) => {
  try {
    // Assumption: trending by updatedAt desc due to lack of view/like fields
    const items = await BlogService.getTrending(3)
    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Lấy blog thịnh hành thành công',
      result: items
    })
  } catch (e) {
    const err = e as Error
    sendResponse(res, {
      code: StatusCodes.BAD_REQUEST,
      message: err.message || 'Lỗi lấy blog thịnh hành',
      result: null
    })
  }
}

const getBlogDetails = async (req: Request, res: Response) => {
  try {
    const id = (req.data as any)?.id || (req.params?.id as string) || ''
    if (!id) throw new Error('Thiếu tham số id')

    const item = await BlogService.getDetails(id)
    if (!item) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND,
        message: 'Không tìm thấy blog',
        result: null
      })
    }

    const user = await getUser(item.instructor_id)

    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Lấy chi tiết blog thành công',
      result: {
        ...item,
        userName: user?.name || '',
        userAvt: user?.image || ''
      }
    })
  } catch (e) {
    const err = e as Error
    sendResponse(res, {
      code: StatusCodes.BAD_REQUEST,
      message: err.message || 'Lỗi lấy chi tiết blog',
      result: null
    })
  }
}

const createBlog = async (req: Request, res: Response) => {
  try {
    const { instructor_id, title, image_url, content, markdown_file_url } = (req.data as any) || (req.body as any)

    if (!instructor_id || !title || !image_url || !content) {
      throw new Error('Thiếu dữ liệu bắt buộc (instructor_id, title, image_url, content)')
    }

    const created = await BlogService.create({
      instructor_id,
      title,
      image_url,
      content,
      markdown_file_url: markdown_file_url || []
    })

    sendResponse(res, {
      code: StatusCodes.CREATED,
      message: 'Tạo blog thành công',
      result: created
    })
  } catch (e) {
    const err = e as Error
    sendResponse(res, {
      code: StatusCodes.BAD_REQUEST,
      message: err.message || 'Lỗi tạo blog',
      result: null
    })
  }
}

const update = async (req: Request, res: Response) => {
  try {
    const id = (req.data as any)?.id || (req.params?.id as string) || ''
    if (!id) throw new Error('Thiếu tham số id')

    const { title, image_url, content, markdown_file_url } = (req.data as any) || (req.body as any)

    const hasAny =
      typeof title === 'string' ||
      typeof image_url === 'string' ||
      typeof content === 'string' ||
      (Array.isArray(markdown_file_url) && markdown_file_url.length >= 0)

    if (!hasAny) throw new Error('Thiếu dữ liệu cần cập nhật')

    const updated = await BlogService.update(id, {
      title,
      image_url,
      content,
      markdown_file_url
    })

    if (!updated) {
      return sendResponse(res, {
        code: StatusCodes.NOT_FOUND,
        message: 'Không tìm thấy blog để cập nhật',
        result: null
      })
    }

    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Cập nhật blog thành công',
      result: updated
    })
  } catch (e) {
    const err = e as Error
    sendResponse(res, {
      code: StatusCodes.BAD_REQUEST,
      message: err.message || 'Lỗi cập nhật blog',
      result: null
    })
  }
}

const removeBlog = async (req: Request, res: Response) => {
  try {
    const id = (req.data as any)?.id || (req.params?.id as string) || ''
    if (!id) throw new Error('Thiếu tham số id')

    const result = await BlogService.remove(id)
    sendResponse(res, {
      code: StatusCodes.OK,
      message: result.deleted ? 'Xóa blog thành công' : 'Không tìm thấy blog để xóa',
      result
    })
  } catch (e) {
    const err = e as Error
    sendResponse(res, {
      code: StatusCodes.BAD_REQUEST,
      message: err.message || 'Lỗi xóa blog',
      result: null
    })
  }
}

const BlogController = {
  getAll,
  getAllByInstructorId,
  getNew,
  getTrending,
  getDetails: getBlogDetails,
  create: createBlog,
  update,
  remove: removeBlog
}

export default BlogController
