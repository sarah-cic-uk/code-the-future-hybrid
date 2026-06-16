#!/bin/bash

###############################################################################
# Deploy Code the Future to AWS S3 + CloudFront
#
# This script deploys the website to S3 and invalidates CloudFront cache.
#
# Prerequisites:
# - AWS CLI installed and configured
# - S3 bucket created: code-the-future-website
# - CloudFront distribution created
#
# Usage: bash deploy-to-aws.sh
###############################################################################

set -e  # Exit on error

echo "🚀 Deploying Code the Future to AWS..."
echo ""

# Configuration
S3_BUCKET="code-the-future-website"
CLOUDFRONT_DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID:-}"
AWS_REGION="${AWS_REGION:-eu-west-2}"
SOURCE_DIR="./public"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ Error: AWS CLI is not installed${NC}"
    echo "Install AWS CLI: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "${RED}❌ Error: Source directory not found: $SOURCE_DIR${NC}"
    exit 1
fi

# Confirm deployment
echo -e "${YELLOW}⚠️  You are about to deploy to:${NC}"
echo "   S3 Bucket: $S3_BUCKET"
echo "   Region: $AWS_REGION"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo -e "${BLUE}📦 Step 1: Syncing files to S3...${NC}"
echo ""

# Sync HTML files with short cache (1 hour)
echo "   Uploading HTML files..."
aws s3 sync "$SOURCE_DIR" "s3://$S3_BUCKET" \
    --exclude "*" \
    --include "*.html" \
    --cache-control "public, max-age=3600" \
    --region "$AWS_REGION" \
    --delete

# Sync CSS files with long cache (1 week)
echo "   Uploading CSS files..."
aws s3 sync "$SOURCE_DIR" "s3://$S3_BUCKET" \
    --exclude "*" \
    --include "*.css" \
    --cache-control "public, max-age=604800" \
    --region "$AWS_REGION"

# Sync JS files with long cache (1 week)
echo "   Uploading JavaScript files..."
aws s3 sync "$SOURCE_DIR" "s3://$S3_BUCKET" \
    --exclude "*" \
    --include "*.js" \
    --cache-control "public, max-age=604800" \
    --region "$AWS_REGION"

# Sync images with long cache (1 month)
echo "   Uploading images..."
aws s3 sync "$SOURCE_DIR/images" "s3://$S3_BUCKET/images" \
    --cache-control "public, max-age=2592000" \
    --region "$AWS_REGION"

# Sync other files
echo "   Uploading other files..."
aws s3 sync "$SOURCE_DIR" "s3://$S3_BUCKET" \
    --exclude "*.html" \
    --exclude "*.css" \
    --exclude "*.js" \
    --exclude "images/*" \
    --cache-control "public, max-age=86400" \
    --region "$AWS_REGION"

echo -e "${GREEN}✅ Files synced to S3${NC}"
echo ""

# Invalidate CloudFront cache if distribution ID is provided
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "${BLUE}📦 Step 2: Invalidating CloudFront cache...${NC}"
    echo ""
    
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    
    echo -e "${GREEN}✅ CloudFront invalidation created: $INVALIDATION_ID${NC}"
    echo "   This may take a few minutes to complete."
    echo ""
else
    echo -e "${YELLOW}⚠️  CloudFront distribution ID not set${NC}"
    echo "   Set CLOUDFRONT_DISTRIBUTION_ID environment variable to enable cache invalidation"
    echo "   Example: export CLOUDFRONT_DISTRIBUTION_ID=E1234567890ABC"
    echo ""
fi

# Get S3 website URL
S3_WEBSITE_URL="http://$S3_BUCKET.s3-website-$AWS_REGION.amazonaws.com"

echo -e "${GREEN}✨ Deployment complete!${NC}"
echo ""
echo "📊 Deployment Summary:"
echo "   S3 Bucket: s3://$S3_BUCKET"
echo "   Region: $AWS_REGION"
echo "   S3 Website URL: $S3_WEBSITE_URL"

if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    CLOUDFRONT_URL=$(aws cloudfront get-distribution \
        --id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --query 'Distribution.DomainName' \
        --output text 2>/dev/null || echo "")
    
    if [ -n "$CLOUDFRONT_URL" ]; then
        echo "   CloudFront URL: https://$CLOUDFRONT_URL"
    fi
fi

echo ""
echo "📝 Next steps:"
echo "1. Test the deployment: $S3_WEBSITE_URL"
echo "2. Verify all pages load correctly"
echo "3. Test authentication and database operations"
echo "4. Monitor CloudWatch logs for errors"
echo ""

# Optional: Open in browser
if command -v open &> /dev/null; then
    read -p "Open website in browser? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ -n "$CLOUDFRONT_URL" ]; then
            open "https://$CLOUDFRONT_URL"
        else
            open "$S3_WEBSITE_URL"
        fi
    fi
fi

# Made with Bob
