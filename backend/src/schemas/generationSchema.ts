import { z } from 'zod';

export const generationSchema = z.object({
  prompt: z.string().min(5).max(250),
  style: z.string().min(2).max(50),
});

export type GenerationInput = z.infer<typeof generationSchema>;

