import { createAsyncThunk } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '../store';
import { authApi } from '../api/authApi';
import { setUser, setError, clearAuth, setLoading, clearError } from '../slices/authSlice';
import { User, LoginRequest, RegisterRequest, VerifyOtpRequest, ResendOtpRequest } from '../../types/auth';
import { refreshTokenService } from '../../services/refreshTokenService';
import { setUserRoleCookie, clearUserRoleCookie } from '../../utils/cookies';
import { tokenStorage } from '../../services/tokenStorage';

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

      // Store tokens from response
      if (result.accessToken && result.refreshToken) {
        tokenStorage.setTokens(result.accessToken, result.refreshToken);
        console.log('✅ Tokens stored successfully after login');
      } else {
        console.warn('⚠️ No tokens in login response');
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

      // Store tokens from response (if provided)
      if (result.accessToken && result.refreshToken) {
        tokenStorage.setTokens(result.accessToken, result.refreshToken);
        console.log('✅ Tokens stored successfully after registration');
      }

      // Set user role cookie for middleware
      setUserRoleCookie(user.role);

      // Only start timer if tokens are available
      if (result.accessToken && result.refreshToken) {
        refreshTokenService.startTimer();
      }

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

      // Store tokens from response
      if (result.accessToken && result.refreshToken) {
        tokenStorage.setTokens(result.accessToken, result.refreshToken);
        console.log('✅ Tokens stored successfully after OTP verification');
      } else {
        console.warn('⚠️ No tokens in OTP verification response');
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
      // Clear all auth-related data
      dispatch(clearAuth());
      saveUserToStorage(null);
      clearUserRoleCookie();
      refreshTokenService.stopTimer();
      tokenStorage.clearTokens();

      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }

      console.log('✅ Logged out successfully, all tokens cleared');
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
      const hasTokens = tokenStorage.hasTokens();

      // Only restore auth if both user and tokens exist
      if (storedUser && hasTokens) {
        dispatch(setUser(storedUser));
        setUserRoleCookie(storedUser.role);
        refreshTokenService.startTimer();
        console.log('✅ Auth state restored from storage');
        return storedUser;
      }

      // If user exists but no tokens, clear everything
      if (storedUser && !hasTokens) {
        console.warn('⚠️ User found but tokens missing, clearing auth state');
      }

      dispatch(clearAuth());
      tokenStorage.clearTokens();
      return null;
    } catch (error) {
      dispatch(clearAuth());
      tokenStorage.clearTokens();
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }
);
