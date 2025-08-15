import dotenv from 'dotenv'
dotenv.config()

export const env = {
  MONGODB_URI: process.env.MONGODB_URI as string,
  APP_HOST: process.env.APP_HOST || 'localhost',
  APP_PORT: process.env.APP_PORT || 8017,
  DATABASE_NAME: process.env.DATABASE_NAME || 'freeclassroom',
  BUILD_MODE: process.env.NODE_ENV || 'dev',
  APP_SECRET: process.env.APP_SECRET as string,
  ACCESS_TOKEN_EXPIRES_IN: (process.env.ACCESS_TOKEN_EXPIRES_IN as string) || '15m',
  REFRESH_TOKEN_EXPIRES_IN: (process.env.REFRESH_TOKEN_EXPIRES_IN as string) || '7d',
  GOOGLE_OAUTH_CLIENT_ID: (process.env.GOOGLE_OAUTH_CLIENT_ID as string) || '',
  GOOGLE_OAUTH_REDIRECT: (process.env.GOOGLE_OAUTH_REDIRECT as string) || '',
  GOOGLE_OAUTH_CLIENT_SECRET: (process.env.GOOGLE_OAUTH_CLIENT_SECRET as string) || '',
  FRONTEND_ORIGIN: (process.env.FRONTEND_ORIGIN as string) || '',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  REDIS_HOST: process.env.REDIS_HOST || '',
  REDIS_PORT: process.env.REDIS_PORT || 18831,
  REDIS_USERNAME: process.env.REDIS_USERNAME,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  GMAIL_USER: process.env.GMAIL_USER || 'phama9162@gmail.com',
  GMAIL_PASS: process.env.GMAIL_PASS || 'doi la the thoi - phu le',
  RABBIT_MQ_HOST: process.env.RABBIT_MQ_HOST,
  RABBIT_MQ_PORT: process.env.RABBIT_MQ_PORT,
  RABBIT_MQ_USER_NAME: process.env.RABBIT_MQ_USER_NAME,
  RABBIT_MQ_PASSWORD: process.env.RABBIT_MQ_PASSWORD
}
