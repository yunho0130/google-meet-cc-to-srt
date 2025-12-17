/**
 * Storage Utility Module
 * Handles secure storage operations for the extension
 */

// Simple encryption/decryption for API key (XOR-based obfuscation)
// Note: For production, consider using Chrome's chrome.storage.session or a more robust encryption method
const STORAGE_KEY_PREFIX = 'gmt_';
const OBFUSCATION_KEY = 'GoogleMeetTranscriber2024';

/**
 * Simple XOR-based obfuscation for API key
 * This provides basic obfuscation, not cryptographic security
 */
function obfuscate(text) {
  if (!text) return '';
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length)
    );
  }
  return btoa(result);
}

function deobfuscate(encoded) {
  if (!encoded) return '';
  try {
    const decoded = atob(encoded);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(
        decoded.charCodeAt(i) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length)
      );
    }
    return result;
  } catch (e) {
    console.error('Deobfuscation failed:', e);
    return '';
  }
}

/**
 * Save OpenAI API key securely
 * @param {string} apiKey - The OpenAI API key
 * @returns {Promise<void>}
 */
export async function saveApiKey(apiKey) {
  const obfuscatedKey = obfuscate(apiKey);
  await chrome.storage.sync.set({
    [`${STORAGE_KEY_PREFIX}apiKey`]: obfuscatedKey
  });
}

/**
 * Get OpenAI API key
 * @returns {Promise<string|null>}
 */
export async function getApiKey() {
  const result = await chrome.storage.sync.get([`${STORAGE_KEY_PREFIX}apiKey`]);
  const obfuscatedKey = result[`${STORAGE_KEY_PREFIX}apiKey`];
  if (!obfuscatedKey) return null;
  return deobfuscate(obfuscatedKey);
}

/**
 * Check if API key is configured
 * @returns {Promise<boolean>}
 */
export async function hasApiKey() {
  const apiKey = await getApiKey();
  return !!apiKey && apiKey.startsWith('sk-');
}

/**
 * Delete API key
 * @returns {Promise<void>}
 */
export async function deleteApiKey() {
  await chrome.storage.sync.remove([`${STORAGE_KEY_PREFIX}apiKey`]);
}

/**
 * Save meeting transcription data
 * @param {string} meetingId - Unique meeting identifier
 * @param {Object} data - Transcription data
 * @returns {Promise<void>}
 */
export async function saveMeetingData(meetingId, data) {
  const storageKey = `${STORAGE_KEY_PREFIX}meeting_${meetingId}`;
  const existingData = await getMeetingData(meetingId);

  const updatedData = {
    ...existingData,
    ...data,
    updatedAt: Date.now()
  };

  await chrome.storage.local.set({ [storageKey]: updatedData });
}

/**
 * Get meeting transcription data
 * @param {string} meetingId - Unique meeting identifier
 * @returns {Promise<Object|null>}
 */
export async function getMeetingData(meetingId) {
  const storageKey = `${STORAGE_KEY_PREFIX}meeting_${meetingId}`;
  const result = await chrome.storage.local.get([storageKey]);
  return result[storageKey] || null;
}

/**
 * Get all meeting data
 * @returns {Promise<Array>}
 */
export async function getAllMeetings() {
  const result = await chrome.storage.local.get(null);
  const meetings = [];

  for (const [key, value] of Object.entries(result)) {
    if (key.startsWith(`${STORAGE_KEY_PREFIX}meeting_`)) {
      meetings.push({
        id: key.replace(`${STORAGE_KEY_PREFIX}meeting_`, ''),
        ...value
      });
    }
  }

  // Sort by creation date, newest first
  meetings.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return meetings;
}

/**
 * Delete meeting data
 * @param {string} meetingId - Unique meeting identifier
 * @returns {Promise<void>}
 */
export async function deleteMeetingData(meetingId) {
  const storageKey = `${STORAGE_KEY_PREFIX}meeting_${meetingId}`;
  await chrome.storage.local.remove([storageKey]);
}

/**
 * Save user settings
 * @param {Object} settings - User settings object
 * @returns {Promise<void>}
 */
export async function saveSettings(settings) {
  await chrome.storage.sync.set({
    [`${STORAGE_KEY_PREFIX}settings`]: settings
  });
}

/**
 * Get user settings
 * @returns {Promise<Object>}
 */
export async function getSettings() {
  const result = await chrome.storage.sync.get([`${STORAGE_KEY_PREFIX}settings`]);
  const defaultSettings = {
    autoTranscribe: true,
    language: 'ko',
    model: 'whisper-1',
    gptModel: 'gpt-4o-mini',
    showOverlay: true,
    audioQuality: 'medium'
  };

  return {
    ...defaultSettings,
    ...result[`${STORAGE_KEY_PREFIX}settings`]
  };
}

/**
 * Save current session state
 * @param {Object} state - Current session state
 * @returns {Promise<void>}
 */
export async function saveSessionState(state) {
  await chrome.storage.session.set({
    [`${STORAGE_KEY_PREFIX}session`]: state
  });
}

/**
 * Get current session state
 * @returns {Promise<Object|null>}
 */
export async function getSessionState() {
  try {
    const result = await chrome.storage.session.get([`${STORAGE_KEY_PREFIX}session`]);
    return result[`${STORAGE_KEY_PREFIX}session`] || null;
  } catch (e) {
    // Session storage might not be available
    return null;
  }
}

/**
 * Clear all extension data
 * @returns {Promise<void>}
 */
export async function clearAllData() {
  await chrome.storage.local.clear();
  await chrome.storage.sync.clear();
  try {
    await chrome.storage.session.clear();
  } catch (e) {
    // Session storage might not be available
  }
}
