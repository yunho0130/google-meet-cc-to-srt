/**
 * Background Service Worker
 * Handles API calls, audio processing coordination, and extension state management
 */

import {
  saveApiKey,
  getApiKey,
  hasApiKey,
  deleteApiKey,
  saveMeetingData,
  getMeetingData,
  getAllMeetings,
  deleteMeetingData,
  saveSettings,
  getSettings,
  saveSessionState,
  getSessionState
} from '../utils/storage.js';

import {
  transcribeAudio,
  generateMeetingNotes,
  validateApiKey as validateApiKeyUtil,
  formatTranscriptWithTimestamps
} from '../utils/openai-api.js';

import {
  MessageTypes,
  MeetingStates,
  TranscriptionStates,
  createMessage
} from '../utils/message-types.js';

// Global state
let currentState = {
  meetingState: MeetingStates.IDLE,
  transcriptionState: TranscriptionStates.IDLE,
  currentMeetingId: null,
  currentTabId: null,
  audioChunks: [],
  transcriptSegments: [],
  participants: [],
  meetingTitle: '',
  meetingStartTime: null
};

// Offscreen document state
let offscreenDocumentExists = false;

/**
 * Initialize the service worker
 */
async function initialize() {
  console.log('Google Meet Transcriber: Service worker initialized');

  // Restore session state if available
  const savedState = await getSessionState();
  if (savedState) {
    currentState = { ...currentState, ...savedState };
  }

  // Set up alarms for periodic tasks
  chrome.alarms.create('keepAlive', { periodInMinutes: 1 });
}

/**
 * Create offscreen document for audio processing
 */
async function createOffscreenDocument() {
  if (offscreenDocumentExists) {
    return;
  }

  try {
    await chrome.offscreen.createDocument({
      url: 'offscreen/offscreen.html',
      reasons: ['USER_MEDIA'],
      justification: 'Recording audio from Google Meet tab for transcription'
    });
    offscreenDocumentExists = true;
    console.log('Offscreen document created');
  } catch (error) {
    if (error.message.includes('already exists')) {
      offscreenDocumentExists = true;
    } else {
      console.error('Failed to create offscreen document:', error);
      throw error;
    }
  }
}

/**
 * Close offscreen document
 */
async function closeOffscreenDocument() {
  if (!offscreenDocumentExists) return;

  try {
    await chrome.offscreen.closeDocument();
    offscreenDocumentExists = false;
    console.log('Offscreen document closed');
  } catch (error) {
    console.error('Failed to close offscreen document:', error);
  }
}

/**
 * Start audio capture and transcription
 * @param {number} tabId - Tab ID of the Google Meet tab
 */
async function startTranscription(tabId) {
  try {
    // Check for API key
    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Update state
    currentState.transcriptionState = TranscriptionStates.STARTING;
    currentState.currentTabId = tabId;
    currentState.audioChunks = [];
    currentState.transcriptSegments = [];
    currentState.meetingStartTime = Date.now();

    // Generate meeting ID
    currentState.currentMeetingId = `meet_${Date.now()}`;

    // Create offscreen document for audio processing
    await createOffscreenDocument();

    // Get tab capture stream ID
    const streamId = await chrome.tabCapture.getMediaStreamId({
      targetTabId: tabId
    });

    // Send stream ID to offscreen document
    await chrome.runtime.sendMessage(createMessage(MessageTypes.START_AUDIO_CAPTURE, {
      streamId: streamId,
      tabId: tabId
    }));

    currentState.transcriptionState = TranscriptionStates.ACTIVE;

    // Notify content script
    await chrome.tabs.sendMessage(tabId, createMessage(MessageTypes.TRANSCRIPTION_STATUS, {
      status: TranscriptionStates.ACTIVE,
      meetingId: currentState.currentMeetingId
    }));

    // Save initial meeting data
    await saveMeetingData(currentState.currentMeetingId, {
      createdAt: currentState.meetingStartTime,
      title: currentState.meetingTitle || 'Untitled Meeting',
      participants: currentState.participants,
      transcript: '',
      segments: [],
      notes: null
    });

    await saveSessionState(currentState);

    console.log('Transcription started for tab:', tabId);

    return { success: true, meetingId: currentState.currentMeetingId };
  } catch (error) {
    console.error('Failed to start transcription:', error);
    currentState.transcriptionState = TranscriptionStates.ERROR;
    return { success: false, error: error.message };
  }
}

/**
 * Stop transcription and process final audio
 */
async function stopTranscription() {
  try {
    currentState.transcriptionState = TranscriptionStates.STOPPED;

    // Notify offscreen document to stop recording
    await chrome.runtime.sendMessage(createMessage(MessageTypes.STOP_AUDIO_CAPTURE, {}));

    // Close offscreen document
    await closeOffscreenDocument();

    // Save final meeting data
    if (currentState.currentMeetingId) {
      const fullTranscript = currentState.transcriptSegments
        .map(s => s.text)
        .join(' ');

      await saveMeetingData(currentState.currentMeetingId, {
        endTime: Date.now(),
        transcript: fullTranscript,
        segments: currentState.transcriptSegments,
        duration: Date.now() - currentState.meetingStartTime
      });
    }

    // Notify content script
    if (currentState.currentTabId) {
      try {
        await chrome.tabs.sendMessage(currentState.currentTabId, createMessage(MessageTypes.TRANSCRIPTION_STATUS, {
          status: TranscriptionStates.STOPPED,
          meetingId: currentState.currentMeetingId
        }));
      } catch (e) {
        // Tab might be closed
      }
    }

    const meetingId = currentState.currentMeetingId;

    // Reset state
    currentState.transcriptionState = TranscriptionStates.IDLE;
    currentState.currentMeetingId = null;
    currentState.currentTabId = null;
    currentState.audioChunks = [];

    await saveSessionState(currentState);

    console.log('Transcription stopped');

    return { success: true, meetingId };
  } catch (error) {
    console.error('Failed to stop transcription:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Process audio chunk from offscreen document
 * @param {ArrayBuffer} audioData - Audio data to process
 */
async function processAudioChunk(audioData) {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error('API key not available');
    }

    const settings = await getSettings();

    // Convert ArrayBuffer to Blob
    const audioBlob = new Blob([audioData], { type: 'audio/webm' });

    // Send to Whisper API
    const result = await transcribeAudio(audioBlob, apiKey, {
      language: settings.language,
      model: settings.model
    });

    if (result.success && result.text) {
      // Add to transcript segments
      const segment = {
        text: result.text,
        timestamp: Date.now(),
        segments: result.segments
      };

      currentState.transcriptSegments.push(segment);

      // Update stored meeting data
      if (currentState.currentMeetingId) {
        const fullTranscript = currentState.transcriptSegments
          .map(s => s.text)
          .join(' ');

        await saveMeetingData(currentState.currentMeetingId, {
          transcript: fullTranscript,
          segments: currentState.transcriptSegments
        });
      }

      // Notify content script of new transcription
      if (currentState.currentTabId) {
        try {
          await chrome.tabs.sendMessage(currentState.currentTabId, createMessage(MessageTypes.TRANSCRIPTION_RESULT, {
            text: result.text,
            segments: result.segments,
            timestamp: Date.now()
          }));
        } catch (e) {
          // Tab might be closed
        }
      }

      return { success: true, text: result.text };
    } else {
      throw new Error(result.error || 'Transcription failed');
    }
  } catch (error) {
    console.error('Failed to process audio chunk:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate meeting notes from transcript
 * @param {string} meetingId - Meeting ID
 */
async function generateNotes(meetingId) {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    const settings = await getSettings();
    const meetingData = await getMeetingData(meetingId);

    if (!meetingData || !meetingData.transcript) {
      throw new Error('No transcript available');
    }

    const result = await generateMeetingNotes(meetingData.transcript, apiKey, {
      model: settings.gptModel,
      meetingTitle: meetingData.title,
      participants: meetingData.participants,
      language: settings.language
    });

    if (result.success) {
      // Save notes to meeting data
      await saveMeetingData(meetingId, {
        notes: result.notes
      });

      return { success: true, notes: result.notes };
    } else {
      throw new Error(result.error || 'Failed to generate notes');
    }
  } catch (error) {
    console.error('Failed to generate notes:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Open Gmail compose with pre-filled meeting notes
 * @param {string} meetingId - Meeting ID
 * @param {Array} recipients - Email recipients
 */
async function openGmailCompose(meetingId, recipients = []) {
  try {
    const meetingData = await getMeetingData(meetingId);

    if (!meetingData) {
      throw new Error('Meeting data not found');
    }

    const notes = meetingData.notes;
    if (!notes) {
      throw new Error('Meeting notes not generated');
    }

    // Format email body
    const emailBody = formatMeetingNotesEmail(meetingData, notes);

    // Get date string
    const meetingDate = new Date(meetingData.createdAt || Date.now());
    const dateStr = meetingDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Create subject
    const subject = notes.suggestedSubject ||
      `Meeting Notes - ${meetingData.title || 'Meeting'} - ${dateStr}`;

    // Create Gmail compose URL
    const gmailUrl = new URL('https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1');
    gmailUrl.searchParams.set('su', subject);
    gmailUrl.searchParams.set('body', emailBody);

    if (recipients.length > 0) {
      gmailUrl.searchParams.set('to', recipients.join(','));
    }

    // Open Gmail compose in new tab
    await chrome.tabs.create({ url: gmailUrl.toString() });

    return { success: true };
  } catch (error) {
    console.error('Failed to open Gmail compose:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Format meeting notes for email
 * @param {Object} meetingData - Meeting data
 * @param {Object} notes - Generated notes
 * @returns {string} - Formatted email body
 */
function formatMeetingNotesEmail(meetingData, notes) {
  let body = '';

  // Summary
  if (notes.summary) {
    body += `[Meeting Summary]\n${notes.summary}\n\n`;
  }

  // Participants
  if (notes.participants && notes.participants.length > 0) {
    body += `[Participants]\n`;
    notes.participants.forEach(p => {
      body += `- ${p}\n`;
    });
    body += '\n';
  }

  // Key Discussion Points
  if (notes.keyDiscussionPoints && notes.keyDiscussionPoints.length > 0) {
    body += `[Key Discussion Points]\n`;
    notes.keyDiscussionPoints.forEach(point => {
      body += `- ${point}\n`;
    });
    body += '\n';
  }

  // Decisions
  if (notes.decisions && notes.decisions.length > 0) {
    body += `[Decisions Made]\n`;
    notes.decisions.forEach(decision => {
      body += `- ${decision}\n`;
    });
    body += '\n';
  }

  // Action Items
  if (notes.actionItems && notes.actionItems.length > 0) {
    body += `[Action Items]\n`;
    notes.actionItems.forEach(item => {
      const assignee = item.assignee || 'Unassigned';
      const deadline = item.deadline || 'TBD';
      body += `- ${item.task} (Assignee: ${assignee}, Deadline: ${deadline})\n`;
    });
    body += '\n';
  }

  // Follow-up
  if (notes.followUp && notes.followUp.length > 0) {
    body += `[Follow-up Items]\n`;
    notes.followUp.forEach(item => {
      body += `- ${item}\n`;
    });
    body += '\n';
  }

  body += '\n---\nGenerated by Google Meet Transcriber';

  return body;
}

/**
 * Handle messages from content scripts and popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, payload } = message;

  console.log('Service worker received message:', type);

  // Handle messages asynchronously
  (async () => {
    try {
      let response;

      switch (type) {
        // API Key
        case MessageTypes.SAVE_API_KEY:
          await saveApiKey(payload.apiKey);
          response = { success: true };
          break;

        case MessageTypes.GET_API_KEY:
          const apiKey = await getApiKey();
          response = { success: true, hasKey: !!apiKey };
          break;

        case MessageTypes.VALIDATE_API_KEY:
          const validation = await validateApiKeyUtil(payload.apiKey);
          response = validation;
          break;

        // Settings
        case MessageTypes.GET_SETTINGS:
          const settings = await getSettings();
          response = { success: true, settings };
          break;

        case MessageTypes.SAVE_SETTINGS:
          await saveSettings(payload.settings);
          response = { success: true };
          break;

        // Meeting State
        case MessageTypes.MEETING_STARTED:
          currentState.meetingState = MeetingStates.IN_MEETING;
          currentState.meetingTitle = payload.title || 'Untitled Meeting';
          currentState.participants = payload.participants || [];
          currentState.currentTabId = sender.tab?.id;
          await saveSessionState(currentState);

          // Auto-start transcription if enabled
          const autoSettings = await getSettings();
          if (autoSettings.autoTranscribe && await hasApiKey()) {
            response = await startTranscription(sender.tab.id);
          } else {
            response = { success: true };
          }
          break;

        case MessageTypes.MEETING_ENDED:
          currentState.meetingState = MeetingStates.ENDED;
          if (currentState.transcriptionState === TranscriptionStates.ACTIVE) {
            await stopTranscription();
          }
          await saveSessionState(currentState);
          response = { success: true };
          break;

        case MessageTypes.GET_MEETING_STATE:
          response = {
            success: true,
            meetingState: currentState.meetingState,
            transcriptionState: currentState.transcriptionState,
            meetingId: currentState.currentMeetingId
          };
          break;

        // Transcription
        case MessageTypes.START_TRANSCRIPTION:
          const tabId = payload.tabId || sender.tab?.id;
          response = await startTranscription(tabId);
          break;

        case MessageTypes.STOP_TRANSCRIPTION:
          response = await stopTranscription();
          break;

        case MessageTypes.AUDIO_CHUNK_READY:
          response = await processAudioChunk(payload.audioData);
          break;

        // Meeting Notes
        case MessageTypes.GENERATE_NOTES:
          response = await generateNotes(payload.meetingId);
          break;

        // Meeting Data
        case MessageTypes.GET_MEETING_DATA:
          const meetingData = await getMeetingData(payload.meetingId);
          response = { success: true, data: meetingData };
          break;

        case MessageTypes.GET_ALL_MEETINGS:
          const meetings = await getAllMeetings();
          response = { success: true, meetings };
          break;

        case MessageTypes.DELETE_MEETING:
          await deleteMeetingData(payload.meetingId);
          response = { success: true };
          break;

        case MessageTypes.SAVE_MEETING_DATA:
          await saveMeetingData(payload.meetingId, payload.data);
          response = { success: true };
          break;

        // Email
        case MessageTypes.OPEN_GMAIL_COMPOSE:
          response = await openGmailCompose(payload.meetingId, payload.recipients);
          break;

        case MessageTypes.GET_MEETING_ATTENDEES:
          // Request attendees from content script
          if (currentState.currentTabId) {
            const attendeesResponse = await chrome.tabs.sendMessage(
              currentState.currentTabId,
              createMessage(MessageTypes.GET_MEETING_ATTENDEES, {})
            );
            response = attendeesResponse;
          } else {
            response = { success: true, attendees: currentState.participants };
          }
          break;

        // Offscreen
        case MessageTypes.OFFSCREEN_READY:
          console.log('Offscreen document ready');
          response = { success: true };
          break;

        // Ping/Pong for keep-alive
        case MessageTypes.PING:
          response = { type: MessageTypes.PONG };
          break;

        default:
          console.warn('Unknown message type:', type);
          response = { success: false, error: 'Unknown message type' };
      }

      sendResponse(response);
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }
  })();

  // Return true to indicate async response
  return true;
});

/**
 * Handle alarms
 */
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'keepAlive') {
    // Keep service worker alive during transcription
    if (currentState.transcriptionState === TranscriptionStates.ACTIVE) {
      console.log('Keep-alive ping during transcription');
    }
  }
});

/**
 * Handle tab updates (detect Google Meet navigation)
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('meet.google.com')) {
    // Inject content script if needed
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content/meet-content.js']
      });
    } catch (e) {
      // Script might already be injected
    }
  }
});

/**
 * Handle tab removal (cleanup if meeting tab closes)
 */
chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (tabId === currentState.currentTabId) {
    console.log('Meeting tab closed');
    currentState.meetingState = MeetingStates.ENDED;
    if (currentState.transcriptionState === TranscriptionStates.ACTIVE) {
      await stopTranscription();
    }
  }
});

/**
 * Handle extension installation/update
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Extension installed/updated:', details.reason);

  if (details.reason === 'install') {
    // Open options page on first install
    // chrome.runtime.openOptionsPage();
  }
});

// Initialize on load
initialize();
