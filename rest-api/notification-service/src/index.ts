/* eslint-disable @typescript-eslint/no-require-imports */
import express from 'express'
import 'reflect-metadata'
import { CONNECT_DATABASES } from './config/connect'
import { env } from '~/config/env'
import { errorHandlingMiddleware } from '~/middleware/error-handler.midleware'
import http from 'http'
import { initSagas } from '~/sagas/init/initSaga'
import router from '~/routes/index'
const { startGrpcServer } = require('./grpc/notifyServer')

const START_SERVER = async () => {
  const app = express()

  // app.use(express.json())
  app.use(express.json({ limit: '10mb' }))
  app.use('/notify', router)
  app.use(errorHandlingMiddleware)

  await initSagas()

  const server = http.createServer(app)
  startGrpcServer()
  // start listen
  const hostname = env.APP_HOST
  const port = Number(env.APP_PORT)

  server.listen(port, hostname, () => {
    console.log(`Hello, Learnova:notification_service running at: ${hostname}:${port}/`)
  })
}

CONNECT_DATABASES()
  .then(() => console.log('Database connected successfully'))
  .then(() => START_SERVER())
  .catch((err) => {
    console.error('Database connection failed:', err)
    process.exit(1)
  })
