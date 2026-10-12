const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Raízes do Nordeste — API',
      version: '1.0.0',
      description: 'API Back-end para a rede de lanchonetes Raízes do Nordeste.'
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    }
  },
  apis: ['./src/api/routes/*.js']
};

module.exports = swaggerJsdoc(options);