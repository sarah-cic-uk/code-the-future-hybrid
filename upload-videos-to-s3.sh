#!/bin/bash

# Upload Videos to AWS S3 via Amplify Storage
# This script uploads all video tutorials to the Amplify S3 bucket

# Set AWS profile (change this to your profile name)
# Uncomment and set if you're using a named profile:
# export AWS_PROFILE=code-the-future

echo "🎬 Starting video upload to AWS S3..."
echo ""

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Error: AWS credentials not configured or invalid"
    echo ""
    echo "Please configure AWS CLI first:"
    echo "  aws configure --profile code-the-future"
    echo ""
    echo "Or see AWS_PROFILE_SETUP.md for detailed instructions"
    exit 1
fi

echo "✅ AWS credentials verified"
if [ ! -z "$AWS_PROFILE" ]; then
    echo "📋 Using AWS profile: $AWS_PROFILE"
fi
echo ""

# Source directory containing videos
VIDEO_DIR="/Users/sarahneenan/Documents/outreach/Code the future video tutorials"

# Check if directory exists
if [ ! -d "$VIDEO_DIR" ]; then
    echo "❌ Error: Video directory not found: $VIDEO_DIR"
    exit 1
fi

# Get the S3 bucket name from amplify_outputs.json
if [ ! -f "public/amplify_outputs.json" ]; then
    echo "❌ Error: amplify_outputs.json not found. Please run 'npx ampx sandbox' first."
    exit 1
fi

# Extract bucket name from amplify_outputs.json
# Use Python to parse JSON reliably
BUCKET_NAME=$(python3 -c "import json; f=open('public/amplify_outputs.json'); data=json.load(f); print(data['storage']['bucket_name'])" 2>/dev/null)

if [ -z "$BUCKET_NAME" ]; then
    echo "❌ Error: Could not find bucket name in amplify_outputs.json"
    echo ""
    echo "Trying alternative method..."
    # Fallback: use grep with better pattern
    BUCKET_NAME=$(grep -o '"bucket_name": *"[^"]*"' public/amplify_outputs.json | head -1 | sed 's/.*"bucket_name": *"\([^"]*\)".*/\1/')
    
    if [ -z "$BUCKET_NAME" ]; then
        echo "❌ Still couldn't find bucket name. Please check amplify_outputs.json"
        exit 1
    fi
fi

echo "📦 Target S3 Bucket: $BUCKET_NAME"
echo "📁 Source Directory: $VIDEO_DIR"
echo ""

# List of video files to upload
videos=(
    "accessibilityExample.mp4"
    "accessibilityKnowledge.mp4"
    "accessibilityTools.mp4"
    "cssActivity.mp4"
    "devTools.mp4"
    "firstRepo.mp4"
    "firstWebpage.mp4"
    "githubDesktop.mp4"
    "gitTerminal.mp4"
    "gitVScode.mp4"
    "hostingGithub.mp4"
    "htmlBasics.mp4"
    "htmlForms.mp4"
    "htmlHyperlinks.mp4"
    "htmlImages.mp4"
    "htmlTables.mp4"
    "introGit.mp4"
    "introIDE.mp4"
    "layoutsInCSS.mp4"
)

# Counter for progress
total=${#videos[@]}
current=0

# Upload each video
for video in "${videos[@]}"; do
    current=$((current + 1))
    echo "[$current/$total] Uploading: $video"
    
    # Check if file exists
    if [ ! -f "$VIDEO_DIR/$video" ]; then
        echo "  ⚠️  Warning: File not found, skipping: $video"
        continue
    fi
    
    # Upload to S3 with public-read ACL under media/ prefix
    aws s3 cp "$VIDEO_DIR/$video" "s3://$BUCKET_NAME/public/media/$video" \
        --content-type "video/mp4" \
        --metadata-directive REPLACE
    
    if [ $? -eq 0 ]; then
        echo "  ✅ Successfully uploaded: $video"
    else
        echo "  ❌ Failed to upload: $video"
    fi
    echo ""
done

echo "🎉 Video upload complete!"
echo ""
echo "Next steps:"
echo "1. Verify videos in AWS S3 Console"
echo "2. Test video playback on session pages"
echo "3. Update HTML files to use Amplify storage"

# Made with Bob
