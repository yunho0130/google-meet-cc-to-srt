#!/bin/bash

# Switch back to API Version
# This script restores the API version with Whisper/Gemini support

echo "🔄 Switching back to API version..."
echo ""

# Backup simple manifest
if [ -f "manifest.json" ]; then
    echo "📦 Backing up simple manifest"
    cp manifest.json manifest-simple-backup.json
fi

# Restore API version
if [ -f "manifest-api.json" ]; then
    echo "✅ Restoring API version"
    cp manifest-api.json manifest.json
else
    echo "❌ Error: manifest-api.json not found"
    echo "   The API version manifest was not backed up"
    exit 1
fi

echo ""
echo "✨ API version restored!"
echo ""
echo "📋 Next steps:"
echo "1. Go to chrome://extensions/"
echo "2. Click the reload button on 'Google Meet Transcriber'"
echo "3. Configure your OpenAI or Gemini API key"
echo "4. Join a Google Meet meeting"
echo "5. Start transcription"
echo ""
echo "💡 API key required but higher accuracy!"
echo ""
