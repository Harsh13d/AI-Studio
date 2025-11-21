import { prisma } from '../lib/prisma';
import { GenerationInput } from '../schemas/generationSchema';
import path from 'path';

const OVERLOAD_RATE = 0.2;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const randomDelay = () => {
  const min = 1000;
  const max = 2000;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const createGeneration = async (
  userId: string,
  payload: GenerationInput,
  file?: Express.Multer.File,
) => {
  if (!file) {
    const error = new Error('Image upload is required');
    (error as { status?: number }).status = 400;
    throw error;
  }

  await wait(randomDelay());

  if (Math.random() < OVERLOAD_RATE) {
    const error = new Error('Model overloaded');
    (error as { status?: number }).status = 503;
    throw error;
  }

  const generation = await prisma.generation.create({
    data: {
      userId,
      prompt: payload.prompt,
      style: payload.style,
      imagePath: file.filename,
      status: 'COMPLETED',
    },
  });

  return mapGenerationToResponse(generation);
};

export const getRecentGenerations = async (userId: string, limit = 5) => {
  const generations = await prisma.generation.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return generations.map(mapGenerationToResponse);
};

const mapGenerationToResponse = (generation: {
  id: string;
  prompt: string;
  style: string;
  imagePath: string;
  status: string;
  createdAt: Date;
}) => {
  return {
    id: generation.id,
    prompt: generation.prompt,
    style: generation.style,
    imageUrl: path.posix.join('/uploads', generation.imagePath),
    status: generation.status,
    createdAt: generation.createdAt,
  };
};

