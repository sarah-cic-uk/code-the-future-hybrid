# Step-by-Step Guide: Creating a Test Cohort in DynamoDB

## Overview

Before students can register, you need to create at least one cohort in DynamoDB. This guide shows you **3 different methods** to create a test cohort.

---

## Prerequisites

✅ Amplify backend must be running:
```bash
cd amplify-backend
npx ampx sandbox
```

Wait for: `✅ Sandbox deployed successfully` or `[Sandbox] Watching for file changes...`

---

## Method 1: Using the Helper Script (EASIEST) ⭐

I've created a script that does everything for you!

### Step 1: Wait for Sandbox to Deploy

In your terminal, you should see:
```
✅ Sandbox deployed successfully
```

### Step 2: Run the Script

Open a **NEW terminal** (keep the sandbox running) and run:

```bash
node create-test-cohort.mjs
```

### Expected Output:

```
🚀 Creating test cohort in DynamoDB...

✅ Test cohort created successfully!

📋 Cohort Details:
─────────────────────────────────────
Cohort Code: TEST2024
Name: Test Cohort 2024
ID: abc123...

📅 Session Release Dates:
{
  "session1": 0,
  "session2": 0,
  "session3": 0,
  "session4": 0,
  "session5": 0,
  "session6": 0,
  "session7": 0
}

✨ Students can now register using cohort code: TEST2024
🔑 Tutor code: cTfTut0rCod3!1 (creates tutor accounts)
```

### Done! ✅

Students can now register with cohort code: **TEST2024**

---

## Method 2: Using AWS Console (Visual Interface)

### Step 1: Open AWS Console

1. Go to [AWS Console](https://console.aws.amazon.com)
2. Sign in to your account
3. Search for "DynamoDB" in the top search bar
4. Click on **DynamoDB**

### Step 2: Find Your Cohort Table

1. Click **Tables** in the left sidebar
2. Look for a table with "Cohort" in the name
   - Example: `Cohort-abc123-SANDBOX`
3. Click on the table name

### Step 3: Create a New Item

1. Click **Explore table items** button
2. Click **Create item** button
3. Switch to **JSON view** (toggle in top right)

### Step 4: Paste This JSON

```json
{
  "cohortCode": "TEST2024",
  "name": "Test Cohort 2024",
  "teacherId": null,
  "teacherName": null,
  "sessionReleaseDates": {
    "session1": 0,
    "session2": 0,
    "session3": 0,
    "session4": 0,
    "session5": 0,
    "session6": 0,
    "session7": 0
  }
}
```

### Step 5: Save

1. Click **Create item**
2. You should see your new cohort in the table

### Done! ✅

---

## Method 3: Using Amplify Data Manager (Recommended for Multiple Cohorts)

### Step 1: Open Amplify Console

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click on your app (code-the-future-hybrid)
3. Click on **Data** in the left sidebar

### Step 2: Select Cohort Model

1. Find **Cohort** in the list of models
2. Click on it

### Step 3: Add New Record

1. Click **Create Cohort** button
2. Fill in the form:
   - **cohortCode**: `TEST2024`
   - **name**: `Test Cohort 2024`
   - **teacherId**: (leave empty)
   - **teacherName**: (leave empty)
   - **sessionReleaseDates**: Click "Add JSON" and paste:
     ```json
     {
       "session1": 0,
       "session2": 0,
       "session3": 0,
       "session4": 0,
       "session5": 0,
       "session6": 0,
       "session7": 0
     }
     ```

### Step 4: Save

Click **Save** button

### Done! ✅

---

## Understanding the Cohort Data

### Cohort Code
- **Purpose**: Students enter this when registering
- **Example**: `TEST2024`, `SPRING2024`, `COHORT-A`
- **Must be unique**: Each cohort needs a different code

### Name
- **Purpose**: Human-readable name for the cohort
- **Example**: "Test Cohort 2024", "Spring 2024 Bootcamp"

### Session Release Dates
- **Purpose**: Controls when sessions become available
- **Format**: Unix timestamp (seconds since 1970)
- **Value `0`**: Session available immediately
- **Example**: 
  ```json
  {
    "session1": 0,           // Available now
    "session2": 1719878400,  // Available July 1, 2024
    "session3": 1722556800   // Available August 1, 2024
  }
  ```

### Teacher ID & Name
- **Purpose**: Assigns a teacher to the cohort
- **Optional**: Can be null for test cohorts
- **Set later**: Teachers can be assigned after cohort creation

---

## Creating Multiple Cohorts

You can create as many cohorts as you need! Just change the cohort code:

### Example: Spring 2024 Cohort
Edit `create-test-cohort.mjs` and change:
```javascript
const cohortData = {
  cohortCode: 'SPRING2024',
  name: 'Spring 2024 Bootcamp',
  sessionReleaseDates: {
    session1: 0,
    session2: 1711929600,
    session3: 1714521600,
    session4: 1717200000,
    session5: 1719878400,
    session6: 1722556800,
    session7: 1725235200
  }
};
```

### Example: Summer 2024 Cohort
Edit `create-test-cohort.mjs` and change:
```javascript
const cohortData = {
  cohortCode: 'SUMMER2024',
  name: 'Summer 2024 Bootcamp',
  sessionReleaseDates: {
    session1: 0,
    session2: 0,
    session3: 0,
    session4: 0,
    session5: 0,
    session6: 0,
    session7: 0
  }
};
```

---

## Verifying Your Cohort

### Method 1: Check in AWS Console
1. Go to DynamoDB → Tables → Your Cohort Table
2. Click **Explore table items**
3. You should see your cohort listed

### Method 2: Test Registration
1. Open your app's login page
2. Click "Register"
3. Enter the cohort code (e.g., `TEST2024`)
4. If valid, the form will let you continue
5. If invalid, you'll see "Invalid cohort code"

---

## Troubleshooting

### "Error creating cohort"
- ✅ Make sure Amplify sandbox is running
- ✅ Check that `amplify_outputs.json` exists in `public/` folder
- ✅ Verify you're in the project root directory

### "Cohort already exists"
- ✅ This is fine! The cohort is already created
- ✅ Use a different cohort code if you want to create another

### "Cannot find module 'aws-amplify'"
```bash
npm install aws-amplify
```

### "Invalid cohort code" during registration
- ✅ Double-check the cohort code spelling
- ✅ Cohort codes are case-sensitive
- ✅ Verify the cohort exists in DynamoDB

---

## Next Steps

After creating your test cohort:

1. ✅ **Test Registration**
   - Go to login page
   - Click "Register"
   - Use cohort code: `TEST2024`
   - Complete registration

2. ✅ **Verify Email**
   - Check your email for verification code
   - Enter code to verify account

3. ✅ **Test Login**
   - Login with your new credentials
   - Verify you can access the dashboard

4. ✅ **Create Real Cohorts**
   - Create cohorts for your actual students
   - Set appropriate session release dates
   - Assign teachers if needed

---

## Special Cohort Codes

### Tutor Code: `cTfTut0rCod3!1`
- Creates users with tutor privileges
- Gives access to tutor dashboard
- Use for tutors only

### Creating Teacher Accounts
Teachers should:
1. Register with a regular cohort code
2. Contact admin to upgrade account to teacher
3. Admin updates `isTeacher: true` in DynamoDB

---

## Summary

**Easiest Method**: Run `node create-test-cohort.mjs`

**Result**: Students can register with cohort code `TEST2024`

**Tutor Code**: `cTfTut0rCod3!1` for tutor accounts

**Next**: Test the registration flow!

---

**Need Help?** Check the troubleshooting section or review `AUTH_MIGRATION.md` for more details.