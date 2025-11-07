import { ENV } from '../constants/env';
import { tokenManager } from '../utils/tokenManager';
import type { RefreshTokenResponse } from '../types/auth';

class RefreshTokenService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRefreshing = false;

  async callRefreshTokenAPI(): Promise<boolean> {
    if (this.isRefreshing) {
      console.log('🔄 Refresh already in progress, skipping...');
      return false;
    }

    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      console.log('❌ No refresh token found in localStorage');
      return false;
    }

    this.isRefreshing = true;
    console.log('🔄 Calling refresh token API...');

    try {
      // Call BE directly with refresh token from localStorage
      const response = await fetch(`${ENV.API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Still include for cookie-based auth if it works
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data: RefreshTokenResponse = await response.json();
        console.log('✅ Token refreshed successfully');
        
        // Store new tokens if provided in response body
        if (data.accessToken) {
          tokenManager.setAccessToken(data.accessToken);
          console.log('✅ New access token stored');
        }
        
        if (data.refreshToken) {
          tokenManager.setRefreshToken(data.refreshToken);
          console.log('✅ New refresh token stored (token rotation)');
        }
        
        this.resetTimer();
        return true;
      }
      
      console.log('❌ Refresh failed, status:', response.status);
      
      // Clear tokens on refresh failure (user needs to login again)
      if (response.status === 401 || response.status === 403) {
        console.log('❌ Invalid refresh token, clearing all tokens');
        tokenManager.clearTokens();
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

