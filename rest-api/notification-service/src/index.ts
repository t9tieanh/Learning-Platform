import express from 'express'
import 'reflect-metadata'
import { CONNECT_DATABASES } from './config/connect'
import { env } from '~/config/env'
import { errorHandlingMiddleware } from '~/middleware/error-handler.midleware'
import http from 'http'
import { seedAll } from './seed/seedAll'
import router from '~/routes/index'

const START_SERVER = async () => {
  const app = express()

  app.use(express.json())

  app.use('/notify', router)
  app.use(errorHandlingMiddleware)

  app.get('/seeds-data', async (_req, res) => {
    await seedAll()
    res.status(200).json({ message: 'Seed data successfully!' })
  })

  // tạo server duy nhất
  const server = http.createServer(app)

  // start listen
  const hostname = env.APP_HOST
  const port = Number(env.APP_PORT)

  server.listen(port, hostname, () => {
    console.log(`Server đang chạy trên: ${hostname}:${port}/`)
  })
}

CONNECT_DATABASES()
  .then(() => console.log('Database connected successfully'))
  .then(() => START_SERVER())
  .catch((err) => {
    console.error('Database connection failed:', err)
    process.exit(1)
  })
