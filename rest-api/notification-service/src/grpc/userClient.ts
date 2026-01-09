/* eslint-disable @typescript-eslint/no-explicit-any */
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

const grpcObject = grpc.loadPackageDefinition(packageDef) as any

export const userClient = new grpcObject.UserService(env.USER_GRPC_URL, grpc.credentials.createInsecure())

export const getUser = (userId: string) => {
  return new Promise<any>((resolve, reject) => {
    userClient.getUser({ id: userId }, (err: any, response: any) => {
      if (err) return reject(err)
      resolve(response)
    })
  })
}
