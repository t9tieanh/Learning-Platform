import mongoose from 'mongoose'
import { env } from '~/config/env'
import Logger from '~/utils/logger'

const CONNECT_DB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      dbName: env.DATABASE_NAME
    })
    Logger.info('Mongoose connected')
  } catch (err) {
    Logger.error(`${err}`)
    process.exit(1)
  }
}

export default CONNECT_DB
