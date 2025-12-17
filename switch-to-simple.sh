#!/bin/bash

# Switch to Simple CC Capturer Version
# This script backs up the API version and activates the simple CC capturer

echo "🔄 Switching to Simple CC Capturer version..."
echo ""

# Backup current manifest
if [ -f "manifest.json" ]; then
    echo "📦 Backing up current manifest.json to manifest-api.json"
    mv manifest.json manifest-api.json
fi

# Activate simple version
if [ -f "manifest-simple.json" ]; then
    echo "✅ Activating simple version"
    cp manifest-simple.json manifest.json
else
    echo "❌ Error: manifest-simple.json not found"
    exit 1
fi

echo ""
echo "✨ Simple version activated!"
echo ""
echo "📋 Next steps:"
echo "1. Go to chrome://extensions/"
echo "2. Click the reload button on 'Google Meet CC Capturer'"
echo "3. Join a Google Meet meeting"
echo "4. Enable CC (자막) button"
echo "5. Click extension icon and click 'Start Capture'"
echo ""
echo "💡 No API key required - just capture CC text!"
echo ""
