import HttpClient from './httpClient';

const MS_PROCEDURES_URL = process.env.MS_PROCEDURES_URL || 'http://localhost/procedures/api/v1/';
const MS_PROCEDURES_HEALTH = process.env.MS_PROCEDURES_HEALTH || 'http://localhost/procedures';

class ProceduresClient {
  private client: HttpClient;
  private healthClient: HttpClient;

  constructor() {
    const apiKey = process.env.MS_PROCEDURES_API_KEY || process.env.MS_API_KEY || process.env.API_KEY;
    const apiKeyHeader = process.env.MS_PROCEDURES_API_KEY_HEADER || process.env.MS_API_KEY_HEADER || process.env.API_KEY_HEADER || 'x-api-key';
    const useAuth = ((process.env.MS_PROCEDURES_USE_BEARER || process.env.MS_USE_BEARER_AUTH) === 'true');

    this.client = new HttpClient(MS_PROCEDURES_URL, 30000, {
      apiKey,
      apiKeyHeader,
      useAuth,
    });

	this.healthClient = new HttpClient(MS_PROCEDURES_HEALTH, 10000, {
      apiKey,
      apiKeyHeader,
      useAuth: false,
    });
  }

  /**
   * Health check do serviço
   */
  async healthCheck(): Promise<any> {
    return await this.healthClient.get('/health');
  }

  /**
   * Valida o porte de um procedimento
   */
  async validatePorte(procedureCode: string, reportedPorte: string): Promise<any> {
    return await this.client.post('/procedures/validate-porte', {
      procedureCode,
      reportedPorte,
    });
  }

  /**
   * Valida múltiplos portes em lote
   */
  async validatePorteBatch(procedures: Array<{ code: string; porte: string }>): Promise<any> {
    return await this.client.post('/procedures/validate-porte-batch', {
      procedures,
    });
  }

  /**
   * Cria procedimento
   */
  async create(procedureData: any): Promise<any> {
    return await this.client.post('/procedures', procedureData);
  }

  /**
   * Deleta procedimento (para rollback)
   */
  async delete(procedureId: string): Promise<any> {
    return await this.client.delete(`/procedures/${procedureId}`);
  }
}

export default new ProceduresClient();

