"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const httpClient_1 = __importDefault(require("./httpClient"));
const CONTRACTS_SERVICE_URL = process.env.MS_CONTRACTS_URL || 'http://48.192.39.147/contracts/api';
const HEALTH_SERVICE_URL = 'http://48.192.39.147/contracts';
/**
 * Cliente para comunicação com ms-contracts
 * Usa ClusterIP para comunicação interna no AKS
 */
class ContractsClient {
    constructor() {
        // Criar cliente HTTP sem autenticação (comunicação interna)
        this.client = new httpClient_1.default(CONTRACTS_SERVICE_URL, 80, { useAuth: false });
        this.healthClient = new httpClient_1.default(HEALTH_SERVICE_URL, 80, { useAuth: false });
    }
    /**
     * Verifica se o ms-contracts está disponível
     */
    async healthCheck() {
        try {
            await this.healthClient.get('/health');
        }
        catch (error) {
            throw new Error(`ms-contracts health check failed: ${error.message}`);
        }
    }
    /**
     * Valida um procedimento contra o contrato
     */
    async validateProcedimento(data) {
        try {
            console.log(`🔍 Validando procedimento ${data.codigoTUSS} no ms-contracts...`);
            const response = await this.client.post('/validations/procedimento', data);
            console.log(`✅ Validação concluída: ${response.conforme ? 'CONFORME' : 'DIVERGENTE'}`);
            if (!response.conforme && response.divergencias.length > 0) {
                console.log(`⚠️  ${response.divergencias.length} divergência(s) encontrada(s):`);
                response.divergencias.forEach((div, idx) => {
                    console.log(`   ${idx + 1}. [${div.severidade}] ${div.tipo}: ${div.mensagem}`);
                });
            }
            return response;
        }
        catch (error) {
            console.error(`❌ Erro ao validar procedimento ${data.codigoTUSS}:`, error.message);
            // Retorna resultado de erro ao invés de lançar exceção
            // para não bloquear a importação
            return {
                conforme: false,
                divergencias: [{
                        tipo: 'NAO_CONTRATADO',
                        mensagem: `Erro ao validar: ${error.message}`,
                        severidade: 'BAIXA'
                    }],
                valorContrato: null,
                valorCobrado: data.valorCobrado,
                diferenca: 0,
                mensagem: 'Validação não realizada devido a erro de comunicação'
            };
        }
    }
    /**
     * Valida apenas o valor de um procedimento
     */
    async validateValor(data) {
        try {
            const response = await this.client.post('/validations/valor', data);
            return response;
        }
        catch (error) {
            console.error(`❌ Erro ao validar valor:`, error.message);
            return {
                conforme: false,
                divergencias: [],
                valorContrato: null,
                valorCobrado: data.valorCobrado,
                diferenca: 0,
                mensagem: 'Erro ao validar valor'
            };
        }
    }
    /**
     * Valida uma guia completa com todos os procedimentos
     */
    async validateGuia(data) {
        try {
            console.log(`🔍 Validando guia ${data.numeroGuia} com ${data.procedimentos.length} procedimentos...`);
            const response = await this.client.post('/validations/guia', data);
            console.log(`✅ Validação da guia concluída: ${response.conformeGeral ? 'CONFORME' : 'DIVERGENTE'}`);
            console.log(`   - Total de divergências: ${response.totalDivergencias}`);
            return response;
        }
        catch (error) {
            console.error(`❌ Erro ao validar guia:`, error.message);
            // Validar individualmente se a validação em lote falhar
            console.log(`⚠️  Tentando validação individual dos procedimentos...`);
            const resultados = [];
            for (const proc of data.procedimentos) {
                const resultado = await this.validateProcedimento(proc);
                resultados.push(resultado);
            }
            const totalDivergencias = resultados.reduce((acc, r) => acc + r.divergencias.length, 0);
            const conformeGeral = resultados.every(r => r.conforme);
            return {
                conformeGeral,
                totalDivergencias,
                resultados
            };
        }
    }
}
exports.default = new ContractsClient();
//# sourceMappingURL=contractsClient.js.map