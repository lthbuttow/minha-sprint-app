const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const fs = require('fs');
const sprintRoutes = require('./routes/sprintRoutes');
const authRoutes = require('./routes/authRoutes');
const authenticate = require('./middleware/authenticate');

const app = express();
const swaggerDocument = YAML.parse(fs.readFileSync(path.join(__dirname, '../resources/swagger.yaml'), 'utf8'));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/api/auth', authRoutes);
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(authenticate);
app.use('/api/sprints', sprintRoutes);

app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({ error: 'JSON inválido.' });
  const status = error.statusCode || 500;
  if (status === 500) console.error(error);
  return res.status(status).json({ error: status === 500 ? 'Erro interno do servidor.' : error.message });
});

module.exports = app;
