import { Request, Response } from 'express';
import { signupSchema } from '../schemas/authSchema';
import { asyncHandler } from '../utils/asyncHandler';
import * as authService from '../services/authService';

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const payload = signupSchema.parse(req.body);
  const data = await authService.signup(payload);
  res.status(201).json(data);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const payload = signupSchema.parse(req.body);
  const data = await authService.login(payload);
  res.status(200).json(data);
});

