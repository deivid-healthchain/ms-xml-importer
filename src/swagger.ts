import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lazarus XML Importer API',
      version: '1.0.0',
      description: 'API para importação e processamento de arquivos XML TISS (padrão ANS)',
      contact: {
        name: 'HealthChain Solutions',
        email: 'suporte@healthchainsolutions.com.br',
      },
    },
    servers: [
      {
        url: 'http://localhost:3007',
        description: 'Servidor de desenvolvimento',
      },
      {
        url: 'https://lazarusapi.azure-api.net/xml-importer',
        description: 'Servidor de produção (Azure APIM)',
      },
    ],
    tags: [
      {
        name: 'Upload',
        description: 'Operações de upload e processamento de arquivos XML/ZIP',
      },
      {
        name: 'Health',
        description: 'Verificação de saúde do serviço',
      },
    ],
  },
  apis: ['./src/routes.ts', './dist/routes.js'], // Caminhos para os arquivos de rotas
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Lazarus XML Importer API',
  }));

  // JSON spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('📚 Swagger documentation available at /api-docs');
};

export default swaggerSpec;
