# AWS Amplify Gen 2 Setup Guide - Code the Future

## Overview

This guide shows you how to migrate your static HTML site from Firebase to **AWS Amplify Gen 2** - the simplest and most cost-effective solution.

**Estimated Cost: FREE or ~$0.50/month** for 400 students/year  
**Setup Time: 30 minutes**  
**Complexity: ⭐ Simple**

---

## What is Amplify Gen 2?

AWS Amplify Gen 2 is AWS's modern platform for building full-stack apps:
- ✅ Hosts static HTML/CSS/JS sites
- ✅ Provides backend (Auth, Database, Storage)
- ✅ Automatic HTTPS via CloudFront
- ✅ One-command deployment
- ✅ Generous free tier

---

## Prerequisites

1. **AWS Account** - [Create free account](https://aws.amazon.com)
2. **Node.js 18+** - [Download](https://nodejs.org)
3. **Git** - Your code should be in a Git repository

---

## Step 1: Install Amplify CLI

```bash
npm install -g @aws-amplify/cli@latest
```

---

## Step 2: Create Amplify Backend

### 2.1 Create Backend Directory

```bash
# In your project root
mkdir amplify-backend
cd amplify-backend
npm init -y
```

### 2.2 Install Dependencies

```bash
npm install --save-dev @aws-amplify/backend@latest @aws-amplify/backend-cli@latest typescript
```

### 2.3 Create Backend Configuration

**Create: `amplify-backend/amplify/backend.ts`**

```typescript
import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

const backend = defineBackend({
  auth,
  data,
  storage
});
```

---

## Step 3: Configure Authentication

**Create: `amplify-backend/amplify/auth/resource.ts`**

```typescript
import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true
  },
  userAttributes: {
    email: {
      required: true,
      mutable: false
    },
    name: {
      required: true,
      mutable: true
    }
  }
});
```

---

## Step 4: Configure Database

**Create: `amplify-backend/amplify/data/resource.ts`**

```typescript
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  User: a
    .model({
      email: a.string().required(),
      displayName: a.string().required(),
      cohortId: a.string(),
      isTeacher: a.boolean(),
      isTutor: a.boolean(),
      progress: a.json(),
      profile: a.json()
    })
    .authorization(allow => [allow.publicApiKey()]),

  Cohort: a
    .model({
      cohortCode: a.string().required(),
      name: a.string().required(),
      teacherId: a.string(),
      teacherName: a.string(),
      sessionReleaseDates: a.json()
    })
    .authorization(allow => [allow.publicApiKey()]),

  TutorAvailability: a
    .model({
      tutorId: a.string().required(),
      slotId: a.string().required(),
      date: a.string().required(),
      time: a.string().required(),
      duration: a.string(),
      status: a.string()
    })
    .authorization(allow => [allow.publicApiKey()]),

  BookedSession: a
    .model({
      sessionId: a.string().required(),
      tutorId: a.string().required(),
      studentEmail: a.string().required(),
      studentName: a.string(),
      date: a.string().required(),
      time: a.string().required(),
      duration: a.string(),
      status: a.string()
    })
    .authorization(allow => [allow.publicApiKey()]),

  SessionRequest: a
    .model({
      requestId: a.string().required(),
      tutorId: a.string().required(),
      studentEmail: a.string().required(),
      studentName: a.string(),
      date: a.string().required(),
      time: a.string().required(),
      duration: a.string(),
      status: a.string()
    })
    .authorization(allow => [allow.publicApiKey()])
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 365
    }
  }
});
```

---

## Step 5: Configure Storage

**Create: `amplify-backend/amplify/storage/resource.ts`**

```typescript
import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'codethefuturestorage',
  access: (allow) => ({
    'profile-pictures/*': [
      allow.authenticated.to(['read', 'write', 'delete']),
      allow.guest.to(['read'])
    ],
    'media/*': [
      allow.guest.to(['read'])
    ]
  })
});
```

---

## Step 6: Deploy Backend

```bash
# From amplify-backend directory
npx ampx sandbox
```

This will:
1. Create all AWS resources (Cognito, DynamoDB, S3)
2. Generate configuration file
3. Provide you with API endpoints

**Keep this running** - it's your development environment.

---

## Step 7: Install Amplify in Frontend

```bash
# In your project root (not amplify-backend)
npm install aws-amplify
```

---

## Step 8: Configure Amplify in Your HTML Site

### 8.1 Copy Generated Config

After `npx ampx sandbox` runs, it creates `amplify_outputs.json`.

**Copy it to your public folder:**
```bash
cp amplify-backend/amplify_outputs.json public/
```

### 8.2 Create Amplify Initialization Script

**Create: `public/pages/js/amplify-init.js`**

```javascript
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';

Amplify.configure(outputs);

console.log('✅ Amplify configured');

export default Amplify;
```

### 8.3 Update HTML Pages

**Add to all HTML pages (before other scripts):**

```html
<head>
  <!-- ... existing head content ... -->
  
  <!-- Amplify -->
  <script type="importmap">
    {
      "imports": {
        "aws-amplify": "https://cdn.jsdelivr.net/npm/aws-amplify@6/dist/esm/index.mjs",
        "aws-amplify/auth": "https://cdn.jsdelivr.net/npm/aws-amplify@6/dist/esm/auth/index.mjs",
        "aws-amplify/data": "https://cdn.jsdelivr.net/npm/aws-amplify@6/dist/esm/data/index.mjs",
        "aws-amplify/storage": "https://cdn.jsdelivr.net/npm/aws-amplify@6/dist/esm/storage/index.mjs"
      }
    }
  </script>
  <script type="module" src="/pages/js/amplify-init.js"></script>
</head>
```

---

## Step 9: Update Your Code

### Authentication Example

**Update: `public/pages/login.html`**

```javascript
import { signIn, signUp, signOut, getCurrentUser } from 'aws-amplify/auth';

// Sign up
async function register(email, password, displayName) {
  try {
    const { userId } = await signUp({
      username: email,
      password: password,
      options: {
        userAttributes: {
          email: email,
          name: displayName
        }
      }
    });
    console.log('User registered:', userId);
    return { success: true, userId };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
}

// Sign in
async function login(email, password) {
  try {
    const { isSignedIn } = await signIn({
      username: email,
      password: password
    });
    
    if (isSignedIn) {
      const user = await getCurrentUser();
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('displayName', user.signInDetails?.loginId || email);
      return { success: true, user };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}

// Sign out
async function logout() {
  try {
    await signOut();
    localStorage.setItem('loggedIn', 'false');
    window.location.href = '/pages/login.html';
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Check if logged in
async function checkAuth() {
  try {
    const user = await getCurrentUser();
    return user !== null;
  } catch {
    return false;
  }
}
```

### Database Example

**Update: `public/pages/js/progressTracking.js`**

```javascript
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify-backend/amplify/data/resource';

const client = generateClient<Schema>();

// Get user
async function getUser(userId) {
  try {
    const { data } = await client.models.User.get({ id: userId });
    return data;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// Update user progress
async function updateUserProgress(userId, sessionNumber, progressData) {
  try {
    const user = await getUser(userId);
    
    if (!user) return false;
    
    const currentProgress = user.progress || {};
    currentProgress[`session${sessionNumber}`] = progressData;
    
    await client.models.User.update({
      id: userId,
      progress: currentProgress
    });
    
    return true;
  } catch (error) {
    console.error('Error updating progress:', error);
    return false;
  }
}

// Get all users in cohort
async function getUsersByCohort(cohortId) {
  try {
    const { data } = await client.models.User.list({
      filter: {
        cohortId: { eq: cohortId }
      }
    });
    return data;
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
}
```

### Storage Example

**Update: `public/pages/profile.html`**

```javascript
import { uploadData, getUrl, remove } from 'aws-amplify/storage';

// Upload profile picture
async function uploadProfilePicture(userId, file) {
  try {
    const result = await uploadData({
      path: `profile-pictures/${userId}`,
      data: file,
      options: {
        contentType: file.type
      }
    }).result;
    
    console.log('Upload successful:', result);
    return { success: true, path: result.path };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: error.message };
  }
}

// Get profile picture URL
async function getProfilePictureUrl(userId) {
  try {
    const result = await getUrl({
      path: `profile-pictures/${userId}`
    });
    return result.url.toString();
  } catch (error) {
    console.error('Get URL error:', error);
    return null;
  }
}

// Delete profile picture
async function deleteProfilePicture(userId) {
  try {
    await remove({
      path: `profile-pictures/${userId}`
    });
    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, error: error.message };
  }
}
```

---

## Step 10: Deploy to Production

### 10.1 Connect to Git

```bash
# Push your code to GitHub/GitLab/Bitbucket
git add .
git commit -m "Add Amplify Gen 2 configuration"
git push
```

### 10.2 Deploy via Amplify Console

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click "New app" → "Host web app"
3. Connect your Git repository
4. Configure build settings:
   - **Build command:** (leave empty for static site)
   - **Output directory:** `public`
5. Click "Save and deploy"

**Your app will be live in 5-10 minutes!**

---

## Step 11: Migrate Data from Firebase

### 11.1 Export Firebase Data

```bash
cd migration-scripts
npm install
# Add serviceAccountKey.json
npm run export
npm run transform
```

### 11.2 Import to Amplify

Use the Amplify Data Manager or AWS Console:

1. Go to Amplify Console → Your App → Data
2. Use the data manager to import records
3. Or use AWS AppSync console to bulk import

### 11.3 Migrate Users

Users need to re-register (passwords cannot be migrated).

**Send email to all users:**
```
Subject: Code the Future - New Platform!

We've upgraded to a faster, more reliable platform!

Please register again at: [your-amplify-url]

Your progress and course materials will be restored once you log in.
```

---

## Cost Breakdown

### Amplify Free Tier (Always Free)
- ✅ **Hosting:** 1,000 build minutes/month
- ✅ **Data transfer:** 15 GB/month
- ✅ **Auth:** 50,000 MAUs
- ✅ **Storage:** 5 GB + 15 GB transfer
- ✅ **Database:** 25 GB storage

### Your Usage (400 students/year)
- **Hosting:** ~100 MB site ✅ FREE
- **Auth:** 400 users ✅ FREE
- **Storage:** ~2 GB (pics + videos) ✅ FREE
- **Database:** ~500 MB ✅ FREE

**Total Cost: $0/month** 🎉

(May incur ~$0.10-0.50/month if you exceed free tier slightly)

---

## Useful Commands

```bash
# Start development sandbox
npx ampx sandbox

# Deploy to production
npx ampx pipeline-deploy --branch main

# Generate TypeScript types
npx ampx generate graphql-client-code

# View logs
npx ampx logs

# Delete sandbox
npx ampx sandbox delete
```

---

## Troubleshooting

### "Module not found" errors
```bash
npm install aws-amplify
```

### CORS errors
- Check your Amplify backend authorization rules
- Ensure `allow.publicApiKey()` is set for public access

### Authentication not working
- Verify `amplify_outputs.json` is in your public folder
- Check browser console for errors
- Ensure Amplify.configure() is called before auth functions

### Database queries failing
- Check your data model in `amplify/data/resource.ts`
- Verify authorization rules
- Use Amplify Console → Data to test queries

---

## Next Steps

1. ✅ Set up Amplify backend (`npx ampx sandbox`)
2. ✅ Update HTML pages with Amplify scripts
3. ✅ Update JavaScript code to use Amplify APIs
4. ✅ Test locally
5. ✅ Deploy to production (Amplify Console)
6. ✅ Migrate data from Firebase
7. ✅ Notify users to re-register

**Total Time: 1-2 days**

---

## Support Resources

- **Amplify Gen 2 Docs:** https://docs.amplify.aws/gen2/
- **Amplify Discord:** https://discord.gg/amplify
- **AWS Support:** https://console.aws.amazon.com/support/

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-16  
**Estimated Cost:** FREE for 400 students/year