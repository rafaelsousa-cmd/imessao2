const request = require('supertest');
const app = require('../src/app');
const { pool, migrate } = require('../src/db');

beforeAll(async () => {
  await migrate();
  await pool.query('TRUNCATE TABLE tasks RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  await pool.end();
});

describe('GET /health', () => {
  it('retorna status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /tasks', () => {
  it('cria uma tarefa e retorna 201', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Estudar Docker' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Estudar Docker');
    expect(res.body.done).toBe(false);
    expect(res.body.id).toBeDefined();
  });

  it('retorna 400 quando title está vazio', async () => {
    const res = await request(app).post('/tasks').send({ title: '' });
    expect(res.status).toBe(400);
  });

  it('retorna 400 quando title está ausente', async () => {
    const res = await request(app).post('/tasks').send({});
    expect(res.status).toBe(400);
  });
});

describe('GET /tasks', () => {
  it('retorna lista com a tarefa criada', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('PUT /tasks/:id', () => {
  let taskId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Tarefa para atualizar' });
    taskId = res.body.id;
  });

  it('atualiza o título da tarefa', async () => {
    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .send({ title: 'Título atualizado' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Título atualizado');
  });

  it('marca tarefa como concluída', async () => {
    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .send({ done: true });
    expect(res.status).toBe(200);
    expect(res.body.done).toBe(true);
  });

  it('retorna 404 para id inexistente', async () => {
    const res = await request(app).put('/tasks/99999').send({ title: 'X' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /tasks/:id', () => {
  let taskId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Tarefa para deletar' });
    taskId = res.body.id;
  });

  it('deleta a tarefa e retorna 204', async () => {
    const res = await request(app).delete(`/tasks/${taskId}`);
    expect(res.status).toBe(204);
  });

  it('retorna 404 ao tentar deletar tarefa já removida', async () => {
    const res = await request(app).delete(`/tasks/${taskId}`);
    expect(res.status).toBe(404);
  });
});
