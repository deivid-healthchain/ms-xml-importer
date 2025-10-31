import axios, { AxiosInstance } from 'axios';
import TokenManager from './tokenManager';

type HttpClientOptions = {
  apiKey?: string;
  apiKeyHeader?: string; // defaults to 'x-api-key'
  extraHeaders?: Record<string, string>;
  useAuth?: boolean; // include Bearer Authorization via TokenManager (default: true)
};

/**
 * Cliente HTTP configurado para comunicação entre microsserviços
 */
class HttpClient {
  private client: AxiosInstance;
  private tokenManager?: TokenManager;
  private options: HttpClientOptions;

  constructor(baseURL: string, timeout: number = 30000, options?: HttpClientOptions) {
    if (options?.useAuth) {
      this.tokenManager = TokenManager.getInstance();
    }
    this.options = {
      apiKey: options?.apiKey,
      apiKeyHeader: options?.apiKeyHeader || 'x-api-key',
      useAuth: options?.useAuth !== undefined ? options.useAuth : true,
      extraHeaders: options?.extraHeaders,
    };
    
    const apiKeyHeaderName = this.options.apiKeyHeader ?? 'x-api-key';

    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        ...(this.options.apiKey ? { [apiKeyHeaderName]: this.options.apiKey } : {}),
        ...(this.options.extraHeaders || {}),
      },
    });

    // Adiciona interceptor para incluir token atualizado em cada requisição
    this.client.interceptors.request.use(async (config) => {
      // API Key header (if provided) - ensure it's present even if headers were replaced per-request
      if (this.options.apiKey) {
        config.headers = config.headers || {};
        const hdr = this.options.apiKeyHeader ?? 'x-api-key';
        (config.headers as any)[hdr] = this.options.apiKey;
      }

      // Bearer auth (optional)
      if (this.options.useAuth && this.tokenManager) {
        try {
          const token = await this.tokenManager.getToken();
          config.headers = config.headers || {};
          (config.headers as any)['Authorization'] = `Bearer ${token}`;
        } catch (e: any) {
          // Soft-fail: log and continue without Authorization header
          console.warn('[HTTP] Warning: failed to acquire bearer token, proceeding without Authorization header:', e?.message || e);
        }
      }

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

