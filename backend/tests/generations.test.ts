import path from 'path';
import request from 'supertest';
import app from '../src/app';

const fixturePath = path.join(__dirname, 'fixtures', 'sample.png');

const createUserAndToken = async () => {
  const credentials = {
    email: `user-${Date.now()}@example.com`,
    password: 'Password123!',
  };

  await request(app).post('/auth/signup').send(credentials);
  const loginRes = await request(app).post('/auth/login').send(credentials);
  return { token: loginRes.body.token, credentials };
};

describe('Generations API', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rejects unauthorized access', async () => {
    const res = await request(app).get('/generations');
    expect(res.status).toBe(401);
  });

  it('creates a generation and fetches history', async () => {
    const { token } = await createUserAndToken();
    jest.spyOn(Math, 'random').mockReturnValue(0.9);

    const createRes = await request(app)
      .post('/generations')
      .set('Authorization', `Bearer ${token}`)
      .field('prompt', 'A futuristic runway look')
      .field('style', 'Avant Garde')
      .attach('image', fixturePath);

    expect(createRes.status).toBe(201);
    expect(createRes.body.prompt).toContain('futuristic');

    const listRes = await request(app)
      .get('/generations?limit=5')
      .set('Authorization', `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0].id).toBe(createRes.body.id);
  });

  it('simulates model overload', async () => {
    const { token } = await createUserAndToken();
    jest.spyOn(Math, 'random').mockReturnValue(0.1);

    const res = await request(app)
      .post('/generations')
      .set('Authorization', `Bearer ${token}`)
      .field('prompt', 'Retry scenario')
      .field('style', 'Casual')
      .attach('image', fixturePath);

    expect(res.status).toBe(503);
    expect(res.body.message).toMatch(/overloaded/i);
  });
});

