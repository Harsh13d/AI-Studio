import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { SignupInput } from '../schemas/authSchema';
import { env } from '../config/env';

const SALT_ROUNDS = 10;

export const signup = async ({ email, password }: SignupInput) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error('Email already registered');
    (error as { status?: number }).status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { email, passwordHash },
  });

  return createAuthPayload(user.id, user.email);
};

export const login = async ({ email, password }: SignupInput) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new Error('Invalid credentials');
    (error as { status?: number }).status = 401;
    throw error;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    const error = new Error('Invalid credentials');
    (error as { status?: number }).status = 401;
    throw error;
  }

  return createAuthPayload(user.id, user.email);
};

const createAuthPayload = (userId: string, email: string) => {
  const token = jwt.sign({ userId }, env.jwtSecret, { expiresIn: '2h' });
  return {
    token,
    user: { id: userId, email },
  };
};

