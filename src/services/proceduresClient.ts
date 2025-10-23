import HttpClient from './httpClient';

const MS_PROCEDURES_URL = process.env.MS_PROCEDURES_URL || 'http://10.0.215.56:3002/api/v1';
const MS_PROCEDURES_HEALTH = 'http://10.0.215.56:3002';

class ProceduresClient {
  private client: HttpClient;
  private healthClient: HttpClient;

  constructor() {
    this.client = new HttpClient(MS_PROCEDURES_URL);
	this.healthClient = new HttpClient(MS_PROCEDURES_HEALTH);
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

