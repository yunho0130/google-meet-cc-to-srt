# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Google Meet Transcriber is a Chrome extension (Manifest V3) that:
- Captures audio from Google Meet sessions using Chrome's tabCapture API
- Transcribes audio to text using OpenAI Whisper API
- Generates AI-powered meeting notes using OpenAI GPT
- Stores transcriptions and notes locally
- Enables email sharing via Gmail integration

## Architecture

### Extension Components

1. **Background Service Worker** (`background/service-worker.js`)
   - Coordinates all extension operations
   - Manages API calls to OpenAI
   - Handles message routing between components
   - Manages transcription state

2. **Content Script** (`content/meet-content.js`)
   - Injected into Google Meet pages
   - Detects meeting start/end
   - Extracts participant information
   - Displays live transcription overlay

3. **Offscreen Document** (`offscreen/offscreen.js`)
   - Handles MediaRecorder API for audio capture
   - Processes audio streams from tabCapture
   - Sends audio chunks to background for transcription

4. **Popup** (`popup/`)
   - Quick settings and status display
   - API key configuration
   - Transcription controls

5. **Side Panel** (`sidepanel/`)
   - Full meeting history view
   - Meeting notes editor
   - Detailed settings management

### Utilities

- `utils/storage.js`: Chrome storage wrapper with encryption
- `utils/openai-api.js`: OpenAI API integration
- `utils/message-types.js`: Message type definitions for inter-component communication

## Key Technical Details

### Audio Capture Flow
1. Content script detects meeting start
2. Background requests tabCapture stream ID
3. Offscreen document captures audio using MediaRecorder
4. Audio chunks sent to background every 15 seconds
5. Background sends chunks to Whisper API
6. Transcription results broadcast to content script

### Message Passing
All components communicate via `chrome.runtime.sendMessage` using typed messages defined in `message-types.js`.

### Storage
- `chrome.storage.sync`: API key (obfuscated), settings
- `chrome.storage.local`: Meeting transcriptions, notes
- `chrome.storage.session`: Current session state

## Development Commands

```bash
# Install dependencies (for icon generation)
npm install

# Generate extension icons
npm run generate-icons

# Package for distribution
npm run package
```

## Testing

1. Load extension in Chrome: `chrome://extensions/` -> Load unpacked
2. Open Google Meet and join a test meeting
3. Check service worker console for logs
4. Verify transcription appears in overlay

## Common Issues

1. **Service worker inactive**: Use alarms to keep alive during transcription
2. **Audio capture fails**: Ensure tabCapture permission and user gesture
3. **CORS errors**: All API calls go through background service worker
4. **Module imports**: Use ES modules with `type: "module"` in manifest

## File Structure

```
├── manifest.json           # MV3 manifest
├── background/
│   └── service-worker.js   # Main coordinator
├── content/
│   ├── meet-content.js     # Google Meet integration
│   └── meet-content.css    # Overlay styles
├── popup/                  # Popup UI
├── sidepanel/              # Full panel UI
├── offscreen/              # Audio processing
├── utils/                  # Shared utilities
├── assets/icons/           # Extension icons
└── scripts/                # Build scripts
```
