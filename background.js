// Service worker background script for 7Zap VCC Cleaner
// Remove any cookie whose name starts with this prefix
const COOKIE_PREFIX = '7zap_';

// Signal when the service worker script is loaded
console.log('[7zap-cleaner] service worker script loaded');

function removeMatchingCookies() {
  console.log('[7zap-cleaner] removeMatchingCookies: scanning all cookies');
  chrome.cookies.getAll({}, (cookies) => {
    if (!cookies || cookies.length === 0) {
      console.log('[7zap-cleaner] getAll returned no cookies');
      return;
    }
    let matched = 0;
    for (const cookie of cookies) {
      if (!cookie.name || !cookie.name.startsWith(COOKIE_PREFIX)) continue;
      if (!cookie.domain) continue;
      const cookieDomain = cookie.domain.startsWith('.') ? cookie.domain.slice(1) : cookie.domain;
      if (!(cookieDomain === '7zap.com' || cookieDomain.endsWith('.7zap.com'))) continue;
      matched++;
      console.log(`[7zap-cleaner] matched cookie: name=${cookie.name} domain=${cookieDomain} path=${cookie.path} secure=${cookie.secure} httpOnly=${cookie.httpOnly}`);
      const proto = cookie.secure ? 'https:' : 'http:';
      const domain = cookieDomain;
      const path = cookie.path || '/';
      const url = `${proto}//${domain}${path}`;
      chrome.cookies.remove({ url, name: cookie.name }, (removeInfo) => {
        if (chrome.runtime.lastError) {
          console.warn('[7zap-cleaner] chrome.cookies.remove error', chrome.runtime.lastError);
        } else {
          console.log('[7zap-cleaner] chrome.cookies.remove result', removeInfo);
        }
      });
    }
    console.log(`[7zap-cleaner] removeMatchingCookies: matched ${matched} cookie(s)`);
  });
}

  // Also attempt a scan when the service worker starts up (helps in dev to trigger an action)
  try {
    removeMatchingCookies();
  } catch (e) {
    console.warn('[7zap-cleaner] removeMatchingCookies startup call failed', e);
  }

// Run on install/startup to clean any existing cookie
chrome.runtime.onInstalled.addListener(() => removeMatchingCookies());
chrome.runtime.onStartup.addListener(() => removeMatchingCookies());

chrome.runtime.onInstalled.addListener(() => console.log('[7zap-cleaner] onInstalled')); 
chrome.runtime.onStartup.addListener(() => console.log('[7zap-cleaner] onStartup'));

// When cookies change for the 7zap_* prefix on 7zap domains, remove them
chrome.cookies.onChanged.addListener((changeInfo) => {
  console.log('[7zap-cleaner] cookies.onChanged', changeInfo);
  const c = changeInfo.cookie;
  if (!c || !c.name || !c.name.startsWith(COOKIE_PREFIX)) return;
  if (!c.domain) return;
  const cookieDomain = c.domain.startsWith('.') ? c.domain.slice(1) : c.domain;
  if (!(cookieDomain === '7zap.com' || cookieDomain.endsWith('.7zap.com'))) return;
  console.log('[7zap-cleaner] cookies.onChanged matched', c.name, cookieDomain, 'removed=', changeInfo.removed);
  // If it's removed already, nothing to do. If created/updated, attempt removal.
  if (!changeInfo.removed) removeMatchingCookies();
});

// On every navigation completed to 7zap domains (including subdomains), attempt to remove the cookie
chrome.webNavigation.onCompleted.addListener((details) => {
  if (!details || !details.url) return;
  try {
    const u = new URL(details.url);
    const host = u.hostname;
    console.log('[7zap-cleaner] webNavigation.onCompleted', details.url, 'host=', host);
    if (host === '7zap.com' || host.endsWith('.7zap.com')) {
      console.log('[7zap-cleaner] webNavigation hit for host', host);
      removeMatchingCookies();
    }
  } catch (e) {
    // ignore malformed URLs
  }
}, { url: [{ hostSuffix: '7zap.com' }] });

// Listen for popup or other parts of the extension asking to remove the cookie now
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.action) return false;
  if (message.action === 'remove_vcc') {
    console.log('[7zap-cleaner] message remove_vcc received');
    removeMatchingCookies();
    sendResponse({ status: 'requested' });
    return false;
  }

  if (message.action === 'list_7zap_cookies') {
    // Return an array of matching cookies (name, domain, path, secure, httpOnly)
    console.log('[7zap-cleaner] message list_7zap_cookies received');
    chrome.cookies.getAll({}, (cookies) => {
      const out = [];
      if (cookies && cookies.length > 0) {
        for (const c of cookies) {
          if (!c.name || !c.name.startsWith(COOKIE_PREFIX)) continue;
          if (!c.domain) continue;
          const cookieDomain = c.domain.startsWith('.') ? c.domain.slice(1) : c.domain;
          if (!(cookieDomain === '7zap.com' || cookieDomain.endsWith('.7zap.com'))) continue;
          out.push({ name: c.name, domain: cookieDomain, path: c.path, secure: c.secure, httpOnly: c.httpOnly });
        }
      }
      console.log('[7zap-cleaner] list_7zap_cookies returning', out.length, 'cookie(s)');
      sendResponse({ cookies: out });
    });
    // Indicate we'll call sendResponse asynchronously
    return true;
  }

  return false;
});
