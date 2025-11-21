// Minimal MV3 background for message routing.
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.action === 'OPEN_OPTIONS') {
    chrome.runtime.openOptionsPage();
    sendResponse({ ok: true });
  }
  return true;
});
