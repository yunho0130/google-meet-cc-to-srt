/**
 * OpenAI API Utility Module
 * Handles all OpenAI API interactions including Whisper and GPT
 */

const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';
const CHAT_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Transcribe audio using OpenAI Whisper API
 * @param {Blob} audioBlob - Audio data as Blob
 * @param {string} apiKey - OpenAI API key
 * @param {Object} options - Transcription options
 * @returns {Promise<Object>} - Transcription result
 */
export async function transcribeAudio(audioBlob, apiKey, options = {}) {
  const {
    language = 'ko',
    model = 'whisper-1',
    responseFormat = 'verbose_json',
    temperature = 0
  } = options;

  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', model);
  formData.append('language', language);
  formData.append('response_format', responseFormat);
  formData.append('temperature', temperature.toString());

  try {
    const response = await fetch(WHISPER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      text: result.text,
      segments: result.segments || [],
      language: result.language,
      duration: result.duration
    };
  } catch (error) {
    console.error('Whisper API error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate meeting notes using OpenAI GPT
 * @param {string} transcript - Full meeting transcript
 * @param {string} apiKey - OpenAI API key
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} - Generated meeting notes
 */
export async function generateMeetingNotes(transcript, apiKey, options = {}) {
  const {
    model = 'gpt-4o-mini',
    meetingTitle = 'Meeting',
    participants = [],
    language = 'ko'
  } = options;

  const systemPrompt = `You are an expert meeting notes generator. Your task is to analyze meeting transcripts and generate comprehensive, well-structured meeting notes in ${language === 'ko' ? 'Korean' : 'English'}.

Output Format (JSON):
{
  "summary": "A concise 2-3 sentence summary of the meeting",
  "keyDiscussionPoints": ["Discussion point 1", "Discussion point 2", ...],
  "actionItems": [
    {"task": "Task description", "assignee": "Person name or 'Unassigned'", "deadline": "Deadline if mentioned or 'TBD'"}
  ],
  "decisions": ["Decision 1", "Decision 2", ...],
  "participants": ["Participant 1", "Participant 2", ...],
  "followUp": ["Follow-up item 1", "Follow-up item 2", ...],
  "suggestedSubject": "Suggested email subject line for meeting notes"
}

Guidelines:
- Extract ALL action items with responsible parties when mentioned
- Identify key decisions made during the meeting
- Note any follow-up items or pending questions
- Be thorough but concise
- If information is not available, use reasonable defaults`;

  const userPrompt = `Meeting Title: ${meetingTitle}
Known Participants: ${participants.length > 0 ? participants.join(', ') : 'Not specified'}

Meeting Transcript:
${transcript}

Please analyze this transcript and generate comprehensive meeting notes in the specified JSON format.`;

  try {
    const response = await fetch(CHAT_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in API response');
    }

    const notes = JSON.parse(content);
    return {
      success: true,
      notes: notes
    };
  } catch (error) {
    console.error('GPT API error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate a quick summary of transcript segment
 * @param {string} segment - Transcript segment
 * @param {string} apiKey - OpenAI API key
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} - Summary result
 */
export async function generateQuickSummary(segment, apiKey, options = {}) {
  const { model = 'gpt-4o-mini', language = 'ko' } = options;

  const systemPrompt = `You are a helpful assistant. Summarize the following meeting segment in 1-2 sentences in ${language === 'ko' ? 'Korean' : 'English'}. Focus on the main point being discussed.`;

  try {
    const response = await fetch(CHAT_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: segment }
        ],
        temperature: 0.3,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      summary: result.choices[0]?.message?.content || ''
    };
  } catch (error) {
    console.error('Quick summary error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Validate OpenAI API key
 * @param {string} apiKey - OpenAI API key to validate
 * @returns {Promise<Object>} - Validation result
 */
export async function validateApiKey(apiKey) {
  if (!apiKey || !apiKey.startsWith('sk-')) {
    return {
      valid: false,
      error: 'Invalid API key format. API key should start with "sk-"'
    };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      return { valid: true };
    } else if (response.status === 401) {
      return { valid: false, error: 'Invalid API key' };
    } else {
      return { valid: false, error: `Validation failed: ${response.status}` };
    }
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Format transcript with timestamps
 * @param {Array} segments - Transcript segments from Whisper
 * @returns {string} - Formatted transcript
 */
export function formatTranscriptWithTimestamps(segments) {
  if (!segments || segments.length === 0) return '';

  return segments.map(segment => {
    const startTime = formatTime(segment.start);
    const endTime = formatTime(segment.end);
    return `[${startTime} - ${endTime}] ${segment.text}`;
  }).join('\n');
}

/**
 * Format seconds to HH:MM:SS
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string
 */
function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
