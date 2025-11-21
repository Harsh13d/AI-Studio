import { Request, Response } from 'express';
import { generationSchema } from '../schemas/generationSchema';
import { asyncHandler } from '../utils/asyncHandler';
import * as generationService from '../services/generationService';

export const createGeneration = asyncHandler(async (req: Request, res: Response) => {
  const payload = generationSchema.parse(req.body);
  const result = await generationService.createGeneration(
    req.userId as string,
    payload,
    req.file as Express.Multer.File | undefined,
  );
  res.status(201).json(result);
});

export const listGenerations = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 5;
  const generations = await generationService.getRecentGenerations(
    req.userId as string,
    limit,
  );
  res.json(generations);
});

