# Email Draft Flow Design

## Design Rationale

The email sharing feature is the bridge between meeting intelligence and team communication. This flow must feel **confident yet cautious** - users should feel in control of what gets shared and with whom. The design draws from best practices in email composition UIs (Gmail, Superhuman) while adding transparency about AI-generated content. Key principles: **preview before send**, **clear recipient management**, and **minimal friction**.

---

## 1. Flow Architecture

### User Journey

```
[Review Screen]
      |
      v
[Click "Share" Button]
      |
      v
[Email Compose Modal]
   - Recipients (pre-filled)
   - Content preview
   - Customization options
      |
      v
[Review Recipients] <-- Edit if needed
      |
      v
[Confirm & Open Gmail]
      |
      v
[Gmail Compose Window]
   (Pre-filled, user can edit)
```

### Design Principles

1. **No surprise sends** - User must explicitly confirm
2. **Transparent content** - What you see is what gets sent
3. **Recipient control** - Easy to add/remove recipients
4. **Customizable** - Choose what sections to include
5. **Platform handoff** - Opens Gmail for final review

---

## 2. Share Button Trigger

### Location in Review Interface

The share button appears in two locations:
1. **Header actions** - Primary location
2. **Floating action button** - On scroll (sticky)

### Visual Design

**Primary Share Button**
```
+---------------------------+
|  [Mail Icon]  Share Email |
+---------------------------+
```

```css
.btn-share-email {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2-5) var(--space-4);
  background: var(--color-primary-500);
  color: white;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.btn-share-email:hover {
  background: var(--color-primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-share-email:active {
  transform: translateY(0);
  background: var(--color-primary-700);
}

.btn-share-email .icon {
  width: 18px;
  height: 18px;
}
```

**Floating Action Button (on scroll)**
```css
.fab-share {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  width: 56px;
  height: 56px;
  background: var(--color-primary-500);
  color: white;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  opacity: 0;
  transform: scale(0.8) translateY(20px);
  transition: all var(--duration-normal) var(--ease-out);
  z-index: var(--z-sticky);
}

.fab-share.visible {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.fab-share:hover {
  background: var(--color-primary-600);
  box-shadow: var(--shadow-xl);
  transform: scale(1.05);
}

.fab-share .icon {
  width: 24px;
  height: 24px;
}

/* Tooltip on hover */
.fab-share::before {
  content: 'Share via Email';
  position: absolute;
  right: 100%;
  margin-right: var(--space-3);
  padding: var(--space-2) var(--space-3);
  background: var(--color-neutral-800);
  color: white;
  font-size: var(--text-sm);
  border-radius: var(--radius-md);
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.fab-share:hover::before {
  opacity: 1;
}
```

---

## 3. Email Compose Modal

### Visual Layout

```
+----------------------------------------------------------+
|  Share Meeting Notes                              [X]     |
+----------------------------------------------------------+
|                                                           |
|  Recipients                                               |
|  +-------------------------------------------------+     |
|  | [JS] John Smith           [x]                    |     |
|  | [SK] Sarah Kim            [x]                    |     |
|  | [MR] Mike Rogers          [x]                    |     |
|  |                                                  |     |
|  | + Add recipient                                  |     |
|  +-------------------------------------------------+     |
|                                                           |
|  Include in Email                                         |
|  +-------------------------------------------------+     |
|  | [x] Meeting summary                              |     |
|  | [x] Action items (5)                             |     |
|  | [x] Key points (4)                               |     |
|  | [ ] Full transcript (45 min)                     |     |
|  +-------------------------------------------------+     |
|                                                           |
|  Email Preview                                            |
|  +-------------------------------------------------+     |
|  | Subject: Q4 Planning Meeting Notes - Dec 17     |     |
|  |-------------------------------------------------|     |
|  |                                                  |     |
|  | Hi team,                                         |     |
|  |                                                  |     |
|  | Here are the notes from our Q4 Planning Meeting  |     |
|  | held on December 17, 2024.                       |     |
|  |                                                  |     |
|  | ## Summary                                       |     |
|  | This 45-minute meeting covered quarterly goals...|     |
|  |                                                  |     |
|  | ## Action Items                                  |     |
|  | - [ ] Review Q4 budget proposal (@John, Dec 20) |     |
|  | - [ ] Send meeting notes to team (@Sarah)       |     |
|  | ...                                              |     |
|  +-------------------------------------------------+     |
|                                                           |
|  +------------------------+  +------------------------+   |
|  |       Cancel           |  |   Open in Gmail  [->]  |   |
|  +------------------------+  +------------------------+   |
|                                                           |
+----------------------------------------------------------+
```

### Modal Container

```css
.email-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal-backdrop);
  animation: fade-in var(--duration-fast) var(--ease-out);
}

.email-modal {
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  background: var(--color-bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  display: flex;
  flex-direction: column;
  animation: scale-in var(--duration-normal) var(--ease-out);
}

.email-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border-subtle);
}

.email-modal-title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.email-modal-close {
  padding: var(--space-2);
  color: var(--color-text-tertiary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.email-modal-close:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.email-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-5);
}

.email-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--color-border-subtle);
  background: var(--color-bg-secondary);
}
```

### Recipients Section

```css
.recipients-section {
  margin-bottom: var(--space-6);
}

.section-label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
}

.recipients-list {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.recipient-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border-subtle);
}

.recipient-item:last-of-type {
  border-bottom: none;
}

.recipient-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--color-primary-100);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary-700);
  flex-shrink: 0;
}

.recipient-info {
  flex: 1;
  min-width: 0;
}

.recipient-name {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recipient-email {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recipient-remove {
  padding: var(--space-1);
  color: var(--color-text-tertiary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  opacity: 0;
  transition: all var(--duration-fast) var(--ease-out);
}

.recipient-item:hover .recipient-remove {
  opacity: 1;
}

.recipient-remove:hover {
  background: var(--color-error-light);
  color: var(--color-error);
}

/* Add recipient row */
.add-recipient {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  color: var(--color-primary-500);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
}

.add-recipient:hover {
  background: var(--color-primary-50);
}

.add-recipient .icon {
  width: 18px;
  height: 18px;
}

.add-recipient span {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
}
```

### Add Recipient Dropdown

```css
.recipient-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: var(--space-1);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
  max-height: 240px;
  overflow-y: auto;
}

.recipient-search {
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-border-subtle);
  position: sticky;
  top: 0;
  background: var(--color-bg-elevated);
}

.recipient-search-input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
}

.recipient-suggestion {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
}

.recipient-suggestion:hover {
  background: var(--color-bg-tertiary);
}

.recipient-suggestion.selected {
  background: var(--color-primary-50);
}

/* Manual email entry */
.recipient-manual {
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--color-border-subtle);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.recipient-manual strong {
  color: var(--color-primary-500);
}
```

### Content Options Section

```css
.content-options-section {
  margin-bottom: var(--space-6);
}

.content-options {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.content-option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border-subtle);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
}

.content-option:last-child {
  border-bottom: none;
}

.content-option:hover {
  background: var(--color-bg-tertiary);
}

.content-option-checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--duration-fast) var(--ease-out);
}

.content-option-checkbox.checked {
  background: var(--color-primary-500);
  border-color: var(--color-primary-500);
}

.content-option-checkbox .check-icon {
  color: white;
  width: 12px;
  height: 12px;
  opacity: 0;
  transform: scale(0);
  transition: all var(--duration-fast) var(--ease-out);
}

.content-option-checkbox.checked .check-icon {
  opacity: 1;
  transform: scale(1);
}

.content-option-label {
  flex: 1;
}

.content-option-name {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}

.content-option-count {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-left: var(--space-1);
}

/* Disabled option (e.g., nothing to include) */
.content-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Email Preview Section

```css
.email-preview-section {
  margin-bottom: var(--space-4);
}

.email-preview {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
  max-height: 300px;
  overflow-y: auto;
}

.email-preview-subject {
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border-subtle);
  font-size: var(--text-sm);
}

.email-preview-subject-label {
  color: var(--color-text-tertiary);
  margin-right: var(--space-2);
}

.email-preview-subject-text {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.email-preview-body {
  padding: var(--space-4);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
}

/* Markdown-like styling in preview */
.email-preview-body h2 {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-top: var(--space-4);
  margin-bottom: var(--space-2);
}

.email-preview-body h2:first-child {
  margin-top: 0;
}

.email-preview-body p {
  margin-bottom: var(--space-3);
}

.email-preview-body ul {
  padding-left: var(--space-5);
  margin-bottom: var(--space-3);
}

.email-preview-body li {
  margin-bottom: var(--space-1);
}

/* AI-generated indicator */
.email-preview-ai-note {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  background: var(--color-primary-50);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  color: var(--color-primary-600);
  margin-bottom: var(--space-3);
}
```

### Footer Actions

```css
.email-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--color-border-subtle);
  background: var(--color-bg-secondary);
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
}

.btn-cancel {
  padding: var(--space-2-5) var(--space-5);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-default);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.btn-cancel:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border-strong);
  color: var(--color-text-primary);
}

.btn-open-gmail {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2-5) var(--space-5);
  background: var(--color-primary-500);
  color: white;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.btn-open-gmail:hover {
  background: var(--color-primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-open-gmail .icon {
  width: 16px;
  height: 16px;
}

/* Loading state */
.btn-open-gmail.loading {
  pointer-events: none;
  opacity: 0.8;
}

.btn-open-gmail.loading .icon {
  animation: spin 1s linear infinite;
}
```

---

## 4. Confirmation Step

Before opening Gmail, show a brief confirmation:

### Visual Design

```
+------------------------------------------+
|                                          |
|         [Gmail Icon]                     |
|                                          |
|    Opening Gmail...                      |
|                                          |
|    A new tab will open with your email   |
|    ready to review and send.             |
|                                          |
|    Sending to 3 recipients               |
|                                          |
+------------------------------------------+
```

```css
.gmail-opening {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-10);
  text-align: center;
}

.gmail-icon {
  width: 64px;
  height: 64px;
  margin-bottom: var(--space-5);
  animation: bounce-in var(--duration-normal) var(--ease-elastic);
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.gmail-opening-title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.gmail-opening-description {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
}

.gmail-opening-recipients {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}
```

---

## 5. Success Toast

After Gmail opens:

```
+------------------------------------------+
|  [Check] Email draft opened in Gmail     |
+------------------------------------------+
```

```css
.success-toast {
  position: fixed;
  bottom: var(--space-6);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  background: var(--color-success);
  color: white;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-lg);
  animation: toast-success var(--duration-normal) var(--ease-out);
}

@keyframes toast-success {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.success-toast .icon {
  width: 20px;
  height: 20px;
}

.success-toast span {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
}
```

---

## 6. Error States

### API Error

```
+------------------------------------------+
|  [Warning] Unable to prepare email       |
+------------------------------------------+
|                                          |
|  There was a problem generating the      |
|  email content. This might be due to     |
|  a network issue.                        |
|                                          |
|  [ Try Again ]  [ Copy Content Instead ] |
|                                          |
+------------------------------------------+
```

### No Recipients

```
+------------------------------------------+
|  [Info] No recipients selected           |
|                                          |
|  Add at least one recipient to continue  |
+------------------------------------------+
```

```css
.email-error {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-error-light);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-4);
}

.email-error .icon {
  width: 20px;
  height: 20px;
  color: var(--color-error);
  flex-shrink: 0;
}

.email-error-content {
  flex: 1;
}

.email-error-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-error-dark);
  margin-bottom: var(--space-1);
}

.email-error-description {
  font-size: var(--text-sm);
  color: var(--color-error-dark);
  opacity: 0.8;
}

.email-error-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

/* Warning variant */
.email-warning {
  background: var(--color-warning-light);
  border-color: var(--color-warning);
}

.email-warning .icon,
.email-warning .email-error-title {
  color: var(--color-warning-dark);
}
```

---

## 7. Gmail Integration Details

### URL Construction

```javascript
// Gmail compose URL with pre-filled fields
function buildGmailURL(recipients, subject, body) {
  const params = new URLSearchParams({
    to: recipients.join(','),
    su: subject,
    body: body,
  });

  return `https://mail.google.com/mail/?view=cm&${params.toString()}`;
}
```

### Email Body Formatting

```javascript
// Convert markdown-like content to plain text for Gmail
function formatEmailBody(content) {
  let body = '';

  // Add greeting
  body += 'Hi team,\n\n';
  body += `Here are the notes from our meeting.\n\n`;

  // Add sections based on user selection
  if (content.includeSummary) {
    body += '## Summary\n';
    body += `${content.summary}\n\n`;
  }

  if (content.includeActionItems && content.actionItems.length) {
    body += '## Action Items\n';
    content.actionItems.forEach(item => {
      const checkbox = item.completed ? '[x]' : '[ ]';
      body += `${checkbox} ${item.text}`;
      if (item.assignee) body += ` (@${item.assignee})`;
      if (item.dueDate) body += ` - Due: ${item.dueDate}`;
      body += '\n';
    });
    body += '\n';
  }

  if (content.includeKeyPoints && content.keyPoints.length) {
    body += '## Key Points\n';
    content.keyPoints.forEach(point => {
      body += `- ${point}\n`;
    });
    body += '\n';
  }

  // Add footer
  body += '---\n';
  body += 'Generated with Google Meet Transcriber\n';

  return body;
}
```

---

## 8. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Escape` | Close modal |
| `Ctrl/Cmd + Enter` | Open in Gmail |
| `Tab` | Navigate between sections |
| `Space` | Toggle checkbox (when focused) |

```css
/* Keyboard navigation indicators */
.recipient-item:focus-within,
.content-option:focus-within {
  outline: 2px solid var(--color-primary-300);
  outline-offset: 2px;
}

/* Focus trap styles */
.email-modal:focus {
  outline: none;
}
```

---

## 9. Animation Sequence

### Modal Open
1. Backdrop fades in (150ms)
2. Modal scales in from 0.95 to 1 (200ms)
3. Content fades in (150ms, staggered)

### Modal Close
1. Modal scales down to 0.95 + fades out (150ms)
2. Backdrop fades out (150ms)

### Gmail Transition
1. Modal content fades out (150ms)
2. "Opening Gmail" state fades in (200ms)
3. Gmail icon bounces in (300ms)
4. Modal closes after 1s delay
5. Success toast appears (200ms)

```css
/* Staggered content animation */
.email-modal-body > * {
  opacity: 0;
  transform: translateY(10px);
  animation: content-in var(--duration-normal) var(--ease-out) forwards;
}

.email-modal-body > *:nth-child(1) { animation-delay: 100ms; }
.email-modal-body > *:nth-child(2) { animation-delay: 150ms; }
.email-modal-body > *:nth-child(3) { animation-delay: 200ms; }

@keyframes content-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Exit animation */
.email-modal.exiting {
  animation: modal-out var(--duration-fast) var(--ease-in) forwards;
}

@keyframes modal-out {
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}
```

---

## 10. Accessibility

### ARIA Attributes

```html
<div
  class="email-modal"
  role="dialog"
  aria-modal="true"
  aria-labelledby="email-modal-title"
>
  <header class="email-modal-header">
    <h2 id="email-modal-title">Share Meeting Notes</h2>
    <button aria-label="Close dialog">...</button>
  </header>

  <div class="email-modal-body">
    <fieldset class="recipients-section">
      <legend class="section-label">Recipients</legend>
      <ul role="list" aria-label="Selected recipients">
        <li>
          <span>John Smith</span>
          <button aria-label="Remove John Smith from recipients">X</button>
        </li>
      </ul>
    </fieldset>

    <fieldset class="content-options-section">
      <legend class="section-label">Include in Email</legend>
      <div role="group" aria-label="Content options">
        <label>
          <input type="checkbox" checked />
          <span>Meeting summary</span>
        </label>
      </div>
    </fieldset>

    <section aria-label="Email preview">
      <h3 class="section-label">Email Preview</h3>
      <div class="email-preview" role="document" aria-readonly="true">
        ...
      </div>
    </section>
  </div>

  <footer class="email-modal-footer">
    <button type="button">Cancel</button>
    <button type="submit">Open in Gmail</button>
  </footer>
</div>
```

### Focus Management

```javascript
// Focus trap within modal
const modal = document.querySelector('.email-modal');
const focusableElements = modal.querySelectorAll(
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
);
const firstFocusable = focusableElements[0];
const lastFocusable = focusableElements[focusableElements.length - 1];

// Focus first element on open
firstFocusable.focus();

// Trap focus
modal.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    if (e.shiftKey && document.activeElement === firstFocusable) {
      e.preventDefault();
      lastFocusable.focus();
    } else if (!e.shiftKey && document.activeElement === lastFocusable) {
      e.preventDefault();
      firstFocusable.focus();
    }
  }
});
```

---

## 11. Responsive Behavior

### Popup View (360px)

```css
@media (max-width: 400px) {
  .email-modal {
    width: 100%;
    height: 100%;
    max-height: 100%;
    border-radius: 0;
  }

  .email-preview {
    max-height: 200px;
  }

  .email-modal-footer {
    flex-direction: column;
  }

  .email-modal-footer button {
    width: 100%;
  }
}
```

---

This email flow design prioritizes user control and confidence. By showing a clear preview, managing recipients explicitly, and handing off to Gmail for final review, users maintain complete control over what gets shared. The smooth animations and clear feedback create a premium experience that inspires trust.
