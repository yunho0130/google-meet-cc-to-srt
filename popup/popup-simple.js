/**
 * Simple Popup for CC Capturer
 */

const MessageTypes = {
  START_CAPTURE: 'START_CAPTURE',
  STOP_CAPTURE: 'STOP_CAPTURE',
  GET_STATUS: 'GET_STATUS',
  DOWNLOAD_TEXT: 'DOWNLOAD_TEXT',
  DOWNLOAD_SRT: 'DOWNLOAD_SRT'
};

// DOM Elements
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const downloadTxtBtn = document.getElementById('download-txt');
const downloadSrtBtn = document.getElementById('download-srt');
const statusEl = document.getElementById('status');
const countEl = document.getElementById('count');
const alertEl = document.getElementById('alert');

// State
let updateInterval = null;

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

// Event Listeners
startBtn.addEventListener('click', startCapture);
stopBtn.addEventListener('click', stopCapture);
downloadTxtBtn.addEventListener('click', downloadText);
downloadSrtBtn.addEventListener('click', downloadSRT);

// Initialize
updateStatus();
