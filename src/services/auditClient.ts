import axios, { AxiosInstance } from 'axios';

const AUDIT_SERVICE_URL = process.env.AUDIT_SERVICE_URL || 'http://localhost:3004';

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
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('[ERRO] ms-audit health check failed:', error);
      return false;
    }
  }

  /**
   * Valida todos os procedimentos de uma guia
   */
  async validateGuia(data: ValidateGuiaRequest): Promise<ValidateGuiaResponse> {
    try {
      console.log(`[VALIDACAO] Validando guia ${data.guiaId} no ms-audit...`);
      
      const response = await this.client.post<ValidateGuiaResponse>('/audits/guias/validate', data);
      
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
