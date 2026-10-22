const SW_KEYS = {
  SETTINGS: 'sw_settings',
  HISTORY: 'sw_history'
};

// chrome.storage.sync allows 8192 bytes per item; leave headroom
const SYNC_HISTORY_BUDGET = 7000;

const byteLength = (str) => new TextEncoder().encode(str).length;

const dedupeByStart = (records) => {
  const seen = new Map();
  records.forEach(r => { if (!seen.has(r.startISO)) seen.set(r.startISO, r); });
  return [...seen.values()];
};

const sortNewestFirst = (records) =>
  records.sort((a, b) => new Date(b.startISO) - new Date(a.startISO));

const Storage = {
  async get(key, area = 'sync') {
    try {
      const api = chrome.storage[area] || chrome.storage.sync;
      const res = await api.get(key);
      return res[key];
    } catch (error) {
      // Silently fail if extension context is invalid (rare in production)
      console.warn('Storage get failed:', error.message);
      return undefined;
    }
  },
  async set(key, value, area = 'sync') {
    try {
      const api = chrome.storage[area] || chrome.storage.sync;
      await api.set({ [key]: value });
      return true;
    } catch (error) {
      // Quota exceeded, sync disabled, or extension context invalidated
      console.warn('Storage set failed:', error.message);
      return false;
    }
  },
  async getSettings() {
    const def = {
      theme: 'light', // light | dark | nord | solar | midnight
      sound: true,
      dailyGoal: 0, // Daily word count goal (0 = disabled)
      timerPreset1: 15, // First timer preset in minutes
      timerPreset2: 20, // Second timer preset in minutes
      timerPreset3: 30, // Third timer preset in minutes
      minimizeOnStart: false // Auto-minimize widget when sprint starts
    };
    const saved = await Storage.get(SW_KEYS.SETTINGS);
    return { ...def, ...(saved || {}) };
  },
  async setSettings(next) {
    await Storage.set(SW_KEYS.SETTINGS, next);
  },
  async getHistory() {
    // Try sync storage first
    const syncHist = await Storage.get(SW_KEYS.HISTORY, 'sync');

    // Also check local storage (fallback when sync quota exceeded)
    const localHist = await Storage.get(SW_KEYS.HISTORY, 'local');

    const sync = Array.isArray(syncHist) ? syncHist : [];
    const local = Array.isArray(localHist) ? localHist : [];

    return sortNewestFirst(dedupeByStart([...sync, ...local]));
  },
  /**
   * Save a sprint record. History writes are read-modify-write, so every tab
   * hands them to the background service worker, which runs them one at a time.
   * @returns {Promise<boolean>} true only if the record was persisted
   */
  async appendHistory(rec) {
    return Storage.sendHistoryWrite({ action: 'SW_APPEND_HISTORY', record: rec });
  },
  async clearHistory() {
    return Storage.sendHistoryWrite({ action: 'SW_CLEAR_HISTORY' });
  },
  async sendHistoryWrite(message) {
    try {
      const response = await chrome.runtime.sendMessage(message);
      return response?.ok === true;
    } catch (e) {
      // Service worker unreachable or extension reloaded; caller retries
      console.warn('History write failed:', e.message);
      return false;
    }
  },
  // Called only by the background service worker (see background/service.js)
  async clearHistoryNow() {
    const syncCleared = await Storage.set(SW_KEYS.HISTORY, [], 'sync');
    const localCleared = await Storage.set(SW_KEYS.HISTORY, [], 'local');
    return syncCleared && localCleared;
  },
  // Called only by the background service worker (see background/service.js)
  async writeHistoryRecord(rec) {
    try {
      const syncHist = (await Storage.get(SW_KEYS.HISTORY, 'sync')) || [];
      const all = sortNewestFirst(dedupeByStart([...syncHist, rec]));

      // Keep the newest sprints that fit in one sync item (cross-device);
      // older ones are archived to local storage (~10 MB quota, tens of
      // thousands of sprints)
      const recent = [];
      let bytes = SW_KEYS.HISTORY.length + 2;
      for (const sprint of all) {
        bytes += byteLength(JSON.stringify(sprint)) + 1;
        if (bytes > SYNC_HISTORY_BUDGET) break;
        recent.push(sprint);
      }
      const toArchive = all.slice(recent.length);

      // Archive first so a failed sync write can never drop a sprint
      if (toArchive.length > 0) {
        const localHist = (await Storage.get(SW_KEYS.HISTORY, 'local')) || [];
        const archived = await Storage.set(SW_KEYS.HISTORY, dedupeByStart([...localHist, ...toArchive]), 'local');
        // Couldn't archive: leave sync untouched rather than drop older sprints
        if (!archived) return false;
      }

      if (await Storage.set(SW_KEYS.HISTORY, recent, 'sync')) return true;

      // Sync unavailable (quota, rate limit, signed out): keep the new sprint locally
      const localHist = (await Storage.get(SW_KEYS.HISTORY, 'local')) || [];
      return await Storage.set(SW_KEYS.HISTORY, dedupeByStart([...localHist, rec]), 'local');
    } catch (e) {
      console.warn('Saving sprint failed:', e.message);
      return false;
    }
  },
  async getTodayProgress() {
    const history = await Storage.getHistory();
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Sum words gained from all sprints today
    const todaysSprints = history.filter(record => {
      const recordDate = new Date(record.startISO);
      return recordDate >= startOfToday;
    });

    const totalWordsToday = todaysSprints.reduce((sum, record) => {
      return sum + (record.wordsGained || 0);
    }, 0);

    return {
      wordsWritten: totalWordsToday,
      sprintsCompleted: todaysSprints.length
    };
  }
};
