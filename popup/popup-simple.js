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

// State
let updateInterval = null;
let currentDetailSession = null;

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
    throw new Error('Google Meet 탭이 활성화되어 있지 않습니다');
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
      statusEl.textContent = response.isCapturing ? '캡처 중...' : '대기 중';
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
    startBtn.textContent = '시작 중...';

    const response = await sendToTab({ type: MessageTypes.START_CAPTURE });

    if (response.success) {
      showAlert('캡처를 시작했습니다', 'success');
      startBtn.textContent = '캡처 시작';
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
    showAlert(error.message || '캡처 시작 실패', 'error');
    startBtn.disabled = false;
    startBtn.textContent = '캡처 시작';
  }
}

/**
 * Stop capture
 */
async function stopCapture() {
  try {
    stopBtn.disabled = true;
    stopBtn.textContent = '중지 중...';

    const response = await sendToTab({ type: MessageTypes.STOP_CAPTURE });

    if (response.success) {
      showAlert(`캡처를 중지했습니다 (${response.count}개 자막)`, 'success');
      stopBtn.textContent = '캡처 중지';
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
    showAlert(error.message || '캡처 중지 실패', 'error');
    stopBtn.disabled = false;
    stopBtn.textContent = '캡처 중지';
  }
}

/**
 * Download as text
 */
async function downloadText() {
  try {
    downloadTxtBtn.disabled = true;
    await sendToTab({ type: MessageTypes.DOWNLOAD_TEXT });
    showAlert('TXT 파일 다운로드 완료', 'success');
  } catch (error) {
    console.error('Download failed:', error);
    showAlert(error.message || '다운로드 실패', 'error');
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
    showAlert('SRT 파일 다운로드 완료', 'success');
  } catch (error) {
    console.error('Download failed:', error);
    showAlert(error.message || '다운로드 실패', 'error');
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
    historyList.innerHTML = '<div class="history-empty"><div class="history-empty-icon">⚠️</div><div class="history-empty-text">히스토리를 불러올 수 없습니다</div></div>';
  }
}

/**
 * Render history list
 */
function renderHistoryList(sessions) {
  if (sessions.length === 0) {
    historyList.innerHTML = '<div class="history-empty"><div class="history-empty-icon">📝</div><div class="history-empty-text">저장된 회의가 없습니다</div></div>';
    return;
  }

  historyList.innerHTML = sessions.map(session => {
    const date = new Date(session.startTime);
    const dateStr = formatDate(date);
    const timeStr = formatTime(date);
    const title = extractMeetingTitle(session);
    const preview = getPreviewText(session.captions);
    const count = session.captions.length;

    return `
      <div class="history-item" data-session-id="${session.id}">
        <div class="history-item-header">
          <span class="history-item-title">${escapeHtml(title)}</span>
          <div class="history-item-meta">
            <span class="history-item-date">${dateStr}</span>
            <span class="history-item-count">${count}개</span>
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
    return title || '회의';
  }
  return '회의';
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
      showAlert('세션을 찾을 수 없습니다', 'error');
      return;
    }

    currentDetailSession = session;

    const date = new Date(session.startTime);
    const title = extractMeetingTitle(session);

    detailTitle.textContent = title;
    detailDate.textContent = formatDate(date);
    detailTime.textContent = formatTime(date);
    detailCount.textContent = `${session.captions.length}개`;

    // Render caption content
    detailContent.innerHTML = session.captions.map(caption => {
      return `<div>[${caption.time}] ${escapeHtml(caption.text)}</div>`;
    }).join('');

    showView('history-detail-view');
  } catch (error) {
    console.error('Failed to load session detail:', error);
    showAlert('세션 상세 정보를 불러올 수 없습니다', 'error');
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

  if (!confirm('이 회의 기록을 삭제하시겠습니까?')) return;

  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const history = result[STORAGE_KEY] || {};

    delete history[currentDetailSession.id];

    await chrome.storage.local.set({ [STORAGE_KEY]: history });

    currentDetailSession = null;
    showView('history-view');
    loadHistory();
    showAlert('삭제되었습니다', 'success');
  } catch (error) {
    console.error('Failed to delete session:', error);
    showAlert('삭제에 실패했습니다', 'error');
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

// =============================================================================
// Initialize
// =============================================================================

async function init() {
  await restoreGuideState();
  updateStatus();
}

init();
