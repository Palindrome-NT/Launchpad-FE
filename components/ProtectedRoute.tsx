'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../lib/store/hooks';
import { checkAuthStatus } from '../lib/store/thunks/authThunks';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status on mount
    dispatch(checkAuthStatus());
  }, [dispatch]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Add a small delay to prevent flash of login page
      const timer = setTimeout(() => {
        router.push('/auth/login');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
