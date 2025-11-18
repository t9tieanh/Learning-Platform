const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
import prismaService from "~/service/utils/prisma.service";
import { Prisma } from '@prisma/client';

const GRPC_PORT = 9093;
const APP_HOST = process.env.APP_HOST || '0.0.0.0';

// __dirname và __filename có sẵn trong CommonJS
const PROTO_PATH = path.join(
    __dirname,
    '..', '..', '..', '..', 'proto-shared', 'src', 'main', 'proto', 'saleService.proto'
);

// Load .proto
const packageDef = protoLoader.loadSync(PROTO_PATH, {
    includeDirs: [path.join(__dirname, '..', '..', '..', '..', 'proto-shared', 'src', 'main', 'proto')],
});

const proto = grpc.loadPackageDefinition(packageDef);

const saleServiceImpl = {
    getRevenueAndProfit: async (call: any, callback: any) => {
        try {
            const { coursesId, year } = call.request;

            if (!year) throw new Error('Year is required');
            if (!Array.isArray(coursesId)) throw new Error('coursesId must be array');

            const monthRows: Array<{ month: number; revenue: number }> = await prismaService.$queryRaw(
                Prisma.sql`SELECT MONTH(oi.created_at) AS month, COALESCE(SUM(oi.price),0) AS revenue
                            FROM \`Order_Item\` oi
                            INNER JOIN \`Order\` o ON oi.order_id = o.id
                            WHERE oi.course_id IN (${Prisma.join(coursesId)})
                            AND YEAR(oi.created_at) = ${year.low}
                            GROUP BY MONTH(oi.created_at)`
            ) as any;


            const monthMap: Record<number, number> = {};
            for (const row of monthRows) {
                monthMap[row.month] = row.revenue;
            }

            // Xây danh sách 12 tháng. Định nghĩa: revenue = tổng giá bán, profit = 10% revenue (tuỳ chỉnh nếu cần)
            const dataList = [];
            for (let month = 1; month <= 12; month++) {
                const revenue = monthMap[month] || 0;
                const profit = Math.round(revenue + (revenue * 0.1));
                dataList.push({ month, revenue, profit });
            }

            callback(null, { dataList });
        } catch (err) {
            console.error('getRevenueAndProfit error:', err);
            callback(err, null);
        }
    }
};



function startGrpcServer() {
    const server = new grpc.Server();
    console.log('start server');
    server.addService(proto.SaleService.service, saleServiceImpl);

    server.bindAsync(
        `${APP_HOST}:${GRPC_PORT}`,
        grpc.ServerCredentials.createInsecure(),
        () => {
            console.log(`gRPC server running at ${APP_HOST}:${GRPC_PORT}`);
        }
    );
}

module.exports = { startGrpcServer };