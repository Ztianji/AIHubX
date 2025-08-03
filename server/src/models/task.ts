import path from 'path';
import sqlite3 from 'sqlite3';

sqlite3.verbose();

const dbPath = path.resolve(__dirname, '..', '..', 'tasks.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

export function createTask(title: string): Promise<Task> {
  return new Promise((resolve, reject) => {
    const createdAt = new Date().toISOString();
    db.run(
      'INSERT INTO tasks (title, completed, created_at) VALUES (?, ?, ?)',
      [title, 0, createdAt],
      function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({
          id: this.lastID,
          title,
          completed: false,
          created_at: createdAt,
        });
      },
    );
  });
}

export function getTasks(): Promise<Task[]> {
  return new Promise((resolve, reject) => {
    db.all<{
      id: number;
      title: string;
      completed: number;
      created_at: string;
    }>('SELECT * FROM tasks', (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(
        rows.map((row) => ({
          id: row.id,
          title: row.title,
          completed: Boolean(row.completed),
          created_at: row.created_at,
        })),
      );
    });
  });
}

export function getTask(id: number): Promise<Task | undefined> {
  return new Promise((resolve, reject) => {
    db.get<{
      id: number;
      title: string;
      completed: number;
      created_at: string;
    }>('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (!row) {
        resolve(undefined);
        return;
      }
      resolve({
        id: row.id,
        title: row.title,
        completed: Boolean(row.completed),
        created_at: row.created_at,
      });
    });
  });
}

export function updateTask(
  id: number,
  updates: { title?: string; completed?: boolean },
): Promise<Task | null> {
  return new Promise((resolve, reject) => {
    const fields: string[] = [];
    const values: unknown[] = [];
    if (typeof updates.title === 'string') {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (typeof updates.completed === 'boolean') {
      fields.push('completed = ?');
      values.push(updates.completed ? 1 : 0);
    }
    if (fields.length === 0) {
      resolve(null);
      return;
    }
    values.push(id);
    db.run(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`,
      values,
      function (err) {
        if (err) {
          reject(err);
          return;
        }
        if (this.changes === 0) {
          resolve(null);
          return;
        }
        getTask(id)
          .then((task) => resolve(task ?? null))
          .catch(reject);
      },
    );
  });
}

export function deleteTask(id: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.changes > 0);
    });
  });
}
export default db;
