# Google Meet Transcriber - Award-Winning Design System

## Design Philosophy

This design system embodies the principles that have earned recognition at Red Dot, A' Design, and iF Design Awards: **purposeful minimalism**, **emotional resonance**, and **functional excellence**. The interface seamlessly integrates with Google Meet while establishing its own identity as a premium productivity tool.

### Core Principles

1. **Invisible Integration** - The extension should feel native to Google Meet, appearing as a natural enhancement rather than a foreign addition
2. **Progressive Disclosure** - Complex functionality revealed only when needed, keeping the default experience simple
3. **Trust Through Transparency** - Clear feedback on recording status, data handling, and API interactions
4. **Accessible Excellence** - WCAG 2.1 AA compliance without compromising aesthetics

---

## 1. Color System

### Primary Palette

The color system harmonizes with Google Meet's blue-green accent while establishing distinct identity through a sophisticated teal-based palette.

```css
:root {
  /* Primary Brand Colors */
  --color-primary-50: #E6F7F7;
  --color-primary-100: #B3E8E8;
  --color-primary-200: #80D9D9;
  --color-primary-300: #4DCACA;
  --color-primary-400: #26BFBF;
  --color-primary-500: #00A896;  /* Primary brand color */
  --color-primary-600: #008F80;
  --color-primary-700: #00766A;
  --color-primary-800: #005D54;
  --color-primary-900: #00443E;

  /* Secondary Accent - Warm coral for CTAs and highlights */
  --color-accent-50: #FFF0ED;
  --color-accent-100: #FFD6CC;
  --color-accent-200: #FFB8A6;
  --color-accent-300: #FF9A80;
  --color-accent-400: #FF8266;
  --color-accent-500: #FF6B4A;  /* Secondary accent */
  --color-accent-600: #E55A3C;
  --color-accent-700: #CC4A2E;
  --color-accent-800: #B33A21;
  --color-accent-900: #992A14;

  /* Neutral Grays - Warm undertone for softer appearance */
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

  /* Semantic Colors */
  --color-success-light: #E8F5E9;
  --color-success: #4CAF50;
  --color-success-dark: #2E7D32;

  --color-warning-light: #FFF8E1;
  --color-warning: #FFC107;
  --color-warning-dark: #F57C00;

  --color-error-light: #FFEBEE;
  --color-error: #EF5350;
  --color-error-dark: #C62828;

  --color-info-light: #E3F2FD;
  --color-info: #2196F3;
  --color-info-dark: #1565C0;

  /* Recording State Colors */
  --color-recording: #EF5350;
  --color-recording-pulse: rgba(239, 83, 80, 0.3);
  --color-processing: #FFC107;
  --color-paused: #A8B5C1;
  --color-stopped: #7A8B99;
}
```

### Dark Mode Palette

```css
[data-theme="dark"] {
  /* Primary - Adjusted for dark backgrounds */
  --color-primary-500: #26D9C4;
  --color-primary-600: #00A896;

  /* Backgrounds */
  --color-bg-primary: #1A1F24;
  --color-bg-secondary: #242B33;
  --color-bg-tertiary: #2D363E;
  --color-bg-elevated: #363F4A;

  /* Text */
  --color-text-primary: #F4F6F8;
  --color-text-secondary: #A8B5C1;
  --color-text-tertiary: #7A8B99;

  /* Borders */
  --color-border-subtle: rgba(255, 255, 255, 0.08);
  --color-border-default: rgba(255, 255, 255, 0.12);
  --color-border-strong: rgba(255, 255, 255, 0.24);
}
```

### Light Mode Palette

```css
[data-theme="light"] {
  /* Backgrounds */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #FAFBFC;
  --color-bg-tertiary: #F4F6F8;
  --color-bg-elevated: #FFFFFF;

  /* Text */
  --color-text-primary: #1A1F24;
  --color-text-secondary: #5C6B78;
  --color-text-tertiary: #7A8B99;

  /* Borders */
  --color-border-subtle: rgba(0, 0, 0, 0.06);
  --color-border-default: rgba(0, 0, 0, 0.10);
  --color-border-strong: rgba(0, 0, 0, 0.20);
}
```

---

## 2. Typography

### Font Stack

```css
:root {
  /* Primary font - Google Sans for consistency with Google Meet */
  --font-family-primary: 'Google Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  /* Monospace for timestamps and technical content */
  --font-family-mono: 'Google Sans Mono', 'Roboto Mono', 'SF Mono', 'Monaco', monospace;
}
```

### Type Scale (Based on 1.25 ratio - Major Third)

```css
:root {
  /* Font Sizes */
  --text-xs: 0.64rem;     /* 10.24px - Micro labels */
  --text-sm: 0.8rem;      /* 12.8px - Captions, timestamps */
  --text-base: 1rem;      /* 16px - Body text */
  --text-lg: 1.25rem;     /* 20px - Subheadings */
  --text-xl: 1.563rem;    /* 25px - Section headers */
  --text-2xl: 1.953rem;   /* 31.25px - Page titles */
  --text-3xl: 2.441rem;   /* 39px - Hero text */

  /* Font Weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;

  /* Letter Spacing */
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
}
```

### Typography Classes

```css
/* Heading Styles */
.text-heading-1 {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text-primary);
}

.text-heading-2 {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text-primary);
}

.text-heading-3 {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-medium);
  line-height: var(--leading-snug);
  color: var(--color-text-primary);
}

/* Body Styles */
.text-body {
  font-size: var(--text-base);
  font-weight: var(--font-weight-regular);
  line-height: var(--leading-normal);
  color: var(--color-text-secondary);
}

.text-body-strong {
  font-size: var(--text-base);
  font-weight: var(--font-weight-medium);
  line-height: var(--leading-normal);
  color: var(--color-text-primary);
}

/* Caption & Labels */
.text-caption {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-regular);
  line-height: var(--leading-normal);
  color: var(--color-text-tertiary);
}

.text-label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

/* Timestamp */
.text-timestamp {
  font-family: var(--font-family-mono);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-regular);
  color: var(--color-text-tertiary);
}
```

---

## 3. Spacing System

### Base Unit: 4px

```css
:root {
  /* Spacing Scale */
  --space-0: 0;
  --space-0-5: 0.125rem;  /* 2px */
  --space-1: 0.25rem;     /* 4px */
  --space-1-5: 0.375rem;  /* 6px */
  --space-2: 0.5rem;      /* 8px */
  --space-2-5: 0.625rem;  /* 10px */
  --space-3: 0.75rem;     /* 12px */
  --space-4: 1rem;        /* 16px */
  --space-5: 1.25rem;     /* 20px */
  --space-6: 1.5rem;      /* 24px */
  --space-8: 2rem;        /* 32px */
  --space-10: 2.5rem;     /* 40px */
  --space-12: 3rem;       /* 48px */
  --space-16: 4rem;       /* 64px */
  --space-20: 5rem;       /* 80px */
  --space-24: 6rem;       /* 96px */
}
```

### Layout Containers

```css
:root {
  /* Container Widths */
  --container-popup: 360px;      /* Popup width */
  --container-panel: 400px;      /* Side panel width */
  --container-modal-sm: 480px;
  --container-modal-md: 600px;
  --container-modal-lg: 800px;

  /* Content Areas */
  --content-padding-x: var(--space-6);
  --content-padding-y: var(--space-5);

  /* Component Spacing */
  --stack-gap-xs: var(--space-2);
  --stack-gap-sm: var(--space-3);
  --stack-gap-md: var(--space-4);
  --stack-gap-lg: var(--space-6);
  --stack-gap-xl: var(--space-8);
}
```

---

## 4. Border Radius & Shadows

### Border Radius

```css
:root {
  --radius-none: 0;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;
}
```

### Box Shadows

```css
:root {
  /* Elevation System */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  /* Focused/Selected State */
  --shadow-focus: 0 0 0 3px var(--color-primary-200);
  --shadow-focus-error: 0 0 0 3px var(--color-error-light);

  /* Inner Shadows */
  --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);

  /* Glow Effects */
  --glow-primary: 0 0 20px rgba(0, 168, 150, 0.3);
  --glow-recording: 0 0 20px rgba(239, 83, 80, 0.4);
}

/* Dark mode shadow adjustments */
[data-theme="dark"] {
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
}
```

---

## 5. Animation & Motion

### Timing Functions

```css
:root {
  /* Easing Curves */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-elastic: cubic-bezier(0.175, 0.885, 0.32, 1.275);

  /* Durations */
  --duration-instant: 0ms;
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 400ms;
  --duration-slowest: 500ms;
}
```

### Standard Transitions

```css
/* Utility transition classes */
.transition-fast {
  transition: all var(--duration-fast) var(--ease-out);
}

.transition-normal {
  transition: all var(--duration-normal) var(--ease-out);
}

.transition-slow {
  transition: all var(--duration-slow) var(--ease-out);
}

/* Specific transitions */
.transition-colors {
  transition: color var(--duration-fast) var(--ease-out),
              background-color var(--duration-fast) var(--ease-out),
              border-color var(--duration-fast) var(--ease-out);
}

.transition-transform {
  transition: transform var(--duration-normal) var(--ease-out);
}

.transition-opacity {
  transition: opacity var(--duration-normal) var(--ease-out);
}

.transition-shadow {
  transition: box-shadow var(--duration-normal) var(--ease-out);
}
```

### Keyframe Animations

```css
/* Pulse animation for recording indicator */
@keyframes pulse-recording {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

/* Breathing animation for processing state */
@keyframes breathe {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}

/* Slide in from right (for panels) */
@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Slide in from bottom (for toasts/notifications) */
@keyframes slide-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Fade in */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Scale in (for modals) */
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Shimmer loading effect */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Typing indicator dots */
@keyframes typing-dot {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-4px);
  }
}

/* Checkmark draw animation */
@keyframes draw-check {
  from {
    stroke-dashoffset: 24;
  }
  to {
    stroke-dashoffset: 0;
  }
}

/* Ripple effect */
@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
```

---

## 6. Component Library

### 6.1 Buttons

```css
/* Base Button */
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
  transition: all var(--duration-fast) var(--ease-out);
  position: relative;
  overflow: hidden;
}

.btn:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Primary Button */
.btn-primary {
  background-color: var(--color-primary-500);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active:not(:disabled) {
  background-color: var(--color-primary-700);
  transform: translateY(0);
}

/* Secondary Button */
.btn-secondary {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border-color: var(--color-border-default);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-bg-tertiary);
  border-color: var(--color-border-strong);
}

/* Ghost Button */
.btn-ghost {
  background-color: transparent;
  color: var(--color-text-secondary);
}

.btn-ghost:hover:not(:disabled) {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

/* Danger Button */
.btn-danger {
  background-color: var(--color-error);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: var(--color-error-dark);
}

/* Icon Button */
.btn-icon {
  padding: var(--space-2);
  border-radius: var(--radius-full);
}

/* Button Sizes */
.btn-sm {
  padding: var(--space-1-5) var(--space-3);
  font-size: var(--text-xs);
}

.btn-lg {
  padding: var(--space-3) var(--space-5);
  font-size: var(--text-base);
}
```

### 6.2 Input Fields

```css
/* Base Input */
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-family-primary);
  font-size: var(--text-base);
  line-height: var(--leading-tight);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-out);
}

.input::placeholder {
  color: var(--color-text-tertiary);
}

.input:hover:not(:disabled) {
  border-color: var(--color-border-strong);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: var(--shadow-focus);
}

.input:disabled {
  background-color: var(--color-bg-tertiary);
  cursor: not-allowed;
}

/* Input with Error */
.input-error {
  border-color: var(--color-error);
}

.input-error:focus {
  box-shadow: var(--shadow-focus-error);
}

/* Input with Icon */
.input-group {
  position: relative;
}

.input-group .input {
  padding-left: var(--space-10);
}

.input-group-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
}

/* Password Input with Toggle */
.input-group .input-password {
  padding-right: var(--space-10);
}

.input-group .toggle-visibility {
  position: absolute;
  right: var(--space-2);
  top: 50%;
  transform: translateY(-50%);
}
```

### 6.3 Cards

```css
/* Base Card */
.card {
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-subtle);
  overflow: hidden;
}

/* Elevated Card */
.card-elevated {
  box-shadow: var(--shadow-md);
  border: none;
}

/* Interactive Card */
.card-interactive {
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
}

.card-interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Card Sections */
.card-header {
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border-subtle);
}

.card-body {
  padding: var(--space-5);
}

.card-footer {
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--color-border-subtle);
  background-color: var(--color-bg-secondary);
}
```

### 6.4 Status Indicators

```css
/* Recording Status Indicator */
.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1-5) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
}

/* Status Dot */
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
}

/* Recording State */
.status-recording {
  background-color: var(--color-error-light);
  color: var(--color-error-dark);
}

.status-recording .status-dot {
  background-color: var(--color-recording);
  animation: pulse-recording 1.5s ease-in-out infinite;
}

/* Processing State */
.status-processing {
  background-color: var(--color-warning-light);
  color: var(--color-warning-dark);
}

.status-processing .status-dot {
  background-color: var(--color-processing);
  animation: breathe 2s ease-in-out infinite;
}

/* Paused State */
.status-paused {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

.status-paused .status-dot {
  background-color: var(--color-paused);
}

/* Connected/Ready State */
.status-ready {
  background-color: var(--color-success-light);
  color: var(--color-success-dark);
}

.status-ready .status-dot {
  background-color: var(--color-success);
}
```

### 6.5 Toast Notifications

```css
/* Toast Container */
.toast-container {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* Toast Base */
.toast {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  background-color: var(--color-bg-elevated);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  min-width: 280px;
  max-width: 400px;
  animation: slide-in-up var(--duration-slow) var(--ease-out);
}

.toast-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.toast-message {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.toast-close {
  flex-shrink: 0;
  padding: var(--space-1);
  color: var(--color-text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-out);
}

.toast-close:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

/* Toast Variants */
.toast-success .toast-icon {
  color: var(--color-success);
}

.toast-error .toast-icon {
  color: var(--color-error);
}

.toast-warning .toast-icon {
  color: var(--color-warning);
}

.toast-info .toast-icon {
  color: var(--color-info);
}
```

### 6.6 Loading States

```css
/* Spinner */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border-default);
  border-top-color: var(--color-primary-500);
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Skeleton Loader */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-tertiary) 0%,
    var(--color-bg-secondary) 50%,
    var(--color-bg-tertiary) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}

.skeleton-text {
  height: 1em;
  margin-bottom: var(--space-2);
}

.skeleton-text:last-child {
  width: 60%;
}

/* Typing Indicator */
.typing-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-lg);
}

.typing-indicator .dot {
  width: 6px;
  height: 6px;
  background-color: var(--color-text-tertiary);
  border-radius: var(--radius-full);
  animation: typing-dot 1.4s ease-in-out infinite;
}

.typing-indicator .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator .dot:nth-child(3) {
  animation-delay: 0.4s;
}
```

---

## 7. Iconography

### Icon System Guidelines

- **Primary icon library**: Material Symbols (Outlined variant for consistency with Google Meet)
- **Icon sizes**: 16px (compact), 20px (default), 24px (large), 32px (hero)
- **Stroke width**: 400 (regular), consistent with Google's style
- **Optical balance**: Icons should be optically centered within their bounding box

### Core Icons Used

| Icon | Usage | Material Symbol Name |
|------|-------|---------------------|
| Microphone | Recording control | `mic` / `mic_off` |
| Play/Pause | Transcription control | `play_arrow` / `pause` |
| Stop | End recording | `stop` |
| Settings | Configuration | `settings` |
| Key | API key input | `key` |
| Visibility | Password toggle | `visibility` / `visibility_off` |
| Check | Success state | `check_circle` |
| Error | Error state | `error` |
| Info | Information | `info` |
| Warning | Warning state | `warning` |
| Copy | Copy to clipboard | `content_copy` |
| Edit | Edit content | `edit` |
| Email | Send email | `mail` |
| Download | Export | `download` |
| Person | Speaker/participant | `person` |
| Notes | Meeting notes | `description` |
| Summary | Summary section | `summarize` |
| Action | Action items | `task_alt` |
| Time | Timestamp | `schedule` |
| Expand/Collapse | Panel control | `expand_more` / `expand_less` |
| Close | Dismiss/close | `close` |

---

## 8. Z-Index Scale

```css
:root {
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
}
```

---

## 9. Responsive Breakpoints

```css
:root {
  /* Chrome extension specific - mostly fixed widths */
  --bp-popup-min: 320px;
  --bp-popup-max: 400px;
  --bp-panel-min: 360px;
  --bp-panel-max: 480px;
}
```

---

## 10. Accessibility Guidelines

### Focus Management

```css
/* Focus visible only for keyboard navigation */
*:focus {
  outline: none;
}

*:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Skip link for keyboard users */
.skip-link {
  position: absolute;
  top: -100%;
  left: var(--space-4);
  z-index: var(--z-max);
  padding: var(--space-2) var(--space-4);
  background-color: var(--color-primary-500);
  color: white;
  border-radius: var(--radius-md);
  transition: top var(--duration-fast) var(--ease-out);
}

.skip-link:focus {
  top: var(--space-4);
}
```

### Color Contrast Requirements

- All text must meet WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text)
- Interactive elements must have 3:1 contrast against adjacent colors
- Focus indicators must have 3:1 contrast

### Screen Reader Support

- All interactive elements must have accessible names
- Status changes must be announced via ARIA live regions
- Icons must have aria-labels or be marked as decorative

---

This design system provides the foundation for all interface components. Each subsequent design document will reference these tokens and patterns.
