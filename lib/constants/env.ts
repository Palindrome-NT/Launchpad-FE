export const ENV = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1',
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Launchpad',
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;
