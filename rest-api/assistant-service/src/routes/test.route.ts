
import express from 'express';
import { searchController } from '~/controllers/search.controller';
import testController from '~/controllers/test.controller';
import { SearchChunksRequest } from '~/dto/request/searchChunks.dto';
import basicAuthMiddleware from '~/middleware/basicAuth.middleware';
import validateDto from '~/middleware/validateDto.midleware';

const router = express.Router();

// Apply basic auth middleware
router.use(basicAuthMiddleware);

router.post('/chunking', testController.testChunking);

router.post(
    '/chunks',
    validateDto(SearchChunksRequest),
    searchController.searchChunks
);

export default router;
