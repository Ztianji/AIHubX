import path from 'path';
import sqlite3 from 'sqlite3';

sqlite3.verbose();

const dbPath = path.resolve(__dirname, '..', '..', 'users.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

export interface User {
  id: number;
  username: string;
  password: string;
  created_at: string;
}

export function createUser(username: string, password: string): Promise<User> {
  return new Promise((resolve, reject) => {
    const createdAt = new Date().toISOString();
    db.run(
      'INSERT INTO users (username, password, created_at) VALUES (?, ?, ?)',
      [username, password, createdAt],
      function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({
          id: this.lastID,
          username,
          password,
          created_at: createdAt,
        });
      },
    );
  });
}

export function findUserByUsername(
  username: string,
): Promise<User | undefined> {
  return new Promise((resolve, reject) => {
    db.get<User>(
      'SELECT * FROM users WHERE username = ?',
      [username],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row ?? undefined);
      },
    );
  });
}

export default db;
