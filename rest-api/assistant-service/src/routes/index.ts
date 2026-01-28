import express, { Router, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import chatbotRouter from '~/routes/chatbot.route'
import webhookRouter from '~/routes/webhook.route'

import transcriptionRouter from '~/routes/transcription.route'

const IndexRouter: Router = express.Router()

IndexRouter.use('/', chatbotRouter)
IndexRouter.use('/transcription', transcriptionRouter)
IndexRouter.use('/webhook', webhookRouter)

IndexRouter.route('/status').get(async (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    message: 'Status Ok, Welcome to the Sale Service API'
  })
})

export default IndexRouter