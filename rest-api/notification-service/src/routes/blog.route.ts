import { Router } from 'express'
import BlogController from '~/controllers/blogcontroller'
import { ValidateDto } from '~/middleware'
import { CreateBlogDTO, GetBlogDetailsDTO, GetBlogsDTO, GetNewBlogsDTO, GetTrendingBlogsDTO, UpdateBlogDTO, DeleteBlogDTO } from '~/dto/request/blog.dto'

const router = Router()

// List all with pagination & search
router.get('/all', ValidateDto(GetBlogsDTO), BlogController.getAll)

// Latest 3
router.get('/new', BlogController.getNew)

// Trending 3 (by updatedAt desc)
router.get('/trending', BlogController.getTrending)

// Details by id (query: ?id=...)
router.get('/details/:id', ValidateDto(GetBlogDetailsDTO), BlogController.getDetails)

// Create a blog post (PRIVATE)
router.post('/create', ValidateDto(CreateBlogDTO), BlogController.create)

// Update a blog post
router.patch('/update/:id', ValidateDto(UpdateBlogDTO), BlogController.update)

// Delete a blog post
router.delete('/:id', ValidateDto(DeleteBlogDTO), BlogController.remove)

export default router