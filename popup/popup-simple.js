/**
 * Simple Popup for CC Capturer
 * Version 3.4.4 - Jeff Dean Style: Correctness First
 */

const MessageTypes = {
  START_CAPTURE: 'START_CAPTURE',
  STOP_CAPTURE: 'STOP_CAPTURE',
  GET_STATUS: 'GET_STATUS',
  DOWNLOAD_TEXT: 'DOWNLOAD_TEXT',
  DOWNLOAD_SRT: 'DOWNLOAD_SRT'
};

const STORAGE_KEY = 'cc_recording_history';
const LANGUAGE_KEY = 'popupLanguage';

const LANGUAGES = {
  ko: {
    title: 'CC Capturer',
    subtitle: 'Google Meet 자막 캡처',
    guideTitle: 'Quick Guide',
    guideSteps: [
      'Google Meet 회의에 참여',
      'CC 버튼을 눌러 자막 활성화',
      '자막이 자동으로 캡처됩니다',
      '다운로드 또는 복사'
    ],
    shortcutsTitle: 'Shortcuts',
    shortcutDownload: '다운로드',
    shortcutCopy: '복사',
    statusLabel: '상태',
    statusIdle: '대기 중',
    statusCapturing: '캡처 중...',
    capturedLabel: '캡처된 자막',
    historyTitle: '회의 히스토리',
    detailDateLabel: '날짜',
    detailTimeLabel: '시간',
    detailCountLabel: '자막 수',
    buttons: {
      start: '캡처 시작',
      starting: '시작 중...',
      stop: '캡처 중지',
      stopping: '중지 중...',
      history: '회의 히스토리',
      detailDownloadTxt: 'TXT 다운로드',
      detailDownloadSrt: 'SRT 다운로드',
      delete: '삭제',
      clearHistory: '전체 삭제'
    },
    alerts: {
      captureStarted: '캡처를 시작했습니다',
      captureStopped: (count) => `캡처를 중지했습니다 (${count}개 자막)`,
      captureStartFailed: '캡처 시작 실패',
      captureStopFailed: '캡처 중지 실패',
      txtDownloaded: 'TXT 파일 다운로드 완료',
      srtDownloaded: 'SRT 파일 다운로드 완료',
      downloadFailed: '다운로드 실패',
      sessionNotFound: '세션을 찾을 수 없습니다',
      sessionLoadFailed: '세션 상세 정보를 불러올 수 없습니다',
      historyLoadFailed: '히스토리를 불러올 수 없습니다',
      historyEmpty: '저장된 회의가 없습니다',
      deleted: '삭제되었습니다',
      deleteFailed: '삭제에 실패했습니다',
      historyCleared: '히스토리를 삭제했습니다',
      historyClearFailed: '히스토리 삭제에 실패했습니다'
    },
    confirmDelete: '이 회의 기록을 삭제하시겠습니까?',
    confirmClearHistory: '모든 회의 기록을 삭제하시겠습니까?',
    errors: {
      noMeetTab: 'Google Meet 탭이 활성화되어 있지 않습니다'
    },
    defaultMeetingTitle: '회의',
    countSuffix: '개',
    countItems: (count) => `${count}개`
  },
  en: {
    title: 'CC Capturer',
    subtitle: 'Google Meet CC Capture',
    guideTitle: 'Quick Guide',
    guideSteps: [
      'Join a Google Meet meeting',
      'Enable CC captions',
      'Captions are captured automatically',
      'Download or copy'
    ],
    shortcutsTitle: 'Shortcuts',
    shortcutDownload: 'Download',
    shortcutCopy: 'Copy',
    statusLabel: 'Status',
    statusIdle: 'Idle',
    statusCapturing: 'Capturing...',
    capturedLabel: 'Captured Captions',
    historyTitle: 'Meeting History',
    detailDateLabel: 'Date',
    detailTimeLabel: 'Time',
    detailCountLabel: 'Captions',
    buttons: {
      start: 'Start Capture',
      starting: 'Starting...',
      stop: 'Stop Capture',
      stopping: 'Stopping...',
      history: 'Meeting History',
      detailDownloadTxt: 'Download TXT',
      detailDownloadSrt: 'Download SRT',
      delete: 'Delete',
      clearHistory: 'Clear All'
    },
    alerts: {
      captureStarted: 'Capture started',
      captureStopped: (count) => `Capture stopped (${count} captions)`,
      captureStartFailed: 'Failed to start capture',
      captureStopFailed: 'Failed to stop capture',
      txtDownloaded: 'TXT download complete',
      srtDownloaded: 'SRT download complete',
      downloadFailed: 'Download failed',
      sessionNotFound: 'Session not found',
      sessionLoadFailed: 'Failed to load session details',
      historyLoadFailed: 'Failed to load history',
      historyEmpty: 'No saved meetings',
      deleted: 'Deleted',
      deleteFailed: 'Failed to delete',
      historyCleared: 'History cleared',
      historyClearFailed: 'Failed to clear history'
    },
    confirmDelete: 'Delete this meeting record?',
    confirmClearHistory: 'Delete all meeting history?',
    errors: {
      noMeetTab: 'No active Google Meet tab.'
    },
    defaultMeetingTitle: 'Meeting',
    countSuffix: 'items',
    countItems: (count) => `${count} items`
  }
};

// DOM Elements - Main View
const mainView = document.getElementById('main-view');
const historyView = document.getElementById('history-view');
const historyDetailView = document.getElementById('history-detail-view');

const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const downloadTxtBtn = document.getElementById('download-txt');
const downloadSrtBtn = document.getElementById('download-srt');
const historyBtn = document.getElementById('history-btn');
const statusEl = document.getElementById('status');
const countEl = document.getElementById('count');
const alertEl = document.getElementById('alert');

// Guide elements
const guideHeader = document.getElementById('guide-header');
const guideToggle = document.getElementById('guide-toggle');
const guideContent = document.getElementById('guide-content');
const popupTitle = document.getElementById('popup-title');
const popupSubtitle = document.getElementById('popup-subtitle');
const guideTitle = document.getElementById('guide-title');
const guideStep1 = document.getElementById('guide-step-1');
const guideStep2 = document.getElementById('guide-step-2');
const guideStep3 = document.getElementById('guide-step-3');
const guideStep4 = document.getElementById('guide-step-4');
const shortcutsTitle = document.getElementById('shortcuts-title');
const shortcutDownload = document.getElementById('shortcut-download');
const shortcutCopy = document.getElementById('shortcut-copy');
const statusLabel = document.getElementById('status-label');
const capturedLabel = document.getElementById('captured-label');
const historyTitle = document.getElementById('history-title');
const detailDateLabel = document.getElementById('detail-date-label');
const detailTimeLabel = document.getElementById('detail-time-label');
const detailCountLabel = document.getElementById('detail-count-label');
const langButtons = document.querySelectorAll('[data-lang-toggle] .lang-btn');

// History elements
const historyList = document.getElementById('history-list');
const backFromHistory = document.getElementById('back-from-history');
const backFromDetail = document.getElementById('back-from-detail');
const detailTitle = document.getElementById('detail-title');
const detailDate = document.getElementById('detail-date');
const detailTime = document.getElementById('detail-time');
const detailCount = document.getElementById('detail-count');
const detailContent = document.getElementById('detail-content');
const detailDownloadTxt = document.getElementById('detail-download-txt');
const detailDownloadSrt = document.getElementById('detail-download-srt');
const detailDelete = document.getElementById('detail-delete');
const historyClear = document.getElementById('history-clear');

// State
let updateInterval = null;
let currentDetailSession = null;
let currentLanguage = 'ko';

function t(key) {
  const value = key.split('.').reduce((obj, part) => (obj ? obj[part] : undefined), LANGUAGES[currentLanguage]);
  return value !== undefined ? value : key;
}

function formatCount(count) {
  const formatter = LANGUAGES[currentLanguage]?.countItems;
  return formatter ? formatter(count) : `${count}`;
}

function updateButtonLabels() {
  startBtn.textContent = startBtn.dataset.state === 'starting' ? t('buttons.starting') : t('buttons.start');
  stopBtn.textContent = stopBtn.dataset.state === 'stopping' ? t('buttons.stopping') : t('buttons.stop');
  historyBtn.textContent = t('buttons.history');
  detailDownloadTxt.textContent = t('buttons.detailDownloadTxt');
  detailDownloadSrt.textContent = t('buttons.detailDownloadSrt');
  detailDelete.textContent = t('buttons.delete');
  if (historyClear) historyClear.textContent = t('buttons.clearHistory');
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage;
  popupTitle.textContent = t('title');
  popupSubtitle.textContent = t('subtitle');
  guideTitle.textContent = t('guideTitle');
  guideStep1.textContent = t('guideSteps')[0];
  guideStep2.textContent = t('guideSteps')[1];
  guideStep3.textContent = t('guideSteps')[2];
  guideStep4.textContent = t('guideSteps')[3];
  shortcutsTitle.textContent = t('shortcutsTitle');
  shortcutDownload.textContent = t('shortcutDownload');
  shortcutCopy.textContent = t('shortcutCopy');
  statusLabel.textContent = t('statusLabel');
  capturedLabel.textContent = t('capturedLabel');
  historyTitle.textContent = t('historyTitle');
  detailDateLabel.textContent = t('detailDateLabel');
  detailTimeLabel.textContent = t('detailTimeLabel');
  detailCountLabel.textContent = t('detailCountLabel');
  updateButtonLabels();

  if (currentDetailSession) {
    detailCount.textContent = formatCount(currentDetailSession.captions.length);
  }

  langButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLanguage);
  });

  updateStatus();

  if (historyView.classList.contains('active') || historyDetailView.classList.contains('active')) {
    loadHistory();
  }
}

async function loadLanguage() {
  const result = await chrome.storage.local.get(LANGUAGE_KEY);
  currentLanguage = result[LANGUAGE_KEY] || 'ko';
  applyLanguage();
}

function setLanguage(lang) {
  if (!LANGUAGES[lang]) return;
  currentLanguage = lang;
  chrome.storage.local.set({ [LANGUAGE_KEY]: lang });
  applyLanguage();
}

/**
 * Show alert message
 */
function showAlert(message, type = 'error') {
  alertEl.textContent = message;
  alertEl.className = `alert alert-${type}`;
  alertEl.style.display = 'block';

  setTimeout(() => {
    alertEl.style.display = 'none';
  }, 3000);
}

/**
 * Send message to active tab
 */
async function sendToTab(message) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.url.includes('meet.google.com')) {
    throw new Error(t('errors.noMeetTab'));
  }

  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tab.id, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

/**
 * Update status display
 */
async function updateStatus() {
  try {
    const response = await sendToTab({ type: MessageTypes.GET_STATUS });

    if (response) {
      statusEl.textContent = response.isCapturing ? t('statusCapturing') : t('statusIdle');
      countEl.textContent = response.count || 0;

      startBtn.disabled = response.isCapturing;
      stopBtn.disabled = !response.isCapturing;
    }
  } catch (error) {
    console.error('Status update failed:', error);
  }
}

/**
 * Start capture
 */
async function startCapture() {
  try {
    startBtn.disabled = true;
    startBtn.dataset.state = 'starting';
    updateButtonLabels();

    const response = await sendToTab({ type: MessageTypes.START_CAPTURE });

    if (response.success) {
      showAlert(t('alerts.captureStarted'), 'success');
      startBtn.dataset.state = 'idle';
      updateButtonLabels();
      stopBtn.disabled = false;

      // Start status updates
      if (!updateInterval) {
        updateInterval = setInterval(updateStatus, 1000);
      }
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error('Start failed:', error);
    showAlert(error.message || t('alerts.captureStartFailed'), 'error');
    startBtn.disabled = false;
    startBtn.dataset.state = 'idle';
    updateButtonLabels();
  }
}

/**
 * Stop capture
 */
async function stopCapture() {
  try {
    stopBtn.disabled = true;
    stopBtn.dataset.state = 'stopping';
    updateButtonLabels();

    const response = await sendToTab({ type: MessageTypes.STOP_CAPTURE });

    if (response.success) {
      showAlert(t('alerts.captureStopped')(response.count), 'success');
      stopBtn.dataset.state = 'idle';
      updateButtonLabels();
      startBtn.disabled = false;

      // Stop status updates
      if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
      }

      await updateStatus();
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error('Stop failed:', error);
    showAlert(error.message || t('alerts.captureStopFailed'), 'error');
    stopBtn.disabled = false;
    stopBtn.dataset.state = 'idle';
    updateButtonLabels();
  }
}

/**
 * Download as text
 */
async function downloadText() {
  try {
    downloadTxtBtn.disabled = true;
    await sendToTab({ type: MessageTypes.DOWNLOAD_TEXT });
    showAlert(t('alerts.txtDownloaded'), 'success');
  } catch (error) {
    console.error('Download failed:', error);
    showAlert(error.message || t('alerts.downloadFailed'), 'error');
  } finally {
    downloadTxtBtn.disabled = false;
  }
}

/**
 * Download as SRT
 */
async function downloadSRT() {
  try {
    downloadSrtBtn.disabled = true;
    await sendToTab({ type: MessageTypes.DOWNLOAD_SRT });
    showAlert(t('alerts.srtDownloaded'), 'success');
  } catch (error) {
    console.error('Download failed:', error);
    showAlert(error.message || t('alerts.downloadFailed'), 'error');
  } finally {
    downloadSrtBtn.disabled = false;
  }
}

// =============================================================================
// View Navigation
// =============================================================================

function showView(viewId) {
  mainView.classList.remove('active');
  historyView.classList.remove('active');
  historyDetailView.classList.remove('active');

  document.getElementById(viewId).classList.add('active');
}

// =============================================================================
// Guide Toggle
// =============================================================================

function toggleGuide() {
  guideContent.classList.toggle('collapsed');
  guideToggle.textContent = guideContent.classList.contains('collapsed') ? '+' : '-';

  // Save state
  chrome.storage.local.set({ popupGuideCollapsed: guideContent.classList.contains('collapsed') });
}

async function restoreGuideState() {
  const result = await chrome.storage.local.get('popupGuideCollapsed');
  if (result.popupGuideCollapsed) {
    guideContent.classList.add('collapsed');
    guideToggle.textContent = '+';
  }
}

// =============================================================================
// History Functions
// =============================================================================

/**
 * Load and display history
 */
async function loadHistory() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const history = result[STORAGE_KEY] || {};

    // Convert to array and sort by date (newest first)
    const sessions = Object.values(history)
      .filter(session => session.captions && session.captions.length > 0)
      .sort((a, b) => b.startTime - a.startTime);

    renderHistoryList(sessions);
  } catch (error) {
    console.error('Failed to load history:', error);
    historyList.innerHTML = `<div class="history-empty"><div class="history-empty-icon">⚠️</div><div class="history-empty-text">${t('alerts.historyLoadFailed')}</div></div>`;
  }
}

/**
 * Render history list
 */
function renderHistoryList(sessions) {
  if (sessions.length === 0) {
    historyList.innerHTML = `<div class="history-empty"><div class="history-empty-icon">📝</div><div class="history-empty-text">${t('alerts.historyEmpty')}</div></div>`;
    return;
  }

  historyList.innerHTML = sessions.map(session => {
    const date = new Date(session.startTime);
    const timestamp = formatFullTimestamp(date);
    const title = extractMeetingTitle(session);
    const preview = getPreviewText(session.captions);
    const count = session.captions.length;

    return `
      <div class="history-item" data-session-id="${session.id}">
        <div class="history-item-header">
          <span class="history-item-title">${escapeHtml(title)}</span>
          <div class="history-item-meta">
            <span class="history-item-date">${timestamp}</span>
            <span class="history-item-count">${formatCount(count)}</span>
          </div>
        </div>
        <div class="history-item-preview">${escapeHtml(preview)}</div>
      </div>
    `;
  }).join('');

  // Add click handlers
  historyList.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', () => {
      const sessionId = item.dataset.sessionId;
      showSessionDetail(sessionId);
    });
  });
}

/**
 * Extract meeting title from session
 */
function extractMeetingTitle(session) {
  if (session.metadata && session.metadata.title) {
    // Clean up Google Meet title
    let title = session.metadata.title;
    title = title.replace(' - Google Meet', '');
    title = title.replace('Meet - ', '');
    if (title.length > 40) {
      title = title.substring(0, 40) + '...';
    }
    return title || t('defaultMeetingTitle');
  }
  return t('defaultMeetingTitle');
}

/**
 * Get preview text from captions
 */
function getPreviewText(captions) {
  if (!captions || captions.length === 0) return '';

  // Get first few captions for preview
  const previewCaptions = captions.slice(0, 3);
  const text = previewCaptions.map(c => c.text).join(' ');

  if (text.length > 100) {
    return text.substring(0, 100) + '...';
  }
  return text;
}

/**
 * Show session detail
 */
async function showSessionDetail(sessionId) {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const history = result[STORAGE_KEY] || {};
    const session = history[sessionId];

    if (!session) {
      showAlert(t('alerts.sessionNotFound'), 'error');
      return;
    }

    currentDetailSession = session;

    const date = new Date(session.startTime);
    const title = extractMeetingTitle(session);

    detailTitle.textContent = title;
    detailDate.textContent = formatDate(date);
    detailTime.textContent = formatTime(date);
    detailCount.textContent = formatCount(session.captions.length);

    // Render caption content
    detailContent.innerHTML = session.captions.map(caption => {
      return `<div>[${caption.time}] ${escapeHtml(caption.text)}</div>`;
    }).join('');

    showView('history-detail-view');
  } catch (error) {
    console.error('Failed to load session detail:', error);
    showAlert(t('alerts.sessionLoadFailed'), 'error');
  }
}

/**
 * Download session as TXT
 */
function downloadSessionAsTxt() {
  if (!currentDetailSession) return;

  const content = currentDetailSession.captions.map(c => `[${c.time}] ${c.text}`).join('\n');
  const title = extractMeetingTitle(currentDetailSession);
  const filename = `${title}_${formatFilenameDate(new Date(currentDetailSession.startTime))}.txt`;

  downloadFile(content, filename, 'text/plain');
}

/**
 * Download session as SRT
 */
function downloadSessionAsSrt() {
  if (!currentDetailSession) return;

  const content = generateSRT(currentDetailSession.captions);
  const title = extractMeetingTitle(currentDetailSession);
  const filename = `${title}_${formatFilenameDate(new Date(currentDetailSession.startTime))}.srt`;

  downloadFile(content, filename, 'text/plain');
}

/**
 * Generate SRT content
 */
function generateSRT(captions) {
  return captions.map((caption, index) => {
    const startTime = caption.time || '00:00:00';
    const endTime = captions[index + 1]?.time || incrementTime(startTime, 3);

    return `${index + 1}\n${formatSRTTime(startTime)} --> ${formatSRTTime(endTime)}\n${caption.text}\n`;
  }).join('\n');
}

/**
 * Format time for SRT
 */
function formatSRTTime(time) {
  // Convert HH:MM:SS to HH:MM:SS,000
  const parts = time.split(':');
  if (parts.length === 2) {
    return `00:${parts[0]}:${parts[1]},000`;
  } else if (parts.length === 3) {
    return `${parts[0]}:${parts[1]}:${parts[2]},000`;
  }
  return `00:00:00,000`;
}

/**
 * Increment time by seconds
 */
function incrementTime(time, seconds) {
  const parts = time.split(':').map(Number);
  let totalSeconds;

  if (parts.length === 2) {
    totalSeconds = parts[0] * 60 + parts[1];
  } else {
    totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  totalSeconds += seconds;

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Delete session
 */
async function deleteSession() {
  if (!currentDetailSession) return;

  if (!confirm(t('confirmDelete'))) return;

  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const history = result[STORAGE_KEY] || {};

    delete history[currentDetailSession.id];

    await chrome.storage.local.set({ [STORAGE_KEY]: history });

    currentDetailSession = null;
    showView('history-view');
    loadHistory();
    showAlert(t('alerts.deleted'), 'success');
  } catch (error) {
    console.error('Failed to delete session:', error);
    showAlert(t('alerts.deleteFailed'), 'error');
  }
}

async function clearHistory() {
  if (!confirm(t('confirmClearHistory'))) {
    return;
  }

  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: {} });
    showAlert(t('alerts.historyCleared'), 'success');
    await loadHistory();
  } catch (error) {
    console.error('Failed to clear history:', error);
    showAlert(t('alerts.historyClearFailed'), 'error');
  }
}

/**
 * Download file helper
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// =============================================================================
// Utility Functions
// =============================================================================

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatTimeWithSeconds(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function formatFullTimestamp(date) {
  return `${formatDate(date)} ${formatTimeWithSeconds(date)}`;
}

function formatFilenameDate(date) {
  return `${formatDate(date)}_${formatTime(date).replace(':', '')}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// =============================================================================
// Event Listeners
// =============================================================================

// Main controls
startBtn.addEventListener('click', startCapture);
stopBtn.addEventListener('click', stopCapture);
downloadTxtBtn.addEventListener('click', downloadText);
downloadSrtBtn.addEventListener('click', downloadSRT);

// Guide toggle
guideHeader.addEventListener('click', toggleGuide);

// History navigation
historyBtn.addEventListener('click', () => {
  showView('history-view');
  loadHistory();
});

backFromHistory.addEventListener('click', () => {
  showView('main-view');
});

backFromDetail.addEventListener('click', () => {
  showView('history-view');
  currentDetailSession = null;
});

// History detail actions
detailDownloadTxt.addEventListener('click', downloadSessionAsTxt);
detailDownloadSrt.addEventListener('click', downloadSessionAsSrt);
detailDelete.addEventListener('click', deleteSession);
historyClear?.addEventListener('click', clearHistory);

langButtons.forEach(btn => {
  btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
});

// =============================================================================
// Initialize
// =============================================================================

async function init() {
  startBtn.dataset.state = 'idle';
  stopBtn.dataset.state = 'idle';
  await restoreGuideState();
  await loadLanguage();
  updateStatus();
}

init();
