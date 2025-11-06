import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import path from 'path'

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
            console.error('CourseService not found in loaded proto. Available keys:', Object.keys(grpcObject))
            throw new Error('CourseService not found in proto definition')
        }

        this.courseClient = new CourseSvcCtor('localhost:9091', grpc.credentials.createInsecure())

        // quick readiness check (wait up to 5s)
        this.courseClient.waitForReady(Date.now() + 5000, (err: Error | null) => {
            if (err) {
                console.error('CourseService gRPC NOT ready:', err.message || err)
            } else {
                console.log('CourseService gRPC ready')
            }
        })
    }

    async getBulkCourses(courseIds: string[]): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            // with keepCase: true the request field name must match proto, e.g. "course_ids"
            const req = { course_ids: courseIds }
            this.courseClient.getBulkCourses(req, (err: any, response: any) => {
                if (err) {
                    console.error('grpc getBulkCourses error:', err)
                    return reject(err)
                }
                resolve(response)
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

export default new CourseGrpcClient()