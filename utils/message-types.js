/**
 * Message Types for Chrome Extension Communication
 * Defines all message types used between different extension components
 */

export const MessageTypes = {
  // Meeting State
  MEETING_STARTED: 'MEETING_STARTED',
  MEETING_ENDED: 'MEETING_ENDED',
  MEETING_STATE_CHANGED: 'MEETING_STATE_CHANGED',
  GET_MEETING_STATE: 'GET_MEETING_STATE',

  // Transcription
  START_TRANSCRIPTION: 'START_TRANSCRIPTION',
  STOP_TRANSCRIPTION: 'STOP_TRANSCRIPTION',
  TRANSCRIPTION_RESULT: 'TRANSCRIPTION_RESULT',
  TRANSCRIPTION_ERROR: 'TRANSCRIPTION_ERROR',
  TRANSCRIPTION_STATUS: 'TRANSCRIPTION_STATUS',

  // Audio Capture
  START_AUDIO_CAPTURE: 'START_AUDIO_CAPTURE',
  STOP_AUDIO_CAPTURE: 'STOP_AUDIO_CAPTURE',
  AUDIO_CHUNK_READY: 'AUDIO_CHUNK_READY',
  AUDIO_CAPTURE_ERROR: 'AUDIO_CAPTURE_ERROR',

  // Meeting Notes
  GENERATE_NOTES: 'GENERATE_NOTES',
  NOTES_GENERATED: 'NOTES_GENERATED',
  NOTES_ERROR: 'NOTES_ERROR',
  UPDATE_NOTES: 'UPDATE_NOTES',

  // Settings
  GET_SETTINGS: 'GET_SETTINGS',
  SAVE_SETTINGS: 'SAVE_SETTINGS',
  SETTINGS_UPDATED: 'SETTINGS_UPDATED',

  // API Key
  GET_API_KEY: 'GET_API_KEY',
  SAVE_API_KEY: 'SAVE_API_KEY',
  VALIDATE_API_KEY: 'VALIDATE_API_KEY',
  API_KEY_VALIDATED: 'API_KEY_VALIDATED',

  // Email
  SEND_EMAIL: 'SEND_EMAIL',
  OPEN_GMAIL_COMPOSE: 'OPEN_GMAIL_COMPOSE',
  GET_MEETING_ATTENDEES: 'GET_MEETING_ATTENDEES',

  // Storage
  GET_MEETING_DATA: 'GET_MEETING_DATA',
  SAVE_MEETING_DATA: 'SAVE_MEETING_DATA',
  GET_ALL_MEETINGS: 'GET_ALL_MEETINGS',
  DELETE_MEETING: 'DELETE_MEETING',

  // UI Updates
  UPDATE_OVERLAY: 'UPDATE_OVERLAY',
  TOGGLE_OVERLAY: 'TOGGLE_OVERLAY',
  SHOW_NOTIFICATION: 'SHOW_NOTIFICATION',

  // Offscreen Document
  CREATE_OFFSCREEN: 'CREATE_OFFSCREEN',
  OFFSCREEN_READY: 'OFFSCREEN_READY',
  PROCESS_AUDIO: 'PROCESS_AUDIO',

  // General
  PING: 'PING',
  PONG: 'PONG',
  ERROR: 'ERROR'
};

/**
 * Meeting states
 */
export const MeetingStates = {
  IDLE: 'IDLE',
  JOINING: 'JOINING',
  IN_MEETING: 'IN_MEETING',
  LEAVING: 'LEAVING',
  ENDED: 'ENDED'
};

/**
 * Transcription states
 */
export const TranscriptionStates = {
  IDLE: 'IDLE',
  STARTING: 'STARTING',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  PROCESSING: 'PROCESSING',
  STOPPED: 'STOPPED',
  ERROR: 'ERROR'
};

/**
 * Create a message object
 * @param {string} type - Message type from MessageTypes
 * @param {Object} payload - Message payload
 * @returns {Object} - Formatted message object
 */
export function createMessage(type, payload = {}) {
  return {
    type,
    payload,
    timestamp: Date.now()
  };
}

/**
 * Send message to background script
 * @param {string} type - Message type
 * @param {Object} payload - Message payload
 * @returns {Promise<any>} - Response from background script
 */
export async function sendToBackground(type, payload = {}) {
  return chrome.runtime.sendMessage(createMessage(type, payload));
}

/**
 * Send message to content script in specific tab
 * @param {number} tabId - Tab ID
 * @param {string} type - Message type
 * @param {Object} payload - Message payload
 * @returns {Promise<any>} - Response from content script
 */
export async function sendToContentScript(tabId, type, payload = {}) {
  return chrome.tabs.sendMessage(tabId, createMessage(type, payload));
}
