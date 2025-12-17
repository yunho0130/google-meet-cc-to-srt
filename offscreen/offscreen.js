/**
 * Offscreen Document for Audio Processing
 * Handles audio capture from tab using MediaRecorder API
 */

import { MessageTypes, createMessage } from '../utils/message-types.js';

// Audio recording state
let mediaRecorder = null;
let audioChunks = [];
let mediaStream = null;
let recordingInterval = null;
let isRecording = false;

// Configuration
const CHUNK_INTERVAL = 15000; // Send audio chunks every 15 seconds
const AUDIO_MIME_TYPE = 'audio/webm;codecs=opus';

/**
 * Initialize media stream from tab capture
 * @param {string} streamId - Stream ID from tabCapture API
 */
async function initializeMediaStream(streamId) {
  try {
    // Get media stream from the captured tab
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId
        }
      },
      video: false
    });

    console.log('Media stream initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize media stream:', error);
    throw error;
  }
}

/**
 * Start recording audio
 */
function startRecording() {
  if (!mediaStream || isRecording) {
    console.warn('Cannot start recording: no stream or already recording');
    return;
  }

  try {
    // Check if MIME type is supported
    const mimeType = MediaRecorder.isTypeSupported(AUDIO_MIME_TYPE)
      ? AUDIO_MIME_TYPE
      : 'audio/webm';

    mediaRecorder = new MediaRecorder(mediaStream, {
      mimeType: mimeType,
      audioBitsPerSecond: 128000
    });

    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      console.log('MediaRecorder stopped');
      if (audioChunks.length > 0) {
        await sendAudioChunk();
      }
    };

    mediaRecorder.onerror = (event) => {
      console.error('MediaRecorder error:', event.error);
      chrome.runtime.sendMessage(createMessage(MessageTypes.AUDIO_CAPTURE_ERROR, {
        error: event.error?.message || 'Recording error'
      }));
    };

    // Start recording
    mediaRecorder.start();
    isRecording = true;

    // Set up interval to send chunks periodically
    recordingInterval = setInterval(async () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        // Stop to trigger data collection, then restart
        mediaRecorder.stop();

        // Wait a bit for data to be collected
        await new Promise(resolve => setTimeout(resolve, 100));

        // Restart recording
        if (isRecording && mediaStream?.active) {
          mediaRecorder.start();
        }
      }
    }, CHUNK_INTERVAL);

    console.log('Recording started');
  } catch (error) {
    console.error('Failed to start recording:', error);
    throw error;
  }
}

/**
 * Stop recording audio
 */
function stopRecording() {
  isRecording = false;

  if (recordingInterval) {
    clearInterval(recordingInterval);
    recordingInterval = null;
  }

  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }

  mediaRecorder = null;
  console.log('Recording stopped');
}

/**
 * Send accumulated audio chunks to background for processing
 */
async function sendAudioChunk() {
  if (audioChunks.length === 0) {
    return;
  }

  try {
    // Combine chunks into a single blob
    const audioBlob = new Blob(audioChunks, { type: AUDIO_MIME_TYPE });
    audioChunks = [];

    // Only process if blob has meaningful data (more than 1KB)
    if (audioBlob.size < 1024) {
      console.log('Audio chunk too small, skipping');
      return;
    }

    // Convert blob to array buffer
    const arrayBuffer = await audioBlob.arrayBuffer();

    // Send to background for transcription
    const response = await chrome.runtime.sendMessage(createMessage(MessageTypes.AUDIO_CHUNK_READY, {
      audioData: arrayBuffer
    }));

    if (response?.success) {
      console.log('Audio chunk processed successfully');
    } else {
      console.warn('Audio chunk processing failed:', response?.error);
    }
  } catch (error) {
    console.error('Failed to send audio chunk:', error);
  }
}

/**
 * Handle messages from background service worker
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, payload } = message;

  console.log('Offscreen received message:', type);

  (async () => {
    try {
      switch (type) {
        case MessageTypes.START_AUDIO_CAPTURE:
          await initializeMediaStream(payload.streamId);
          startRecording();
          sendResponse({ success: true });
          break;

        case MessageTypes.STOP_AUDIO_CAPTURE:
          stopRecording();
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }
  })();

  return true;
});

// Notify background that offscreen document is ready
chrome.runtime.sendMessage(createMessage(MessageTypes.OFFSCREEN_READY, {}));

console.log('Offscreen document initialized');
