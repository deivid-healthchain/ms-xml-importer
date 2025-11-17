import HttpClient from './httpClient';

const CONTRACTS_SERVICE_URL = process.env.MS_CONTRACTS_URL || 'http://48.192.39.147/contracts/api';
const HEALTH_SERVICE_URL = 'http://48.192.39.147/contracts';

interface ValidationRequest {
  operadoraId: string;
  codigoTUSS: string;
  valorCobrado: number;
  quantidade?: number;
  materiais?: Material[];
  pacote?: Pacote | null;
}

interface Material {
  codigo: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
}

interface Pacote {
  codigo: string;
  descricao: string;
}

interface ValidationResult {
  conforme: boolean;
  divergencias: Divergencia[];
  valorContrato: number | null;
  valorCobrado: number;
  diferenca: number;
  mensagem: string;
}

interface Divergencia {
  tipo: 'VALOR_EXCEDIDO' | 'NAO_CONTRATADO' | 'PACOTE_INVALIDO' | 'MATERIAL_NAO_COBERTO' | 'QUANTIDADE_EXCEDIDA';
  mensagem: string;
  severidade: 'BAIXA' | 'MEDIA' | 'ALTA';
  valorEsperado?: number;
  valorEncontrado?: number;
}

/**
 * Cliente para comunicação com ms-contracts
 * Usa ClusterIP para comunicação interna no AKS
 */
class ContractsClient {
  private client: HttpClient;
  private healthClient: HttpClient;

  constructor() {
    // Criar cliente HTTP sem autenticação (comunicação interna)
    this.client = new HttpClient(CONTRACTS_SERVICE_URL, 80, { useAuth: false });
    this.healthClient = new HttpClient(HEALTH_SERVICE_URL, 80, { useAuth: false });
  }

  /**
   * Verifica se o ms-contracts está disponível
   */
  async healthCheck(): Promise<void> {
    try {
      await this.healthClient.get('/health');
    } catch (error: any) {
      throw new Error(`ms-contracts health check failed: ${error.message}`);
    }
  }

  /**
   * Valida um procedimento contra o contrato
   */
  async validateProcedimento(data: ValidationRequest): Promise<ValidationResult> {
    try {
      console.log(`🔍 Validando procedimento ${data.codigoTUSS} no ms-contracts...`);
      
      const response = await this.client.post<ValidationResult>(
        '/validations/procedimento',
        data
      );

      console.log(`✅ Validação concluída: ${response.conforme ? 'CONFORME' : 'DIVERGENTE'}`);
      
      if (!response.conforme && response.divergencias.length > 0) {
        console.log(`⚠️  ${response.divergencias.length} divergência(s) encontrada(s):`);
        response.divergencias.forEach((div, idx) => {
          console.log(`   ${idx + 1}. [${div.severidade}] ${div.tipo}: ${div.mensagem}`);
        });
      }

      return response;
    } catch (error: any) {
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
  async validateValor(data: {
    operadoraId: string;
    codigoTUSS: string;
    valorCobrado: number;
  }): Promise<ValidationResult> {
    try {
      const response = await this.client.post<ValidationResult>(
        '/validations/valor',
        data
      );
      return response;
    } catch (error: any) {
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
  async validateGuia(data: {
    operadoraId: string;
    numeroGuia: string;
    procedimentos: ValidationRequest[];
  }): Promise<{
    conformeGeral: boolean;
    totalDivergencias: number;
    resultados: ValidationResult[];
  }> {
    try {
      console.log(`🔍 Validando guia ${data.numeroGuia} com ${data.procedimentos.length} procedimentos...`);
      
      const response = await this.client.post<{
        conformeGeral: boolean;
        totalDivergencias: number;
        resultados: ValidationResult[];
      }>(
        '/validations/guia',
        data
      );

      console.log(`✅ Validação da guia concluída: ${response.conformeGeral ? 'CONFORME' : 'DIVERGENTE'}`);
      console.log(`   - Total de divergências: ${response.totalDivergencias}`);

      return response;
    } catch (error: any) {
      console.error(`❌ Erro ao validar guia:`, error.message);
      
      // Validar individualmente se a validação em lote falhar
      console.log(`⚠️  Tentando validação individual dos procedimentos...`);
      const resultados: ValidationResult[] = [];
      
      for (const proc of data.procedimentos) {
        const resultado = await this.validateProcedimento(proc);
        resultados.push(resultado);
      }

      const totalDivergencias = resultados.reduce(
        (acc, r) => acc + r.divergencias.length,
        0
      );
      const conformeGeral = resultados.every(r => r.conforme);

      return {
        conformeGeral,
        totalDivergencias,
        resultados
      };
    }
  }
}

export default new ContractsClient();
