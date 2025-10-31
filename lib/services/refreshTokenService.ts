import { ENV } from '../constants/env';

class RefreshTokenService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRefreshing = false;

  async callRefreshTokenAPI(): Promise<boolean> {
    if (this.isRefreshing) {
      console.log('🔄 Refresh already in progress, skipping...');
      return false;
    }

    this.isRefreshing = true;
    console.log('🔄 Calling refresh token API via Next.js route...');

    try {
      const response = await fetch('/api/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        console.log('✅ Token refreshed successfully');
        this.resetTimer();
        return true;
      }
      
      console.log('❌ Refresh failed, status:', response.status);
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

