const express = require('express');
const cors = require('cors');
const { migrate } = require('./db');
const tasksRouter = require('./routes/tasks');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/tasks', tasksRouter);

// Exporta o app sem iniciar o servidor — facilita os testes
module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  migrate()
    .then(() => app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`)))
    .catch((err) => { console.error('Falha ao conectar no banco:', err); process.exit(1); });
}
