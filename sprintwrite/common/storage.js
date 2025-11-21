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
      plan: 'FREE' // FREE | PRO_LIFETIME | PRO_SUB - mirrored from license
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
  }
};
