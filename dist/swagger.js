"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const options = {
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
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
const setupSwagger = (app) => {
    // Swagger UI
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec, {
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
exports.setupSwagger = setupSwagger;
exports.default = swaggerSpec;
//# sourceMappingURL=swagger.js.map