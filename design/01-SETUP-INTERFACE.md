# First-Time Setup & Settings Interface Design

## Design Rationale

The setup experience is the critical first impression. Users must feel **confident** that their API credentials are handled securely, while the onboarding flow communicates the **value proposition** clearly. This design draws inspiration from premium SaaS onboarding experiences that have earned design recognition.

---

## 1. Setup Flow Architecture

### User Journey States

```
[No API Key] --> [Setup Welcome] --> [API Key Input] --> [Validation] --> [Success] --> [Ready State]
                                           |
                                           v
                                   [Validation Error] --> [Error Recovery]
```

### Flow Principles

1. **Single-task focus**: One action per screen
2. **Progress indication**: Users know where they are in the flow
3. **Trust building**: Security messaging integrated naturally
4. **Graceful error handling**: Clear paths to recovery

---

## 2. Welcome Screen (First Launch)

### Visual Layout

```
+------------------------------------------+
|                                          |
|     [Extension Icon - 48px]              |
|                                          |
|     Google Meet Transcriber              |
|     ~~~~~~~~~~~~~~~~~~~~~~~~             |
|                                          |
|     Transform your meetings into         |
|     actionable insights with AI-powered  |
|     transcription and smart summaries.   |
|                                          |
|     +----------------------------------+ |
|     |  [Icon] Real-time transcription  | |
|     +----------------------------------+ |
|     |  [Icon] AI meeting summaries     | |
|     +----------------------------------+ |
|     |  [Icon] Action item extraction   | |
|     +----------------------------------+ |
|     |  [Icon] One-click email sharing  | |
|     +----------------------------------+ |
|                                          |
|     [    Get Started    ] <-- Primary    |
|                                          |
|     Powered by OpenAI Whisper            |
|                                          |
+------------------------------------------+
```

### Design Specifications

**Container**
- Width: 360px (popup width)
- Background: `--color-bg-primary`
- Padding: `--space-6` all sides
- Border-radius: 0 (fills popup)

**Extension Icon**
- Size: 48px x 48px
- Centered horizontally
- Margin-bottom: `--space-4`
- Custom icon: Teal gradient with microphone and document motif

**Title**
- Font: `--text-2xl`
- Weight: `--font-weight-semibold`
- Color: `--color-text-primary`
- Margin-bottom: `--space-2`

**Subtitle/Description**
- Font: `--text-base`
- Weight: `--font-weight-regular`
- Color: `--color-text-secondary`
- Line-height: `--leading-relaxed`
- Max-width: 280px
- Text-align: center
- Margin-bottom: `--space-6`

**Feature List**
- Gap between items: `--space-3`
- Each item:
  - Background: `--color-bg-secondary`
  - Padding: `--space-3` vertical, `--space-4` horizontal
  - Border-radius: `--radius-md`
  - Icon: 20px, `--color-primary-500`
  - Text: `--text-sm`, `--color-text-primary`

**Primary CTA Button**
- Width: 100%
- Style: `.btn-primary`
- Size: `.btn-lg`
- Margin-top: `--space-6`

**Footer Text**
- Font: `--text-xs`
- Color: `--color-text-tertiary`
- Margin-top: `--space-4`
- Text-align: center

### Animation

```css
/* Entrance animation - elements stagger in */
.welcome-container {
  animation: fade-in var(--duration-slow) var(--ease-out);
}

.welcome-icon {
  animation: scale-in var(--duration-normal) var(--ease-elastic);
  animation-delay: 100ms;
}

.welcome-title,
.welcome-description {
  animation: slide-in-up var(--duration-normal) var(--ease-out);
  animation-delay: 200ms;
}

.feature-list-item {
  animation: slide-in-up var(--duration-normal) var(--ease-out);
}

.feature-list-item:nth-child(1) { animation-delay: 300ms; }
.feature-list-item:nth-child(2) { animation-delay: 350ms; }
.feature-list-item:nth-child(3) { animation-delay: 400ms; }
.feature-list-item:nth-child(4) { animation-delay: 450ms; }

.welcome-cta {
  animation: slide-in-up var(--duration-normal) var(--ease-out);
  animation-delay: 550ms;
}
```

---

## 3. API Key Input Screen

### Visual Layout

```
+------------------------------------------+
|                                          |
|  [<-] Setup                     Step 1/2 |
|  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|
|                                          |
|     +----------------------------------+ |
|     |        [Shield Icon]             | |
|     |                                  | |
|     |  Your data stays secure          | |
|     |  API key stored locally.         | |
|     |  Never sent to our servers.      | |
|     +----------------------------------+ |
|                                          |
|  OpenAI API Key                          |
|  +------------------------------------+  |
|  | [Key Icon]  sk-...                 |  |
|  |                        [Eye Icon]  |  |
|  +------------------------------------+  |
|  Enter your OpenAI API key to enable     |
|  transcription                           |
|                                          |
|  [Don't have a key? Get one here ->]     |
|                                          |
|  +------------------------------------+  |
|  |          Continue                  |  |
|  +------------------------------------+  |
|                                          |
+------------------------------------------+
```

### Design Specifications

**Header**
- Back button: Icon only, `.btn-ghost`, `.btn-icon`
- Title: `--text-lg`, `--font-weight-medium`
- Step indicator: `--text-sm`, `--color-text-tertiary`
- Height: 56px
- Border-bottom: 1px `--color-border-subtle`

**Security Card**
- Background: Linear gradient from `--color-primary-50` to transparent
- Border: 1px `--color-primary-200`
- Border-radius: `--radius-lg`
- Padding: `--space-4`
- Icon: Shield outline, 32px, `--color-primary-500`
- Title: `--text-base`, `--font-weight-medium`, `--color-primary-700`
- Description: `--text-sm`, `--color-primary-600`
- Margin-bottom: `--space-6`

**Input Label**
- Font: `--text-sm`
- Weight: `--font-weight-medium`
- Color: `--color-text-primary`
- Margin-bottom: `--space-2`

**API Key Input Field**
- Style: `.input` with `.input-group` wrapper
- Type: password (with toggle)
- Left icon: Key icon, `--color-text-tertiary`
- Right icon: Visibility toggle button
- Placeholder: "sk-xxxxxxxxxxxxxxxxxxxxxxxx"
- Autocomplete: off
- Spellcheck: false

**Helper Text**
- Font: `--text-sm`
- Color: `--color-text-tertiary`
- Margin-top: `--space-2`

**Help Link**
- Font: `--text-sm`
- Color: `--color-primary-500`
- Text-decoration: none
- Display: flex with arrow icon
- Margin-top: `--space-4`
- Hover: underline, `--color-primary-600`

**Continue Button**
- Width: 100%
- Style: `.btn-primary`
- Size: `.btn-lg`
- Margin-top: `--space-6`
- Disabled state until valid input detected

### Input States

**Default**
```css
.api-key-input {
  border-color: var(--color-border-default);
}
```

**Focused**
```css
.api-key-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: var(--shadow-focus);
}
```

**Valid (has content starting with "sk-")**
```css
.api-key-input.valid {
  border-color: var(--color-success);
}

.api-key-input.valid + .input-validation-icon {
  color: var(--color-success);
  opacity: 1;
}
```

**Error**
```css
.api-key-input.error {
  border-color: var(--color-error);
  background-color: var(--color-error-light);
}
```

### Password Visibility Toggle

```css
.toggle-visibility {
  padding: var(--space-2);
  color: var(--color-text-tertiary);
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-out);
}

.toggle-visibility:hover {
  color: var(--color-text-primary);
  background-color: var(--color-bg-tertiary);
}

/* Icon transition */
.toggle-visibility .icon {
  transition: transform var(--duration-fast) var(--ease-out);
}

.toggle-visibility.visible .icon {
  transform: scale(1.1);
}
```

---

## 4. Validation Screen (Processing)

### Visual Layout

```
+------------------------------------------+
|                                          |
|                                          |
|                                          |
|          +------------------+            |
|          |                  |            |
|          |   [Spinner]      |            |
|          |                  |            |
|          +------------------+            |
|                                          |
|          Validating API key...           |
|                                          |
|          Connecting to OpenAI            |
|                                          |
|                                          |
|                                          |
+------------------------------------------+
```

### Design Specifications

**Container**
- Full popup height
- Display: flex
- Flex-direction: column
- Align-items: center
- Justify-content: center
- Background: `--color-bg-primary`

**Spinner Container**
- Width: 64px
- Height: 64px
- Display: flex
- Align-items: center
- Justify-content: center
- Background: `--color-bg-secondary`
- Border-radius: `--radius-xl`
- Margin-bottom: `--space-5`

**Spinner**
- Size: 32px
- Border: 3px
- Color: `--color-primary-500`

**Primary Text**
- Font: `--text-lg`
- Weight: `--font-weight-medium`
- Color: `--color-text-primary`
- Margin-bottom: `--space-2`

**Secondary Text**
- Font: `--text-sm`
- Color: `--color-text-tertiary`
- Animation: `breathe 2s ease-in-out infinite`

---

## 5. Success Screen

### Visual Layout

```
+------------------------------------------+
|                                          |
|                                          |
|          +------------------+            |
|          |                  |            |
|          |   [Checkmark]    |            |
|          |   Animated       |            |
|          +------------------+            |
|                                          |
|          You're all set!                 |
|                                          |
|          Your API key has been           |
|          verified and saved securely.    |
|                                          |
|          +----------------------------+  |
|          |      Start Transcribing    |  |
|          +----------------------------+  |
|                                          |
+------------------------------------------+
```

### Design Specifications

**Checkmark Container**
- Width: 80px
- Height: 80px
- Background: `--color-success-light`
- Border-radius: `--radius-full`
- Display: flex
- Align-items: center
- Justify-content: center
- Margin-bottom: `--space-5`

**Animated Checkmark**
```css
.success-checkmark {
  width: 40px;
  height: 40px;
}

.success-checkmark .circle {
  stroke: var(--color-success);
  stroke-width: 2;
  fill: none;
  animation: scale-in var(--duration-normal) var(--ease-out);
}

.success-checkmark .check {
  stroke: var(--color-success);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  animation: draw-check var(--duration-slow) var(--ease-out) forwards;
  animation-delay: 200ms;
}
```

**Title**
- Font: `--text-xl`
- Weight: `--font-weight-semibold`
- Color: `--color-text-primary`
- Margin-bottom: `--space-2`
- Animation: `slide-in-up var(--duration-normal) var(--ease-out)`
- Animation-delay: 300ms

**Description**
- Font: `--text-base`
- Color: `--color-text-secondary`
- Text-align: center
- Max-width: 260px
- Animation: `slide-in-up var(--duration-normal) var(--ease-out)`
- Animation-delay: 400ms

**CTA Button**
- Width: 100%
- Style: `.btn-primary`
- Size: `.btn-lg`
- Margin-top: `--space-8`
- Animation: `slide-in-up var(--duration-normal) var(--ease-out)`
- Animation-delay: 500ms

---

## 6. Error Screen

### Visual Layout

```
+------------------------------------------+
|                                          |
|                                          |
|          +------------------+            |
|          |                  |            |
|          |   [Error Icon]   |            |
|          |                  |            |
|          +------------------+            |
|                                          |
|          Unable to verify key            |
|                                          |
|          +----------------------------+  |
|          | The API key you entered     | |
|          | could not be validated.     | |
|          | Please check that:          | |
|          |                             | |
|          | * Key starts with "sk-"     | |
|          | * Key hasn't expired        | |
|          | * Account has API access    | |
|          +----------------------------+  |
|                                          |
|          [      Try Again      ]         |
|          [  Check OpenAI Status  ]       |
|                                          |
+------------------------------------------+
```

### Design Specifications

**Error Icon Container**
- Width: 64px
- Height: 64px
- Background: `--color-error-light`
- Border-radius: `--radius-full`
- Display: flex
- Align-items: center
- Justify-content: center

**Error Icon**
- Size: 32px
- Color: `--color-error`
- Animation: `shake 0.5s ease-in-out`

```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}
```

**Error Title**
- Font: `--text-lg`
- Weight: `--font-weight-semibold`
- Color: `--color-error-dark`
- Margin-top: `--space-4`
- Margin-bottom: `--space-4`

**Error Details Card**
- Background: `--color-bg-secondary`
- Border: 1px `--color-border-default`
- Border-radius: `--radius-lg`
- Padding: `--space-4`
- Font: `--text-sm`
- Color: `--color-text-secondary`

**Checklist Items**
- List-style: none
- Each item has checkmark or bullet
- Color: `--color-text-secondary`
- Gap: `--space-2`

**Primary Button (Try Again)**
- Width: 100%
- Style: `.btn-primary`
- Margin-top: `--space-6`

**Secondary Button (Check Status)**
- Width: 100%
- Style: `.btn-ghost`
- Margin-top: `--space-2`

---

## 7. Settings Panel (Post-Setup)

### Visual Layout

```
+------------------------------------------+
|  Settings                       [X]      |
|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|
|                                          |
|  API Configuration                       |
|  +------------------------------------+  |
|  |  OpenAI API Key                    |  |
|  |  sk-****************************   |  |
|  |                      [Edit] [Test] |  |
|  +------------------------------------+  |
|                                          |
|  Recording Preferences                   |
|  +------------------------------------+  |
|  |  Audio Quality          [v] High   |  |
|  +------------------------------------+  |
|  |  Auto-start recording    [Toggle]  |  |
|  +------------------------------------+  |
|  |  Show notifications      [Toggle]  |  |
|  +------------------------------------+  |
|                                          |
|  Summary Generation                      |
|  +------------------------------------+  |
|  |  Summary style           [v] Detailed|
|  +------------------------------------+  |
|  |  Include action items    [Toggle]  |  |
|  +------------------------------------+  |
|  |  Include timestamps      [Toggle]  |  |
|  +------------------------------------+  |
|                                          |
|  Data & Privacy                          |
|  +------------------------------------+  |
|  |  [Clear all transcriptions]        |  |
|  |  [Export my data]                  |  |
|  +------------------------------------+  |
|                                          |
|  Version 1.0.0                           |
|                                          |
+------------------------------------------+
```

### Design Specifications

**Header**
- Height: 56px
- Padding: 0 `--space-4`
- Border-bottom: 1px `--color-border-subtle`
- Display: flex
- Justify-content: space-between
- Align-items: center
- Title: `--text-lg`, `--font-weight-semibold`
- Close button: `.btn-icon`, `.btn-ghost`

**Section Title**
- Font: `--text-xs`
- Weight: `--font-weight-medium`
- Color: `--color-text-tertiary`
- Text-transform: uppercase
- Letter-spacing: `--tracking-wider`
- Padding: `--space-4` horizontal
- Margin-top: `--space-5`
- Margin-bottom: `--space-2`

**Settings Card**
- Background: `--color-bg-primary`
- Border: 1px `--color-border-subtle`
- Border-radius: `--radius-lg`
- Margin: 0 `--space-4`
- Overflow: hidden

**Settings Row**
- Padding: `--space-4`
- Display: flex
- Justify-content: space-between
- Align-items: center
- Border-bottom: 1px `--color-border-subtle` (except last)

**API Key Display**
```css
.api-key-masked {
  font-family: var(--font-family-mono);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  background: var(--color-bg-tertiary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}
```

**Toggle Switch**
```css
.toggle {
  width: 44px;
  height: 24px;
  background: var(--color-neutral-300);
  border-radius: var(--radius-full);
  position: relative;
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
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
  box-shadow: var(--shadow-sm);
  transition: transform var(--duration-fast) var(--ease-out);
}

.toggle.active::after {
  transform: translateX(20px);
}
```

**Select Dropdown**
```css
.select {
  appearance: none;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-8) var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  cursor: pointer;
  background-image: url('chevron-down.svg');
  background-repeat: no-repeat;
  background-position: right var(--space-2) center;
  background-size: 16px;
}

.select:focus {
  border-color: var(--color-primary-500);
  box-shadow: var(--shadow-focus);
}
```

**Danger Zone (Data & Privacy)**
- Border-color: `--color-error-light`
- Clear button: `.btn-ghost` with red text on hover

**Version Footer**
- Padding: `--space-4`
- Font: `--text-xs`
- Color: `--color-text-tertiary`
- Text-align: center

---

## 8. Responsive Behavior

Since this is a Chrome extension popup, dimensions are constrained:

- **Min width**: 320px
- **Max width**: 400px
- **Max height**: 600px (Chrome's limit)

Content should scroll smoothly when exceeding viewport:

```css
.popup-container {
  max-height: 600px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--color-neutral-300) transparent;
}

.popup-container::-webkit-scrollbar {
  width: 6px;
}

.popup-container::-webkit-scrollbar-track {
  background: transparent;
}

.popup-container::-webkit-scrollbar-thumb {
  background: var(--color-neutral-300);
  border-radius: var(--radius-full);
}
```

---

## 9. Dark Mode Adaptations

All screens automatically adapt using CSS custom properties. Key adjustments:

- Security card gradient uses `--color-primary-900` to `transparent`
- Input backgrounds use `--color-bg-secondary`
- Cards use `--color-bg-tertiary` borders
- Success/error backgrounds use darker variants

---

## 10. Accessibility Checklist

- [ ] All form inputs have associated labels
- [ ] Error messages linked via aria-describedby
- [ ] Password visibility toggle announces state change
- [ ] Progress steps announced to screen readers
- [ ] Loading states have aria-busy="true"
- [ ] Success/error screens have appropriate role="alert"
- [ ] Tab order follows visual flow
- [ ] All interactive elements have visible focus states
- [ ] Color contrast meets WCAG AA standards
- [ ] Touch targets are minimum 44x44px

---

## 11. HTML Structure Reference

```html
<!-- Welcome Screen -->
<div class="popup-container">
  <main class="welcome-screen" role="main">
    <img src="icon.svg" alt="" class="welcome-icon" />
    <h1 class="text-heading-1 welcome-title">Google Meet Transcriber</h1>
    <p class="text-body welcome-description">
      Transform your meetings into actionable insights...
    </p>

    <ul class="feature-list" role="list">
      <li class="feature-list-item">
        <svg class="feature-icon" aria-hidden="true">...</svg>
        <span>Real-time transcription</span>
      </li>
      <!-- More items -->
    </ul>

    <button class="btn btn-primary btn-lg welcome-cta">
      Get Started
    </button>

    <p class="text-caption welcome-footer">
      Powered by OpenAI Whisper
    </p>
  </main>
</div>

<!-- API Key Input Screen -->
<div class="popup-container">
  <header class="setup-header">
    <button class="btn btn-ghost btn-icon" aria-label="Go back">
      <svg>...</svg>
    </button>
    <h1 class="text-heading-3">Setup</h1>
    <span class="text-caption step-indicator" aria-label="Step 1 of 2">
      Step 1/2
    </span>
  </header>

  <main class="setup-content">
    <div class="security-card" role="note">
      <svg class="security-icon" aria-hidden="true">...</svg>
      <h2>Your data stays secure</h2>
      <p>API key stored locally. Never sent to our servers.</p>
    </div>

    <form class="api-key-form" id="api-key-form">
      <label for="api-key" class="input-label">OpenAI API Key</label>
      <div class="input-group">
        <svg class="input-group-icon" aria-hidden="true">...</svg>
        <input
          type="password"
          id="api-key"
          name="apiKey"
          class="input input-password"
          placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
          autocomplete="off"
          spellcheck="false"
          aria-describedby="api-key-help api-key-error"
        />
        <button
          type="button"
          class="toggle-visibility"
          aria-label="Show password"
          aria-pressed="false"
        >
          <svg>...</svg>
        </button>
      </div>
      <p id="api-key-help" class="text-caption input-help">
        Enter your OpenAI API key to enable transcription
      </p>
      <p id="api-key-error" class="text-caption input-error" hidden>
        <!-- Error message injected here -->
      </p>

      <a href="https://platform.openai.com/api-keys"
         target="_blank"
         rel="noopener noreferrer"
         class="help-link">
        Don't have a key? Get one here
        <svg aria-hidden="true">...</svg>
      </a>

      <button type="submit" class="btn btn-primary btn-lg" disabled>
        Continue
      </button>
    </form>
  </main>
</div>
```

---

This design creates a premium, trustworthy first impression that sets the tone for the entire extension experience. The careful attention to security messaging, progressive disclosure, and delightful micro-interactions elevates this beyond a typical utility extension to an award-worthy experience.
