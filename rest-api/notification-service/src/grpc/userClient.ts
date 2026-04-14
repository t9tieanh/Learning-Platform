import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import path from 'path'
import { env } from '~/config/env'

const PROTO_PATH = path.join(__dirname, '../../../proto-shared/src/main/proto/userService.proto')

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [path.join(__dirname, '../../../proto-shared/src/main/proto')]
})

interface UserGrpcProfile {
  id: string
  name: string
  image: string
  email?: string
  phone?: string
  description?: string
  username?: string
  roles?: string[]
}

interface GetBulkTeachersResponse {
  teachers: UserGrpcProfile[]
}

interface UserServiceClient {
  getUser(
    request: { id: string },
    callback: (err: grpc.ServiceError | null, response: UserGrpcProfile) => void
  ): void
  getTeacherDetail(
    request: { id: string },
    callback: (err: grpc.ServiceError | null, response: UserGrpcProfile) => void
  ): void
  getBulkTeachers(
    request: { teacher_ids: string[] },
    callback: (err: grpc.ServiceError | null, response: GetBulkTeachersResponse) => void
  ): void
}

const grpcObject = grpc.loadPackageDefinition(packageDef) as unknown as {
  UserService: new (address: string, credentials: grpc.ChannelCredentials) => UserServiceClient
}

export const userClient = new grpcObject.UserService(env.USER_GRPC_URL, grpc.credentials.createInsecure())

export const getUser = (userId: string) => {
  return new Promise<UserGrpcProfile>((resolve, reject) => {
    userClient.getUser({ id: userId }, (err, response) => {
      if (err) return reject(err)
      resolve(response)
    })
  })
}

export const getTeacherDetail = (teacherId: string) => {
  return new Promise<UserGrpcProfile>((resolve, reject) => {
    userClient.getTeacherDetail({ id: teacherId }, (err, response) => {
      if (err) return reject(err)
      resolve(response)
    })
  })
}

export const getUserBatch = (userIds: string[]) => {
  return new Promise<UserGrpcProfile[]>((resolve, reject) => {
    if (userIds.length === 0) {
      resolve([])
      return
    }

    userClient.getBulkTeachers({ teacher_ids: userIds }, (err, response) => {
      if (err) return reject(err)
      if (!response || !Array.isArray(response.teachers)) {
        resolve([])
        return
      }
      resolve(response.teachers)
    })
  })
}
