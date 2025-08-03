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
    db.all('SELECT * FROM tasks', (err, rows: any[]) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(
        rows.map((row: any) => ({
          id: row.id,
          title: row.title,
          completed: Boolean(row.completed),
          created_at: row.created_at,
        })),
      );
    });
  });
}
export default db;
