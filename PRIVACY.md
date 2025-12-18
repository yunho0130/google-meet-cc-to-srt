# Privacy Policy for Google Meet CC Capturer

**Last Updated**: 2024-12-18
**Version**: 3.5.6

## Overview

Google Meet CC Capturer is committed to protecting your privacy. This extension operates entirely within your browser and does not collect, transmit, or share any personal data with external servers or third parties.

## Data Collection

This extension does **NOT** collect any personal data. Specifically:

- ❌ No personal identification information (name, email, phone number)
- ❌ No browsing history
- ❌ No account credentials or authentication tokens
- ❌ No location data
- ❌ No device information or fingerprinting
- ❌ No analytics or telemetry data
- ❌ No cookies or tracking mechanisms

## What Data is Processed Locally

The extension processes the following data **locally in your browser only**:

### 1. User Preferences
Stored in `chrome.storage.local` for functionality:
- UI language preference (English/Korean)
- Debounce delay setting (500-3000ms)
- Auto-start capture preference (on/off)
- Speaker name inclusion preference (on/off)
- Guide collapse state (collapsed/expanded)
- Maximum captions in memory setting (500/1000/2000/5000)

**Purpose**: Maintain your preferred settings across browser sessions.

### 2. Captured Captions
Stored in `chrome.storage.local` for meeting history:
- Caption text with timestamps
- Meeting session ID (timestamp-based)
- Session start time
- Page title from Google Meet (e.g., "Team Meeting - Google Meet")

**Purpose**: Allow you to review, download, and manage your captured meeting captions.

### 3. Current Session State
Temporarily stored during active capture:
- Current session ID reference
- Real-time caption buffer

**Purpose**: Enable continuous capture and auto-save functionality.

## Data Storage Location

**All data is stored locally using Chrome's storage API:**
- Storage Method: `chrome.storage.local`
- Storage Location: Your browser's local storage (not synced to cloud)
- Visibility: Only accessible by this extension on your device

**Data Retention**:
- Data persists until you manually delete it via the extension's History feature
- All data is automatically removed when you uninstall the extension

## Data Usage

Captured data is used **exclusively** for:
1. Displaying captions in the extension's overlay interface
2. Providing meeting history in the popup
3. Downloading captions as TXT or SRT files to your computer
4. Copying captions to your clipboard

## Data Sharing and Transmission

**We do NOT:**
- ❌ Share data with third parties
- ❌ Sell data to advertisers or data brokers
- ❌ Transmit data to external servers
- ❌ Use analytics or tracking services
- ❌ Sync data to cloud services
- ❌ Send data to the extension developer

**Network Activity:**
- The extension makes **zero network requests**
- The only network activity is Google Meet's own requests (which the extension does not control or intercept)

## Chrome Permissions Explained

The extension requests the following permissions for legitimate functionality:

### `storage`
**Why**: Store user preferences and captured captions locally in your browser
**Access**: Only this extension can read/write this data
**Scope**: Limited to chrome.storage.local (no cloud sync)

### `activeTab`
**Why**: Access the current Google Meet tab to read caption text from the page
**Access**: Only when you're on a Google Meet page
**Scope**: Cannot access other tabs or websites

### `host_permissions: meet.google.com/*`
**Why**: Inject caption capture functionality on Google Meet pages
**Access**: Only on meet.google.com domain
**Scope**: Cannot access other Google services or domains

**We do NOT request:**
- ❌ Microphone access
- ❌ Camera access
- ❌ All sites access
- ❌ Background permissions
- ❌ History access
- ❌ Bookmarks access

## Third-Party Services

This extension does **NOT** use:
- ❌ Google Analytics or any analytics platforms
- ❌ Error tracking services (e.g., Sentry)
- ❌ CDN-hosted libraries (all code is bundled locally)
- ❌ External APIs (e.g., OpenAI, Google Cloud, AWS)
- ❌ Ad networks or affiliate tracking

## Source Code Transparency

This extension is open-source:
- **Repository**: https://github.com/yunho0130/google-meet-cc-to-srt
- **License**: MIT License
- **Audit**: Anyone can review the source code to verify privacy claims

**Key Files**:
- `manifest.json` - Extension configuration and permissions
- `content/meet-cc-simple.js` - Caption capture logic
- `popup/popup-simple.js` - Popup interface logic

## User Rights and Controls

You have full control over your data:

### View Your Data
- Click the extension icon → "History" to see all stored sessions
- Each session shows: date, time, caption count, and full content

### Delete Your Data
- **Individual Sessions**: Click a session → "Delete" button
- **All Data**: Uninstall the extension (removes all stored data)
- **Browser Tools**: Access chrome://settings/content/all → find "Google Meet CC Capturer"

### Export Your Data
- Download any session as TXT or SRT file
- Copy to clipboard for use in other applications

### Disable Features
- Turn off auto-capture in settings
- Disable speaker name detection
- Adjust debounce delay for privacy (longer delay = fewer captures)

## Children's Privacy

This extension is not directed at children under 13. We do not knowingly collect data from children. If you believe a child has used this extension, please contact us to request data deletion (though no data is transmitted to us).

## California Privacy Rights (CCPA)

For California residents:
- **Right to Know**: All stored data is viewable in the extension's History feature
- **Right to Delete**: Delete data via the History feature or by uninstalling
- **Right to Opt-Out of Sale**: Not applicable - we do not sell any data
- **Non-Discrimination**: Not applicable - the extension is free with no paid features

## European Privacy Rights (GDPR)

For EU residents:
- **Lawful Basis**: Legitimate interest (providing caption capture functionality)
- **Data Controller**: Individual user (data never leaves your device)
- **Data Processor**: Not applicable (no third-party processing)
- **Right to Access**: View data in History feature
- **Right to Erasure**: Delete via History feature or uninstall
- **Right to Data Portability**: Export as TXT/SRT files
- **No Cross-Border Transfers**: All data stays on your device

## Security Measures

**Local-Only Architecture**:
- No server infrastructure = no server breaches possible
- No data transmission = no interception risk
- Chrome's storage API includes built-in encryption for sensitive data

**Code Security**:
- No unsafe JavaScript execution patterns
- No inline scripts (CSP-compliant)
- Input sanitization for XSS prevention
- Defensive error handling to prevent crashes

**Recommendations**:
- Keep Chrome updated for latest security patches
- Use strong device passwords/encryption
- Review extension permissions before granting

## Changes to This Privacy Policy

We may update this privacy policy to reflect:
- New features or functionality
- Changes in privacy regulations
- User feedback and improvements

**Notification Method**:
- Updates will be posted to the GitHub repository
- Version number and "Last Updated" date will be changed
- Material changes will be announced in release notes

**Your Responsibility**:
- Check this policy periodically for updates
- Review the changelog at: https://github.com/yunho0130/google-meet-cc-to-srt/blob/main/CLAUDE.md

## Contact and Questions

For privacy-related questions or concerns:

- **GitHub Issues**: https://github.com/yunho0130/google-meet-cc-to-srt/issues
- **Repository**: https://github.com/yunho0130/google-meet-cc-to-srt

**Response Time**: We aim to respond to privacy inquiries within 7 business days.

## Compliance and Certifications

This extension complies with:
- ✅ Chrome Web Store Developer Program Policies
- ✅ Chrome Extension Manifest V3 requirements
- ✅ GDPR (EU General Data Protection Regulation)
- ✅ CCPA (California Consumer Privacy Act)
- ✅ COPPA (Children's Online Privacy Protection Act)

## Legal Disclaimer

This extension is provided "as is" without warranty. By using this extension, you agree to:
- Use it in compliance with Google Meet's Terms of Service
- Respect meeting participants' privacy and consent laws in your jurisdiction
- Take responsibility for how you use and share captured captions

**Recording Consent**: Some jurisdictions require all-party consent for recording meetings. Ensure you have proper consent before capturing captions in meetings.

---

## Summary (TL;DR)

✅ **Privacy-First Design**:
- All data stays on your device
- No external servers or tracking
- Open-source and auditable

✅ **Full User Control**:
- View, download, or delete your data anytime
- No account or registration required

✅ **Minimal Permissions**:
- Only requests necessary Chrome permissions
- No microphone, camera, or all-sites access

✅ **Transparent Operation**:
- Source code available on GitHub
- Clear documentation of all features

---

**Questions?** Open an issue at: https://github.com/yunho0130/google-meet-cc-to-srt/issues

**Last Updated**: December 18, 2024
**Effective Date**: December 18, 2024
