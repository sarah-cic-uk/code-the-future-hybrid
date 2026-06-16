#!/bin/bash

###############################################################################
# Step 6: Migrate Storage Files from Firebase to S3
#
# This script copies all files from Firebase Storage to AWS S3.
#
# Prerequisites:
# - Firebase CLI installed: npm install -g firebase-tools
# - AWS CLI installed and configured
# - gsutil installed (part of Google Cloud SDK)
# - Logged into Firebase: firebase login
#
# Usage: bash 6-migrate-storage.sh
###############################################################################

set -e  # Exit on error

echo "🚀 Starting Firebase Storage to S3 migration..."
echo ""

# Configuration
FIREBASE_BUCKET="code-the-future-hybrid.appspot.com"
S3_BUCKET="code-the-future-storage"
TEMP_DIR="./storage-export"
AWS_REGION="${AWS_REGION:-eu-west-2}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if gsutil is installed
if ! command -v gsutil &> /dev/null; then
    echo -e "${RED}❌ Error: gsutil is not installed${NC}"
    echo "Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ Error: AWS CLI is not installed${NC}"
    echo "Install AWS CLI: https://aws.amazon.com/cli/"
    exit 1
fi

# Create temporary directory
echo "📁 Creating temporary directory..."
mkdir -p "$TEMP_DIR"
echo -e "${GREEN}✅ Created: $TEMP_DIR${NC}"
echo ""

# Download files from Firebase Storage
echo "📦 Downloading files from Firebase Storage..."
echo "   Bucket: gs://$FIREBASE_BUCKET"
echo ""

# Download profile pictures
echo "   Downloading profile pictures..."
gsutil -m cp -r "gs://$FIREBASE_BUCKET/profilePics" "$TEMP_DIR/" 2>/dev/null || {
    echo -e "${YELLOW}⚠️  No profile pictures found or error downloading${NC}"
}

# Download media files
echo "   Downloading media files..."
gsutil -m cp -r "gs://$FIREBASE_BUCKET/media" "$TEMP_DIR/" 2>/dev/null || {
    echo -e "${YELLOW}⚠️  No media files found or error downloading${NC}"
}

echo -e "${GREEN}✅ Download complete${NC}"
echo ""

# Count downloaded files
PROFILE_PICS_COUNT=$(find "$TEMP_DIR/profilePics" -type f 2>/dev/null | wc -l || echo "0")
MEDIA_COUNT=$(find "$TEMP_DIR/media" -type f 2>/dev/null | wc -l || echo "0")

echo "📊 Downloaded files:"
echo "   Profile pictures: $PROFILE_PICS_COUNT"
echo "   Media files: $MEDIA_COUNT"
echo ""

# Upload to S3
echo "☁️  Uploading files to S3..."
echo "   Bucket: s3://$S3_BUCKET"
echo "   Region: $AWS_REGION"
echo ""

# Upload profile pictures
if [ -d "$TEMP_DIR/profilePics" ]; then
    echo "   Uploading profile pictures..."
    aws s3 sync "$TEMP_DIR/profilePics" "s3://$S3_BUCKET/profile-pictures/" \
        --region "$AWS_REGION" \
        --acl private \
        --storage-class STANDARD
    echo -e "${GREEN}✅ Profile pictures uploaded${NC}"
fi

# Upload media files
if [ -d "$TEMP_DIR/media" ]; then
    echo "   Uploading media files..."
    aws s3 sync "$TEMP_DIR/media" "s3://$S3_BUCKET/media/" \
        --region "$AWS_REGION" \
        --acl public-read \
        --storage-class STANDARD
    echo -e "${GREEN}✅ Media files uploaded${NC}"
fi

echo ""

# Verify upload
echo "🔍 Verifying S3 upload..."
S3_PROFILE_COUNT=$(aws s3 ls "s3://$S3_BUCKET/profile-pictures/" --recursive | wc -l || echo "0")
S3_MEDIA_COUNT=$(aws s3 ls "s3://$S3_BUCKET/media/" --recursive | wc -l || echo "0")

echo "📊 S3 file counts:"
echo "   Profile pictures: $S3_PROFILE_COUNT"
echo "   Media files: $S3_MEDIA_COUNT"
echo ""

# Cleanup
echo "🧹 Cleaning up temporary files..."
rm -rf "$TEMP_DIR"
echo -e "${GREEN}✅ Cleanup complete${NC}"
echo ""

# Summary
echo "✨ Storage migration complete!"
echo ""
echo "📝 Summary:"
echo "   Downloaded from Firebase: $((PROFILE_PICS_COUNT + MEDIA_COUNT)) files"
echo "   Uploaded to S3: $((S3_PROFILE_COUNT + S3_MEDIA_COUNT)) files"
echo ""

if [ "$((PROFILE_PICS_COUNT + MEDIA_COUNT))" -eq "$((S3_PROFILE_COUNT + S3_MEDIA_COUNT))" ]; then
    echo -e "${GREEN}✅ All files migrated successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  File count mismatch - please verify manually${NC}"
fi

echo ""
echo "📝 Next steps:"
echo "1. Verify files in S3 console: https://s3.console.aws.amazon.com/s3/buckets/$S3_BUCKET"
echo "2. Update application code to use S3 URLs"
echo "3. Test file access from the application"
echo ""
echo "🔗 S3 URLs will be in format:"
echo "   Profile pics: https://$S3_BUCKET.s3.$AWS_REGION.amazonaws.com/profile-pictures/[userId].[ext]"
echo "   Media files: https://$S3_BUCKET.s3.$AWS_REGION.amazonaws.com/media/[filename]"

# Made with Bob
