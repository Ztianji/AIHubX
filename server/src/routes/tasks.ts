import express from 'express';
import { createTask, getTasks, updateTask, deleteTask } from '../models/task';

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const tasks = await getTasks();
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title } = req.body;
    if (typeof title !== 'string' || title.trim() === '') {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    const task = await createTask(title.trim());
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: 'Invalid task id' });
      return;
    }
    const { title, completed } = req.body;
    const updates: { title?: string; completed?: boolean } = {};
    if (typeof title === 'string') {
      updates.title = title;
    }
    if (typeof completed === 'boolean') {
      updates.completed = completed;
    }
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }
    const task = await updateTask(id, updates);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json(task);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: 'Invalid task id' });
      return;
    }
    const deleted = await deleteTask(id);
    if (!deleted) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
