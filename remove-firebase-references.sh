#!/bin/bash

# Remove all Firebase script imports and references from HTML files

echo "🧹 Removing Firebase references from HTML files..."

# Find all HTML files and remove Firebase script tags
find public -name "*.html" -type f | while read file; do
    # Remove Firebase script imports
    sed -i.bak '/<script.*firebase\.js/d' "$file"
    
    # Remove Firebase import statements
    sed -i.bak '/import.*firebase\.js/d' "$file"
    
    # Remove window.fbAuth, window.fbDB, window.fbStorage assignments
    sed -i.bak '/window\.fbAuth.*=/d' "$file"
    sed -i.bak '/window\.fbDB.*=/d' "$file"
    sed -i.bak '/window\.fbStorage.*=/d' "$file"
    
    # Remove Firebase comments
    sed -i.bak '/Keep Firebase for backward compatibility/d' "$file"
    
    echo "  ✓ Cleaned: $file"
done

# Remove backup files
find public -name "*.bak" -type f -delete

echo ""
echo "✅ Firebase references removed from all HTML files"
echo ""
echo "Note: Some pages may still have firebase.auth() calls in their JavaScript"
echo "These will need manual review if they're critical functionality"

# Made with Bob
