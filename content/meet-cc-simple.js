/**
 * Simple Google Meet CC Capturer
 * No API calls - just capture CC text and download
 *
 * Version 3.5.7 - Overwrite Pattern: Simple & Powerful
 *
 * Philosophy (v3.5.7):
 * - OVERWRITE instead of APPEND - eliminates caption overlap
 * - Current = volatile buffer (always latest text)
 * - History = permanent storage (saved every 30s)
 * - No accumulation, no complex deduplication
 * - Simple exact-match duplicate check only
 *
 * What changed from v3.5.6:
 * - REMOVED: accumulatedChunkText, previousChunkSpeaker variables
 * - REMOVED: Complex speaker change detection logic
 * - REMOVED: Progressive text extraction
 * - SIMPLIFIED: currentChunkText always overwrites (never appends)
 * - ADDED: Exception handling for non-Meet pages (no console spam)
 * - RESULT: Caption overlap issue completely eliminated
 *
 * Previous (v3.5.6):
 * - Multi-speaker support with text accumulation
 * - Complex speaker change detection
 * - Had caption overlap issues due to accumulation
 *
 * Previous (v3.5.5):
 * - Incremental save with prefix matching
 * - Still had overlap issues
 *
 * Previous (v3.5.0):
 * - Auto-save without restarting capture
 * - Delta-based processing
 *
 * Previous (v3.4.4):
 * - Jeff Dean style: correctness first
 * - Extensive logging
 *
 * Previous (v3.4.0):
 * - Timestamp-based filtering
 * - Progress bar direction fixed
 *
 * Core Features:
 * - Real-time CC capture from Google Meet
 * - Auto-save every 30 seconds (no capture interruption)
 * - Multilingual support (English/Korean)
 * - Download as TXT or SRT
 * - Copy to clipboard (Ctrl+Shift+C)
 * - Meeting history management
 * - Persistent storage across sessions
 * - Memory management (circular buffer)
 * - Performance monitoring
 * - Configurable settings
 * - Keyboard shortcuts
 */

// Message Types
const MessageTypes = {
  START_CAPTURE: 'START_CAPTURE',
  STOP_CAPTURE: 'STOP_CAPTURE',
  GET_STATUS: 'GET_STATUS',
  DOWNLOAD_TEXT: 'DOWNLOAD_TEXT',
  DOWNLOAD_SRT: 'DOWNLOAD_SRT'
};

// =============================================================================
// Language Support - Multilingual UI Text
// =============================================================================
const LANGUAGES = {
  en: {
    title: 'CC Capture',
    guideTitle: 'Quick Guide',
    guideSteps: [
      'Enable CC in Google Meet',
      'Captions auto-capture',
      'Download or copy when done'
    ],
    shortcutsTitle: 'Shortcuts',
    shortcuts: {
      download: 'Download',
      copy: 'Copy'
    },
    status: {
      waiting: 'Waiting for captions...',
      capturing: 'Auto-capturing...',
      stopped: 'Capture stopped'
    },
    stats: {
      captions: 'Captions',
      words: 'Words',
      duration: 'Duration'
    },
    buttons: {
      txt: 'TXT',
      srt: 'SRT',
      copy: 'Copy',
      settings: 'Settings',
      help: 'Help'
    },
    labels: {
      current: 'Current:',
      pending: 'Pending'
    },
    notifications: {
      copied: 'Copied to clipboard!',
      copyFailed: 'Copy failed',
      downloaded: 'Downloaded successfully',
      noCaptions: 'No captions to copy',
      autoStarted: 'CC auto-capture started!',
      sessionRestored: 'Previous session restored',
      sessionSaved: 'Session saved'
    },
    modal: {
      downloadTitle: 'Download Captions',
      format: 'Format',
      filename: 'Filename',
      includeTimestamps: 'Include timestamps',
      preview: 'Preview',
      cancel: 'Cancel',
      download: 'Download',
      captionsLabel: 'Captions:',
      wordsLabel: 'Words:',
      durationLabel: 'Duration:',
      sizeLabel: 'Size:'
    },
    placeholder: 'Waiting for captions...',
    helpTitle: 'Help',
    helpContent: [
      'This extension captures Google Meet closed captions automatically.',
      'Make sure to enable CC (Closed Captions) in Google Meet first.',
      'Captions are saved automatically and persist across page reloads.',
      'Use the download buttons to export as TXT or SRT format.'
    ],
    settingsTitle: 'Settings',
    settingLabels: {
      debounceDelay: 'Capture delay (ms)',
      maxCaptions: 'Max captions',
      showPendingText: 'Show pending text',
      includeSpeaker: 'Include speaker name',
      autoStart: 'Auto-start capture'
    }
  },
  ko: {
    title: 'CC 캡처',
    guideTitle: '간단 가이드',
    guideSteps: [
      'Google Meet에서 CC 활성화',
      '자막 자동 캡처됨',
      '완료 후 다운로드 또는 복사'
    ],
    shortcutsTitle: '단축키',
    shortcuts: {
      download: '다운로드',
      copy: '복사'
    },
    status: {
      waiting: '자막 대기 중...',
      capturing: '자동 캡처 중...',
      stopped: '캡처 중지됨'
    },
    stats: {
      captions: '자막',
      words: '단어',
      duration: '시간'
    },
    buttons: {
      txt: 'TXT',
      srt: 'SRT',
      copy: '복사',
      settings: '설정',
      help: '도움말'
    },
    labels: {
      current: '현재:',
      pending: '대기 중'
    },
    notifications: {
      copied: '클립보드에 복사됨!',
      copyFailed: '복사 실패',
      downloaded: '다운로드 완료',
      noCaptions: '복사할 자막이 없습니다',
      autoStarted: 'CC 자동 캡처 시작됨!',
      sessionRestored: '이전 세션 복원됨',
      sessionSaved: '세션 저장됨'
    },
    modal: {
      downloadTitle: '자막 다운로드',
      format: '형식',
      filename: '파일명',
      includeTimestamps: '타임스탬프 포함',
      preview: '미리보기',
      cancel: '취소',
      download: '다운로드',
      captionsLabel: '자막:',
      wordsLabel: '단어:',
      durationLabel: '시간:',
      sizeLabel: '크기:'
    },
    placeholder: '자막 대기 중...',
    helpTitle: '도움말',
    helpContent: [
      '이 확장 프로그램은 Google Meet 자막을 자동으로 캡처합니다.',
      '먼저 Google Meet에서 CC(자막)를 활성화하세요.',
      '자막은 자동으로 저장되며 페이지 새로고침 후에도 유지됩니다.',
      '다운로드 버튼을 사용하여 TXT 또는 SRT 형식으로 내보내세요.'
    ],
    settingsTitle: '설정',
    settingLabels: {
      debounceDelay: '캡처 지연 (ms)',
      maxCaptions: '최대 자막 수',
      showPendingText: '대기 중인 텍스트 표시',
      includeSpeaker: '발화자 이름 포함',
      autoStart: '자동 캡처 시작'
    }
  }
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
// PersistentStorage - Auto-save to chrome.storage.local
// =============================================================================
class PersistentStorage {
  constructor() {
    this.STORAGE_KEY = 'cc_recording_history';
    this.CURRENT_SESSION_KEY = 'cc_current_session';
    this.currentSessionId = null;
    this.saveDebounceTimer = null;
    this.SAVE_DEBOUNCE_MS = 2000; // Debounce saves to avoid excessive writes

    // Auto-save timer (30 seconds interval)
    this.autoSaveInterval = null;
    this.AUTO_SAVE_INTERVAL_MS = 30000; // 30 seconds
    this.lastSavedCount = 0; // Track last saved caption count to detect changes
    this.getCaptionsCallback = null; // Callback to get current captions
    this.capturerInstance = null; // Reference to SimpleCCCapturer for auto-save flush
  }

  /**
   * Start a new recording session
   */
  async startNewSession() {
    this.currentSessionId = `session_${Date.now()}`;
    this.lastSavedCount = 0; // Reset saved count for new session

    const sessionData = {
      id: this.currentSessionId,
      startTime: Date.now(),
      captions: [],
      metadata: {
        url: window.location.href,
        title: document.title
      }
    };

    await this.saveSession(sessionData);
    await chrome.storage.local.set({ [this.CURRENT_SESSION_KEY]: this.currentSessionId });

    console.log('[PersistentStorage] New session started:', this.currentSessionId);
    return this.currentSessionId;
  }

  /**
   * Save session data to storage
   */
  async saveSession(sessionData) {
    try {
      const history = await this.loadHistory();
      history[sessionData.id] = sessionData;
      await chrome.storage.local.set({ [this.STORAGE_KEY]: history });
    } catch (error) {
      console.error('[PersistentStorage] Save session error:', error);
    }
  }

  /**
   * Load all session history
   */
  async loadHistory() {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      return result[this.STORAGE_KEY] || {};
    } catch (error) {
      console.error('[PersistentStorage] Load history error:', error);
      return {};
    }
  }

  /**
   * Get current session data
   */
  async getCurrentSession() {
    if (!this.currentSessionId) {
      // Try to restore from storage
      const result = await chrome.storage.local.get(this.CURRENT_SESSION_KEY);
      this.currentSessionId = result[this.CURRENT_SESSION_KEY];
    }

    if (!this.currentSessionId) return null;

    const history = await this.loadHistory();
    return history[this.currentSessionId] || null;
  }

  /**
   * Update current session with new captions (debounced)
   */
  updateSessionDebounced(captions) {
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }

    this.saveDebounceTimer = setTimeout(async () => {
      // Only save if there are new captions since last save
      if (captions.length > this.lastSavedCount) {
        await this.updateSession(captions);
        this.lastSavedCount = captions.length;
        console.log(`[PersistentStorage] Debounced save: ${captions.length} captions`);
      }
    }, this.SAVE_DEBOUNCE_MS);
  }

  /**
   * Update current session with new captions immediately
   */
  async updateSession(captions) {
    if (!this.currentSessionId) return;

    try {
      const session = await this.getCurrentSession();
      if (session) {
        session.captions = captions;
        session.lastUpdate = Date.now();
        await this.saveSession(session);
        console.log('[PersistentStorage] Session updated with', captions.length, 'captions');
      }
    } catch (error) {
      console.error('[PersistentStorage] Update session error:', error);
    }
  }

  /**
   * Check if there's a restorable session
   */
  async hasRestorableSession() {
    const session = await this.getCurrentSession();
    if (!session) return false;

    // Check if session is from the same URL and has captions
    const isSameUrl = session.metadata?.url === window.location.href;
    const hasCaptions = session.captions && session.captions.length > 0;
    const isRecent = session.lastUpdate && (Date.now() - session.lastUpdate) < 24 * 60 * 60 * 1000; // Within 24 hours

    return isSameUrl && hasCaptions && isRecent;
  }

  /**
   * Restore captions from previous session
   */
  async restoreSession() {
    const session = await this.getCurrentSession();
    if (session && session.captions) {
      return session.captions;
    }
    return [];
  }

  /**
   * Clear current session
   */
  async clearCurrentSession() {
    if (this.currentSessionId) {
      const history = await this.loadHistory();
      delete history[this.currentSessionId];
      await chrome.storage.local.set({ [this.STORAGE_KEY]: history });
      await chrome.storage.local.remove(this.CURRENT_SESSION_KEY);
      this.currentSessionId = null;
    }
  }

  /**
   * Get all saved sessions
   */
  async getAllSessions() {
    const history = await this.loadHistory();
    return Object.values(history).sort((a, b) => b.startTime - a.startTime);
  }

  /**
   * Delete a specific session
   */
  async deleteSession(sessionId) {
    const history = await this.loadHistory();
    delete history[sessionId];
    await chrome.storage.local.set({ [this.STORAGE_KEY]: history });
  }

  /**
   * Clear all session history
   */
  async clearAllHistory() {
    await chrome.storage.local.remove([this.STORAGE_KEY, this.CURRENT_SESSION_KEY]);
    this.currentSessionId = null;
  }

  /**
   * Start automatic periodic save (every 30 seconds)
   */
  startAutoSave(getCaptionsCallback, capturerInstance) {
    // Stop any existing timer
    this.stopAutoSave();

    this.getCaptionsCallback = getCaptionsCallback;
    this.capturerInstance = capturerInstance;
    this.lastSavedCount = 0;

    console.log('[PersistentStorage] Starting auto-save (30s interval)');

    this.autoSaveInterval = setInterval(async () => {
      await this.performAutoSave();
    }, this.AUTO_SAVE_INTERVAL_MS);
  }

  /**
   * Perform auto-save without restarting capture
   * v3.5.3: Now flushes chunk to buffer before saving
   */
  async performAutoSave() {
    try {
      console.log('[PersistentStorage] ⏰ Auto-save triggered (30s elapsed)');

      if (!this.capturerInstance) {
        console.warn('[PersistentStorage] Auto-save skipped: no capturer instance');
        return;
      }

      if (!this.currentSessionId) {
        console.warn('[PersistentStorage] Auto-save skipped: no currentSessionId');
        return;
      }

      // v3.5.3: First flush any pending text to chunk
      this.capturerInstance.flushPendingText();

      // v3.5.3: Then flush the chunk to buffer with timestamp and speaker
      const chunkSaved = this.capturerInstance.flushChunkToBuffer();
      if (chunkSaved) {
        console.log('[PersistentStorage] ✓ Chunk flushed to buffer');
      }

      if (this.getCaptionsCallback) {
        const captions = this.getCaptionsCallback();
        // v3.5.3: Always update session to persist chunk
        await this.updateSession(captions);
        this.lastSavedCount = captions.length;
        console.log('[PersistentStorage] Session updated via auto-save');
      }

      // Dispatch custom event for UI update
      window.dispatchEvent(new CustomEvent('cc-auto-saved', {
        detail: { count: this.capturerInstance.captionBuffer.getCount(), newCount: 0 }
      }));

      console.log('[PersistentStorage] ✓ Auto-save completed');
    } catch (error) {
      console.error('[PersistentStorage] Auto-save error:', error);
    }
  }

  /**
   * Stop automatic periodic save
   */
  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      console.log('[PersistentStorage] Auto-save stopped');
    }
  }

  /**
   * Force immediate save (called on stop)
   */
  async forceSave() {
    if (this.getCaptionsCallback && this.currentSessionId) {
      const captions = this.getCaptionsCallback();
      await this.updateSession(captions);
      this.lastSavedCount = captions.length;
      console.log('[PersistentStorage] Force save: final state saved');
    }
  }
}

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
      guideCollapsed: false,
      language: 'en', // Default language

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
// CaptionBuffer - Circular Buffer for Memory Management
// =============================================================================
class CaptionBuffer {
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
    this.captions = [];
    this.archivedCount = 0;
  }

  add(caption) {
    this.captions.push(caption);

    if (this.captions.length > this.maxSize) {
      const toArchive = this.captions.length - this.maxSize;
      this.captions.splice(0, toArchive);
      this.archivedCount += toArchive;
      console.log(`[CaptionBuffer] Archived ${toArchive} captions to prevent memory leak`);
    }
  }

  getAll() {
    return this.captions;
  }

  getCount() {
    return this.captions.length + this.archivedCount;
  }

  getActiveCount() {
    return this.captions.length;
  }

  getLast(n) {
    return this.captions.slice(-n);
  }

  isEmpty() {
    return this.captions.length === 0;
  }

  clear() {
    this.captions = [];
    this.archivedCount = 0;
  }

  /**
   * Restore captions from persistent storage
   */
  restore(captions) {
    this.captions = [...captions];
    this.archivedCount = 0;
  }

  getStats() {
    const text = this.captions.map(c => c.text).join(' ');
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    const chars = text.length;

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

  setMaxSize(newMaxSize) {
    this.maxSize = newMaxSize;
    if (this.captions.length > this.maxSize) {
      const toArchive = this.captions.length - this.maxSize;
      this.captions.splice(0, toArchive);
      this.archivedCount += toArchive;
    }
  }
}

// =============================================================================
// SelectorManager - Reliable Selector Management
// =============================================================================
class SelectorManager {
  constructor() {
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

    this.excludeSelectors = [
      '[role="dialog"]',
      '[role="menu"]',
      '[role="menubar"]',
      '[role="button"]',
      '[role="toolbar"]',
      '[role="tablist"]',
      '[role="listbox"]',
      'button',
      '.IMKgW',
      '[data-tooltip]',
      '[aria-label*="Leave"]',
      '[aria-label*="mute"]',
      '[aria-label*="camera"]',
      '[data-panel-id]',
      '.VfPpkd-Bz112c-LgbsSe'
    ];
  }

  findCaption() {
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

    for (const selector of this.selectors) {
      try {
        const result = this.trySelector(selector);
        if (result && this.validateCaption(result)) {
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
        console.debug(`[SelectorManager] Selector ${selector.name} failed:`, error.message);
      }
    }

    return null;
  }

  trySelector(selector) {
    let containerElement = null;

    if (selector.container) {
      const containers = document.querySelectorAll(selector.container);
      for (const container of containers) {
        if (!this.isExcluded(container)) {
          const textEl = container.querySelector(selector.text);
          if (textEl && textEl.textContent?.trim()) {
            containerElement = container;
            break;
          }
        }
      }
    } else {
      const textElements = document.querySelectorAll(selector.text);
      for (const el of textElements) {
        if (!this.isExcluded(el) && el.textContent?.trim()) {
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

  isExcluded(element) {
    if (!element) return true;

    for (const selector of this.excludeSelectors) {
      try {
        if (element.closest(selector)) {
          return true;
        }
      } catch (e) {
        // Ignore closest() errors
      }
    }

    if (element.closest('#cc-overlay')) return true;

    return false;
  }

  validateCaption(result) {
    if (!result || !result.element) return false;

    try {
      const text = result.element.textContent?.trim() || '';

      if (text.length < 3) return false;
      if (text.length > 2000) return false;

      const rect = result.element.getBoundingClientRect();
      if (rect.bottom < window.innerHeight * 0.4) return false;
      if (rect.top > window.innerHeight) return false;

      if (rect.width === 0 || rect.height === 0) return false;

      return true;
    } catch (error) {
      console.warn('[SelectorManager] Validation error:', error.message);
      return false;
    }
  }

  getStats() {
    return {
      currentSelector: this.lastWorkingSelector?.name || 'none',
      selectorSwitchCount: this.selectorSwitchCount,
      availableSelectors: this.selectors.length
    };
  }

  reset() {
    this.lastWorkingSelector = null;
  }
}

// =============================================================================
// PerformanceMonitor - Performance Metrics Tracking
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

  startSession() {
    this.metrics.sessionStartTime = Date.now();
  }

  recordCapture() {
    this.metrics.captureCount++;
    this.metrics.lastCaptureTime = Date.now();
  }

  recordDuplicate() {
    this.metrics.duplicateCount++;
  }

  recordError(context = '') {
    this.metrics.errorCount++;
    console.warn(`[PerformanceMonitor] Error recorded: ${context}`);
  }

  recordSelectorSwitch() {
    this.metrics.selectorSwitchCount++;
  }

  recordProcessingTime(startTime) {
    const elapsed = Date.now() - startTime;
    this.metrics.processingTimeTotal += elapsed;
    this.metrics.processingTimeCount++;
  }

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
      captureRate,
      duplicateRate
    };
  }

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
    const existing = document.getElementById('cc-notifications');
    if (existing) existing.remove();

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

    setTimeout(() => notification.classList.add('show'), 10);

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
    this.autoStarted = false;
    this.includeSpeakerName = true;
    this.speakerSelector = null;
    this.lastSpeaker = '';

    // Debouncing for streaming captions
    this.debounceTimer = null;
    this.lastSpeaker = '';
    this.pendingText = '';

    // v3.5.7: Overwrite pattern - simple and powerful
    // currentPendingText: always overwrite with latest (for UI display)
    // lastSavedText: track what was last saved to prevent duplicates
    this.currentPendingText = '';
    this.lastSavedText = '';

    // Core components
    this.config = new CCConfig();
    this.notification = null;
    this.captionBuffer = null;
    this.selectorManager = new SelectorManager();
    this.performanceMonitor = new PerformanceMonitor();

    // Persistent storage
    this.persistentStorage = new PersistentStorage();

    // Language support
    this.currentLanguage = 'en';

    // Duration timer
    this.durationInterval = null;

    // Auto-save countdown timer
    this.autoSaveCountdownInterval = null;
    this.autoSaveSecondsRemaining = 30;

    // v3.5.7: Simplified chunk tracking - no accumulation
    // currentChunkText: always overwrite (not accumulate)
    // currentChunkSpeaker: current speaker for this chunk
    // chunkStartTime: when current chunk started
    this.currentChunkText = '';
    this.currentChunkSpeaker = '';
    this.chunkStartTime = 0;
  }

  /**
   * Get localized text
   */
  t(path) {
    const keys = path.split('.');
    let value = LANGUAGES[this.currentLanguage];
    for (const key of keys) {
      if (value && value[key] !== undefined) {
        value = value[key];
      } else {
        // Fallback to English
        value = LANGUAGES.en;
        for (const k of keys) {
          if (value && value[k] !== undefined) {
            value = value[k];
          } else {
            return path; // Return path if not found
          }
        }
        break;
      }
    }
    return value;
  }

  /**
   * Switch language
   */
  async switchLanguage(lang) {
    if (LANGUAGES[lang]) {
      this.currentLanguage = lang;
      await this.config.save('language', lang);
      this.updateUILanguage();
      console.log('[CC] Language switched to:', lang);
    }
  }

  /**
   * Toggle language between EN and KO
   */
  async toggleLanguage() {
    const newLang = this.currentLanguage === 'en' ? 'ko' : 'en';
    await this.switchLanguage(newLang);
  }

  /**
   * Update all UI text with current language
   */
  updateUILanguage() {
    // Update title
    const title = document.querySelector('.cc-title');
    if (title) title.textContent = this.t('title');

    // Update status text
    const statusText = document.getElementById('cc-status-text');
    if (statusText) {
      if (this.isCapturing) {
        statusText.textContent = this.t('status.capturing');
      } else {
        statusText.textContent = this.t('status.waiting');
      }
    }

    // Update pending label
    const pendingLabel = document.querySelector('.cc-pending-label');
    if (pendingLabel) pendingLabel.textContent = this.t('labels.current');

    // Update buttons
    const copyBtn = document.getElementById('cc-copy-btn');
    if (copyBtn) {
      copyBtn.innerHTML = `<span class="cc-btn-icon-emoji">&#128203;</span> ${this.t('buttons.copy')}`;
    }

    // Update placeholder
    const placeholder = document.querySelector('.cc-placeholder');
    if (placeholder) placeholder.textContent = this.t('placeholder');

    // Update language toggle button - show target language (language to switch TO)
    const langToggle = document.getElementById('cc-lang-toggle');
    if (langToggle) {
      // Show the language we can switch TO, not the current language
      const targetLang = this.currentLanguage === 'en' ? 'KO' : 'EN';
      langToggle.textContent = targetLang;
      langToggle.title = this.currentLanguage === 'en' ? '한국어로 전환' : 'Switch to English';
    }
  }

  /**
   * Initialize async components
   */
  async init() {
    try {
      await this.config.load();

      this.includeSpeakerName = this.config.get('includeSpeaker');
      this.currentLanguage = this.config.get('language');

      const maxCaptions = this.config.get('maxCaptions');
      this.captionBuffer = new CaptionBuffer(maxCaptions);

      this.notification = new CCNotification();

      // Check for restorable session
      const hasRestorable = await this.persistentStorage.hasRestorableSession();
      if (hasRestorable) {
        const captions = await this.persistentStorage.restoreSession();
        if (captions.length > 0) {
          this.captionBuffer.restore(captions);
          this.notification.showInfo(this.t('notifications.sessionRestored') + ` (${captions.length})`);
          console.log('[CC] Restored', captions.length, 'captions from previous session');
        }
      }

      console.log('[CC] Capturer initialized with config');
    } catch (error) {
      console.error('[CC] Initialization error:', error);
      this.captionBuffer = new CaptionBuffer(1000);
      this.notification = new CCNotification();
    }
  }

  get captions() {
    return this.captionBuffer ? this.captionBuffer.getAll() : [];
  }

  get DEBOUNCE_DELAY() {
    return this.config.get('debounceDelay');
  }

  isUIText(text) {
    if (!text || text.trim().length === 0) return true;

    const trimmed = text.trim();

    for (const pattern of UI_TEXT_PATTERNS) {
      if (pattern.test(trimmed)) {
        console.log('[CC] Filtered out UI text:', trimmed);
        return true;
      }
    }

    if (trimmed.length <= 2) {
      console.log('[CC] Filtered out short text:', trimmed);
      return true;
    }

    if (/^[a-z_]+$/.test(trimmed) && trimmed.includes('_')) {
      console.log('[CC] Filtered out icon name:', trimmed);
      return true;
    }

    return false;
  }

  cleanCaptionText(text) {
    if (!text) return '';

    let cleaned = text;

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

    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  }

  findCCElement() {
    try {
      const result = this.selectorManager.findCaption();
      return result;
    } catch (e) {
      console.error('[CC] Error in findCCElement:', e);
      return null;
    }
  }

  extractCaptionText(element, textSelector) {
    let text = '';
    let speaker = '';

    if (this.speakerSelector) {
      try {
        const speakerEl = element.querySelector(this.speakerSelector);
        if (speakerEl) {
          speaker = speakerEl.textContent?.trim() || '';
          if (this.isUIText(speaker)) {
            speaker = '';
          }
        }
      } catch (e) {
        // Ignore speaker extraction errors
      }
    }
    if (this.includeSpeakerName) {
      if (speaker) {
        this.lastSpeaker = speaker;
      } else if (this.speakerSelector) {
        this.lastSpeaker = '';
      }
    }

    if (textSelector) {
      try {
        const textElements = element.querySelectorAll(textSelector);
        if (textElements.length > 0) {
          text = Array.from(textElements)
            .filter(el => {
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

    if (!text) {
      try {
        const clone = element.cloneNode(true);
        const uiButtons = clone.querySelectorAll('.IMKgW');
        uiButtons.forEach(btn => btn.remove());
        text = clone.textContent?.trim() || '';
      } catch (e) {
        text = element.textContent?.trim() || '';
      }
    }

    text = this.cleanCaptionText(text);

    if (this.isUIText(text)) {
      return '';
    }

    if (speaker && text && this.includeSpeakerName) {
      text = `[${speaker}] ${text}`;
    }

    return text;
  }

  /**
   * v3.4.0: No more isDuplicate() function
   * We use timestamp-based filtering instead of complex duplicate detection
   * This is simpler, more robust, and handles Google Meet's streaming captions better
   */

  async start() {
    if (this.isCapturing) {
      return { success: false, message: 'Already capturing' };
    }

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
      // Don't show error for auto-detection - it's expected to fail until CC is enabled
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

    // Start new persistent session if no restorable session
    const hasRestorable = await this.persistentStorage.hasRestorableSession();
    if (!hasRestorable) {
      if (this.captionBuffer) {
        this.captionBuffer.clear();
      } else {
        this.captionBuffer = new CaptionBuffer(this.config.get('maxCaptions'));
      }
      await this.persistentStorage.startNewSession();
    }

    this.performanceMonitor.reset();
    this.performanceMonitor.startSession();

    // v3.5.7: Reset state for overwrite pattern
    this.lastSpeaker = '';
    this.pendingText = '';
    this.currentPendingText = '';
    this.lastSavedText = '';
    this.currentChunkText = '';
    this.currentChunkSpeaker = '';
    this.chunkStartTime = 0;

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    console.log(`[CC] Starting capture with selector: ${selector}`);

    // Update UI status
    this.updateStatusIndicator(true);
    this.updateStatus(this.t('status.capturing'));

    // Start duration timer
    this.startDurationTimer();

    // Start auto-save timer (30 seconds interval)
    this.persistentStorage.startAutoSave(() => this.captionBuffer.getAll(), this);

    // Start auto-save countdown UI
    this.startAutoSaveCountdown();

    // Watch for text changes
    this.observer = new MutationObserver((mutations) => {
      this.processCaptionUpdate();
    });

    this.observer.observe(ccElement, {
      childList: true,
      subtree: true,
      characterData: true,
      characterDataOldValue: true,
      attributes: false
    });

    // Polling mechanism as backup
    const pollingInterval = this.config.get('pollingInterval');
    this.pollInterval = setInterval(() => {
      if (!this.isCapturing) return;
      this.processCaptionUpdate();
    }, pollingInterval);

    // Visibility change handler
    this.visibilityHandler = () => {
      if (!this.isCapturing) return;
      if (document.hidden) {
        console.log('[CC] Tab became hidden - background capture will continue via polling');
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
        if (this.pollInterval) {
          clearInterval(this.pollInterval);
        }
        const normalInterval = this.config.get('pollingInterval');
        this.pollInterval = setInterval(() => {
          if (!this.isCapturing) return;
          this.processCaptionUpdate();
        }, normalInterval);
        this.processCaptionUpdate();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);

    console.log('[CC] Capture started with observer + polling + visibility handling');

    return { success: true, message: `Capture started (using: ${selector})` };
  }

  /**
   * Start duration timer for UI updates
   */
  startDurationTimer() {
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
    }

    this.durationInterval = setInterval(() => {
      if (!this.isCapturing || !this.startTime) return;

      const elapsed = Date.now() - this.startTime;
      const durationEl = document.getElementById('cc-stat-duration');
      if (durationEl) {
        durationEl.textContent = this.formatDuration(elapsed);
      }
    }, 1000);
  }

  /**
   * Start auto-save countdown timer for UI
   */
  startAutoSaveCountdown() {
    // Show UI elements
    const infoEl = document.getElementById('cc-autosave-info');
    const progressEl = document.getElementById('cc-autosave-progress');
    if (infoEl) infoEl.classList.add('active');
    if (progressEl) progressEl.classList.add('active');

    // Reset countdown
    this.autoSaveSecondsRemaining = 30;
    this.updateAutoSaveUI();

    // Clear existing timer
    if (this.autoSaveCountdownInterval) {
      clearInterval(this.autoSaveCountdownInterval);
    }

    // Start countdown
    this.autoSaveCountdownInterval = setInterval(() => {
      this.autoSaveSecondsRemaining--;

      if (this.autoSaveSecondsRemaining <= 0) {
        this.autoSaveSecondsRemaining = 30; // Reset for next cycle (30 -> 1 countdown)
      }

      this.updateAutoSaveUI();
    }, 1000);

    // Listen for save events
    window.addEventListener('cc-auto-saved', this.onAutoSaved.bind(this));
  }

  /**
   * Stop auto-save countdown timer
   */
  stopAutoSaveCountdown() {
    if (this.autoSaveCountdownInterval) {
      clearInterval(this.autoSaveCountdownInterval);
      this.autoSaveCountdownInterval = null;
    }

    // Hide UI elements
    const infoEl = document.getElementById('cc-autosave-info');
    const progressEl = document.getElementById('cc-autosave-progress');
    if (infoEl) infoEl.classList.remove('active');
    if (progressEl) progressEl.classList.remove('active');

    window.removeEventListener('cc-auto-saved', this.onAutoSaved.bind(this));
  }

  /**
   * Update auto-save UI (progress bar and timer)
   * Countdown shows remaining seconds (30 -> 1)
   */
  updateAutoSaveUI() {
    const timerEl = document.getElementById('cc-autosave-timer');
    const progressBar = document.getElementById('cc-autosave-progress-bar');

    if (timerEl) {
      timerEl.textContent = `${this.autoSaveSecondsRemaining}s`;
    }

    if (progressBar) {
      const percentage = ((30 - this.autoSaveSecondsRemaining) / 30) * 100;
      progressBar.style.width = `${percentage}%`;
    }
  }

  /**
   * Handle auto-save event
   */
  onAutoSaved(event) {
    console.log('[CC] Auto-save event received:', event.detail);

    // Show "Saved" indicator
    const savedEl = document.getElementById('cc-autosave-saved');
    if (savedEl) {
      savedEl.classList.add('show');
      setTimeout(() => {
        savedEl.classList.remove('show');
      }, 2000);
    }

    // Reset countdown
    this.autoSaveSecondsRemaining = 30;
    this.updateAutoSaveUI();
  }

  /**
   * Format duration for display (MM:SS or HH:MM:SS)
   */
  formatDuration(ms) {
    const sec = Math.floor(ms / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  /**
   * Update status indicator (recording dot) and Start/Stop buttons
   */
  updateStatusIndicator(isRecording) {
    const statusDot = document.querySelector('.cc-status-dot');
    if (statusDot) {
      if (isRecording) {
        statusDot.classList.add('recording');
      } else {
        statusDot.classList.remove('recording');
      }
    }

    // v3.5.4: Update Start/Stop button visibility
    const startBtn = document.getElementById('cc-start-btn');
    const stopBtn = document.getElementById('cc-stop-btn');
    if (startBtn && stopBtn) {
      if (isRecording) {
        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-flex';
      } else {
        startBtn.style.display = 'inline-flex';
        stopBtn.style.display = 'none';
      }
    }
  }

  processCaptionUpdate() {
    try {
      console.log('[CC] ------- processCaptionUpdate() -------');
      console.log('[CC]   isCapturing:', this.isCapturing);
      console.log('[CC]   ccElement:', this.ccElement ? 'EXISTS' : 'NULL');

      if (!this.isCapturing || !this.ccElement) {
        console.log('[CC] ⊘ Early return: not capturing or no ccElement');
        return;
      }

      if (document.hidden) {
        console.log('[CC] Tab is hidden (background capture active)');
      }

      console.log('[CC]   Calling extractCaptionText()...');
      const currentText = this.extractCaptionText(this.ccElement, this.textSelector);
      console.log('[CC]   Extracted text:', currentText ? `"${currentText.substring(0, 100)}"` : 'NULL/EMPTY');

      if (!currentText) {
        console.log('[CC] ⊘ No text extracted, clearing pending');
        if (this.config.get('showPendingText')) {
          this.showPendingText('');
        }
        return;
      }

      this.pendingText = currentText;
      console.log('[CC] ✓ Set pendingText:', `"${currentText.substring(0, 50)}..."`);

      if (this.config.get('showPendingText')) {
        this.showPendingText(currentText);
        console.log('[CC] ✓ Displayed pending text in UI');
      }

      if (this.debounceTimer) {
        console.log('[CC] Clearing existing debounce timer');
        clearTimeout(this.debounceTimer);
      }

      console.log(`[CC] Setting debounce timer (${this.DEBOUNCE_DELAY}ms)...`);
      this.debounceTimer = setTimeout(() => {
        console.log('[CC] Debounce timer fired! Calling captureStableText()...');
        this.captureStableText(this.pendingText);
      }, this.DEBOUNCE_DELAY);
      console.log('[CC] ------- processCaptionUpdate() END -------');
    } catch (error) {
      console.error('[CC] ✗✗✗ ERROR in processCaptionUpdate:', error);
      console.error('[CC]   Stack:', error.stack);
      this.performanceMonitor.recordError('processCaptionUpdate');
    }
  }

  showPendingText(text) {
    const pendingArea = document.getElementById('cc-pending-area');
    const pendingText = document.getElementById('cc-pending-text');

    if (!pendingArea || !pendingText) return;

    if (text) {
      // v3.5.3: Keep full text, CSS handles 5-line visible limit with scroll
      pendingText.textContent = text;
      pendingArea.style.display = 'flex';

      // Auto-scroll to bottom to show most recent text
      pendingText.scrollTop = pendingText.scrollHeight;
    } else {
      pendingText.textContent = '';
      pendingArea.style.display = 'none';
    }
  }

  /**
   * Capture stable text after debounce (v3.5.7 - overwrite pattern)
   *
   * Key changes (v3.5.7):
   * - ALWAYS overwrite currentChunkText (no accumulation, no appending)
   * - Only save to captionBuffer when 30-second timer fires
   * - Eliminates caption overlap completely
   * - Philosophy: Current = volatile buffer, History = permanent storage
   */
  captureStableText(text) {
    const processingStart = Date.now();

    try {
      console.log('[CC] ========================================');
      console.log('[CC] captureStableText() called (v3.5.7 overwrite mode)');
      console.log('[CC]   Input text:', text ? `"${text.substring(0, 100)}"` : 'NULL/EMPTY');
      console.log('[CC]   isCapturing:', this.isCapturing);

      // Basic validation
      if (!text) {
        console.log('[CC] ⊘ SKIP: text is null/undefined/empty');
        return;
      }

      if (!this.isCapturing) {
        console.log('[CC] ⊘ SKIP: not capturing');
        return;
      }

      const normalizedText = text.trim();
      const currentSpeaker = this.includeSpeakerName ? this.lastSpeaker : '';

      console.log('[CC]   Normalized:', `"${normalizedText.substring(0, 100)}"`);
      console.log('[CC]   Last saved:', `"${this.lastSavedText.substring(0, 100)}"`);
      console.log('[CC]   Current speaker:', currentSpeaker || '(none)');

      // Skip if exact duplicate of last saved text
      if (normalizedText === this.lastSavedText) {
        console.log('[CC] ⊘ SKIP: exact duplicate of last saved');
        this.performanceMonitor.recordDuplicate();
        return;
      }

      // v3.5.7: ALWAYS OVERWRITE (never append, never accumulate)
      this.currentChunkText = normalizedText;
      this.currentChunkSpeaker = currentSpeaker;
      console.log(`[CC] ✓ CHUNK OVERWRITTEN: "${normalizedText.substring(0, 50)}..."`);

      // Initialize chunk start time if not set
      if (this.chunkStartTime === 0) {
        this.chunkStartTime = Date.now() - this.startTime;
      }

      console.log(`[CC]   Chunk speaker: ${this.currentChunkSpeaker}`);
      console.log(`[CC]   Chunk start time: ${this.formatTime(this.chunkStartTime)}`);

      // Record metrics
      this.performanceMonitor.recordCapture();
      this.performanceMonitor.recordProcessingTime(processingStart);

      console.log('[CC] ========================================');

      // Update stats
      this.updateStats();

      // Show current text in pending area (always latest, no accumulation)
      if (this.config.get('showPendingText')) {
        this.showPendingText(this.currentChunkText);
      }
    } catch (error) {
      console.error('[CC] ✗✗✗ ERROR in captureStableText:', error);
      console.error('[CC]   Stack:', error.stack);
      this.performanceMonitor.recordError('captureStableText');
    }
  }

  /**
   * Flush pending text without restarting capture (auto-save helper)
   * v3.5.3: Now also processes pending text into chunk
   */
  flushPendingText() {
    if (!this.isCapturing) {
      return;
    }

    if (this.pendingText) {
      console.log('[CC] Flushing pending text for auto-save');
      this.captureStableText(this.pendingText);
    }
  }

  /**
   * v3.5.7: Flush current chunk to buffer with timestamp and speaker
   * Called every 30 seconds by auto-save
   *
   * KEY CHANGES:
   * - v3.5.7: Simplified - just save currentChunkText if it's new
   * - No accumulation logic, no prefix extraction
   * - Overwrite pattern means currentChunkText is always the latest
   */
  flushChunkToBuffer() {
    if (!this.currentChunkText || !this.currentChunkText.trim()) {
      console.log('[CC] flushChunkToBuffer: No chunk text to save');
      return false;
    }

    const elapsed = Date.now() - this.startTime;
    const timestamp = this.formatTime(elapsed);

    console.log('[CC] ========================================');
    console.log('[CC] flushChunkToBuffer() - v3.5.7 Overwrite Save');
    console.log(`[CC]   Timestamp: ${timestamp}`);
    console.log(`[CC]   Current chunk: "${this.currentChunkText.substring(0, 80)}..."`);
    console.log(`[CC]   Last saved: "${this.lastSavedText?.substring(0, 80) || '(none)'}..."`);

    // Skip if exact duplicate of last saved text
    if (this.currentChunkText === this.lastSavedText) {
      console.log('[CC] ⊘ SKIP: Exact duplicate of last saved');
      console.log('[CC] ========================================');
      return false;
    }

    console.log(`[CC]   Chunk text length: ${this.currentChunkText.length} chars`);

    // Create caption entry
    const entry = {
      time: timestamp,
      timestamp: elapsed,
      text: this.currentChunkText,
      speaker: this.currentChunkSpeaker,
      capturedAt: Date.now(),
      isChunk: true
    };

    // Add to buffer
    this.captionBuffer.add(entry);
    console.log('[CC] ✓ CHUNK SAVED TO BUFFER');
    console.log(`[CC]   Total entries: ${this.captionBuffer.getCount()}`);
    console.log('[CC] ========================================');

    // Update UI with the chunk
    this.updateOverlay(entry);
    this.updateStats();

    // v3.5.7: Update lastSavedText and reset chunk for next 30-second period
    this.lastSavedText = this.currentChunkText;
    this.currentChunkText = '';
    this.currentChunkSpeaker = '';
    this.chunkStartTime = Date.now() - this.startTime;

    return true;
  }

  /**
   * Update statistics display
   */
  updateStats() {
    const stats = this.captionBuffer.getStats();

    const captionsEl = document.getElementById('cc-stat-captions');
    const wordsEl = document.getElementById('cc-stat-words');

    if (captionsEl) captionsEl.textContent = stats.total;
    if (wordsEl) wordsEl.textContent = stats.words;
  }

  stop() {
    if (!this.isCapturing) {
      return { success: false, message: 'Not capturing' };
    }

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }

    // Stop auto-save countdown UI
    this.stopAutoSaveCountdown();

    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
      if (this.pendingText) {
        this.captureStableText(this.pendingText);
      }
    }

    // v3.5.3: Flush any remaining chunk to buffer before stopping
    if (this.currentChunkText) {
      console.log('[CC] Flushing final chunk before stop');
      this.flushChunkToBuffer();
    }

    // v3.5.7: Reset state for overwrite pattern
    this.pendingText = '';
    this.currentPendingText = '';
    this.currentChunkText = '';
    this.currentChunkSpeaker = '';
    this.chunkStartTime = 0;
    this.lastSavedText = '';

    this.showPendingText('');

    this.isCapturing = false;
    this.ccElement = null;
    this.ccSelector = null;
    this.textSelector = null;
    this.speakerSelector = null;

    this.selectorManager.reset();

    this.updateStatusIndicator(false);
    this.updateStatus(this.t('status.stopped'));

    // Stop auto-save timer and force final save
    this.persistentStorage.stopAutoSave();
    this.persistentStorage.forceSave().catch(err => {
      console.error('[CC] Final save error:', err);
    });

    const bufferStats = this.captionBuffer.getStats();
    const perfStats = this.performanceMonitor.getStats();

    console.log(`[CC] Captured ${bufferStats.total} captions (${bufferStats.active} active, ${bufferStats.archived} archived)`);
    console.log('[CC] Performance stats:', perfStats);

    return {
      success: true,
      message: 'Capture stopped',
      count: bufferStats.total,
      stats: { buffer: bufferStats, performance: perfStats }
    };
  }

  /**
   * Auto-resume: Stop and restart capture (v3.4.0)
   * Called every 30 seconds to force save current state
   */
  async autoResume() {
    if (!this.isCapturing) {
      console.log('[CC] Auto-resume skipped: not capturing');
      return;
    }

    console.log('[CC] ♻️ Auto-resume: Restarting capture to force save...');

    // Store current state
    const wasCapturing = this.isCapturing;
    const currentCC = this.ccElement;

    if (!wasCapturing || !currentCC) {
      console.log('[CC] Auto-resume skipped: invalid state');
      return;
    }

    // Stop (this will trigger forceSave)
    await this.stop();

    // Wait a bit for save to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Restart immediately
    const result = await this.start();

    if (result.success) {
      console.log('[CC] ✓ Auto-resume completed');

      // Show brief notification
      this.showNotification(this.t('notifications.autoResumed') || 'Auto-saved and resumed', 'success');
    } else {
      console.error('[CC] Auto-resume failed:', result.message);
    }
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
  // Copy to Clipboard
  // =============================================================================

  /**
   * Copy captions to clipboard
   */
  async copyToClipboard() {
    try {
      const captions = this.captionBuffer.getAll();

      if (captions.length === 0) {
        this.notification?.showWarning(this.t('notifications.noCaptions'));
        return false;
      }

      const includeTimestamps = this.config.get('includeTimestamps');
      const content = this.generateTXT(captions, includeTimestamps);

      await navigator.clipboard.writeText(content);
      this.notification?.showSuccess(this.t('notifications.copied'));
      console.log('[CC] Copied to clipboard:', captions.length, 'captions');
      return true;
    } catch (error) {
      console.error('[CC] Copy to clipboard error:', error);
      this.notification?.showError(this.t('notifications.copyFailed') + ': ' + error.message);
      return false;
    }
  }

  // =============================================================================
  // Download Preview Modal System
  // =============================================================================

  showDownloadPreview(format) {
    try {
      const downloadFormat = format || this.config.get('defaultFormat');

      const captions = this.captionBuffer.getAll();
      const stats = this.captionBuffer.getStats();

      if (captions.length === 0) {
        this.notification?.showWarning(this.t('notifications.noCaptions'));
        return;
      }

      const content = this.generateDownloadContent(captions, downloadFormat);
      const fileSize = new Blob([content]).size;

      this.createDownloadModal();
      this.openModal('cc-download-modal');

      document.getElementById('cc-download-count').textContent = stats.total;
      document.getElementById('cc-download-words').textContent = stats.words;
      document.getElementById('cc-download-duration').textContent = this.formatTime(stats.duration || 0);
      document.getElementById('cc-download-size').textContent = this.formatFileSize(fileSize);

      const formatSelect = document.getElementById('cc-download-format');
      if (formatSelect) {
        formatSelect.value = downloadFormat;
      }

      const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
      const filenameInput = document.getElementById('cc-download-filename');
      if (filenameInput) {
        filenameInput.value = `meet-captions-${timestamp}`;
      }

      const timestampCheckbox = document.getElementById('cc-download-include-timestamps');
      if (timestampCheckbox) {
        timestampCheckbox.checked = this.config.get('includeTimestamps');
      }

      const timestampOption = document.getElementById('cc-download-timestamps-option');
      if (timestampOption) {
        timestampOption.style.display = downloadFormat === 'txt' ? 'block' : 'none';
      }

      this.updateDownloadPreview(content);

      console.log('[CC] Download preview opened for format:', downloadFormat);
    } catch (error) {
      this.performanceMonitor.recordError('showDownloadPreview');
      console.error('[CC] Download preview error:', error);
      this.notification?.showError('Failed to open download preview');
    }
  }

  createDownloadModal() {
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
          <h3>${this.t('modal.downloadTitle')}</h3>
          <button class="cc-modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="cc-modal-body">
          <div class="cc-download-info">
            <div class="cc-download-stat">
              <strong>${this.t('modal.captionsLabel')}</strong> <span id="cc-download-count">0</span>
            </div>
            <div class="cc-download-stat">
              <strong>${this.t('modal.wordsLabel')}</strong> <span id="cc-download-words">0</span>
            </div>
            <div class="cc-download-stat">
              <strong>${this.t('modal.durationLabel')}</strong> <span id="cc-download-duration">00:00:00</span>
            </div>
            <div class="cc-download-stat">
              <strong>${this.t('modal.sizeLabel')}</strong> <span id="cc-download-size">0 KB</span>
            </div>
          </div>

          <div class="cc-download-options">
            <div class="cc-setting">
              <label for="cc-download-format">${this.t('modal.format')}</label>
              <select id="cc-download-format">
                <option value="txt">Text File (.txt)</option>
                <option value="srt">Subtitle File (.srt)</option>
              </select>
            </div>

            <div class="cc-setting">
              <label for="cc-download-filename">${this.t('modal.filename')}</label>
              <input type="text" id="cc-download-filename"
                     placeholder="meet-captions-2024-12-17-143022">
            </div>

            <div class="cc-setting" id="cc-download-timestamps-option">
              <label>
                <input type="checkbox" id="cc-download-include-timestamps" checked>
                ${this.t('modal.includeTimestamps')}
              </label>
            </div>
          </div>

          <div class="cc-download-preview">
            <h4>${this.t('modal.preview')}</h4>
            <div class="cc-preview-container">
              <pre id="cc-preview-content"></pre>
            </div>
          </div>
        </div>
        <div class="cc-modal-footer">
          <button id="cc-download-cancel" class="cc-btn cc-btn-secondary">${this.t('modal.cancel')}</button>
          <button id="cc-download-confirm" class="cc-btn cc-btn-primary">${this.t('modal.download')}</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.setupDownloadModalListeners();
  }

  setupDownloadModalListeners() {
    const modal = document.getElementById('cc-download-modal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.cc-modal-close');
    if (closeBtn) {
      closeBtn.onclick = () => this.closeModal('cc-download-modal');
    }

    const overlay = modal.querySelector('.cc-modal-overlay');
    if (overlay) {
      overlay.onclick = () => this.closeModal('cc-download-modal');
    }

    const cancelBtn = document.getElementById('cc-download-cancel');
    if (cancelBtn) {
      cancelBtn.onclick = () => this.closeModal('cc-download-modal');
    }

    const confirmBtn = document.getElementById('cc-download-confirm');
    if (confirmBtn) {
      confirmBtn.onclick = () => this.confirmDownload();
    }

    const formatSelect = document.getElementById('cc-download-format');
    if (formatSelect) {
      formatSelect.onchange = (e) => this.onDownloadFormatChange(e.target.value);
    }

    const timestampCheckbox = document.getElementById('cc-download-include-timestamps');
    if (timestampCheckbox) {
      timestampCheckbox.onchange = () => this.refreshDownloadPreview();
    }

    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal('cc-download-modal');
      }
    });
  }

  onDownloadFormatChange(format) {
    const timestampOption = document.getElementById('cc-download-timestamps-option');
    if (timestampOption) {
      timestampOption.style.display = format === 'txt' ? 'block' : 'none';
    }
    this.refreshDownloadPreview();
  }

  refreshDownloadPreview() {
    const format = document.getElementById('cc-download-format')?.value || 'txt';
    const captions = this.captionBuffer.getAll();
    const content = this.generateDownloadContent(captions, format);

    const fileSize = new Blob([content]).size;
    const sizeEl = document.getElementById('cc-download-size');
    if (sizeEl) {
      sizeEl.textContent = this.formatFileSize(fileSize);
    }

    this.updateDownloadPreview(content);
  }

  updateDownloadPreview(content) {
    const previewEl = document.getElementById('cc-preview-content');
    if (!previewEl) return;

    const lines = content.split('\n').slice(0, 20);
    const totalLines = content.split('\n').length;
    let preview = lines.join('\n');

    if (totalLines > 20) {
      preview += `\n\n... and ${totalLines - 20} more lines`;
    }

    previewEl.textContent = preview;
  }

  generateDownloadContent(captions, format) {
    if (format === 'srt') {
      return this.generateSRT(captions);
    } else {
      const timestampCheckbox = document.getElementById('cc-download-include-timestamps');
      const includeTimestamps = timestampCheckbox
        ? timestampCheckbox.checked
        : this.config.get('includeTimestamps');
      return this.generateTXT(captions, includeTimestamps);
    }
  }

  formatCaptionText(caption) {
    if (!this.includeSpeakerName) {
      return caption.text;
    }

    const speaker = caption.speaker || '';
    if (!speaker) {
      return caption.text;
    }

    const prefix = `[${speaker}] `;
    if (caption.text.startsWith(prefix)) {
      return caption.text;
    }
    return `${prefix}${caption.text}`;
  }

  generateTXT(captions, includeTimestamps) {
    // v3.5.3: New format with timestamp and speaker on same line
    // Format: [00:00:30] [Speaker] text...
    return captions.map(c => {
      const timestamp = `[${c.time}]`;
      const speaker = c.speaker ? ` [${c.speaker}]` : '';
      const text = c.text;

      if (includeTimestamps) {
        return `${timestamp}${speaker} ${text}`;
      } else {
        // Even without timestamps, include speaker if available
        return speaker ? `${speaker.trim()} ${text}` : text;
      }
    }).join('\n');
  }

  generateSRT(captions) {
    return captions.map((c, i) => {
      const start = this.formatSRTTime(c.timestamp);
      const end = this.formatSRTTime(
        i < captions.length - 1 ? captions[i + 1].timestamp : c.timestamp + 2000
      );
      return `${i + 1}\n${start} --> ${end}\n${this.formatCaptionText(c)}\n`;
    }).join('\n');
  }

  confirmDownload() {
    try {
      const format = document.getElementById('cc-download-format')?.value || 'txt';
      const filename = document.getElementById('cc-download-filename')?.value || 'meet-captions';
      const captions = this.captionBuffer.getAll();

      if (captions.length === 0) {
        this.notification?.showWarning(this.t('notifications.noCaptions'));
        this.closeModal('cc-download-modal');
        return;
      }

      const content = this.generateDownloadContent(captions, format);
      const success = this.downloadFile(content, format, filename);

      if (success) {
        this.closeModal('cc-download-modal');
        this.notification?.showSuccess(this.t('notifications.downloaded'));

        this.config.save('defaultFormat', format);

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

      console.log('[CC] Downloaded:', `${filename}.${format}`);
      return true;
    } catch (error) {
      console.error('[CC] Download error:', error);
      this.notification?.showError(`Download failed: ${error.message}`);
      return false;
    }
  }

  formatFileSize(bytes) {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      const firstInput = modal.querySelector('input, select, button:not(.cc-modal-close)');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
    }
  }

  closeAllModals() {
    const modals = document.querySelectorAll('.cc-modal');
    modals.forEach(modal => {
      modal.style.display = 'none';
    });
  }

  // =============================================================================
  // Help Modal
  // =============================================================================

  showHelpModal() {
    const existing = document.getElementById('cc-help-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'cc-help-modal';
    modal.className = 'cc-modal';
    modal.innerHTML = `
      <div class="cc-modal-overlay"></div>
      <div class="cc-modal-content">
        <div class="cc-modal-header">
          <h3>${this.t('helpTitle')}</h3>
          <button class="cc-modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="cc-modal-body">
          <div class="cc-help-content">
            ${this.t('helpContent').map(text => `<p>${text}</p>`).join('')}
          </div>
          <div class="cc-help-shortcuts">
            <h4>${this.t('shortcutsTitle')}</h4>
            <div class="cc-shortcut-row">
              <kbd>Ctrl+Shift+D</kbd>
              <span>${this.t('shortcuts.download')}</span>
            </div>
            <div class="cc-shortcut-row">
              <kbd>Ctrl+Shift+C</kbd>
              <span>${this.t('shortcuts.copy')}</span>
            </div>
          </div>
        </div>
        <div class="cc-modal-footer">
          <button class="cc-btn cc-btn-primary cc-help-close">${this.currentLanguage === 'en' ? 'Close' : '닫기'}</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Setup listeners
    modal.querySelector('.cc-modal-close').onclick = () => this.closeModal('cc-help-modal');
    modal.querySelector('.cc-modal-overlay').onclick = () => this.closeModal('cc-help-modal');
    modal.querySelector('.cc-help-close').onclick = () => this.closeModal('cc-help-modal');

    this.openModal('cc-help-modal');
  }

  // =============================================================================
  // Settings Modal
  // =============================================================================

  showSettingsModal() {
    const existing = document.getElementById('cc-settings-modal');
    if (existing) existing.remove();

    const config = this.config.getAll();

    const modal = document.createElement('div');
    modal.id = 'cc-settings-modal';
    modal.className = 'cc-modal';
    modal.innerHTML = `
      <div class="cc-modal-overlay"></div>
      <div class="cc-modal-content">
        <div class="cc-modal-header">
          <h3>${this.t('settingsTitle')}</h3>
          <button class="cc-modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="cc-modal-body">
          <div class="cc-settings-section">
            <div class="cc-setting">
              <label>
                <input type="checkbox" id="cc-setting-autostart" ${config.autoStart ? 'checked' : ''}>
                ${this.t('settingLabels.autoStart')}
              </label>
            </div>
            <div class="cc-setting">
              <label>
                <input type="checkbox" id="cc-setting-speaker" ${config.includeSpeaker ? 'checked' : ''}>
                ${this.t('settingLabels.includeSpeaker')}
              </label>
            </div>
            <div class="cc-setting">
              <label>
                <input type="checkbox" id="cc-setting-pending" ${config.showPendingText ? 'checked' : ''}>
                ${this.t('settingLabels.showPendingText')}
              </label>
            </div>
          </div>
          <div class="cc-settings-section">
            <div class="cc-setting">
              <label for="cc-setting-debounce">${this.t('settingLabels.debounceDelay')}</label>
              <div class="cc-setting-row">
                <input type="range" id="cc-setting-debounce" min="500" max="3000" step="100" value="${config.debounceDelay}">
                <span class="cc-range-value">${config.debounceDelay}ms</span>
              </div>
            </div>
            <div class="cc-setting">
              <label for="cc-setting-maxcaptions">${this.t('settingLabels.maxCaptions')}</label>
              <div class="cc-setting-row">
                <input type="range" id="cc-setting-maxcaptions" min="100" max="5000" step="100" value="${config.maxCaptions}">
                <span class="cc-range-value">${config.maxCaptions}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="cc-modal-footer">
          <button id="cc-settings-cancel" class="cc-btn cc-btn-secondary">${this.t('modal.cancel')}</button>
          <button id="cc-settings-save" class="cc-btn cc-btn-primary">${this.currentLanguage === 'en' ? 'Save' : '저장'}</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Setup listeners
    modal.querySelector('.cc-modal-close').onclick = () => this.closeModal('cc-settings-modal');
    modal.querySelector('.cc-modal-overlay').onclick = () => this.closeModal('cc-settings-modal');
    document.getElementById('cc-settings-cancel').onclick = () => this.closeModal('cc-settings-modal');

    // Range input display updates
    const debounceInput = document.getElementById('cc-setting-debounce');
    debounceInput.oninput = (e) => {
      e.target.nextElementSibling.textContent = e.target.value + 'ms';
    };

    const maxCaptionsInput = document.getElementById('cc-setting-maxcaptions');
    maxCaptionsInput.oninput = (e) => {
      e.target.nextElementSibling.textContent = e.target.value;
    };

    // Save button
    document.getElementById('cc-settings-save').onclick = async () => {
      await this.config.saveMultiple({
        autoStart: document.getElementById('cc-setting-autostart').checked,
        includeSpeaker: document.getElementById('cc-setting-speaker').checked,
        showPendingText: document.getElementById('cc-setting-pending').checked,
        debounceDelay: parseInt(debounceInput.value),
        maxCaptions: parseInt(maxCaptionsInput.value)
      });

      this.includeSpeakerName = this.config.get('includeSpeaker');
      this.captionBuffer.setMaxSize(this.config.get('maxCaptions'));

      this.notification?.showSuccess(this.currentLanguage === 'en' ? 'Settings saved' : '설정 저장됨');
      this.closeModal('cc-settings-modal');
    };

    this.openModal('cc-settings-modal');
  }

  // =============================================================================
  // Legacy Download Methods (kept for backward compatibility)
  // =============================================================================

  downloadText() {
    try {
      const captions = this.captionBuffer ? this.captionBuffer.getAll() : [];

      if (captions.length === 0) {
        this.notification?.showError(this.t('notifications.noCaptions'));
        return;
      }

      const includeTimestamps = this.config.get('includeTimestamps');
      const content = captions
        .map(c => includeTimestamps ? `[${c.time}] ${c.text}` : c.text)
        .join('\n');

      this.download(content, 'text/plain', 'txt');

      const stats = this.captionBuffer.getStats();
      this.notification?.showSuccess(this.t('notifications.downloaded'));
    } catch (error) {
      this.performanceMonitor.recordError('downloadText');
      console.error('[CC] Download TXT error:', error);
      this.notification?.showError('Failed to download TXT file');
    }
  }

  downloadSRT() {
    try {
      const captions = this.captionBuffer ? this.captionBuffer.getAll() : [];

      if (captions.length === 0) {
        this.notification?.showError(this.t('notifications.noCaptions'));
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
      this.notification?.showSuccess(this.t('notifications.downloaded'));
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
      throw error;
    }
  }

  updateOverlay(entry) {
    try {
      const panel = document.getElementById('cc-transcript-panel');
      if (!panel) return;

      const content = document.getElementById('cc-transcript-content');
      if (!content) return;

      // Remove placeholder if exists
      const placeholder = content.querySelector('.cc-placeholder');
      if (placeholder) placeholder.remove();

      const line = document.createElement('div');
      line.className = 'cc-line';
      line.innerHTML = `<span class="cc-time">[${entry.time}]</span> <span class="cc-text">${this.escapeHtml(entry.text)}</span>`;

      content.appendChild(line);
      content.scrollTop = content.scrollHeight;
    } catch (error) {
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
   */
  startAutoDetection() {
    if (this.ccDetectionObserver) return;

    if (!this.config.get('autoStart')) {
      console.log('[CC] Auto-start disabled in config, skipping auto-detection');
      return;
    }

    console.log('[CC] Starting auto-detection for CC elements...');

    // Check immediately
    this.tryAutoStart();

    let lastCheck = 0;
    const THROTTLE_MS = 500;

    this.ccDetectionObserver = new MutationObserver((mutations) => {
      if (this.isCapturing || this.autoStarted) return;

      const now = Date.now();
      if (now - lastCheck < THROTTLE_MS) return;
      lastCheck = now;

      const hasRelevantChanges = mutations.some(mutation => {
        if (mutation.type !== 'childList') return false;
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node;
            if (el.getAttribute) {
              if (el.getAttribute('role') === 'region' ||
                  el.getAttribute('jsname') === 'dsyhDe' ||
                  el.classList?.contains('ygicle') ||
                  el.classList?.contains('VbkSUe') ||
                  el.classList?.contains('iOzk7')) {
                return true;
              }
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
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(() => this.tryAutoStart(), { timeout: 1000 });
        } else {
          setTimeout(() => this.tryAutoStart(), 100);
        }
      }
    });

    this.ccDetectionObserver.observe(document.body, {
      childList: true,
      subtree: false
    });

    this.autoDetectInterval = setInterval(() => {
      if (!this.isCapturing && !this.autoStarted) {
        this.tryAutoStart();
      }
    }, 2000);
  }

  tryAutoStart() {
    try {
      const result = this.selectorManager.findCaption();
      if (result) {
        console.log('[CC] Auto-detected CC element! Starting capture...');
        this.autoStarted = true;

        this.stopAutoDetection();

        const startResult = this.start();
        if (startResult.success) {
          this.notification?.showInfo(this.t('notifications.autoStarted'));
        }
      }
    } catch (e) {
      this.performanceMonitor.recordError('tryAutoStart');
      console.warn('[CC] Error in tryAutoStart:', e);
    }
  }

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

  debugDOMStructure() {
    console.log('=== [CC DEBUG] DOM Structure Analysis (v3.1.0) ===');
    console.log('[CC DEBUG] Use browser DevTools to inspect the Google Meet caption elements');
    console.log('[CC DEBUG] Current selector:', this.selectorManager.getStats());
    return 'Check console for debug output';
  }
}

// Create instance
const capturer = new SimpleCCCapturer();

// Delay before starting extension features
const MEET_INIT_DELAY = 3000;

// Create UI
async function createSimpleUI() {
  const existing = document.getElementById('cc-overlay');
  if (existing) existing.remove();

  // Initialize capturer (load config)
  await capturer.init();

  const overlay = document.createElement('div');
  overlay.id = 'cc-overlay';
  overlay.innerHTML = `
    <div class="cc-header">
      <span class="cc-title">${capturer.t('title')}</span>
      <div class="cc-controls">
        <button id="cc-lang-toggle" class="cc-btn cc-btn-icon" title="${capturer.currentLanguage === 'en' ? '한국어로 전환' : 'Switch to English'}">${capturer.currentLanguage === 'en' ? 'KO' : 'EN'}</button>
        <button id="cc-settings-btn" class="cc-btn cc-btn-icon" title="${capturer.t('buttons.settings')}">&#9881;</button>
        <button id="cc-help-btn" class="cc-btn cc-btn-icon" title="${capturer.t('buttons.help')}">?</button>
        <button id="cc-minimize" class="cc-btn cc-btn-icon">&#8722;</button>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="cc-status-bar">
      <div class="cc-status-indicator">
        <span class="cc-status-dot"></span>
        <span id="cc-status-text">${capturer.t('status.waiting')}</span>
      </div>
      <div class="cc-capture-controls">
        <button id="cc-start-btn" class="cc-btn cc-btn-start" title="Start Capture">&#9654; Start</button>
        <button id="cc-stop-btn" class="cc-btn cc-btn-stop" title="Stop Capture" style="display: none;">&#9632; Stop</button>
      </div>
      <div class="cc-stats">
        <span class="cc-stat-item">&#128221; <span id="cc-stat-captions">0</span></span>
        <span class="cc-stat-item">&#128172; <span id="cc-stat-words">0</span></span>
        <span class="cc-stat-item">&#9202; <span id="cc-stat-duration">00:00</span></span>
      </div>
    </div>

    <!-- Auto-Save Progress Info -->
    <div id="cc-autosave-info" class="cc-autosave-info">
      <div class="cc-autosave-label">
        <span class="cc-autosave-icon">&#128190;</span>
        <span>Next auto-save in <span id="cc-autosave-timer" class="cc-autosave-timer">30s</span></span>
      </div>
      <span id="cc-autosave-saved" class="cc-autosave-saved">✓ Saved</span>
    </div>

    <!-- Auto-Save Progress Bar -->
    <div id="cc-autosave-progress" class="cc-autosave-progress">
      <div id="cc-autosave-progress-bar" class="cc-autosave-progress-bar"></div>
    </div>

    <!-- Pending Text -->
    <div id="cc-pending-area" class="cc-pending" style="display: none;">
      <div class="cc-pending-label">${capturer.t('labels.current')}</div>
      <div id="cc-pending-text" class="cc-pending-text"></div>
    </div>

    <!-- Transcript -->
    <div id="cc-transcript-panel" class="cc-panel">
      <div id="cc-transcript-content" class="cc-content">
        <div class="cc-placeholder">${capturer.t('placeholder')}</div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="cc-actions">
      <button id="cc-download-txt" class="cc-btn">&#128196; ${capturer.t('buttons.txt')}</button>
      <button id="cc-download-srt" class="cc-btn">&#127909; ${capturer.t('buttons.srt')}</button>
      <button id="cc-copy-btn" class="cc-btn cc-btn-primary"><span class="cc-btn-icon-emoji">&#128203;</span> ${capturer.t('buttons.copy')}</button>
    </div>
  `;

  document.body.appendChild(overlay);

  // Restore UI state
  if (capturer.config.get('overlayMinimized')) {
    const panel = document.getElementById('cc-transcript-panel');
    const actions = document.querySelector('.cc-actions');
    const btn = document.getElementById('cc-minimize');
    if (panel) panel.style.display = 'none';
    if (actions) actions.style.display = 'none';
    if (btn) btn.innerHTML = '&#43;';
  }

  // Restore captions if available
  if (capturer.captionBuffer && capturer.captionBuffer.getActiveCount() > 0) {
    const content = document.getElementById('cc-transcript-content');
    if (content) {
      // Clear placeholder
      content.innerHTML = '';
      // Add restored captions
      capturer.captionBuffer.getAll().forEach(entry => {
        const line = document.createElement('div');
        line.className = 'cc-line';
        line.innerHTML = `<span class="cc-time">[${entry.time}]</span> <span class="cc-text">${capturer.escapeHtml(entry.text)}</span>`;
        content.appendChild(line);
      });
      content.scrollTop = content.scrollHeight;
    }
    capturer.updateStats();
  }

  // Event Listeners

  // Start button
  document.getElementById('cc-start-btn').onclick = () => {
    if (!capturer.isCapturing) {
      capturer.startAutoDetection();
      document.getElementById('cc-start-btn').style.display = 'none';
      document.getElementById('cc-stop-btn').style.display = 'inline-flex';
    }
  };

  // Stop button
  document.getElementById('cc-stop-btn').onclick = () => {
    if (capturer.isCapturing) {
      capturer.stop();
      document.getElementById('cc-stop-btn').style.display = 'none';
      document.getElementById('cc-start-btn').style.display = 'inline-flex';
    }
  };

  // Language toggle
  document.getElementById('cc-lang-toggle').onclick = () => {
    capturer.toggleLanguage();
  };

  // Settings button
  document.getElementById('cc-settings-btn').onclick = () => {
    capturer.showSettingsModal();
  };

  // Help button
  document.getElementById('cc-help-btn').onclick = () => {
    capturer.showHelpModal();
  };

  // Download buttons
  document.getElementById('cc-download-txt').onclick = () => {
    if (capturer.captionBuffer.getCount() === 0) {
      capturer.notification.showWarning(capturer.t('notifications.noCaptions'));
      return;
    }
    capturer.showDownloadPreview('txt');
  };

  document.getElementById('cc-download-srt').onclick = () => {
    if (capturer.captionBuffer.getCount() === 0) {
      capturer.notification.showWarning(capturer.t('notifications.noCaptions'));
      return;
    }
    capturer.showDownloadPreview('srt');
  };

  // Copy button
  document.getElementById('cc-copy-btn').onclick = () => {
    capturer.copyToClipboard();
  };

  // Minimize button
  document.getElementById('cc-minimize').onclick = async () => {
    const panel = document.getElementById('cc-transcript-panel');
    const actions = document.querySelector('.cc-actions');
    const statusBar = document.querySelector('.cc-status-bar');
    const pendingArea = document.getElementById('cc-pending-area');
    const btn = document.getElementById('cc-minimize');

    if (panel.style.display === 'none') {
      panel.style.display = 'flex';
      if (actions) actions.style.display = 'flex';
      if (statusBar) statusBar.style.display = 'flex';
      btn.innerHTML = '&#8722;';
      await capturer.config.save('overlayMinimized', false);
    } else {
      panel.style.display = 'none';
      if (actions) actions.style.display = 'none';
      if (pendingArea) pendingArea.style.display = 'none';
      btn.innerHTML = '&#43;';
      await capturer.config.save('overlayMinimized', true);
    }
  };

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+D - Open download preview
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      if (capturer.captionBuffer && capturer.captionBuffer.getCount() > 0) {
        capturer.showDownloadPreview();
      } else {
        capturer.notification?.showWarning(capturer.t('notifications.noCaptions'));
      }
    }

    // Ctrl+Shift+C - Copy to clipboard
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      capturer.copyToClipboard();
    }

    // Escape - Close any open modal
    if (e.key === 'Escape') {
      capturer.closeAllModals();
    }
  });

  // Start auto-detection after delay
  console.log('[CC] UI created, will start auto-detection after Google Meet fully initializes...');
  setTimeout(() => {
    try {
      console.log('[CC] Starting auto-detection now...');
      capturer.startAutoDetection();
    } catch (error) {
      // v3.5.7: Silently ignore errors when Google Meet is not running
      // This prevents console spam on non-Meet pages
      console.debug('[CC] Auto-detection skipped (not on Google Meet page)');
    }
  }, MEET_INIT_DELAY);
}

// Initialize when page loads
// v3.5.7: Wrap in try-catch to prevent errors on non-Meet pages
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      createSimpleUI();
    } catch (error) {
      console.debug('[CC] Initialization skipped (not on Google Meet page)');
    }
  });
} else {
  try {
    createSimpleUI();
  } catch (error) {
    console.debug('[CC] Initialization skipped (not on Google Meet page)');
  }
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

console.log('[CC Capturer] Simple CC Capturer v3.5.7 loaded (Overwrite Pattern - Caption Overlap Fix)');
