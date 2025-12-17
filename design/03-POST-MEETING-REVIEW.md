# Post-Meeting Review Interface Design

## Design Rationale

The post-meeting review is where raw transcription transforms into **actionable intelligence**. This interface must support both quick scanning and deep editing, serving users who need a fast summary and those who want to refine every detail. Drawing inspiration from award-winning document editors (Notion, Craft) and meeting intelligence tools (Otter.ai, Fireflies), this design emphasizes **structured content**, **visual hierarchy**, and **effortless navigation**.

---

## 1. Interface Architecture

### Layout Structure

```
+------------------------------------------------------------------+
|  Header: Meeting Info & Actions                                   |
+------------------------------------------------------------------+
|          |                                                        |
| Sidebar  |  Main Content Area                                     |
| (Nav)    |  (Scrollable)                                          |
|          |                                                        |
|  Summary |  +--------------------------------------------------+ |
|  --------+  |  Section Content                                  | |
|  Action  |  |                                                    | |
|  Items   |  |                                                    | |
|  --------+  |                                                    | |
|  Key     |  |                                                    | |
|  Points  |  |                                                    | |
|  --------+  |                                                    | |
|  Full    |  |                                                    | |
|  Trans.  |  +--------------------------------------------------+ |
|          |                                                        |
+------------------------------------------------------------------+
```

### Information Hierarchy

1. **Meeting Context** - Title, date, participants (always visible)
2. **AI Summary** - Quick overview, expandable
3. **Structured Notes** - Action items, key points, decisions
4. **Full Transcript** - Complete record with timestamps

---

## 2. Meeting Header

### Visual Design

```
+------------------------------------------------------------------+
|                                                                    |
|  [Back]   Q4 Planning Meeting                         [Share v]   |
|           Dec 17, 2024 - 45 min                       [Export v]  |
|                                                                    |
|  +--+ +--+ +--+ +2                                                 |
|  |JS| |SK| |MR|     John, Sarah, Mike + 2 others                  |
|  +--+ +--+ +--+                                                    |
|                                                                    |
+------------------------------------------------------------------+
```

### Specifications

**Container**
- Height: auto (content-based, typically 100-120px)
- Background: `--color-bg-primary`
- Border-bottom: 1px `--color-border-subtle`
- Padding: `--space-5` `--space-6`

**Back Button**
- Style: `.btn-ghost`
- Icon: Arrow left + "Back to meetings"
- Position: Top left

**Meeting Title**
```css
.meeting-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

/* Editable title */
.meeting-title[contenteditable="true"] {
  outline: none;
  border-radius: var(--radius-sm);
  padding: var(--space-1) var(--space-2);
  margin: calc(var(--space-1) * -1) calc(var(--space-2) * -1);
  transition: background var(--duration-fast) var(--ease-out);
}

.meeting-title[contenteditable="true"]:hover {
  background: var(--color-bg-tertiary);
}

.meeting-title[contenteditable="true"]:focus {
  background: var(--color-bg-secondary);
  box-shadow: inset 0 0 0 2px var(--color-primary-300);
}
```

**Meeting Metadata**
```css
.meeting-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}

.meeting-meta .separator {
  width: 4px;
  height: 4px;
  background: var(--color-text-tertiary);
  border-radius: var(--radius-full);
}
```

**Participants Avatars**
```css
.participants-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-3);
}

.avatar-stack {
  display: flex;
}

.avatar-stack .avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  border: 2px solid var(--color-bg-primary);
  margin-left: -8px;
  background: var(--color-primary-100);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary-700);
}

.avatar-stack .avatar:first-child {
  margin-left: 0;
}

.avatar-stack .avatar-overflow {
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

.participants-names {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}
```

**Action Buttons**
```css
.header-actions {
  display: flex;
  gap: var(--space-2);
  position: absolute;
  top: var(--space-5);
  right: var(--space-6);
}

/* Share dropdown trigger */
.btn-share {
  /* Uses .btn-primary */
}

/* Export dropdown trigger */
.btn-export {
  /* Uses .btn-secondary */
}
```

---

## 3. Navigation Sidebar

### Visual Design

```
+------------------+
|  Navigation      |
|                  |
|  [*] Summary     |
|      ~~~~~~~~    |
|  [ ] Action      |
|      Items (5)   |
|  [ ] Key Points  |
|  [ ] Decisions   |
|  [ ] Transcript  |
|                  |
|  ----------------+
|                  |
|  Search          |
|  [Q____________] |
|                  |
+------------------+
```

### Specifications

**Container**
- Width: 240px (collapsible to 56px)
- Background: `--color-bg-secondary`
- Border-right: 1px `--color-border-subtle`
- Position: sticky
- Top: 0
- Height: calc(100vh - header height)

**Nav Title**
```css
.nav-title {
  padding: var(--space-4) var(--space-4) var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
}
```

**Nav Items**
```css
.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2-5) var(--space-4);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  position: relative;
}

.nav-item:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.nav-item.active {
  color: var(--color-primary-600);
  background: var(--color-primary-50);
}

[data-theme="dark"] .nav-item.active {
  background: rgba(0, 168, 150, 0.15);
  color: var(--color-primary-400);
}

/* Active indicator bar */
.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 3px;
  background: var(--color-primary-500);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.nav-item-icon {
  width: 18px;
  height: 18px;
  opacity: 0.7;
}

.nav-item.active .nav-item-icon {
  opacity: 1;
}

.nav-item-badge {
  margin-left: auto;
  padding: 2px 8px;
  background: var(--color-bg-primary);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}
```

**Search Box**
```css
.nav-search {
  padding: var(--space-4);
  border-top: 1px solid var(--color-border-subtle);
  margin-top: auto;
}

.nav-search-input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  padding-left: var(--space-8);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
}

.nav-search-icon {
  position: absolute;
  left: var(--space-2-5);
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--color-text-tertiary);
}
```

**Collapsed State**
```css
.sidebar.collapsed {
  width: 56px;
}

.sidebar.collapsed .nav-title,
.sidebar.collapsed .nav-item span,
.sidebar.collapsed .nav-item-badge,
.sidebar.collapsed .nav-search {
  display: none;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: var(--space-3);
}

.sidebar.collapsed .nav-item-icon {
  width: 20px;
  height: 20px;
}
```

---

## 4. AI Summary Section

### Visual Design

```
+------------------------------------------------------------------+
|  AI Summary                                         [Regenerate]  |
+------------------------------------------------------------------+
|                                                                    |
|  This 45-minute Q4 planning meeting covered quarterly goals,       |
|  budget allocation, and team assignments. Key outcomes include     |
|  approved marketing budget increase of 15% and new product         |
|  launch timeline set for March 2025.                               |
|                                                                    |
|  +------------------------+  +------------------------+            |
|  | Positive Sentiment     |  | Topics Discussed       |            |
|  | ~~~~~~~~~~~~~~~~~~ 72% |  | - Budget Planning      |            |
|  +------------------------+  | - Product Launch       |            |
|                              | - Team Structure       |            |
|                              +------------------------+            |
|                                                                    |
+------------------------------------------------------------------+
```

### Specifications

**Section Container**
```css
.section {
  background: var(--color-bg-primary);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-subtle);
  margin-bottom: var(--space-6);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border-subtle);
  background: var(--color-bg-secondary);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.section-title-icon {
  width: 20px;
  height: 20px;
  color: var(--color-primary-500);
}

.section-body {
  padding: var(--space-5);
}
```

**Summary Text**
```css
.summary-text {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-5);
}

/* AI-generated content indicator */
.ai-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  background: linear-gradient(135deg, var(--color-primary-100), var(--color-accent-100));
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  color: var(--color-primary-700);
  margin-bottom: var(--space-3);
}

.ai-badge .sparkle-icon {
  width: 12px;
  height: 12px;
}
```

**Insight Cards**
```css
.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
}

.insight-card {
  padding: var(--space-4);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
}

.insight-card-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

/* Sentiment meter */
.sentiment-meter {
  height: 8px;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-top: var(--space-2);
}

.sentiment-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-success), var(--color-primary-500));
  border-radius: var(--radius-full);
  transition: width var(--duration-slow) var(--ease-out);
}

.sentiment-value {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-success);
  margin-top: var(--space-2);
}

/* Topics list */
.topics-list {
  list-style: none;
}

.topics-list li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) 0;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.topics-list li::before {
  content: '';
  width: 6px;
  height: 6px;
  background: var(--color-primary-500);
  border-radius: var(--radius-full);
}
```

**Regenerate Button**
```css
.btn-regenerate {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-out);
}

.btn-regenerate:hover {
  color: var(--color-primary-500);
}

.btn-regenerate .icon {
  width: 16px;
  height: 16px;
  transition: transform var(--duration-normal) var(--ease-out);
}

.btn-regenerate:hover .icon {
  transform: rotate(180deg);
}
```

---

## 5. Action Items Section

### Visual Design

```
+------------------------------------------------------------------+
|  Action Items                                        [+ Add]  5   |
+------------------------------------------------------------------+
|                                                                    |
|  [ ] Review Q4 budget proposal                    @John  Dec 20   |
|      High priority                                                 |
|                                                                    |
|  [x] Send meeting notes to team                   @Sarah Dec 17   |
|      ~~~~~~~~~~~~~~~~~~~~~~~~~~                                   |
|                                                                    |
|  [ ] Schedule follow-up with marketing            @Mike  Dec 22   |
|                                                                    |
+------------------------------------------------------------------+
```

### Specifications

**Action Item Row**
```css
.action-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border-subtle);
  transition: background var(--duration-fast) var(--ease-out);
}

.action-item:last-child {
  border-bottom: none;
}

.action-item:hover {
  background: var(--color-bg-secondary);
}

.action-item.completed {
  opacity: 0.6;
}
```

**Checkbox**
```css
.action-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-fast) var(--ease-out);
  flex-shrink: 0;
  margin-top: 2px;
}

.action-checkbox:hover {
  border-color: var(--color-primary-500);
  background: var(--color-primary-50);
}

.action-checkbox.checked {
  background: var(--color-primary-500);
  border-color: var(--color-primary-500);
}

.action-checkbox.checked .check-icon {
  color: white;
  width: 14px;
  height: 14px;
  animation: check-appear var(--duration-fast) var(--ease-out);
}

@keyframes check-appear {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}
```

**Action Content**
```css
.action-content {
  flex: 1;
  min-width: 0;
}

.action-text {
  font-size: var(--text-base);
  color: var(--color-text-primary);
  line-height: var(--leading-snug);
}

.action-item.completed .action-text {
  text-decoration: line-through;
  color: var(--color-text-tertiary);
}

/* Inline editing */
.action-text[contenteditable="true"] {
  outline: none;
  border-radius: var(--radius-sm);
  padding: var(--space-1);
  margin: calc(var(--space-1) * -1);
}

.action-text[contenteditable="true"]:focus {
  background: var(--color-bg-tertiary);
  box-shadow: inset 0 0 0 2px var(--color-primary-300);
}
```

**Action Metadata**
```css
.action-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-2);
  flex-wrap: wrap;
}

.action-assignee {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.action-assignee .avatar {
  width: 20px;
  height: 20px;
}

.action-due-date {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}

.action-due-date.overdue {
  color: var(--color-error);
}

.action-due-date .icon {
  width: 14px;
  height: 14px;
}

.action-priority {
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
}

.action-priority.high {
  background: var(--color-error-light);
  color: var(--color-error-dark);
}

.action-priority.medium {
  background: var(--color-warning-light);
  color: var(--color-warning-dark);
}

.action-priority.low {
  background: var(--color-bg-tertiary);
  color: var(--color-text-tertiary);
}
```

**Add Action Button**
```css
.add-action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  color: var(--color-text-tertiary);
  cursor: pointer;
  border-top: 1px dashed var(--color-border-default);
  transition: all var(--duration-fast) var(--ease-out);
}

.add-action-btn:hover {
  background: var(--color-bg-secondary);
  color: var(--color-primary-500);
}

.add-action-btn .icon {
  width: 18px;
  height: 18px;
}
```

---

## 6. Key Points Section

### Visual Design

```
+------------------------------------------------------------------+
|  Key Points                                              [Edit]   |
+------------------------------------------------------------------+
|                                                                    |
|  * Q4 revenue exceeded targets by 12%, driven by enterprise       |
|    sales growth in APAC region                                     |
|                                                                    |
|  * Marketing budget approved for 15% increase in Q1 2025          |
|                                                                    |
|  * New product launch timeline confirmed for March 2025            |
|                                                                    |
|  * Team restructuring proposal approved - 3 new hires planned     |
|                                                                    |
+------------------------------------------------------------------+
```

### Specifications

**Key Point Item**
```css
.key-point {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3) 0;
}

.key-point:first-child {
  padding-top: 0;
}

.key-point-bullet {
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  background: var(--color-primary-500);
  border-radius: var(--radius-full);
  margin-top: 8px;
}

.key-point-text {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
}

/* Editable key points */
.key-points-editor {
  list-style: none;
}

.key-point-text[contenteditable="true"] {
  outline: none;
  border-radius: var(--radius-sm);
  padding: var(--space-2);
  margin: calc(var(--space-2) * -1);
}

.key-point-text[contenteditable="true"]:focus {
  background: var(--color-bg-tertiary);
}
```

---

## 7. Full Transcript Section

### Visual Design

```
+------------------------------------------------------------------+
|  Full Transcript                   [Search] [Jump to time] [Copy] |
+------------------------------------------------------------------+
|                                                                    |
|  00:00:00                                                          |
|  +--------------------------------------------------------------+ |
|  | [JS] John Smith                                               | |
|  | Good morning everyone. Let's get started with our Q4          | |
|  | planning meeting. I want to cover three main topics today...  | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  00:02:15                                                          |
|  +--------------------------------------------------------------+ |
|  | [SK] Sarah Kim                                                | |
|  | Thanks John. Before we dive in, I wanted to share some        | |
|  | preliminary numbers from last quarter that might inform...    | |
|  +--------------------------------------------------------------+ |
|                                                                    |
+------------------------------------------------------------------+
```

### Specifications

**Transcript Controls**
```css
.transcript-controls {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.transcript-search {
  position: relative;
}

.transcript-search-input {
  width: 200px;
  padding: var(--space-2) var(--space-3);
  padding-left: var(--space-8);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  transition: all var(--duration-fast) var(--ease-out);
}

.transcript-search-input:focus {
  width: 280px;
  border-color: var(--color-primary-500);
  box-shadow: var(--shadow-focus);
}

/* Search results navigation */
.search-nav {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
}

.search-count {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  padding: 0 var(--space-2);
}
```

**Time Marker**
```css
.time-marker {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin: var(--space-5) 0 var(--space-3);
}

.time-marker::before,
.time-marker::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border-subtle);
}

.time-marker-value {
  font-family: var(--font-family-mono);
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  background: var(--color-bg-secondary);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.time-marker-value:hover {
  background: var(--color-primary-100);
  color: var(--color-primary-600);
}
```

**Transcript Block**
```css
.transcript-block {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-3);
  transition: all var(--duration-fast) var(--ease-out);
}

.transcript-block:hover {
  background: var(--color-bg-tertiary);
}

/* Currently playing highlight */
.transcript-block.active {
  background: var(--color-primary-50);
  border-left: 3px solid var(--color-primary-500);
}

[data-theme="dark"] .transcript-block.active {
  background: rgba(0, 168, 150, 0.1);
}

/* Search highlight */
.transcript-block.search-match {
  box-shadow: inset 0 0 0 2px var(--color-warning);
}

.transcript-speaker {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.transcript-speaker-avatar {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: var(--color-primary-100);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary-700);
}

.transcript-speaker-name {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.transcript-content {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
}

/* Highlight search matches */
.transcript-content mark {
  background: var(--color-warning-light);
  color: inherit;
  padding: 1px 2px;
  border-radius: 2px;
}

/* Editable transcript */
.transcript-content[contenteditable="true"]:focus {
  outline: none;
  background: var(--color-bg-primary);
  padding: var(--space-3);
  margin: calc(var(--space-3) * -1);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-focus);
}
```

**Transcript Actions (on hover)**
```css
.transcript-block-actions {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  display: flex;
  gap: var(--space-1);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.transcript-block:hover .transcript-block-actions {
  opacity: 1;
}

.transcript-action-btn {
  padding: var(--space-1);
  background: var(--color-bg-primary);
  border-radius: var(--radius-sm);
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.transcript-action-btn:hover {
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
}
```

---

## 8. Empty States

### No Meeting Selected

```
+------------------------------------------------------------------+
|                                                                    |
|                     [Illustration]                                 |
|                                                                    |
|              Select a meeting to view details                      |
|                                                                    |
|         Your transcribed meetings will appear here                 |
|                                                                    |
+------------------------------------------------------------------+
```

### No Action Items

```
+------------------------------------------------------------------+
|  Action Items                                                      |
+------------------------------------------------------------------+
|                                                                    |
|                     [Checklist Icon]                               |
|                                                                    |
|              No action items identified                            |
|                                                                    |
|        [ + Add action item manually ]                             |
|                                                                    |
+------------------------------------------------------------------+
```

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-10);
  text-align: center;
}

.empty-state-icon {
  width: 64px;
  height: 64px;
  color: var(--color-text-tertiary);
  opacity: 0.5;
  margin-bottom: var(--space-4);
}

.empty-state-title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.empty-state-description {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  max-width: 280px;
}

.empty-state-action {
  margin-top: var(--space-5);
}
```

---

## 9. Export Options Modal

### Visual Design

```
+------------------------------------------+
|  Export Meeting Notes              [X]   |
+------------------------------------------+
|                                          |
|  Format                                  |
|  +------------------------------------+  |
|  |  [x] PDF Document                  |  |
|  |  [ ] Word Document (.docx)         |  |
|  |  [ ] Plain Text (.txt)             |  |
|  |  [ ] Markdown (.md)                |  |
|  +------------------------------------+  |
|                                          |
|  Include                                 |
|  +------------------------------------+  |
|  |  [x] AI Summary                    |  |
|  |  [x] Action Items                  |  |
|  |  [x] Key Points                    |  |
|  |  [x] Full Transcript               |  |
|  +------------------------------------+  |
|                                          |
|  [    Cancel    ]  [    Export    ]     |
|                                          |
+------------------------------------------+
```

### Specifications

```css
.export-modal {
  width: 400px;
  background: var(--color-bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  animation: scale-in var(--duration-normal) var(--ease-out);
}

.export-section {
  margin-bottom: var(--space-5);
}

.export-section-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.export-option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
}

.export-option:hover {
  background: var(--color-bg-tertiary);
}

.export-option input[type="radio"],
.export-option input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary-500);
}

.export-option label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
}
```

---

## 10. Responsive Considerations

### Popup View (Limited Width)

When opened from extension popup (360px width):

```css
.review-popup {
  width: 360px;
  max-height: 600px;
}

.review-popup .sidebar {
  display: none; /* Use tabs instead */
}

.review-popup .section-tabs {
  display: flex;
  gap: var(--space-1);
  padding: var(--space-2);
  background: var(--color-bg-secondary);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.review-popup .section-tab {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-xs);
  white-space: nowrap;
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
}

.review-popup .section-tab.active {
  background: var(--color-primary-500);
  color: white;
}
```

### Full Page View (New Tab)

Open in dedicated tab for full review experience:

```css
.review-fullpage {
  min-height: 100vh;
  background: var(--color-bg-secondary);
}

.review-fullpage .content-container {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-8);
}
```

---

## 11. Accessibility Checklist

- [ ] All sections have proper heading hierarchy (h2, h3)
- [ ] Action item checkboxes have accessible labels
- [ ] Editable regions have appropriate ARIA roles
- [ ] Keyboard navigation works through all sections
- [ ] Search results announced to screen readers
- [ ] Time markers are machine-readable (datetime attribute)
- [ ] Export modal traps focus appropriately
- [ ] Color contrast meets WCAG AA for all text

---

This post-meeting review interface transforms raw transcription into structured, actionable content. The clear visual hierarchy guides users from high-level summary to detailed transcript, while inline editing enables quick refinements. The design balances information density with scanability, making it efficient for both quick review and deep analysis.
