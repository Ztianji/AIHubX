import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import tasksRouter from './tasks';
import db from '../models/task';

const app = express();
app.use(express.json());
app.use('/tasks', tasksRouter);

const token = jwt.sign({ id: 1 }, 'secret');
const auth = `Bearer ${token}`;

beforeEach((done) => {
  db.run('DELETE FROM tasks', done);
});

afterAll((done) => {
  db.close(done);
});

describe('tasks API', () => {
  test('rejects requests without token', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(401);
  });

  test('rejects requests with invalid token', async () => {
    const res = await request(app)
      .get('/tasks')
      .set('Authorization', 'Bearer invalid');
    expect(res.status).toBe(401);
  });

  test('creates and lists tasks', async () => {
    const createRes = await request(app)
      .post('/tasks')
      .set('Authorization', auth)
      .send({ title: 'test' });
    expect(createRes.status).toBe(201);
    const listRes = await request(app)
      .get('/tasks')
      .set('Authorization', auth);
    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0].title).toBe('test');
  });

  test('updates a task', async () => {
    const createRes = await request(app)
      .post('/tasks')
      .set('Authorization', auth)
      .send({ title: 'old' });
    const id = createRes.body.id;
    const updateRes = await request(app)
      .put(`/tasks/${id}`)
      .set('Authorization', auth)
      .send({ completed: true });
    expect(updateRes.body.completed).toBe(true);
  });

  test('deletes a task', async () => {
    const createRes = await request(app)
      .post('/tasks')
      .set('Authorization', auth)
      .send({ title: 'to delete' });
    const id = createRes.body.id;
    const deleteRes = await request(app)
      .delete(`/tasks/${id}`)
      .set('Authorization', auth);
    expect(deleteRes.status).toBe(204);
    const listRes = await request(app)
      .get('/tasks')
      .set('Authorization', auth);
    expect(listRes.body).toHaveLength(0);
  });
});
