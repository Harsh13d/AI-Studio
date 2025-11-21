import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';
import { describe, it, expect } from '@jest/globals';

describe('Auth routes', () => {
  const baseUser = { email: 'user@example.com', password: 'securePass1!' };

  it('signs up a new user', async () => {
    const response = await request(app).post('/auth/signup').send(baseUser);

    expect(response.status).toBe(201);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe(baseUser.email);
  });

  it('prevents duplicate signup', async () => {
    await prisma.user.create({
      data: {
        email: baseUser.email,
        passwordHash: 'hash',
      },
    });

    const response = await request(app).post('/auth/signup').send(baseUser);
    expect(response.status).toBe(409);
  });

  it('logs in with correct credentials', async () => {
    await request(app).post('/auth/signup').send(baseUser);
    const response = await request(app).post('/auth/login').send(baseUser);
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  it('rejects invalid credentials', async () => {
    const response = await request(app).post('/auth/login').send(baseUser);
    expect(response.status).toBe(401);
  });
});

