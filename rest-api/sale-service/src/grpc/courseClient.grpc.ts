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
        const CourseSvcCtor =
            grpcObject.course?.CourseService ??
            grpcObject.CourseService

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

    async getBulkCourses(courseIds: string[]): Promise<CourseDto[]> {
        return new Promise<CourseDto[]>((resolve, reject) => {
            const req = { course_ids: courseIds }
            this.courseClient.getBulkCourses(req, (err: any, response: any) => {
                if (err) {
                    Logger.error(`grpc getBulkCourses error: ${err}`)
                    return reject(err)
                }

                if (!response || !Array.isArray(response.courses)) {
                    Logger.warn(`grpc getBulkCourses: invalid response, returning empty array ${JSON.stringify(response)}`)
                    return resolve([])
                }

                // return courses exactly as the service returned them
                resolve(response.courses as CourseDto[])
            })
        })
    }

    // check is Instructor
    async isInstructor(courseId: string, userId: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const req = { courseId: courseId, userId: userId }
            this.courseClient.isInstructor(req, (err: any, response: any) => {
                if (err) {
                    Logger.error(`grpc isInstructor error: ${err}`)
                    return reject(err)
                }

                if (!response || typeof response.isInstructor !== 'boolean') {
                    Logger.warn(`grpc isInstructor: invalid response, returning false ${JSON.stringify(response)}`)
                    return resolve(false)
                }

                resolve(response.isInstructor)
            })
        })
    }

    // optional helper to await readiness from elsewhere
    async isReady(timeoutMs = 5000): Promise<boolean> {
        return new Promise((resolve) => {
            this.courseClient.waitForReady(Date.now() + timeoutMs, (err: Error | null) => {
                resolve(!err)
            })
        })
    }
}

export interface CourseDto {
    id: string;
    title: string;
    short_description: string;
    long_description: string;
    thumbnail_url: string;
    rating: number;
    introductory_video: string;
    language: string;
    original_price: number;
    final_price: number;
    instructor: {
        id: string;
        name: string;
        email: string;
        image: string;
    };
}

export default new CourseGrpcClient()