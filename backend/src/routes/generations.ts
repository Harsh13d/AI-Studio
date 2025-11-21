import { Router } from 'express';
import * as generationController from '../controllers/generationController';
import { authenticate } from '../middleware/auth';
import { upload } from '../utils/storage';

const router = Router();

router.post(
  '/',
  authenticate,
  upload.single('image'),
  generationController.createGeneration,
);

router.get('/', authenticate, generationController.listGenerations);

export default router;

