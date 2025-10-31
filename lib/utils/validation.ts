import * as Yup from 'yup';

export const loginSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

export const registerSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  aadhaarNumber: Yup.string()
    .matches(/^\d{12}$/, 'Aadhaar number must be exactly 12 digits')
    .required('Aadhaar number is required'),
  mobile: Yup.string()
    .matches(/^\d{10}$/, 'Mobile number must be exactly 10 digits')
    .required('Mobile number is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export const verifyOtpSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  otp: Yup.string()
    .matches(/^\d{6}$/, 'OTP must be exactly 6 digits')
    .required('OTP is required'),
});

export const resendOtpSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});
