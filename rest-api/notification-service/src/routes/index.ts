import express, { Router } from 'express'
import FeedbackRoute from './feedback.route'
import authen from '~/middleware/authen.middleware'

const IndexRouter: Router = express.Router()

IndexRouter.use(authen)

IndexRouter.use('/feedback', FeedbackRoute)

export default IndexRouter
