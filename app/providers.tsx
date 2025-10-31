'use client';

import { Provider } from 'react-redux';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { store } from '../lib/store/store';
import { SocketProvider } from '../lib/socket/SocketContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <SessionProvider>
        <SocketProvider>
          <Toaster position="top-right" />
          {children}
        </SocketProvider>
      </SessionProvider>
    </Provider>
  );
}
