import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import sendResponse from '~/dto/response/send-response'
import BlogService from '~/services/blog.service'
import { getUserBatch, getTeacherDetail } from '~/grpc/userClient'

interface BlogResponseItem {
  _id: string
  instructor_id: string
  instructor_name: string
  instructor_image: string
  title: string
  image_url: string
  content: string
  markdown_file_url: string[]
  createdAt: Date
  updatedAt: Date
}

interface UserProfile {
  id: string
  name: string
  image: string
}

interface PaginationParams {
  page: number
  limit: number
}

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

const parseIntegerParam = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.floor(value)
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return Math.floor(parsed)
    }
  }

  return null
}

export const parsePaginationParams = (req: Request): PaginationParams => {
  const data = req.data
  const dataRecord = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {}

  const dataPage = parseIntegerParam(dataRecord.page)
  const queryPage = parseIntegerParam(req.query.page)
  const rawPage = dataPage !== null ? dataPage : queryPage
  const page = rawPage !== null && rawPage > 0 ? rawPage : DEFAULT_PAGE

  const dataLimit = parseIntegerParam(dataRecord.limit)
  const queryLimit = parseIntegerParam(req.query.limit)
  const rawLimit = dataLimit !== null ? dataLimit : queryLimit
  const limited = rawLimit !== null && rawLimit > 0 ? rawLimit : DEFAULT_LIMIT
  const limit = limited > MAX_LIMIT ? MAX_LIMIT : limited

  return { page, limit }
}

export const parseSearchParam = (req: Request): string => {
  const data = req.data
  if (typeof data === 'object' && data !== null) {
    const dataRecord = data as Record<string, unknown>
    if (typeof dataRecord.search === 'string') {
      return dataRecord.search.trim()
    }
  }

  if (typeof req.query.q === 'string') {
    return req.query.q.trim()
  }

  if (typeof req.query.search === 'string') {
    return req.query.search.trim()
  }

  return ''
}

const enrichMissingInstructorSnapshot = async (items: BlogResponseItem[]): Promise<BlogResponseItem[]> => {
  const uniqueIds: string[] = []
  const seen: Record<string, true> = {}

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i]
    const hasName = typeof item.instructor_name === 'string' && item.instructor_name.trim().length > 0
    const hasImage = typeof item.instructor_image === 'string' && item.instructor_image.trim().length > 0
    const shouldHydrate = !hasName || !hasImage

    if (shouldHydrate && !seen[item.instructor_id]) {
      seen[item.instructor_id] = true
      uniqueIds.push(item.instructor_id)
    }
  }

  if (uniqueIds.length === 0) {
    return items
  }

  const users = await getUserBatch(uniqueIds)
  const userMap: Record<string, UserProfile> = {}

  for (let i = 0; i < users.length; i += 1) {
    const user = users[i]
    userMap[user.id] = {
      id: user.id,
      name: typeof user.name === 'string' ? user.name : '',
      image: typeof user.image === 'string' ? user.image : ''
    }
  }

  const enriched: BlogResponseItem[] = []
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i]
    const user = userMap[item.instructor_id]

    if (!user) {
      enriched.push(item)
      continue
    }

    const instructorName =
      typeof item.instructor_name === 'string' && item.instructor_name.trim().length > 0 ? item.instructor_name : user.name
    const instructorImage =
      typeof item.instructor_image === 'string' && item.instructor_image.trim().length > 0
        ? item.instructor_image
        : user.image

    enriched.push({
      ...item,
      instructor_name: instructorName,
      instructor_image: instructorImage
    })
  }

  return enriched
}

const getAll = async (req: Request, res: Response) => {
  try {
    const { page, limit } = parsePaginationParams(req)
    const search = parseSearchParam(req)
    const blogs = await BlogService.getAll({ page, limit, search })
    const items = await enrichMissingInstructorSnapshot(blogs.items as BlogResponseItem[])

    return sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Lấy danh sách blog thành công',
      result: {
        items,
        page: blogs.page,
        limit: blogs.limit,
        total: blogs.total,
        totalPages: blogs.totalPages
      }
    })
  } catch (e) {
    console.error('[BlogController.getAll] Unexpected error', e)
    sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Lỗi hệ thống khi lấy danh sách blog',
      result: null
    })
  }
}

const getAllByInstructorId = async (req: Request, res: Response) => {
  try {
    const { page, limit } = parsePaginationParams(req)
    const search = parseSearchParam(req)
    const data = req.data
    const dataRecord = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {}
    const instructorId = typeof dataRecord.instructorId === 'string' ? dataRecord.instructorId : ''
    const blogs = await BlogService.getAll({ page, limit, search, instructorId })
    const items = await enrichMissingInstructorSnapshot(blogs.items as BlogResponseItem[])

    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Lấy danh sách blog thành công',
      result: {
        items,
        page: blogs.page,
        limit: blogs.limit,
        total: blogs.total,
        totalPages: blogs.totalPages
      }
    })
  } catch (e) {
    console.error('[BlogController.getAllByInstructorId] Unexpected error', e)
    sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Lỗi hệ thống khi lấy danh sách blog',
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

    let instructorName = typeof item.instructor_name === 'string' ? item.instructor_name : ''
    let instructorImage = typeof item.instructor_image === 'string' ? item.instructor_image : ''

    try {
      const teacher = await getTeacherDetail(item.instructor_id)
      if (teacher && typeof teacher.name === 'string' && teacher.name.trim().length > 0) {
        instructorName = teacher.name
      }
      if (teacher && typeof teacher.image === 'string' && teacher.image.trim().length > 0) {
        instructorImage = teacher.image
      }
    } catch (teacherErr) {
      // Keep blog details available even when user-service cannot find the instructor.
      console.error('[BlogController.getBlogDetails] getTeacherDetail failed, fallback to denormalized fields', teacherErr)
    }

    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Lấy chi tiết blog thành công',
      result: {
        ...item,
        instructor_name: instructorName,
        instructor_image: instructorImage,
        userName: instructorName,
        userAvt: instructorImage
      }
    })
  } catch (e) {
    console.error('[BlogController.getBlogDetails] Unexpected error', e)
    sendResponse(res, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Lỗi hệ thống khi lấy chi tiết blog',
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

    let instructorName = ''
    let instructorImage = ''
    try {
      const teacher = await getTeacherDetail(instructor_id)
      if (teacher && typeof teacher.name === 'string') {
        instructorName = teacher.name
      }
      if (teacher && typeof teacher.image === 'string') {
        instructorImage = teacher.image
      }
    } catch (userErr) {
      console.error('[BlogController.createBlog] getTeacherDetail failed, creating with empty instructor snapshot', userErr)
    }

    const created = await BlogService.create({
      instructor_id,
      instructor_name: instructorName,
      instructor_image: instructorImage,
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
