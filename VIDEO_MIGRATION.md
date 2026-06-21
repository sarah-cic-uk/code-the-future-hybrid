# Video Migration Guide: Firebase → AWS S3 (Amplify)

## Overview

This document describes the migration of 19 video tutorial files from Firebase Storage to AWS S3 using AWS Amplify Gen 2.

**Migration Date:** June 21, 2026  
**Status:** Code Updated, Ready for Deployment  
**Total Videos:** 19 files (~2-5 GB estimated)

---

## Why Migrate?

### Benefits of AWS S3 + Amplify
- ✅ **Lower Cost**: S3 storage is cheaper than Firebase for large video files
- ✅ **Better Performance**: CloudFront CDN provides faster global delivery
- ✅ **Scalability**: Handle 400+ students without bandwidth concerns
- ✅ **Unified Platform**: All storage consolidated under Amplify Gen 2
- ✅ **Guest Access**: Videos accessible without authentication

---

## Video Inventory

### Session 1: Development Environment (7 videos)
- `firstRepo.mp4` - Creating your first repository
- `githubDesktop.mp4` - Using GitHub Desktop
- `gitTerminal.mp4` - Git commands in terminal
- `gitVScode.mp4` - Git integration in VS Code
- `hostingGithub.mp4` - Hosting on GitHub Pages
- `introGit.mp4` - Introduction to Git
- `introIDE.mp4` - Introduction to IDEs

### Session 2: HTML Basics (3 videos)
- `devTools.mp4` - Chrome Developer Tools
- `firstWebpage.mp4` - Creating your first webpage
- `htmlBasics.mp4` - HTML fundamentals

### Session 3: HTML Advanced (4 videos)
- `htmlForms.mp4` - HTML forms
- `htmlHyperlinks.mp4` - Links and navigation
- `htmlImages.mp4` - Working with images
- `htmlTables.mp4` - HTML tables

### Session 4: CSS (2 videos)
- `cssActivity.mp4` - CSS practical activities
- `layoutsInCSS.mp4` - CSS layouts (reuses hostingGithub.mp4)

### Session 5: Accessibility (3 videos)
- `accessibilityKnowledge.mp4` - Accessibility principles
- `accessibilityExample.mp4` - Accessibility examples
- `accessibilityTools.mp4` - Accessibility testing tools

---

## Technical Changes

### 1. Amplify Storage Configuration

**File:** `amplify-backend/amplify/storage/resource.ts`

Added media path with guest read access:

```typescript
'media/*': [
  allow.guest.to(['read']),
  allow.authenticated.to(['read', 'write', 'delete']),
]
```

### 2. Storage Helper Functions

**File:** `public/pages/js/amplify-storage.js`

Added three new functions:

```javascript
// Upload video to S3
export async function uploadVideo(videoName, file)

// Get signed URL for video streaming
export async function getVideoUrl(videoName)

// List all videos in media folder
export async function listVideos()
```

### 3. Video Fetching Function

**File:** `public/pages/js/app.js`

Added new function for Amplify video loading:

```javascript
async function fetchMediaFromAmplify(videoName, el) {
  const { getVideoUrl } = await import('./amplify-storage.js');
  const url = await getVideoUrl(videoName);
  if (url) {
    el.setAttribute('src', url);
  }
}
```

### 4. HTML Files Updated

**Total Files Modified:** 19 lesson pages

**Before (Firebase):**
```javascript
const pathReference = window.fbStorage.ref('media/firstRepo.mp4');
const el = document.getElementById('session-video');
fetchMedia(pathReference, el);
```

**After (Amplify):**
```javascript
// Load video from Amplify Storage
const el = document.getElementById('session-video');
fetchMediaFromAmplify('firstRepo.mp4', el);
```

**Files Updated:**
- ✅ Session 1: All 7 lesson files
- ✅ Session 2: All 3 lesson files
- ✅ Session 3: All 4 lesson files
- ✅ Session 4: All 2 lesson files
- ✅ Session 5: All 3 lesson files

---

## Deployment Steps

### Step 1: Deploy Amplify Backend

```bash
cd amplify-backend
npx ampx sandbox
```

This creates the S3 bucket with the `media/` path configured for guest access.

**Wait for:** "✅ Sandbox deployed successfully"

### Step 2: Upload Videos to S3

```bash
# Make script executable (if not already)
chmod +x upload-videos-to-s3.sh

# Run upload script
./upload-videos-to-s3.sh
```

The script will:
1. Extract S3 bucket name from `amplify_outputs.json`
2. Upload all 19 videos to `s3://BUCKET_NAME/public/media/`
3. Set correct content-type (`video/mp4`)
4. Display progress for each file

**Expected Output:**
```
🎬 Starting video upload to AWS S3...
📦 Target S3 Bucket: amplify-xxxxx-storage
[1/19] Uploading: firstRepo.mp4
  ✅ Successfully uploaded: firstRepo.mp4
...
🎉 Video upload complete!
```

### Step 3: Verify Upload

Check videos in AWS Console:
1. Go to [S3 Console](https://console.aws.amazon.com/s3)
2. Find bucket: `amplify-xxxxx-codethefuturestorage-xxxxx`
3. Navigate to `public/media/`
4. Verify all 19 videos are present

### Step 4: Test Video Playback

Test on these pages:
1. Session 1 - First Repo: `/pages/sessions/session1/lessons/firstRepo.html`
2. Session 2 - HTML Basics: `/pages/sessions/session2/lessons/htmlBasics.html`
3. Session 4 - CSS Activities: `/pages/sessions/session4/lessons/cssActivities.html`

**Verification Checklist:**
- [ ] Video loads without errors
- [ ] Video plays smoothly
- [ ] No authentication required
- [ ] Console shows: "✅ Video loaded from Amplify: filename.mp4"

### Step 5: Deploy to Production

```bash
# Commit changes
git add .
git commit -m "Migrate videos from Firebase to AWS S3/Amplify"
git push

# Deploy via Amplify Console
# Or use CLI:
cd amplify-backend
npx ampx pipeline-deploy --branch main
```

---

## Rollback Plan

If issues occur, you can rollback:

### Option 1: Restore HTML Files
```bash
# Restore from backups
for f in public/pages/sessions/**/*.backup; do 
  mv "$f" "${f%.backup}"
done
```

### Option 2: Keep Both Systems Running
The Firebase storage code is still present. Videos will continue working from Firebase until S3 migration is confirmed successful.

---

## Cost Comparison

### Firebase Storage (Current)
- Storage: ~3 GB × $0.026/GB = **$0.08/month**
- Bandwidth: 400 students × 50 MB avg = 20 GB × $0.12/GB = **$2.40/month**
- **Total: ~$2.50/month**

### AWS S3 + CloudFront (New)
- S3 Storage: 3 GB × $0.023/GB = **$0.07/month**
- CloudFront: 20 GB × $0.085/GB = **$1.70/month**
- **Total: ~$1.77/month**

**Savings: ~$0.73/month (29% reduction)**

---

## Troubleshooting

### Videos Not Loading

**Check 1: Amplify Configuration**
```bash
# Verify amplify_outputs.json exists
ls -la public/amplify_outputs.json

# Check storage configuration
cat amplify-backend/amplify/storage/resource.ts
```

**Check 2: S3 Bucket Permissions**
- Verify `media/*` path has guest read access
- Check bucket CORS configuration

**Check 3: Browser Console**
- Look for errors in browser console
- Verify `fetchMediaFromAmplify` is called
- Check if `getVideoUrl` returns valid URL

### Upload Script Fails

**Error: "Bucket not found"**
- Run `npx ampx sandbox` first
- Verify `amplify_outputs.json` exists

**Error: "Access Denied"**
- Check AWS credentials: `aws configure list`
- Verify IAM permissions for S3

### Video URLs Expire

Signed URLs expire after 1 hour (3600 seconds). This is normal and secure. The video player will automatically request a new URL when needed.

To adjust expiration:
```javascript
// In amplify-storage.js, line 303
expiresIn: 3600 // Change to desired seconds
```

---

## Maintenance

### Adding New Videos

1. **Upload to S3:**
```bash
aws s3 cp "path/to/video.mp4" \
  "s3://BUCKET_NAME/public/media/video.mp4" \
  --content-type "video/mp4"
```

2. **Update HTML file:**
```javascript
fetchMediaFromAmplify('video.mp4', el);
```

### Monitoring

- **S3 Storage:** Check AWS S3 Console for storage metrics
- **CloudFront:** Monitor bandwidth usage in CloudFront Console
- **Costs:** Review AWS Cost Explorer monthly

---

## Files Modified

### Configuration Files
- ✅ `amplify-backend/amplify/storage/resource.ts`

### JavaScript Files
- ✅ `public/pages/js/amplify-storage.js`
- ✅ `public/pages/js/app.js`

### HTML Lesson Files (19 total)
- ✅ `public/pages/sessions/session1/lessons/firstRepo.html`
- ✅ `public/pages/sessions/session1/lessons/githubDesktop.html`
- ✅ `public/pages/sessions/session1/lessons/gitTerminal.html`
- ✅ `public/pages/sessions/session1/lessons/gitVScode.html`
- ✅ `public/pages/sessions/session1/lessons/hostingGithub.html`
- ✅ `public/pages/sessions/session1/lessons/introGit.html`
- ✅ `public/pages/sessions/session1/lessons/introIDE.html`
- ✅ `public/pages/sessions/session2/lessons/chromeDevTools.html`
- ✅ `public/pages/sessions/session2/lessons/firstWebpage.html`
- ✅ `public/pages/sessions/session2/lessons/htmlBasics.html`
- ✅ `public/pages/sessions/session3/lessons/html_forms.html`
- ✅ `public/pages/sessions/session3/lessons/html_hyperlinks.html`
- ✅ `public/pages/sessions/session3/lessons/html_images.html`
- ✅ `public/pages/sessions/session3/lessons/html_tables.html`
- ✅ `public/pages/sessions/session4/lessons/cssActivities.html`
- ✅ `public/pages/sessions/session4/lessons/layoutsInCSS.html`
- ✅ `public/pages/sessions/session5/lessons/accessibility.html`
- ✅ `public/pages/sessions/session5/lessons/accessibilityExample.html`
- ✅ `public/pages/sessions/session5/lessons/accessibilityTools.html`

### Utility Scripts
- ✅ `upload-videos-to-s3.sh` - Batch upload script
- ✅ `update-all-videos.py` - HTML update automation

---

## Next Steps

1. **Deploy Backend:** Run `npx ampx sandbox` in `amplify-backend/`
2. **Upload Videos:** Run `./upload-videos-to-s3.sh`
3. **Test Playback:** Verify videos load on 3+ lesson pages
4. **Deploy to Production:** Push to Git and deploy via Amplify Console
5. **Monitor:** Check video playback for first week
6. **Cleanup:** Remove Firebase storage after 30 days (optional)

---

**Migration Prepared By:** Bob (AI Assistant)  
**Last Updated:** June 21, 2026  
**Status:** ✅ Ready for Deployment