/**
 * Popup Script for Google Meet Transcriber
 * Handles popup UI interactions and communication with background service worker
 */

import { MessageTypes, sendToBackground } from '../utils/message-types.js';

// State
let state = {
  hasApiKey: false,
  settings: {},
  meetingState: 'IDLE',
  transcriptionState: 'IDLE',
  currentMeetingId: null,
  meetings: []
};

// DOM Elements
const elements = {};

/**
 * Initialize popup
 */
async function initialize() {
  console.log('Popup initialized');

  // Cache DOM elements
  cacheElements();

  // Set up event listeners
  setupEventListeners();

  // Load initial data
  await loadInitialData();

  // Start update interval
  startUpdateInterval();
}

/**
 * Cache DOM elements
 */
function cacheElements() {
  elements.apiKeyInput = document.getElementById('apiKeyInput');
  elements.toggleApiKey = document.getElementById('toggleApiKey');
  elements.saveApiKey = document.getElementById('saveApiKey');
  elements.validateApiKey = document.getElementById('validateApiKey');
  elements.apiStatus = document.getElementById('apiStatus');
  elements.connectionStatus = document.getElementById('connectionStatus');

  elements.meetingStatus = document.getElementById('meetingStatus');
  elements.meetingTitle = document.getElementById('meetingTitle');
  elements.meetingDuration = document.getElementById('meetingDuration');
  elements.toggleTranscription = document.getElementById('toggleTranscription');
  elements.transcriptionStats = document.getElementById('transcriptionStats');
  elements.wordCount = document.getElementById('wordCount');
  elements.segmentCount = document.getElementById('segmentCount');

  elements.autoTranscribe = document.getElementById('autoTranscribe');
  elements.showOverlay = document.getElementById('showOverlay');
  elements.language = document.getElementById('language');

  elements.meetingsList = document.getElementById('meetingsList');
  elements.viewAllMeetings = document.getElementById('viewAllMeetings');
  elements.openFullPanel = document.getElementById('openFullPanel');

  elements.toast = document.getElementById('toast');
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // API Key
  elements.toggleApiKey?.addEventListener('click', toggleApiKeyVisibility);
  elements.saveApiKey?.addEventListener('click', handleSaveApiKey);
  elements.validateApiKey?.addEventListener('click', handleValidateApiKey);
  elements.apiKeyInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSaveApiKey();
  });

  // Transcription
  elements.toggleTranscription?.addEventListener('click', handleToggleTranscription);

  // Settings
  elements.autoTranscribe?.addEventListener('change', handleSettingChange);
  elements.showOverlay?.addEventListener('change', handleSettingChange);
  elements.language?.addEventListener('change', handleSettingChange);

  // Navigation
  elements.viewAllMeetings?.addEventListener('click', () => openSidePanel());
  elements.openFullPanel?.addEventListener('click', () => openSidePanel());
}

/**
 * Load initial data from background
 */
async function loadInitialData() {
  try {
    // Check API key status
    const apiResponse = await sendToBackground(MessageTypes.GET_API_KEY, {});
    state.hasApiKey = apiResponse.hasKey;
    updateApiStatus();

    // Load settings
    const settingsResponse = await sendToBackground(MessageTypes.GET_SETTINGS, {});
    if (settingsResponse.success) {
      state.settings = settingsResponse.settings;
      applySettings();
    }

    // Get meeting state
    const meetingResponse = await sendToBackground(MessageTypes.GET_MEETING_STATE, {});
    if (meetingResponse.success) {
      state.meetingState = meetingResponse.meetingState;
      state.transcriptionState = meetingResponse.transcriptionState;
      state.currentMeetingId = meetingResponse.meetingId;
      updateMeetingUI();
    }

    // Load recent meetings
    await loadRecentMeetings();
  } catch (error) {
    console.error('Failed to load initial data:', error);
    showToast('Failed to load data', 'error');
  }
}

/**
 * Toggle API key visibility
 */
function toggleApiKeyVisibility() {
  if (elements.apiKeyInput) {
    const isPassword = elements.apiKeyInput.type === 'password';
    elements.apiKeyInput.type = isPassword ? 'text' : 'password';
  }
}

/**
 * Handle save API key
 */
async function handleSaveApiKey() {
  const apiKey = elements.apiKeyInput?.value?.trim();

  if (!apiKey) {
    showToast('Please enter an API key', 'error');
    return;
  }

  if (!apiKey.startsWith('sk-')) {
    showToast('Invalid API key format', 'error');
    return;
  }

  try {
    elements.saveApiKey.disabled = true;
    elements.saveApiKey.textContent = 'Saving...';

    await sendToBackground(MessageTypes.SAVE_API_KEY, { apiKey });

    state.hasApiKey = true;
    updateApiStatus();
    elements.apiKeyInput.value = '';
    showToast('API key saved successfully', 'success');
  } catch (error) {
    console.error('Failed to save API key:', error);
    showToast('Failed to save API key', 'error');
  } finally {
    elements.saveApiKey.disabled = false;
    elements.saveApiKey.textContent = 'Save Key';
  }
}

/**
 * Handle validate API key
 */
async function handleValidateApiKey() {
  const apiKey = elements.apiKeyInput?.value?.trim();

  if (!apiKey) {
    showToast('Please enter an API key to validate', 'error');
    return;
  }

  try {
    elements.validateApiKey.disabled = true;
    elements.validateApiKey.textContent = 'Validating...';

    const response = await sendToBackground(MessageTypes.VALIDATE_API_KEY, { apiKey });

    if (response.valid) {
      showToast('API key is valid', 'success');
    } else {
      showToast(response.error || 'Invalid API key', 'error');
    }
  } catch (error) {
    console.error('Failed to validate API key:', error);
    showToast('Validation failed', 'error');
  } finally {
    elements.validateApiKey.disabled = false;
    elements.validateApiKey.textContent = 'Validate';
  }
}

/**
 * Update API status display
 */
function updateApiStatus() {
  if (!elements.apiStatus) return;

  if (state.hasApiKey) {
    elements.apiStatus.textContent = 'Configured';
    elements.apiStatus.className = 'status-badge success';
  } else {
    elements.apiStatus.textContent = 'Not configured';
    elements.apiStatus.className = 'status-badge';
  }
}

/**
 * Handle toggle transcription
 */
async function handleToggleTranscription() {
  try {
    if (state.transcriptionState === 'ACTIVE') {
      // Stop transcription
      elements.toggleTranscription.disabled = true;
      const response = await sendToBackground(MessageTypes.STOP_TRANSCRIPTION, {});

      if (response.success) {
        state.transcriptionState = 'IDLE';
        showToast('Transcription stopped', 'success');
      } else {
        throw new Error(response.error);
      }
    } else {
      // Check API key first
      if (!state.hasApiKey) {
        showToast('Please configure your API key first', 'error');
        return;
      }

      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab?.url?.includes('meet.google.com')) {
        showToast('Please open Google Meet first', 'error');
        return;
      }

      // Start transcription
      elements.toggleTranscription.disabled = true;
      const response = await sendToBackground(MessageTypes.START_TRANSCRIPTION, { tabId: tab.id });

      if (response.success) {
        state.transcriptionState = 'ACTIVE';
        state.currentMeetingId = response.meetingId;
        showToast('Transcription started', 'success');
      } else {
        throw new Error(response.error);
      }
    }

    updateMeetingUI();
  } catch (error) {
    console.error('Failed to toggle transcription:', error);
    showToast(error.message || 'Failed to toggle transcription', 'error');
  } finally {
    elements.toggleTranscription.disabled = false;
  }
}

/**
 * Handle setting change
 */
async function handleSettingChange(event) {
  const setting = event.target.id;
  let value;

  if (event.target.type === 'checkbox') {
    value = event.target.checked;
  } else {
    value = event.target.value;
  }

  state.settings[setting] = value;

  try {
    await sendToBackground(MessageTypes.SAVE_SETTINGS, { settings: state.settings });
  } catch (error) {
    console.error('Failed to save setting:', error);
    showToast('Failed to save setting', 'error');
  }
}

/**
 * Apply loaded settings to UI
 */
function applySettings() {
  if (elements.autoTranscribe) {
    elements.autoTranscribe.checked = state.settings.autoTranscribe ?? true;
  }
  if (elements.showOverlay) {
    elements.showOverlay.checked = state.settings.showOverlay ?? true;
  }
  if (elements.language) {
    elements.language.value = state.settings.language ?? 'ko';
  }
}

/**
 * Update meeting UI based on current state
 */
function updateMeetingUI() {
  const noMeetingEl = elements.meetingStatus?.querySelector('.no-meeting');
  const activeMeetingEl = elements.meetingStatus?.querySelector('.active-meeting');

  if (state.meetingState === 'IN_MEETING') {
    if (noMeetingEl) noMeetingEl.style.display = 'none';
    if (activeMeetingEl) activeMeetingEl.style.display = 'flex';

    // Update transcription button
    if (elements.toggleTranscription) {
      if (state.transcriptionState === 'ACTIVE') {
        elements.toggleTranscription.innerHTML = `
          <span class="btn-icon-start">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="1"></rect>
            </svg>
          </span>
          Stop Recording
        `;
        elements.toggleTranscription.classList.add('recording');
      } else {
        elements.toggleTranscription.innerHTML = `
          <span class="btn-icon-start">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="8"></circle>
            </svg>
          </span>
          Start Recording
        `;
        elements.toggleTranscription.classList.remove('recording');
      }
    }

    // Show stats if transcribing
    if (elements.transcriptionStats) {
      elements.transcriptionStats.style.display = state.transcriptionState === 'ACTIVE' ? 'flex' : 'none';
    }
  } else {
    if (noMeetingEl) noMeetingEl.style.display = 'flex';
    if (activeMeetingEl) activeMeetingEl.style.display = 'none';
  }
}

/**
 * Load recent meetings
 */
async function loadRecentMeetings() {
  try {
    const response = await sendToBackground(MessageTypes.GET_ALL_MEETINGS, {});

    if (response.success) {
      state.meetings = response.meetings.slice(0, 5); // Show only 5 most recent
      renderMeetingsList();
    }
  } catch (error) {
    console.error('Failed to load meetings:', error);
  }
}

/**
 * Render meetings list
 */
function renderMeetingsList() {
  if (!elements.meetingsList) return;

  if (state.meetings.length === 0) {
    elements.meetingsList.innerHTML = `
      <div class="empty-state">
        <p>No meetings recorded yet</p>
      </div>
    `;
    return;
  }

  elements.meetingsList.innerHTML = state.meetings.map(meeting => {
    const date = new Date(meeting.createdAt || Date.now());
    const dateStr = date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div class="meeting-item" data-meeting-id="${meeting.id}">
        <div class="meeting-item-info">
          <span class="meeting-item-title">${escapeHtml(meeting.title || 'Untitled Meeting')}</span>
          <span class="meeting-item-date">${dateStr}</span>
        </div>
        <span class="meeting-item-action">View</span>
      </div>
    `;
  }).join('');

  // Add click handlers
  elements.meetingsList.querySelectorAll('.meeting-item').forEach(item => {
    item.addEventListener('click', () => {
      const meetingId = item.dataset.meetingId;
      openSidePanel(meetingId);
    });
  });
}

/**
 * Open side panel
 * @param {string} meetingId - Optional meeting ID to open
 */
async function openSidePanel(meetingId = null) {
  try {
    // Store the meeting ID to open
    if (meetingId) {
      await chrome.storage.session.set({ openMeetingId: meetingId });
    }

    // Open side panel
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await chrome.sidePanel.open({ tabId: tab.id });
    }
  } catch (error) {
    console.error('Failed to open side panel:', error);

    // Fallback: open sidepanel in new tab
    chrome.tabs.create({ url: chrome.runtime.getURL('sidepanel/sidepanel.html') });
  }
}

/**
 * Start update interval
 */
function startUpdateInterval() {
  // Update meeting state periodically
  setInterval(async () => {
    try {
      const response = await sendToBackground(MessageTypes.GET_MEETING_STATE, {});
      if (response.success) {
        const stateChanged =
          state.meetingState !== response.meetingState ||
          state.transcriptionState !== response.transcriptionState;

        state.meetingState = response.meetingState;
        state.transcriptionState = response.transcriptionState;
        state.currentMeetingId = response.meetingId;

        if (stateChanged) {
          updateMeetingUI();
        }
      }
    } catch (e) {
      // Ignore errors in update loop
    }
  }, 2000);
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type (success, error)
 */
function showToast(message, type = 'success') {
  if (!elements.toast) return;

  const messageEl = elements.toast.querySelector('.toast-message');
  if (messageEl) {
    messageEl.textContent = message;
  }

  elements.toast.className = `toast ${type}`;
  elements.toast.style.display = 'block';

  setTimeout(() => {
    elements.toast.style.display = 'none';
  }, 3000);
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initialize);
