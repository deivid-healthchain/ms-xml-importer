"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const httpClient_1 = __importDefault(require("./httpClient"));
const MS_PROCEDURES_URL = process.env.MS_PROCEDURES_URL || 'http://localhost/procedures/api/v1/';
const MS_PROCEDURES_HEALTH = process.env.MS_PROCEDURES_HEALTH || 'http://localhost/procedures';
class ProceduresClient {
    constructor() {
        const apiKey = process.env.MS_PROCEDURES_API_KEY || process.env.MS_API_KEY || process.env.API_KEY;
        const apiKeyHeader = process.env.MS_PROCEDURES_API_KEY_HEADER || process.env.MS_API_KEY_HEADER || process.env.API_KEY_HEADER || 'x-api-key';
        const useAuth = ((process.env.MS_PROCEDURES_USE_BEARER || process.env.MS_USE_BEARER_AUTH) === 'true');
        this.client = new httpClient_1.default(MS_PROCEDURES_URL, 30000, {
            apiKey,
            apiKeyHeader,
            useAuth,
        });
        this.healthClient = new httpClient_1.default(MS_PROCEDURES_HEALTH, 10000, {
            apiKey,
            apiKeyHeader,
            useAuth: false,
        });
    }
    /**
     * Health check do serviço
     */
    async healthCheck() {
        return await this.healthClient.get('/health');
    }
    /**
     * Valida o porte de um procedimento
     */
    async validatePorte(procedureCode, reportedPorte) {
        return await this.client.post('/procedures/validate-porte', {
            procedureCode,
            reportedPorte,
        });
    }
    /**
     * Valida múltiplos portes em lote
     */
    async validatePorteBatch(procedures) {
        return await this.client.post('/procedures/validate-porte-batch', {
            procedures,
        });
    }
    /**
     * Cria procedimento
     */
    async create(procedureData) {
        return await this.client.post('/procedures', procedureData);
    }
    /**
     * Deleta procedimento (para rollback)
     */
    async delete(procedureId) {
        return await this.client.delete(`/procedures/${procedureId}`);
    }
}
exports.default = new ProceduresClient();
//# sourceMappingURL=proceduresClient.js.map