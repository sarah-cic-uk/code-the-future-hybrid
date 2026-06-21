#!/bin/bash

# Fix S3 Bucket Policy for Public Video Access
# This adds a bucket policy to allow public read access to media files

echo "🔧 Fixing S3 bucket policy for public video access..."

# Get bucket name from amplify_outputs.json
BUCKET_NAME=$(python3 -c "import json; f=open('public/amplify_outputs.json'); data=json.load(f); print(data['storage']['bucket_name'])" 2>/dev/null)

if [ -z "$BUCKET_NAME" ]; then
    echo "❌ Error: Could not find bucket name in amplify_outputs.json"
    exit 1
fi

echo "📦 Bucket: $BUCKET_NAME"

# First, disable "Block all public access" on the bucket
echo "🔓 Disabling block public access..."
aws s3api put-public-access-block \
    --bucket "$BUCKET_NAME" \
    --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

if [ $? -ne 0 ]; then
    echo "❌ Failed to update public access block settings"
    exit 1
fi

echo "✅ Public access block settings updated"

# Create bucket policy to allow public read for media files
cat > /tmp/bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::BUCKET_NAME/public/media/*"
    }
  ]
}
EOF

# Replace BUCKET_NAME placeholder
sed -i.bak "s/BUCKET_NAME/$BUCKET_NAME/g" /tmp/bucket-policy.json

echo "📝 Applying bucket policy..."
aws s3api put-bucket-policy \
    --bucket "$BUCKET_NAME" \
    --policy file:///tmp/bucket-policy.json

if [ $? -eq 0 ]; then
    echo "✅ Bucket policy applied successfully!"
    echo ""
    echo "🎬 Videos in public/media/* are now publicly accessible"
    echo ""
    echo "Test by visiting:"
    echo "https://$BUCKET_NAME.s3.amazonaws.com/public/media/firstRepo.mp4"
else
    echo "❌ Failed to apply bucket policy"
    exit 1
fi

# Cleanup
rm /tmp/bucket-policy.json /tmp/bucket-policy.json.bak 2>/dev/null

echo ""
echo "✅ Done! Refresh your session page and the videos should now work."

# Made with Bob
