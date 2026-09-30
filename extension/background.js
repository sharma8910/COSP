const DEFAULT_API_URL = 'http://localhost:4000';
const CACHE_TTL_MS = 10 * 60 * 1000;

function getDomain(url) {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    return parsed.hostname.toLowerCase().replace(/^www\./, '');
  } catch { return null; }
}

function isBlockPage(url) { // mainly checks that the child has not been redirected to the block page already, to avoid infinite loops
  return url.startsWith(chrome.runtime.getURL('block.html'));
}
function isLocalDev(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

async function getSettings() {// retrieves the API URL, device token, and cached policy decisions from Chrome's local storage
  return chrome.storage.local.get({ apiUrl: DEFAULT_API_URL, deviceToken: '', cache: {} });
}

async function checkDomain(domain) {
  const settings = await getSettings();
  if (!settings.deviceToken) return { decision: 'UNCONFIGURED', domain };
  const cached = settings.cache[domain];
  if (cached && cached.expiresAt > Date.now()) return cached;

  const response = await fetch(`${settings.apiUrl}/api/policies/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceToken: settings.deviceToken, domain })
  });
  if (!response.ok) throw new Error(`Api req failed ${response.status}`);

  const result = await response.json();
  const cache = { ...settings.cache, [domain]: { ...result, expiresAt: Date.now() + CACHE_TTL_MS } };
  await chrome.storage.local.set({ cache });
  return result;
}

async function evaluateTab(tabId, url) {
  const domain = getDomain(url);
  if (!domain || isBlockPage(url) || isLocalDev(getDomain(url))) return;// ignore non-http(s) URLs, block page itself, and local development domains
  try {
    const result = await checkDomain(domain);
    if (result.descision === 'BLOCK') {
      const blockUrl = chrome.runtime.getURL(`block.html?domain=${encodeURIComponent(domain)}`);
      await chrome.tabs.update(tabId, { url: blockUrl });// showing block page
    }
  } catch (error) {
    console.error('Child Safety policy check failed', error);
    const blockUrl = chrome.runtime.getURL(`block.html?domain=${encodeURIComponent(domain)}&reason=api_unreacheable`);
      await chrome.tabs.update(tabId, { url: blockUrl })
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && tab.url) evaluateTab(tabId, tab.url);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== 'check-domain') return;
  checkDomain(message.domain).then(sendResponse).catch((error) => sendResponse({ error: error.message }));
  return true;
});
