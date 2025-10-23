import HttpClient from './httpClient';

const MS_PATIENTS_URL = process.env.MS_PATIENTS_URL || 'http://10.0.169.202:3001/api/v1';
const MS_PATIENTS_HEALTH = 'http://10.0.169.202:3001';

class PatientsClient {
  private client: HttpClient;
  private healthClient: HttpClient;

  constructor() {
    this.client = new HttpClient(MS_PATIENTS_URL);
	this.healthClient = new HttpClient(MS_PATIENTS_HEALTH);
  }

  /**
   * Health check do serviço
   */
  async healthCheck(): Promise<any> {
    return await this.healthClient.get('/health');
  }

  /**
   * Busca paciente por número da carteira
   */
  async findByInsuranceNumber(insuranceNumber: string): Promise<any> {
    try {
      return await this.client.get(`/patients/insurance/${insuranceNumber}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Cria paciente a partir dos dados do XML
   */
  async createFromXml(patientData: any): Promise<any> {
    return await this.client.post('/patients/from-xml', patientData);
  }

  /**
   * Busca paciente por ID
   */
  async findById(patientId: string): Promise<any> {
    return await this.client.get(`/patients/${patientId}`);
  }

  /**
   * Deleta paciente (para rollback)
   */
  async delete(patientId: string): Promise<any> {
    return await this.client.delete(`/patients/${patientId}`);
  }
}

export default new PatientsClient();

