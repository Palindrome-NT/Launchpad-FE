# Launchpad Frontend

A modern Next.js 16 application with clean architecture, authentication, and responsive design.

## Features

- 🔐 Complete authentication system (Login, Register, OTP Verification)
- 🎨 Clean and responsive UI with Tailwind CSS
- 🏗️ Clean architecture with separated concerns
- 🔄 Automatic token refresh functionality
- 📱 Mobile-first responsive design
- ✅ Form validation with Formik and Yup
- 🚀 TypeScript for type safety
- 🍪 HTTP-only cookie authentication

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: Formik + Yup validation
- **HTTP Client**: Axios with interceptors
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page
│   │   ├── register/      # Registration page
│   │   └── verify-otp/    # OTP verification page
│   ├── dashboard/         # Protected dashboard
│   └── layout.tsx         # Root layout with providers
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── ProtectedRoute.tsx # Route protection wrapper
├── lib/                  # Core utilities and logic
│   ├── api/              # HTTP client and API calls
│   ├── contexts/         # React contexts (Auth)
│   ├── types/            # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── constants/         # App constants
└── middleware.ts          # Next.js middleware
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on port 5000

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Update environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
   NEXT_PUBLIC_APP_NAME=Launchpad
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Authentication Flow

1. **Registration**: Users register with name, Aadhaar, mobile, email, and password
2. **OTP Verification**: Email OTP sent for verification
3. **Login**: Users can login with email and password
4. **Token Management**: Automatic refresh token handling
5. **Protected Routes**: Dashboard and other protected pages

## API Integration

The app integrates with the following backend endpoints:

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/verify-otp` - OTP verification
- `POST /auth/resend-otp` - Resend OTP
- `POST /auth/refresh-token` - Token refresh
- `POST /auth/logout` - User logout

## Key Features

### Clean Architecture
- Separated UI components from business logic
- Centralized API management
- Type-safe interfaces
- Reusable components

### Authentication
- HTTP-only cookie authentication
- Automatic token refresh
- Protected route handling
- Form validation with proper error messages

### UI/UX
- Responsive design for all screen sizes
- Loading states and error handling
- Toast notifications for user feedback
- Clean and modern interface

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Organization

- **Components**: Reusable UI components in `components/ui/`
- **Pages**: Next.js pages in `app/` directory
- **API**: HTTP client and API calls in `lib/api/`
- **Types**: TypeScript definitions in `lib/types/`
- **Utils**: Helper functions in `lib/utils/`

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

3. Update environment variables for production:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api/v1
   ```

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Write clean and readable code
4. Test your changes thoroughly
5. Follow the established naming conventions

## License

This project is licensed under the MIT License.