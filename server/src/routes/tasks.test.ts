import request from 'supertest';
import express from 'express';
import tasksRouter from './tasks';
import db from '../models/task';

const app = express();
app.use(express.json());
app.use('/tasks', tasksRouter);

beforeEach((done) => {
  db.run('DELETE FROM tasks', done);
});

afterAll((done) => {
  db.close(done);
});

describe('tasks API', () => {
  test('creates and lists tasks', async () => {
    const createRes = await request(app).post('/tasks').send({ title: 'test' });
    expect(createRes.status).toBe(201);
    const listRes = await request(app).get('/tasks');
    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0].title).toBe('test');
  });

  test('updates a task', async () => {
    const createRes = await request(app).post('/tasks').send({ title: 'old' });
    const id = createRes.body.id;
    const updateRes = await request(app)
      .put(`/tasks/${id}`)
      .send({ completed: true });
    expect(updateRes.body.completed).toBe(true);
  });

  test('deletes a task', async () => {
    const createRes = await request(app)
      .post('/tasks')
      .send({ title: 'to delete' });
    const id = createRes.body.id;
    const deleteRes = await request(app).delete(`/tasks/${id}`);
    expect(deleteRes.status).toBe(204);
    const listRes = await request(app).get('/tasks');
    expect(listRes.body).toHaveLength(0);
  });
});
