# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Version Management

**IMPORTANT: After completing any task, update the version by 0.0.1 increment**

When you make changes to the codebase:
1. Update `manifest.json` version field (e.g., 3.8.1 → 3.8.2)
2. Update `README.md` version badge and version history
3. Update `CLAUDE.md` current version and version history summary

**Version increment rule:** Always bump by 0.0.1 for any code changes, bug fixes, or feature additions.

## Project Overview

**Google Meet CC Capturer** is a Chrome extension (Manifest V3) that captures Google Meet's built-in closed captions without requiring any API calls.

### Current Version: 3.8.4

**Key Features:**
- **Real-time caption capture** from Google Meet closed captions
- **No API keys** or external services required
- **Auto-start capture** when CC is detected
- **Multi-speaker support** - Tracks speaker changes
- **Meeting history** - Browse, view, download, and delete past recordings
- **Multilingual UI** (English/Korean) with smart language toggle
- **Memory management** for long meetings (circular buffer)
- **Persistent storage** - Sessions saved across page reloads

## Architecture

### Core Philosophy (v3.6.0+): Immediate Capture Pattern

The extension uses an **IMMEDIATE CAPTURE** pattern to prevent data loss:

1. **No volatile chunks** - Each stable caption is saved directly to the buffer
2. **Simple deduplication** - Exact-match comparison against last captured text
3. **Prefix matching** - If new text extends the last caption, update in-place (v3.6.1)
4. **Manual save** - Saves to chrome.storage only when stop button is clicked

### Class Structure

The main file `content/meet-cc-simple.js` contains these key classes:

| Class | Responsibility |
|-------|----------------|
| **SimpleCCCapturer** | Main orchestration - DOM observation, caption detection, UI updates |
| **CCConfig** | Configuration management with Chrome storage sync |
| **CCNotification** | Toast notification system for user feedback |
| **CaptionBuffer** | Circular buffer for memory management (prevents leaks) |
| **SelectorManager** | Priority-based caption element detection with fallback chain |
| **PerformanceMonitor** | Metrics tracking (capture rate, duplicates, processing time) |
| **PersistentStorage** | Manual save to chrome.storage.local, session management |

### Caption Detection Flow

```
1. Content script loads (document_idle)
2. 3-second initialization delay
3. MutationObserver watches for caption elements
4. Priority-based selector search:
   - [role="region"][aria-label*="자막"] (semantic HTML)
   - [jsname="dsyhDe"] (container)
   - .ygicle.VbkSUe (text element)
   - Legacy selectors as fallback
5. When found: auto-start capture
```

### Caption Processing Pipeline (v3.6.1)

```
MutationObserver detects change
    ↓
Extract text from .ygicle.VbkSUe element
    ↓
Filter UI text (UI_TEXT_PATTERNS)
    ↓
Show in "Current:" pending area
    ↓
Debounce timer (default 1.5s)
    ↓
When stabilized:
    ├─ Is it exact duplicate of lastCapturedText? → SKIP
    ├─ Does it extend last caption (prefix match)? → UPDATE in-place
    └─ Is it new caption? → ADD to buffer
    ↓
Update overlay UI + statistics
```

## Development Commands

```bash
# Install dependencies (for icon generation)
npm install

# Generate extension icons
npm run generate-icons

# Lint code
npm run lint

# Create release package
zip -r google-meet-cc-capturer-v3.8.4.zip \
  manifest.json \
  content/ \
  popup/ \
  assets/ \
  -x "*.DS_Store" "*.git*"
```

## Testing

1. Load extension: `chrome://extensions/` → Enable Developer mode → Load unpacked
2. Join Google Meet meeting
3. Enable CC (closed captions) in Google Meet
4. Extension should auto-detect and start capturing
5. Verify captions appear in overlay panel
6. Check console for errors (should be none)
7. Test download as TXT and SRT

## Common Issues

| Issue | Solution |
|-------|----------|
| Captions not detected | Make sure CC is enabled in Google Meet (CC button) |
| UI text appearing in captions | Add pattern to `UI_TEXT_PATTERNS` array |
| Duplicate captions | Check deduplication logic in `captureStableText()` |
| Google Meet UI changes | Update selectors in `SelectorManager.SELECTORS` |
| feature_flags console error | Harmless Google Meet internal error, handled by defensive code |

## Key Technical Patterns

### Prefix Matching (v3.6.1)

Google Meet streams captions progressively: "Hello" → "Hello world" → "Hello world!"

The extension uses prefix matching to avoid redundant partial captions:

```javascript
// In captureStableText():
const lastEntry = this.captionBuffer.getLast(1)[0];
if (lastEntry && normalizedText.startsWith(lastEntry.text)) {
  // Text extends previous caption - UPDATE in-place
  this.captionBuffer.updateLast(entry);
} else if (normalizedText === this.lastCapturedText) {
  // Exact duplicate - SKIP
  return;
} else {
  // New caption - ADD
  this.captionBuffer.add(entry);
}
```

### Tab Visibility Handling

When tab is hidden (e.g., during screen sharing), MutationObserver throttles. The extension compensates with adaptive polling:

```javascript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    this.pollingIntervalMs = config.get('pollingIntervalHidden'); // 500ms
  } else {
    this.pollingIntervalMs = config.get('pollingInterval'); // 1000ms
  }
});
```

### Memory Management

`CaptionBuffer` uses circular buffering with overflow callback:

```javascript
// When maxSize reached, buffer is cleared and archived via callback
if (this.captions.length > this.maxSize) {
  const snapshot = this.captions.slice();
  this.clear();
  if (this.onOverflow) this.onOverflow(snapshot);
}
```

## File Structure

```
├── manifest.json                    # MV3 manifest
├── content/
│   ├── meet-cc-simple.js            # Main capturing logic (all classes)
│   └── meet-cc-simple.css           # Overlay UI styles
├── popup/
│   ├── popup-simple.html            # Popup interface
│   └── popup-simple.js              # Popup logic (history, download)
├── assets/icons/                    # Extension icons (16, 32, 48, 128px)
└── scripts/generate-icons.js        # Icon generation utility
```

## Version History Summary

### v3.8.4 - Empty Placeholder Fix (2025-12-26)
- Added empty 00:00:00 placeholder on capture start
- Enables copy/txt/srt buttons to work immediately after capture starts
- Empty entries filtered out in all export functions (no duplicate prevention affected)

### v3.8.3 - Improved User Guidance (2025-12-26)
- Clarified "No captions" message with step-by-step workflow
- Better explanation: Enable CC → Capture → Stop to save

### v3.8.2 - Stop/Start Cycle Fix & UI Improvements (2025-12-26)
- Fixed stop/start/stop/start cycle bug by properly cleaning up ccDetectionObserver
- Improved "No captions" message to guide users to stop capturing first
- Better user guidance for copy/download workflow

### v3.8.1 - Stop→Copy→Resume Fix (2025-12-26)
- Fixed copy/txt/srt buttons to properly stop, save, and resume capture
- Removed popup txt/srt buttons, auto-sized popup to eliminate scroll

### v3.8.0 - Smart Copy & Testing Improvements (2025-12-26)
- Copy button now stops, copies, and resumes capture automatically
- Max captions: minimum 5, maximum 50000, 5-step increments for testing

### v3.7.0 - Remove Auto-Save (2025-12-26)
- Removed auto-save functionality due to issues
- Captions are now only saved when stop button is clicked
- Simplified storage model (manual save only)

### v3.6.1 - Subtitle Accumulation Fix (2025-12-26)
- Implemented prefix matching for growing captions
- In-place UI updates for cleaner live view

### v3.6.0 - Immediate Capture Pattern (2024-12-24)
- Switched from "30-second chunk" to immediate capture
- Eliminated data loss from volatile `currentChunkText` overwrite bug
- Removed `flushChunkToBuffer()` and `getNewChunkText()` methods

### v3.5.6 - Multi-Speaker Support (2024-12-18)
- Track speaker changes within intervals
- Accumulate text when speaker changes

### v3.0.0 - Major Rebuild (2024-12-17)
- Configuration system (CCConfig)
- Toast notifications (CCNotification)
- Memory management (CaptionBuffer)
- Performance monitoring (PerformanceMonitor)
- Download preview, keyboard shortcuts, help modal
