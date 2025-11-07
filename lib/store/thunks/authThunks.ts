import { createAsyncThunk } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '../store';
import { authApi } from '../api/authApi';
import { setUser, setError, clearAuth, setLoading, clearError } from '../slices/authSlice';
import { User, LoginRequest, RegisterRequest, VerifyOtpRequest, ResendOtpRequest } from '../../types/auth';
import { refreshTokenService } from '../../services/refreshTokenService';
import { setUserRoleCookie, clearUserRoleCookie } from '../../utils/cookies';
import { tokenManager } from '../../utils/tokenManager';

// Helper functions for localStorage
const saveUserToStorage = (user: User | null) => {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

const getUserFromStorage = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

// Async thunks
export const loginUser = createAsyncThunk<
  User,
  LoginRequest,
  { dispatch: AppDispatch }
>(
  'auth/loginUser',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      // @ts-ignore - RTK Query type issue, works at runtime
      const result = await dispatch(authApi.endpoints.login.initiate(credentials)).unwrap();
      
      const user = result.data.user;
      dispatch(setUser(user));
      saveUserToStorage(user);
      
      // Store tokens from response body (for cross-domain scenarios)
      if (result.accessToken && result.refreshToken) {
        tokenManager.setTokens(result.accessToken, result.refreshToken);
        console.log('✅ Tokens stored in localStorage');
      }
      
      // Set user role cookie for middleware
      setUserRoleCookie(user.role);
      
      refreshTokenService.startTimer();
      
      return user;
    } catch (error: any) {
      const errorMessage = error.data?.message || error.message || 'Login failed';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const registerUser = createAsyncThunk<
  User,
  RegisterRequest,
  { dispatch: AppDispatch }
>(
  'auth/registerUser',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      // @ts-ignore - RTK Query type issue, works at runtime
      const result = await dispatch(authApi.endpoints.register.initiate(userData)).unwrap();
      
      const user = result.data.user;
      dispatch(setUser(user));
      saveUserToStorage(user);
      
      // Store tokens from response body (for cross-domain scenarios)
      if (result.accessToken && result.refreshToken) {
        tokenManager.setTokens(result.accessToken, result.refreshToken);
        console.log('✅ Tokens stored in localStorage');
      }
      
      // Set user role cookie for middleware
      setUserRoleCookie(user.role);
      
      refreshTokenService.startTimer();
      
      return user;
    } catch (error: any) {
      const errorMessage = error.data?.message || error.message || 'Registration failed';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const verifyOtpUser = createAsyncThunk<
  User,
  VerifyOtpRequest,
  { dispatch: AppDispatch }
>(
  'auth/verifyOtpUser',
  async (otpData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      // @ts-ignore - RTK Query type issue, works at runtime
      const result = await dispatch(authApi.endpoints.verifyOtp.initiate(otpData)).unwrap();
      
      const user = result.data.user;
      dispatch(setUser(user));
      saveUserToStorage(user);
      
      // Store tokens from response body (for cross-domain scenarios)
      if (result.accessToken && result.refreshToken) {
        tokenManager.setTokens(result.accessToken, result.refreshToken);
        console.log('✅ Tokens stored in localStorage');
      }
      
      // Set user role cookie for middleware
      setUserRoleCookie(user.role);
      
      refreshTokenService.startTimer();
      
      return user;
    } catch (error: any) {
      const errorMessage = error.data?.message || error.message || 'OTP verification failed';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const resendOtpUser = createAsyncThunk<
  void,
  ResendOtpRequest,
  { dispatch: AppDispatch }
>(
  'auth/resendOtpUser',
  async (emailData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      // @ts-ignore - RTK Query type issue, works at runtime
      await dispatch(authApi.endpoints.resendOtp.initiate(emailData)).unwrap();
    } catch (error: any) {
      const errorMessage = error.data?.message || error.message || 'Failed to resend OTP';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const logoutUser = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch }
>(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    try {
      // @ts-ignore - RTK Query type issue, works at runtime
      await dispatch(authApi.endpoints.logout.initiate()).unwrap();
    } catch (error) {
      console.error('Backend logout failed:', error);
    } finally {
      dispatch(clearAuth());
      saveUserToStorage(null);
      clearUserRoleCookie();
      tokenManager.clearTokens(); // Clear tokens from localStorage
      refreshTokenService.stopTimer();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
    }
  }
);

export const checkAuthStatus = createAsyncThunk<
  User | null,
  void,
  { dispatch: AppDispatch }
>(
  'auth/checkAuthStatus',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      
      const storedUser = getUserFromStorage();
      const hasTokens = tokenManager.isAuthenticated();
      
      // User is authenticated if we have user data AND tokens
      if (storedUser && hasTokens) {
        dispatch(setUser(storedUser));
        setUserRoleCookie(storedUser.role);
        refreshTokenService.startTimer();
        return storedUser;
      }
      
      // If user exists but no tokens, or vice versa, clear everything
      if (storedUser && !hasTokens) {
        console.log('⚠️ User data exists but no tokens found, clearing auth');
      } else if (!storedUser && hasTokens) {
        console.log('⚠️ Tokens exist but no user data found, clearing auth');
      }
      
      dispatch(clearAuth());
      tokenManager.clearTokens();
      return null;
    } catch (error) {
      dispatch(clearAuth());
      tokenManager.clearTokens();
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }
);
