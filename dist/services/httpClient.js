"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const tokenManager_1 = __importDefault(require("./tokenManager"));
/**
 * Cliente HTTP configurado para comunicação entre microsserviços
 */
class HttpClient {
    constructor(baseURL, timeout = 30000, options) {
        if (options?.useAuth) {
            this.tokenManager = tokenManager_1.default.getInstance();
        }
        this.options = {
            apiKey: options?.apiKey,
            apiKeyHeader: options?.apiKeyHeader || 'x-api-key',
            useAuth: options?.useAuth !== undefined ? options.useAuth : true,
            extraHeaders: options?.extraHeaders,
        };
        const apiKeyHeaderName = this.options.apiKeyHeader ?? 'x-api-key';
        this.client = axios_1.default.create({
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
                config.headers[hdr] = this.options.apiKey;
            }
            // Bearer auth (optional)
            if (this.options.useAuth && this.tokenManager) {
                try {
                    const token = await this.tokenManager.getToken();
                    config.headers = config.headers || {};
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                catch (e) {
                    // Soft-fail: log and continue without Authorization header
                    console.warn('[HTTP] Warning: failed to acquire bearer token, proceeding without Authorization header:', e?.message || e);
                }
            }
            return config;
        });
        // Interceptor para log de requisições
        this.client.interceptors.request.use((config) => {
            console.log(`[HTTP] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
            return config;
        }, (error) => {
            console.error('[HTTP] Request error:', error.message);
            return Promise.reject(error);
        });
        // Interceptor para log de respostas
        this.client.interceptors.response.use((response) => {
            console.log(`[HTTP] ${response.status} ${response.config.url}`);
            return response;
        }, (error) => {
            if (error.response) {
                console.error(`[HTTP] ${error.response.status} ${error.config.url}:`, error.response.data);
            }
            else {
                console.error('[HTTP] Response error:', error.message);
            }
            return Promise.reject(error);
        });
    }
    async get(url, params) {
        const response = await this.client.get(url, { params });
        return response.data;
    }
    async post(url, data) {
        const response = await this.client.post(url, data);
        return response.data;
    }
    async put(url, data) {
        const response = await this.client.put(url, data);
        return response.data;
    }
    async delete(url) {
        const response = await this.client.delete(url);
        return response.data;
    }
}
exports.default = HttpClient;
//# sourceMappingURL=httpClient.js.map