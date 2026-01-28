import { Router } from 'express';
import transcriptionController from '~/controllers/transcription.controller';

const transcriptionRouter = Router();

transcriptionRouter.post('/', transcriptionController.transcribe);

export default transcriptionRouter;
