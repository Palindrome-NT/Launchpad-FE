'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Formik, Form, Field } from 'formik';
import { toast } from 'react-hot-toast';
import { signIn, useSession } from 'next-auth/react';
import { Button, Input, Card, CardContent } from '../../../components/ui';
import { useAppDispatch, useAppSelector } from '../../../lib/store/hooks';
import { loginUser } from '../../../lib/store/thunks/authThunks';
import { setUser } from '../../../lib/store/slices/authSlice';
import { loginSchema } from '../../../lib/utils/validation';
import { getErrorMessage } from '../../../lib/utils/errorHandler';
import { refreshTokenService } from '../../../lib/services/refreshTokenService';
import { setUserRoleCookie } from '../../../lib/utils/cookies';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {

    const syncSessionWithBackend = async () => {
      if (status === 'authenticated' && session?.idToken) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/sync-session`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                idToken: session.idToken,
              }),
            }
          );

          const data = await response.json();

          if (data.success && data.data) {
            const userData = data.data.user;
            dispatch(setUser(userData));

            if (typeof window !== 'undefined') {
              localStorage.setItem('user', JSON.stringify(userData));
            }

            setUserRoleCookie(userData.role);
            refreshTokenService.startTimer();

            toast.success('Logged in successfully with Google!');
            router.push('/posts');
          } else {
            toast.error(data.message || 'Failed to sync session');
            console.error('Sync session failed:', data);
          }
        } catch (error) {
          console.error('Sync session error:', error);
          toast.error('Failed to complete authentication');
        }
      }
    };

    syncSessionWithBackend();
  }, [session, status, dispatch, router]);

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      const result = await dispatch(loginUser(values)).unwrap();
      toast.success('Login successful!');
      router.push('/posts');
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      console.error('Login error:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signIn('google', {
        callbackUrl: '/posts',
        redirect: false,
      });
      
      if (result?.error) {
        toast.error('Google sign in failed');
      } else if(!!result){
        toast.success('Login successful!');
        router.push('/posts');
      }
    } catch (error) {
      toast.error('Google sign in failed');
      console.error('Google sign in error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            href="/auth/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="py-8">
            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={loginSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched }) => (
                <Form className="space-y-6">
                  <div>
                    <Field
                      as={Input}
                      name="email"
                      type="email"
                      label="Email address"
                      placeholder="Enter your email"
                      leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
                      error={touched.email && errors.email ? errors.email : undefined}
                    />
                  </div>

                  <div>
                    <Field
                      as={Input}
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      label="Password"
                      placeholder="Enter your password"
                      leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      }
                      error={touched.password && errors.password ? errors.password : undefined}
                    />
                  </div>

                  <div>
                    <Button
                      type="submit"
                      className="w-full"
                      loading={isLoading}
                      disabled={isLoading}
                    >
                      Sign in
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with Google</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
