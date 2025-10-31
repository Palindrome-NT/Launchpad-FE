'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Formik, Form, Field } from 'formik';
import { toast } from 'react-hot-toast';
import { Button, Input, Card, CardHeader, CardContent, Alert } from '../../../components/ui';
import { useAppDispatch, useAppSelector } from '../../../lib/store/hooks';
import { verifyOtpUser, resendOtpUser } from '../../../lib/store/thunks/authThunks';
import { verifyOtpSchema } from '../../../lib/utils/validation';
import { getErrorMessage } from '../../../lib/utils/errorHandler';
import { Mail, Shield, ArrowLeft } from 'lucide-react';

const VerifyOtpContent: React.FC = () => {
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [email, setEmail] = useState('');
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      router.push('/auth/register');
    }
  }, [searchParams, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (values: { email: string; otp: string }) => {
    try {
      await dispatch(verifyOtpUser(values)).unwrap();
      toast.success('OTP verified successfully!');
      router.push('/posts');
    } catch (error: any) {
      // Show the exact error message from the backend
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      console.error('OTP verification error:', error);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    
    setIsResending(true);
    try {
      await dispatch(resendOtpUser({ email })).unwrap();
      toast.success('OTP sent successfully!');
      setCountdown(60);
    } catch (error: any) {
      // Show the exact error message from the backend
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      console.error('Resend OTP error:', error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Verify your email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We've sent a 6-digit verification code to{' '}
          <span className="font-medium text-gray-900">{email}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="py-8">
            <Formik
              initialValues={{ email: email || '', otp: '' }}
              validationSchema={verifyOtpSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ errors, touched }) => (
                <Form className="space-y-6">
                  <div>
                    <Field
                      as={Input}
                      name="email"
                      type="email"
                      label="Email Address"
                      placeholder="Enter your email"
                      leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
                      error={touched.email && errors.email ? errors.email : undefined}
                      disabled
                    />
                  </div>

                  <div>
                    <Field
                      as={Input}
                      name="otp"
                      type="text"
                      label="Verification Code"
                      placeholder="Enter 6-digit code"
                      leftIcon={<Shield className="h-4 w-4 text-gray-400" />}
                      error={touched.otp && errors.otp ? errors.otp : undefined}
                      maxLength={6}
                    />
                  </div>

                  <div>
                    <Button
                      type="submit"
                      className="w-full"
                      loading={isLoading}
                      disabled={isLoading}
                    >
                      Verify OTP
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Didn't receive the code?{' '}
                      {countdown > 0 ? (
                        <span className="text-gray-500">
                          Resend in {countdown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={isResending}
                          className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
                        >
                          {isResending ? 'Sending...' : 'Resend OTP'}
                        </button>
                      )}
                    </p>
                  </div>

                  <div className="text-center">
                    <Link
                      href="/auth/register"
                      className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back to registration
                    </Link>
                  </div>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const VerifyOtpPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
};

export default VerifyOtpPage;
