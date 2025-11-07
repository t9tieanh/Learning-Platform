import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import path from 'path'
import { UserGrpc } from '~/dto/grpc/user.dto';

class UserGrpcClient {
    userClient: any

    constructor() {
        const PROTO_PATH = path.join(__dirname, '../../../proto-shared/src/main/proto/userService.proto')
        const packageDef = protoLoader.loadSync(PROTO_PATH, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
            includeDirs: [path.join(__dirname, '../../../proto-shared/src/main/proto')]
        })
        const grpcObject = grpc.loadPackageDefinition(packageDef) as any

        // try to find service under package name (e.g. grpcObject.user) or top-level
        const UserSvcCtor =
            grpcObject.user?.UserService ??
            grpcObject.UserService

        if (!UserSvcCtor) {
            console.error('UserService not found in loaded proto. Available keys:', Object.keys(grpcObject))
            throw new Error('UserService not found in proto definition')
        }

        this.userClient = new UserSvcCtor('localhost:9090', grpc.credentials.createInsecure())

        // quick readiness check (wait up to 5s)
        this.userClient.waitForReady(Date.now() + 5000, (err: Error | null) => {
            if (err) {
                console.error('UserService gRPC NOT ready:', err.message || err)
            } else {
                console.log('UserService gRPC ready')
            }
        })
    }

    async GetBulkTeachers(teacherIds: string[]): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            // with keepCase: true the request field name must match proto, e.g. "teacher_ids"
            const req = { teacher_ids: teacherIds }
            this.userClient.getBulkTeachers(req, (err: any, response: any) => {
                if (err) {
                    console.error('grpc getBulkTeachers error:', err)
                    return reject(err)
                }
                resolve(response)
            })
        })
    }

    async getUser(userId: string): Promise<UserGrpc> {
        return new Promise<UserGrpc>((resolve, reject) => {
            const req = { id: userId }
            this.userClient.getUser(req, (err: any, response: any) => {
                if (err) {
                    console.error('grpc getUser error:', err)
                    return reject(err)
                }
                resolve(response as UserGrpc)
            })
        })
    }

    // optional helper to await readiness from elsewhere
    async isReady(timeoutMs = 5000): Promise<boolean> {
        return new Promise((resolve) => {
            this.userClient.waitForReady(Date.now() + timeoutMs, (err: Error | null) => {
                resolve(!err)
            })
        })
    }
}

export default new UserGrpcClient()