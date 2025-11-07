# 🚀 Quick Start: Testing Cross-Domain Authentication

## What Changed?

Your app now supports **two authentication methods**:

1. **🍪 Cookies** (works when FE and BE are on same domain)
2. **🔑 Bearer Tokens + localStorage** (works EVERYWHERE, including cross-domain)

## Testing Steps

### Step 1: Run the Dev Server
```bash
npm run dev
```

### Step 2: Go to Test Page
Open browser and navigate to:
```
http://localhost:3000/auth/test-login
```

### Step 3: Test Login
1. Fill in your email and password
2. Click "1️⃣ Test Login (Direct Fetch)"
3. Open DevTools (F12) and check:
   - **Console** tab → See detailed logs
   - **Application** tab → Check:
     - Cookies → Look for `accessToken` and `refreshToken`
     - Local Storage → Should see `accessToken`, `refreshToken`, `user`

### Step 4: Test API Calls

#### Test with Cookies:
Click "2️⃣ Test API (with Cookies)"
- ✅ If it works → Cookies are being sent!
- ❌ If it fails with 401 → Cookies aren't working (expected for cross-domain)

#### Test with Bearer Token:
Click "3️⃣ Test API (with Bearer Token)"
- ✅ Should ALWAYS work (uses localStorage + Authorization header)

## What to Expect

### On Localhost (Development)
```
✅ Cookies work
✅ Bearer tokens work
→ Both methods successful!
```

### On Render (Production - Different Domains)
```
❌ Cookies don't work (cross-domain blocked)
✅ Bearer tokens work
→ Bearer token method successful!
```

## After Testing

Once Bearer tokens work on the test page, your **entire app will work** because:
- All API calls now automatically include `Authorization: Bearer <token>` header
- Token refresh works automatically using localStorage
- Login, Register, OTP verification all store tokens
- Logout clears tokens

## Normal Login Flow (Not Test Page)

The regular login at `/auth/login` **already updated** and will:
1. Call login API
2. Store tokens in localStorage
3. All future API calls use Bearer token
4. Works cross-domain! ✅

## Debugging Tips

### Check if Tokens are Stored:
Open Console (F12) and run:
```javascript
localStorage.getItem('accessToken')
localStorage.getItem('refreshToken')
localStorage.getItem('user')
```

### Clear Everything and Start Fresh:
On test page, click: **"🗑️ Clear All Data"**

Or in Console:
```javascript
localStorage.clear()
```

### Check Token Expiry:
```javascript
const token = localStorage.getItem('accessToken');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Expires:', new Date(payload.exp * 1000));
```

## Backend Checklist

Make sure your backend:
- ✅ Sends `accessToken` and `refreshToken` in response body
- ✅ CORS allows `Authorization` header
- ✅ CORS origin set to your frontend URL (not `*`)
- ✅ CORS credentials set to `true`
- ✅ Accepts both Cookie AND Bearer token for auth

### Example Backend Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "_id": "...", "email": "...", ... }
  },
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi..."
}
```

## Files Changed

✅ **New Files:**
- `lib/utils/tokenManager.ts` - Token management
- `app/auth/test-login/page.tsx` - Test page
- `CROSS_DOMAIN_AUTH_GUIDE.md` - Full documentation
- `QUICK_START_TESTING.md` - This file

✅ **Updated Files:**
- `lib/types/auth.ts` - Added token fields
- `lib/store/api/baseQuery.ts` - Auto-adds Bearer token
- `lib/services/refreshTokenService.ts` - Uses localStorage
- `lib/store/thunks/authThunks.ts` - Stores tokens from response

## Need Help?

1. Check console logs (F12) for detailed error messages
2. See `CROSS_DOMAIN_AUTH_GUIDE.md` for full documentation
3. Verify backend is sending tokens in response body

## Deploy to Production

1. Update environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://launchpad-be-w9bz.onrender.com
   ```

2. Test on production using:
   ```
   https://launchpad-fe-i59a.onrender.com/auth/test-login
   ```

3. Verify Bearer token method works

4. Use regular app at:
   ```
   https://launchpad-fe-i59a.onrender.com/auth/login
   ```

That's it! Your app now works cross-domain! 🎉

