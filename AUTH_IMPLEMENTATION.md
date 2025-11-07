# Cross-Domain Authentication Implementation

## Overview

This document explains the new authentication system that handles JWT tokens across different domains in production. The implementation uses a **secure hybrid storage approach** that works perfectly when your frontend and backend are on different subdomains (e.g., `launchpad-fe.onrender.com` and `launchpad-be.onrender.com`).

## Problem Statement

### The Cookie Issue
Previously, the authentication system relied on `HttpOnly` cookies for storing `accessToken` and `refreshToken`. This worked fine in local development where both FE and BE ran on `localhost`, but **failed in production** because:

1. Cookies are domain-specific and don't work across different domains
2. Even with `SameSite=None` and `Secure` flags, browsers restrict cross-domain cookie access
3. The FE couldn't read cookies set by the BE when they're on different subdomains

### The Solution
We switched to a **token-based authentication** where:
- Backend sends tokens in the response body (not cookies)
- Frontend stores tokens using a hybrid approach (memory + localStorage)
- Tokens are automatically attached to all API requests via `Authorization` header

---

## Architecture

### 1. Token Storage Service (`lib/services/tokenStorage.ts`)

This service implements a **dual-layer storage system**:

#### Primary Storage: In-Memory
- Tokens are stored in class instance variables
- Most secure approach (immune to XSS if page is not compromised)
- Cleared automatically on page refresh or tab close

#### Fallback Storage: localStorage
- Used for persistence across page refreshes
- Allows users to stay logged in after closing/reopening the browser
- More vulnerable to XSS attacks (mitigated with proper CSP headers)

#### Key Methods:
```typescript
tokenStorage.setTokens(accessToken, refreshToken)  // Store both tokens
tokenStorage.getAccessToken()                       // Retrieve access token
tokenStorage.getRefreshToken()                      // Retrieve refresh token
tokenStorage.clearTokens()                          // Clear all tokens
tokenStorage.hasTokens()                            // Check if tokens exist
tokenStorage.isAccessTokenExpired(bufferSeconds)    // Check token expiry
```

---

### 2. Authentication Flow

#### Login/Register Flow:
```
1. User submits credentials
   ↓
2. Frontend calls backend API (e.g., POST /auth/login)
   ↓
3. Backend validates credentials and returns:
   {
     "success": true,
     "data": { "user": {...} },
     "accessToken": "eyJhbGc...",
     "refreshToken": "eyJhbGc..."
   }
   ↓
4. Frontend stores tokens in tokenStorage
   ↓
5. Frontend starts refresh timer (refreshes every 10 minutes)
   ↓
6. User is now authenticated
```

#### API Request Flow:
```
1. User makes any API request (e.g., GET /posts)
   ↓
2. baseQuery interceptor (prepareHeaders) runs
   ↓
3. Access token is retrieved from tokenStorage
   ↓
4. Token is attached to request: Authorization: Bearer <token>
   ↓
5. Backend validates token and processes request
```

#### Token Refresh Flow:
```
1. Timer triggers every 10 minutes OR 401 error received
   ↓
2. refreshTokenService calls backend: POST /auth/refresh-token
   ↓
3. Backend validates refresh token and returns new tokens
   ↓
4. New tokens are stored in tokenStorage
   ↓
5. Failed requests (from 401) are retried with new token
```

#### Logout Flow:
```
1. User clicks logout
   ↓
2. Frontend calls backend: POST /auth/logout
   ↓
3. Backend invalidates refresh token
   ↓
4. Frontend clears:
   - Redux auth state
   - tokenStorage (memory + localStorage)
   - User role cookie
   - Refresh timer
   ↓
5. User is redirected to login page
```

---

### 3. Request Interceptor (`lib/store/api/baseQuery.ts`)

The `baseQueryWithReauth` function handles:

#### Automatic Token Attachment:
```typescript
prepareHeaders: (headers) => {
  const accessToken = tokenStorage.getAccessToken();
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return headers;
}
```

#### Automatic 401 Handling:
- When a request fails with 401, it's queued
- Token refresh is triggered
- All queued requests are retried with new token
- If refresh fails, user is redirected to login

---

### 4. Refresh Token Service (`lib/services/refreshTokenService.ts`)

#### Automatic Refresh Timer:
- Starts after successful login/register/OTP verification
- Refreshes token every 10 minutes (600,000ms)
- Prevents concurrent refresh attempts
- Stops on logout

#### Direct Backend Call:
```typescript
fetch(`${ENV.API_BASE_URL}/auth/refresh-token`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${refreshToken}`
  },
  body: JSON.stringify({ refreshToken })
})
```

---

## Security Considerations

### XSS Protection:
1. **Content Security Policy (CSP)**: Add these headers in your deployment:
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self'
   X-Content-Type-Options: nosniff
   X-Frame-Options: DENY
   ```

2. **Input Sanitization**: Always sanitize user inputs on both FE and BE

3. **HTTPS Only**: Ensure production uses HTTPS to prevent token interception

### Token Expiry:
- Access tokens: Short-lived (15 minutes recommended)
- Refresh tokens: Long-lived (7 days recommended)
- Tokens are checked for expiry before use

### Logout Security:
- Backend must invalidate refresh token on logout
- Frontend clears all traces of tokens
- No residual authentication state

---

## Backend Requirements

Your backend must:

1. **Return tokens in response body** (not just cookies):
   ```json
   {
     "success": true,
     "message": "Login successful",
     "data": { "user": {...} },
     "accessToken": "eyJhbGc...",
     "refreshToken": "eyJhbGc..."
   }
   ```

2. **Accept Bearer tokens** in Authorization header:
   ```
   Authorization: Bearer <accessToken>
   ```

3. **Implement refresh token endpoint**:
   ```
   POST /auth/refresh-token
   Headers: Authorization: Bearer <refreshToken>
   Body: { "refreshToken": "..." }
   Response: { "accessToken": "...", "refreshToken": "..." }
   ```

4. **Handle token expiry** with 401 status

5. **Invalidate refresh tokens** on logout

---

## Testing Checklist

### Local Testing:
- [ ] Login works and tokens are stored
- [ ] API requests include Authorization header
- [ ] Token refresh works automatically
- [ ] Logout clears all tokens
- [ ] Page refresh maintains authentication

### Production Testing:
- [ ] Login works with different domains
- [ ] Cross-domain API calls succeed
- [ ] Token refresh works in production
- [ ] 401 errors trigger automatic refresh
- [ ] Logout clears all tokens
- [ ] Session persists across browser restarts

### Security Testing:
- [ ] Tokens are not exposed in URLs
- [ ] HTTPS is enforced
- [ ] CSP headers are configured
- [ ] Expired tokens are handled gracefully
- [ ] Refresh token rotation works

---

## Migration Notes

### What Changed:
1. ❌ No longer using cookies for token storage
2. ✅ Tokens now in response body AND Authorization header
3. ✅ New tokenStorage service replaces cookie-based auth
4. ✅ Direct backend refresh calls (no proxy route needed)
5. ✅ Hybrid storage (memory + localStorage)

### What Stayed the Same:
1. ✅ Redux state management
2. ✅ Auth thunks (login, register, logout, etc.)
3. ✅ Automatic token refresh
4. ✅ 401 error handling with request retry
5. ✅ User role cookies for middleware (optional)

---

## Environment Variables

Ensure these are set:

```env
# Frontend (.env.local)
NEXT_PUBLIC_API_BASE_URL=https://launchpad-be-w9bz.onrender.com

# Backend
JWT_SECRET=your-secret-key
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
```

---

## Debugging Tips

### Check if tokens are stored:
```javascript
// In browser console
localStorage.getItem('auth_access_token')
localStorage.getItem('auth_refresh_token')
```

### Monitor token refresh:
Look for console logs:
- `✅ Tokens stored successfully after login`
- `🔄 Calling refresh token API directly to backend...`
- `✅ Token refreshed successfully`
- `⏰ Timer fired, refreshing token...`

### Common Issues:

#### Issue: "No tokens in login response"
**Solution**: Ensure backend returns `accessToken` and `refreshToken` in response body

#### Issue: 401 errors not refreshing token
**Solution**: Check that `baseQueryWithReauth` is being used in API slices

#### Issue: Tokens cleared on page refresh
**Solution**: Check that `checkAuthStatus` is called in app initialization

#### Issue: CORS errors in production
**Solution**: Ensure backend CORS settings allow your frontend domain:
```javascript
app.use(cors({
  origin: 'https://launchpad-fe-i59a.onrender.com',
  credentials: true
}));
```

---

## Performance Considerations

1. **Memory Efficiency**: Tokens are small (~200 bytes each)
2. **Network Efficiency**: Refresh happens every 10 minutes (configurable)
3. **Request Queuing**: Multiple failed requests share one refresh call
4. **No Redundant Calls**: Concurrent refresh attempts are prevented

---

## Future Enhancements

1. **Token Rotation**: Implement refresh token rotation for extra security
2. **Fingerprinting**: Add device fingerprinting to detect token theft
3. **Session Management**: Allow users to view/revoke active sessions
4. **Secure Storage**: Consider using IndexedDB with encryption for sensitive data
5. **Token Revocation**: Implement a token blacklist on backend

---

## Support

If you encounter issues:
1. Check browser console for logs
2. Verify backend returns tokens correctly
3. Check network tab for API request/response
4. Ensure environment variables are set
5. Test with a fresh browser session (incognito mode)

---

## Summary

This implementation provides:
- ✅ Cross-domain authentication support
- ✅ Secure token storage with hybrid approach
- ✅ Automatic token refresh
- ✅ Graceful error handling
- ✅ Session persistence
- ✅ Production-ready security

The system is now fully compatible with different domains in production while maintaining security best practices.
