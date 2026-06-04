const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
import { env } from '~/config/env';
import Logger from '~/utils/logger';
import lessonTestEligibilityService from '~/service/lessonTest/lessonTestEligibility.service';

const GRPC_PORT = env.ASSISTANT_GRPC_PORT;
const APP_HOST = env.APP_HOST || '0.0.0.0';

const PROTO_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'proto-shared',
  'src',
  'main',
  'proto',
  'assistantService.proto'
);

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [path.join(__dirname, '..', '..', '..', 'proto-shared', 'src', 'main', 'proto')],
});

const proto = grpc.loadPackageDefinition(packageDef);

const assistantServiceImpl = {
  batchGetLessonTestEligibility: async (call: any, callback: any) => {
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

function findAssistantService(protoRoot: any) {
  if (!protoRoot) return null;
  if (protoRoot.AssistantService) return protoRoot.AssistantService;
  for (const key of Object.keys(protoRoot)) {
    const ns = protoRoot[key];
    if (ns && ns.AssistantService) return ns.AssistantService;
  }
  return null;
}

function startAssistantGrpcServer() {
  const server = new grpc.Server();
  Logger.info('start server');

  const assistantService = findAssistantService(proto);
  if (!assistantService) {
    Logger.error(`Failed to find AssistantService in loaded proto. Available top-level keys: ${Object.keys(proto)}`);
    for (const key of Object.keys(proto)) {
      const child = proto[key];
      Logger.error(`- ${key}: ${child && typeof child === 'object' ? Object.keys(child) : typeof child}`);
    }
    throw new Error(
      'AssistantService not found in proto definition. Check PROTO_PATH and package/service names in .proto file.'
    );
  }

  const serviceDef = assistantService.service || assistantService;
  server.addService(serviceDef, assistantServiceImpl);

  server.bindAsync(`${APP_HOST}:${GRPC_PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    Logger.info(`gRPC Assistant server running at ${APP_HOST}:${GRPC_PORT}`);
  });
}

export { startAssistantGrpcServer };
