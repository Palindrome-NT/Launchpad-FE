# Cross-Domain Authentication Guide

## Problem Overview

When your frontend and backend are deployed on different domains/subdomains:
- **FE**: `https://launchpad-fe-i59a.onrender.com`
- **BE**: `https://launchpad-be-w9bz.onrender.com`

Cookies sent via `Set-Cookie` headers from the backend **cannot be stored** in the browser because:
1. They are on different domains (not just different subdomains of the same domain)
2. Browsers block cross-domain cookies by default for security

## Solution Implemented

We've implemented a **dual approach** that works for both same-domain and cross-domain scenarios:

### 1. **Primary Method: Bearer Token + localStorage**
- Backend sends `accessToken` and `refreshToken` in response body
- Frontend stores tokens in localStorage
- Frontend attaches tokens as `Authorization: Bearer <token>` headers
- Works 100% cross-domain ✅

### 2. **Fallback Method: Cookies (for same-domain)**
- Still uses `credentials: 'include'` in fetch calls
- Backend still sets cookies via `Set-Cookie` headers
- Works automatically when FE and BE are on same domain ✅

## Updated Files

### Core Changes:
1. **`lib/utils/tokenManager.ts`** - New utility to manage tokens in localStorage
2. **`lib/types/auth.ts`** - Updated to include `accessToken` and `refreshToken` in response
3. **`lib/store/api/baseQuery.ts`** - Adds Bearer token to all requests automatically
4. **`lib/services/refreshTokenService.ts`** - Uses localStorage tokens for refresh
5. **`lib/store/thunks/authThunks.ts`** - Stores tokens from response body to localStorage
6. **`app/auth/test-login/page.tsx`** - NEW test page to verify behavior

## How It Works

### Login Flow:
```
1. User logs in → API call to /auth/login
2. Backend responds with:
   {
     "data": { "user": {...} },
     "accessToken": "eyJhb...",
     "refreshToken": "eyJhb..."
   }
3. Frontend stores:
   - User data → localStorage['user']
   - Access token → localStorage['accessToken']
   - Refresh token → localStorage['refreshToken']
4. Future API calls automatically include:
   - Header: Authorization: Bearer <accessToken>
```

### Token Refresh Flow:
```
1. Any API returns 401 Unauthorized
2. baseQuery intercepts and queues the request
3. Calls /auth/refresh-token with refreshToken from localStorage
4. Backend responds with new accessToken (and optionally new refreshToken)
5. Stores new tokens in localStorage
6. Retries all queued requests with new token
7. If refresh fails → redirect to /auth/login
```

## Testing Instructions

### Test Page: `/auth/test-login`

We've created a comprehensive test page to verify cookie vs localStorage behavior.

#### Step 1: Access Test Page
Navigate to: `http://localhost:3000/auth/test-login` (or your deployed URL)

#### Step 2: Test Login
1. Enter credentials
2. Click "1️⃣ Test Login (Direct Fetch)"
3. Open browser DevTools (F12)
4. Check Console for detailed logs

#### Step 3: Verify Storage
Check both storage methods:

**Cookies (Application → Cookies):**
- If you see `accessToken` and `refreshToken` cookies → Cookies work! 🎉
- If you DON'T see them → Cross-domain issue confirmed ❌

**localStorage (Application → Local Storage):**
- Should ALWAYS see `accessToken`, `refreshToken`, and `user` → localStorage works! ✅

#### Step 4: Test API Calls
1. Click "2️⃣ Test API (with Cookies)" - Tests if cookies are sent automatically
2. Click "3️⃣ Test API (with Bearer Token)" - Tests if Bearer token auth works
3. Check which method succeeds

### Expected Results

#### Scenario A: Same Domain (localhost development)
```
✅ Cookies: Stored and working
✅ localStorage: Stored and working
✅ API with Cookies: Works
✅ API with Bearer Token: Works
→ Both methods work!
```

#### Scenario B: Cross Domain (Render deployment)
```
❌ Cookies: NOT stored (cross-domain blocking)
✅ localStorage: Stored and working
❌ API with Cookies: Fails (no cookies sent)
✅ API with Bearer Token: Works
→ Only Bearer token method works!
```

## Backend Requirements

For cross-domain authentication to work, your backend MUST:

### 1. CORS Configuration
```javascript
app.use(cors({
  origin: 'https://launchpad-fe-i59a.onrender.com', // Exact URL, not '*'
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Include Authorization
}));
```

### 2. Response Body Must Include Tokens
```javascript
// Login/Register/Verify OTP responses
res.json({
  success: true,
  message: "Login successful",
  data: { user: {...} },
  accessToken: "eyJhb...",    // ← Must include
  refreshToken: "eyJhb..."     // ← Must include
});
```

### 3. Accept Bearer Token
```javascript
// Your auth middleware should accept both:
// 1. Cookie: accessToken=eyJhb...
// 2. Header: Authorization: Bearer eyJhb...

const token = 
  req.cookies.accessToken ||                        // Cookie method
  req.headers.authorization?.replace('Bearer ', ''); // Bearer method
```

### 4. Refresh Token Endpoint
```javascript
// POST /auth/refresh-token
// Body: { "refreshToken": "eyJhb..." }
// Response:
{
  "success": true,
  "accessToken": "new_access_token",
  "refreshToken": "new_refresh_token" // Optional (token rotation)
}
```

## Security Considerations

### localStorage vs httpOnly Cookies

| Feature | localStorage | httpOnly Cookies |
|---------|-------------|------------------|
| XSS Protection | ❌ Vulnerable | ✅ Protected |
| Cross-Domain | ✅ Works | ❌ Blocked |
| CSRF Protection | ✅ Immune | ⚠️ Needs CSRF tokens |
| JavaScript Access | ✅ Readable | ❌ Not readable |

### Mitigation Strategies

Since we're using localStorage (less secure than httpOnly cookies):

1. **Implement Content Security Policy (CSP)**
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; script-src 'self'">
   ```

2. **Use Short-Lived Access Tokens**
   - Access token: 15 minutes expiry
   - Refresh token: 7 days expiry
   - Currently: 15 min access, 7 days refresh ✅

3. **Token Rotation**
   - Refresh endpoint returns new refresh token
   - Prevents token replay attacks

4. **Sanitize All User Input**
   - Prevent XSS attacks
   - Use libraries like DOMPurify

5. **HTTPS Only**
   - Never use HTTP in production
   - Prevents man-in-the-middle attacks

## Troubleshooting

### Issue: "No tokens in localStorage after login"
**Solution:** Backend isn't sending tokens in response body. Check backend response format.

### Issue: "API calls return 401 even with valid token"
**Solution:** 
- Backend not accepting `Authorization: Bearer` header
- Token expired (check token expiry time)
- Backend CORS not allowing `Authorization` header

### Issue: "Refresh token fails with 401"
**Solution:**
- Refresh token expired or invalid
- Backend refresh endpoint expects different format
- Check backend logs for exact error

### Issue: "Cookies work on localhost but not production"
**Solution:** This is EXPECTED behavior for cross-domain. Use localStorage method.

### Issue: "Token rotation not working"
**Solution:** Backend must return new `refreshToken` in refresh response.

## Production Deployment Checklist

- [ ] Backend CORS origin set to exact FE URL (not `*`)
- [ ] Backend CORS credentials set to `true`
- [ ] Backend accepts `Authorization: Bearer` header
- [ ] Backend sends tokens in response body (login/register/verify)
- [ ] Backend refresh endpoint accepts `{ refreshToken }` in body
- [ ] Backend refresh endpoint returns new tokens
- [ ] Frontend environment variables set correctly:
  - [ ] `NEXT_PUBLIC_API_URL` points to BE URL
- [ ] HTTPS enabled on both FE and BE
- [ ] Test login on production URL using `/auth/test-login`
- [ ] Verify localStorage tokens are stored
- [ ] Verify API calls work with Bearer tokens
- [ ] Test token refresh by waiting 15+ minutes

## Debugging Commands

### Check localStorage in Browser Console:
```javascript
// Check all stored data
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));
console.log('User:', localStorage.getItem('user'));

// Check token expiry (decode JWT)
const token = localStorage.getItem('accessToken');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token expires at:', new Date(payload.exp * 1000));
```

### Check Cookies in Browser Console:
```javascript
console.log('All cookies:', document.cookie);
```

### Test API Call with Token:
```javascript
const token = localStorage.getItem('accessToken');
fetch('https://launchpad-be-w9bz.onrender.com/posts', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

## Alternative Solutions (Not Implemented)

### Option 1: Use Same Domain
Deploy FE and BE on same domain using reverse proxy:
- `example.com` → Frontend
- `example.com/api` → Backend (proxied)
- Cookies work automatically ✅
- More complex infrastructure ⚠️

### Option 2: Use Subdomains of Same Domain
- `app.example.com` → Frontend
- `api.example.com` → Backend
- Set cookie domain to `.example.com`
- Cookies work for both subdomains ✅
- Requires custom domain (not available on free Render) ⚠️

### Option 3: BFF (Backend for Frontend)
- Create Next.js API routes that proxy to backend
- Next.js API can set httpOnly cookies (same domain)
- More secure than localStorage ✅
- Additional API layer adds latency ⚠️

## Conclusion

The localStorage + Bearer token approach is:
- ✅ Simple to implement
- ✅ Works cross-domain
- ✅ No infrastructure changes needed
- ⚠️ Less secure than httpOnly cookies
- ⚠️ Requires XSS protection measures

For production applications with high security requirements, consider:
1. Using same domain with reverse proxy
2. Implementing BFF pattern
3. Moving to subdomains of custom domain

For side projects and MVPs, the current solution is perfectly adequate.

