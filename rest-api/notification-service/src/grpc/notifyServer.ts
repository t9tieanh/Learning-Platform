const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
const path = require('path')
const { BlogModel } = require('../models/blog/blog.model')
import { env } from '~/config/env'
const feedbackServiceModule = require('../services/feedback.service')
const feedbackService = (feedbackServiceModule && feedbackServiceModule.default) || feedbackServiceModule

const GRPC_PORT = env.NOTIFICATION_POST || 9092
const APP_HOST = env.APP_HOST || '0.0.0.0'

const PROTO_PATH = path.join(__dirname, '..', '..', '..', 'proto-shared', 'src', 'main', 'proto', 'blogService.proto')

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  includeDirs: [path.join(__dirname, '..', '..', '..', 'proto-shared', 'src', 'main', 'proto')]
})

const proto = grpc.loadPackageDefinition(packageDef)

const blogServiceImpl = {
  getTotalBlog: async (call: any, callback: any) => {
    console.log('Received request for total blogs')
    const totalBlog = await BlogModel.countDocuments()
    callback(null, { total: totalBlog.toString() })
  },

  getTotalInstructorBlog: async (call: any, callback: any) => {
    console.log('Received request for total INSTRUCTOR blogs')
    console.log('call', call.request)
    const userId = call.request.id
    const totalInstructorBlog = await BlogModel.countDocuments({ instructor_id: userId })
    callback(null, { total: totalInstructorBlog.toString() })
  },

  getFeedbackByCourseId: async (call: any, callback: any) => {
    const courseId = call.request.courseId
    try {
      const feedbacks = await feedbackService.getFeedbackByCourseId(courseId)
      callback(null, { feedbacks })
    } catch (error) {
      console.error('Error in getFeedbackByCourseId:', error)
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error'
      })
    }
  }
}

function findBlogService(protoRoot: any) {
  if (!protoRoot) return null
  if (protoRoot.BlogService) return protoRoot.BlogService
  // check first-level namespaces
  for (const key of Object.keys(protoRoot)) {
    const ns = protoRoot[key]
    if (ns && ns.BlogService) return ns.BlogService
  }
  return null
}

function startGrpcServer() {
  const server = new grpc.Server()
  console.log('start server')

  const blogService = findBlogService(proto)
  if (!blogService) {
    console.error('Failed to find BlogService in loaded proto. Available top-level keys:', Object.keys(proto))
    // Optional: dump structure for debugging (avoid huge logs in production)
    for (const k of Object.keys(proto)) {
      const child = proto[k]
      console.error(`- ${k}:`, child && typeof child === 'object' ? Object.keys(child) : typeof child)
    }
    throw new Error(
      'BlogService not found in proto definition. Check PROTO_PATH and package/service names in .proto file.'
    )
  }

  // blogService may already be the service definition or contain .service
  const serviceDef = blogService.service || blogService
  server.addService(serviceDef, blogServiceImpl)

  server.bindAsync(`${APP_HOST}:${GRPC_PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`gRPC Notification server running at ${APP_HOST}:${GRPC_PORT}`)
  })
}

module.exports = { startGrpcServer }
