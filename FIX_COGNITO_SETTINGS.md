# Fix Cognito User Pool Settings

## Issue 1: USER_PASSWORD_AUTH Flow Not Enabled

### Error:
```
USER_PASSWORD_AUTH flow not enabled for this client
```

### Fix in AWS Console:

1. **Go to Cognito Console:**
   - https://console.aws.amazon.com/cognito

2. **Find Your User Pool:**
   - Look for a pool created by Amplify
   - Name might include "amplify" or your app name

3. **Go to App Integration:**
   - Click on your User Pool
   - Click "App integration" tab
   - Scroll down to "App clients and analytics"

4. **Edit App Client:**
   - Click on your app client
   - Click "Edit" button

5. **Enable Authentication Flows:**
   - Scroll to "Authentication flows"
   - ✅ Check "ALLOW_USER_PASSWORD_AUTH"
   - ✅ Check "ALLOW_REFRESH_TOKEN_AUTH"
   - ✅ Check "ALLOW_USER_SRP_AUTH" (optional)

6. **Save Changes:**
   - Click "Save changes" at bottom

---

## Issue 2: No Verification Email Received

### Possible Causes:

#### A. Email Not Configured
1. Go to Cognito User Pool
2. Click "Messaging" tab
3. Check "Email" section
4. Make sure email is configured (should use Cognito default or SES)

#### B. User Already Verified
1. Go to Cognito User Pool
2. Click "Users" tab
3. Find your user
4. Check "Email verified" column
5. If "false", you can manually verify:
   - Click on the user
   - Click "Actions" → "Confirm user"

#### C. Email in Spam
- Check your spam/junk folder
- Look for emails from "no-reply@verificationemail.com"

---

## Quick Fix: Manually Verify User

### Option 1: Via AWS Console
1. Go to Cognito Console
2. Click your User Pool
3. Click "Users" tab
4. Click on your user email
5. Click "Actions" dropdown
6. Select "Confirm user"
7. User is now verified and can login!

### Option 2: Via AWS CLI
```bash
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id YOUR_USER_POOL_ID \
  --username YOUR_EMAIL
```

---

## After Fixing

### Test Login:
1. Go back to login page
2. Enter your email and password
3. Click "Sign In"
4. Should work now!

---

## Alternative: Use SRP Auth Flow

If USER_PASSWORD_AUTH doesn't work, we can switch to SRP (Secure Remote Password) which is enabled by default.

Let me know if you need me to update the login page to use SRP instead!

---

## Summary

**Issue 1:** Enable USER_PASSWORD_AUTH in Cognito app client settings

**Issue 2:** Manually verify user in Cognito console

**Quick Fix:** 
1. Enable USER_PASSWORD_AUTH flow
2. Manually confirm user
3. Try login again

Let me know which approach you want to take!