/* global Storage */
importScripts('../common/storage.js');

// All sprint-history writes from every tab run here, one at a time, so
// concurrent saves can't overwrite each other's read-modify-write.
let historyQueue = Promise.resolve();
const enqueueHistoryWrite = (write) => {
  const run = historyQueue.then(write).catch(() => false);
  historyQueue = run;
  return run;
};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.action === 'OPEN_OPTIONS') {
    chrome.runtime.openOptionsPage();
    sendResponse({ ok: true });
  } else if (msg?.action === 'SW_APPEND_HISTORY') {
    enqueueHistoryWrite(() => Storage.writeHistoryRecord(msg.record))
      .then(ok => sendResponse({ ok }));
  } else if (msg?.action === 'SW_CLEAR_HISTORY') {
    enqueueHistoryWrite(() => Storage.clearHistoryNow())
      .then(ok => sendResponse({ ok }));
  }
  return true;
});
