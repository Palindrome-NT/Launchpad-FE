/**
 * Token Manager Utility
 * 
 * Manages access and refresh tokens in localStorage
 * Fallback solution for cross-domain cookie issues
 */

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

export const tokenManager = {
  /**
   * Store access token
   */
  setAccessToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, token);
      console.log('✅ Access token stored in localStorage');
    } catch (error) {
      console.error('❌ Failed to store access token:', error);
    }
  },

  /**
   * Get access token
   */
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('❌ Failed to get access token:', error);
      return null;
    }
  },

  /**
   * Store refresh token
   */
  setRefreshToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, token);
      console.log('✅ Refresh token stored in localStorage');
    } catch (error) {
      console.error('❌ Failed to store refresh token:', error);
    }
  },

  /**
   * Get refresh token
   */
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('❌ Failed to get refresh token:', error);
      return null;
    }
  },

  /**
   * Store both tokens
   */
  setTokens: (accessToken: string, refreshToken: string): void => {
    tokenManager.setAccessToken(accessToken);
    tokenManager.setRefreshToken(refreshToken);
  },

  /**
   * Clear all tokens
   */
  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
      console.log('✅ Tokens cleared from localStorage');
    } catch (error) {
      console.error('❌ Failed to clear tokens:', error);
    }
  },

  /**
   * Check if access token exists
   */
  hasAccessToken: (): boolean => {
    return !!tokenManager.getAccessToken();
  },

  /**
   * Check if refresh token exists
   */
  hasRefreshToken: (): boolean => {
    return !!tokenManager.getRefreshToken();
  },

  /**
   * Check if user is authenticated (has tokens)
   */
  isAuthenticated: (): boolean => {
    return tokenManager.hasAccessToken() && tokenManager.hasRefreshToken();
  },

  /**
   * Get Authorization header with Bearer token
   */
  getAuthHeader: (): string | null => {
    const token = tokenManager.getAccessToken();
    return token ? `Bearer ${token}` : null;
  },
};

export default tokenManager;

