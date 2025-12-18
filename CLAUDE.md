# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Google Meet CC Capturer** is a Chrome extension (Manifest V3) that captures Google Meet's built-in closed captions without requiring any API calls.

### Current Version: 3.4.0

**Key Features:**
- **Real-time caption capture** from Google Meet closed captions
- **No API keys** or external services required
- **Auto-start capture** when CC is detected
- **Timestamp-based filtering** - Simple, robust deduplication (v3.4.0)
- **Meeting history** - Browse, view, download, and delete past recordings
- **Quick Guide in popup** - Easy access guide for users
- **Multilingual UI** (English/Korean) with smart language toggle
- **Live preview** with pending text display
- **Download preview** with file statistics and format selection
- **Comprehensive settings** panel for customization
- **Keyboard shortcuts** for all major actions
- **Memory management** for long meetings (circular buffer)
- **Toast notifications** for user feedback
- **Statistics dashboard** (caption count, word count, duration)
- **Help modal** with quick start guide and shortcuts
- **Speaker name detection** and inclusion
- **Tab visibility handling** for screen sharing scenarios
- **TXT and SRT format** downloads with preview
- **Persistent storage** - Sessions saved across page reloads
- **Auto-save progress bar** - Fills 0% to 100% showing time until next save (v3.4.0)

### Legacy Version (API-based)

The previous version (v1.x) used API-based transcription:
- Audio capture via Chrome's tabCapture API
- OpenAI Whisper API for transcription
- GPT for meeting notes generation
- Gmail integration for sharing

This version has been replaced with the simpler CC capturer approach due to API reliability issues and costs.

## Architecture (v2.4.0)

### Simple CC Capturer Components

1. **Content Script** (`content/meet-cc-simple.js`)
   - Main caption capturing logic
   - DOM observation for caption detection
   - Text extraction and filtering
   - Real-time UI overlay
   - Debouncing and deduplication
   - Speaker name detection
   - Tab visibility handling

2. **Content Styles** (`content/meet-cc-simple.css`)
   - Overlay UI styling
   - Pending text preview styles
   - Button and control styles
   - Responsive design

3. **Popup** (`popup/popup-simple.html`, `popup/popup-simple.js`)
   - Quick Guide section (collapsible)
   - Meeting history feature (list, detail, download, delete)
   - Status display and capture controls
   - Download triggers (TXT/SRT)

4. **Manifest** (`manifest.json`)
   - Minimal permissions (storage, activeTab)
   - Content script injection
   - No background service worker needed

## Key Technical Details

### Caption Detection Flow
1. Content script loads on Google Meet pages (`run_at: "document_idle"`)
2. Auto-detection starts 3 seconds after page load
3. MutationObserver watches for caption elements
4. Priority-based selector search:
   - `[role="region"][aria-label*="자막"]` (semantic HTML)
   - `[jsname="dsyhDe"]` (container)
   - `.ygicle.VbkSUe` (text element)
   - Legacy selectors as fallback
5. When found, start capture automatically

### Caption Processing
1. MutationObserver detects text changes
2. Extract text from `.ygicle.VbkSUe` element
3. Filter out UI text using pattern matching
4. Show in "Current:" pending area immediately
5. Debounce for 1.5 seconds
6. If text stabilizes, capture to transcript
7. Extract only new portion if text extends previous

### Deduplication (v3.4.0 - Simplified)
- Uses simple exact-match comparison against last processed text
- No complex similarity matching or progressive text extraction
- Timestamp-based tracking for robust stream-like capture
- Captures full text as-is when it changes (Google Meet shows complete phrases)

### Tab Visibility Handling
- Detects when tab is hidden/visible
- Increases polling to 500ms when hidden (MutationObserver throttling)
- Restores 1000ms polling when visible
- Ensures continuous capture during screen sharing

## Development Commands

```bash
# Install dependencies (for icon generation)
npm install

# Generate extension icons
npm run generate-icons

# Switch between simple and API versions
./switch-to-simple.sh  # Switch to CC capturer
./switch-to-api.sh     # Switch to API version
```

## Testing

1. Load extension in Chrome: `chrome://extensions/` -> Load unpacked
2. Join a Google Meet meeting
3. Enable CC (closed captions) in Google Meet
4. Extension should auto-detect and start capturing
5. Verify captions appear in the overlay panel
6. Check browser console for any errors (should be none)
7. Test download as TXT and SRT

## Common Issues

1. **Captions not detected**: Make sure CC is enabled in Google Meet (CC button)
2. **UI text appearing in captions**: Check UI_TEXT_PATTERNS array for missing patterns
3. **Duplicate captions**: Adjust DEBOUNCE_DELAY if needed
4. **Google Meet UI changes**: Selectors may need updating in findCCElement()
5. **Console errors**: Check for feature_flags error - ensure defensive error handling

## File Structure (Simple CC Capturer)

```
├── manifest.json                    # MV3 manifest (simple version)
├── manifest-api-backup.json         # Backup of API version
├── content/
│   ├── meet-cc-simple.js            # Main CC capturing logic
│   └── meet-cc-simple.css           # Overlay UI styles
├── popup/
│   ├── popup-simple.html            # Simple popup interface
│   └── popup-simple.js              # Popup logic
├── assets/icons/                    # Extension icons
├── scripts/                         # Build scripts
├── switch-to-simple.sh              # Switch to CC capturer
└── switch-to-api.sh                 # Switch to API version
```

## Version History

### v3.4.0 - Timestamp-Based Capture (Major Fix)
**Release Date**: 2024-12-18

**Critical Fixes:**

1. **Caption Save Issue Fixed**
   - FIXED: Captions showing in "Current:" but not being saved
   - FIXED: 30-second timer passing without saving captions
   - Root cause: Complex `isDuplicate()` logic was too aggressive

2. **Simplified Deduplication**
   - REMOVED: Complex `isDuplicate()` function with similarity matching
   - REMOVED: Progressive text extraction logic
   - NEW: Simple exact-match comparison against last processed text
   - NEW: Timestamp-based tracking (`lastCaptureTimestamp`)
   - Result: More robust, predictable caption capture

3. **Progress Bar Direction Reversed**
   - CHANGED: Progress bar now fills from 0% to 100% (left to right)
   - CHANGED: Timer shows elapsed time since last save (0s to 30s)
   - More intuitive visual feedback for users

**Technical Changes:**
- meet-cc-simple.js: Rewrote `captureStableText()` function
- meet-cc-simple.js: Removed `isDuplicate()` and `calculateSimilarity()` functions
- meet-cc-simple.js: Added `lastCaptureTimestamp` tracking
- meet-cc-simple.js: Updated `updateAutoSaveUI()` for reversed progress
- meet-cc-simple.css: Changed progress bar initial width to 0%

**How Capture Works Now (v3.4.0):**
1. MutationObserver detects caption text changes
2. Text displayed in "Current:" area immediately
3. Debounce timer (1.5s) waits for text to stabilize
4. When timer fires, compare text with `lastProcessedText`
5. If different (exact match check only), capture the full text
6. Update `lastProcessedText` and `lastCaptureTimestamp`
7. No complex similarity matching or progressive extraction

---

### v3.2.0 - History & UX Improvements
**Release Date**: 2024-12-17

**New Features:**

1. **Meeting History in Popup**
   - Browse all past meeting recordings
   - View session details (title, date, time, caption count)
   - Preview caption content
   - Download individual sessions as TXT or SRT
   - Delete sessions

2. **Quick Guide Moved to Popup**
   - Removed from overlay for cleaner UI
   - Collapsible guide section in popup
   - Includes keyboard shortcuts reference

3. **Improved Language Toggle**
   - Now shows target language (KO when in English, EN when in Korean)
   - More intuitive for users
   - Tooltip shows full language name

**Technical Changes:**
- popup-simple.html: Added multi-view architecture (main, history list, history detail)
- popup-simple.js: Added history management, session loading, download/delete functions
- meet-cc-simple.js: Removed Quick Guide from overlay, fixed language toggle logic

---

### v3.1.0 - Multilingual & Auto-capture
**Release Date**: 2024-12-17

**New Features:**

1. **Multilingual Support**
   - Full English and Korean UI
   - Language toggle button in overlay header
   - All text elements localized
   - Language preference saved to storage

2. **Copy to Clipboard**
   - One-click copy button
   - Keyboard shortcut: Ctrl+Shift+C
   - Toast notification on success

3. **Persistent Storage**
   - Auto-save captions to chrome.storage.local
   - Session restoration on page reload
   - Debounced saves to prevent excessive writes

4. **Usage Guide Panel**
   - Collapsible guide section in overlay
   - Quick start instructions
   - Keyboard shortcuts reference
   - Guide state saved to storage

5. **Auto-capture Mode**
   - Removed manual Start/Stop buttons
   - Automatic capture when CC detected
   - Simplified user experience

---

### v3.0.0 - Major Rebuild 🎉
**Release Date**: 2024-12-17

**Major New Features:**

1. **Configuration System**
   - CCConfig class for persistent user preferences
   - Chrome storage integration
   - Settings sync across sessions
   - Configurable: debounce delay, auto-start, speaker names, max captions, polling intervals, download format

2. **Toast Notification System**
   - CCNotification class with type-based notifications (success, error, warning, info)
   - Auto-dismiss with smooth animations
   - User-friendly feedback for all actions
   - Replaces intrusive alerts

3. **Memory Management**
   - CaptionBuffer class with circular buffering
   - Automatic archiving of old captions when limit reached
   - Configurable max capacity (500/1000/2000/5000)
   - Prevents memory leaks in long meetings
   - Comprehensive statistics (total, active, archived, words, chars)

4. **Selector Management**
   - SelectorManager class with priority-based search
   - 8 pre-defined selectors with fallback chain
   - Caching of last working selector for performance
   - Validation and reliability improvements
   - Automatic selector switching on failure

5. **Performance Monitoring**
   - PerformanceMonitor class for metrics tracking
   - Capture rate, duplicate rate, error tracking
   - Processing time measurements
   - Session statistics and reporting

6. **Enhanced UI/UX**
   - Settings modal with comprehensive options
   - Help modal with quick start guide and keyboard shortcuts
   - Enhanced statistics display (caption count, word count, duration)
   - Real-time stats updates
   - Status dot with animations
   - Icon buttons for better UX

7. **Download Preview**
   - Preview modal before downloading
   - File statistics (size, count, words, duration)
   - Live format switching (TXT/SRT)
   - Customizable filename
   - Content preview (first 20 lines)
   - Timestamp inclusion toggle for TXT

8. **Keyboard Shortcuts**
   - `Ctrl+Shift+S` - Start/Stop capture
   - `Ctrl+Shift+D` - Open download preview
   - `Ctrl+Shift+H` - Show help modal
   - `Esc` - Close all modals

**Improvements:**
- Comprehensive error handling with try-catch throughout
- User-friendly error messages via notifications
- Config-driven behavior (no more hardcoded values)
- Modular architecture (CCConfig, CCNotification, CaptionBuffer, SelectorManager, PerformanceMonitor)
- Better code organization and maintainability
- CSS variables for consistent theming
- Responsive design improvements
- Accessibility enhancements (focus states, reduced motion support)

**Technical Architecture:**
- Separation of concerns (UI, Logic, Storage, Performance)
- Event-driven architecture
- Modular class-based design
- Configuration management layer
- Performance monitoring layer
- Memory management layer

**Bug Fixes:**
- All previous bugs from v2.x series addressed
- Improved selector reliability
- Better memory handling
- Enhanced error recovery

**Migration Notes:**
- Fully backward compatible with v2.4.0
- No data loss on upgrade
- Settings automatically initialized with v2.4.0 equivalent defaults
- First-time users see help modal on load

**Breaking Changes:**
- None - maintains full compatibility

**Performance:**
- Memory usage controlled (circular buffer)
- Faster caption detection (selector caching)
- Reduced DOM queries (validation before operations)
- Optimized rendering (stats updates throttled)

**User Experience:**
- Much more intuitive interface
- Better visual feedback throughout
- Discoverable features (help modal)
- Configurable to user preferences
- Professional polish and attention to detail

---

### v2.4.0 (Previous) - Real-time Preview & Tab Visibility
**Release Date**: 2024-12-17

**New Features:**
- Real-time pending text preview with "Current:" label
- Pulsing animation for live capture indicator
- Tab visibility handling for screen sharing scenarios
- Adaptive polling (500ms hidden, 1000ms visible)

**Improvements:**
- Immediate visual feedback during debounce period
- Better UX with live caption preview
- Continuous capture when tab is hidden
- Enhanced logging for debugging

**Bug Fixes:**
- Fixed: No visual feedback during caption capture
- Fixed: Captions not visible until "Stop" pressed
- Fixed: Potential capture loss during tab switches

---

### v2.3.0 - Debouncing for Duplicate Prevention
**Release Date**: 2024-12-17

**New Features:**
- Debouncing mechanism (1.5s delay for text stabilization)
- Smart text extraction (only new portions)
- Tracking of last processed text

**Improvements:**
- Eliminated progressive duplicate accumulation
- Better handling of streaming captions
- Cleaner transcript output

**Bug Fixes:**
- Fixed: Duplicate captions accumulating (e.g., "하나 둘" → "하나 둘 셋" → "하나 둘 셋 넷")
- Fixed: Repeated content in downloads

**Technical Details:**
- Added `debounceTimer` with 1.5s delay
- Implemented `captureStableText()` for smart extraction
- Text comparison to detect new portions vs complete text

---

### v2.2.0 - Accurate Selectors from Real HTML
**Release Date**: 2024-12-17

**New Features:**
- Speaker name detection and inclusion
- Priority-based selector search system

**Improvements:**
- Updated selectors based on actual Google Meet HTML:
  - `[role="region"][aria-label*="자막"]` (primary)
  - `[jsname="dsyhDe"]` (container)
  - `.ygicle.VbkSUe` (actual caption text)
- Explicit exclusion of `.IMKgW` (UI buttons area)
- Enhanced debug function with extraction testing

**Bug Fixes:**
- Fixed: Inaccurate caption detection with legacy selectors
- Fixed: UI button text ("arrow_downward", "하단으로 이동") appearing in captions

**Technical Details:**
- Selector priority system for reliability
- Better text extraction from specific elements
- Validation of detected caption elements

---

### v2.1.0 - Console Error Fix & Timing Improvements
**Release Date**: 2024-12-17

**Bug Fixes:**
- Fixed: Console error "Cannot read properties of undefined (reading 'feature_flags')"
- Fixed: Extension interfering with Google Meet initialization

**Improvements:**
- Changed `run_at` from "document_end" to "document_idle"
- Added 3-second initialization delay (MEET_INIT_DELAY)
- Throttled MutationObserver (500ms debounce)
- Limited DOM queries (max 50 elements in position-based detection)
- Comprehensive try-catch blocks for defensive programming

**Technical Details:**
- Less aggressive DOM observation to avoid race conditions
- Scoped queries to `div[jscontroller]:not([role])`
- Graceful error handling with logging

---

### v2.0.0 - Initial CC Capturer Version
**Release Date**: 2024-12-17

**Features:**
- Real-time Google Meet CC caption capture
- No API keys required
- Auto-start capture when CC detected
- UI text filtering (60+ patterns)
- Downloads as TXT or SRT format
- Floating overlay UI with controls
- Debug DOM analysis tool

**Technical Implementation:**
- SimpleCCCapturer class
- MutationObserver for caption detection
- Polling mechanism (1000ms) as backup
- Deduplication with similarity matching
- SRT timestamp formatting

**Selectors:**
- Primary: `div[jscontroller="TEjq6e"]`
- Text: `.iTTPOb`
- Fallback: Position-based detection

---

### v1.x - API-based Transcription (Legacy)
**Status**: Deprecated

**Features:**
- OpenAI Whisper API transcription
- GPT-4 meeting notes generation
- Gmail integration
- Audio capture via tabCapture
- Offscreen document for MediaRecorder

**Deprecated Reason:**
- API reliability issues
- Cost concerns
- Complexity vs benefit
- Google Meet's built-in CC is sufficient

**Migration Path:**
- Switched to v2.0.0 simple CC capturer
- No API calls required
- Simpler, more reliable approach
