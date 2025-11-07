export type UserRole = 'user' | 'admin' | 'superadmin';
export type AuthProvider = 'local' | 'google';

export interface User {
  _id: string;
  name?: string;
  email: string;
  mobile?: string;
  aadhaarNumber?: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  isDeleted: boolean;
  googleId?: string;
  picture?: string;
  provider?: AuthProvider;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  refreshTokenExpiresAt?: string;
  otpExpiresAt?: string | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
  accessToken?: string;
  refreshToken?: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {};
  accessToken?: string;
  refreshToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  aadhaarNumber: string;
  mobile: string;
  email: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UsersListResponse {
  success: boolean;
  message: string;
  data: {
    items: User[];
    pagination: PaginationMeta;
  };
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
}
