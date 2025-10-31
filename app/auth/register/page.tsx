'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Formik, Form, Field } from 'formik';
import { toast } from 'react-hot-toast';
import { signIn, useSession } from 'next-auth/react';
import { Button, Input, Card, CardHeader, CardContent, Alert } from '../../../components/ui';
import { useAppDispatch, useAppSelector } from '../../../lib/store/hooks';
import { registerUser } from '../../../lib/store/thunks/authThunks';
import { setUser } from '../../../lib/store/slices/authSlice';
import { registerSchema } from '../../../lib/utils/validation';
import { getErrorMessage } from '../../../lib/utils/errorHandler';
import { User, Mail, Phone, CreditCard, Lock, Eye, EyeOff } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const userData = session.user as any;
      dispatch(setUser(userData));

      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      toast.success('Registered successfully with Google!');
      router.push('/posts');
    }
  }, [session, status, dispatch, router]);

  const handleSubmit = async (values: {
    name: string;
    aadhaarNumber: string;
    mobile: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      const { confirmPassword, ...registerData } = values;
      await dispatch(registerUser(registerData)).unwrap();
      toast.success('Registration successful! Please check your email for OTP verification.');
      router.push(`/auth/verify-otp?email=${encodeURIComponent(values.email)}`);
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      console.error('Registration error:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signIn('google', {
        callbackUrl: '/posts',
        redirect: true,
      });
    } catch (error) {
      toast.error('Google sign in failed');
      console.error('Google sign in error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            href="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="py-8">
            <Formik
              initialValues={{
                name: '',
                aadhaarNumber: '',
                mobile: '',
                email: '',
                password: '',
                confirmPassword: '',
              }}
              validationSchema={registerSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched }) => (
                <Form className="space-y-6">
                  <div>
                    <Field
                      as={Input}
                      name="name"
                      type="text"
                      label="Full Name"
                      placeholder="Enter your full name"
                      leftIcon={<User className="h-4 w-4 text-gray-400" />}
                      error={touched.name && errors.name ? errors.name : undefined}
                    />
                  </div>

                  <div>
                    <Field
                      as={Input}
                      name="aadhaarNumber"
                      type="text"
                      label="Aadhaar Number"
                      placeholder="Enter your 12-digit Aadhaar number"
                      leftIcon={<CreditCard className="h-4 w-4 text-gray-400" />}
                      error={touched.aadhaarNumber && errors.aadhaarNumber ? errors.aadhaarNumber : undefined}
                    />
                  </div>

                  <div>
                    <Field
                      as={Input}
                      name="mobile"
                      type="tel"
                      label="Mobile Number"
                      placeholder="Enter your 10-digit mobile number"
                      leftIcon={<Phone className="h-4 w-4 text-gray-400" />}
                      error={touched.mobile && errors.mobile ? errors.mobile : undefined}
                    />
                  </div>

                  <div>
                    <Field
                      as={Input}
                      name="email"
                      type="email"
                      label="Email Address"
                      placeholder="Enter your email address"
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
                      helperText="Password must contain at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character"
                    />
                  </div>

                  <div>
                    <Field
                      as={Input}
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirm Password"
                      placeholder="Confirm your password"
                      leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      }
                      error={touched.confirmPassword && errors.confirmPassword ? errors.confirmPassword : undefined}
                    />
                  </div>

                  <div>
                    <Button
                      type="submit"
                      className="w-full"
                      loading={isLoading}
                      disabled={isLoading}
                    >
                      Create Account
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

export default RegisterPage;
