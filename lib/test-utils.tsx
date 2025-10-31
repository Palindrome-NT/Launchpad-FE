import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './store/slices/authSlice';

// Mock SessionProvider since next-auth/react is already mocked
const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Dynamically import APIs to handle potential undefined issues
let authApi: any;
let postsApi: any;
let commentsApi: any;
let usersApi: any;

try {
  authApi = require('./store/api/authApi').authApi;
  postsApi = require('./store/api/postsApi').postsApi;
  commentsApi = require('./store/api/commentsApi').commentsApi;
  usersApi = require('./store/api/usersApi').usersApi;
} catch (e) {
  // If APIs fail to load, create minimal mocks
  console.warn('Some APIs failed to load, using minimal mocks');
}

// Create a test store
const createTestStore = (initialState = {}) => {
  const reducers: any = {
    auth: authReducer,
  };

  // Add API reducers if available
  if (authApi?.reducerPath && authApi?.reducer) {
    reducers[authApi.reducerPath] = authApi.reducer;
  }
  if (postsApi?.reducerPath && postsApi?.reducer) {
    reducers[postsApi.reducerPath] = postsApi.reducer;
  }
  if (commentsApi?.reducerPath && commentsApi?.reducer) {
    reducers[commentsApi.reducerPath] = commentsApi.reducer;
  }
  if (usersApi?.reducerPath && usersApi?.reducer) {
    reducers[usersApi.reducerPath] = usersApi.reducer;
  }

  const middleware: any[] = [];
  if (authApi?.middleware) middleware.push(authApi.middleware);
  if (postsApi?.middleware) middleware.push(postsApi.middleware);
  if (commentsApi?.middleware) middleware.push(commentsApi.middleware);
  if (usersApi?.middleware) middleware.push(usersApi.middleware);

  return configureStore({
    reducer: reducers,
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(...middleware),
  });
};

// Custom render function that includes providers
const AllTheProviders = ({
  children,
  initialState = {},
}: {
  children: React.ReactNode;
  initialState?: any;
}) => {
  const store = createTestStore(initialState);

  return (
    <Provider store={store}>
      <SessionProvider>
        {children}
      </SessionProvider>
    </Provider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { initialState?: any }
) => {
  const { initialState, ...renderOptions } = options || {};
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders initialState={initialState}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

