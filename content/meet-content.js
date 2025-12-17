/**
 * Content Script for Google Meet
 * Detects meeting state, captures attendee information, and shows transcription overlay
 */

// State
let meetingState = {
  isInMeeting: false,
  meetingCode: null,
  meetingTitle: '',
  participants: [],
  transcriptVisible: true,
  transcriptContent: []
};

// DOM elements
let overlayContainer = null;
let transcriptPanel = null;
let statusIndicator = null;

// Observers
let meetingObserver = null;
let participantObserver = null;

/**
 * Initialize the content script
 */
function initialize() {
  console.log('Google Meet Transcriber: Content script loaded');

  // Create UI elements
  createOverlayUI();

  // Start observing for meeting state changes
  startMeetingObserver();

  // Listen for messages from background
  chrome.runtime.onMessage.addListener(handleMessage);

  // Check if already in a meeting
  checkMeetingState();
}

/**
 * Create the overlay UI for showing transcription
 */
function createOverlayUI() {
  // Create main container
  overlayContainer = document.createElement('div');
  overlayContainer.id = 'gmt-overlay-container';
  overlayContainer.className = 'gmt-overlay-container';

  // Create status indicator
  statusIndicator = document.createElement('div');
  statusIndicator.id = 'gmt-status-indicator';
  statusIndicator.className = 'gmt-status-indicator';
  statusIndicator.innerHTML = `
    <div class="gmt-status-dot"></div>
    <span class="gmt-status-text">Ready</span>
  `;

  // Create transcript panel
  transcriptPanel = document.createElement('div');
  transcriptPanel.id = 'gmt-transcript-panel';
  transcriptPanel.className = 'gmt-transcript-panel';
  transcriptPanel.innerHTML = `
    <div class="gmt-panel-header">
      <span class="gmt-panel-title">Live Transcript</span>
      <div class="gmt-panel-controls">
        <button class="gmt-btn gmt-btn-minimize" title="Minimize">_</button>
        <button class="gmt-btn gmt-btn-close" title="Close">x</button>
      </div>
    </div>
    <div class="gmt-panel-content">
      <div id="gmt-transcript-content" class="gmt-transcript-content">
        <p class="gmt-transcript-placeholder">Transcription will appear here...</p>
      </div>
    </div>
    <div class="gmt-panel-footer">
      <span class="gmt-word-count">0 words</span>
    </div>
  `;

  overlayContainer.appendChild(statusIndicator);
  overlayContainer.appendChild(transcriptPanel);

  // Add to page
  document.body.appendChild(overlayContainer);

  // Set up event listeners
  setupOverlayEventListeners();

  // Make panel draggable
  makeDraggable(transcriptPanel);
}

/**
 * Set up event listeners for overlay controls
 */
function setupOverlayEventListeners() {
  const minimizeBtn = transcriptPanel.querySelector('.gmt-btn-minimize');
  const closeBtn = transcriptPanel.querySelector('.gmt-btn-close');

  minimizeBtn?.addEventListener('click', () => {
    transcriptPanel.classList.toggle('gmt-minimized');
  });

  closeBtn?.addEventListener('click', () => {
    transcriptPanel.style.display = 'none';
    meetingState.transcriptVisible = false;
  });

  statusIndicator?.addEventListener('click', () => {
    if (!meetingState.transcriptVisible) {
      transcriptPanel.style.display = 'flex';
      meetingState.transcriptVisible = true;
    }
  });
}

/**
 * Make an element draggable
 * @param {HTMLElement} element - Element to make draggable
 */
function makeDraggable(element) {
  const header = element.querySelector('.gmt-panel-header');
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  header?.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'BUTTON') return;
    isDragging = true;
    offsetX = e.clientX - element.offsetLeft;
    offsetY = e.clientY - element.offsetTop;
    element.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.right = 'auto';
    element.style.bottom = 'auto';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    element.style.cursor = '';
  });
}

/**
 * Start observing for meeting state changes
 */
function startMeetingObserver() {
  // Observe for meeting UI changes
  meetingObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        checkMeetingState();
      }
    }
  });

  meetingObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

/**
 * Check current meeting state by examining the DOM
 */
function checkMeetingState() {
  // Debounce
  clearTimeout(window._gmtCheckTimeout);
  window._gmtCheckTimeout = setTimeout(() => {
    const wasInMeeting = meetingState.isInMeeting;

    // Check for meeting indicators
    // Google Meet shows specific elements when in a meeting
    const inMeetingIndicators = [
      // Leave/end call button
      document.querySelector('[data-tooltip*="Leave call"]'),
      document.querySelector('[aria-label*="Leave call"]'),
      document.querySelector('[data-tooltip*="나가기"]'),
      // Meeting timer
      document.querySelector('[data-meeting-started-timestamp]'),
      // Video grid
      document.querySelector('[data-self-name]'),
      // Chat panel
      document.querySelector('[data-panel-id="2"]')
    ];

    const isInMeeting = inMeetingIndicators.some(el => el !== null);

    if (isInMeeting !== wasInMeeting) {
      meetingState.isInMeeting = isInMeeting;

      if (isInMeeting) {
        onMeetingStarted();
      } else {
        onMeetingEnded();
      }
    }

    // Update meeting title
    updateMeetingTitle();

    // Update participants
    if (isInMeeting) {
      updateParticipants();
    }
  }, 500);
}

/**
 * Handle meeting started
 */
function onMeetingStarted() {
  console.log('Meeting started');

  // Extract meeting code from URL
  const urlMatch = window.location.pathname.match(/\/([a-z]{3}-[a-z]{4}-[a-z]{3})/);
  meetingState.meetingCode = urlMatch ? urlMatch[1] : null;

  // Update UI
  updateStatusIndicator('recording', 'Recording...');
  transcriptPanel.style.display = 'flex';
  meetingState.transcriptVisible = true;

  // Notify background
  chrome.runtime.sendMessage({
    type: 'MEETING_STARTED',
    payload: {
      meetingCode: meetingState.meetingCode,
      title: meetingState.meetingTitle,
      participants: meetingState.participants,
      url: window.location.href,
      timestamp: Date.now()
    }
  });
}

/**
 * Handle meeting ended
 */
function onMeetingEnded() {
  console.log('Meeting ended');

  // Update UI
  updateStatusIndicator('idle', 'Meeting ended');

  // Clear transcript content after a delay
  setTimeout(() => {
    meetingState.transcriptContent = [];
  }, 5000);

  // Notify background
  chrome.runtime.sendMessage({
    type: 'MEETING_ENDED',
    payload: {
      meetingCode: meetingState.meetingCode,
      timestamp: Date.now()
    }
  });
}

/**
 * Update meeting title from page
 */
function updateMeetingTitle() {
  // Try to get meeting title from various sources
  const titleSelectors = [
    '[data-meeting-title]',
    '.roSPhc', // Meeting title in header
    'div[jsname="NFC9Vc"]', // Another possible location
    'title'
  ];

  for (const selector of titleSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      const title = element.textContent || element.getAttribute('data-meeting-title');
      if (title && title.length > 0 && !title.includes('Meet')) {
        meetingState.meetingTitle = title.trim();
        break;
      }
    }
  }

  // Fallback to URL code
  if (!meetingState.meetingTitle && meetingState.meetingCode) {
    meetingState.meetingTitle = `Meeting ${meetingState.meetingCode}`;
  }
}

/**
 * Update participant list
 */
function updateParticipants() {
  const participants = new Set();

  // Get participants from various sources
  const participantSelectors = [
    '[data-participant-id]',
    '[data-self-name]',
    '.ZjFb7c', // Participant name in video tile
    '.YTbUzc' // Participant name in list
  ];

  for (const selector of participantSelectors) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      const name = el.textContent?.trim() ||
                   el.getAttribute('data-self-name') ||
                   el.getAttribute('aria-label');
      if (name && name.length > 0 && name.length < 100) {
        participants.add(name);
      }
    });
  }

  meetingState.participants = Array.from(participants);
}

/**
 * Get meeting attendees with email addresses (if available)
 * @returns {Array} - Array of attendee objects
 */
function getMeetingAttendees() {
  const attendees = [];

  // Try to extract emails from participant details
  // Note: Google Meet doesn't always expose email addresses directly
  const participantElements = document.querySelectorAll('[data-participant-id]');

  participantElements.forEach(el => {
    const name = el.textContent?.trim();
    const email = el.getAttribute('data-participant-email'); // Might not be available

    if (name) {
      attendees.push({
        name: name,
        email: email || null
      });
    }
  });

  // Also include participants from our tracked list
  meetingState.participants.forEach(name => {
    if (!attendees.find(a => a.name === name)) {
      attendees.push({ name: name, email: null });
    }
  });

  return attendees;
}

/**
 * Update status indicator
 * @param {string} status - Status type (idle, recording, error)
 * @param {string} text - Status text to display
 */
function updateStatusIndicator(status, text) {
  if (!statusIndicator) return;

  statusIndicator.className = `gmt-status-indicator gmt-status-${status}`;
  const textEl = statusIndicator.querySelector('.gmt-status-text');
  if (textEl) {
    textEl.textContent = text;
  }
}

/**
 * Add transcription text to the overlay
 * @param {string} text - Transcribed text
 * @param {number} timestamp - Timestamp
 */
function addTranscription(text, timestamp) {
  if (!text || !transcriptPanel) return;

  const contentEl = transcriptPanel.querySelector('#gmt-transcript-content');
  if (!contentEl) return;

  // Remove placeholder
  const placeholder = contentEl.querySelector('.gmt-transcript-placeholder');
  if (placeholder) {
    placeholder.remove();
  }

  // Create transcript entry
  const entry = document.createElement('div');
  entry.className = 'gmt-transcript-entry';

  const time = new Date(timestamp);
  const timeStr = time.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  entry.innerHTML = `
    <span class="gmt-transcript-time">${timeStr}</span>
    <span class="gmt-transcript-text">${escapeHtml(text)}</span>
  `;

  contentEl.appendChild(entry);

  // Scroll to bottom
  contentEl.scrollTop = contentEl.scrollHeight;

  // Store transcript
  meetingState.transcriptContent.push({ text, timestamp });

  // Update word count
  updateWordCount();
}

/**
 * Update word count display
 */
function updateWordCount() {
  const wordCountEl = transcriptPanel?.querySelector('.gmt-word-count');
  if (!wordCountEl) return;

  const totalWords = meetingState.transcriptContent
    .reduce((count, entry) => count + entry.text.split(/\s+/).length, 0);

  wordCountEl.textContent = `${totalWords.toLocaleString()} words`;
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Handle messages from background script
 */
function handleMessage(message, sender, sendResponse) {
  const { type, payload } = message;

  switch (type) {
    case 'TRANSCRIPTION_RESULT':
      addTranscription(payload.text, payload.timestamp);
      sendResponse({ success: true });
      break;

    case 'TRANSCRIPTION_STATUS':
      if (payload.status === 'ACTIVE') {
        updateStatusIndicator('recording', 'Recording...');
      } else if (payload.status === 'STOPPED') {
        updateStatusIndicator('idle', 'Transcription stopped');
      } else if (payload.status === 'ERROR') {
        updateStatusIndicator('error', 'Error occurred');
      }
      sendResponse({ success: true });
      break;

    case 'GET_MEETING_ATTENDEES':
      const attendees = getMeetingAttendees();
      sendResponse({ success: true, attendees });
      break;

    case 'TOGGLE_OVERLAY':
      meetingState.transcriptVisible = !meetingState.transcriptVisible;
      if (transcriptPanel) {
        transcriptPanel.style.display = meetingState.transcriptVisible ? 'flex' : 'none';
      }
      sendResponse({ success: true });
      break;

    case 'UPDATE_OVERLAY':
      if (payload.visible !== undefined && transcriptPanel) {
        meetingState.transcriptVisible = payload.visible;
        transcriptPanel.style.display = payload.visible ? 'flex' : 'none';
      }
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }

  return true;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
