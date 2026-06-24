#!/bin/bash

# Update all lesson HTML files to use S3 video loading with AWS SDK

echo "🎬 Updating video loading to use AWS SDK S3..."

# Find all lesson HTML files
LESSON_FILES=$(find public/pages/sessions -name "*.html" -type f)

for file in $LESSON_FILES; do
    # Check if file contains fetchMediaFromAmplify
    if grep -q "fetchMediaFromAmplify" "$file"; then
        echo "Updating: $file"
        
        # Add AWS SDK script tag if not present
        if ! grep -q "aws-sdk" "$file"; then
            # Add AWS SDK before </head>
            sed -i.bak 's|</head>|    <script src="https://sdk.amazonaws.com/js/aws-sdk-2.1544.0.min.js"></script>\n    <script src="../../../js/s3-videos.js"></script>\n</head>|' "$file"
        fi
        
        # Replace fetchMediaFromAmplify with fetchMediaFromS3
        sed -i.bak 's/fetchMediaFromAmplify/fetchMediaFromS3/g' "$file"
        
        echo "  ✅ Updated"
    fi
done

echo ""
echo "✅ All lesson files updated!"
echo ""
echo "📝 Changes made:"
echo "  - Added AWS SDK script tag"
echo "  - Added s3-videos.js script"
echo "  - Changed fetchMediaFromAmplify → fetchMediaFromS3"
echo ""
echo "🚀 Next steps:"
echo "  1. Upload videos: ./upload-videos-to-s3.sh"
echo "  2. Test a lesson page"
echo "  3. Commit and push changes"

# Made with Bob
