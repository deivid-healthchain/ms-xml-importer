import axios, { AxiosInstance } from 'axios';
import HttpClient from './httpClient';

const AUDIT_SERVICE_URL = process.env.MS_AUDIT_URL || 'http://48.192.39.147/audit';

interface ValidateGuiaRequest {
  guiaId: number;
  operadoraId: string | null;
}

interface ValidateGuiaResponse {
  success: boolean;
  data?: {
    guiaId: number;
    procedimentosValidados: number;
    totalPendencias: number;
    procedimentos: any[];
  };
  message?: string;
}

class AuditClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
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
  async healthCheck(): Promise<void> {
    try {
      await this.client.get('/health');
    } catch (error: any) {
      throw new Error(`ms-audit health check failed: ${error.message}`);
    }
  }

  /**
   * Valida todos os procedimentos de uma guia
   */
  async validateGuia(data: ValidateGuiaRequest): Promise<ValidateGuiaResponse> {
    try {
      console.log(`[VALIDACAO] Validando guia ${data.guiaId} no ms-audit...`);
      
      const response = await this.client.post<ValidateGuiaResponse>(`/api/v1/procedures/validate-guia/${data.guiaId}`, data);
      
      const result = response.data;
      
      if (result.success) {
        console.log(`[OK] Guia ${data.guiaId} validada com sucesso`);
        console.log(`   - Procedimentos validados: ${result.data?.procedimentosValidados || 0}`);
        console.log(`   - Total de pendências: ${result.data?.totalPendencias || 0}`);
      }
      
      return result;
    } catch (error: any) {
      console.error(`[ERRO] Erro ao validar guia ${data.guiaId}:`, error.message);
      throw error;
    }
  }
}

export default new AuditClient();
