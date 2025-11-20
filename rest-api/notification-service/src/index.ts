import express from 'express'
import 'reflect-metadata'
import { CONNECT_DATABASES } from './config/connect'
import { env } from '~/config/env'
import { errorHandlingMiddleware } from '~/middleware/error-handler.midleware'
import http from 'http'
import { initSagas } from '~/sagas/init/initSaga'
import router from '~/routes/index'
const { startGrpcServer } = require('../src/grpc/notifyServer')


import AiChatService from './services/aiChat.service'
import { seedCourses } from './utils/mockCourse'

const START_SERVER = async () => {
  const app = express()

  // app.use(express.json())
  app.use(express.json({ limit: '10mb' }));
  app.use('/notify', router)
  app.use(errorHandlingMiddleware)

  await initSagas()

  // tạo server duy nhất
  const server = http.createServer(app)
  startGrpcServer();
  // start listen
  const hostname = env.APP_HOST
  const port = Number(env.APP_PORT)

  server.listen(port, hostname, () => {
    console.log(`Server đang chạy trên: ${hostname}:${port}/`)
  })
}

// const start = async () => {
//   try {
//     await AiChatService.testChat();
//     console.log("Hoàn tất kiểm tra AI Chat Service ✅");
//   } catch (error) {
//     console.error("Đã xảy ra lỗi:", error);
//   }
// };

CONNECT_DATABASES()
  .then(() => console.log('Database connected successfully'))
  .then(() => START_SERVER())
  .catch((err) => {
    console.error('Database connection failed:', err)
    process.exit(1)
  })
