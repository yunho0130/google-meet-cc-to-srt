# In-Meeting Transcription Experience Design

## Design Rationale

The in-meeting experience must achieve a delicate balance: **present enough to be useful, invisible enough not to distract**. This interface lives within Google Meet's environment and must complement rather than compete with the video call experience. Drawing from best practices in HUD design, live captioning systems, and productivity overlays, this design prioritizes **progressive disclosure**, **contextual awareness**, and **seamless integration**.

---

## 1. Interface Architecture

### Component Hierarchy

```
Google Meet Window
+-- Extension Floating Widget (FAB-style control hub)
+-- Transcription Panel (collapsible, dockable)
    +-- Header (controls, status)
    +-- Transcript Area (live feed)
    +-- Quick Actions Bar
+-- Status Toast (temporary notifications)
```

### Design Principles for In-Meeting UI

1. **Minimal Footprint** - Default state occupies minimum screen real estate
2. **Non-blocking** - Never obscure critical Meet UI (video, participants, chat)
3. **Glanceable** - Status visible at a glance without reading
4. **Reversible** - All actions can be undone; no anxiety-inducing moments
5. **Context-aware** - Adapts to Meet's light/dark mode automatically

---

## 2. Floating Control Widget (FAB)

The primary control point is a floating action button that provides quick access to transcription controls without opening the full panel.

### Visual States

**Default (Idle/Ready)**
```
    +--------+
    |  [Mic] |  <- Teal icon, subtle pulse
    +--------+
```

**Recording**
```
    +--------+
    |  [Rec] |  <- Red dot, pulsing ring
    |  02:34 |  <- Live timer
    +--------+
```

**Processing**
```
    +--------+
    | [Spin] |  <- Spinner
    +--------+
```

**Paused**
```
    +--------+
    |  [||]  |  <- Pause icon, muted colors
    +--------+
```

### Design Specifications

**Container**
- Size: 56px x 56px (expanded: 56px x 80px with timer)
- Position: Bottom-right, 24px from edges
- Background: `--color-bg-elevated` with `backdrop-filter: blur(10px)`
- Border: 1px `--color-border-subtle`
- Border-radius: `--radius-2xl` (28px)
- Box-shadow: `--shadow-lg`
- Z-index: `--z-overlay`

**Draggable Behavior**
```css
.fab-widget {
  position: fixed;
  cursor: grab;
  user-select: none;
  touch-action: none;
  transition: box-shadow var(--duration-fast) var(--ease-out);
}

.fab-widget:active {
  cursor: grabbing;
}

.fab-widget.dragging {
  box-shadow: var(--shadow-2xl);
  transform: scale(1.05);
}
```

**Icon States**
```css
/* Ready state - subtle breathing animation */
.fab-icon-ready {
  color: var(--color-primary-500);
  animation: breathe 3s ease-in-out infinite;
}

/* Recording state - pulsing red */
.fab-icon-recording {
  color: var(--color-recording);
}

.fab-recording-ring {
  position: absolute;
  inset: -4px;
  border: 2px solid var(--color-recording-pulse);
  border-radius: var(--radius-full);
  animation: pulse-ring 1.5s ease-out infinite;
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

/* Timer display */
.fab-timer {
  font-family: var(--font-family-mono);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  margin-top: var(--space-1);
  text-align: center;
}
```

### Hover Menu (Quick Actions)

On hover, the FAB expands to reveal quick actions:

```
+------------------+
|                  |
|     [Record]     |   <- Primary action
|                  |
+------------------+
|  [Pause] [Stop]  |   <- Secondary actions
+------------------+
|    [Open Panel]  |   <- Expand
+------------------+
```

```css
.fab-menu {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: var(--space-2);
  background: var(--color-bg-elevated);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  padding: var(--space-2);
  opacity: 0;
  visibility: hidden;
  transform: translateY(8px) scale(0.95);
  transition: all var(--duration-normal) var(--ease-out);
}

.fab-widget:hover .fab-menu,
.fab-widget:focus-within .fab-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
}

.fab-menu-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.fab-menu-item:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.fab-menu-item.recording {
  color: var(--color-recording);
}
```

---

## 3. Transcription Panel

### Panel Positions

Users can dock the panel in three positions:

1. **Side Panel (Right)** - Default, most space for transcript
2. **Bottom Panel** - For wide monitors, cinema view
3. **Floating Window** - Detached, freely positionable

### Side Panel Design (Primary)

```
+------------------------------------------+
| Google Meet Video Area                   |
|                                          |
|  +--------------------+                  |
|  |                    |  +-------------+ |
|  |   Active Speaker   |  | Transcriber | |
|  |                    |  |-------------| |
|  +--------------------+  | [Rec] 05:23 | |
|                          |             | |
|  +----+ +----+ +----+    | John:       | |
|  | P1 | | P2 | | P3 |    | "Let me     | |
|  +----+ +----+ +----+    |  share the  | |
|                          |  quarterly  | |
|                          |  results... | |
|                          |             | |
|                          | Sarah:      | |
|                          | "Great, I   | |
|                          |  have some  | |
|                          |  questions" | |
|                          |             | |
|                          |-------------| |
|                          | [Actions]   | |
|                          +-------------+ |
+------------------------------------------+
```

### Panel Header Design

```
+-----------------------------------------------+
|  [<] Transcriber              [Rec] 05:23 [X] |
+-----------------------------------------------+
```

**Specifications**
- Height: 48px
- Background: `--color-bg-secondary`
- Border-bottom: 1px `--color-border-subtle`
- Padding: 0 `--space-3`

**Title Section**
- Collapse button: `.btn-icon`, `.btn-ghost`, 32px
- Title: `--text-sm`, `--font-weight-medium`
- Gap: `--space-2`

**Status Section**
- Recording indicator: `.status-indicator`
- Timer: `--font-family-mono`, `--text-sm`
- Close button: `.btn-icon`, `.btn-ghost`, 32px

### Transcript Area

```css
.transcript-area {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-3);
  scroll-behavior: smooth;
}

/* Auto-scroll lock when user scrolls up */
.transcript-area.scroll-locked {
  scroll-behavior: auto;
}

.transcript-area.scroll-locked::after {
  content: '';
  position: sticky;
  bottom: 0;
  display: block;
  height: 48px;
  background: linear-gradient(transparent, var(--color-bg-primary));
  pointer-events: none;
}
```

### Transcript Entry Design

```
+------------------------------------------+
|  [Avatar] John Smith              00:23  |
|  "Let me share the quarterly results     |
|   for Q4. We've seen a 15% increase..."  |
+------------------------------------------+
```

**Entry Container**
```css
.transcript-entry {
  display: flex;
  flex-direction: column;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-2);
  transition: background var(--duration-fast) var(--ease-out);
}

.transcript-entry:hover {
  background: var(--color-bg-tertiary);
}

/* Currently speaking - subtle highlight */
.transcript-entry.active {
  background: var(--color-primary-50);
  border-left: 3px solid var(--color-primary-500);
}

[data-theme="dark"] .transcript-entry.active {
  background: rgba(0, 168, 150, 0.1);
}
```

**Speaker Header**
```css
.transcript-speaker {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}

.speaker-avatar {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  background: var(--color-primary-100);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary-700);
}

.speaker-name {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.transcript-timestamp {
  margin-left: auto;
  font-family: var(--font-family-mono);
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}
```

**Transcript Text**
```css
.transcript-text {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
}

/* Live typing effect for current transcription */
.transcript-text.live::after {
  content: '';
  display: inline-block;
  width: 2px;
  height: 1em;
  background: var(--color-primary-500);
  margin-left: 2px;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}
```

### Quick Actions Bar

```
+------------------------------------------+
|  [Copy] [Summary] [Mark]        [Scroll] |
+------------------------------------------+
```

```css
.quick-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-top: 1px solid var(--color-border-subtle);
  background: var(--color-bg-secondary);
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1-5) var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.quick-action-btn:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.quick-action-btn .icon {
  width: 14px;
  height: 14px;
}

/* Scroll to bottom button - appears when scroll locked */
.scroll-to-bottom {
  margin-left: auto;
  background: var(--color-primary-100);
  color: var(--color-primary-600);
}

.scroll-to-bottom:hover {
  background: var(--color-primary-200);
}
```

---

## 4. Panel Position Variants

### Bottom Panel

```
+------------------------------------------+
|  Google Meet Video Area                  |
|                                          |
|  +------------------------------------+  |
|  |        Active Speaker              |  |
|  +------------------------------------+  |
|                                          |
+------------------------------------------+
| Transcriber  [Rec] 05:23  |  [v][^][X]  |
|------------------------------------------|
| [John]: "Let me share..."  [Sarah]: "I   |
| have questions about..."                 |
+------------------------------------------+
```

**Specifications**
- Height: 120px (collapsed) / 200px (expanded)
- Full width minus margins
- Horizontal scroll for older entries
- Current speaker highlighted

```css
.panel-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: var(--color-bg-elevated);
  border-top: 1px solid var(--color-border-default);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  z-index: var(--z-overlay);
  transition: height var(--duration-normal) var(--ease-out);
}

.panel-bottom.expanded {
  height: 200px;
}

.panel-bottom .transcript-area {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  overflow-y: hidden;
  padding: var(--space-3);
  gap: var(--space-3);
}

.panel-bottom .transcript-entry {
  flex-shrink: 0;
  width: 280px;
  margin-bottom: 0;
}
```

### Floating Window

```
+------------------------+
| Transcriber   [-][X]   |
|------------------------|
|                        |
| [Transcript entries]   |
|                        |
|------------------------|
| [Actions]              |
+------------------------+
```

**Specifications**
- Default size: 320px x 400px
- Min size: 280px x 300px
- Max size: 480px x 600px
- Resizable from edges and corners
- Draggable from header

```css
.panel-floating {
  position: fixed;
  width: 320px;
  height: 400px;
  min-width: 280px;
  min-height: 300px;
  max-width: 480px;
  max-height: 600px;
  background: var(--color-bg-elevated);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  z-index: var(--z-modal);
  resize: both;
  overflow: hidden;
}

.panel-floating .panel-header {
  cursor: grab;
}

.panel-floating .panel-header:active {
  cursor: grabbing;
}

/* Resize handle indicator */
.panel-floating::after {
  content: '';
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 12px;
  height: 12px;
  background: radial-gradient(circle at 66% 66%, var(--color-text-tertiary) 1.5px, transparent 1.5px);
  background-size: 4px 4px;
  opacity: 0.5;
}
```

---

## 5. Status Indicators & Toasts

### In-Context Status Toast

Temporary notifications that appear above the panel:

```
+--------------------------------+
|  [Check] Recording started     |
+--------------------------------+
```

```css
.status-toast {
  position: absolute;
  top: -48px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--color-bg-elevated);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-lg);
  font-size: var(--text-sm);
  animation: toast-in var(--duration-normal) var(--ease-out);
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.status-toast.exiting {
  animation: toast-out var(--duration-normal) var(--ease-in) forwards;
}

@keyframes toast-out {
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(-8px);
  }
}

/* Toast variants */
.status-toast.recording .toast-icon {
  color: var(--color-recording);
}

.status-toast.success .toast-icon {
  color: var(--color-success);
}

.status-toast.error .toast-icon {
  color: var(--color-error);
}
```

### Recording Indicator (Always Visible)

When recording, a minimal indicator persists in the Meet UI:

```
+------------------+
|  [*] REC  05:23  |
+------------------+
```

```css
.recording-badge {
  position: fixed;
  top: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1-5) var(--space-3);
  background: rgba(239, 83, 80, 0.9);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-full);
  color: white;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  box-shadow: var(--shadow-md);
  z-index: var(--z-overlay);
}

.recording-badge .rec-dot {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: var(--radius-full);
  animation: pulse-recording 1.5s ease-in-out infinite;
}

.recording-badge .rec-timer {
  font-family: var(--font-family-mono);
}
```

---

## 6. Collapsed/Minimized States

### Minimized FAB Only

When user wants maximum screen space:

```css
.panel-minimized {
  display: none;
}

/* FAB shows expanded status */
.fab-widget.panel-minimized {
  /* Shows timer and recording status */
}
```

### Collapsed Panel Header

Panel can collapse to just the header:

```
+------------------------------------------+
|  [>] Transcriber        [Rec] 05:23  [X] |
+------------------------------------------+
```

```css
.panel-collapsed {
  height: 48px;
  overflow: hidden;
}

.panel-collapsed .transcript-area,
.panel-collapsed .quick-actions {
  display: none;
}
```

---

## 7. Keyboard Shortcuts

Display shortcuts on hover/focus:

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Shift + R` | Start/Stop recording |
| `Ctrl/Cmd + Shift + P` | Pause/Resume |
| `Ctrl/Cmd + Shift + T` | Toggle panel |
| `Ctrl/Cmd + Shift + M` | Mark timestamp |
| `Escape` | Minimize panel |

```css
.shortcut-hint {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-left: var(--space-2);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.quick-action-btn:hover .shortcut-hint,
.quick-action-btn:focus .shortcut-hint {
  opacity: 1;
}

.shortcut-key {
  padding: 2px 4px;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border-default);
  border-radius: 3px;
  font-family: var(--font-family-mono);
  font-size: 10px;
  color: var(--color-text-tertiary);
}
```

---

## 8. Google Meet Integration

### Theme Synchronization

Detect and match Meet's theme:

```javascript
// Detect Meet's dark mode
const meetDarkMode = document.body.classList.contains('dark-mode') ||
                     window.matchMedia('(prefers-color-scheme: dark)').matches;

document.documentElement.setAttribute('data-theme', meetDarkMode ? 'dark' : 'light');

// Listen for Meet theme changes
const observer = new MutationObserver(() => {
  // Re-check theme
});
observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
```

### Avoid Overlap Zones

Never position UI over:
- Top bar (meeting controls)
- Bottom bar (call controls, chat, participants)
- Active speaker video

```javascript
const meetUI = {
  topBar: { height: 56 },
  bottomBar: { height: 80 },
  sidePanel: { width: 360 }, // When chat/participants open
};

// Adjust panel position based on Meet UI state
function adjustPanelPosition() {
  const isChatOpen = document.querySelector('[data-panel-id="chat"]');
  const panel = document.querySelector('.transcriber-panel');

  if (isChatOpen) {
    panel.style.right = `${meetUI.sidePanel.width + 16}px`;
  } else {
    panel.style.right = '16px';
  }
}
```

---

## 9. Performance Considerations

### Efficient DOM Updates

```css
/* Use GPU acceleration for animations */
.transcript-entry,
.fab-widget,
.panel-floating {
  will-change: transform;
  transform: translateZ(0);
}

/* Virtualize long transcript lists */
.transcript-area {
  contain: strict;
}

.transcript-entry {
  contain: content;
}
```

### Debounced Scroll Handling

```javascript
// Throttle scroll event handling
let scrollTimeout;
transcriptArea.addEventListener('scroll', () => {
  if (scrollTimeout) return;
  scrollTimeout = setTimeout(() => {
    // Check if user has scrolled up (lock auto-scroll)
    const isAtBottom = transcriptArea.scrollHeight - transcriptArea.scrollTop
                       <= transcriptArea.clientHeight + 50;
    transcriptArea.classList.toggle('scroll-locked', !isAtBottom);
    scrollTimeout = null;
  }, 100);
});
```

---

## 10. Accessibility

### ARIA Roles & Labels

```html
<aside
  class="transcriber-panel"
  role="complementary"
  aria-label="Meeting transcription"
  aria-live="polite"
>
  <header class="panel-header" role="toolbar" aria-label="Transcription controls">
    <button aria-label="Collapse panel" aria-expanded="true">...</button>
    <h2 id="panel-title">Transcriber</h2>
    <div role="status" aria-live="polite">
      <span class="visually-hidden">Recording status:</span>
      <span>Recording 05:23</span>
    </div>
  </header>

  <div
    class="transcript-area"
    role="log"
    aria-label="Live transcript"
    aria-relevant="additions"
  >
    <article class="transcript-entry" aria-label="John Smith at 0:23">
      <header class="transcript-speaker">
        <span class="speaker-name">John Smith</span>
        <time class="transcript-timestamp">00:23</time>
      </header>
      <p class="transcript-text">...</p>
    </article>
  </div>
</aside>
```

### Focus Management

```css
/* Trap focus in floating panel */
.panel-floating {
  /* Use JavaScript focus trap */
}

/* Clear focus ring on close */
.panel-closing *:focus {
  outline: none;
}
```

### Screen Reader Announcements

```javascript
// Announce recording state changes
function announceStatus(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'assertive');
  announcement.className = 'visually-hidden';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => announcement.remove(), 1000);
}

// Usage
announceStatus('Recording started');
announceStatus('Recording paused');
announceStatus('Meeting transcription saved');
```

---

## 11. Animation Timing Summary

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Panel open/close | Slide + fade | 300ms | ease-out |
| FAB menu expand | Scale + fade | 200ms | ease-out |
| Transcript entry appear | Fade | 150ms | ease-out |
| Status toast in | Slide up + fade | 200ms | ease-out |
| Status toast out | Slide up + fade | 200ms | ease-in |
| Recording pulse | Scale + opacity | 1500ms | ease-in-out |
| Live typing cursor | Blink | 1000ms | step-end |
| Scroll to bottom | Smooth scroll | 300ms | ease-out |

---

This in-meeting design prioritizes the user's primary task (the video call) while making transcription effortlessly accessible. The progressive disclosure approach, from minimal FAB to full panel, lets users choose their level of engagement. The careful attention to Google Meet integration ensures the extension feels native rather than intrusive.
