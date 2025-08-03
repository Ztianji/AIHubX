import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByUsername } from '../models/user';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body as {
      username?: string;
      password?: string;
    };
    if (typeof username !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }
    const existing = await findUserByUsername(username);
    if (existing) {
      res.status(409).json({ error: 'Username already taken' });
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await createUser(username, hashed);
    res.status(201).json({ id: user.id, username: user.username });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body as {
      username?: string;
      password?: string;
    };
    if (typeof username !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }
    const user = await findUserByUsername(username);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      {
        expiresIn: '1h',
      },
    );
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

export default router;
