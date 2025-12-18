# Repository Guidelines

## Project Structure & Module Organization
- `manifest.json` defines the Chrome Extension (MV3) entry points and permissions.
- `content/` contains caption-capture logic and injected styles (`meet-cc-simple.js`, `meet-cc-simple.css`).
- `background/` holds the service worker (`background/service-worker.js`).
- `popup/`, `sidepanel/`, and `offscreen/` provide the UI surfaces and offscreen processing.
- `utils/` contains shared helpers (storage, OpenAI API stubs, message types).
- `assets/` stores icons and images; `scripts/` contains one-off tooling (icon generation).
- `design/` includes product/design documentation and specs.

## Build, Test, and Development Commands
- `npm install` (optional) installs dev deps for tooling like icon generation.
- `npm run generate-icons` rebuilds extension icons using `scripts/generate-icons.js`.
- `npm run lint` runs ESLint across the repo (ensure config exists or add one if you tighten linting).
- `npm run build` is a no-op placeholder (this is a plain JS extension).
- `npm run package` creates `dist/google-meet-transcriber.zip` for distribution.

## Coding Style & Naming Conventions
- Use 2-space indentation (existing JS/CSS follows this).
- Prefer plain JavaScript (no TypeScript) and DOM-first patterns.
- Use `camelCase` for variables/functions and `kebab-case` for filenames (e.g., `meet-cc-simple.js`).
- Keep selectors and caption-processing logic in `content/` cohesive; avoid scattering Meet-specific selectors.

## Testing Guidelines
- No automated tests are present; rely on manual verification:
  1. Load the extension via `chrome://extensions/` (Developer mode → Load unpacked).
  2. Join a Meet, enable CC, verify capture, and test TXT/SRT download.
- Run `npm run lint` before releasing changes to catch basic issues.

## Commit & Pull Request Guidelines
- Follow Conventional Commits seen in history: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.
- Keep commits scoped and descriptive (e.g., `feat: add meeting history in popup`).
- PRs should include: summary, testing notes, and screenshots for UI changes.
- Link related issues or user reports when applicable.

## Security & Configuration Tips
- Keep `manifest.json` permissions minimal and aligned with Meet-only usage.
- Use `chrome.storage` for settings and captured captions; avoid external network calls unless required.
