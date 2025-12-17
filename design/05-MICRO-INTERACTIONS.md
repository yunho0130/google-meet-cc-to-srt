# Micro-interactions & Animation Guide

## Design Philosophy

Micro-interactions are the soul of a premium user experience. They provide feedback, guide attention, and create emotional connection. Every animation in this extension serves a **purpose**: to inform, delight, or reassure. Drawing from Apple's Human Interface Guidelines and Google's Material Motion principles, these interactions are crafted to feel **natural**, **responsive**, and **meaningful**.

### Core Animation Principles

1. **Purpose over polish** - Every animation must serve a function
2. **Quick and responsive** - Users should never wait for animations
3. **Natural physics** - Use easing that mimics real-world motion
4. **Consistent language** - Similar actions have similar animations
5. **Reducible** - Respect `prefers-reduced-motion`

---

## 1. Timing & Easing Reference

### Duration Scale

| Token | Value | Use Case |
|-------|-------|----------|
| `--duration-instant` | 0ms | Immediate feedback (e.g., color change on press) |
| `--duration-fast` | 100ms | Micro feedback (hover states, toggles) |
| `--duration-normal` | 200ms | Standard transitions (buttons, cards) |
| `--duration-slow` | 300ms | Larger movements (panels, modals) |
| `--duration-slower` | 400ms | Complex transitions (page changes) |
| `--duration-slowest` | 500ms | Elaborate animations (success celebrations) |

### Easing Curves

```css
/* Standard curves */
--ease-out: cubic-bezier(0, 0, 0.2, 1);      /* Deceleration - entering */
--ease-in: cubic-bezier(0.4, 0, 1, 1);       /* Acceleration - exiting */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1); /* Symmetric - morphing */

/* Expressive curves */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);  /* Playful overshoot */
--ease-elastic: cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Subtle spring */

/* Linear (only for continuous animations like spinners) */
--ease-linear: linear;
```

### Choosing the Right Easing

| Motion Type | Easing | Example |
|-------------|--------|---------|
| Entering | ease-out | Modal appearing, dropdown opening |
| Exiting | ease-in | Modal closing, element disappearing |
| Morphing | ease-in-out | Color transitions, size changes |
| Bouncing | ease-bounce | Success checkmark, playful elements |
| Continuous | linear | Loading spinners, progress bars |

---

## 2. Button Interactions

### Primary Button

```css
.btn-primary {
  transition:
    background-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

/* Hover: Lift and glow */
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 168, 150, 0.3);
}

/* Active: Press down */
.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 168, 150, 0.2);
}

/* Focus: Ring indicator */
.btn-primary:focus-visible {
  box-shadow:
    0 0 0 3px var(--color-bg-primary),
    0 0 0 5px var(--color-primary-300);
}
```

### Ripple Effect (Material-style)

```css
.btn-ripple {
  position: relative;
  overflow: hidden;
}

.btn-ripple::after {
  content: '';
  position: absolute;
  width: 100%;
  padding-top: 100%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0);
  opacity: 1;
  pointer-events: none;
}

.btn-ripple:active::after {
  animation: ripple var(--duration-slow) var(--ease-out);
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
```

### Icon Button Interactions

```css
.btn-icon {
  transition:
    background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

.btn-icon:hover {
  background-color: var(--color-bg-tertiary);
}

.btn-icon:active {
  background-color: var(--color-bg-secondary);
}

/* Icon rotation for expandable actions */
.btn-icon .icon-chevron {
  transition: transform var(--duration-normal) var(--ease-out);
}

.btn-icon[aria-expanded="true"] .icon-chevron {
  transform: rotate(180deg);
}
```

---

## 3. Recording State Animations

### Recording Pulse

The recording indicator is the most important status element. It must be visible and anxiety-reducing (showing the system is working).

```css
/* Recording dot with expanding ring */
.recording-indicator {
  position: relative;
  width: 12px;
  height: 12px;
}

.recording-dot {
  width: 12px;
  height: 12px;
  background: var(--color-recording);
  border-radius: var(--radius-full);
  animation: pulse-dot 1.5s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* Expanding ring */
.recording-ring {
  position: absolute;
  inset: -4px;
  border: 2px solid var(--color-recording);
  border-radius: var(--radius-full);
  animation: pulse-ring 1.5s ease-out infinite;
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}
```

### Processing/Transcribing State

```css
/* Breathing animation for "working" state */
.processing-indicator {
  animation: breathe 2s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% {
    opacity: 0.4;
    transform: scale(0.98);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Dots loading animation */
.processing-dots {
  display: flex;
  gap: 4px;
}

.processing-dots .dot {
  width: 6px;
  height: 6px;
  background: var(--color-primary-500);
  border-radius: var(--radius-full);
  animation: dot-bounce 1.4s ease-in-out infinite;
}

.processing-dots .dot:nth-child(2) {
  animation-delay: 0.16s;
}

.processing-dots .dot:nth-child(3) {
  animation-delay: 0.32s;
}

@keyframes dot-bounce {
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-6px);
  }
}
```

### Paused State

```css
/* Paused - static with subtle indicator */
.paused-indicator {
  opacity: 0.6;
}

.paused-icon {
  animation: gentle-pulse 3s ease-in-out infinite;
}

@keyframes gentle-pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}
```

---

## 4. Transcript Animations

### New Entry Appearance

```css
.transcript-entry {
  animation: entry-appear var(--duration-normal) var(--ease-out);
}

@keyframes entry-appear {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Active speaker highlight */
.transcript-entry.active {
  transition:
    background-color var(--duration-normal) var(--ease-out),
    border-color var(--duration-normal) var(--ease-out);
}
```

### Live Typing Effect

```css
/* Cursor blink for live transcription */
.transcript-text.live::after {
  content: '';
  display: inline-block;
  width: 2px;
  height: 1em;
  background: var(--color-primary-500);
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: cursor-blink 1s step-end infinite;
}

@keyframes cursor-blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

/* Text reveal animation (optional, for dramatic effect) */
.transcript-text.revealing {
  animation: text-reveal 0.5s ease-out forwards;
  background: linear-gradient(
    90deg,
    var(--color-text-secondary) 50%,
    transparent 50%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
}

@keyframes text-reveal {
  from {
    background-position: 100% 0;
  }
  to {
    background-position: 0 0;
  }
}
```

### Scroll Indicator

```css
/* "Scroll to bottom" button animation */
.scroll-indicator {
  animation: bounce-subtle 2s ease-in-out infinite;
}

@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(4px);
  }
}

/* Arrow animation */
.scroll-indicator .icon {
  animation: arrow-down 1.5s ease-in-out infinite;
}

@keyframes arrow-down {
  0%, 100% {
    transform: translateY(0);
    opacity: 1;
  }
  50% {
    transform: translateY(3px);
    opacity: 0.6;
  }
}
```

---

## 5. Panel & Modal Animations

### Side Panel Slide

```css
.side-panel {
  transform: translateX(100%);
  opacity: 0;
  transition:
    transform var(--duration-slow) var(--ease-out),
    opacity var(--duration-normal) var(--ease-out);
}

.side-panel.open {
  transform: translateX(0);
  opacity: 1;
}

/* Staggered content reveal */
.side-panel.open .panel-content > * {
  animation: slide-in-stagger var(--duration-normal) var(--ease-out) backwards;
}

.side-panel.open .panel-content > *:nth-child(1) { animation-delay: 50ms; }
.side-panel.open .panel-content > *:nth-child(2) { animation-delay: 100ms; }
.side-panel.open .panel-content > *:nth-child(3) { animation-delay: 150ms; }

@keyframes slide-in-stagger {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### Modal Scale Animation

```css
.modal-backdrop {
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
}

.modal-backdrop.open {
  opacity: 1;
}

.modal {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
  transition:
    opacity var(--duration-normal) var(--ease-out),
    transform var(--duration-normal) var(--ease-out);
}

.modal.open {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* Exit animation */
.modal.closing {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
  transition:
    opacity var(--duration-fast) var(--ease-in),
    transform var(--duration-fast) var(--ease-in);
}
```

### Floating Widget (FAB) Menu

```css
.fab-menu {
  opacity: 0;
  visibility: hidden;
  transform: translateY(8px) scale(0.95);
  transform-origin: bottom right;
  transition:
    opacity var(--duration-normal) var(--ease-out),
    visibility var(--duration-normal),
    transform var(--duration-normal) var(--ease-out);
}

.fab-widget:hover .fab-menu,
.fab-widget:focus-within .fab-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
}

/* Menu items stagger */
.fab-menu .fab-menu-item {
  opacity: 0;
  transform: translateX(10px);
  transition:
    opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.fab-widget:hover .fab-menu-item,
.fab-widget:focus-within .fab-menu-item {
  opacity: 1;
  transform: translateX(0);
}

.fab-menu-item:nth-child(1) { transition-delay: 0ms; }
.fab-menu-item:nth-child(2) { transition-delay: 30ms; }
.fab-menu-item:nth-child(3) { transition-delay: 60ms; }
```

---

## 6. Form Interactions

### Input Focus Animation

```css
.input {
  transition:
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

.input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

/* Label float animation */
.input-group.floating-label .label {
  position: absolute;
  left: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
  pointer-events: none;
  transition:
    transform var(--duration-normal) var(--ease-out),
    font-size var(--duration-normal) var(--ease-out),
    color var(--duration-normal) var(--ease-out);
}

.input-group.floating-label .input:focus ~ .label,
.input-group.floating-label .input:not(:placeholder-shown) ~ .label {
  transform: translateY(-150%);
  font-size: var(--text-xs);
  color: var(--color-primary-500);
}
```

### Checkbox Animation

```css
.checkbox {
  position: relative;
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
}

.checkbox.checked {
  background: var(--color-primary-500);
  border-color: var(--color-primary-500);
}

/* Checkmark draw animation */
.checkbox .checkmark {
  position: absolute;
  width: 12px;
  height: 12px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.checkbox .checkmark path {
  stroke: white;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  stroke-dasharray: 16;
  stroke-dashoffset: 16;
  transition: stroke-dashoffset var(--duration-normal) var(--ease-out);
}

.checkbox.checked .checkmark path {
  stroke-dashoffset: 0;
}
```

### Toggle Switch

```css
.toggle {
  width: 44px;
  height: 24px;
  background: var(--color-neutral-300);
  border-radius: var(--radius-full);
  position: relative;
  cursor: pointer;
  transition: background var(--duration-normal) var(--ease-out);
}

.toggle.active {
  background: var(--color-primary-500);
}

.toggle::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: var(--radius-full);
  top: 2px;
  left: 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform var(--duration-normal) var(--ease-bounce);
}

.toggle.active::after {
  transform: translateX(20px);
}
```

---

## 7. Success & Error Feedback

### Success Checkmark Animation

```css
.success-animation {
  width: 80px;
  height: 80px;
  background: var(--color-success-light);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: success-pop var(--duration-normal) var(--ease-bounce);
}

@keyframes success-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-checkmark {
  width: 40px;
  height: 40px;
}

.success-checkmark .circle {
  stroke: var(--color-success);
  stroke-width: 2;
  fill: none;
  stroke-dasharray: 157;
  stroke-dashoffset: 157;
  animation: circle-draw var(--duration-slow) var(--ease-out) forwards;
}

.success-checkmark .check {
  stroke: var(--color-success);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  animation: check-draw var(--duration-normal) var(--ease-out) forwards;
  animation-delay: 200ms;
}

@keyframes circle-draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes check-draw {
  to {
    stroke-dashoffset: 0;
  }
}
```

### Error Shake Animation

```css
.error-animation {
  animation: shake var(--duration-slow) var(--ease-out);
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-4px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(4px);
  }
}

/* Error icon pulse */
.error-icon {
  animation: error-pulse var(--duration-slower) ease-in-out;
}

@keyframes error-pulse {
  0%, 100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.1);
  }
  50% {
    transform: scale(1);
  }
  75% {
    transform: scale(1.05);
  }
}
```

### Toast Notifications

```css
.toast {
  animation: toast-in var(--duration-normal) var(--ease-out);
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.toast.exiting {
  animation: toast-out var(--duration-fast) var(--ease-in) forwards;
}

@keyframes toast-out {
  to {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
}

/* Progress bar for auto-dismiss */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: var(--color-primary-500);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  animation: progress-shrink 5s linear forwards;
}

@keyframes progress-shrink {
  from {
    width: 100%;
  }
  to {
    width: 0;
  }
}
```

---

## 8. Loading States

### Skeleton Shimmer

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-tertiary) 0%,
    var(--color-bg-secondary) 50%,
    var(--color-bg-tertiary) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Skeleton variants */
.skeleton-text {
  height: 1em;
  margin-bottom: 0.5em;
}

.skeleton-text:last-child {
  width: 60%;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
}

.skeleton-button {
  width: 100px;
  height: 36px;
  border-radius: var(--radius-md);
}
```

### Spinner

```css
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--color-border-default);
  border-top-color: var(--color-primary-500);
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Size variants */
.spinner-sm {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

.spinner-lg {
  width: 40px;
  height: 40px;
  border-width: 4px;
}
```

### Progress Indicator

```css
.progress-bar {
  width: 100%;
  height: 4px;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary-500);
  border-radius: var(--radius-full);
  transition: width var(--duration-normal) var(--ease-out);
}

/* Indeterminate progress */
.progress-fill.indeterminate {
  width: 30%;
  animation: progress-indeterminate 1.5s ease-in-out infinite;
}

@keyframes progress-indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(400%);
  }
}
```

---

## 9. Drag & Drop

### Draggable Widget

```css
.draggable {
  cursor: grab;
  user-select: none;
  touch-action: none;
  transition: box-shadow var(--duration-fast) var(--ease-out);
}

.draggable:active {
  cursor: grabbing;
}

.draggable.dragging {
  box-shadow: var(--shadow-2xl);
  transform: scale(1.02);
  opacity: 0.9;
  z-index: var(--z-max);
}

/* Drop zones */
.drop-zone {
  border: 2px dashed var(--color-border-default);
  border-radius: var(--radius-lg);
  transition:
    border-color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

.drop-zone.drag-over {
  border-color: var(--color-primary-500);
  background: var(--color-primary-50);
}
```

---

## 10. Reduced Motion

Always respect user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* Keep essential feedback visible */
  .recording-indicator .recording-dot {
    animation: none;
    opacity: 1;
  }

  .recording-indicator .recording-ring {
    display: none;
  }

  /* Use instant state changes instead */
  .btn:hover,
  .btn:active {
    transform: none;
  }
}
```

---

## 11. Implementation Notes

### Performance Best Practices

```css
/* Use GPU-accelerated properties */
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0); /* Force GPU layer */
}

/* Remove will-change after animation */
.animated-element.animation-complete {
  will-change: auto;
}

/* Use contain for isolated animations */
.isolated-animation {
  contain: layout style paint;
}
```

### JavaScript Animation Helpers

```javascript
// Utility for respecting reduced motion
function shouldReduceMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Animate with fallback
function animate(element, keyframes, options) {
  if (shouldReduceMotion()) {
    // Apply final state immediately
    const finalFrame = keyframes[keyframes.length - 1];
    Object.assign(element.style, finalFrame);
    return Promise.resolve();
  }

  return element.animate(keyframes, options).finished;
}

// Staggered animation helper
function staggerChildren(parent, selector, delay = 50) {
  const children = parent.querySelectorAll(selector);
  children.forEach((child, index) => {
    child.style.animationDelay = `${index * delay}ms`;
  });
}
```

---

This micro-interaction guide ensures every animation in the extension serves a purpose while maintaining performance and accessibility. The consistent timing and easing create a cohesive, premium experience that feels responsive and delightful.
