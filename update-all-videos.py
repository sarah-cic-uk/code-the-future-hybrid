#!/usr/bin/env python3
"""
Update all session HTML files to use Amplify Storage instead of Firebase
"""

import re
import os
from pathlib import Path

# Define the files and their video names
VIDEO_MAPPINGS = {
    "public/pages/sessions/session1/lessons/gitTerminal.html": "gitTerminal.mp4",
    "public/pages/sessions/session1/lessons/gitVScode.html": "gitVScode.mp4",
    "public/pages/sessions/session1/lessons/hostingGithub.html": "hostingGithub.mp4",
    "public/pages/sessions/session1/lessons/introGit.html": "introGit.mp4",
    "public/pages/sessions/session1/lessons/introIDE.html": "introIDE.mp4",
    "public/pages/sessions/session2/lessons/chromeDevTools.html": "devTools.mp4",
    "public/pages/sessions/session2/lessons/firstWebpage.html": "firstWebpage.mp4",
    "public/pages/sessions/session3/lessons/html_forms.html": "htmlForms.mp4",
    "public/pages/sessions/session3/lessons/html_hyperlinks.html": "htmlHyperlinks.mp4",
    "public/pages/sessions/session3/lessons/html_images.html": "htmlImages.mp4",
    "public/pages/sessions/session3/lessons/html_tables.html": "htmlTables.mp4",
    "public/pages/sessions/session4/lessons/layoutsInCSS.html": "hostingGithub.mp4",
    "public/pages/sessions/session5/lessons/accessibility.html": "accessibilityKnowledge.mp4",
    "public/pages/sessions/session5/lessons/accessibilityExample.html": "accessibilityExample.mp4",
    "public/pages/sessions/session5/lessons/accessibilityTools.html": "accessibilityTools.mp4",
}

def update_file(filepath, video_name):
    """Update a single HTML file to use Amplify storage"""
    
    if not os.path.exists(filepath):
        print(f"  ⚠️  File not found: {filepath}")
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if already updated
    if 'fetchMediaFromAmplify' in content:
        print(f"  ℹ️  Already using Amplify")
        return False
    
    # Pattern to match Firebase storage reference
    # Matches: const pathReference = window.fbStorage.ref('media/xxx.mp4');
    #          const el = document.getElementById('session-video');
    #          fetchMedia(pathReference, el)
    
    pattern = r"const pathReference = window\.fbStorage\.ref\(['\"]media/[^'\"]+['\"]\);\s*const el = document\.getElementById\(['\"]session-video['\"]\);\s*fetchMedia\(pathReference, el\)"
    
    replacement = f"// Load video from Amplify Storage\n      const el = document.getElementById('session-video');\n      fetchMediaFromAmplify('{video_name}', el);"
    
    # Try with different whitespace patterns
    patterns = [
        r"const pathReference = window\.fbStorage\.ref\(['\"]media/[^'\"]+['\"]\);\s*const el = document\.getElementById\(['\"]session-video['\"]\);\s*fetchMedia\(pathReference,\s*el\)",
        r"const pathReference = window\.fbStorage\.ref\(['\"]media/[^'\"]+['\"]\);\s+const el = document\.getElementById\(['\"]session-video['\"]\);\s+fetchMedia\(pathReference,\s*el\)",
    ]
    
    updated = False
    for pattern in patterns:
        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content)
            updated = True
            break
    
    if not updated:
        print(f"  ⚠️  Pattern not found, trying alternative approach")
        # Try line-by-line replacement
        lines = content.split('\n')
        new_lines = []
        i = 0
        while i < len(lines):
            line = lines[i]
            if 'window.fbStorage.ref' in line and 'media/' in line:
                # Found the Firebase reference line
                # Replace next 2-3 lines
                new_lines.append("      // Load video from Amplify Storage")
                new_lines.append("      const el = document.getElementById('session-video');")
                new_lines.append(f"      fetchMediaFromAmplify('{video_name}', el);")
                # Skip the next lines that contain getElementById and fetchMedia
                i += 1
                while i < len(lines) and ('getElementById' in lines[i] or 'fetchMedia' in lines[i]):
                    i += 1
                continue
            new_lines.append(line)
            i += 1
        content = '\n'.join(new_lines)
        updated = True
    
    if updated:
        # Create backup
        backup_path = filepath + '.backup'
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(open(filepath, 'r', encoding='utf-8').read())
        
        # Write updated content
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"  ✅ Updated successfully")
        return True
    else:
        print(f"  ❌ Failed to update")
        return False

def main():
    print("🔄 Updating video references from Firebase to Amplify...\n")
    
    total = len(VIDEO_MAPPINGS)
    updated = 0
    skipped = 0
    failed = 0
    
    for i, (filepath, video_name) in enumerate(VIDEO_MAPPINGS.items(), 1):
        print(f"[{i}/{total}] Processing: {filepath}")
        print(f"  Video: {video_name}")
        
        result = update_file(filepath, video_name)
        if result:
            updated += 1
        elif result is False and os.path.exists(filepath):
            skipped += 1
        else:
            failed += 1
        print()
    
    print("📊 Summary:")
    print(f"  Total files: {total}")
    print(f"  Updated: {updated}")
    print(f"  Skipped: {skipped}")
    print(f"  Failed: {failed}")
    print("\n✅ Video reference update complete!")
    print("\nBackup files created with .backup extension")

if __name__ == "__main__":
    main()

# Made with Bob
