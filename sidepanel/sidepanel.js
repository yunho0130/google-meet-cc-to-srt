/**
 * Side Panel Script for Google Meet Transcriber
 * Full-featured panel for viewing meetings, editing notes, and managing settings
 */

import { MessageTypes, sendToBackground } from '../utils/message-types.js';

// State
let state = {
  currentView: 'meetings',
  meetings: [],
  currentMeeting: null,
  currentTab: 'transcript',
  settings: {},
  hasApiKey: false
};

// DOM Elements cache
const elements = {};

/**
 * Initialize side panel
 */
async function initialize() {
  console.log('Side panel initialized');

  // Cache elements
  cacheElements();

  // Set up event listeners
  setupEventListeners();

  // Load initial data
  await loadInitialData();

  // Check for meeting to open
  await checkOpenMeeting();
}

/**
 * Cache DOM elements
 */
function cacheElements() {
  // Views
  elements.meetingsView = document.getElementById('meetingsView');
  elements.settingsView = document.getElementById('settingsView');

  // Navigation
  elements.navBtns = document.querySelectorAll('.nav-btn');

  // Meetings
  elements.meetingsListContainer = document.getElementById('meetingsListContainer');
  elements.meetingDetailContainer = document.getElementById('meetingDetailContainer');
  elements.meetingsList = document.getElementById('meetingsList');
  elements.meetingCount = document.getElementById('meetingCount');
  elements.backToList = document.getElementById('backToList');
  elements.deleteMeeting = document.getElementById('deleteMeeting');
  elements.meetingTitleInput = document.getElementById('meetingTitleInput');
  elements.meetingDate = document.getElementById('meetingDate');
  elements.meetingDuration = document.getElementById('meetingDuration');

  // Tabs
  elements.tabBtns = document.querySelectorAll('.tab-btn');
  elements.transcriptTab = document.getElementById('transcriptTab');
  elements.notesTab = document.getElementById('notesTab');
  elements.transcriptContent = document.getElementById('transcriptContent');
  elements.notesContent = document.getElementById('notesContent');
  elements.notesEditor = document.getElementById('notesEditor');

  // Notes
  elements.generateNotes = document.getElementById('generateNotes');
  elements.saveNotes = document.getElementById('saveNotes');
  elements.sendEmail = document.getElementById('sendEmail');
  elements.notesSummary = document.getElementById('notesSummary');
  elements.keyPoints = document.getElementById('keyPoints');
  elements.decisions = document.getElementById('decisions');
  elements.actionItems = document.getElementById('actionItems');
  elements.followUp = document.getElementById('followUp');

  // Settings
  elements.settingsApiKey = document.getElementById('settingsApiKey');
  elements.settingsSaveApiKey = document.getElementById('settingsSaveApiKey');
  elements.settingsLanguage = document.getElementById('settingsLanguage');
  elements.settingsModel = document.getElementById('settingsModel');
  elements.settingsAutoTranscribe = document.getElementById('settingsAutoTranscribe');
  elements.settingsShowOverlay = document.getElementById('settingsShowOverlay');
  elements.settingsGptModel = document.getElementById('settingsGptModel');
  elements.exportData = document.getElementById('exportData');
  elements.clearData = document.getElementById('clearData');

  // UI
  elements.toast = document.getElementById('toast');
  elements.loadingOverlay = document.getElementById('loadingOverlay');
  elements.loadingText = document.getElementById('loadingText');
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Navigation
  elements.navBtns.forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // Meetings
  elements.backToList?.addEventListener('click', showMeetingsList);
  elements.deleteMeeting?.addEventListener('click', handleDeleteMeeting);
  elements.meetingTitleInput?.addEventListener('change', handleTitleChange);

  // Tabs
  elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Notes
  elements.generateNotes?.addEventListener('click', handleGenerateNotes);
  elements.saveNotes?.addEventListener('click', handleSaveNotes);
  elements.sendEmail?.addEventListener('click', handleSendEmail);

  // Add item buttons
  document.querySelectorAll('.add-item-btn').forEach(btn => {
    btn.addEventListener('click', () => addListItem(btn.dataset.target));
  });

  // Settings
  elements.settingsSaveApiKey?.addEventListener('click', handleSaveApiKey);
  elements.settingsLanguage?.addEventListener('change', handleSettingChange);
  elements.settingsModel?.addEventListener('change', handleSettingChange);
  elements.settingsAutoTranscribe?.addEventListener('change', handleSettingChange);
  elements.settingsShowOverlay?.addEventListener('change', handleSettingChange);
  elements.settingsGptModel?.addEventListener('change', handleSettingChange);
  elements.exportData?.addEventListener('click', handleExportData);
  elements.clearData?.addEventListener('click', handleClearData);
}

/**
 * Load initial data
 */
async function loadInitialData() {
  try {
    // Load API key status
    const apiResponse = await sendToBackground(MessageTypes.GET_API_KEY, {});
    state.hasApiKey = apiResponse.hasKey;

    // Load settings
    const settingsResponse = await sendToBackground(MessageTypes.GET_SETTINGS, {});
    if (settingsResponse.success) {
      state.settings = settingsResponse.settings;
      applySettings();
    }

    // Load meetings
    await loadMeetings();
  } catch (error) {
    console.error('Failed to load initial data:', error);
    showToast('Failed to load data', 'error');
  }
}

/**
 * Check if there's a meeting to open from session storage
 */
async function checkOpenMeeting() {
  try {
    const result = await chrome.storage.session.get(['openMeetingId']);
    if (result.openMeetingId) {
      await openMeetingDetail(result.openMeetingId);
      await chrome.storage.session.remove(['openMeetingId']);
    }
  } catch (e) {
    // Session storage might not be available
  }
}

/**
 * Switch between views
 * @param {string} view - View name
 */
function switchView(view) {
  state.currentView = view;

  // Update navigation
  elements.navBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });

  // Show/hide views
  elements.meetingsView.style.display = view === 'meetings' ? 'flex' : 'none';
  elements.settingsView.style.display = view === 'settings' ? 'block' : 'none';

  if (view === 'meetings') {
    showMeetingsList();
  }
}

/**
 * Switch between tabs in meeting detail
 * @param {string} tab - Tab name
 */
function switchTab(tab) {
  state.currentTab = tab;

  elements.tabBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  elements.transcriptTab.style.display = tab === 'transcript' ? 'flex' : 'none';
  elements.notesTab.style.display = tab === 'notes' ? 'flex' : 'none';
}

/**
 * Load meetings list
 */
async function loadMeetings() {
  try {
    const response = await sendToBackground(MessageTypes.GET_ALL_MEETINGS, {});

    if (response.success) {
      state.meetings = response.meetings;
      renderMeetingsList();
    }
  } catch (error) {
    console.error('Failed to load meetings:', error);
    elements.meetingsList.innerHTML = `
      <div class="empty-state">
        <p>Failed to load meetings</p>
      </div>
    `;
  }
}

/**
 * Render meetings list
 */
function renderMeetingsList() {
  elements.meetingCount.textContent = `${state.meetings.length} meeting${state.meetings.length !== 1 ? 's' : ''}`;

  if (state.meetings.length === 0) {
    elements.meetingsList.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <p>No meetings recorded yet</p>
        <span>Join a Google Meet meeting to start transcribing</span>
      </div>
    `;
    return;
  }

  elements.meetingsList.innerHTML = state.meetings.map(meeting => {
    const date = new Date(meeting.createdAt || Date.now());
    const dateStr = date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const duration = meeting.duration
      ? formatDuration(meeting.duration)
      : '-';

    const hasNotes = meeting.notes != null;

    return `
      <div class="meeting-card" data-meeting-id="${meeting.id}">
        <div class="meeting-card-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 7l-7 5 7 5V7z"/>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
        </div>
        <div class="meeting-card-content">
          <div class="meeting-card-title">${escapeHtml(meeting.title || 'Untitled Meeting')}</div>
          <div class="meeting-card-meta">
            <span>${dateStr} ${timeStr}</span>
            <span>${duration}</span>
          </div>
        </div>
        <span class="meeting-card-badge ${hasNotes ? 'has-notes' : ''}">${hasNotes ? 'Notes' : 'No notes'}</span>
      </div>
    `;
  }).join('');

  // Add click handlers
  elements.meetingsList.querySelectorAll('.meeting-card').forEach(card => {
    card.addEventListener('click', () => {
      openMeetingDetail(card.dataset.meetingId);
    });
  });
}

/**
 * Show meetings list view
 */
function showMeetingsList() {
  elements.meetingsListContainer.style.display = 'flex';
  elements.meetingDetailContainer.style.display = 'none';
  state.currentMeeting = null;
}

/**
 * Open meeting detail
 * @param {string} meetingId - Meeting ID
 */
async function openMeetingDetail(meetingId) {
  try {
    showLoading('Loading meeting...');

    const response = await sendToBackground(MessageTypes.GET_MEETING_DATA, { meetingId });

    if (!response.success || !response.data) {
      throw new Error('Meeting not found');
    }

    state.currentMeeting = { id: meetingId, ...response.data };

    // Update UI
    renderMeetingDetail();

    // Show detail view
    elements.meetingsListContainer.style.display = 'none';
    elements.meetingDetailContainer.style.display = 'flex';

    hideLoading();
  } catch (error) {
    console.error('Failed to open meeting:', error);
    hideLoading();
    showToast('Failed to load meeting', 'error');
  }
}

/**
 * Render meeting detail
 */
function renderMeetingDetail() {
  const meeting = state.currentMeeting;
  if (!meeting) return;

  // Title
  elements.meetingTitleInput.value = meeting.title || 'Untitled Meeting';

  // Date
  const date = new Date(meeting.createdAt || Date.now());
  elements.meetingDate.textContent = date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  // Duration
  elements.meetingDuration.textContent = meeting.duration
    ? `Duration: ${formatDuration(meeting.duration)}`
    : '';

  // Transcript
  renderTranscript();

  // Notes
  renderNotes();

  // Switch to transcript tab by default
  switchTab('transcript');
}

/**
 * Render transcript content
 */
function renderTranscript() {
  const meeting = state.currentMeeting;

  if (!meeting?.transcript) {
    elements.transcriptContent.innerHTML = `
      <p class="empty-state">No transcript available</p>
    `;
    return;
  }

  if (meeting.segments && meeting.segments.length > 0) {
    // Render with segments
    elements.transcriptContent.innerHTML = meeting.segments.map(segment => {
      const time = new Date(segment.timestamp);
      const timeStr = time.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      return `
        <div class="transcript-segment">
          <div class="transcript-time">${timeStr}</div>
          <div class="transcript-text">${escapeHtml(segment.text)}</div>
        </div>
      `;
    }).join('');
  } else {
    // Render plain transcript
    elements.transcriptContent.innerHTML = `
      <div class="transcript-segment">
        <div class="transcript-text">${escapeHtml(meeting.transcript)}</div>
      </div>
    `;
  }
}

/**
 * Render notes content
 */
function renderNotes() {
  const meeting = state.currentMeeting;

  if (!meeting?.notes) {
    elements.notesContent.innerHTML = `
      <p class="empty-state">Click "Generate Notes" to create AI-powered meeting notes</p>
    `;
    elements.notesContent.style.display = 'block';
    elements.notesEditor.style.display = 'none';
    return;
  }

  // Show editor
  elements.notesContent.style.display = 'none';
  elements.notesEditor.style.display = 'block';

  const notes = meeting.notes;

  // Summary
  elements.notesSummary.value = notes.summary || '';

  // Key points
  renderEditableList(elements.keyPoints, notes.keyDiscussionPoints || []);

  // Decisions
  renderEditableList(elements.decisions, notes.decisions || []);

  // Action items
  renderActionItems(notes.actionItems || []);

  // Follow-up
  renderEditableList(elements.followUp, notes.followUp || []);
}

/**
 * Render an editable list
 * @param {HTMLElement} container - Container element
 * @param {Array} items - List items
 */
function renderEditableList(container, items) {
  container.innerHTML = items.map((item, index) => `
    <div class="editable-item" data-index="${index}">
      <input type="text" value="${escapeHtml(item)}" />
      <button class="remove-btn" title="Remove">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `).join('');

  // Add remove handlers
  container.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('.editable-item').remove();
    });
  });
}

/**
 * Render action items
 * @param {Array} items - Action items
 */
function renderActionItems(items) {
  elements.actionItems.innerHTML = items.map((item, index) => `
    <div class="action-item" data-index="${index}">
      <input type="text" placeholder="Task" value="${escapeHtml(item.task || '')}" class="task-input" />
      <input type="text" placeholder="Assignee" value="${escapeHtml(item.assignee || '')}" class="assignee-input" />
      <input type="text" placeholder="Deadline" value="${escapeHtml(item.deadline || '')}" class="deadline-input" />
      <button class="btn btn-icon remove-btn" title="Remove">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `).join('');

  // Add remove handlers
  elements.actionItems.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('.action-item').remove();
    });
  });
}

/**
 * Add item to a list
 * @param {string} targetId - Target list ID
 */
function addListItem(targetId) {
  const container = document.getElementById(targetId);
  if (!container) return;

  if (targetId === 'actionItems') {
    const item = document.createElement('div');
    item.className = 'action-item';
    item.innerHTML = `
      <input type="text" placeholder="Task" class="task-input" />
      <input type="text" placeholder="Assignee" class="assignee-input" />
      <input type="text" placeholder="Deadline" class="deadline-input" />
      <button class="btn btn-icon remove-btn" title="Remove">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
    item.querySelector('.remove-btn').addEventListener('click', () => item.remove());
    container.appendChild(item);
  } else {
    const item = document.createElement('div');
    item.className = 'editable-item';
    item.innerHTML = `
      <input type="text" placeholder="Enter text..." />
      <button class="remove-btn" title="Remove">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
    item.querySelector('.remove-btn').addEventListener('click', () => item.remove());
    container.appendChild(item);
  }
}

/**
 * Handle title change
 */
async function handleTitleChange() {
  if (!state.currentMeeting) return;

  const newTitle = elements.meetingTitleInput.value.trim();
  state.currentMeeting.title = newTitle;

  try {
    await sendToBackground(MessageTypes.SAVE_MEETING_DATA, {
      meetingId: state.currentMeeting.id,
      data: { title: newTitle }
    });
  } catch (error) {
    console.error('Failed to save title:', error);
  }
}

/**
 * Handle delete meeting
 */
async function handleDeleteMeeting() {
  if (!state.currentMeeting) return;

  if (!confirm('Are you sure you want to delete this meeting?')) return;

  try {
    showLoading('Deleting meeting...');

    await sendToBackground(MessageTypes.DELETE_MEETING, {
      meetingId: state.currentMeeting.id
    });

    hideLoading();
    showToast('Meeting deleted', 'success');

    // Refresh list and go back
    await loadMeetings();
    showMeetingsList();
  } catch (error) {
    console.error('Failed to delete meeting:', error);
    hideLoading();
    showToast('Failed to delete meeting', 'error');
  }
}

/**
 * Handle generate notes
 */
async function handleGenerateNotes() {
  if (!state.currentMeeting) return;

  if (!state.hasApiKey) {
    showToast('Please configure your API key first', 'error');
    switchView('settings');
    return;
  }

  if (!state.currentMeeting.transcript) {
    showToast('No transcript available to generate notes', 'error');
    return;
  }

  try {
    showLoading('Generating meeting notes...');

    const response = await sendToBackground(MessageTypes.GENERATE_NOTES, {
      meetingId: state.currentMeeting.id
    });

    if (response.success) {
      state.currentMeeting.notes = response.notes;
      renderNotes();
      showToast('Notes generated successfully', 'success');
    } else {
      throw new Error(response.error || 'Failed to generate notes');
    }

    hideLoading();
  } catch (error) {
    console.error('Failed to generate notes:', error);
    hideLoading();
    showToast(error.message || 'Failed to generate notes', 'error');
  }
}

/**
 * Handle save notes
 */
async function handleSaveNotes() {
  if (!state.currentMeeting) return;

  try {
    // Collect notes from UI
    const notes = {
      summary: elements.notesSummary.value,
      keyDiscussionPoints: collectListValues(elements.keyPoints),
      decisions: collectListValues(elements.decisions),
      actionItems: collectActionItems(),
      followUp: collectListValues(elements.followUp)
    };

    await sendToBackground(MessageTypes.SAVE_MEETING_DATA, {
      meetingId: state.currentMeeting.id,
      data: { notes }
    });

    state.currentMeeting.notes = notes;
    showToast('Notes saved', 'success');
  } catch (error) {
    console.error('Failed to save notes:', error);
    showToast('Failed to save notes', 'error');
  }
}

/**
 * Collect values from editable list
 * @param {HTMLElement} container - Container element
 * @returns {Array} - Values
 */
function collectListValues(container) {
  const values = [];
  container.querySelectorAll('.editable-item input').forEach(input => {
    const value = input.value.trim();
    if (value) values.push(value);
  });
  return values;
}

/**
 * Collect action items from UI
 * @returns {Array} - Action items
 */
function collectActionItems() {
  const items = [];
  elements.actionItems.querySelectorAll('.action-item').forEach(item => {
    const task = item.querySelector('.task-input')?.value.trim();
    const assignee = item.querySelector('.assignee-input')?.value.trim();
    const deadline = item.querySelector('.deadline-input')?.value.trim();

    if (task) {
      items.push({ task, assignee: assignee || 'Unassigned', deadline: deadline || 'TBD' });
    }
  });
  return items;
}

/**
 * Handle send email
 */
async function handleSendEmail() {
  if (!state.currentMeeting) return;

  if (!state.currentMeeting.notes) {
    showToast('Please generate notes first', 'error');
    return;
  }

  try {
    showLoading('Opening Gmail...');

    // Get attendees
    const attendeesResponse = await sendToBackground(MessageTypes.GET_MEETING_ATTENDEES, {});
    const recipients = (attendeesResponse.attendees || [])
      .filter(a => a.email)
      .map(a => a.email);

    // Open Gmail compose
    const response = await sendToBackground(MessageTypes.OPEN_GMAIL_COMPOSE, {
      meetingId: state.currentMeeting.id,
      recipients
    });

    hideLoading();

    if (response.success) {
      showToast('Gmail opened', 'success');
    } else {
      throw new Error(response.error);
    }
  } catch (error) {
    console.error('Failed to open Gmail:', error);
    hideLoading();
    showToast('Failed to open Gmail', 'error');
  }
}

/**
 * Handle save API key
 */
async function handleSaveApiKey() {
  const apiKey = elements.settingsApiKey?.value?.trim();

  if (!apiKey) {
    showToast('Please enter an API key', 'error');
    return;
  }

  if (!apiKey.startsWith('sk-')) {
    showToast('Invalid API key format', 'error');
    return;
  }

  try {
    elements.settingsSaveApiKey.disabled = true;
    elements.settingsSaveApiKey.textContent = 'Saving...';

    await sendToBackground(MessageTypes.SAVE_API_KEY, { apiKey });

    state.hasApiKey = true;
    elements.settingsApiKey.value = '';
    showToast('API key saved', 'success');
  } catch (error) {
    console.error('Failed to save API key:', error);
    showToast('Failed to save API key', 'error');
  } finally {
    elements.settingsSaveApiKey.disabled = false;
    elements.settingsSaveApiKey.textContent = 'Save';
  }
}

/**
 * Handle setting change
 */
async function handleSettingChange(event) {
  const setting = event.target.id.replace('settings', '');
  const settingKey = setting.charAt(0).toLowerCase() + setting.slice(1);

  let value;
  if (event.target.type === 'checkbox') {
    value = event.target.checked;
  } else {
    value = event.target.value;
  }

  state.settings[settingKey] = value;

  try {
    await sendToBackground(MessageTypes.SAVE_SETTINGS, { settings: state.settings });
  } catch (error) {
    console.error('Failed to save setting:', error);
    showToast('Failed to save setting', 'error');
  }
}

/**
 * Apply settings to UI
 */
function applySettings() {
  if (elements.settingsLanguage) {
    elements.settingsLanguage.value = state.settings.language || 'ko';
  }
  if (elements.settingsModel) {
    elements.settingsModel.value = state.settings.model || 'whisper-1';
  }
  if (elements.settingsAutoTranscribe) {
    elements.settingsAutoTranscribe.checked = state.settings.autoTranscribe ?? true;
  }
  if (elements.settingsShowOverlay) {
    elements.settingsShowOverlay.checked = state.settings.showOverlay ?? true;
  }
  if (elements.settingsGptModel) {
    elements.settingsGptModel.value = state.settings.gptModel || 'gpt-4o-mini';
  }
}

/**
 * Handle export data
 */
async function handleExportData() {
  try {
    showLoading('Exporting data...');

    const response = await sendToBackground(MessageTypes.GET_ALL_MEETINGS, {});
    const meetings = response.meetings || [];

    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      meetings: meetings
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `meet-transcriber-export-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);

    hideLoading();
    showToast('Data exported', 'success');
  } catch (error) {
    console.error('Failed to export data:', error);
    hideLoading();
    showToast('Failed to export data', 'error');
  }
}

/**
 * Handle clear data
 */
async function handleClearData() {
  if (!confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
    return;
  }

  try {
    showLoading('Clearing data...');

    await chrome.storage.local.clear();

    state.meetings = [];
    renderMeetingsList();

    hideLoading();
    showToast('All data cleared', 'success');
  } catch (error) {
    console.error('Failed to clear data:', error);
    hideLoading();
    showToast('Failed to clear data', 'error');
  }
}

/**
 * Format duration
 * @param {number} ms - Duration in milliseconds
 * @returns {string} - Formatted duration
 */
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m ${seconds % 60}s`;
}

/**
 * Show loading overlay
 * @param {string} text - Loading text
 */
function showLoading(text = 'Loading...') {
  elements.loadingText.textContent = text;
  elements.loadingOverlay.style.display = 'flex';
}

/**
 * Hide loading overlay
 */
function hideLoading() {
  elements.loadingOverlay.style.display = 'none';
}

/**
 * Show toast notification
 * @param {string} message - Message
 * @param {string} type - Type (success, error)
 */
function showToast(message, type = 'success') {
  const toast = elements.toast;
  const messageEl = toast.querySelector('.toast-message');

  messageEl.textContent = message;
  toast.className = `toast ${type}`;
  toast.style.display = 'block';

  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

/**
 * Escape HTML
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initialize);
