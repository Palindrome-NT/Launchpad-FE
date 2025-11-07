import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { ENV } from '../../constants/env';
import { refreshTokenService } from '../../services/refreshTokenService';
import { tokenManager } from '../../utils/tokenManager';

type QueuedRequest = {
  args: any;
  api: any;
  extraOptions: any;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
};

const failedRequestsQueue: QueuedRequest[] = [];
let isRefreshingToken = false;

const baseQuery = fetchBaseQuery({
  baseUrl: ENV.API_BASE_URL,
  credentials: 'include', // Still include for testing if cookies work
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    
    // Add Authorization header from localStorage (fallback for cross-domain)
    const accessToken = tokenManager.getAccessToken();
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
      console.log('🔑 Added Bearer token to request headers');
    }
    
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const url = typeof args === 'string' ? args : args.url;
    
    if (url?.includes('/auth/login') || url?.includes('/auth/register') || 
        url?.includes('/auth/verify-otp') || url?.includes('/auth/resend-otp') ||
        url?.includes('/auth/refresh-token')) {
      return result;
    }

    return new Promise((resolve) => {
      failedRequestsQueue.push({ args, api, extraOptions, resolve, reject: resolve });

      if (!isRefreshingToken) {
        isRefreshingToken = true;
        console.log('🔄 401 detected, refreshing token and retrying queued requests...');

        refreshTokenService.callRefreshTokenAPI().then(async (success) => {
          isRefreshingToken = false;

          if (success) {
            console.log(`✅ Retrying ${failedRequestsQueue.length} queued request(s)`);
            
            const queueToProcess = [...failedRequestsQueue];
            failedRequestsQueue.length = 0;
            
            for (const queuedRequest of queueToProcess) {
              const retryResult = await baseQuery(
                queuedRequest.args,
                queuedRequest.api,
                queuedRequest.extraOptions
              );
              queuedRequest.resolve(retryResult);
            }
          } else {
            console.log('❌ Refresh failed, rejecting queued requests');
            
            const queueToProcess = [...failedRequestsQueue];
            failedRequestsQueue.length = 0;
            
            queueToProcess.forEach((queuedRequest) => {
              queuedRequest.resolve({
                error: {
                  status: 401,
                  data: { message: 'Token refresh failed' },
                },
              });
            });
            
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
          }
        });
      }
    });
  }

  return result;
};
