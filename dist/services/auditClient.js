"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const AUDIT_SERVICE_URL = process.env.MS_AUDIT_URL || 'http://48.192.39.147/audit';
class AuditClient {
    constructor() {
        this.client = axios_1.default.create({
            baseURL: AUDIT_SERVICE_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    /**
     * Health check do ms-audit
     */
    async healthCheck() {
        try {
            await this.client.get('/health');
        }
        catch (error) {
            throw new Error(`ms-audit health check failed: ${error.message}`);
        }
    }
    /**
     * Valida todos os procedimentos de uma guia
     */
    async validateGuia(data) {
        try {
            console.log(`[VALIDACAO] Validando guia ${data.guiaId} no ms-audit...`);
            const response = await this.client.post(`/api/v1/procedures/validate-guia/${data.guiaId}`, data);
            const result = response.data;
            if (result.success) {
                console.log(`[OK] Guia ${data.guiaId} validada com sucesso`);
                console.log(`   - Procedimentos validados: ${result.data?.procedimentosValidados || 0}`);
                console.log(`   - Total de pendências: ${result.data?.totalPendencias || 0}`);
            }
            return result;
        }
        catch (error) {
            console.error(`[ERRO] Erro ao validar guia ${data.guiaId}:`, error.message);
            throw error;
        }
    }
}
exports.default = new AuditClient();
//# sourceMappingURL=auditClient.js.map