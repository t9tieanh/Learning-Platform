const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { BlogModel } = require('../models/blog/blog.model');

const GRPC_PORT = 9093;
const APP_HOST = process.env.APP_HOST || '0.0.0.0';

// __dirname và __filename có sẵn trong CommonJS
const PROTO_PATH = path.join(
    __dirname,
    '..', '..', '..', 'proto-shared', 'src', 'main', 'proto', 'courseService.proto'
);

// Load .proto
const packageDef = protoLoader.loadSync(PROTO_PATH, {
    includeDirs: [path.join(__dirname, '..', '..', '..', 'proto-shared', 'src', 'main', 'proto')],
});

const proto = grpc.loadPackageDefinition(packageDef);

const saleServiceImpl = {
//   getRevenueAndProfit: async (call, callback) => {
//     try {
//       const { coursesId, year } = call.request;

//       // Lấy profit theo tháng từ OrderItem
//       const raw = await OrderItem.aggregate([
//         {
//           $match: {
//             courseId: { $in: coursesId },
//             createdAt: {
//               $gte: new Date(`${year}-01-01T00:00:00Z`),
//               $lte: new Date(`${year}-12-31T23:59:59Z`)
//             }
//           }
//         },
//         {
//           $group: {
//             _id: { month: { $month: "$createdAt" } },
//             totalProfit: { $sum: "$price" }
//           }
//         },
//         { $sort: { "_id.month": 1 } }
//       ]);

//       // Map tháng → profit
//       const profitMap = {};
//       raw.forEach(item => {
//         profitMap[item._id.month] = item.totalProfit;
//       });

//       // Build 12 tháng
//       const dataList = [];
//       for (let month = 1; month <= 12; month++) {
//         const profit = profitMap[month] || 0;
//         const revenue = Math.round(profit * 0.1);

//         dataList.push({
//           month,
//           revenue,
//           profit
//         });
//       }

//       // Response đúng proto
//       callback(null, {
//         dataList: dataList
//       });

//     } catch (err) {
//       console.error("getRevenueAndProfit error:", err);
//       callback(err, null);
//     }
//   }
};


function startGrpcServer() {
    const server = new grpc.Server();
    console.log('start server');
    server.addService(proto.CourseService.service, saleServiceImpl);

    server.bindAsync(
        `${APP_HOST}:${GRPC_PORT}`,
        grpc.ServerCredentials.createInsecure(),
        () => {
            console.log(`gRPC server running at ${APP_HOST}:${GRPC_PORT}`);
        }
    );
}

module.exports = { startGrpcServer };