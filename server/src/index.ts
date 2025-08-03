import express from 'express';
import tasksRouter from './routes/tasks';
import authRouter from './routes/auth';

const app = express();
app.use(express.json());

app.use('/auth', authRouter);
app.use('/tasks', tasksRouter);

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction, // eslint-disable-line @typescript-eslint/no-unused-vars
  ) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  },
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
