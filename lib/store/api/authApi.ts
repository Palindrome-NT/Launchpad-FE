import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import { 
  AuthResponse, 
  RefreshTokenResponse, 
  LoginRequest, 
  RegisterRequest, 
  VerifyOtpRequest, 
  ResendOtpRequest 
} from '../../types/auth';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth, // Use our custom base query with refresh token logic
  tagTypes: ['User'],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    verifyOtp: builder.mutation<AuthResponse, VerifyOtpRequest>({
      query: (otpData) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body: otpData,
      }),
      invalidatesTags: ['User'],
    }),
    resendOtp: builder.mutation<AuthResponse, ResendOtpRequest>({
      query: (emailData) => ({
        url: '/auth/resend-otp',
        method: 'POST',
        body: emailData,
      }),
    }),
    refreshToken: builder.mutation<RefreshTokenResponse, { refreshToken: string }>({
      query: (tokenData) => ({
        url: '/auth/refresh-token',
        method: 'POST',
        body: tokenData,
      }),
    }),
    logout: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
} = authApi;
