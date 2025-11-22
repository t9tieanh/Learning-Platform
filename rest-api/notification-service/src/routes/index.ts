import express, { Router } from 'express'
import FeedbackRoute from './feedback.route'
import ChatRoute from './chat.route'
import BlogRoute from './blog.route'
import AiChatRoute from './aiChat.route'
import authen from '~/middleware/authen.middleware'

const IndexRouter: Router = express.Router()

// Apply auth only where needed. Feedback and Chat remain protected; Blog has mixed public/private routes.
IndexRouter.use('/feedback', authen, FeedbackRoute)
IndexRouter.use('/chat', authen, ChatRoute)
IndexRouter.use('/blog', BlogRoute)
IndexRouter.use('/ai', AiChatRoute)

export default IndexRouter
