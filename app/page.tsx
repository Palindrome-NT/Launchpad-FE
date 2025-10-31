'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../lib/store/hooks';
import { checkAuthStatus } from '../lib/store/thunks/authThunks';

export default function Home() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/posts');
      } else {
        const timer = setTimeout(() => {
          router.push('/auth/login');
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
}
