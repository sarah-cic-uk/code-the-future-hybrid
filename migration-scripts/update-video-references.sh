#!/bin/bash

# Update all session HTML files to use Amplify Storage instead of Firebase
# This script replaces Firebase video references with Amplify storage calls

echo "🔄 Updating video references from Firebase to Amplify..."
echo ""

# Define the files and their video names
declare -A video_files=(
    ["public/pages/sessions/session1/lessons/firstRepo.html"]="firstRepo.mp4"
    ["public/pages/sessions/session1/lessons/githubDesktop.html"]="githubDesktop.mp4"
    ["public/pages/sessions/session1/lessons/gitTerminal.html"]="gitTerminal.mp4"
    ["public/pages/sessions/session1/lessons/gitVScode.html"]="gitVScode.mp4"
    ["public/pages/sessions/session1/lessons/hostingGithub.html"]="hostingGithub.mp4"
    ["public/pages/sessions/session1/lessons/introGit.html"]="introGit.mp4"
    ["public/pages/sessions/session1/lessons/introIDE.html"]="introIDE.mp4"
    ["public/pages/sessions/session2/lessons/chromeDevTools.html"]="devTools.mp4"
    ["public/pages/sessions/session2/lessons/firstWebpage.html"]="firstWebpage.mp4"
    ["public/pages/sessions/session2/lessons/htmlBasics.html"]="htmlBasics.mp4"
    ["public/pages/sessions/session3/lessons/html_forms.html"]="htmlForms.mp4"
    ["public/pages/sessions/session3/lessons/html_hyperlinks.html"]="htmlHyperlinks.mp4"
    ["public/pages/sessions/session3/lessons/html_images.html"]="htmlImages.mp4"
    ["public/pages/sessions/session3/lessons/html_tables.html"]="htmlTables.mp4"
    ["public/pages/sessions/session4/lessons/cssActivities.html"]="cssActivity.mp4"
    ["public/pages/sessions/session4/lessons/layoutsInCSS.html"]="hostingGithub.mp4"
    ["public/pages/sessions/session5/lessons/accessibility.html"]="accessibilityKnowledge.mp4"
    ["public/pages/sessions/session5/lessons/accessibilityExample.html"]="accessibilityExample.mp4"
    ["public/pages/sessions/session5/lessons/accessibilityTools.html"]="accessibilityTools.mp4"
)

# Counter
total=${#video_files[@]}
current=0
updated=0
skipped=0

# Process each file
for file in "${!video_files[@]}"; do
    current=$((current + 1))
    video_name="${video_files[$file]}"
    
    echo "[$current/$total] Processing: $file"
    echo "  Video: $video_name"
    
    if [ ! -f "$file" ]; then
        echo "  ⚠️  File not found, skipping"
        skipped=$((skipped + 1))
        continue
    fi
    
    # Check if file already uses Amplify
    if grep -q "fetchMediaFromAmplify" "$file"; then
        echo "  ℹ️  Already using Amplify, skipping"
        skipped=$((skipped + 1))
        continue
    fi
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Replace Firebase storage reference with Amplify
    # Pattern 1: const pathReference = window.fbStorage.ref('media/video.mp4');
    #            const el = document.getElementById('session-video');
    #            fetchMedia(pathReference, el)
    
    sed -i '' \
        -e "s|const pathReference = window\.fbStorage\.ref(['\"])media/[^'\"]*['\"])|// Load video from Amplify Storage\n            const el = document.getElementById('session-video')|g" \
        -e "s|const el = document\.getElementById(['\"])session-video['\"])|// Removed duplicate line|g" \
        -e "s|fetchMedia(pathReference, el)|fetchMediaFromAmplify('$video_name', el)|g" \
        "$file"
    
    # Clean up duplicate lines
    sed -i '' '/\/\/ Removed duplicate line/d' "$file"
    
    echo "  ✅ Updated successfully"
    updated=$((updated + 1))
    echo ""
done

echo "📊 Summary:"
echo "  Total files: $total"
echo "  Updated: $updated"
echo "  Skipped: $skipped"
echo ""
echo "✅ Video reference update complete!"
echo ""
echo "Backup files created with .backup extension"
echo "To restore: for f in public/pages/sessions/**/*.backup; do mv \"\$f\" \"\${f%.backup}\"; done"

# Made with Bob
