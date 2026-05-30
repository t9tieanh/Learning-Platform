const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
import prismaService from "~/service/utils/prisma.service";
import { Prisma } from '@prisma/client';
import Logger from '~/utils/logger';

const GRPC_PORT = 50053;
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
const safeJson = (value: unknown) =>
    JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? v.toString() : v));

const saleServiceImpl = {
    getRevenueAndProfit: async (call: any, callback: any) => {
        try {
            const { coursesId, year } = call.request;

            if (!year) throw new Error('Year is required');
            if (!Array.isArray(coursesId)) throw new Error('coursesId must be array');
            const normalizedYear = Number((year as any)?.low ?? year);
            if (!Number.isInteger(normalizedYear)) throw new Error('Year must be a valid integer');

            if (coursesId.length === 0) {
                Logger.info(`[getRevenueAndProfit] no courses for year=${normalizedYear}`);
                const emptyDataList = Array.from({ length: 12 }, (_, i) => ({
                    month: i + 1,
                    revenue: 0,
                    profit: 0,
                }));
                callback(null, { dataList: emptyDataList });
                return;
            }

            const monthRows: Array<{ month: number; revenue: number }> = await prismaService.$queryRaw(
                Prisma.sql`SELECT MONTH(oi.created_at) AS month, COALESCE(SUM(oi.price),0) AS revenue
                            FROM \`order_items\` oi
                            INNER JOIN \`orders\` o ON oi.order_id = o.id
                            WHERE oi.course_id IN (${Prisma.join(coursesId)})
                            AND o.status = 'Completed'
                            AND YEAR(oi.created_at) = ${normalizedYear}
                            GROUP BY MONTH(oi.created_at)`
            ) as any;
            Logger.info(
                `[getRevenueAndProfit] year=${normalizedYear}, courseCount=${coursesId.length}, monthRows=${monthRows.length}, sample=${safeJson(monthRows[0] || null)}`
            );


            const monthMap: Record<number, number> = {};
            for (const row of monthRows) {
                monthMap[row.month] = row.revenue;
            }

            const dataList = [];
            for (let month = 1; month <= 12; month++) {
                const rawRevenue = Number(monthMap[month] ?? 0);
                const revenue = Number((rawRevenue).toFixed(2));
                const profit = Number((revenue * 0.8).toFixed(2));

                dataList.push({ month, revenue, profit });
            }

            callback(null, { dataList });
        } catch (err) {
            Logger.error(`getRevenueAndProfit error: ${err}`);
            callback(err, null);
        }
    },
    getCompletedCourseIds: async (call: any, callback: any) => {
        try {
            const { coursesId } = call.request;
            if (!Array.isArray(coursesId)) throw new Error('coursesId must be array');
            if (coursesId.length === 0) {
                callback(null, { courseIds: [] });
                return;
            }

            const rows: Array<{ course_id: string }> = await prismaService.$queryRaw(
                Prisma.sql`SELECT DISTINCT oi.course_id
                           FROM \`order_items\` oi
                           INNER JOIN \`orders\` o ON oi.order_id = o.id
                           WHERE oi.course_id IN (${Prisma.join(coursesId)})
                             AND o.status = 'Completed'`
            ) as any;

            callback(null, { courseIds: rows.map((r) => r.course_id) });
        } catch (err) {
            Logger.error(`getCompletedCourseIds error: ${err}`);
            callback(err, null);
        }
    },
    getTopCoursesRevenue: async (call: any, callback: any) => {
        try {
            const { coursesId, year, limit } = call.request;
            if (!Array.isArray(coursesId)) throw new Error('coursesId must be array');

            const normalizedYear = Number((year as any)?.low ?? year);
            if (!Number.isInteger(normalizedYear)) throw new Error('Year must be a valid integer');

            const normalizedLimit = Number((limit as any)?.low ?? limit ?? 5);
            const topLimit = Number.isInteger(normalizedLimit) && normalizedLimit > 0 ? normalizedLimit : 5;

            if (coursesId.length === 0) {
                callback(null, { items: [] });
                return;
            }

            const rows: Array<{ courseId: string; revenue: number }> = await prismaService.$queryRaw(
                Prisma.sql`SELECT oi.course_id AS courseId,
                                  COALESCE(SUM(oi.price), 0) AS revenue
                           FROM \`order_items\` oi
                           INNER JOIN \`orders\` o ON oi.order_id = o.id
                           WHERE oi.course_id IN (${Prisma.join(coursesId)})
                             AND o.status = 'Completed'
                             AND YEAR(oi.created_at) = ${normalizedYear}
                           GROUP BY oi.course_id
                           ORDER BY revenue DESC
                           LIMIT ${topLimit}`
            ) as any;

            callback(null, {
                items: rows.map((r) => ({
                    courseId: r.courseId,
                    revenue: Number(Number(r.revenue ?? 0).toFixed(2)),
                })),
            });
        } catch (err) {
            Logger.error(`getTopCoursesRevenue error: ${err}`);
            callback(err, null);
        }
    }
};



function startGrpcServer() {
    const server = new grpc.Server();
    Logger.info('start server');
    server.addService(proto.SaleService.service, saleServiceImpl);

    server.bindAsync(
        `${APP_HOST}:${GRPC_PORT}`,
        grpc.ServerCredentials.createInsecure(),
        () => {
            Logger.info(`gRPC server running at ${APP_HOST}:${GRPC_PORT}`);
        }
    );
}

module.exports = { startGrpcServer };
