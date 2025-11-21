const SW_KEYS = {
  SETTINGS: 'sw_settings',
  HISTORY: 'sw_history',
  LICENSE: 'sw_license'
};

const Storage = {
  async get(key, area = 'sync') {
    const api = chrome.storage[area] || chrome.storage.sync;
    const res = await api.get(key);
    return res[key];
  },
  async set(key, value, area = 'sync') {
    const api = chrome.storage[area] || chrome.storage.sync;
    await api.set({ [key]: value });
  },
  async getSettings() {
    const def = {
      theme: 'light', // light | dark | nord | solar | midnight
      sound: true,
      plan: 'FREE', // FREE | PRO_LIFETIME | PRO_SUB - mirrored from license
      dailyGoal: 0 // Daily word count goal (0 = disabled)
    };
    const saved = await Storage.get(SW_KEYS.SETTINGS);
    return { ...def, ...(saved || {}) };
  },
  async setSettings(next) {
    await Storage.set(SW_KEYS.SETTINGS, next);
  },
  async getLicense() {
    return (await Storage.get(SW_KEYS.LICENSE)) || { status: 'FREE', key: '' };
  },
  async setLicense(lic) {
    await Storage.set(SW_KEYS.LICENSE, lic);
  },
  async getHistory() {
    const h = await Storage.get(SW_KEYS.HISTORY);
    return Array.isArray(h) ? h : [];
  },
  async appendHistory(rec) {
    const area = 'sync';
    try {
      const current = await Storage.getHistory();
      current.push(rec);
      await Storage.set(SW_KEYS.HISTORY, current, area);
    } catch (e) {
      // Fallback to local if sync limit reached
      const local = (await Storage.get(SW_KEYS.HISTORY, 'local')) || [];
      local.push(rec);
      await Storage.set(SW_KEYS.HISTORY, local, 'local');
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
