/**
 * Simple Google Meet CC Capturer
 * No API calls - just capture CC text and download
 *
 * Version 3.0.0 - Major Rebuild
 *
 * Phase 4: Enhanced Download Features
 * - Download preview modal with statistics
 * - Format selection (TXT/SRT) with live preview
 * - Customizable filename and timestamp options
 * - File size estimation before download
 * - Keyboard shortcuts (Ctrl+Shift+D for download, Ctrl+Shift+S for start/stop)
 * - Modal system with overlay, close on ESC, click outside to close
 *
 * Phase 2: Memory Management & Performance
 * - CaptionBuffer: Circular buffer prevents memory leaks in long meetings
 * - SelectorManager: Priority-based selector management with caching
 * - PerformanceMonitor: Track capture rate, duplicates, errors
 * - Comprehensive error handling with user-friendly notifications
 * - All critical operations wrapped in try-catch
 *
 * Phase 1: Core Architecture
 * - Configuration system for user preferences
 * - Toast notification system for better feedback
 *
 * Version 2.4.0 - Real-time pending text display:
 * - Shows "Current" text area with live caption preview during debounce
 * - Displays pending text immediately for real-time feedback
 * - Clears pending text when captured to final transcript
 * - Tab visibility handling for background capture
 * - Logging for tab visibility state changes
 *
 * Version 2.3.0 - Streaming caption debounce fix:
 * - Added debouncing mechanism for Google Meet's progressive/streaming captions
 * - Google Meet shows captions that grow progressively as speech is recognized
 * - We now wait for text to stabilize (1.5s) before capturing
 * - Only captures the new portion when text extends from previous capture
 * - Prevents duplicate/repetitive captures of streaming content
 *
 * Version 2.2.0 - Updated selectors based on actual Google Meet HTML:
 * 1. Primary selector: [role="region"][aria-label] (semantic HTML)
 * 2. Caption text: .ygicle.VbkSUe (actual caption text element)
 * 3. Speaker name: .NWpY1d (optional speaker identification)
 * 4. Explicit exclusion of .IMKgW (UI buttons area)
 * 5. Better deduplication to prevent repeated captions
 */

// Message Types
const MessageTypes = {
  START_CAPTURE: 'START_CAPTURE',
  STOP_CAPTURE: 'STOP_CAPTURE',
  GET_STATUS: 'GET_STATUS',
  DOWNLOAD_TEXT: 'DOWNLOAD_TEXT',
  DOWNLOAD_SRT: 'DOWNLOAD_SRT'
};

// UI text patterns to exclude (Google Meet UI elements)
const UI_TEXT_PATTERNS = [
  // Icon/button text patterns
  /^arrow_downward$/i,
  /^arrow_upward$/i,
  /^close$/i,
  /^person_add$/i,
  /^more_vert$/i,
  /^mic$/i,
  /^mic_off$/i,
  /^videocam$/i,
  /^videocam_off$/i,
  /^present_to_all$/i,
  /^screen_share$/i,
  /^chat$/i,
  /^people$/i,
  /^settings$/i,
  /^call_end$/i,
  /^info$/i,
  /^expand_more$/i,
  /^expand_less$/i,
  /^check$/i,
  /^content_copy$/i,
  // Korean UI text
  /회의가\s*준비되었습니다/,
  /참여자\s*초대/,
  /회의\s*정보/,
  /지금\s*참여/,
  /회의\s*나가기/,
  /통화\s*종료/,
  /하단으로\s*이동/,
  /상단으로\s*이동/,
  /마이크/,
  /카메라/,
  /화면\s*공유/,
  /채팅/,
  /참여자/,
  /더보기/,
  // Mixed icon+text patterns
  /person_add.*참여자/,
  /close.*다가/,
  // Common button/action text
  /^확인$/,
  /^취소$/,
  /^닫기$/,
  /^공유$/,
  /^복사$/,
  /^참여$/
];

// =============================================================================
// CCConfig - Configuration Management System
// =============================================================================
class CCConfig {
  constructor() {
    this.defaults = {
      // Capture settings
      debounceDelay: 1500,
      autoStart: true,
      includeSpeaker: true,
      showPendingText: true,

      // Performance settings
      maxCaptions: 1000,
      pollingInterval: 1000,
      pollingIntervalHidden: 500,

      // UI settings
      overlayPosition: 'bottom-right',
      overlayMinimized: false,
      showStatistics: true,

      // Download settings
      defaultFormat: 'txt',
      includeTimestamps: true
    };

    this.config = { ...this.defaults };
    this.loaded = false;
  }

  async load() {
    try {
      const stored = await chrome.storage.local.get('ccConfig');
      if (stored.ccConfig) {
        this.config = { ...this.defaults, ...stored.ccConfig };
      }
      this.loaded = true;
      console.log('[CC Config] Loaded:', this.config);
    } catch (error) {
      console.error('[CC Config] Load error:', error);
      this.config = { ...this.defaults };
    }
  }

  async save(key, value) {
    this.config[key] = value;
    try {
      await chrome.storage.local.set({ ccConfig: this.config });
      console.log('[CC Config] Saved:', key, value);
      return true;
    } catch (error) {
      console.error('[CC Config] Save error:', error);
      return false;
    }
  }

  async saveMultiple(updates) {
    Object.assign(this.config, updates);
    try {
      await chrome.storage.local.set({ ccConfig: this.config });
      console.log('[CC Config] Saved multiple:', updates);
      return true;
    } catch (error) {
      console.error('[CC Config] Save error:', error);
      return false;
    }
  }

  get(key) {
    return this.config[key] !== undefined ? this.config[key] : this.defaults[key];
  }

  getAll() {
    return { ...this.config };
  }

  async reset() {
    this.config = { ...this.defaults };
    await chrome.storage.local.set({ ccConfig: this.config });
    console.log('[CC Config] Reset to defaults');
  }
}

// =============================================================================
// CaptionBuffer - Circular Buffer for Memory Management (Phase 2)
// =============================================================================
class CaptionBuffer {
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
    this.captions = [];
    this.archivedCount = 0; // Track how many were archived
  }

  /**
   * Add a caption to the buffer
   * Automatically archives older captions if over limit
   */
  add(caption) {
    this.captions.push(caption);

    // If over limit, archive older captions
    if (this.captions.length > this.maxSize) {
      const toArchive = this.captions.length - this.maxSize;
      this.captions.splice(0, toArchive);
      this.archivedCount += toArchive;
      console.log(`[CaptionBuffer] Archived ${toArchive} captions to prevent memory leak`);
    }
  }

  /**
   * Get all active (non-archived) captions
   */
  getAll() {
    return this.captions;
  }

  /**
   * Get total count (active + archived)
   */
  getCount() {
    return this.captions.length + this.archivedCount;
  }

  /**
   * Get only active (non-archived) count
   */
  getActiveCount() {
    return this.captions.length;
  }

  /**
   * Get last N captions
   */
  getLast(n) {
    return this.captions.slice(-n);
  }

  /**
   * Check if buffer has captions
   */
  isEmpty() {
    return this.captions.length === 0;
  }

  /**
   * Clear all captions
   */
  clear() {
    this.captions = [];
    this.archivedCount = 0;
  }

  /**
   * Get comprehensive statistics
   */
  getStats() {
    const text = this.captions.map(c => c.text).join(' ');
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    const chars = text.length;

    // Calculate duration if we have timestamps
    let duration = 0;
    if (this.captions.length > 0) {
      const lastCaption = this.captions[this.captions.length - 1];
      duration = lastCaption.timestamp || 0;
    }

    return {
      total: this.getCount(),
      active: this.getActiveCount(),
      archived: this.archivedCount,
      words,
      chars,
      duration,
      averageWordsPerCaption: this.captions.length > 0
        ? Math.round(words / this.captions.length * 10) / 10
        : 0
    };
  }

  /**
   * Update max size (e.g., when config changes)
   */
  setMaxSize(newMaxSize) {
    this.maxSize = newMaxSize;
    // Trim if current size exceeds new max
    if (this.captions.length > this.maxSize) {
      const toArchive = this.captions.length - this.maxSize;
      this.captions.splice(0, toArchive);
      this.archivedCount += toArchive;
    }
  }
}

// =============================================================================
// SelectorManager - Reliable Selector Management (Phase 2)
// =============================================================================
class SelectorManager {
  constructor() {
    // Priority-ordered selectors based on reliability
    this.selectors = [
      {
        name: 'semantic-kr',
        container: '[role="region"][aria-label*="자막"]',
        text: '.ygicle.VbkSUe',
        speaker: '.NWpY1d',
        priority: 1
      },
      {
        name: 'semantic-en',
        container: '[role="region"][aria-label*="caption" i]',
        text: '.ygicle.VbkSUe',
        speaker: '.NWpY1d',
        priority: 1
      },
      {
        name: 'semantic-subtitle',
        container: '[role="region"][aria-label*="subtitle" i]',
        text: '.ygicle.VbkSUe',
        speaker: '.NWpY1d',
        priority: 1
      },
      {
        name: 'jsname-container',
        container: '[jsname="dsyhDe"]',
        text: '.ygicle.VbkSUe',
        speaker: '.NWpY1d',
        priority: 2
      },
      {
        name: 'direct-text',
        container: null,
        text: '.ygicle.VbkSUe',
        speaker: '.NWpY1d',
        priority: 3
      },
      {
        name: 'legacy-TEjq6e',
        container: 'div[jscontroller="TEjq6e"]',
        text: '.iTTPOb',
        speaker: null,
        priority: 4
      },
      {
        name: 'legacy-D1tHje',
        container: 'div[jscontroller="D1tHje"]',
        text: '.iTTPOb',
        speaker: null,
        priority: 4
      },
      {
        name: 'legacy-KPn5nb',
        container: 'div[jscontroller="KPn5nb"]',
        text: '.iTTPOb',
        speaker: null,
        priority: 4
      }
    ];

    this.lastWorkingSelector = null;
    this.selectorSwitchCount = 0;

    // Elements to exclude (UI elements, not captions)
    this.excludeSelectors = [
      '[role="dialog"]',
      '[role="menu"]',
      '[role="menubar"]',
      '[role="button"]',
      '[role="toolbar"]',
      '[role="tablist"]',
      '[role="listbox"]',
      'button',
      '.IMKgW',  // UI buttons area in caption container
      '[data-tooltip]',
      '[aria-label*="Leave"]',
      '[aria-label*="mute"]',
      '[aria-label*="camera"]',
      '[data-panel-id]',
      '.VfPpkd-Bz112c-LgbsSe'  // Material design buttons
    ];
  }

  /**
   * Find caption element using priority-ordered selectors
   * Returns { element, selector, textSelector, speakerSelector } or null
   */
  findCaption() {
    // Try last working selector first (performance optimization)
    if (this.lastWorkingSelector) {
      try {
        const result = this.trySelector(this.lastWorkingSelector);
        if (result && this.validateCaption(result)) {
          return result;
        }
      } catch (error) {
        console.warn('[SelectorManager] Last working selector failed:', error.message);
        this.lastWorkingSelector = null;
      }
    }

    // Try all selectors in priority order
    for (const selector of this.selectors) {
      try {
        const result = this.trySelector(selector);
        if (result && this.validateCaption(result)) {
          // Track selector switches for performance monitoring
          if (this.lastWorkingSelector &&
              this.lastWorkingSelector.name !== selector.name) {
            this.selectorSwitchCount++;
            console.log(`[SelectorManager] Selector switch #${this.selectorSwitchCount}: ${this.lastWorkingSelector?.name || 'none'} -> ${selector.name}`);
          }
          this.lastWorkingSelector = selector;
          console.log(`[SelectorManager] Found caption with: ${selector.name}`);
          return result;
        }
      } catch (error) {
        // Continue to next selector
        console.debug(`[SelectorManager] Selector ${selector.name} failed:`, error.message);
      }
    }

    return null;
  }

  /**
   * Try a specific selector configuration
   */
  trySelector(selector) {
    let containerElement = null;

    if (selector.container) {
      // Find container first, then look for text inside
      const containers = document.querySelectorAll(selector.container);
      for (const container of containers) {
        if (!this.isExcluded(container)) {
          // Verify it has caption text
          const textEl = container.querySelector(selector.text);
          if (textEl && textEl.textContent?.trim()) {
            containerElement = container;
            break;
          }
        }
      }
    } else {
      // Direct text search (no container)
      const textElements = document.querySelectorAll(selector.text);
      for (const el of textElements) {
        if (!this.isExcluded(el) && el.textContent?.trim()) {
          // Find a reasonable parent container
          containerElement = el.closest('[jscontroller]') ||
                            el.closest('[jsname="dsyhDe"]') ||
                            el.closest('[role="region"]') ||
                            el.parentElement;
          break;
        }
      }
    }

    if (!containerElement) return null;

    return {
      element: containerElement,
      selector: selector.name,
      textSelector: selector.text,
      speakerSelector: selector.speaker
    };
  }

  /**
   * Check if element is in an excluded area
   */
  isExcluded(element) {
    if (!element) return true;

    for (const selector of this.excludeSelectors) {
      try {
        if (element.closest(selector)) {
          return true;
        }
      } catch (e) {
        // Ignore closest() errors for invalid selectors
      }
    }

    // Also check if it's in our overlay
    if (element.closest('#cc-overlay')) return true;

    return false;
  }

  /**
   * Validate that found caption is actually a caption
   */
  validateCaption(result) {
    if (!result || !result.element) return false;

    try {
      const text = result.element.textContent?.trim() || '';

      // Basic validation
      if (text.length < 3) return false;
      if (text.length > 2000) return false; // Suspiciously long

      // Check if it's in a reasonable position (bottom portion of screen)
      const rect = result.element.getBoundingClientRect();
      if (rect.bottom < window.innerHeight * 0.4) return false; // Too high
      if (rect.top > window.innerHeight) return false; // Off screen

      // Check element is visible
      if (rect.width === 0 || rect.height === 0) return false;

      return true;
    } catch (error) {
      console.warn('[SelectorManager] Validation error:', error.message);
      return false;
    }
  }

  /**
   * Get selector statistics
   */
  getStats() {
    return {
      currentSelector: this.lastWorkingSelector?.name || 'none',
      selectorSwitchCount: this.selectorSwitchCount,
      availableSelectors: this.selectors.length
    };
  }

  /**
   * Reset selector state (useful when caption container changes)
   */
  reset() {
    this.lastWorkingSelector = null;
  }
}

// =============================================================================
// PerformanceMonitor - Performance Metrics Tracking (Phase 2)
// =============================================================================
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      captureCount: 0,
      duplicateCount: 0,
      errorCount: 0,
      selectorSwitchCount: 0,
      processingTimeTotal: 0,
      processingTimeCount: 0,
      lastCaptureTime: null,
      sessionStartTime: null
    };
  }

  /**
   * Start a new monitoring session
   */
  startSession() {
    this.metrics.sessionStartTime = Date.now();
  }

  /**
   * Record a successful capture
   */
  recordCapture() {
    this.metrics.captureCount++;
    this.metrics.lastCaptureTime = Date.now();
  }

  /**
   * Record a duplicate detection
   */
  recordDuplicate() {
    this.metrics.duplicateCount++;
  }

  /**
   * Record an error
   */
  recordError(context = '') {
    this.metrics.errorCount++;
    console.warn(`[PerformanceMonitor] Error recorded: ${context}`);
  }

  /**
   * Record a selector switch
   */
  recordSelectorSwitch() {
    this.metrics.selectorSwitchCount++;
  }

  /**
   * Record processing time for a capture operation
   */
  recordProcessingTime(startTime) {
    const elapsed = Date.now() - startTime;
    this.metrics.processingTimeTotal += elapsed;
    this.metrics.processingTimeCount++;
  }

  /**
   * Get comprehensive statistics
   */
  getStats() {
    const sessionDuration = this.metrics.sessionStartTime
      ? Date.now() - this.metrics.sessionStartTime
      : 0;

    const avgProcessingTime = this.metrics.processingTimeCount > 0
      ? Math.round(this.metrics.processingTimeTotal / this.metrics.processingTimeCount)
      : 0;

    const captureRate = sessionDuration > 0
      ? Math.round(this.metrics.captureCount / (sessionDuration / 60000) * 10) / 10
      : 0;

    const duplicateRate = this.metrics.captureCount + this.metrics.duplicateCount > 0
      ? Math.round(this.metrics.duplicateCount / (this.metrics.captureCount + this.metrics.duplicateCount) * 100)
      : 0;

    return {
      ...this.metrics,
      sessionDuration,
      avgProcessingTime,
      captureRate, // captures per minute
      duplicateRate // percentage of duplicates
    };
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics = {
      captureCount: 0,
      duplicateCount: 0,
      errorCount: 0,
      selectorSwitchCount: 0,
      processingTimeTotal: 0,
      processingTimeCount: 0,
      lastCaptureTime: null,
      sessionStartTime: null
    };
  }

  /**
   * Log current stats to console
   */
  logStats() {
    const stats = this.getStats();
    console.log('[PerformanceMonitor] Current stats:', stats);
    return stats;
  }
}

// =============================================================================
// CCNotification - Toast Notification System
// =============================================================================
class CCNotification {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    // Remove existing container if any
    const existing = document.getElementById('cc-notifications');
    if (existing) existing.remove();

    // Create notification container
    this.container = document.createElement('div');
    this.container.id = 'cc-notifications';
    this.container.className = 'cc-notifications';
    document.body.appendChild(this.container);
  }

  show(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `cc-notification cc-notification-${type}`;

    const icon = this.getIcon(type);
    notification.innerHTML = `
      <span class="cc-notification-icon">${icon}</span>
      <span class="cc-notification-message">${this.escapeHtml(message)}</span>
    `;

    this.container.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);

    // Auto remove
    if (duration > 0) {
      setTimeout(() => this.remove(notification), duration);
    }

    return notification;
  }

  remove(notification) {
    if (!notification || !notification.parentNode) return;
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }

  getIcon(type) {
    const icons = {
      info: 'i',
      success: '✓',
      warning: '!',
      error: '×'
    };
    return icons[type] || icons.info;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showSuccess(message) {
    return this.show(message, 'success', 2000);
  }

  showError(message) {
    return this.show(message, 'error', 4000);
  }

  showWarning(message) {
    return this.show(message, 'warning', 3000);
  }

  showInfo(message) {
    return this.show(message, 'info', 3000);
  }
}

// =============================================================================
// SimpleCCCapturer - Main Capturer Class
// =============================================================================
class SimpleCCCapturer {
  constructor() {
    this.isCapturing = false;
    this.observer = null;
    this.ccDetectionObserver = null;
    this.startTime = null;
    this.lastTexts = []; // Store last few texts for better deduplication
    this.maxLastTexts = 5; // Number of recent texts to compare against
    this.autoStarted = false;
    this.includeSpeakerName = true; // Include speaker name in captions (set to false to disable)
    this.speakerSelector = null; // Will be set when CC element is found

    // Debouncing for streaming captions
    // Google Meet shows progressive/streaming captions that build up over time
    // We wait for text to stabilize before capturing to avoid duplicates
    this.debounceTimer = null;
    this.lastProcessedText = ''; // Full text we last successfully captured
    this.pendingText = ''; // Text currently being debounced

    // =========================================================================
    // Phase 1 Core Architecture
    // =========================================================================
    this.config = new CCConfig();
    this.notification = null; // Will be initialized after DOM is ready

    // =========================================================================
    // Phase 2 Memory Management and Performance
    // =========================================================================
    // CaptionBuffer replaces this.captions = [] for memory management
    this.captionBuffer = null; // Will be initialized in init()

    // SelectorManager replaces findCCElement() logic
    this.selectorManager = new SelectorManager();

    // PerformanceMonitor for metrics tracking
    this.performanceMonitor = new PerformanceMonitor();
  }

  /**
   * Initialize async components (config loading)
   */
  async init() {
    try {
      await this.config.load();

      // Apply config values
      this.includeSpeakerName = this.config.get('includeSpeaker');

      // Initialize CaptionBuffer with config value
      const maxCaptions = this.config.get('maxCaptions');
      this.captionBuffer = new CaptionBuffer(maxCaptions);

      // Initialize notification system after DOM is ready
      this.notification = new CCNotification();

      console.log('[CC] Capturer initialized with config');
      console.log('[CC] Phase 2 systems: CaptionBuffer, SelectorManager, PerformanceMonitor');
    } catch (error) {
      console.error('[CC] Initialization error:', error);
      // Create fallback instances
      this.captionBuffer = new CaptionBuffer(1000);
      this.notification = new CCNotification();
      this.notification.showError('Configuration load failed, using defaults');
    }
  }

  /**
   * Get captions array for backward compatibility
   * Returns the active captions from the buffer
   */
  get captions() {
    return this.captionBuffer ? this.captionBuffer.getAll() : [];
  }

  /**
   * Get debounce delay from config
   */
  get DEBOUNCE_DELAY() {
    return this.config.get('debounceDelay');
  }

  /**
   * Check if text looks like UI element text rather than actual caption
   */
  isUIText(text) {
    if (!text || text.trim().length === 0) return true;

    const trimmed = text.trim();

    // Check against known UI patterns
    for (const pattern of UI_TEXT_PATTERNS) {
      if (pattern.test(trimmed)) {
        console.log('[CC] Filtered out UI text:', trimmed);
        return true;
      }
    }

    // Filter out very short text that might be icons
    if (trimmed.length <= 2) {
      console.log('[CC] Filtered out short text:', trimmed);
      return true;
    }

    // Filter out text that contains common icon names embedded
    if (/^[a-z_]+$/.test(trimmed) && trimmed.includes('_')) {
      console.log('[CC] Filtered out icon name:', trimmed);
      return true;
    }

    return false;
  }

  /**
   * Clean caption text by removing any embedded UI elements
   */
  cleanCaptionText(text) {
    if (!text) return '';

    let cleaned = text;

    // Remove common icon text patterns that might be embedded
    const iconPatterns = [
      /arrow_downward/gi,
      /arrow_upward/gi,
      /person_add/gi,
      /more_vert/gi,
      /close/gi,
      /expand_more/gi,
      /expand_less/gi,
      /check_circle/gi,
      /content_copy/gi
    ];

    for (const pattern of iconPatterns) {
      cleaned = cleaned.replace(pattern, '');
    }

    // Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  }

  /**
   * Find the actual caption element in Google Meet
   * This is the most critical function - must only target actual captions
   *
   * Based on actual Google Meet HTML structure (2024):
   * - Caption container: [role="region"][aria-label="자막"] or [jsname="dsyhDe"]
   * - Caption text: .ygicle.VbkSUe
   * - Speaker name: .NWpY1d
   * - UI buttons (EXCLUDE): .IMKgW
   *
   * NOTE: All DOM operations are wrapped in try-catch to prevent any errors
   * from interfering with Google Meet's internal code.
   */
  findCCElement() {
    try {
      console.log('[CC] Searching for caption elements...');

      // Selectors to EXCLUDE - these are UI elements, not captions
      const excludeSelectors = [
        '.IMKgW',  // UI buttons area inside caption container (CRITICAL)
        '[role="dialog"]',
        '[role="menu"]',
        '[role="menubar"]',
        '[role="button"]',
        '[role="toolbar"]',
        '[role="tablist"]',
        '[role="listbox"]',
        'button',
        '.uArJ5e',  // Meeting invite dialog
        '[jsname="BIbCDd"]',  // Various UI popups
        '[data-tooltip]',  // Buttons with tooltips
        '[aria-label*="Leave"]',
        '[aria-label*="mute"]',
        '[aria-label*="camera"]',
        '[data-panel-id]',  // Side panels
        '.VfPpkd-Bz112c-LgbsSe'  // Material design buttons
      ];

      // ===== PRIORITY 1: Semantic HTML selector (most reliable) =====
      // Look for [role="region"] with aria-label containing "자막" (Korean) or "caption" (English)
      try {
        const regionSelectors = [
          '[role="region"][aria-label*="자막"]',  // Korean: "captions"
          '[role="region"][aria-label*="caption"]',  // English
          '[role="region"][aria-label*="Caption"]',
          '[role="region"][aria-label*="subtitle"]',
          '[role="region"][aria-label*="Subtitle"]'
        ];

        for (const selector of regionSelectors) {
          const regions = document.querySelectorAll(selector);
          for (const region of regions) {
            // Look for the actual caption text element inside
            const captionTextEl = region.querySelector('.ygicle.VbkSUe');
            if (captionTextEl) {
              const text = captionTextEl.textContent?.trim() || '';
              if (text.length > 0 && !this.isUIText(text)) {
                console.log(`[CC] Found caption via semantic selector: ${selector}`);
                console.log('[CC] Caption text element: .ygicle.VbkSUe');
                return {
                  element: region,
                  selector: selector,
                  textSelector: '.ygicle.VbkSUe',
                  speakerSelector: '.NWpY1d'
                };
              }
            }
          }
        }
      } catch (e) {
        console.warn('[CC] Error in semantic selector search:', e);
      }

      // ===== PRIORITY 2: jsname="dsyhDe" (backup container selector) =====
      try {
        const dsyhDeContainers = document.querySelectorAll('[jsname="dsyhDe"]');
        for (const container of dsyhDeContainers) {
          // Look for the actual caption text element inside
          const captionTextEl = container.querySelector('.ygicle.VbkSUe');
          if (captionTextEl) {
            const text = captionTextEl.textContent?.trim() || '';
            if (text.length > 0 && !this.isUIText(text)) {
              console.log('[CC] Found caption via [jsname="dsyhDe"]');
              return {
                element: container,
                selector: '[jsname="dsyhDe"]',
                textSelector: '.ygicle.VbkSUe',
                speakerSelector: '.NWpY1d'
              };
            }
          }
        }
      } catch (e) {
        console.warn('[CC] Error in jsname="dsyhDe" search:', e);
      }

      // ===== PRIORITY 3: Direct .ygicle.VbkSUe search =====
      try {
        const captionTextElements = document.querySelectorAll('.ygicle.VbkSUe');
        for (const el of captionTextElements) {
          // Make sure it's not inside excluded areas
          let isExcluded = false;
          for (const excludeSelector of excludeSelectors) {
            try {
              if (el.closest(excludeSelector)) {
                isExcluded = true;
                break;
              }
            } catch (e) {
              // Ignore closest() errors
            }
          }

          if (isExcluded) continue;

          const text = el.textContent?.trim() || '';
          if (text.length > 0 && !this.isUIText(text)) {
            // Find the parent container to observe (prefer jsname or role containers)
            const parent = el.closest('[jsname="dsyhDe"]') ||
                          el.closest('[role="region"]') ||
                          el.closest('.iOzk7') ||
                          el.parentElement?.parentElement;
            console.log('[CC] Found .ygicle.VbkSUe caption element directly');
            return {
              element: parent || el.parentElement,
              selector: '.ygicle.VbkSUe (parent)',
              textSelector: '.ygicle.VbkSUe',
              speakerSelector: '.NWpY1d'
            };
          }
        }
      } catch (e) {
        console.warn('[CC] Error in .ygicle.VbkSUe search:', e);
      }

      // ===== PRIORITY 4: Legacy .iTTPOb selector (older Google Meet versions) =====
      try {
        const legacyElements = document.querySelectorAll('.iTTPOb');
        for (const el of legacyElements) {
          let isExcluded = false;
          for (const excludeSelector of excludeSelectors) {
            try {
              if (el.closest(excludeSelector)) {
                isExcluded = true;
                break;
              }
            } catch (e) {
              // Ignore closest() errors
            }
          }

          if (isExcluded) continue;

          const text = el.textContent?.trim() || '';
          if (text.length > 0 && !this.isUIText(text)) {
            const parent = el.closest('[jscontroller]') || el.parentElement;
            console.log('[CC] Found legacy .iTTPOb caption element');
            return {
              element: parent,
              selector: '.iTTPOb (legacy)',
              textSelector: '.iTTPOb',
              speakerSelector: null
            };
          }
        }
      } catch (e) {
        console.warn('[CC] Error in .iTTPOb fallback:', e);
      }

      // ===== PRIORITY 5: jscontroller-based selectors (legacy) =====
      const legacyControllerSelectors = [
        'div[jscontroller="TEjq6e"]',
        'div[jscontroller="D1tHje"]',
        'div[jscontroller="KPn5nb"]'  // Caption controller from actual HTML
      ];

      for (const selector of legacyControllerSelectors) {
        try {
          const containers = document.querySelectorAll(selector);

          for (const container of containers) {
            // Check if this container is NOT inside excluded areas
            let isExcluded = false;
            for (const excludeSelector of excludeSelectors) {
              try {
                if (container.closest(excludeSelector)) {
                  isExcluded = true;
                  break;
                }
              } catch (e) {
                // Ignore closest() errors
              }
            }

            if (isExcluded) continue;

            // Try new selector first, then legacy
            const captionTextEl = container.querySelector('.ygicle.VbkSUe') ||
                                  container.querySelector('.iTTPOb');
            if (captionTextEl) {
              const text = captionTextEl.textContent?.trim() || '';
              if (text.length > 0 && !this.isUIText(text)) {
                console.log(`[CC] Found caption via legacy controller: ${selector}`);
                return {
                  element: container,
                  selector: selector,
                  textSelector: container.querySelector('.ygicle.VbkSUe') ? '.ygicle.VbkSUe' : '.iTTPOb',
                  speakerSelector: '.NWpY1d'
                };
              }
            }
          }
        } catch (e) {
          console.warn('[CC] Error checking legacy selector:', selector, e);
        }
      }

      // ===== PRIORITY 6: Position-based detection (last resort) =====
      console.log('[CC] Primary selectors failed, trying position-based detection...');

      try {
        const potentialContainers = document.querySelectorAll('div[jscontroller]:not([role])');
        let checked = 0;
        const MAX_CHECKS = 50;

        for (const el of potentialContainers) {
          if (checked >= MAX_CHECKS) break;
          checked++;

          let isExcluded = false;
          for (const excludeSelector of excludeSelectors) {
            try {
              if (el.closest(excludeSelector)) {
                isExcluded = true;
                break;
              }
            } catch (e) {
              // Ignore errors
            }
          }

          if (isExcluded) continue;
          if (el.closest('#cc-overlay')) continue;

          try {
            const rect = el.getBoundingClientRect();
            const text = el.textContent?.trim() || '';

            if (
              rect.bottom > window.innerHeight * 0.6 &&
              rect.top < window.innerHeight * 0.95 &&
              rect.height < 150 &&
              rect.width > 100 &&
              rect.width < window.innerWidth * 0.8 &&
              text.length > 5 &&
              text.length < 500 &&
              !this.isUIText(text)
            ) {
              console.log('[CC] Found caption via position detection:', text.substring(0, 50));
              return {
                element: el,
                selector: 'position-based',
                textSelector: null,
                speakerSelector: null
              };
            }
          } catch (e) {
            // Ignore getBoundingClientRect errors
          }
        }
      } catch (e) {
        console.warn('[CC] Error in position-based detection:', e);
      }

      console.log('[CC] No caption elements found. Make sure CC is enabled in Google Meet.');
      return null;
    } catch (e) {
      console.error('[CC] Error in findCCElement:', e);
      return null;
    }
  }

  /**
   * Extract clean caption text from element
   * Optionally includes speaker name if available
   */
  extractCaptionText(element, textSelector) {
    let text = '';
    let speaker = '';

    // First, try to get speaker name if speakerSelector is available
    if (this.speakerSelector) {
      try {
        const speakerEl = element.querySelector(this.speakerSelector);
        if (speakerEl) {
          speaker = speakerEl.textContent?.trim() || '';
          // Don't include speaker if it looks like UI text
          if (this.isUIText(speaker)) {
            speaker = '';
          }
        }
      } catch (e) {
        // Ignore speaker extraction errors
      }
    }

    if (textSelector) {
      // Get text from specific text elements, but EXCLUDE .IMKgW (UI buttons area)
      try {
        const textElements = element.querySelectorAll(textSelector);
        if (textElements.length > 0) {
          text = Array.from(textElements)
            .filter(el => {
              // Exclude elements inside .IMKgW
              try {
                return !el.closest('.IMKgW');
              } catch (e) {
                return true;
              }
            })
            .map(el => el.textContent?.trim())
            .filter(t => t && !this.isUIText(t))
            .join(' ');
        }
      } catch (e) {
        console.warn('[CC] Error extracting text with selector:', e);
      }
    }

    // Fallback to element's full text content (but exclude .IMKgW content)
    if (!text) {
      try {
        // Clone the element and remove UI buttons before extracting text
        const clone = element.cloneNode(true);
        const uiButtons = clone.querySelectorAll('.IMKgW');
        uiButtons.forEach(btn => btn.remove());
        text = clone.textContent?.trim() || '';
      } catch (e) {
        // If cloning fails, use original text
        text = element.textContent?.trim() || '';
      }
    }

    // Clean the text
    text = this.cleanCaptionText(text);

    // Final validation - make sure it's not UI text
    if (this.isUIText(text)) {
      return '';
    }

    // Optionally prepend speaker name
    if (speaker && text && this.includeSpeakerName) {
      text = `[${speaker}] ${text}`;
    }

    return text;
  }

  /**
   * Check if text is a duplicate or very similar to recent captions
   */
  isDuplicate(text) {
    if (!text) return true;

    const normalized = text.toLowerCase().trim();

    // Check against last few texts
    for (const lastText of this.lastTexts) {
      const lastNormalized = lastText.toLowerCase().trim();

      // Exact match
      if (normalized === lastNormalized) {
        return true;
      }

      // Check if one contains the other (partial update)
      if (normalized.includes(lastNormalized) &&
          normalized.length - lastNormalized.length < 10) {
        return true;
      }
      if (lastNormalized.includes(normalized) &&
          lastNormalized.length - normalized.length < 10) {
        return true;
      }

      // Check similarity (simple approach)
      if (this.calculateSimilarity(normalized, lastNormalized) > 0.8) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate simple string similarity (0 to 1)
   */
  calculateSimilarity(str1, str2) {
    if (str1 === str2) return 1;
    if (str1.length === 0 || str2.length === 0) return 0;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    // Check if shorter is a substring
    if (longer.includes(shorter)) {
      return shorter.length / longer.length;
    }

    // Count matching characters at same positions
    let matches = 0;
    const minLen = Math.min(str1.length, str2.length);
    for (let i = 0; i < minLen; i++) {
      if (str1[i] === str2[i]) matches++;
    }

    return matches / Math.max(str1.length, str2.length);
  }

  /**
   * Add text to recent texts list for deduplication
   */
  addToRecentTexts(text) {
    this.lastTexts.unshift(text);
    if (this.lastTexts.length > this.maxLastTexts) {
      this.lastTexts.pop();
    }
  }

  start() {
    if (this.isCapturing) {
      this.notification?.showWarning('Already capturing');
      return { success: false, message: 'Already capturing' };
    }

    // Use SelectorManager for reliable caption detection (Phase 2)
    let result;
    try {
      result = this.selectorManager.findCaption();
    } catch (error) {
      this.performanceMonitor.recordError('findCaption failed');
      this.notification?.showError(`Caption detection error: ${error.message}`);
      return {
        success: false,
        message: `Caption detection error: ${error.message}`
      };
    }

    if (!result) {
      this.notification?.showError('Captions not found. Please enable captions (CC button) first!');
      return {
        success: false,
        message: 'Captions not found. Please enable captions (CC button) first!'
      };
    }

    const { element: ccElement, selector, textSelector, speakerSelector } = result;
    this.ccElement = ccElement;
    this.ccSelector = selector;
    this.textSelector = textSelector;
    this.speakerSelector = speakerSelector || null;

    this.isCapturing = true;
    this.startTime = Date.now();

    // Reset caption buffer (Phase 2) instead of this.captions = []
    if (this.captionBuffer) {
      this.captionBuffer.clear();
    } else {
      this.captionBuffer = new CaptionBuffer(this.config.get('maxCaptions'));
    }

    this.lastTexts = [];

    // Start performance monitoring session (Phase 2)
    this.performanceMonitor.reset();
    this.performanceMonitor.startSession();

    // Reset debounce state for fresh capture session
    this.lastProcessedText = '';
    this.pendingText = '';
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    console.log(`[CC] Starting capture with selector: ${selector}`);
    console.log('[CC] Text selector:', textSelector || 'direct text');
    console.log('[CC] Speaker selector:', speakerSelector || 'none');
    console.log('[CC] Target element:', ccElement);

    // Show visual indicator that CC element was found
    this.showCCFoundIndicator(selector);

    // Watch for text changes with improved observer
    this.observer = new MutationObserver((mutations) => {
      this.processCaptionUpdate();
    });

    // Observe with comprehensive options
    this.observer.observe(ccElement, {
      childList: true,
      subtree: true,
      characterData: true,
      characterDataOldValue: true,
      attributes: false
    });

    // Also set up a polling mechanism as backup (use config value)
    const pollingInterval = this.config.get('pollingInterval');
    this.pollInterval = setInterval(() => {
      if (!this.isCapturing) return;
      this.processCaptionUpdate();
    }, pollingInterval);

    // Set up visibility change handler for background capture
    // This ensures caption capture continues when tab is hidden or during screen sharing
    this.visibilityHandler = () => {
      if (!this.isCapturing) return;
      if (document.hidden) {
        console.log('[CC] Tab became hidden - background capture will continue via polling');
        // Increase polling frequency when tab is hidden since MutationObserver may be throttled
        if (this.pollInterval) {
          clearInterval(this.pollInterval);
        }
        const hiddenInterval = this.config.get('pollingIntervalHidden');
        this.pollInterval = setInterval(() => {
          if (!this.isCapturing) return;
          this.processCaptionUpdate();
        }, hiddenInterval);
      } else {
        console.log('[CC] Tab became visible - resuming normal capture');
        // Reset to normal polling frequency
        if (this.pollInterval) {
          clearInterval(this.pollInterval);
        }
        const normalInterval = this.config.get('pollingInterval');
        this.pollInterval = setInterval(() => {
          if (!this.isCapturing) return;
          this.processCaptionUpdate();
        }, normalInterval);
        // Process any pending updates immediately
        this.processCaptionUpdate();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);

    console.log('[CC] Capture started with observer + polling + visibility handling');
    this.updateStatus('Recording...');

    // Update UI buttons
    const startBtn = document.getElementById('cc-start-btn');
    const stopBtn = document.getElementById('cc-stop-btn');
    if (startBtn) startBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;

    // Remove placeholder
    document.querySelector('.cc-placeholder')?.remove();

    return { success: true, message: `Capture started (using: ${selector})` };
  }

  /**
   * Process caption update - centralized logic for both observer and polling
   * Uses debouncing to handle Google Meet's streaming/progressive captions
   *
   * Google Meet shows captions progressively as speech is recognized:
   * - "Hello" -> "Hello world" -> "Hello world how" -> "Hello world how are you"
   * We debounce to capture only the final stabilized text.
   *
   * Phase 2: Wrapped in try-catch for error handling
   */
  processCaptionUpdate() {
    try {
      if (!this.isCapturing || !this.ccElement) return;

      // Log if processing while tab is hidden (for debugging background capture)
      if (document.hidden) {
        console.log('[CC] Processing caption while tab is hidden (background capture active)');
      }

      // Extract clean caption text
      const currentText = this.extractCaptionText(this.ccElement, this.textSelector);

      // Skip if empty
      if (!currentText) {
        // Clear pending text display if caption is empty
        if (this.config.get('showPendingText')) {
          this.showPendingText('');
        }
        return;
      }

      // Store the pending text for when debounce timer fires
      this.pendingText = currentText;

      // Show pending text immediately in UI for real-time feedback
      if (this.config.get('showPendingText')) {
        this.showPendingText(currentText);
      }

      // Clear any existing debounce timer
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      // Set new debounce timer - only capture when text stabilizes
      this.debounceTimer = setTimeout(() => {
        this.captureStableText(this.pendingText);
      }, this.DEBOUNCE_DELAY);
    } catch (error) {
      // Phase 2: Error handling
      this.performanceMonitor.recordError('processCaptionUpdate');
      console.error('[CC] Caption processing error:', error);
      // Don't show notification for every processing error to avoid spam
    }
  }

  /**
   * Show pending text in the UI for real-time feedback
   * This displays the text currently being debounced before it's captured
   */
  showPendingText(text) {
    const pendingArea = document.getElementById('cc-pending-area');
    const pendingText = document.getElementById('cc-pending-text');

    if (!pendingArea || !pendingText) return;

    if (text) {
      pendingText.textContent = text;
      pendingArea.style.display = 'flex';
    } else {
      pendingText.textContent = '';
      pendingArea.style.display = 'none';
    }
  }

  /**
   * Capture text that has stabilized (no changes for DEBOUNCE_DELAY ms)
   * Extracts only the new portion if the text is an extension of previous text
   *
   * Phase 2: Uses CaptionBuffer for memory management and PerformanceMonitor for metrics
   */
  captureStableText(text) {
    const processingStart = Date.now(); // For performance monitoring

    try {
      if (!text || !this.isCapturing) return;

      // CaptionBuffer handles max limit automatically via circular buffer (Phase 2)
      // No need to check maxCaptions - the buffer archives old captions automatically

      // Normalize for comparison (but keep original for display)
      const normalizedText = text.trim();
      const normalizedLast = this.lastProcessedText.trim();

      // Skip if this is exactly the same as what we already captured
      if (normalizedText === normalizedLast) {
        console.log('[CC] Skipping duplicate stable text');
        this.performanceMonitor.recordDuplicate();
        return;
      }

      let textToCapture = '';

      // Check if new text is an extension of the previous text (streaming pattern)
      if (normalizedLast && normalizedText.startsWith(normalizedLast)) {
        // Extract only the new portion
        const newPortion = normalizedText.substring(normalizedLast.length).trim();

        if (newPortion.length > 0) {
          textToCapture = newPortion;
          console.log('[CC] Captured new portion:', newPortion);
        } else {
          // No actual new content
          console.log('[CC] No new content in extension');
          this.performanceMonitor.recordDuplicate();
          return;
        }
      } else if (normalizedLast && normalizedLast.startsWith(normalizedText)) {
        // New text is shorter than last (shouldn't happen normally, but handle it)
        // This might indicate a new caption segment started
        console.log('[CC] Text shortened - possible new segment');
        textToCapture = normalizedText;
      } else {
        // Completely different text (new speaker, new segment, or first capture)
        // Check against recent texts for deduplication
        if (this.isDuplicate(normalizedText)) {
          console.log('[CC] Skipping duplicate text');
          this.performanceMonitor.recordDuplicate();
          return;
        }
        textToCapture = normalizedText;
        console.log('[CC] Captured new segment:', normalizedText.substring(0, 50) + '...');
      }

      // Update the last processed text to the full current text
      this.lastProcessedText = normalizedText;

      // Create the caption entry
      const elapsed = Date.now() - this.startTime;
      const entry = {
        time: this.formatTime(elapsed),
        timestamp: elapsed,
        text: textToCapture
      };

      // Use CaptionBuffer instead of this.captions.push() (Phase 2)
      this.captionBuffer.add(entry);
      this.addToRecentTexts(textToCapture);

      // Record successful capture in performance monitor
      this.performanceMonitor.recordCapture();
      this.performanceMonitor.recordProcessingTime(processingStart);

      console.log(`[CC] [${entry.time}] ${textToCapture}`);
      this.updateOverlay(entry);

      // Clear pending text area after successful capture
      if (this.config.get('showPendingText')) {
        this.showPendingText('');
      }
    } catch (error) {
      // Phase 2: Error handling with user-friendly notification
      this.performanceMonitor.recordError('captureStableText');
      console.error('[CC] Caption capture error:', error);
      this.notification?.showError('Caption capture failed');
    }
  }

  showCCFoundIndicator(selector) {
    // Use notification system instead of custom indicator
    this.notification?.showSuccess(`CC capturing started! (${selector})`);
  }

  stop() {
    if (!this.isCapturing) {
      this.notification?.showWarning('Not capturing');
      return { success: false, message: 'Not capturing' };
    }

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Clear polling interval
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    // Remove visibility change handler
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }

    // Clear debounce timer and capture any pending text before stopping
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
      // Capture any pending text immediately before stopping
      if (this.pendingText) {
        this.captureStableText(this.pendingText);
      }
    }

    // Reset debounce state
    this.lastProcessedText = '';
    this.pendingText = '';

    // Clear pending text display
    this.showPendingText('');

    this.isCapturing = false;
    this.ccElement = null;
    this.ccSelector = null;
    this.textSelector = null;
    this.speakerSelector = null;

    // Reset selector manager for next session (Phase 2)
    this.selectorManager.reset();

    this.updateStatus('Stopped');

    // Update UI buttons
    const startBtn = document.getElementById('cc-start-btn');
    const stopBtn = document.getElementById('cc-stop-btn');
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;

    // Get statistics from CaptionBuffer and PerformanceMonitor (Phase 2)
    const bufferStats = this.captionBuffer.getStats();
    const perfStats = this.performanceMonitor.getStats();

    console.log(`[CC] Captured ${bufferStats.total} captions (${bufferStats.active} active, ${bufferStats.archived} archived)`);
    console.log('[CC] Performance stats:', perfStats);

    // Show detailed notification with stats
    const statsMessage = bufferStats.archived > 0
      ? `Capture stopped. ${bufferStats.total} captions (${bufferStats.archived} archived).`
      : `Capture stopped. ${bufferStats.total} captions captured.`;
    this.notification?.showInfo(statsMessage);

    return {
      success: true,
      message: 'Capture stopped',
      count: bufferStats.total,
      stats: { buffer: bufferStats, performance: perfStats }
    };
  }

  formatTime(ms) {
    const sec = Math.floor(ms / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  formatSRTTime(ms) {
    const sec = Math.floor(ms / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const milli = ms % 1000;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${milli.toString().padStart(3, '0')}`;
  }

  // =============================================================================
  // Phase 4: Download Preview Modal System
  // =============================================================================

  /**
   * Show download preview modal with statistics and options
   * @param {string} format - Initial format ('txt' or 'srt')
   */
  showDownloadPreview(format) {
    try {
      // Determine format from parameter or config
      const downloadFormat = format || this.config.get('defaultFormat');

      // Get captions and stats
      const captions = this.captionBuffer.getAll();
      const stats = this.captionBuffer.getStats();

      if (captions.length === 0) {
        this.notification?.showWarning('No captions to download');
        return;
      }

      // Generate preview content
      const content = this.generateDownloadContent(captions, downloadFormat);
      const fileSize = new Blob([content]).size;

      // Create and show modal
      this.createDownloadModal();
      this.openModal('cc-download-modal');

      // Populate stats
      document.getElementById('cc-download-count').textContent = stats.total;
      document.getElementById('cc-download-words').textContent = stats.words;
      document.getElementById('cc-download-duration').textContent = this.formatTime(stats.duration || 0);
      document.getElementById('cc-download-size').textContent = this.formatFileSize(fileSize);

      // Set format dropdown
      const formatSelect = document.getElementById('cc-download-format');
      if (formatSelect) {
        formatSelect.value = downloadFormat;
      }

      // Generate default filename
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
      const filenameInput = document.getElementById('cc-download-filename');
      if (filenameInput) {
        filenameInput.value = `meet-captions-${timestamp}`;
      }

      // Set timestamp checkbox based on config
      const timestampCheckbox = document.getElementById('cc-download-include-timestamps');
      if (timestampCheckbox) {
        timestampCheckbox.checked = this.config.get('includeTimestamps');
      }

      // Show/hide timestamp option (only for TXT)
      const timestampOption = document.getElementById('cc-download-timestamps-option');
      if (timestampOption) {
        timestampOption.style.display = downloadFormat === 'txt' ? 'block' : 'none';
      }

      // Generate and show preview (first 20 lines)
      this.updateDownloadPreview(content);

      console.log('[CC] Download preview opened for format:', downloadFormat);
    } catch (error) {
      this.performanceMonitor.recordError('showDownloadPreview');
      console.error('[CC] Download preview error:', error);
      this.notification?.showError('Failed to open download preview');
    }
  }

  /**
   * Create download modal HTML if it doesn't exist
   */
  createDownloadModal() {
    // Remove existing modal if any
    const existing = document.getElementById('cc-download-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'cc-download-modal';
    modal.className = 'cc-modal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="cc-modal-overlay"></div>
      <div class="cc-modal-content cc-modal-large">
        <div class="cc-modal-header">
          <h3>Download Captions</h3>
          <button class="cc-modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="cc-modal-body">
          <div class="cc-download-info">
            <div class="cc-download-stat">
              <strong>Captions:</strong> <span id="cc-download-count">0</span>
            </div>
            <div class="cc-download-stat">
              <strong>Words:</strong> <span id="cc-download-words">0</span>
            </div>
            <div class="cc-download-stat">
              <strong>Duration:</strong> <span id="cc-download-duration">00:00:00</span>
            </div>
            <div class="cc-download-stat">
              <strong>Size:</strong> <span id="cc-download-size">0 KB</span>
            </div>
          </div>

          <div class="cc-download-options">
            <div class="cc-setting">
              <label for="cc-download-format">Format</label>
              <select id="cc-download-format">
                <option value="txt">Text File (.txt)</option>
                <option value="srt">Subtitle File (.srt)</option>
              </select>
            </div>

            <div class="cc-setting">
              <label for="cc-download-filename">Filename</label>
              <input type="text" id="cc-download-filename"
                     placeholder="meet-captions-2024-12-17-143022">
            </div>

            <div class="cc-setting" id="cc-download-timestamps-option">
              <label>
                <input type="checkbox" id="cc-download-include-timestamps" checked>
                Include timestamps
              </label>
            </div>
          </div>

          <div class="cc-download-preview">
            <h4>Preview</h4>
            <div class="cc-preview-container">
              <pre id="cc-preview-content"></pre>
            </div>
          </div>
        </div>
        <div class="cc-modal-footer">
          <button id="cc-download-cancel" class="cc-btn cc-btn-secondary">Cancel</button>
          <button id="cc-download-confirm" class="cc-btn cc-btn-primary">Download</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Setup event listeners
    this.setupDownloadModalListeners();
  }

  /**
   * Setup event listeners for download modal
   */
  setupDownloadModalListeners() {
    const modal = document.getElementById('cc-download-modal');
    if (!modal) return;

    // Close button
    const closeBtn = modal.querySelector('.cc-modal-close');
    if (closeBtn) {
      closeBtn.onclick = () => this.closeModal('cc-download-modal');
    }

    // Overlay click to close
    const overlay = modal.querySelector('.cc-modal-overlay');
    if (overlay) {
      overlay.onclick = () => this.closeModal('cc-download-modal');
    }

    // Cancel button
    const cancelBtn = document.getElementById('cc-download-cancel');
    if (cancelBtn) {
      cancelBtn.onclick = () => this.closeModal('cc-download-modal');
    }

    // Confirm/Download button
    const confirmBtn = document.getElementById('cc-download-confirm');
    if (confirmBtn) {
      confirmBtn.onclick = () => this.confirmDownload();
    }

    // Format change listener
    const formatSelect = document.getElementById('cc-download-format');
    if (formatSelect) {
      formatSelect.onchange = (e) => this.onDownloadFormatChange(e.target.value);
    }

    // Timestamp checkbox change listener
    const timestampCheckbox = document.getElementById('cc-download-include-timestamps');
    if (timestampCheckbox) {
      timestampCheckbox.onchange = () => this.refreshDownloadPreview();
    }

    // ESC key to close
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal('cc-download-modal');
      }
    });
  }

  /**
   * Handle format dropdown change
   * @param {string} format - New format value
   */
  onDownloadFormatChange(format) {
    // Show/hide timestamp option (only for TXT)
    const timestampOption = document.getElementById('cc-download-timestamps-option');
    if (timestampOption) {
      timestampOption.style.display = format === 'txt' ? 'block' : 'none';
    }

    // Refresh preview with new format
    this.refreshDownloadPreview();
  }

  /**
   * Refresh the download preview based on current settings
   */
  refreshDownloadPreview() {
    const format = document.getElementById('cc-download-format')?.value || 'txt';
    const captions = this.captionBuffer.getAll();
    const content = this.generateDownloadContent(captions, format);

    // Update file size
    const fileSize = new Blob([content]).size;
    const sizeEl = document.getElementById('cc-download-size');
    if (sizeEl) {
      sizeEl.textContent = this.formatFileSize(fileSize);
    }

    // Update preview
    this.updateDownloadPreview(content);
  }

  /**
   * Update the preview content area
   * @param {string} content - Full content to preview
   */
  updateDownloadPreview(content) {
    const previewEl = document.getElementById('cc-preview-content');
    if (!previewEl) return;

    // Show first 20 lines
    const lines = content.split('\n').slice(0, 20);
    const totalLines = content.split('\n').length;
    let preview = lines.join('\n');

    if (totalLines > 20) {
      preview += `\n\n... and ${totalLines - 20} more lines`;
    }

    previewEl.textContent = preview;
  }

  /**
   * Generate download content based on format
   * @param {Array} captions - Array of caption objects
   * @param {string} format - 'txt' or 'srt'
   * @returns {string} Formatted content
   */
  generateDownloadContent(captions, format) {
    if (format === 'srt') {
      return this.generateSRT(captions);
    } else {
      // TXT format
      const timestampCheckbox = document.getElementById('cc-download-include-timestamps');
      const includeTimestamps = timestampCheckbox
        ? timestampCheckbox.checked
        : this.config.get('includeTimestamps');
      return this.generateTXT(captions, includeTimestamps);
    }
  }

  /**
   * Generate TXT format content
   * @param {Array} captions - Array of caption objects
   * @param {boolean} includeTimestamps - Whether to include timestamps
   * @returns {string} TXT formatted content
   */
  generateTXT(captions, includeTimestamps) {
    if (includeTimestamps) {
      return captions.map(c => `[${c.time}] ${c.text}`).join('\n');
    } else {
      return captions.map(c => c.text).join('\n');
    }
  }

  /**
   * Generate SRT format content
   * @param {Array} captions - Array of caption objects
   * @returns {string} SRT formatted content
   */
  generateSRT(captions) {
    return captions.map((c, i) => {
      const start = this.formatSRTTime(c.timestamp);
      const end = this.formatSRTTime(
        i < captions.length - 1 ? captions[i + 1].timestamp : c.timestamp + 2000
      );
      return `${i + 1}\n${start} --> ${end}\n${c.text}\n`;
    }).join('\n');
  }

  /**
   * Confirm and execute download
   */
  confirmDownload() {
    try {
      const format = document.getElementById('cc-download-format')?.value || 'txt';
      const filename = document.getElementById('cc-download-filename')?.value || 'meet-captions';
      const captions = this.captionBuffer.getAll();

      if (captions.length === 0) {
        this.notification?.showWarning('No captions to download');
        this.closeModal('cc-download-modal');
        return;
      }

      const content = this.generateDownloadContent(captions, format);
      const success = this.downloadFile(content, format, filename);

      if (success) {
        this.closeModal('cc-download-modal');
        this.notification?.showSuccess(`Downloaded ${filename}.${format}`);

        // Save format preference to config
        this.config.save('defaultFormat', format);

        // Save timestamp preference if TXT
        if (format === 'txt') {
          const includeTimestamps = document.getElementById('cc-download-include-timestamps')?.checked ?? true;
          this.config.save('includeTimestamps', includeTimestamps);
        }
      }
    } catch (error) {
      this.performanceMonitor.recordError('confirmDownload');
      console.error('[CC] Confirm download error:', error);
      this.notification?.showError('Download failed');
    }
  }

  /**
   * Download file with given content
   * @param {string} content - File content
   * @param {string} format - File format/extension
   * @param {string} filename - Filename without extension
   * @returns {boolean} Success status
   */
  downloadFile(content, format, filename) {
    try {
      const mimeTypes = {
        txt: 'text/plain',
        srt: 'application/x-subrip'
      };

      const blob = new Blob([content], { type: mimeTypes[format] || 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      this.performanceMonitor.recordDownload?.(format);
      console.log('[CC] Downloaded:', `${filename}.${format}`);
      return true;
    } catch (error) {
      console.error('[CC] Download error:', error);
      this.notification?.showError(`Download failed: ${error.message}`);
      this.performanceMonitor.recordError('download_error');
      return false;
    }
  }

  /**
   * Format file size for display
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size string
   */
  formatFileSize(bytes) {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
  }

  /**
   * Open a modal by ID
   * @param {string} modalId - Modal element ID
   */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      // Focus first interactive element
      const firstInput = modal.querySelector('input, select, button:not(.cc-modal-close)');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }
  }

  /**
   * Close a modal by ID
   * @param {string} modalId - Modal element ID
   */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
    }
  }

  /**
   * Close all open modals
   */
  closeAllModals() {
    const modals = document.querySelectorAll('.cc-modal');
    modals.forEach(modal => {
      modal.style.display = 'none';
    });
  }

  // =============================================================================
  // Legacy Download Methods (kept for backward compatibility)
  // =============================================================================

  downloadText() {
    try {
      // Use CaptionBuffer (Phase 2)
      const captions = this.captionBuffer ? this.captionBuffer.getAll() : [];

      if (captions.length === 0) {
        this.notification?.showError('No captions captured. Please start capture first and enable CC!');
        return;
      }

      const includeTimestamps = this.config.get('includeTimestamps');
      const content = captions
        .map(c => includeTimestamps ? `[${c.time}] ${c.text}` : c.text)
        .join('\n');

      this.download(content, 'text/plain', 'txt');

      const stats = this.captionBuffer.getStats();
      const message = stats.archived > 0
        ? `Downloaded ${stats.total} captions as TXT (${stats.archived} archived)`
        : `Downloaded ${stats.total} captions as TXT`;
      this.notification?.showSuccess(message);
    } catch (error) {
      this.performanceMonitor.recordError('downloadText');
      console.error('[CC] Download TXT error:', error);
      this.notification?.showError('Failed to download TXT file');
    }
  }

  downloadSRT() {
    try {
      // Use CaptionBuffer (Phase 2)
      const captions = this.captionBuffer ? this.captionBuffer.getAll() : [];

      if (captions.length === 0) {
        this.notification?.showError('No captions captured. Please start capture first and enable CC!');
        return;
      }

      const srt = captions.map((c, i) => {
        const start = this.formatSRTTime(c.timestamp);
        const end = this.formatSRTTime(
          i < captions.length - 1
            ? captions[i + 1].timestamp
            : c.timestamp + 2000
        );
        return `${i + 1}\n${start} --> ${end}\n${c.text}\n`;
      }).join('\n');

      this.download(srt, 'application/x-subrip', 'srt');

      const stats = this.captionBuffer.getStats();
      const message = stats.archived > 0
        ? `Downloaded ${stats.total} captions as SRT (${stats.archived} archived)`
        : `Downloaded ${stats.total} captions as SRT`;
      this.notification?.showSuccess(message);
    } catch (error) {
      this.performanceMonitor.recordError('downloadSRT');
      console.error('[CC] Download SRT error:', error);
      this.notification?.showError('Failed to download SRT file');
    }
  }

  download(content, type, ext) {
    try {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
      const filename = `meet-cc-${timestamp}.${ext}`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();

      URL.revokeObjectURL(url);
      console.log('[CC] Downloaded:', filename);
    } catch (error) {
      this.performanceMonitor.recordError('download');
      console.error('[CC] Download error:', error);
      throw error; // Re-throw to be caught by calling method
    }
  }

  updateOverlay(entry) {
    try {
      const panel = document.getElementById('cc-transcript-panel');
      if (!panel) return;

      const content = document.getElementById('cc-transcript-content');
      if (!content) return;

      const line = document.createElement('div');
      line.className = 'cc-line';
      line.innerHTML = `<span class="cc-time">[${entry.time}]</span> <span class="cc-text">${this.escapeHtml(entry.text)}</span>`;

      content.appendChild(line);
      content.scrollTop = content.scrollHeight;

      // Update count from CaptionBuffer (Phase 2)
      const count = document.getElementById('cc-count');
      if (count && this.captionBuffer) {
        const stats = this.captionBuffer.getStats();
        // Show total count, with archived indicator if any
        if (stats.archived > 0) {
          count.textContent = `${stats.total} (${stats.archived} archived)`;
        } else {
          count.textContent = stats.total;
        }
      }
    } catch (error) {
      // Phase 2: Error handling for DOM operations
      this.performanceMonitor.recordError('updateOverlay');
      console.error('[CC] Overlay update error:', error);
    }
  }

  updateStatus(text) {
    const status = document.getElementById('cc-status-text');
    if (status) status.textContent = text;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  getStatus() {
    // Use CaptionBuffer stats for comprehensive status (Phase 2)
    const bufferStats = this.captionBuffer ? this.captionBuffer.getStats() : { total: 0, active: 0, archived: 0 };
    const selectorStats = this.selectorManager.getStats();
    const perfStats = this.performanceMonitor.getStats();

    return {
      isCapturing: this.isCapturing,
      count: bufferStats.total,
      activeCount: bufferStats.active,
      archivedCount: bufferStats.archived,
      duration: this.isCapturing ? Date.now() - this.startTime : 0,
      words: bufferStats.words,
      chars: bufferStats.chars,
      selector: selectorStats.currentSelector,
      performance: {
        captureRate: perfStats.captureRate,
        duplicateRate: perfStats.duplicateRate,
        errorCount: perfStats.errorCount
      }
    };
  }

  /**
   * Start auto-detection for CC elements
   * Will automatically start capture when CC is enabled
   *
   * NOTE: Uses throttled observation to avoid interfering with Google Meet's
   * internal code. Heavy DOM observation can cause race conditions with
   * Meet's web-capture-extension-frames.js which relies on feature_flags.
   */
  startAutoDetection() {
    if (this.ccDetectionObserver) return;

    // Check if auto-start is enabled in config
    if (!this.config.get('autoStart')) {
      console.log('[CC] Auto-start disabled in config, skipping auto-detection');
      return;
    }

    console.log('[CC] Starting auto-detection for CC elements...');

    // Check immediately
    this.tryAutoStart();

    // Throttle the observer callback to avoid excessive DOM queries
    let lastCheck = 0;
    const THROTTLE_MS = 500; // Only check every 500ms at most

    // Set up observer to detect when CC is enabled
    // Use a more targeted approach - only observe direct children changes
    this.ccDetectionObserver = new MutationObserver((mutations) => {
      if (this.isCapturing || this.autoStarted) return;

      const now = Date.now();
      if (now - lastCheck < THROTTLE_MS) return;
      lastCheck = now;

      // Only process if mutations include relevant changes
      // (new nodes added that might be caption containers)
      const hasRelevantChanges = mutations.some(mutation => {
        if (mutation.type !== 'childList') return false;
        // Check if added nodes might be caption-related
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node;
            // Check for new caption selectors first, then legacy
            if (el.getAttribute) {
              // New selectors (priority)
              if (el.getAttribute('role') === 'region' ||
                  el.getAttribute('jsname') === 'dsyhDe' ||
                  el.classList?.contains('ygicle') ||
                  el.classList?.contains('VbkSUe') ||
                  el.classList?.contains('iOzk7')) {
                return true;
              }
              // Legacy selectors
              if (el.getAttribute('jscontroller') ||
                  el.classList?.contains('iTTPOb')) {
                return true;
              }
            }
          }
        }
        return false;
      });

      if (hasRelevantChanges) {
        // Use requestIdleCallback if available, otherwise setTimeout
        // This ensures we don't block the main thread during critical operations
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(() => this.tryAutoStart(), { timeout: 1000 });
        } else {
          setTimeout(() => this.tryAutoStart(), 100);
        }
      }
    });

    // Observe with less aggressive options
    // Only watch for childList changes, not subtree changes in the entire body
    // Instead, we'll rely more on periodic checking
    this.ccDetectionObserver.observe(document.body, {
      childList: true,
      subtree: false // Changed from true - less aggressive
    });

    // Also check periodically (this is more reliable and less intrusive than deep subtree observation)
    this.autoDetectInterval = setInterval(() => {
      if (!this.isCapturing && !this.autoStarted) {
        this.tryAutoStart();
      }
    }, 2000);
  }

  /**
   * Try to auto-start capture if CC is available
   * Phase 2: Uses SelectorManager for detection
   */
  tryAutoStart() {
    try {
      // Use SelectorManager instead of findCCElement() (Phase 2)
      const result = this.selectorManager.findCaption();
      if (result) {
        console.log('[CC] Auto-detected CC element! Starting capture...');
        this.autoStarted = true;

        // Stop auto-detection
        this.stopAutoDetection();

        // Start capture
        const startResult = this.start();
        if (startResult.success) {
          this.showAutoStartNotification();
        }
      }
    } catch (e) {
      this.performanceMonitor.recordError('tryAutoStart');
      console.warn('[CC] Error in tryAutoStart:', e);
    }
  }

  /**
   * Show notification that capture auto-started
   */
  showAutoStartNotification() {
    this.notification?.showInfo('CC auto-capture started!');
  }

  /**
   * Stop auto-detection
   */
  stopAutoDetection() {
    if (this.ccDetectionObserver) {
      this.ccDetectionObserver.disconnect();
      this.ccDetectionObserver = null;
    }
    if (this.autoDetectInterval) {
      clearInterval(this.autoDetectInterval);
      this.autoDetectInterval = null;
    }
  }

  // Debug function to help find CC elements
  debugDOMStructure() {
    console.log('=== [CC DEBUG] DOM Structure Analysis (v3.0.0) ===');
    console.log('[CC DEBUG] Based on actual Google Meet HTML structure');

    // PRIMARY selectors (based on actual Google Meet HTML)
    console.log('\n[CC DEBUG] === PRIMARY SELECTORS (Most Reliable) ===');
    const primarySelectors = [
      // Semantic HTML selectors (most reliable)
      { selector: '[role="region"][aria-label*="자막"]', description: 'Caption region (Korean)' },
      { selector: '[role="region"][aria-label*="caption"]', description: 'Caption region (English)' },
      { selector: '[role="region"][aria-label*="Caption"]', description: 'Caption region (English caps)' },
      // Container selectors
      { selector: '[jsname="dsyhDe"]', description: 'Caption outer container' },
      { selector: '.iOzk7', description: 'Caption wrapper class' },
      // Text element selectors
      { selector: '.ygicle.VbkSUe', description: 'Actual caption text (NEW)' },
      { selector: '.NWpY1d', description: 'Speaker name' },
      // UI elements to EXCLUDE
      { selector: '.IMKgW', description: 'UI buttons area (EXCLUDE!)' },
    ];

    primarySelectors.forEach(({ selector, description }) => {
      try {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          console.log(`  [FOUND] ${selector} - ${description}: ${elements.length} element(s)`);
          elements.forEach((el, i) => {
            const text = el.textContent?.trim().substring(0, 100) || '(empty)';
            const isUI = this.isUIText(text);
            console.log(`    [${i}] Text: "${text}" ${isUI ? '[UI - FILTERED]' : '[CAPTION]'}`);
            console.log(`    [${i}] aria-label: ${el.getAttribute('aria-label') || 'none'}`);
            console.log(`    [${i}] Element:`, el);
          });
        } else {
          console.log(`  [NOT FOUND] ${selector} - ${description}`);
        }
      } catch (e) {
        console.log(`  [ERROR] ${selector}: ${e.message}`);
      }
    });

    // LEGACY selectors (older Google Meet versions)
    console.log('\n[CC DEBUG] === LEGACY SELECTORS ===');
    const legacySelectors = [
      { selector: 'div[jscontroller="TEjq6e"]', description: 'Legacy caption controller' },
      { selector: 'div[jscontroller="D1tHje"]', description: 'Legacy caption controller alt' },
      { selector: 'div[jscontroller="KPn5nb"]', description: 'Caption controller (from HTML)' },
      { selector: '.iTTPOb', description: 'Legacy caption text' },
      { selector: '[jsname="YSg7wf"]', description: 'Legacy jsname' },
      { selector: '.a4cQT', description: 'Legacy class' },
    ];

    legacySelectors.forEach(({ selector, description }) => {
      try {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          console.log(`  [FOUND] ${selector} - ${description}: ${elements.length} element(s)`);
          elements.forEach((el, i) => {
            const text = el.textContent?.trim().substring(0, 100) || '(empty)';
            const isUI = this.isUIText(text);
            console.log(`    [${i}] Text: "${text}" ${isUI ? '[UI - FILTERED]' : '[CAPTION]'}`);
          });
        } else {
          console.log(`  [NOT FOUND] ${selector} - ${description}`);
        }
      } catch (e) {
        console.log(`  [ERROR] ${selector}: ${e.message}`);
      }
    });

    // Test extraction with actual selectors
    console.log('\n[CC DEBUG] === EXTRACTION TEST ===');
    try {
      const captionRegion = document.querySelector('[role="region"][aria-label*="자막"]') ||
                           document.querySelector('[role="region"][aria-label*="caption"]') ||
                           document.querySelector('[jsname="dsyhDe"]');
      if (captionRegion) {
        console.log('[CC DEBUG] Found caption region:', captionRegion);

        const captionText = captionRegion.querySelector('.ygicle.VbkSUe');
        if (captionText) {
          console.log('[CC DEBUG] Caption text element found:', captionText);
          console.log('[CC DEBUG] Caption text:', captionText.textContent?.trim());
        } else {
          console.log('[CC DEBUG] Caption text element .ygicle.VbkSUe NOT found in region');
        }

        const speaker = captionRegion.querySelector('.NWpY1d');
        if (speaker) {
          console.log('[CC DEBUG] Speaker element found:', speaker);
          console.log('[CC DEBUG] Speaker name:', speaker.textContent?.trim());
        }

        const uiButtons = captionRegion.querySelector('.IMKgW');
        if (uiButtons) {
          console.log('[CC DEBUG] UI buttons area found (should be excluded):', uiButtons);
          console.log('[CC DEBUG] UI buttons text:', uiButtons.textContent?.trim().substring(0, 50));
        }
      } else {
        console.log('[CC DEBUG] No caption region found with primary selectors');
      }
    } catch (e) {
      console.log('[CC DEBUG] Extraction test error:', e.message);
    }

    // Look for potential caption containers at the bottom of the page
    console.log('\n[CC DEBUG] === POSITION-BASED SCAN ===');
    const allDivs = document.querySelectorAll('div');
    let found = 0;
    allDivs.forEach(div => {
      try {
        const rect = div.getBoundingClientRect();
        const text = div.textContent?.trim() || '';

        // Check if it's in the lower third and has text
        if (rect.bottom > window.innerHeight * 0.7 &&
            text.length > 10 &&
            text.length < 500 &&
            !div.closest('#cc-overlay') &&
            !div.closest('.IMKgW') && // Exclude UI buttons
            found < 10) {
          const isUI = this.isUIText(text);
          console.log(`  [CANDIDATE] Bottom: ${rect.bottom.toFixed(0)}, Text: "${text.substring(0, 80)}..." ${isUI ? '[UI]' : '[OK]'}`);
          console.log(`    jscontroller: ${div.getAttribute('jscontroller') || 'none'}`);
          console.log(`    jsname: ${div.getAttribute('jsname') || 'none'}`);
          console.log(`    role: ${div.getAttribute('role') || 'none'}`);
          console.log(`    aria-label: ${div.getAttribute('aria-label') || 'none'}`);
          console.log(`    class: ${div.className || 'none'}`);
          console.log(`    Element:`, div);
          found++;
        }
      } catch (e) {
        // Ignore errors
      }
    });

    console.log('\n=== [CC DEBUG] Analysis Complete ===');
    console.log('[CC DEBUG] Recommended selectors in order of priority:');
    console.log('  1. [role="region"][aria-label*="자막"] or [aria-label*="caption"]');
    console.log('  2. [jsname="dsyhDe"]');
    console.log('  3. .ygicle.VbkSUe (caption text)');
    console.log('  4. .NWpY1d (speaker name)');
    console.log('  5. EXCLUDE: .IMKgW (UI buttons)');
    return 'Check console for debug output';
  }
}

// Create instance
const capturer = new SimpleCCCapturer();

// Delay before starting extension features (ms)
// This allows Google Meet to fully initialize before we start observing
const MEET_INIT_DELAY = 3000;

// Create simple overlay UI
async function createSimpleUI() {
  const existing = document.getElementById('cc-overlay');
  if (existing) existing.remove();

  // Initialize capturer (load config)
  await capturer.init();

  const overlay = document.createElement('div');
  overlay.id = 'cc-overlay';
  overlay.innerHTML = `
    <div class="cc-header">
      <span class="cc-title">CC Capture</span>
      <div class="cc-controls">
        <button id="cc-start-btn" class="cc-btn cc-btn-start">Start</button>
        <button id="cc-stop-btn" class="cc-btn cc-btn-stop" disabled>Stop</button>
        <button id="cc-download-txt" class="cc-btn">TXT</button>
        <button id="cc-download-srt" class="cc-btn">SRT</button>
        <button id="cc-debug-btn" class="cc-btn cc-btn-debug" title="Debug DOM">?</button>
        <button id="cc-minimize" class="cc-btn">-</button>
      </div>
    </div>
    <div class="cc-status">
      <span id="cc-status-text">Waiting for CC...</span> |
      <span>Captured: <span id="cc-count">0</span></span>
    </div>
    <div id="cc-transcript-panel" class="cc-panel">
      <div id="cc-pending-area" class="cc-pending" style="display: none;">
        <div class="cc-pending-label">Current:</div>
        <div id="cc-pending-text" class="cc-pending-text"></div>
      </div>
      <div id="cc-transcript-content" class="cc-content">
        <div class="cc-placeholder">Enable CC in Google Meet. Capture will start automatically.<br>Or click "Start" to manually begin.</div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Apply minimized state from config
  if (capturer.config.get('overlayMinimized')) {
    const panel = document.getElementById('cc-transcript-panel');
    const btn = document.getElementById('cc-minimize');
    if (panel) panel.style.display = 'none';
    if (btn) btn.textContent = '+';
  }

  // Add event listeners
  document.getElementById('cc-start-btn').onclick = () => {
    const result = capturer.start();
    if (!result.success) {
      // Notification is already shown by start()
    }
  };

  document.getElementById('cc-stop-btn').onclick = () => {
    capturer.stop();
  };

  // Download buttons now show preview modal instead of direct download
  document.getElementById('cc-download-txt').onclick = () => {
    if (capturer.captionBuffer.getCount() === 0) {
      capturer.notification.showWarning('No captions to download');
      return;
    }
    capturer.showDownloadPreview('txt');
  };

  document.getElementById('cc-download-srt').onclick = () => {
    if (capturer.captionBuffer.getCount() === 0) {
      capturer.notification.showWarning('No captions to download');
      return;
    }
    capturer.showDownloadPreview('srt');
  };

  document.getElementById('cc-debug-btn').onclick = () => {
    capturer.debugDOMStructure();
    capturer.notification?.showInfo('Debug output printed to console (F12)');
  };

  document.getElementById('cc-minimize').onclick = async () => {
    const panel = document.getElementById('cc-transcript-panel');
    const btn = document.getElementById('cc-minimize');
    if (panel.style.display === 'none') {
      panel.style.display = 'block';
      btn.textContent = '-';
      await capturer.config.save('overlayMinimized', false);
    } else {
      panel.style.display = 'none';
      btn.textContent = '+';
      await capturer.config.save('overlayMinimized', true);
    }
  };

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+D - Open download preview with default format
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      if (capturer.captionBuffer && capturer.captionBuffer.getCount() > 0) {
        capturer.showDownloadPreview();
      } else {
        capturer.notification?.showWarning('No captions to download');
      }
    }

    // Ctrl+Shift+S - Start/Stop capture toggle
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      if (capturer.isCapturing) {
        capturer.stop();
      } else {
        capturer.start();
      }
    }

    // Escape - Close any open modal
    if (e.key === 'Escape') {
      capturer.closeAllModals();
    }
  });

  // Start auto-detection for CC elements
  // This will automatically start capture when CC is enabled
  // IMPORTANT: We delay this significantly to avoid interfering with Google Meet's
  // own initialization, which can cause errors in their web-capture-extension-frames.js
  console.log('[CC] UI created, will start auto-detection after Google Meet fully initializes...');
  setTimeout(() => {
    console.log('[CC] Starting auto-detection now...');
    capturer.startAutoDetection();
  }, MEET_INIT_DELAY); // Wait for Google Meet to fully initialize
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createSimpleUI);
} else {
  createSimpleUI();
}

// Handle messages from popup/background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case MessageTypes.START_CAPTURE:
      sendResponse(capturer.start());
      break;
    case MessageTypes.STOP_CAPTURE:
      sendResponse(capturer.stop());
      break;
    case MessageTypes.GET_STATUS:
      sendResponse(capturer.getStatus());
      break;
    case MessageTypes.DOWNLOAD_TEXT:
      capturer.downloadText();
      sendResponse({ success: true });
      break;
    case MessageTypes.DOWNLOAD_SRT:
      capturer.downloadSRT();
      sendResponse({ success: true });
      break;
  }
  return true;
});

console.log('[CC Capturer] Simple CC Capturer v3.0.0 loaded (Phase 4: Enhanced Download Features)');
