# Step 2: Create Test Cohort - Quick Start

## 🎯 What You're Doing

Creating a "cohort" in your database so students can register. Think of it like creating a class code that students need to join your bootcamp.

---

## ⚡ Quick Method (30 seconds)

### 1️⃣ Make sure your Amplify sandbox is running

You should see this in your terminal:
```
✅ Sandbox deployed successfully
[Sandbox] Watching for file changes...
```

If not, run:
```bash
cd amplify-backend
npx ampx sandbox
```

### 2️⃣ Open a NEW terminal and run:

```bash
node create-test-cohort.mjs
```

### 3️⃣ You should see:

```
✅ Test cohort created successfully!

📋 Cohort Details:
─────────────────────────────────────
Cohort Code: TEST2024
Name: Test Cohort 2024

✨ Students can now register using cohort code: TEST2024
```

### ✅ Done!

Students can now register with code: **TEST2024**

---

## 🔍 What Just Happened?

```
┌─────────────────────────────────────────────────────────┐
│  Your Script (create-test-cohort.js)                    │
│  ↓                                                       │
│  Connects to AWS Amplify                                │
│  ↓                                                       │
│  Creates record in DynamoDB:                            │
│  {                                                       │
│    cohortCode: "TEST2024",                              │
│    name: "Test Cohort 2024",                            │
│    sessionReleaseDates: { all sessions available }      │
│  }                                                       │
│  ↓                                                       │
│  ✅ Cohort ready for student registration               │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 Test It Works

### 1. Open your app in browser
```
http://localhost:5500/public/pages/login.html
```
(or wherever your app is running)

### 2. Click "Register"

### 3. Enter cohort code: `TEST2024`

### 4. If it works:
- ✅ Form lets you continue
- ✅ You can complete registration

### 5. If it doesn't work:
- ❌ "Invalid cohort code" error
- 💡 Check the troubleshooting section below

---

## 🐛 Troubleshooting

### Problem: "Cannot find module 'aws-amplify'"

**Solution:**
```bash
npm install aws-amplify
```

### Problem: "Error: Unable to connect"

**Solution:** Make sure sandbox is running:
```bash
cd amplify-backend
npx ampx sandbox
```

### Problem: "Cohort already exists"

**Solution:** This is fine! The cohort is already created. You can:
- Use it as-is, OR
- Edit `create-test-cohort.mjs` to create a different cohort code

### Problem: Script runs but registration still fails

**Solution:** Check that `amplify_outputs.json` exists:
```bash
ls -la public/amplify_outputs.json
```

If missing:
```bash
cd amplify-backend
npx ampx sandbox --outputs-out-dir ../public --outputs-format json
```

---

## 📝 What's Next?

After creating the cohort:

1. ✅ **Test Registration** (use code: TEST2024)
2. ✅ **Verify Email** (check inbox for verification code)
3. ✅ **Test Login** (login with new account)
4. ✅ **Upload Videos** (run `./upload-videos-to-s3.sh`)

---

## 🎓 Understanding Cohorts

**What is a cohort?**
- A group of students taking the bootcamp together
- Like a "class code" in Google Classroom

**Why do we need it?**
- Organizes students into groups
- Controls when sessions are released
- Allows teachers to track progress

**Can I create more cohorts?**
- Yes! Edit `create-test-cohort.mjs` and change:
  - `cohortCode: 'SPRING2024'`
  - `name: 'Spring 2024 Bootcamp'`
- Run the script again

---

## 🔑 Special Codes

### Student Code: `TEST2024`
- Regular student account
- Access to all sessions
- Can book tutoring

### Tutor Code: `cTfTut0rCod3!1`
- Creates tutor account
- Access to tutor dashboard
- Can manage availability

---

## 📚 More Details

For complete documentation, see:
- **CREATE_TEST_COHORT_GUIDE.md** - Full guide with 3 methods
- **AUTH_MIGRATION.md** - Complete authentication setup

---

## ✨ Summary

**Run this:**
```bash
node create-test-cohort.mjs
```

**Result:**
- ✅ Cohort created in DynamoDB
- ✅ Students can register with code: TEST2024
- ✅ Ready to test authentication!

**Time:** 30 seconds

**Next:** Test registration on your login page