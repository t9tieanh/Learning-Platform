import mongoose from 'mongoose'
import { env } from '~/config/env'

const CONNECT_DB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      dbName: env.DATABASE_NAME
    })
    console.log('Mongoose connected')
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

export default CONNECT_DB
