# 7Zap VCC Cleaner — Chrome Extension (MV3)

This small extension automatically removes the `7zap_vcc` cookie whenever you visit pages under `https://7zap.com/`.

Files added:
- `manifest.json` — Manifest V3 configuration with minimal permissions.
- `background.js` — Service worker that listens for navigation and cookie changes and deletes `7zap_vcc`.

How to load (unpacked) in Chrome / Edge:

1. Download the realease .zip and extract it in a folder
1. Open `chrome://extensions/` (or `edge://extensions/`).
2. Enable "Developer mode" (top-right).
3. Click "Load unpacked" and select the folder where the extansion has been unzip.
4. Visit `https://7zap.com/` and the extension will remove any `7zap_vcc` cookie, bypassing the free limit.

Notes:
- The extension uses the `chrome.cookies` API and `webNavigation` event to detect and remove the cookie.
- The `host_permissions` are limited to `https://7zap.com/*`.
# SevenZap-no-limit

### Disclaimer
This project has been entirely made by Github copilot :)