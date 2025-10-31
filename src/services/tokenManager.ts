import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface TokenData {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

interface DecodedToken {
  exp: number;
  iat: number;
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

class TokenManager {
  private static instance: TokenManager;
  private currentToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpirationTimer: NodeJS.Timeout | null = null;

  private constructor() {
    // Singleton
    this.currentToken = process.env.MS_AUTH_TOKEN || null;
    this.refreshToken = process.env.MS_REFRESH_TOKEN || null;
    
    if (this.currentToken) {
      this.scheduleTokenRefresh();
    }
  }

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  public async getToken(): Promise<string> {
    if (!this.currentToken) {
      await this.refreshAccessToken();
    } else {
      const decoded = this.decodeToken(this.currentToken);
      if (this.isTokenExpiringSoon(decoded)) {
        await this.refreshAccessToken();
      }
    }
    return this.currentToken!;
  }

  private decodeToken(token: string): DecodedToken {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      throw new Error('Invalid token format');
    }
  }

  private isTokenExpiringSoon(decoded: DecodedToken): boolean {
    const expirationThreshold = 5 * 60; // 5 minutos em segundos
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp - currentTime <= expirationThreshold;
  }

  private async refreshAccessToken(): Promise<void> {
    try {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post<TokenData>(
        `${process.env.MS_AUTH_URL}/auth/refresh`,
        { refreshToken: this.refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      this.currentToken = response.data.token;
      this.refreshToken = response.data.refreshToken;

      // Atualizar as variáveis de ambiente em memória
      process.env.MS_AUTH_TOKEN = this.currentToken;
      process.env.MS_REFRESH_TOKEN = this.refreshToken;

      this.scheduleTokenRefresh();

      console.log('🔄 Token refreshed successfully');
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.currentToken = null;
      this.refreshToken = null;
      throw new Error('Failed to refresh token');
    }
  }

  private scheduleTokenRefresh(): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    const decoded = this.decodeToken(this.currentToken!);
    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = (decoded.exp - currentTime - 300) * 1000; // Refresh 5 minutos antes de expirar

    if (timeUntilExpiry > 0) {
      this.tokenExpirationTimer = setTimeout(() => {
        this.refreshAccessToken().catch(console.error);
      }, timeUntilExpiry);
    } else {
      // Token já está expirado ou próximo de expirar
      this.refreshAccessToken().catch(console.error);
    }
  }
}

export default TokenManager;