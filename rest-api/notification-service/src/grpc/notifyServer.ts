const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { BlogModel } = require('../models/blog/blog.model');
import { saveToSupabase } from "~/utils/supabase";
import AiChatService from "~/services/aiChat.service";

const GRPC_PORT = 9092;
const APP_HOST = process.env.APP_HOST || '0.0.0.0';

// __dirname và __filename có sẵn trong CommonJS
const PROTO_PATH = path.join(
    __dirname,
    '..', '..', '..', 'proto-shared', 'src', 'main', 'proto', 'blogService.proto'
);

// Load .proto
const packageDef = protoLoader.loadSync(PROTO_PATH, {
    includeDirs: [path.join(__dirname, '..', '..', '..', 'proto-shared', 'src', 'main', 'proto')],
});

const proto = grpc.loadPackageDefinition(packageDef);

const blogServiceImpl = {
    getTotalBlog: async (call: any, callback: any) => {
        console.log('Received request for total blogs');
        const totalBlog = await BlogModel.countDocuments();
        callback(null, { total: totalBlog.toString() });
    },

    getTotalInstructorBlog: async (call: any, callback: any) => {
        console.log('Received request for total INSTRUCTOR blogs');
        console.log('call', call.request);
        const userId = call.request.id;
        const totalInstructorBlog = await BlogModel.countDocuments({ instructor_id: userId })
        callback(null, { total: totalInstructorBlog.toString() })
    },

    pushCourseSupabase: async (call: any, callback: any) => {
        const { id, name, description, tags = [], link } = call.request;
        const text = `${name} - ${tags}\n${description}`;
        const embedding = await AiChatService.generateEmbedding(text);
        const res = await saveToSupabase(id, name, description, tags, link, embedding);
        callback(null, { isSuccess: res })
    }
};


function startGrpcServer() {
    const server = new grpc.Server();
    console.log('start server');
    server.addService(proto.BlogService.service, blogServiceImpl);

    server.bindAsync(
        `${APP_HOST}:${GRPC_PORT}`,
        grpc.ServerCredentials.createInsecure(),
        () => {
            console.log(`gRPC server running at ${APP_HOST}:${GRPC_PORT}`);
        }
    );
}

module.exports = { startGrpcServer };
