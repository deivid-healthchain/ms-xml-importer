import axios, { AxiosInstance } from 'axios';
import TokenManager from './tokenManager';

/**
 * Cliente HTTP configurado para comunicação entre microsserviços
 */
class HttpClient {
  private client: AxiosInstance;
  private tokenManager: TokenManager;

  constructor(baseURL: string, timeout: number = 30000) {
    this.tokenManager = TokenManager.getInstance();
    
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Adiciona interceptor para incluir token atualizado em cada requisição
    this.client.interceptors.request.use(async (config) => {
      const token = await this.tokenManager.getToken();
      config.headers['Authorization'] = `Bearer ${token}`;
      return config;
    });

    // Interceptor para log de requisições
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[HTTP] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
      },
      (error) => {
        console.error('[HTTP] Request error:', error.message);
        return Promise.reject(error);
      }
    );

    // Interceptor para log de respostas
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[HTTP] ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        if (error.response) {
          console.error(
            `[HTTP] ${error.response.status} ${error.config.url}:`,
            error.response.data
          );
        } else {
          console.error('[HTTP] Response error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }
}

export default HttpClient;

