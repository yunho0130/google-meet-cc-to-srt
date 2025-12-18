# Google Meet CC Capturer

<div align="center">

![Version](https://img.shields.io/badge/version-3.5.8-blue.svg)
![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green.svg)

**Capture and download Google Meet closed captions in real-time**
*No API keys required • Simple & Fast • Privacy-focused*

<img src="assets/images/%E1%84%86%E1%85%A1%E1%84%8F%E1%85%B5%20%E1%84%91%E1%85%B3%E1%84%85%E1%85%A9%E1%84%86%E1%85%A9%E1%84%89%E1%85%A7%E1%86%AB%20%E1%84%90%E1%85%A1%E1%84%8B%E1%85%B5%E1%86%AF%20%201400x560_%E1%84%90%E1%85%AE%E1%84%86%E1%85%A7%E1%86%BC.png" alt="Marquee promotion tile" width="100%">

[Download Latest Release](#installation) • [Features](#features) • [Usage Guide](#usage) • [Documentation](CLAUDE.md)

</div>

---

## 🎯 Overview

Google Meet CC Capturer is a lightweight Chrome extension that captures Google Meet's built-in closed captions and allows you to download them as TXT or SRT files. Unlike other solutions, it **requires no API keys** and works entirely offline with Google Meet's native captions.

### Why CC Capturer?

- ✅ **No API costs** - Uses Google Meet's free built-in captions
- ✅ **Privacy-focused** - All data stays in your browser
- ✅ **Simple & fast** - Just enable CC in Google Meet and start capturing
- ✅ **Professional quality** - Smart deduplication and text processing
- ✅ **Highly configurable** - Extensive settings for your workflow

<img src="assets/images/%E1%84%8F%E1%85%A2%E1%86%B8%E1%84%8E%E1%85%A7%E1%84%92%E1%85%AA%E1%84%86%E1%85%A7%E1%86%AB%201280x800_%E1%84%90%E1%85%AE%E1%84%86%E1%85%A7%E1%86%BC.png" alt="Meet capture screenshot" width="100%">

---

## ✨ Features

### Core Functionality
- 📝 **Real-time caption capture** from Google Meet
- 🎯 **Auto-start** when captions are detected
- 👁️ **Live preview** of pending captions
- 💾 **Download as TXT or SRT** with preview
- 🎤 **Speaker name detection** (optional)
- 🔄 **Smart deduplication** to prevent repeated text
- 📊 **Real-time statistics** (caption count, word count, duration)

### v3.5.2 Highlights
- 🌐 **Popup language toggle** - EN/KO switch in popup and history views
- 🗣️ **Speaker labels** - Include speaker names in TXT/SRT/Copy output

### v3.5.1 Highlights
- 💾 **Auto-save stability** - Saves every 30s without restarting capture
- ⏱️ **Countdown clarity** - Auto-save timer counts down from 30s to 1s
- 🧾 **History list clarity** - Full start timestamp + meeting title in history list
- 📚 **Meeting History** - Browse, view, download, and delete past recordings

### v3.1.0 Features
- 🌐 **Multilingual support** - English/Korean with language toggle
- 📋 **Copy to clipboard** - One-click copy with Ctrl+Shift+C
- 💾 **Persistent storage** - Recordings saved even if tab closes
- 📖 **Auto-guide** - Usage guide shown automatically
- 🎯 **Simplified UX** - No manual start needed, fully automatic

### v3.0.0 Features
- ⚙️ **Settings panel** for complete customization
- ⌨️ **Keyboard shortcuts** for all major actions
- 🔔 **Toast notifications** for user feedback
- 📥 **Download preview** with file statistics
- 📖 **Help guide** with quick start and shortcuts
- 💾 **Memory management** for long meetings
- 🎨 **Modern UI** with enhanced UX

### Technical Highlights
- 🧠 Smart debouncing (1.5s configurable)
- 🔍 Priority-based selector detection
- 💪 Circular buffer (prevents memory leaks)
- 📈 Performance monitoring
- 🛡️ Comprehensive error handling
- 🎯 Tab visibility handling (works during screen sharing)

---

## 📦 Installation

### Method 1: Install from Release (Recommended)

1. **Download the latest release**
   - Go to [Releases](https://github.com/yunho0130/google-meet-cc-to-srt/releases)
   - Download `google-meet-cc-capturer-v3.5.2.zip`

2. **Extract the ZIP file**
   ```bash
   unzip google-meet-cc-capturer-v3.5.2.zip
   ```

3. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top right corner)
   - Click **Load unpacked**
   - Select the extracted folder

4. **Verify installation**
   - You should see the extension icon (mint green) in your toolbar
   - Extension name: "Google Meet CC Capturer"
   - Version: 3.5.2

<img src="assets/images/%E1%84%8C%E1%85%A1%E1%86%A8%E1%84%8B%E1%85%B3%E1%86%AB%20%E1%84%91%E1%85%B3%E1%84%85%E1%85%A9%E1%84%86%E1%85%A9%E1%84%89%E1%85%A7%E1%86%AB%20%E1%84%90%E1%85%A1%E1%84%8B%E1%85%B5%E1%86%AF%20440x280.png" alt="Small promotion tile" width="60%">

### Method 2: Install from Source

```bash
# Clone the repository
git clone https://github.com/yunho0130/google-meet-cc-to-srt.git
cd google-meet-cc-to-srt

# Load in Chrome (same as Method 1, step 3)
```

---

## 🚀 Usage

### Quick Start (3 steps)

1. **Join a Google Meet meeting**
2. **Enable CC (closed captions)** by clicking the CC button in Google Meet
3. **Watch it capture automatically!** The extension detects CC and starts capturing

### Interface Overview

```
┌─────────────────────────────────────────┐
│ CC Capture         [Start] [Stop] [Settings] [Help] │
├─────────────────────────────────────────┤
│ Status: Recording...  📝 5  💬 124  ⏱️ 00:42 │
├─────────────────────────────────────────┤
│ Current: This is being captured...      │
├─────────────────────────────────────────┤
│ [00:00:12] First completed caption      │
│ [00:00:28] Second completed caption     │
│ [00:00:35] Third completed caption      │
└─────────────────────────────────────────┘
```

### Download Captions

1. **Click TXT or SRT button** (or press `Ctrl+Shift+D`)
2. **Preview your captions** in the download modal
   - See statistics (count, words, duration, file size)
   - Choose format (TXT/SRT)
   - Edit filename
   - Toggle timestamps (TXT only)
3. **Click Download** to save

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+C` | Copy to clipboard |
| `Ctrl+Shift+D` | Download captions |
| `Ctrl+Shift+H` | Show help modal |
| `Esc` | Close modals |

*Note: Capture starts automatically when CC is enabled in Google Meet*

---

## ⚙️ Settings

Access settings by clicking the **⚙️** button in the extension panel.

### Capture Settings
- **Debounce Delay** (500-3000ms, default: 1500ms)
  How long to wait for text to stabilize before capturing
- **Auto-start capture** (default: ON)
  Automatically start when CC is detected
- **Include speaker names** (default: ON)
  Add speaker names to captions
- **Show pending text** (default: ON)
  Display real-time preview

### Performance Settings
- **Max captions in memory** (500/1000/2000/5000, default: 1000)
  Older captions are archived when limit reached

### Download Settings
- **Default format** (TXT/SRT, default: TXT)
- **Include timestamps** (default: ON)
  Add timestamps to TXT downloads

---

## 📖 Help & Tips

### Best Practices
1. **Enable CC early** - Start CC before the meeting begins for best results
2. **Check pending text** - The "Current:" area shows what's being captured in real-time
3. **Wait for text to stabilize** - Text appears after 1.5s (configurable) to prevent duplicates
4. **Use keyboard shortcuts** - Much faster than clicking buttons
5. **Preview before download** - Check your captions before saving

### Common Scenarios

#### Long Meetings
- Extension automatically manages memory
- Older captions are archived (still included in downloads)
- No performance degradation

#### Screen Sharing
- Capture continues even when you switch tabs
- Works perfectly during presentations

#### Multiple Languages
- Supports any language Google Meet supports
- Korean, English, Japanese, etc.

---

## 🔧 Troubleshooting

### Captions not detected

**Problem**: "Waiting for CC..." message persists

**Solutions**:
1. Click the **CC button** in Google Meet (bottom controls)
2. If CC is enabled, try clicking "Start" manually
3. Refresh the page (`F5`)
4. Check console for errors (`F12`)

### UI text appearing in captions

**Problem**: Seeing "arrow_downward", "하단으로 이동" etc.

**Solution**: This was fixed in v3.0.0. If still occurring:
1. Refresh the extension (`chrome://extensions/` → Reload)
2. Report the specific text pattern as an issue

### Duplicate captions

**Problem**: Same caption appearing multiple times

**Solutions**:
1. Check Settings → Debounce Delay (increase if needed)
2. This should be rare in v3.0.0 due to smart deduplication

### Download not working

**Problem**: Click download but nothing happens

**Solutions**:
1. Check if you have any captions captured (count > 0)
2. Try the preview modal (`Ctrl+Shift+D`) instead
3. Check browser console for errors

### Feature_flags error in console

**Problem**: Console shows "Cannot read properties of undefined (reading 'feature_flags')"

**Note**: This is a Google Meet internal error, not from our extension. It's harmless and doesn't affect functionality. It was minimized in v3.0.0 through defensive coding.

---

## 🏗️ Architecture

```
google-meet-cc-capturer/
├── manifest.json              # Chrome Extension Manifest V3
├── content/
│   ├── meet-cc-simple.js      # Main caption capturing logic (90KB)
│   └── meet-cc-simple.css     # UI styles
├── popup/
│   ├── popup-simple.html      # Extension popup
│   └── popup-simple.js
├── assets/
│   ├── icons/                 # Extension icons (16, 32, 48, 128px)
│   └── appicon-darkmode_transparent.png
├── scripts/
│   └── generate-icons.js      # Icon generation utility
└── CLAUDE.md                  # Complete version history
```

### Key Classes

- **CCConfig** - Configuration management with Chrome storage
- **CCNotification** - Toast notification system
- **CaptionBuffer** - Memory management with circular buffering
- **SelectorManager** - Reliable caption element detection
- **PerformanceMonitor** - Metrics tracking and optimization
- **SimpleCCCapturer** - Main orchestration class

---

## 🔐 Privacy & Security

### What data is collected?
**Nothing.** This extension:
- ✅ Runs entirely in your browser
- ✅ No external servers or tracking
- ✅ No analytics or telemetry
- ✅ No API calls (except to Google Meet's own pages)

### What data is stored?
- ⚙️ Your settings (in Chrome sync storage)
- 📝 Captured captions (in Chrome local storage)
- 💾 Everything stays in your browser

### Permissions explained
- **storage** - Save your settings and captions
- **activeTab** - Access the Google Meet tab to capture captions
- **host_permissions (meet.google.com)** - Required to run on Google Meet pages

That's it! No microphone, no camera, no tracking.

---

## 📊 Version History

### v3.5.2 - Popup Language Toggle & Speaker Labels

**Changes:**
- Popup + history EN/KO toggle
- Speaker labels included in TXT/SRT/clipboard output

### v3.5.1 - Auto-save Countdown & History Clarity

**Changes:**
- Auto-save countdown now shows remaining seconds (30 → 1)
- History list shows full start timestamp with meeting title

### v3.5.0 - Capture Stability

**Changes:**
- Delta-based capture to prevent caption accumulation
- Auto-save flushes pending text without restarting capture

### v3.2.0 (2024-12-17) - History & UX Improvements

**New Features:**
- Meeting history feature in popup (browse, view, download, delete)
- Quick Guide moved to popup for easier access
- Language toggle shows target language for clarity
- Cleaner overlay UI

### v3.1.0 (2024-12-17) - Multilingual & Auto-capture

**New Features:**
- Multilingual UI (English/Korean)
- Copy to clipboard with keyboard shortcut
- Persistent storage across page reloads
- Auto-start capture when CC detected
- Usage guide panel

### v3.0.0 (2024-12-17) - Major Rebuild 🎉

**Complete overhaul** with focus on usability and reliability.

**What's New:**
- Configuration system with persistent settings
- Toast notifications for all actions
- Memory management for long meetings
- Enhanced UI with modals and statistics
- Download preview with file info
- Keyboard shortcuts
- Help guide
- Much more!

See [CLAUDE.md](CLAUDE.md) for complete version history.

### Previous Versions
- v2.4.0 - Real-time preview & tab visibility
- v2.3.0 - Debouncing for duplicate prevention
- v2.2.0 - Accurate selectors from real HTML
- v2.1.0 - Console error fixes
- v2.0.0 - Initial CC Capturer version

---

## 🛠️ Development

### Prerequisites
- Node.js 18+ (for icon generation)
- Chrome browser

### Setup
```bash
# Clone repository
git clone https://github.com/yunho0130/google-meet-cc-to-srt.git
cd google-meet-cc-to-srt

# Install dependencies (optional, for icon generation)
npm install

# Generate icons (if needed)
npm run generate-icons
```

### Load in Chrome
1. `chrome://extensions/`
2. Enable Developer mode
3. Load unpacked → select project folder

### Create Release Package
```bash
# Create a zip file for distribution
zip -r google-meet-cc-capturer-v3.5.2.zip \
  manifest.json \
  content/ \
  popup/ \
  assets/ \
  -x "*.DS_Store" "*.git*"
```

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Reporting Issues

Found a bug or have a suggestion?
- Open an issue on [GitHub Issues](https://github.com/yunho0130/google-meet-cc-to-srt/issues)
- Include:
  - Chrome version
  - Extension version
  - Steps to reproduce
  - Console errors (if any)

---

## 🙏 Acknowledgments

- Built with ❤️ using [Claude Code](https://claude.com/claude-code)
- Icons designed with modern mint theme
- Inspired by the need for simple, privacy-focused meeting tools

---

## 📞 Support

- **Documentation**: [CLAUDE.md](CLAUDE.md)
- **Issues**: [GitHub Issues](https://github.com/yunho0130/google-meet-cc-to-srt/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yunho0130/google-meet-cc-to-srt/discussions)

---

<div align="center">

**Made with Claude Code**
v3.5.2

[⬆ Back to top](#google-meet-cc-capturer)

</div>
