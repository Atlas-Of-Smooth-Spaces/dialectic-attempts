#!/bin/bash

# Compress all videos in the vid directory
# Creates compressed versions with _compressed suffix
# Run from project root or vid directory

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

for file in *.mp4 *.webm; do
    if [ -f "$file" ]; then
        if [[ "$file" == *.mp4 ]]; then
            echo "Compressing $file..."
            if ffmpeg -i "$file" -c:v libx264 -crf 28 -preset medium -c:a aac -b:a 128k "${file%.mp4}_compressed.mp4" 2>&1; then
                echo "✓ Successfully compressed: ${file%.mp4}_compressed.mp4"
            else
                echo "✗ Failed to compress: $file"
            fi
        elif [[ "$file" == *.webm ]]; then
            echo "Compressing $file..."
            if ffmpeg -i "$file" -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus -b:a 128k "${file%.webm}_compressed.webm" 2>&1; then
                echo "✓ Successfully compressed: ${file%.webm}_compressed.webm"
            else
                echo "✗ Failed to compress: $file"
            fi
        fi
    fi
done

echo "Compression complete!"
echo "Compressed files are saved in: $SCRIPT_DIR"

