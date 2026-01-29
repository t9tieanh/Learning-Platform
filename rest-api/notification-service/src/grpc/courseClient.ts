import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import path from 'path'
import { env } from '~/config/env'
import Logger from '~/utils/logger'

class CourseGrpcClient {
  courseClient: any

  constructor() {
    const PROTO_PATH = path.join(__dirname, '../../../proto-shared/src/main/proto/courseService.proto')
    const packageDef = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
      includeDirs: [path.join(__dirname, '../../../proto-shared/src/main/proto')]
    })
    const grpcObject = grpc.loadPackageDefinition(packageDef) as any

    // try to find service under package name (e.g. grpcObject.course) or top-level
    const CourseSvcCtor = grpcObject.course?.CourseService ?? grpcObject.CourseService

    if (!CourseSvcCtor) {
      Logger.error(`CourseService not found in loaded proto. Available keys: ${Object.keys(grpcObject)}`)
      throw new Error('CourseService not found in proto definition')
    }

    this.courseClient = new CourseSvcCtor(env.COURSE_GRPC_URL, grpc.credentials.createInsecure())

    // quick readiness check (wait up to 5s)
    this.courseClient.waitForReady(Date.now() + 5000, (err: Error | null) => {
      if (err) {
        Logger.error(`CourseService gRPC NOT ready: ${err.message || err}`)
      } else {
        Logger.info('CourseService gRPC ready')
      }
    })
  }

  async checkHasPurchased(courseId: string, userId: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const req = { courseId, userId }
      this.courseClient.checkHasPurchased(req, (err: any, response: any) => {
        if (err) {
          Logger.error(`grpc checkHasPurchased error: ${err}`)
          return reject(err)
        }

        if (!response || typeof response.hasPurchased !== 'boolean') {
          Logger.warn(`grpc checkHasPurchased: invalid response, returning false ${JSON.stringify(response)}`)
          return resolve(false)
        }

        resolve(response.hasPurchased)
      })
    })
  }

  // Update course rating
  async updateCourseRating(courseId: string, newRating: number): Promise<boolean> {
    {
      return new Promise<boolean>((resolve, reject) => {
        const req = { courseId, rating: newRating }
        this.courseClient.updateCourseRating(req, (err: any, response: any) => {
          if (err) {
            Logger.error(`grpc updateCourseRating error: ${err}`)
            resolve(false)
          }
          resolve(response.isSucces)
        })
      })
    }
  }

  async isReady(timeoutMs = 5000): Promise<boolean> {
    return new Promise((resolve) => {
      this.courseClient.waitForReady(Date.now() + timeoutMs, (err: Error | null) => {
        resolve(!err)
      })
    })
  }
}

export default new CourseGrpcClient()
