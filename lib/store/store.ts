import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { authApi } from './api/authApi';
import { postsApi } from './api/postsApi';
import { commentsApi } from './api/commentsApi';
import { usersApi } from './api/usersApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [postsApi.reducerPath]: postsApi.reducer,
    [commentsApi.reducerPath]: commentsApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          authApi.util.resetApiState.type,
          postsApi.util.resetApiState.type,
          commentsApi.util.resetApiState.type,
          usersApi.util.resetApiState.type,
        ],
      },
    }).concat(authApi.middleware, postsApi.middleware, commentsApi.middleware, usersApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
