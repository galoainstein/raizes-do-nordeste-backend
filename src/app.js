const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const routes = require('./api/routes');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/v3/api-docs', (req, res) => res.json(swaggerSpec));

app.use(routes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: 'ERRO_INTERNO',
    message: 'Erro inesperado no servidor.',
    details: [], timestamp: new Date().toISOString(), path: req.originalUrl
  });
});

module.exports = app;