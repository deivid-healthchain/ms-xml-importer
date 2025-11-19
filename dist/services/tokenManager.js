"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const jwt_decode_1 = require("jwt-decode");
class TokenManager {
    constructor() {
        this.currentToken = null;
        this.refreshToken = null;
        this.tokenExpirationTimer = null;
        // Singleton
        this.currentToken = process.env.MS_AUTH_TOKEN || null;
        this.refreshToken = process.env.MS_REFRESH_TOKEN || null;
        if (this.currentToken) {
            this.scheduleTokenRefresh();
        }
    }
    static getInstance() {
        if (!TokenManager.instance) {
            TokenManager.instance = new TokenManager();
        }
        return TokenManager.instance;
    }
    async getToken() {
        if (!this.currentToken) {
            await this.refreshAccessToken();
        }
        else {
            const decoded = this.decodeToken(this.currentToken);
            if (this.isTokenExpiringSoon(decoded)) {
                await this.refreshAccessToken();
            }
        }
        return this.currentToken;
    }
    decodeToken(token) {
        try {
            return (0, jwt_decode_1.jwtDecode)(token);
        }
        catch (error) {
            console.error('Error decoding token:', error);
            throw new Error('Invalid token format');
        }
    }
    isTokenExpiringSoon(decoded) {
        const expirationThreshold = 5 * 60; // 5 minutos em segundos
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp - currentTime <= expirationThreshold;
    }
    async refreshAccessToken() {
        try {
            if (!this.refreshToken) {
                throw new Error('No refresh token available');
            }
            const response = await axios_1.default.post(`${process.env.MS_AUTH_URL}/auth/refresh`, { refreshToken: this.refreshToken }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            this.currentToken = response.data.token;
            this.refreshToken = response.data.refreshToken;
            // Atualizar as variáveis de ambiente em memória
            process.env.MS_AUTH_TOKEN = this.currentToken;
            process.env.MS_REFRESH_TOKEN = this.refreshToken;
            this.scheduleTokenRefresh();
            console.log('🔄 Token refreshed successfully');
        }
        catch (error) {
            console.error('Error refreshing token:', error);
            this.currentToken = null;
            this.refreshToken = null;
            throw new Error('Failed to refresh token');
        }
    }
    scheduleTokenRefresh() {
        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
        }
        const decoded = this.decodeToken(this.currentToken);
        const currentTime = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = (decoded.exp - currentTime - 300) * 1000; // Refresh 5 minutos antes de expirar
        if (timeUntilExpiry > 0) {
            this.tokenExpirationTimer = setTimeout(() => {
                this.refreshAccessToken().catch(console.error);
            }, timeUntilExpiry);
        }
        else {
            // Token já está expirado ou próximo de expirar
            this.refreshAccessToken().catch(console.error);
        }
    }
}
exports.default = TokenManager;
//# sourceMappingURL=tokenManager.js.map