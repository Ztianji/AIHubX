import request from 'supertest';
import express from 'express';
import authRouter from './auth';
import db from '../models/user';

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

beforeEach((done) => {
  db.run('DELETE FROM users', done);
});

afterAll((done) => {
  db.close(done);
});

describe('auth API', () => {
  test('registers a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'alice', password: 'password' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.username).toBe('alice');
  });

  test('prevents duplicate usernames', async () => {
    await request(app)
      .post('/auth/register')
      .send({ username: 'alice', password: 'password' });
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'alice', password: 'password' });
    expect(res.status).toBe(409);
  });

  test('logs in an existing user', async () => {
    await request(app)
      .post('/auth/register')
      .send({ username: 'bob', password: 'password' });
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'bob', password: 'password' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('rejects invalid credentials', async () => {
    await request(app)
      .post('/auth/register')
      .send({ username: 'carol', password: 'password' });
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'carol', password: 'wrong' });
    expect(res.status).toBe(401);
  });
});
