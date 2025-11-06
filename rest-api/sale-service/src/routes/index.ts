import express, { Router, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import cartRouter from '~/routes/cart.route';

const IndexRouter: Router = express.Router()

IndexRouter.route('/status').get(async (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    message: 'Status Ok, Welcome to the Sale Service API'
  })
})

IndexRouter.use('/cart', cartRouter)


export default IndexRouter