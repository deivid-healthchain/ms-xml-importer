import axios, { AxiosInstance } from 'axios';

/**
 * Cliente HTTP configurado para comunicação entre microsserviços
 */
class HttpClient {
  private client: AxiosInstance;

  constructor(baseURL: string, timeout: number = 30000) {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LWFkbWluLTEyMyIsImVtYWlsIjoiYWRtaW5AbGF6YXJ1cy5jb20iLCJyb2xlIjoiYWRtaW4iLCJwZXJtaXNzaW9ucyI6WyJjcmVhdGU6cGF0aWVudCIsInJlYWQ6cGF0aWVudCIsInVwZGF0ZTpwYXRpZW50IiwiZGVsZXRlOnBhdGllbnQiLCJtYW5hZ2U6cGF0aWVudHMiXSwiaWF0IjoxNzYxMTg1NDY2LCJleHAiOjE3NjEyNzE4NjZ9.RNtUON8xsoxQpAqU_Is-B-5h5F0irzlQyE7qCbuC7rU';
    
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
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

