import express, { Router } from 'express'
import FeedbackRoute from './feedback.route'
import ChatRoute from './chat.route'
import authen from '~/middleware/authen.middleware'

const IndexRouter: Router = express.Router()

IndexRouter.use(authen)

IndexRouter.use('/feedback', FeedbackRoute)
IndexRouter.use('/chat', ChatRoute)

export default IndexRouter
