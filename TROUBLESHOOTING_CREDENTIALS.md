# Troubleshooting: AWS Credentials Error

## Error Message
```
[SSMCredentialsError] UnrecognizedClientException: The security token included in the request is invalid.
Resolution: Make sure your AWS credentials are set up correctly and have permissions to call SSM:GetParameter
```

## What This Means
Your AWS credentials are either:
1. Not configured correctly
2. Invalid or expired
3. Missing required permissions
4. Using wrong profile

---

## Quick Fix Steps

### Step 1: Verify AWS CLI is Working

```bash
# Test basic AWS access
aws sts get-caller-identity
```

**If this fails:** Your credentials are not set up correctly.

**If this works:** You'll see:
```json
{
    "UserId": "AIDA...",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/your-username"
}
```

### Step 2: Check Current AWS Configuration

```bash
# List all profiles
aws configure list-profiles

# Check current configuration
aws configure list

# Check which profile is active
echo $AWS_PROFILE
```

### Step 3: Verify Credentials File

```bash
# View credentials file
cat ~/.aws/credentials

# View config file
cat ~/.aws/config
```

**Expected format in `~/.aws/credentials`:**
```ini
[default]
aws_access_key_id = AKIA...
aws_secret_access_key = ...

[code-the-future]
aws_access_key_id = AKIA...
aws_secret_access_key = ...
```

---

## Solution Options

### Option A: Reconfigure AWS Profile (Recommended)

```bash
# Reconfigure your profile
aws configure --profile code-the-future
```

Enter:
1. **Access Key ID:** Your AWS access key (starts with AKIA)
2. **Secret Access Key:** Your secret key
3. **Region:** `eu-west-1` (or `us-east-1`)
4. **Output format:** `json`

Then set as default:
```bash
export AWS_PROFILE=code-the-future
```

Test it:
```bash
aws sts get-caller-identity --profile code-the-future
```

### Option B: Create New Access Keys

If your keys are invalid or expired:

1. **Go to AWS Console:**
   - https://console.aws.amazon.com/iam/home#/security_credentials

2. **Delete old access keys:**
   - Find your old keys in "Access keys" section
   - Click "Delete" on any old/inactive keys

3. **Create new access key:**
   - Click "Create access key"
   - Select "Command Line Interface (CLI)"
   - Check acknowledgment
   - Click "Create access key"
   - **Save both keys immediately!**

4. **Update AWS CLI:**
   ```bash
   aws configure --profile code-the-future
   # Enter new keys when prompted
   ```

### Option C: Use Default Profile

If you want to use the default profile instead:

```bash
# Configure default profile
aws configure

# Unset any profile environment variable
unset AWS_PROFILE

# Test
aws sts get-caller-identity
```

Then run Amplify without profile:
```bash
cd amplify-backend
npx ampx sandbox
```

---

## Verify IAM Permissions

Your AWS user needs these permissions:

### Required Policies:
1. **AmazonSSMReadOnlyAccess** (for SSM:GetParameter)
2. **AdministratorAccess-Amplify** (for Amplify operations)
3. **AmazonS3FullAccess** (for S3 operations)

### Check Your Permissions:

```bash
# Get your user name
aws sts get-caller-identity --query 'Arn' --output text

# List attached policies (replace YOUR_USERNAME)
aws iam list-attached-user-policies --user-name YOUR_USERNAME
```

### Add Missing Permissions:

1. Go to: https://console.aws.amazon.com/iam/home#/users
2. Click your username
3. Click "Add permissions" → "Attach policies directly"
4. Search and select:
   - `AmazonSSMReadOnlyAccess`
   - `AdministratorAccess-Amplify`
   - `AmazonS3FullAccess`
5. Click "Add permissions"

---

## Common Issues & Solutions

### Issue 1: "No credentials found"

**Solution:**
```bash
# Check if credentials file exists
ls -la ~/.aws/credentials

# If not, create it
mkdir -p ~/.aws
aws configure
```

### Issue 2: "Invalid security token"

**Causes:**
- Access keys are expired or deleted
- Using wrong AWS account
- Credentials file is corrupted

**Solution:**
```bash
# Delete old credentials
rm ~/.aws/credentials
rm ~/.aws/config

# Reconfigure from scratch
aws configure --profile code-the-future
```

### Issue 3: "Access Denied" for SSM

**Solution:**
Add SSM permissions:
```bash
# Via AWS Console:
# IAM → Users → Your User → Add permissions
# Attach policy: AmazonSSMReadOnlyAccess
```

### Issue 4: Wrong Profile Active

**Solution:**
```bash
# Check current profile
echo $AWS_PROFILE

# Set correct profile
export AWS_PROFILE=code-the-future

# Or unset to use default
unset AWS_PROFILE

# Add to shell config for persistence
echo 'export AWS_PROFILE=code-the-future' >> ~/.zshrc
source ~/.zshrc
```

### Issue 5: Multiple AWS Accounts

If you have multiple AWS accounts:

```bash
# List all profiles
aws configure list-profiles

# Make sure you're using the right one
aws sts get-caller-identity --profile code-the-future

# Check account ID matches your Amplify account
```

---

## Step-by-Step Credential Reset

If nothing else works, start fresh:

### 1. Clean Up Old Configuration
```bash
# Backup existing config
cp ~/.aws/credentials ~/.aws/credentials.backup
cp ~/.aws/config ~/.aws/config.backup

# Remove old config
rm ~/.aws/credentials
rm ~/.aws/config
```

### 2. Create New Access Keys in AWS Console
1. Go to: https://console.aws.amazon.com/iam/home#/security_credentials
2. Delete all old access keys
3. Create new access key
4. Download CSV file with keys

### 3. Configure AWS CLI
```bash
aws configure --profile code-the-future
```

Enter:
- Access Key ID: [from CSV]
- Secret Access Key: [from CSV]
- Region: `eu-west-1`
- Output: `json`

### 4. Set as Default
```bash
export AWS_PROFILE=code-the-future
echo 'export AWS_PROFILE=code-the-future' >> ~/.zshrc
source ~/.zshrc
```

### 5. Verify Everything Works
```bash
# Test AWS access
aws sts get-caller-identity

# Test S3 access
aws s3 ls

# Test SSM access
aws ssm describe-parameters --max-results 1
```

### 6. Try Amplify Again
```bash
cd amplify-backend
npx ampx sandbox
```

---

## Debugging Commands

Run these to diagnose the issue:

```bash
# 1. Check AWS CLI version
aws --version

# 2. Check current credentials
aws configure list

# 3. Check environment variables
env | grep AWS

# 4. Test basic AWS access
aws sts get-caller-identity

# 5. Test SSM access specifically
aws ssm describe-parameters --max-results 1

# 6. Check IAM permissions
aws iam get-user

# 7. List attached policies
aws iam list-attached-user-policies --user-name $(aws iam get-user --query 'User.UserName' --output text)
```

---

## Still Not Working?

### Check These:

1. **Are you using the right AWS account?**
   ```bash
   aws sts get-caller-identity
   # Verify the Account ID matches your Amplify account
   ```

2. **Is your AWS account active?**
   - Check AWS Console: https://console.aws.amazon.com
   - Verify no billing issues

3. **Are you behind a corporate proxy?**
   ```bash
   # Set proxy if needed
   export HTTP_PROXY=http://proxy.example.com:8080
   export HTTPS_PROXY=http://proxy.example.com:8080
   ```

4. **Try with AWS_PROFILE explicitly:**
   ```bash
   AWS_PROFILE=code-the-future npx ampx sandbox
   ```

5. **Check Amplify CLI version:**
   ```bash
   npm list -g @aws-amplify/cli
   
   # Update if needed
   npm install -g @aws-amplify/cli@latest
   ```

---

## Alternative: Use AWS CloudShell

If local credentials keep failing, use AWS CloudShell:

1. Go to: https://console.aws.amazon.com/cloudshell
2. Click "CloudShell" icon (top right)
3. Clone your repository:
   ```bash
   git clone https://github.com/your-repo/code-the-future-hybrid.git
   cd code-the-future-hybrid/amplify-backend
   ```
4. Run Amplify:
   ```bash
   npm install
   npx ampx sandbox
   ```

CloudShell has AWS credentials pre-configured!

---

## Contact Support

If you've tried everything:

1. **AWS Support:**
   - https://console.aws.amazon.com/support/
   - Create a case for "Account and Billing"

2. **Amplify Discord:**
   - https://discord.gg/amplify
   - Ask in #help channel

3. **Check AWS Status:**
   - https://status.aws.amazon.com
   - Verify no service outages

---

## Quick Reference

```bash
# Essential commands
aws configure --profile code-the-future
export AWS_PROFILE=code-the-future
aws sts get-caller-identity
cd amplify-backend && npx ampx sandbox

# Reset everything
rm ~/.aws/credentials ~/.aws/config
aws configure --profile code-the-future
export AWS_PROFILE=code-the-future

# Debug
aws configure list
env | grep AWS
aws sts get-caller-identity
```

---

**Created:** June 21, 2026  
**For:** Resolving AWS credential issues with Amplify