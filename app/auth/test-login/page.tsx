'use client';

import React, { useState } from 'react';
import { Button } from '../../../components/ui';
import { useRouter } from 'next/navigation';

/**
 * TEST PAGE: Direct Client-Side API Call
 * 
 * This page tests if cookies are properly set when making
 * direct fetch calls from the client side (bypassing Next.js SSR)
 */

const TestLoginPage: React.FC = () => {
  const [email, setEmail] = useState('naman@yopmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const testDirectFetch = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('🔍 Testing direct fetch from client side...');
      console.log('📍 Making request to:', `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // This is CRITICAL for cross-domain cookies
        body: JSON.stringify({ email, password }),
      });

      console.log('📦 Response status:', response.status);
      console.log('📦 Response headers:', Object.fromEntries(response.headers.entries()));

      // Check Set-Cookie headers (may not be visible in browser due to security)
      const setCookieHeader = response.headers.get('set-cookie');
      console.log("🚀 ~ testDirectFetch ~ setCookieHeader:", document.cookie)
      console.log('🍪 Set-Cookie header:', setCookieHeader || 'Not visible from client');

      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store tokens in localStorage (fallback method)
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        console.log('✅ Stored accessToken in localStorage');
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
        console.log('✅ Stored refreshToken in localStorage');
      }

      // Store user data
      if (data.data?.user) {
        localStorage.setItem('user', JSON.stringify(data.data.user));
        console.log('✅ Stored user in localStorage');
      }

      // Check if cookies were actually set in the browser
      const allCookies = document.cookie;
      console.log('🍪 All cookies in browser:', allCookies || 'No cookies found');

      // Try to access specific cookies
      const accessTokenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='));
      const refreshTokenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('refreshToken='));

      console.log('🍪 accessToken cookie:', accessTokenCookie || 'Not found');
      console.log('🍪 refreshToken cookie:', refreshTokenCookie || 'Not found');

      setResult({
        success: true,
        data,
        cookies: {
          all: allCookies || 'No cookies',
          accessToken: accessTokenCookie || 'Not set',
          refreshToken: refreshTokenCookie || 'Not set',
        },
        localStorage: {
          accessToken: localStorage.getItem('accessToken') ? 'Stored ✅' : 'Not stored ❌',
          refreshToken: localStorage.getItem('refreshToken') ? 'Stored ✅' : 'Not stored ❌',
          user: localStorage.getItem('user') ? 'Stored ✅' : 'Not stored ❌',
        }
      });

    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message);
      setResult({
        success: false,
        error: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const testApiCallWithCookies = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔍 Testing API call with cookies...');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/posts`, {
        method: 'GET',
        credentials: 'include', // Include cookies in request
      });

      console.log('📦 Posts API Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Posts API Response data:', data);

      setResult({
        success: response.ok,
        message: response.ok ? 'API call with cookies successful! ✅' : 'API call failed ❌',
        data,
      });

    } catch (err: any) {
      console.error('❌ Error calling posts API:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testApiCallWithLocalStorage = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔍 Testing API call with localStorage token...');
      
      const accessToken = localStorage.getItem('accessToken');
      console.log('🔑 Token from localStorage:', accessToken ? 'Found' : 'Not found');

      if (!accessToken) {
        throw new Error('No access token in localStorage. Login first.');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/posts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📦 Posts API Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Posts API Response data:', data);

      setResult({
        success: response.ok,
        message: response.ok ? 'API call with Bearer token successful! ✅' : 'API call failed ❌',
        data,
      });

    } catch (err: any) {
      console.error('❌ Error calling posts API:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    localStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    setResult(null);
    setError('');
    console.log('🗑️ Cleared all data');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2">🧪 Cookie Test Page</h1>
          <p className="text-gray-600 mb-6">
            Testing if cookies work with direct client-side fetch calls
          </p>

          {/* Test Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Test Information:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• FE: https://launchpad-fe-i59a.onrender.com</li>
              <li>• BE: {process.env.NEXT_PUBLIC_API_BASE_URL}</li>
              <li>• Method: Direct fetch() from client side</li>
              <li>• Credentials: include (for cross-domain cookies)</li>
            </ul>
          </div>

          {/* Login Form */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Button
              onClick={testDirectFetch}
              disabled={loading || !email || !password}
              className="w-full"
            >
              {loading ? '⏳ Testing...' : '1️⃣ Test Login (Direct Fetch)'}
            </Button>

            <Button
              onClick={testApiCallWithCookies}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? '⏳ Testing...' : '2️⃣ Test API (with Cookies)'}
            </Button>

            <Button
              onClick={testApiCallWithLocalStorage}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? '⏳ Testing...' : '3️⃣ Test API (with Bearer Token)'}
            </Button>

            <Button
              onClick={clearAll}
              variant="outline"
              className="w-full text-red-600 hover:text-red-700"
            >
              🗑️ Clear All Data
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-medium">❌ Error:</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">📊 Test Results:</h3>
              <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">📝 Test Steps:</h3>
            <ol className="text-sm text-yellow-800 space-y-2">
              <li>1. Click "Test Login" to make direct fetch call from client</li>
              <li>2. Check console (F12) for detailed logs</li>
              <li>3. Check if cookies are set in Application → Cookies (F12)</li>
              <li>4. Try "Test API (with Cookies)" to see if cookies are sent</li>
              <li>5. Try "Test API (with Bearer Token)" to test localStorage approach</li>
            </ol>
          </div>

          {/* Navigation */}
          <div className="mt-6 flex gap-4">
            <Button
              onClick={() => router.push('/auth/login')}
              variant="outline"
            >
              ← Back to Normal Login
            </Button>
            <Button
              onClick={() => router.push('/posts')}
              variant="outline"
            >
              Go to Posts →
            </Button>
          </div>
        </div>

        {/* Expected Results Info */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">🎯 What to Expect:</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-green-700 mb-2">✅ If Cookies Work:</h3>
              <ul className="text-sm text-gray-700 space-y-1 ml-4">
                <li>• You'll see cookies in Application → Cookies</li>
                <li>• "Test API (with Cookies)" will work without Bearer token</li>
                <li>• Cookies will be automatically sent with requests</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-red-700 mb-2">❌ If Cookies Don't Work:</h3>
              <ul className="text-sm text-gray-700 space-y-1 ml-4">
                <li>• No cookies visible in browser (cross-domain issue)</li>
                <li>• "Test API (with Cookies)" will fail with 401</li>
                <li>• BUT "Test API (with Bearer Token)" should work!</li>
                <li>• This confirms we need localStorage + Bearer approach</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-blue-700 mb-2">💡 Backend Requirements for Cookies to Work:</h3>
              <ul className="text-sm text-gray-700 space-y-1 ml-4">
                <li>• Set-Cookie must include: <code className="bg-gray-100 px-1">SameSite=None; Secure</code></li>
                <li>• CORS must include: <code className="bg-gray-100 px-1">credentials: true</code></li>
                <li>• CORS origin must be exact (not *): <code className="bg-gray-100 px-1">https://launchpad-fe-i59a.onrender.com</code></li>
                <li>• DO NOT set Domain attribute (let browser handle it)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestLoginPage;

