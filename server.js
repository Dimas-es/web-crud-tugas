const path = require('path');
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite database (allow override via env for PaaS persistent storage)
const dbFilePath = process.env.BLOG_DB_PATH || path.join(__dirname, 'blog.db');
const db = new Database(dbFilePath);
db.pragma('journal_mode = WAL');

// Create table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TRIGGER IF NOT EXISTS posts_updated_at
  AFTER UPDATE ON posts
  BEGIN
    UPDATE posts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
`);

// CRUD Endpoints
app.get('/api/posts', (req, res) => {
  const rows = db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all();
  res.json(rows);
});

app.get('/api/posts/:id', (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'Post not found' });
  res.json(row);
});

app.post('/api/posts', (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }
  const info = db.prepare('INSERT INTO posts (title, description) VALUES (?, ?)').run(title, description);
  const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(row);
});

app.put('/api/posts/:id', (req, res) => {
  const id = Number(req.params.id);
  const { title, description } = req.body;
  const existing = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Post not found' });
  const newTitle = title ?? existing.title;
  const newDesc = description ?? existing.description;
  db.prepare('UPDATE posts SET title = ?, description = ? WHERE id = ?').run(newTitle, newDesc, id);
  const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
  res.json(row);
});

app.delete('/api/posts/:id', (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare('DELETE FROM posts WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Post not found' });
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});


