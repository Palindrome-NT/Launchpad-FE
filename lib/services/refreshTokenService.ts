import { ENV } from '../constants/env';
import { tokenStorage } from './tokenStorage';

class RefreshTokenService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRefreshing = false;

  async callRefreshTokenAPI(): Promise<boolean> {
    if (this.isRefreshing) {
      console.log('🔄 Refresh already in progress, skipping...');
      return false;
    }

    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      console.log('❌ No refresh token available');
      return false;
    }

    this.isRefreshing = true;
    console.log('🔄 Calling refresh token API directly to backend...');

    try {
      const response = await fetch(`${ENV.API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();

        // Update tokens in storage
        if (data.accessToken && data.refreshToken) {
          tokenStorage.setTokens(data.accessToken, data.refreshToken);
          console.log('✅ Token refreshed successfully');
          this.resetTimer();
          return true;
        } else if (data.accessToken) {
          // If only access token is returned, update just that
          tokenStorage.setAccessToken(data.accessToken);
          console.log('✅ Access token refreshed successfully');
          this.resetTimer();
          return true;
        }

        console.log('⚠️ No tokens in refresh response');
        return false;
      }

      console.log('❌ Refresh failed, status:', response.status);

      // If refresh fails with 401, tokens are invalid - clear them
      if (response.status === 401) {
        tokenStorage.clearTokens();
      }

      return false;
    } catch (error) {
      console.error('❌ Refresh token error:', error);
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  startTimer(): void {
    this.stopTimer();
    const refreshInterval = 10 * 60 * 1000;
    
    this.intervalId = setInterval(() => {
      console.log('⏰ Timer fired, refreshing token...');
      this.callRefreshTokenAPI();
    }, refreshInterval);
    
    console.log(`⏰ Refresh timer started (will refresh in ${refreshInterval / 1000} seconds)`);
  }

  stopTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏸️ Refresh timer stopped');
    }
  }

  resetTimer(): void {
    this.startTimer();
  }
}

export const refreshTokenService = new RefreshTokenService();

