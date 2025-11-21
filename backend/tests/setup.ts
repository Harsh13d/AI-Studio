import { beforeEach, afterAll } from '@jest/globals';
import { prisma } from '../src/lib/prisma';

process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'file:./test.db';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';

beforeEach(async () => {
  await prisma.generation.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

