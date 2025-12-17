# Google Meet Transcriber

A Chrome extension that automatically transcribes Google Meet meetings using OpenAI's Whisper API and generates AI-powered meeting notes.

## Features

- **Automatic Transcription**: Captures audio from Google Meet sessions and transcribes in real-time using OpenAI Whisper
- **AI Meeting Notes**: Generates comprehensive meeting notes including:
  - Summary
  - Key discussion points
  - Action items with assignees
  - Decisions made
  - Follow-up items
- **Email Integration**: One-click sharing of meeting notes via Gmail
- **Multi-language Support**: Korean, English, Japanese, Chinese, Spanish, French, German
- **Live Overlay**: View transcription in real-time during meetings
- **Meeting History**: Store and review past meeting transcriptions

## Installation

### From Source (Development)

1. Clone this repository:
   ```bash
   git clone https://github.com/your-repo/google-meet-transcriber.git
   cd google-meet-transcriber
   ```

2. Generate icons (optional - placeholders are included):
   ```bash
   # Option 1: Using Node.js
   npm install
   npm run generate-icons

   # Option 2: Using browser
   # Open scripts/generate-icons.html in a browser and save the icons
   ```

3. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the project folder

4. Configure your OpenAI API key:
   - Click the extension icon in Chrome toolbar
   - Enter your OpenAI API key
   - Click "Save Key"

## Usage

### Starting Transcription

1. Join a Google Meet meeting
2. The extension will automatically detect the meeting
3. If auto-transcription is enabled, recording starts automatically
4. Otherwise, click the extension icon and press "Start Recording"

### Viewing Transcription

- **During meeting**: View live transcription in the overlay panel
- **After meeting**: Click the extension icon and select a meeting from history

### Generating Meeting Notes

1. Open a completed meeting from the history
2. Switch to the "Meeting Notes" tab
3. Click "Generate Notes with AI"
4. Edit the generated notes as needed
5. Click "Save Changes"

### Sending Email

1. Generate or view meeting notes
2. Click "Send Email"
3. Gmail will open with pre-filled:
   - Subject line
   - Formatted meeting notes
   - Recipients (if email addresses were detected)

## Configuration

### Settings

Access settings through the extension popup or side panel:

- **Auto-transcribe**: Automatically start transcription when joining a meeting
- **Show overlay**: Display live transcription during meetings
- **Language**: Primary language for transcription
- **Whisper Model**: OpenAI Whisper model to use
- **GPT Model**: Model for generating meeting notes

### Supported Languages

- Korean (ko)
- English (en)
- Japanese (ja)
- Chinese (zh)
- Spanish (es)
- French (fr)
- German (de)

## Architecture

```
google-meet-transcriber/
├── manifest.json          # Extension manifest (MV3)
├── background/
│   └── service-worker.js  # Background service worker
├── content/
│   ├── meet-content.js    # Content script for Google Meet
│   └── meet-content.css   # Overlay styles
├── popup/
│   ├── popup.html         # Extension popup UI
│   ├── popup.css
│   └── popup.js
├── sidepanel/
│   ├── sidepanel.html     # Full panel UI
│   ├── sidepanel.css
│   └── sidepanel.js
├── offscreen/
│   ├── offscreen.html     # Offscreen document for audio
│   └── offscreen.js
├── utils/
│   ├── storage.js         # Storage utilities
│   ├── openai-api.js      # OpenAI API integration
│   └── message-types.js   # Message type definitions
└── assets/
    └── icons/             # Extension icons
```

## API Requirements

This extension requires an OpenAI API key with access to:

- **Whisper API** (`whisper-1`): For speech-to-text transcription
- **Chat API** (`gpt-4o-mini` or `gpt-4o`): For generating meeting notes

Get your API key at: https://platform.openai.com/api-keys

## Permissions

The extension requires the following permissions:

- `storage`: Store API key and meeting data
- `activeTab`: Access current tab for meeting detection
- `scripting`: Inject content scripts
- `tabCapture`: Capture audio from Google Meet tab
- `offscreen`: Process audio in offscreen document
- `tabs`: Tab management
- `alarms`: Keep service worker alive during transcription
- `identity`: OAuth support (future feature)

Host permissions:
- `meet.google.com`: Detect and interact with Google Meet
- `api.openai.com`: Call OpenAI APIs
- `mail.google.com`: Open Gmail compose

## Privacy & Security

- **Local Storage**: All meeting data is stored locally in your browser
- **API Key Security**: Your OpenAI API key is obfuscated before storage
- **No External Servers**: Data is sent only to OpenAI's API
- **No Tracking**: No analytics or tracking is included

## Troubleshooting

### Transcription not starting

1. Ensure your API key is configured correctly
2. Check if you're on a Google Meet page
3. Try refreshing the meeting page
4. Check the browser console for errors

### Audio not capturing

1. Ensure the extension has permission to access the tab
2. Try disabling other extensions that might interfere
3. Refresh the meeting page

### Notes generation fails

1. Ensure there's a transcript available
2. Check your API key has access to GPT models
3. Try with a shorter transcript first

## Development

### Prerequisites

- Node.js 18+
- Chrome browser

### Setup

```bash
npm install
```

### Generate Icons

```bash
npm run generate-icons
```

Or open `scripts/generate-icons.html` in a browser.

### Package for Distribution

```bash
npm run package
```

## License

MIT License - See LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
