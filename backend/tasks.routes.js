const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');

// Connect to SQLite
const db = new Database('tasks.db');

// Create tasks table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT CHECK(priority IN ('Low', 'Medium', 'High')) NOT NULL,
    due_date TEXT,
    status TEXT CHECK(status IN ('Open', 'In Progress', 'Done')) NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

//
// ✅ POST /tasks — Create a new task with validation
//
router.post('/', (req, res) => {
  const { title, description, priority, due_date, status } = req.body;

  if (!title || !priority || !due_date) {
    return res.status(400).json({ error: 'Missing required fields: title, priority, due_date' });
  }

  const stmt = db.prepare(`
    INSERT INTO tasks (title, description, priority, due_date, status)
    VALUES (?, ?, ?, ?, ?)
  `);
  const info = stmt.run(title, description || '', priority, due_date, status || 'Open');

  res.status(201).json({ id: info.lastInsertRowid });
});

//
// ✅ GET /tasks — Filter by status/priority and sort by due_date
//
router.get('/', (req, res) => {
  const { status, priority, sort } = req.query;

  let query = 'SELECT * FROM tasks';
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (priority) {
    conditions.push('priority = ?');
    params.push(priority);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  if (sort === 'asc') {
    query += ' ORDER BY due_date ASC';
  } else if (sort === 'desc') {
    query += ' ORDER BY due_date DESC';
  }

  const tasks = db.prepare(query).all(...params);
  res.json(tasks);
});

//
// ✅ PATCH /tasks/:id — Update status or priority
//
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { status, priority } = req.body;

  if (!status && !priority) {
    return res.status(400).json({ error: 'Provide status or priority to update' });
  }

  const fields = [];
  const params = [];

  if (status) {
    fields.push('status = ?');
    params.push(status);
  }
  if (priority) {
    fields.push('priority = ?');
    params.push(priority);
  }

  params.push(id);

  const stmt = db.prepare(`
    UPDATE tasks SET ${fields.join(', ')} WHERE id = ?
  `);
  const result = stmt.run(...params);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json({ message: 'Task updated successfully' });
});

//
// ✅ GET /tasks/insights — Aggregated metrics + summary
//
router.get('/insights', (req, res) => {
  const openCount = db.prepare(`
    SELECT COUNT(*) AS count FROM tasks WHERE status = 'Open'
  `).get().count;

  const priorityCounts = db.prepare(`
    SELECT priority, COUNT(*) AS count FROM tasks GROUP BY priority
  `).all();

  const soonCount = db.prepare(`
    SELECT COUNT(*) AS count FROM tasks
    WHERE due_date BETWEEN date('now') AND date('now', '+3 days')
  `).get().count;

  const highPriorityOpen = db.prepare(`
    SELECT COUNT(*) AS count FROM tasks
    WHERE status = 'Open' AND priority = 'High'
  `).get().count;

  let summary = `You have ${openCount} open tasks. `;
  if (openCount > 0) {
    const highPercent = Math.round((highPriorityOpen / openCount) * 100);
    summary += `${highPercent}% of them are high priority. `;
  }
  summary += soonCount > 0
    ? `${soonCount} task${soonCount > 1 ? 's' : ''} are due within the next 3 days.`
    : `No tasks are due soon.`;

  res.json({
    open_tasks: openCount,
    priority_distribution: priorityCounts,
    due_soon: soonCount,
    summary
  });
});

module.exports = router;