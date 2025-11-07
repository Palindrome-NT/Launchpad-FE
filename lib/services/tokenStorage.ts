/**
 * Secure Token Storage Service
 *
 * This service implements a hybrid storage approach for JWT tokens:
 * 1. In-memory storage (primary) - Most secure, cleared on page refresh
 * 2. localStorage (fallback) - For persistence across page refreshes
 *
 * Security considerations:
 * - Tokens are primarily kept in memory to reduce XSS attack surface
 * - localStorage is only used as a backup for session persistence
 * - Always clear tokens on logout
 * - Use with HTTPS in production
 * - Implement Content Security Policy (CSP) headers
 */

class TokenStorage {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  private readonly ACCESS_TOKEN_KEY = 'auth_access_token';
  private readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';

  /**
   * Sets both access and refresh tokens
   * Stores in memory (primary) and localStorage (backup)
   */
  setTokens(accessToken: string, refreshToken: string): void {
    // Store in memory
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    // Backup to localStorage for persistence
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      } catch (error) {
        console.error('Failed to save tokens to localStorage:', error);
      }
    }
  }

  /**
   * Gets access token
   * First checks memory, then falls back to localStorage
   */
  getAccessToken(): string | null {
    if (this.accessToken) {
      return this.accessToken;
    }

    // Fallback to localStorage if memory is empty (e.g., after page refresh)
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
        if (token) {
          this.accessToken = token; // Restore to memory
          return token;
        }
      } catch (error) {
        console.error('Failed to read access token from localStorage:', error);
      }
    }

    return null;
  }

  /**
   * Gets refresh token
   * First checks memory, then falls back to localStorage
   */
  getRefreshToken(): string | null {
    if (this.refreshToken) {
      return this.refreshToken;
    }

    // Fallback to localStorage if memory is empty (e.g., after page refresh)
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem(this.REFRESH_TOKEN_KEY);
        if (token) {
          this.refreshToken = token; // Restore to memory
          return token;
        }
      } catch (error) {
        console.error('Failed to read refresh token from localStorage:', error);
      }
    }

    return null;
  }

  /**
   * Updates only the access token (used after token refresh)
   */
  setAccessToken(accessToken: string): void {
    this.accessToken = accessToken;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
      } catch (error) {
        console.error('Failed to save access token to localStorage:', error);
      }
    }
  }

  /**
   * Clears all tokens from memory and localStorage
   */
  clearTokens(): void {
    // Clear from memory
    this.accessToken = null;
    this.refreshToken = null;

    // Clear from localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.ACCESS_TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      } catch (error) {
        console.error('Failed to clear tokens from localStorage:', error);
      }
    }
  }

  /**
   * Checks if user has tokens (indicating authenticated state)
   */
  hasTokens(): boolean {
    return this.getAccessToken() !== null && this.getRefreshToken() !== null;
  }

  /**
   * Decodes JWT token to get expiry time (without verification)
   * Returns null if token is invalid
   */
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  /**
   * Checks if access token is expired or will expire soon
   * @param bufferSeconds - Consider token expired if it expires within this many seconds
   */
  isAccessTokenExpired(bufferSeconds: number = 30): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const expiryTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const bufferTime = bufferSeconds * 1000;

    return currentTime >= (expiryTime - bufferTime);
  }

  /**
   * Gets the time remaining until access token expires (in milliseconds)
   * Returns 0 if token is expired or invalid
   */
  getAccessTokenTimeRemaining(): number {
    const token = this.getAccessToken();
    if (!token) return 0;

    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return 0;

    const expiryTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeRemaining = expiryTime - currentTime;

    return Math.max(0, timeRemaining);
  }
}

export const tokenStorage = new TokenStorage();
