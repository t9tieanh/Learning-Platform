import express, { Router, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import chatbotRouter from '~/routes/chatbot.route'
import webhookRouter from '~/routes/webhook.route'
import testRouter from '~/routes/test.route'
import transcriptionRouter from '~/routes/transcription.route'
import analysisRouter from '~/routes/analysis.route'
import quizRouter from '~/routes/quiz.route'

const IndexRouter: Router = express.Router()

IndexRouter.use('/', chatbotRouter)
IndexRouter.use('/transcription', transcriptionRouter)
IndexRouter.use('/webhook', webhookRouter)
IndexRouter.use('/test', testRouter)
IndexRouter.use('/analysis', analysisRouter)
IndexRouter.use('/quizzes', quizRouter)

IndexRouter.route('/status').get(async (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    message: 'Status Ok, Welcome to the Sale Service API'
  })
})

export default IndexRouter