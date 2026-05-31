import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { env } from '~/config/env';
import Logger from '~/utils/logger';
import lessonTestEligibilityService from '~/service/lessonTest/lessonTestEligibility.service';

const PROTO_PATH = path.join(__dirname, '../../../proto-shared/src/main/proto/assistantService.proto');
const PROTO_INCLUDE = path.join(__dirname, '../../../proto-shared/src/main/proto');

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [PROTO_INCLUDE],
});

const grpcObject = grpc.loadPackageDefinition(packageDef) as grpc.GrpcObject;

function findAssistantService(root: grpc.GrpcObject): grpc.ServiceDefinition | null {
  if (!root) return null;
  const direct = root.AssistantService as grpc.ServiceDefinition | undefined;
  if (direct) return direct;
  for (const key of Object.keys(root)) {
    const ns = root[key] as grpc.GrpcObject;
    if (ns && ns.AssistantService) {
      return ns.AssistantService as grpc.ServiceDefinition;
    }
  }
  return null;
}

const assistantServiceImpl = {
  batchGetLessonTestEligibility: async (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    try {
      const userId = String(call.request.user_id ?? call.request.userId ?? '');
      const lessonIds: string[] = call.request.lesson_ids ?? call.request.lessonIds ?? [];
      const minPassPercent =
        call.request.min_pass_percent != null
          ? Number(call.request.min_pass_percent)
          : call.request.minPassPercent != null
            ? Number(call.request.minPassPercent)
            : 50;

      if (!userId) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: 'user_id is required',
        });
      }

      const items = await lessonTestEligibilityService.batchGetEligibility(userId, lessonIds, minPassPercent);

      callback(null, {
        items: items.map((row) => ({
          lesson_id: row.lessonId,
          has_published_test: row.hasPublishedTest,
          best_percent: row.bestPercent,
          passed: row.passed,
          best_earned_points: row.bestEarnedPoints,
          max_points: row.maxPoints,
        })),
      });
    } catch (error) {
      Logger.error(`batchGetLessonTestEligibility error: ${error}`);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  },
};

export function startAssistantGrpcServer(): void {
  const serviceDef = findAssistantService(grpcObject);
  if (!serviceDef) {
    Logger.error(`AssistantService not found in proto. Keys: ${Object.keys(grpcObject)}`);
    throw new Error('AssistantService not found in proto definition');
  }

  const server = new grpc.Server();
  const impl = (serviceDef as unknown as { service: grpc.ServiceDefinition }).service ?? serviceDef;
  server.addService(impl, assistantServiceImpl);

  const host = env.APP_HOST || '0.0.0.0';
  const port = env.ASSISTANT_GRPC_PORT;

  server.bindAsync(`${host}:${port}`, grpc.ServerCredentials.createInsecure(), (err) => {
    if (err) {
      Logger.error(`Assistant gRPC server bind failed: ${err.message}`);
      return;
    }
    Logger.info(`Assistant gRPC server running at ${host}:${port}`);
  });
}
