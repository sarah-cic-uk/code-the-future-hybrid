# Quick Start Guide: Video Migration to AWS

## 🚀 Complete Setup in 5 Steps

This guide walks you through the entire process from AWS setup to video deployment.

---

## Step 1: Set Up AWS Profile (10 minutes)

### 1.1 Install AWS CLI (if needed)
```bash
# Check if installed
aws --version

# Install on macOS
brew install awscli
```

### 1.2 Create AWS Access Keys
1. Go to: https://console.aws.amazon.com/iam/home#/security_credentials
2. Click "Create access key"
3. Select "Command Line Interface (CLI)"
4. Save both:
   - Access Key ID: `AKIA...`
   - Secret Access Key: `wJalr...`

### 1.3 Configure AWS Profile
```bash
aws configure --profile code-the-future
```

Enter when prompted:
- **Access Key ID:** AKIAV4HG23JUDBNHQ33H
- **Secret Access Key:** [paste your secret]
- **Region:** `eu-west-1` (or `us-east-1`)
- **Output format:** `json`

### 1.4 Verify Setup
```bash
aws sts get-caller-identity --profile code-the-future
```

✅ If you see your account info, you're ready!

**Need help?** See `AWS_PROFILE_SETUP.md` for detailed instructions.

---

## Step 2: Set AWS Profile as Default (1 minute)

```bash
# For current terminal session
export AWS_PROFILE=code-the-future

# Or permanently (choose your shell)
echo 'export AWS_PROFILE=code-the-future' >> ~/.zshrc
source ~/.zshrc
```

Verify:
```bash
echo $AWS_PROFILE
# Should output: code-the-future
```

---

## Step 3: Deploy Amplify Backend (5 minutes)

```bash
# Navigate to backend directory
cd amplify-backend

# Install dependencies (if first time)
npm install

# Deploy sandbox environment
npx ampx sandbox
```

**Wait for:** `✅ Sandbox deployed successfully`

This creates:
- S3 bucket for storage
- CloudFront distribution for CDN
- API endpoints
- Configuration file: `amplify_outputs.json`

**Keep this terminal running!** The sandbox stays active.

---

## Step 4: Upload Videos to S3 (10-15 minutes)

Open a **new terminal** (keep sandbox running in the other):

```bash
# Navigate to project root
cd /Users/sarahneenan/code/code-the-future-hybrid

# Set AWS profile (if not default)
export AWS_PROFILE=code-the-future

# Run upload script
./upload-videos-to-s3.sh
```

**What happens:**
- Script finds S3 bucket from `amplify_outputs.json`
- Uploads all 19 videos to `s3://bucket/public/media/`
- Shows progress for each file
- Takes ~10-15 minutes depending on internet speed

**Expected output:**
```
🎬 Starting video upload to AWS S3...
✅ AWS credentials verified
📦 Target S3 Bucket: amplify-xxxxx-storage
[1/19] Uploading: firstRepo.mp4
  ✅ Successfully uploaded: firstRepo.mp4
...
🎉 Video upload complete!
```

---

## Step 5: Test Video Playback (5 minutes)

### 5.1 Start Local Server

```bash
# If you have Python 3
cd public
python3 -m http.server 8000

# Or if you have Node.js
npx http-server public -p 8000
```

### 5.2 Test These Pages

Open in browser:
1. http://localhost:8000/pages/sessions/session1/lessons/firstRepo.html
2. http://localhost:8000/pages/sessions/session2/lessons/htmlBasics.html
3. http://localhost:8000/pages/sessions/session4/lessons/cssActivities.html

### 5.3 Verify Video Loading

**Check browser console (F12):**
- ✅ Should see: `✅ Video loaded from Amplify: filename.mp4`
- ✅ Video should play without errors
- ❌ If errors, see troubleshooting below

---

## Troubleshooting

### Videos Not Loading

**1. Check Amplify Configuration**
```bash
# Verify amplify_outputs.json exists
ls -la public/amplify_outputs.json

# Check if it has storage config
cat public/amplify_outputs.json | grep storage
```

**2. Check Browser Console**
- Press F12 to open Developer Tools
- Look for errors in Console tab
- Common issues:
  - "Failed to fetch" → Check if sandbox is running
  - "Access Denied" → Check storage permissions in `storage/resource.ts`
  - "Module not found" → Clear browser cache

**3. Verify Videos in S3**
```bash
# List videos in S3
aws s3 ls s3://BUCKET_NAME/public/media/ --profile code-the-future
```

Should show all 19 videos.

### Upload Script Fails

**Error: "AWS credentials not configured"**
```bash
# Reconfigure profile
aws configure --profile code-the-future

# Set as default
export AWS_PROFILE=code-the-future
```

**Error: "Bucket not found"**
- Make sure `npx ampx sandbox` is running
- Check `public/amplify_outputs.json` exists
- Restart sandbox if needed

**Error: "Access Denied"**
```bash
# Check IAM permissions
aws iam get-user --profile code-the-future

# You need these policies:
# - AmazonS3FullAccess
# - AdministratorAccess-Amplify
```

### Amplify Sandbox Issues

**Error: "Module not found"**
```bash
cd amplify-backend
npm install
npx ampx sandbox
```

**Error: "Port already in use"**
```bash
# Find and kill process using port
lsof -ti:3000 | xargs kill -9

# Or use different port
npx ampx sandbox --port 3001
```

---

## Deploy to Production

Once testing is successful:

### 1. Commit Changes
```bash
git add .
git commit -m "Migrate videos from Firebase to AWS S3/Amplify"
git push
```

### 2. Deploy via Amplify Console

**Option A: Amplify Console (Recommended)**
1. Go to: https://console.aws.amazon.com/amplify
2. Click "New app" → "Host web app"
3. Connect your Git repository
4. Configure:
   - Build command: (leave empty)
   - Output directory: `public`
5. Click "Save and deploy"

**Option B: Amplify CLI**
```bash
cd amplify-backend
npx ampx pipeline-deploy --branch main
```

### 3. Update DNS (if custom domain)
Point your domain to the Amplify URL provided.

---

## Summary Checklist

- [ ] AWS CLI installed and configured
- [ ] AWS profile created: `code-the-future`
- [ ] Profile set as default: `export AWS_PROFILE=code-the-future`
- [ ] Amplify backend deployed: `npx ampx sandbox`
- [ ] Videos uploaded to S3: `./upload-videos-to-s3.sh`
- [ ] Video playback tested on 3+ pages
- [ ] Changes committed to Git
- [ ] Deployed to production (optional)

---

## File Reference

- **AWS Setup:** `AWS_PROFILE_SETUP.md` - Detailed AWS configuration
- **Migration Details:** `VIDEO_MIGRATION.md` - Complete technical documentation
- **Upload Script:** `upload-videos-to-s3.sh` - Batch video upload
- **This Guide:** `QUICK_START.md` - Quick setup walkthrough

---

## Support

**Common Commands:**
```bash
# Check AWS profile
aws sts get-caller-identity --profile code-the-future

# List S3 buckets
aws s3 ls --profile code-the-future

# Deploy Amplify
cd amplify-backend && npx ampx sandbox

# Upload videos
./upload-videos-to-s3.sh

# Test locally
cd public && python3 -m http.server 8000
```

**Need Help?**
- AWS CLI Docs: https://docs.aws.amazon.com/cli/
- Amplify Docs: https://docs.amplify.aws/gen2/
- S3 Docs: https://docs.aws.amazon.com/s3/

---

## Next Steps After Deployment

1. **Monitor Costs:** Check AWS Cost Explorer weekly
2. **Test with Students:** Have 2-3 students test video playback
3. **Update Documentation:** Add any lessons learned
4. **Backup Videos:** Keep local copies of all videos
5. **Schedule Review:** Check video performance after 1 week

---

**Created:** June 21, 2026  
**Estimated Time:** 30-40 minutes total  
**Status:** Ready to deploy! 🚀