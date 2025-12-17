# Implementation Guidelines for Developers

## Overview

This document bridges the design specifications with practical implementation. It provides CSS architecture recommendations, HTML structure patterns, component organization strategies, and Chrome extension-specific considerations to help developers build this interface efficiently and maintainably.

---

## 1. Project Structure

### Recommended File Organization

```
src/
+-- styles/
|   +-- base/
|   |   +-- _reset.css           # CSS reset/normalize
|   |   +-- _variables.css       # Design tokens (from DESIGN-SYSTEM.md)
|   |   +-- _typography.css      # Type scale and text utilities
|   |   +-- _animations.css      # Keyframe animations
|   +-- components/
|   |   +-- _buttons.css
|   |   +-- _inputs.css
|   |   +-- _cards.css
|   |   +-- _modals.css
|   |   +-- _toasts.css
|   |   +-- _status-indicators.css
|   +-- layouts/
|   |   +-- _popup.css           # Extension popup layout
|   |   +-- _panel.css           # In-meeting panel layout
|   |   +-- _fullpage.css        # Full-page review layout
|   +-- pages/
|   |   +-- _setup.css           # First-time setup screens
|   |   +-- _meeting.css         # In-meeting UI
|   |   +-- _review.css          # Post-meeting review
|   |   +-- _email.css           # Email compose flow
|   +-- utilities/
|   |   +-- _spacing.css         # Margin/padding utilities
|   |   +-- _display.css         # Flex/grid utilities
|   |   +-- _accessibility.css   # Screen reader, focus utilities
|   +-- main.css                 # Imports all partials
+-- content/
|   +-- meet-content.css         # Injected into Google Meet
+-- popup/
|   +-- popup.css                # Popup-specific overrides
```

### CSS Import Order

```css
/* main.css */

/* 1. Reset and base */
@import 'base/_reset.css';
@import 'base/_variables.css';

/* 2. Typography */
@import 'base/_typography.css';

/* 3. Animations */
@import 'base/_animations.css';

/* 4. Components (alphabetical) */
@import 'components/_buttons.css';
@import 'components/_cards.css';
@import 'components/_inputs.css';
@import 'components/_modals.css';
@import 'components/_status-indicators.css';
@import 'components/_toasts.css';

/* 5. Layouts */
@import 'layouts/_popup.css';
@import 'layouts/_panel.css';
@import 'layouts/_fullpage.css';

/* 6. Pages */
@import 'pages/_setup.css';
@import 'pages/_meeting.css';
@import 'pages/_review.css';
@import 'pages/_email.css';

/* 7. Utilities (last, for override capability) */
@import 'utilities/_spacing.css';
@import 'utilities/_display.css';
@import 'utilities/_accessibility.css';
```

---

## 2. CSS Variables Setup

### Base Variables File

```css
/* base/_variables.css */

:root {
  /* ==========================================
     COLOR SYSTEM
     ========================================== */

  /* Primary Brand */
  --color-primary-50: #E6F7F7;
  --color-primary-100: #B3E8E8;
  --color-primary-200: #80D9D9;
  --color-primary-300: #4DCACA;
  --color-primary-400: #26BFBF;
  --color-primary-500: #00A896;
  --color-primary-600: #008F80;
  --color-primary-700: #00766A;
  --color-primary-800: #005D54;
  --color-primary-900: #00443E;

  /* Accent */
  --color-accent-500: #FF6B4A;

  /* Neutrals */
  --color-neutral-0: #FFFFFF;
  --color-neutral-50: #FAFBFC;
  --color-neutral-100: #F4F6F8;
  --color-neutral-200: #E8ECEF;
  --color-neutral-300: #D1D9E0;
  --color-neutral-400: #A8B5C1;
  --color-neutral-500: #7A8B99;
  --color-neutral-600: #5C6B78;
  --color-neutral-700: #424F5A;
  --color-neutral-800: #2D363E;
  --color-neutral-900: #1A1F24;

  /* Semantic */
  --color-success: #4CAF50;
  --color-success-light: #E8F5E9;
  --color-success-dark: #2E7D32;

  --color-warning: #FFC107;
  --color-warning-light: #FFF8E1;
  --color-warning-dark: #F57C00;

  --color-error: #EF5350;
  --color-error-light: #FFEBEE;
  --color-error-dark: #C62828;

  --color-info: #2196F3;
  --color-info-light: #E3F2FD;
  --color-info-dark: #1565C0;

  /* Recording */
  --color-recording: #EF5350;
  --color-recording-pulse: rgba(239, 83, 80, 0.3);

  /* ==========================================
     SEMANTIC COLOR MAPPINGS
     ========================================== */

  /* Backgrounds */
  --color-bg-primary: var(--color-neutral-0);
  --color-bg-secondary: var(--color-neutral-50);
  --color-bg-tertiary: var(--color-neutral-100);
  --color-bg-elevated: var(--color-neutral-0);

  /* Text */
  --color-text-primary: var(--color-neutral-900);
  --color-text-secondary: var(--color-neutral-600);
  --color-text-tertiary: var(--color-neutral-500);

  /* Borders */
  --color-border-subtle: rgba(0, 0, 0, 0.06);
  --color-border-default: rgba(0, 0, 0, 0.10);
  --color-border-strong: rgba(0, 0, 0, 0.20);

  /* ==========================================
     TYPOGRAPHY
     ========================================== */

  --font-family-primary: 'Google Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-family-mono: 'Google Sans Mono', 'Roboto Mono', 'SF Mono', monospace;

  --text-xs: 0.64rem;
  --text-sm: 0.8rem;
  --text-base: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.563rem;
  --text-2xl: 1.953rem;

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;

  /* ==========================================
     SPACING
     ========================================== */

  --space-0: 0;
  --space-0-5: 0.125rem;
  --space-1: 0.25rem;
  --space-1-5: 0.375rem;
  --space-2: 0.5rem;
  --space-2-5: 0.625rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* ==========================================
     BORDERS & SHADOWS
     ========================================== */

  --radius-none: 0;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;

  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --shadow-focus: 0 0 0 3px var(--color-primary-200);

  /* ==========================================
     ANIMATION
     ========================================== */

  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

  --duration-instant: 0ms;
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 400ms;

  /* ==========================================
     Z-INDEX
     ========================================== */

  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-popover: 600;
  --z-tooltip: 700;
  --z-toast: 800;
  --z-max: 9999;

  /* ==========================================
     CONTAINER SIZES
     ========================================== */

  --container-popup: 360px;
  --container-panel: 400px;
  --container-modal-sm: 480px;
  --container-modal-md: 600px;
}

/* ==========================================
   DARK MODE
   ========================================== */

[data-theme="dark"] {
  --color-primary-500: #26D9C4;
  --color-primary-600: #00A896;

  --color-bg-primary: #1A1F24;
  --color-bg-secondary: #242B33;
  --color-bg-tertiary: #2D363E;
  --color-bg-elevated: #363F4A;

  --color-text-primary: #F4F6F8;
  --color-text-secondary: #A8B5C1;
  --color-text-tertiary: #7A8B99;

  --color-border-subtle: rgba(255, 255, 255, 0.08);
  --color-border-default: rgba(255, 255, 255, 0.12);
  --color-border-strong: rgba(255, 255, 255, 0.24);

  /* Adjusted shadows for dark mode */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
}
```

---

## 3. Component Patterns

### BEM-like Naming Convention

Use a modified BEM approach for maintainability:

```css
/* Block */
.card { }

/* Element */
.card__header { }
.card__body { }
.card__footer { }

/* Modifier */
.card--elevated { }
.card--interactive { }

/* State (use data attributes for JS-controlled states) */
.card[data-state="loading"] { }
.card[data-state="error"] { }
```

### Button Component Example

```css
/* components/_buttons.css */

/* Base button */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2-5) var(--space-4);
  font-family: var(--font-family-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  line-height: var(--leading-tight);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.btn:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}

.btn:disabled,
.btn[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Variants */
.btn--primary {
  background-color: var(--color-primary-500);
  color: white;
}

.btn--primary:hover {
  background-color: var(--color-primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn--primary:active {
  background-color: var(--color-primary-700);
  transform: translateY(0);
}

.btn--secondary {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border-color: var(--color-border-default);
}

.btn--secondary:hover {
  background-color: var(--color-bg-tertiary);
  border-color: var(--color-border-strong);
}

.btn--ghost {
  background-color: transparent;
  color: var(--color-text-secondary);
}

.btn--ghost:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.btn--danger {
  background-color: var(--color-error);
  color: white;
}

.btn--danger:hover {
  background-color: var(--color-error-dark);
}

/* Sizes */
.btn--sm {
  padding: var(--space-1-5) var(--space-3);
  font-size: var(--text-xs);
}

.btn--lg {
  padding: var(--space-3) var(--space-5);
  font-size: var(--text-base);
}

/* Icon button */
.btn--icon {
  padding: var(--space-2);
  border-radius: var(--radius-full);
}

.btn--icon.btn--sm {
  padding: var(--space-1-5);
}

.btn--icon.btn--lg {
  padding: var(--space-3);
}

/* Loading state */
.btn[data-loading="true"] {
  pointer-events: none;
}

.btn[data-loading="true"] .btn__text {
  opacity: 0;
}

.btn[data-loading="true"] .btn__spinner {
  position: absolute;
}

/* Icon within button */
.btn__icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.btn--sm .btn__icon {
  width: 14px;
  height: 14px;
}

.btn--lg .btn__icon {
  width: 20px;
  height: 20px;
}
```

---

## 4. HTML Structure Patterns

### Setup Screen Structure

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=360">
  <link rel="stylesheet" href="styles/main.css">
  <title>Google Meet Transcriber - Setup</title>
</head>
<body>
  <div class="popup-container">
    <!-- Welcome Screen -->
    <main class="welcome" id="welcome-screen">
      <div class="welcome__icon">
        <img src="assets/icons/logo.svg" alt="" width="48" height="48">
      </div>

      <h1 class="welcome__title text-heading-1">
        Google Meet Transcriber
      </h1>

      <p class="welcome__description text-body">
        Transform your meetings into actionable insights with AI-powered transcription.
      </p>

      <ul class="feature-list" role="list">
        <li class="feature-list__item">
          <svg class="feature-list__icon" aria-hidden="true"><!-- icon --></svg>
          <span>Real-time transcription</span>
        </li>
        <li class="feature-list__item">
          <svg class="feature-list__icon" aria-hidden="true"><!-- icon --></svg>
          <span>AI meeting summaries</span>
        </li>
        <li class="feature-list__item">
          <svg class="feature-list__icon" aria-hidden="true"><!-- icon --></svg>
          <span>Action item extraction</span>
        </li>
        <li class="feature-list__item">
          <svg class="feature-list__icon" aria-hidden="true"><!-- icon --></svg>
          <span>One-click email sharing</span>
        </li>
      </ul>

      <button class="btn btn--primary btn--lg welcome__cta" id="get-started-btn">
        Get Started
      </button>

      <p class="welcome__footer text-caption">
        Powered by OpenAI Whisper
      </p>
    </main>

    <!-- API Key Input Screen -->
    <main class="setup" id="setup-screen" hidden>
      <header class="setup__header">
        <button class="btn btn--ghost btn--icon" aria-label="Go back" id="back-btn">
          <svg aria-hidden="true"><!-- arrow-left --></svg>
        </button>
        <h1 class="setup__title text-heading-3">Setup</h1>
        <span class="setup__step text-caption" aria-label="Step 1 of 2">Step 1/2</span>
      </header>

      <div class="setup__content">
        <div class="security-card">
          <svg class="security-card__icon" aria-hidden="true"><!-- shield --></svg>
          <h2 class="security-card__title">Your data stays secure</h2>
          <p class="security-card__description">
            API key stored locally. Never sent to our servers.
          </p>
        </div>

        <form class="api-key-form" id="api-key-form">
          <label for="api-key" class="form-label">OpenAI API Key</label>
          <div class="input-group">
            <svg class="input-group__icon" aria-hidden="true"><!-- key --></svg>
            <input
              type="password"
              id="api-key"
              name="apiKey"
              class="input input--with-icon"
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
              autocomplete="off"
              spellcheck="false"
              aria-describedby="api-key-help api-key-error"
              required
            >
            <button
              type="button"
              class="btn btn--ghost btn--icon input-group__toggle"
              aria-label="Show API key"
              aria-pressed="false"
              id="toggle-visibility"
            >
              <svg class="icon-visible" aria-hidden="true"><!-- eye --></svg>
              <svg class="icon-hidden" aria-hidden="true" hidden><!-- eye-off --></svg>
            </button>
          </div>
          <p id="api-key-help" class="form-help text-caption">
            Enter your OpenAI API key to enable transcription
          </p>
          <p id="api-key-error" class="form-error text-caption" hidden></p>

          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            class="help-link"
          >
            Don't have a key? Get one here
            <svg aria-hidden="true"><!-- external-link --></svg>
          </a>

          <button type="submit" class="btn btn--primary btn--lg" disabled id="continue-btn">
            Continue
          </button>
        </form>
      </div>
    </main>

    <!-- Validation Screen -->
    <main class="validation" id="validation-screen" hidden>
      <div class="validation__content">
        <div class="spinner spinner--lg"></div>
        <p class="validation__title text-body-strong">Validating API key...</p>
        <p class="validation__subtitle text-caption">Connecting to OpenAI</p>
      </div>
    </main>

    <!-- Success Screen -->
    <main class="success" id="success-screen" hidden>
      <div class="success__content">
        <div class="success-animation">
          <svg class="success-checkmark" viewBox="0 0 52 52">
            <circle class="circle" cx="26" cy="26" r="25"/>
            <path class="check" d="M14 27l7 7 16-16"/>
          </svg>
        </div>
        <h1 class="success__title text-heading-2">You're all set!</h1>
        <p class="success__description text-body">
          Your API key has been verified and saved securely.
        </p>
        <button class="btn btn--primary btn--lg" id="start-btn">
          Start Transcribing
        </button>
      </div>
    </main>
  </div>

  <script src="popup/popup.js" type="module"></script>
</body>
</html>
```

### Transcript Entry Structure

```html
<article class="transcript-entry" data-speaker-id="john-smith" data-timestamp="00:02:15">
  <header class="transcript-entry__header">
    <div class="transcript-entry__speaker">
      <span class="avatar avatar--sm" aria-hidden="true">JS</span>
      <span class="transcript-entry__name">John Smith</span>
    </div>
    <time class="transcript-entry__time text-timestamp" datetime="PT2M15S">
      00:02:15
    </time>
  </header>
  <p class="transcript-entry__text">
    Let me share the quarterly results. We've seen a 15% increase in revenue...
  </p>
  <div class="transcript-entry__actions" aria-label="Actions for this transcript">
    <button class="btn btn--ghost btn--icon btn--sm" aria-label="Copy text">
      <svg aria-hidden="true"><!-- copy --></svg>
    </button>
    <button class="btn btn--ghost btn--icon btn--sm" aria-label="Edit text">
      <svg aria-hidden="true"><!-- edit --></svg>
    </button>
  </div>
</article>
```

---

## 5. JavaScript Integration Patterns

### Theme Detection & Sync

```javascript
// utils/theme.js

export function initializeTheme() {
  // Check for stored preference
  const storedTheme = localStorage.getItem('theme');

  // Check system preference
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Apply theme
  const theme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
  setTheme(theme);

  // Listen for system changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
}

export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
}

// For content script: Sync with Google Meet's theme
export function syncWithMeetTheme() {
  const meetDarkMode =
    document.body.classList.contains('dark-mode') ||
    document.querySelector('[data-theme="dark"]');

  setTheme(meetDarkMode ? 'dark' : 'light');

  // Watch for changes
  const observer = new MutationObserver(() => {
    const isDark = document.body.classList.contains('dark-mode');
    setTheme(isDark ? 'dark' : 'light');
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class']
  });

  return observer;
}
```

### Animation Utilities

```javascript
// utils/animations.js

export function shouldReduceMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function animate(element, keyframes, options = {}) {
  if (shouldReduceMotion()) {
    // Apply final state immediately
    const finalFrame = keyframes[keyframes.length - 1];
    Object.assign(element.style, finalFrame);
    return Promise.resolve();
  }

  const animation = element.animate(keyframes, {
    duration: 200,
    easing: 'cubic-bezier(0, 0, 0.2, 1)',
    fill: 'forwards',
    ...options
  });

  return animation.finished;
}

export function fadeIn(element, duration = 200) {
  element.hidden = false;
  return animate(element, [
    { opacity: 0 },
    { opacity: 1 }
  ], { duration });
}

export function fadeOut(element, duration = 200) {
  return animate(element, [
    { opacity: 1 },
    { opacity: 0 }
  ], { duration }).then(() => {
    element.hidden = true;
  });
}

export function slideIn(element, direction = 'right', duration = 300) {
  element.hidden = false;

  const transforms = {
    right: ['translateX(20px)', 'translateX(0)'],
    left: ['translateX(-20px)', 'translateX(0)'],
    up: ['translateY(20px)', 'translateY(0)'],
    down: ['translateY(-20px)', 'translateY(0)'],
  };

  return animate(element, [
    { opacity: 0, transform: transforms[direction][0] },
    { opacity: 1, transform: transforms[direction][1] }
  ], { duration });
}

export function staggerChildren(parent, selector, delay = 50) {
  const children = parent.querySelectorAll(selector);
  children.forEach((child, index) => {
    child.style.setProperty('--stagger-delay', `${index * delay}ms`);
  });
}
```

### Component State Management

```javascript
// components/Button.js

export class Button {
  constructor(element) {
    this.element = element;
    this.originalContent = element.innerHTML;
    this.bindEvents();
  }

  bindEvents() {
    this.element.addEventListener('click', this.handleClick.bind(this));
  }

  handleClick(e) {
    if (this.element.disabled || this.element.dataset.loading === 'true') {
      e.preventDefault();
      return;
    }
  }

  setLoading(isLoading) {
    this.element.dataset.loading = isLoading;

    if (isLoading) {
      this.element.innerHTML = `
        <span class="btn__spinner spinner spinner--sm"></span>
        <span class="btn__text" style="opacity: 0">${this.originalContent}</span>
      `;
    } else {
      this.element.innerHTML = this.originalContent;
    }
  }

  setDisabled(isDisabled) {
    this.element.disabled = isDisabled;
    this.element.setAttribute('aria-disabled', isDisabled);
  }
}

// Usage
const submitBtn = new Button(document.getElementById('submit-btn'));
submitBtn.setLoading(true);
// After async operation
submitBtn.setLoading(false);
```

---

## 6. Chrome Extension Specifics

### Content Script CSS Isolation

```css
/* content/meet-content.css */

/* Scope all styles to prevent leakage */
.gmt-transcriber {
  /* Reset inherited styles */
  all: initial;
  font-family: var(--font-family-primary);

  /* Then apply our styles */
  * {
    box-sizing: border-box;
  }
}

/* Use specific class prefixes */
.gmt-panel { }
.gmt-fab { }
.gmt-transcript { }
.gmt-status { }
```

### Shadow DOM Alternative

For complete isolation, consider Shadow DOM:

```javascript
// content/TranscriberWidget.js

export class TranscriberWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        ${this.getStyles()}
      </style>
      <div class="transcriber-root">
        ${this.getTemplate()}
      </div>
    `;
  }

  getStyles() {
    // Include all necessary CSS here
    return `
      :host {
        all: initial;
        display: block;
        font-family: 'Google Sans', sans-serif;
      }
      /* ... rest of styles */
    `;
  }

  getTemplate() {
    return `
      <div class="panel">
        <!-- ... -->
      </div>
    `;
  }
}

customElements.define('transcriber-widget', TranscriberWidget);
```

### Z-Index Management in Google Meet

```css
/* Ensure our UI appears above Meet's interface */
.gmt-fab {
  z-index: 2147483647; /* Max z-index */
  position: fixed;
}

.gmt-panel {
  z-index: 2147483646;
  position: fixed;
}

.gmt-modal-backdrop {
  z-index: 2147483645;
  position: fixed;
}
```

### Responsive to Meet UI Changes

```javascript
// content/meetUIObserver.js

export function observeMeetUI(callback) {
  // Watch for Meet's side panel (chat, participants)
  const observer = new MutationObserver((mutations) => {
    const sidePanel = document.querySelector('[data-panel-container]');
    const isPanelOpen = sidePanel && sidePanel.children.length > 0;

    callback({
      sidePanelOpen: isPanelOpen,
      sidePanelWidth: isPanelOpen ? sidePanel.offsetWidth : 0
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  return observer;
}

// Usage in content script
observeMeetUI(({ sidePanelOpen, sidePanelWidth }) => {
  const ourPanel = document.querySelector('.gmt-panel');
  if (ourPanel) {
    ourPanel.style.right = sidePanelOpen
      ? `${sidePanelWidth + 16}px`
      : '16px';
  }
});
```

---

## 7. Accessibility Implementation

### Focus Management

```javascript
// utils/focus.js

export function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  function handleKeydown(e) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }

  element.addEventListener('keydown', handleKeydown);

  // Focus first element
  firstFocusable?.focus();

  // Return cleanup function
  return () => element.removeEventListener('keydown', handleKeydown);
}

export function announceToScreenReader(message, priority = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => announcement.remove(), 1000);
}
```

### ARIA Patterns

```html
<!-- Live Region for Status Updates -->
<div
  class="sr-only"
  role="status"
  aria-live="polite"
  aria-atomic="true"
  id="status-announcer"
></div>

<!-- Modal Dialog -->
<div
  class="modal"
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Share Meeting Notes</h2>
  <p id="modal-description">Send meeting notes to participants via email.</p>
  <!-- content -->
</div>

<!-- Expandable Section -->
<button
  class="btn"
  aria-expanded="false"
  aria-controls="section-content"
>
  View Details
</button>
<div id="section-content" hidden>
  <!-- expandable content -->
</div>
```

---

## 8. Performance Checklist

### CSS Performance

- [ ] Use `transform` and `opacity` for animations (GPU-accelerated)
- [ ] Avoid animating `width`, `height`, `margin`, `padding`
- [ ] Use `will-change` sparingly and remove after animation
- [ ] Minimize reflows by batching DOM reads/writes
- [ ] Use `contain` property for isolated components

### JavaScript Performance

- [ ] Debounce scroll and resize event handlers
- [ ] Use `requestAnimationFrame` for visual updates
- [ ] Lazy load non-critical components
- [ ] Use passive event listeners where appropriate
- [ ] Clean up observers and listeners on unmount

### Chrome Extension Performance

- [ ] Minimize content script bundle size
- [ ] Use `chrome.storage.local` for frequently accessed data
- [ ] Batch `chrome.storage` operations
- [ ] Use `chrome.alarms` instead of `setInterval` in service worker
- [ ] Implement proper service worker lifecycle handling

---

## 9. Testing Considerations

### Visual Regression Testing

```javascript
// Use tools like Percy, Chromatic, or BackstopJS

// Example component states to capture:
const buttonStates = [
  'default',
  'hover',
  'focus',
  'active',
  'disabled',
  'loading'
];

const inputStates = [
  'default',
  'focus',
  'filled',
  'error',
  'disabled'
];
```

### Accessibility Testing

```javascript
// Use axe-core for automated accessibility testing

import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('setup screen should be accessible', async () => {
  const html = renderSetupScreen();
  const results = await axe(html);
  expect(results).toHaveNoViolations();
});
```

---

This implementation guide provides the bridge between design vision and code reality. By following these patterns and best practices, developers can build a maintainable, performant, and accessible extension that faithfully implements the award-winning design system.
