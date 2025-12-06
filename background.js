// Service worker background script for 7Zap VCC Cleaner
const COOKIE_NAME = '7zap_vcc';

function removeMatchingCookies() {
  chrome.cookies.getAll({ name: COOKIE_NAME }, (cookies) => {
    if (!cookies || cookies.length === 0) return;
    for (const cookie of cookies) {
      if (!cookie.domain || !cookie.domain.includes('7zap.com')) continue;
      const proto = cookie.secure ? 'https:' : 'http:';
      const domain = cookie.domain.startsWith('.') ? cookie.domain.slice(1) : cookie.domain;
      const path = cookie.path || '/';
      const url = `${proto}//${domain}${path}`;
      chrome.cookies.remove({ url, name: COOKIE_NAME }, () => {});
    }
  });
}

// Run on install/startup to clean any existing cookie
chrome.runtime.onInstalled.addListener(() => removeMatchingCookies());
chrome.runtime.onStartup.addListener(() => removeMatchingCookies());

// When cookies change, if the 7zap_vcc cookie is created/updated under 7zap.com, remove it
chrome.cookies.onChanged.addListener((changeInfo) => {
  const c = changeInfo.cookie;
  if (!c || c.name !== COOKIE_NAME) return;
  if (!c.domain || !c.domain.includes('7zap.com')) return;
  // If it's removed already, nothing to do. If created/updated, attempt removal.
  if (!changeInfo.removed) removeMatchingCookies();
});

// On every navigation completed to the site, attempt to remove the cookie
chrome.webNavigation.onCompleted.addListener((details) => {
  if (!details || !details.url) return;
  if (details.url.startsWith('https://7zap.com/') || details.url.startsWith('http://7zap.com/')) {
    removeMatchingCookies();
  }
}, { url: [{ hostEquals: '7zap.com' }] });

// Listen for popup or other parts of the extension asking to remove the cookie now
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.action === 'remove_vcc') {
    removeMatchingCookies();
    sendResponse({ status: 'requested' });
  }
  // Return true to indicate we'll send a response asynchronously if needed
  return false;
});
