const { Router } = require('express');
const { pool } = require('../db');

const router = Router();

// GET /tasks — lista todas
router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
  res.json(rows);
});

// POST /tasks — cria uma tarefa
router.post('/', async (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'O campo "title" é obrigatório' });
  }
  const { rows } = await pool.query(
    'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
    [title.trim()],
  );
  res.status(201).json(rows[0]);
});

// PUT /tasks/:id — atualiza título ou status
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, done } = req.body;

  const { rows: current } = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
  if (!current.length) return res.status(404).json({ error: 'Tarefa não encontrada' });

  const newTitle = title !== undefined ? title.trim() : current[0].title;
  const newDone  = done  !== undefined ? done              : current[0].done;

  const { rows } = await pool.query(
    'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *',
    [newTitle, newDone, id],
  );
  res.json(rows[0]);
});

// DELETE /tasks/:id — remove uma tarefa
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  if (!rowCount) return res.status(404).json({ error: 'Tarefa não encontrada' });
  res.status(204).send();
});

module.exports = router;
