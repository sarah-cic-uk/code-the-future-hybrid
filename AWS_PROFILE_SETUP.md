# AWS Profile Setup Guide

## Overview

This guide walks you through setting up a new AWS CLI profile for your Code the Future project. This allows you to manage AWS credentials separately from other AWS accounts you might have.

---

## Prerequisites

1. **AWS Account** - You should have an AWS account created
2. **AWS CLI** - Install if not already installed
3. **Access Keys** - You'll need to create these in AWS Console

---

## Step 1: Install AWS CLI (if needed)

### Check if AWS CLI is installed:
```bash
aws --version
```

### If not installed, install it:

**macOS (using Homebrew):**
```bash
brew install awscli
```

**macOS (using official installer):**
```bash
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```

**Verify installation:**
```bash
aws --version
# Should show: aws-cli/2.x.x Python/3.x.x Darwin/xx.x.x
```

---

## Step 2: Create AWS Access Keys

1. **Log into AWS Console:**
   - Go to: https://console.aws.amazon.com
   - Sign in with your AWS account

2. **Navigate to IAM:**
   - Click your account name (top right)
   - Select "Security credentials"
   - Or go directly to: https://console.aws.amazon.com/iam/home#/security_credentials

3. **Create Access Key:**
   - Scroll to "Access keys" section
   - Click "Create access key"
   - Select use case: "Command Line Interface (CLI)"
   - Check "I understand the above recommendation"
   - Click "Next"
   - Add description (optional): "Code the Future Amplify Project"
   - Click "Create access key"

4. **Save Your Credentials:**
   - ⚠️ **IMPORTANT:** Copy both values immediately:
     - **Access Key ID**: `AKIA...` (20 characters)
     - **Secret Access Key**: `wJalr...` (40 characters)
   - Click "Download .csv file" (recommended backup)
   - ⚠️ You won't be able to see the secret key again!

---

## Step 3: Configure AWS Profile

### Option A: Interactive Configuration (Recommended)

```bash
aws configure --profile code-the-future
```

You'll be prompted for:

```
AWS Access Key ID [None]: AKIA................
AWS Secret Access Key [None]: wJalr...............................
Default region name [None]: eu-west-1
Default output format [None]: json
```

**Region Selection:**
- `eu-west-1` (Ireland) - Recommended for UK/Europe
- `us-east-1` (N. Virginia) - Good for global, cheapest
- `eu-west-2` (London) - UK-specific

**Output Format:**
- `json` - Recommended (easiest to parse)
- `yaml` - Human-readable alternative
- `table` - Good for viewing in terminal

### Option B: Manual Configuration

Edit `~/.aws/credentials`:
```bash
nano ~/.aws/credentials
```

Add:
```ini
[code-the-future]
aws_access_key_id = AKIA................
aws_secret_access_key = wJalr...............................
```

Edit `~/.aws/config`:
```bash
nano ~/.aws/config
```

Add:
```ini
[profile code-the-future]
region = eu-west-1
output = json
```

---

## Step 4: Verify Profile Setup

### Test AWS CLI with your profile:
```bash
aws sts get-caller-identity --profile code-the-future
```

**Expected output:**
```json
{
    "UserId": "AIDA...",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/your-username"
}
```

### List all configured profiles:
```bash
aws configure list-profiles
```

Should show:
```
default
code-the-future
```

---

## Step 5: Set Default Profile (Optional)

### Option A: Set for current terminal session:
```bash
export AWS_PROFILE=code-the-future
```

### Option B: Set permanently in your shell:

**For bash (~/.bash_profile or ~/.bashrc):**
```bash
echo 'export AWS_PROFILE=code-the-future' >> ~/.bash_profile
source ~/.bash_profile
```

**For zsh (~/.zshrc):**
```bash
echo 'export AWS_PROFILE=code-the-future' >> ~/.zshrc
source ~/.zshrc
```

### Verify default profile:
```bash
echo $AWS_PROFILE
# Should output: code-the-future
```

---

## Step 6: Test S3 Access

### List S3 buckets:
```bash
aws s3 ls --profile code-the-future
```

If you see buckets (or no error), your profile is working! ✅

---

## Step 7: Update Project Scripts

### Update upload-videos-to-s3.sh

Add profile flag to AWS commands:

```bash
# Find this line in upload-videos-to-s3.sh:
aws s3 cp "$VIDEO_DIR/$video" "s3://$BUCKET_NAME/public/media/$video" \

# Change to:
aws s3 cp "$VIDEO_DIR/$video" "s3://$BUCKET_NAME/public/media/$video" \
    --profile code-the-future \
```

Or set the profile at the top of the script:
```bash
#!/bin/bash

# Set AWS profile
export AWS_PROFILE=code-the-future

# Rest of script...
```

---

## Using the Profile

### With AWS CLI commands:
```bash
# Always add --profile flag
aws s3 ls --profile code-the-future
aws s3 cp file.txt s3://bucket/ --profile code-the-future
```

### With Amplify CLI:

Amplify CLI will automatically use the AWS profile. You can specify it:

```bash
# Set profile for Amplify
export AWS_PROFILE=code-the-future

# Then run Amplify commands
cd amplify-backend
npx ampx sandbox
```

Or configure Amplify to use specific profile:
```bash
amplify configure --profile code-the-future
```

---

## Troubleshooting

### Error: "Unable to locate credentials"

**Solution 1:** Verify credentials file:
```bash
cat ~/.aws/credentials
```

**Solution 2:** Check profile name:
```bash
aws configure list-profiles
```

**Solution 3:** Set profile explicitly:
```bash
export AWS_PROFILE=code-the-future
```

### Error: "Access Denied"

**Check IAM permissions:**
1. Go to IAM Console: https://console.aws.amazon.com/iam/
2. Click "Users" → Your username
3. Check "Permissions" tab
4. You need these policies:
   - `AmazonS3FullAccess` (for S3 operations)
   - `AdministratorAccess-Amplify` (for Amplify)
   - Or custom policy with required permissions

**Add required permissions:**
1. Click "Add permissions" → "Attach policies directly"
2. Search and select:
   - `AmazonS3FullAccess`
   - `AdministratorAccess-Amplify`
3. Click "Add permissions"

### Error: "Region not specified"

**Solution:**
```bash
aws configure set region eu-west-1 --profile code-the-future
```

### Check current configuration:
```bash
aws configure list --profile code-the-future
```

---

## Security Best Practices

### 1. Never Commit Credentials
Add to `.gitignore`:
```
.aws/
*.pem
*.key
credentials
```

### 2. Rotate Access Keys Regularly
- Rotate every 90 days
- Delete old keys after rotation

### 3. Use IAM Roles (Production)
For production, use IAM roles instead of access keys:
- EC2 instances: Use instance roles
- Lambda: Use execution roles
- Amplify: Uses service roles automatically

### 4. Enable MFA (Multi-Factor Authentication)
1. Go to IAM → Security credentials
2. Enable MFA device
3. Scan QR code with authenticator app

### 5. Limit Permissions
Use principle of least privilege:
- Only grant necessary permissions
- Use specific resource ARNs
- Avoid `*` in policies when possible

---

## Quick Reference

### Common Commands

```bash
# List profiles
aws configure list-profiles

# View current profile
echo $AWS_PROFILE

# Set profile for session
export AWS_PROFILE=code-the-future

# Test profile
aws sts get-caller-identity --profile code-the-future

# List S3 buckets
aws s3 ls --profile code-the-future

# Upload file to S3
aws s3 cp file.mp4 s3://bucket/path/ --profile code-the-future

# Run Amplify with profile
AWS_PROFILE=code-the-future npx ampx sandbox
```

### Profile File Locations

- **Credentials:** `~/.aws/credentials`
- **Config:** `~/.aws/config`
- **Edit credentials:** `nano ~/.aws/credentials`
- **Edit config:** `nano ~/.aws/config`

---

## Next Steps

After setting up your AWS profile:

1. ✅ Verify profile works: `aws sts get-caller-identity --profile code-the-future`
2. ✅ Set as default: `export AWS_PROFILE=code-the-future`
3. ✅ Deploy Amplify backend: `cd amplify-backend && npx ampx sandbox`
4. ✅ Upload videos: `./upload-videos-to-s3.sh`

---

## Support

- **AWS CLI Documentation:** https://docs.aws.amazon.com/cli/
- **AWS IAM Guide:** https://docs.aws.amazon.com/IAM/
- **Amplify CLI:** https://docs.amplify.aws/cli/

---

**Created:** June 21, 2026  
**For:** Code the Future Video Migration Project