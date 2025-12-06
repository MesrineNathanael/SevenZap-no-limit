# SevenZap No-Limit — Chrome Extension (Manifest V3)

This unpacked Chrome/Edge extension automatically removes any cookie whose name starts with `7zap_` (for example `7zap_vsc`, `7zap_vcc`, etc.) on `7zap.com` and all its subdomains (for example `bmw.7zap.com`).

**Key behavior**
- **Removes:** any cookie with name prefix `7zap_` on `7zap.com` and its subdomains.
- **Runs as:** a Manifest V3 background service worker using the `chrome.cookies` API.
- **Triggers:** automatic removal on navigation and cookie changes; manual removal via the popup.

**Files in this folder**
- `manifest.json` — MV3 manifest with `cookies`, `webNavigation` permissions and host permissions for `7zap.com` (HTTP and HTTPS, including subdomains).
- `background.js` — Service worker: scans and removes `7zap_` cookies, responds to popup messages, and logs actions to the service worker console.
- `popup.html` / `popup.js` — Minimal popup UI to request manual removal and show current `7zap_` cookies.
- `icons/` — Simple SVG icons used by the extension UI.

How to load (unpacked) in Chrome / Edge
1. Download the realease .zip and extract it in a folder
1. Open `chrome://extensions/` (or `edge://extensions/`).
2. Enable "Developer mode" (top-right).
3. Click "Load unpacked" and select the folder where the extansion has been unzip.
4. Visit `https://7zap.com/` and the extension will remove any `7zap_*` cookie, bypassing the free limit.


Debugging and logs
- Open the service worker console to see detailed logs: on the extension card in `chrome://extensions/` click the `service worker` (Inspect views) link.
- Logs include startup messages, scans, matched cookies, cookie removals, and message handling. Look for `[7zap-cleaner]` prefixes.

Notes and privacy
- The extension requires access to cookies on `7zap.com` and its subdomains to detect and remove the cookies. Host permissions in `manifest.json` include both `http://` and `https://` variants for `7zap.com` and `*.7zap.com`.
- This extension performs client-side cookie deletions only. It does not send cookie values to any server.

Next steps (optional)
- Add more detailed UI to list cookie names in the popup (already supported — the popup asks the service worker for matching cookies).
- Add temporary logging or additional actions while debugging.

### Disclaimer
This repository was created with github copilot; review the code before use.